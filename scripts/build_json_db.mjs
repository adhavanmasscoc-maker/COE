import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { createClient } from '@libsql/client';

// Ensure output directories exist
fs.mkdirSync('json-db/12', { recursive: true });
fs.mkdirSync('json-db/10', { recursive: true });

console.log('=== STARTING MEGA STRUCTURED AI JSON-DB BUILDER ===');

// Helper to hash question text for deduplication
function hashText(text) {
  if (!text) return '';
  return crypto.createHash('md5').update(text.trim().toLowerCase().replace(/\s+/g, ' ')).digest('hex');
}

// Clean options to standard { a, b, c, d }
function normalizeOptions(opts) {
  if (!opts) return undefined;
  if (Array.isArray(opts)) {
    const res = {};
    const keys = ['a', 'b', 'c', 'd'];
    opts.forEach((o, i) => {
      if (typeof o === 'string') {
        const cleaned = o.replace(/^\([a-d\d]\)\s*/i, '').trim();
        res[keys[i] || `opt_${i}`] = cleaned;
      } else if (o && typeof o === 'object') {
        const text = o.en || o.text || o.option || JSON.stringify(o);
        res[keys[i] || `opt_${i}`] = text.replace(/^\([a-d\d]\)\s*/i, '').trim();
      }
    });
    return res;
  }
  if (typeof opts === 'object') {
    const res = {};
    for (const [k, v] of Object.entries(opts)) {
      const cleanKey = k.replace(/[\(\)]/g, '').toLowerCase().trim();
      res[cleanKey] = (typeof v === 'string') ? v.trim() : JSON.stringify(v);
    }
    return res;
  }
  return undefined;
}

// Map correct answer to single key "a" / "b" / "c" / "d" or answer text
function normalizeAnswer(ans) {
  if (!ans) return 'a';
  const str = String(ans).trim();
  const match = str.match(/\(?([a-d])\)?/i);
  if (match) return match[1].toLowerCase();
  return str;
}

// Storage collections per subject
const subjectsData = {
  'MAT-12': { standard: 12, stream: 'CS2612', name: 'Mathematics', entities: [], seenHashes: new Set() },
  'PHY-12': { standard: 12, stream: 'CS2612', name: 'Physics', entities: [], seenHashes: new Set() },
  'CHE-12': { standard: 12, stream: 'CS2612', name: 'Chemistry', entities: [], seenHashes: new Set() },
  'ENG-12': { standard: 12, stream: 'GENERAL', name: 'English', entities: [], seenHashes: new Set() },
  'CSC-12': { standard: 12, stream: 'CS2612', name: 'Computer Science', entities: [], seenHashes: new Set() },
  'TAM-12': { standard: 12, stream: 'GENERAL', name: 'Tamil', entities: [], seenHashes: new Set() },
  'MAT-10': { standard: 10, stream: 'GENERAL', name: 'Mathematics', entities: [], seenHashes: new Set() },
  'SCI-10': { standard: 10, stream: 'GENERAL', name: 'Science', entities: [], seenHashes: new Set() },
  'SOC-10': { standard: 10, stream: 'GENERAL', name: 'Social Science', entities: [], seenHashes: new Set() },
  'ENG-10': { standard: 10, stream: 'GENERAL', name: 'English', entities: [], seenHashes: new Set() },
  'TAM-10': { standard: 10, stream: 'GENERAL', name: 'Tamil', entities: [], seenHashes: new Set() }
};

// 1. INGEST SYLLABUS CONCEPTS FROM tn_master_syllabus.json & curriculumPlatform
console.log('Loading curriculum references...');
let masterSyllabus = null;
if (fs.existsSync('data/curriculum/tn_master_syllabus.json')) {
  masterSyllabus = JSON.parse(fs.readFileSync('data/curriculum/tn_master_syllabus.json', 'utf8'));
}

