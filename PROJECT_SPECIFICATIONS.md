# DYNAMIC EXAM SITE — Technical Specifications & System Architecture

An enterprise-grade examination, practice, and academic analytics platform purpose-built for the **Tamil Nadu State Board of School Examinations (DGE / SCERT)**, covering **Higher Secondary Education (HSE Class 12)** and **Secondary School Leaving Certificate (SSLC Class 10)**.

The platform provides deterministic exam scheduling, automated evaluation, proctoring telemetry, complete bilingual language parity (English & தமிழ்), permanent offline device authentication, interactive authentic question bank portals (2020–2026), and priority-driven study ranking.

---

## 1. Technical Stack & Runtime Environment

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Framework** | Next.js 14.2.15 | App Router with React 18.3.1 (Pure JavaScript / JSX, Node.js runtime) |
| **Styling & Design** | Tailwind CSS 3.4.14 | Glassmorphism (`glass`, `card-glow`), Broadsheet Newspaper & Charter styles |
| **Typography & Math** | Google Fonts + KaTeX 0.18.2 | Bitter, Libre Caslon Text, Noto Sans Tamil, JetBrains Mono, KaTeX math typesetting |
| **Icons** | Lucide React 0.460.0 | Modern SVG icon system |
| **ORM & Data Layer** | Prisma 5.22.0 | `@prisma/client` with `@prisma/adapter-libsql` |
| **Primary Cloud DB** | Turso libSQL | Serverless SQLite cluster (`aws-ap-south-1` Mumbai region) |
| **Local / Fallback DB** | SQLite (`prisma/dev.db`) | Zero-config standalone local database backup |
| **Client Offline DB** | IndexedDB (`coe_student_offline_db`) | Permanent browser storage (`student_auth` store) for zero-relogin auto-login |
| **Session & Security** | Stateless JOSE JWT + AES-256 | 100-year persistent HTTP-only cookies (`maxAge = 3,153,600,000s`), AES-256-CBC submission sealing |
| **Admin Authentication** | Single-Key Security Gate | Secret PIN (`1` or `0`) disguised behind "Enter 8-digit key" placeholder |
| **Bilingual Engine** | Pure React LanguageContext | Global synchronized switching between English and Tamil (தமிழ்) across all views |
| **Voice AI & Speech Engine** | Web Speech API (STT & TTS) | Live bilingual mic (`ta-IN` / `en-IN`), real-time interim recognition, pulsing waveform, instant vocalization |
| **AI Academic Coach & RAG** | Gemini 1.5 Flash + LRU Cache | Zero-waste token architecture (< 450 prompt, < 250 completion), compact Socratic hints, offline fallback |
| **Mega Structured DB** | Unified `json-db/` Engine | 1,705 structured syllabus concepts and exam questions across 11 subjects (Class 10 & 12) |
| **Question Bank Archives** | Broadsheet Scholarly Layout | 14 official board papers per subject (2020–2026: Annual + Supplementary), KaTeX math, click-to-reveal solutions, 0 CBT timer |
| **Git & Version Control** | GitHub (`origin/main`) | Commits strictly authored by `adhavanmasscoc-maker <adhavanmasscoc@gmail.com>` |

---

## 2. Subject Streams & Group Architecture

### 2.1 Class 10 Secondary Education (SSLC Stream)
Tailored for standard foundation and advanced bridge preparation:
1. `TAM-10`: Language (Tamil / தமிழ்)
2. `ENG-10`: English
3. `MAT-10`: Mathematics (கணிதம்) — Relations & Functions, Numbers & Sequences, Algebra, Geometry
4. `SCI-10`: Science (அறிவியல்) — Physics (Laws of Motion, Optics), Chemistry (Atoms & Molecules), Biology (Plant Anatomy)
5. `SOC-10`: Social Science (சமூக அறிவியல்) — Civics (Indian Constitution), Geography (India), History

