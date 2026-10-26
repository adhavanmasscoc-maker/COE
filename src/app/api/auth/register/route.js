import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Validation helpers
function sanitizeString(str) {
  if (typeof str !== "string") return "";
  return str.trim().replace(/[<>"'%;()&+]/g, "");
}

function isValidRollNo(rollNo) {
  // Format: TN followed by 4 digits, dash, 4 digits e.g. TN2026-0901
  return /^TN\d{4}-\d{4}$/.test(rollNo);
}

function isValidDate(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  return !isNaN(d.getTime()) && dateStr.match(/^\d{4}-\d{2}-\d{2}$/);
}

export async function POST(request) {
  try {
    const body = await request.json();

    // Extract and sanitize inputs
    const name = sanitizeString(body.name || "");
    const rollNo = sanitizeString(body.rollNo || "").toUpperCase();
    const dob = sanitizeString(body.dob || "");
    const language = body.language === "Tamil" ? "Tamil" : "English";

    // --- Input Validation ---
    if (!name || name.length < 2 || name.length > 100) {
      return NextResponse.json(
        { error: "Full name must be between 2 and 100 characters." },
        { status: 400 }
      );
    }

    if (!isValidRollNo(rollNo)) {
      return NextResponse.json(
        { error: "Invalid Roll Number format. Expected format: TN2026-0901" },
        { status: 400 }
      );
    }

    if (!isValidDate(dob)) {
      return NextResponse.json(
        { error: "Invalid date of birth. Please use YYYY-MM-DD format." },
        { status: 400 }
      );
    }

    // Age check: must be between 10 and 25 years
    const dobDate = new Date(dob);
    const today = new Date();
    const ageMs = today - dobDate;
    const ageYears = ageMs / (1000 * 60 * 60 * 24 * 365.25);
    if (ageYears < 10 || ageYears > 25) {
      return NextResponse.json(
        { error: "Date of birth does not meet age requirements (10–25 years)." },
        { status: 400 }
      );
    }

    // --- Check for duplicate Roll No ---
    const existing = await prisma.user.findUnique({
      where: { username: rollNo },
    });

    if (existing) {
      return NextResponse.json(
        { error: "This Roll Number is already registered. Please contact the COE if you believe this is an error." },
        { status: 409 }
      );
    }

    // Extract class assignments (Classes 1 to 12)
    const currentClass = Math.min(12, Math.max(1, parseInt(body.currentClass, 10) || 10));
    const examPrepClass = Math.min(12, Math.max(1, parseInt(body.examPrepClass, 10) || (currentClass === 9 ? 10 : currentClass === 11 ? 12 : currentClass)));
    const selectedSubjectCodes = Array.isArray(body.selectedSubjectCodes) ? body.selectedSubjectCodes : [];

    // --- Hash the DOB as password ---
    const passwordHash = await bcrypt.hash(dob, 12);

    // --- Create pending user and profile with requested subjects ---
    const newUser = await prisma.user.create({
      data: {
        username: rollNo,
        passwordHash,
        role: "PENDING", // Will be changed to "STUDENT" by COE upon approval
        profile: {
          create: {
            fullName: name,
            currentClass: currentClass,
            examPrepClass: examPrepClass,
            medium: language,
            board: "Tamil Nadu Samacheer Kalvi",
            academicYear: "2026–2027",
          },
        },
      },
      include: { profile: true },
    });

    // Automatically link selected subjects if provided
    if (selectedSubjectCodes.length > 0 && newUser.profile) {
      const matchedSubjects = await prisma.subject.findMany({
        where: {
          code: { in: selectedSubjectCodes },
        },
      });

      for (const sub of matchedSubjects) {
        await prisma.studentSubject.create({
          data: {
            studentId: newUser.profile.id,
            subjectId: sub.id,
          },
        }).catch(() => {});
      }
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Registration submitted. Your application is under review by the Controller of Examinations. You will be able to sign in once approved.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Registration API Error]", error);
    return NextResponse.json(
      { error: "An internal error occurred. Please try again later." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
