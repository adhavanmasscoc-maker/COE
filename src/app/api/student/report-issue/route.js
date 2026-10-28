import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { createIncident } from "@/lib/incident";

export const dynamic = "force-dynamic";

/**
 * POST /api/student/report-issue
 * Allows students to report problems directly to the COE Help Panel from exam hall or dashboard.
 */
export async function POST(request) {
  try {
    const session = await getCurrentSession();
    const body = await request.json();
    const { examId, rollNo, category, message, details } = body;

    let targetRoll = rollNo;
    let userId = session?.userId || null;
    let studentName = null;

    if (session && session.role === "STUDENT") {
      const studentProfile = await db.studentProfile.findUnique({
        where: { userId: session.userId },
        include: { user: { select: { username: true } } },
      });
      if (studentProfile) {
        targetRoll = studentProfile.user.username;
        studentName = studentProfile.fullName;
      }
    }

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: "Please describe the issue." }, { status: 400 });
    }

    const incidentMessage = `[${category || "GENERAL_EXAM_ISSUE"}] Candidate ${targetRoll || "Student"}${studentName ? ` (${studentName})` : ""}: ${message.trim()}${examId ? ` [ExamID: ${examId}]` : ""}${details ? ` Details: ${JSON.stringify(details)}` : ""}`;

    const incidentId = await createIncident({
      route: "/api/student/report-issue",
      userId,
      role: "STUDENT",
      rollNo: targetRoll || "UNKNOWN",
      step: category || "student_reported_problem",
      message: incidentMessage,
      raw: details ? JSON.stringify(details) : null,
    });

    return NextResponse.json({
      success: true,
      incidentId,
      message: "Your problem has been immediately transmitted to the COE Help Panel. Our technical controller has been notified.",
    });
  } catch (err) {
    console.error("[Student report-issue error]", err);
    return NextResponse.json({ error: "Could not send report to COE Help Panel." }, { status: 500 });
  }
}
