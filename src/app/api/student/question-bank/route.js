import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/lib/db";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

// In-memory cache for fast file loading
let cachedChemistry100 = null;

function loadChemistry100FromFile() {
  if (cachedChemistry100) return cachedChemistry100;
  try {
    const filePath = path.join(process.cwd(), "questions", "exams", "CHEMISTRY-12-100-ALL.json");
    if (fs.existsSync(filePath)) {
      const raw = JSON.parse(fs.readFileSync(filePath, "utf8"));
      const set1 = Array.isArray(raw.set1) ? raw.set1 : Object.values(raw.set1 || {});
      const set2 = Array.isArray(raw.set2) ? raw.set2 : Object.values(raw.set2 || {});
      cachedChemistry100 = {
        set1,
        set2,
        all: [...set1, ...set2],
      };
      return cachedChemistry100;
    }
  } catch (err) {
    console.warn("Could not read CHEMISTRY-12-100-ALL.json from disk:", err.message);
  }
  return null;
}

export async function GET(request) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const subjectCode = searchParams.get("code") || "CHE-12";
    const unitParam = searchParams.get("unit"); // e.g. "1" or "all"
    const setParam = searchParams.get("set") || "all"; // "1", "2", or "all"
    const search = searchParams.get("search")?.trim().toLowerCase();

    // 1. Try to load from curated bilingual JSON
    const fileData = loadChemistry100FromFile();

    let rawQuestions = [];
    if (fileData) {
      if (setParam === "1") {
        rawQuestions = fileData.set1;
      } else if (setParam === "2") {
        rawQuestions = fileData.set2;
      } else {
        rawQuestions = fileData.all;
      }
    }

    // If file questions available, apply filters
    if (rawQuestions.length > 0) {
      let filtered = rawQuestions;

      if (unitParam && unitParam !== "all") {
        const uNum = parseInt(unitParam, 10);
        filtered = filtered.filter((q) => q.unit === uNum);
      }

      if (search) {
        filtered = filtered.filter(
          (q) =>
            q.question_en?.toLowerCase().includes(search) ||
            q.question_ta?.toLowerCase().includes(search) ||
            q.topic?.toLowerCase().includes(search) ||
            q.answer_en?.toLowerCase().includes(search)
        );
      }

      // Unit groupings for syllabus overview
      const unitGroups = {};
      rawQuestions.forEach((q) => {
        const u = q.unit || 1;
        if (!unitGroups[u]) {
          unitGroups[u] = {
            unitNumber: u,
            topic: q.topic,
            count: 0,
          };
        }
        unitGroups[u].count += 1;
      });

      return NextResponse.json({
        success: true,
        subject: {
          code: "CHE-12",
          name: "Chemistry",
          nameTa: "வேதியியல்",
          prepClass: 12,
          board: "Tamil Nadu Samacheer Kalvi",
        },
        stats: {
          totalQuestions: rawQuestions.length,
          set1Count: fileData.set1.length,
          set2Count: fileData.set2.length,
          filteredCount: filtered.length,
          totalUnits: Object.keys(unitGroups).length,
        },
        units: Object.values(unitGroups).sort((a, b) => a.unitNumber - b.unitNumber),
        questions: filtered.map((q, idx) => ({
          id: q.id || `CHE12-${idx + 1}`,
          globalNumber: idx + 1,
          unit: q.unit,
          topic: q.topic,
          questionEn: q.question_en,
          questionTa: q.question_ta,
          optionsEn: q.options_en,
          optionsTa: q.options_ta,
          correctOption: (q.correct_option || "a").toUpperCase(),
          answerEn: q.answer_en,
          answerTa: q.answer_ta,
          explanationEn: q.explanation_en,
          explanationTa: q.explanation_ta,
          marks: 1,
        })),
      });
    }

    // Fallback to database QuestionBankItems
    const dbItems = await db.questionBankItem.findMany({
      where: {
        subject: { code: subjectCode },
      },
      orderBy: { questionNumber: "asc" },
    });

    return NextResponse.json({
      success: true,
      subject: { code: subjectCode },
      stats: { totalQuestions: dbItems.length },
      questions: dbItems.map((item) => ({
        id: item.id,
        globalNumber: item.questionNumber,
        topic: item.topic,
        questionEn: item.questionText,
        options: JSON.parse(item.options || "[]"),
        correctOption: item.correctAnswer,
        explanationEn: item.explanation,
        marks: item.marks,
      })),
    });
  } catch (error) {
    console.error("[Question Bank API Error]", error);
    return NextResponse.json(
      { error: "Failed to retrieve syllabus question bank." },
      { status: 500 }
    );
  }
}

