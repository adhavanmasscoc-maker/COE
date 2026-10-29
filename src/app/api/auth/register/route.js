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
  let rollNo = "";
  try {
    const body = await request.json();

    // Extract and sanitize inputs
    const name = sanitizeString(body.name || "");
    rollNo = sanitizeString(body.rollNo || "").toUpperCase();
    const rawDob = sanitizeString(body.dob || "");
    const language = body.language === "Tamil" ? "Tamil" : "English";

    // Auto-generate roll number if omitted
    if (!rollNo) {
      rollNo = `TN2026-${Math.floor(1000 + Math.random() * 9000)}`;
    }

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

    const dob = normalizeDate(rawDob);
    if (!dob) {
      await createIncident({
        route: "/api/auth/register",
        rollNo: rollNo,
        step: "registration_validation",
        message: `Candidate registration failed for ${rollNo}: Invalid date of birth ("${rawDob}").`,
      }).catch(() => {});

      return NextResponse.json(
        { error: "Invalid date of birth. Please enter a valid date (e.g. 2008-05-15 or 15-05-2008)." },
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

      const suggestedRollNo = `TN2026-${Math.floor(1000 + Math.random() * 9000)}`;
      return NextResponse.json(
        {
          error: `Roll Number "${rollNo}" is already registered. Please sign in or use a different roll number (e.g. ${suggestedRollNo}).`,
          isDuplicate: true,
          suggestedRollNo
        },
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
        language: language === "Tamil" ? "ta" : "en",
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

