# DYNAMIC EXAM SITE — Technical Specifications & Architecture

An examination, practice, and academic analytics platform built for **Tamil Nadu State Board Higher Secondary Education (HSE Class 12)** and Secondary Education (SSLC Class 10). The platform provides deterministic exam scheduling, auto-grading, proctoring telemetry, bilingual language parity, and priority-driven study scheduling.

---

## 1. Technical Stack & Runtime Environment

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Framework** | Next.js 14.2.15 | App Router with React 18.3.1 (JavaScript, Node.js runtime) |
| **Styling** | Tailwind CSS 3.4.14 | Custom CSS custom properties, responsive glassmorphism (`glass`, `card-glow`) |
| **Icons** | Lucide React 0.453.0 | Modern SVG icon set |
| **ORM & Data Layer** | Prisma 5.21.1 | `@prisma/client` with `@prisma/adapter-libsql` |
| **Primary Cloud DB** | Turso libSQL | Serverless SQLite cluster (`aws-ap-south-1` Mumbai region) |
| **Staging Fallback** | SQLite (`prisma/dev.db`) | Automatically staged to `/tmp/dev.db` on serverless read-only runtimes |
| **Authentication** | Stateless JWT | Signed with HMAC-SHA256 (`jose`), DOB password hashing via `bcryptjs` |
| **Encryption** | AES-256-CBC + HMAC-SHA256 | Submission payloads sealed with candidate credentials before persisting |
| **Algorithms** | Deterministic Pure JS | O(N log N) stable sorting, Max-Heap priority ranking, single-pass Map lookups |

---

## 2. Subject Streams & Group Architecture

Class 12 students are categorized into distinct academic streams under the Tamil Nadu Samacheer Kalvi board:

### 2.1 Group CS2612 (Computer Science Stream)
Comprises 6 core subjects:
1. `TAM-12`: Language (Tamil / தமிழ்)
2. `ENG-12`: English
3. `MAT-12`: Mathematics (கணிதம்)
4. `PHY-12`: Physics (இயற்பியல்)
5. `CHE-12`: Chemistry (வேதியியல்)
6. `CSC-12`: Computer Science (கணினி அறிவியல்)

### 2.2 Group BZ2612 (Biology / Pure Science Stream)
Comprises 6 core subjects:
1. `TAM-12`: Language (Tamil / தமிழ்)
2. `ENG-12`: English
3. `PHY-12`: Physics (இயற்பியல்)
4. `CHE-12`: Chemistry (வேதியியல்)
5. **Stream Path A (General Biology)**:
   * `MAT-12`: Mathematics
   * `BIO-12`: Biology (Combined Botany & Zoology)
6. **Stream Path B (Pure Science)**:
   * `BOT-12`: Botany (தாவரவியல்)
   * `ZOO-12`: Zoology (விலங்கியல்)

---

## 3. Question Bank Naming Standard & Part Structure

Every subject features a full 100-question master bank split into standard two-set practice modules:
* **Set A**: Parts 1 and 2 (Questions 1 to 50)
* **Set B**: Parts 3 and 4 (Questions 51 to 100)

File naming strictly adheres to:
`SUBJECT-STANDARD-TOTALQUESTIONS-SET.json`

```
questions/exams/ & exams/questions/
├── CHEMISTRY-12-100-ALL.json        (100 Qs Bilingual: Units 1 to 15)
├── CHEMISTRY-12-50-SET1.json        (50 Qs Bilingual: Units 1 to 7 - Set A)
├── CHEMISTRY-12-50-SET2.json        (50 Qs Bilingual: Units 8 to 15 - Set B)
├── ENGLISH-12-100-ALL.json          (100 Qs: Synonyms, Antonyms, Grammar 2020-2026)
├── ENGLISH-12-50-SET1.json          (50 Qs: Synonyms, Antonyms, Vocabulary - Set A)
├── ENGLISH-12-50-SET2.json          (50 Qs: Grammar Patterns, Conditionals - Set B)
├── PHYSICS-12-100-ALL.json          (95 Qs Bilingual: Master Set 1 & Set 2)
├── PHYSICS-12-50-SET1.json          (50 Qs Bilingual: Units 1 to 5 - Set A)
├── PHYSICS-12-50-SET2.json          (45 Qs Bilingual: Units 6 to 10 - Set B)
├── COMPUTER_SCIENCE-12-15-SET1.json (15 Qs: Python, Relational DB & CSV)
└── MATHEMATICS-10-14-SET1.json       (14 Qs Bilingual: Relations & Functions)
```

---

## 4. Algorithmic Modules

### 4.1 Module 1: Exam Table Sorting (`src/lib/algorithms/examSorting.js`)
* **Problem**: Sort dashboard examination schedules with upcoming active/unlocked exams first, earliest upcoming dates ascending, and submitted exams sunk to the bottom.
* **Complexity**: Time: $O(N \log N)$ via single-pass tuple decoration. Space: $O(N)$ pure immutability.
* **Tie-break**: Status Group $\to$ Timestamp $\to$ Subject Name $\to$ Exam ID.
* **Benchmark**: 100,000 records sorted in **228 ms**.

