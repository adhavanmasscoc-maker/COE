import fs from "fs";
import path from "path";
import crypto from "crypto";
import { createClient } from "@libsql/client/web";

import { mat10NewQuestions } from "../scratch/questions/mat10.mjs";
import { sci10NewQuestions } from "../scratch/questions/sci10.mjs";
import { soc10NewQuestions } from "../scratch/questions/soc10.mjs";
import { mat12NewQuestions } from "../scratch/questions/mat12.mjs";
import { phy12NewQuestions } from "../scratch/questions/phy12.mjs";
import { che12NewQuestions } from "../scratch/questions/che12.mjs";

const env = fs.readFileSync(".env", "utf-8");
const dbUrl = env.match(/TURSO_DATABASE_URL=['"]?(.*?)['"]?$/m)[1].trim();
const token = env.match(/TURSO_AUTH_TOKEN=['"]?(.*?)['"]?$/m)[1].trim();
const client = createClient({ url: dbUrl, authToken: token });

function cuid() {
  return "cmw" + crypto.randomBytes(10).toString("hex").slice(0, 21);
}

const SUBJECT_CONFIGS = [
  {
    code: "MAT-10",
    name: "Mathematics",
    nameTa: "கணிதம்",
    standard: 10,
    dayFile: "DAY1-10-MATHEMATICS-25.json",
    masterFile: "MATHEMATICS-10-50-SET1.json",
    masterFile2: "MATHEMATICS-10-50-SET2.json",
    newQuestions: mat10NewQuestions,
  },
  {
    code: "SCI-10",
    name: "Science",
    nameTa: "அறிவியல்",
    standard: 10,
    dayFile: "DAY2-10-SCIENCE-25.json",
    masterFile: "SCIENCE-10-50-SET1.json",
    masterFile2: "SCIENCE-10-50-SET2.json",
    newQuestions: sci10NewQuestions,
  },
  {
    code: "SOC-10",
    name: "Social Science",
    nameTa: "சமூக அறிவியல்",
    standard: 10,
    dayFile: "DAY3-10-SOCIALSCIENCE-25.json",
    masterFile: "SOCIAL_SCIENCE-10-50-SET1.json",
    masterFile2: "SOCIAL_SCIENCE-10-50-SET2.json",
    newQuestions: soc10NewQuestions,
  },
  {
    code: "MAT-12",
    name: "Mathematics",
    nameTa: "கணிதம்",
    standard: 12,
    dayFile: "DAY1-12-MATHEMATICS-25.json",
    masterFile: "MATHEMATICS-12-50-SET1.json",
    masterFile2: "MATHEMATICS-12-50-SET2.json",
    newQuestions: mat12NewQuestions,
  },
  {
    code: "PHY-12",
    name: "Physics",
    nameTa: "இயற்பியல்",
    standard: 12,
    dayFile: "DAY2-12-PHYSICS-25.json",
    masterFile: "PHYSICS-12-50-SET1.json",
    masterFile2: "PHYSICS-12-50-SET2.json",
    newQuestions: phy12NewQuestions,
  },
  {
    code: "CHE-12",
    name: "Chemistry",
    nameTa: "வேதியியல்",
    standard: 12,
    dayFile: "DAY3-12-CHEMISTRY-25.json",
    masterFile: "CHEMISTRY-12-50-SET1.json",
    masterFile2: "CHEMISTRY-12-50-SET2.json",
    newQuestions: che12NewQuestions,
  },
];

function normalizeQuestion(rawQ, index, subjectCode) {
  const globalNum = index + 1;
  const idStr = `${subjectCode.replace("-", "")}-Q${String(globalNum).padStart(2, "0")}`;

  const qEn = rawQ.question_en || rawQ.question || "";
  const qTa = rawQ.question_ta || rawQ.questionTa || rawQ.question_ta_text || qEn;

  // Options normalization
  let optsEn = {};
  let optsTa = {};
  let optsArray = [];

  if (Array.isArray(rawQ.options)) {
    const letters = ["A", "B", "C", "D"];
    rawQ.options.forEach((opt, oIdx) => {
      const letter = letters[oIdx] || String.fromCharCode(65 + oIdx);
      const lKey = letter.toLowerCase();
      let textEn = "";
      let textTa = "";

      if (typeof opt === "string") {
        textEn = opt;
        textTa = (rawQ.optionsTa && rawQ.optionsTa[oIdx]) || (rawQ.options_ta && rawQ.options_ta[lKey]) || opt;
      } else if (opt && typeof opt === "object") {
        textEn = opt.textEn || opt.text || "";
        textTa = opt.textTa || (rawQ.optionsTa && rawQ.optionsTa[oIdx]) || textEn;
      }

      optsEn[lKey] = textEn;
      optsTa[lKey] = textTa;
      optsArray.push({
        id: letter,
        text: textEn,
        textEn: textEn,
        textTa: textTa,
      });
    });
  } else if (rawQ.options_en && typeof rawQ.options_en === "object") {
    ["a", "b", "c", "d"].forEach((k, oIdx) => {
      const letter = k.toUpperCase();
      const textEn = rawQ.options_en[k] || "";
      const textTa = (rawQ.options_ta && rawQ.options_ta[k]) || textEn;
      optsEn[k] = textEn;
      optsTa[k] = textTa;
      optsArray.push({
        id: letter,
        text: textEn,
        textEn: textEn,
        textTa: textTa,
      });
    });
  }

  // Answer resolution
  let correctOpt = "a";
  let ansEn = "";
  let ansTa = "";

  if (rawQ.correct_option) {
    correctOpt = String(rawQ.correct_option).toLowerCase();
  } else if (rawQ.correctAnswer) {
    correctOpt = String(rawQ.correctAnswer).toLowerCase();
  } else if (rawQ.answer) {
    // Check if answer matches option text
    const foundIdx = optsArray.findIndex(
      (o) => o.text.trim().toLowerCase() === String(rawQ.answer).trim().toLowerCase()
    );
    if (foundIdx !== -1) {
      correctOpt = ["a", "b", "c", "d"][foundIdx];
    } else if (["a", "b", "c", "d"].includes(String(rawQ.answer).trim().toLowerCase())) {
      correctOpt = String(rawQ.answer).trim().toLowerCase();
    }
  }

  const ansObj = optsArray.find((o) => o.id.toLowerCase() === correctOpt) || optsArray[0];
  ansEn = rawQ.answer_en || rawQ.answer || ansObj.textEn;
  ansTa = rawQ.answer_ta || rawQ.answerTa || ansObj.textTa;

  // Explanation normalization
  let expEn = "";
  let expTa = "";
  let combinedExp = "";

  if (rawQ.explanation) {
    combinedExp = rawQ.explanation;
    if (combinedExp.includes(" / ")) {
      const parts = combinedExp.split(" / ");
      expEn = parts[0].trim();
      expTa = parts.slice(1).join(" / ").trim();
    } else {
      expEn = combinedExp;
      expTa = rawQ.explanation_ta || rawQ.explanationTa || combinedExp;
    }
  } else if (rawQ.explanation_en) {
    expEn = rawQ.explanation_en;
    expTa = rawQ.explanation_ta || rawQ.explanationTa || expEn;
    combinedExp = `${expEn} / ${expTa}`;
  }

  const chapterEn = rawQ.chapter || rawQ.topic || "Core Syllabus";
  const chapterTa = rawQ.chapterTa || rawQ.topicTa || rawQ.chapter || "அடிப்படை பாடத்திட்டம்";
  const unitNum = rawQ.unit || (globalNum <= 15 ? 1 : globalNum <= 30 ? 2 : 3);

  return {
    id: idStr,
    globalNumber: globalNum,
    unit: unitNum,
    topic: `${chapterEn} / ${chapterTa}`,
    chapter: chapterEn,
    chapterTa: chapterTa,
    question: qEn,
    question_en: qEn,
    question_ta: qTa,
    questionTa: qTa,
    options: optsArray,
    options_en: optsEn,
    options_ta: optsTa,
    correct_option: correctOpt,
    correctAnswer: correctOpt.toUpperCase(),
    answer: ansEn,
    answer_en: ansEn,
    answer_ta: ansTa,
    explanation: combinedExp || `${expEn} / ${expTa}`,
    explanation_en: expEn,
    explanation_ta: expTa,
    explanationTa: expTa,
  };
}

async function assembleAndSeed() {
  console.log("=== STARTING 50-QUESTION BILINGUAL MASTER BUILD ===");

  const examsDir = path.join(process.cwd(), "questions", "exams");

  for (const cfg of SUBJECT_CONFIGS) {
    console.log(`\nProcessing ${cfg.code} (${cfg.name} - Class ${cfg.standard})...`);

    // 1. Read existing 25 questions
    const dayFilePath = path.join(examsDir, cfg.dayFile);
    if (!fs.existsSync(dayFilePath)) {
      console.error(`Missing day file: ${dayFilePath}`);
      continue;
    }

    const dayData = JSON.parse(fs.readFileSync(dayFilePath, "utf8"));
    const first25 = Array.isArray(dayData.questions) ? dayData.questions : [];
    console.log(`- Loaded ${first25.length} initial questions from ${cfg.dayFile}`);

    // 2. Combine with new 25 questions
    const next25 = cfg.newQuestions;
    console.log(`- Loaded ${next25.length} new questions from scratch/questions`);

    const full50 = [];
    first25.forEach((q, idx) => {
      full50.push(normalizeQuestion(q, idx, cfg.code));
    });
    next25.forEach((q, idx) => {
      full50.push(normalizeQuestion(q, idx + 25, cfg.code));
    });

    console.log(`- Assembled ${full50.length} normalized 50-question master dataset`);

    // 3. Write Master File (SET1)
    const masterObj1 = {
      subject: cfg.name.toUpperCase(),
      subjectCode: cfg.code,
      standard: cfg.standard,
      total_questions: 50,
      set_number: "SET1",
      board: cfg.standard === 10
        ? "Tamil Nadu State Board SSLC Examination"
        : "Tamil Nadu State Board Higher Secondary Examination",
      academic_year: "2026-2027",
      questions: full50,
      set1: full50,
    };

    const outPath1 = path.join(examsDir, cfg.masterFile);
    fs.writeFileSync(outPath1, JSON.stringify(masterObj1, null, 2), "utf8");
    console.log(`- Saved SET1: ${outPath1} (${fs.statSync(outPath1).size} bytes)`);

    // Write SET2 duplicate (so Practice B works identically)
    const masterObj2 = {
      ...masterObj1,
      set_number: "SET2",
      set2: full50,
    };
    const outPath2 = path.join(examsDir, cfg.masterFile2);
    fs.writeFileSync(outPath2, JSON.stringify(masterObj2, null, 2), "utf8");
    console.log(`- Saved SET2: ${outPath2} (${fs.statSync(outPath2).size} bytes)`);

    // 4. Update the DB QuestionBankItem table for this subject
    const subjectRow = await client.execute({
      sql: "SELECT id FROM Subject WHERE code = ? LIMIT 1",
      args: [cfg.code],
    });

    if (subjectRow.rows.length > 0) {
      const subjectId = subjectRow.rows[0].id;
      // Delete old QuestionBankItems
      await client.execute({
        sql: "DELETE FROM QuestionBankItem WHERE subjectId = ?",
        args: [subjectId],
      });

      console.log(`- Seeding 50 QuestionBankItems into Turso DB for subject ${cfg.code}...`);
      for (const q of full50) {
        const qId = cuid();
        const optsJson = JSON.stringify(q.options);
        await client.execute({
          sql: `INSERT INTO QuestionBankItem 
                (id, subjectId, questionNumber, questionText, options, correctAnswer, marks, explanation, difficulty, topic) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            qId,
            subjectId,
            q.globalNumber,
            q.question_en,
            optsJson,
            q.correctAnswer,
            1,
            q.explanation,
            "MEDIUM",
            q.topic,
          ],
        });
      }
      console.log(`- Successfully seeded 50 QuestionBankItems for ${cfg.code}`);
    } else {
      console.warn(`- Subject ${cfg.code} not found in DB!`);
    }
  }

  console.log("\n=== 50-QUESTION ASSEMBLE AND SEED COMPLETE ===");
}

assembleAndSeed().catch((err) => {
  console.error("Fatal build error:", err);
  process.exit(1);
});

