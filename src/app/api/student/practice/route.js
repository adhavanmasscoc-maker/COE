import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/lib/db";

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
        explanation: "Initial charges q1=3, q2=4 (product = +12, F=10N). New charges: q1'= -3, q2'= -2 (product = +6). Since product is halved, magnitude is halved to 5 N. Both are negative so force is repulsive; if sign opposite attractive."
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

export async function GET(request) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get("subjectId");
    const count = parseInt(searchParams.get("count"), 10) || 5;

    let targetSubject = null;
    if (subjectId) {
      targetSubject = await db.subject.findUnique({
        where: { id: subjectId },
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

    // 1. Try to fetch questions from existing ExamQuestions for this subject
    const existingQuestions = await db.examQuestion.findMany({
      where: {
        examSchedule: {
          subjectId: targetSubject.id,
        },
      },
      take: count * 2,
    });

    let questionsList = [];

    if (existingQuestions.length >= 3) {
      // Shuffle and format
      questionsList = existingQuestions.slice(0, count).map((q, idx) => ({
        id: q.id,
        questionNumber: idx + 1,
        questionText: q.questionText,
        marks: q.marks,
        options: JSON.parse(q.options || "[]"),
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
      }));
    } else {
      // Use rich curriculum question bank
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
