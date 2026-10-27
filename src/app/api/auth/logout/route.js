import { NextResponse } from "next/server";
import { COOKIE_NAME, getCurrentSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { extractClientIp, parseDevice } from "@/lib/deviceTracker";

export async function POST(request) {
  try {
    const session = await getCurrentSession();
    if (session && session.role === "STUDENT") {
      const ip = extractClientIp(request);
      const userAgent = request.headers.get("user-agent") || "";
      const device = parseDevice(userAgent);

      // Find the student's most recent login to calculate duration
      const latestLogin = await db.studentActivityLog.findFirst({
        where: { rollNo: session.username, action: "LOGIN" },
        orderBy: { createdAt: "desc" },
      });

      const now = new Date();
      let durationSecs = 0;
      if (latestLogin && latestLogin.createdAt) {
        durationSecs = Math.max(0, Math.floor((now.getTime() - new Date(latestLogin.createdAt).getTime()) / 1000));
      }

      await db.studentActivityLog.create({
        data: {
          studentId: session.profileId || null,
          rollNo: session.username,
          studentName: session.fullName || session.username,
          ipAddress: ip,
          deviceType: device.deviceType,
          userAgent: userAgent,
          isMobile: device.isMobile,
          action: "LOGOUT",
          details: `Candidate signed out of portal after ${Math.floor(durationSecs / 60)}m ${durationSecs % 60}s.`,
          loginTime: latestLogin ? latestLogin.createdAt : null,
          logoutTime: now,
          durationSeconds: durationSecs,
          tabSwitchCount: 0,
        },
      });
    }
  } catch (err) {
    console.warn("Could not record logout telemetry:", err.message);
  }

  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully.",
  });

  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0, // Immediately expire
  });

  return response;
}

