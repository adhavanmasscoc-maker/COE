import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { db } from "@/lib/db";
import { signSession, getSessionCookieOptions } from "@/lib/auth";
import { checkRateLimit, resetRateLimit } from "@/lib/rateLimit";
import { extractClientIp, parseDevice } from "@/lib/deviceTracker";
import { createIncident } from "@/lib/incident";

// Helper to normalize dates consistently across register and login
function normalizeDate(dateStr) {
  if (!dateStr || typeof dateStr !== "string") return null;
  const cleaned = dateStr.trim();
  // Match YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
    const d = new Date(cleaned);
    if (!isNaN(d.getTime())) return cleaned;
  }
  // Match DD-MM-YYYY or DD/MM/YYYY
  const dmyMatch = cleaned.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, "0");
    const month = dmyMatch[2].padStart(2, "0");
    const year = dmyMatch[3];
    const iso = `${year}-${month}-${day}`;
    const d = new Date(iso);
    if (!isNaN(d.getTime())) return iso;
  }
  // Match YYYY/MM/DD
  const ymdMatch = cleaned.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (ymdMatch) {
    const year = ymdMatch[1];
    const month = ymdMatch[2].padStart(2, "0");
    const day = ymdMatch[3].padStart(2, "0");
    const iso = `${year}-${month}-${day}`;
    const d = new Date(iso);
    if (!isNaN(d.getTime())) return iso;
  }
  const d = new Date(cleaned);
  if (!isNaN(d.getTime())) {
    return d.toISOString().split("T")[0];
  }
  return null;
}

export async function POST(request) {
  let cleanRollNo = "";
  try {
    const body = await request.json();
    const candidateRollNo = body.rollNo || body.username || "";
    const candidateDob = body.dob || body.password || "";

    if (!candidateRollNo || !candidateDob) {
      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 400 }
      );
    }

    cleanRollNo = candidateRollNo.trim().toUpperCase();
    const rawDob = candidateDob.trim();
    const normalizedDob = normalizeDate(rawDob);

    // 1. Rate limiting check (max 5 failed attempts per roll number)
    const rateLimit = checkRateLimit(`student_${cleanRollNo}`);
    if (!rateLimit.allowed) {
      await createIncident({
        route: "/api/auth/login-student",
        rollNo: cleanRollNo,
        step: "login_rate_limit",
        message: `Student login blocked: rate limit exceeded for ${cleanRollNo} (retry after ${rateLimit.retryAfterSeconds}s).`,
      }).catch(() => {});

      return NextResponse.json(
        {
          error: `Too many failed login attempts. Please wait ${rateLimit.retryAfterSeconds} seconds before trying again.`,
        },
        { status: 429 }
      );
    }

    // 2. Fetch user case-insensitively
    const user = await db.user.findFirst({
      where: {
        OR: [
          { username: cleanRollNo },
          { username: candidateRollNo.trim() },
          { username: candidateRollNo.trim().toLowerCase() },
        ],
      },
      include: { profile: true },
    });

    if (!user || !user.profile) {
      // Save unregistered login attempt to audit log
      try {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] UNREGISTERED_STUDENT_LOGIN_ATTEMPT: RollNo="${cleanRollNo}", AttemptedDOB="${rawDob}"\n`;
        const logPath1 = path.join(process.cwd(), "unregistered_login_attempts.txt");
        const logPath2 = path.join(process.cwd(), "scripts", "unregistered_login_attempts.txt");
        fs.appendFileSync(logPath1, logEntry, "utf8");
        if (fs.existsSync(path.join(process.cwd(), "scripts"))) {
          fs.appendFileSync(logPath2, logEntry, "utf8");
        }
      } catch (logErr) {
        console.warn("Could not write to login attempts log file:", logErr.message);
      }

      await createIncident({
        route: "/api/auth/login-student",
        rollNo: cleanRollNo,
        step: "unregistered_login_attempt",
        message: `Unregistered candidate "${cleanRollNo}" attempted login. Candidate advised to register first.`,
      }).catch(() => {});

      // Standardized error message as requested in Phase 2.4
      return NextResponse.json(
        {
          error: "Invalid username or password.",
          isUnregistered: true,
          rollNo: cleanRollNo,
        },
        { status: 401 }
      );
    }

    // 2a. Block PENDING accounts with a clear message
    if (user.role === "PENDING") {
      return NextResponse.json(
        {
          error: "Your registration is pending COE approval. You will be notified once your account is activated.",
        },
        { status: 403 }
      );
    }

    // 2b. Ensure only STUDENT role can use this endpoint
    if (user.role !== "STUDENT") {
      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 401 }
      );
    }

    // 3. Compare DOB / password against bcrypt passwordHash
    // Try normalized date first, then raw string if normalized fails
    let isMatch = false;
    if (normalizedDob) {
      isMatch = await bcrypt.compare(normalizedDob, user.passwordHash);
    }
    if (!isMatch && rawDob) {
      isMatch = await bcrypt.compare(rawDob, user.passwordHash);
    }

    if (!isMatch) {
      await createIncident({
        route: "/api/auth/login-student",
        rollNo: cleanRollNo,
        step: "login_credential_mismatch",
        message: `Failed authentication for ${cleanRollNo}: Incorrect password/DOB supplied.`,
      }).catch(() => {});

      return NextResponse.json(
        {
          error: "Invalid username or password.",
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
      medium: user.profile.medium || "English",
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
          dob: normalizedDob || rawDob,
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
    await createIncident({
      route: "/api/auth/login-student",
      rollNo: cleanRollNo || "UNKNOWN",
      step: "login_exception",
      message: error?.message || "Internal server error during authentication",
      raw: error?.stack,
    }).catch(() => {});

    return NextResponse.json(
      { error: "Invalid username or password." },
      { status: 500 }
    );
  }
}
