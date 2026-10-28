import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * POST /api/admin/exams/[id]/questions
 * Add a single question manually. Sets reviewStatus="approved" (manual = trusted).
 * Advances exam phase to 1 on first question added.
 */
export async function POST(request, { params }) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "COE Admin authorization required." }, { status: 403 });
    }

    const { id: examScheduleId } = params;
    const body = await request.json();
    const { questionNumber, questionText, marks, options, correctAnswer, explanation,
            qType, difficulty, syllabusRef } = body;

    if (!questionText || !options) {
      return NextResponse.json({ error: "Question text and options are required." }, { status: 400 });
    }

    // Determine question number if not provided
    let qNum = questionNumber;
    if (!qNum) {
      const count = await db.examQuestion.count({ where: { examScheduleId } });
      qNum = count + 1;
    }

    const optionsStr = typeof options === "string" ? options : JSON.stringify(options);

    const question = await db.examQuestion.create({
      data: {
        examScheduleId,
        questionNumber: parseInt(qNum, 10),
        questionText,
        marks: marks ? parseInt(marks, 10) : 2,
        options: optionsStr,
        correctAnswer: correctAnswer || null,
        explanation: explanation || null,
        qType: qType || "MCQ",
        difficulty: difficulty || "MEDIUM",
        syllabusRef: syllabusRef || null,
        reviewStatus: "approved",  // manual additions are pre-approved by COE
        source: "manual",
      },
    });

    // Advance phase to 1 (questions_set) if still at 0
    const exam = await db.examSchedule.findUnique({ where: { id: examScheduleId }, select: { phase: true, phaseTimestamps: true } });
    if (exam && exam.phase < 1) {
      let ts = {};
      try { ts = JSON.parse(exam.phaseTimestamps || "{}"); } catch {}
      ts[1] = new Date().toISOString();
      await db.examSchedule.update({ where: { id: examScheduleId }, data: { phase: 1, phaseTimestamps: JSON.stringify(ts) } });
    }

    return NextResponse.json({ success: true, question }, { status: 201 });
  } catch (error) {
    console.error("Admin add question error:", error);
    return NextResponse.json({ error: "Failed to add question to exam in database." }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/exams/[id]/questions
 * Approve or reject a single question by ID.
 * Body: { questionId, reviewStatus: "approved"|"rejected" }
 */
export async function PATCH(request, { params }) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "COE Admin authorization required." }, { status: 403 });
    }

    const { id: examScheduleId } = params;
    const body = await request.json();
    const { questionId, reviewStatus } = body;

    if (!questionId || !["approved", "rejected", "needs_review"].includes(reviewStatus)) {
      return NextResponse.json(
        { error: "questionId and valid reviewStatus (approved|rejected|needs_review) required." },
        { status: 400 }
      );
    }

    const updated = await db.examQuestion.update({
      where: { id: questionId },
      data: { reviewStatus },
    });

    // Check if all questions approved → advance to phase 2 (verified)
    if (reviewStatus === "approved") {
      const total = await db.examQuestion.count({ where: { examScheduleId } });
      const approved = await db.examQuestion.count({ where: { examScheduleId, reviewStatus: "approved" } });
      if (total > 0 && approved === total) {
        const exam = await db.examSchedule.findUnique({ where: { id: examScheduleId }, select: { phase: true, phaseTimestamps: true } });
        if (exam && exam.phase < 2) {
          let ts = {};
          try { ts = JSON.parse(exam.phaseTimestamps || "{}"); } catch {}
          ts[2] = new Date().toISOString();
          await db.examSchedule.update({ where: { id: examScheduleId }, data: { phase: 2, phaseTimestamps: JSON.stringify(ts) } });
        }
      }
    }

    return NextResponse.json({ success: true, question: updated });
  } catch (error) {
    console.error("Admin PATCH question error:", error);
    return NextResponse.json({ error: "Failed to update question review status." }, { status: 500 });
  }
}

/** DELETE /api/admin/exams/[id]/questions?questionId=... */
export async function DELETE(request, { params }) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "COE Admin authorization required." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const questionId = searchParams.get("questionId");

    if (!questionId) {
      return NextResponse.json({ error: "Question ID is required." }, { status: 400 });
    }

    await db.examQuestion.delete({ where: { id: questionId } });

    return NextResponse.json({ success: true, message: "Question deleted successfully." });
  } catch (error) {
    console.error("Admin delete question error:", error);
    return NextResponse.json({ error: "Failed to delete question." }, { status: 500 });
  }
}
