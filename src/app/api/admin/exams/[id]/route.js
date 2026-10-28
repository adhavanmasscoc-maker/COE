import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Phase definitions (matches ExamLifecycleStepper):
 * 0  = Exam Scheduled
 * 1  = Questions Set
 * 2  = Verified (COE approved every question)
 * 3  = Published
 * 4  = Reached Students
 * 5  = Exam Live
 * 6  = Submissions Received
 * 7  = Evaluated
 * 8  = Result Verified
 * 9  = Result Published
 */

function stampPhase(existing, phaseIndex) {
  let ts = {};
  try { ts = existing ? JSON.parse(existing) : {}; } catch {}
  if (!ts[phaseIndex]) ts[phaseIndex] = new Date().toISOString();
  return JSON.stringify(ts);
}

// GET /api/admin/exams/[id]: Get full exam schedule with questions and submissions
export async function GET(request, { params }) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "COE Admin authorization required." }, { status: 403 });
    }

    const { id } = params;
    const exam = await db.examSchedule.findUnique({
      where: { id },
      include: {
        subject: true,
        questions: { orderBy: { questionNumber: "asc" } },
        submissions: {
          include: {
            student: { include: { user: { select: { username: true } } } },
          },
          orderBy: { submittedAt: "desc" },
        },
      },
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam schedule not found." }, { status: 404 });
    }

    // Parse options json for each question
    const formattedQuestions = exam.questions.map((q) => {
      let parsedOptions = [];
      try {
        parsedOptions = typeof q.options === "string" ? JSON.parse(q.options) : q.options;
      } catch { parsedOptions = []; }
      return { ...q, options: parsedOptions };
    });

    // Parse phase timestamps
    let phaseTimestamps = {};
    try { phaseTimestamps = exam.phaseTimestamps ? JSON.parse(exam.phaseTimestamps) : {}; } catch {}

    return NextResponse.json({
      success: true,
      exam: {
        ...exam,
        questions: formattedQuestions,
        phaseTimestamps,
      },
    });
  } catch (error) {
    console.error("Admin exam details GET error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/exams/[id]
 * Handles:
 *  - { status: "PUBLISHED" }   → enforces publish guards → updates phase to 3
 *  - { status: "DRAFT" }       → unpublish
 *  - { phase: N }              → advance phase (forward-only)
 *  - other field updates (examDate, durationMinutes, totalMarks, instructions)
 */
export async function PATCH(request, { params }) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "COE Admin authorization required." }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();
    const { status, examDate, durationMinutes, totalMarks, instructions, phase } = body;

    // Load current exam with question count
    const exam = await db.examSchedule.findUnique({
      where: { id },
      include: {
        _count: { select: { questions: true, submissions: true } },
        questions: { select: { marks: true, reviewStatus: true } },
        results: { select: { id: true, isPublished: true } },
      },
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found." }, { status: 404 });
    }

    const dataToUpdate = {};

    // --- Publish guard ---
    if (status === "PUBLISHED") {
      const qCount = exam._count.questions;
      const required = exam.requiredQuestions || 1;

      if (qCount < required) {
        return NextResponse.json(
          {
            error: `Cannot publish: ${qCount}/${required} required questions are set. Add ${required - qCount} more question(s).`,
            blocked: true,
            reason: "insufficient_questions",
          },
          { status: 409 }
        );
      }

      // Verify marks sum (warn but don't block if 0 required)
      const marksSum = exam.questions.reduce((sum, q) => sum + (q.marks || 0), 0);
      if (exam.totalMarks > 0 && marksSum !== exam.totalMarks) {
        return NextResponse.json(
          {
            error: `Cannot publish: question marks sum (${marksSum}) does not equal totalMarks (${exam.totalMarks}). Adjust question marks or totalMarks.`,
            blocked: true,
            reason: "marks_mismatch",
            marksSum,
            totalMarks: exam.totalMarks,
          },
          { status: 409 }
        );
      }

      // Check all questions are approved
      const pendingReview = exam.questions.filter((q) => q.reviewStatus === "needs_review");
      if (pendingReview.length > 0) {
        return NextResponse.json(
          {
            error: `Cannot publish: ${pendingReview.length} question(s) still need COE review. Approve all questions first.`,
            blocked: true,
            reason: "questions_need_review",
          },
          { status: 409 }
        );
      }

      // Use conditional update to prevent race condition (only update if still DRAFT/verified)
      const result = await db.examSchedule.updateMany({
        where: { id, status: { not: "PUBLISHED" } },
        data: {
          status: "PUBLISHED",
          phase: Math.max(exam.phase, 3),
          phaseTimestamps: stampPhase(exam.phaseTimestamps, 3),
        },
      });

      if (result.count === 0) {
        return NextResponse.json(
          { error: "Exam is already published or a concurrent publish request won.", blocked: true, reason: "already_published" },
          { status: 409 }
        );
      }

      const updated = await db.examSchedule.findUnique({
        where: { id },
        include: { subject: { select: { name: true, code: true } } },
      });
      return NextResponse.json({ success: true, exam: updated });
    }

    // --- Phase advance (forward-only) ---
    if (phase !== undefined) {
      const newPhase = parseInt(phase, 10);
      if (isNaN(newPhase) || newPhase < 0 || newPhase > 9) {
        return NextResponse.json({ error: "Phase must be 0-9." }, { status: 400 });
      }
      if (newPhase <= exam.phase) {
        return NextResponse.json(
          { error: `Phase can only move forward. Current phase is ${exam.phase}.` },
          { status: 409 }
        );
      }
      dataToUpdate.phase = newPhase;
      dataToUpdate.phaseTimestamps = stampPhase(exam.phaseTimestamps, newPhase);

      // Sync status field with phase
      if (newPhase >= 3) dataToUpdate.status = "PUBLISHED";
      if (newPhase === 9) dataToUpdate.status = "COMPLETED";
    }

    // --- Regular field updates ---
    if (status !== undefined && status !== "PUBLISHED") {
      if (!["DRAFT", "COMPLETED"].includes(status)) {
        return NextResponse.json({ error: "Invalid status value." }, { status: 400 });
      }
      dataToUpdate.status = status;
    }
    if (examDate !== undefined) dataToUpdate.examDate = new Date(examDate);
    if (durationMinutes !== undefined) dataToUpdate.durationMinutes = parseInt(durationMinutes, 10);
    if (totalMarks !== undefined) dataToUpdate.totalMarks = parseInt(totalMarks, 10);
    if (instructions !== undefined) dataToUpdate.instructions = instructions;
    if (body.requiredQuestions !== undefined) dataToUpdate.requiredQuestions = parseInt(body.requiredQuestions, 10);

    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json({ error: "No update fields provided." }, { status: 400 });
    }

    const updated = await db.examSchedule.update({
      where: { id },
      data: dataToUpdate,
      include: { subject: { select: { name: true, code: true } } },
    });

    return NextResponse.json({ success: true, exam: updated });
  } catch (error) {
    console.error("Admin exam PATCH error:", error);
    return NextResponse.json({ error: "Failed to update exam in database." }, { status: 500 });
  }
}

// DELETE /api/admin/exams/[id]: Delete an exam schedule
export async function DELETE(request, { params }) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "COE Admin authorization required." }, { status: 403 });
    }

    const { id } = params;
    await db.examSchedule.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Exam schedule deleted successfully." });
  } catch (error) {
    console.error("Admin exam DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete exam from database." }, { status: 500 });
  }
}