### 4.2 Module 2: Subject Priority Ranking (`src/lib/algorithms/priorityRanking.js`)
* **Problem**: Determine the sequence of subjects requiring student focus based on:
  $$\text{priority} = \text{urgency} \times (1 - \text{readiness})$$
* **Urgency**: Logistic hill curve based on days remaining ($d \le 2$ days pegs at maximum urgency 100.0).
* **Readiness**: Composite weighted sum of diagnostic test (30%), practice accuracy (35%), syllabus progress (20%), and recency decay (15%).
* **Max-Heap**: $O(K \log K)$ binary heap for streaming top-priority subject selection.
* **Benchmark**: 100,000 subjects evaluated and ranked in **267 ms**.

---

## 5. Complete Workspace Directory Tree

```
DYNAMIC EXAM SITE/
├── .env                              # Environment credentials (DATABASE_URL, TURSO_AUTH_TOKEN)
├── package.json                      # Next.js, Prisma, LibSQL, Tailwind dependencies
├── prisma/
│   ├── dev.db                        # Permanent local SQLite database backup
│   └── schema.prisma                 # Unified Prisma data model
├── questions/
│   └── exams/                        # Master question bank repository
│       ├── CHEMISTRY-12-100-ALL.json
│       ├── CHEMISTRY-12-50-SET1.json
│       ├── CHEMISTRY-12-50-SET2.json
│       ├── ENGLISH-12-100-ALL.json
│       ├── ENGLISH-12-50-SET1.json
│       ├── ENGLISH-12-50-SET2.json
│       ├── PHYSICS-12-100-ALL.json
│       ├── PHYSICS-12-50-SET1.json
│       ├── PHYSICS-12-50-SET2.json
│       ├── COMPUTER_SCIENCE-12-15-SET1.json
│       └── MATHEMATICS-10-14-SET1.json
├── exams/
│   └── questions/                    # Mirrored repository for backward-compatible routing
├── scripts/
│   ├── build.js                      # Custom production build pipeline
│   ├── check_exam_phy.mjs            # Turso examination diagnostic script
│   ├── check_statuses.mjs            # Exam schedule audit utility
│   ├── check_subjects.mjs            # Turso subject registry inspector
│   ├── test_modules.mjs              # 27-test automated benchmark runner
│   └── test_practice_endpoint.mjs    # Practice loader validation test
└── src/
    ├── app/
    │   ├── api/
    │   │   ├── admin/                # COE admin API routes
    │   │   │   ├── exams/            # Exam CRUD & date modification
    │   │   │   ├── results/          # Auto-grading & decoupled publishing
    │   │   │   └── students/         # Approval, pending, pre-registration
    │   │   ├── auth/                 # Student registration & session tokens
    │   │   ├── exams/                # Student exam hall detail fetch
    │   │   └── student/
    │   │       ├── dashboard/        # Dashboard timetable & summary data
    │   │       ├── exam-submit/      # Idempotent AES-encrypted exam sealing
    │   │       ├── heartbeat/        # Proctoring telemetry ping (20s)
    │   │       ├── practice/         # 50-question Set A & Set B feeder
    │   │       └── results/          # Certified statement of marks & solutions
    │   ├── coe-admin/                # Controller of Examinations portal
    │   │   ├── dashboard/            # Administrative overview
    │   │   ├── exams/                # Schedule manager (date edits, delayed release)
    │   │   ├── exam-setter/          # Manual question paper composer
    │   │   ├── live-monitoring/      # Real-time incident & screen stream monitor
    │   │   └── results/              # Auto-evaluation & one-click publish
    │   └── student/                  # Student portal
    │       ├── dashboard/            # Priority timetable & study cards
    │       ├── exam-mock/            # Official proctored exam hall
    │       ├── practice/             # Self-study practice engine
    │       │   └── [subject]/[set]/  # Dynamic 50-question practice runner
    │       ├── results/              # Statement of Marks & evaluated papers
    │       └── syllabus/             # Chapter tracker & question bank launch
    ├── components/
    │   ├── admin/                    # Exam lifecycle stepper, paste panels
    │   ├── auth/                     # Admin route guards
    │   ├── layout/                   # AppShell, Navbar, Footer
    │   ├── telemetry/                # ActivityTracker & incident logger
    │   ├── theme/                    # ThemeProvider & Dark/Light mode toggle
    │   └── ui/                       # Badge, Button, Card, Skeleton
    ├── context/
    │   └── LanguageContext.jsx       # Global English/Tamil dual-language state
    └── lib/
        ├── algorithms/
        │   ├── examSorting.js        # Module 1: O(N log N) timetable sorter
        │   └── priorityRanking.js    # Module 2: Max-Heap priority engine
        ├── auth.js                   # JWT session cookies via jose
        ├── db.js                     # Universal DB client (Turso + SQLite fallback)
        ├── encryption.js             # AES-256 + HMAC submission sealing
        ├── examConfig.js             # Centralized configuration (no magic numbers)
        ├── incident.js               # Proctored telemetry & error logger
        └── questionTranslations.js   # Dual-language Samacheer Kalvi dictionary
```

