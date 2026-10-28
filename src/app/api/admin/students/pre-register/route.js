import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Access denied. Administrator privileges required." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      fullName,
      rollNo,
      password,
      currentClass = 10,
      examPrepClass = 10,
      medium = "English",
      dateOfBirth,
    } = body;

    if (!fullName?.trim() || !rollNo?.trim() || !password?.trim()) {
      return NextResponse.json(
        { error: "Full Name, Roll Number, and Password are required." },
        { status: 400 }
      );
    }

    const cleanRollNo = rollNo.trim().toUpperCase();
    const cleanName = fullName.trim();

    // Check if roll number already exists
    const existing = await db.user.findUnique({
      where: { username: cleanRollNo },
    });
    if (existing) {
      return NextResponse.json(
        { error: `A student with Roll Number ${cleanRollNo} already exists.` },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password.trim(), 10);

    // Create user and profile in a transaction
    const parsedCurrentClass = parseInt(currentClass, 10) || 10;
    const parsedPrepClass = parseInt(examPrepClass, 10) || 10;

    const user = await db.user.create({
      data: {
        username: cleanRollNo,
        passwordHash,
        role: "STUDENT",
        profile: {
          create: {
            fullName: cleanName,
            currentClass: parsedCurrentClass,
            examPrepClass: parsedPrepClass,
            medium: medium === "Tamil" ? "Tamil" : "English",
            board: "Tamil Nadu Samacheer Kalvi",
            academicYear: "2026–2027",
          },
        },
      },
      include: { profile: true },
    });

    // Link official subjects for this class
    const defaultCodes = parsedPrepClass === 10
      ? ["TAM-10", "ENG-10", "MAT-10", "SCI-10", "SOC-10"]
      : ["TAM-12", "ENG-12", "MAT-12", "PHY-12", "CHE-12", "CSC-12"];

    const subjects = await db.subject.findMany({
      where: { code: { in: defaultCodes } },
    });

    for (const sub of subjects) {
      await db.studentSubject.create({
        data: {
          studentId: user.profile.id,
          subjectId: sub.id,
        },
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      message: `Student ${cleanName} pre-registered successfully!`,
      student: {
        id: user.profile.id,
        userId: user.id,
        rollNo: user.username,
        fullName: user.profile.fullName,
        currentClass: user.profile.currentClass,
        examPrepClass: user.profile.examPrepClass,
        medium: user.profile.medium,
        academicYear: user.profile.academicYear,
      },
      credentials: {
        fullName: cleanName,
        rollNo: cleanRollNo,
        password: password.trim(),
        loginUrl: "/auth/login-student",
      },
    });
  } catch (error) {
    console.error("Pre-register student error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to pre-register student." },
      { status: 500 }
    );
  }
}

