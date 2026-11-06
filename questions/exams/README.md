# Standardized Question Bank & Exam Repository (`questions/exams/`)

This directory houses the official examination datasets, master question banks, and bilingual practice pools for the **Tamil Nadu State Board Higher Secondary Education (HSE Class 12)** and **Secondary School Leaving Certificate (SSLC Class 10)**.

---

## 1. Standard File Naming Convention

All question sets follow this structured format:
```
[SUBJECT]-[STANDARD]-[TOTALQUESTIONS]-[SET_NUMBER].json
```

### Examples:
* `CHEMISTRY-12-100-ALL.json`: Class 12 Chemistry, 100 Questions, Complete Master Pool (Units 1 to 15, Bilingual)
* `CHEMISTRY-12-50-SET1.json`: Class 12 Chemistry, 50 Questions, Set 1 / Set A (Units 1 to 7, Bilingual)
* `CHEMISTRY-12-50-SET2.json`: Class 12 Chemistry, 50 Questions, Set 2 / Set B (Units 8 to 15, Bilingual)
* `PHYSICS-12-100-ALL.json`: Class 12 Physics, 95 Questions, Master Bilingual Pool
* `PHYSICS-12-50-SET1.json`: Class 12 Physics, 50 Questions, Set 1 (Units 1 to 5, Bilingual)
* `PHYSICS-12-50-SET2.json`: Class 12 Physics, 45 Questions, Set 2 (Units 6 to 10, Bilingual)
* `ENGLISH-12-100-ALL.json`: Class 12 English, 100 Questions (Synonyms, Antonyms, Grammar 2020–2026)
* `ENGLISH-12-50-SET1.json`: Class 12 English, 50 Questions, Set 1 (Vocabulary & Prose)
* `ENGLISH-12-50-SET2.json`: Class 12 English, 50 Questions, Set 2 (Grammar & Sentence Patterns)
* `MATHEMATICS-10-14-SET1.json`: Class 10 Mathematics, 14 Questions, Set 1 (Relations & Functions, Bilingual)
* `COMPUTER_SCIENCE-12-15-SET1.json`: Class 12 Computer Science, 15 Questions, Set 1 (Python, DB, CSV)

---

## 2. 3-Day Examination Datasets & Syllabus Mapping

Tailored for the scheduled online examination sessions (03-11, 04-11, 05-11 at 6:00 PM, 45-minute duration):

| Day | Date | Subject (Class 10) | Subject (Class 12) | Questions |
| :---: | :---: | :--- | :--- | :---: |
| **Day 1** | **03-11** | Mathematics (Relations, Numbers, Algebra) | Mathematics (Matrices, Complex, Calculus) | 25 MCQs |
| **Day 2** | **04-11** | Science (Physics, Chemistry, Biology) | Physics & Chemistry (Units 1 to 7) | 25 MCQs |
| **Day 3** | **05-11** | Social Science & English Grammar | Computer Science & Biology / Pure Science | 25 MCQs |

### Difficulty Distribution:
- **60% Textbook Foundation**: Direct Book-Back and In-Text concepts from official SCERT textbooks.
- **25% Conceptual / Numerical**: Application questions and worked numerical exercises.
- **15% HOTS (Higher Order Thinking Skills)**: Multi-concept reasoning and analytical problem solving.

---

## 3. 50-Question Syllabus Modules (25 Syllabus + 25 New Step-by-Step)

Each examination syllabus includes an extended 50-question bank:
1. **First 25 Questions**: Focused syllabus coverage matching the target exam blueprints.
2. **Additional 25 Questions**: Extended application and practice items.
3. **Step-by-Step Worked Explanations**: Every question includes complete step-by-step worked reasoning provided in both **English** and **Tamil (தமிழ்)**.

---

## 4. Authentic DGE Public Examination Archives (2020–2026)

In addition to JSON pools, full multi-year authentic public exam archives are hosted in the `QB/` directory:
- **12th Mathematics** (`QB/12/MATH/index.html`): All 7 years (2020–2026) with Parts I–IV, KaTeX math rendering, and step-by-step solutions. Accessible at `/student/qb/12/math`.
- **12th Physics** (`QB/12/PHYSICS/index.html`): All 7 years (2020–2026) in Broadsheet newspaper publication layout, bilingual toggle, Blueprint modal, and CBT quiz mode. Accessible at `/student/qb/12/physics`.
