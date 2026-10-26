import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/exams: List available examinations
export async function GET(request) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const previewRollNo = searchParams.get("previewRollNo");

    let studentProfile = null;
    let targetPrepClass = null;

    if (session.role === "STUDENT") {
      studentProfile = await db.studentProfile.findUnique({
        where: { userId: session.userId },
      });
      if (!studentProfile) {
        return NextResponse.json({ error: "Student profile not found." }, { status: 404 });
      }
      targetPrepClass = studentProfile.examPrepClass;
    } else if (session.role === "ADMIN") {
      // If admin, check if previewing a student
      if (previewRollNo) {
        studentProfile = await db.studentProfile.findFirst({
          where: { user: { username: previewRollNo } },
        });
        if (studentProfile) {
          targetPrepClass = studentProfile.examPrepClass;
        }
      } else {
        const prepClassParam = searchParams.get("prepClass");
        if (prepClassParam) {
          targetPrepClass = parseInt(prepClassParam, 10);
        }
      }
    }

    // Build query conditions
    const whereClause = {
      status: "PUBLISHED",
    };
    if (targetPrepClass) {
      whereClause.prepClass = targetPrepClass;
    }

    const exams = await db.examSchedule.findMany({
      where: whereClause,
      include: {
        subject: { select: { id: true, name: true, code: true } },
        _count: { select: { questions: true } },
        submissions: studentProfile
          ? {
              where: { studentId: studentProfile.id },
              select: { id: true, isSubmitted: true, submittedAt: true, score: true },
            }
          : false,
      },
      orderBy: { examDate: "asc" },
    });

    const formattedExams = exams.map((exam) => {
      const studentSubmission = exam.submissions && exam.submissions.length > 0 ? exam.submissions[0] : null;
      return {
        id: exam.id,
        subject: exam.subject.name,
        code: exam.subject.code,
        prepClass: exam.prepClass,
        examDate: exam.examDate,
        durationMinutes: exam.durationMinutes,
        totalMarks: exam.totalMarks,
        instructions: exam.instructions,
        questionsCount: exam._count.questions,
        hasSubmitted: !!studentSubmission?.isSubmitted,
        submittedAt: studentSubmission?.submittedAt || null,
        preliminaryScore: studentSubmission?.score ?? null,
      };
    });

    return NextResponse.json({
      success: true,
      targetPrepClass,
      exams: formattedExams,
    });
  } catch (error) {
    console.error("Exams GET error:", error);
    return NextResponse.json({ error: "Internal server error loading examinations." }, { status: 500 });
  }
}
