import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signSession, getSessionCookieOptions } from "@/lib/auth";
import { checkRateLimit, resetRateLimit } from "@/lib/rateLimit";

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required." },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim().toLowerCase();

    // 1. Rate limiting check
    const rateLimit = checkRateLimit(`admin_${cleanUsername}`);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `Too many failed attempts. Please wait ${rateLimit.retryAfterSeconds} seconds.`,
        },
        { status: 429 }
      );
    }

    // 2. Fetch admin user
    const user = await db.user.findFirst({
      where: {
        username: cleanUsername,
        role: "ADMIN",
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid administrative credentials." },
        { status: 401 }
      );
    }

    // 3. Compare password against hash
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        {
          error: `Invalid administrative credentials. ${rateLimit.remainingAttempts} attempts remaining.`,
        },
        { status: 401 }
      );
    }

    // 4. Reset rate limit
    resetRateLimit(`admin_${cleanUsername}`);

    // 5. Sign session token
    const sessionPayload = {
      userId: user.id,
      username: user.username,
      role: "ADMIN",
      fullName: "Controller of Examinations",
    };

    const token = await signSession(sessionPayload);

    // 6. Return response with HTTP-only cookie
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
