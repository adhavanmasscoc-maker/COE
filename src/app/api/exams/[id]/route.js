import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/exams/[id]: Fetch exam hall data with anti-cheat sanitization
export async function GET(request, { params }) {
  try {
    const session = await getCurrentSession();
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const previewRollNo = searchParams.get("previewRollNo");

    let studentProfile = null;
    const isPreview = Boolean(previewRollNo);
    const isAdmin = session?.role === "ADMIN" || isPreview;

    if (!session) {
      if (previewRollNo) {
        studentProfile = await db.studentProfile.findFirst({
          where: { user: { username: previewRollNo } },
          include: { user: { select: { username: true } } },
        });
        if (!studentProfile) {
          studentProfile = await db.studentProfile.findFirst({
            include: { user: { select: { username: true } } },
          });
        }
      }
      if (!studentProfile) {
        return NextResponse.json({ error: "Authentication required to enter examination hall." }, { status: 401 });
      }
    } else if (session.role !== "ADMIN") {
      studentProfile = await db.studentProfile.findUnique({
        where: { userId: session.userId },
        include: { user: { select: { username: true } } },
      });
      if (!studentProfile && previewRollNo) {
        studentProfile = await db.studentProfile.findFirst({
          where: { user: { username: previewRollNo } },
          include: { user: { select: { username: true } } },
        });
      }
      if (!studentProfile) {
        return NextResponse.json({ error: "Student profile not found." }, { status: 404 });
      }
    } else if (previewRollNo) {
      studentProfile = await db.studentProfile.findFirst({
        where: { user: { username: previewRollNo } },
        include: { user: { select: { username: true } } },
      });
      if (!studentProfile) {
        studentProfile = await db.studentProfile.findFirst({
          include: { user: { select: { username: true } } },
        });
      }
    }

    // Query exam from SQLite
    const exam = await db.examSchedule.findUnique({
      where: { id },
      include: {
        subject: { select: { id: true, name: true, code: true, prepClass: true, medium: true } },
        questions: {
          orderBy: { questionNumber: "asc" },
        },
      },
    });

    if (!exam) {
      return NextResponse.json({ error: "Examination paper not found." }, { status: 404 });
    }

    // Strict Server-Side Class Isolation Guard for Students
    if (!isAdmin) {
      if (exam.status !== "PUBLISHED") {
        return NextResponse.json(
          { error: "This examination has not yet been published by the Controller of Examinations." },
          { status: 403 }
        );
      }

      if (exam.prepClass !== studentProfile.examPrepClass) {
        return NextResponse.json(
          {
            error: `Class isolation violation: This examination is restricted to Class ${exam.prepClass} preparation candidates.`,
          },
          { status: 403 }
        );
      }
    }

    // Check if student already submitted this exam
    let submissionRecord = null;
    if (studentProfile) {
      const submission = await db.examSubmission.findUnique({
        where: {
          examScheduleId_studentId: {
            examScheduleId: exam.id,
            studentId: studentProfile.id,
          },
        },
      });

      if (submission) {
        let parsedAnswers = {};
        try {
          parsedAnswers = JSON.parse(submission.answersJson);
        } catch (e) {
          parsedAnswers = {};
        }
        submissionRecord = {
          id: submission.id,
          isSubmitted: submission.isSubmitted,
          submittedAt: submission.submittedAt,
          timeTakenSecs: submission.timeTakenSecs,
          score: submission.score,
          answers: parsedAnswers,
        };
      }
    }

    // Parse question options & sanitize answers for student anti-cheat
    const sanitizedQuestions = exam.questions.map((q) => {
      let parsedOptions = [];
      try {
        parsedOptions = typeof q.options === "string" ? JSON.parse(q.options) : q.options;
      } catch (e) {
        parsedOptions = [];
      }

      const qData = {
        id: q.id,
        questionNumber: q.questionNumber,
        questionText: q.questionText,
        marks: q.marks,
        options: parsedOptions,
      };

      // Admin or post-submission can see correct answers; active test-takers CANNOT
      if (isAdmin || submissionRecord?.isSubmitted) {
        qData.correctAnswer = q.correctAnswer;
        qData.explanation = q.explanation;
      }

      return qData;
    });

    return NextResponse.json({
      success: true,
      exam: {
        id: exam.id,
        subject: exam.subject.name,
        code: exam.subject.code,
        medium: exam.subject.medium,
        prepClass: exam.prepClass,
        examDate: exam.examDate,
        durationMinutes: exam.durationMinutes,
        totalMarks: exam.totalMarks,
        instructions: exam.instructions,
        status: exam.status,
      },
      candidate: studentProfile
        ? {
            fullName: studentProfile.fullName,
            rollNo: studentProfile.user.username,
            currentClass: studentProfile.currentClass,
            examPrepClass: studentProfile.examPrepClass,
          }
        : null,
      questions: sanitizedQuestions,
      submission: submissionRecord,
    });
  } catch (error) {
    console.error("Exam hall details GET error:", error);
    return NextResponse.json({ error: "Internal server error entering examination hall." }, { status: 500 });
  }
}