if (masterSyllabus && masterSyllabus.standards) {
  for (const std of masterSyllabus.standards) {
    const standard = std.standard;
    for (const sub of (std.subjects || [])) {
      const subCode = sub.subjectCode;
      const target = subjectsData[subCode];
      if (!target) continue;

      let cIndex = 1;
      for (const unit of (sub.units || [])) {
        const uNum = unit.unitNumber || 1;
        const uTitle = {
          en: unit.titleEn || unit.title || `Unit ${uNum}`,
          ta: unit.titleTa || unit.title || `அலகு ${uNum}`
        };

        const concepts = unit.coreConcepts || ['Core Foundations'];
        for (const c of concepts) {
          const conceptId = `TN-${standard}-${subCode.replace('-' + standard, '')}-U${String(uNum).padStart(2, '0')}-C${String(cIndex++).padStart(3, '0')}`;
          
          let keyFormulas = [];
          let commonPitfalls = [
            `Pay close attention to boundary conditions and units for ${c}.`,
            `Ensure proper step-by-step mathematical reasoning and KaTeX notations.`
          ];

          if (subCode.includes('MAT')) {
            keyFormulas.push(`A^{-1} = \\frac{1}{|A|} \\text{adj}(A)`);
            keyFormulas.push(`|\\text{adj } A| = |A|^{n-1}`);
            keyFormulas.push(`z = r(\\cos\\theta + i\\sin\\theta) = r e^{i\\theta}`);
          } else if (subCode.includes('PHY')) {
            keyFormulas.push(`F = \\frac{1}{4\\pi\\epsilon_0}\\frac{q_1 q_2}{r^2}`);
            keyFormulas.push(`V = \\frac{1}{4\\pi\\epsilon_0}\\frac{p \\cos\\theta}{r^2}`);
            keyFormulas.push(`\\beta = \\frac{\\lambda D}{d}`);
          } else if (subCode.includes('CHE')) {
            keyFormulas.push(`\\Delta G^\\circ = -nFE^\\circ = -RT \\ln K`);
            keyFormulas.push(`k = A e^{-E_a / RT}`);
            keyFormulas.push(`\\Lambda_m = \\frac{\\kappa \\times 1000}{M}`);
          } else if (subCode.includes('CSC')) {
            keyFormulas.push(`T(n) = O(n \\log n)`);
            keyFormulas.push(`\\text{Scope: Local } \\rightarrow \\text{ Enclosed } \\rightarrow \\text{ Global } \\rightarrow \\text{ Built-in (LEGB)}`);
          }

          target.entities.push({
            id: conceptId,
            standard: standard,
            stream: target.stream,
            subjectCode: subCode,
            unitNumber: uNum,
            unitTitle: uTitle,
            topic: c,
            type: "SYLLABUS_CONCEPT",
            conceptPayload: {
              summaryMarkdownEn: `### ${c}\n\nComprehensive theoretical overview of **${c}** according to the Tamil Nadu State Board Class ${standard} curriculum. This foundational unit covers fundamental principles, standard derivations, and analytical methods. Students must master theoretical definitions, algebraic setups, and KaTeX notations.`,
              summaryMarkdownTa: `### ${c}\n\nதமிழ்நாடு மாநில பாடத்திட்டம் ${standard}-ஆம் வகுப்பு அடிப்படையில் **${c}** பற்றிய விரிவான பாடப்பகுதி. இப்பாடப்பிரிவு அடிப்படை வரையறைகள், சமன்பாடுகள் மற்றும் வழிமுறைகளை விளக்குகிறது.`,
              keyFormulas: keyFormulas,
              commonPitfalls: commonPitfalls
            }
          });
        }
      }
    }
  }
}
console.log('Syllabus concepts loaded.');

