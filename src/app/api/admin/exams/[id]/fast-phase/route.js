import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request, { params }) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "COE Admin authorization required." }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();
    const { targetPhase = 10 } = body;

    const exam = await db.examSchedule.findUnique({
      where: { id },
      include: {
        subject: true,
        questions: true,
        submissions: {
          include: { student: true },
        },
      },
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam schedule not found." }, { status: 404 });
    }

    let existingTimestamps = {};
    try {
      existingTimestamps = exam.phaseTimestamps ? JSON.parse(exam.phaseTimestamps) : {};
    } catch {}

    const now = new Date().toISOString();

    // Stamp up to target phase
    for (let p = 1; p <= targetPhase; p++) {
      if (!existingTimestamps[p]) {
        existingTimestamps[p] = now;
      }
    }

    // If fast-forwarding to Phase 10: ensure results exist and exam is published
    if (targetPhase === 10) {
      // Create results for any submissions that lack one
      for (const sub of exam.submissions) {
        const existingResult = await db.examResult.findFirst({
          where: {
            studentId: sub.studentId,
            examScheduleId: exam.id,
          },
        });

        if (!existingResult) {
          const score = sub.score || 0;
          const totalMarks = exam.totalMarks || 100;
          const percentage = Math.round((score / totalMarks) * 100);
          const isPassed = percentage >= 35;
          const grade = percentage >= 90 ? "A+" : percentage >= 75 ? "A" : percentage >= 60 ? "B" : percentage >= 40 ? "C" : "D";

          await db.examResult.create({
            data: {
              studentId: sub.studentId,
              examScheduleId: exam.id,
              marksObtained: score,
              maxMarks: totalMarks,
              remarks: `Grade ${grade} (${percentage}%) • ${isPassed ? "PASSED" : "NEEDS IMPROVEMENT"}`,
              isPublished: true,
            },
          });
        } else if (!existingResult.isPublished) {
          await db.examResult.update({
            where: { id: existingResult.id },
            data: { isPublished: true },
          });
        }
      }

      await db.examSchedule.update({
        where: { id },
        data: {
          status: "PUBLISHED",
          phase: 9, // Database phase 9 = Result Published
          phaseTimestamps: JSON.stringify(existingTimestamps),
        },
      });
    } else if (targetPhase >= 4) {
      await db.examSchedule.update({
        where: { id },
        data: {
          status: "PUBLISHED",
          phase: targetPhase - 1,
          phaseTimestamps: JSON.stringify(existingTimestamps),
        },
      });
    } else {
      await db.examSchedule.update({
        where: { id },
        data: {
          phase: targetPhase - 1,
          phaseTimestamps: JSON.stringify(existingTimestamps),
        },
      });
    }

    const updatedExam = await db.examSchedule.findUnique({
      where: { id },
      include: {
        subject: { select: { id: true, name: true, code: true, prepClass: true } },
        _count: {
          select: {
            questions: true,
            submissions: true,
            results: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Exam advanced to Phase ${targetPhase}/10 successfully!`,
      exam: updatedExam,
    });
  } catch (error) {
    console.error("Fast phase advance error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to advance exam phase." },
      { status: 500 }
    );
  }
}

