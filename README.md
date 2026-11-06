# Tamil Nadu State Board Examination & CBT Learning Portal

[![Next.js](https://img.shields.io/badge/Next.js-14.2.15-black?logo=next.js)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22.0-blue?logo=prisma)](https://www.prisma.io/)
[![Turso](https://img.shields.io/badge/Database-Turso%20libSQL-00eb88)](https://turso.tech/)
[![Bilingual](https://img.shields.io/badge/Language-English%20%7C%20%E0%AE%A4%E0%AE%AE%E0%AE%BF%E0%AE%B4%E0%AF%8D-orange)](https://github.com/adhavanmasscoc-maker/COE)
[![Board](https://img.shields.io/badge/Curriculum-TN%20Samacheer%20Kalvi-indigo)](https://dge.tn.gov.in/)

An enterprise-grade online examination, CBT practice, and academic analytics platform built specifically for the **Tamil Nadu Directorate of Government Examinations (DGE / SCERT)**, covering **Class 12 Higher Secondary (HSE)** and **Class 10 Secondary Education (SSLC)**.

---

## 🌟 Key Highlights & System Capabilities

- **Dual-View AI Academic Coach & Socratic Tutor**:
  - **Dedicated Workspace** (`/student/ai-coach`): 2-Column interactive dashboard with weakness radar from `priorityRanking.js`, formula review cards, and calculation scratchpad.
  - **Global Slide-Over Drawer** (`AiTutorDrawer.jsx`): Mounted across all student views and practice halls with real-time question context awareness.
  - **3-Tier Socratic Hint Ladder**: Progressive hint delivery without revealing final options; KaTeX formula typesetting; respectful student addressing by name.
  - **Site-Wide Master Switch**: COE admin can enable or disable the AI Tutor anytime with a single click.
  - **Attribution**: Powered by `aknex-official.vercel.app`.
- **Permanent Student Offline Storage**: Integrated IndexedDB caching (`coe_student_offline_db`) and 100-year session tokens. Once a student registers or logs in on their phone, tablet, or laptop, they never need to log in again.
- **Single-Key COE Admin Access**: Streamlined Controller of Examinations access using a secret single-character key (`1` or `0`) behind a deceptive "Enter 8-digit key" placeholder.
- **Complete Bilingual Parity (English & தமிழ்)**: Instant global switching between English and Tamil across all examination questions, options, step-by-step explanations, instructions, and dashboards.
- **Authentic DGE Question Bank Archives (2020–2026)**:
  - **HSE 12th Mathematics Archive** (`/student/qb/12/math`): Classical Charter style, KaTeX math rendering, Parts I–IV, worked solutions, and CBT practice mode.
  - **HSE 12th Physics Archive** (`/student/qb/12/physics`): Broadsheet newspaper publication layout, bilingual toggle, DGE Blueprint modal, and CBT quiz mode.
- **3-Day Online Examination Engine**:
  - **Exam Dates**: 03-11, 04-11, 05-11 at **6:00 PM** (45-minute duration).
  - **Structure**: 25 proctored MCQs with guaranteed final submission safety on Question 25.
  - **Question Bank Depth**: 50 questions per exam syllabus (25 core syllabus + 25 extended application) with step-by-step worked solutions in Tamil and English.
- **Segregated Results Review**: Detailed post-submission review showing correct vs. wrong answers, selected options, official answers, and step-by-step worked explanations.
- **Deterministic Scheduling Algorithms**: $O(N \log N)$ timetable sorting and Max-Heap priority ranking for personalized student study paths.

---

## 📚 Subject Streams

### Class 10 (SSLC Stream)
- Language (Tamil / தமிழ்)
- English
- Mathematics (கணிதம்)
- Science (அறிவியல்)
- Social Science (சமூக அறிவியல்)

### Class 12 (HSE Computer Science & Biology Streams)
- Language (Tamil / தமிழ்) & English
- Mathematics (கணிதம்)
- Physics (இயற்பியல்)
- Chemistry (வேதியியல்)
- Computer Science (கணினி அறிவியல்) / Biology (உயிரியல்)

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js 18.17+ or 20+
- npm or yarn

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/adhavanmasscoc-maker/COE.git
cd COE

# Install dependencies
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
DATABASE_URL="file:./dev.db"
TURSO_DATABASE_URL="libsql://aknex-exam-db-aadhavank.aws-ap-south-1.turso.io"
TURSO_AUTH_TOKEN="your_turso_token_here"
SESSION_SECRET="aknex-coe-production-secret-token"
ADMIN_PIN="1"
```

### 4. Database Setup & Seed
```bash
# Generate Prisma Client & push schema
npx prisma generate
npx prisma db push

# Seed master database & 100-question banks
node prisma/seed.js
node scripts/seed-100-question-banks.js
```

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📂 Project Documentation

- [Technical Specifications & Architecture](PROJECT_SPECIFICATIONS.md): Full technical stack, group architecture, algorithms, and directory tree.
- [Project Status & Roadmap](PROJECT_STATUS.md): Current phase status, milestones, and verification notes.
- [Architecture & Source Code Reference](code.md): Representative code snippets and structural breakdown of all core modules.
- [Standardized Question Bank Repository](questions/exams/README.md): Question bank schemas, 3-day datasets, and 50-Q modules.
- [Candidate Lifecycle Walkthrough](docs/vikram_full_lifecycle_walkthrough.md): 14-gate verification audit log.

---

## 🔒 Security & Data Integrity
- Passwords and dates of birth are hashed using `bcryptjs` with 12 salt rounds.
- Session tokens are signed using JOSE HS256 JWTs stored in HTTP-only, secure cookies.
- Submissions are cryptographically sealed with AES-256-CBC and HMAC-SHA256 digests.
- Strict class isolation prevents cross-standard question or result leakage.

---

## 👤 Author & Maintainer
- **Repository Owner**: [adhavanmasscoc-maker](https://github.com/adhavanmasscoc-maker)
- **Email**: `adhavanmasscoc@gmail.com`
- **Repository**: `https://github.com/adhavanmasscoc-maker/COE.git`

