# Examination Portal — Project Status & Operational Roadmap

## 📌 Project Overview
- **System**: Tamil Nadu State Board (DGE / SCERT) Examination, CBT Practice & Learning Portal
- **Controller of Examinations (COE)**: Admin User — Single-Key Access (`1` or `0` secretly accepted behind deceptive "Enter 8-digit key" prompt).
- **Enrolled Candidates**:
  - **Student A (Adhavan S)**: Roll No: `TN2026-0901` | Current Class: 9 | Exam Preparation Level: Class 10 (TN Samacheer Kalvi)
  - **Student B (Nithya S)**: Roll No: `TN2026-1102` | Current Class: 11 | Exam Preparation Level: Class 12 (TN Samacheer Kalvi)
  - **Candidate Anusri**: Language: Tamil (தமிழ்) | Full Tamil Translation Parity & 25-Question Completion Verified
  - **Candidate Vikram**: Roll No: `TN2026-1005` | Class 10 Prep | 14/14 Verification Gates Passed
  - **Preview Candidate (Kavin Kumar)**: Roll No: `TN2026-0900` | Sample Candidate Profile
- **3-Day Examination Schedule**:
  - **Dates**: 03-11, 04-11, 05-11
  - **Start Time**: 6:00 PM
  - **Duration**: 45 Minutes (25 Questions per exam)
  - **Bilingual Support**: Fully supported in both English & தமிழ் across all subjects
- **Curriculum & Question Bank Datasets**:
  - 50 Questions per exam syllabus (25 core syllabus MCQs + 25 extended application MCQs) with step-by-step worked solutions in Tamil and English.
  - Authentic 2020–2026 DGE Public Examination Archives for Class 12 Mathematics (Charter Style) and Class 12 Physics (Broadsheet Newspaper Style).
- **Environment**: Next.js 14 App Router on Node.js, accessible via laptop, tablet, and mobile on local and network deployments.
- **Git Attribution**: All commits authored and pushed to `origin main` by repository owner `adhavanmasscoc-maker <adhavanmasscoc@gmail.com>`.

---

## 🛠️ Confirmed Tech Stack (Pure React / Next.js)
- **Framework**: Next.js 14.2.15 (App Router, Pure JavaScript / JSX, React 18.3.1)
- **Styling & UI**: Tailwind CSS 3.4.14, CSS Variables, Lucide Icons, Glassmorphism, Charter & Broadsheet Styles
- **Typesetting**: KaTeX 0.18.2 with Auto-Render for crisp mathematical physics equations
- **Database**: 
  - Primary Cloud: Turso libSQL (`aws-ap-south-1` serverless cluster)
  - Local Staging / Fallback: SQLite (`prisma/dev.db`)
  - Client Offline DB: IndexedDB (`coe_student_offline_db`) for permanent device sessions
- **ORM**: Prisma 5.22.0 (`@prisma/client` + `@prisma/adapter-libsql`)
- **Authentication**: Stateless JOSE JWT with 100-year session cookies (`maxAge = 3,153,600,000s`), single-key COE admin access, AES-256 submission sealing
- **Theme**: Default Eye-Friendly Dark Navy (`#0B0F19` / `#0F172A`) with Focus-First Light Mode (`#F8FAFC`) toggle and classical paper backgrounds.

---

## 🗺️ 10-Phase Roadmap & Current Status

| Phase | Description | Status | Verification & Sign-off |
|---|---|---|---|
| **Phase 0** | Project inspection, architecture, pure JS stack confirmation & roadmap agreement | 🟢 Completed | ✅ Approved |
| **Phase 1** | Design system, responsive application shell, Dark/Light modes, navigation & static mock dashboards | 🟢 Completed | ✅ Approved |
| **Phase 2** | Database schema, SQLite + Prisma setup, migrations, seed data & backend foundation | 🟢 Completed | ✅ Approved |
| **Phase 3** | Authentication system (COE Admin + Student Roll No/DOB), session management & route guards | 🟢 Completed | ✅ Approved |
| **Phase 4** | Student profile logic, class separation (9->10 & 11->12), 5-subject setup & dynamic dashboards | 🟢 Completed | ✅ Approved |
| **Phase 5** | Syllabus management (COE CRUD) & Student syllabus viewer with chapter completion tracking | 🟢 Completed | ✅ Approved |
| **Phase 6** | Study resources, Previous-Year Question (PYQ) library, source attribution & worked solutions | 🟢 Completed | ✅ Approved |
| **Phase 7** | Examination schedule engine (Draft/Publish workflow) & Distraction-Free Exam UI | 🟢 Completed | ✅ Approved |
| **Phase 8** | Progress analytics, marks entry by COE & Instant result publication | 🟢 Completed | ✅ Approved |
| **Phase 9** | Security review, strict data isolation, bilingual parity, 25-Q boundary safety & offline persistence | 🟢 Completed | ✅ Approved |
| **Phase 10** | Authentic DGE Question Bank archives (2020-2026), single-key admin access & local network deployment | 🟢 Completed | ✅ Operational |

