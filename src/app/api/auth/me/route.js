import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const previewRollNo = searchParams?.get("previewRollNo");

  if (previewRollNo) {
    try {
      const user = await db.user.findUnique({
        where: { username: previewRollNo },
        include: { profile: true },
      });
      if (user) {
        const userLang = user.language || (user.profile?.medium === "Tamil" ? "ta" : "en");
        return NextResponse.json({
          authenticated: true,
          isPreview: true,
          user: {
            id: user.id,
            username: user.username,
            role: user.role,
            fullName: user.profile?.fullName || user.username,
            examPrepClass: user.profile?.examPrepClass || 10,
            language: userLang,
          },
          studentProfile: user.profile,
        });
      }
    } catch (e) {
      console.warn("Could not load preview student in /api/auth/me:", e.message);
    }
  }

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
