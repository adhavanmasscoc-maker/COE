import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentSession } from "@/lib/auth";
import { validateQuestionItems, parseMarkdownQuestionBank } from "@/lib/questionBankParser";

export const dynamic = "force-dynamic";

// Sample Templates for Phase 3.3
const SAMPLE_JSON_TEMPLATE = [
  {
    "id": 1,
    "question": "What is the capital of Tamil Nadu?",
    "options": {
      "A": "Madurai",
      "B": "Chennai",
      "C": "Coimbatore",
      "D": "Tiruchirappalli"
    },
    "answer": "B",
    "explanation": "Chennai is the capital city of Tamil Nadu.",
    "topic": "General Geography",
    "difficulty": "EASY"
  },
  {
    "id": 2,
    "question": "Which of the following is the author of Tirukkural?",
    "options": {
      "A": "Thiruvalluvar",
      "B": "Kambar",
      "C": "Avvaiyar",
      "D": "Bharathiyar"
    },
    "answer": "A",
    "explanation": "Thiruvalluvar is the celebrated ancient Tamil poet and philosopher who wrote the Tirukkural.",
    "topic": "Tamil Literature",
    "difficulty": "EASY"
  }
];

const SAMPLE_MD_TEMPLATE = `## Q1
What is the capital of Tamil Nadu?
- A) Madurai
- B) Chennai
- C) Coimbatore
- D) Tiruchirappalli
**Answer:** B
**Explanation:** Chennai is the capital city of Tamil Nadu.

## Q2
Which of the following is the author of Tirukkural?
- A) Thiruvalluvar
- B) Kambar
- C) Avvaiyar
- D) Bharathiyar
**Answer:** A
**Explanation:** Thiruvalluvar is the celebrated ancient Tamil poet and philosopher who wrote the Tirukkural.
`;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const templateFormat = searchParams.get("template");

    // Phase 3.3: Downloadable sample template
    if (templateFormat) {
      if (templateFormat.toLowerCase() === "markdown" || templateFormat.toLowerCase() === "md") {
        return new NextResponse(SAMPLE_MD_TEMPLATE, {
          headers: {
            "Content-Type": "text/markdown; charset=utf-8",
            "Content-Disposition": 'attachment; filename="question_bank_sample_template.md"',
          },
        });
      }
      return new NextResponse(JSON.stringify(SAMPLE_JSON_TEMPLATE, null, 2), {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Content-Disposition": 'attachment; filename="question_bank_sample_template.json"',
        },
      });
    }

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
        topic: item.topic,
        difficulty: item.difficulty,
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
    const {
      subjectCode,
      format = "JSON",
      content,
      questions: directQuestions,
      mode = "replace", // "replace" or "append"
    } = body;

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
    } else if (format.toUpperCase() === "MARKDOWN" || (typeof content === "string" && content.includes("#"))) {
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

    // Validate using central parser
    const { errors, validItems } = validateQuestionItems(rawQuestions);

    if (errors.length > 0 && validItems.length === 0) {
      return NextResponse.json({
        success: false,
        message: "Question bank validation failed. All questions contained errors.",
        errors,
        rejected: errors,
        validCount: 0,
        errorCount: errors.length,
      }, { status: 422 });
    }

    // Warning if count is not 100
    const warning = validItems.length !== 100
      ? `Question bank has ${validItems.length} questions (expected 100 questions).`
      : null;

    // Mode: Replace or Append
    let startNumber = 1;
    if (mode === "append") {
      const highestItem = await db.questionBankItem.findFirst({
        where: { subjectId: subject.id },
        orderBy: { questionNumber: "desc" },
      });
      if (highestItem) {
        startNumber = highestItem.questionNumber + 1;
      }
    } else {
      // Replace mode: delete previous questions for this subject
      await db.questionBankItem.deleteMany({
        where: { subjectId: subject.id },
      });
    }

    // Store in DB
    for (let i = 0; i < validItems.length; i++) {
      const item = validItems[i];
      const qNum = mode === "append" ? startNumber + i : item.questionNumber;
      await db.questionBankItem.create({
        data: {
          subjectId: subject.id,
          questionNumber: qNum,
          questionText: item.questionText,
          marks: item.marks || 1,
          options: item.options,
          correctAnswer: item.correctAnswer,
          explanation: item.explanation,
          topic: item.topic || null,
          difficulty: item.difficulty || "MEDIUM",
          language: subject.medium === "Tamil" ? "ta" : "en",
          sourceFormat: format.toUpperCase(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${validItems.length} valid questions into Question Bank for ${subject.name} (${subject.code}) in ${mode} mode!`,
      subject: { id: subject.id, code: subject.code, name: subject.name },
      importedCount: validItems.length,
      errorsCount: errors.length,
      errors: errors.length > 0 ? errors : undefined,
      rejected: errors.length > 0 ? errors : [],
      warning,
    });
  } catch (error) {
    console.error("[QuestionBank API POST Error]", error);
    return NextResponse.json({ error: "Failed to import question bank: " + error.message }, { status: 500 });
  }
}
