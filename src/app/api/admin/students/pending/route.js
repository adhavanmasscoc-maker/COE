import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/admin/students/pending — list all PENDING students
export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Access denied. Administrator privileges required." },
        { status: 403 }
      );
    }

    const pendingUsers = await db.user.findMany({
      where: { role: "PENDING" },
      include: { profile: true },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      success: true,
      pending: pendingUsers.map((u) => ({
        userId: u.id,
        profileId: u.profile?.id,
        rollNo: u.username,
        fullName: u.profile?.fullName,
        medium: u.profile?.medium,
        createdAt: u.createdAt,
      })),
    });
  } catch (error) {
    console.error("[Pending Students GET Error]", error);
    return NextResponse.json({ error: "Failed to fetch pending registrations." }, { status: 500 });
  }
}