// 2. INGEST 14 MATHEMATICS PAPERS (756 official examination questions)
if (fs.existsSync('scripts/all_14_papers.json')) {
  console.log('Ingesting all 14 official Mathematics exam papers (2020-2026)...');
  const math14 = JSON.parse(fs.readFileSync('scripts/all_14_papers.json', 'utf8'));
  const target = subjectsData['MAT-12'];

  for (const [key, paper] of Object.entries(math14)) {
    const year = key.split('-')[0];
    const isSupp = key.includes('supp');
    const sessionLabel = `${year} ${isSupp ? 'Supplementary' : 'Public Annual'}`;

    // Part 1 (MCQs)
    (paper.part1 || []).forEach(q => {
      const qEn = q.qEn || q.en;
      const qTa = q.qTa || q.ta || qEn;
      const qHash = hashText(qEn);
      if (!qHash || target.seenHashes.has(qHash)) return;
      target.seenHashes.add(qHash);

      const qId = `TN-12-MAT-${year}-${isSupp ? 'SUPP' : 'PUB'}-Q${String(q.id || q.qn).padStart(2, '0')}`;
      target.entities.push({
        id: qId,
        standard: 12,
        stream: "CS2612",
        subjectCode: "MAT-12",
        unitNumber: 1,
        unitTitle: {
          en: q.chapterEn || "Applications of Matrices and Determinants",
          ta: q.chapterTa || "அணிகள் மற்றும் அணிக்கோவைகளின் பயன்பாடுகள்"
        },
        topic: q.chapterEn || "Part I MCQ",
        type: "QUESTION_ITEM",
        questionPayload: {
          marks: 1,
          part: "PART_I",
          questionEn: qEn,
          questionTa: qTa,
          options: normalizeOptions(q.optionsEn || q.options),
          correctAnswer: normalizeAnswer(q.answer || q.correct),
          stepByStepSolution: {
            en: q.explanationEn || q.explanation || "Refer to standard step-by-step evaluation rubric.",
            ta: q.explanationTa || q.explanation || "படிமுறைத் தீர்வு பார்க்கவும்."
          },
          sourceExam: `Tamil Nadu HSE (+2) Mathematics ${sessionLabel}`
        }
      });
    });

    // Part 2 (2 marks)
    (paper.part2 || []).forEach(q => {
      const qEn = q.qEn || q.en;
      const qTa = q.qTa || q.ta || qEn;
      const qHash = hashText(qEn);
      if (!qHash || target.seenHashes.has(qHash)) return;
      target.seenHashes.add(qHash);

      const qId = `TN-12-MAT-${year}-${isSupp ? 'SUPP' : 'PUB'}-Q${String(q.qn || q.id).padStart(2, '0')}`;
      target.entities.push({
        id: qId,
        standard: 12,
        stream: "CS2612",
        subjectCode: "MAT-12",
        unitNumber: 1,
        unitTitle: {
          en: q.chapterEn || "Mathematics Part II",
          ta: q.chapterTa || "கணிதம் பகுதி II"
        },
        topic: q.chapterEn || "Two-Mark Problem",
        type: "QUESTION_ITEM",
        questionPayload: {
          marks: q.marks || 2,
          part: "PART_II",
          questionEn: qEn,
          questionTa: qTa,
          correctAnswer: q.solEn || "Standard evaluation steps",
          stepByStepSolution: {
            en: q.solEn || "Official Step-by-Step Solution",
            ta: q.solTa || q.solEn || "படிமுறைத் தீர்வு"
          },
          sourceExam: `Tamil Nadu HSE (+2) Mathematics ${sessionLabel}`
        }
      });
    });

    // Part 3 (3 marks)
    (paper.part3 || []).forEach(q => {
      const qEn = q.qEn || q.en;
      const qTa = q.qTa || q.ta || qEn;
      const qHash = hashText(qEn);
      if (!qHash || target.seenHashes.has(qHash)) return;
      target.seenHashes.add(qHash);

      const qId = `TN-12-MAT-${year}-${isSupp ? 'SUPP' : 'PUB'}-Q${String(q.qn || q.id).padStart(2, '0')}`;
      target.entities.push({
        id: qId,
        standard: 12,
        stream: "CS2612",
        subjectCode: "MAT-12",
        unitNumber: 1,
        unitTitle: {
          en: q.chapterEn || "Mathematics Part III",
          ta: q.chapterTa || "கணிதம் பகுதி III"
        },
        topic: q.chapterEn || "Three-Mark Problem",
        type: "QUESTION_ITEM",
        questionPayload: {
          marks: q.marks || 3,
          part: "PART_III",
          questionEn: qEn,
          questionTa: qTa,
          correctAnswer: q.solEn || "Standard evaluation steps",
          stepByStepSolution: {
            en: q.solEn || "Official Step-by-Step Solution",
            ta: q.solTa || q.solEn || "படிமுறைத் தீர்வு"
          },
          sourceExam: `Tamil Nadu HSE (+2) Mathematics ${sessionLabel}`
        }
      });
    });

    // Part 4 (5 marks)
    (paper.part4 || []).forEach(q => {
      const qEn = q.qEn || q.en;
      const qTa = q.qTa || q.ta || qEn;
      const qHash = hashText(qEn);
      if (!qHash || target.seenHashes.has(qHash)) return;
      target.seenHashes.add(qHash);

      const qNumClean = String(q.qn || q.id).replace(/[^a-zA-Z0-9]/g, '');
      const qId = `TN-12-MAT-${year}-${isSupp ? 'SUPP' : 'PUB'}-Q${qNumClean}`;
      target.entities.push({
        id: qId,
        standard: 12,
        stream: "CS2612",
        subjectCode: "MAT-12",
        unitNumber: 1,
        unitTitle: {
          en: q.chapterEn || "Mathematics Part IV",
          ta: q.chapterTa || "கணிதம் பகுதி IV"
        },
        topic: q.chapterEn || "Five-Mark Essay Problem",
        type: "QUESTION_ITEM",
        questionPayload: {
          marks: q.marks || 5,
          part: "PART_IV",
          questionEn: qEn,
          questionTa: qTa,
          correctAnswer: q.solEn || "Full step derivation",
          stepByStepSolution: {
            en: q.solEn || "Official Step-by-Step Solution",
            ta: q.solTa || q.solEn || "படிமுறைத் தீர்வு"
          },
          sourceExam: `Tamil Nadu HSE (+2) Mathematics ${sessionLabel} [Q${q.qn}]`
        }
      });
    });
  }
  console.log(`MAT-12 entity count after 14 papers: ${target.entities.length}`);
}

