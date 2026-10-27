import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Access denied. Administrator privileges required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { type, data } = body;

    if (!Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        { error: "Invalid or empty import dataset. Expected an array of records." },
        { status: 400 }
      );
    }

    let importedCount = 0;
    let questionsCount = 0;

    // ── 1. Batch Import for Examinations ──────────────────────────────
    if (type === "exams") {
      for (const item of data) {
        const subjectCode = (item.subjectCode || "CSC-12").toUpperCase().trim();
        const prepClass = parseInt(item.prepClass ?? item.standard, 10) || 12;
        const examDate = item.examDate ? new Date(item.examDate) : new Date();
        const durationMinutes = parseInt(item.durationMinutes, 10) || 60;
        const totalMarks = parseInt(item.totalMarks, 10) || 15;
        const status = item.status === "DRAFT" ? "DRAFT" : "PUBLISHED";
        const instructions =
          item.instructions ||
          "Dear candidate, take a deep breath. Read each question carefully and calmly. Manage your time with confidence. Best wishes for your success!";

        // Find or create Subject
        let subject = await db.subject.findUnique({
          where: { code: subjectCode },
        });

        if (!subject) {
          const defaultSubjectNames = {
            "CSC-12": "Computer Science",
            "MAT-10": "Mathematics",
            "PHY-12": "Physics",
            "CHE-12": "Chemistry",
            "BIO-12": "Biology / Mathematics",
            "TAM-10": "Language (Tamil)",
            "ENG-10": "English",
            "SCI-10": "Science",
            "SOC-10": "Social Science",
            "TAM-12": "Language (Tamil)",
            "ENG-12": "English",
          };
          subject = await db.subject.create({
            data: {
              code: subjectCode,
              name: defaultSubjectNames[subjectCode] || `${subjectCode} Subject`,
              prepClass: prepClass,
              medium: item.medium || "English",
            },
          });
        }

        // Auto-link subject to all active students of that prepClass
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

        // Create or update ExamSchedule
        const schedule = await db.examSchedule.create({
          data: {
            subjectId: subject.id,
            prepClass: prepClass,
            examDate: examDate,
            durationMinutes: durationMinutes,
            totalMarks: totalMarks,
            instructions: instructions,
            status: status,
          },
        });

        // Create Questions (support direct questions or questions nested in sections)
        let questionsToImport = Array.isArray(item.questions) ? [...item.questions] : [];
        if (questionsToImport.length === 0 && Array.isArray(item.sections)) {
          for (const sec of item.sections) {
            if (Array.isArray(sec.questions)) {
              questionsToImport.push(...sec.questions);
            }
          }
        }

        const evalKey = item.postExamEvaluationKey || {};
        if (questionsToImport.length > 0) {
          for (let i = 0; i < questionsToImport.length; i++) {
            const q = questionsToImport[i];
            const rawNum = typeof q.questionNumber === "number" ? q.questionNumber : parseInt(String(q.questionNumber || "").replace(/\D/g, ""), 10);
            const qNum = (!isNaN(rawNum) && rawNum > 0) ? rawNum : (i + 1);
            let qText = q.questionText || `Question ${qNum}`;
            if (typeof q.questionNumber === "string" && !qText.startsWith(q.questionNumber)) {
              qText = `[Q.${q.questionNumber}] ${qText}`;
            }
            const qMarks = parseInt(q.marks, 10) || 1;
            
            const keyInfo = (q.questionId && evalKey[q.questionId]) ? evalKey[q.questionId] : {};
            const qCorrect = q.correctAnswer
              ? String(q.correctAnswer).toUpperCase()
              : (keyInfo.correctOption ? String(keyInfo.correctOption).toUpperCase() : "A");

            const qExplanation =
              q.explanation ||
              keyInfo.explanation ||
              (keyInfo.modelAnswer ? keyInfo.modelAnswer : `Correct Answer: Option ${qCorrect}. Verified by COE Examiner.`);

            let formattedOptions = [];
            if (Array.isArray(q.options)) {
              formattedOptions = q.options.map((opt, optIdx) => {
                if (typeof opt === "string") {
                  return { id: String.fromCharCode(65 + optIdx), text: opt };
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
                examScheduleId: schedule.id,
                questionNumber: qNum,
                questionText: qText,
                marks: qMarks,
                options: JSON.stringify(formattedOptions),
                correctAnswer: qCorrect,
                explanation: qExplanation,
              },
            });
            questionsCount++;
          }
        }

        // Create QuestionPaper record
        const examYear = examDate.getFullYear() || 2026;
        await db.questionPaper.create({
          data: {
            subjectId: subject.id,
            prepClass: prepClass,
            examYear: examYear,
            title: item.title || `${subject.name} Public Examination ${examYear}`,
            board: "Tamil Nadu State Board",
            sourceInfo: "Official COE Batch Import Engine",
            paperType: "PUBLIC_EXAM",
            maxMarks: totalMarks,
            durationMinutes: durationMinutes,
            isPublished: status === "PUBLISHED",
          },
        }).catch(() => {});

        importedCount++;
      }

      return NextResponse.json({
        success: true,
        message: `Successfully imported ${importedCount} examination schedules with ${questionsCount} questions into SQLite dev.db. All linked to Class ${data[0]?.prepClass || 12} students.`,
        importedCount,
        questionsCount,
      });
    }

    // ── 2. Batch Import for Syllabus ──────────────────────────────────
    if (type === "syllabus") {
      for (const item of data) {
        const subjectCode = (item.subjectCode || "GEN").toUpperCase().trim();
        const prepClass = parseInt(item.prepClass, 10) || 10;

        let subject = await db.subject.findUnique({
          where: { code: subjectCode },
        });

        if (!subject) {
          subject = await db.subject.create({
            data: {
              code: subjectCode,
              name: item.name || `${subjectCode} Subject`,
              prepClass: prepClass,
              medium: item.medium || "English",
            },
          });
        }

        if (Array.isArray(item.units)) {
          for (const u of item.units) {
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
        importedCount++;
      }

      return NextResponse.json({
        success: true,
        message: `Successfully imported syllabus curriculum for ${importedCount} subjects into SQLite.`,
        importedCount,
      });
    }

    // ── 3. Batch Import for Question Papers ───────────────────────────
    if (type === "papers") {
      for (const item of data) {
        const subjectCode = (item.subjectCode || "GEN-10").toUpperCase().trim();
        let subject = await db.subject.findUnique({ where: { code: subjectCode } });
        if (!subject) {
          subject = await db.subject.create({
            data: {
              code: subjectCode,
              name: item.subjectName || `${subjectCode} Subject`,
              prepClass: parseInt(item.prepClass, 10) || 10,
              medium: "English",
            },
          });
        }

        const paper = await db.questionPaper.create({
          data: {
            subjectId: subject.id,
            prepClass: parseInt(item.prepClass, 10) || 10,
            examYear: parseInt(item.examYear, 10) || 2026,
            title: item.title || `${subject.name} Examination Paper`,
            board: item.board || "Tamil Nadu State Board",
            sourceInfo: item.sourceInfo || "COE Archive",
            paperType: item.paperType || "MODEL",
            maxMarks: parseInt(item.maxMarks, 10) || 100,
            durationMinutes: parseInt(item.durationMinutes, 10) || 180,
            isPublished: true,
          },
        });

        if (item.workedSolution) {
          await db.workedSolution.create({
            data: {
              questionPaperId: paper.id,
              solutionContent: item.workedSolution,
              verifiedBy: "COE Examiner Board",
            },
          }).catch(() => {});
        }
        importedCount++;
      }

      return NextResponse.json({
        success: true,
        message: `Successfully imported ${importedCount} question papers into SQLite.`,
        importedCount,
      });
    }

    return NextResponse.json(
      { error: `Unknown import type '${type}'. Expected 'exams', 'syllabus', or 'papers'.` },
      { status: 400 }
    );
  } catch (error) {
    console.error("Batch import API error:", error);
    return NextResponse.json(
      { error: "Internal server error during batch import: " + error.message },
      { status: 500 }
    );
  }
}
