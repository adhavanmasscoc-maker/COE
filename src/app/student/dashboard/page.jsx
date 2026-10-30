"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/Card";
import {
  GraduationCap,
  BookOpen,
  Calendar,
  Clock,
  AlertCircle,
  PlayCircle,
  FileText,
  CheckCircle,
  ChevronRight,
  TrendingUp,
  Loader2,
  Eye,
  Award,
  Bell,
  Zap,
  Users,
  BarChart3,
  Lock,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

function SubjectCard({ sub, isPreview, previewRoll }) {
  const { isTamil } = useLanguage();
  const pct = sub.progressPercent || 0;
  const hue = pct >= 80 ? "#6ee7b7" : pct >= 50 ? "#818cf8" : "#f59e0b";

  return (
    <div className="glass rounded-xl p-5 card-glow border border-[rgba(124,58,237,0.2)] flex flex-col gap-3 animate-float-up">
      <div className="flex items-start justify-between">
        <span className="text-[10px] font-bold font-mono text-[#5c5c8a] bg-[rgba(124,58,237,0.1)] px-2 py-0.5 rounded-md border border-[rgba(124,58,237,0.2)]">
          {sub.code}
        </span>
        <span className="text-xs font-bold" style={{ color: hue }}>{pct}%</span>
      </div>

      <div>
        <h3 className="font-bold text-[#f0f0ff] text-sm mb-0.5">{sub.name}</h3>
        <p className="text-[11px] text-[#5c5c8a]">
          {isTamil ? `${sub.totalChapters} பாட அலகுகளில் ${sub.completedChapters} முடிக்கப்பட்டது` : `${sub.completedChapters}/${sub.totalChapters} chapters completed`}
        </p>
      </div>

      {/* Progress bar */}
      <div className="progress-bar-track">
        <div
          className="progress-bar-fill"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, #7c3aed, ${hue})` }}
        />
      </div>

      <div className="flex items-center justify-between pt-1 border-t border-[rgba(124,58,237,0.1)] text-xs">
        <Link
          href="/student/papers"
          className="flex items-center gap-1 text-[#5c5c8a] hover:text-violet-300 transition-colors"
        >
          <FileText className="w-3.5 h-3.5" />
          {sub.publishedPapersCount} {isTamil ? "வினாத்தாள்கள்" : "Papers"}
        </Link>
        <Link
          href={`/student/syllabus?code=${encodeURIComponent(sub.code)}`}
          className="flex items-center gap-1 text-violet-400 hover:text-violet-300 font-semibold transition-colors"
        >
          {isTamil ? "பாடக்குறிப்புகள்" : "Study"} <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

function StudentDashboardContent() {
  const searchParams = useSearchParams();
  const { isTamil, t } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [previewRoll, setPreviewRoll] = useState(searchParams.get("previewRollNo") || null);

  const fetchDashboardData = async (rollNo) => {
    setLoading(true);
    setError("");
    try {
      const url = rollNo
        ? `/api/student/dashboard?previewRollNo=${rollNo}`
        : `/api/student/dashboard`;
      const res = await fetch(url);
      const json = await res.json();
      if (!res.ok) setError(json.error || "Failed to load dashboard.");
      else setData(json);
    } catch {
      setError("Network error fetching student data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(previewRoll);
  }, [previewRoll]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="relative">
          <div className="w-14 h-14 rounded-2xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center">
            <Loader2 className="w-7 h-7 animate-spin text-violet-400" />
          </div>
          <div className="absolute -inset-3 rounded-3xl border border-violet-500/10 animate-pulse" />
        </div>
        <p className="text-sm text-[#5c5c8a]">Loading academic records…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="glass rounded-2xl p-8 text-center max-w-sm border border-rose-500/25">
          <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-[#f0f0ff] mb-2">Unable to Load Dashboard</h2>
          <p className="text-xs text-[#5c5c8a] mb-5">{error}</p>
          <Link href="/"><Button variant="secondary" size="sm">Return to Login</Button></Link>
        </div>
      </div>
    );
  }

  const { profile, subjects, upcomingExams, notices, isPreview } = data;
  const overallPct = profile.overallCompletion || 0;

  return (
    <div className="page-content space-y-6">

      {/* COE Preview Banner */}
      {isPreview && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 animate-float-up">
          <div className="flex items-center gap-2 text-xs text-amber-300">
            <Eye className="w-4 h-4 flex-shrink-0" />
            <span><strong>COE Preview Mode</strong> — Viewing live student interface from database</span>
          </div>
          <div className="flex items-center gap-1 p-1 glass-sm rounded-xl border border-amber-500/20">
            {[
              { roll: "TN2026-0901", label: "Student A (Cl. 10)" },
              { roll: "TN2026-1102", label: "Student B (Cl. 12)" },
            ].map(({ roll, label }) => (
              <button
                key={roll}
                onClick={() => setPreviewRoll(roll)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  previewRoll === roll
                    ? "bg-amber-500/30 text-amber-200 border border-amber-400/40"
                    : "text-[#5c5c8a] hover:text-[#a8a8d0]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Header row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-float-up">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-[#0d0d1a] flex items-center justify-center">
              <CheckCircle className="w-2.5 h-2.5 text-[#0d0d1a]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black text-[#f0f0ff]">{profile.fullName}</h1>
              <span className={`badge ${profile.medium === "Tamil" ? "badge-amber" : "badge-cyan"}`}>
                {profile.medium === "Tamil" ? "தமிழ் வழி" : "English Medium"}
              </span>
            </div>
            <p className="text-xs text-[#5c5c8a] font-mono mt-0.5">
              {profile.rollNo} · {profile.board}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/student/history${isPreview ? `?previewRollNo=${previewRoll}` : ""}`}>
            <Button variant="outline" size="sm" className="gap-1.5 font-semibold text-xs border-violet-500/30 text-violet-300 hover:bg-violet-500/10">
              <Calendar className="w-4 h-4 text-violet-400" />{isTamil ? "தேர்வு வரலாறு" : "Exam History"}
            </Button>
          </Link>
          <Link href={`/student/results${isPreview ? `?previewRollNo=${previewRoll}` : ""}`}>
            <Button variant="secondary" size="sm" className="gap-1.5 font-semibold text-xs">
              <Award className="w-4 h-4" />{t("btn_view_result", "View Marksheet")}
            </Button>
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <StatCard label={isTamil ? "பயிலும் வகுப்பு" : "Current Class"} value={`${isTamil ? "வகுப்பு" : "Class"} ${profile.currentClass}`} icon={Users} color="violet"
          trend={isTamil ? "பள்ளி சேர்க்கை வகுப்பு" : "School enrollment grade"} />
        <StatCard label={isTamil ? "தேர்வு ஆயத்த நிலை" : "Prep Standard"} value={`${isTamil ? "வகுப்பு" : "Class"} ${profile.examPrepClass}`} icon={TrendingUp} color="cyan"
          trend={isTamil ? "அரசுப் பாடத்திட்ட நிலை" : "COE configured syllabus level"} />
        <StatCard label={isTamil ? "பாட முன்னேற்றம்" : "Overall Progress"} value={`${overallPct}%`} icon={BarChart3} color="emerald"
          trend={isTamil ? "முடிக்கப்பட்ட பாட அலகுகள்" : "Syllabus chapters mastered"} />
        <StatCard label={isTamil ? "அட்டவணை தேர்வுகள்" : "Upcoming Exams"} value={upcomingExams.length} icon={Calendar} color="amber"
          trend={isTamil ? "அரசுத் தேர்வு மையம்" : "Published by COE"} />
      </div>

      {/* COE Notice */}
      {notices?.length > 0 && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/8 border border-amber-500/25 animate-float-up">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center flex-shrink-0">
            <Bell className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-amber-300 uppercase tracking-wide mb-0.5">
              {isTamil ? "அரசு தேர்வு வாரிய அறிவிப்பு" : "COE Notice"}
            </p>
            <p className="text-xs text-[#a8a8d0] leading-relaxed">{notices[0].content}</p>
          </div>
        </div>
      )}

      {/* Subjects section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-[#f0f0ff]">
              {isTamil ? `முதன்மை பாடங்கள் — வகுப்பு ${profile.examPrepClass}` : `Core Subjects — Class ${profile.examPrepClass}`}
            </h2>
            <p className="text-xs text-[#5c5c8a] mt-0.5">{isTamil ? "அரசு தேர்வு வாரியத்தால் ஒதுக்கப்பட்ட பாடங்கள்" : "Assigned official curriculum subjects"}</p>
          </div>
          <span className="badge badge-muted">{subjects.length} {isTamil ? "பாடங்கள்" : "Subjects"}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {subjects.map((sub, i) => (
            <div key={sub.id} style={{ animationDelay: `${i * 60}ms` }}>
              <SubjectCard sub={sub} isPreview={isPreview} previewRoll={previewRoll} />
            </div>
          ))}

          {/* Quick Exam Launch Card */}
          <div className="relative glass rounded-xl p-5 border border-emerald-500/25 flex flex-col gap-3 overflow-hidden">
            <div className="orb w-32 h-32 bg-emerald-500/20 -top-8 -right-8" />
            <div className="relative">
              <span className="badge badge-emerald mb-2 inline-flex">{isTamil ? "தேர்வு கூடம்" : "Examination Hall"}</span>
              <h3 className="text-base font-bold text-[#f0f0ff] mb-1">
                {isTamil ? "தேர்வைத் தொடங்குக" : "Start an Exam"}
              </h3>
              <p className="text-xs text-[#5c5c8a] leading-relaxed">
                {isTamil ? "கவனச்சிதறலற்ற பாதுகாப்பான தேர்வு முறை, வினாத் தொகுப்பு பலகை மற்றும் தானியங்கி சேமிப்பு." : "Distraction-free environment with timer, question palette, and auto-save drafts."}
              </p>
            </div>
            <Link
              href={`/student/exam-mock${upcomingExams.length > 0 ? `?examId=${upcomingExams[0].id}` : ""}${
                isPreview ? `${upcomingExams.length > 0 ? "&" : "?"}previewRollNo=${previewRoll}` : ""
              }`}
              className="mt-auto"
            >
              <Button variant="success" className="w-full justify-center gap-2">
                <PlayCircle className="w-4 h-4" />{isTamil ? "தேர்வைத் தொடங்குக" : "Start Examination"}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Exam Timetable (Row & Column Table Format with Upcoming Exam Priority) */}
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-bold text-[#f0f0ff]">
              {isTamil ? "அதிகாரப்பூர்வ அரசு தேர்வு கால அட்டவணை" : "Official Examination Timetable & Practice Hub"}
            </h2>
            <p className="text-xs text-[#5c5c8a] mt-0.5">
              {isTamil
                ? "அரசுத் தேர்வுகள் இயக்ககம் — அடுத்தடுத்த தேர்வுகள் வரிசைப்படி பட்டியலிடப்பட்டுள்ளன"
                : "Organized by earliest upcoming exam date. Attend official exams when scheduled or practice 50 Qs sets anytime."}
            </p>
          </div>
          <span className="badge badge-emerald flex items-center gap-1 font-mono text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            {isTamil ? "அங்கீகரிக்கப்பட்டது" : "COE Verified"}
          </span>
        </div>

        {upcomingExams.length === 0 ? (
          <div className="glass rounded-xl p-8 text-center border border-[rgba(124,58,237,0.15)]">
            <Calendar className="w-8 h-8 text-[#5c5c8a] mx-auto mb-2" />
            <p className="text-sm text-[#5c5c8a]">
              {isTamil
                ? `வகுப்பு ${profile.examPrepClass}-க்கு இன்னும் தேர்வுகள் வெளியிடப்படவில்லை.`
                : `No exams published yet for Class ${profile.examPrepClass}. Drafts are being prepared by the COE.`}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop / Tablet Table View (hidden on small mobile) */}
            <div className="hidden md:block overflow-x-auto rounded-2xl border border-[rgba(124,58,237,0.2)] bg-card/60 backdrop-blur-md shadow-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border bg-secondary/50 text-[#a8a8d0] font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4">{isTamil ? "பாடம் & குறியீடு" : "Subject & Code"}</th>
                    <th className="py-3.5 px-4">{isTamil ? "தேர்வு நாள் & நேரம்" : "Date & Scheduled Time"}</th>
                    <th className="py-3.5 px-4">{isTamil ? "ஆயத்த நிலை" : "Days Left"}</th>
                    <th className="py-3.5 px-4">{isTamil ? "பாடத்திட்டம் & 50 வினாக்கள் பயிற்சி" : "Study & Practice 50 Qs Bank"}</th>
                    <th className="py-3.5 px-4">{isTamil ? "தேர்வு முடிவு" : "Result"}</th>
                    <th className="py-3.5 px-4 text-right">{isTamil ? "அரசுத் தேர்வு கூடம்" : "Official Exam Hall"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {upcomingExams.map((exam) => {
                    const examTime = new Date(exam.examDate).getTime();
                    const nowTime = Date.now();
                    const isUnlocked = nowTime >= examTime;
                    const diffMs = examTime - nowTime;
                    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
                    const isTodayOrTomorrow = diffMs > 0 && diffMs <= (36 * 3600 * 1000);

                    return (
                      <tr
                        key={exam.id}
                        className={`hover:bg-secondary/30 transition-colors ${
                          exam.isSubmitted
                            ? "bg-emerald-950/5 opacity-85"
                            : isUnlocked
                            ? "bg-emerald-500/5"
                            : ""
                        }`}
                      >
                        {/* 1. Subject & Code */}
                        <td className="py-4 px-4 align-middle">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-[#f0f0ff]">{exam.subject}</span>
                            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-violet-500/15 border border-violet-500/30 text-violet-300">
                              {exam.code}
                            </span>
                            <span className="badge badge-purple text-[10px] py-0">
                              Cl. {exam.prepClass}
                            </span>
                          </div>
                          <span className="text-[11px] text-[#5c5c8a] block mt-0.5">
                            {exam.durationMinutes} {isTamil ? "நிமிடங்கள்" : "mins"} • {exam.totalMarks} {isTamil ? "மதிப்பெண்கள்" : "Marks"}
                          </span>
                        </td>

                        {/* 2. Date & Time */}
                        <td className="py-4 px-4 align-middle">
                          <div className="font-mono text-xs font-semibold text-foreground flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
                            <span>
                              {new Date(exam.examDate).toLocaleDateString(isTamil ? "ta-IN" : "en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                          <span className="text-[11px] text-muted-foreground font-mono flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-amber-400 flex-shrink-0" />
                            {new Date(exam.examDate).toLocaleTimeString("en-IN", {
                              hour: "numeric",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </span>
                        </td>

                        {/* 3. Days Left / Schedule Status */}
                        <td className="py-4 px-4 align-middle">
                          {exam.isSubmitted ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                              <CheckCircle className="w-3 h-3 text-emerald-400" />
                              {isTamil ? "முடிந்தது" : "Submitted"}
                            </span>
                          ) : isUnlocked ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400 animate-pulse">
                              <Sparkles className="w-3 h-3 text-emerald-400" />
                              {isTamil ? "தேர்வு நேரம் வந்துவிட்டது" : "Exam Active"}
                            </span>
                          ) : isTodayOrTomorrow ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400">
                              <Clock className="w-3 h-3 text-amber-400" />
                              {isTamil ? "நாளை / இன்று" : "Tomorrow / Today"}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/30">
                              <Calendar className="w-3 h-3 text-violet-400" />
                              {isTamil ? `${diffDays} நாட்களில்` : `In ${diffDays} days`}
                            </span>
                          )}
                        </td>

                        {/* 4. Syllabus & Practice 50 Qs Buttons */}
                        <td className="py-4 px-4 align-middle">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Link
                              href={`/student/syllabus?code=${encodeURIComponent(exam.code)}`}
                              className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-lg border border-violet-500/30 text-violet-300 hover:bg-violet-500/15 transition-all"
                            >
                              <BookOpen className="w-3 h-3 text-violet-400" />
                              {isTamil ? "பாடத்திட்டம்" : "Syllabus"}
                            </Link>

                            <Link
                              href={`/student/practice/${encodeURIComponent(exam.code)}/set-a${
                                isPreview ? `?previewRollNo=${previewRoll}` : ""
                              }`}
                              className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-lg border border-amber-500/30 text-amber-300 hover:bg-amber-500/15 transition-all"
                              title="Practice first 50 questions (Part 1 & 2)"
                            >
                              <Zap className="w-3 h-3 text-amber-400" />
                              {isTamil ? "பயிற்சி A (50 வினாக்கள்)" : "Practice Set A (Part 1 & 2 — 50 Qs)"}
                            </Link>

                            {/* Set B for Chemistry & large question banks */}
                            {exam.code === "CHE-12" && (
                              <Link
                                href={`/student/practice/${encodeURIComponent(exam.code)}/set-b${
                                  isPreview ? `?previewRollNo=${previewRoll}` : ""
                                }`}
                                className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-lg border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/15 transition-all"
                                title="Practice remaining 50 questions (Part 3 & 4)"
                              >
                                <Zap className="w-3 h-3 text-cyan-400" />
                                {isTamil ? "பயிற்சி B (50 வினாக்கள்)" : "Practice Set B (Part 3 & 4 — 50 Qs)"}
                              </Link>
                            )}
                          </div>
                        </td>

                        {/* 5. Official Result Column */}
                        <td className="py-4 px-4 align-middle">
                          {exam.isSubmitted ? (
                            exam.isResultPublished ? (
                              <Link
                                href={`/student/results?examId=${exam.id}${
                                  isPreview ? `&previewRollNo=${previewRoll}` : ""
                                }`}
                              >
                                <Button
                                  variant="primary"
                                  size="sm"
                                  className="text-[11px] font-bold gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-500/20 py-1.5 px-3"
                                >
                                  <Award className="w-3.5 h-3.5 text-emerald-200" />
                                  {isTamil ? "மதிப்பெண் & விடைத்தாள்" : "View Result & Paper"}
                                </Button>
                              </Link>
                            ) : (
                              <div className="inline-flex flex-col">
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                  <Clock className="w-3 h-3 text-amber-400" />
                                  {exam.remainingSeconds && exam.remainingSeconds > 0
                                    ? isTamil
                                      ? `முடிவு இன்னும் ${Math.ceil(exam.remainingSeconds / 60)} நிமிடங்களில்`
                                      : `Result in ~${Math.ceil(exam.remainingSeconds / 60)} mins`
                                    : isTamil
                                    ? "மதிப்பீட்டில் உள்ளது"
                                    : "Under Evaluation"}
                                </span>
                                {exam.expectedPublishAt && (
                                  <span className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                                    {new Date(exam.expectedPublishAt).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true })}
                                  </span>
                                )}
                              </div>
                            )
                          ) : (
                            <span className="text-[11px] text-muted-foreground font-mono">
                              {isTamil ? "தேர்வு நிலுவையில்" : "Awaiting Exam"}
                            </span>
                          )}
                        </td>

                        {/* 6. Official Exam Hall Action */}
                        <td className="py-4 px-4 align-middle text-right">
                          {exam.isSubmitted ? (
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                href={`/student/history${isPreview ? `?previewRollNo=${previewRoll}` : ""}`}
                              >
                                <Button variant="secondary" size="sm" className="text-xs">
                                  {isTamil ? "விடைக்குறிப்பு" : "View Submission"}
                                </Button>
                              </Link>
                              <Link
                                href={`/student/practice/${encodeURIComponent(exam.code)}/set-a${
                                  isPreview ? `?previewRollNo=${previewRoll}` : ""
                                }`}
                              >
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-xs border-violet-500/30 text-violet-300"
                                >
                                  {isTamil ? "மீண்டும் பயிற்சி" : "Practice"}
                                </Button>
                              </Link>
                            </div>
                          ) : isUnlocked ? (
                            <Link
                              href={`/student/exam-mock?examId=${exam.id}${
                                isPreview ? `&previewRollNo=${previewRoll}` : ""
                              }`}
                            >
                              <Button
                                variant="success"
                                size="sm"
                                className="font-bold gap-1.5 shadow-md shadow-emerald-500/20 py-2"
                              >
                                <PlayCircle className="w-4 h-4" />
                                {isTamil ? "தேர்வைத் தொடங்குக" : "Start Exam Now"}
                              </Button>
                            </Link>
                          ) : (
                            <div className="inline-flex flex-col items-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled
                                className="gap-1.5 text-xs opacity-60 cursor-not-allowed bg-secondary/40 border border-border text-muted-foreground"
                              >
                                <Lock className="w-3.5 h-3.5" />
                                {isTamil ? "நேரம் வந்தபின் திறக்கும்" : "Locked Until Date"}
                              </Button>
                              <span className="text-[10px] text-muted-foreground mt-0.5">
                                {isTamil
                                  ? "குறிப்பிட்ட நேரத்திற்குப் பிறகே எழுத முடியும்"
                                  : "Opens after scheduled start time"}
                              </span>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Responsive Stacked Cards (visible only on small screens < md) */}
            <div className="md:hidden space-y-4">
              {upcomingExams.map((exam) => {
                const examTime = new Date(exam.examDate).getTime();
                const nowTime = Date.now();
                const isUnlocked = nowTime >= examTime;
                const diffMs = examTime - nowTime;
                const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
                const isTodayOrTomorrow = diffMs > 0 && diffMs <= (36 * 3600 * 1000);

                return (
                  <div
                    key={exam.id}
                    className={`glass rounded-xl p-4 border space-y-3 ${
                      exam.isSubmitted
                        ? "border-emerald-500/30 bg-emerald-950/10"
                        : isUnlocked
                        ? "border-emerald-500/40 bg-emerald-500/5"
                        : "border-[rgba(124,58,237,0.2)]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-foreground">{exam.subject}</span>
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-violet-500/15 text-violet-300 border border-violet-500/25">
                            {exam.code}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {exam.durationMinutes} mins • {exam.totalMarks} Marks
                        </p>
                      </div>

                      {exam.isSubmitted ? (
                        <span className="badge badge-emerald text-[10px]">Submitted</span>
                      ) : isUnlocked ? (
                        <span className="badge badge-emerald text-[10px] animate-pulse">Live Now</span>
                      ) : isTodayOrTomorrow ? (
                        <span className="badge badge-amber text-[10px]">Tomorrow / Today</span>
                      ) : (
                        <span className="badge badge-violet text-[10px]">{diffDays} days left</span>
                      )}
                    </div>

                    <div className="p-2.5 rounded-lg bg-secondary/40 border border-border text-xs flex items-center justify-between font-mono">
                      <span className="flex items-center gap-1.5 text-foreground">
                        <Calendar className="w-3.5 h-3.5 text-violet-400" />
                        {new Date(exam.examDate).toLocaleDateString(isTamil ? "ta-IN" : "en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-3 h-3 text-amber-400" />
                        {new Date(exam.examDate).toLocaleTimeString("en-IN", {
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </span>
                    </div>

                    {/* Mobile Practice Buttons (Touch targets >= 44px) */}
                    <div className="flex flex-col gap-2 pt-1">
                      <div className="flex gap-2">
                        <Link
                          href={`/student/syllabus?code=${encodeURIComponent(exam.code)}`}
                          className="flex-1 min-h-[44px] flex items-center justify-center gap-1 text-xs font-bold rounded-lg border border-violet-500/30 text-violet-300 bg-violet-500/5 hover:bg-violet-500/15"
                        >
                          <BookOpen className="w-3.5 h-3.5" /> {isTamil ? "பாடத்திட்டம்" : "Syllabus"}
                        </Link>
                        <Link
                          href={`/student/practice/${encodeURIComponent(exam.code)}/set-a${
                            isPreview ? `?previewRollNo=${previewRoll}` : ""
                          }`}
                          className="flex-1 min-h-[44px] flex items-center justify-center gap-1 text-xs font-bold rounded-lg border border-amber-500/30 text-amber-300 bg-amber-500/5 hover:bg-amber-500/15"
                        >
                          <Zap className="w-3.5 h-3.5 text-amber-400" /> {isTamil ? "பயிற்சி A (50)" : "Practice Set A"}
                        </Link>
                      </div>

                      {exam.code === "CHE-12" && (
                        <Link
                          href={`/student/practice/${encodeURIComponent(exam.code)}/set-b${
                            isPreview ? `?previewRollNo=${previewRoll}` : ""
                          }`}
                          className="w-full min-h-[44px] flex items-center justify-center gap-1 text-xs font-bold rounded-lg border border-cyan-500/30 text-cyan-300 bg-cyan-500/5 hover:bg-cyan-500/15"
                        >
                          <Zap className="w-3.5 h-3.5 text-cyan-400" /> {isTamil ? "பயிற்சி B (50 வினாக்கள்)" : "Practice Set B (50 Qs)"}
                        </Link>
                      )}

                      {/* Official Result Banner / Link for Mobile */}
                      {exam.isSubmitted && (
                        exam.isResultPublished ? (
                          <Link
                            href={`/student/results?examId=${exam.id}${
                              isPreview ? `&previewRollNo=${previewRoll}` : ""
                            }`}
                            className="w-full min-h-[44px] flex items-center justify-center gap-2 text-xs font-bold rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20"
                          >
                            <Award className="w-4 h-4 text-emerald-200" />
                            {isTamil ? "உத்தியோகபூர்வ தேர்வு முடிவு & விடைத்தாள்" : "View Evaluated Result & Paper"}
                          </Link>
                        ) : (
                          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
                            <span className="flex items-center gap-1.5 font-bold">
                              <Clock className="w-3.5 h-3.5 text-amber-400" />
                              {exam.remainingSeconds && exam.remainingSeconds > 0
                                ? isTamil
                                  ? `முடிவு இன்னும் ${Math.ceil(exam.remainingSeconds / 60)} நிமிடங்களில்`
                                  : `Result in ~${Math.ceil(exam.remainingSeconds / 60)} mins`
                                : isTamil
                                ? "மதிப்பீட்டில் உள்ளது"
                                : "Result Under Evaluation"}
                            </span>
                            {exam.expectedPublishAt && (
                              <span className="font-mono text-[10px]">
                                {new Date(exam.expectedPublishAt).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true })}
                              </span>
                            )}
                          </div>
                        )
                      )}

                      {/* Official Exam Hall Button */}
                      {exam.isSubmitted ? (
                        <Link
                          href={`/student/history${isPreview ? `?previewRollNo=${previewRoll}` : ""}`}
                          className="w-full min-h-[44px] flex items-center justify-center text-xs font-bold rounded-lg border border-emerald-500/30 text-emerald-300 bg-emerald-500/10"
                        >
                          {isTamil ? "தேர்வு சமர்ப்பிப்பு அறிக்கை" : "View Official Submission"}
                        </Link>
                      ) : isUnlocked ? (
                        <Link
                          href={`/student/exam-mock?examId=${exam.id}${
                            isPreview ? `&previewRollNo=${previewRoll}` : ""
                          }`}
                          className="w-full min-h-[44px] flex items-center justify-center gap-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                        >
                          <PlayCircle className="w-4 h-4" /> {isTamil ? "தேர்வைத் தொடங்குக" : "Start Exam Now"}
                        </Link>
                      ) : (
                        <button
                          disabled
                          className="w-full min-h-[44px] flex items-center justify-center gap-1.5 text-xs font-medium rounded-lg bg-secondary/50 text-muted-foreground border border-border cursor-not-allowed"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          {isTamil ? "நேரம் வந்தபின் திறக்கும்" : "Locked Until Scheduled Time"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function StudentDashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-violet-400" />
      </div>
    }>
      <StudentDashboardContent />
    </Suspense>
  );
}
