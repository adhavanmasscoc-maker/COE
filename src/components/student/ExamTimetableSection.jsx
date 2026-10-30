"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { sortExams } from "@/lib/config/engine.config";
import { formatExamDateTime, formatCountdownText, getLifecycle } from "@/lib/timetableUtils";
import {
  Calendar,
  Clock,
  BookOpen,
  Check,
  AlertCircle,
  X,
  ShieldAlert,
  ArrowRight
} from "lucide-react";

export { formatExamDateTime, formatCountdownText, getLifecycle };

export function ExamTimetableSection({
  exams = [],
  serverNow,
  isTamil = false,
  t = (key, fallback) => fallback || key,
  isPreview = false,
  previewRoll = null,
  emptyReason = null,
  noticeText = null,
}) {
  const [showRulesDialog, setShowRulesDialog] = useState(false);
  const dialogRef = useRef(null);
  const closeBtnRef = useRef(null);

  // Client time derived from verified serverNow offset to block phone clock tampering
  const [clientNow, setClientNow] = useState(() =>
    Date.now() + (serverNow ? serverNow - Date.now() : 0)
  );

  useEffect(() => {
    const offset = serverNow ? serverNow - Date.now() : 0;
    const interval = setInterval(() => {
      setClientNow(Date.now() + offset);
    }, 1000);
    return () => clearInterval(interval);
  }, [serverNow]);

  // Dialog keyboard handling (Escape key + focus trap)
  useEffect(() => {
    if (!showRulesDialog) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowRulesDialog(false);
      }
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length > 0) {
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    setTimeout(() => closeBtnRef.current?.focus(), 50);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showRulesDialog]);

  // Sort exams: upcoming nearest first, completed at bottom
  const sortedExams = useMemo(() => {
    return sortExams(exams, clientNow);
  }, [exams, clientNow]);

  // Group exams by scheduled date
  const groupedExams = useMemo(() => {
    const groups = [];
    const map = new Map();
    for (const exam of sortedExams) {
      const { dateStr } = formatExamDateTime(exam.examDate, isTamil);
      if (!map.has(dateStr)) {
        const entry = { dateStr, items: [] };
        map.set(dateStr, entry);
        groups.push(entry);
      }
      map.get(dateStr).items.push(exam);
    }
    return groups;
  }, [sortedExams, isTamil]);

  const renderStatusBadge = (lifecycle) => {
    switch (lifecycle) {
      case "LIVE":
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2 py-0.5 rounded border border-[var(--google-green)]/40 bg-[var(--google-green)]/15 text-[var(--google-green)] normal-case">
            <span className="w-2 h-2 rounded-full bg-[var(--google-green)] inline-block animate-pulse" />
            <span>{t("status_live_now", isTamil ? "நேரலை" : "Live")}</span>
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded border border-[var(--google-green)]/30 bg-[var(--google-green)]/10 text-[var(--google-green)] normal-case">
            <Check className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{t("status_completed_check", isTamil ? "முடிக்கப்பட்டது" : "Completed")}</span>
          </span>
        );
      case "RESULTS_PUBLISHED":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded border border-[var(--google-green)]/40 bg-[var(--google-green)]/15 text-[var(--google-green)] normal-case">
            <Check className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{t("status_results_published", isTamil ? "முடிவு வெளியிடப்பட்டது" : "Results Published")}</span>
          </span>
        );
      case "CLOSED":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded border border-border bg-secondary text-muted-foreground normal-case">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{t("status_closed", isTamil ? "முடிவடைந்தது" : "Closed")}</span>
          </span>
        );
      case "UPCOMING":
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded border border-[var(--google-blue)]/30 bg-[var(--google-blue)]/10 text-[var(--google-blue)] normal-case">
            <Clock className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{t("status_upcoming", isTamil ? "வரவிருக்கும் தேர்வு" : "Upcoming")}</span>
          </span>
        );
    }
  };

  return (
    <section className="space-y-4" aria-label="Official Examination Timetable">
      {/* 1. Section Header & Rules Modal Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-base sm:text-lg font-bold text-foreground">
              {t("timetable_heading", isTamil ? "அதிகாரப்பூர்வ அரசு தேர்வு கால அட்டவணை" : "Official Examination Timetable")}
            </h2>
            <button
              type="button"
              onClick={() => setShowRulesDialog(true)}
              className="text-xs text-primary underline underline-offset-4 hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
            >
              {t("timetable_rules_link", isTamil ? "தேர்வு விதிகள் மற்றும் கண்காணிப்பு" : "Exam rules and monitoring")}
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t(
              "timetable_subheading",
              isTamil
                ? "அரசுத் தேர்வுகள் இயக்ககம் — அடுத்தடுத்த தேர்வுகள் வரிசைப்படி பட்டியலிடப்பட்டுள்ளன"
                : "Directorate of Government Examinations — upcoming exams listed in order"
            )}
          </p>
        </div>
      </div>

      {/* 2. Rules & Proctoring Dialog Modal */}
      {showRulesDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
          role="dialog"
          aria-modal="true"
          aria-labelledby="rules-dialog-title"
        >
          <div
            ref={dialogRef}
            className="w-full max-w-lg rounded-md border border-border bg-card p-5 sm:p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-start justify-between gap-3 border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-primary flex-shrink-0" />
                <h3 id="rules-dialog-title" className="text-sm font-bold text-foreground">
                  {t(
                    "timetable_rules_title",
                    isTamil
                      ? "அரசுத் தேர்வு நெறிமுறைகள் மற்றும் கண்காணிப்பு விதிகள்"
                      : "Examination Rules & Integrity Protocol"
                  )}
                </h3>
              </div>
              <button
                ref={closeBtnRef}
                type="button"
                onClick={() => setShowRulesDialog(false)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-muted-foreground leading-relaxed space-y-2">
              <p>
                {noticeText ||
                  t(
                    "timetable_rules_content",
                    isTamil
                      ? "தேர்வர்கள் தங்களது தனிப்பட்ட மொபைல் சாதனங்கள் மூலம் மட்டுமே எவ்வித வெளிப்புற உதவியுமின்றி அனைத்து தேர்வுகளையும் எழுத வேண்டும். தேர்வரின் சாதன ஐபி (IP), உள்நுழைவு/வெளியேறு நேரங்கள், கிளிக் பதிவுகள் மற்றும் சாளர மாற்ற நிகழ்வுகள் தேர்வு கட்டுப்பாட்டு வாரியத்தால் தீவிரமாக கண்காணிக்கப்படுகின்றன. கணினியில் தேர்வு எழுதுவது அல்லது தேர்வு சாளரத்தை விட்டு வெளியேறுவது தேர்வு கட்டுப்பாட்டு அலுவலரின் மறுஆய்வுக்கு அனுப்பப்படும்."
                      : "Candidates must attend all examinations strictly on their personal mobile devices without any outside assistance. All candidate device IPs, credentials login/logout timestamps, click streams, and tab-switching events are actively audited by the COE History Proctor. Desktop attendance or leaving the exam window will be flagged for COE review."
                  )}
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowRulesDialog(false)}
                className="min-h-[44px] px-4 py-2 rounded-md bg-secondary text-foreground hover:bg-secondary/80 border border-border text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {t("btn_close", isTamil ? "மூடுக" : "Close")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Empty & Unresolved States */}
      {emptyReason === "UNRESOLVED_CURRICULUM" ? (
        <div className="p-8 text-center border border-border rounded-md bg-card space-y-2">
          <AlertCircle className="w-8 h-8 text-[var(--google-yellow)] mx-auto mb-2" />
          <p className="text-sm font-medium text-foreground">
            {t(
              "empty_unresolved",
              isTamil
                ? "உங்கள் தேர்வு பட்டியல் கிடைக்கவில்லை. தேர்வு கட்டுப்பாட்டு அலுவலகத்தை தொடர்பு கொள்ளவும்."
                : "Your exam list is not available. Contact the COE office."
            )}
          </p>
        </div>
      ) : sortedExams.length === 0 ? (
        <div className="p-8 text-center border border-border rounded-md bg-card space-y-2">
          <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm font-medium text-muted-foreground">
            {t(
              "empty_no_exams",
              isTamil ? "தேர்வுகள் எதுவும் அட்டவணைப்படுத்தப்படவில்லை" : "No exams scheduled"
            )}
          </p>
        </div>
      ) : (
        <>
          {/* 4. Desktop & Tablet Table (Width >= 768px) */}
          <div className="hidden md:block overflow-x-auto rounded-md border border-border bg-card">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-secondary/95 border-b border-border z-10">
                <tr className="text-muted-foreground font-semibold">
                  <th scope="col" className="py-3 px-4">
                    {t("th_subject_code", isTamil ? "பாடம் & குறியீடு" : "Subject & Code")}
                  </th>
                  <th scope="col" className="py-3 px-4">
                    {t("th_date_time", isTamil ? "தேர்வு நாள் & நேரம்" : "Date & Time")}
                  </th>
                  <th scope="col" className="py-3 px-4">
                    {t("th_readiness", isTamil ? "ஆயத்த நிலை" : "Readiness")}
                  </th>
                  <th scope="col" className="py-3 px-4">
                    {t("th_syllabus_practice", isTamil ? "பாடத்திட்டம் & பயிற்சி" : "Syllabus & Practice")}
                  </th>
                  <th scope="col" className="py-3 px-4">
                    {t("th_result", isTamil ? "தேர்வு முடிவு" : "Result")}
                  </th>
                  <th scope="col" className="py-3 px-4 text-right">
                    {t("th_exam_hall", isTamil ? "அரசுத் தேர்வு கூடம்" : "Exam Hall")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {groupedExams.map((group) => (
                  <React.Fragment key={group.dateStr}>
                    <tr className="bg-secondary/40 border-y border-border">
                      <td colSpan={6} className="py-2 px-4 font-bold text-xs text-foreground">
                        <Calendar className="w-3.5 h-3.5 inline mr-1.5 text-primary" />
                        <span>{group.dateStr}</span>
                      </td>
                    </tr>
                    {group.items.map((exam) => {
                      const lifecycle = getLifecycle(exam, clientNow);
                      const { timeStr } = formatExamDateTime(exam.examDate, isTamil);
                      const startMs = new Date(exam.examDate).getTime();
                      const countdownStr =
                        lifecycle === "UPCOMING"
                          ? formatCountdownText(startMs, clientNow, isTamil)
                          : null;
                      const subjectName = isTamil
                        ? exam.subjectTa || exam.subject
                        : exam.subjectEn || exam.subject;

                      return (
                        <tr key={exam.id} className="hover:bg-secondary/20 transition-colors">
                          {/* Col 1: Subject & Code */}
                          <td className="py-3.5 px-4 align-middle">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-foreground text-sm">
                                {subjectName}
                              </span>
                              <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-secondary text-foreground border border-border">
                                {exam.code}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {isTamil ? `வகுப்பு ${exam.prepClass}` : `Std ${exam.prepClass}`}
                              </span>
                            </div>
                          </td>

                          {/* Col 2: Date & Time */}
                          <td className="py-3.5 px-4 align-middle">
                            <div className="font-medium text-foreground">{timeStr}</div>
                            <div className="text-[11px] text-muted-foreground mt-0.5">
                              {isTamil
                                ? `${exam.durationMinutes} நிமிடங்கள் • ${exam.totalMarks} மதிப்பெண்கள்`
                                : `${exam.durationMinutes} mins • ${exam.totalMarks} Marks`}
                            </div>
                          </td>

                          {/* Col 3: Readiness Status & Countdown */}
                          <td className="py-3.5 px-4 align-middle">
                            {renderStatusBadge(lifecycle)}
                            {countdownStr && (
                              <div className="text-[11px] text-muted-foreground mt-1" aria-live="off">
                                {countdownStr}
                              </div>
                            )}
                          </td>

                          {/* Col 4: Syllabus & Practice Buttons */}
                          <td className="py-3.5 px-4 align-middle">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <Link
                                href={`/student/syllabus?code=${encodeURIComponent(exam.code)}${
                                  isPreview && previewRoll ? `&previewRollNo=${previewRoll}` : ""
                                }`}
                                className="min-h-[44px] px-3 py-1.5 rounded-md border border-border text-foreground hover:bg-secondary inline-flex items-center justify-center gap-1 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                              >
                                <BookOpen className="w-3.5 h-3.5" />
                                <span>{t("btn_syllabus", isTamil ? "பாடத்திட்டம்" : "Syllabus")}</span>
                              </Link>

                              {exam.practiceA?.enabled ? (
                                <Link
                                  href={`/student/practice/${encodeURIComponent(exam.code)}/set-a${
                                    isPreview && previewRoll ? `&previewRollNo=${previewRoll}` : ""
                                  }`}
                                  className="min-h-[44px] px-3 py-1.5 rounded-md border border-border text-foreground hover:bg-secondary inline-flex items-center justify-center gap-1 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                >
                                  {isTamil
                                    ? `பயிற்சி A (${exam.practiceA.count} வினாக்கள்)`
                                    : `Practice A (${exam.practiceA.count} Qs)`}
                                </Link>
                              ) : (
                                <button
                                  type="button"
                                  disabled
                                  className="min-h-[44px] px-3 py-1.5 rounded-md border border-border bg-secondary/80 text-muted-foreground cursor-not-allowed opacity-60 inline-flex items-center justify-center gap-1 text-xs"
                                  title={t(
                                    "practice_coming_soon",
                                    isTamil ? "பயிற்சி வினாக்கள் விரைவில்" : "Practice questions coming soon"
                                  )}
                                >
                                  {isTamil ? "பயிற்சி A" : "Practice A"}
                                </button>
                              )}

                              {exam.practiceB?.enabled ? (
                                <Link
                                  href={`/student/practice/${encodeURIComponent(exam.code)}/set-b${
                                    isPreview && previewRoll ? `&previewRollNo=${previewRoll}` : ""
                                  }`}
                                  className="min-h-[44px] px-3 py-1.5 rounded-md border border-border text-foreground hover:bg-secondary inline-flex items-center justify-center gap-1 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                >
                                  {isTamil
                                    ? `பயிற்சி B (${exam.practiceB.count} வினாக்கள்)`
                                    : `Practice B (${exam.practiceB.count} Qs)`}
                                </Link>
                              ) : (
                                <button
                                  type="button"
                                  disabled
                                  className="min-h-[44px] px-3 py-1.5 rounded-md border border-border bg-secondary/80 text-muted-foreground cursor-not-allowed opacity-60 inline-flex items-center justify-center gap-1 text-xs"
                                  title={t(
                                    "practice_coming_soon",
                                    isTamil ? "பயிற்சி வினாக்கள் விரைவில்" : "Practice questions coming soon"
                                  )}
                                >
                                  {isTamil ? "பயிற்சி B" : "Practice B"}
                                </button>
                              )}
                            </div>
                          </td>

                          {/* Col 5: Result Status */}
                          <td className="py-3.5 px-4 align-middle">
                            {lifecycle === "RESULTS_PUBLISHED" ? (
                              <Link
                                href={`/student/results?examId=${exam.id}${
                                  isPreview && previewRoll ? `&previewRollNo=${previewRoll}` : ""
                                }`}
                                className="min-h-[44px] px-3 py-1.5 rounded-md border border-[var(--google-green)]/40 bg-[var(--google-green)]/10 text-[var(--google-green)] hover:bg-[var(--google-green)]/20 font-semibold inline-flex items-center justify-center gap-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                              >
                                {t("btn_view_result", isTamil ? "முடிவை காண்க" : "View result")}
                              </Link>
                            ) : lifecycle === "COMPLETED" ? (
                              <span className="text-xs text-muted-foreground">
                                {t("result_awaiting", isTamil ? "முடிவுக்காக காத்திருக்கிறது" : "Awaiting results")}
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                {t("result_pending", isTamil ? "நிலுவையில்" : "Pending")}
                              </span>
                            )}
                          </td>

                          {/* Col 6: Exam Hall Button */}
                          <td className="py-3.5 px-4 align-middle text-right">
                            {lifecycle === "LIVE" ? (
                              <Link
                                href={`/student/exam-mock?examId=${exam.id}${
                                  isPreview && previewRoll ? `&previewRollNo=${previewRoll}` : ""
                                }`}
                                className="min-h-[44px] px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary-hover font-semibold inline-flex items-center justify-center gap-1.5 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                              >
                                <span>{t("btn_start_exam", isTamil ? "தேர்வைத் தொடங்கு" : "Start exam")}</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </Link>
                            ) : (
                              <button
                                type="button"
                                disabled
                                className="min-h-[44px] px-3 py-2 rounded-md bg-secondary text-muted-foreground border border-border opacity-70 cursor-not-allowed inline-flex items-center justify-center gap-1 text-xs"
                              >
                                <span>
                                  {exam.isSubmitted
                                    ? t("exam_completed", isTamil ? "முடிக்கப்பட்டது" : "Completed")
                                    : lifecycle === "CLOSED"
                                    ? t("exam_closed", isTamil ? "முடிவடைந்தது" : "Closed")
                                    : isTamil
                                    ? `${timeStr} மணிக்கு தொடங்கும்`
                                    : `Starts at ${timeStr}`}
                                </span>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* 5. Mobile Responsive Stacked Cards (Width < 768px) */}
          <div className="md:hidden space-y-4">
            {groupedExams.map((group) => (
              <div key={group.dateStr} className="space-y-3">
                <div className="p-2 rounded-md bg-secondary/50 border border-border text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  <span>{group.dateStr}</span>
                </div>

                {group.items.map((exam) => {
                  const lifecycle = getLifecycle(exam, clientNow);
                  const { timeStr } = formatExamDateTime(exam.examDate, isTamil);
                  const startMs = new Date(exam.examDate).getTime();
                  const countdownStr =
                    lifecycle === "UPCOMING"
                      ? formatCountdownText(startMs, clientNow, isTamil)
                      : null;
                  const subjectName = isTamil
                    ? exam.subjectTa || exam.subject
                    : exam.subjectEn || exam.subject;

                  return (
                    <div
                      key={exam.id}
                      className="p-4 rounded-md border border-border bg-card space-y-3 shadow-sm"
                    >
                      {/* Top Row: Subject + Code + Std Badge */}
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-sm text-foreground break-words">
                              {subjectName}
                            </span>
                            <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-secondary text-foreground border border-border">
                              {exam.code}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {isTamil ? `வகுப்பு ${exam.prepClass}` : `Std ${exam.prepClass}`} •{" "}
                            {timeStr}
                          </p>
                        </div>
                        {renderStatusBadge(lifecycle)}
                      </div>

                      {/* Duration & Marks */}
                      <div className="text-xs text-muted-foreground">
                        {isTamil
                          ? `${exam.durationMinutes} நிமிடங்கள் • ${exam.totalMarks} மதிப்பெண்கள்`
                          : `${exam.durationMinutes} mins • ${exam.totalMarks} Marks`}
                      </div>

                      {/* Countdown if upcoming */}
                      {countdownStr && (
                        <div className="text-xs text-muted-foreground" aria-live="off">
                          {countdownStr}
                        </div>
                      )}

                      {/* Syllabus & Practice Buttons (Full Width Stack) */}
                      <div className="space-y-2 pt-1 border-t border-border">
                        <Link
                          href={`/student/syllabus?code=${encodeURIComponent(exam.code)}${
                            isPreview && previewRoll ? `&previewRollNo=${previewRoll}` : ""
                          }`}
                          className="w-full min-h-[44px] px-3 py-2 rounded-md border border-border text-foreground hover:bg-secondary flex items-center justify-center gap-1.5 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>{t("btn_syllabus", isTamil ? "பாடத்திட்டம்" : "Syllabus")}</span>
                        </Link>

                        {exam.practiceA?.enabled ? (
                          <Link
                            href={`/student/practice/${encodeURIComponent(exam.code)}/set-a${
                              isPreview && previewRoll ? `&previewRollNo=${previewRoll}` : ""
                            }`}
                            className="w-full min-h-[44px] px-3 py-2 rounded-md border border-border text-foreground hover:bg-secondary flex items-center justify-center gap-1.5 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          >
                            {isTamil
                              ? `பயிற்சி A (${exam.practiceA.count} வினாக்கள்)`
                              : `Practice A (${exam.practiceA.count} Qs)`}
                          </Link>
                        ) : (
                          <button
                            type="button"
                            disabled
                            className="w-full min-h-[44px] px-3 py-2 rounded-md border border-border bg-secondary/80 text-muted-foreground cursor-not-allowed opacity-60 flex items-center justify-center gap-1 text-xs"
                            title={t(
                              "practice_coming_soon",
                              isTamil ? "பயிற்சி வினாக்கள் விரைவில்" : "Practice questions coming soon"
                            )}
                          >
                            {isTamil ? "பயிற்சி A" : "Practice A"}
                          </button>
                        )}

                        {exam.practiceB?.enabled ? (
                          <Link
                            href={`/student/practice/${encodeURIComponent(exam.code)}/set-b${
                              isPreview && previewRoll ? `&previewRollNo=${previewRoll}` : ""
                            }`}
                            className="w-full min-h-[44px] px-3 py-2 rounded-md border border-border text-foreground hover:bg-secondary flex items-center justify-center gap-1.5 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          >
                            {isTamil
                              ? `பயிற்சி B (${exam.practiceB.count} வினாக்கள்)`
                              : `Practice B (${exam.practiceB.count} Qs)`}
                          </Link>
                        ) : (
                          <button
                            type="button"
                            disabled
                            className="w-full min-h-[44px] px-3 py-2 rounded-md border border-border bg-secondary/80 text-muted-foreground cursor-not-allowed opacity-60 flex items-center justify-center gap-1 text-xs"
                            title={t(
                              "practice_coming_soon",
                              isTamil ? "பயிற்சி வினாக்கள் விரைவில்" : "Practice questions coming soon"
                            )}
                          >
                            {isTamil ? "பயிற்சி B" : "Practice B"}
                          </button>
                        )}
                      </div>

                      {/* Result State on Mobile */}
                      <div className="pt-1">
                        {lifecycle === "RESULTS_PUBLISHED" ? (
                          <Link
                            href={`/student/results?examId=${exam.id}${
                              isPreview && previewRoll ? `&previewRollNo=${previewRoll}` : ""
                            }`}
                            className="w-full min-h-[44px] px-3 py-2 rounded-md border border-[var(--google-green)]/40 bg-[var(--google-green)]/10 text-[var(--google-green)] hover:bg-[var(--google-green)]/20 font-semibold flex items-center justify-center gap-1 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          >
                            {t("btn_view_result", isTamil ? "முடிவை காண்க" : "View result")}
                          </Link>
                        ) : lifecycle === "COMPLETED" ? (
                          <div className="text-center text-xs text-muted-foreground p-2 rounded bg-secondary/50 border border-border">
                            {t("result_awaiting", isTamil ? "முடிவுக்காக காத்திருக்கிறது" : "Awaiting results")}
                          </div>
                        ) : (
                          <div className="text-center text-xs text-muted-foreground p-2 rounded bg-secondary/50 border border-border">
                            {t("result_pending", isTamil ? "நிலுவையில்" : "Pending")}
                          </div>
                        )}
                      </div>

                      {/* Exam Hall Action Button */}
                      <div className="pt-1">
                        {lifecycle === "LIVE" ? (
                          <Link
                            href={`/student/exam-mock?examId=${exam.id}${
                              isPreview && previewRoll ? `&previewRollNo=${previewRoll}` : ""
                            }`}
                            className="w-full min-h-[44px] px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary-hover font-semibold flex items-center justify-center gap-1.5 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          >
                            <span>{t("btn_start_exam", isTamil ? "தேர்வைத் தொடங்கு" : "Start exam")}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        ) : (
                          <button
                            type="button"
                            disabled
                            className="w-full min-h-[44px] px-3 py-2 rounded-md bg-secondary text-muted-foreground border border-border opacity-70 cursor-not-allowed flex items-center justify-center gap-1 text-xs"
                          >
                            <span>
                              {exam.isSubmitted
                                ? t("exam_completed", isTamil ? "முடிக்கப்பட்டது" : "Completed")
                                : lifecycle === "CLOSED"
                                ? t("exam_closed", isTamil ? "முடிவடைந்தது" : "Closed")
                                : isTamil
                                ? `${timeStr} மணிக்கு தொடங்கும்`
                                : `Starts at ${timeStr}`}
                            </span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

