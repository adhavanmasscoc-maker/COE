"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import {
  BookOpen,
  ArrowLeft,
  CheckCircle2,
  Circle,
  TrendingUp,
  FileText,
  Loader2,
  AlertCircle,
  Sparkles,
  Layers,
  Zap,
  Check,
  X,
  RotateCcw,
  HelpCircle,
  Award,
  ChevronRight,
  ChevronLeft,
  Search,
  Filter,
  Eye,
  EyeOff,
  Globe,
  CalendarDays,
  GraduationCap
} from "lucide-react";

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
      if (typeof item === "string") {
        return { id: String.fromCharCode(65 + idx), text: item, textEn: item, textTa: "" };
      }
      if (item && typeof item === "object") {
        return {
          id: String(item.id || item.key || String.fromCharCode(65 + idx)).toUpperCase(),
          text: String(item.text !== undefined ? item.text : item.label !== undefined ? item.label : item.value !== undefined ? item.value : ""),
          textEn: item.textEn || item.text || "",
          textTa: item.textTa || "",
        };
      }
      return { id: String.fromCharCode(65 + idx), text: String(item || ""), textEn: String(item || ""), textTa: "" };
    });
  }
  if (parsed && typeof parsed === "object") {
    return Object.keys(parsed).map((k) => {
      const val = parsed[k];
      return {
        id: k.toUpperCase(),
        text: typeof val === "object" && val !== null ? String(val.text || val.label || "") : String(val !== undefined && val !== null ? val : ""),
        textEn: typeof val === "object" && val !== null ? val.textEn || val.text : String(val || ""),
        textTa: typeof val === "object" && val !== null ? val.textTa || "" : "",
      };
    });
  }
  return [];
}

