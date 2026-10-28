import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { createIncident } from "@/lib/incident";

export const dynamic = "force-dynamic";

/**
 * POST /api/student/heartbeat
 * Called every 20s during an active exam.
 * Writes a heartbeat row. A gap > 60s flags the student as disconnected
 * and creates a COE Help Panel incident.
 */
export async function POST(request) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "STUDENT") {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const body = await request.json();
    const { examId, answeredCount, timeLeftSecs } = body;

    if (!examId) {
      return NextResponse.json({ error: "examId is required." }, { status: 400 });
    }

    const studentProfile = await db.studentProfile.findUnique({
      where: { userId: session.userId },
      include: { user: { select: { username: true } } },
    });

    if (!studentProfile) {
      return NextResponse.json({ error: "Student profile not found." }, { status: 404 });
    }

    // Check last heartbeat — if > 60s old, flag a warning
    const lastBeat = await db.examHeartbeat.findFirst({
      where: { examScheduleId: examId, studentId: studentProfile.id },
      orderBy: { createdAt: "desc" },
    });

    let status = "alive";
    if (lastBeat) {
      const gapSecs = (Date.now() - new Date(lastBeat.createdAt).getTime()) / 1000;
      if (gapSecs > 90) {
        status = "warning";
        // Create COE help panel incident for missed heartbeat
        await createIncident({
          route: "/api/student/heartbeat",
          userId: session.userId,
          role: "STUDENT",
          rollNo: studentProfile.user.username,
          step: "exam_heartbeat",
          message: `Heartbeat gap ${Math.round(gapSecs)}s for ${studentProfile.user.username} on exam ${examId}. Possible connectivity issue.`,
        });
      }
    }

    await db.examHeartbeat.create({
      data: {
        examScheduleId: examId,
        studentId: studentProfile.id,
        rollNo: studentProfile.user.username,
        status,
        answeredCount: answeredCount ?? 0,
        timeLeftSecs: timeLeftSecs ?? 0,
      },
    });

    return NextResponse.json({ success: true, status, serverTime: new Date().toISOString() });
  } catch (err) {
    console.error("[Heartbeat error]", err);
    return NextResponse.json({ error: "Heartbeat failed." }, { status: 500 });
  }
}
