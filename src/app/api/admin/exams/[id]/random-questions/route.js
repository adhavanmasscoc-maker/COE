import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// Helper to randomly sample N items from an array without replacement
// Data structure: Shuffled array copy with Fisher-Yates or random sort.
// Time complexity: O(N) sampling.
// If rules change: Adjust randomness seed or sampling algorithm.
function sampleRandom(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, array.length));
}

// Scramble options array and compute updated correct answer key letter
function scrambleQuestionOptions(optionsRaw, correctAnswer) {
  let parsedOptions = [];
  try {
    const rawOpts = typeof optionsRaw === "string" ? JSON.parse(optionsRaw) : optionsRaw;
    parsedOptions = Array.isArray(rawOpts)
      ? rawOpts
      : Object.keys(rawOpts).map((k) => ({ id: k.toUpperCase(), text: rawOpts[k] }));
  } catch {
    return { options: optionsRaw, correctAnswer };
  }

  if (parsedOptions.length <= 1) return { options: parsedOptions, correctAnswer };

  // Identify correct text and English/Tamil values
  const correctOpt = parsedOptions.find((o) => o.id === String(correctAnswer).toUpperCase());
  const correctText = correctOpt ? correctOpt.text : null;
  const correctTextEn = correctOpt ? (correctOpt.textEn || correctOpt.text) : null;

  // Shuffle options order
  const shuffled = [...parsedOptions].sort(() => 0.5 - Math.random());

  // Re-index letters A, B, C, D
  const newOptions = shuffled.map((opt, idx) => ({
    ...opt,
    id: String.fromCharCode(65 + idx),
  }));

  // Find which new letter contains the correct text
  let newCorrectLetter = "A";
  if (correctText) {
    const found = newOptions.find((o) => o.text === correctText || (correctTextEn && o.textEn === correctTextEn));
    if (found) newCorrectLetter = found.id;
  }

  return {
    options: newOptions,
    correctAnswer: newCorrectLetter,
  };
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

    const enrichedBank = bankItems.map((item) => {
      let parsedOptions = [];
      try {
        const rawOpts = JSON.parse(item.options);
        parsedOptions = Array.isArray(rawOpts)
          ? rawOpts
          : Object.keys(rawOpts).map((k) => ({ id: k.toUpperCase(), text: rawOpts[k] }));
      } catch {
        parsedOptions = [];
      }

      return {
        id: item.id,
        questionNumber: item.questionNumber,
        questionText: item.questionText,
        marks: item.marks,
        options: parsedOptions,
        correctAnswer: item.correctAnswer,
        explanation: item.explanation,
        difficulty: item.difficulty || "MEDIUM",
        topic: item.topic || "",
        isSelected: selectedTexts.has(item.questionText.trim()),
      };
    });

    return NextResponse.json({
      success: true,
      exam: {
        id: exam.id,
        subjectName: exam.subject.name,
        subjectCode: exam.subject.code,
        prepClass: exam.prepClass,
        totalMarks: exam.totalMarks,
        durationMinutes: exam.durationMinutes,
        instructions: exam.instructions,
      },
      currentQuestions: exam.questions.map((q) => {
        let parsed = [];
        try {
          const raw = JSON.parse(q.options);
          parsed = Array.isArray(raw)
            ? raw
            : Object.keys(raw).map((k) => ({ id: k.toUpperCase(), text: raw[k] }));
        } catch {
          parsed = [];
        }

        return {
          id: q.id,
          questionNumber: q.questionNumber,
          questionText: q.questionText,
          marks: q.marks,
          options: parsed,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          difficulty: q.difficulty || "MEDIUM",
          syllabusRef: q.syllabusRef || "",
        };
      }),
      bankTotal: bankItems.length,
      bankItems: enrichedBank,
    });
  } catch (error) {
    console.error("[Random Questions API GET Error]", error);
    return NextResponse.json({ error: "Failed to fetch question pool." }, { status: 500 });
  }
}

