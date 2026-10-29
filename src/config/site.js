/**
 * Antigravity COE Examination Engine — Central Configuration
 * Phase 0: Setup, Stack Definition, Theme Tokens, & Known Issues
 */

export const SITE_CONFIG = {
  name: "Aknex COE Examination System",
  shortName: "COE Exam Portal",
  board: "Tamil Nadu Samacheer Kalvi",
  authority: "Directorate of Government Examinations (DGE), Chennai",
  academicYear: "2026–2027",

  // Stack Specification
  stack: {
    framework: "Next.js 14 (App Router)",
    backend: "Next.js Route Handlers (REST)",
    database: "SQLite with Prisma ORM 5.22",
    auth: "Stateless JWT (jose) in HTTP-only cookies with bcryptjs password hashing",
    styling: "Tailwind CSS + Custom CSS Variables",
  },

  // Main Entities
  entities: [
    "User",
    "StudentProfile",
    "Subject",
    "QuestionBankItem",
    "ExamSchedule",
    "ExamQuestion",
    "ExamSubmission",
    "ExamResult",
    "WorkedSolution",
    "IncidentLog"
  ],

  // Phase 0.2: Supported Languages & Defaults
  i18n: {
    supportedLanguages: [
      { code: "en", label: "English", nativeName: "English" },
      { code: "ta", label: "Tamil", nativeName: "தமிழ்" },
    ],
    defaultLanguage: "en",
    fallbackLanguage: "en",
  },

  // Phase 0.2: Theme Tokens (Dim Light & Google Palette)
  theme: {
    modes: ["dark", "light"],
    defaultMode: "dark",
    dimLight: {
      bg: "#E6E3DC",       // Calm, soft warm slate — NO harsh pure white
      surface: "#EDEAE3",  // Raised card surface
      text: "#2B2B2B",     // Primary dark text (WCAG AA compliant)
      muted: "#5E5E5E",    // Secondary subtle text
      border: "#C9C5BB",   // Clean structural border
    },
    // Google Palette strictly in Red -> Green -> Blue -> Yellow order
    googlePalette: {
      red: "#B8564E",      // Red: Error, danger, closed, urgent alerts
      green: "#5B9A6B",    // Green: Success, verified, published, live exam
      blue: "#5F87C6",     // Blue: Primary action, info, active state
      yellow: "#C9A24A",   // Yellow: Warning, pending evaluation, review needed
    },
    layout: {
      borderRadius: "6px", // Clean rectangular edges, strictly no oval/pill cards
    }
  },

  // Phase 0.2: Exam Defaults
  examDefaults: {
    durationMinutes: 150,
    totalMarks: 100,
    passingPercentage: 35,
    examLanguage: "en",
    autoSubmitOnTimeUp: true,
    shufflingEnabled: true,
  },

  // Phase 0.3: Known Issues Tracker
  knownIssues: [
    {
      id: "PHASE_2_AUTH_BUG",
      area: "Authentication & Registration",
      description: "Student registration succeeds but immediate sign-in fails due to DOB format mismatch (DD-MM-YYYY vs YYYY-MM-DD) and case sensitivity in roll numbers.",
      status: "RESOLVED",
      resolution: "Normalized input dates to ISO YYYY-MM-DD before bcrypt comparison, implemented case-insensitive roll number queries, and standardized generic error messages.",
    },
    {
      id: "PHASE_4_SCHEDULE_VISIBILITY",
      area: "Exam Scheduling",
      description: "Multi-subject batch schedules require custom per-subject timing; schedules intermittently failed to appear in student sections due to stale state or query filtering.",
      status: "RESOLVED",
      resolution: "Implemented batch scheduler with editable sequential rows, periodic 25-second auto-sync, and direct prepClass filtering.",
    },
    {
      id: "PHASE_7_THEME_GLARE",
      area: "UI & Theme",
      description: "Light mode previously blinded users with pure #FFFFFF glare and cards used non-standard oval pill shapes.",
      status: "RESOLVED",
      resolution: "Implemented dim light mode (#E6E3DC / #EDEAE3), 6px rectangular box radius, and dimmed Google R-G-B-Y color tokens.",
    }
  ]
};

export default SITE_CONFIG;

