import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "COE Admin authorization required." }, { status: 403 });
    }

    const body = await request.json();
    const { examId, jsonContent } = body;

    let payload = jsonContent;
    if (typeof jsonContent === "string") {
      try {
        payload = JSON.parse(jsonContent);
      } catch (jsonErr) {
        return NextResponse.json({ error: "Invalid JSON format: " + jsonErr.message }, { status: 400 });
      }
    }

    if (!payload || !Array.isArray(payload.questions) || payload.questions.length === 0) {
      return NextResponse.json(
        { error: "JSON must contain a non-empty 'questions' array matching the required schema." },
        { status: 400 }
      );
    }

    // 1. Resolve Target ExamSchedule
    let exam = null;
    if (examId) {
      exam = await db.examSchedule.findUnique({
        where: { id: examId },
        include: { subject: true },
      });
    }

    if (!exam && payload.sub) {
      // Find subject by code
      const subCode = String(payload.sub).trim().toUpperCase();
      const subject = await db.subject.findFirst({
        where: {
          OR: [
            { code: subCode },
            { code: { startsWith: subCode } },
          ],
        },
      });

      if (subject) {
        // Create or find matching schedule
        exam = await db.examSchedule.findFirst({
          where: { subjectId: subject.id, status: "PUBLISHED" },
          include: { subject: true },
        });

        if (!exam) {
          const dateStr = payload.date || new Date().toISOString().slice(0, 10);
          const timeStr = payload.time || "09:30";
          const examDate = new Date(`${dateStr}T${timeStr}:00`);
          exam = await db.examSchedule.create({
            data: {
              subjectId: subject.id,
              prepClass: subject.prepClass,
              examDate: isNaN(examDate.getTime()) ? new Date() : examDate,
              durationMinutes: 90,
              totalMarks: parseInt(payload.total_marks, 10) || 25,
              instructions: `Standard Board examination generated via AI Exam Setter for ${subject.name}.`,
              status: "PUBLISHED",
              phase: 4,
            },
            include: { subject: true },
          });
        }
      }
    }

    if (!exam) {
      return NextResponse.json(
        { error: `Could not associate JSON with an exam schedule. Provide an examId or valid subject code (sub: "${payload.sub}").` },
        { status: 404 }
      );
    }

    // 2. Validate Questions against Schema (Phase 5.2)
    const validationErrors = [];
    const validQuestions = [];
    const seenTexts = new Set();

    payload.questions.forEach((q, idx) => {
      const qNum = q.id || idx + 1;
      const qText = String(q.question || "").trim();

      if (!qText || qText.includes("<<QUESTION")) {
        validationErrors.push(`Question #${qNum}: Question text is missing or contains an unfilled placeholder.`);
        return;
      }

      if (seenTexts.has(qText.toLowerCase())) {
        validationErrors.push(`Question #${qNum}: Duplicate question detected: "${qText.slice(0, 40)}..."`);
        return;
      }
      seenTexts.add(qText.toLowerCase());

      if (!q.options || typeof q.options !== "object") {
        validationErrors.push(`Question #${qNum}: Options object with choices A, B, C, D is required.`);
        return;
      }

      const missingChoices = ["A", "B", "C", "D"].filter((c) => !q.options[c] || String(q.options[c]).includes("<<OPTION"));
      if (missingChoices.length > 0) {
        validationErrors.push(`Question #${qNum}: Missing or placeholder options for choice(s): ${missingChoices.join(", ")}.`);
        return;
      }

      const rawAns = String(q.answer || "").trim().toUpperCase();
      if (!["A", "B", "C", "D"].includes(rawAns)) {
        validationErrors.push(`Question #${qNum}: Answer must be one of A, B, C, or D (got "${rawAns}").`);
        return;
      }

      const parsedOptions = [
        { id: "A", text: String(q.options.A).trim() },
        { id: "B", text: String(q.options.B).trim() },
        { id: "C", text: String(q.options.C).trim() },
        { id: "D", text: String(q.options.D).trim() },
      ];

      validQuestions.push({
        questionNumber: qNum,
        questionText: qText,
        marks: Math.max(1, Math.round((parseInt(payload.total_marks, 10) || exam.totalMarks) / payload.questions.length)),
        options: JSON.stringify(parsedOptions),
        correctAnswer: rawAns,
        explanation: q.explanation || `Official verified answer for ${exam.subject.name}.`,
      });
    });

    if (validationErrors.length > 0) {
      return NextResponse.json({
        success: false,
        message: "JSON validation failed against required exam schema.",
        errors: validationErrors,
        validCount: validQuestions.length,
        errorCount: validationErrors.length,
      }, { status: 422 });
    }

    // 3. Clear existing questions and insert newly imported ones in single atomic batch
    // Data structure: Array of ExamQuestion payload objects mapped from valid questions.
    // Time complexity: O(M) mapping + O(1) single-trip createMany.
    // If rules change: Update mapped question fields.
    await db.examQuestion.deleteMany({
      where: { examScheduleId: exam.id },
    });

    await db.examQuestion.createMany({
      data: validQuestions.map((vq) => ({
        examScheduleId: exam.id,
        questionNumber: vq.questionNumber,
        questionText: vq.questionText,
        marks: vq.marks,
        options: vq.options,
        correctAnswer: vq.correctAnswer,
        explanation: vq.explanation,
        reviewStatus: "approved",
        source: "json_exam_setter",
      })),
    });

    // 4. Advance exam phase to Phase 4 / Phase 5
    await db.examSchedule.update({
      where: { id: exam.id },
      data: {
        totalMarks: parseInt(payload.total_marks, 10) || exam.totalMarks,
        phase: Math.max(exam.phase, 4), // Advanced to reached students / exam ready
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully accepted and imported ${validQuestions.length} verified questions into ${exam.subject.name} (${exam.subject.code})!`,
      examId: exam.id,
      subject: exam.subject.name,
      importedQuestionsCount: validQuestions.length,
      totalMarks: payload.total_marks || exam.totalMarks,
    });
  } catch (error) {
    console.error("[Exam Setter Import JSON API Error]", error);
    return NextResponse.json({ error: "Server error during JSON import: " + error.message }, { status: 500 });
  }
}