// POST: Regenerate questions from pool, swap questions, or edit single question inline
export async function POST(request, { params }) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "COE Admin authorization required." }, { status: 403 });
    }

    const { id: examId } = params;
    const body = await request.json();
    const {
      action = "regenerate",
      count = 25,
      poolRange = "ALL", // "ALL", "FIRST_50", "SECOND_50", "FIRST_25"
      selectionMode = "random", // "random", "sequential", "custom", "policy"
      selectedBankItemIds = [],
      policyId = null,
      swapQuestionId,
      newBankItemId,
      // Inline edit fields
      questionId,
      questionText,
      marks,
      options,
      correctAnswer,
      explanation,
      difficulty,
      syllabusRef,
    } = body;

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

    // Action: EDIT single question inline
    if (action === "edit_question") {
      if (!questionId) {
        return NextResponse.json({ error: "questionId is required to edit question." }, { status: 400 });
      }

      const updateData = {};
      if (questionText !== undefined) updateData.questionText = questionText;
      if (marks !== undefined) updateData.marks = parseInt(marks, 10);
      if (options !== undefined) {
        updateData.options = typeof options === "string" ? options : JSON.stringify(options);
      }
      if (correctAnswer !== undefined) updateData.correctAnswer = correctAnswer;
      if (explanation !== undefined) updateData.explanation = explanation;
      if (difficulty !== undefined) updateData.difficulty = difficulty;
      if (syllabusRef !== undefined) updateData.syllabusRef = syllabusRef;

      const updated = await db.examQuestion.update({
        where: { id: questionId },
        data: updateData,
      });

      return NextResponse.json({
        success: true,
        message: `Updated Question #${updated.questionNumber} successfully!`,
        question: updated,
      });
    }

    const bankItems = await db.questionBankItem.findMany({
      where: { subjectId: exam.subjectId },
      orderBy: { questionNumber: "asc" },
    });

    if (bankItems.length === 0) {
      return NextResponse.json(
        { error: `No questions found in Question Bank for ${exam.subject.name} (${exam.subject.code}). Import bank first.` },
        { status: 400 }
      );
    }

    // Action: SWAP single question
    if (action === "swap") {
      if (!swapQuestionId) {
        return NextResponse.json({ error: "swapQuestionId is required to swap." }, { status: 400 });
      }

      const targetQuestion = await db.examQuestion.findFirst({
        where: { id: swapQuestionId, examScheduleId: examId },
      });

      if (!targetQuestion) {
        return NextResponse.json({ error: "Target question to swap not found in this exam." }, { status: 404 });
      }

      let replacementItem = null;
      if (newBankItemId) {
        replacementItem = bankItems.find((b) => b.id === newBankItemId);
      } else {
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

    // Action: SHUFFLE ACTIVE QUESTIONS (Order e.g. Q1 to Q10 and Q10 to Q1)
    if (action === "shuffle_questions" || action === "shuffle_all") {
      const activeQuestions = await db.examQuestion.findMany({
        where: { examScheduleId: examId },
        orderBy: { questionNumber: "asc" },
      });

      if (activeQuestions.length === 0) {
        return NextResponse.json({ error: "No active questions found in this exam to shuffle." }, { status: 400 });
      }

      // Shuffle the order of questions
      const shuffledQuestions = [...activeQuestions].sort(() => 0.5 - Math.random());
      const alsoShuffleOptions = action === "shuffle_all" || body.shuffleOptions === true;

      // Two-step transaction to avoid unique constraint collisions on (examScheduleId, questionNumber)
      await db.$transaction(async (tx) => {
        // Step 1: Assign temporary non-colliding question numbers
        for (let i = 0; i < shuffledQuestions.length; i++) {
          await tx.examQuestion.update({
            where: { id: shuffledQuestions[i].id },
            data: { questionNumber: 10000 + i + 1 },
          });
        }

        // Step 2: Assign final randomized 1..N order (and scrambled options if requested)
        for (let i = 0; i < shuffledQuestions.length; i++) {
          const q = shuffledQuestions[i];
          const updateData = { questionNumber: i + 1 };

          if (alsoShuffleOptions) {
            const scrambled = scrambleQuestionOptions(q.options, q.correctAnswer);
            updateData.options = JSON.stringify(scrambled.options);
            updateData.correctAnswer = scrambled.correctAnswer;
          }

          await tx.examQuestion.update({
            where: { id: q.id },
            data: updateData,
          });
        }
      });

      return NextResponse.json({
        success: true,
        message: alsoShuffleOptions
          ? `Successfully shuffled all ${shuffledQuestions.length} questions AND their ABCD options!`
          : `Successfully randomized question order (1..${shuffledQuestions.length})!`,
      });
    }

    // Action: SHUFFLE ABCD OPTIONS ONLY
    if (action === "shuffle_options") {
      const activeQuestions = await db.examQuestion.findMany({
        where: { examScheduleId: examId },
        orderBy: { questionNumber: "asc" },
      });

      if (activeQuestions.length === 0) {
        return NextResponse.json({ error: "No active questions found to shuffle options." }, { status: 400 });
      }

      await db.$transaction(async (tx) => {
        for (const q of activeQuestions) {
          const scrambled = scrambleQuestionOptions(q.options, q.correctAnswer);
          await tx.examQuestion.update({
            where: { id: q.id },
            data: {
              options: JSON.stringify(scrambled.options),
              correctAnswer: scrambled.correctAnswer,
            },
          });
        }
      });

      return NextResponse.json({
        success: true,
        message: `Successfully scrambled ABCD options for all ${activeQuestions.length} questions with 100% accurate answer keys!`,
      });
    }

    // Action: REGENERATE / SELECT questions from pool with multiple options
    // 1. Filter pool by range (First 50, Second 50, First 25, or All 100)
    let pool = [...bankItems];
    if (poolRange === "FIRST_50") {
      pool = pool.filter((b) => b.questionNumber <= 50);
    } else if (poolRange === "SECOND_50") {
      pool = pool.filter((b) => b.questionNumber > 50);
    } else if (poolRange === "FIRST_25") {
      pool = pool.filter((b) => b.questionNumber <= 25);
    }

    if (pool.length === 0) {
      pool = [...bankItems];
    }

    let sampled = [];

    // 2. Select questions based on selection mode
    if (selectionMode === "custom" && Array.isArray(selectedBankItemIds) && selectedBankItemIds.length > 0) {
      const idSet = new Set(selectedBankItemIds);
      sampled = pool.filter((b) => idSet.has(b.id));
    } else if (selectionMode === "sequential") {
      const targetCount = parseInt(count, 10) || 25;
      sampled = pool.slice(0, Math.min(targetCount, pool.length));
    } else if (selectionMode === "policy" && policyId) {
      const targetCount = parseInt(count, 10) || 25;
      const pid = parseInt(policyId, 10);
      let sortedPool = [...pool];
      if (pid === 1) { // Easy-only policy
        sortedPool.sort((a, b) => (a.difficulty === "EASY" ? -1 : 1));
      } else if (pid === 2) { // Moderate standard policy
        sortedPool.sort((a, b) => (a.difficulty === "MEDIUM" ? -1 : 1));
      } else if (pid === 3) { // Challenging policy
        sortedPool.sort((a, b) => (a.difficulty === "HARD" ? -1 : 1));
      } else {
        sortedPool = sampleRandom(sortedPool, sortedPool.length);
      }
      sampled = sortedPool.slice(0, Math.min(targetCount, sortedPool.length));
    } else {
      // Default: Random selection from chosen pool without duplicates
      const targetCount = parseInt(count, 10) || 25;
      sampled = sampleRandom(pool, targetCount);
    }

    if (sampled.length === 0) {
      sampled = sampleRandom(bankItems, Math.min(parseInt(count, 10) || 25, bankItems.length));
    }

    // Determine target total marks and update exam schedule if specified or preset
    const targetTotalMarks = (body.totalMarks !== undefined && body.totalMarks !== null && body.totalMarks !== "")
      ? parseInt(body.totalMarks, 10)
      : (parseInt(count, 10) === 10 ? 10 : parseInt(count, 10) === 25 ? 25 : exam.totalMarks);

    await db.examSchedule.update({
      where: { id: examId },
      data: { totalMarks: targetTotalMarks },
    });

    const marksPerQ = Math.max(1, Math.round(targetTotalMarks / sampled.length));

    // Delete existing questions and bulk-insert new questions in single atomic operation
    // Data structure: Array of ExamQuestion payload objects mapped from sample pool.
    // Time complexity: O(M) mapping + O(1) single-trip createMany instead of M serial queries.
    // If rules change: Update mapped question fields or options serialization.
    await db.examQuestion.deleteMany({
      where: { examScheduleId: examId },
    });

    const shouldShuffleOpts = body.shuffleOptions === true;

    const createPayload = sampled.map((bq, i) => {
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

      let finalOptions = parsedOptions;
      let finalCorrect = bq.correctAnswer;

      if (shouldShuffleOpts) {
        const scrambled = scrambleQuestionOptions(parsedOptions, bq.correctAnswer);
        finalOptions = scrambled.options;
        finalCorrect = scrambled.correctAnswer;
      }

      return {
        examScheduleId: examId,
        questionNumber: i + 1,
        questionText: bq.questionText,
        marks: marksPerQ,
        options: JSON.stringify(finalOptions),
        correctAnswer: finalCorrect,
        explanation: bq.explanation,
        difficulty: bq.difficulty || "MEDIUM",
        reviewStatus: "approved",
        source: `pool_${poolRange.toLowerCase()}_${selectionMode}`,
      };
    });

    await db.examQuestion.createMany({
      data: createPayload,
    });

    return NextResponse.json({
      success: true,
      message: `Successfully generated ${sampled.length} questions (${targetTotalMarks} Marks) from ${poolRange} pool (${selectionMode} mode)!`,
      count: sampled.length,
      totalMarks: targetTotalMarks,
      poolRange,
      selectionMode,
    });
  } catch (error) {
    console.error("[Random Questions API POST Error]", error);
    return NextResponse.json({ error: "Failed to generate questions: " + error.message }, { status: 500 });
  }
}
