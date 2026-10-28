import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { createIncident } from "@/lib/incident";

export const dynamic = "force-dynamic";

/** Shared grade table — single source of truth */
export const GRADE_TABLE = [
  { min: 90, grade: "A+", label: "Outstanding" },
  { min: 80, grade: "A",  label: "Excellent" },
  { min: 70, grade: "B+", label: "Very Good" },
  { min: 60, grade: "B",  label: "Good" },
  { min: 50, grade: "C",  label: "Satisfactory" },
  { min: 35, grade: "D",  label: "Pass" },
  { min: 0,  grade: "E",  label: "Needs Improvement" },
];

export function calculateGrade(percentage) {
  for (const entry of GRADE_TABLE) {
    if (percentage >= entry.min) return entry;
  }
  return GRADE_TABLE[GRADE_TABLE.length - 1];
}

import { resolvePolicyDirective, EXAM_POLICY_CONFIG } from "@/lib/policyPresets";

const ALLOWED_QTYPES = ["MCQ", "SHORT_ANSWER", "NUMERICAL"];
const ALLOWED_DIFFICULTIES = ["EASY", "MEDIUM", "HARD"];

/**
 * POST /api/admin/generate-questions
 * Calls Gemini API server-side. Validates returned JSON against schema.
 * Generated questions start as "needs_review" — never auto-published.
 */
