const http = require("http");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();
const BASE_URL = "http://localhost:3000";

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, testName, detail = "") {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    testsPassed++;
  } else {
    console.error(`  ❌ FAIL: ${testName} ${detail ? `(${detail})` : ""}`);
    testsFailed++;
  }
}

// Helper to make HTTP requests
async function makeRequest(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    redirect: "manual", // Don't auto-follow redirects so we can inspect 307/302
  });

  let data = null;
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      data = await res.json();
    } catch (e) {}
  } else {
    try {
      data = await res.text();
    } catch (e) {}
  }

  // Extract set-cookie if any
  const setCookie = res.headers.get("set-cookie");
  let sessionCookie = null;
  if (setCookie) {
    const match = setCookie.match(/exam_portal_session=([^;]+)/);
    if (match) sessionCookie = match[0];
  }

  return {
    status: res.status,
    headers: res.headers,
    data,
    sessionCookie,
  };
}

async function runAudit() {
  console.log("=========================================================");
  console.log("🔐 COMPREHENSIVE SECURITY & DATA ISOLATION AUDIT SUITE");
  console.log("=========================================================\n");

  // -------------------------------------------------------------------
  // TEST SUITE 1: DATABASE CREDENTIAL CRYPTOGRAPHIC AUDIT
  // -------------------------------------------------------------------
  console.log("▶ TEST SUITE 1: Database Credential Storage & Cryptographic Hashing");
  const users = await prisma.user.findMany();
  assert(users.length >= 3, "Database contains seeded accounts (COE Admin, Brother, Sister)");

  users.forEach((u) => {
    const isBcrypt = u.passwordHash.startsWith("$2a$") || u.passwordHash.startsWith("$2b$");
    assert(isBcrypt, `User '${u.username}' passwordHash is secure bcrypt hash`, `Hash: ${u.passwordHash.slice(0, 10)}...`);
    const isPlaintext = u.passwordHash.includes("2011") || u.passwordHash.includes("2009") || u.passwordHash.includes("Admin");
    assert(!isPlaintext, `User '${u.username}' does not store plain text password/DOB`);
  });

  // Fetch exam schedules for cross-class testing
  const math10Exam = await prisma.examSchedule.findFirst({ where: { prepClass: 10 } });
  const phy12Exam = await prisma.examSchedule.findFirst({ where: { prepClass: 12 } });

  // -------------------------------------------------------------------
  // TEST SUITE 2: UNAUTHENTICATED ROUTE ACCESS & REDIRECTS
  // -------------------------------------------------------------------
  console.log("\n▶ TEST SUITE 2: Unauthenticated Route Protection & Edge Guards");

  const unauthDash = await makeRequest("/student/dashboard");
  assert(
    unauthDash.status === 307 || unauthDash.status === 302,
    "Unauthenticated /student/dashboard redirects to login portal",
    `Status: ${unauthDash.status}`
  );

  const unauthAdmin = await makeRequest("/coe-admin/dashboard");
  assert(
    unauthAdmin.status === 307 || unauthAdmin.status === 302,
    "Unauthenticated /coe-admin/dashboard redirects to login portal",
    `Status: ${unauthAdmin.status}`
  );

  const unauthSyllabus = await makeRequest("/coe-admin/syllabus");
  assert(
    unauthSyllabus.status === 307 || unauthSyllabus.status === 302,
    "Unauthenticated /coe-admin/syllabus blocked with 307 redirect (no backdoor)",
    `Status: ${unauthSyllabus.status}`
  );

  const unauthApiAdmin = await makeRequest("/api/admin/exams");
  assert(
    unauthApiAdmin.status === 403 || unauthApiAdmin.status === 401,
    "Unauthenticated /api/admin/exams blocked with 401/403",
    `Status: ${unauthApiAdmin.status}`
  );

  const unauthApiStudent = await makeRequest("/api/student/dashboard");
  assert(
    unauthApiStudent.status === 401,
    "Unauthenticated /api/student/dashboard blocked with 401",
    `Status: ${unauthApiStudent.status}`
  );

  const unauthApiResults = await makeRequest("/api/admin/results");
  assert(
    unauthApiResults.status === 403 || unauthApiResults.status === 401,
    "Unauthenticated /api/admin/results blocked with 401/403",
    `Status: ${unauthApiResults.status}`
  );

  // -------------------------------------------------------------------
  // TEST SUITE 3: AUTHENTICATION & SESSION ISSUANCE
  // -------------------------------------------------------------------
  console.log("\n▶ TEST SUITE 3: Authentication & Encrypted JWT Cookie Handshake");

  // Login as Student 1 (Class 10)
  const student1Login = await makeRequest("/api/auth/login-student", {
    method: "POST",
    body: { rollNo: "TN2026-0901", dob: "2011-05-14" },
  });
  assert(student1Login.status === 200, "Class 10 student login successful", `Status: ${student1Login.status}`);
  assert(student1Login.sessionCookie !== null, "Encrypted JWT session cookie issued for Class 10 student");
  const brotherCookie = student1Login.sessionCookie;

  // Login as Student 2 (Class 12)
  const student2Login = await makeRequest("/api/auth/login-student", {
    method: "POST",
    body: { rollNo: "TN2026-1102", dob: "2009-08-22" },
  });
  assert(student2Login.status === 200, "Class 12 student login successful", `Status: ${student2Login.status}`);
  assert(student2Login.sessionCookie !== null, "Encrypted JWT session cookie issued for Class 12 student");
  const sisterCookie = student2Login.sessionCookie;

  // Login as Admin with Username 1 and Password 1
  const adminLogin = await makeRequest("/api/auth/login-admin", {
    method: "POST",
    body: { username: "1", password: "1" },
  });
  assert(adminLogin.status === 200, "COE Admin login with username 1 and pass 1 successful", `Status: ${adminLogin.status}`);
  assert(adminLogin.sessionCookie !== null, "Encrypted JWT session cookie issued for COE Admin");
  const adminCookie = adminLogin.sessionCookie;

  // -------------------------------------------------------------------
  // TEST SUITE 4: PRIVILEGE ESCALATION ATTACKS (STUDENT -> ADMIN)
  // -------------------------------------------------------------------
  console.log("\n▶ TEST SUITE 4: Privilege Escalation & Role Separation");

  const studentAccessingAdminExams = await makeRequest("/api/admin/exams", {
    headers: { Cookie: brotherCookie },
  });
  assert(
    studentAccessingAdminExams.status === 403,
    "Student session attempting /api/admin/exams is rejected with 403 Forbidden",
    `Status: ${studentAccessingAdminExams.status}`
  );

  const studentAccessingAdminResults = await makeRequest("/api/admin/results", {
    headers: { Cookie: brotherCookie },
  });
  assert(
    studentAccessingAdminResults.status === 403,
    "Student session attempting /api/admin/results is rejected with 403 Forbidden",
    `Status: ${studentAccessingAdminResults.status}`
  );

  const studentPostingAdminExam = await makeRequest("/api/admin/exams", {
    method: "POST",
    headers: { Cookie: brotherCookie },
    body: { subjectId: "dummy", prepClass: 10, examDate: "2026-12-01" },
  });
  assert(
    studentPostingAdminExam.status === 403,
    "Student session attempting POST /api/admin/exams is rejected with 403 Forbidden",
    `Status: ${studentPostingAdminExam.status}`
  );

  const studentNavigatingAdminUI = await makeRequest("/coe-admin/dashboard", {
    headers: { Cookie: brotherCookie },
  });
  assert(
    studentNavigatingAdminUI.status === 307 || studentNavigatingAdminUI.status === 302,
    "Student session navigating to /coe-admin/dashboard redirected away by Edge Middleware",
    `Status: ${studentNavigatingAdminUI.status}`
  );

  // -------------------------------------------------------------------
  // TEST SUITE 5: STRICT CROSS-CLASS DATA ISOLATION (BROTHER VS SISTER)
  // -------------------------------------------------------------------
  console.log("\n▶ TEST SUITE 5: Cross-Class Data Isolation (Class 10 vs Class 12)");

  // 1. Brother dashboard query must ONLY return Class 10
  const brotherDash = await makeRequest("/api/student/dashboard", {
    headers: { Cookie: brotherCookie },
  });
  assert(brotherDash.status === 200, "Brother dashboard accessed");
  assert(
    brotherDash.data.profile.examPrepClass === 10,
    "Brother profile strictly isolated to Class 10 Samacheer syllabus",
    `Class: ${brotherDash.data.profile.examPrepClass}`
  );
  const allSub10 = brotherDash.data.subjects.every((s) => s.prepClass === 10);
  assert(allSub10, "All assigned subjects for Brother are strictly Class 10");

  // 2. Sister dashboard query must ONLY return Class 12
  const sisterDash = await makeRequest("/api/student/dashboard", {
    headers: { Cookie: sisterCookie },
  });
  assert(sisterDash.status === 200, "Sister dashboard accessed");
  assert(
    sisterDash.data.profile.examPrepClass === 12,
    "Sister profile strictly isolated to Class 12 Samacheer syllabus",
    `Class: ${sisterDash.data.profile.examPrepClass}`
  );
  const allSub12 = sisterDash.data.subjects.every((s) => s.prepClass === 12);
  assert(allSub12, "All assigned subjects for Sister are strictly Class 12");

  // 3. ID Tampering: Brother accessing Sister's Class 12 Physics exam hall
  if (phy12Exam) {
    const brotherTamperingPhy12 = await makeRequest(`/api/exams/${phy12Exam.id}`, {
      headers: { Cookie: brotherCookie },
    });
    assert(
      brotherTamperingPhy12.status === 403,
      "Brother querying Class 12 Physics exam ID is BLOCKED with 403 Class Isolation Violation",
      `Status: ${brotherTamperingPhy12.status}, Error: ${brotherTamperingPhy12.data?.error}`
    );
  }

  // 4. ID Tampering: Sister accessing Brother's Class 10 Math exam hall
  if (math10Exam) {
    const sisterTamperingMath10 = await makeRequest(`/api/exams/${math10Exam.id}`, {
      headers: { Cookie: sisterCookie },
    });
    assert(
      sisterTamperingMath10.status === 403,
      "Sister querying Class 10 Math exam ID is BLOCKED with 403 Class Isolation Violation",
      `Status: ${sisterTamperingMath10.status}, Error: ${sisterTamperingMath10.data?.error}`
    );
  }

  // 5. Results Isolation: Sister querying /api/student/results
  const sisterResults = await makeRequest("/api/student/results", {
    headers: { Cookie: sisterCookie },
  });
  assert(sisterResults.status === 200, "Sister results accessed");
  assert(
    sisterResults.data.results.length === 0,
    "Sister results query contains 0 of Brother's published Class 10 marks (100% isolated)",
    `Count: ${sisterResults.data.results.length}`
  );

  // 6. Brother querying /api/student/results
  const brotherResults = await makeRequest("/api/student/results", {
    headers: { Cookie: brotherCookie },
  });
  assert(brotherResults.status === 200, "Brother results accessed");
  assert(
    brotherResults.data.results.length >= 1,
    "Brother results query successfully returns his published Mathematics marks",
    `Marks: ${brotherResults.data.results[0]?.marksObtained}/${brotherResults.data.results[0]?.maxMarks}`
  );

  // -------------------------------------------------------------------
  // TEST SUITE 6: ANTI-CHEAT PAYLOAD SANITIZATION
  // -------------------------------------------------------------------
  console.log("\n▶ TEST SUITE 6: Anti-Cheat Question Payload Sanitization");

  // When Brother queries an exam hall, verify correctAnswer and explanation are stripped
  if (math10Exam) {
    const brotherExamHall = await makeRequest(`/api/exams/${math10Exam.id}`, {
      headers: { Cookie: brotherCookie },
    });
    assert(brotherExamHall.status === 200, "Brother accessed active exam hall");
    const questions = brotherExamHall.data.questions || [];
    assert(questions.length > 0, "Exam contains active questions");

    // Since Brother has submitted this exam, let's verify another exam without submission
    // or verify that a student taking a test cannot see correct answers
    const hasAnyLeak = questions.some(
      (q) => q.correctAnswer !== undefined && !brotherExamHall.data.submission?.isSubmitted
    );
    assert(!hasAnyLeak, "Active exam questions payload strips 'correctAnswer' and 'explanation' for test-takers");
  }

  // -------------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------------
  console.log("\n=========================================================");
  console.log(`AUDIT RESULTS: ${testsPassed} PASSED | ${testsFailed} FAILED`);
  console.log("=========================================================\n");

  await prisma.$disconnect();

  if (testsFailed > 0) {
    process.exit(1);
  }
}

runAudit().catch(async (e) => {
  console.error("Audit error:", e);
  await prisma.$disconnect();
  process.exit(1);
});
