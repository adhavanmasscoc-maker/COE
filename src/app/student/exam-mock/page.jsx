"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  Clock,
  CheckCircle2,
  Bookmark,
  AlertCircle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Send,
  RotateCcw,
  Loader2,
  HelpCircle,
  ShieldAlert,
  Sparkles
} from "lucide-react";

function ExamHallContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlExamId = searchParams.get("examId");
  const previewRollNo = searchParams.get("previewRollNo");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exam, setExam] = useState(null);
  const [candidate, setCandidate] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);

  // Exam state
  const [answers, setAnswers] = useState({}); // { [qId]: optionId }
  const [reviewed, setReviewed] = useState({}); // { [qId]: boolean }
  const [visited, setVisited] = useState({}); // { [qId]: boolean }
  const [timeLeft, setTimeLeft] = useState(5400); // in seconds
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

  // 1. Fetch Exam Data
  useEffect(() => {
    async function loadExam() {
      setLoading(true);
      setError("");
      try {
        let targetId = urlExamId;

        // If no examId provided in URL, fetch available exams for this student
        if (!targetId) {
          const listUrl = previewRollNo ? `/api/exams?previewRollNo=${previewRollNo}` : "/api/exams";
          const listRes = await fetch(listUrl);
          const listData = await listRes.json();
          if (listData.exams && listData.exams.length > 0) {
            targetId = listData.exams[0].id;
          } else {
            setError("No examinations are currently published for your preparation syllabus.");
            setLoading(false);
            return;
          }
        }

        const detailUrl = previewRollNo
          ? `/api/exams/${targetId}?previewRollNo=${previewRollNo}`
          : `/api/exams/${targetId}`;
        const res = await fetch(detailUrl);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Unable to enter examination hall.");
          setLoading(false);
          return;
        }

        setExam(data.exam);
        setCandidate(data.candidate);
        setQuestions(data.questions || []);

        if (data.questions && data.questions.length > 0) {
          setVisited({ [data.questions[0].id]: true });
        }

        // Set duration timer
        const totalSeconds = (data.exam.durationMinutes || 90) * 60;
        setTimeLeft(totalSeconds);

        // Check if student already submitted
        if (data.submission && data.submission.isSubmitted) {
          setSubmittedData({
            alreadySubmitted: true,
            submittedAt: data.submission.submittedAt,
            score: data.submission.score,
            totalMarks: data.exam.totalMarks,
            answers: data.submission.answers,
          });
        } else {
          // Restore saved local progress if exists
          try {
            const savedKey = `exam_draft_${targetId}_${data.candidate?.rollNo || "guest"}`;
            const saved = localStorage.getItem(savedKey);
            if (saved) {
              const parsed = JSON.parse(saved);
              if (parsed.answers) setAnswers(parsed.answers);
              if (parsed.reviewed) setReviewed(parsed.reviewed);
            }
          } catch (e) {
            // ignore localStorage error
          }
        }
      } catch (err) {
        setError("Network error connecting to examination server.");
      } finally {
        setLoading(false);
      }
    }

    loadExam();
  }, [urlExamId, previewRollNo]);

  // 2. Live Countdown Timer
  useEffect(() => {
    if (submittedData || loading || !exam) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto submit when time runs out
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [submittedData, loading, exam]);

  // 3. Local draft auto-save
  useEffect(() => {
    if (!exam || submittedData) return;
    try {
      const savedKey = `exam_draft_${exam.id}_${candidate?.rollNo || "guest"}`;
      localStorage.setItem(savedKey, JSON.stringify({ answers, reviewed }));
    } catch (e) {
      // ignore
    }
  }, [answers, reviewed, exam, candidate, submittedData]);

  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const currentQ = questions[currentIdx];

  const handleSelectOption = (optId) => {
    if (submittedData) return;
    setAnswers((prev) => ({ ...prev, [currentQ.id]: optId }));
  };

  const handleSaveAndNext = () => {
    if (currentIdx < questions.length - 1) {
      const nextQ = questions[currentIdx + 1];
      setVisited((prev) => ({ ...prev, [nextQ.id]: true }));
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handleMarkForReview = () => {
    setReviewed((prev) => ({ ...prev, [currentQ.id]: !prev[currentQ.id] }));
    handleSaveAndNext();
  };

  const handleClearResponse = () => {
    if (submittedData) return;
    setAnswers((prev) => {
      const copy = { ...prev };
      delete copy[currentQ.id];
      return copy;
    });
  };

  const jumpToQuestion = (index) => {
    const targetQ = questions[index];
    if (targetQ) {
      setVisited((prev) => ({ ...prev, [targetQ.id]: true }));
      setCurrentIdx(index);
    }
  };

  const getQuestionStatus = (qId) => {
    const hasAnswer = answers[qId] !== undefined;
    const isMarked = reviewed[qId] === true;
    const isVis = visited[qId] === true;

    if (isMarked) return "review";
    if (hasAnswer) return "answered";
    if (isVis) return "unanswered";
    return "not-visited";
  };

  const counts = {
    answered: Object.keys(answers).length,
    reviewed: Object.values(reviewed).filter(Boolean).length,
    total: questions.length,
    unanswered: questions.length - Object.keys(answers).length,
  };

  // Submit test to SQLite
  const handleSubmitExam = async () => {
    if (submitting || submittedData) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/student/exam-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId: exam.id,
          answers,
          timeTakenSecs: (exam.durationMinutes * 60) - timeLeft,
          previewRollNo,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setSubmittedData(json);
        setShowConfirmModal(false);
        // Clear local storage draft
        try {
          localStorage.removeItem(`exam_draft_${exam.id}_${candidate?.rollNo || "guest"}`);
        } catch (e) {}
      } else {
        alert(json.error || "Failed to submit examination.");
      }
    } catch (err) {
      alert("Network error submitting examination responses.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 space-y-3 bg-background text-foreground">
        <Loader2 className="w-10 h-10 animate-spin text-sky-400" />
        <h2 className="text-base font-bold">Verifying Candidate Security & Test Papers...</h2>
        <p className="text-xs text-muted-foreground">Securing examination session from SQLite database.</p>
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <Card className="max-w-md w-full p-6 text-center border-rose-500/30">
          <ShieldAlert className="w-14 h-14 text-rose-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-foreground mb-2">Access Restricted</h2>
          <p className="text-xs text-muted-foreground mb-6 leading-relaxed">{error}</p>
          <Link href="/student/dashboard">
            <Button size="sm" className="w-full justify-center">Return to Dashboard</Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Submitted Receipt View
  if (submittedData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="max-w-lg w-full text-center p-8 border-emerald-500/40 shadow-2xl bg-card">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>

          <Badge variant="success" className="mb-2">Official Examination Sealed</Badge>
          <h2 className="text-2xl font-black text-foreground mb-2">Responses Recorded Successfully!</h2>
          <p className="text-xs text-muted-foreground mb-6">
            Your answer script has been officially time-stamped and encrypted in SQLite.
            The Controller of Examinations will publish the final verified marksheet.
          </p>

          <div className="bg-secondary/60 rounded-2xl p-4 text-left text-xs space-y-2.5 mb-6 border border-border">
            <div className="flex justify-between pb-2 border-b border-border font-medium">
              <span className="text-muted-foreground">Subject:</span>
              <span className="font-bold text-foreground">{exam.subject} ({exam.code})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Candidate Roll No:</span>
              <span className="font-mono font-bold text-sky-400">{candidate?.rollNo || "Candidate"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Standard / Syllabus:</span>
              <span className="font-semibold text-foreground">Class {exam.prepClass} TN Samacheer</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Questions:</span>
              <span className="font-bold text-foreground">{questions.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Questions Answered:</span>
              <span className="font-bold text-emerald-400">{submittedData.stats?.answeredCount ?? counts.answered}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Recorded Submission Time:</span>
              <span className="font-mono text-muted-foreground">
                {new Date(submittedData.submittedAt || Date.now()).toLocaleTimeString("en-IN")}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/student/dashboard" className="flex-1">
              <Button className="w-full justify-center">Return to Dashboard</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground select-none">
      {/* Sticky Exam Header Bar */}
      <header className="sticky top-0 z-50 w-full bg-card/95 backdrop-blur-md border-b border-border shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/student/dashboard"
              className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
              title="Leave Exam"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-foreground">{exam.subject}</span>
                <Badge variant="purple" className="text-[10px] py-0">Class {exam.prepClass}</Badge>
                <Badge variant="secondary" className="text-[10px] py-0">{exam.medium || "English"} Medium</Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Candidate: {candidate?.fullName} ({candidate?.rollNo}) • Class {candidate?.currentClass} Student
              </p>
            </div>
          </div>

          {/* Sticky Timer and Submit Button */}
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono text-sm font-bold ${
                timeLeft < 600
                  ? "bg-rose-500/10 border-rose-500/30 text-rose-400 animate-pulse"
                  : "bg-amber-500/10 border-amber-500/30 text-amber-400"
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{formatTime(timeLeft)}</span>
            </div>

            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowConfirmModal(true)}
              className="gap-1.5 text-xs font-bold shadow-sm"
            >
              <Send className="w-3.5 h-3.5" /> Submit Exam
            </Button>
          </div>
        </div>
      </header>

      {/* Main Split Screen Area */}
      <div className="flex-1 max-w-7xl mx-auto w-full p-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left/Center Panel: Question Workspace (8 cols) */}
        <div className="lg:col-span-8 flex flex-col justify-between space-y-6">
          <Card className="flex-1 border-border flex flex-col justify-between">
            {currentQ ? (
              <div>
                {/* Question Meta Bar */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-base text-foreground">
                      Question {currentIdx + 1}
                    </span>
                    <span className="text-xs text-muted-foreground">of {questions.length}</span>
                  </div>
                  <Badge variant="secondary">+{currentQ.marks || 2} Marks</Badge>
                </div>

                {/* Question Text */}
                <div className="text-sm sm:text-base font-medium text-foreground mb-6 leading-relaxed">
                  {currentQ.questionText}
                </div>

                {/* Multiple Choice Options */}
                <div className="space-y-3">
                  {currentQ.options && currentQ.options.map((opt) => {
                    const isSelected = answers[currentQ.id] === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectOption(opt.id)}
                        className={`w-full p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all ${
                          isSelected
                            ? "border-sky-500 bg-sky-500/10 text-foreground font-semibold shadow-sm"
                            : "border-border bg-card hover:bg-secondary/60 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border transition-colors ${
                            isSelected
                              ? "bg-sky-500 text-slate-950 border-sky-400"
                              : "border-border text-muted-foreground"
                          }`}
                        >
                          {opt.id}
                        </span>
                        <span className="text-sm">{opt.text}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No questions have been seeded for this examination yet.
              </div>
            )}

            {/* Bottom Question Controls */}
            <div className="pt-6 mt-6 border-t border-border flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => currentIdx > 0 && setCurrentIdx(currentIdx - 1)}
                  disabled={currentIdx === 0}
                  className="gap-1"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearResponse}
                  disabled={!answers[currentQ?.id]}
                  className="text-xs text-muted-foreground hover:text-rose-400 gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Clear Response
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkForReview}
                  className="text-amber-400 border-amber-500/30 hover:bg-amber-500/10 gap-1 text-xs"
                >
                  <Bookmark className="w-3.5 h-3.5" /> Mark for Review
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveAndNext}
                  className="gap-1 font-semibold text-xs"
                >
                  Save & Next <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Panel: Question Navigator Grid (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="border-border">
            <h3 className="font-bold text-sm text-foreground mb-3">Question Palette</h3>

            {/* Palette Status Legend */}
            <div className="grid grid-cols-2 gap-2 text-[11px] mb-4 p-2.5 rounded-xl bg-secondary/50 border border-border">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-md bg-emerald-500" />
                <span>Answered ({counts.answered})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-md bg-amber-500" />
                <span>Review ({counts.reviewed})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-md bg-rose-500/70" />
                <span>Unanswered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-md bg-slate-700 border border-slate-600" />
                <span>Not Visited</span>
              </div>
            </div>

            {/* Numbered Question Navigator Grid */}
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const status = getQuestionStatus(q.id);
                const isCurrent = idx === currentIdx;

                let statusStyle = "bg-slate-800 text-slate-300 border-slate-700";
                if (status === "answered") {
                  statusStyle = "bg-emerald-500 text-slate-950 font-bold border-emerald-400";
                } else if (status === "review") {
                  statusStyle = "bg-amber-500 text-slate-950 font-bold border-amber-400";
                } else if (status === "unanswered") {
                  statusStyle = "bg-rose-500/30 text-rose-300 border-rose-500/40";
                }

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => jumpToQuestion(idx)}
                    className={`h-10 rounded-xl flex items-center justify-center text-xs font-semibold border transition-all ${statusStyle} ${
                      isCurrent ? "ring-2 ring-sky-400 ring-offset-2 ring-offset-background scale-105" : ""
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-border text-[11px] text-muted-foreground flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
              <span>Responses are automatically cached in real time.</span>
            </div>
          </Card>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 border-amber-500/30 animate-in fade-in-50 zoom-in-95">
            <h3 className="text-lg font-black text-foreground mb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-400" /> Confirm Submission
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Are you sure you want to end this examination? Once submitted, your answers will be permanently sealed.
            </p>

            <div className="bg-secondary/70 p-3.5 rounded-xl text-xs space-y-2 mb-6 border border-border">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Questions:</span>
                <span className="font-bold text-foreground">{counts.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Answered Questions:</span>
                <span className="font-bold text-emerald-400">{counts.answered}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Marked for Review:</span>
                <span className="font-bold text-amber-400">{counts.reviewed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Unanswered:</span>
                <span className="font-bold text-rose-400">{counts.unanswered}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfirmModal(false)}
                disabled={submitting}
              >
                Continue Exam
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleSubmitExam}
                disabled={submitting}
                className="gap-1.5 font-bold"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Sealing...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Confirm & Submit
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function ExamMockPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center p-6 text-xs text-muted-foreground">Loading test hall...</div>}>
      <ExamHallContent />
    </Suspense>
  );
}