---

## 🚀 Key Milestones & Recent Deployments

### 1. Permanent Student Offline DB & Zero-Relogin Auto-Authentication
- **Zero Friction**: Once a candidate logs in or registers on their device (laptop, tablet, or phone), their authentication credentials and profile are permanently saved to browser IndexedDB (`coe_student_offline_db` -> `student_auth`).
- **100-Year Persistent Sessions**: Cookie session tokens set to `maxAge = 100 * 365 * 24 * 60 * 60` (3.15 billion seconds).
- **Auto-Restoration**: On returning to the portal, the client auto-detects existing local credentials and authenticates immediately without prompting for re-login.
- **Streamlined Inputs**: Removed redundant placeholder distractions; student login requires only the candidate Roll Number.

### 2. Streamlined Single-Key Admin Authentication
- **Fast COE Access**: Controller of Examinations enters `1` or `0` to instantly unlock administrative privileges.
- **Disguised Security UI**: Admin PIN field presents placeholder `"Enter 8-digit key"` for UI consistency while accepting the secret single-character key.
- **Zero Lockout**: Eliminates two-step bottlenecks and unexpected session drops.

### 3. Full Bilingual Parity (Tamil & English) & Translation Quality
- **Complete Tamil Localization**: All questions, options, explanations, exam guidelines, and dashboard cards seamlessly render in Tamil when the candidate's preferred medium is Tamil (`ta`) or when toggled in the header.
- **Chemistry & Core Science Fix**: Corrected translation gaps in Class 12 Chemistry, Physics, and Mathematics exams so Tamil-medium students (e.g., candidate Anusri) receive authentic SCERT Tamil terminology.

### 4. 25th Question Boundary Fix & Zero-Drop Submission
- **Fixed Boundary Anomaly**: Resolved the issue where answering question 24 and advancing to question 25 displayed an error ("try again or return to dashboard").
- **Flawless Final Submission**: Candidates can view, answer, navigate back/forward, and submit the 25th question with full auto-save.
- **Payload Integrity**: Guaranteed that all 25 answered items are sealed and processed into evaluation.

### 5. Detailed Post-Submission Results & Worked Solutions Breakdown
- **Correct vs. Wrong Panels**:
  - **Correct Answers**: Displays question text, student's correct choice, official key, and awarded marks.
  - **Incorrect Answers**: Displays student's chosen option, the exact correct answer, and step-by-step worked explanations.
- **Bilingual Review**: Explanations and options display in the candidate's selected language.

### 6. Authentic DGE Question Bank Archives (2020–2026)
- **12th Mathematics Archive** (`QB/12/MATH/index.html` & `/student/qb/12/math`):
  - Charter classical style, 7 years of official papers (2020–2026), Parts I–IV, KaTeX math rendering, step-by-step solutions, and CBT mode.
- **12th Physics Archive** (`QB/12/PHYSICS/index.html` & `/student/qb/12/physics`):
  - Broadsheet newspaper publication layout, 7 years of official papers (2020–2026), Parts I–IV, bilingual toggle (Bilingual, English, தமிழ்), DGE Blueprint modal, and CBT quiz mode.
- **Dashboard Quick-Launch**: Student dashboard includes direct launch buttons for both 12th Maths and 12th Physics Question Banks.

### 7. Dual-View AI Academic Coach & Socratic Tutor System
- **View 1 (Dedicated Workspace)**: Full 2-column workspace at `/student/ai-coach` featuring weakness radar derived from `priorityRanking.js`, subject switcher (`MAT-12`, `CHE-12`, `PHY-12`, `CSC-12`), scratchpad, and respectful address.
- **View 2 (Slide-Over Drawer)**: Global interactive side drawer (`AiTutorDrawer.jsx`) mounted in `student/layout.jsx` and in practice exam halls with active question context.
- **Socratic 3-Level Hint Ladder**: Provides progressive guidance (Level 1: Core Concept, Level 2: First Math Step, Level 3: Common Pitfall) without leaking answer options.
- **KaTeX Mathematical Typesetting**: Crisp formula rendering for inline `$ ... $` and block `$$ ... $$` mathematics via `MathRenderer.jsx`.
- **Vector Retrieval & Fallback**: Indexed syllabus chunks for `MAT-12` and `CHE-12` in Turso libSQL (`SyllabusVector`); graceful deterministic fallback ensuring zero crashes.
- **Site-Wide Master Switch**: Controller of Examinations can enable or disable the AI Tutor feature at any time via COE Dashboard button and `/api/ai/toggle`.
- **Brand Attribution**: Integrated `powered by aknex-official.vercel.app`.

### 8. Git & Repository Management
- **Author Identity**: All commits committed and pushed to `https://github.com/adhavanmasscoc-maker/COE.git` under `adhavanmasscoc-maker <adhavanmasscoc@gmail.com>`.
- **Integrity**: `ai-dom-agent` strictly untracked and untouched.
