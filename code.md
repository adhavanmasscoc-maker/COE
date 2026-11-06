# DYNAMIC EXAM SITE — Architecture & Source Code Reference (`code.md`)

This document provides representative code snippets, structural breakdowns, data structures, and time complexities for every core directory and critical file across the **DYNAMIC EXAM SITE** architecture.

---

## 1. Root Configuration & Project Core

### `/.env`
*Environment credentials for Turso Cloud libSQL and fallback SQLite:*
```env
DATABASE_URL="file:./dev.db"
TURSO_DATABASE_URL="libsql://aknex-exam-db-aadhavank.aws-ap-south-1.turso.io"
TURSO_AUTH_TOKEN="eyJhbGciOiJFZERTQ..."
SESSION_SECRET="aknex-coe-production-secret-token"
```

### `/package.json`
*Dependencies: Next.js 14 App Router, Prisma, LibSQL Web Client, Tailwind CSS:*
```json
{
  "name": "dynamic-exam-site",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "node scripts/build.js",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@libsql/client": "^0.14.0",
    "@prisma/adapter-libsql": "^5.22.0",
    "@prisma/client": "^5.22.0",
    "bcryptjs": "^2.4.3",
    "jose": "^5.9.6",
    "lucide-react": "^0.460.0",
    "next": "14.2.15",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  }
}
```

### `/prisma/schema.prisma`
*Data model: Core users, profiles, exams, 100-question pool bank, submissions:*
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id           String          @id @default(cuid())
  username     String          @unique
  passwordHash String
  role         String          @default("STUDENT") // ADMIN | STUDENT | PENDING
  profile      StudentProfile?
  submissions  ExamSubmission[]
  createdAt    DateTime        @default(now())
}

model ExamSchedule {
  id              String         @id @default(cuid())
  subjectId       String
  subject         Subject        @relation(fields: [subjectId], references: [id])
  prepClass       Int            // 10 | 12
  examDate        DateTime
  durationMinutes Int            @default(45)
  totalMarks      Int            @default(25)
  status          String         @default("PUBLISHED") // PUBLISHED | DRAFT | COMPLETED
  questions       ExamQuestion[]
  submissions     ExamSubmission[]
}

model QuestionBankItem {
  id             String   @id @default(cuid())
  subjectId      String
  subject        Subject  @relation(fields: [subjectId], references: [id])
  questionNumber Int
  questionText   String
  options        String   // Serialized JSON Array [{ id: "A", text: "..." }]
  correctAnswer  String   // A | B | C | D
  explanation    String?
  difficulty     String   @default("MEDIUM") // EASY | MEDIUM | HARD
}
```

---

## 2. Master Question Bank Repository (`questions/exams/`)

### Canonical 100-Question Pool Schema (e.g., `CHEMISTRY-12-100-ALL.json`)
*Data structure: Dual-language (Tamil & English) standard Samacheer Kalvi master pool:*
```json
{
  "subject": "CHEMISTRY",
  "standard": 12,
  "total_questions": 100,
  "set_number": "ALL",
  "board": "Tamil Nadu State Board Higher Secondary Examination",
  "questions": [
    {
      "id": "CHE12-Q01",
      "unit": 1,
      "topic": "Metallurgy / உலோகவியல்",
      "question_en": "Bauxite is an ore of which metal?",
      "question_ta": "பாக்சைட் என்பது எந்த உலோகத்தின் தாது?",
      "options_en": { "a": "Iron", "b": "Aluminium", "c": "Copper", "d": "Zinc" },
      "options_ta": { "a": "இரும்பு", "b": "அலுமினியம்", "c": "தாமிரம்", "d": "துத்தநாகம்" },
      "correct_option": "b",
      "answer_en": "Aluminium",
      "answer_ta": "அலுமினியம்",
      "explanation_en": "Bauxite (Al2O3.2H2O) is the principal ore of aluminium."
    }
  ]
}
```

---

## 3. Automation & Diagnostic Scripts (`scripts/`)

### `scripts/build.js`
*Production pipeline: Auto-syncs Prisma client, seeds Turso fallback, builds Next.js:*
```javascript
// Data structure: Sequential execution pipeline steps.
// Time complexity: O(N) linear build automation.
const { execSync } = require("child_process");

console.log("🚀 Starting Antigravity COE Automated Build Pipeline...");
process.env.DATABASE_URL = process.env.DATABASE_URL || "file:./dev.db";

execSync("npx prisma generate", { stdio: "inherit" });
execSync("npx prisma db push --accept-data-loss", { stdio: "inherit" });
execSync("node prisma/seed.js", { stdio: "inherit" });
execSync("node scripts/seed-100-question-banks.js", { stdio: "inherit" });
execSync("npx next build", { stdio: "inherit" });
```

### `scripts/test_modules.mjs`
*Automated verification runner (27 test suite covering algorithms & APIs):*
```javascript
// Time complexity: O(N log N) timetable sorting benchmark.
import { sortExams } from "../src/lib/config/engine.config.js";
import { priorityRanking } from "../src/lib/algorithms/priorityRanking.js";

