import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// POST /api/student/exam-submit: Record student exam submission
export async function POST(request) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required to submit examination." }, { status: 401 });
    }

    const body = await request.json();
    const { examId, answers, timeTakenSecs, previewRollNo } = body;

    if (!examId) {
      return NextResponse.json({ error: "Exam ID is required." }, { status: 400 });
    }

    let studentProfile;
    if (session.role === "STUDENT") {
      studentProfile = await db.studentProfile.findUnique({
        where: { userId: session.userId },
        include: { user: { select: { username: true } } },
      });
    } else if (session.role === "ADMIN") {
      const targetRoll = previewRollNo || "TN2026-0901";
      studentProfile = await db.studentProfile.findFirst({
        where: { user: { username: targetRoll } },
        include: { user: { select: { username: true } } },
      });
    }

    if (!studentProfile) {
      return NextResponse.json({ error: "Student profile not found." }, { status: 404 });
    }

    // Verify exam in SQLite
    const exam = await db.examSchedule.findUnique({
      where: { id: examId },
      include: {
        questions: true,
        subject: { select: { name: true, code: true } },
      },
    });

    if (!exam) {
      return NextResponse.json({ error: "Examination record not found." }, { status: 404 });
    }

    // Strict Class Isolation check
    if (session.role === "STUDENT" && exam.prepClass !== studentProfile.examPrepClass) {
      return NextResponse.json(
        { error: `Class isolation violation: This exam belongs to Class ${exam.prepClass}.` },
        { status: 403 }
      );
    }

    // Auto-calculate objective score
    let calculatedScore = 0;
    let totalExamMarks = 0;
    const answeredMap = answers || {};

    exam.questions.forEach((q) => {
      totalExamMarks += q.marks;
      if (q.correctAnswer && answeredMap[q.id] === q.correctAnswer) {
        calculatedScore += q.marks;
      }
    });

    const answersJsonStr = JSON.stringify(answeredMap);
    const timeSpent = timeTakenSecs ? parseInt(timeTakenSecs, 10) : 0;

    // Save or update submission in SQLite
    const submission = await db.examSubmission.upsert({
      where: {
        examScheduleId_studentId: {
          examScheduleId: exam.id,
          studentId: studentProfile.id,
        },
      },
      create: {
        examScheduleId: exam.id,
        studentId: studentProfile.id,
        answersJson: answersJsonStr,
        timeTakenSecs: timeSpent,
        score: calculatedScore,
        isSubmitted: true,
        submittedAt: new Date(),
      },
      update: {
        answersJson: answersJsonStr,
        timeTakenSecs: timeSpent,
        score: calculatedScore,
        isSubmitted: true,
        submittedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      submissionId: submission.id,
      candidate: {
        fullName: studentProfile.fullName,
        rollNo: studentProfile.user.username,
      },
      exam: {
        id: exam.id,
        subject: exam.subject.name,
        code: exam.subject.code,
        prepClass: exam.prepClass,
      },
      stats: {
        totalQuestions: exam.questions.length,
        answeredCount: Object.keys(answeredMap).length,
        timeTakenSecs: timeSpent,
        score: calculatedScore,
        totalMarks: totalExamMarks || exam.totalMarks,
      },
      submittedAt: submission.submittedAt,
    });
  } catch (error) {
    console.error("Exam submit POST error:", error);
    return NextResponse.json({ error: "Failed to seal and record exam submission." }, { status: 500 });
  }
}
