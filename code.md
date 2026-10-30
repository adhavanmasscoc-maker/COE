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
  role         String          @default("STUDENT") // ADMIN | STUDENT
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
// Note: Sets environment defaults for headless Vercel environments.
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

## 4. API Endpoints (`src/app/api/`)

### `src/app/api/admin/exams/[id]/random-questions/route.js`
*Generates and swaps questions from 100-QB pool using random, sequential, or 10-policy logic:*
```javascript
// Data structure: Fisher-Yates array shuffling with Set deduplication.
// Time complexity: O(N) random sampling from 100-question pool.
// Note: Supports option scrambling (ABCD) with automatic correct-answer key remapping.
export async function POST(request, { params }) {
  const { action, poolRange, count, totalMarks, selectionMode, shuffleOptions } = await request.json();
  const bankItems = await db.questionBankItem.findMany({ where: { subjectId: exam.subjectId } });
  
  let pool = filterPoolRange(bankItems, poolRange);
  let sampled = selectionMode === "sequential" 
    ? pool.slice(0, count) 
    : sampleRandom(pool, count);

  await db.examQuestion.deleteMany({ where: { examScheduleId: params.id } });
  await db.examQuestion.createMany({
    data: sampled.map((bq, i) => {
      let opts = JSON.parse(bq.options);
      let corr = bq.correctAnswer;
      if (shuffleOptions) {
        const scrambled = scrambleQuestionOptions(opts, corr);
        opts = scrambled.options;
        corr = scrambled.correctAnswer;
      }
      return {
        examScheduleId: params.id,
        questionNumber: i + 1,
        questionText: bq.questionText,
        options: JSON.stringify(opts),
        correctAnswer: corr,
        marks: Math.max(1, Math.round(totalMarks / count))
      };
    })
  });
  return NextResponse.json({ success: true, count: sampled.length, totalMarks });
}
```

### `src/app/api/student/dashboard/route.js`
*Provides student profile, assigned subjects, progress percentage, and isolated upcoming exams:*
```javascript
// Data structure: Relational student profile with chapter progress Set.
// Time complexity: O(S + C) single pass subject syllabus aggregation.
// Note: Strict standard isolation (Class 10 only receives 10th exams, Class 12 receives 12th).
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const previewRollNo = searchParams.get("previewRollNo");
  
  const profile = await resolveProfile(previewRollNo);
  const upcomingExams = await db.examSchedule.findMany({
    where: { prepClass: profile.examPrepClass, status: "PUBLISHED" },
    include: { subject: true },
    orderBy: { examDate: "asc" }
  });

  return NextResponse.json({ success: true, profile, upcomingExams });
}
```

---

## 5. Administration Pages (`src/app/coe-admin/`)