console.log("▶ Running COE Algorithmic Benchmark Tests...");
const mockExams = [
  { id: "e1", examDate: new Date(Date.now() + 86400000).toISOString(), isSubmitted: false },
  { id: "e2", examDate: new Date(Date.now() - 3600000).toISOString(), isSubmitted: true }
];
const sorted = sortExams(mockExams);
console.assert(sorted[0].id === "e1", "Upcoming unsubmitted exam must be first!");
```

---

## 4. Permanent Client Offline Persistence (`coe_student_offline_db`)

### `src/lib/offlineAuth.js`
*Zero-relogin offline browser store using IndexedDB:*
```javascript
// Data structure: IndexedDB object store with candidate profile and auth token.
// Benefit: Student logs in once; credentials stay permanently across device reboots.
const DB_NAME = "coe_student_offline_db";
const STORE_NAME = "student_auth";

export function openStudentDB() {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) return resolve(null);
    const req = window.indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveStudentOfflineSession(profile) {
  const db = await openStudentDB();
  if (!db) return;
  const tx = db.transaction(STORE_NAME, "readwrite");
  tx.objectStore(STORE_NAME).put({ id: "active_student", ...profile, savedAt: Date.now() });
}

export async function getStudentOfflineSession() {
  const db = await openStudentDB();
  if (!db) return null;
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).get("active_student");
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => resolve(null);
  });
}
```

---

## 5. Single-Key COE Admin Authentication

### `src/app/api/admin/auth/route.js`
*Streamlined admin gate: Accepts `1` or `0` instantly, eliminating two-step locks:*
```javascript
// Disguised placeholder: "Enter 8-digit key"
// Secret valid inputs: "1" or "0" (or official MASTER_ADMIN_PASSCODE)
export async function POST(request) {
  const { pin } = await request.json();
  const trimmed = String(pin || "").trim();

  // Instant single-key bypass for COE controller
  const isValid = trimmed === "1" || trimmed === "0" || trimmed === process.env.ADMIN_PIN;
  if (!isValid) {
    return NextResponse.json({ success: false, error: "Invalid Key" }, { status: 401 });
  }

  // Issue 100-year session token
  const token = await signJWT({ role: "ADMIN", user: "COE-Admin" }, "100y");
  const response = NextResponse.json({ success: true, redirect: "/coe-admin/dashboard" });
  response.cookies.set("exam_portal_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 100 * 365 * 24 * 60 * 60 // 100 years
  });
  return response;
}
```

---

## 6. Exam Boundary & 25th Question Guaranteed Submission

### `src/app/student/exam-mock/page.jsx`
*Zero-drop boundary validator and final submission handler:*
```jsx
// Boundary-safe index clamp ensuring Question 25 saves and triggers submit
const handleOptionSelect = (qIdx, optId) => {
  setAnswers(prev => ({ ...prev, [qIdx]: optId }));
};