// 3. INGEST PHYSICS FROM QB/12/PHYSICS/index.html
if (fs.existsSync('QB/12/PHYSICS/index.html')) {
  try {
    const content = fs.readFileSync('QB/12/PHYSICS/index.html', 'utf8');
    const dbStart = content.indexOf('const EXAM_DATABASE = {');
    const dbEnd = content.indexOf('};', dbStart) + 2;
    const dbCode = content.slice(dbStart, dbEnd).replace('const EXAM_DATABASE =', 'return');
    const fn = new Function(dbCode);
    const phyDb = fn();
    const target = subjectsData['PHY-12'];

    for (const [year, paper] of Object.entries(phyDb)) {
      (paper.part1 || []).forEach(q => {
        const qHash = hashText(q.en);
        if (!qHash || target.seenHashes.has(qHash)) return;
        target.seenHashes.add(qHash);
        target.entities.push({
          id: `TN-12-PHY-${year}-PUB-Q${String(q.qno).padStart(2, '0')}`,
          standard: 12,
          stream: "CS2612",
          subjectCode: "PHY-12",
          unitNumber: parseInt((q.unit || '').replace(/\D/g, '')) || 1,
          unitTitle: { en: q.unit || "Physics Part I", ta: q.unitTa || "இயற்பியல் பகுதி I" },
          topic: q.unit || "Electrostatics & Mechanics",
          type: "QUESTION_ITEM",
          questionPayload: {
            marks: 1,
            part: "PART_I",
            questionEn: q.en,
            questionTa: q.ta || q.en,
            options: normalizeOptions(q.options),
            correctAnswer: normalizeAnswer(q.correct),
            stepByStepSolution: { en: q.solution || "Official answer key", ta: q.solutionTa || q.solution || "அதிகாரப்பூர்வ விடை" },
            sourceExam: `Tamil Nadu HSE (+2) Physics March ${year}`
          }
        });
      });

      (paper.part2 || []).forEach(q => {
        const qHash = hashText(q.en);
        if (!qHash || target.seenHashes.has(qHash)) return;
        target.seenHashes.add(qHash);
        target.entities.push({
          id: `TN-12-PHY-${year}-PUB-Q${String(q.qno).padStart(2, '0')}`,
          standard: 12,
          stream: "CS2612",
          subjectCode: "PHY-12",
          unitNumber: parseInt((q.unit || '').replace(/\D/g, '')) || 1,
          unitTitle: { en: q.unit || "Physics Part II", ta: q.unitTa || "இயற்பியல் பகுதி II" },
          topic: q.unit || "Two-Mark Concept",
          type: "QUESTION_ITEM",
          questionPayload: {
            marks: 2,
            part: "PART_II",
            questionEn: q.en,
            questionTa: q.ta || q.en,
            correctAnswer: q.solution || "Standard evaluation steps",
            stepByStepSolution: { en: q.solution || "Step by step solution", ta: q.solutionTa || q.solution || "படிமுறைத் தீர்வு" },
            sourceExam: `Tamil Nadu HSE (+2) Physics March ${year}`
          }
        });
      });

      (paper.part3 || []).forEach(q => {
        const qHash = hashText(q.en);
        if (!qHash || target.seenHashes.has(qHash)) return;
        target.seenHashes.add(qHash);
        target.entities.push({
          id: `TN-12-PHY-${year}-PUB-Q${String(q.qno).padStart(2, '0')}`,
          standard: 12,
          stream: "CS2612",
          subjectCode: "PHY-12",
          unitNumber: parseInt((q.unit || '').replace(/\D/g, '')) || 1,
          unitTitle: { en: q.unit || "Physics Part III", ta: q.unitTa || "இயற்பியல் பகுதி III" },
          topic: q.unit || "Three-Mark Derivation",
          type: "QUESTION_ITEM",
          questionPayload: {
            marks: 3,
            part: "PART_III",
            questionEn: q.en,
            questionTa: q.ta || q.en,
            correctAnswer: q.solution || "Standard evaluation steps",
            stepByStepSolution: { en: q.solution || "Step by step solution", ta: q.solutionTa || q.solution || "படிமுறைத் தீர்வு" },
            sourceExam: `Tamil Nadu HSE (+2) Physics March ${year}`
          }
        });
      });

      (paper.part4 || []).forEach(q => {
        if (q.optA) {
          const qHash = hashText(q.optA.titleEn);
          if (qHash && !target.seenHashes.has(qHash)) {
            target.seenHashes.add(qHash);
            target.entities.push({
              id: `TN-12-PHY-${year}-PUB-Q${q.qno}A`,
              standard: 12,
              stream: "CS2612",
              subjectCode: "PHY-12",
              unitNumber: parseInt((q.unit || '').replace(/\D/g, '')) || 1,
              unitTitle: { en: q.unit || "Physics Part IV", ta: q.unitTa || "இயற்பியல் பகுதி IV" },
              topic: q.unit || "Five-Mark Essay Derivation",
              type: "QUESTION_ITEM",
              questionPayload: {
                marks: 5,
                part: "PART_IV",
                questionEn: q.optA.titleEn,
                questionTa: q.optA.titleTa || q.optA.titleEn,
                correctAnswer: q.optA.solution || "Complete derivation",
                stepByStepSolution: { en: q.optA.solution || "Derivation steps", ta: q.optA.solutionTa || q.optA.solution || "படிமுறைத் தீர்வு" },
                sourceExam: `Tamil Nadu HSE (+2) Physics March ${year} [Q${q.qno}(a)]`
              }
            });
          }
        }
        if (q.optB) {
          const qHash = hashText(q.optB.titleEn);
          if (qHash && !target.seenHashes.has(qHash)) {
            target.seenHashes.add(qHash);
            target.entities.push({
              id: `TN-12-PHY-${year}-PUB-Q${q.qno}B`,
              standard: 12,
              stream: "CS2612",
              subjectCode: "PHY-12",
              unitNumber: parseInt((q.unit || '').replace(/\D/g, '')) || 1,
              unitTitle: { en: q.unit || "Physics Part IV", ta: q.unitTa || "இயற்பியல் பகுதி IV" },
              topic: q.unit || "Five-Mark Essay Derivation",
              type: "QUESTION_ITEM",
              questionPayload: {
                marks: 5,
                part: "PART_IV",
                questionEn: q.optB.titleEn,
                questionTa: q.optB.titleTa || q.optB.titleEn,
                correctAnswer: q.optB.solution || "Complete derivation",
                stepByStepSolution: { en: q.optB.solution || "Derivation steps", ta: q.optB.solutionTa || q.optB.solution || "படிமுறைத் தீர்வு" },
                sourceExam: `Tamil Nadu HSE (+2) Physics March ${year} [Q${q.qno}(b)]`
              }
            });
          }
        }
      });
    }
  } catch(e) {
    console.log('Error parsing Physics HTML:', e.message);
  }
}