function SyllabusExplorerContent() {
  const searchParams = useSearchParams();
  const initialSubjectCode = searchParams.get("code") || searchParams.get("subjectCode");
  const initialTab = searchParams.get("tab") || "syllabus";
  const previewRoll = searchParams.get("previewRollNo") || null;

  // Determine initial standard: Class 10 if roll matches or explicit, else check subject code
  const is10thSubject = initialSubjectCode && initialSubjectCode.endsWith("-10");
  const is10thRoll = previewRoll && (/^(?:TN2026-09|TN2026-10|91)/.test(previewRoll) || !/1[12]\d{2}/.test(previewRoll));
  const initialPrepClass = searchParams.get("prepClass")
    ? parseInt(searchParams.get("prepClass"), 10)
    : (is10thSubject || is10thRoll) ? 10 : 12;

  const [mainTab, setMainTab] = useState(
    initialTab === "qbank" || initialTab === "practice" ? initialTab : "syllabus"
  );
  const [subjects, setSubjects] = useState([]);
  const [selectedSubId, setSelectedSubId] = useState(null);
  const [prepClass, setPrepClass] = useState(initialPrepClass);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [togglingId, setTogglingId] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  // Question Bank States (100 Questions Pool)
  const [qbankQuestions, setQbankQuestions] = useState([]);
  const [qbankUnits, setQbankUnits] = useState([]);
  const [qbankStats, setQbankStats] = useState(null);
  const [qbankLoading, setQbankLoading] = useState(false);
  const [qbankSet, setQbankSet] = useState("all"); // "all" | "1" | "2"
  const [qbankUnit, setQbankUnit] = useState("all");
  const [qbankLang, setQbankLang] = useState("bilingual"); // "bilingual" | "en" | "ta"
  const [qbankSearch, setQbankSearch] = useState("");
  const [revealedAnswers, setRevealedAnswers] = useState({});

  // Practice Engine States
  const [practiceSubjectId, setPracticeSubjectId] = useState(null);
  const [practiceCount, setPracticeCount] = useState(
    parseInt(searchParams.get("count"), 10) || 25
  );
  const [practiceUnit, setPracticeUnit] = useState("all");
  const [practiceSet, setPracticeSet] = useState("all");
  const [practiceLang, setPracticeLang] = useState("bilingual");
  const [practiceState, setPracticeState] = useState("idle"); // idle | loading | running | evaluated
  const [practiceQuestions, setPracticeQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [practiceResults, setPracticeResults] = useState(null);

  // Attended Practice History & Q&A Inspection State
  const [practiceHistory, setPracticeHistory] = useState([]);
  const [practiceHistoryStats, setPracticeHistoryStats] = useState({
    totalAttempts: 0,
    averagePercentage: 0,
    highestPercentage: 0,
  });
  const [historyLoading, setHistoryLoading] = useState(false);
  const [expandedAttemptId, setExpandedAttemptId] = useState(null);

  const fetchPracticeHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch("/api/student/practice/attempt");
      const data = await res.json();
      if (res.ok && data.success) {
        setPracticeHistory(data.attempts || []);
        setPracticeHistoryStats({
          totalAttempts: data.totalAttempts || 0,
          averagePercentage: data.averagePercentage || 0,
          highestPercentage: data.highestPercentage || 0,
        });
      }
    } catch {
      console.warn("Could not load practice history");
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchSyllabus = async (targetStandard = prepClass) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      params.set("prepClass", String(targetStandard));
      if (previewRoll) params.set("previewRollNo", previewRoll);

      const res = await fetch(`/api/syllabus?${params.toString()}`);
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Failed to load syllabus records.");
      } else {
        const subs = json.subjects || [];
        setSubjects(subs);
        setPrepClass(json.prepClass || targetStandard);

        if (subs.length > 0) {
          let chosen = null;
          if (initialSubjectCode) {
            chosen = subs.find((s) => s.code === initialSubjectCode);
          }
          if (!chosen) {
            // Strict Standard Default:
            // Class 10 strictly defaults to ENG-10 (or first 10th subject), NEVER Chemistry 12!
            // Class 12 strictly defaults to ENG-12 or CHE-12
            chosen = targetStandard === 10
              ? (subs.find((s) => s.code === "ENG-10") || subs[0])
              : (subs.find((s) => s.code === "ENG-12" || s.code === "CHE-12") || subs[0]);
          }
          setSelectedSubId(chosen.id);
          setPracticeSubjectId(chosen.id);
        }
      }
    } catch {
      setError("Network error fetching syllabus data from SQLite.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectStandard = (std) => {
    setPrepClass(std);
    fetchSyllabus(std);
  };

  useEffect(() => {
    fetchSyllabus(prepClass);
    fetchPracticeHistory();
  }, []);

  const currentSubject = subjects.find((s) => s.id === selectedSubId) || subjects[0];
  const activePracticeSubject = subjects.find((s) => s.id === practiceSubjectId) || currentSubject;

  // Fetch Question Bank
  const fetchQBank = async (unitVal = qbankUnit, setVal = qbankSet, searchVal = qbankSearch) => {
    setQbankLoading(true);
    try {
      const defaultCode = prepClass === 10 ? "ENG-10" : "CHE-12";
      const code = currentSubject?.code || defaultCode;
      const params = new URLSearchParams();
      params.set("code", code);
      params.set("prepClass", String(prepClass));
      if (previewRoll) params.set("previewRollNo", previewRoll);
      if (unitVal !== "all") params.set("unit", unitVal);
      if (setVal !== "all") params.set("set", setVal);
      if (searchVal) params.set("search", searchVal);

      const res = await fetch(`/api/student/question-bank?${params.toString()}`);
      const json = await res.json();
      if (res.ok && json.success) {
        setQbankQuestions(json.questions || []);
        setQbankUnits(json.units || []);
        setQbankStats(json.stats || null);
      }
    } catch {
      console.warn("Failed to load question bank");
    } finally {
      setQbankLoading(false);
    }
  };

  useEffect(() => {
    if (mainTab === "qbank") {
      fetchQBank();
    }
  }, [mainTab, selectedSubId, qbankUnit, qbankSet, prepClass]);

  const toggleReveal = (qId) => {
    setRevealedAnswers((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  const handleToggleChapter = async (chapterId, currentStatus) => {
    setTogglingId(chapterId);
    const newStatus = !currentStatus;

    try {
      const res = await fetch("/api/syllabus/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapterId, isCompleted: newStatus }),
      });

      if (res.ok) {
        setSubjects((prevSubs) =>
          prevSubs.map((sub) => {
            let hasChapter = false;
            let subCompleted = 0;
            let subTotal = 0;

            const updatedUnits = sub.units.map((unit) => {
              const updatedChapters = unit.chapters.map((ch) => {
                subTotal += 1;
                if (ch.id === chapterId) {
                  hasChapter = true;
                  if (newStatus) subCompleted += 1;
                  return { ...ch, isCompleted: newStatus };
                }
                if (ch.isCompleted) subCompleted += 1;
                return ch;
              });
              return { ...unit, chapters: updatedChapters };
            });

            if (hasChapter) {
              const pct = subTotal > 0 ? Math.round((subCompleted / subTotal) * 100) : 0;
              return {
                ...sub,
                units: updatedUnits,
                completedChapters: subCompleted,
                totalChapters: subTotal,
                progressPercent: pct,
              };
            }
            return sub;
          })
        );
        setToastMessage(newStatus ? "Topic marked completed!" : "Topic marked pending.");
        setTimeout(() => setToastMessage(""), 2500);
      }
    } catch {
      setToastMessage("Failed to update progress.");
    } finally {
      setTogglingId(null);
    }
  };

  // ── Practice Engine Handlers ──
  const startPracticeTest = async (overrideCount, overrideUnit, overrideSet) => {
    if (!practiceSubjectId && !currentSubject?.id) return;
    setPracticeState("loading");
    setSelectedAnswers({});
    setCurrentQIndex(0);
    setPracticeResults(null);

    const countToUse = overrideCount || practiceCount;
    const unitToUse = overrideUnit !== undefined ? overrideUnit : practiceUnit;
    const setToUse = overrideSet !== undefined ? overrideSet : practiceSet;

    try {
      const targetId = practiceSubjectId || currentSubject.id;
      const targetCode = activePracticeSubject?.code || currentSubject?.code || (prepClass === 10 ? "ENG-10" : "CHE-12");
      const params = new URLSearchParams();
      params.set("subjectId", targetId);
      params.set("code", targetCode);
      params.set("prepClass", String(prepClass));
      if (previewRoll) params.set("previewRollNo", previewRoll);
      params.set("count", String(countToUse));
      if (unitToUse !== "all") params.set("unit", String(unitToUse));
      if (setToUse !== "all") params.set("set", String(setToUse));

      const res = await fetch(`/api/student/practice?${params.toString()}`);
      const data = await res.json();
      if (!res.ok || !data.questions || data.questions.length === 0) {
        throw new Error(data.error || "No practice questions available for this subject yet.");
      }

      setPracticeQuestions(data.questions);
      setPracticeState("running");
    } catch (err) {
      alert(`Practice Mode Error: ${err.message}`);
      setPracticeState("idle");
    }
  };

  const handleSelectOption = (questionId, optionId) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const submitPracticeTest = () => {
    let score = 0;
    let maxMarks = 0;

    const breakdown = practiceQuestions.map((q) => {
      const studentAns = selectedAnswers[q.id];
      const isCorrect = studentAns === q.correctAnswer;
      const qMarks = q.marks || 1;
      maxMarks += qMarks;
      if (isCorrect) score += qMarks;

      return {
        ...q,
        studentAnswer: studentAns || null,
        isCorrect,
      };
    });

    const percentage = maxMarks > 0 ? Math.round((score / maxMarks) * 100) : 0;

    setPracticeResults({
      score,
      maxMarks,
      percentage,
      breakdown,
      subjectName: activePracticeSubject?.name || "Subject",
    });

    setPracticeState("evaluated");

    // Persist practice attempt into database with full questions and answers breakdown
    try {
      fetch("/api/student/practice/attempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectCode: activePracticeSubject?.code || (prepClass === 10 ? "ENG-10" : "CHE-12"),
          setName: `Unit ${practiceUnit === "all" ? "Curriculum" : practiceUnit} (${practiceCount} Qs)`,
          medium: "Bilingual",
          totalTimeSpent: 0,
          answers: selectedAnswers,
          questionsWithAnswers: breakdown,
          score,
          totalMarks: maxMarks,
        }),
      }).then(() => {
        fetchPracticeHistory();
      }).catch((e) => console.warn("Could not persist practice attempt:", e));
    } catch (e) {
      console.warn("Could not persist practice attempt:", e);
    }
  };

  return (
    <div className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
      {/* Top Banner Navigation */}
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
              <h1 className="text-xl sm:text-2xl font-black text-foreground">Syllabus & Practice Bank</h1>
              <Badge variant="purple">Class {prepClass} Curriculum</Badge>
              <Badge variant="success">Bilingual Tamil & English</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              100 Objective Questions across 15 Units · Full Answer Keys · Step-by-Step Worked Rationale
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/student/history${previewRoll ? `?previewRollNo=${encodeURIComponent(previewRoll)}` : ""}`}>
            <Button size="sm" variant="outline" className="gap-1.5 text-xs">
              <CalendarDays className="w-4 h-4 text-violet-400" /> Exam History
            </Button>
          </Link>
          <button
            onClick={() => {
              setMainTab("practice");
              setPracticeCount(25);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-600/30 transition-all"
          >
            <Zap className="w-4 h-4 text-amber-300" /> Start Practice
          </button>
        </div>
      </div>

      {/* ── Separate Standard Windows (Strict Class 10 & 12 Isolation) ── */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-secondary/80 to-secondary/40 border border-border flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-amber-400" />
            Standard Window:
          </span>
          <div className="flex items-center gap-1.5 bg-card/80 p-1 rounded-xl border border-border">
            <button
              type="button"
              onClick={() => handleSelectStandard(10)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                prepClass === 10
                  ? "bg-sky-500 text-slate-950 font-black shadow-md shadow-sky-500/25"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
              }`}
            >
              Class 10 (SSLC Examination)
            </button>
            <button
              type="button"
              onClick={() => handleSelectStandard(12)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                prepClass === 12
                  ? "bg-purple-600 text-white font-black shadow-md shadow-purple-600/25"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
              }`}
            >
              Class 12 (HSE Higher Secondary)
            </button>
          </div>
        </div>

        <div className="text-[11px] text-muted-foreground font-mono flex items-center gap-2">
          <span>Active Curriculum:</span>
          <span className={`px-2.5 py-0.5 rounded-md font-bold text-xs ${
            prepClass === 10
              ? "bg-sky-500/20 text-sky-300 border border-sky-500/30"
              : "bg-purple-500/20 text-purple-300 border border-purple-500/30"
          }`}>
            Class {prepClass} ({subjects.length} Subjects Active)
          </span>
        </div>
      </div>

      {/* Floating Status Notification */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in-50">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-border pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setMainTab("syllabus")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            mainTab === "syllabus"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Syllabus Units & Topics</span>
        </button>

        <button
          onClick={() => setMainTab("qbank")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            mainTab === "qbank"
              ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          }`}
        >
          <BookOpen className="w-4 h-4 text-amber-300" />
          <span>Question Bank (50+50 Qs)</span>
          <span className="badge badge-amber text-[9px]">100 Questions</span>
        </button>

        <button
          onClick={() => setMainTab("practice")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            mainTab === "practice"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          }`}
        >
          <Zap className="w-4 h-4 text-amber-300" />
          <span>Practice Test Engine</span>
          <span className="badge badge-emerald text-[9px]">Instant Results</span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: SYLLABUS TOPICS & UNITS
      ───────────────────────────────────────────────────────────── */}
      {mainTab === "syllabus" && (
        <div className="space-y-6">
          {/* Subject Horizontal Switcher Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {subjects.map((sub) => {
              const isSelected = sub.id === currentSubject?.id;
              return (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => {
                    setSelectedSubId(sub.id);
                    setPracticeSubjectId(sub.id);
                  }}
                  className={`flex-shrink-0 flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  <span>{sub.name}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${
                      isSelected ? "bg-slate-950/20 text-white" : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {sub.progressPercent}%
                  </span>
                </button>
              );
            })}
          </div>

          {/* Current Subject Overview Card */}
          {currentSubject && (
            <Card className="p-6 border-border space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-foreground">{currentSubject.name}</h2>
                    <span className="badge badge-cyan">{currentSubject.code}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {currentSubject.medium || "Bilingual"} Medium · Class {currentSubject.prepClass} Curriculum
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setMainTab("qbank");
                    }}
                    className="gap-1.5 text-xs text-violet-300 border-violet-500/30"
                  >
                    <BookOpen className="w-3.5 h-3.5" /> Study 100 Questions
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => {
                      setMainTab("practice");
                      setPracticeCount(25);
                      startPracticeTest(25);
                    }}
                    className="gap-1.5 text-xs"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-300" /> Practice 25 Qs
                  </Button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-semibold">Curriculum Syllabus Mastery</span>
                  <span className="font-bold text-primary font-mono">{currentSubject.progressPercent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-600 to-emerald-500 transition-all duration-300"
                    style={{ width: `${currentSubject.progressPercent}%` }}
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Units and Chapters List */}
          {currentSubject?.units?.length > 0 ? (
            <div className="space-y-4">
              {currentSubject.units.map((unit) => (
                <Card key={unit.id} className="p-5 border-border space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400 font-bold font-mono text-xs flex items-center justify-center">
                        {unit.unitNumber}
                      </span>
                      <h3 className="font-bold text-sm text-foreground">{unit.title}</h3>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setMainTab("practice");
                        setPracticeUnit(unit.unitNumber);
                        startPracticeTest(10, unit.unitNumber);
                      }}
                      className="text-xs text-violet-400 hover:bg-violet-500/10 gap-1"
                    >
                      <Zap className="w-3.5 h-3.5" /> Practice Unit
                    </Button>
                  </div>

                  {unit.chapters?.length > 0 && (
                    <div className="divide-y divide-border/60 pt-1">
                      {unit.chapters.map((ch) => (
                        <div
                          key={ch.id}
                          className="py-2.5 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleToggleChapter(ch.id, ch.isCompleted)}
                              disabled={togglingId === ch.id}
                              className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {togglingId === ch.id ? (
                                <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
                              ) : ch.isCompleted ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <Circle className="w-4 h-4 text-muted-foreground" />
                              )}
                            </button>
                            <span
                              className={
                                ch.isCompleted ? "text-muted-foreground line-through" : "text-foreground font-medium"
                              }
                            >
                              {ch.title}
                            </span>
                          </div>
                          {ch.description && (
                            <span className="text-[11px] text-muted-foreground hidden sm:inline">
                              {ch.description}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center border-border">
              <p className="text-xs text-muted-foreground">No units found for this subject.</p>
            </Card>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: QUESTION BANK (100 QUESTIONS · 50+50 CURATED BILINGUAL)
      ───────────────────────────────────────────────────────────── */}
      {mainTab === "qbank" && (
        <div className="space-y-6 animate-in fade-in-50">
          {/* Header Card */}
          <Card className="p-6 border-violet-500/30 bg-gradient-to-br from-card via-violet-950/20 to-card space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-foreground">
                    Class {prepClass} {currentSubject?.name || "Subject"} Question Bank
                  </h2>
                  <Badge variant="warning">{qbankStats?.totalQuestions || 100} Questions Pool</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  100 Authentic Objective Questions for Tamil Nadu {prepClass === 10 ? "SSLC Board" : "HSE Higher Secondary"} with Answer Keys &amp; Rationale
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => {
                    setMainTab("practice");
                    setPracticeCount(25);
                    startPracticeTest(25);
                  }}
                  className="gap-1.5 text-xs shadow-lg shadow-violet-600/30"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Launch {currentSubject?.name} Practice Test
                </Button>
              </div>
            </div>

            {/* Subject Selector Buttons in Question Bank Tab */}
            <div className="pt-2 border-t border-border flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-[11px] font-bold text-muted-foreground flex-shrink-0">Subject:</span>
              {subjects.map((sub) => {
                const isSelected = sub.id === currentSubject?.id;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => {
                      setSelectedSubId(sub.id);
                      setPracticeSubjectId(sub.id);
                    }}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      isSelected
                        ? "bg-violet-600 text-white border-violet-500 shadow-sm"
                        : "bg-secondary/60 border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {sub.name} ({sub.code})
                  </button>
                );
              })}
            </div>

            {/* Quick Stat Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-card border border-border">
                <span className="text-[10px] text-muted-foreground block uppercase font-bold">Total Bank</span>
                <span className="text-lg font-black text-violet-400">100 Questions</span>
              </div>
              <div className="p-3 rounded-xl bg-card border border-border">
                <span className="text-[10px] text-muted-foreground block uppercase font-bold">Set 1 (Midterm Part 1)</span>
                <span className="text-lg font-black text-cyan-400">50 Questions</span>
              </div>
              <div className="p-3 rounded-xl bg-card border border-border">
                <span className="text-[10px] text-muted-foreground block uppercase font-bold">Set 2 (Midterm Part 2)</span>
                <span className="text-lg font-black text-emerald-400">50 Questions</span>
              </div>
              <div className="p-3 rounded-xl bg-card border border-border">
                <span className="text-[10px] text-muted-foreground block uppercase font-bold">Curriculum Units</span>
                <span className="text-lg font-black text-amber-400">15 Units</span>
              </div>
            </div>
          </Card>

          {/* Filter Bar */}
          <div className="p-4 rounded-xl bg-card border border-border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Set Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              {[
                { key: "all", label: "All 100 Questions" },
                { key: "1", label: "Set 1 (Qs 1–50)" },
                { key: "2", label: "Set 2 (Qs 51–100)" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setQbankSet(key);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    qbankSet === key
                      ? "bg-violet-600 text-white shadow-sm font-bold"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Language & Unit Pickers */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Unit Dropdown */}
              <select
                value={qbankUnit}
                onChange={(e) => setQbankUnit(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-secondary border border-border text-foreground text-xs font-semibold"
              >
                <option value="all">All 15 Units</option>
                {Array.from({ length: 15 }, (_, i) => i + 1).map((u) => (
                  <option key={u} value={u}>
                    Unit {u}
                  </option>
                ))}
              </select>

              {/* Language Switcher */}
              <div className="flex items-center gap-1 p-1 rounded-lg bg-secondary border border-border text-xs">
                <button
                  type="button"
                  onClick={() => setQbankLang("bilingual")}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    qbankLang === "bilingual" ? "bg-violet-600 text-white" : "text-muted-foreground"
                  }`}
                >
                  Bilingual
                </button>
                <button
                  type="button"
                  onClick={() => setQbankLang("en")}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    qbankLang === "en" ? "bg-violet-600 text-white" : "text-muted-foreground"
                  }`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setQbankLang("ta")}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    qbankLang === "ta" ? "bg-violet-600 text-white" : "text-muted-foreground"
                  }`}
                >
                  தமிழ்
                </button>
              </div>

              {/* Search */}
              <div className="relative min-w-[180px]">
                <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={qbankSearch}
                  onChange={(e) => {
                    setQbankSearch(e.target.value);
                    fetchQBank(qbankUnit, qbankSet, e.target.value);
                  }}
                  className="w-full pl-8 pr-2.5 py-1.5 rounded-lg bg-secondary border border-border text-foreground text-xs placeholder:text-muted-foreground/60"
                />
              </div>
            </div>
          </div>

          {/* Questions Stream */}
          {qbankLoading ? (
            <div className="py-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-violet-400 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Loading curriculum question bank...</p>
            </div>
          ) : qbankQuestions.length === 0 ? (
            <Card className="p-8 text-center border-border">
              <p className="text-xs text-muted-foreground">No questions found matching your filter criteria.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="text-xs text-muted-foreground font-semibold flex items-center justify-between">
                <span>Displaying {qbankQuestions.length} Questions</span>
                <span className="text-violet-400 font-mono">Tamil Nadu Higher Secondary Board</span>
              </div>

              {qbankQuestions.map((q) => {
                const isRevealed = Boolean(revealedAnswers[q.id]);

                return (
                  <Card
                    key={q.id}
                    className="p-5 sm:p-6 border-border hover:border-violet-500/30 transition-all space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-[10px] font-bold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20">
                            Unit {q.unit}
                          </span>
                          <span className="text-xs font-bold text-muted-foreground">{q.topic}</span>
                          <Badge variant="secondary">1 Mark</Badge>
                        </div>

                        {/* Question Text */}
                        <div className="pt-1 space-y-1">
                          {(qbankLang === "en" || qbankLang === "bilingual") && (
                            <h3 className="font-bold text-sm sm:text-base text-foreground leading-relaxed">
                              <span className="text-violet-400 font-mono mr-1.5">Q{q.globalNumber}.</span>
                              {q.questionEn}
                            </h3>
                          )}
                          {(qbankLang === "ta" || (qbankLang === "bilingual" && q.questionTa)) && (
                            <p className="font-semibold text-xs sm:text-sm text-cyan-300 leading-relaxed font-sans">
                              {q.questionTa}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Launch practice for this unit */}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setMainTab("practice");
                          setPracticeUnit(q.unit);
                          startPracticeTest(10, q.unit);
                        }}
                        className="text-[11px] text-violet-400 hover:bg-violet-500/10 gap-1 flex-shrink-0"
                        title="Practice questions from this unit"
                      >
                        <Zap className="w-3.5 h-3.5" /> Practice Unit
                      </Button>
                    </div>

                    {/* Options (A, B, C, D) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-xs">
                      {["a", "b", "c", "d"].map((optKey) => {
                        const optEn = q.optionsEn ? q.optionsEn[optKey] : "";
                        const optTa = q.optionsTa ? q.optionsTa[optKey] : "";
                        const isCorrectKey = q.correctOption?.toLowerCase() === optKey;

                        return (
                          <div
                            key={optKey}
                            className={`p-3 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                              isRevealed && isCorrectKey
                                ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-bold"
                                : "bg-card border-border text-foreground hover:bg-secondary/40"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs uppercase ${
                                  isRevealed && isCorrectKey
                                    ? "bg-emerald-500 text-slate-950 font-black"
                                    : "bg-secondary text-muted-foreground"
                                }`}
                              >
                                {optKey}
                              </span>
                              <div>
                                {(qbankLang === "en" || qbankLang === "bilingual") && (
                                  <span>{optEn}</span>
                                )}
                                {(qbankLang === "ta" || (qbankLang === "bilingual" && optTa)) && (
                                  <span className="text-muted-foreground text-[11px] block font-sans">
                                    {optTa}
                                  </span>
                                )}
                              </div>
                            </div>

                            {isRevealed && isCorrectKey && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Toggle Reveal Answer Key */}
                    <div className="pt-2 border-t border-border flex items-center justify-between">
                      <Button
                        size="sm"
                        variant={isRevealed ? "primary" : "outline"}
                        onClick={() => toggleReveal(q.id)}
                        className="gap-1.5 text-xs"
                      >
                        {isRevealed ? (
                          <>
                            <EyeOff className="w-3.5 h-3.5" /> Hide Answer & Rationale
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5" /> Reveal Official Key & Explanation
                          </>
                        )}
                      </Button>

                      {isRevealed && (
                        <span className="text-xs font-bold font-mono text-emerald-400">
                          Official Answer: Option {q.correctOption} ({q.answerEn})
                        </span>
                      )}
                    </div>

                    {/* Explanation Box */}
                    {isRevealed && (
                      <div className="p-3.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-xs space-y-1.5 animate-in fade-in-50">
                        <strong className="text-violet-300 block font-bold uppercase text-[10px] tracking-wider">
                          Official Step-by-Step Rationale
                        </strong>
                        <p className="text-foreground leading-relaxed">{q.explanationEn}</p>
                        {q.explanationTa && (
                          <p className="text-cyan-300 leading-relaxed font-sans text-[11px]">
                            {q.explanationTa}
                          </p>
                        )}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 3: INTERACTIVE PRACTICE ASSESSMENT ENGINE
      ───────────────────────────────────────────────────────────── */}
      {mainTab === "practice" && (
        <div className="space-y-6 animate-in fade-in-50">
          {/* Practice Idle / Setup Screen */}
          {practiceState === "idle" && (
            <Card className="p-6 sm:p-8 border-violet-500/30 bg-gradient-to-br from-card via-secondary/20 to-violet-950/20">
              <div className="max-w-2xl mx-auto text-center space-y-6">
                <div className="w-16 h-16 rounded-3xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center mx-auto text-violet-300 shadow-lg shadow-violet-500/20">
                  <Zap className="w-8 h-8 text-amber-400 animate-pulse" />
                </div>

                <div>
                  <h2 className="text-2xl font-black text-foreground">
                    Self-Study Practice Assessment Engine
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                    Take untimed or timed curriculum practice quizzes. Receive <strong>instant evaluation</strong>, detailed step-by-step worked proofs, and score feedback right here.
                  </p>
                  <p className="text-[11px] text-amber-300 font-medium mt-1">
                    * Practice tests permit unlimited retakes and do NOT overwrite official board exam ledger marks.
                  </p>
                </div>

                {/* Setup Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-xl mx-auto p-4 rounded-2xl glass-sm border border-border">
                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1.5">
                      Subject
                    </label>
                    <select
                      value={practiceSubjectId || ""}
                      onChange={(e) => setPracticeSubjectId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground text-xs font-semibold"
                    >
                      {subjects.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name} ({sub.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1.5">
                      Practice Size
                    </label>
                    <select
                      value={practiceCount}
                      onChange={(e) => setPracticeCount(parseInt(e.target.value, 10))}
                      className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground text-xs font-semibold"
                    >
                      <option value={5}>5 Questions (Rapid Checkup)</option>
                      <option value={10}>10 Questions (Standard Quiz)</option>
                      <option value={15}>15 Questions (Intensive Review)</option>
                      <option value={25}>25 Questions (Official Exam Part 1/2)</option>
                      <option value={50}>50 Questions (Full Paper Set)</option>
                      <option value={100}>100 Questions (Grand Question Bank)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1.5">
                      Scope / Unit
                    </label>
                    <select
                      value={practiceUnit}
                      onChange={(e) => setPracticeUnit(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground text-xs font-semibold"
                    >
                      <option value="all">Whole Syllabus</option>
                      {Array.from({ length: 15 }, (_, i) => i + 1).map((u) => (
                        <option key={u} value={u}>
                          Unit {u}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <Button
                  size="lg"
                  variant="primary"
                  onClick={() => startPracticeTest()}
                  className="gap-2 text-sm shadow-xl shadow-violet-600/30"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  Launch Practice Assessment Now
                </Button>
              </div>
            </Card>
          )}

          {/* Attended Practice Tests & Analytics History (Persistent in Database) */}
          {practiceState === "idle" && (
            <div className="space-y-6 pt-4">
              {/* Metric Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="p-5 border-violet-500/20 bg-card/60 backdrop-blur-sm flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                      Practice Tests Attended
                    </span>
                    <span className="text-2xl font-black text-foreground mt-0.5 block">
                      {practiceHistoryStats.totalAttempts} Sessions
                    </span>
                    <span className="text-[11px] text-violet-400 mt-1 block">
                      Unlimited Self-Study Attempts
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-400">
                    <Layers className="w-6 h-6" />
                  </div>
                </Card>

                <Card className="p-5 border-emerald-500/20 bg-card/60 backdrop-blur-sm flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                      Average Practice Score
                    </span>
                    <span className="text-2xl font-black text-emerald-400 mt-0.5 block">
                      {practiceHistoryStats.averagePercentage}%
                    </span>
                    <span className="text-[11px] text-emerald-300 mt-1 block">
                      Across All Attempted Quizzes
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </Card>

                <Card className="p-5 border-amber-500/20 bg-card/60 backdrop-blur-sm flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                      Highest Mastery Score
                    </span>
                    <span className="text-2xl font-black text-amber-400 mt-0.5 block">
                      {practiceHistoryStats.highestPercentage}%
                    </span>
                    <span className="text-[11px] text-amber-300 mt-1 block">
                      Personal Best Record
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Award className="w-6 h-6" />
                  </div>
                </Card>
              </div>

              {/* History Table & Q&A Inspector */}
              <Card className="p-6 border-border space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-4 border-b border-border">
                  <div>
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-violet-400" />
                      Attended Practice Assessments & Detailed Question-Answer Archive
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Review all past practice attempts. Click &ldquo;Inspect Questions & Answers&rdquo; to view each question, your chosen option, and official solutions.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={fetchPracticeHistory}
                    disabled={historyLoading}
                    className="text-xs text-violet-400 hover:text-violet-300 gap-1"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${historyLoading ? "animate-spin" : ""}`} />
                    Refresh Log
                  </Button>
                </div>

                {practiceHistory.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-xs space-y-2">
                    <Zap className="w-8 h-8 mx-auto text-muted-foreground/40" />
                    <p>No practice assessments attended yet.</p>
                    <p className="text-[11px] text-muted-foreground/70">
                      Launch your first practice assessment above to build your question review archive!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {practiceHistory.map((att) => {
                      const isExpanded = expandedAttemptId === att.id;
                      const hasQnA = Array.isArray(att.questionsWithAnswers) && att.questionsWithAnswers.length > 0;

                      return (
                        <div
                          key={att.id}
                          className="rounded-xl border border-border bg-secondary/30 overflow-hidden transition-all"
                        >
                          {/* Row Header */}
                          <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <span className="w-9 h-9 rounded-xl bg-violet-500/15 text-violet-300 border border-violet-500/30 flex items-center justify-center font-mono font-bold text-xs">
                                #{att.attemptNumber}
                              </span>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-sm text-foreground">
                                    {att.subjectCode}
                                  </span>
                                  <span className="badge badge-purple text-[10px]">
                                    {att.setName}
                                  </span>
                                  <span className="badge badge-secondary text-[10px]">
                                    {att.medium}
                                  </span>
                                </div>
                                <span className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
                                  <span>{new Date(att.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span>
                                  <span>•</span>
                                  <span>{new Date(att.createdAt).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true })}</span>
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                              <div className="text-right">
                                <span className="font-mono font-black text-sm text-emerald-400 block">
                                  {att.score} / {att.totalMarks}
                                </span>
                                <span className="text-[10px] font-bold text-muted-foreground">
                                  {att.percentage}% Score
                                </span>
                              </div>

                              <Button
                                size="sm"
                                variant={isExpanded ? "secondary" : "outline"}
                                onClick={() => setExpandedAttemptId(isExpanded ? null : att.id)}
                                className="text-xs font-semibold gap-1.5 border-violet-500/30 text-violet-300 hover:bg-violet-500/15"
                              >
                                {isExpanded ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                {isExpanded ? "Hide Review" : "Inspect Q&A"}
                              </Button>
                            </div>
                          </div>

                          {/* Expanded Questions & Answers Review */}
                          {isExpanded && (
                            <div className="p-4 border-t border-border bg-card/70 space-y-3">
                              <div className="flex items-center justify-between text-xs text-muted-foreground pb-2 border-b border-border">
                                <span className="font-bold text-foreground">
                                  Question-by-Question Detailed Response Sheet ({hasQnA ? att.questionsWithAnswers.length : Object.keys(att.answers || {}).length} Items)
                                </span>
                                <span className="text-[11px] font-mono">Instant Self-Assessment Record</span>
                              </div>

                              {hasQnA ? (
                                <div className="space-y-3 pt-2">
                                  {att.questionsWithAnswers.map((q, qIdx) => {
                                    const studentChoice = q.chosen || q.studentAnswer || att.answers?.[q.id];
                                    const isCorrect = q.isCorrect !== undefined
                                      ? q.isCorrect
                                      : Boolean(studentChoice && String(studentChoice).toUpperCase() === String(q.correctAnswer || q.correct_option || "").toUpperCase());

                                    return (
                                      <div
                                        key={q.id || qIdx}
                                        className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                                          isCorrect
                                            ? "border-emerald-500/30 bg-emerald-500/5"
                                            : "border-rose-500/30 bg-rose-500/5"
                                        }`}
                                      >
                                        <div className="flex items-start justify-between gap-2">
                                          <div>
                                            <span className="font-bold text-foreground">
                                              Q{qIdx + 1}. {q.questionText || q.question_en || q.question}
                                            </span>
                                            {(q.questionTextTa || q.question_ta) && (
                                              <p className="text-cyan-300 font-sans mt-0.5 text-[11px]">
                                                {q.questionTextTa || q.question_ta}
                                              </p>
                                            )}
                                          </div>
                                          <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                                            isCorrect
                                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                              : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                                          }`}>
                                            {isCorrect ? "Correct" : "Incorrect / Unattempted"}
                                          </span>
                                        </div>

                                        <div className="flex flex-wrap gap-4 text-[11px] pt-1 border-t border-border/50">
                                          <div>
                                            <span className="text-muted-foreground">Your Selected Option: </span>
                                            <strong className={isCorrect ? "text-emerald-400" : "text-rose-400"}>
                                              {studentChoice ? `Option ${String(studentChoice).toUpperCase()}` : "Not Answered"}
                                            </strong>
                                          </div>
                                          <div>
                                            <span className="text-muted-foreground">Official Answer Key: </span>
                                            <strong className="text-emerald-400">
                                              Option {String(q.correctAnswer || q.correct_option || "").toUpperCase()}
                                            </strong>
                                          </div>
                                        </div>

                                        {(q.explanation || q.answer_en || q.answer_ta) && (
                                          <div className="p-2.5 rounded-lg bg-secondary/70 border border-border text-[11px] text-muted-foreground space-y-1">
                                            <strong className="text-violet-300 block">Explanation / Solution:</strong>
                                            <p>{q.explanation || q.answer_en || q.answer_ta}</p>
                                            {q.answer_ta && q.answer_en && (
                                              <p className="text-cyan-400 font-sans">{q.answer_ta}</p>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <div className="p-4 text-center text-xs text-muted-foreground">
                                  <span>Responses logged: {JSON.stringify(att.answers || {})}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* Practice Loading */}
          {practiceState === "loading" && (
            <Card className="p-12 text-center border-border">
              <Loader2 className="w-8 h-8 animate-spin text-violet-400 mx-auto mb-3" />
              <h3 className="font-bold text-sm text-foreground">Preparing Practice Assessment</h3>
              <p className="text-xs text-muted-foreground mt-1">Retrieving official curriculum questions from question bank...</p>
            </Card>
          )}

          {/* Practice Running (Interactive Quiz) */}
          {practiceState === "running" && practiceQuestions.length > 0 && (
            <div className="space-y-6">
              {/* Question Navigation Bar */}
              <Card className="p-4 border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="badge badge-violet text-xs">
                    Question {currentQIndex + 1} of {practiceQuestions.length}
                  </span>
                  <span className="text-xs font-bold text-foreground">
                    {activePracticeSubject?.name} Practice
                  </span>
                  {practiceQuestions[currentQIndex]?.unit && (
                    <Badge variant="secondary">Unit {practiceQuestions[currentQIndex].unit}</Badge>
                  )}
                </div>

                {/* Mini Question Pills */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {practiceQuestions.map((q, idx) => {
                    const answered = Boolean(selectedAnswers[q.id]);
                    const isCurrent = idx === currentQIndex;
                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => setCurrentQIndex(idx)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                          isCurrent
                            ? "bg-violet-600 text-white ring-2 ring-violet-400"
                            : answered
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                            : "bg-secondary text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </Card>

              {/* Current Question Card */}
              {(() => {
                const q = practiceQuestions[currentQIndex];
                const selectedOpt = selectedAnswers[q.id];

                return (
                  <Card className="p-6 sm:p-8 border-violet-500/30 space-y-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-violet-400 uppercase tracking-wide">
                            Question {q.questionNumber || currentQIndex + 1} • {q.marks || 1} Mark
                          </span>
                          {q.topic && <span className="text-xs text-muted-foreground">· {q.topic}</span>}
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-foreground mt-1 leading-relaxed">
                          {q.questionText}
                        </h3>
                        {q.questionTextTa && (
                          <p className="text-sm font-semibold text-cyan-300 mt-1 font-sans">
                            {q.questionTextTa}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Options */}
                    <div className="space-y-2.5">
                      {normalizeOptionsList(q.options).map((opt) => {
                        const isChosen = selectedOpt === opt.id;
                        return (
                          <div
                            key={opt.id}
                            onClick={() => handleSelectOption(q.id, opt.id)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                              isChosen
                                ? "bg-violet-600/20 border-violet-400 text-foreground shadow-md"
                                : "bg-card border-border text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold font-mono transition-all ${
                                  isChosen
                                    ? "bg-violet-600 text-white"
                                    : "bg-secondary text-muted-foreground"
                                }`}
                              >
                                {opt.id}
                              </span>
                              <div>
                                <span className="text-xs sm:text-sm font-medium">{opt.textEn || opt.text}</span>
                                {opt.textTa && (
                                  <span className="text-[11px] text-cyan-400/80 block font-sans">
                                    {opt.textTa}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div
                              className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                isChosen ? "border-violet-400 bg-violet-600" : "border-border"
                              }`}
                            >
                              {isChosen && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Prev / Next / Submit Controls */}
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={currentQIndex === 0}
                        onClick={() => setCurrentQIndex((prev) => Math.max(0, prev - 1))}
                        className="gap-1 text-xs"
                      >
                        <ChevronLeft className="w-4 h-4" /> Previous
                      </Button>

                      {currentQIndex < practiceQuestions.length - 1 ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setCurrentQIndex((prev) => Math.min(practiceQuestions.length - 1, prev + 1))}
                          className="gap-1 text-xs"
                        >
                          Next Question <ChevronRight className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="success"
                          onClick={submitPracticeTest}
                          className="gap-1.5 text-xs font-bold shadow-lg shadow-emerald-500/20"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Finish & View Instant Results
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })()}
            </div>
          )}

          {/* Practice Evaluated: Instant Results & Worked Proofs */}
          {practiceState === "evaluated" && practiceResults && (
            <div className="space-y-6 animate-in zoom-in-95">
              {/* Score Hero Card */}
              <Card className="p-6 sm:p-8 border-emerald-500/30 bg-gradient-to-br from-card via-emerald-950/20 to-card">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="text-center sm:text-left space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                      <Award className="w-4 h-4" /> Instant Evaluation Complete
                    </div>
                    <h2 className="text-2xl font-black text-foreground">
                      {practiceResults.percentage >= 80
                        ? "Outstanding Mastery! 🌟"
                        : practiceResults.percentage >= 50
                        ? "Good Progress! Keep Practicing 👍"
                        : "Needs More Chapter Review 📚"}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Subject: {practiceResults.subjectName} • Instant Self-Assessment Review
                    </p>
                  </div>

                  {/* Score Pill */}
                  <div className="text-center p-5 rounded-2xl glass border border-emerald-500/30 min-w-[160px]">
                    <span className="text-3xl font-black text-emerald-400">
                      {practiceResults.score} / {practiceResults.maxMarks}
                    </span>
                    <span className="text-xs text-muted-foreground block mt-1 font-bold">
                      {practiceResults.percentage}% Score
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-center sm:justify-end gap-3 mt-6 pt-4 border-t border-border flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setPracticeState("idle");
                    }}
                    className="text-xs gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Retake Another Test (Unlimited)
                  </Button>
                  <Link href="/student/history">
                    <Button size="sm" variant="secondary" className="text-xs gap-1.5">
                      <CalendarDays className="w-3.5 h-3.5" /> View Exam History
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => setMainTab("syllabus")}
                    className="text-xs"
                  >
                    Return to Syllabus Checklist
                  </Button>
                </div>
              </Card>

              {/* Question-by-Question Solution Explanations */}
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-amber-400" />
                  Detailed Worked Solutions & Answers Review
                </h3>

                {practiceResults.breakdown.map((q, idx) => (
                  <Card
                    key={q.id || idx}
                    className={`p-5 sm:p-6 border transition-all ${
                      q.isCorrect ? "border-emerald-500/30 bg-emerald-500/5" : "border-rose-500/30 bg-rose-500/5"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 pb-3 border-b border-border">
                      <div>
                        <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold">
                          Question {idx + 1}
                        </span>
                        <p className="text-sm font-bold text-foreground mt-0.5">{q.questionText}</p>
                        {q.questionTextTa && (
                          <p className="text-xs text-cyan-300 font-sans mt-0.5">{q.questionTextTa}</p>
                        )}
                      </div>

                      {q.isCorrect ? (
                        <span className="badge badge-emerald flex items-center gap-1 text-[10px]">
                          <Check className="w-3 h-3" /> Correct (+{q.marks || 1}M)
                        </span>
                      ) : (
                        <span className="badge badge-rose flex items-center gap-1 text-[10px]">
                          <X className="w-3 h-3" /> Incorrect (0M)
                        </span>
                      )}
                    </div>

                    {/* Options Breakdown */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-3">
                      {normalizeOptionsList(q.options).map((opt) => {
                        const isStudent = q.studentAnswer === opt.id;
                        const isAnswer = q.correctAnswer === opt.id;

                        let style = "bg-card border-border text-muted-foreground";
                        if (isAnswer) style = "bg-emerald-500/15 border-emerald-500/40 text-emerald-200 font-bold";
                        else if (isStudent && !isAnswer) style = "bg-rose-500/15 border-rose-500/40 text-rose-200 line-through";

                        return (
                          <div key={opt.id} className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${style}`}>
                            <span className="font-bold font-mono text-[11px]">{opt.id}:</span>
                            <div>
                              <span>{opt.textEn || opt.text}</span>
                              {opt.textTa && <span className="block text-[10px] text-cyan-400 font-sans">{opt.textTa}</span>}
                            </div>
                            {isAnswer && <Check className="w-3.5 h-3.5 text-emerald-400 ml-auto" />}
                            {isStudent && !isAnswer && <X className="w-3.5 h-3.5 text-rose-400 ml-auto" />}
                          </div>
                        );
                      })}
                    </div>

                    {/* Worked Explanation */}
                    {(q.explanation || q.explanationTa) && (
                      <div className="p-3.5 rounded-xl bg-secondary/80 border border-border text-xs space-y-1">
                        <span className="font-bold text-amber-300 block text-[10px] uppercase tracking-wider">
                          Official Step-by-Step Explanation
                        </span>
                        {q.explanation && <p className="text-foreground leading-relaxed">{q.explanation}</p>}
                        {q.explanationTa && <p className="text-cyan-300 leading-relaxed font-sans text-[11px]">{q.explanationTa}</p>}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function StudentSyllabusPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-muted-foreground">Loading syllabus & question bank...</div>}>
      <SyllabusExplorerContent />
    </Suspense>
  );
}
