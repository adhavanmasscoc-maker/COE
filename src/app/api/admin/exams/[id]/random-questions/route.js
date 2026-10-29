import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// Helper to randomly sample N items from an array without replacement
function sampleRandom(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, array.length));
}

// GET: View currently selected questions alongside all available questions in the subject's bank
export async function GET(request, { params }) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "COE Admin authorization required." }, { status: 403 });
    }

    const { id: examId } = params;
    const exam = await db.examSchedule.findUnique({
      where: { id: examId },
      include: {
        subject: true,
        questions: { orderBy: { questionNumber: "asc" } },
      },
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam schedule not found." }, { status: 404 });
    }

    // Fetch full 100-question bank for this subject
    const bankItems = await db.questionBankItem.findMany({
      where: { subjectId: exam.subjectId },
      orderBy: { questionNumber: "asc" },
    });

    // Map which ones are currently selected
    const selectedTexts = new Set(exam.questions.map((q) => q.questionText.trim()));

    const enrichedBank = bankItems.map((item) => ({
      id: item.id,
      questionNumber: item.questionNumber,
      questionText: item.questionText,
      marks: item.marks,
      options: JSON.parse(item.options),
      correctAnswer: item.correctAnswer,
      isSelected: selectedTexts.has(item.questionText.trim()),
    }));

    return NextResponse.json({
      success: true,
      exam: {
        id: exam.id,
        subjectName: exam.subject.name,
        subjectCode: exam.subject.code,
        prepClass: exam.prepClass,
        totalMarks: exam.totalMarks,
      },
      currentQuestions: exam.questions.map((q) => ({
        id: q.id,
        questionNumber: q.questionNumber,
        questionText: q.questionText,
        marks: q.marks,
        options: JSON.parse(q.options),
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
      })),
      bankTotal: bankItems.length,
      bankItems: enrichedBank,
    });
  } catch (error) {
    console.error("[Random Questions API GET Error]", error);
    return NextResponse.json({ error: "Failed to fetch question pool." }, { status: 500 });
  }
}

// POST: Regenerate all random questions OR swap a specific question (Phase 6.3 & 6.4)
export async function POST(request, { params }) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "COE Admin authorization required." }, { status: 403 });
    }

    const { id: examId } = params;
    const body = await request.json();
    const { action = "regenerate", count = 10, swapQuestionId, newBankItemId } = body;

    const exam = await db.examSchedule.findUnique({
      where: { id: examId },
      include: {
        subject: true,
        questions: { orderBy: { questionNumber: "asc" } },
      },
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam schedule not found." }, { status: 404 });
    }

    const bankItems = await db.questionBankItem.findMany({
      where: { subjectId: exam.subjectId },
    });

    if (bankItems.length === 0) {
      return NextResponse.json(
        { error: `No questions found in Question Bank for ${exam.subject.name} (${exam.subject.code}). Import bank first.` },
        { status: 400 }
      );
    }

    // Action 1: SWAP single question
    if (action === "swap") {
      if (!swapQuestionId) {
        return NextResponse.json({ error: "swapQuestionId is required to swap." }, { status: 400 });
      }

      // Existing target question in exam
      const targetQuestion = await db.examQuestion.findFirst({
        where: { id: swapQuestionId, examScheduleId: examId },
      });

      if (!targetQuestion) {
        return NextResponse.json({ error: "Target question to swap not found in this exam." }, { status: 404 });
      }

      // Find replacement candidate
      let replacementItem = null;
      if (newBankItemId) {
        replacementItem = bankItems.find((b) => b.id === newBankItemId);
      } else {
        // Pick random question from bank not currently in exam
        const currentTexts = new Set(exam.questions.map((q) => q.questionText.trim()));
        const available = bankItems.filter((b) => !currentTexts.has(b.questionText.trim()));
        if (available.length === 0) {
          return NextResponse.json({ error: "All bank questions are already in this exam." }, { status: 400 });
        }
        replacementItem = available[Math.floor(Math.random() * available.length)];
      }

      let parsedOptions = [];
      try {
        const rawOpts = JSON.parse(replacementItem.options);
        parsedOptions = Array.isArray(rawOpts)
          ? rawOpts
          : Object.keys(rawOpts).map((k) => ({ id: k.toUpperCase(), text: rawOpts[k] }));
      } catch {
        parsedOptions = [
          { id: "A", text: "Option A" },
          { id: "B", text: "Option B" },
          { id: "C", text: "Option C" },
          { id: "D", text: "Option D" },
        ];
      }

      await db.examQuestion.update({
        where: { id: targetQuestion.id },
        data: {
          questionText: replacementItem.questionText,
          options: JSON.stringify(parsedOptions),
          correctAnswer: replacementItem.correctAnswer,
          explanation: replacementItem.explanation,
          source: "swapped_from_bank",
        },
      });

      return NextResponse.json({
        success: true,
        message: `Swapped Question #${targetQuestion.questionNumber} successfully!`,
      });
    }

    // Action 2: REGENERATE all questions randomly from bank without duplicates
    const targetCount = parseInt(count, 10) || exam.questions.length || 10;
    const sampled = sampleRandom(bankItems, targetCount);
    const marksPerQ = Math.max(1, Math.round(exam.totalMarks / sampled.length));

    // Delete existing questions
    await db.examQuestion.deleteMany({
      where: { examScheduleId: examId },
    });

    for (let i = 0; i < sampled.length; i++) {
      const bq = sampled[i];
      let parsedOptions = [];
      try {
        const rawOpts = JSON.parse(bq.options);
        parsedOptions = Array.isArray(rawOpts)
          ? rawOpts
          : Object.keys(rawOpts).map((k) => ({ id: k.toUpperCase(), text: rawOpts[k] }));
      } catch {
        parsedOptions = [
          { id: "A", text: "Option A" },
          { id: "B", text: "Option B" },
          { id: "C", text: "Option C" },
          { id: "D", text: "Option D" },
        ];
      }

      await db.examQuestion.create({
        data: {
          examScheduleId: examId,
          questionNumber: i + 1,
          questionText: bq.questionText,
          marks: marksPerQ,
          options: JSON.stringify(parsedOptions),
          correctAnswer: bq.correctAnswer,
          explanation: bq.explanation,
          reviewStatus: "approved",
          source: "random_regenerated",
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully regenerated ${sampled.length} random questions from Question Bank without duplicates!`,
      count: sampled.length,
    });
  } catch (error) {
    console.error("[Random Questions API POST Error]", error);
    return NextResponse.json({ error: "Failed to regenerate questions: " + error.message }, { status: 500 });
  }
}

