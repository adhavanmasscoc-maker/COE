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
} from "lucide-react";

function SyllabusExplorerContent() {
  const searchParams = useSearchParams();
  const initialSubjectCode = searchParams.get("code");

  const [mainTab, setMainTab] = useState("syllabus"); // "syllabus" | "practice"
  const [subjects, setSubjects] = useState([]);
  const [selectedSubId, setSelectedSubId] = useState(null);
  const [prepClass, setPrepClass] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [togglingId, setTogglingId] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  // Practice Engine States
  const [practiceSubjectId, setPracticeSubjectId] = useState(null);
  const [practiceCount, setPracticeCount] = useState(5);
  const [practiceState, setPracticeState] = useState("idle"); // idle | loading | running | evaluated
  const [practiceQuestions, setPracticeQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [practiceResults, setPracticeResults] = useState(null);

  const fetchSyllabus = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/syllabus");
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Failed to load syllabus records.");
      } else {
        setSubjects(json.subjects || []);
        setPrepClass(json.prepClass);

        if (json.subjects?.length > 0) {
          if (initialSubjectCode) {
            const matched = json.subjects.find((s) => s.code === initialSubjectCode);
            const chosenId = matched ? matched.id : json.subjects[0].id;
            setSelectedSubId(chosenId);
            setPracticeSubjectId(chosenId);
          } else {
            const firstId = json.subjects[0].id;
            setSelectedSubId(firstId);
            setPracticeSubjectId(firstId);
          }
        }
      }
    } catch (err) {
      setError("Network error fetching syllabus data from SQLite.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSyllabus();
  }, []);

  const currentSubject = subjects.find((s) => s.id === selectedSubId) || subjects[0];
  const activePracticeSubject = subjects.find((s) => s.id === practiceSubjectId) || currentSubject;

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
    } catch (err) {
      setToastMessage("Failed to update progress.");
    } finally {
      setTogglingId(null);
    }
  };

  // ── Practice Engine Handlers ──
  const startPracticeTest = async () => {
    if (!practiceSubjectId && !currentSubject?.id) return;
    setPracticeState("loading");
    setSelectedAnswers({});
    setCurrentQIndex(0);
    setPracticeResults(null);

    try {
      const targetId = practiceSubjectId || currentSubject.id;
      const res = await fetch(`/api/student/practice?subjectId=${targetId}&count=${practiceCount}`);
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

    const percentage = Math.round((score / maxMarks) * 100);

    setPracticeResults({
      score,
      maxMarks,
      percentage,
      breakdown,
      subjectName: activePracticeSubject?.name || "Subject",
    });

    setPracticeState("evaluated");
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
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-foreground">Syllabus & Practice Portal</h1>
              <Badge variant="purple">Class {prepClass} Curriculum</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Official Tamil Nadu Samacheer Kalvi units, topic tracker, and instant self-assessment practice engine.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/student/papers">
            <Button size="sm" variant="outline" className="gap-1.5 text-xs">
              <FileText className="w-4 h-4 text-amber-400" /> Past Papers
            </Button>
          </Link>
          <button
            onClick={() => setMainTab("practice")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-600/30 transition-all"
          >
            <Zap className="w-4 h-4 text-amber-300" /> Start Practice
          </button>
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
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button
          onClick={() => setMainTab("syllabus")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            mainTab === "syllabus"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Syllabus Units & Topics</span>
        </button>

        <button
          onClick={() => setMainTab("practice")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            mainTab === "practice"
              ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          }`}
        >
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Interactive Practice & Instant Results</span>
          <span className="badge badge-amber text-[9px]">Self-Study Mode</span>
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
                  onClick={() => setSelectedSubId(sub.id)}
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
            <Card className="border-border bg-gradient-to-r from-card to-secondary/30">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="font-mono text-xs">
                      {currentSubject.code}
                    </Badge>
                    <h2 className="text-xl font-bold text-foreground">{currentSubject.name}</h2>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {currentSubject.completedChapters} of {currentSubject.totalChapters} chapters completed
                  </p>
                </div>

                <div className="w-full sm:w-64 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Subject Progress</span>
                    <span className="font-bold text-emerald-400">{currentSubject.progressPercent}%</span>
                  </div>
                  <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-sky-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${currentSubject.progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Units & Chapters List */}
          <div className="space-y-4">
            {currentSubject?.units?.length === 0 ? (
              <Card className="p-8 text-center text-xs text-muted-foreground">
                No units or chapters currently cataloged for this subject.
              </Card>
            ) : (
              currentSubject?.units?.map((unit) => (
                <Card key={unit.id} className="border-border overflow-hidden p-0">
                  <div className="p-4 bg-secondary/50 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center text-xs font-bold font-mono">
                        U{unit.unitNumber}
                      </span>
                      <h3 className="font-bold text-sm text-foreground">{unit.title}</h3>
                    </div>
                    <Badge variant="secondary" className="text-[10px]">
                      {unit.chapters.length} Chapters
                    </Badge>
                  </div>

                  <div className="divide-y divide-border">
                    {unit.chapters.map((ch) => (
                      <div
                        key={ch.id}
                        className="p-4 flex items-center justify-between gap-4 hover:bg-secondary/30 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <button
                            type="button"
                            disabled={togglingId === ch.id}
                            onClick={() => handleToggleChapter(ch.id, ch.isCompleted)}
                            className="mt-0.5 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {ch.isCompleted ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            ) : (
                              <Circle className="w-5 h-5 text-muted-foreground hover:text-sky-400" />
                            )}
                          </button>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[11px] text-muted-foreground">
                                {unit.unitNumber}.{ch.chapterNumber}
                              </span>
                              <span
                                className={`text-sm font-semibold ${
                                  ch.isCompleted ? "line-through text-muted-foreground" : "text-foreground"
                                }`}
                              >
                                {ch.title}
                              </span>
                            </div>
                            {ch.description && (
                              <p className="text-xs text-muted-foreground mt-0.5">{ch.description}</p>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={togglingId === ch.id}
                          onClick={() => handleToggleChapter(ch.id, ch.isCompleted)}
                          className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                            ch.isCompleted
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                              : "bg-secondary text-muted-foreground border-border hover:text-foreground"
                          }`}
                        >
                          {ch.isCompleted ? "Studied ✓" : "Mark Studied"}
                        </button>
                      </div>
                    ))}
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: HEAVY FULL PRACTICE ASSESSMENT ENGINE (INSTANT RESULTS)
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
                    * Practice test scores are private self-assessments and do NOT affect your official COE marksheets.
                  </p>
                </div>

                {/* Setup Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-lg mx-auto p-4 rounded-2xl glass-sm border border-border">
                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1.5">
                      Select Subject
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
                    </select>
                  </div>
                </div>

                <Button
                  size="lg"
                  variant="primary"
                  onClick={startPracticeTest}
                  className="gap-2 text-sm shadow-xl shadow-violet-600/30"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  Launch Practice Assessment Now
                </Button>
              </div>
            </Card>
          )}

          {/* Practice Loading */}
          {practiceState === "loading" && (
            <Card className="p-12 text-center border-border">
              <Loader2 className="w-8 h-8 animate-spin text-violet-400 mx-auto mb-3" />
              <h3 className="font-bold text-sm text-foreground">Preparing Practice Assessment</h3>
              <p className="text-xs text-muted-foreground mt-1">Retrieving official curriculum questions from SQLite bank...</p>
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
                        <span className="text-[11px] font-bold text-violet-400 uppercase tracking-wide">
                          Question {q.questionNumber || currentQIndex + 1} • {q.marks || 1} Mark
                        </span>
                        <h3 className="text-base sm:text-lg font-bold text-foreground mt-1 leading-relaxed">
                          {q.questionText}
                        </h3>
                      </div>
                    </div>

                    {/* Options */}
                    <div className="space-y-2.5">
                      {q.options?.map((opt) => {
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
                              <span className="text-xs sm:text-sm font-medium">{opt.text}</span>
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

                <div className="flex items-center justify-center sm:justify-end gap-3 mt-6 pt-4 border-t border-border">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setPracticeState("idle");
                    }}
                    className="text-xs gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Retake Another Test
                  </Button>
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
                    key={q.id}
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
                      {q.options?.map((opt) => {
                        const isStudent = q.studentAnswer === opt.id;
                        const isAnswer = q.correctAnswer === opt.id;

                        let style = "bg-card border-border text-muted-foreground";
                        if (isAnswer) style = "bg-emerald-500/15 border-emerald-500/40 text-emerald-200 font-bold";
                        else if (isStudent && !isAnswer) style = "bg-rose-500/15 border-rose-500/40 text-rose-200 line-through";

                        return (
                          <div key={opt.id} className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${style}`}>
                            <span className="font-bold font-mono text-[11px]">{opt.id}:</span>
                            <span>{opt.text}</span>
                            {isAnswer && <Check className="w-3.5 h-3.5 text-emerald-400 ml-auto" />}
                            {isStudent && !isAnswer && <X className="w-3.5 h-3.5 text-rose-400 ml-auto" />}
                          </div>
                        );
                      })}
                    </div>

                    {/* Worked Explanation */}
                    {q.explanation && (
                      <div className="p-3.5 rounded-xl bg-secondary/80 border border-border text-xs space-y-1">
                        <span className="font-bold text-amber-300 block text-[10px] uppercase tracking-wider">
                          Official Step-by-Step Explanation
                        </span>
                        <p className="text-foreground leading-relaxed">{q.explanation}</p>
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
    <Suspense fallback={<div className="p-8 text-center text-xs text-muted-foreground">Loading syllabus...</div>}>
      <SyllabusExplorerContent />
    </Suspense>
  );
}