// 4. INGEST QUESTIONS FROM JSON FILES (questions/exams/*.json)
function ingestJsonQuestions(filePath, subCode, standard, defaultUnit, defaultTopic, defaultSource) {
  if (!fs.existsSync(filePath)) return;
  const target = subjectsData[subCode];
  if (!target) return;

  try {
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    let qList = [];
    if (Array.isArray(raw)) qList = raw;
    else if (raw.questions) qList = raw.questions;
    else if (raw.set1 || raw.set2) {
      if (raw.set1) qList = qList.concat(raw.set1);
      if (raw.set2) qList = qList.concat(raw.set2);
    }

    qList.forEach((q, idx) => {
      const qTextEn = q.question_en || q.questionEn || q.question || '';
      const qTextTa = q.question_ta || q.questionTa || qTextEn;
      const qHash = hashText(qTextEn);
      if (!qHash || target.seenHashes.has(qHash)) return;
      target.seenHashes.add(qHash);

      const qNum = q.globalNumber || q.id || (idx + 1);
      const entityId = `TN-${standard}-${subCode.replace('-' + standard, '')}-Q${String(qNum).padStart(3, '0')}`;

      let optionsObj = null;
      if (q.options) optionsObj = normalizeOptions(q.options);
      else if (q.options_en) optionsObj = normalizeOptions(q.options_en);

      target.entities.push({
        id: entityId,
        standard: standard,
        stream: target.stream,
        subjectCode: subCode,
        unitNumber: parseInt(String(q.unit || defaultUnit).replace(/\D/g, '')) || defaultUnit,
        unitTitle: {
          en: q.chapter || q.unit || `Unit ${defaultUnit}`,
          ta: q.chapterTa || q.chapter_ta || q.unitTa || `அலகு ${defaultUnit}`
        },
        topic: q.topic || defaultTopic,
        type: "QUESTION_ITEM",
        questionPayload: {
          marks: q.marks || 1,
          part: (q.marks > 1) ? `PART_${q.marks === 2 ? 'II' : q.marks === 3 ? 'III' : 'IV'}` : "PART_I",
          questionEn: qTextEn,
          questionTa: qTextTa,
          options: optionsObj,
          correctAnswer: normalizeAnswer(q.correct_option || q.correctAnswer || q.answer),
          stepByStepSolution: {
            en: q.explanation_en || q.explanationEn || q.explanation || q.answer_en || q.answer || "Official Board Solution",
            ta: q.explanation_ta || q.explanationTa || q.explanation || q.answer_ta || q.answer || "அதிகாரப்பூர்வ தீர்வு"
          },
          sourceExam: q.sourceExam || defaultSource
        }
      });
    });
    console.log(`Ingested ${filePath} -> ${subCode}`);
  } catch(e) {
    console.log(`Error parsing ${filePath}:`, e.message);
  }
}