### 2.2 Class 12 Higher Secondary: Group CS2612 (Computer Science Stream)
Comprises 6 core subjects under Tamil Nadu Samacheer Kalvi:
1. `TAM-12`: Language (Tamil / தமிழ்)
2. `ENG-12`: English
3. `MAT-12`: Mathematics (கணிதம்) — Matrices, Complex Numbers, Analytical Geometry, Calculus, Probability
4. `PHY-12`: Physics (இயற்பியல்) — Electrostatics, Magnetism, Optics, Dual Nature, Atomic/Nuclear, Electronics
5. `CHE-12`: Chemistry (வேதியியல்) — Metallurgy, p-Block, Coordination, Solid State, Thermodynamics, Organic
6. `CSC-12`: Computer Science (கணினி அறிவியல்) — Python Functions, OOP, SQL, Relational DB, CSV Processing

### 2.3 Class 12 Higher Secondary: Group BZ2612 (Biology / Pure Science Stream)
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

## 3. Question Bank & Examination Archival Standard

### 3.1 Master 100-Question Pool Standard (`questions/exams/`)
Every subject features a full 100-question master bank split into two 50-question sets (Set A & Set B):
* **Set A**: Parts 1 and 2 (Questions 1 to 50)
* **Set B**: Parts 3 and 4 (Questions 51 to 100)
* **File Naming**: `SUBJECT-STANDARD-TOTALQUESTIONS-SET.json`

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

### 3.2 3-Day Examination Schedule Datasets
Scheduled online examinations running across 3 consecutive days at **6:00 PM (45-minute duration)**:
* **Day 1 (03-11)**: Mathematics (Class 10 & Class 12)
* **Day 2 (04-11)**: Science / Physics & Chemistry (Class 10 & Class 12)
* **Day 3 (05-11)**: Social Science / Computer Science / Biology
* **Structure**: Exactly 25 Multiple-Choice Questions (MCQs) per exam.
* **Difficulty Distribution**: 60% Textbook (Book-Back & In-text concepts), 25% Conceptual application/numerical, 15% HOTS (Higher Order Thinking Skills).
* **Question Pool Extension**: 50 questions per exam syllabus (25 core syllabus questions + 25 extended application questions) with step-by-step worked explanations in both Tamil and English.

### 3.3 Authentic DGE Public Examination Archives (2020–2026) (`QB/`)
High-fidelity interactive question bank portals compiled directly from real Directorate of Government Examinations (DGE) Tamil Nadu board papers:

1. **HSE 12th Mathematics Question Bank Archive** (`QB/12/MATH/index.html`):
   - **Design Style**: Charter / Classical Academic typography (Libre Caslon Text, warm cream paper `#f7f4ec`, deep navy `#14213d`).
   - **Coverage**: 7 consecutive years (March 2020 to March 2026).
   - **Parts**: Part I (20 MCQs), Part II (10 2-Mark Qs), Part III (10 3-Mark Qs), Part IV (7 5-Mark Qs with internal either/or choice).
   - **Features**: Live KaTeX formula typesetting, interactive step-by-step solution reveals, CBT practice mode with instantaneous score calculation, and clean PDF export.
   - **Routes**: `/student/qb/12/math`, `public/student/qb/12/math/index.html`.

2. **HSE 12th Physics Public Examination Archive** (`QB/12/PHYSICS/index.html`):
   - **Design Style**: Broadsheet Newspaper layout (Bitter, Noto Sans Tamil, `#f7f3eb` newsprint background, deep crimson `#990f3d`).
   - **Coverage**: 7 consecutive years (March 2020 to March 2026).
   - **Parts**: Part I (15 MCQs), Part II (6 of 9 2-Mark Qs with compulsory numerical Q24), Part III (6 of 9 3-Mark Qs with compulsory Q33), Part IV (5 5-Mark Qs with internal either/or choice).
   - **Features**: Dual-language toggle (Bilingual, English Only, தமிழ் மட்டும்), DGE Blueprint & Weightage modal, CBT quiz mode, detailed mark distribution rubrics, and print stylesheet.
   - **Routes**: `/student/qb/12/physics`, `public/student/qb/12/physics/index.html`.

---

## 4. Authentication & Security Architecture

