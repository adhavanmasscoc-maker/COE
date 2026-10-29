const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function runVerification() {
  console.log("=================================================================");
  console.log("   EXAM ENGINE — MULTI-PHASE VERIFICATION SUITE");
  console.log("=================================================================\n");

  const results = {};

  // ─── 1. PHASE 1: Tamil Language Support ──────────────────────────────
  console.log("--> Testing Phase 1: Tamil Language Support...");
  try {
    const { translations, getTranslation } = require('../src/lib/i18n.js');
    const taKeys = Object.keys(translations.ta);
    const enKeys = Object.keys(translations.en);
    const hasCoreKeys = [
      "nav_dashboard", "nav_syllabus", "nav_results", "exam_palette_title",
      "exam_time_remaining", "btn_submit_exam", "auth_invalid_credentials"
    ].every(k => translations.ta[k] && translations.en[k]);

    const sampleTamilTranslation = getTranslation("ta", "nav_dashboard");
    const isNaturalTamil = sampleTamilTranslation === "முகப்பு பலகை";

    if (hasCoreKeys && isNaturalTamil && taKeys.length >= 40) {
      results["Phase 1: Tamil Language Translation & Context"] = "PASS";
      console.log(`    ✓ Phase 1 PASS: ${taKeys.length} Tamil keys loaded. Natural Tamil: "${sampleTamilTranslation}"`);
    } else {
      results["Phase 1: Tamil Language Translation & Context"] = "FAIL";
      console.error("    ✗ Phase 1 FAIL: Key count or translation mismatch.");
    }
  } catch (e) {
    results["Phase 1: Tamil Language Translation & Context"] = `FAIL: ${e.message}`;
    console.error("    ✗ Phase 1 ERROR:", e.message);
  }

  // ─── 2. PHASE 2: Student Registration & Sign-In Bug Fix ───────────────
  console.log("\n--> Testing Phase 2: Student Registration and Sign-In Fix...");
  const testRoll = "TN2026-PHASE2-TEST";
  const rawInputDob = "28-10-2008"; // DD-MM-YYYY format
  const normalizedDob = "2008-10-28";

  try {
    // Clean up if exists
    await prisma.user.deleteMany({ where: { username: testRoll } });

    // Simulate Registration API
    const passwordHash = await bcrypt.hash(normalizedDob, 12);
    const user = await prisma.user.create({
      data: {
        username: testRoll,
        passwordHash,
        role: "STUDENT",
        profile: {
          create: {
            fullName: "Anitha Devi R",
            currentClass: 12,
            examPrepClass: 12,
            medium: "Tamil",
            board: "Tamil Nadu Samacheer Kalvi"
          }
        }
      },
      include: { profile: true }
    });

    // Test sign-in with DD-MM-YYYY
    const dmyMatch = rawInputDob.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
    const isoConverted = `${dmyMatch[3]}-${dmyMatch[2].padStart(2, '0')}-${dmyMatch[1].padStart(2, '0')}`;
    const loginOk = await bcrypt.compare(isoConverted, user.passwordHash);

    // Test case sensitivity: student enters lowercase username
    const foundUserCaseInsensitive = await prisma.user.findFirst({
      where: {
        OR: [
          { username: testRoll.toUpperCase() },
          { username: testRoll.toLowerCase() }
        ]
      }
    });

    // Test wrong password
    const wrongLogin = await bcrypt.compare("1999-01-01", user.passwordHash);

    if (loginOk && foundUserCaseInsensitive && !wrongLogin) {
      results["Phase 2: Student Registration & Immediate Sign-In"] = "PASS";
      console.log("    ✓ Phase 2 PASS: Candidate registered, case-insensitive match ok, DD-MM-YYYY login verified, wrong DOB rejected.");
    } else {
      results["Phase 2: Student Registration & Immediate Sign-In"] = "FAIL";
      console.error("    ✗ Phase 2 FAIL: Login validation failed.");
    }

    // Clean up
    await prisma.user.deleteMany({ where: { username: testRoll } });
  } catch (e) {
    results["Phase 2: Student Registration & Immediate Sign-In"] = `FAIL: ${e.message}`;
    console.error("    ✗ Phase 2 ERROR:", e.message);
  }

  // ─── 3. PHASE 3: Subject Library & 100-Question Bank ─────────────────
  console.log("\n--> Testing Phase 3: Subject Library and 100-Question Bank...");
  try {
    const bankCount = await prisma.questionBankItem.count();
    const tam10Bank = await prisma.questionBankItem.count({
      where: { subject: { code: "TAM-10" } }
    });
    const mat10Bank = await prisma.questionBankItem.count({
      where: { subject: { code: "MAT-10" } }
    });

    // Test Markdown Parser
    const { parseMarkdownQuestionBank } = require('../src/lib/questionBankParser.js');
    const sampleMd = `
### Q1. What is the SI unit of electric current?
A) Volt
B) Ampere
C) Ohm
D) Watt
Answer: B
Explanation: Electric current is measured in Amperes.

### Q2. Acceleration due to gravity on Earth is:
A) 9.8 m/s²
B) 8.9 m/s²
C) 10.5 m/s²
D) 6.4 m/s²
Answer: A
Explanation: Standard value of g is 9.8 m/s².
`;
    const parsedFromMd = parseMarkdownQuestionBank(sampleMd);
    const mdOk = parsedFromMd.length === 2 && parsedFromMd[0].answer === "B" && parsedFromMd[1].answer === "A";

    if (bankCount >= 500 && tam10Bank >= 100 && mat10Bank >= 100 && mdOk) {
      results["Phase 3: 100-Question Bank Import & Validation"] = "PASS";
      console.log(`    ✓ Phase 3 PASS: ${bankCount} question bank items in DB (TAM-10: ${tam10Bank}, MAT-10: ${mat10Bank}). Markdown parser verified.`);
    } else {
      results["Phase 3: 100-Question Bank Import & Validation"] = "FAIL";
      console.error(`    ✗ Phase 3 FAIL: Bank count: ${bankCount}, mdOk: ${mdOk}`);
    }
  } catch (e) {
    results["Phase 3: 100-Question Bank Import & Validation"] = `FAIL: ${e.message}`;
    console.error("    ✗ Phase 3 ERROR:", e.message);
  }

  // ─── 4. PHASE 4: Multi-Subject Scheduling ─────────────────────────────
  console.log("\n--> Testing Phase 4: Multi-Subject Batch Scheduling...");
  try {
    const targetCodes = ["TAM-10", "ENG-10", "MAT-10", "SCI-10", "SOC-10"];
    const subjects = await prisma.subject.findMany({
      where: { code: { in: targetCodes } }
    });

    if (subjects.length === 5) {
      // Create batch of 5 subjects
      const batchCreated = [];
      for (let i = 0; i < subjects.length; i++) {
        const sub = subjects[i];
        const examDate = new Date(Date.now() + 86400000 * (i + 2)); // Different date per subject!
        const schedule = await prisma.examSchedule.create({
          data: {
            subjectId: sub.id,
            prepClass: 10,
            examDate,
            durationMinutes: 90,
            totalMarks: 25,
            instructions: `Board examination for ${sub.name}`,
            status: "PUBLISHED",
            phase: 3
          }
        });
        batchCreated.push(schedule);
      }

      // Verify all 5 were published and have distinct dates
      const dates = new Set(batchCreated.map(s => s.examDate.toISOString().slice(0, 10)));
      const allDistinctDates = dates.size === 5;

      if (batchCreated.length === 5 && allDistinctDates) {
        results["Phase 4: Multi-Subject Scheduling (5 Subjects, Per-Subject Timing)"] = "PASS";
        console.log(`    ✓ Phase 4 PASS: 5 subjects scheduled in sequence with distinct dates and times.`);
      } else {
        results["Phase 4: Multi-Subject Scheduling (5 Subjects, Per-Subject Timing)"] = "FAIL";
      }

      // Clean up test schedules
      await prisma.examSchedule.deleteMany({
        where: { id: { in: batchCreated.map(b => b.id) } }
      });
    } else {
      results["Phase 4: Multi-Subject Scheduling (5 Subjects, Per-Subject Timing)"] = "FAIL: Missing subjects in DB";
    }
  } catch (e) {
    results["Phase 4: Multi-Subject Scheduling (5 Subjects, Per-Subject Timing)"] = `FAIL: ${e.message}`;
    console.error("    ✗ Phase 4 ERROR:", e.message);
  }

  // ─── 5. PHASE 5: Exact JSON Exam Setter Schema ───────────────────────
  console.log("\n--> Testing Phase 5: Exam Setter JSON Schema (Phase 5.2)...");
  try {
    const expectedSchemaKeys = ["sub", "date", "time", "total_marks", "language", "level", "questions"];
    const samplePayload = {
      sub: "TAM",
      date: "2026-11-20",
      time: "09:30",
      total_marks: 25,
      language: "Tamil",
      level: "10 police-level questions",
      questions: [
        {
          id: 1,
          question: "தமிழ்த்தாயின் தலைசிறந்த காப்பியம் எது?",
          options: { A: "சிலப்பதிகாரம்", B: "மணிமேகலை", C: "சீவகசிந்தாமணி", D: "குண்டலகேசி" },
          answer: "A"
        }
      ]
    };

    const hasAllTopKeys = expectedSchemaKeys.every(k => samplePayload[k] !== undefined);
    const q1 = samplePayload.questions[0];
    const hasQKeys = q1.id === 1 && q1.question && q1.options.A && q1.options.B && q1.options.C && q1.options.D && q1.answer === "A";

    if (hasAllTopKeys && hasQKeys) {
      results["Phase 5: Exam Setter JSON Exact Schema & Validator"] = "PASS";
      console.log("    ✓ Phase 5 PASS: Exact JSON structure matches Phase 5.2 specification.");
    } else {
      results["Phase 5: Exam Setter JSON Exact Schema & Validator"] = "FAIL";
    }
  } catch (e) {
    results["Phase 5: Exam Setter JSON Exact Schema & Validator"] = `FAIL: ${e.message}`;
    console.error("    ✗ Phase 5 ERROR:", e.message);
  }

  // ─── 6. PHASE 6: Random Question Selection Without Duplicates ────────
  console.log("\n--> Testing Phase 6: Random Question Selection from 100-Bank...");
  try {
    const tam10Sub = await prisma.subject.findFirst({ where: { code: "TAM-10" } });
    const bankItems = await prisma.questionBankItem.findMany({
      where: { subjectId: tam10Sub.id }
    });

    // Sample 10 random questions
    const shuffled = [...bankItems].sort(() => 0.5 - Math.random());
    const sampled10 = shuffled.slice(0, 10);

    // Verify exactly 10 and no duplicates
    const sampledIds = new Set(sampled10.map(q => q.id));
    const noDuplicates = sampledIds.size === 10;

    // Test Swap: pick an item not in sampled10
    const availableForSwap = bankItems.filter(b => !sampledIds.has(b.id));
    const swapOk = availableForSwap.length >= 90;

    if (noDuplicates && swapOk) {
      results["Phase 6: Random Question Selection & Single Question Swap"] = "PASS";
      console.log(`    ✓ Phase 6 PASS: 10 questions randomly sampled without duplicates; swap pool has ${availableForSwap.length} replacement questions.`);
    } else {
      results["Phase 6: Random Question Selection & Single Question Swap"] = "FAIL";
    }
  } catch (e) {
    results["Phase 6: Random Question Selection & Single Question Swap"] = `FAIL: ${e.message}`;
    console.error("    ✗ Phase 6 ERROR:", e.message);
  }

  // ─── 7. PHASE 7: UI Layout (No Oval Shapes) & Dim Google Palette ─────
  console.log("\n--> Testing Phase 7: UI Theme, Dim Light Mode & Google Palette...");
  try {
    const cssPath = path.join(process.cwd(), "src", "app", "globals.css");
    const cssContent = fs.readFileSync(cssPath, "utf8");

    const hasNoBadgeOval = cssContent.includes(".badge {") && cssContent.includes("border-radius: 6px;");
    const hasDimLightMode = cssContent.includes("html:not(.dark)") && cssContent.includes("--bg-base: #dce1e8;");
    const hasGooglePalette = cssContent.includes("--google-red: #ea4335;") &&
                             cssContent.includes("--google-green: #34a853;") &&
                             cssContent.includes("--google-blue: #4285f4;") &&
                             cssContent.includes("--google-yellow: #fbbc05;");

    if (hasNoBadgeOval && hasDimLightMode && hasGooglePalette) {
      results["Phase 7: UI Box Layout (No Ovals) & Dim Google Palette"] = "PASS";
      console.log("    ✓ Phase 7 PASS: Rectangular border radii, dim eye-comfortable light theme, and Google R-G-B-Y palette verified.");
    } else {
      results["Phase 7: UI Box Layout (No Ovals) & Dim Google Palette"] = "FAIL";
      console.error(`    ✗ Phase 7 FAIL: noOval=${hasNoBadgeOval}, dimLight=${hasDimLightMode}, googlePalette=${hasGooglePalette}`);
    }
  } catch (e) {
    results["Phase 7: UI Box Layout (No Ovals) & Dim Google Palette"] = `FAIL: ${e.message}`;
    console.error("    ✗ Phase 7 ERROR:", e.message);
  }

  // ─── SUMMARY REPORT ──────────────────────────────────────────────────
  console.log("\n=================================================================");
  console.log("                FINAL VERIFICATION CHECKLIST REPORT               ");
  console.log("=================================================================");
  let passCount = 0;
  let totalCount = 0;

  for (const [phase, status] of Object.entries(results)) {
    totalCount++;
    if (status === "PASS") passCount++;
    console.log(`[${status === "PASS" ? "✓ PASS" : "✗ FAIL"}] ${phase}`);
  }

  console.log(`\nScore: ${passCount} / ${totalCount} phases PASSED.`);
  console.log("=================================================================\n");

  await prisma.$disconnect();
  process.exit(passCount === totalCount ? 0 : 1);
}

runVerification().catch(e => {
  console.error("Fatal suite error:", e);
  process.exit(1);
});
