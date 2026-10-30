/**
 * Database Seeder: Class 12 Chemistry 100 Bilingual Questions & 4 Official Exam Schedules
 * Sets up:
 *  1. Chemistry Subject (CHE-12) & 15 Syllabus Units
 *  2. 100 QuestionBankItems with full English/Tamil bilingual support
 *  3. 4 Scheduled Official Exams:
 *     - Part 1 (Q01-Q25): Oct 31, 2026, 2:00 PM (Tomorrow)
 *     - Part 2 (Q26-Q50): Oct 31, 2026, 3:00 PM (Tomorrow)
 *     - Part 3 (Q01-Q25 of Set 2): Nov 01, 2026, 2:00 PM (Sunday)
 *     - Part 4 (Q26-Q50 of Set 2): Nov 01, 2026, 3:00 PM (Sunday)
 *  4. Links CHE-12 to all Class 12 Student Profiles
 */

const fs = require("fs");
const path = require("path");
const { db } = require("../src/lib/db");

async function seedChemistryExams() {
  console.log("========================================================");
  console.log("   SEEDING 12TH CHEMISTRY 100 QUESTIONS & EXAM SCHEDULES");
  console.log("========================================================");

  // 1. Load 100 Questions JSON
  const jsonPath = path.join(__dirname, "chemistry_100_questions.json");
  if (!fs.existsSync(jsonPath)) {
    throw new Error(`Cannot find chemistry questions dataset at ${jsonPath}`);
  }
  const dataset = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
  const set1 = dataset.set1; // 50 questions
  const set2 = dataset.set2; // 50 questions
  console.log(`Loaded dataset: ${set1.length} questions in Set 1, ${set2.length} questions in Set 2.`);

  // 2. Ensure Subject CHE-12 exists
  let subject = await db.subject.findFirst({
    where: { code: "CHE-12" },
  });

  if (!subject) {
    subject = await db.subject.create({
      data: {
        code: "CHE-12",
        name: "Chemistry",
        nameEn: "Chemistry",
        nameTa: "வேதியியல்",
        prepClass: 12,
        category: "Core",
        medium: "Bilingual",
        active: true,
      },
    });
    console.log("✅ Created Subject CHE-12");
  } else {
    subject = await db.subject.update({
      where: { id: subject.id },
      data: {
        nameEn: "Chemistry",
        nameTa: "வேதியியல்",
        medium: "Bilingual",
      },
    });
    console.log(`✅ Verified Subject CHE-12 (ID: ${subject.id})`);
  }

  // 3. Seed 15 Syllabus Units
  const unitsData = [
    { unitNumber: 1, title: "Metallurgy / உலோகவியல்" },
    { unitNumber: 2, title: "p-Block Elements - I / p-தொகுதி தனிமங்கள் - I" },
    { unitNumber: 3, title: "p-Block Elements - II / p-தொகுதி தனிமங்கள் - II" },
    { unitNumber: 4, title: "Transition and Inner Transition Elements / இடைநிலை மற்றும் உள்-இடைநிலை தனிமங்கள்" },
    { unitNumber: 5, title: "Coordination Chemistry / அணைவு வேதியியல்" },
    { unitNumber: 6, title: "Solid State / திட நிலைமை" },
    { unitNumber: 7, title: "Chemical Kinetics / வேதிவினை வேகவியல்" },
    { unitNumber: 8, title: "Ionic Equilibrium / அயனிச் சமநிலை" },
    { unitNumber: 9, title: "Electrochemistry / மின் வேதியியல்" },
    { unitNumber: 10, title: "Surface Chemistry / புறப்பரப்பு வேதியியல்" },
    { unitNumber: 11, title: "Hydroxy Compounds and Ethers / ஹைட்ராக்ஸி சேர்மங்கள் மற்றும் ஈதர்கள்" },
    { unitNumber: 12, title: "Carbonyl Compounds and Carboxylic Acids / கார்பனைல் சேர்மங்கள் மற்றும் கார்பாக்சிலிக் அமிலங்கள்" },
    { unitNumber: 13, title: "Organic Nitrogen Compounds / கரிம நைட்ரஜன் சேர்மங்கள்" },
    { unitNumber: 14, title: "Biomolecules / உயிரியல் மூலக்கூறுகள்" },
    { unitNumber: 15, title: "Chemistry in Everyday Life / அன்றாட வாழ்வில் வேதியியல்" },
  ];

  for (const u of unitsData) {
    let unit = await db.syllabusUnit.findFirst({
      where: { subjectId: subject.id, unitNumber: u.unitNumber },
    });
    if (!unit) {
      unit = await db.syllabusUnit.create({
        data: {
          subjectId: subject.id,
          unitNumber: u.unitNumber,
          title: u.title,
        },
      });
      // Add a chapter
      await db.syllabusChapter.create({
        data: {
          unitId: unit.id,
          chapterNumber: 1,
          title: u.title,
          description: `Tamil Nadu State Board Standard 12 Chemistry: ${u.title}`,
        },
      });
    }
  }
  console.log(`✅ Verified all 15 Syllabus Units for CHE-12`);

  // 4. Seed 100 QuestionBankItems
  const all100 = [
    ...set1.map((q, idx) => ({ ...q, globalIdx: idx + 1 })),
    ...set2.map((q, idx) => ({ ...q, globalIdx: idx + 51 })),
  ];

  // Helper to format options bilingually
  function formatOptions(q) {
    return [
      {
        id: "A",
        text: q.options_en.a,
        textEn: q.options_en.a,
        textTa: q.options_ta.a,
      },
      {
        id: "B",
        text: q.options_en.b,
        textEn: q.options_en.b,
        textTa: q.options_ta.b,
      },
      {
        id: "C",
        text: q.options_en.c,
        textEn: q.options_en.c,
        textTa: q.options_ta.c,
      },
      {
        id: "D",
        text: q.options_en.d,
        textEn: q.options_en.d,
        textTa: q.options_ta.d,
      },
    ];
  }

  let bankInserted = 0;
  for (const q of all100) {
    const existing = await db.questionBankItem.findFirst({
      where: { subjectId: subject.id, questionNumber: q.globalIdx },
    });

    const optionsJson = JSON.stringify(formatOptions(q));
    const combinedExplanation = `${q.explanation_en} / ${q.explanation_ta}`;

    if (!existing) {
      await db.questionBankItem.create({
        data: {
          subjectId: subject.id,
          questionNumber: q.globalIdx,
          questionText: q.question_en,
          marks: 1,
          options: optionsJson,
          correctAnswer: q.correct_option.toUpperCase(),
          explanation: combinedExplanation,
          topic: q.topic,
          difficulty: "MEDIUM",
          language: "bilingual",
          sourceFormat: "JSON",
        },
      });
      bankInserted++;
    } else {
      await db.questionBankItem.update({
        where: { id: existing.id },
        data: {
          questionText: q.question_en,
          options: optionsJson,
          correctAnswer: q.correct_option.toUpperCase(),
          explanation: combinedExplanation,
          topic: q.topic,
        },
      });
    }
  }
  console.log(`✅ Seeded 100 questions into QuestionBankItem (New: ${bankInserted})`);

  // 5. Schedule the 4 Official Exams
  const now = new Date();
  const phaseTimestamps = JSON.stringify({
    0: new Date(now.getTime() - 40000).toISOString(),
    1: new Date(now.getTime() - 30000).toISOString(),
    2: new Date(now.getTime() - 20000).toISOString(),
    3: new Date(now.getTime() - 10000).toISOString(),
    4: now.toISOString(),
  });

  const examSchedulesData = [
    {
      title: "12th Standard Chemistry - Official Board Examination (Part 1 / பகுதி 1)",
      date: new Date("2026-10-31T14:00:00.000Z"), // Tomorrow 2:00 PM
      questions: set1.slice(0, 25),
      part: "Part 1",
    },
    {
      title: "12th Standard Chemistry - Official Board Examination (Part 2 / பகுதி 2)",
      date: new Date("2026-10-31T15:00:00.000Z"), // Tomorrow 3:00 PM
      questions: set1.slice(25, 50),
      part: "Part 2",
    },
    {
      title: "12th Standard Chemistry - Official Board Examination (Part 3 / பகுதி 3)",
      date: new Date("2026-11-01T14:00:00.000Z"), // Sunday 2:00 PM
      questions: set2.slice(0, 25),
      part: "Part 3",
    },
    {
      title: "12th Standard Chemistry - Official Board Examination (Part 4 / பகுதி 4)",
      date: new Date("2026-11-01T15:00:00.000Z"), // Sunday 3:00 PM
      questions: set2.slice(25, 50),
      part: "Part 4",
    },
  ];

  for (const sched of examSchedulesData) {
    let exam = await db.examSchedule.findFirst({
      where: {
        subjectId: subject.id,
        instructions: { contains: sched.part },
      },
    });

    if (!exam) {
      exam = await db.examSchedule.create({
        data: {
          subjectId: subject.id,
          prepClass: 12,
          examDate: sched.date,
          durationMinutes: 45,
          totalMarks: 25,
          requiredQuestions: 25,
          instructions: `Official Tamil Nadu State Board Examination - 12th Chemistry (${sched.part}). All 25 questions are compulsory. Multiple-choice questions with 1 mark each. Evaluation and certified statement released upon submission.`,
          examLanguage: "ta",
          phase: 4, // reached_students
          phaseTimestamps,
          status: "PUBLISHED",
        },
      });
      console.log(`✅ Created Exam Schedule: ${sched.part} (ID: ${exam.id})`);
    } else {
      exam = await db.examSchedule.update({
        where: { id: exam.id },
        data: {
          examDate: sched.date,
          durationMinutes: 45,
          totalMarks: 25,
          requiredQuestions: 25,
          phase: 4,
          status: "PUBLISHED",
          phaseTimestamps,
        },
      });
      console.log(`✅ Updated Exam Schedule: ${sched.part} (ID: ${exam.id})`);
    }

    // Seed the 25 ExamQuestions for this exam
    // Clear old questions if any
    await db.examQuestion.deleteMany({
      where: { examScheduleId: exam.id },
    });

    for (let i = 0; i < sched.questions.length; i++) {
      const q = sched.questions[i];
      const optionsJson = JSON.stringify(formatOptions(q));
      await db.examQuestion.create({
        data: {
          examScheduleId: exam.id,
          questionNumber: i + 1,
          questionText: q.question_en,
          marks: 1,
          qType: "MCQ",
          difficulty: "MEDIUM",
          syllabusRef: `Unit ${q.unit}: ${q.topic}`,
          options: optionsJson,
          correctAnswer: q.correct_option.toUpperCase(),
          explanation: `${q.explanation_en} / ${q.explanation_ta}`,
          reviewStatus: "approved",
          source: "manual",
        },
      });
    }
    console.log(`   └─ Linked 25 questions for ${sched.part}`);
  }

  // 6. Link CHE-12 to all Class 12 Student Profiles
  const class12Students = await db.studentProfile.findMany({
    where: { examPrepClass: 12 },
  });

  for (const st of class12Students) {
    const hasSub = await db.studentSubject.findFirst({
      where: { studentId: st.id, subjectId: subject.id },
    });
    if (!hasSub) {
      await db.studentSubject.create({
        data: { studentId: st.id, subjectId: subject.id },
      });
    }
  }
  console.log(`✅ Linked CHE-12 to ${class12Students.length} Class 12 student profile(s)`);

  console.log("\n========================================================");
  console.log("   ALL 4 CHEMISTRY EXAMS & 100 QUESTIONS SEEDED CLEANLY!");
  console.log("========================================================");
}

seedChemistryExams()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seeding Error:", err);
    process.exit(1);
  });