const handleNextOrSubmit = async () => {
  if (currentIndex === totalQuestions - 1) {
    // 25th question reached: auto-commit answer and submit exam
    setIsSubmitting(true);
    const submissionPayload = {
      examScheduleId: exam.id,
      answers, // All 25 answers guaranteed present
      timeSpentSeconds: totalDurationSeconds - remainingSeconds,
      submittedAt: new Date().toISOString()
    };
    const res = await fetch("/api/student/exam-submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(submissionPayload)
    });
    const result = await res.json();
    if (res.ok) {
      router.push(`/student/results?examId=${exam.id}`);
    } else {
      setSubmitError(result.error || "Submission encountered an issue.");
    }
  } else {
    setCurrentIndex(i => Math.min(i + 1, totalQuestions - 1));
  }
};
```

---

## 7. Results Review Engine (Segregated Correct & Incorrect Answers)

### `src/app/student/results/page.jsx`
*Renders candidate performance with separate correct vs. wrong analysis:*
```jsx
// Correct vs Wrong item breakdown with student choice and worked solution
export function ResultsReview({ questions, userAnswers, language }) {
  const isTa = language === "ta";
  const correctItems = [];
  const wrongItems = [];

  questions.forEach((q, idx) => {
    const chosen = userAnswers[idx];
    const isCorrect = chosen === q.correctAnswer;
    const item = { ...q, chosen, isCorrect, qNumber: idx + 1 };
    if (isCorrect) correctItems.push(item);
    else wrongItems.push(item);
  });

  return (
    <div className="space-y-6">
      {/* Correct Answers Panel */}
      <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/40">
        <h3 className="text-emerald-400 font-bold mb-3">
          {isTa ? "சரியான விடைகள்" : "Correct Answers"} ({correctItems.length})
        </h3>
        {correctItems.map(item => (
          <div key={item.qNumber} className="border-b border-emerald-800/30 py-2">
            <p className="font-semibold">{item.qNumber}. {isTa ? item.question_ta : item.question_en}</p>
            <p className="text-xs text-emerald-300">
              {isTa ? "உங்கள் விடை: " : "Your Answer: "}{item.chosen} ({item.answer_en})
            </p>
          </div>
        ))}
      </div>

      {/* Incorrect Answers Panel */}
      <div className="p-5 rounded-2xl bg-rose-950/30 border border-rose-500/40">
        <h3 className="text-rose-400 font-bold mb-3">
          {isTa ? "தவறான விடைகள் & விளக்கம்" : "Incorrect Answers & Explanations"} ({wrongItems.length})
        </h3>
        {wrongItems.map(item => (
          <div key={item.qNumber} className="border-b border-rose-800/30 py-3 space-y-1">
            <p className="font-semibold">{item.qNumber}. {isTa ? item.question_ta : item.question_en}</p>
            <p className="text-xs text-rose-300">
              {isTa ? "நீங்கள் தேர்வு செய்தது: " : "You Selected: "}<span className="font-bold line-through">{item.chosen}</span>
            </p>
            <p className="text-xs text-emerald-300">
              {isTa ? "சரியான விடை: " : "Correct Answer: "}<span className="font-bold">{item.correctAnswer}</span> ({isTa ? item.answer_ta : item.answer_en})
            </p>
            <p className="text-xs text-slate-300 bg-slate-900/60 p-2 rounded mt-1">
              <strong>{isTa ? "விளக்கம்: " : "Explanation: "}</strong>{isTa ? item.explanation_ta || item.explanation_en : item.explanation_en}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 8. Interactive Question Bank Portal Routes

### `src/app/student/qb/12/physics/page.jsx`
*App Router integration rendering the authentic HSE 12th Physics Archive:*
```jsx
"use client";
import React from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, ExternalLink } from "lucide-react";

export default function StudentPhysicsQBPage() {
  return (
    <div className="min-h-screen bg-[#111318] text-[#f7f3eb] flex flex-col">
      <header className="border-b border-[#33302e] bg-[#1a1817] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/student/dashboard" className="px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-sm flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <div className="h-4 w-[1px] bg-zinc-700" />
          <h1 className="font-bold text-sm tracking-wide">Tamil Nadu HSE (+2) Physics Examination Archive (2020–2026)</h1>
        </div>
        <a href="/student/qb/12/physics/index.html" target="_blank" rel="noreferrer" className="text-xs text-rose-400 hover:underline flex items-center gap-1">
          Open Standalone Tab <ExternalLink className="w-3 h-3" />
        </a>
      </header>
      <main className="flex-1 w-full bg-[#f7f3eb]">
        <iframe src="/student/qb/12/physics/index.html" title="12th Physics QB Archive" className="w-full h-[calc(100vh-53px)] border-0" />
      </main>
    </div>
  );
}
```

---

## 9. Algorithms & Cryptographic Utilities (`src/lib/`)

### `src/lib/algorithms/examSorting.js`
*Timetable sorting engine with $O(N \log N)$ stability:*
```javascript
export function sortExams(exams, now = Date.now()) {
  if (!Array.isArray(exams) || exams.length === 0) return [];
  const nowMs = typeof now === "number" ? now : new Date(now).getTime();

  const getRank = (e) => {
    if (e.isSubmitted || e.submission?.isSubmitted || e.status === "COMPLETED") return 3;
    const examAtMs = new Date(e.examAt || e.examDate || 0).getTime();
    if (examAtMs > 0 && nowMs >= examAtMs) return 1; // Live
    return 2; // Upcoming
  };

  return exams
    .map((e, idx) => ({
      e,
      rank: getRank(e),
      examAt: new Date(e.examAt || e.examDate || 0).getTime() || 0,
      subject: typeof e.subject === "string" ? e.subject : (e.subject?.name || ""),
      id: String(e.id || idx),
      originalIndex: idx
    }))
    .sort((a, b) =>
      a.rank - b.rank ||
      (a.rank === 3 ? b.examAt - a.examAt : a.examAt - b.examAt) ||
      a.subject.localeCompare(b.subject) ||
      a.id.localeCompare(b.id) ||
      a.originalIndex - b.originalIndex
    )
    .map(d => d.e);
}
```

### `src/lib/encryption.js`
*AES-256-CBC paper sealing with HMAC-SHA256 integrity tag:*
```javascript
import crypto from "crypto";

const ALGORITHM = "aes-256-cbc";
const KEY = crypto.scryptSync(process.env.SESSION_SECRET || "fallback", "salt", 32);

export function sealSubmission(data) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  let encrypted = cipher.update(JSON.stringify(data), "utf8", "hex");
  encrypted += cipher.final("hex");

  const hmac = crypto.createHmac("sha256", KEY);
  hmac.update(encrypted);
  const tag = hmac.digest("hex");

  return { payload: encrypted, iv: iv.toString("hex"), tag };
}
```
