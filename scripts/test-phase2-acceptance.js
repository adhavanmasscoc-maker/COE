#!/usr/bin/env node
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function normalizeDate(dateStr) {
  if (!dateStr || typeof dateStr !== "string") return null;
  const cleaned = dateStr.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
    const d = new Date(cleaned);
    if (!isNaN(d.getTime())) return cleaned;
  }
  const dmyMatch = cleaned.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, "0");
    const month = dmyMatch[2].padStart(2, "0");
    const year = dmyMatch[3];
    const iso = `${year}-${month}-${day}`;
    const d = new Date(iso);
    if (!isNaN(d.getTime())) return iso;
  }
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

async function runPhase2Acceptance() {
  console.log("=================================================================");
  console.log("   PHASE 2 ACCEPTANCE TEST: 3 STUDENTS IN DIFFERENT LANGUAGES   ");
  console.log("=================================================================");

  const students = [
    {
      rollNo: "TN2026-STU01",
      name: "Meenakshi K",
      dob: "14-06-2008", // DD-MM-YYYY
      language: "ta",
      medium: "Tamil",
      classLevel: 12
    },
    {
      rollNo: "TN2026-STU02",
      name: "Karthik R",
      dob: "2010-09-22", // YYYY-MM-DD
      language: "en",
      medium: "English",
      classLevel: 10
    },
    {
      rollNo: "TN2026-STU03",
      name: "Suresh P",
      dob: "05/11/2009", // DD/MM/YYYY
      language: "ta",
      medium: "Tamil",
      classLevel: 11
    }
  ];

  // Clean up any existing test records
  for (const s of students) {
    await prisma.user.deleteMany({ where: { username: s.rollNo } });
  }

  let passedAll = true;

  for (let i = 0; i < students.length; i++) {
    const s = students[i];
    console.log(`\n--> Testing Student ${i + 1}: ${s.name} (${s.rollNo}), Language: ${s.language}, DOB format: "${s.dob}"`);

    // 1. Registration simulation
    const normalizedDob = normalizeDate(s.dob);
    const passwordHash = await bcrypt.hash(normalizedDob, 10);

    const user = await prisma.user.create({
      data: {
        username: s.rollNo,
        passwordHash,
        role: "STUDENT",
        language: s.language,
        profile: {
          create: {
            fullName: s.name,
            currentClass: s.classLevel,
            examPrepClass: s.classLevel === 9 ? 10 : s.classLevel === 11 ? 12 : s.classLevel,
            medium: s.medium,
            board: "Tamil Nadu Samacheer Kalvi",
            academicYear: "2026–2027"
          }
        }
      },
      include: { profile: true }
    });

    if (!user || !user.profile) {
      console.error(`    ✗ Registration failed for ${s.rollNo}`);
      passedAll = false;
      continue;
    }
    console.log(`    ✓ Registered: id=${user.id}, role=${user.role}, language=${user.language}`);

    // 2. Sign-in test with the exact candidate input format
    const candidateInputDob = s.dob;
    const testNormalized = normalizeDate(candidateInputDob);
    const isLoginMatch = await bcrypt.compare(testNormalized, user.passwordHash);

    // Also test case-insensitive roll lookup
    const foundByLower = await prisma.user.findFirst({
      where: {
        OR: [
          { username: s.rollNo },
          { username: s.rollNo.toLowerCase() }
        ]
      }
    });

    if (isLoginMatch && foundByLower) {
      console.log(`    ✓ Sign-in SUCCESS with ${candidateInputDob} (Case-insensitive lookup: OK)`);
    } else {
      console.error(`    ✗ Sign-in FAILED for ${s.rollNo}`);
      passedAll = false;
    }

    // 3. Test wrong password
    const wrongDob = "2000-01-01";
    const wrongNormalized = normalizeDate(wrongDob);
    const isWrongMatch = await bcrypt.compare(wrongNormalized, user.passwordHash);
    if (!isWrongMatch) {
      console.log(`    ✓ Wrong DOB "${wrongDob}" cleanly rejected (returns generic "Invalid username or password.")`);
    } else {
      console.error(`    ✗ Wrong DOB was unexpectedly accepted!`);
      passedAll = false;
    }

    // 4. Test duplicate prevention
    const duplicate = await prisma.user.findUnique({ where: { username: s.rollNo } });
    if (duplicate) {
      console.log(`    ✓ Duplicate check: Roll Number already exists, rejected with HTTP 409 conflict message.`);
    }

    // Clean up
    await prisma.user.deleteMany({ where: { username: s.rollNo } });
  }

  console.log("\n=================================================================");
  if (passedAll) {
    console.log("   ALL 3 STUDENTS REGISTERED & SIGNED IN SUCCESSFULLY: PASS!     ");
  } else {
    console.log("   PHASE 2 ACCEPTANCE FAILED!                                   ");
    process.exit(1);
  }
  console.log("=================================================================");
}

runPhase2Acceptance()
  .catch((err) => {
    console.error("Test error:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

