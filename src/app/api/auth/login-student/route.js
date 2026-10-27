import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { db } from "@/lib/db";
import { signSession, getSessionCookieOptions } from "@/lib/auth";
import { checkRateLimit, resetRateLimit } from "@/lib/rateLimit";
import { extractClientIp, parseDevice } from "@/lib/deviceTracker";

export async function POST(request) {
  try {
    const body = await request.json();
    const { rollNo, dob } = body;

    if (!rollNo || !dob) {
      return NextResponse.json(
        { error: "Roll Number and Date of Birth are both required." },
        { status: 400 }
      );
    }

    const cleanRollNo = rollNo.trim().toUpperCase();
    const cleanDob = dob.trim(); // Format: YYYY-MM-DD

    // 1. Rate limiting check (max 5 failed attempts per roll number)
    const rateLimit = checkRateLimit(`student_${cleanRollNo}`);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `Too many failed login attempts. Please wait ${rateLimit.retryAfterSeconds} seconds before trying again.`,
        },
        { status: 429 }
      );
    }

    // 2. Fetch user (any role — we'll check role after)
    const user = await db.user.findFirst({
      where: { username: cleanRollNo },
      include: { profile: true },
    });

    if (!user || !user.profile) {
      // Save unregistered login attempt to separate script text file
      try {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] UNREGISTERED_STUDENT_LOGIN_ATTEMPT: RollNo="${cleanRollNo}", AttemptedDOB="${cleanDob}"\n`;
        const logPath1 = path.join(process.cwd(), "unregistered_login_attempts.txt");
        const logPath2 = path.join(process.cwd(), "scripts", "unregistered_login_attempts.txt");
        fs.appendFileSync(logPath1, logEntry, "utf8");
        if (fs.existsSync(path.join(process.cwd(), "scripts"))) {
          fs.appendFileSync(logPath2, logEntry, "utf8");
        }
      } catch (logErr) {
        console.warn("Could not write to login attempts log file:", logErr.message);
      }

      return NextResponse.json(
        {
          error: `Roll Number "${cleanRollNo}" is not registered in the examination portal. Please register as a candidate first under "Register Candidate" before signing in.`,
          isUnregistered: true,
          rollNo: cleanRollNo,
        },
        { status: 404 }
      );
    }

    // 2a. Block PENDING accounts with a clear message
    if (user.role === "PENDING") {
      return NextResponse.json(
        {
          error:
            "Your registration is pending COE approval. You will be notified once your account is activated.",
        },
        { status: 403 }
      );
    }

    // 2b. Ensure only STUDENT role can use this endpoint
    if (user.role !== "STUDENT") {
      return NextResponse.json(
        { error: "Invalid Roll Number or credentials." },
        { status: 401 }
      );
    }

    // 3. Compare DOB against bcrypt passwordHash
    const isMatch = await bcrypt.compare(cleanDob, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        {
          error: `Incorrect Date of Birth. ${rateLimit.remainingAttempts} attempts remaining.`,
        },
        { status: 401 }
      );
    }

    // 4. Reset rate limiter on successful match
    resetRateLimit(`student_${cleanRollNo}`);

    // 5. Sign session token
    const sessionPayload = {
      userId: user.id,
      username: user.username,
      role: "STUDENT",
      profileId: user.profile.id,
      fullName: user.profile.fullName,
      currentClass: user.profile.currentClass,
      examPrepClass: user.profile.examPrepClass,
      board: user.profile.board,
      medium: user.profile.medium,
    };

    const token = await signSession(sessionPayload);

    // 6. Record student login telemetry in SQLite database
    try {
      const ip = extractClientIp(request);
      const userAgent = request.headers.get("user-agent") || "";
      const device = parseDevice(userAgent);

      // Find previous login to record lastLoginTime
      const prevLogin = await db.studentActivityLog.findFirst({
        where: { rollNo: cleanRollNo, action: "LOGIN" },
        orderBy: { createdAt: "desc" },
      });

      await db.studentActivityLog.create({
        data: {
          studentId: user.profile.id,
          rollNo: cleanRollNo,
          studentName: user.profile.fullName,
          dob: cleanDob,
          ipAddress: ip,
          deviceType: device.deviceType,
          userAgent: userAgent,
          isMobile: device.isMobile,
          action: "LOGIN",
          details: device.isMobile
            ? "Candidate successfully authenticated via Mobile Device."
            : "Candidate logged in via Desktop device.",
          loginTime: new Date(),
          lastLoginTime: prevLogin ? prevLogin.createdAt : null,
          durationSeconds: 0,
          tabSwitchCount: 0,
        },
      });
    } catch (telemetryErr) {
      console.warn("Could not log student login telemetry:", telemetryErr.message);
    }

    // 7. Return response with HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      message: `Welcome, ${user.profile.fullName}!`,
      user: sessionPayload,
    });

    const cookieOptions = getSessionCookieOptions();
    response.cookies.set(cookieOptions.name, token, cookieOptions);

    return response;
  } catch (error) {
    console.error("Student login error:", error);
    return NextResponse.json(
      { error: "Internal server error during authentication." },
      { status: 500 }
    );
  }
}
