const { encryptSubmissionPayload, decryptSubmissionPayload } = require("../src/lib/encryption");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function runTests() {
  console.log("=========================================================");
  console.log("🔒 TEST: MINIMAL ENCRYPTION & STRICT RETAKE AUDIT");
  console.log("=========================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Test Encryption and Decryption
  console.log("▶ 1. Cryptographic AES-256 + HMAC Integrity Test");
  const samplePayload = {
    candidateRollNo: "TN2026-0901",
    candidateName: "Adhavan S",
    examId: "test-exam-101",
    questions: [
      { questionNumber: 1, studentAnswer: "B", correctAnswer: "B", isCorrect: true },
      { questionNumber: 2, studentAnswer: "A", correctAnswer: "C", isCorrect: false },
    ],
    rawAnswers: { "q-1": "B", "q-2": "A" },
    calculatedScore: 2,
    totalMarks: 4,
  };

  const encryptedString = encryptSubmissionPayload(samplePayload);
  assert(typeof encryptedString === "string", "encryptSubmissionPayload returns stringified JSON envelope");

  const parsedEnvelope = JSON.parse(encryptedString);
  assert(parsedEnvelope._enc === true, "Envelope has _enc flag set to true");
  assert(parsedEnvelope.alg === "aes-256-cbc", "Envelope specifies aes-256-cbc cipher");
  assert(typeof parsedEnvelope.iv === "string" && parsedEnvelope.iv.length === 32, "Envelope contains valid 16-byte hex IV (32 chars)");
  assert(typeof parsedEnvelope.cipher === "string", "Envelope contains Base64 cipher text");
  assert(typeof parsedEnvelope.hmac === "string" && parsedEnvelope.hmac.length === 64, "Envelope contains SHA-256 HMAC integrity signature (64 chars)");
  assert(!encryptedString.includes("Adhavan S"), "Plaintext candidate name is NOT leaked in ciphertext");

  const decryptedPayload = decryptSubmissionPayload(encryptedString);
  assert(decryptedPayload !== null, "decryptSubmissionPayload successfully decrypts valid envelope");
  assert(decryptedPayload.candidateName === "Adhavan S", "Decrypted candidate name matches original exactly");
  assert(decryptedPayload.questions.length === 2, "Decrypted questions count matches original");
  assert(decryptedPayload.rawAnswers["q-1"] === "B", "Decrypted rawAnswers matches original answer");

  // 2. Test Legacy Fallback
  console.log("\n▶ 2. Backward Compatibility with Legacy Unencrypted Records");
  const legacyPayload = { "q-1": "A", "q-2": "C" };
  const legacyDecrypted = decryptSubmissionPayload(JSON.stringify(legacyPayload));
  assert(legacyDecrypted["q-1"] === "A", "Legacy unencrypted JSON string is parsed gracefully without error");

  // 3. Database Names Audit
  console.log("\n▶ 3. Strict Student Formal Names Audit in SQLite");
  const profiles = await prisma.studentProfile.findMany({ include: { user: true } });
  for (const p of profiles) {
    const hasBroOrSis = /\((Brother|Sister|brother|sister)\)/i.test(p.fullName);
    assert(!hasBroOrSis, `Student Profile '${p.fullName}' (${p.user.username}) strictly has NO 'Brother' or 'Sister' tag`);
  }

  // 4. Activity Log Strict Real Telemetry Audit
  console.log("\n▶ 4. Telemetry Log Real Names Audit in SQLite");
  const logs = await prisma.studentActivityLog.findMany({ take: 20 });
  for (const l of logs) {
    const hasBroOrSis = /\((Brother|Sister|brother|sister)\)/i.test(l.studentName);
    assert(!hasBroOrSis, `Telemetry log candidate '${l.studentName}' (${l.rollNo}) contains NO 'Brother' or 'Sister' tag`);
  }

  console.log("\n=========================================================");
  console.log(`TOTAL AUDIT RESULT: ${passed} PASSED | ${failed} FAILED`);
  console.log("=========================================================\n");

  await prisma.$disconnect();

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
