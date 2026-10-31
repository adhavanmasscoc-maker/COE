"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/Card";
import { ExamTimetableSection } from "@/components/student/ExamTimetableSection";
import {
  GraduationCap,
  Calendar,
  AlertCircle,
  PlayCircle,
  FileText,
  CheckCircle,
  ChevronRight,
  TrendingUp,
  Loader2,
  Eye,
  Award,
  Users,
  BarChart3,
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
          href={`/student/papers${isPreview ? `?previewRollNo=${encodeURIComponent(previewRoll)}` : ""}`}
          className="flex items-center gap-1 text-[#5c5c8a] hover:text-violet-300 transition-colors"
        >
          <FileText className="w-3.5 h-3.5" />
          {sub.publishedPapersCount} {isTamil ? "வினாத்தாள்கள்" : "Papers"}
        </Link>
        <Link
          href={`/student/syllabus?code=${encodeURIComponent(sub.code)}${isPreview ? `&previewRollNo=${encodeURIComponent(previewRoll)}` : ""}`}
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
  const { isTamil, setLanguage, t } = useLanguage();
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

  useEffect(() => {
    if (data?.profile?.medium === "Tamil" || data?.profile?.user?.language === "ta") {
      if (!isTamil && setLanguage) {
        setLanguage("ta");
      }
    }
  }, [data, isTamil, setLanguage]);

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
  const overallPct = profile?.overallCompletion || 0;

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
              <h1 className="text-xl font-black text-[#f0f0ff]">{profile?.fullName || "Candidate"}</h1>
              <span className={`badge ${profile?.medium === "Tamil" ? "badge-amber" : "badge-cyan"}`}>
                {profile?.medium === "Tamil" ? "தமிழ் வழி" : "English Medium"}
              </span>
            </div>
            <p className="text-xs text-[#5c5c8a] font-mono mt-0.5">
              {profile?.rollNo || ""} · {profile?.board || "Tamil Nadu State Board"}
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
        <StatCard label={isTamil ? "பயிலும் வகுப்பு" : "Current Class"} value={`${isTamil ? "வகுப்பு" : "Class"} ${profile?.currentClass || 10}`} icon={Users} color="violet"
          trend={isTamil ? "பள்ளி சேர்க்கை வகுப்பு" : "School enrollment grade"} />
        <StatCard label={isTamil ? "தேர்வு ஆயத்த நிலை" : "Prep Standard"} value={`${isTamil ? "வகுப்பு" : "Class"} ${profile?.examPrepClass || 10}`} icon={TrendingUp} color="cyan"
          trend={isTamil ? "அரசுப் பாடத்திட்ட நிலை" : "COE configured syllabus level"} />
        <StatCard label={isTamil ? "பாட முன்னேற்றம்" : "Overall Progress"} value={`${overallPct}%`} icon={BarChart3} color="emerald"
          trend={isTamil ? "முடிக்கப்பட்ட பாட அலகுகள்" : "Syllabus chapters mastered"} />
        <StatCard label={isTamil ? "அட்டவணை தேர்வுகள்" : "Upcoming Exams"} value={(upcomingExams || []).length} icon={Calendar} color="amber"
          trend={isTamil ? "அரசுத் தேர்வு மையம்" : "Published by COE"} />
      </div>

      {/* Official Examination Timetable (replaces old notice block) */}
      <ExamTimetableSection
        exams={upcomingExams || []}
        serverNow={data?.serverNow}
        isTamil={isTamil}
        t={t}
        isPreview={isPreview}
        previewRoll={previewRoll}
        emptyReason={data?.emptyReason}
        noticeText={notices?.[0]?.content}
      />

      {/* Subjects section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-[#f0f0ff]">
              {isTamil ? `முதன்மை பாடங்கள் — வகுப்பு ${profile?.examPrepClass || 10}` : `Core Subjects — Class ${profile?.examPrepClass || 10}`}
            </h2>
            <p className="text-xs text-[#5c5c8a] mt-0.5">{isTamil ? "அரசு தேர்வு வாரியத்தால் ஒதுக்கப்பட்ட பாடங்கள்" : "Assigned official curriculum subjects"}</p>
          </div>
          <span className="badge badge-muted">{(subjects || []).length} {isTamil ? "பாடங்கள்" : "Subjects"}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {(subjects || []).map((sub, i) => (
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
              href={`/student/exam-mock${(upcomingExams || []).length > 0 ? `?examId=${upcomingExams[0].id}` : ""}${
                isPreview ? `${(upcomingExams || []).length > 0 ? "&" : "?"}previewRollNo=${previewRoll}` : ""
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
