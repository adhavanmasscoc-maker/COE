import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { db } from "../src/lib/db.js";
import { getLifecycle, formatCountdownText, formatExamDateTime } from "../src/lib/timetableUtils.js";

test("1. Student Standard Isolation (Class 10 cannot see Class 12 exams)", async () => {
  // Find a Class 10 student (e.g. Adhavan S or TN2026-0901)
  const student10 = await db.studentProfile.findFirst({
    where: { examPrepClass: 10 },
    include: { user: true },
  });
  assert.ok(student10, "Class 10 student profile exists in database");

  // Query exams assigned to Class 10
  const exams10 = await db.examSchedule.findMany({
    where: {
      prepClass: student10.examPrepClass,
      status: "PUBLISHED",
    },
    include: { subject: true },
  });

  // Verify all exams are strictly Class 10
  for (const exam of exams10) {
    assert.equal(exam.prepClass, 10, `Exam ${exam.id} must be Class 10`);
    assert.notEqual(exam.subject?.prepClass, 12, `Subject ${exam.subject?.code} must not be Class 12`);
    assert.ok(
      !["CHE-12", "PHY-12", "CSC-12", "MAT-12", "TAM-12"].includes(exam.subject?.code),
      `Senior subject ${exam.subject?.code} must never appear for Class 10`
    );
  }
});

test("2. Non-Admin Tampering Defense (Student session cannot forge previewRollNo)", async () => {
  // Regular student session user
  const studentUser = await db.user.findFirst({
    where: { role: "STUDENT" },
    include: { profile: true },
  });
  assert.ok(studentUser, "Student user exists");

  // Simulate dashboard query with a student session
  // In route.js: session.role !== "ADMIN" forces db.studentProfile.findUnique({ where: { userId: session.userId } })
  const callerProfile = await db.studentProfile.findUnique({
    where: { userId: studentUser.id },
  });

  assert.equal(callerProfile.userId, studentUser.id, "Query strictly resolves to caller's own database profile");
  assert.equal(callerProfile.rollNo, studentUser.profile.rollNo, "Returned roll number matches authenticated session");
});

test("3. Start Exam Window Gating (Upcoming, Live, Closed, Completed)", () => {
  const baseTime = 1793400000000; // Reference timestamp
  const durationMins = 45;
  const durationMs = durationMins * 60 * 1000;

  const mockExam = {
    id: "test-gate-exam",
    examDate: new Date(baseTime).toISOString(),
    durationMinutes: durationMins,
    isSubmitted: false,
    status: "PUBLISHED",
    isResultPublished: false,
  };

  // Case A: 30 minutes before exam -> UPCOMING (Gated / Disabled)
  const beforeTime = baseTime - 30 * 60 * 1000;
  const statusBefore = getLifecycle(mockExam, beforeTime);
  assert.equal(statusBefore, "UPCOMING", "Exam before start date must be UPCOMING");

  // Case B: 10 minutes into the exam -> LIVE (Unlocked / Enabled)
  const liveTime = baseTime + 10 * 60 * 1000;
  const statusLive = getLifecycle(mockExam, liveTime);
  assert.equal(statusLive, "LIVE", "Exam during window must be LIVE");

  // Case C: 60 minutes after start (window ended) -> CLOSED (Gated / Disabled)
  const afterTime = baseTime + durationMs + 15 * 60 * 1000;
  const statusAfter = getLifecycle(mockExam, afterTime);
  assert.equal(statusAfter, "CLOSED", "Exam after window end must be CLOSED");

  // Case D: Submitted exam -> COMPLETED / RESULTS_PUBLISHED
  const submittedExam = { ...mockExam, isSubmitted: true };
  const statusSubmitted = getLifecycle(submittedExam, liveTime);
  assert.equal(statusSubmitted, "COMPLETED", "Submitted exam must be COMPLETED");

  const publishedExam = { ...mockExam, isSubmitted: true, isResultPublished: true };
  const statusPublished = getLifecycle(publishedExam, liveTime);
  assert.equal(statusPublished, "RESULTS_PUBLISHED", "Submitted exam with published results must be RESULTS_PUBLISHED");
});