### `src/app/coe-admin/exams/page.jsx`
*COE timetable controller, date editor, 10-Phase stepper, and Question Bank Random Swapper:*
```jsx
// Data structure: React state hooks with memoized filter list.
// Time complexity: O(N) client-side filtering and phase computation.
// Note: Integrates instant presets (10 Qs, 15 Qs, 25 Qs, 50 Qs, 100 Qs) and option scrambling.
export default function COEAdminExamsPage() {
  const [exams, setExams] = useState([]);
  const [randomSwapperExam, setRandomSwapperExam] = useState(null);

  const handleGenerateFromPool = async (overrideParams = {}) => {
    const res = await fetch(`/api/admin/exams/${randomSwapperExam.id}/random-questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(overrideParams)
    });
    const data = await res.json();
    if (res.ok) {
      setRandomSwapperExam(prev => ({ ...prev, totalMarks: data.totalMarks, _count: { questions: data.count } }));
      fetchExams();
    }
  };
  return <AdminGuard><COEAdminExamsContent /></AdminGuard>;
}
```

---

## 6. Student Interface (`src/app/student/`)

### `src/app/student/dashboard/page.jsx`
*Candidate dashboard with upcoming timetable sort, live countdowns, and dual syllabus launcher:*
```jsx
// Data structure: O(N log N) single-pass deterministic tuple sort via sortExams.
// Time complexity: O(N log N) time, O(N) memory.
// Note: Zero-throw date formatters (safeDateStr & safeTimeStr) prevent Invalid Date crashes.
export default function StudentDashboardPage() {
  const rawExams = data?.upcomingExams;
  const sortedExams = useMemo(() => sortExams(rawExams || []), [rawExams]);

  return (
    <Suspense fallback={<Loader2 className="animate-spin text-violet-400" />}>
      <StudentDashboardContent sortedExams={sortedExams} />
    </Suspense>
  );
}
```

---

## 7. Algorithms & Core Libraries (`src/lib/`)

### `src/lib/config/engine.config.js`
*Central engine configurations and O(N log N) exam timetable sorter:*
```javascript
// Data structure: Array decoration with tuple { e, rank, examAt, subject, id, originalIndex }.
// Time complexity: O(N log N) with O(N) memory allocation and single-pass timestamp normalization.
// Note: All thresholds and priorities centralized here without magic numbers.
export function sortExams(exams, now = Date.now(), cfg = ENGINE_CONFIG) {
  if (!Array.isArray(exams) || exams.length === 0) return [];
  const nowMs = typeof now === "number" ? now : new Date(now).getTime();

  const statusOf = (e) => {
    if (e.isSubmitted || e.submission?.isSubmitted || e.status === "COMPLETED") return "completed";
    const examAtMs = new Date(e.examAt || e.examDate || 0).getTime();
    if (examAtMs > 0 && nowMs >= examAtMs) return "live";
    return "upcoming";
  };

  return exams
    .map((e, idx) => ({
      e,
      rank: cfg.statusRank[statusOf(e || {})] ?? 1,
      examAt: new Date(e?.examAt || e?.examDate || 0).getTime() || 0,
      subject: typeof e?.subject === "string" ? e.subject : (e?.subject?.name || ""),
      id: String(e?.id || idx),
      originalIndex: idx
    }))
    .sort((a, b) =>
      a.rank - b.rank ||
      (a.rank === cfg.statusRank.completed ? b.examAt - a.examAt : a.examAt - b.examAt) ||
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
// Data structure: Ciphertext buffer with initialization vector (IV) and HMAC signature.
// Time complexity: O(B) linear with response byte size.
// Note: Guarantees candidate submission confidentiality and tamper-proof verification.
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

### `src/lib/db.js`
*Universal Turso Cloud libSQL adapter with local SQLite dev fallback:*
```javascript
// Data structure: Prisma Client instance with LibSQL Web Client Driver adapter.
// Note: Eliminates cold start latency and handles offline/serverless runtimes cleanly.
import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client/web";

const url = process.env.TURSO_DATABASE_URL || "file:./dev.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

const libsql = createClient({ url, authToken });
const adapter = new PrismaLibSQL(libsql);
export const db = globalThis.__prisma__ || new PrismaClient({ adapter });
if (process.env.NODE_ENV !== "production") globalThis.__prisma__ = db;
```

---

## 8. Error Boundaries & Resilience (`src/app/`)

### `src/app/error.jsx`
*Client exception recovery and ChunkLoadError auto-reloader:*
```jsx
// Note: Catches all unhandled React exceptions in Next.js App Router.
// Prevents default "Application error: a client-side exception has occurred" white screen.
"use client";
import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function RootErrorBoundary({ error, reset }) {
  useEffect(() => {
    if (error?.name === "ChunkLoadError" || error?.message?.includes("Loading chunk")) {
      window.location.reload();
    }
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="glass rounded-2xl p-6 border border-rose-500/30 text-center space-y-4">
        <h2 className="text-lg font-bold text-foreground">COE Portal Session Recovered</h2>
        <p className="text-xs text-muted-foreground">{error?.message || "Client runtime recovered."}</p>
        <Button onClick={() => (reset ? reset() : window.location.reload())}>Reload State</Button>
      </div>
    </div>
  );
}
```
