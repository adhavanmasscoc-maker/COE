import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentSession } from "@/lib/auth";
import { validateQuestionItems, parseMarkdownQuestionBank } from "@/lib/questionBankParser";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectCode = searchParams.get("code") || searchParams.get("subjectCode");
    const prepClass = parseInt(searchParams.get("prepClass"), 10);

    const where = {};
    if (subjectCode) {
      where.subject = { code: subjectCode.toUpperCase() };
    } else if (!isNaN(prepClass)) {
      where.subject = { prepClass };
    }

    const items = await db.questionBankItem.findMany({
      where,
      include: {
        subject: {
          select: { id: true, name: true, code: true, prepClass: true, medium: true },
        },
      },
      orderBy: { questionNumber: "asc" },
    });

    // Compute stats
    const grouped = {};
    items.forEach((item) => {
      const code = item.subject.code;
      if (!grouped[code]) {
        grouped[code] = {
          subject: item.subject,
          count: 0,
          totalMarks: 0,
          items: [],
        };
      }
      grouped[code].count += 1;
      grouped[code].totalMarks += item.marks;
      grouped[code].items.push({
        id: item.id,
        questionNumber: item.questionNumber,
        questionText: item.questionText,
        marks: item.marks,
        options: JSON.parse(item.options),
        correctAnswer: item.correctAnswer,
        explanation: item.explanation,
        sourceFormat: item.sourceFormat,
      });
    });

    return NextResponse.json({
      success: true,
      totalQuestions: items.length,
      banksBySubject: grouped,
    });
  } catch (error) {
    console.error("[QuestionBank API GET Error]", error);
    return NextResponse.json({ error: "Failed to fetch question bank." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized COE Admin access required." }, { status: 403 });
    }

    const body = await request.json();
    const { subjectCode, format = "JSON", content, questions: directQuestions } = body;

    if (!subjectCode) {
      return NextResponse.json({ error: "Subject code is required (e.g. TAM-10, MAT-10, CSC-12)." }, { status: 400 });
    }

    // Find subject in DB
    const subject = await db.subject.findFirst({
      where: {
        code: subjectCode.trim().toUpperCase(),
      },
    });

    if (!subject) {
      return NextResponse.json(
        { error: `Subject with code "${subjectCode}" not found in curriculum.` },
        { status: 404 }
      );
    }

    // Parse raw questions
    let rawQuestions = [];
    if (Array.isArray(directQuestions)) {
      rawQuestions = directQuestions;
    } else if (format.toUpperCase() === "MARKDOWN" || typeof content === "string" && content.includes("#")) {
      rawQuestions = parseMarkdownQuestionBank(typeof content === "string" ? content : "");
    } else if (typeof content === "string") {
      try {
        const parsed = JSON.parse(content);
        rawQuestions = Array.isArray(parsed) ? parsed : (parsed.questions || []);
      } catch (jsonErr) {
        return NextResponse.json({
          error: "Invalid JSON format: " + jsonErr.message,
          validCount: 0,
          errorCount: 1,
        }, { status: 400 });
      }
    } else if (Array.isArray(content)) {
      rawQuestions = content;
    }

    if (rawQuestions.length === 0) {
      return NextResponse.json({
        error: "No questions detected. Please provide a valid JSON array or Markdown format.",
        validCount: 0,
        errorCount: 0,
      }, { status: 400 });
    }

    // Validate
    const { errors, validItems } = validateQuestionItems(rawQuestions);

    if (errors.length > 0 && validItems.length === 0) {
      return NextResponse.json({
        success: false,
        message: "Question bank validation failed. Please correct the reported issues.",
        errors,
        validCount: 0,
        errorCount: errors.length,
      }, { status: 422 });
    }

    // Store in DB: Replace or add into subject's QuestionBankItem
    await db.questionBankItem.deleteMany({
      where: { subjectId: subject.id },
    });

    for (const item of validItems) {
      await db.questionBankItem.create({
        data: {
          subjectId: subject.id,
          questionNumber: item.questionNumber,
          questionText: item.questionText,
          marks: item.marks,
          options: item.options,
          correctAnswer: item.correctAnswer,
          explanation: item.explanation,
          sourceFormat: format.toUpperCase(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${validItems.length} questions into Question Bank for ${subject.name} (${subject.code})!`,
      subject: { id: subject.id, code: subject.code, name: subject.name },
      importedCount: validItems.length,
      errorsCount: errors.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("[QuestionBank API POST Error]", error);
    return NextResponse.json({ error: "Failed to import question bank: " + error.message }, { status: 500 });
  }
}