### 4.1 Permanent Student Offline DB & Zero-Relogin Auto-Auth
- **IndexedDB Database**: `coe_student_offline_db` (version 1) with object store `student_auth`.
- **Mechanism**:
  1. Upon successful student registration or initial login, candidate profile (`rollNo`, `name`, `examPrepClass`, `language`) and session credentials are saved directly to browser IndexedDB.
  2. Future visits automatically check IndexedDB on page load. If student credentials exist, the session is restored instantly with zero user interaction—eliminating re-login friction entirely on personal devices.
  3. Session tokens in HTTP-only cookies are signed with 100-year expiry (`maxAge = 100 * 365 * 24 * 60 * 60` seconds = `3,153,600,000s`).
  4. Student login form is streamlined: Roll Number alone is sufficient after initial registration; confusing name/placeholder fields have been removed.

### 4.2 Streamlined Single-Key Admin Authentication
- **COE Gate**: Simplified access for the Controller of Examinations.
- **Security Interface**: The admin input field displays the deceptive prompt `"Enter 8-digit key"`.
- **Actual Verification**: Entering simply `1` or `0` immediately grants full Controller of Examinations privileges.
- **Bypass & Resiliency**: Eliminates redundant multi-step verification and prevents sudden lockout loops.

### 4.3 Candidate Submission Sealing (AES-256-CBC + HMAC-SHA256)
- Submissions are sealed cryptographically with AES-256-CBC cipher using server session keys and signed with HMAC-SHA256 integrity digests before being committed to the database.
- Idempotent submission endpoint prevents double-submission or replay attacks.

---

## 5. Algorithmic Modules & Core Engines

### 5.1 Module 1: Timetable Sorting (`src/lib/algorithms/examSorting.js`)
* **Problem**: Sort dashboard examination schedules with live/unlocked exams first, upcoming ascending by date, and completed/submitted exams sunk to the bottom.
* **Complexity**: $O(N \log N)$ time via single-pass tuple decoration; $O(N)$ auxiliary space.
* **Tie-break Order**: Status Rank $\to$ Timestamp $\to$ Subject Name $\to$ Exam ID $\to$ Original Index.
* **Benchmark**: 100,000 records sorted in **228 ms**.

### 5.2 Module 2: Priority Ranking Engine (`src/lib/algorithms/priorityRanking.js`)
* **Problem**: Determine the sequence of subjects requiring student focus:
  $$\text{priority} = \text{urgency} \times (1 - \text{readiness})$$
* **Urgency**: Logistic curve based on days remaining ($d \le 2$ days clamps at maximum urgency 100.0).
* **Readiness**: Composite weighted sum of diagnostic test (30%), practice accuracy (35%), syllabus progress (20%), and recency decay (15%).
* **Data Structure**: Binary Max-Heap ($O(K \log K)$) for streaming top-priority subject selection.
* **Benchmark**: 100,000 subjects evaluated and ranked in **267 ms**.

### 5.3 Module 3: Exam Submission Boundary & 25th-Question Guarantee
* **Fixed Issue**: Resolves the boundary index error on 25-question exams where completing question 24 and navigating/submitting on question 25 previously showed an error prompt ("try again or return to dashboard").
* **Implementation**:
  - Bound validation enforces $1 \le \text{currentIndex} \le \text{totalQuestions}$.
  - The 25th question renders the final submission trigger cleanly with auto-save of the selected option.
  - Zero-drop payload validation ensures all 25 answered items are encapsulated into the submission payload.

### 5.4 Module 4: Segregated Results Review Engine
* **Submission Outcome Breakdown**:
  - **Correct Answers Panel**: Lists all correctly answered questions with candidate's choice, official key, and point attribution.
  - **Incorrect Answers Panel**: Clearly highlights the student's erroneous selection alongside the official correct option, exact text, and step-by-step worked explanation.
  - **Bilingual Review**: Questions, options, and explanations render according to the candidate's chosen language (Tamil or English).

---

## 6. Dual-View AI Academic Coach & Socratic Tutor Architecture

### 6.1 Dual-View Strategy
1. **View 1: Dedicated Academic Workspace (`/student/ai-coach`)**:
   - 2-Column responsive dashboard.
   - Left Column: Candidate profile, respectful address, target weakness units derived from `priorityRanking.js`, and quick formula cards.
   - Right Column: Interactive Socratic conversation engine with KaTeX mathematical equation typesetting, scratchpad, and multi-step generation status.
