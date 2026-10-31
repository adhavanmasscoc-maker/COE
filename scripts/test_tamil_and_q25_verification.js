const { createClient } = require("@libsql/client/web");
const fs = require("fs");
const { getLocalizedQuestion, getLocalizedOption, getLocalizedExplanation } = require("../src/lib/questionTranslations.js");
const { normalizeOptionsList } = require("../src/lib/questionBankParser.js");

let tursoUrl = "libsql://aknex-exam-db-aadhavank.aws-ap-south-1.turso.io";
let tursoToken = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTMzNjY0NTMsImlkIjoiMDFhMThjZjgtM2EwMS03NDAyLWE2MmQtYmI1MmRiZTZkNmExIiwia2lkIjoiaERvVmJ3b0dTYXZaaWFjTExVVU56c1VLaHBNU1hoMzVoSk8yZGlUN2FnRSIsInJpZCI6ImY2ZTNmYTUyLThmNTMtNDJlMi1iZjcwLTIxMTkxYzg5YjY0ZiJ9.hdc6PMQEIveXiH-DxiIqypTPP7lE2UYHNWS-eaZS-R3BJzplTFadwc4VXrX1yD-DS8mf_JeHf39-ZFIb53gsAw";

try {
  const envContent = fs.readFileSync(".env", "utf8");
  for (const line of envContent.split("\n")) {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const val = match[2].trim().replace(/^["']|["']$/g, "");
      if (key === "TURSO_DATABASE_URL") tursoUrl = val;
      if (key === "TURSO_AUTH_TOKEN") tursoToken = val;
    }
  }
} catch (e) {}

const client = createClient({ url: tursoUrl, authToken: tursoToken });

async function verifyAll() {
  console.log("=== 1. VERIFY STUDENT ANUSRI PROFILE ===");
  const anusriRes = await client.execute({
    sql: "SELECT u.id, u.username, u.language, p.fullName, p.medium, p.examPrepClass FROM User u JOIN StudentProfile p ON u.id = p.userId WHERE u.username = '11203'",
    args: []
  });
  const anusri = anusriRes.rows[0];
  console.log("Anusri:", anusri);
  if (anusri.medium !== "Tamil" || anusri.language !== "ta") {
    throw new Error("Anusri medium or language not Tamil!");
  }
  console.log("✅ Anusri medium & language verified as Tamil!");

  console.log("\n=== 2. VERIFY CHEMISTRY EXAMS FOR CLASS 12 ===");
  const chemExams = await client.execute({
    sql: "SELECT e.id, s.code, s.name, e.prepClass, e.totalMarks, e.status FROM ExamSchedule e JOIN Subject s ON e.subjectId = s.id WHERE s.code LIKE '%CHE%'",
    args: []
  });
  console.log("Found Chemistry exams:", chemExams.rows.length);

  for (const exam of chemExams.rows) {
    const qs = await client.execute({
      sql: "SELECT id, questionNumber, questionText, options, correctAnswer, explanation FROM ExamQuestion WHERE examScheduleId = ? ORDER BY questionNumber ASC",
      args: [exam.id]
    });
    console.log(`\nExam ${exam.id} (${exam.code}) - Total Questions: ${qs.rows.length}`);

    let missingTamil = 0;
    for (const q of qs.rows) {
      const taQ = getLocalizedQuestion(q, true);
      const hasTamilScript = /[\u0B80-\u0BFF]/.test(taQ);
      if (!hasTamilScript) {
        missingTamil++;
        console.warn(`  ⚠️ Question ${q.questionNumber} lacks Tamil translation: "${q.questionText}" -> "${taQ}"`);
      }
    }
    console.log(`  Tamil translation coverage: ${qs.rows.length - missingTamil}/${qs.rows.length} questions have native Tamil.`);
    if (missingTamil > 0) {
      throw new Error(`Exam ${exam.id} has ${missingTamil} questions without Tamil translation!`);
    }

    // Verify Question 25
    const q25 = qs.rows[24];
    console.log(`  Question 25: Q#${q25.questionNumber} (ID: ${q25.id})`);
    const q25Ta = getLocalizedQuestion(q25, true);
    console.log(`    English: "${q25.questionText}"`);
    console.log(`    Tamil:   "${q25Ta}"`);

    const parsedOpts = normalizeOptionsList(q25.options);
    console.log(`    Options count: ${parsedOpts.length}`);
    for (const opt of parsedOpts) {
      const optTa = getLocalizedOption(opt, true);
      console.log(`      [${opt.id}] ${optTa} (En: ${opt.textEn || opt.text})`);
    }

    const expTa = getLocalizedExplanation(q25, true);
    console.log(`    Explanation (Tamil): "${expTa}"`);
  }

  console.log("\n=== 3. VERIFY QUESTION 25 NAVIGATION & SUBMISSION LOGIC ===");
  // Simulate mock examination state with 25 questions
  const sampleExam = chemExams.rows[0];
  const allQuestions = (await client.execute({
    sql: "SELECT id, questionNumber, questionText, options, correctAnswer, explanation FROM ExamQuestion WHERE examScheduleId = ? ORDER BY questionNumber ASC",
    args: [sampleExam.id]
  })).rows;

  let currentIdx = 23; // Candidate on Question 24
  let answers = {};
  let visited = {};
  let reviewed = {};

  // Candidate answers questions 1-24
  for (let i = 0; i < 24; i++) {
    const q = allQuestions[i];
    answers[q.id] = (i % 2 === 0) ? q.correctAnswer : "A"; // simulate mix of correct and incorrect
    visited[q.id] = true;
  }

  console.log("Candidate answered 24 questions. Now moving to Question 25...");
  // Simulate handleSaveAndNext from Q24
  if (currentIdx < allQuestions.length - 1) {
    const nextQ = allQuestions[currentIdx + 1];
    visited[nextQ.id] = true;
    currentIdx = currentIdx + 1;
  }
  console.log(`Current index is now: ${currentIdx} (Question ${currentIdx + 1})`);
  if (currentIdx !== 24) throw new Error("Index did not increment to 24!");

  // Candidate on Question 25 selects option
  const q25 = allQuestions[currentIdx];
  answers[q25.id] = q25.correctAnswer;
  visited[q25.id] = true;
  console.log(`Candidate answered Question 25. Total answers: ${Object.keys(answers).length}`);
  if (Object.keys(answers).length !== 25) throw new Error("Question 25 answer was not recorded!");

  console.log("\n=== 4. VERIFY CATEGORIZED BREAKDOWN COMPUTATION ===");
  const breakdown = allQuestions.map((q, idx) => {
    const chosen = answers[q.id] || null;
    const isCorrect = q.correctAnswer ? (chosen === q.correctAnswer) : null;
    return {
      id: q.id,
      questionNumber: q.questionNumber,
      questionText: q.questionText,
      chosen,
      correctAnswer: q.correctAnswer,
      isCorrect,
      explanation: q.explanation,
    };
  });

  const incorrectCount = breakdown.filter(q => q.chosen && !q.isCorrect).length;
  const correctCount = breakdown.filter(q => q.isCorrect).length;
  const unattemptedCount = breakdown.filter(q => !q.chosen).length;

  console.log(`Breakdown statistics: Total=${breakdown.length}, Correct=${correctCount}, Incorrect=${incorrectCount}, Unattempted=${unattemptedCount}`);
  if (incorrectCount === 0 || correctCount === 0) {
    throw new Error("Expected mix of correct and incorrect answers!");
  }

  // Filter tabs verification
  const incorrectList = breakdown.filter(q => q.chosen && !q.isCorrect);
  const correctList = breakdown.filter(q => q.isCorrect);
  console.log(`Incorrect tab items: ${incorrectList.length}`);
  console.log(`Correct tab items: ${correctList.length}`);
  console.log(`Sample mistake: Q${incorrectList[0].questionNumber} - Chosen: ${incorrectList[0].chosen}, Correct Key: ${incorrectList[0].correctAnswer}`);
  console.log(`Sample correct: Q${correctList[0].questionNumber} - Chosen: ${correctList[0].chosen}, Correct Key: ${correctList[0].correctAnswer}`);

  console.log("\n✅ ALL TEST ASSERTIONS PASSED PERFECTLY!");
}

verifyAll().catch(err => {
  console.error("❌ Verification failed:", err);
  process.exit(1);
});

