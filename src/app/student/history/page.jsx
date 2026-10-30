"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  CalendarDays,
  Clock,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Award,
  BookOpen,
  Zap,
  TrendingUp,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  FileText,
  RotateCcw,
  Loader2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

export default function StudentExamHistoryPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
          <p className="text-sm text-muted-foreground">Loading examination records...</p>
        </div>
      }
    >
      <ExamHistoryContent />
    </Suspense>
  );
}

function ExamHistoryContent() {
  const searchParams = useSearchParams();
  const previewRollNo = searchParams.get("previewRollNo");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("ALL");
  const [expandedExamId, setExpandedExamId] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError("");
    try {
      const url = previewRollNo
        ? `/api/student/history?previewRollNo=${encodeURIComponent(previewRollNo)}`
        : `/api/student/history`;
      const res = await fetch(url);
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Failed to load examination history.");
      } else {
        setData(json);
      }
    } catch {
      setError("Network error fetching examination records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [previewRollNo]);

  const toggleExpand = (id) => {
    setExpandedExamId((prev) => (prev === id ? null : id));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-violet-400" />
        <p className="text-sm text-muted-foreground">Retrieving candidate examination history from secure ledger...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 rounded-2xl glass border border-rose-500/30 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
        <h2 className="text-lg font-bold text-foreground">Examination History Unavailable</h2>
        <p className="text-xs text-muted-foreground">{error}</p>
        <Link href="/student/dashboard">
          <Button variant="secondary" size="sm" className="gap-1.5 text-xs">
            <ArrowLeft className="w-4 h-4" /> Return to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  const { candidate, stats, submissions } = data;

  // Filter submissions
  const filteredSubmissions = submissions.filter((sub) => {
    const matchesSubject = subjectFilter === "ALL" || sub.subjectCode === subjectFilter || sub.subject === subjectFilter;
    const matchesSearch =
      !search ||
      sub.subject?.toLowerCase().includes(search.toLowerCase()) ||
      sub.subjectCode?.toLowerCase().includes(search.toLowerCase()) ||
      sub.title?.toLowerCase().includes(search.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  const uniqueSubjects = Array.from(new Set(submissions.map((s) => s.subjectCode || s.subject)));

  return (
    <div className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-secondary/80 border border-border">
        <div className="flex items-center gap-3">
          <Link
            href="/student/dashboard"
            className="p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-foreground">Examination History</h1>
              <Badge variant="purple">Class {candidate.examPrepClass}</Badge>
              <Badge variant="success">Official Records</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Candidate: <strong>{candidate.fullName}</strong> ({candidate.rollNo}) · {candidate.board} · {candidate.medium} Medium
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/student/syllabus?tab=qbank">
            <Button size="sm" variant="outline" className="gap-1.5 text-xs">
              <BookOpen className="w-4 h-4 text-violet-400" /> Syllabus & Bank
            </Button>
          </Link>
          <Link href="/student/results">
            <Button size="sm" variant="secondary" className="gap-1.5 text-xs">
              <Award className="w-4 h-4 text-amber-400" /> Formal Marksheet
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-violet-500/20 bg-card/60 space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Exams Completed</span>
            <CalendarDays className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-2xl font-black text-foreground">{stats.totalSubmissions}</div>
          <div className="text-[10px] text-muted-foreground">Official submissions submitted</div>
        </Card>

        <Card className="p-4 border-emerald-500/20 bg-card/60 space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Average Score</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{stats.avgPercentage}%</div>
          <div className="text-[10px] text-muted-foreground font-semibold">
            Grade {stats.overallGrade} · {stats.overallGradeLabel}
          </div>
        </Card>

        <Card className="p-4 border-cyan-500/20 bg-card/60 space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Total Marks</span>
            <Award className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-foreground">
            {stats.totalMarksObtained} <span className="text-xs text-muted-foreground">/ {stats.totalMaxMarks}</span>
          </div>
          <div className="text-[10px] text-muted-foreground">Cumulative points achieved</div>
        </Card>

        <Card className="p-4 border-amber-500/20 bg-card/60 space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Time in Exam</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-foreground">{stats.totalTimeInvestedFormatted}</div>
          <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" /> 100% Verified Proctoring
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSubjectFilter("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              subjectFilter === "ALL"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All Subjects ({submissions.length})
          </button>
          {uniqueSubjects.map((subCode) => (
            <button
              key={subCode}
              onClick={() => setSubjectFilter(subCode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                subjectFilter === subCode
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {subCode}
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search exam or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-secondary border border-border text-foreground text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
        </div>
      </div>

      {/* Submissions List */}
      {filteredSubmissions.length === 0 ? (
        <Card className="p-12 text-center border-border">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-bold text-base text-foreground">No Exam Submissions Found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-5">
            {submissions.length === 0
              ? "You have not completed any official examinations yet. Prepare your syllabus and take scheduled tests."
              : "No exams matched your search filter."}
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/student/papers">
              <Button size="sm" variant="primary" className="gap-1.5 text-xs">
                <FileText className="w-4 h-4" /> View Scheduled Papers
              </Button>
            </Link>
            <Link href="/student/syllabus?tab=practice">
              <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                <Zap className="w-4 h-4 text-amber-400" /> Start Practice Assessment
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredSubmissions.map((sub, index) => {
            const isExpanded = expandedExamId === sub.id;
            const isPass = sub.percentage >= 35;

            return (
              <Card
                key={sub.id}
                className={`p-5 sm:p-6 transition-all border ${
                  isExpanded ? "border-violet-500/50 shadow-lg" : "border-border hover:border-border/80"
                }`}
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  {/* Exam Info */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20">
                        {sub.subjectCode}
                      </span>
                      <h3 className="font-black text-base text-foreground">{sub.subject}</h3>
                      <Badge variant="secondary">Class {sub.prepClass}</Badge>
                      <Badge variant={isPass ? "success" : "rose"}>
                        {sub.percentage}% · Grade {sub.grade} ({sub.gradeLabel})
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-1">{sub.title}</p>

                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap pt-1 font-mono">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="w-3.5 h-3.5 text-violet-400" />
                        {new Date(sub.submittedAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}{" "}
                        ·{" "}
                        {new Date(sub.submittedAt).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-400" /> {sub.timeTakenFormatted} spent
                      </span>
                      <span className="flex items-center gap-1 text-emerald-400">
                        <ShieldCheck className="w-3.5 h-3.5" /> Proctoring Verified
                      </span>
                    </div>
                  </div>

                  {/* Score Pill & Actions */}
                  <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end pt-3 lg:pt-0 border-t lg:border-t-0 border-border">
                    <div className="text-right">
                      <div className="text-xl sm:text-2xl font-black text-emerald-400">
                        {sub.score} <span className="text-xs text-muted-foreground font-semibold">/ {sub.totalMarks}</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        {sub.answeredCount} of {sub.totalQuestions} answered
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Retake / Practice Again Button */}
                      <Link
                        href={`/student/syllabus?tab=practice&subjectCode=${encodeURIComponent(
                          sub.subjectCode
                        )}&count=${sub.totalMarks}`}
                      >
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5 text-xs text-violet-300 border-violet-500/30 hover:bg-violet-500/10"
                          title="Practice these same questions unlimited times"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-amber-400" /> Practice Again
                        </Button>
                      </Link>

                      {/* Expand / Collapse Details */}
                      <Button
                        size="sm"
                        variant={isExpanded ? "primary" : "secondary"}
                        onClick={() => toggleExpand(sub.id)}
                        className="gap-1 text-xs"
                      >
                        {isExpanded ? (
                          <>
                            Hide Keys <ChevronUp className="w-3.5 h-3.5" />
                          </>
                        ) : (
                          <>
                            Review Answers <ChevronDown className="w-3.5 h-3.5" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Expanded Question Breakdown */}
                {isExpanded && (
                  <div className="mt-5 pt-5 border-t border-border space-y-4 animate-in fade-in-50 duration-200">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-foreground uppercase tracking-wide flex items-center gap-2">
                        <FileText className="w-4 h-4 text-violet-400" />
                        Full Question Breakdown & Official Rationale ({sub.questions.length} Questions)
                      </h4>
                      <span className="text-[11px] text-muted-foreground">
                        Green = Correct · Red = Incorrect · Gray = Unanswered
                      </span>
                    </div>

                    <div className="space-y-3">
                      {sub.questions.map((q, qIdx) => {
                        const isCorrect = q.isCorrect;
                        const wasAnswered = Boolean(q.candidateAnswer);

                        return (
                          <div
                            key={q.id || qIdx}
                            className={`p-4 rounded-xl border text-xs space-y-2.5 transition-all ${
                              isCorrect
                                ? "bg-emerald-500/5 border-emerald-500/25"
                                : wasAnswered
                                ? "bg-rose-500/5 border-rose-500/25"
                                : "bg-secondary/40 border-border"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-2.5">
                                <span
                                  className={`w-6 h-6 rounded-md flex items-center justify-center font-bold font-mono text-[11px] flex-shrink-0 mt-0.5 ${
                                    isCorrect
                                      ? "bg-emerald-500/20 text-emerald-300"
                                      : wasAnswered
                                      ? "bg-rose-500/20 text-rose-300"
                                      : "bg-secondary text-muted-foreground"
                                  }`}
                                >
                                  {q.questionNumber || qIdx + 1}
                                </span>
                                <div>
                                  <p className="font-semibold text-foreground leading-relaxed">
                                    {q.questionText}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 flex-shrink-0">
                                {isCorrect ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> +{q.marks || 1}
                                  </span>
                                ) : wasAnswered ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                                    <XCircle className="w-3.5 h-3.5" /> 0 / {q.marks || 1}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground bg-secondary px-2 py-0.5 rounded border border-border">
                                    Not Attempted
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Candidate Choice vs Official Key */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                              <div className="p-2 rounded-lg bg-card/60 border border-border flex items-center justify-between">
                                <span className="text-muted-foreground">Your Selected Option:</span>
                                <span
                                  className={`font-bold ${
                                    isCorrect
                                      ? "text-emerald-400"
                                      : wasAnswered
                                      ? "text-rose-400"
                                      : "text-muted-foreground"
                                  }`}
                                >
                                  {q.candidateAnswer ? `Option ${q.candidateAnswer}` : "None"}
                                </span>
                              </div>

                              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                                <span className="text-emerald-300">Official Correct Answer:</span>
                                <span className="font-bold text-emerald-400">
                                  Option {q.correctAnswer}
                                </span>
                              </div>
                            </div>

                            {/* Explanation */}
                            {q.explanation && (
                              <div className="p-2.5 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-300 text-[11px] leading-relaxed">
                                <strong className="text-violet-200">Official Rationale: </strong>
                                {q.explanation}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

