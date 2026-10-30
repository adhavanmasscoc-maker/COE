"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  Sparkles,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Award,
  BookOpen,
  Calendar,
  AlertCircle,
  Loader2,
  Send,
} from "lucide-react";
import { getLocalizedQuestion, getLocalizedOption } from "@/lib/questionTranslations";
import { pick, pickQuestion, pickOption, pickExplanation } from "@/lib/config/engine.config";

export default function PracticeExamPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isTamil: globalIsTamil } = useLanguage();

  const previewRollNo = searchParams.get("previewRollNo");
  const is10thCandidate = previewRollNo && (previewRollNo === "9105" || /^(?:TN2026-09|TN2026-10|91)/.test(previewRollNo));
  const fallbackSubject = is10thCandidate ? "ENG-10" : "CHE-12";
  const rawSubject = (params?.subject || fallbackSubject).toUpperCase();
  const rawSet = (params?.set || "set-a").toLowerCase();

  // Step state: "WELCOME" | "PRACTICE" | "RESULT"
  const [step, setStep] = useState("WELCOME");
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [candidate, setCandidate] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);

  // User responses
  const [answers, setAnswers] = useState({});
  const [reviewed, setReviewed] = useState({});
  const [showExplanation, setShowExplanation] = useState(false);

  // Timing
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [questionTimeMap, setQuestionTimeMap] = useState({});
  const timerRef = useRef(null);

  // Results & DB Attempt
  const [resultData, setResultData] = useState(null);
  const [savingAttempt, setSavingAttempt] = useState(false);
  const [resultFilter, setResultFilter] = useState("INCORRECT"); // "INCORRECT" | "UNATTEMPTED" | "CORRECT" | "ALL"

  // Text to Speech
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [speechSpeed, setSpeechSpeed] = useState(1.0);
  const [tamilVoiceSupported, setTamilVoiceSupported] = useState(true);

  const isTamil = globalIsTamil || candidate?.medium === "Tamil";

  // Map nice names
  const subjectDisplay = rawSubject.includes("CHE")
    ? { code: "CHE-12", name: isTamil ? "வேதியியல் (வகுப்பு 12)" : "Chemistry (Class 12)" }
    : rawSubject.includes("PHY")
    ? { code: "PHY-12", name: isTamil ? "இயற்பியல் (வகுப்பு 12)" : "Physics (Class 12)" }
    : rawSubject === "ENG-10" || (rawSubject.includes("ENG") && rawSubject.includes("10"))
    ? { code: "ENG-10", name: isTamil ? "ஆங்கிலம் (வகுப்பு 10)" : "English (Class 10)" }
    : rawSubject.includes("ENG")
    ? { code: "ENG-12", name: isTamil ? "ஆங்கிலம் (வகுப்பு 12)" : "English (Class 12)" }
    : rawSubject.includes("CSC")
    ? { code: "CSC-12", name: isTamil ? "கணினி அறிவியல் (வகுப்பு 12)" : "Computer Science (Class 12)" }
    : { code: rawSubject, name: rawSubject };

  const setDisplayName = rawSet.includes("b") || rawSet.includes("2")
    ? isTamil ? "பயிற்சித் தொகுதி B (பாகம் 3 & 4 — 50 வினாக்கள்)" : "Practice Set B (Part 3 & 4 — 50 Questions)"
    : isTamil ? "பயிற்சித் தொகுதி A (பாகம் 1 & 2 — 50 வினாக்கள்)" : "Practice Set A (Part 1 & 2 — 50 Questions)";

  // Load questions from API
  useEffect(() => {
    async function fetchQuestions() {
      setLoading(true);
      try {
        const setQuery = rawSet.includes("b") || rawSet.includes("2") ? "2" : "1";
        const countQuery = (rawSubject.includes("CHE") || rawSubject.includes("ENG") || rawSubject.includes("PHY")) ? "50" : "25";
        const url = `/api/student/practice?code=${rawSubject}&set=${setQuery}&count=${countQuery}${
          previewRollNo ? `&previewRollNo=${encodeURIComponent(previewRollNo)}` : ""
        }`;
        const res = await fetch(url);
        const data = await res.json();

        if (res.ok && data.questions) {
          setQuestions(data.questions);
        }

        // Fetch candidate profile info
        const meRes = await fetch(previewRollNo ? `/api/auth/me?previewRollNo=${previewRollNo}` : "/api/auth/me");
        if (meRes.ok) {
          const meData = await meRes.json();
          if (meData.studentProfile) setCandidate(meData.studentProfile);
        }
      } catch (e) {
        console.error("Error loading practice questions:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
  }, [rawSubject, rawSet, previewRollNo]);

  // Timer effect during PRACTICE
  useEffect(() => {
    if (step === "PRACTICE") {
      timerRef.current = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
        setQuestionTimeMap((prev) => {
          const qId = questions[currentIdx]?.id || currentIdx;
          return { ...prev, [qId]: (prev[qId] || 0) + 1 };
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step, currentIdx, questions]);

  // Telemetry heartbeat for active practice test-takers monitoring on COE admin panel
  useEffect(() => {
    if (step !== "PRACTICE") return;

    const pingPracticeTelemetry = async () => {
      try {
        const roll = candidate?.user?.username || candidate?.rollNo || previewRollNo;
        if (!roll) return;
        await fetch("/api/student/activity", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rollNo: roll,
            studentName: candidate?.fullName || "Practice Candidate",
            action: "PRACTICE_ACTIVE",
            details: JSON.stringify({
              subjectCode: subjectDisplay.code,
              subjectName: subjectDisplay.name,
              setName: setDisplayName,
              answeredCount: Object.keys(answers).length,
              totalQuestions: questions.length,
              currentQuestion: currentIdx + 1,
              secondsElapsed,
            }),
            durationSeconds: secondsElapsed,
          }),
        });
      } catch {
        // silent telemetry
      }
    };

    pingPracticeTelemetry();
    const interval = setInterval(pingPracticeTelemetry, 15000);
    return () => clearInterval(interval);
  }, [step, candidate, answers, questions.length, currentIdx, secondsElapsed, subjectDisplay, setDisplayName, previewRollNo]);

  // SpeechSynthesis handler
  const handleToggleAudio = (textToRead) => {
    if (!("speechSynthesis" in window)) {
      alert(isTamil ? "உங்கள் உலாவியில் குரல் வசதி இல்லை." : "Speech synthesis not supported in this browser.");
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = speechSpeed;

    const voices = window.speechSynthesis.getVoices();
    if (isTamil) {
      const taVoice = voices.find((v) => v.lang.startsWith("ta") || v.name.toLowerCase().includes("tamil"));
      if (taVoice) {
        utterance.voice = taVoice;
        utterance.lang = "ta-IN";
        setTamilVoiceSupported(true);
      } else {
        setTamilVoiceSupported(false);
        // Do not speak English audio when Tamil voice is missing
        return;
      }
    } else {
      const enVoice = voices.find((v) => v.lang.startsWith("en-IN") || v.lang.startsWith("en"));
      if (enVoice) utterance.voice = enVoice;
    }

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleSelectOption = (optId) => {
    const q = questions[currentIdx];
    if (!q) return;
    setAnswers((prev) => ({ ...prev, [q.id]: optId }));
  };

  const handleNext = () => {
    if (isPlayingAudio) {
      window.speechSynthesis?.cancel();
      setIsPlayingAudio(false);
    }
    setShowExplanation(false);
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      handleSubmitPractice();
    }
  };

  const handlePrev = () => {
    if (isPlayingAudio) {
      window.speechSynthesis?.cancel();
      setIsPlayingAudio(false);
    }
    setShowExplanation(false);
    if (currentIdx > 0) setCurrentIdx(currentIdx - 1);
  };

  const handleSubmitPractice = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (isPlayingAudio) {
      window.speechSynthesis?.cancel();
      setIsPlayingAudio(false);
    }

    let calculatedScore = 0;
    const totalMarks = questions.length;
    let incorrectCount = 0;
    let unattemptedCount = 0;
    let correctCount = 0;

    const breakdown = questions.map((q, idx) => {
      const chosen = answers[q.id];
      const isCorrect = Boolean(chosen && chosen.toUpperCase() === q.correctAnswer?.toUpperCase());
      if (isCorrect) {
        calculatedScore += 1;
        correctCount += 1;
      } else if (chosen) {
        incorrectCount += 1;
      } else {
        unattemptedCount += 1;
      }

      return {
        ...q,
        index: idx + 1,
        chosen,
        isCorrect,
      };
    });

    const percentage = totalMarks > 0 ? Math.round((calculatedScore / totalMarks) * 100) : 0;

    const summary = {
      score: calculatedScore,
      totalMarks,
      percentage,
      timeSpent: secondsElapsed,
      breakdown,
      answeredCount: Object.keys(answers).length,
      incorrectCount,
      unattemptedCount,
      correctCount,
    };

    setResultData(summary);
    // User requirement: automatically show wrong answered questions directly without scrolling
    setResultFilter(incorrectCount > 0 ? "INCORRECT" : unattemptedCount > 0 ? "UNATTEMPTED" : "ALL");
    setStep("RESULT");

    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "instant" });
    }

    // Save attempt to DB
    setSavingAttempt(true);
    try {
      await fetch("/api/student/practice/attempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectCode: rawSubject,
          setName: rawSet,
          medium: isTamil ? "Tamil" : "English",
          totalTimeSpent: secondsElapsed,
          timePerQuestion: questionTimeMap,
          answers,
          questionsWithAnswers: breakdown,
          score: calculatedScore,
          totalMarks,
          previewRollNo,
        }),
      });

      // Also log student activity telemetry for COE admin audit and monitoring
      const roll = candidate?.user?.username || candidate?.rollNo || previewRollNo;
      if (roll) {
        fetch("/api/student/activity", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rollNo: roll,
            studentName: candidate?.fullName || "Practice Candidate",
            action: "SUBMIT",
            details: JSON.stringify({
              type: "PRACTICE_EXAM",
              subjectCode: subjectDisplay.code,
              setName: setDisplayName,
              score: calculatedScore,
              totalMarks,
              percentage,
            }),
            durationSeconds: secondsElapsed,
          }),
        }).catch(() => {});
      }
    } catch (e) {
      console.warn("Could not save practice attempt to DB:", e);
    } finally {
      setSavingAttempt(false);
    }
  };

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
        <p className="text-xs text-[#a8a8d0] font-mono">
          {isTamil ? "பயிற்சி வினாத்தாள் தயார் செய்யப்படுகிறது..." : "Preparing interactive self-study practice..."}
        </p>
      </div>
    );
  }

  // 1. WELCOME STEP
  if (step === "WELCOME") {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4 space-y-6 animate-float-up">
        <div className="flex items-center justify-between">
          <Link
            href="/student/dashboard"
            className="flex items-center gap-1.5 text-xs text-[#a8a8d0] hover:text-[#f0f0ff] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> {isTamil ? "முகப்புக்குத் திரும்பு" : "Back to Dashboard"}
          </Link>
          <Badge variant="purple" className="font-mono text-[11px] py-1">
            {isTamil ? "சுய பயிற்சி கூடம்" : "Self-Study Assessment"}
          </Badge>
        </div>

        <Card className="p-8 text-center border-violet-500/30 space-y-5 bg-card shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center mx-auto text-white shadow-lg shadow-violet-500/30">
            <Sparkles className="w-8 h-8" />
          </div>

          <div>
            <h1 className="text-2xl font-black text-[#f0f0ff] tracking-tight">
              {isTamil ? `வணக்கம், ${candidate?.fullName || "மாணவரே"}!` : `Welcome, ${candidate?.fullName || "Student"}!`}
            </h1>
            <p className="text-xs text-[#a8a8d0] mt-1">
              {isTamil
                ? "இத்தேர்வு உங்கள் கற்றல் திறனை மேம்படுத்துவதற்கான பிரத்யேக சுயபயிற்சி முறையாகும்."
                : "Interactive curriculum practice with step-by-step verified explanations and multi-lingual voice audio."}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-secondary/50 border border-border text-left">
            <div>
              <span className="text-[10px] text-muted-foreground block">{isTamil ? "பாடம்" : "Subject"}</span>
              <span className="font-bold text-xs text-foreground">{subjectDisplay.name}</span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground block">{isTamil ? "தொகுதி" : "Set"}</span>
              <span className="font-bold text-xs text-violet-300">{rawSet.toUpperCase()}</span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground block">{isTamil ? "மொத்த வினாக்கள்" : "Questions"}</span>
              <span className="font-bold text-xs text-emerald-400">{questions.length} Qs</span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground block">{isTamil ? "மதிப்பீடு முறை" : "Evaluation"}</span>
              <span className="font-bold text-xs text-amber-300">{isTamil ? "உடனடி முடிவு" : "Instant"}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-violet-500/10 border border-violet-500/25 text-left text-xs text-[#a8a8d0] space-y-1">
            <p className="font-semibold text-violet-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-violet-400" />
              {isTamil ? "பயிற்சியின் சிறப்பு அம்சங்கள்:" : "Practice Hall Highlights:"}
            </p>
            <ul className="list-disc list-inside text-[11px] space-y-0.5 text-muted-foreground">
              <li>{isTamil ? "ஒவ்வொரு வினாவிற்கும் விரிவான விளக்க உரை மற்றும் குரல் விளக்கம்." : "Step-by-step reasoning & audio voice assistant for every question."}</li>
              <li>{isTamil ? "நீங்கள் எத்தனை முறை வேண்டுமானாலும் மீண்டும் மீண்டும் பயிற்சி செய்யலாம்." : "Unlimited re-attempts with automated attempt history tracking."}</li>
              <li>{isTamil ? "அரசு உத்தியோகபூர்வ தேர்வு மதிப்பெண்களை இது பாதிக்காது." : "Does not affect your official board exam records."}</li>
            </ul>
          </div>

          <Button
            size="lg"
            variant="primary"
            onClick={() => setStep("PRACTICE")}
            className="w-full justify-center gap-2 font-black text-sm bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 py-3 shadow-lg shadow-violet-500/25"
          >
            <Play className="w-4 h-4 fill-current" />
            {isTamil ? "சுயபயிற்சியைத் தொடங்குக" : "Start Practice Assessment"}
          </Button>
        </Card>
      </div>
    );
  }

  // 2. PRACTICE STEP
  const currentQ = questions[currentIdx];
  const qText = pickQuestion(currentQ, isTamil ? "ta" : "en");
  const rawExplanation = pickExplanation(currentQ, isTamil ? "ta" : "en");

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-5 animate-float-up">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl glass border border-border">
        <div className="flex items-center gap-2">
          <Link
            href="/student/dashboard"
            className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground"
            title="Leave"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <span className="font-bold text-xs text-foreground block">{subjectDisplay.name}</span>
            <span className="text-[10px] text-muted-foreground font-mono">{setDisplayName}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/25 font-mono text-xs font-bold text-amber-300">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTimer(secondsElapsed)}</span>
          </div>

          <Button
            size="sm"
            variant="danger"
            onClick={handleSubmitPractice}
            className="text-xs font-bold gap-1 py-1 px-3"
          >
            <Send className="w-3 h-3" />
            {isTamil ? "முடிக்க" : "Finish"}
          </Button>
        </div>
      </div>

      {/* Progress & Navigator */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
          <span>
            {isTamil ? `வினா ${currentIdx + 1} / ${questions.length}` : `Question ${currentIdx + 1} of ${questions.length}`}
          </span>
          <span>
            {Math.round(((currentIdx + 1) / questions.length) * 100)}%
          </span>
        </div>
        <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-300"
            style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Navigator Touch Grid (>=44px touch targets) */}
      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 rounded-xl bg-secondary/40 border border-border">
        {questions.map((q, idx) => {
          const isSelected = answers[q.id] !== undefined;
          const isCurrent = idx === currentIdx;

          return (
            <button
              key={q.id || idx}
              onClick={() => {
                if (isPlayingAudio) {
                  window.speechSynthesis?.cancel();
                  setIsPlayingAudio(false);
                }
                setShowExplanation(false);
                setCurrentIdx(idx);
              }}
              className={`min-w-[44px] min-h-[44px] rounded-lg text-xs font-bold transition-all flex items-center justify-center border ${
                isCurrent
                  ? "bg-violet-600 text-white border-violet-400 ring-2 ring-violet-500/40"
                  : isSelected
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                  : "bg-card hover:bg-secondary/80 text-muted-foreground border-border"
              }`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Question Card */}
      {currentQ && (
        <Card className="p-6 border-border space-y-6">
          <div className="flex items-start justify-between gap-4 border-b border-border pb-3">
            <div>
              <span className="text-[10px] font-mono text-muted-foreground block">
                {currentQ.topic ? `${currentQ.topic}` : `Unit ${currentQ.unit || 1}`}
              </span>
              <span className="text-sm font-bold text-foreground">
                {isTamil ? `வினா எண் ${currentIdx + 1}` : `Question ${currentIdx + 1}`}
              </span>
            </div>
            <Badge variant="purple" className="text-[10px]">
              +1 {isTamil ? "மதிப்பெண்" : "Mark"}
            </Badge>
          </div>

          {/* Question Text */}
          <p className="text-sm sm:text-base font-medium text-foreground leading-relaxed">
            {qText}
          </p>

          {/* Options (Touch targets >= 44px) */}
          <div className="space-y-3">
            {(currentQ.options || []).map((opt) => {
              const optId = opt.id?.toUpperCase();
              const isChosen = answers[currentQ.id] === optId;
              const optText = pickOption(opt, isTamil ? "ta" : "en");

              return (
                <button
                  key={optId}
                  onClick={() => handleSelectOption(optId)}
                  className={`w-full min-h-[48px] p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all ${
                    isChosen
                      ? "bg-violet-600/15 border-violet-500 text-foreground font-semibold shadow-sm"
                      : "bg-card hover:bg-secondary/60 text-muted-foreground hover:text-foreground border-border"
                  }`}
                >
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold border transition-colors ${
                      isChosen
                        ? "bg-violet-600 text-white border-violet-400"
                        : "border-border text-muted-foreground bg-secondary/50"
                    }`}
                  >
                    {optId}
                  </span>
                  <span className="text-sm flex-1">{optText}</span>
                </button>
              );
            })}
          </div>

          {/* Learning Phase / Explanation & Audio toggle */}
          <div className="pt-2 border-t border-border flex items-center justify-between flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowExplanation(!showExplanation)}
              className="text-xs font-bold gap-1.5 border-violet-500/30 text-violet-300 hover:bg-violet-500/10"
            >
              <HelpCircle className="w-3.5 h-3.5 text-violet-400" />
              {showExplanation
                ? isTamil ? "விளக்கத்தை மறைக்க" : "Hide Explanation"
                : isTamil ? "விடை & கற்றல் குறிப்பு காண்க" : "View Explanation & Key"}
            </Button>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={handlePrev}
                disabled={currentIdx === 0}
                className="text-xs gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> {isTamil ? "முந்தைய" : "Previous"}
              </Button>
              <Button
                size="sm"
                variant="primary"
                onClick={handleNext}
                className="text-xs gap-1 font-bold bg-violet-600 hover:bg-violet-500"
              >
                {currentIdx === questions.length - 1
                  ? isTamil ? "சமர்ப்பிக்க" : "Submit Test"
                  : isTamil ? "அடுத்த வினா" : "Next Question"}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Expanded Explanation Box */}
          {showExplanation && (
            <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/25 space-y-3 animate-float-up text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-violet-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  {isTamil ? `சரியான விடை: விருப்பம் ${currentQ.correctAnswer}` : `Official Key: Option ${currentQ.correctAnswer}`}
                </span>

                {/* Voice Audio Controls */}
                <div className="flex items-center gap-2">
                  <select
                    value={speechSpeed}
                    onChange={(e) => setSpeechSpeed(parseFloat(e.target.value))}
                    className="bg-card border border-border text-[10px] rounded px-1.5 py-0.5 text-muted-foreground"
                  >
                    <option value="0.8">0.8x</option>
                    <option value="1.0">1.0x</option>
                    <option value="1.2">1.2x</option>
                  </select>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleAudio(rawExplanation)}
                    className="text-[11px] font-bold gap-1 py-1 px-2.5 border-violet-500/30 text-violet-300"
                  >
                    {isPlayingAudio ? (
                      <>
                        <Pause className="w-3 h-3 text-amber-400" /> {isTamil ? "நிறுத்து" : "Stop Voice"}
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3 h-3 text-emerald-400" /> {isTamil ? "குரல் விளக்கம்" : "Listen Explanation"}
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {!tamilVoiceSupported && isTamil && (
                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-300 text-[11px]">
                  உங்கள் உலாவியில் தமிழ் குரல் ஆதரவு இல்லை. தயவுசெய்து கீழே உள்ள உரை விளக்கத்தைப் படிக்கவும்.
                </div>
              )}

              <p className="text-muted-foreground leading-relaxed">
                {rawExplanation}
              </p>
            </div>
          )}
        </Card>
      )}

      {/* 3. RESULT VIEW */}
      {step === "RESULT" && resultData && (
        <Card className="p-8 border-emerald-500/30 text-center space-y-6 bg-card shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <Badge variant="success" className="mb-2">
              {isTamil ? "சுயபயிற்சி மதிப்பீடு நிறைவடைந்தது" : "Practice Assessment Complete"}
            </Badge>
            <h2 className="text-2xl font-black text-foreground">
              {isTamil ? "உங்கள் செயல்திறன் அறிக்கை" : "Your Performance Statement"}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              {isTamil
                ? "இந்த பயிற்சி முடிவுகள் உங்கள் சுய மதிப்பீட்டிற்காக பதிவு செய்யப்பட்டுள்ளது."
                : "Practice session metrics recorded in your profile. Unlimited retakes available."}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-secondary/50 border border-border text-left">
            <div>
              <span className="text-[10px] text-muted-foreground block">{isTamil ? "பெற்ற மதிப்பெண்" : "Score"}</span>
              <span className="text-lg font-black text-amber-400">
                {resultData.score} / {resultData.totalMarks}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground block">{isTamil ? "சதவீதம்" : "Percentage"}</span>
              <span className="text-lg font-black text-emerald-400">{resultData.percentage}%</span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground block">{isTamil ? "விடையளித்தவை" : "Attempted"}</span>
              <span className="text-lg font-black text-foreground">
                {resultData.answeredCount} / {resultData.totalMarks}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground block">{isTamil ? "நேரம்" : "Time Spent"}</span>
              <span className="text-lg font-black text-violet-300 font-mono">
                {formatTimer(resultData.timeSpent)}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setAnswers({});
                setReviewed({});
                setCurrentIdx(0);
                setSecondsElapsed(0);
                setResultData(null);
                setStep("PRACTICE");
              }}
              className="flex-1 justify-center gap-2 font-bold py-2.5"
            >
              <RotateCcw className="w-4 h-4 text-amber-300" />
              {isTamil ? "மீண்டும் பயிற்சி செய்க (Retake)" : "Retake This Practice Test"}
            </Button>

            <Link href="/student/dashboard" className="flex-1">
              <Button
                variant="primary"
                className="w-full justify-center gap-2 font-bold py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600"
              >
                {isTamil ? "முகப்புக்குத் திரும்பு" : "Return to Dashboard"}
              </Button>
            </Link>
          </div>

          {/* User Requested: Immediate Mistakes / Wrong Answers Section - NO SCROLL NEEDED */}
          <div className="text-left space-y-4 pt-4 border-t border-border">
            {resultData.incorrectCount > 0 ? (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 animate-in fade-in-50">
                <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-rose-200 text-sm">
                    {isTamil
                      ? `தவறாக விடையளிக்கப்பட்ட வினாக்கள் (${resultData.incorrectCount}) — உடனடியாக கீழே சரிபார்க்கவும்`
                      : `Wrongly Answered Questions (${resultData.incorrectCount}) — Review Directly Without Scrolling`}
                  </h4>
                  <p className="text-xs text-rose-300/80 leading-relaxed">
                    {isTamil
                      ? "நீங்கள் தவறாக தேர்வு செய்த விடைகள் மற்றும் அதற்கான சரியான அரசு தேர்வு விடைக் குறிப்புகள் கீழே நேரடியாக காட்டப்பட்டுள்ளன."
                      : "Your mistakes are automatically highlighted below with official answer keys, step-by-step reasoning, and multi-lingual voice audio."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 animate-in fade-in-50">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-emerald-200 text-sm">
                    {isTamil ? "அற்புதம்! அனைத்து வினாக்களுக்கும் சரியான விடை!" : "Outstanding! 100% Accuracy — Zero Mistakes!"}
                  </h4>
                  <p className="text-xs text-emerald-300/80">
                    {isTamil ? "நீங்கள் அனைத்து வினாக்களுக்கும் சரியான விடையளித்துள்ளீர்கள்." : "You got every question right on this practice assessment."}
                  </p>
                </div>
              </div>
            )}

            {/* Filter Tabs: Defaults to Incorrect so student sees wrong questions immediately */}
            <div className="flex items-center gap-2 flex-wrap pb-2 border-b border-border">
              <button
                type="button"
                onClick={() => setResultFilter("INCORRECT")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  resultFilter === "INCORRECT"
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm"
                    : "bg-secondary/40 text-muted-foreground hover:text-foreground border border-transparent"
                }`}
              >
                <XCircle className="w-3.5 h-3.5 text-rose-400" />
                {isTamil ? `தவறான விடைகள் (${resultData.incorrectCount || 0})` : `Wrong Answers (${resultData.incorrectCount || 0})`}
              </button>

              <button
                type="button"
                onClick={() => setResultFilter("UNATTEMPTED")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  resultFilter === "UNATTEMPTED"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                    : "bg-secondary/40 text-muted-foreground hover:text-foreground border border-transparent"
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                {isTamil ? `விடையளிக்காதவை (${resultData.unattemptedCount || 0})` : `Skipped (${resultData.unattemptedCount || 0})`}
              </button>

              <button
                type="button"
                onClick={() => setResultFilter("CORRECT")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  resultFilter === "CORRECT"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                    : "bg-secondary/40 text-muted-foreground hover:text-foreground border border-transparent"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                {isTamil ? `சரியான விடைகள் (${resultData.correctCount || 0})` : `Correct (${resultData.correctCount || 0})`}
              </button>

              <button
                type="button"
                onClick={() => setResultFilter("ALL")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  resultFilter === "ALL"
                    ? "bg-violet-500/20 text-violet-300 border border-violet-500/40 shadow-sm"
                    : "bg-secondary/40 text-muted-foreground hover:text-foreground border border-transparent"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-violet-400" />
                {isTamil ? `அனைத்து வினாக்கள் (${resultData.totalMarks})` : `All (${resultData.totalMarks})`}
              </button>
            </div>

            {/* Questions List */}
            <div className="space-y-3 pt-1">
              {(resultData.breakdown || [])
                .filter((item) => {
                  if (resultFilter === "INCORRECT") return item.chosen && !item.isCorrect;
                  if (resultFilter === "UNATTEMPTED") return !item.chosen;
                  if (resultFilter === "CORRECT") return item.isCorrect;
                  return true; // "ALL"
                })
                .length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-secondary/30 border border-border space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                  <p className="text-sm font-bold text-foreground">
                    {resultFilter === "INCORRECT"
                      ? isTamil ? "அற்புதம்! தவறான விடைகள் ஏதுமில்லை!" : "Brilliant! No incorrect answers in this practice test!"
                      : isTamil ? "இப்பிரிவில் வினாக்கள் இல்லை" : "No questions in this filter category"}
                  </p>
                </div>
              ) : (
                (resultData.breakdown || [])
                  .filter((item) => {
                    if (resultFilter === "INCORRECT") return item.chosen && !item.isCorrect;
                    if (resultFilter === "UNATTEMPTED") return !item.chosen;
                    if (resultFilter === "CORRECT") return item.isCorrect;
                    return true;
                  })
                  .map((item) => {
                    const itemQText = pickQuestion(item, isTamil ? "ta" : "en");
                    const itemExplanation = pickExplanation(item, isTamil ? "ta" : "en");

                    let chosenOptText = "";
                    let correctOptText = "";
                    if (Array.isArray(item.options)) {
                      const cOpt = item.options.find(o => String(o.id || "").toUpperCase() === String(item.chosen || "").toUpperCase());
                      if (cOpt) chosenOptText = pickOption(cOpt, isTamil ? "ta" : "en");
                      const kOpt = item.options.find(o => String(o.id || "").toUpperCase() === String(item.correctAnswer || "").toUpperCase());
                      if (kOpt) correctOptText = pickOption(kOpt, isTamil ? "ta" : "en");
                    } else if (item.options && typeof item.options === "object") {
                      const cVal = item.options[item.chosen?.toLowerCase()] || item.options[item.chosen?.toUpperCase()];
                      if (cVal) chosenOptText = typeof cVal === "string" ? cVal : pickOption(cVal, isTamil ? "ta" : "en");
                      const kVal = item.options[item.correctAnswer?.toLowerCase()] || item.options[item.correctAnswer?.toUpperCase()];
                      if (kVal) correctOptText = typeof kVal === "string" ? kVal : pickOption(kVal, isTamil ? "ta" : "en");
                    }

                    return (
                      <div
                        key={item.id}
                        className={`p-4 rounded-xl border text-xs space-y-3 transition-all ${
                          item.isCorrect
                            ? "bg-emerald-500/5 border-emerald-500/25"
                            : item.chosen
                            ? "bg-rose-500/10 border-rose-500/40 shadow-sm shadow-rose-950/20"
                            : "bg-amber-500/5 border-amber-500/25"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <span className="font-bold text-foreground text-sm leading-relaxed flex-1">
                            <span className="font-mono text-violet-400 mr-1.5">Q{item.index}.</span>
                            {itemQText}
                          </span>
                          <span
                            className={`font-mono font-bold text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 ${
                              item.isCorrect
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : item.chosen
                                ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                                : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            }`}
                          >
                            {item.isCorrect ? "+1 Correct" : item.chosen ? "0 Incorrect" : "Unattempted"}
                          </span>
                        </div>

                        {/* Side by side comparison: What student selected vs Official answer */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                          <div className={`p-2.5 rounded-xl border ${
                            item.isCorrect
                              ? "bg-emerald-500/10 border-emerald-500/30"
                              : item.chosen
                              ? "bg-rose-500/15 border-rose-500/40"
                              : "bg-secondary/40 border-border"
                          }`}>
                            <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider mb-0.5">
                              {isTamil ? "உங்கள் விடை (Your Choice):" : "Your Answer:"}
                            </span>
                            <span className={item.isCorrect ? "font-bold text-emerald-400 flex items-center gap-1" : item.chosen ? "font-bold text-rose-300 flex items-center gap-1" : "text-muted-foreground italic font-mono"}>
                              {item.chosen ? (
                                <>
                                  {item.isCorrect ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5 text-rose-400" />}
                                  Option {item.chosen} {chosenOptText ? `— ${chosenOptText}` : ""}
                                </>
                              ) : (
                                isTamil ? "விடையளிக்கப்படவில்லை" : "Unattempted / Skipped"
                              )}
                            </span>
                          </div>

                          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                            <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider mb-0.5">
                              {isTamil ? "அரசு உத்தியோகபூர்வ விடைக்குறிப்பு:" : "Official Correct Key:"}
                            </span>
                            <span className="font-bold text-emerald-300 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              Option {item.correctAnswer} {correctOptText ? `— ${correctOptText}` : ""}
                            </span>
                          </div>
                        </div>

                        {/* Explanation Rationale with Voice Audio */}
                        {itemExplanation && (
                          <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/25 text-xs text-muted-foreground space-y-1.5">
                            <div className="flex items-center justify-between">
                              <strong className="text-violet-300 font-bold flex items-center gap-1">
                                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                {isTamil ? "படிமுறை தீர்வு & விளக்கம் (Rationale):" : "Step-by-Step Explanation:"}
                              </strong>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleToggleAudio(itemExplanation)}
                                className="text-[10px] py-0.5 px-2 border-violet-500/30 text-violet-300 gap-1 font-semibold"
                              >
                                {isPlayingAudio ? <Pause className="w-3 h-3 text-amber-400" /> : <Volume2 className="w-3 h-3 text-emerald-400" />}
                                {isTamil ? "கேளுங்கள்" : "Listen"}
                              </Button>
                            </div>
                            <p className="leading-relaxed text-foreground/90 font-medium">
                              {itemExplanation}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

