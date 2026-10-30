import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// POST /api/admin/results/publish: Explicitly release and publish results to candidates
export async function POST(request) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "COE Admin authorization required." }, { status: 403 });
    }

    const body = await request.json();
    const { examScheduleId, isPublished = true } = body;

    if (!examScheduleId) {
      return NextResponse.json({ error: "examScheduleId is required." }, { status: 400 });
    }

    const exam = await db.examSchedule.findUnique({
      where: { id: examScheduleId },
    });

    if (!exam) {
      return NextResponse.json({ error: "Examination record not found." }, { status: 404 });
    }

    // Update all ExamResult records for this exam
    const updatedResults = await db.examResult.updateMany({
      where: { examScheduleId },
      data: { isPublished: Boolean(isPublished) },
    });

    // Advance exam phase to 9 ("Result Published") if publishing
    if (isPublished) {
      let ts = {};
      try { ts = JSON.parse(exam.phaseTimestamps || "{}"); } catch {}
      ts[9] = new Date().toISOString();
      await db.examSchedule.update({
        where: { id: exam.id },
        data: {
          phase: 9,
          status: "COMPLETED",
          phaseTimestamps: JSON.stringify(ts),
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: isPublished
        ? `Officially published results for ${updatedResults.count} candidate(s). Statements of marks are now visible to students.`
        : `Withdrew result publication for ${updatedResults.count} candidate(s).`,
      publishedCount: updatedResults.count,
      isPublished: Boolean(isPublished),
    });
  } catch (error) {
    console.error("[Publish Results Error]:", error);
    return NextResponse.json({ error: "Failed to update publication status." }, { status: 500 });
  }
}

