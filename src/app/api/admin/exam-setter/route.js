import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

function parseDateTime12h(dateStr, timeStr) {
  try {
    const baseDate = dateStr ? new Date(dateStr) : new Date();
    if (!timeStr) return baseDate;

    // Handle formats like "09:30 AM", "2:00 PM", "14:30"
    const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
    if (!match) return baseDate;

    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const ampm = match[3] ? match[3].toUpperCase() : null;

    if (ampm === "PM" && hours < 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;

    baseDate.setHours(hours, minutes, 0, 0);
    return baseDate;
  } catch {
    return new Date();
  }
}

function parseFlexibleDuration(val) {
  if (typeof val === "number" && !isNaN(val)) return val;
  if (typeof val === "string") {
    const trimmed = val.trim();
    const hMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hours)$/i);
    if (hMatch) return Math.round(parseFloat(hMatch[1]) * 60);
    const mMatch = trimmed.match(/^(\d+)\s*(?:m|min|mins|minutes)?$/i);
    if (mMatch) return parseInt(mMatch[1], 10);
  }
  return 180;
}

const DEFAULT_SUBJECT_NAMES = {
  "CSC-12": "Computer Science",
  "MAT-10": "Mathematics",
  "PHY-12": "Physics",
  "CHE-12": "Chemistry",
  "BIO-12": "Biology / Mathematics",
  "BOT-12": "Botany",
  "ZOO-12": "Zoology",
  "COM-12": "Commerce",
  "ACC-12": "Accountancy",
  "ECO-12": "Economics",
  "TAM-10": "Language (Tamil)",
  "ENG-10": "English",
  "SCI-10": "Science",
  "SOC-10": "Social Science",
  "TAM-12": "Language (Tamil)",
  "ENG-12": "English",
};

