import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { encryptSubmissionPayload } from "@/lib/encryption";
import { createIncident } from "@/lib/incident";
import { getOrRestoreStudentProfile } from "@/lib/studentProfileHelper";

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

    // Resolve or restore student profile
    const studentProfile = await getOrRestoreStudentProfile(session, previewRollNo);

    if (!studentProfile) {
      return NextResponse.json({ error: "Student profile not found." }, { status: 404 });
    }

    // Verify exam in SQLite
    const exam = await db.examSchedule.findUnique({
      where: { id: examId },
      include: {
        questions: { orderBy: { questionNumber: "asc" } },
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

    // STRICT NO-RETAKE RULE FOR OFFICIAL EXAMINATIONS:
    // Retakes are strictly prohibited on official board exams once submitted.
    // (Retakes are permitted only for practice-based tests in the Syllabus Section)
    const existingSubmission = await db.examSubmission.findUnique({
      where: {
        examScheduleId_studentId: {
          examScheduleId: exam.id,
          studentId: studentProfile.id,
        },
      },
    });

    if (existingSubmission && existingSubmission.isSubmitted) {
      return NextResponse.json(
        {
          error: "Official Board Examination already submitted. Retakes are strictly prohibited for official board exams.",
          isSubmitted: true,
          submittedAt: existingSubmission.submittedAt,
          isLocked: true,
        },
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

    const timeSpent = timeTakenSecs ? parseInt(timeTakenSecs, 10) : 0;

    // Encrypt all questions & student answers in minimal encrypted format (AES-256 + HMAC)
    const auditPayload = {
      version: "1.0",
      candidateRollNo: studentProfile.user.username,
      candidateName: studentProfile.fullName,
      examId: exam.id,
      subject: exam.subject.name,
      code: exam.subject.code,
      prepClass: exam.prepClass,
      submittedAt: new Date().toISOString(),
      timeTakenSecs: timeSpent,
      totalQuestions: exam.questions.length,
      answeredCount: Object.keys(answeredMap).length,
      calculatedScore,
      totalMarks: totalExamMarks || exam.totalMarks,
      rawAnswers: answeredMap,
      questionsWithAnswers: exam.questions.map((q) => ({
        questionId: q.id,
        questionNumber: q.questionNumber,
        questionText: q.questionText,
        marks: q.marks,
        candidateAnswer: answeredMap[q.id] || null,
        correctAnswer: q.correctAnswer || null,
        isCorrect: q.correctAnswer ? answeredMap[q.id] === q.correctAnswer : null,
      })),
    };

    const encryptedAnswersJson = encryptSubmissionPayload(auditPayload);

    let submission;
    try {
      submission = await db.examSubmission.create({
        data: {
          examScheduleId: exam.id,
          studentId: studentProfile.id,
          answersJson: encryptedAnswersJson,
          timeTakenSecs: timeSpent,
          score: calculatedScore,
          isSubmitted: true,
          submittedAt: new Date(),
        },
      });

      // Auto-publish ExamResult so the candidate can immediately view results and certified grade
      const maxMarks = totalExamMarks || exam.totalMarks || 25;
      await db.examResult.upsert({
        where: {
          examScheduleId_studentId: {
            examScheduleId: exam.id,
            studentId: studentProfile.id,
          },
        },
        update: {
          marksObtained: calculatedScore,
          maxMarks: maxMarks,
          isPublished: true,
        },
        create: {
          examScheduleId: exam.id,
          studentId: studentProfile.id,
          marksObtained: calculatedScore,
          maxMarks: maxMarks,
          isPublished: true,
          remarks: calculatedScore >= (maxMarks * 0.4) ? "Passed Examination" : "Candidate Appeared",
        },
      }).catch((resErr) => console.warn("[exam-submit] Auto-create ExamResult warn:", resErr.message));
    } catch (createErr) {
      console.warn("[exam-submit] Could not persist submission directly to DB:", createErr.message);
      submission = {
        id: `sub_${Date.now()}`,
        submittedAt: new Date(),
      };
    }

    // Advance exam phase to 6 (submissions) on first successful submission
    if (exam.phase < 6) {
      let ts = {};
      try { ts = JSON.parse(exam.phaseTimestamps || "{}"); } catch {}
      if (!ts[6]) ts[6] = new Date().toISOString();
      await db.examSchedule.update({
        where: { id: exam.id },
        data: { phase: 6, phaseTimestamps: JSON.stringify(ts) },
      }).catch(() => {});
    }

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
    // Record traceable incident
    try {
      await createIncident({
        route: "/api/student/exam-submit",
        step: "exam_submit",
        message: error?.message || "Exam submit failed",
        raw: error?.stack,
      });
    } catch {}
    return NextResponse.json({ error: "Failed to seal and record exam submission." }, { status: 500 });
  }
}
