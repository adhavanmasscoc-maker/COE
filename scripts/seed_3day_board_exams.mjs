import { createClient } from "@libsql/client/web";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const env = fs.readFileSync(".env", "utf-8");
const dbUrl = env.match(/TURSO_DATABASE_URL=['"]?(.*?)['"]?$/m)[1].trim();
const token = env.match(/TURSO_AUTH_TOKEN=['"]?(.*?)['"]?$/m)[1].trim();
const client = createClient({ url: dbUrl, authToken: token });

function cuid() {
  return "cmw" + crypto.randomBytes(10).toString("hex").slice(0, 21);
}

const EXAM_FILES = [
  "DAY1-10-MATHEMATICS-25.json",
  "DAY2-10-SCIENCE-25.json",
  "DAY3-10-SOCIALSCIENCE-25.json",
  "DAY1-12-MATHEMATICS-25.json",
  "DAY2-12-PHYSICS-25.json",
  "DAY3-12-CHEMISTRY-25.json",
];

async function seed() {
  console.log("=== SEEDING OFFICIAL 3-DAY BOARD EXAMS (NOV 3, 4, 5 AT 6:00 PM IST) ===");

  // 1. Fetch all subjects
  const subRes = await client.execute("SELECT id, code, name, prepClass FROM Subject");
  const subjectMap = new Map();
  for (const s of subRes.rows) {
    subjectMap.set(`${s.code}_${s.prepClass}`, s);
  }

  const translationsToAdd = {};
  const optionsToAdd = {};

  for (const file of EXAM_FILES) {
    const filePath = path.join(process.cwd(), "questions", "exams", file);
    if (!fs.existsSync(filePath)) {
      console.warn("File not found:", filePath);
      continue;
    }

    const examData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const prepClass = examData.standard.startsWith("10") ? 10 : 12;
    const subKey = `${examData.subjectCode}_${prepClass}`;
    const subject = subjectMap.get(subKey);

    if (!subject) {
      console.error(`Subject not found for ${subKey}!`);
      continue;
    }

    console.log(`\nProcessing Day ${examData.day} (${examData.subject} Std ${prepClass}) - Date: ${examData.examDate}`);

    // Check if exam schedule already exists
    const existingExamRes = await client.execute({
      sql: `SELECT id FROM ExamSchedule WHERE subjectId = ? AND prepClass = ? AND examDate = ?`,
      args: [subject.id, prepClass, examData.examDate]
    });

    let examId;
    const nowIso = new Date().toISOString();
    const phaseTimestamps = JSON.stringify({
      0: nowIso,
      1: nowIso,
      2: nowIso,
      3: nowIso,
      4: nowIso
    });

    if (existingExamRes.rows.length > 0) {
      examId = existingExamRes.rows[0].id;
      console.log(`Updating existing ExamSchedule ID: ${examId}`);
      await client.execute({
        sql: `UPDATE ExamSchedule SET 
                durationMinutes = ?, 
                totalMarks = ?, 
                requiredQuestions = ?, 
                instructions = ?, 
                status = 'PUBLISHED', 
                phase = 4,
                phaseTimestamps = ?
              WHERE id = ?`,
        args: [
          examData.duration_minutes,
          examData.total_marks,
          examData.questions.length,
          `Tamil Nadu Samacheer Kalvi Official Examination. Day ${examData.day} - ${examData.subject}. 25 MCQs, 45 Minutes. Bilingual Tamil and English supported.`,
          phaseTimestamps,
          examId
        ]
      });
    } else {
      examId = cuid();
      console.log(`Creating new ExamSchedule ID: ${examId}`);
      await client.execute({
        sql: `INSERT INTO ExamSchedule (
                id, subjectId, prepClass, examDate, durationMinutes, totalMarks, 
                requiredQuestions, instructions, examLanguage, phase, phaseTimestamps, 
                status, createdAt
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'en', 4, ?, 'PUBLISHED', ?)`,
        args: [
          examId,
          subject.id,
          prepClass,
          examData.examDate,
          examData.duration_minutes,
          examData.total_marks,
          examData.questions.length,
          `Tamil Nadu Samacheer Kalvi Official Examination. Day ${examData.day} - ${examData.subject}. 25 MCQs, 45 Minutes. Bilingual Tamil and English supported.`,
          phaseTimestamps,
          nowIso
        ]
      });
    }

    // Delete existing questions for this schedule to avoid duplicates
    await client.execute({
      sql: `DELETE FROM ExamQuestion WHERE examScheduleId = ?`,
      args: [examId]
    });

    // Insert 25 questions
    for (const q of examData.questions) {
      const qId = cuid();

      // Collect translation
      if (q.question && q.questionTa) {
        translationsToAdd[q.question.trim()] = q.questionTa.trim();
      }

      // Map options
      const optList = q.options.map((optText, idx) => {
        const letter = String.fromCharCode(65 + idx);
        const optTa = q.optionsTa?.[idx] || optText;
        if (optText && optTa && optText !== optTa) {
          optionsToAdd[optText.trim()] = optTa.trim();
        }
        return {
          id: letter,
          label: letter,
          text: optText,
          text_en: optText,
          text_ta: optTa,
          textEn: optText,
          textTa: optTa
        };
      });

      // Find correct answer letter (A, B, C, D)
      let correctLetter = "A";
      const ansLower = q.answer.trim().toLowerCase();
      const matchIdx = q.options.findIndex((o) => o.trim().toLowerCase() === ansLower);
      if (matchIdx !== -1) {
        correctLetter = String.fromCharCode(65 + matchIdx);
      } else if (["A", "B", "C", "D"].includes(q.answer.trim().toUpperCase())) {
        correctLetter = q.answer.trim().toUpperCase();
      }

      await client.execute({
        sql: `INSERT INTO ExamQuestion (
                id, examScheduleId, questionNumber, questionText, marks, qType, 
                difficulty, syllabusRef, options, correctAnswer, explanation, 
                reviewStatus, source, createdAt
              ) VALUES (?, ?, ?, ?, 1, 'MCQ', 'MEDIUM', ?, ?, ?, ?, 'approved', 'manual', ?)`,
        args: [
          qId,
          examId,
          q.id,
          q.question,
          q.chapter || "Unit Exam",
          JSON.stringify(optList),
          correctLetter,
          q.explanation || "",
          nowIso
        ]
      });
    }

    console.log(`✓ Seeded ${examData.questions.length} questions for ${examData.subjectCode} Day ${examData.day}`);
  }

  // Update questionTranslations.js dictionary
  console.log("\nUpdating questionTranslations.js with new Tamil mappings...");
  const transPath = path.join(process.cwd(), "src", "lib", "questionTranslations.js");
  let transFileContent = fs.readFileSync(transPath, "utf-8");

  // Read current entries in QUESTION_TRANSLATION_MAP
  let addedCount = 0;
  let newEntries = "";
  for (const [en, ta] of Object.entries(translationsToAdd)) {
    if (!transFileContent.includes(JSON.stringify(en))) {
      newEntries += `  ${JSON.stringify(en)}: ${JSON.stringify(ta)},\n`;
      addedCount++;
    }
  }

  if (newEntries.length > 0) {
    transFileContent = transFileContent.replace(
      "export const QUESTION_TRANSLATION_MAP = {",
      "export const QUESTION_TRANSLATION_MAP = {\n" + newEntries
    );
    fs.writeFileSync(transPath, transFileContent, "utf-8");
    console.log(`✓ Added ${addedCount} new questions to QUESTION_TRANSLATION_MAP`);
  } else {
    console.log("✓ QUESTION_TRANSLATION_MAP is already up to date.");
  }

  console.log("\n🎉 ALL 3-DAY BOARD EXAMINATIONS SUCCESSFULLY SEEDED AND PUBLISHED!");
}

seed().catch(console.error);
