import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// PATCH /api/admin/exams/[id]/date: Modify scheduled date & time with audit trail
export async function PATCH(request, { params }) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "COE Admin authorization required." }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();
    const { examDate, reason, resultPublishDelayMinutes, resultPublishDate } = body;

    if (!examDate) {
      return NextResponse.json({ error: "New examDate is required." }, { status: 400 });
    }

    const currentExam = await db.examSchedule.findUnique({
      where: { id },
      include: { subject: { select: { name: true, code: true } } },
    });

    if (!currentExam) {
      return NextResponse.json({ error: "Examination record not found." }, { status: 404 });
    }

    const oldDateStr = new Date(currentExam.examDate).toISOString();
    const newDateObj = new Date(examDate);
    const newDateStr = newDateObj.toISOString();

    const updateData = {
      examDate: newDateObj,
    };

    if (resultPublishDelayMinutes !== undefined) {
      updateData.resultPublishDelayMinutes = parseInt(resultPublishDelayMinutes, 10);
    }
    if (resultPublishDate !== undefined) {
      updateData.resultPublishDate = resultPublishDate ? new Date(resultPublishDate) : null;
    }

    // Update the exam schedule
    const updatedExam = await db.examSchedule.update({
      where: { id },
      data: updateData,
      include: {
        subject: { select: { name: true, code: true } },
      },
    });

    // Create immutable audit log entry in Turso
    const auditEntry = await db.examDateAuditLog.create({
      data: {
        examScheduleId: id,
        oldDate: oldDateStr,
        newDate: newDateStr,
        changedBy: session.username || "COE Admin",
        reason: reason?.trim() || "Rescheduled by Controller of Examinations",
      },
    });

    return NextResponse.json({
      success: true,
      message: `Exam date successfully updated for ${currentExam.subject?.name}.`,
      exam: updatedExam,
      auditLog: auditEntry,
    });
  } catch (error) {
    console.error("[Exam Date Update Error]:", error);
    return NextResponse.json(
      { error: "Failed to update exam date in database." },
      { status: 500 }
    );
  }
}

// GET /api/admin/exams/[id]/date: Fetch date change audit logs for this exam
export async function GET(request, { params }) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "COE Admin authorization required." }, { status: 403 });
    }

    const { id } = params;
    const logs = await db.examDateAuditLog.findMany({
      where: { examScheduleId: id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      logs,
    });
  } catch (error) {
    console.error("[Exam Date Audit GET Error]:", error);
    return NextResponse.json({ error: "Failed to load audit history." }, { status: 500 });
  }
}

