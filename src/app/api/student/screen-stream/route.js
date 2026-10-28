import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { updateStreamFrame } from "@/lib/liveStreamStore";
import { createIncident } from "@/lib/incident";

export const dynamic = "force-dynamic";

/**
 * POST /api/student/screen-stream
 * Receives periodic compressed screen frame snapshot & proctoring status
 */
export async function POST(request) {
  try {
    const session = await getCurrentSession();
    const body = await request.json();
    const { examId, rollNo, studentName, frame, isLive, tabSwitchCount } = body;

    let targetRoll = rollNo;
    let targetName = studentName;

    if (session && session.role === "STUDENT") {
      const profile = await db.studentProfile.findUnique({
        where: { userId: session.userId },
        include: { user: { select: { username: true } } },
      });
      if (profile) {
        targetRoll = profile.user.username;
        targetName = profile.fullName;
      }
    }

    if (!targetRoll) {
      return NextResponse.json({ error: "Roll number is required." }, { status: 400 });
    }

    // Save latest frame in live stream store
    updateStreamFrame({
      rollNo: targetRoll,
      studentName: targetName,
      examId,
      frame,
      isLive: isLive !== false,
      tabSwitchCount: tabSwitchCount || 0,
    });

    // If student logged suspicious tab switch, alert COE Help Panel
    if (tabSwitchCount > 0 && tabSwitchCount % 3 === 0) {
      await createIncident({
        route: "/api/student/screen-stream",
        rollNo: targetRoll,
        step: "tab_switch_warning",
        message: `High tab switch alert: Candidate ${targetRoll} has switched away from the examination screen ${tabSwitchCount} times.`,
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, timestamp: Date.now() });
  } catch (err) {
    console.error("[Screen stream error]", err);
    return NextResponse.json({ error: "Failed to process screen frame." }, { status: 500 });
  }
}
