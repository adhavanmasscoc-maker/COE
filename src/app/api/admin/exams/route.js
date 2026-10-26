import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/admin/exams: List all exams with subject info, question counts, and submission stats
export async function GET(request) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "COE Admin authorization required." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const prepClassParam = searchParams.get("prepClass");

    const whereClause = {};
    if (prepClassParam) {
      whereClause.prepClass = parseInt(prepClassParam, 10);
    }

    const exams = await db.examSchedule.findMany({
      where: whereClause,
      include: {
        subject: { select: { id: true, name: true, code: true, prepClass: true } },
        _count: {
          select: {
            questions: true,
            submissions: true,
            results: true,
          },
        },
      },
      orderBy: { examDate: "asc" },
    });

    return NextResponse.json({ success: true, exams });
  } catch (error) {
    console.error("Admin exams GET error:", error);
    return NextResponse.json({ error: "Internal server error loading exam schedules." }, { status: 500 });
  }
}

// POST /api/admin/exams: Create a new exam schedule
export async function POST(request) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "COE Admin authorization required." }, { status: 403 });
    }

    const body = await request.json();
    const { subjectId, prepClass, examDate, durationMinutes, totalMarks, instructions, status } = body;

    if (!subjectId || !prepClass || !examDate) {
      return NextResponse.json(
        { error: "Subject ID, preparation class, and exam date/time are required." },
        { status: 400 }
      );
    }

    const newExam = await db.examSchedule.create({
      data: {
        subjectId,
        prepClass: parseInt(prepClass, 10),
        examDate: new Date(examDate),
        durationMinutes: durationMinutes ? parseInt(durationMinutes, 10) : 150,
        totalMarks: totalMarks ? parseInt(totalMarks, 10) : 100,
        instructions: instructions || null,
        status: status || "DRAFT",
      },
      include: {
        subject: { select: { name: true, code: true } },
      },
    });

    return NextResponse.json({ success: true, exam: newExam }, { status: 201 });
  } catch (error) {
    console.error("Admin exams POST error:", error);
    return NextResponse.json({ error: "Failed to create exam schedule in database." }, { status: 500 });
  }
}