async function processSingleExam(payload) {
  const subjectCode = (payload.subjectCode || "GEN-10").toUpperCase().trim();
  const prepClass = parseInt(payload.prepClass ?? payload.standard, 10) || 10;
  const rawDuration = payload.durationMinutes ?? payload.time ?? payload.duration ?? 180;
  const durationMinutes = parseFlexibleDuration(rawDuration) || 180;
  const totalMarks = parseInt(payload.totalMarks, 10) || 100;
  const examDateStr = payload.examDate || new Date().toISOString().split("T")[0];
  const startTimeStr = payload.startTime || "09:30 AM";
  const status =
    payload.status === "DRAFT" || payload.publishSchedule === false ? "DRAFT" : "PUBLISHED";
  const instructions =
    payload.instructions ||
    "Dear candidate, take a deep breath. Read each question carefully and calmly. Manage your time with confidence. Best wishes for your success!";

  const examDateTime = parseDateTime12h(examDateStr, startTimeStr);

  // 1. Find or create Subject
  let subject = await db.subject.findUnique({
    where: { code: subjectCode },
  });

  if (!subject) {
    const subjectName =
      payload.subjectName || DEFAULT_SUBJECT_NAMES[subjectCode] || `${subjectCode} Examination`;
    subject = await db.subject.create({
      data: {
        code: subjectCode,
        name: subjectName,
        prepClass: prepClass,
        medium: payload.medium || "English",
      },
    });
  }

  // 1b. Automatically link this subject to all active students of that prepClass
  const targetStudents = await db.studentProfile.findMany({
    where: { examPrepClass: prepClass },
  });
  for (const st of targetStudents) {
    const alreadyLinked = await db.studentSubject.findFirst({
      where: { studentId: st.id, subjectId: subject.id },
    });
    if (!alreadyLinked) {
      await db.studentSubject.create({
        data: {
          studentId: st.id,
          subjectId: subject.id,
        },
      }).catch(() => {});
    }
  }

  // 2. Optionally import/enrich syllabus units & chapters
  if (Array.isArray(payload.syllabusUnits) && payload.syllabusUnits.length > 0) {
    for (const u of payload.syllabusUnits) {
      let unit = await db.syllabusUnit.findFirst({
        where: {
          subjectId: subject.id,
          unitNumber: u.unitNumber || 1,
        },
      });

      if (!unit) {
        unit = await db.syllabusUnit.create({
          data: {
            subjectId: subject.id,
            unitNumber: u.unitNumber || 1,
            title: u.title || `Unit ${u.unitNumber || 1}`,
          },
        });
      }

      if (Array.isArray(u.chapters)) {
        for (const ch of u.chapters) {
          const chNum = ch.chapterNumber || 1;
          const existingCh = await db.syllabusChapter.findFirst({
            where: { unitId: unit.id, chapterNumber: chNum },
          });

          if (!existingCh) {
            await db.syllabusChapter.create({
              data: {
                unitId: unit.id,
                chapterNumber: chNum,
                title: ch.title || `Chapter ${chNum}`,
                description: ch.description || null,
              },
            });
          }
        }
      }
    }
  }

  // 3. Create the Exam Schedule
  const examSchedule = await db.examSchedule.create({
    data: {
      subjectId: subject.id,
      prepClass: prepClass,
      examDate: examDateTime,
      durationMinutes: durationMinutes,
      totalMarks: totalMarks,
      instructions: instructions,
      status: status,
    },
  });

  // 4. Create Questions if provided (support direct questions or questions nested in sections)
  let questions = Array.isArray(payload.questions) ? [...payload.questions] : [];
  if (questions.length === 0 && Array.isArray(payload.sections)) {
    for (const sec of payload.sections) {
      if (Array.isArray(sec.questions)) {
        questions.push(...sec.questions);
      }
    }
  }

  const evalKey = payload.postExamEvaluationKey || {};
  let createdQuestionsCount = 0;
  let workedSolutionSteps = [];

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const rawNum = typeof q.questionNumber === "number" ? q.questionNumber : parseInt(String(q.questionNumber || "").replace(/\D/g, ""), 10);
    const qNum = (!isNaN(rawNum) && rawNum > 0) ? rawNum : (i + 1);
    let qText = q.questionText || `Question ${qNum}`;
    if (typeof q.questionNumber === "string" && !qText.startsWith(q.questionNumber)) {
      qText = `[Q.${q.questionNumber}] ${qText}`;
    }
    const qMarks = parseInt(q.marks, 10) || 1;
    
    // Check direct answer or lookup from postExamEvaluationKey
    const keyInfo = (q.questionId && evalKey[q.questionId]) ? evalKey[q.questionId] : {};
    const qCorrect = q.correctAnswer
      ? String(q.correctAnswer).toUpperCase()
      : (keyInfo.correctOption ? String(keyInfo.correctOption).toUpperCase() : "A");

    const qExplanation =
      q.explanation ||
      keyInfo.explanation ||
      (keyInfo.modelAnswer ? keyInfo.modelAnswer : `Correct Answer: Option ${qCorrect}. Verified by COE Examination Board.`);

    // Standardize options
    let formattedOptions = [];
    if (Array.isArray(q.options)) {
      formattedOptions = q.options.map((opt, optIdx) => {
        if (typeof opt === "string") {
          const letter = String.fromCharCode(65 + optIdx);
          return { id: letter, text: opt };
        }
        return {
          id: opt.id ? String(opt.id).toUpperCase() : String.fromCharCode(65 + optIdx),
          text: opt.text || String(opt),
        };
      });
    } else {
      formattedOptions = [
        { id: "A", text: "Option A" },
        { id: "B", text: "Option B" },
        { id: "C", text: "Option C" },
        { id: "D", text: "Option D" },
      ];
    }

    await db.examQuestion.create({
      data: {
        examScheduleId: examSchedule.id,
        questionNumber: qNum,
        questionText: qText,
        marks: qMarks,
        options: JSON.stringify(formattedOptions),
        correctAnswer: qCorrect,
        explanation: qExplanation,
      },
    });
    createdQuestionsCount++;

    workedSolutionSteps.push(
      `### Question ${qNum} (${qMarks} Mark${qMarks > 1 ? "s" : ""})\n${qText}\n\n**Correct Option**: \`${qCorrect}\`\n\n**Explanation & Derivation**:\n${qExplanation}`
    );
  }

  // 5. Automatically create a QuestionPaper & WorkedSolution entry
  try {
    const paperYear = examDateTime.getFullYear() || 2026;
    const paperTitle = payload.examTitle || `${subject.name} Official Examination ${paperYear}`;

    const qp = await db.questionPaper.create({
      data: {
        subjectId: subject.id,
        prepClass: prepClass,
        examYear: paperYear,
        title: paperTitle,
        board: "Tamil Nadu State Board",
        sourceInfo: payload.sourceInfo || "Official COE Exam Engine JSON Formulation",
        paperType: payload.paperType || "PUBLIC_EXAM",
        maxMarks: totalMarks,
        durationMinutes: durationMinutes,
        isPublished: status === "PUBLISHED",
      },
    });

    if (workedSolutionSteps.length > 0) {
      await db.workedSolution.create({
        data: {
          questionPaperId: qp.id,
          title: `COE Official Worked Solution — ${paperTitle}`,
          solutionType: "TEXT_STEP_BY_STEP",
          content: workedSolutionSteps.join("\n\n---\n\n"),
          isPublished: status === "PUBLISHED",
        },
      });
    }
  } catch (paperErr) {
    console.warn("Notice: QuestionPaper link skipped or existing:", paperErr.message);
  }

  return {
    examScheduleId: examSchedule.id,
    subjectCode: subject.code,
    subjectName: subject.name,
    prepClass: prepClass,
    examDate: examDateTime.toISOString(),
    durationMinutes: durationMinutes,
    totalMarks: totalMarks,
    questionsCount: createdQuestionsCount,
    status: status,
  };
}

