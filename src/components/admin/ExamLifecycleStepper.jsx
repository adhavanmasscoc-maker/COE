"use client";

import React, { useState } from "react";
import {
  Calendar,
  FileQuestion,
  CheckCircle2,
  Send,
  Users,
  PlayCircle,
  FileCheck,
  Calculator,
  ShieldCheck,
  Award,
  ChevronRight,
  Info
} from "lucide-react";

export const LIFECYCLE_PHASES = [
  {
    phase: 1,
    id: "SCHEDULED",
    name: "1. Exam Scheduled",
    shortName: "Scheduled",
    desc: "Exam timetable, standard & total marks configured",
    icon: Calendar,
  },
  {
    phase: 2,
    id: "QUESTIONS_SET",
    name: "2. Questions Set",
    shortName: "Questions Set",
    desc: "Question paper questions linked & prepared",
    icon: FileQuestion,
  },
  {
    phase: 3,
    id: "VERIFY_QPAPER",
    name: "3. Verify Q-Paper",
    shortName: "Verify",
    desc: "COE verification of questions, options & answers",
    icon: CheckCircle2,
  },
  {
    phase: 4,
    id: "PUBLISHED",
    name: "4. Publish",
    shortName: "Publish",
    desc: "Exam officially published in COE master registry",
    icon: Send,
  },
  {
    phase: 5,
    id: "REACH_STUDENTS",
    name: "5. Reach for Students",
    shortName: "Reached Students",
    desc: "Dispatched & active on candidate portals",
    icon: Users,
  },
  {
    phase: 6,
    id: "EXAM_LIVE",
    name: "6. Exam Live",
    shortName: "Exam Live",
    desc: "Active testing hall open for candidate attendance",
    icon: PlayCircle,
  },
  {
    phase: 7,
    id: "SUBMISSIONS",
    name: "7. Submissions",
    shortName: "Submissions",
    desc: "Candidate responses collected & AES-256 encrypted",
    icon: FileCheck,
  },
  {
    phase: 8,
    id: "EVALUATION",
    name: "8. Evaluation",
    shortName: "Evaluation",
    desc: "Objective key-based scoring & mark calculation",
    icon: Calculator,
  },
  {
    phase: 9,
    id: "VERIFY_RESULTS",
    name: "9. Verify Results",
    shortName: "Verify Moderation",
    desc: "COE moderation & final score validation",
    icon: ShieldCheck,
  },
  {
    phase: 10,
    id: "RESULT",
    name: "10. Result",
    shortName: "Result Published",
    desc: "Marksheet released to student performance cards",
    icon: Award,
  },
];

/**
 * Computes active phase index (1 to 10) for an exam
 */
export function calculateExamPhase(exam) {
  if (!exam) return 1;

  const questionsCount = exam._count?.questions ?? (exam.questions ? exam.questions.length : 0);
  const submissionsCount = exam._count?.submissions ?? (exam.submissions ? exam.submissions.length : 0);
  const resultsCount = exam._count?.results ?? (exam.results ? exam.results.length : 0);
  const isPublished = exam.status === "PUBLISHED";
  const examDate = exam.examDate ? new Date(exam.examDate) : null;
  const isDateReached = examDate ? Date.now() >= examDate.getTime() : false;

  // Phase 10: Results published to candidate card
  if (resultsCount > 0) {
    return 10;
  }

  // Phase 9: Results moderation verified (submissions evaluated and ready)
  if (submissionsCount > 0 && exam.status === "COMPLETED") {
    return 9;
  }

  // Phase 8: Evaluations (submissions exist)
  if (submissionsCount > 0) {
    return 8;
  }

  // Phase 7: Submissions started
  if (submissionsCount > 0) {
    return 7;
  }

  // Phase 6: Exam Live (exam is published and scheduled date/window reached)
  if (isPublished && isDateReached) {
    return 6;
  }

  // Phase 5: Reached for students (exam is published to students' syllabus)
  if (isPublished) {
    return 5;
  }

  // Phase 4: Published
  if (isPublished) {
    return 4;
  }

  // Phase 3: Verify (questions exist and are verified)
  if (questionsCount > 0) {
    return 3;
  }

  // Phase 2: Questions set
  if (questionsCount > 0) {
    return 2;
  }

  // Phase 1: Exam scheduled
  return 1;
}

