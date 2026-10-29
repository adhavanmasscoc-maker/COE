import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ authenticated: false, user: null });
  }

  // Fetch full user record including language
  let userLang = "en";
  try {
    const user = await db.user.findUnique({
      where: { id: session.userId || session.id },
      include: { profile: true },
    });
    if (user) {
      userLang = user.language || (user.profile?.medium === "Tamil" ? "ta" : "en");
    }
  } catch (err) {
    console.error("Error fetching user profile language:", err.message);
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      ...session,
      language: userLang,
    },
  });
}

export async function PATCH(request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const newLang = body.language === "ta" || body.language === "Tamil" ? "ta" : "en";
    const medium = newLang === "ta" ? "Tamil" : "English";

    const userId = session.userId || session.id;
    if (userId) {
      await db.user.update({
        where: { id: userId },
        data: {
          language: newLang,
          profile: {
            update: {
              medium: medium,
            },
          },
        },
      }).catch(async () => {
        // Fallback if profile update fails
        await db.user.update({
          where: { id: userId },
          data: { language: newLang },
        });
      });
    }

    return NextResponse.json({ success: true, language: newLang, medium });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
