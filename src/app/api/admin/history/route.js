import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return "0s";
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}

export async function GET(request) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Access denied. Administrator session required." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim();
    const actionFilter = searchParams.get("action");
    const deviceFilter = searchParams.get("device"); // "mobile", "desktop"
    const alertFilter = searchParams.get("alert"); // "tab_switch"
    const limit = Math.min(500, Math.max(10, parseInt(searchParams.get("limit"), 10) || 200));

    const whereClause = {};

    if (actionFilter && actionFilter !== "ALL") {
      whereClause.action = actionFilter;
    }

    if (deviceFilter === "mobile") {
      whereClause.isMobile = true;
    } else if (deviceFilter === "desktop") {
      whereClause.isMobile = false;
    }

    if (alertFilter === "tab_switch") {
      whereClause.tabSwitchCount = { gt: 0 };
    }

    if (search) {
      whereClause.OR = [
        { rollNo: { contains: search } },
        { studentName: { contains: search } },
        { ipAddress: { contains: search } },
        { details: { contains: search } },
        { action: { contains: search } },
        { deviceType: { contains: search } },
      ];
    }

    const logs = await db.studentActivityLog.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        student: {
          select: {
            fullName: true,
            examPrepClass: true,
            currentClass: true,
            medium: true,
            academicYear: true,
          },
        },
      },
    });

    // Compute telemetry stats
    const totalCount = await db.studentActivityLog.count();
    const mobileCount = await db.studentActivityLog.count({ where: { isMobile: true } });
    const desktopCount = await db.studentActivityLog.count({ where: { isMobile: false } });
    const tabSwitchAlerts = await db.studentActivityLog.count({ where: { tabSwitchCount: { gt: 0 } } });
    const distinctStudents = await db.studentActivityLog.groupBy({
      by: ["rollNo"],
    });

    const formattedLogs = logs.map((log) => {
      let integrityStatus = "CLEAN";
      let integrityBadge = "✅ Verified Mobile";
      if (log.tabSwitchCount > 0) {
        integrityStatus = "TAB_SWITCH_ALERT";
        integrityBadge = `⚠️ Tab Switched (${log.tabSwitchCount}x Help Suspected)`;
      } else if (!log.isMobile) {
        integrityStatus = "DESKTOP_ATTENDANCE";
        integrityBadge = "💻 Desktop Attended";
      }

      return {
        id: log.id,
        time: log.createdAt,
        totalDuration: formatDuration(log.durationSeconds),
        durationSeconds: log.durationSeconds,
        loginTime: log.loginTime || null,
        lastLoginTime: log.lastLoginTime || null,
        logoutTime: log.logoutTime || null,
        studentName: log.student?.fullName || log.studentName,
        username: log.rollNo,
        rollNo: log.rollNo,
        dob: log.dob || "Encrypted on File",
        ipAddress: log.ipAddress,
        deviceType: log.deviceType,
        isMobile: log.isMobile,
        action: log.action,
        details: log.details,
        tabSwitchCount: log.tabSwitchCount,
        integrityStatus,
        integrityBadge,
      };
    });

    return NextResponse.json({
      success: true,
      logs: formattedLogs,
      summary: {
        totalRecords: totalCount,
        displayedRecords: formattedLogs.length,
        mobileCount,
        desktopCount,
        mobileRatePercent: totalCount > 0 ? Math.round((mobileCount / totalCount) * 100) : 100,
        tabSwitchAlerts,
        uniqueStudentsActive: distinctStudents.length,
      },
    });
  } catch (error) {
    console.error("Admin history API error:", error);
    return NextResponse.json(
      { error: "Internal server error retrieving student device and click history." },
      { status: 500 }
    );
  }
}