export function ExamLifecycleStepper({ exam, mode = "full", onOpenDetail }) {
  const currentPhase = calculateExamPhase(exam);
  const [activeTooltip, setActiveTooltip] = useState(null);

  const percentComplete = Math.round((currentPhase / 10) * 100);
  const activePhaseObj = LIFECYCLE_PHASES[currentPhase - 1] || LIFECYCLE_PHASES[0];

  if (mode === "compact") {
    return (
      <div className="space-y-1.5 min-w-[170px]">
        <div className="flex items-center justify-between text-[10px]">
          <span className="font-bold text-violet-300 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
            Phase {currentPhase}/10: {activePhaseObj.shortName}
          </span>
          <span className="font-mono text-[#5c5c8a] font-semibold">{percentComplete}%</span>
        </div>

        {/* Mini 10-step progress bar */}
        <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden flex gap-0.5">
          {LIFECYCLE_PHASES.map((p) => {
            const isCompleted = p.phase < currentPhase;
            const isCurrent = p.phase === currentPhase;
            return (
              <div
                key={p.phase}
                className={`flex-1 h-full rounded-sm transition-all ${
                  isCompleted
                    ? "bg-emerald-400"
                    : isCurrent
                    ? "bg-amber-400 animate-pulse"
                    : "bg-white/10"
                }`}
                title={`${p.name}: ${p.desc}`}
              />
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-violet-950/20 via-card to-card border border-violet-500/25 shadow-xl space-y-4">
      {/* Header Summary */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge badge-amber text-xs font-bold font-mono">
              COE 10-Phase Exam Engine
            </span>
            <span className="badge badge-emerald text-xs font-bold">
              {percentComplete}% Completed
            </span>
          </div>
          <h3 className="text-sm sm:text-base font-black text-[#f0f0ff] mt-1 flex items-center gap-1.5">
            <span>Current Stage:</span>
            <span className="text-amber-300">{activePhaseObj.name}</span>
          </h3>
          <p className="text-xs text-[#a8a8d0] mt-0.5">{activePhaseObj.desc}</p>
        </div>

        <div className="text-right hidden sm:block">
          <span className="text-2xl font-black text-amber-400">{currentPhase}</span>
          <span className="text-xs text-[#5c5c8a] font-bold"> / 10 Phases</span>
        </div>
      </div>

      {/* Progress Bar with 10 Micro Nodes */}
      <div className="relative pt-2">
        <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-amber-400 transition-all duration-500 rounded-full"
            style={{ width: `${percentComplete}%` }}
          />
        </div>
      </div>

      {/* 10-Step Interactive Stepper Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2 pt-1">
        {LIFECYCLE_PHASES.map((p) => {
          const isCompleted = p.phase < currentPhase;
          const isCurrent = p.phase === currentPhase;
          const isPending = p.phase > currentPhase;
          const Icon = p.icon;

          let stepStyle = "bg-white/5 border-white/10 text-[#5c5c8a]";
          let iconColor = "text-[#5c5c8a]";
          let badgeText = "Pending";

          if (isCompleted) {
            stepStyle = "bg-emerald-500/10 border-emerald-500/30 text-emerald-300";
            iconColor = "text-emerald-400";
            badgeText = "Done";
          } else if (isCurrent) {
            stepStyle = "bg-amber-500/15 border-amber-500/40 text-amber-200 ring-2 ring-amber-400/40 shadow-lg shadow-amber-500/20";
            iconColor = "text-amber-400";
            badgeText = "Active";
          }

          return (
            <div
              key={p.phase}
              className={`p-2.5 rounded-xl border flex flex-col items-center text-center transition-all relative ${stepStyle}`}
            >
              <div className="w-7 h-7 rounded-lg bg-black/30 flex items-center justify-center mb-1.5">
                <Icon className={`w-3.5 h-3.5 ${iconColor} ${isCurrent ? "animate-bounce" : ""}`} />
              </div>

              <span className="text-[10px] font-bold leading-tight line-clamp-1">
                {p.phase}. {p.shortName}
              </span>

              <span
                className={`text-[9px] font-mono mt-1 px-1.5 py-0.2 rounded-full font-semibold ${
                  isCompleted
                    ? "bg-emerald-500/20 text-emerald-300"
                    : isCurrent
                    ? "bg-amber-500/25 text-amber-200"
                    : "bg-white/5 text-[#5c5c8a]"
                }`}
              >
                {badgeText}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
