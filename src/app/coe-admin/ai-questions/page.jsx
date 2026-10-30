"use client";

import React, { useState, useEffect, Suspense, useMemo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton, SkeletonCard } from "@/components/ui/Skeleton";
import {
  EXAM_POLICY_CONFIG,
  QUICK_SYLLABUS_PRESETS,
  QUESTION_MARK_CONFIG,
} from "@/lib/policyPresets";
import {
  Sparkles,
  ArrowLeft,
  BookOpen,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
  ChevronDown,
  ChevronUp,
  Shield,
  FolderArchive,
  FileUp,
  CheckSquare,
  Square,
  Trash2,
  ArrowUpRight,
  ClipboardPaste,
  Calculator,
  Layers,
} from "lucide-react";

// Lazy-load SyllabusPastePanel using next/dynamic with Skeleton fallback (Task 2 Performance)
const SyllabusPastePanel = dynamic(
  () => import("@/components/admin/SyllabusPastePanel"),
  {
    ssr: false,
    loading: () => <SkeletonCard lines={5} className="w-full" />,
  }
);

function AIQuestionGeneratorContent() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showSample, setShowSample] = useState(false);
  const [prefilledSource, setPrefilledSource] = useState("");

  // Presets list combining built-in Class 10 & 12 presets + imported custom syllabi
  const [customPresets, setCustomPresets] = useState([]);

  // Policy configuration (10 policies x 5 options)
  const [selectedPolicyId, setSelectedPolicyId] = useState(4); // Default: Balanced Mix
  const [selectedOptionId, setSelectedOptionId] = useState("4A"); // Standard Board Mix
  const [customText, setCustomText] = useState("");

  // Question mark breakdown: 1-mark, 2-mark, 3-mark, 5-mark
  const [markCounts, setMarkCounts] = useState({
    1: 15, // 15 MCQs = 15 marks
    2: 5,  // 5 Very Short = 10 marks
    3: 5,  // 5 Short = 15 marks
    5: 2,  // 2 Long = 10 marks
  });

  // Calculate total marks and question count from mark breakdown
  const calculatedTotalMarks = useMemo(() => {
    return (
      (parseInt(markCounts[1], 10) || 0) * 1 +
      (parseInt(markCounts[2], 10) || 0) * 2 +
      (parseInt(markCounts[3], 10) || 0) * 3 +
      (parseInt(markCounts[5], 10) || 0) * 5
    );
  }, [markCounts]);

  const calculatedTotalQuestions = useMemo(() => {
    return (
      (parseInt(markCounts[1], 10) || 0) +
      (parseInt(markCounts[2], 10) || 0) +
      (parseInt(markCounts[3], 10) || 0) +
      (parseInt(markCounts[5], 10) || 0)
    );
  }, [markCounts]);

  // Target exam form
  const [form, setForm] = useState({
    examId: "",
    subjectName: "",
    prepClass: 12,
    totalMarks: 50,
    questionCount: 27,
    syllabusText: "",
    samplePaperText: "",
  });

  // Pre-Saved Server Repository Files
  const [serverFiles, setServerFiles] = useState([]);
  const [selectedServerFiles, setSelectedServerFiles] = useState(new Set());
  const [serverFilesLoading, setServerFilesLoading] = useState(false);

  // In-Memory Multi-File FormData + PDF extraction
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [activeGroundingTab, setActiveGroundingTab] = useState("paste"); // "paste" | "presets" | "server" | "upload"

  // Load custom presets from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("coe_custom_syllabus_presets");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setCustomPresets(parsed);
        }
      }
    } catch (e) {
      console.warn("Could not load stored syllabus presets:", e);
    }
  }, []);

  const allPresets = useMemo(() => {
    return [...QUICK_SYLLABUS_PRESETS, ...customPresets];
  }, [customPresets]);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/exams");
      const data = await res.json();
      if (res.ok && data.exams) {
        const drafts = data.exams.filter((e) => e.status !== "COMPLETED");
        setExams(drafts);
        if (drafts.length > 0) {
          const first = drafts[0];
          setForm((prev) => ({
            ...prev,
            examId: first.id,
            subjectName: first.subject?.name || "",
            prepClass: first.prepClass || 12,
            totalMarks: first.totalMarks || 50,
          }));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchServerFiles = async () => {
    setServerFilesLoading(true);
    try {
      const res = await fetch("/api/admin/curriculum");
      const data = await res.json();
      if (res.ok && data.files) {
        setServerFiles(data.files);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setServerFilesLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
    fetchServerFiles();

    // Check if prefill was sent from Curriculum page
    const storedSyllabus = sessionStorage.getItem("coe_prefill_syllabus");
    const storedSource = sessionStorage.getItem("coe_prefill_source");
    const storedFiles = sessionStorage.getItem("coe_selected_curriculum_files");
    if (storedSyllabus) {
      setForm((prev) => ({ ...prev, syllabusText: storedSyllabus }));
      setPrefilledSource(storedSource || "Curriculum Repository");
      sessionStorage.removeItem("coe_prefill_syllabus");
      sessionStorage.removeItem("coe_prefill_source");
    }
    if (storedFiles) {
      try {
        const parsed = JSON.parse(storedFiles);
        if (Array.isArray(parsed)) {
          setSelectedServerFiles(new Set(parsed));
        }
      } catch {}
      sessionStorage.removeItem("coe_selected_curriculum_files");
    }
  }, []);

  const handleExamChange = (examId) => {
    const exam = exams.find((e) => e.id === examId);
    if (exam) {
      setForm((prev) => ({
        ...prev,
        examId: exam.id,
        subjectName: exam.subject?.name || "",
        prepClass: exam.prepClass || 12,
        totalMarks: exam.totalMarks || 50,
      }));
    }
  };

  const handlePolicyChange = (pId) => {
    setSelectedPolicyId(pId);
    const firstOption = EXAM_POLICY_CONFIG[pId]?.options[0]?.id || "1A";
    setSelectedOptionId(firstOption);
  };

  const toggleServerFile = (filename) => {
    setSelectedServerFiles((prev) => {
      const next = new Set(prev);
      if (next.has(filename)) next.delete(filename);
      else next.add(filename);
      return next;
    });
  };

  const selectAllServerFiles = () => {
    if (selectedServerFiles.size === serverFiles.length) {
      setSelectedServerFiles(new Set());
    } else {
      setSelectedServerFiles(new Set(serverFiles.map((f) => f.name)));
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setUploadedFiles((prev) => [...prev, ...files]);
    }
    e.target.value = null; // reset
  };

  const removeUploadedFile = (index) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const applyPreset = (preset) => {
    setForm((prev) => ({
      ...prev,
      subjectName: preset.subject || prev.subjectName,
      prepClass: preset.prepClass || prev.prepClass,
      syllabusText: preset.text || "",
    }));
    setPrefilledSource(preset.label);
  };

  const handleSyllabusImported = (newPresets) => {
    setCustomPresets((prev) => [...prev, ...newPresets]);
    setActiveGroundingTab("presets");
  };

  const handleGenerate = async () => {
    const effectiveTotalMarks = calculatedTotalMarks || form.totalMarks;
    const effectiveQuestionCount = calculatedTotalQuestions || form.questionCount;

    if (!form.examId || !form.subjectName || !effectiveQuestionCount) {
      setError("Exam schedule, subject, and question count are required.");
      return;
    }
    setGenerating(true);
    setResult(null);
    setError("");

    try {
      let res;
      const selectedFilesArray = Array.from(selectedServerFiles);

      // SOLUTION 2: Use FormData if files are uploaded
      if (uploadedFiles.length > 0) {
        const formData = new FormData();
        formData.append("examId", form.examId);
        formData.append("subjectName", form.subjectName);
        formData.append("prepClass", form.prepClass.toString());
        formData.append("totalMarks", effectiveTotalMarks.toString());
        formData.append("questionCount", effectiveQuestionCount.toString());
        formData.append("policyId", selectedPolicyId.toString());
        formData.append("optionId", selectedOptionId);
        formData.append("markBreakdown", JSON.stringify(markCounts));

        if (selectedOptionId === "10E" && customText) {
          formData.append("customPolicyText", customText);
        }
        if (form.syllabusText) {
          formData.append("syllabusText", form.syllabusText);
        }
        if (form.samplePaperText) {
          formData.append("samplePaperText", form.samplePaperText);
        }
        if (selectedFilesArray.length > 0) {
          formData.append("selectedCurriculumFiles", JSON.stringify(selectedFilesArray));
        }

        // Append multiple files under 'files' key for server-side in-memory pdf-parse
        uploadedFiles.forEach((file) => {
          formData.append("files", file);
        });

        res = await fetch("/api/coe/generate-questions", {
          method: "POST",
          body: formData,
        });
      } else {
        // SOLUTION 1: Standard JSON Request with pre-saved server files
        res = await fetch("/api/admin/generate-questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            examId: form.examId,
            subjectName: form.subjectName,
            prepClass: form.prepClass,
            totalMarks: effectiveTotalMarks,
            questionCount: effectiveQuestionCount,
            policyId: selectedPolicyId,
            optionId: selectedOptionId,
            markBreakdown: markCounts,
            customPolicyText: selectedOptionId === "10E" ? customText : undefined,
            syllabusText: form.syllabusText || undefined,
            samplePaperText: form.samplePaperText || undefined,
            selectedCurriculumFiles: selectedFilesArray,
          }),
        });
      }

      const data = await res.json();
      if (res.ok && (data.success || data.status === "success")) {
        setResult(data);
      } else {
        setError(data.error || "Generation failed.");
        if (data.validationErrors) {
          setError(`${data.error}\n\nValidation errors:\n${data.validationErrors.join("\n")}`);
        }
      }
    } catch (err) {
      setError(`Network error contacting AI question generator: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const activeCategory = EXAM_POLICY_CONFIG[selectedPolicyId];

  return (
    <div className="flex-1 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 w-full space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6 rounded-2xl bg-secondary/80 border border-border">
        <div className="flex items-center gap-3">
          <Link
            href="/coe-admin/exams"
            className="touch-target p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
            aria-label="Back to Exam Scheduler"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg sm:text-2xl font-black text-foreground">
                AI Exam Setter &amp; Syllabus Engine
              </h1>
              <Badge variant="warning">Class 10 &amp; 12 Public Exams</Badge>
              <Badge variant="success">HTTP 413 Safe</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              1-Mark, 2-Mark, 3-Mark &amp; 5-Mark Question Generator · 12 Higher Secondary Subjects · 50 Exam Policies
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Link href="/coe-admin/curriculum" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto touch-target text-xs gap-2 border-border hover:bg-secondary">
              <FolderArchive className="w-4 h-4 text-amber-400" /> Curriculum Archive
            </Button>
          </Link>
        </div>
      </div>

      {/* Security & Human-in-the-Loop Gating Notice */}
      <div className="p-3.5 rounded-xl bg-sky-500/10 border border-sky-500/25 text-sky-300 text-xs flex items-start gap-2.5">
        <Shield className="w-4 h-4 flex-shrink-0 mt-0.5 text-sky-400" />
        <div>
          <strong>Strict COE Review Quarantine:</strong> All generated questions are automatically quarantined in the review queue. The exam cannot be published until the Controller of Examinations formally inspects and approves each question.
        </div>
      </div>

      {prefilledSource && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs flex items-center justify-between">
          <span>✓ Syllabus active: <strong>{prefilledSource}</strong></span>
          <button onClick={() => setPrefilledSource("")} className="touch-target text-xs opacity-60 hover:opacity-100">
            Dismiss
          </button>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs whitespace-pre-wrap">
          <AlertCircle className="w-4 h-4 inline mr-1.5 text-rose-400" />
          {error}
        </div>
      )}

      {/* Success Banner */}
      {result && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CheckCircle2 className="w-4 h-4 inline mr-1.5 text-emerald-400" />
            <strong>{result.message || "Questions successfully generated!"}</strong>
            {result.processedFilesCount > 0 && ` (${result.processedFilesCount} uploaded file(s) parsed)`}
            {result.serverCurriculumFilesCount > 0 && ` (${result.serverCurriculumFilesCount} server repository file(s) included)`}
          </div>
          <Link href="/coe-admin/exams" className="underline text-amber-300 font-bold flex items-center gap-1 touch-target">
            Review in Scheduler <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Responsive Main Layout Grid (Mobile 1 column, Desktop 12 columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Target Session, Question Types & Marks, Syllabus Paste */}
        <div className="lg:col-span-6 space-y-5">
          {/* Section 1: Target Exam Session */}
          <Card className="p-4 sm:p-5 border-border space-y-4 text-xs">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" /> 1. Target Examination Session
            </h2>

            <div>
              <label className="block text-muted-foreground font-semibold mb-1">
                Select Scheduled Exam Session
              </label>
              {loading ? (
                <div className="flex items-center gap-2 text-muted-foreground py-2">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" /> Loading exam timetable...
                </div>
              ) : (
                <select
                  value={form.examId}
                  onChange={(e) => handleExamChange(e.target.value)}
                  className="w-full touch-target px-3 py-2.5 rounded-xl bg-secondary border border-border text-foreground font-semibold text-xs"
                >
                  {exams.length === 0 ? (
                    <option value="">No draft exams found — create one in scheduler</option>
                  ) : (
                    exams.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.subject?.name} — Class {e.prepClass} ({e.status}) · {e.totalMarks} Marks
                      </option>
                    ))
                  )}
                </select>
              )}
            </div>

            {/* Prep Class Selector */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Target Class</label>
                <select
                  value={form.prepClass}
                  onChange={(e) => setForm({ ...form, prepClass: Number(e.target.value) })}
                  className="w-full touch-target px-3 py-2 rounded-xl bg-secondary border border-border text-foreground font-bold"
                >
                  <option value={10}>Class 10 (SSLC)</option>
                  <option value={11}>Class 11 (Plus 1)</option>
                  <option value={12}>Class 12 (Plus 2)</option>
                </select>
              </div>
              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Subject Name</label>
                <input
                  type="text"
                  value={form.subjectName}
                  onChange={(e) => setForm({ ...form, subjectName: e.target.value })}
                  placeholder="e.g. Computer Science"
                  className="w-full touch-target px-3 py-2 rounded-xl bg-secondary border border-border text-foreground font-semibold"
                />
              </div>
            </div>
          </Card>

          {/* Section 2: Question Types & Mark Values Breakdown (Task 1 requirement) */}
          <Card className="p-4 sm:p-5 border-border space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="flex items-center gap-2 font-bold text-foreground text-sm">
                <Calculator className="w-4 h-4 text-indigo-400" /> 2. Question Types &amp; Mark Distribution
              </span>
              <div className="flex items-center gap-2 font-mono text-[11px]">
                <span className="text-muted-foreground">Total:</span>
                <span className="px-2 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                  {calculatedTotalMarks} Marks
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-secondary text-foreground font-bold border border-border">
                  {calculatedTotalQuestions} Qs
                </span>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Configure per-mark question quotas for Samacheer Kalvi blueprint standards:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {QUESTION_MARK_CONFIG.map((qCfg) => {
                const count = markCounts[qCfg.marks] || 0;
                const subTotal = count * qCfg.marks;
                return (
                  <div
                    key={qCfg.marks}
                    className="p-3 rounded-xl bg-secondary/50 border border-border space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground text-xs">{qCfg.label}</span>
                      <span className="font-mono text-[11px] text-amber-400 font-bold">
                        = {subTotal} Marks
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-[10px] text-muted-foreground">Count:</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={count}
                        onChange={(e) =>
                          setMarkCounts((prev) => ({
                            ...prev,
                            [qCfg.marks]: Math.max(0, parseInt(e.target.value, 10) || 0),
                          }))
                        }
                        className="touch-target w-full px-2.5 py-1.5 rounded-lg bg-background border border-border text-foreground font-mono font-bold text-xs"
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-tight">
                      {qCfg.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Section 3: Reference Grounding Center & Paste Syllabus Section (Task 1) */}
          <div className="space-y-4">
            <div className="flex items-center gap-1.5 bg-secondary p-1 rounded-xl border border-border overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveGroundingTab("paste")}
                className={`touch-target px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  activeGroundingTab === "paste"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <ClipboardPaste className="w-3.5 h-3.5 inline mr-1" /> Paste Syllabus (JSON/Text)
              </button>
              <button
                type="button"
                onClick={() => setActiveGroundingTab("presets")}
                className={`touch-target px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  activeGroundingTab === "presets"
                    ? "bg-amber-500 text-slate-950 shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 inline mr-1" /> All Presets ({allPresets.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveGroundingTab("server")}
                className={`touch-target px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  activeGroundingTab === "server"
                    ? "bg-amber-500 text-slate-950 shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <FolderArchive className="w-3.5 h-3.5 inline mr-1" /> Server Files ({selectedServerFiles.size})
              </button>
              <button
                type="button"
                onClick={() => setActiveGroundingTab("upload")}
                className={`touch-target px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  activeGroundingTab === "upload"
                    ? "bg-amber-500 text-slate-950 shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <FileUp className="w-3.5 h-3.5 inline mr-1" /> Upload PDFs ({uploadedFiles.length})
              </button>
            </div>

            {/* TAB 1: PASTE SYLLABUS SECTION (Task 1) */}
            {activeGroundingTab === "paste" && (
              <SyllabusPastePanel
                onSyllabusImported={handleSyllabusImported}
                onApplySyllabus={applyPreset}
              />
            )}

            {/* TAB 2: ALL CLASS 10 & 12 PRESETS */}
            {activeGroundingTab === "presets" && (
              <Card className="p-4 sm:p-5 border-border space-y-3 text-xs">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground border-b border-border pb-2">
                  <span>Click any standard syllabus to auto-populate units &amp; topics:</span>
                  <Badge variant="cyan">{allPresets.length} Presets Available</Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                  {allPresets.map((preset, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => applyPreset(preset)}
                      className="touch-target p-3 rounded-xl border border-border bg-secondary/40 hover:bg-secondary text-left transition-all group flex flex-col justify-between"
                    >
                      <div className="font-bold text-foreground text-xs group-hover:text-amber-400">
                        {preset.label}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-1">
                        Class {preset.prepClass} · Click to apply
                      </div>
                    </button>
                  ))}
                </div>
              </Card>
            )}

            {/* TAB 3: SERVER ARCHIVE */}
            {activeGroundingTab === "server" && (
              <Card className="p-4 sm:p-5 border-border space-y-3 text-xs">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Pre-saved official syllabi on server (0KB upload overhead):</span>
                  <button
                    type="button"
                    onClick={selectAllServerFiles}
                    className="touch-target text-amber-400 hover:underline font-bold"
                  >
                    {selectedServerFiles.size === serverFiles.length ? "Deselect All" : "Select All"}
                  </button>
                </div>

                {serverFilesLoading ? (
                  <div className="p-4 text-center text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin inline mr-1" /> Loading repository files...
                  </div>
                ) : (
                  <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                    {serverFiles.map((file) => {
                      const isChecked = selectedServerFiles.has(file.name);
                      return (
                        <div
                          key={file.name}
                          onClick={() => toggleServerFile(file.name)}
                          className={`cursor-pointer touch-target p-2 rounded-lg border text-xs flex items-center justify-between transition-all ${
                            isChecked
                              ? "bg-amber-500/15 border-amber-500/40 text-amber-200"
                              : "bg-secondary/40 border-border hover:bg-secondary/70 text-muted-foreground"
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            {isChecked ? (
                              <CheckSquare className="w-4 h-4 text-amber-400 flex-shrink-0" />
                            ) : (
                              <Square className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            )}
                            <span className="font-mono text-[11.5px] truncate">{file.name}</span>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0 text-[10px]">
                            <span className="px-1.5 py-0.5 rounded bg-background border border-border uppercase font-mono">
                              {file.type}
                            </span>
                            <span>{(file.sizeBytes / 1024).toFixed(1)} KB</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            )}

            {/* TAB 4: UPLOAD PDFS */}
            {activeGroundingTab === "upload" && (
              <Card className="p-4 sm:p-5 border-border space-y-3 text-xs">
                <div className="p-4 rounded-xl border border-dashed border-border bg-secondary/30 text-center space-y-2">
                  <FileUp className="w-6 h-6 text-indigo-400 mx-auto" />
                  <p className="text-xs text-foreground font-semibold">Upload Custom Syllabus PDFs or Past Papers</p>
                  <label className="inline-block mt-2">
                    <span className="touch-target px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer shadow-md shadow-indigo-600/20">
                      Choose Files (.pdf, .txt, .md, .json)
                    </span>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.txt,.md,.json"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {uploadedFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-lg bg-secondary/60 border border-border text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="w-4 h-4 text-sky-400 flex-shrink-0" />
                          <span className="truncate font-mono text-[11px] text-foreground">{file.name}</span>
                          <span className="text-[10px] text-muted-foreground">({(file.size / 1024).toFixed(1)} KB)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeUploadedFile(idx)}
                          className="touch-target text-muted-foreground hover:text-rose-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}

            {/* Editable Syllabus Field */}
            <Card className="p-4 sm:p-5 border-border space-y-2 text-xs">
              <label className="block text-muted-foreground font-semibold text-[11px]">
                Specific Chapter Goals or Custom Syllabus Notes:
              </label>
              <textarea
                rows={5}
                value={form.syllabusText}
                onChange={(e) => setForm({ ...form, syllabusText: e.target.value })}
                placeholder="Type or paste specific syllabus units, chapters, formulas, or focus areas..."
                className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground font-mono text-xs leading-relaxed"
              />
            </Card>

            {/* Sample Past Paper Reference Accordion */}
            <Card className="p-4 sm:p-5 border-border space-y-3 text-xs">
              <button
                type="button"
                onClick={() => setShowSample(!showSample)}
                className="touch-target w-full flex items-center justify-between text-sm font-bold text-foreground"
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-400" /> Sample Past Paper Reference (Optional)
                </span>
                {showSample ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </button>
              {showSample && (
                <textarea
                  rows={4}
                  value={form.samplePaperText}
                  onChange={(e) => setForm({ ...form, samplePaperText: e.target.value })}
                  placeholder="Paste excerpt from previous year public board exam paper to match tone and stylistic nuances..."
                  className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground font-mono text-xs leading-relaxed"
                />
              )}
            </Card>
          </div>
        </div>

        {/* Right Column: 10 Exam Policies x 5 Options & Action Button */}
        <div className="lg:col-span-6 space-y-5">
          <Card className="p-4 sm:p-5 border-border space-y-4 text-xs">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" /> 3. Examination Policy Directives
            </h2>

            {/* Policy Master Category Dropdown */}
            <div>
              <label className="block text-muted-foreground font-semibold mb-1">
                A. Policy Category (1 to 10)
              </label>
              <select
                value={selectedPolicyId}
                onChange={(e) => handlePolicyChange(Number(e.target.value))}
                className="w-full touch-target px-3 py-2.5 rounded-xl bg-secondary border border-border text-foreground font-bold text-xs"
              >
                {Object.entries(EXAM_POLICY_CONFIG).map(([id, item]) => (
                  <option key={id} value={id}>
                    {id}. {item.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {activeCategory?.description}
              </p>
            </div>

            {/* Sub-Options List */}
            <div>
              <label className="block text-muted-foreground font-semibold mb-2">
                B. Select Sub-Option Directive ({activeCategory?.name})
              </label>
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {activeCategory?.options?.map((opt) => {
                  const isSelected = selectedOptionId === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedOptionId(opt.id)}
                      className={`touch-target w-full text-left p-3 rounded-xl border transition-all flex flex-col gap-1 ${
                        isSelected
                          ? "bg-amber-500/20 border-amber-500/50 text-amber-100 shadow-md shadow-amber-500/10"
                          : "bg-secondary/40 border-border hover:bg-secondary/80 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-bold text-xs">
                          [{opt.id}] {opt.label}
                        </span>
                        {isSelected && <Badge variant="warning">Active</Badge>}
                      </div>
                      <span className="text-[11px] opacity-80 leading-snug">
                        {opt.directive === "USE_CUSTOM_TEXT" ? "Custom prompt rules provided below." : opt.directive}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Rules Input (When 10E is chosen) */}
            {selectedOptionId === "10E" && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                <label className="block text-amber-300 font-bold text-xs">
                  Specify Custom Examination Directives:
                </label>
                <textarea
                  rows={4}
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="e.g. Focus exclusively on Chapter 4 Algorithms and Chapter 6 Functions. Every question must have an associated flowchart reference..."
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-xs"
                />
              </div>
            )}
          </Card>

          {/* Action Trigger Button */}
          <div className="space-y-2">
            <Button
              onClick={handleGenerate}
              disabled={generating || !form.examId || exams.length === 0}
              className="touch-target w-full py-4 text-sm font-black bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xl shadow-amber-500/25 gap-2"
            >
              {generating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Processing Documents &amp; Calling Gemini...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" /> Generate {calculatedTotalQuestions} Questions [{selectedOptionId}] ({calculatedTotalMarks} Marks)
                  {uploadedFiles.length > 0 && ` + ${uploadedFiles.length} File(s)`}
                  {selectedServerFiles.size > 0 && ` + ${selectedServerFiles.size} Server File(s)`}
                </>
              )}
            </Button>
            <p className="text-[10px] text-muted-foreground text-center">
              All AI-generated questions are automatically quarantined in the review queue for COE sign-off before publishing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AIQuestionGeneratorPage() {
  return (
    <AdminGuard>
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
          </div>
        }
      >
        <AIQuestionGeneratorContent />
      </Suspense>
    </AdminGuard>
  );
}
