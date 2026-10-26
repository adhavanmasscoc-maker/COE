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

    if (!payload || typeof payload !== "object") {
      return NextResponse.json(
        { error: "Invalid JSON payload." },
        { status: 400 }
      );
    }

    // Required fields validation with flexible duration parsing (e.g. 180, "180m", "3h")
    const subjectCode = (payload.subjectCode || "GEN-10").toUpperCase().trim();
    const prepClass = parseInt(payload.prepClass, 10) || 10;
    const rawDuration = payload.durationMinutes ?? payload.time ?? payload.duration ?? 180;
    const durationMinutes = parseFlexibleDuration(rawDuration) || 180;
    const totalMarks = parseInt(payload.totalMarks, 10) || 100;
    const examDateStr = payload.examDate || new Date().toISOString().split("T")[0];
    const startTimeStr = payload.startTime || "09:30 AM";
    const status = (payload.status === "DRAFT" || payload.publishSchedule === false) ? "DRAFT" : "PUBLISHED";
    const publishSyllabus = payload.publishSyllabus !== false; // defaults to true
    const instructions =
      payload.instructions ||
      "Dear candidate, take a deep breath. Read each question carefully and calmly. Manage your time with confidence. Best wishes for your success!";

    const examDateTime = parseDateTime12h(examDateStr, startTimeStr);

    // 1. Find or create Subject
    let subject = await db.subject.findUnique({
      where: { code: subjectCode },
    });

    if (!subject) {
      const subjectName = payload.subjectName || `${subjectCode} Examination`;
      subject = await db.subject.create({
        data: {
          code: subjectCode,
          name: subjectName,
          prepClass: prepClass,
          medium: payload.medium || "English",
        },
      });
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

    // 4. Create Questions if provided
    const questions = Array.isArray(payload.questions) ? payload.questions : [];
    let createdQuestionsCount = 0;
    let workedSolutionSteps = [];

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const qNum = q.questionNumber || i + 1;
      const qText = q.questionText || `Question ${qNum}`;
      const qMarks = parseInt(q.marks, 10) || 1;
      const qCorrect = q.correctAnswer ? String(q.correctAnswer).toUpperCase() : "A";
      const qExplanation = q.explanation || `Correct Answer: Option ${qCorrect}.`;

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
          paperType: payload.paperType || "MODEL",
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

    const durationHrs = Math.floor(durationMinutes / 60);
    const durationRemMins = durationMinutes % 60;
    const durationLabel = `${durationMinutes} mins (${durationHrs} hr${durationHrs !== 1 ? "s" : ""}${durationRemMins > 0 ? ` ${durationRemMins}m` : ""})`;

    return NextResponse.json({
      success: true,
      message: `Exam Schedule "${subject.name}" successfully created with ${createdQuestionsCount} questions and deployed as ${status}.`,
      examId: examSchedule.id,
      summary: {
        subject: `${subject.name} (${subject.code})`,
        prepClass: prepClass,
        examDate: examDateTime.toISOString(),
        duration: durationLabel,
        totalMarks: totalMarks,
        questionsCount: createdQuestionsCount,
        status: status,
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
