import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/lib/db";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

// Standard Question Bank generator fallback if database questions aren't yet populated for a newly added unit
const CURRICULUM_PRACTICE_BANK = {
  10: {
    "MAT-10": [
      {
        questionNumber: 1,
        questionText: "If n(A × B) = 6 and A = {1, 3}, then the cardinal number n(B) is:",
        options: [
          { id: "A", text: "1" },
          { id: "B", text: "2" },
          { id: "C", text: "3" },
          { id: "D", text: "6" }
        ],
        correctAnswer: "C",
        marks: 1,
        explanation: "By property of Cartesian product, n(A × B) = n(A) × n(B). Since n(A) = 2 and n(A × B) = 6: 6 = 2 × n(B) => n(B) = 3."
      },
      {
        questionNumber: 2,
        questionText: "The least common multiple of all integers from 1 to 10 inclusive is:",
        options: [
          { id: "A", text: "2025" },
          { id: "B", text: "2520" },
          { id: "C", text: "5040" },
          { id: "D", text: "1000" }
        ],
        correctAnswer: "B",
        marks: 1,
        explanation: "LCM(1..10) = 2³ × 3² × 5 × 7 = 8 × 9 × 5 × 7 = 2520."
      },
      {
        questionNumber: 3,
        questionText: "In an Arithmetic Progression, if the 3rd term is 16 and the 7th term is 32, what is the common difference d?",
        options: [
          { id: "A", text: "2" },
          { id: "B", text: "4" },
          { id: "C", text: "6" },
          { id: "D", text: "8" }
        ],
        correctAnswer: "B",
        marks: 1,
        explanation: "t7 - t3 = (a + 6d) - (a + 2d) = 4d. 32 - 16 = 16. Therefore 4d = 16 => d = 4."
      },
      {
        questionNumber: 4,
        questionText: "If f(x) = 2x² and g(x) = 1/(3x), then what is f(g(x))?",
        options: [
          { id: "A", text: "2 / (9x²)" },
          { id: "B", text: "1 / (6x²)" },
          { id: "C", text: "2 / (3x)" },
          { id: "D", text: "4 / (9x²)" }
        ],
        correctAnswer: "A",
        marks: 1,
        explanation: "f(g(x)) = f(1/(3x)) = 2 * (1/(3x))² = 2 * (1/(9x²)) = 2 / (9x²)."
      },
      {
        questionNumber: 5,
        questionText: "What is the remainder when 3²⁰²⁶ is divided by 5?",
        options: [
          { id: "A", text: "1" },
          { id: "B", text: "2" },
          { id: "C", text: "3" },
          { id: "D", text: "4" }
        ],
        correctAnswer: "D",
        marks: 1,
        explanation: "Powers of 3 modulo 5 cycle with period 4: 3¹≡3, 3²≡4, 3³≡2, 3⁴≡1. 2026 mod 4 = 2. So 3²⁰²⁶ ≡ 3² ≡ 4 (mod 5)."
      }
    ],
    "SCI-10": [
      {
        questionNumber: 1,
        questionText: "The SI unit of linear momentum is:",
        options: [
          { id: "A", text: "N s" },
          { id: "B", text: "N / s" },
          { id: "C", text: "J s" },
          { id: "D", text: "kg m s²" }
        ],
        correctAnswer: "A",
        marks: 1,
        explanation: "Linear momentum p = mv. Unit: kg·m/s = (kg·m/s²)·s = N·s."
      },
      {
        questionNumber: 2,
        questionText: "Which gas is released during photosynthesis in the light-dependent reaction?",
        options: [
          { id: "A", text: "Carbon Dioxide" },
          { id: "B", text: "Oxygen" },
          { id: "C", text: "Nitrogen" },
          { id: "D", text: "Hydrogen" }
        ],
        correctAnswer: "B",
        marks: 1,
        explanation: "Photolysis of water in the thylakoid membrane splits H₂O into 2H⁺, 2e⁻, and releases Oxygen (O₂)."
      }
    ]
  },
  12: {
    "PHY-12": [
      {
        questionNumber: 1,
        questionText: "Two point charges +3 μC and +4 μC repel each other with a force of 10 N. If a charge of -6 μC is added to each of them, what is the new force?",
        options: [
          { id: "A", text: "5 N (attractive)" },
          { id: "B", text: "5 N (repulsive)" },
          { id: "C", text: "10 N (attractive)" },
          { id: "D", text: "2.5 N (repulsive)" }
        ],
        correctAnswer: "A",
        marks: 1,
        explanation: "Initial charges q1=3, q2=4 (product = +12, F=10N). New charges: q1'= -3, q2'= -2 (product = +6). Since product is halved, magnitude is halved to 5 N."
      },
      {
        questionNumber: 2,
        questionText: "The total electric flux through a closed Gaussian surface enclosing an electric dipole is:",
        options: [
          { id: "A", text: "Zero" },
          { id: "B", text: "q / ε₀" },
          { id: "C", text: "2q / ε₀" },
          { id: "D", text: "Infinity" }
        ],
        correctAnswer: "A",
        marks: 1,
        explanation: "By Gauss Law, Φ = q_net / ε₀. For an electric dipole, q_net = +q + (-q) = 0, so flux is strictly zero."
      }
    ],
    "CS-12": [
      {
        questionNumber: 1,
        questionText: "In Python, which function is used to determine the memory address of an object?",
        options: [
          { id: "A", text: "type()" },
          { id: "B", text: "id()" },
          { id: "C", text: "loc()" },
          { id: "D", text: "mem()" }
        ],
        correctAnswer: "B",
        marks: 1,
        explanation: "The id() function in Python returns the identity/memory address of an object as an integer."
      }
    ]
  }
};

