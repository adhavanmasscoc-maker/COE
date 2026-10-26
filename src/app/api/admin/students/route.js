import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Access denied. Administrator privileges required." },
        { status: 403 }
      );
    }

    const students = await db.studentProfile.findMany({
      include: {
        user: { select: { id: true, username: true } },
        subjects: {
          include: {
            subject: {
              select: { id: true, name: true, code: true, prepClass: true },
            },
          },
        },
      },
      orderBy: { currentClass: "asc" },
    });

    return NextResponse.json({
      success: true,
      students: students.map((s) => ({
        id: s.id,
        fullName: s.fullName,
        rollNo: s.user.username,
        currentClass: s.currentClass,
        examPrepClass: s.examPrepClass,
        board: s.board,
        medium: s.medium,
        academicYear: s.academicYear,
        subjectsCount: s.subjects.length,
        subjects: s.subjects.map((sub) => sub.subject),
      })),
    });
  } catch (error) {
    console.error("Admin fetch students error:", error);
    return NextResponse.json(
      { error: "Failed to fetch candidate accounts." },
      { status: 500 }
    );
  }
}
