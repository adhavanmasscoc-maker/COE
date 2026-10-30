import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/lib/db";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

// In-memory cache for fast file loading
// Universal Question Bank Loader for Class 10 & 12
function loadSubjectQuestions(subjectCode, setParam = "all") {
  const code = (subjectCode || "").toUpperCase();
  let fileName = null;
  if (code === "ENG-10") fileName = "ENGLISH-10-100-ALL.json";
  else if (code === "ENG-12") fileName = "ENGLISH-12-100-ALL.json";
  else if (code === "PHY-12") fileName = "PHYSICS-12-100-ALL.json";
  else if (code === "CHE-12") fileName = "CHEMISTRY-12-100-ALL.json";

  if (fileName) {
    try {
      const p = path.join(process.cwd(), "questions", "exams", fileName);
      if (fs.existsSync(p)) {
        const raw = JSON.parse(fs.readFileSync(p, "utf8"));
        let all = [];
        if (Array.isArray(raw.questions)) {
          all = raw.questions;
        } else if (raw.set1 && raw.set2) {
          const s1 = Array.isArray(raw.set1) ? raw.set1 : Object.values(raw.set1);
          const s2 = Array.isArray(raw.set2) ? raw.set2 : Object.values(raw.set2);
          all = [...s1, ...s2];
        }

        const set1 = all.slice(0, 50);
        const set2 = all.slice(50, 100);

        let questions = all;
        if (setParam === "1" || setParam === "set1" || setParam === "set-a") questions = set1;
        else if (setParam === "2" || setParam === "set2" || setParam === "set-b") questions = set2;

        return {
          totalQuestions: all.length,
          set1Count: set1.length,
          set2Count: set2.length,
          questions,
          allQuestions: all,
        };
      }
    } catch (e) {
      console.warn(`Could not load ${fileName}:`, e.message);
    }
  }

  return null;
}

export async function GET(request) {
  try {
    const session = await getCurrentSession();
    const { searchParams } = new URL(request.url);
    const previewRollNo = searchParams.get("previewRollNo");

    if (!session && !previewRollNo) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const subjectCode = (searchParams.get("code") || (searchParams.get("prepClass") === "10" ? "ENG-10" : "CHE-12")).toUpperCase();
    const unitParam = searchParams.get("unit"); // e.g. "1" or "all"
    const setParam = searchParams.get("set") || "all"; // "1", "2", or "all"
    const search = searchParams.get("search")?.trim().toLowerCase();

    // 1. Try to load from curated authentic subject question bank files
    const fileData = loadSubjectQuestions(subjectCode, setParam);

    let rawQuestions = [];
    let allQuestions = [];
    if (fileData) {
      rawQuestions = fileData.questions;
      allQuestions = fileData.allQuestions;
    } else {
      // Fallback: Query database questionBankItems for this subject
      const dbSubject = await db.subject.findFirst({
        where: { code: subjectCode },
        include: {
          questionBankItems: {
            orderBy: { questionNumber: "asc" },
          },
        },
      });

      if (dbSubject && dbSubject.questionBankItems.length > 0) {
        allQuestions = dbSubject.questionBankItems.map((item) => {
          let parsedOpts = {};
          try {
            const raw = JSON.parse(item.options);
            if (Array.isArray(raw)) {
              raw.forEach((o) => { parsedOpts[(o.id || "a").toLowerCase()] = o.text; });
            } else {
              parsedOpts = raw;
            }
          } catch {
            parsedOpts = {};
          }

          return {
            id: item.id,
            question: item.questionText,
            question_en: item.questionText,
            question_ta: null,
            options: parsedOpts,
            options_en: parsedOpts,
            options_ta: null,
            correct_option: item.correctAnswer.toLowerCase(),
            answer: item.correctAnswer,
            answer_en: item.correctAnswer,
            answer_ta: null,
            explanation: item.explanation,
            topic: item.topic || dbSubject.name,
            unit: 1,
          };
        });

        const s1 = allQuestions.slice(0, 50);
        const s2 = allQuestions.slice(50, 100);
        if (setParam === "1" || setParam === "set1" || setParam === "set-a") rawQuestions = s1;
        else if (setParam === "2" || setParam === "set2" || setParam === "set-b") rawQuestions = s2;
        else rawQuestions = allQuestions;
      }
    }

    // Apply filters
    if (rawQuestions.length > 0) {
      let filtered = rawQuestions;

      if (unitParam && unitParam !== "all") {
        const uNum = parseInt(unitParam, 10);
        filtered = filtered.filter((q) => q.unit === uNum);
      }

      if (search) {
        filtered = filtered.filter(
          (q) =>
            (q.question_en || q.question)?.toLowerCase().includes(search) ||
            q.question_ta?.toLowerCase().includes(search) ||
            (q.topic || q.category || q.prose_lesson)?.toLowerCase().includes(search) ||
            (q.answer_en || q.answer)?.toLowerCase().includes(search)
        );
      }

      // Unit or Category groupings
      const unitGroups = {};
      allQuestions.forEach((q, idx) => {
        const u = q.unit || Math.floor(idx / 10) + 1;
        const topicName = q.category || q.topic || q.prose_lesson || `Unit ${u}`;
        if (!unitGroups[u]) {
          unitGroups[u] = {
            unitNumber: u,
            topic: topicName,
            count: 0,
          };
        }
        unitGroups[u].count += 1;
      });

      const isClass10 = subjectCode.endsWith("-10") || subjectCode.includes("10");

      return NextResponse.json({
        success: true,
        subject: {
          code: subjectCode,
          name: subjectCode.startsWith("ENG") ? "English" : subjectCode.startsWith("PHY") ? "Physics" : "Chemistry",
          prepClass: isClass10 ? 10 : 12,
          board: isClass10 ? "Tamil Nadu State Board SSLC Examination" : "Tamil Nadu Samacheer Kalvi HSE",
        },
        stats: {
          totalQuestions: allQuestions.length,
          set1Count: Math.min(50, allQuestions.length),
          set2Count: Math.max(0, allQuestions.length - 50),
          filteredCount: filtered.length,
          totalUnits: Object.keys(unitGroups).length,
        },
        units: Object.values(unitGroups).sort((a, b) => a.unitNumber - b.unitNumber),
        questions: filtered.map((q, idx) => ({
          id: q.id || `${subjectCode}-Q${idx + 1}`,
          globalNumber: idx + 1,
          unit: q.unit || Math.floor(idx / 10) + 1,
          topic: q.category || q.topic || q.prose_lesson || "Objective Standard Questions",
          questionEn: q.question_en || q.question || "",
          questionTa: q.question_ta || null,
          optionsEn: q.options_en || q.options || {},
          optionsTa: q.options_ta || null,
          correctOption: (q.correct_option || q.correct_answer || "a").toUpperCase(),
          answerEn: q.answer_en || q.answer || "",
          answerTa: q.answer_ta || null,
          explanation: q.explanation || "",
        })),
      });
    }

    return NextResponse.json({
      success: true,
      subject: { code: subjectCode, prepClass: subjectCode.endsWith("-10") ? 10 : 12 },
      stats: { totalQuestions: 0, filteredCount: 0 },
      units: [],
      questions: [],
    });
  } catch (error) {
    console.error("[Question Bank API Error]", error);
    return NextResponse.json(
      { error: "Failed to retrieve syllabus question bank." },
      { status: 500 }
    );
  }
}

