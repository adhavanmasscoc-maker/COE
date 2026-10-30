import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getAllActiveStreams } from "@/lib/liveStreamStore";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/live-streams
 * Fetches:
 * 1. Active screen video streams
 * 2. Active exam heartbeats (Official Board Exams)
 * 3. Unified deduplicated activeCandidates roster (Official Exams + Self-Study Practice Sessions)
 */
export async function GET(request) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "COE Admin authorization required." }, { status: 403 });
    }

    // 1. Fetch live screen streams
    const streams = getAllActiveStreams();
    const streamMap = new Map();
    for (const s of streams) {
      if (s.rollNo) streamMap.set(s.rollNo, s);
    }

    // 2. Fetch latest heartbeats within last 15 minutes
    const cutoff = new Date(Date.now() - 15 * 60 * 1000);
    const activeHeartbeats = await db.examHeartbeat.findMany({
      where: {
        createdAt: { gte: cutoff },
      },
      orderBy: { createdAt: "desc" },
      take: 60,
      include: {
        examSchedule: {
          include: {
            subject: { select: { name: true, code: true } },
            questions: { select: { id: true } },
          },
        },
      },
    });

    // 3. Fetch latest student activity logs within last 15 minutes
    const recentActivities = await db.studentActivityLog.findMany({
      where: {
        createdAt: { gte: cutoff },
        action: { in: ["EXAM_ACTIVE", "PRACTICE_ACTIVE", "LOGIN", "SUBMIT"] },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    // 4. Build unified deterministic active candidates roster
    const rosterMap = new Map();

    // First process active heartbeats (Official Board Exams)
    for (const hb of activeHeartbeats) {
      if (!rosterMap.has(hb.rollNo)) {
        const stream = streamMap.get(hb.rollNo);
        const totalQ = hb.examSchedule?.questions?.length || 25;
        const minsLeft = Math.floor((hb.timeLeftSecs || 0) / 60);
        const secsLeft = (hb.timeLeftSecs || 0) % 60;
        const timeDisplay = hb.timeLeftSecs > 0 ? `${minsLeft}m ${secsLeft}s left` : "Time expired";

        rosterMap.set(hb.rollNo, {
          rollNo: hb.rollNo,
          studentName: stream?.studentName || hb.rollNo,
          mode: "OFFICIAL_EXAM",
          examId: hb.examScheduleId,
          subjectCode: hb.examSchedule?.subject?.code || "EXAM",
          subjectName: hb.examSchedule?.subject?.name || "Official Examination",
          answeredCount: hb.answeredCount || 0,
          totalQuestions: totalQ,
          timeDisplay,
          status: hb.status === "warning" ? "WARNING" : "ACTIVE",
          deviceType: "Desktop",
          tabSwitchCount: stream?.tabSwitchCount || 0,
          hasStream: Boolean(stream?.isOnline),
          lastSeenAt: hb.createdAt,
        });
      }
    }

    // Next process activity logs (includes Self-Study Practice Sessions and Exam Telemetry)
    for (const log of recentActivities) {
      const existing = rosterMap.get(log.rollNo);
      let parsedDetails = {};
      try {
        parsedDetails = JSON.parse(log.details);
      } catch {
        parsedDetails = {};
      }

      if (log.action === "PRACTICE_ACTIVE") {
        if (!existing || existing.mode !== "OFFICIAL_EXAM") {
          const stream = streamMap.get(log.rollNo);
          const elapsedMins = Math.floor((log.durationSeconds || parsedDetails.secondsElapsed || 0) / 60);
          const elapsedSecs = (log.durationSeconds || parsedDetails.secondsElapsed || 0) % 60;

          rosterMap.set(log.rollNo, {
            rollNo: log.rollNo,
            studentName: log.studentName || stream?.studentName || log.rollNo,
            mode: "PRACTICE_TEST",
            examId: null,
            subjectCode: parsedDetails.subjectCode || "PRACTICE",
            subjectName: parsedDetails.subjectName || "Self-Study Practice",
            setName: parsedDetails.setName || "Practice Set",
            answeredCount: parsedDetails.answeredCount || 0,
            totalQuestions: parsedDetails.totalQuestions || 25,
            timeDisplay: `${elapsedMins}m ${elapsedSecs}s elapsed`,
            status: "ACTIVE",
            deviceType: log.deviceType || (log.isMobile ? "Mobile" : "Desktop"),
            ipAddress: log.ipAddress || "",
            tabSwitchCount: log.tabSwitchCount || stream?.tabSwitchCount || 0,
            hasStream: Boolean(stream?.isOnline),
            lastSeenAt: log.createdAt,
          });
        }
      } else if (log.action === "EXAM_ACTIVE" && existing) {
        // Enforce device and IP details onto existing official exam candidate
        if (log.deviceType) existing.deviceType = log.deviceType;
        if (log.ipAddress) existing.ipAddress = log.ipAddress;
        if (log.studentName && existing.studentName === existing.rollNo) existing.studentName = log.studentName;
        if (log.tabSwitchCount && log.tabSwitchCount > existing.tabSwitchCount) {
          existing.tabSwitchCount = log.tabSwitchCount;
          if (existing.tabSwitchCount > 2) existing.status = "WARNING";
        }
      } else if (!existing && log.action === "LOGIN") {
        const stream = streamMap.get(log.rollNo);
        rosterMap.set(log.rollNo, {
          rollNo: log.rollNo,
          studentName: log.studentName || stream?.studentName || log.rollNo,
          mode: "ONLINE_IDLE",
          examId: null,
          subjectCode: "-",
          subjectName: "Logged in / Active Session",
          answeredCount: 0,
          totalQuestions: 0,
          timeDisplay: "Idle",
          status: "IDLE",
          deviceType: log.deviceType || (log.isMobile ? "Mobile" : "Desktop"),
          ipAddress: log.ipAddress || "",
          tabSwitchCount: log.tabSwitchCount || 0,
          hasStream: Boolean(stream?.isOnline),
          lastSeenAt: log.createdAt,
        });
      }
    }

    const activeCandidates = Array.from(rosterMap.values()).sort(
      (a, b) => new Date(b.lastSeenAt).getTime() - new Date(a.lastSeenAt).getTime()
    );

    return NextResponse.json({
      success: true,
      streams,
      heartbeats: activeHeartbeats,
      activeCandidates,
      serverTime: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[Live streams GET error]", err);
    return NextResponse.json({ error: "Failed to load live screen streams." }, { status: 500 });
  }
}
