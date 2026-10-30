import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { decryptSubmissionPayload } from "@/lib/encryption";
import { normalizeOptionsList } from "@/lib/questionBankParser";
import { getOrRestoreStudentProfile } from "@/lib/studentProfileHelper";
import { getLocalizedQuestion, getLocalizedOption } from "@/lib/questionTranslations";

export const dynamic = "force-dynamic";

// GET /api/student/results/paper/[examId]: Retrieve evaluated student paper with questions, answers, and worked solutions
export async function GET(request, { params }) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const { examId } = params;
    const { searchParams } = new URL(request.url);
    const previewRollNo = searchParams.get("previewRollNo");

    const studentProfile = await getOrRestoreStudentProfile(session, previewRollNo);
    if (!studentProfile) {
      return NextResponse.json({ error: "Student profile not found." }, { status: 404 });
    }

    // Load exam schedule with questions
    const exam = await db.examSchedule.findUnique({
      where: { id: examId },
      include: {
        subject: { select: { id: true, name: true, code: true, prepClass: true, medium: true } },
        questions: { orderBy: { questionNumber: "asc" } },
      },
    });

    if (!exam) {
      return NextResponse.json({ error: "Examination record not found." }, { status: 404 });
    }

    // Load student submission
    const submission = await db.examSubmission.findUnique({
      where: {
        examScheduleId_studentId: {
          examScheduleId: examId,
          studentId: studentProfile.id,
        },
      },
    });

    if (!submission) {
      return NextResponse.json(
        { error: "No submission recorded for this candidate on this examination." },
        { status: 404 }
      );
    }

    // Load ExamResult to verify publish status
    const result = await db.examResult.findUnique({
      where: {
        examScheduleId_studentId: {
          examScheduleId: examId,
          studentId: studentProfile.id,
        },
      },
    });

    // Check if result is published or time has arrived
    const now = Date.now();
    let isPublished = Boolean(result?.isPublished);
    let expectedPublishAt = null;

    if (!isPublished) {
      if (exam.resultPublishDate) {
        expectedPublishAt = new Date(exam.resultPublishDate);
        if (now >= expectedPublishAt.getTime()) {
          isPublished = true;
        }
      } else if (exam.resultPublishDelayMinutes && exam.resultPublishDelayMinutes > 0) {
        const subTime = new Date(submission.submittedAt).getTime();
        expectedPublishAt = new Date(subTime + exam.resultPublishDelayMinutes * 60 * 1000);
        if (now >= expectedPublishAt.getTime()) {
          isPublished = true;
        }
      }
    }

    // If not published and caller is student (not admin previewing), block access
    const isAdmin = session.role === "ADMIN" || Boolean(previewRollNo);
    if (!isPublished && !isAdmin) {
      const remainingSeconds = expectedPublishAt
        ? Math.max(0, Math.round((expectedPublishAt.getTime() - now) / 1000))
        : null;

      return NextResponse.json(
        {
          error: "Official evaluation and statement of marks have not yet been released.",
          isPending: true,
          expectedPublishAt: expectedPublishAt?.toISOString() || null,
          remainingSeconds,
        },
        { status: 403 }
      );
    }

    // Decrypt candidate answers
    let decrypted = null;
    try {
      decrypted = decryptSubmissionPayload(submission.answersJson);
    } catch {
      try {
        decrypted = JSON.parse(submission.answersJson);
      } catch {
        decrypted = {};
      }
    }

    const rawAnswers = decrypted?.rawAnswers || decrypted || {};
    const isTamil = studentProfile.medium === "Tamil" || exam.subject.medium === "Tamil";

    // Build question-by-question evaluated breakdown
    let totalMarksCalculated = 0;
    const questionsBreakdown = exam.questions.map((q) => {
      const chosen = (rawAnswers[q.id] || "").trim().toUpperCase();
      const correct = (q.correctAnswer || "").trim().toUpperCase();
      const isCorrect = Boolean(chosen && chosen === correct);
      const marksEarned = isCorrect ? (q.marks || 1) : 0;
      totalMarksCalculated += marksEarned;

      const opts = normalizeOptionsList(q.options).map((opt) => ({
        id: opt.id,
        text: isTamil ? (opt.textTa || getLocalizedOption(opt, true)) : (opt.textEn || opt.text),
      }));

      const localizedQuestionText = isTamil
        ? (q.questionTextTa || getLocalizedQuestion(q, true))
        : q.questionText;

      return {
        id: q.id,
        questionNumber: q.questionNumber,
        questionText: localizedQuestionText,
        marks: q.marks || 1,
        options: opts,
        chosenAnswer: chosen || null,
        correctAnswer: correct,
        isCorrect,
        marksAwarded: marksEarned,
        explanation: q.explanation || "Official Tamil Nadu Board verified key.",
      };
    });

    const maxMarks = exam.questions.reduce((sum, q) => sum + (q.marks || 1), 0) || exam.totalMarks;
    const percentage = maxMarks > 0 ? Math.round((totalMarksCalculated / maxMarks) * 100) : 0;

    return NextResponse.json({
      success: true,
      exam: {
        id: exam.id,
        subject: exam.subject.name,
        code: exam.subject.code,
        prepClass: exam.prepClass,
        examDate: exam.examDate,
        durationMinutes: exam.durationMinutes,
        totalMarks: maxMarks,
      },
      candidate: {
        fullName: studentProfile.fullName,
        rollNo: studentProfile.user.username,
        medium: studentProfile.medium,
        currentClass: studentProfile.currentClass,
        examPrepClass: studentProfile.examPrepClass,
      },
      submission: {
        id: submission.id,
        submittedAt: submission.submittedAt,
        timeTakenSecs: submission.timeTakenSecs,
        score: totalMarksCalculated,
        maxMarks,
        percentage,
      },
      questions: questionsBreakdown,
    });
  } catch (error) {
    console.error("[Paper GET Error]:", error);
    return NextResponse.json(
      { error: "Internal server error loading evaluated paper." },
      { status: 500 }
    );
  }
}