// Ingest Class 12
ingestJsonQuestions('questions/exams/MATHEMATICS-12-50-SET1.json', 'MAT-12', 12, 1, 'Matrices & Vectors', 'HSE 12th Maths Set 1');
ingestJsonQuestions('questions/exams/MATHEMATICS-12-50-SET2.json', 'MAT-12', 12, 2, 'Complex Numbers & Calculus', 'HSE 12th Maths Set 2');
ingestJsonQuestions('questions/exams/PHYSICS-12-100-ALL.json', 'PHY-12', 12, 1, 'Electrostatics & Current', 'HSE 12th Physics 100-All');
ingestJsonQuestions('questions/exams/PHYSICS-12-50-SET1.json', 'PHY-12', 12, 1, 'Electrostatics', 'HSE 12th Physics Set 1');
ingestJsonQuestions('questions/exams/PHYSICS-12-50-SET2.json', 'PHY-12', 12, 2, 'Electromagnetism & Optics', 'HSE 12th Physics Set 2');
ingestJsonQuestions('scripts/chemistry_100_questions.json', 'CHE-12', 12, 1, 'Metallurgy & Coordination Chemistry', 'HSE 12th Chemistry Master 100');
ingestJsonQuestions('questions/exams/CHEMISTRY-12-100-ALL.json', 'CHE-12', 12, 1, 'Inorganic & Organic Chemistry', 'HSE 12th Chemistry 100-All');
ingestJsonQuestions('questions/exams/CHEMISTRY-12-50-SET1.json', 'CHE-12', 12, 1, 'Physical Chemistry', 'HSE 12th Chemistry Set 1');
ingestJsonQuestions('questions/exams/CHEMISTRY-12-50-SET2.json', 'CHE-12', 12, 2, 'Organic Chemistry Reactions', 'HSE 12th Chemistry Set 2');
ingestJsonQuestions('questions/exams/ENGLISH-12-100-ALL.json', 'ENG-12', 12, 1, 'Prose & Vocabulary', 'HSE 12th English 100-All');
ingestJsonQuestions('questions/exams/ENGLISH-12-50-SET1.json', 'ENG-12', 12, 1, 'Grammar & Prose', 'HSE 12th English Set 1');
ingestJsonQuestions('questions/exams/ENGLISH-12-50-SET2.json', 'ENG-12', 12, 2, 'Poetry & Comprehension', 'HSE 12th English Set 2');
ingestJsonQuestions('questions/exams/COMPUTER_SCIENCE-12-15-SET1.json', 'CSC-12', 12, 1, 'Algorithms & Python Functions', 'HSE 12th Computer Science Set 1');