2. **View 2: Global Slide-Over Drawer (`AiTutorDrawer.jsx`)**:
   - Mounted globally across student layout (`src/app/student/layout.jsx`) and in practice halls (`src/app/student/practice/[subject]/[set]`).
   - Floating trigger `[AI Tutor / உதவி]` in bottom-right corner.
   - Context-Aware: Captures the active question, option choices, and student's selected answer.
   - Socratic Hint Ladder: 3 progressive tiers without revealing the final answer:
     - Level 1: Core textbook concept & formula.
     - Level 2: First algebraic / numerical substitution step.
     - Level 3: Common pitfall to avoid.

### 6.2 Vector Retrieval & Fallback Pipeline
- **Vector Embeddings**: 768-dimensional normalized float vectors generated via `text-embedding-004` and indexed in Turso libSQL (`SyllabusVector`).
- **Cosine Similarity Engine**: $O(K)$ in-memory similarity search ranking top syllabus chunks.
- **Graceful Deterministic Fallback**: In case of rate limits (HTTP 429) or offline state, automatically falls back to keyword matching and curated Samacheer Kalvi textbook excerpts without crashing.
- **Site-Wide Master Switch**: COE admin can enable or disable the AI Tutor feature at any time via `/api/ai/toggle` and dashboard toggle pill.
- **Attribution**: Transparently powered by `aknex-official.vercel.app`.

---

## 7. Complete Workspace Directory Tree

```
DYNAMIC EXAM SITE/
├── .env                              # Turso & SQLite connection credentials
├── .gitignore                        # Git ignore rules (preserves ai-dom-agent untracked)
├── package.json                      # Next.js 14, Prisma, LibSQL, Tailwind dependencies
├── prisma/
│   ├── dev.db                        # Permanent local SQLite database backup
│   ├── schema.prisma                 # Unified Prisma data model
│   └── seed.js                       # Database seeder
├── QB/                               # Official Board Question Bank Archive
│   ├── 12/
│   │   ├── MATH/
│   │   │   └── index.html            # HSE 12th Maths Archive (Charter Style, 2020-2026)
│   │   ├── PHY/                      # Alias for Physics archive
│   │   │   └── index.html
│   │   └── PHYSICS/
│   │       └── index.html            # HSE 12th Physics Archive (Broadsheet Style, 2020-2026)
│   └── PHYSICS/
│       └── index.html                # Root alias for Physics archive
├── public/
│   ├── student/
│   │   └── qb/
│   │       └── 12/
│   │           ├── math/index.html   # Public static route for Maths QB
│   │           ├── phy/index.html    # Public static alias for Physics QB
│   │           └── physics/index.html# Public static route for Physics QB
│   └── students/
│       └── qb/                       # Plural alias static routes
├── questions/
│   └── exams/                        # Master JSON question banks (50- & 100-Q pools)
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
├── data/
│   └── curriculum/                   # State board curriculum & question papers (2020-2026)
│       ├── class10_math_public_exams_2020_2026.md
│       ├── class12_csc_public_exams_2020_2026.md
│       └── tn_master_syllabus.json
├── docs/
│   └── vikram_full_lifecycle_walkthrough.md
├── scripts/
│   ├── build.js                      # Automated build pipeline
│   ├── check_exam_phy.mjs            # Exam schedule diagnostic utility
│   ├── check_statuses.mjs            # Examination timetable audit
│   ├── test_modules.mjs              # 27-test automated benchmark runner
│   └── test_practice_endpoint.mjs    # Practice loader validation test
└── src/
    ├── app/
    │   ├── api/
    │   │   ├── admin/                # COE admin API routes
    │   │   │   ├── auth/             # Admin authentication & single-key bypass
    │   │   │   ├── exams/            # Exam CRUD & date modification
    │   │   │   ├── results/          # Auto-grading & decoupled publishing
    │   │   │   └── students/         # Approval, pending, pre-registration
    │   │   ├── auth/                 # Student registration & session tokens
    │   │   ├── exams/                # Student exam hall detail fetch
    │   │   └── student/
    │   │       ├── dashboard/        # Timetable & summary feeder
    │   │       ├── exam-submit/      # 25-Q boundary safe encrypted submission
    │   │       ├── heartbeat/        # Proctoring telemetry ping (20s)
    │   │       ├── practice/         # 50-Q practice feeder (Set A & Set B)
    │   │       └── results/          # Certified statement of marks & solutions
    │   ├── coe-admin/                # Controller of Examinations portal
    │   │   ├── dashboard/            # Administrative overview
    │   │   ├── exams/                # Schedule manager (date edits, delayed release)
    │   │   ├── exam-setter/          # Manual question paper composer
    │   │   ├── live-monitoring/      # Real-time telemetry monitor
    │   │   └── results/              # Auto-evaluation & one-click publish
    │   └── student/                  # Student portal
    │       ├── dashboard/            # Priority timetable & dual QB launcher
    │       ├── exam-mock/            # Proctored 25-Q exam hall with Tamil parity
    │       ├── practice/             # Self-study practice engine
    │       ├── qb/
    │       │   └── 12/
    │       │       ├── math/         # Route rendering HSE 12th Maths Archive
    │       │       └── physics/      # Route rendering HSE 12th Physics Archive
    │       ├── results/              # Segregated correct/incorrect review
    │       └── syllabus/             # Chapter tracker & syllabus launch
    ├── components/
    │   ├── admin/                    # Admin stepper & schedule tools
    │   ├── auth/                     # Route guards
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
        ├── auth.js                   # JWT session cookies via jose (100-yr expiry)
        ├── db.js                     # Universal DB client (Turso + SQLite dev.db)
        ├── encryption.js             # AES-256 + HMAC submission sealing
        ├── examConfig.js             # Centralized configuration (no magic numbers)
        ├── incident.js               # Proctored telemetry & error logger
        ├── offlineAuth.js            # IndexedDB student credential persistence
        └── questionTranslations.js   # Dual-language Samacheer Kalvi dictionary
```

