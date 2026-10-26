import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }

    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: "userId is required." }, { status: 400 });
    }

    // Delete user cascade (profile and all related records deleted by Prisma cascade)
    await db.user.delete({ where: { id: userId } });

    return NextResponse.json({ success: true, message: "Registration rejected and removed." });
  } catch (error) {
    console.error("[Reject Student Error]", error);
    return NextResponse.json({ error: "Failed to reject registration." }, { status: 500 });
  }
}