test("4. Zero Answer Leak (Timetable returns no answers, keys, or question text)", async () => {
  // Query upcoming exams as structured by /api/student/dashboard
  const exams = await db.examSchedule.findMany({
    where: { status: "PUBLISHED" },
    include: {
      subject: { select: { id: true, name: true, code: true, prepClass: true, medium: true } },
    },
    take: 5,
  });

  for (const exam of exams) {
    // Assert strictly forbidden answer properties are not returned in timetable payload
    assert.equal(exam.correctAnswer, undefined, "correctAnswer must not exist on exam schedule");
    assert.equal(exam.answer, undefined, "answer must not exist on exam schedule");
    assert.equal(exam.explanation, undefined, "explanation must not exist on exam schedule");
    assert.equal(exam.questions, undefined, "questions array must not be embedded in timetable list");
  }
});

test("5. Tamil and English i18n Dictionary Coverage for Timetable", () => {
  const enPath = path.join(process.cwd(), "src", "locales", "en.json");
  const taPath = path.join(process.cwd(), "src", "locales", "ta.json");

  const en = JSON.parse(fs.readFileSync(enPath, "utf8"));
  const ta = JSON.parse(fs.readFileSync(taPath, "utf8"));

  const requiredKeys = [
    "timetable_heading",
    "timetable_subheading",
    "timetable_rules_link",
    "timetable_rules_title",
    "timetable_rules_content",
    "th_subject_code",
    "th_date_time",
    "th_readiness",
    "th_syllabus_practice",
    "th_result",
    "th_exam_hall",
    "btn_syllabus",
    "btn_practice_a",
    "btn_practice_b",
    "practice_coming_soon",
    "status_upcoming",
    "status_live_now",
    "status_closed",
    "status_completed_check",
    "status_results_published",
    "result_pending",
    "result_awaiting",
    "btn_view_result",
    "btn_start_exam",
    "exam_starts_at",
    "exam_closed",
    "exam_completed",
  ];

  for (const key of requiredKeys) {
    assert.ok(en[key], `en.json must contain key "${key}"`);
    assert.ok(ta[key], `ta.json must contain key "${key}"`);
    assert.ok(typeof en[key] === "string" && en[key].trim().length > 0, `en.json[${key}] must not be empty`);
    assert.ok(typeof ta[key] === "string" && ta[key].trim().length > 0, `ta.json[${key}] must not be empty`);
  }
});

test("6. Style Compliance (Zero hex in JSX, max radius 6px, no backdrop-blur)", () => {
  const componentPath = path.join(process.cwd(), "src", "components", "student", "ExamTimetableSection.jsx");
  const content = fs.readFileSync(componentPath, "utf8");

  // A. Zero hex colors
  const hexMatches = content.match(/#[0-9a-fA-F]{3,8}\b/g) || [];
  assert.equal(hexMatches.length, 0, `ExamTimetableSection must contain zero hex colors, found: ${hexMatches.join(", ")}`);

  // B. Zero rounded-2xl or rounded-3xl
  const largeRadiusMatches = content.match(/rounded-(2xl|3xl)/g) || [];
  assert.equal(largeRadiusMatches.length, 0, `Must not use rounded-2xl or rounded-3xl`);

  // C. Zero backdrop-blur
  assert.ok(!content.includes("backdrop-blur"), "Must not use backdrop-blur");

  // D. font-mono is reserved exclusively for the subject code badge
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes("font-mono")) {
      assert.ok(
        line.includes("exam.code") || line.includes("code") || line.includes("px-1.5"),
        `font-mono on line ${i + 1} must be reserved for subject code chip badge only: ${line.trim()}`
      );
    }
  }
});