function loadChemistry100() {
  try {
    const filePath = path.join(process.cwd(), "questions", "exams", "CHEMISTRY-12-100-ALL.json");
    if (fs.existsSync(filePath)) {
      const raw = JSON.parse(fs.readFileSync(filePath, "utf8"));
      const set1 = Array.isArray(raw.set1) ? raw.set1 : Object.values(raw.set1 || {});
      const set2 = Array.isArray(raw.set2) ? raw.set2 : Object.values(raw.set2 || {});
      return [...set1, ...set2];
    }
  } catch (err) {
    console.warn("loadChemistry100 error:", err.message);
  }
  return [];
}

export async function GET(request) {
  try {
    const session = await getCurrentSession();
    const { searchParams } = new URL(request.url);
    const previewRollNo = searchParams.get("previewRollNo");

    if (!session && !previewRollNo) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const subjectId = searchParams.get("subjectId");
    const subjectCode = searchParams.get("code");
    const unitParam = searchParams.get("unit"); // e.g. "1" or "all"
    const setParam = searchParams.get("set"); // "1", "2", "all"
    const count = Math.min(100, Math.max(1, parseInt(searchParams.get("count"), 10) || 10));
    const shuffle = searchParams.get("shuffle") !== "false";

    let targetSubject = null;
    if (subjectId) {
      targetSubject = await db.subject.findUnique({
        where: { id: subjectId },
        include: { units: { include: { chapters: true } } },
      });
    } else if (subjectCode) {
      targetSubject = await db.subject.findUnique({
        where: { code: subjectCode },
        include: { units: { include: { chapters: true } } },
      });
    }

    if (!targetSubject) {
      const defaultClass = searchParams.get("prepClass")
        ? parseInt(searchParams.get("prepClass"), 10)
        : (session?.examPrepClass || (previewRollNo && !/1[12]\d{2}/.test(previewRollNo) ? 10 : 12));

      targetSubject = await db.subject.findFirst({
        where: { prepClass: defaultClass },
        include: { units: { include: { chapters: true } } },
      });
    }

    if (!targetSubject) {
      targetSubject = await db.subject.findFirst({
        include: { units: { include: { chapters: true } } },
      });
    }

    if (!targetSubject) {
      return NextResponse.json({ error: "No subject found." }, { status: 404 });
    }

    let questionsList = [];

    // 1. Universal Question Bank Loader for Class 12 (Chemistry, Physics, English)
    const isSetB = setParam === "2" || setParam === "set-b" || setParam === "set2";
    const isSetA = setParam === "1" || setParam === "set-a" || setParam === "set1" || !isSetB;
    const targetCode = (targetSubject.code || "").toUpperCase();

    let bankFileName = null;
    if (targetCode === "CHE-12" || targetSubject.name.toLowerCase().includes("chemistry")) {
      bankFileName = isSetB ? "CHEMISTRY-12-50-SET2.json" : "CHEMISTRY-12-50-SET1.json";
    } else if (targetCode === "PHY-12" || targetSubject.name.toLowerCase().includes("physics")) {
      bankFileName = isSetB ? "PHYSICS-12-50-SET2.json" : "PHYSICS-12-50-SET1.json";
    } else if (targetCode === "ENG-10" || (targetCode.includes("ENG") && targetSubject.prepClass === 10)) {
      bankFileName = isSetB ? "ENGLISH-10-50-SET2.json" : "ENGLISH-10-50-SET1.json";
    } else if (targetCode === "ENG-12" || targetSubject.name.toLowerCase().includes("english")) {
      bankFileName = isSetB ? "ENGLISH-12-50-SET2.json" : "ENGLISH-12-50-SET1.json";
    }

    if (bankFileName) {
      try {
        const filePath = path.join(process.cwd(), "questions", "exams", bankFileName);
        if (fs.existsSync(filePath)) {
          const raw = JSON.parse(fs.readFileSync(filePath, "utf8"));
          const qArr = raw.questions || (isSetB ? raw.set2 : raw.set1) || [];

          let pool = [...qArr];
          if (unitParam && unitParam !== "all") {
            const uNum = parseInt(unitParam, 10);
            pool = pool.filter((q) => q.unit === uNum);
          }

          if (pool.length > 0) {
            let selected = [...pool];
            if (shuffle && count < pool.length && !unitParam && setParam === "all") {
              selected = selected.sort(() => Math.random() - 0.5);
            }
            selected = selected.slice(0, count);

            questionsList = selected.map((q, idx) => {
              // Handle English format vs Bilingual format
              const isBilingual = Boolean(q.options_en || q.question_en || q.question_ta);
              
              const opts = isBilingual ? [
                { id: "A", text: q.options_en?.a || "", textEn: q.options_en?.a || "", textTa: q.options_ta?.a || "" },
                { id: "B", text: q.options_en?.b || "", textEn: q.options_en?.b || "", textTa: q.options_ta?.b || "" },
                { id: "C", text: q.options_en?.c || "", textEn: q.options_en?.c || "", textTa: q.options_ta?.c || "" },
                { id: "D", text: q.options_en?.d || "", textEn: q.options_en?.d || "", textTa: q.options_ta?.d || "" },
              ] : [
                { id: "A", text: q.options?.a || "", textEn: q.options?.a || "", textTa: null },
                { id: "B", text: q.options?.b || "", textEn: q.options?.b || "", textTa: null },
                { id: "C", text: q.options?.c || "", textEn: q.options?.c || "", textTa: null },
                { id: "D", text: q.options?.d || "", textEn: q.options?.d || "", textTa: null },
              ];

              return {
                id: q.id || `${targetCode}_PRACTICE_${idx + 1}`,
                questionNumber: idx + 1,
                unit: q.unit || 1,
                topic: q.topic || q.category || q.prose_lesson || "Standard Board Questions",
                questionText: q.question_en || q.question || "",
                questionTextTa: q.question_ta || null,
                marks: q.marks || 1,
                options: opts,
                correctAnswer: (q.correct_option || q.correct_answer || "a").toUpperCase(),
                answerTextEn: q.answer_en || q.answer || "",
                answerTextTa: q.answer_ta || null,
                explanation: q.explanation_en || q.explanation || "",
                explanationTa: q.explanation_ta || null,
              };
            });
          }
        }
      } catch (bankErr) {
        console.warn(`[practice] Could not load ${bankFileName}:`, bankErr.message);
      }
    }

    // If questionsList is still empty, check DB QuestionBankItem
    if (questionsList.length === 0) {
      const dbItems = await db.questionBankItem.findMany({
        where: { subjectId: targetSubject.id },
        take: count * 2,
      });

      if (dbItems.length > 0) {
        let selected = [...dbItems];
        if (shuffle && count < dbItems.length) {
          selected = selected.sort(() => Math.random() - 0.5);
        }
        selected = selected.slice(0, count);

        questionsList = selected.map((q, idx) => {
          let opts = [];
          try {
            opts = JSON.parse(q.options || "[]");
          } catch {
            opts = [];
          }
          return {
            id: q.id,
            questionNumber: idx + 1,
            topic: q.topic,
            questionText: q.questionText,
            marks: q.marks || 1,
            options: opts,
            correctAnswer: (q.correctAnswer || "A").toUpperCase(),
            explanation: q.explanation,
          };
        });
      }
    }

    // Fallback to ExamQuestion or Curriculum Bank
    if (questionsList.length === 0) {
      const existingExamQuestions = await db.examQuestion.findMany({
        where: { examSchedule: { subjectId: targetSubject.id } },
        take: count * 2,
      });

      if (existingExamQuestions.length >= 2) {
        questionsList = existingExamQuestions.slice(0, count).map((q, idx) => ({
          id: q.id,
          questionNumber: idx + 1,
          questionText: q.questionText,
          marks: q.marks,
          options: JSON.parse(q.options || "[]"),
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
        }));
      } else {
        const classBank = CURRICULUM_PRACTICE_BANK[targetSubject.prepClass] || CURRICULUM_PRACTICE_BANK[10];
        const subjectQuestions = classBank[targetSubject.code] || classBank["MAT-10"] || [];

        questionsList = subjectQuestions.slice(0, count).map((q, idx) => ({
          id: `practice_${targetSubject.code}_${idx + 1}`,
          questionNumber: idx + 1,
          questionText: q.questionText,
          marks: q.marks || 1,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
        }));
      }
    }

    return NextResponse.json({
      success: true,
      subject: {
        id: targetSubject.id,
        code: targetSubject.code,
        name: targetSubject.name,
        prepClass: targetSubject.prepClass,
      },
      count: questionsList.length,
      questions: questionsList,
    });
  } catch (error) {
    console.error("[Practice API Error]", error);
    return NextResponse.json(
      { error: "Failed to generate practice test." },
      { status: 500 }
    );
  }
}
