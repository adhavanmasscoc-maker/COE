import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// Helper to randomly sample N items from an array without replacement
function sampleRandom(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, array.length));
}

// GET /api/admin/exams: List all exams with subject info, question counts, and submission stats
export async function GET(request) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "COE Admin authorization required." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const prepClassParam = searchParams.get("prepClass");

    const whereClause = {};
    if (prepClassParam && prepClassParam !== "ALL") {
      whereClause.prepClass = parseInt(prepClassParam, 10);
    }

    const exams = await db.examSchedule.findMany({
      where: whereClause,
      include: {
        subject: { select: { id: true, name: true, code: true, prepClass: true, medium: true } },
        _count: {
          select: {
            questions: true,
            submissions: true,
            results: true,
          },
        },
      },
      orderBy: { examDate: "asc" },
    });

    // Count eligible registered students per class for accurate completed vs pending monitoring
    const studentsByClass = await db.studentProfile.groupBy({
      by: ["examPrepClass"],
      _count: { id: true },
    });
    const classCountMap = {};
    studentsByClass.forEach((s) => {
      classCountMap[s.examPrepClass] = s._count.id;
    });

    const enrichedExams = exams.map((exam) => {
      const totalEligible = classCountMap[exam.prepClass] || 0;
      const completedCount = exam._count?.submissions || 0;
      const pendingCount = Math.max(0, totalEligible - completedCount);
      return {
        ...exam,
        stats: {
          totalEligible,
          completedCount,
          pendingCount,
        },
      };
    });

    return NextResponse.json({ success: true, exams: enrichedExams });
  } catch (error) {
    console.error("Admin exams GET error:", error);
    return NextResponse.json({ error: "Internal server error loading exam schedules." }, { status: 500 });
  }
}

// POST /api/admin/exams: Create single or batch multi-subject exam schedules with random question sampling
export async function POST(request) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "COE Admin authorization required." }, { status: 403 });
    }

    const body = await request.json();
    const isBatch = Array.isArray(body.batch) && body.batch.length > 0;
    const examPayloads = isBatch ? body.batch : [body];

    const createdExams = [];

    for (const item of examPayloads) {
      const {
        subjectId,
        prepClass,
        examDate,
        resultPublishDelayMinutes,
        resultPublishDate,
        durationMinutes,
        totalMarks,
        instructions,
        status = "PUBLISHED",
        randomSelectCount,
      } = item;

      if (!subjectId || !prepClass || !examDate) {
        continue;
      }

      const pClass = parseInt(prepClass, 10);
      const marks = parseInt(totalMarks, 10) || 100;
      const duration = parseInt(durationMinutes, 10) || 150;

      // 1. Create the exam schedule with result publication timing controls
      const newSchedule = await db.examSchedule.create({
        data: {
          subjectId,
          prepClass: pClass,
          examDate: new Date(examDate),
          resultPublishDelayMinutes: resultPublishDelayMinutes !== undefined ? parseInt(resultPublishDelayMinutes, 10) : 0,
          resultPublishDate: resultPublishDate ? new Date(resultPublishDate) : null,
          durationMinutes: duration,
          totalMarks: marks,
          instructions: instructions || null,
          status: status || "PUBLISHED",
          phase: 3, // Live Published phase
        },
        include: {
          subject: { select: { id: true, name: true, code: true } },
        },
      });

      // 2. Random Question Selection from Subject's Question Bank (Phase 6)
      const targetCount = parseInt(randomSelectCount, 10) || (marks <= 25 ? 10 : marks <= 50 ? 15 : 20);
      const bankItems = await db.questionBankItem.findMany({
        where: { subjectId },
      });

      if (bankItems.length > 0) {
        const sampled = sampleRandom(bankItems, targetCount);
        const marksPerQ = Math.max(1, Math.round(marks / sampled.length));

        for (let i = 0; i < sampled.length; i++) {
          const bq = sampled[i];
          let parsedOptions = [];
          try {
            const rawOpts = JSON.parse(bq.options);
            if (Array.isArray(rawOpts)) {
              parsedOptions = rawOpts;
            } else {
              parsedOptions = Object.keys(rawOpts).map((k) => ({
                id: k.toUpperCase(),
                text: rawOpts[k],
              }));
            }
          } catch {
            parsedOptions = [
              { id: "A", text: "Option A" },
              { id: "B", text: "Option B" },
              { id: "C", text: "Option C" },
              { id: "D", text: "Option D" },
            ];
          }

          await db.examQuestion.create({
            data: {
              examScheduleId: newSchedule.id,
              questionNumber: i + 1,
              questionText: bq.questionText,
              marks: marksPerQ,
              options: JSON.stringify(parsedOptions),
              correctAnswer: bq.correctAnswer,
              explanation: bq.explanation,
              reviewStatus: "approved",
              source: "question_bank",
            },
          });
        }
      }

      createdExams.push(newSchedule);
    }

    return NextResponse.json(
      {
        success: true,
        count: createdExams.length,
        exams: createdExams,
        message: `Successfully created and published ${createdExams.length} examination schedule(s)!`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin exams POST error:", error);
    return NextResponse.json({ error: "Failed to create exam schedules: " + error.message }, { status: 500 });
  }
}