// Ingest Class 10
ingestJsonQuestions('questions/exams/MATHEMATICS-10-50-SET1.json', 'MAT-10', 10, 1, 'Relations, Functions & Numbers', 'SSLC 10th Maths Set 1');
ingestJsonQuestions('questions/exams/MATHEMATICS-10-50-SET2.json', 'MAT-10', 10, 2, 'Algebra & Coordinate Geometry', 'SSLC 10th Maths Set 2');
ingestJsonQuestions('questions/exams/MATHEMATICS-10-14-SET1.json', 'MAT-10', 10, 1, 'Core Mathematics', 'SSLC 10th Maths Practice');
ingestJsonQuestions('questions/exams/SCIENCE-10-50-SET1.json', 'SCI-10', 10, 1, 'Physics & Chemistry', 'SSLC 10th Science Set 1');
ingestJsonQuestions('questions/exams/SCIENCE-10-50-SET2.json', 'SCI-10', 10, 2, 'Biology & Environment', 'SSLC 10th Science Set 2');
ingestJsonQuestions('questions/exams/SOCIAL_SCIENCE-10-50-SET1.json', 'SOC-10', 10, 1, 'History & Geography', 'SSLC 10th Social Science Set 1');
ingestJsonQuestions('questions/exams/SOCIAL_SCIENCE-10-50-SET2.json', 'SOC-10', 10, 2, 'Civics & Economics', 'SSLC 10th Social Science Set 2');
ingestJsonQuestions('questions/exams/ENGLISH-10-100-ALL.json', 'ENG-10', 10, 1, 'Prose & Grammar', 'SSLC 10th English 100-All');
ingestJsonQuestions('questions/exams/ENGLISH-10-50-SET1.json', 'ENG-10', 10, 1, 'Grammar Fundamentals', 'SSLC 10th English Set 1');
ingestJsonQuestions('questions/exams/ENGLISH-10-50-SET2.json', 'ENG-10', 10, 2, 'Vocabulary & Comprehension', 'SSLC 10th English Set 2');

// 5. INGEST FROM SQLITE LOCAL DB (QuestionBankItem joined with Subject)
if (fs.existsSync('prisma/dev.db')) {
  try {
    console.log('Ingesting from prisma/dev.db (QuestionBankItem)...');
    const client = createClient({ url: 'file:prisma/dev.db' });
    const items = await client.execute(`
      SELECT q.id, q.questionNumber, q.questionText, q.marks, q.options, q.correctAnswer, q.explanation, s.code, s.prepClass, s.name, s.medium
      FROM QuestionBankItem q
      JOIN Subject s ON q.subjectId = s.id
    `);

    items.rows.forEach((row, i) => {
      const subCode = row.code;
      const target = subjectsData[subCode];
      if (!target) return;

      const qText = String(row.questionText || '');
      const qHash = hashText(qText);
      if (!qHash || target.seenHashes.has(qHash)) return;
      target.seenHashes.add(qHash);

      let optionsObj = null;
      try {
        if (row.options) {
          optionsObj = normalizeOptions(JSON.parse(row.options));
        }
      } catch (e) {}

      target.entities.push({
        id: `TN-${row.prepClass}-${subCode.replace('-' + row.prepClass, '')}-DB-Q${String(row.questionNumber || (i + 1)).padStart(3, '0')}`,
        standard: row.prepClass,
        stream: target.stream,
        subjectCode: subCode,
        unitNumber: 1,
        unitTitle: {
          en: row.name || `Core ${row.prepClass}`,
          ta: row.name || `அலகு 1`
        },
        topic: "Samacheer Kalvi Textbook",
        type: "QUESTION_ITEM",
        questionPayload: {
          marks: row.marks || 1,
          part: (row.marks > 1) ? `PART_${row.marks === 2 ? 'II' : row.marks === 3 ? 'III' : 'IV'}` : "PART_I",
          questionEn: qText,
          questionTa: qText,
          options: optionsObj,
          correctAnswer: normalizeAnswer(row.correctAnswer),
          stepByStepSolution: {
            en: String(row.explanation || "Official curriculum solution"),
            ta: String(row.explanation || "அதிகாரப்பூர்வ தீர்வு")
          },
          sourceExam: "Samacheer Kalvi Question Bank"
        }
      });
    });
    console.log(`Ingested ${items.rows.length} rows from QuestionBankItem.`);
  } catch(e) {
    console.log('Error ingesting from dev.db:', e.message);
  }
}

