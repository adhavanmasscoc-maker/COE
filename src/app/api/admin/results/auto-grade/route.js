import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { decryptSubmissionPayload } from "@/lib/encryption";

export const dynamic = "force-dynamic";

// POST /api/admin/results/auto-grade: Auto-grade all submissions for an exam against answer keys
export async function POST(request) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "COE Admin authorization required." }, { status: 403 });
    }

    const body = await request.json();
    const { examScheduleId } = body;

    if (!examScheduleId) {
      return NextResponse.json({ error: "examScheduleId is required." }, { status: 400 });
    }

    const exam = await db.examSchedule.findUnique({
      where: { id: examScheduleId },
      include: {
        questions: { orderBy: { questionNumber: "asc" } },
        submissions: {
          include: { student: true },
        },
      },
    });

    if (!exam) {
      return NextResponse.json({ error: "Examination record not found." }, { status: 404 });
    }

    const questions = exam.questions;
    const totalExamMarks = questions.reduce((sum, q) => sum + (q.marks || 1), 0) || exam.totalMarks || 25;

    let gradedCount = 0;
    const gradedResults = [];

    for (const sub of exam.submissions) {
      // Decrypt answers
      let decrypted = null;
      try {
        decrypted = decryptSubmissionPayload(sub.answersJson);
      } catch (e) {
        try { decrypted = JSON.parse(sub.answersJson); } catch {}
      }

      const rawAnswers = decrypted?.rawAnswers || decrypted || {};
      let studentScore = 0;

      questions.forEach((q) => {
        const studentChoice = rawAnswers[q.id];
        const correct = (q.correctAnswer || "").trim().toUpperCase();
        if (studentChoice && studentChoice.trim().toUpperCase() === correct) {
          studentScore += (q.marks || 1);
        }
      });

      // Update submission record with evaluated score and isGraded = true
      await db.examSubmission.update({
        where: { id: sub.id },
        data: {
          score: studentScore,
          isGraded: true,
        },
      });

      // Upsert ExamResult as UNPUBLISHED (COE reviews first before publishing)
      const res = await db.examResult.upsert({
        where: {
          examScheduleId_studentId: {
            examScheduleId: exam.id,
            studentId: sub.studentId,
          },
        },
        update: {
          marksObtained: studentScore,
          maxMarks: totalExamMarks,
          isPublished: false, // Remains held until COE explicitly clicks 'Publish'
          remarks: studentScore >= (totalExamMarks * 0.4) ? "Passed Examination" : "Candidate Appeared",
        },
        create: {
          examScheduleId: exam.id,
          studentId: sub.studentId,
          marksObtained: studentScore,
          maxMarks: totalExamMarks,
          isPublished: false,
          remarks: studentScore >= (totalExamMarks * 0.4) ? "Passed Examination" : "Candidate Appeared",
        },
      });

      gradedResults.push({
        studentId: sub.studentId,
        studentName: sub.student?.fullName,
        score: studentScore,
        totalMarks: totalExamMarks,
      });

      gradedCount++;
    }

    // Advance exam phase to 7 ("Evaluated")
    if (exam.phase < 7) {
      let ts = {};
      try { ts = JSON.parse(exam.phaseTimestamps || "{}"); } catch {}
      ts[7] = new Date().toISOString();
      await db.examSchedule.update({
        where: { id: exam.id },
        data: { phase: 7, phaseTimestamps: JSON.stringify(ts) },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully evaluated ${gradedCount} submission(s) for ${exam.title || "the exam"}. Results held privately awaiting COE publication.`,
      gradedCount,
      totalExamMarks,
      results: gradedResults,
    });
  } catch (error) {
    console.error("[Auto-Grade Error]:", error);
    return NextResponse.json({ error: "Failed to auto-grade submissions." }, { status: 500 });
  }
}