export async function POST(request) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Access denied. Administrator privileges required." },
        { status: 403 }
      );
    }

    const payload = await request.json();

    if (!payload || (typeof payload !== "object" && !Array.isArray(payload))) {
      return NextResponse.json(
        { error: "Invalid JSON payload. Expected an object or an array of exams." },
        { status: 400 }
      );
    }

    // Support ARRAY of exams
    if (Array.isArray(payload)) {
      if (payload.length === 0) {
        return NextResponse.json({ error: "Empty array provided." }, { status: 400 });
      }

      const results = [];
      let totalQuestions = 0;
      for (const item of payload) {
        const itemResult = await processSingleExam(item);
        results.push(itemResult);
        totalQuestions += itemResult.questionsCount;
      }

      return NextResponse.json({
        success: true,
        message: `Successfully ingested batch of ${results.length} exams with ${totalQuestions} questions into SQLite dev.db. All linked to Class ${results[0]?.prepClass || 12} students.`,
        summary: {
          examsCount: results.length,
          questionsCount: totalQuestions,
          subject: results.map((r) => r.subjectCode).join(", "),
          status: results[0]?.status,
        },
        exams: results,
      });
    }

    // Support SINGLE exam object
    const res = await processSingleExam(payload);
    const durationHrs = Math.floor(res.durationMinutes / 60);
    const durationRemMins = res.durationMinutes % 60;
    const durationLabel = `${res.durationMinutes} mins (${durationHrs} hr${durationHrs !== 1 ? "s" : ""}${durationRemMins > 0 ? ` ${durationRemMins}m` : ""})`;

    return NextResponse.json({
      success: true,
      message: `Exam Schedule "${res.subjectName}" successfully created with ${res.questionsCount} questions and deployed as ${res.status}.`,
      examId: res.examScheduleId,
      summary: {
        subject: `${res.subjectName} (${res.subjectCode})`,
        prepClass: res.prepClass,
        examDate: res.examDate,
        duration: durationLabel,
        totalMarks: res.totalMarks,
        questionsCount: res.questionsCount,
        status: res.status,
      },
    });
  } catch (error) {
    console.error("[Exam Setter API Error]", error);
    return NextResponse.json(
      { error: `Failed to set exam from JSON: ${error.message}` },
      { status: 500 }
    );
  }
}