export async function POST(request) {
  const session = await getCurrentSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "COE Admin authorization required." }, { status: 403 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not configured on the server. Add it to .env.local." },
      { status: 503 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const {
    examId,
    subjectName,
    prepClass,
    totalMarks,
    questionCount,
    policyId,
    optionId,
    policyIndex = 3,
    customPolicy,
    customPolicyText,
    syllabusText,
    samplePaperText,
  } = body;

  if (!examId || !subjectName || !prepClass || !questionCount) {
    return NextResponse.json(
      { error: "examId, subjectName, prepClass, and questionCount are required." },
      { status: 400 }
    );
  }

  // Verify exam exists and belongs to admin
  const exam = await db.examSchedule.findUnique({
    where: { id: examId },
    include: { subject: { select: { name: true } } },
  });
  if (!exam) {
    return NextResponse.json({ error: "Exam not found." }, { status: 404 });
  }

  // Resolve policy directive using the 50 presets or fallback
  const effectivePolicyId = policyId || (typeof policyIndex === "number" ? policyIndex + 1 : 1);
  const effectiveOptionId = optionId || (EXAM_POLICY_CONFIG[effectivePolicyId]?.options[0]?.id || "1A");
  const policyText = resolvePolicyDirective(effectivePolicyId, effectiveOptionId, customPolicyText || customPolicy || "");

  // Build prompt from fixed template
  const marksPerQ = totalMarks ? Math.round(totalMarks / questionCount) : 2;
  const prompt = `You are the Chief Exam Setter for ${prepClass} ${subjectName} under the Tamil Nadu Samacheer Kalvi curriculum.

Subject: ${subjectName}
Class: ${prepClass}
Total Marks: ${totalMarks ?? questionCount * marksPerQ}
Number of questions: ${questionCount}
Marks per question: ${marksPerQ}

Policy Category: ${EXAM_POLICY_CONFIG[effectivePolicyId]?.name || "Standard Examination Policy"}
Exact Policy Directive: ${policyText}

${syllabusText ? `Syllabus (use as source):\n${syllabusText.slice(0, 6000)}\n` : ""}
${samplePaperText ? `Sample Paper (style reference only, do not copy):\n${samplePaperText.slice(0, 3000)}\n` : ""}

Return ONLY a valid JSON array (no markdown, no explanation). Each element must have:
{
  "questionNumber": <integer starting at 1>,
  "questionText": "<question>",
  "qType": "<MCQ|SHORT_ANSWER|NUMERICAL>",
  "difficulty": "<EASY|MEDIUM|HARD>",
  "syllabusRef": "<Unit X, Chapter Y: topic>",
  "marks": ${marksPerQ},
  "options": [{"id":"A","text":"..."},{"id":"B","text":"..."},{"id":"C","text":"..."},{"id":"D","text":"..."}],
  "correctAnswer": "<A|B|C|D>",
  "explanation": "<brief explanation>"
}
For non-MCQ types, set options to [] and correctAnswer to null.
Marks must sum to ${totalMarks ?? questionCount * marksPerQ}.`;

  // Call Gemini API
  async function callGemini(promptText) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }],
        generationConfig: { temperature: 0.4, maxOutputTokens: 8192 },
      }),
    });
    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error(`Gemini API HTTP ${resp.status}: ${errText.slice(0, 300)}`);
    }
    const json = await resp.json();
    const raw = json.candidates?.[0]?.content?.parts?.[0]?.text || "";
    // Strip code fences
    return raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  }

  let rawText;
  let usageMetadata = null;
  let parsed;
  let validationErrors = [];

  try {
    rawText = await callGemini(prompt);
    usageMetadata = null; // Gemini 1.5 flash doesn't always return token counts in this format
  } catch (err) {
    const incidentId = await createIncident({
      route: "/api/admin/generate-questions",
      userId: session.userId,
      role: "ADMIN",
      step: "gemini_call",
      message: err.message,
    });
    return NextResponse.json(
      { error: "Gemini API call failed. Check server logs.", incidentId },
      { status: 502 }
    );
  }

  // Parse and validate JSON
  function validateQuestions(questions) {
    const errors = [];
    if (!Array.isArray(questions)) {
      errors.push("Response is not a JSON array.");
      return errors;
    }
    let marksSum = 0;
    questions.forEach((q, i) => {
      const label = `Q${i + 1}`;
      if (!q.questionText) errors.push(`${label}: missing questionText.`);
      if (!ALLOWED_QTYPES.includes(q.qType)) errors.push(`${label}: invalid qType "${q.qType}".`);
      if (!ALLOWED_DIFFICULTIES.includes(q.difficulty)) errors.push(`${label}: invalid difficulty "${q.difficulty}".`);
      if (!q.syllabusRef) errors.push(`${label}: missing syllabusRef.`);
      if (q.qType === "MCQ") {
        if (!Array.isArray(q.options) || q.options.length !== 4) {
          errors.push(`${label}: MCQ must have exactly 4 options.`);
        }
        if (!["A", "B", "C", "D"].includes(q.correctAnswer)) {
          errors.push(`${label}: MCQ correctAnswer must be A/B/C/D.`);
        }
      }
      marksSum += q.marks || 0;
    });
    const expected = totalMarks ?? questionCount * marksPerQ;
    if (Math.abs(marksSum - expected) > 0.5) {
      errors.push(`Marks sum (${marksSum}) does not equal expected (${expected}).`);
    }
    return errors;
  }

  try {
    parsed = JSON.parse(rawText);
    validationErrors = validateQuestions(parsed);
  } catch (parseErr) {
    validationErrors = [`JSON parse failed: ${parseErr.message}`];
  }

  // Retry once if validation failed
  if (validationErrors.length > 0) {
    const retryPrompt = `${prompt}\n\nPrevious attempt had these errors:\n${validationErrors.join("\n")}\nFix all errors and return only the corrected JSON array.`;
    try {
      rawText = await callGemini(retryPrompt);
      parsed = JSON.parse(rawText);
      validationErrors = validateQuestions(parsed);
    } catch (retryErr) {
      validationErrors.push(`Retry also failed: ${retryErr.message}`);
    }
  }

  if (validationErrors.length > 0) {
    // Send to review queue — record incident
    const incidentId = await createIncident({
      route: "/api/admin/generate-questions",
      userId: session.userId,
      role: "ADMIN",
      step: "validation",
      message: `Gemini output failed validation after retry: ${validationErrors.slice(0, 3).join("; ")}`,
    });
    return NextResponse.json(
      {
        error: "Generated questions failed validation. They have been flagged for COE review.",
        validationErrors,
        incidentId,
        rawOutput: process.env.NODE_ENV !== "production" ? rawText : undefined,
      },
      { status: 422 }
    );
  }

  // Save questions with reviewStatus = "needs_review"
  const existingCount = await db.examQuestion.count({ where: { examScheduleId: examId } });

  const created = [];
  for (const [i, q] of parsed.entries()) {
    const qNum = existingCount + i + 1;
    const opts = q.qType === "MCQ" && Array.isArray(q.options) ? q.options : [];
    const saved = await db.examQuestion.create({
      data: {
        examScheduleId: examId,
        questionNumber: qNum,
        questionText: q.questionText,
        qType: q.qType || "MCQ",
        difficulty: q.difficulty || "MEDIUM",
        syllabusRef: q.syllabusRef || null,
        marks: q.marks || marksPerQ,
        options: JSON.stringify(opts),
        correctAnswer: q.correctAnswer || null,
        explanation: q.explanation || null,
        reviewStatus: "needs_review",
        source: "gemini",
      },
    });
    created.push(saved);
  }

  // Advance phase to 1 if still at 0
  if (exam.phase < 1) {
    const ts = (() => { try { return JSON.parse(exam.phaseTimestamps || "{}"); } catch { return {}; } })();
    ts[1] = new Date().toISOString();
    await db.examSchedule.update({
      where: { id: examId },
      data: { phase: 1, phaseTimestamps: JSON.stringify(ts) },
    });
  }

  return NextResponse.json({
    success: true,
    message: `${created.length} question(s) generated and added to the review queue. COE must approve each question before publishing.`,
    count: created.length,
    reviewStatus: "needs_review",
  });
}
