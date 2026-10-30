import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { createIncident } from "@/lib/incident";
import { resolvePolicyDirective, EXAM_POLICY_CONFIG } from "@/lib/policyPresets";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

/** Universal in-memory PDF text extractor supporting both pdf-parse v1 and v2 */
async function extractPdfText(buffer) {
  try {
    const pdfPkg = await import("pdf-parse");
    // Version 2 (PDFParse class)
    if (pdfPkg.PDFParse) {
      const parser = new pdfPkg.PDFParse({ data: buffer });
      const res = await parser.getText();
      return res?.text || "";
    }
    // Version 1 default export
    if (typeof pdfPkg.default === "function") {
      const res = await pdfPkg.default(buffer);
      return res?.text || "";
    }
    if (typeof pdfPkg === "function") {
      const res = await pdfPkg(buffer);
      return res?.text || "";
    }
  } catch (err) {
    console.error("PDF text extraction error:", err.message);
  }
  return "";
}

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

const ALLOWED_QTYPES = ["MCQ", "SHORT_ANSWER", "NUMERICAL"];
const ALLOWED_DIFFICULTIES = ["EASY", "MEDIUM", "HARD"];
const CURRICULUM_DIR = path.join(process.cwd(), "data", "curriculum");

/**
 * POST /api/admin/generate-questions
 * Calls Gemini API server-side.
 * Supports BOTH application/json AND multipart/form-data (with pdf-parse & multi-file extraction).
 * Also reads pre-saved curriculum files directly from data/curriculum/.
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

  let examId, subjectName, prepClass, totalMarks, questionCount, policyId, optionId,
      policyIndex = 3, customPolicy, customPolicyText, syllabusText = "", samplePaperText = "",
      selectedCurriculumFiles = [], uploadedFilesCount = 0, markBreakdown = null;

  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    try {
      const formData = await request.formData();
      examId = formData.get("examId");
      subjectName = formData.get("subjectName") || formData.get("subject");
      prepClass = parseInt(formData.get("prepClass"), 10) || 10;
      totalMarks = parseInt(formData.get("totalMarks"), 10);
      questionCount = parseInt(formData.get("questionCount"), 10);
      policyId = formData.get("policyId");
      optionId = formData.get("optionId");
      customPolicyText = formData.get("customPolicyText") || formData.get("customPolicy") || "";
      const mbRaw = formData.get("markBreakdown");
      if (mbRaw) {
        try { markBreakdown = JSON.parse(mbRaw); } catch {}
      }

      // Handle server files selection passed as string or JSON
      const serverFilesRaw = formData.get("selectedCurriculumFiles");
      if (serverFilesRaw) {
        try { selectedCurriculumFiles = JSON.parse(serverFilesRaw); } catch { selectedCurriculumFiles = [serverFilesRaw]; }
      }

      // Extract text from uploaded files (in-memory parsing)
      const uploadedFiles = formData.getAll("files");
      uploadedFilesCount = uploadedFiles.length;

      for (const file of uploadedFiles) {
        if (!file || typeof file === "string") continue;
        const name = file.name || "uploaded_document";
        if (name.endsWith(".pdf")) {
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const pdfText = await extractPdfText(buffer);
          syllabusText += `\n\n=== SOURCE DOCUMENT (PDF): ${name} ===\n${pdfText}`;
        } else {
          const text = await file.text();
          syllabusText += `\n\n=== SOURCE DOCUMENT: ${name} ===\n${text}`;
        }
      }
    } catch (formErr) {
      return NextResponse.json({ error: "Failed to parse multipart form data.", message: formErr.message }, { status: 400 });
    }
  } else {
    // JSON Request
    try {
      const body = await request.json();
      examId = body.examId;
      subjectName = body.subjectName || body.subject;
      prepClass = parseInt(body.prepClass, 10) || 10;
      totalMarks = body.totalMarks;
      questionCount = parseInt(body.questionCount, 10);
      policyId = body.policyId;
      optionId = body.optionId;
      policyIndex = body.policyIndex !== undefined ? body.policyIndex : 3;
      customPolicy = body.customPolicy;
      customPolicyText = body.customPolicyText;
      syllabusText = body.syllabusText || "";
      samplePaperText = body.samplePaperText || "";
      selectedCurriculumFiles = Array.isArray(body.selectedCurriculumFiles) ? body.selectedCurriculumFiles : [];
      markBreakdown = body.markBreakdown || null;
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }
  }

  // Pre-Saved Server Repository: read any selected curriculum documents directly from data/curriculum/
  if (Array.isArray(selectedCurriculumFiles) && selectedCurriculumFiles.length > 0) {
    for (const fileName of selectedCurriculumFiles) {
      const safeName = path.basename(fileName);
      const filePath = path.join(CURRICULUM_DIR, safeName);
      if (fs.existsSync(filePath)) {
        try {
          const fileContent = fs.readFileSync(filePath, "utf-8");
          syllabusText += `\n\n=== SERVER REPOSITORY CURRICULUM: ${safeName} ===\n${fileContent}`;
        } catch (readErr) {
          console.warn(`Could not read curriculum file ${safeName}:`, readErr.message);
        }
      }
    }
  }

  if (!examId || !subjectName || !prepClass || !questionCount) {
    return NextResponse.json(
      { error: "examId, subjectName, prepClass, and questionCount are required." },
      { status: 400 }
    );
  }

  // Verify exam exists
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
  
  let markDistributionText = `Marks per question: ${marksPerQ}`;
  if (markBreakdown && typeof markBreakdown === "object") {
    const parts = [];
    if (markBreakdown["1"]) parts.push(`- 1-mark questions (MCQ with 4 options A, B, C, D): exactly ${markBreakdown["1"]} questions (marks: 1 each)`);
    if (markBreakdown["2"]) parts.push(`- 2-mark questions (Very Short Answer): exactly ${markBreakdown["2"]} questions (marks: 2 each)`);
    if (markBreakdown["3"]) parts.push(`- 3-mark questions (Short Answer): exactly ${markBreakdown["3"]} questions (marks: 3 each)`);
    if (markBreakdown["5"]) parts.push(`- 5-mark questions (Long/Essay Answer): exactly ${markBreakdown["5"]} questions (marks: 5 each)`);
    if (parts.length > 0) {
      markDistributionText = `Strict Question Mark Distribution:\n${parts.join("\n")}`;
    }
  }

  const prompt = `You are the Chief Exam Setter for Class ${prepClass} ${subjectName} under the Tamil Nadu Samacheer Kalvi curriculum.

Target Total Marks: ${totalMarks ?? questionCount * marksPerQ}
Target Question Count: ${questionCount}
${markDistributionText}
Policy Category: ${EXAM_POLICY_CONFIG[effectivePolicyId]?.name || "Standard Examination Policy"}
Exact Policy Directive: ${policyText}

${syllabusText ? `Reference Syllabus & Curriculum Materials:\n${syllabusText.slice(0, 350000)}\n` : ""}
${samplePaperText ? `Sample Paper (style reference only, do not copy):\n${samplePaperText.slice(0, 50000)}\n` : ""}

Instructions:
1. Ensure the sum of marks of all questions equals exactly ${totalMarks ?? questionCount * marksPerQ}.
2. Ensure every MCQ has exactly 4 options with single distinct keys: A, B, C, D. For non-MCQ questions (2-mark, 3-mark, 5-mark), set "options": [] and "correctAnswer": null.
3. Every question must include a valid 'syllabusRef' citing the unit/chapter.
4. Return ONLY a valid JSON array (no markdown code fences, no extra text). Each element must have:
{
  "questionNumber": <integer starting at 1>,
  "questionText": "<question>",
  "qType": "<MCQ|SHORT_ANSWER|NUMERICAL>",
  "difficulty": "<EASY|MEDIUM|HARD>",
  "syllabusRef": "<Unit X, Chapter Y: topic>",
  "marks": <marks as per required distribution>,
  "options": [{"id":"A","text":"..."},{"id":"B","text":"..."},{"id":"C","text":"..."},{"id":"D","text":"..."}],
  "correctAnswer": "<A|B|C|D>",
  "explanation": "<brief explanation>"
}
For non-MCQ types, set options to [] and correctAnswer to null.`;

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
  let parsed;
  let validationErrors = [];

  try {
    rawText = await callGemini(prompt);
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
    status: "success",
    message: `${created.length} question(s) generated and added to the review queue. COE must approve each question before publishing.`,
    count: created.length,
    processedFilesCount: uploadedFilesCount,
    serverCurriculumFilesCount: selectedCurriculumFiles.length,
    reviewStatus: "needs_review",
    questions: created,
  });
}
