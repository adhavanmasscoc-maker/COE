"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/Card";
import {
  Award, ArrowLeft, Calendar, Clock, CheckCircle2,
  AlertCircle, FileText, Printer, TrendingUp,
  GraduationCap, Eye, Loader2, BookOpen,
  FileCheck, X, Sparkles, Check,
} from "lucide-react";

const gradeColor = {
  "A+": "badge-emerald", A: "badge-cyan", "B+": "badge-violet",
  B: "badge-violet", C: "badge-amber", D: "badge-amber",
  E: "badge-rose", F: "badge-rose",
};

function StudentResultsContent() {
  const searchParams = useSearchParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [previewRoll, setPreviewRoll] = useState(searchParams.get("previewRollNo") || null);

  // Evaluated Paper Modal state
  const [selectedExamPaper, setSelectedExamPaper] = useState(null);
  const [paperLoading, setPaperLoading] = useState(false);
  const [paperError, setPaperError] = useState("");

  const fetchResults = async (rollNo) => {
    setLoading(true); setError("");
    try {
      const url = rollNo ? `/api/student/results?previewRollNo=${rollNo}` : "/api/student/results";
      const res = await fetch(url);
      const json = await res.json();
      if (!res.ok) setError(json.error || "Failed to load results.");
      else setData(json);
    } catch { setError("Network error fetching results."); }
    finally { setLoading(false); }
  };

  const openEvaluatedPaper = async (examId) => {
    setPaperLoading(true);
    setPaperError("");
    setSelectedExamPaper({ loading: true });
    try {
      const url = previewRoll
        ? `/api/student/results/paper/${examId}?previewRollNo=${previewRoll}`
        : `/api/student/results/paper/${examId}`;
      const res = await fetch(url);
      const json = await res.json();
      if (res.ok && json.success) {
        setSelectedExamPaper(json);
      } else {
        setPaperError(json.error || "Failed to load evaluated paper.");
        setSelectedExamPaper(null);
      }
    } catch {
      setPaperError("Network error retrieving paper.");
      setSelectedExamPaper(null);
    } finally {
      setPaperLoading(false);
    }
  };

  useEffect(() => {
    fetchResults(previewRoll);
    // Auto-refresh every 15s to automatically catch delayed releases when their time comes
    const timer = setInterval(() => {
      fetchResults(previewRoll);
    }, 15000);
    return () => clearInterval(timer);
  }, [previewRoll]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-14 h-14 rounded-2xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center">
        <Loader2 className="w-7 h-7 animate-spin text-violet-400" />
      </div>
      <p className="text-sm text-[#5c5c8a]">Retrieving official statement of marks…</p>
    </div>
  );

  if (error || !data) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="glass rounded-2xl p-8 text-center max-w-sm border border-rose-500/25">
        <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-[#f0f0ff] mb-2">Results Unavailable</h2>
        <p className="text-xs text-[#5c5c8a] mb-5">{error}</p>
        <Link href="/student/dashboard"><Button variant="secondary" size="sm">← Dashboard</Button></Link>
      </div>
    </div>
  );

  const { candidate, analytics, results } = data;

  return (
    <div className="page-content space-y-6">

      {/* COE Preview Banner */}
      {searchParams.get("previewRollNo") && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 print:hidden animate-float-up">
          <div className="flex items-center gap-2 text-xs text-amber-300">
            <Eye className="w-4 h-4 flex-shrink-0" />
            <strong>COE Preview:</strong>&nbsp;Inspecting grade statement from database
          </div>
          <div className="flex gap-1 p-1 glass-sm rounded-xl border border-amber-500/20">
            {[
              { roll: "TN2026-0901", label: "Student A (Cl. 10)" },
              { roll: "TN2026-1102", label: "Student B (Cl. 12)" },
            ].map(({ roll, label }) => (
              <button key={roll} onClick={() => setPreviewRoll(roll)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  previewRoll === roll
                    ? "bg-amber-500/30 text-amber-200 border border-amber-400/40"
                    : "text-[#5c5c8a] hover:text-[#a8a8d0]"
                }`}>{label}</button>
            ))}
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-float-up">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-cyan-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-[#f0f0ff]">Statement of Marks</h1>
              <span className="badge badge-emerald">COE Certified</span>
            </div>
            <p className="text-xs text-[#5c5c8a] mt-0.5">
              {candidate.board} · Academic Session {candidate.academicYear}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <Link href="/student/history">
            <Button variant="outline" size="sm" className="gap-1.5 border-violet-500/30 text-violet-300 hover:bg-violet-500/10">
              <Calendar className="w-4 h-4 text-violet-400" />Exam History
            </Button>
          </Link>
          <Button variant="secondary" size="sm" onClick={() => window.print()} className="gap-1.5">
            <Printer className="w-4 h-4" />Print
          </Button>
          <Link href="/student/dashboard">
            <Button variant="outline" size="sm" className="gap-1.5">
              <ArrowLeft className="w-4 h-4" />Dashboard
            </Button>
          </Link>
        </div>
      </div>

      {/* Candidate details */}
      <div className="glass rounded-2xl p-5 border border-[rgba(124,58,237,0.2)] animate-float-up">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          {[
            { label: "Candidate Name", value: candidate.fullName, bold: true },
            { label: "Roll Number", value: candidate.rollNo, mono: true, color: "text-violet-300" },
            { label: "School Standard", value: `Class ${candidate.currentClass}` },
            { label: "Exam Prep Level", value: `Class ${candidate.examPrepClass} (Samacheer)`, color: "text-cyan-300" },
          ].map(({ label, value, bold, mono, color }) => (
            <div key={label}>
              <span className="text-[10px] text-[#5c5c8a] uppercase font-bold tracking-wider block mb-0.5">{label}</span>
              <span className={`text-sm font-bold ${color || "text-[#f0f0ff]"} ${mono ? "font-mono" : ""}`}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Analytics stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <StatCard label="Overall Score" value={`${analytics.overallPercentage}%`} icon={TrendingUp} color="emerald"
          trend={`Grade ${analytics.overallGrade} — ${analytics.overallClassification}`} />
        <StatCard label="Evaluated Papers" value={analytics.totalEvaluated} icon={FileText} color="violet"
          trend="Published by COE" />
        <StatCard label="Marks Obtained" value={`${analytics.totalMarksObtained}/${analytics.totalMaxMarks}`} icon={Award} color="cyan"
          trend="Cumulative marks" />
        <StatCard label="Top Subject" value={analytics.highestScoringSubject} icon={BookOpen} color="amber"
          trend="Best performance" />
      </div>

      {/* Pending / Scheduled Result Releases Section */}
      {data.pendingResults && data.pendingResults.length > 0 && (
        <div className="glass rounded-2xl border border-amber-500/30 overflow-hidden animate-float-up p-5 space-y-3 bg-amber-500/5">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400 animate-pulse flex-shrink-0" />
            <h2 className="text-sm font-bold text-foreground">
              Examinations Under Automated Evaluation & Scheduled Release
            </h2>
            <span className="badge badge-amber ml-auto font-mono text-[10px]">
              {data.pendingResults.length} In Progress
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your written answers are securely encrypted and undergoing validation. Results will automatically unlock on this page once the scheduled timer arrives.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {data.pendingResults.map((pending) => (
              <div
                key={pending.examId}
                className="p-3.5 rounded-xl bg-card border border-border flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">{pending.subject}</span>
                    <span className="badge badge-purple text-[10px] py-0">{pending.code}</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground block mt-0.5 font-mono">
                    Submitted: {new Date(pending.submittedAt).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true })}
                  </span>
                </div>

                <div className="text-right font-mono">
                  <span className="text-[11px] font-bold text-amber-400 block">
                    {pending.statusMessage}
                  </span>
                  {pending.remainingSeconds !== null && pending.remainingSeconds > 0 && (
                    <span className="text-[10px] text-muted-foreground block mt-0.5">
                      Release in ~{Math.ceil(pending.remainingSeconds / 60)} mins
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results table */}
      <div className="glass rounded-2xl border border-[rgba(124,58,237,0.2)] overflow-hidden animate-float-up">
        <div className="flex items-center justify-between p-5 border-b border-[rgba(124,58,237,0.1)]">
          <div>
            <h2 className="text-base font-bold text-[#f0f0ff]">Subject-wise Evaluation & COE Feedback</h2>
            <p className="text-xs text-[#5c5c8a] mt-0.5">Certified scores released by the Controller of Examinations</p>
          </div>
          <span className="badge badge-muted font-mono">{results.length} Subjects</span>
        </div>

        {results.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Clock className="w-8 h-8 text-amber-400 mx-auto" />
            <h3 className="font-bold text-[#f0f0ff] text-sm">Examinations Under Evaluation</h3>
            <p className="text-xs text-[#5c5c8a] max-w-md mx-auto leading-relaxed">
              Your test responses are being evaluated by the COE. Official certified statements will be published here upon release.
            </p>
            <Link href="/student/dashboard">
              <Button variant="secondary" size="sm" className="mt-2">Return to Dashboard</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Subject & Code</th>
                  <th>Exam Date</th>
                  <th>Max Marks</th>
                  <th>Marks Scored</th>
                  <th>Percentage</th>
                  <th>Grade</th>
                  <th>COE Remarks</th>
                  <th className="text-right">Evaluated Paper</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <span className="font-bold text-[#f0f0ff] block">{r.subject}</span>
                      <span className="font-mono text-[10px] text-[#5c5c8a]">{r.code}</span>
                    </td>
                    <td className="font-mono">
                      {new Date(r.examDate).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </td>
                    <td className="font-mono font-semibold text-[#a8a8d0]">{r.maxMarks}</td>
                    <td className="font-mono font-black text-[#f0f0ff] text-sm">{r.marksObtained}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="progress-bar-track w-14">
                          <div className="progress-bar-fill" style={{ width: `${r.percentage}%` }} />
                        </div>
                        <span className="font-bold text-[#f0f0ff] text-xs">{r.percentage}%</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <span className={`badge ${gradeColor[r.grade] || "badge-muted"} font-bold`}>{r.grade}</span>
                        <span className="text-[10px] text-[#5c5c8a]">{r.gradeLabel}</span>
                      </div>
                    </td>
                    <td className="italic text-[#5c5c8a] text-xs">{r.remarks || "Satisfactory performance."}</td>
                    <td className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEvaluatedPaper(r.examId)}
                        className="text-xs font-bold gap-1.5 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/15 py-1 px-2.5 whitespace-nowrap"
                        title="View your actual answers, official keys, and worked solutions"
                      >
                        <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                        View Evaluated Paper
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Official footer */}
      <div className="glass-sm rounded-2xl p-5 border border-[rgba(124,58,237,0.1)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
        <div>
          <span className="font-bold text-[#f0f0ff] block">Office of the Controller of Examinations</span>
          <p className="text-[11px] text-[#5c5c8a] mt-0.5">
            Aknex COE Examination System · Tamil Nadu Samacheer Kalvi
          </p>
        </div>
        <div className="text-right font-mono text-[11px]">
          <span className="text-emerald-400 font-bold flex items-center gap-1 justify-end">
            <CheckCircle2 className="w-3.5 h-3.5" />Authenticated Record
          </span>
          <span className="text-[#5c5c8a]">Verified: {new Date().toLocaleDateString("en-IN")}</span>
        </div>
      </div>

      {/* Evaluated Student Paper Modal */}
      {selectedExamPaper && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in-50">
          <div className="glass max-w-4xl w-full max-h-[90vh] flex flex-col rounded-2xl border border-[rgba(124,58,237,0.3)] bg-card shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-border flex items-center justify-between bg-secondary/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base text-foreground">
                      {selectedExamPaper.exam?.subject || "Examination"} — Evaluated Paper
                    </h3>
                    {selectedExamPaper.exam?.code && (
                      <span className="badge badge-purple font-mono text-[10px]">
                        {selectedExamPaper.exam.code}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Candidate: {selectedExamPaper.candidate?.fullName} ({selectedExamPaper.candidate?.rollNo})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => window.print()}
                  className="gap-1 text-xs"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Paper
                </Button>
                <button
                  onClick={() => setSelectedExamPaper(null)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
              {selectedExamPaper.loading ? (
                <div className="py-16 text-center space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-400" />
                  <p className="text-muted-foreground font-mono">Decrypting authenticated candidate responses...</p>
                </div>
              ) : paperError ? (
                <div className="p-6 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-center">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-rose-400" />
                  <p className="font-semibold">{paperError}</p>
                </div>
              ) : (
                <>
                  {/* Score Summary Box */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-secondary/50 border border-border">
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-bold block">Score Obtained</span>
                      <span className="text-lg font-black text-emerald-400 font-mono">
                        {selectedExamPaper.submission?.score} / {selectedExamPaper.submission?.maxMarks}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-bold block">Percentage</span>
                      <span className="text-lg font-black text-cyan-300 font-mono">
                        {selectedExamPaper.submission?.percentage}%
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-bold block">Time Taken</span>
                      <span className="text-lg font-bold text-foreground font-mono">
                        {Math.floor((selectedExamPaper.submission?.timeTakenSecs || 0) / 60)}m {(selectedExamPaper.submission?.timeTakenSecs || 0) % 60}s
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-bold block">COE Vault</span>
                      <span className="badge badge-emerald mt-1 font-mono text-[10px]">
                        AES-256 HMAC Sealed
                      </span>
                    </div>
                  </div>

                  {/* Question-by-Question breakdown */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-sm text-foreground">
                      Question-by-Question Response Audit & Official Keys
                    </h4>

                    {selectedExamPaper.questions?.map((q) => (
                      <div
                        key={q.id}
                        className={`p-4 rounded-xl border space-y-3 ${
                          q.isCorrect
                            ? "bg-emerald-500/5 border-emerald-500/30"
                            : q.chosenAnswer
                            ? "bg-rose-500/5 border-rose-500/30"
                            : "bg-secondary/30 border-border"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <span className="font-bold text-foreground text-sm">
                            Q{q.questionNumber}. {q.questionText}
                          </span>
                          <span
                            className={`font-mono font-bold text-[10px] px-2 py-0.5 rounded flex-shrink-0 ${
                              q.isCorrect
                                ? "bg-emerald-500/20 text-emerald-300"
                                : q.chosenAnswer
                                ? "bg-rose-500/20 text-rose-300"
                                : "bg-secondary text-muted-foreground"
                            }`}
                          >
                            {q.isCorrect
                              ? `+${q.marksAwarded} Marks (Correct)`
                              : q.chosenAnswer
                              ? "0 Marks (Incorrect)"
                              : "Unattempted"}
                          </span>
                        </div>

                        {/* Options */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                          {(q.options || []).map((opt) => {
                            const isChosen = q.chosenAnswer === opt.id;
                            const isKey = q.correctAnswer === opt.id;

                            let optClass = "bg-secondary/40 border-border text-muted-foreground";
                            if (isKey) {
                              optClass = "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-semibold";
                            } else if (isChosen && !isKey) {
                              optClass = "bg-rose-500/15 border-rose-500/40 text-rose-300 font-semibold line-through";
                            }

                            return (
                              <div
                                key={opt.id}
                                className={`p-2.5 rounded-lg border flex items-center justify-between ${optClass}`}
                              >
                                <span><strong>{opt.id}.</strong> {opt.text}</span>
                                {isKey && (
                                  <span className="text-[10px] text-emerald-400 font-bold ml-2">
                                    ✓ Official Key
                                  </span>
                                )}
                                {isChosen && !isKey && (
                                  <span className="text-[10px] text-rose-400 font-bold ml-2">
                                    ✗ Your Choice
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Explanation Box */}
                        {q.explanation && (
                          <div className="p-3 rounded-lg bg-violet-500/10 border border-violet-500/20 text-[11px] text-[#a8a8d0]">
                            <strong className="text-violet-300 block mb-0.5">Step-by-Step Worked Solution:</strong>
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-border flex justify-end bg-secondary/40">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedExamPaper(null)}
              >
                Close Evaluated Paper
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StudentResultsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-violet-400" />
      </div>
    }>
      <StudentResultsContent />
    </Suspense>
  );
}