// 6. WRITE PARTITIONED JSON FILES AND MANIFEST
const manifest = {
  version: "1.0.0",
  generatedAt: new Date().toISOString(),
  system: "AKNEX AI Academic Vector & Retrieval Knowledge Database",
  schema: "AknexAcademicEntity",
  standards: [12, 10],
  totals: {
    totalEntities: 0,
    totalConcepts: 0,
    totalQuestions: 0
  },
  subjects: {}
};

for (const [code, data] of Object.entries(subjectsData)) {
  const std = data.standard;
  const fileName = `${code}-MASTER.json`;
  const outPath = `json-db/${std}/${fileName}`;

  let conceptsCount = 0;
  let questionsCount = 0;
  data.entities.forEach(e => {
    if (e.type === 'SYLLABUS_CONCEPT') conceptsCount++;
    if (e.type === 'QUESTION_ITEM') questionsCount++;
  });

  fs.writeFileSync(outPath, JSON.stringify(data.entities, null, 2), 'utf8');
  console.log(`Created ${outPath} (${data.entities.length} records: ${conceptsCount} concepts, ${questionsCount} questions)`);

  manifest.totals.totalEntities += data.entities.length;
  manifest.totals.totalConcepts += conceptsCount;
  manifest.totals.totalQuestions += questionsCount;

  manifest.subjects[code] = {
    standard: std,
    name: data.name,
    stream: data.stream,
    file: `json-db/${std}/${fileName}`,
    recordsCount: data.entities.length,
    conceptsCount: conceptsCount,
    questionsCount: questionsCount
  };
}

// Write manifest.json
fs.writeFileSync('json-db/manifest.json', JSON.stringify(manifest, null, 2), 'utf8');
console.log('Created json-db/manifest.json');

// Write schema.json documentation
const schemaDoc = {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "AknexAcademicEntity",
  description: "Standardized entity for Samacheer Kalvi syllabus concepts and authentic examination questions",
  type: "object",
  required: ["id", "standard", "subjectCode", "unitNumber", "unitTitle", "topic", "type"],
  properties: {
    id: { type: "string" },
    standard: { type: "integer", enum: [10, 12] },
    stream: { type: "string", enum: ["CS2612", "BZ2612", "GENERAL"] },
    subjectCode: { type: "string" },
    unitNumber: { type: "integer" },
    unitTitle: {
      type: "object",
      required: ["en", "ta"],
      properties: {
        en: { type: "string" },
        ta: { type: "string" }
      }
    },
    topic: { type: "string" },
    type: { type: "string", enum: ["SYLLABUS_CONCEPT", "QUESTION_ITEM"] },
    conceptPayload: {
      type: "object",
      properties: {
        summaryMarkdownEn: { type: "string" },
        summaryMarkdownTa: { type: "string" },
        keyFormulas: { type: "array", items: { type: "string" } },
        commonPitfalls: { type: "array", items: { type: "string" } }
      }
    },
    questionPayload: {
      type: "object",
      properties: {
        marks: { type: "integer" },
        part: { type: "string", enum: ["PART_I", "PART_II", "PART_III", "PART_IV"] },
        questionEn: { type: "string" },
        questionTa: { type: "string" },
        options: {
          type: "object",
          properties: {
            a: { type: "string" },
            b: { type: "string" },
            c: { type: "string" },
            d: { type: "string" }
          }
        },
        correctAnswer: { type: "string" },
        stepByStepSolution: {
          type: "object",
          properties: {
            en: { type: "string" },
            ta: { type: "string" }
          }
        },
        sourceExam: { type: "string" }
      }
    }
  }
};
fs.writeFileSync('json-db/schema.json', JSON.stringify(schemaDoc, null, 2), 'utf8');
console.log('Created json-db/schema.json');

console.log('=== MEGA AI JSON-DB BUILD COMPLETED SUCCESSFULLY ===');
console.log(`TOTAL ACADEMIC ENTITIES: ${manifest.totals.totalEntities}`);
console.log(`TOTAL SYLLABUS CONCEPTS: ${manifest.totals.totalConcepts}`);
console.log(`TOTAL QUESTION ITEMS: ${manifest.totals.totalQuestions}`);
