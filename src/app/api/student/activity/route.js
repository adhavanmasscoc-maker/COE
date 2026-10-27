import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { extractClientIp, parseDevice } from "@/lib/deviceTracker";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const session = await getCurrentSession();
    const body = await request.json().catch(() => ({}));

    // Allow logged-in student or preview rollNo
    const rollNo = session?.username || body.rollNo;
    const studentName = session?.fullName || body.studentName || rollNo || "Anonymous Candidate";

    if (!rollNo) {
      return NextResponse.json({ success: false, error: "No student identifier provided." }, { status: 400 });
    }

    const ip = extractClientIp(request);
    const userAgent = request.headers.get("user-agent") || body.userAgent || "";
    const device = parseDevice(userAgent);

    const action = String(body.action || "CLICK").toUpperCase();
    const details = String(body.details || "Candidate interaction registered.");
    const clientDuration = parseInt(body.durationSeconds, 10) || 0;
    const tabSwitchCount = parseInt(body.tabSwitchCount, 10) || 0;

    // Fetch student profile to get DOB and ID if not in session
    let profile = null;
    if (session?.profileId) {
      profile = await db.studentProfile.findUnique({
        where: { id: session.profileId },
        include: { user: { select: { username: true } } },
      });
    } else {
      profile = await db.studentProfile.findFirst({
        where: { user: { username: rollNo } },
        include: { user: { select: { username: true } } },
      });
    }

    // Find latest login time
    const latestLogin = await db.studentActivityLog.findFirst({
      where: { rollNo, action: "LOGIN" },
      orderBy: { createdAt: "desc" },
    });

    const now = new Date();
    let calculatedDuration = clientDuration;
    if (!calculatedDuration && latestLogin?.createdAt) {
      calculatedDuration = Math.max(0, Math.floor((now.getTime() - new Date(latestLogin.createdAt).getTime()) / 1000));
    }

    const log = await db.studentActivityLog.create({
      data: {
        studentId: profile?.id || null,
        rollNo: rollNo,
        studentName: profile?.fullName || studentName,
        dob: body.dob || null,
        ipAddress: ip,
        deviceType: device.deviceType,
        userAgent: userAgent,
        isMobile: device.isMobile,
        action: action,
        details: details,
        loginTime: latestLogin ? latestLogin.createdAt : null,
        logoutTime: action === "LOGOUT" ? now : null,
        durationSeconds: calculatedDuration,
        tabSwitchCount: tabSwitchCount,
      },
    });

    return NextResponse.json({
      success: true,
      logId: log.id,
      isMobile: device.isMobile,
      deviceType: device.deviceType,
    });
  } catch (error) {
    console.error("Student activity tracking error:", error);
    return NextResponse.json({ error: "Failed to record student activity telemetry." }, { status: 500 });
  }
}