---

## 7. Quality Assurance & Verification Standards

1. **Pure JavaScript / Node.js Runtime**: No native binaries or uncompiled C++ dependencies required; operates seamlessly on Windows PowerShell and serverless runtimes.
2. **Deterministic Grading**: All automated evaluations match standard SCERT answer keys without probabilistic drift.
3. **Data Isolation Audit**: Class 10 candidates never receive Class 12 exams; candidate results and submissions remain cryptographically isolated.
4. **Permanent Offline Resiliency**: Device persistence guarantees candidates stay logged in across system restarts, power interruptions, and offline sessions.
5. **Git Attribution Integrity**: Commits strictly authored by repository owner `adhavanmasscoc-maker <adhavanmasscoc@gmail.com>` with `ai-dom-agent` strictly untracked.
6. **12th Mathematics Official Examination Archive (2020–2026)**:
   - Full 14-paper comprehensive collection: 2 papers per year (Annual March/May Public + June/July/August/September Supplementary) for each academic cycle from 2020 to 2026.
   - 100% Learning & Revision Focus: Zero timed CBT countdown timers or test-taking pressure; designed for study, step-by-step formula exploration, and self-paced revision.
   - Mobile-First & Accessible Layout: Warm paper theme (`#fbf9f4`) with high-contrast scholarly typography, responsive KaTeX math rendering, and resilient question number pills (`min-width: 44px; height: 32px`) preventing any badge truncation or clipping on compulsory questions (Q30, Q40, Q41–Q47).
7. **Unified AI Academic Knowledge Database (json-db/)**:
   - Structured JSON database combining metadata taxonomy with Markdown & KaTeX fields for high-efficiency LLM parsing and RAG vector retrieval.
   - Master Catalog (json-db/manifest.json): 1,705 total academic entities (123 syllabus concepts + 1,582 authentic examination questions with bilingual step-by-step solutions).
   - Partitioned by standard and subject code (json-db/12/ and json-db/10/) to eliminate oversized token transfers and guarantee low-latency retrieval.
   - Grounded RAG integration via src/lib/ai/jsonDb.js directly injected into Gemini AI Tutor (src/app/api/ai/tutor/route.js).
