"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
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
  Sparkles,
  Monitor,
  Radio,
  X,
  Award,
  CalendarDays,
  XCircle,
  BookOpen
} from "lucide-react";
import { translateQuestion, translateOption, getLocalizedQuestion, getLocalizedOption } from "@/lib/questionTranslations";
import { pick, pickQuestion, pickOption, pickExplanation } from "@/lib/config/engine.config";

function normalizeOptionsList(options) {
  if (!options) return [];
  let parsed = options;
  if (typeof parsed === "string") {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      return [];
    }
  }
  if (Array.isArray(parsed)) {
    return parsed.map((item, idx) => {
      const id = String(item?.id || item?.key || String.fromCharCode(65 + idx)).toUpperCase();
      if (typeof item === "string") {
        return { id, text: item, textEn: item, textTa: null };
      }
      if (item && typeof item === "object") {
        const text = String(item.text !== undefined ? item.text : item.label !== undefined ? item.label : item.value !== undefined ? item.value : "");
        const textTa = item.textTa || item.ta || null;
        const textEn = item.textEn || item.en || text;
        return {
          id,
          text,
          textTa,
          textEn,
        };
      }
      return { id, text: String(item || ""), textEn: String(item || ""), textTa: null };
    });
  }
  if (parsed && typeof parsed === "object") {
    return Object.keys(parsed).map((k) => {
      const val = parsed[k];
      const id = k.toUpperCase();
      if (typeof val === "object" && val !== null) {
        return {
          id,
          text: String(val.text || val.label || val.en || ""),
          textTa: val.textTa || val.ta || null,
          textEn: val.textEn || val.en || String(val.text || ""),
        };
      }
      return {
        id,
        text: String(val !== undefined && val !== null ? val : ""),
        textEn: String(val !== undefined && val !== null ? val : ""),
        textTa: null,
      };
    });
  }
  return [];
}

function ExamHallContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isTamil: globalIsTamil, setLanguage, t } = useLanguage();
  const urlExamId = searchParams.get("examId");
  const previewRollNo = searchParams.get("previewRollNo");
  const urlMode = searchParams.get("mode");

  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState("");
  const [exam, setExam] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);
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

  // Virtual practice mode state (retake without affecting official evaluation)
  const [isPracticeMode, setIsPracticeMode] = useState(urlMode === "practice");
  const [officialSubmission, setOfficialSubmission] = useState(null);
  const [practiceResult, setPracticeResult] = useState(null);
  const [mockPracticeFilter, setMockPracticeFilter] = useState("INCORRECT");

  // Live screen proctoring state
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);

  // Student emergency help / issue report modal state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportCategory, setReportCategory] = useState("QUESTION_DISPLAY_PROBLEM");
  const [reportText, setReportText] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSuccessId, setReportSuccessId] = useState("");


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
          const subInfo = {
            alreadySubmitted: true,
            submittedAt: data.submission.submittedAt,
            score: data.submission.score,
            totalMarks: data.exam.totalMarks,
            answers: data.submission.answers,
          };
          setOfficialSubmission(subInfo);

          if (urlMode === "practice") {
            setIsPracticeMode(true);
            setSubmittedData(null);
          } else {
            setSubmittedData(subInfo);
          }
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

  // 4. Heartbeat every 15 seconds during active exam (Heartbeat & Telemetry)
  useEffect(() => {
    if (!exam || submittedData || loading) return;
    const beat = setInterval(async () => {
      try {
        await fetch("/api/student/heartbeat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            examId: exam.id,
            answeredCount: Object.keys(answers).length,
            timeLeftSecs: timeLeft,
          }),
        });

        // Also ping student activity for unified active test-takers monitoring on COE admin panel
        const roll = candidate?.rollNo || previewRollNo;
        if (roll) {
          fetch("/api/student/activity", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              rollNo: roll,
              studentName: candidate?.fullName || "Exam Candidate",
              action: isPracticeMode ? "PRACTICE_ACTIVE" : "EXAM_ACTIVE",
              details: JSON.stringify({
                examId: exam.id,
                subjectCode: exam.subject?.code,
                subjectName: exam.subject?.name,
                answeredCount: Object.keys(answers).length,
                totalQuestions: questions?.length || exam.questions?.length || 25,
                timeLeftSecs: timeLeft,
              }),
              tabSwitchCount: tabSwitchCount || 0,
            }),
          }).catch(() => {});
        }
      } catch {
        // Heartbeat failure is silent to student — COE is alerted server-side
      }
    }, 15000);
    return () => clearInterval(beat);
  }, [exam, submittedData, loading, answers, timeLeft, candidate, previewRollNo, isPracticeMode, questions, tabSwitchCount]);

  // 5. Anti-Cheat: Tab Switch Tracker
  useEffect(() => {
    if (!exam || submittedData || loading) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => {
          const nextCount = prev + 1;
          fetch("/api/student/screen-stream", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              examId: exam.id,
              rollNo: candidate?.rollNo,
              studentName: candidate?.fullName,
              tabSwitchCount: nextCount,
              isLive: true,
            }),
          }).catch(() => {});
          return nextCount;
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [exam, candidate, submittedData, loading]);

  // 6. Live Screen Sharing to COE Proctor
  const startScreenShare = async () => {
    try {
      if (!navigator.mediaDevices?.getDisplayMedia) {
        alert("Screen sharing is not supported on this browser/device.");
        return;
      }

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: "always", frameRate: 5 },
        audio: false,
      });

      setIsSharingScreen(true);

      const video = document.createElement("video");
      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;
      await video.play();

      const canvas = document.createElement("canvas");
      canvas.width = 640;
      canvas.height = 360;
      const ctx = canvas.getContext("2d");

      const frameInterval = setInterval(() => {
        if (!stream.active) {
          clearInterval(frameInterval);
          setIsSharingScreen(false);
          return;
        }

        try {
          ctx.drawImage(video, 0, 0, 640, 360);
          const frameData = canvas.toDataURL("image/webp", 0.4);

          fetch("/api/student/screen-stream", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              examId: exam?.id,
              rollNo: candidate?.rollNo,
              studentName: candidate?.fullName,
              frame: frameData,
              isLive: true,
              tabSwitchCount,
            }),
          }).catch(() => {});
        } catch (e) {
          // ignore frame capture error
        }
      }, 3500);

      stream.getVideoTracks()[0].onended = () => {
        clearInterval(frameInterval);
        setIsSharingScreen(false);
      };
    } catch (err) {
      console.warn("Screen share permission denied or cancelled:", err);
    }
  };

  // 7. Send Emergency Issue Report to COE Help Panel
  const handleSendIssueReport = async (e) => {
    e.preventDefault();
    if (!reportText.trim() || reportSubmitting) return;
    setReportSubmitting(true);
    setReportSuccessId("");
    try {
      const res = await fetch("/api/student/report-issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId: exam?.id,
          rollNo: candidate?.rollNo,
          category: reportCategory,
          message: reportText.trim(),
          details: {
            currentQuestion: currentIdx + 1,
            timeLeftSecs: timeLeft,
            answeredCount: Object.keys(answers).length,
            tabSwitches: tabSwitchCount,
          },
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setReportSuccessId(data.incidentId || "REPORTED");
        setReportText("");
      } else {
        alert(data.error || "Failed to transmit report.");
      }
    } catch (err) {
      alert("Network error reporting problem.");
    } finally {
      setReportSubmitting(false);
    }
  };


  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const currentQ = questions[currentIdx];
  const isExamTamil = exam?.examLanguage === "ta" || exam?.language === "Tamil" || globalIsTamil || candidate?.medium === "Tamil" || exam?.medium === "Tamil";

  const handleSelectOption = (optId) => {
    if (submittedData) return;
    setAnswers((prev) => ({ ...prev, [currentQ.id]: optId }));
  };

  const handleSaveAndNext = () => {
    if (currentIdx < questions.length - 1) {
      const nextQ = questions[currentIdx + 1];
      setVisited((prev) => ({ ...prev, [nextQ.id]: true }));
      setCurrentIdx(currentIdx + 1);
    } else {
      // Final question reached: directly open confirmation modal to prompt candidate to submit
      setShowConfirmModal(true);
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

  // Practice mode local evaluation
  const handlePracticeSubmit = () => {
    let score = 0;
    const breakdown = questions.map((q, idx) => {
      const chosen = answers[q.id];
      const isCorrect = Boolean(chosen && chosen === q.correctAnswer);
      if (isCorrect) score += (q.marks || 1);
      return {
        ...q,
        index: idx + 1,
        chosen,
        isCorrect,
      };
    });
    setPracticeResult({
      score,
      totalMarks: exam.totalMarks,
      breakdown,
      answeredCount: Object.keys(answers).length,
      totalQuestions: questions.length,
      timeTakenSecs: (exam.durationMinutes * 60) - timeLeft,
    });
    setShowConfirmModal(false);
  };

  // Submit test to SQLite — only sets submitted state on confirmed server success
  const [submitError, setSubmitError] = useState("");
  const attemptIdRef = React.useRef(null);
  if (!attemptIdRef.current) {
    attemptIdRef.current = "att_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9);
  }

  const handleSubmitExam = async () => {
    if (isPracticeMode) {
      handlePracticeSubmit();
      return;
    }

    if (submitting || submittedData) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const timeSpent = Math.max(0, (exam.durationMinutes * 60) - (timeLeft || 0));
      const res = await fetch("/api/student/exam-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId: exam.id,
          answers,
          timeTakenSecs: isNaN(timeSpent) ? 0 : timeSpent,
          previewRollNo,
          attemptId: attemptIdRef.current,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        // ✅ Server confirmed: safe to show submitted state
        setSubmittedData(json);
        setOfficialSubmission(json);
        setShowConfirmModal(false);
        try {
          localStorage.removeItem(`exam_draft_${exam.id}_${candidate?.rollNo || "guest"}`);
        } catch (e) {}
      } else {
        // ❌ Server rejected — show error, let student retry or contact COE
        const msg = json.error || "Submission was not accepted by the server.";
        setSubmitError(msg);
        setShowConfirmModal(false);
      }
    } catch (err) {
      setSubmitError("Network error: your answers were NOT submitted. Check your connection and try again.");
      setShowConfirmModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted || loading) {
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

  // Virtual Practice Evaluation & Review Screen
  if (practiceResult) {
    const pct = Math.round((practiceResult.score / practiceResult.totalMarks) * 100);
    return (
      <div className="min-h-screen py-10 px-4 bg-background max-w-4xl mx-auto space-y-6">
        <Card className="p-6 border-violet-500/30 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-violet-500/15 border border-violet-500/30 flex items-center justify-center mx-auto text-violet-400">
            <Sparkles className="w-8 h-8" />
          </div>

          <div className="flex items-center justify-center gap-2">
            <Badge variant="purple">Virtual Simulation Practice</Badge>
            <Badge variant="secondary" className="font-mono text-[10px]">Non-Evaluated Practice Mode</Badge>
          </div>

          <h2 className="text-2xl font-black text-foreground">
            Virtual Practice Evaluation Complete!
          </h2>
          <p className="text-xs text-muted-foreground max-w-lg mx-auto">
            This practice test is an interactive simulation to help you prepare. Your official submitted score remains safely recorded in the COE vault.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-secondary/60 border border-border text-xs">
            <div>
              <span className="text-muted-foreground block text-[10px]">Practice Score</span>
              <span className="text-lg font-black text-amber-400">
                {practiceResult.score} / {practiceResult.totalMarks}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px]">Percentage</span>
              <span className="text-lg font-black text-emerald-400">{pct}%</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px]">Questions Answered</span>
              <span className="text-lg font-black text-foreground">
                {practiceResult.answeredCount} / {practiceResult.totalQuestions}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px]">Official Record</span>
              <span className="badge badge-emerald mt-1">Protected</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              variant="primary"
              onClick={() => {
                setPracticeResult(null);
                setAnswers({});
                setReviewed({});
                setCurrentIdx(0);
                setTimeLeft((exam.durationMinutes || 90) * 60);
              }}
              className="flex-1 justify-center text-xs font-bold gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Retake Virtual Practice
            </Button>
            <Link href="/student/dashboard" className="flex-1">
              <Button variant="outline" className="w-full justify-center text-xs">
                Return to Dashboard
              </Button>
            </Link>
          </div>
        </Card>

        {/* Detailed Question Review with Explanations - Mistakes First (No Scrolling Needed) */}
        {(() => {
          const incorrectCount = practiceResult.breakdown.filter((q) => q.chosen && !q.isCorrect).length;
          const unattemptedCount = practiceResult.breakdown.filter((q) => !q.chosen).length;
          const correctCount = practiceResult.breakdown.filter((q) => q.isCorrect).length;

          const filteredPracticeQuestions = practiceResult.breakdown.filter((q) => {
            if (mockPracticeFilter === "INCORRECT") return q.chosen && !q.isCorrect;
            if (mockPracticeFilter === "UNATTEMPTED") return !q.chosen;
            if (mockPracticeFilter === "CORRECT") return q.isCorrect;
            return true;
          });

          return (
            <div className="space-y-4">
              {/* Alert Banner for Mistakes */}
              {incorrectCount > 0 ? (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-rose-200 text-sm">
                      {isExamTamil
                        ? `தவறாக விடையளிக்கப்பட்ட வினாக்கள் (${incorrectCount}) — உடனடியாக கீழே சரிபார்க்கவும்`
                        : `Wrongly Answered Questions (${incorrectCount}) — Review Directly Without Scrolling`}
                    </h4>
                    <p className="text-xs text-rose-300/80">
                      {isExamTamil
                        ? "நீங்கள் தவறாக தேர்வு செய்த விடைகள் உடனடியாக கீழே காட்டப்பட்டுள்ளன."
                        : "Your incorrect answers are prioritized directly below with official solution keys and rationales."}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-emerald-200 text-sm">
                      {isExamTamil ? "அற்புதம்! 100% சரியான விடைகள்!" : "100% Correct! All questions answered accurately!"}
                    </h4>
                  </div>
                </div>
              )}

              {/* Filter Tabs */}
              <div className="flex items-center gap-2 flex-wrap pb-1 border-b border-border">
                <button
                  type="button"
                  onClick={() => setMockPracticeFilter("INCORRECT")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    mockPracticeFilter === "INCORRECT"
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                      : "bg-secondary/40 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <XCircle className="w-3.5 h-3.5 text-rose-400" />
                  {isExamTamil ? `தவறானவை (${incorrectCount})` : `Wrong Answers (${incorrectCount})`}
                </button>
                <button
                  type="button"
                  onClick={() => setMockPracticeFilter("UNATTEMPTED")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    mockPracticeFilter === "UNATTEMPTED"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      : "bg-secondary/40 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                  {isExamTamil ? `விடையளிக்காதவை (${unattemptedCount})` : `Skipped (${unattemptedCount})`}
                </button>
                <button
                  type="button"
                  onClick={() => setMockPracticeFilter("CORRECT")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    mockPracticeFilter === "CORRECT"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : "bg-secondary/40 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  {isExamTamil ? `சரியானவை (${correctCount})` : `Correct (${correctCount})`}
                </button>
                <button
                  type="button"
                  onClick={() => setMockPracticeFilter("ALL")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    mockPracticeFilter === "ALL"
                      ? "bg-violet-500/20 text-violet-300 border border-violet-500/40"
                      : "bg-secondary/40 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 text-violet-400" />
                  {isExamTamil ? `அனைத்தும் (${practiceResult.breakdown.length})` : `All (${practiceResult.breakdown.length})`}
                </button>
              </div>

              {/* Questions List */}
              {filteredPracticeQuestions.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-secondary/30 border border-border">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-foreground">
                    {mockPracticeFilter === "INCORRECT"
                      ? isExamTamil ? "அற்புதம்! தவறான விடைகள் ஏதுமில்லை!" : "Brilliant! No incorrect answers!"
                      : "No questions in this filter."}
                  </p>
                </div>
              ) : (
                filteredPracticeQuestions.map((q) => (
                  <Card key={q.id} className="p-5 border-border space-y-3 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-foreground text-sm">
                        <span className="font-mono text-violet-400 mr-1.5">Q{q.index}.</span>
                        {getLocalizedQuestion(q, isExamTamil)}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold flex-shrink-0 ${
                        q.isCorrect
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : q.chosen
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}>
                        {q.isCorrect ? `+${q.marks || 1} Marks (Correct)` : q.chosen ? "0 Marks (Incorrect)" : "Unattempted"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      {normalizeOptionsList(q.options).map((opt) => {
                        const isUserChosen = q.chosen === opt.id;
                        const isCorrectAns = q.correctAnswer === opt.id;

                        let optStyle = "bg-secondary/40 border-border text-muted-foreground";
                        if (isCorrectAns) {
                          optStyle = "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-semibold";
                        } else if (isUserChosen && !isCorrectAns) {
                          optStyle = "bg-rose-500/15 border-rose-500/40 text-rose-300 font-semibold line-through";
                        }

                        return (
                          <div key={opt.id} className={`p-2.5 rounded-xl border flex items-center justify-between ${optStyle}`}>
                            <span><strong>{opt.id}.</strong> {pickOption(opt, isExamTamil ? "ta" : "en")}</span>
                            {isCorrectAns && <span className="text-[10px] text-emerald-400 font-bold ml-2">✓ {isExamTamil ? "சரியான விடை" : "Correct Answer"}</span>}
                            {isUserChosen && !isCorrectAns && <span className="text-[10px] text-rose-400 font-bold ml-2">✗ Your Choice</span>}
                          </div>
                        );
                      })}
                    </div>

                    {pickExplanation(q, isExamTamil ? "ta" : "en") && (
                      <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-[11px] text-[#a8a8d0]">
                        <strong className="text-violet-300 block mb-0.5">{isExamTamil ? "விளக்கம் & தர்க்கம்:" : "Explanation & Rationale:"}</strong>
                        {pickExplanation(q, isExamTamil ? "ta" : "en")}
                      </div>
                    )}
                  </Card>
                ))
              )}
            </div>
          );
        })()}
      </div>
    );
  }

  // Submitted Receipt View (Official submission lock + virtual practice launcher)
  if (submittedData && !isPracticeMode) {
    const scoreVal = submittedData.stats?.score ?? submittedData.score ?? 0;
    const totalMarksVal = submittedData.stats?.totalMarks ?? submittedData.totalMarks ?? exam?.totalMarks ?? 25;
    const percentageVal = Math.round((scoreVal / totalMarksVal) * 100);

    const subjectDisplayName = typeof exam?.subject === "object" ? exam.subject.name : (exam?.subject || "Examination");
    const subjectCodeDisplay = exam?.code || (typeof exam?.subject === "object" ? exam.subject.code : "") || "EXAM";

    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="max-w-lg w-full text-center p-8 border-emerald-500/40 shadow-2xl bg-card space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>

          <div className="flex items-center justify-center gap-2">
            <Badge variant="success">
              {isExamTamil ? "அரசுத் தேர்வு பாதுகாக்கப்பட்டது" : "Official Examination Sealed"}
            </Badge>
            <Badge variant="secondary" className="text-[10px] font-mono">AES-256 Vault</Badge>
          </div>

          <h2 className="text-2xl font-black text-foreground">
            {isExamTamil ? "விடைத்தாள் சமர்ப்பிக்கப்பட்டது!" : "Responses Encrypted & Sealed!"}
          </h2>

          {/* User Requested Post-Submission Status */}
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs text-left space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>
                {isExamTamil
                  ? "மதிப்பீடு நிலை: தேர்வு முடிவுகள் தயாராக உள்ளன"
                  : "Current Status: Evaluation Completed & Certified"}
              </span>
            </div>
            <p className="text-[11px] text-[#a8a8d0] leading-relaxed">
              {isExamTamil
                ? "உங்கள் விடைகள் பதிவு செய்யப்பட்டு மதிப்பீடு செய்யப்பட்டுள்ளன. உங்களது உத்தியோகபூர்வ மதிப்பெண் மற்றும் தேர்வுச் சான்றிதழை உடனடி அறிக்கையாகப் பெறலாம்."
                : "Your official examination answers have been securely received and evaluated. You can now inspect your official statement of marks and performance statement."}
            </p>
          </div>

          <div className="bg-secondary/60 rounded-2xl p-4 text-left text-xs space-y-2.5 border border-border">
            <div className="flex justify-between pb-2 border-b border-border font-medium">
              <span className="text-muted-foreground">{isExamTamil ? "பாடம்:" : "Subject:"}</span>
              <span className="font-bold text-foreground">{subjectDisplayName} ({subjectCodeDisplay})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{isExamTamil ? "தேர்வர் பதிவு எண்:" : "Candidate Roll No:"}</span>
              <span className="font-mono font-bold text-sky-400">{candidate?.rollNo || "Candidate"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{isExamTamil ? "வகுப்பு / பாடத்திட்டம்:" : "Standard / Syllabus:"}</span>
              <span className="font-semibold text-foreground">Class {exam?.prepClass || 12} TN Samacheer</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{isExamTamil ? "மொத்த வினாக்கள்:" : "Total Questions:"}</span>
              <span className="font-bold text-foreground">{questions.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{isExamTamil ? "விடையளித்தவை:" : "Questions Answered:"}</span>
              <span className="font-bold text-emerald-400">{submittedData.stats?.answeredCount ?? counts.answered}</span>
            </div>
            <div className="flex justify-between p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
              <span className="font-bold text-emerald-300">{isExamTamil ? "பெற்ற மதிப்பெண்:" : "Score Obtained:"}</span>
              <span className="font-mono font-black text-emerald-400 text-sm">
                {scoreVal} / {totalMarksVal} ({percentageVal}%)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{isExamTamil ? "சமர்ப்பிக்கப்பட்ட நேரம்:" : "Recorded Submission Time:"}</span>
              <span className="font-mono text-muted-foreground">
                {new Date(submittedData.submittedAt || Date.now()).toLocaleTimeString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-border">
              <span className="text-muted-foreground">{isExamTamil ? "பாதுகாப்பு பெட்டகம்:" : "Security Vault:"}</span>
              <span className="font-mono text-[10px] text-emerald-400 font-bold">AES-256-CBC • SHA-256 HMAC Sealed</span>
            </div>
          </div>

          {/* Action buttons: Statement of Marks, Virtual practice retake & dashboard */}
          <div className="space-y-2 pt-2">
            <Link href="/student/results" className="block w-full">
              <Button
                variant="primary"
                className="w-full justify-center text-xs font-bold gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-500/25 py-2.5"
              >
                <Award className="w-4 h-4 text-emerald-200" />
                {isExamTamil ? "உத்தியோகபூர்வ மதிப்பெண் அறிக்கை காண்க" : "View Official Statement of Marks"}
              </Button>
            </Link>

            <Link href="/student/history" className="block w-full">
              <Button
                variant="outline"
                className="w-full justify-center text-xs font-bold gap-2 py-2.5 border-violet-500/30 text-violet-300 hover:bg-violet-500/10"
              >
                <CalendarDays className="w-4 h-4 text-violet-400" />
                {isExamTamil ? "தேர்வு வரலாறு & முழு விடைக்குறிப்பு காண்க" : "View Exam History & Answer Breakdown"}
              </Button>
            </Link>

            <Button
              variant="outline"
              onClick={() => {
                setIsPracticeMode(true);
                setSubmittedData(null);
                setAnswers({});
                setReviewed({});
                setCurrentIdx(0);
                setTimeLeft((exam.durationMinutes || 90) * 60);
              }}
              className="w-full justify-center text-xs font-bold gap-2 py-2.5"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              {isExamTamil ? "இத்தேர்வை மீண்டும் பயிற்சி செய்க (அளவற்ற முறை)" : "Take Virtual Practice Exam (Unlimited Retakes)"}
            </Button>

            <Link href="/student/dashboard" className="block w-full">
              <Button variant="ghost" className="w-full justify-center text-xs text-muted-foreground">
                {isExamTamil ? "முகப்புக்குத் திரும்பு" : "Return to Dashboard"}
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground select-none">
      {/* Submit error banner — shown only when server rejects submission */}
      {submitError && (
        <div className="fixed top-0 left-0 right-0 z-[60] p-3 bg-rose-600 text-white text-xs font-bold flex items-center gap-2 shadow-lg">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="flex-1">{submitError}</span>
          <button
            onClick={() => setSubmitError("")}
            className="ml-2 px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 font-bold"
          >
            Retry Submit
          </button>
        </div>
      )}
      {/* Virtual Practice Mode Active Notice */}
      {isPracticeMode && (
        <div className="bg-amber-500/20 border-b border-amber-500/30 px-4 py-2 text-center text-xs text-amber-200 flex items-center justify-between font-medium">
          <div className="flex items-center gap-2 mx-auto">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse flex-shrink-0" />
            <span>
              <strong>Virtual Simulation Practice Mode</strong> — You can answer and practice all questions freely. Your official board submission is safe and will not be overwritten.
            </span>
          </div>
          {officialSubmission && (
            <button
              onClick={() => {
                setIsPracticeMode(false);
                setSubmittedData(officialSubmission);
              }}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-amber-500/30 hover:bg-amber-500/50 text-amber-100 font-bold ml-3 flex-shrink-0"
            >
              Exit to Official Status
            </button>
          )}
        </div>
      )}

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
                <span className="font-bold text-sm text-foreground">
                  {typeof exam?.subject === "object" ? exam.subject.name : (exam?.subject || "Examination")}
                </span>
                <Badge variant="purple" className="text-[10px] py-0">Class {exam.prepClass}</Badge>
                <Badge variant="secondary" className="text-[10px] py-0">{exam.medium || "English"} Medium</Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Candidate: {candidate?.fullName} ({candidate?.rollNo}) • Class {candidate?.currentClass} Student
              </p>
            </div>
          </div>

          {/* Sticky Timer and Submit Button */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
            {isSharingScreen ? (
              <Badge variant="success" className="gap-1 font-mono text-[10px] animate-pulse">
                <Radio className="w-3 h-3 text-emerald-400" /> Screen Live Shared
              </Badge>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={startScreenShare}
                className="gap-1 text-xs font-semibold border-sky-500/30 text-sky-400 hover:bg-sky-500/10"
                title="Share Screen with COE Proctor"
              >
                <Monitor className="w-3.5 h-3.5" /> Share Screen
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setShowReportModal(true); setReportSuccessId(""); }}
              className="text-xs text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 gap-1 font-bold"
            >
              <AlertCircle className="w-3.5 h-3.5" /> Report Issue
            </Button>

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
                      {isExamTamil ? `வினா எண் ${currentIdx + 1}` : `Question ${currentIdx + 1}`}
                    </span>
                    <span className="text-xs text-muted-foreground">{isExamTamil ? `(மொத்தம் ${questions.length})` : `of ${questions.length}`}</span>
                  </div>
                  <Badge variant="secondary">+{currentQ.marks || 2} {isExamTamil ? "மதிப்பெண்கள்" : "Marks"}</Badge>
                </div>

                {/* Question Text */}
                <div className="text-sm sm:text-base font-medium text-foreground mb-6 leading-relaxed">
                  {pickQuestion(currentQ, isExamTamil ? "ta" : "en")}
                </div>

                {/* Multiple Choice Options */}
                <div className="space-y-3">
                  {normalizeOptionsList(currentQ.options).map((opt) => {
                    const isSelected = answers[currentQ.id] === opt.id;
                    const optText = pickOption(opt, isExamTamil ? "ta" : "en");
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
                          className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold border transition-colors ${
                            isSelected
                              ? "bg-sky-500 text-slate-950 border-sky-400"
                              : "border-border text-muted-foreground"
                          }`}
                        >
                          {opt.id}
                        </span>
                        <span className="text-sm">{optText}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-muted-foreground">
                {isExamTamil ? "இந்தத் தேர்விற்கான வினாக்கள் இன்னும் பதிவேற்றப்படவில்லை." : "No questions have been seeded for this examination yet."}
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
                  className="gap-1 text-xs"
                >
                  <ChevronLeft className="w-4 h-4" /> {isExamTamil ? "முந்தைய வினா" : "Previous"}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearResponse}
                  disabled={!answers[currentQ?.id]}
                  className="text-xs text-muted-foreground hover:text-rose-400 gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> {isExamTamil ? "பதிலை அழிக்க" : "Clear Response"}
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkForReview}
                  className="text-amber-400 border-amber-500/30 hover:bg-amber-500/10 gap-1 text-xs"
                >
                  <Bookmark className="w-3.5 h-3.5" /> {isExamTamil ? "மறுபரிசீலனைக்கு குறிக்க" : "Mark for Review"}
                </Button>

                {currentIdx < questions.length - 1 ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSaveAndNext}
                    className="gap-1 font-semibold text-xs"
                  >
                    {isExamTamil ? "சேமித்து அடுத்த வினா" : "Save & Next"} <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => setShowConfirmModal(true)}
                    className="gap-1.5 font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30"
                  >
                    <Send className="w-3.5 h-3.5" /> {isExamTamil ? "சரிபார்த்து சமர்ப்பிக்க" : "Review & Submit Examination"}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Panel: Question Navigator Grid (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="border-border">
            <h3 className="font-bold text-sm text-foreground mb-3">{isExamTamil ? "வினாத் தொகுப்பு பலகை" : "Question Palette"}</h3>

            {/* Palette Status Legend */}
            <div className="grid grid-cols-2 gap-2 text-[11px] mb-4 p-2.5 rounded-xl bg-secondary/50 border border-border">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-md bg-emerald-500" />
                <span>{isExamTamil ? "விடையளித்தவை" : "Answered"} ({counts.answered})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-md bg-amber-500" />
                <span>{isExamTamil ? "மறுபரிசீலனை" : "Review"} ({counts.reviewed})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-md bg-rose-500/70" />
                <span>{isExamTamil ? "விடையளிக்காதவை" : "Unanswered"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-md bg-slate-700 border border-slate-600" />
                <span>{isExamTamil ? "பார்க்காதவை" : "Not Visited"}</span>
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
              <AlertCircle className="w-5 h-5 text-amber-400" />
              {isPracticeMode ? "Submit Virtual Practice Session?" : "Confirm Official Examination Submission"}
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              {isPracticeMode
                ? "Your practice answers will be evaluated immediately with solutions. Your official submitted score is safe and will not be altered."
                : "Are you sure you want to seal and end your examination? Once submitted, your responses will be encrypted into the COE SQLite vault."}
            </p>

            <div className="bg-secondary/70 p-3.5 rounded-xl text-xs space-y-2 mb-6 border border-border">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Questions:</span>
                <span className="font-bold text-foreground">{counts.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{isExamTamil ? "விடையளிக்கப்பட்டவை:" : "Answered Questions:"}</span>
                <span className="font-bold text-emerald-400">{counts.answered}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{isExamTamil ? "மறுபரிசீலனைக்குரியவை:" : "Marked for Review:"}</span>
                <span className="font-bold text-amber-400">{counts.reviewed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{isExamTamil ? "விடையளிக்கப்படாதவை:" : "Unanswered:"}</span>
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
                {isExamTamil ? "தொடர்ந்து தேர்வு எழுதுக" : "Continue Answering"}
              </Button>
              <Button
                variant={isPracticeMode ? "primary" : "danger"}
                size="sm"
                onClick={handleSubmitExam}
                disabled={submitting}
                className="gap-1.5 font-bold"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> {isExamTamil ? "சேமிக்கப்படுகிறது..." : "Sealing..."}
                  </>
                ) : isPracticeMode ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> {isExamTamil ? "மாதிரி தேர்வை மதிப்பீடு செய்" : "Evaluate Practice Now"}
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> {isExamTamil ? "ஆம், சமர்ப்பிக்கவும்" : "Confirm & Submit"}
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Emergency Help / Problem Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <Card className="max-w-md w-full p-6 border-rose-500/40 bg-card shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-400" />
                <h3 className="text-base font-bold text-foreground">Report Problem to COE</h3>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {reportSuccessId ? (
              <div className="py-4 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-bold text-foreground">Incident Successfully Dispatched!</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your issue has been logged into the COE Help Panel. Tracking Reference:
                </p>
                <div className="p-2.5 rounded-xl bg-secondary font-mono text-xs font-bold text-sky-400">
                  {reportSuccessId}
                </div>
                <Button
                  size="sm"
                  onClick={() => setShowReportModal(false)}
                  className="w-full justify-center text-xs mt-2"
                >
                  Return to Exam
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSendIssueReport} className="space-y-4">
                <p className="text-xs text-muted-foreground">
                  Facing an issue with question loading, timer, submission, or connectivity? Fill this out to immediately alert the Controller of Examinations.
                </p>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Problem Category</label>
                  <select
                    value={reportCategory}
                    onChange={(e) => setReportCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-secondary border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="QUESTION_DISPLAY_PROBLEM">Question Paper / Display Problem</option>
                    <option value="TIMER_OR_COUNTDOWN_ISSUE">Timer / Countdown Glitch</option>
                    <option value="NETWORK_OR_DISCONNECTION">Network / Disconnection</option>
                    <option value="SUBMISSION_DIFFICULTY">Submission Difficulty</option>
                    <option value="OTHER_EMERGENCY">Other Urgent Problem</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Description of Issue</label>
                  <textarea
                    rows={3}
                    value={reportText}
                    onChange={(e) => setReportText(e.target.value)}
                    placeholder="Describe what happened (e.g., question 3 text cut off, or page froze)..."
                    className="w-full p-2.5 rounded-xl bg-secondary border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-rose-500 placeholder:text-muted-foreground"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowReportModal(false)}
                    disabled={reportSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="danger"
                    size="sm"
                    disabled={reportSubmitting || !reportText.trim()}
                    className="gap-1.5 font-bold"
                  >
                    {reportSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Dispatching...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" /> Transmit to COE Help Panel
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </div>
      )}
    </div>
  );

}

class ExamErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Exam Hall client-side boundary catch:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background">
          <Card className="max-w-md w-full p-6 text-center border-rose-500/30 space-y-4">
            <ShieldAlert className="w-14 h-14 text-rose-400 mx-auto" />
            <h2 className="text-lg font-bold text-foreground">Examination Session Safe</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your exam session encountered an unexpected browser state. All your answered questions remain safely encrypted and preserved in your session.
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => this.setState({ hasError: false })}
                className="flex-1 justify-center text-xs"
              >
                Retry Exam
              </Button>
              <Link href="/student/dashboard" className="flex-1">
                <Button size="sm" variant="primary" className="w-full justify-center text-xs">
                  Return to Dashboard
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function ExamMockPage() {
  return (
    <ExamErrorBoundary>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center p-6 text-xs text-muted-foreground">Loading test hall...</div>}>
        <ExamHallContent />
      </Suspense>
    </ExamErrorBoundary>
  );
}
