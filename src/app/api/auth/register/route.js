import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { db } from "@/lib/db";
import { createIncident } from "@/lib/incident";

// Validation helpers
function sanitizeString(str) {
  if (typeof str !== "string") return "";
  return str.trim().replace(/[<>"'%;()&+]/g, "");
}

function isValidRollNo(rollNo) {
  // Allow 4 to 16 alphanumeric characters, hyphens, and underscores
  return typeof rollNo === "string" && /^[A-Z0-9_-]{4,16}$/i.test(rollNo);
}

function isValidDate(dateStr) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  return !isNaN(d.getTime()) && dateStr.match(/^\d{4}-\d{2}-\d{2}$/);
}

export async function POST(request) {
  let rollNo = "";
  try {
    const body = await request.json();

    // Extract and sanitize inputs
    const name = sanitizeString(body.name || "");
    rollNo = sanitizeString(body.rollNo || "").toUpperCase();
    const dob = sanitizeString(body.dob || "");
    const language = body.language === "Tamil" ? "Tamil" : "English";

    // --- Input Validation ---
    if (!name || name.length < 2 || name.length > 100) {
      await createIncident({
        route: "/api/auth/register",
        rollNo: rollNo || "ANONYMOUS",
        step: "registration_validation",
        message: `Candidate registration failed: Full name validation error ("${name}").`,
      }).catch(() => {});

      return NextResponse.json(
        { error: "Full name must be between 2 and 100 characters." },
        { status: 400 }
      );
    }

    if (!isValidRollNo(rollNo)) {
      await createIncident({
        route: "/api/auth/register",
        rollNo: rollNo || "INVALID_FORMAT",
        step: "registration_validation",
        message: `Candidate registration failed: Invalid Roll Number format ("${rollNo}"). Must be 4-16 alphanumeric characters.`,
      }).catch(() => {});

      return NextResponse.json(
        { error: "Invalid Roll Number. Roll Number must be between 4 and 16 characters (numbers or letters e.g. TN2026-0901, ADHA2026, or 1001)." },
        { status: 400 }
      );
    }

    if (!isValidDate(dob)) {
      await createIncident({
        route: "/api/auth/register",
        rollNo: rollNo,
        step: "registration_validation",
        message: `Candidate registration failed for ${rollNo}: Invalid date of birth ("${dob}"). Format must be YYYY-MM-DD.`,
      }).catch(() => {});

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
      await createIncident({
        route: "/api/auth/register",
        rollNo: rollNo,
        step: "registration_validation",
        message: `Candidate registration failed for ${rollNo}: Age out of bounds (${ageYears.toFixed(1)} years). Required: 10-25 years.`,
      }).catch(() => {});

      return NextResponse.json(
        { error: "Date of birth does not meet age requirements (10–25 years)." },
        { status: 400 }
      );
    }

    // --- Check for duplicate Roll No ---
    const existing = await db.user.findUnique({
      where: { username: rollNo },
    });

    if (existing) {
      await createIncident({
        route: "/api/auth/register",
        rollNo: rollNo,
        step: "registration_duplicate",
        message: `Candidate registration conflict: Roll number ${rollNo} is already registered.`,
      }).catch(() => {});

      return NextResponse.json(
        { error: "This Roll Number is already registered. Please sign in or contact the COE if you believe this is an error." },
        { status: 409 }
      );
    }

    // Extract class assignments (Classes 1 to 12)
    const currentClass = Math.min(12, Math.max(1, parseInt(body.currentClass, 10) || 10));
    const examPrepClass = Math.min(12, Math.max(1, parseInt(body.examPrepClass, 10) || (currentClass === 9 ? 10 : currentClass === 11 ? 12 : currentClass)));
    const selectedSubjectCodes = Array.isArray(body.selectedSubjectCodes) ? body.selectedSubjectCodes : [];

    // --- Hash the DOB as password ---
    const passwordHash = await bcrypt.hash(dob, 12);

    // --- Save new user credentials to separate script text file for audit & records ---
    try {
      const timestamp = new Date().toISOString();
      const credRecord = `[${timestamp}] REGISTERED_CANDIDATE: RollNo="${rollNo}", Name="${name}", DOB="${dob}", CurrentClass=${currentClass}, PrepClass=${examPrepClass}, Medium="${language}"\n`;
      const scriptLogPath = path.join(process.cwd(), "scripts", "registered_candidates.txt");
      fs.appendFileSync(scriptLogPath, credRecord, "utf8");
    } catch (fsErr) {
      console.warn("Could not write to registered_candidates.txt:", fsErr.message);
    }

    // --- Create active student user and profile ---
    const newUser = await db.user.create({
      data: {
        username: rollNo,
        passwordHash,
        role: "STUDENT", // Immediately activated so candidate can register then login
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

    // Automatically link subjects:
    // If selectedSubjectCodes is provided, link those; otherwise link the standard core subjects
    const targetCodes = selectedSubjectCodes.length > 0
      ? selectedSubjectCodes
      : (examPrepClass === 10
          ? ["TAM-10", "ENG-10", "MAT-10", "SCI-10", "SOC-10"]
          : ["TAM-12", "ENG-12", "MAT-12", "PHY-12", "CHE-12", "CSC-12"]);

    if (newUser.profile && targetCodes.length > 0) {
      const matchedSubjects = await db.subject.findMany({
        where: {
          code: { in: targetCodes },
        },
      });

      for (const sub of matchedSubjects) {
        await db.studentSubject.create({
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
          `Candidate account ${rollNo} successfully registered! You can now sign in immediately using your Roll Number and Date of Birth.`,
        rollNo: rollNo,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Registration API Error]", error);
    await createIncident({
      route: "/api/auth/register",
      rollNo: rollNo || "UNKNOWN",
      step: "registration_exception",
      message: error?.message || "Internal server error during registration",
      raw: error?.stack,
    }).catch(() => {});

    return NextResponse.json(
      { error: "An internal error occurred during registration. The COE Help Panel has been notified." },
      { status: 500 }
    );
  }
}

