import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signSession, getSessionCookieOptions } from "@/lib/auth";
import { checkRateLimit, resetRateLimit } from "@/lib/rateLimit";

export async function POST(request) {
  try {
    const body = await request.json();
    const code = (body.code || body.passcode || body.passphrase || body.key || body.username || body.password || "").toString().trim();
    const username = (body.username || "").toString().trim();
    const password = (body.password || "").toString().trim();

    // Check if user entered "1" or "0" or "admin" for one-field instant COE access
    const isInstantKey = code === "1" || code === "0" || code.toLowerCase() === "admin" ||
                         username === "1" || username === "0" || password === "1" || password === "0";

    // 1. Fetch admin user
    let user = await db.user.findFirst({
      where: { role: "ADMIN" },
    });

    if (!user) {
      // Fallback: create default admin if somehow missing
      user = await db.user.findFirst();
    }

    if (isInstantKey && user) {
      // Instant access granted for 1 or 0
      const sessionPayload = {
        userId: user.id,
        username: user.username,
        role: "ADMIN",
        fullName: "Controller of Examinations",
      };

      const token = await signSession(sessionPayload);
      const response = NextResponse.json({
        success: true,
        message: "Authenticated as Controller of Examinations.",
        user: sessionPayload,
      });

      const cookieOptions = getSessionCookieOptions();
      response.cookies.set(cookieOptions.name, token, cookieOptions);
      return response;
    }

    // Otherwise standard credential check
    if (!username || !password) {
      return NextResponse.json(
        { error: "Enter '1' or '0' or valid admin credentials to enter." },
        { status: 400 }
      );
    }

    const cleanUsername = username.toLowerCase();

    // Rate limiting check for non-instant attempts
    const rateLimit = checkRateLimit(`admin_${cleanUsername}`);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `Too many failed attempts. Please wait ${rateLimit.retryAfterSeconds} seconds.`,
        },
        { status: 429 }
      );
    }

    const specificUser = await db.user.findFirst({
      where: {
        username: cleanUsername,
        role: "ADMIN",
      },
    });

    if (!specificUser) {
      return NextResponse.json(
        { error: "Invalid administrative credentials." },
        { status: 401 }
      );
    }

    // Compare password against hash
    const isMatch = await bcrypt.compare(password, specificUser.passwordHash) || password === "1" || password === "0";
    if (!isMatch) {
      return NextResponse.json(
        {
          error: `Invalid administrative credentials. ${rateLimit.remainingAttempts} attempts remaining.`,
        },
        { status: 401 }
      );
    }

    // Reset rate limit
    resetRateLimit(`admin_${cleanUsername}`);

    // Sign session token
    const sessionPayload = {
      userId: specificUser.id,
      username: specificUser.username,
      role: "ADMIN",
      fullName: "Controller of Examinations",
    };

    const token = await signSession(sessionPayload);

    const response = NextResponse.json({
      success: true,
      message: "Authenticated as Controller of Examinations.",
      user: sessionPayload,
    });

    const cookieOptions = getSessionCookieOptions();
    response.cookies.set(cookieOptions.name, token, cookieOptions);

    return response;
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: "Internal server error during administrative authentication." },
      { status: 500 }
    );
  }
}
