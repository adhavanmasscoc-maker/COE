"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EXAM_POLICY_CONFIG } from "@/lib/policyPresets";
import {
  Sparkles, ArrowLeft, BookOpen, Loader2, CheckCircle2,
  AlertCircle, FileText, ChevronDown, ChevronUp, Shield, FolderArchive
} from "lucide-react";

function AIQuestionGeneratorContent() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showSyllabus, setShowSyllabus] = useState(true);
  const [showSample, setShowSample] = useState(false);
  const [prefilledSource, setPrefilledSource] = useState("");

  const [selectedPolicyId, setSelectedPolicyId] = useState(4); // Default to Balanced Mix
  const [selectedOptionId, setSelectedOptionId] = useState("4A"); // Standard Board Mix
  const [customText, setCustomText] = useState("");

  const [form, setForm] = useState({
    examId: "",
    subjectName: "",
    prepClass: 10,
    totalMarks: 50,
    questionCount: 25,
    syllabusText: "",
    samplePaperText: "",
  });

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
            prepClass: first.prepClass || 10,
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

  useEffect(() => {
    fetchExams();
    // Check if prefill was sent from Curriculum page
    const storedSyllabus = sessionStorage.getItem("coe_prefill_syllabus");
    const storedSource = sessionStorage.getItem("coe_prefill_source");
    if (storedSyllabus) {
      setForm((prev) => ({ ...prev, syllabusText: storedSyllabus }));
      setPrefilledSource(storedSource || "Curriculum Repository");
      sessionStorage.removeItem("coe_prefill_syllabus");
      sessionStorage.removeItem("coe_prefill_source");
    }
  }, []);

  const handleExamChange = (examId) => {
    const exam = exams.find((e) => e.id === examId);
    if (exam) {
      setForm((prev) => ({
        ...prev,
        examId: exam.id,
        subjectName: exam.subject?.name || "",
        prepClass: exam.prepClass || 10,
        totalMarks: exam.totalMarks || 50,
      }));
    }
  };

  const handlePolicyChange = (pId) => {
    setSelectedPolicyId(pId);
    const firstOption = EXAM_POLICY_CONFIG[pId]?.options[0]?.id || "1A";
    setSelectedOptionId(firstOption);
  };

  const handleGenerate = async () => {
    if (!form.examId || !form.subjectName || !form.questionCount) {
      setError("Exam schedule, subject, and question count are required.");
      return;
    }
    setGenerating(true);
    setResult(null);
    setError("");
    try {
      const res = await fetch("/api/admin/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId: form.examId,
          subjectName: form.subjectName,
          prepClass: form.prepClass,
          totalMarks: form.totalMarks,
          questionCount: parseInt(form.questionCount, 10),
          policyId: selectedPolicyId,
          optionId: selectedOptionId,
          customPolicyText: selectedOptionId === "10E" ? customText : undefined,
          syllabusText: form.syllabusText || undefined,
          samplePaperText: form.samplePaperText || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResult(data);
      } else {
        setError(data.error || "Generation failed.");
        if (data.validationErrors) {
          setError(`${data.error}\n\nValidation errors:\n${data.validationErrors.join("\n")}`);
        }
      }
    } catch (err) {
      setError("Network error contacting AI question generator.");
    } finally {
      setGenerating(false);
    }
  };

  const activeCategory = EXAM_POLICY_CONFIG[selectedPolicyId];
  const activeOption = activeCategory?.options?.find((o) => o.id === selectedOptionId);

  return (
    <div className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-secondary/80 border border-border">
        <div className="flex items-center gap-3">
          <Link
            href="/coe-admin/exams"
            className="p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-foreground">AI Question Generator &amp; Setter</h1>
              <Badge variant="warning">Gemini 2.5 Flash / 1.5</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Timetable &amp; Syllabus Grounding · 10 Exam Policies with 50 Sub-Directives · COE Review Queue
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/coe-admin/curriculum">
            <Button variant="outline" className="text-xs gap-2 border-border hover:bg-secondary">
              <FolderArchive className="w-4 h-4 text-amber-400" /> Browse Curriculum Archive
            </Button>
          </Link>
        </div>
      </div>

      {/* Security & Gating Notice */}
      <div className="p-3.5 rounded-xl bg-sky-500/10 border border-sky-500/25 text-sky-300 text-xs flex items-start gap-2">
        <Shield className="w-4 h-4 flex-shrink-0 mt-0.5 text-sky-400" />
        <div>
          <strong>Server-Side Only &amp; Human-in-the-Loop Gating:</strong> The Gemini API key is securely contained in server environment variables (.env.local). All questions start with status <span className="font-mono text-amber-300">needs_review</span>. The exam cannot be verified or published until the COE explicitly reviews and approves each generated question.
        </div>
      </div>

      {prefilledSource && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs flex items-center justify-between">
          <span>✓ Syllabus automatically prefilled from: <strong>{prefilledSource}</strong></span>
          <button onClick={() => setPrefilledSource("")} className="text-xs opacity-60 hover:opacity-100">Dismiss</button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs whitespace-pre-wrap">
          <AlertCircle className="w-4 h-4 inline mr-1.5 text-rose-400" />
          {error}
        </div>
      )}

      {/* Success */}
      {result && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
          <CheckCircle2 className="w-4 h-4 inline mr-1.5 text-emerald-400" />
          {result.message}
          <Link href="/coe-admin/exams" className="ml-2 underline text-amber-300 font-bold">
            → Go to Exam Scheduler to Review and Approve Questions
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Settings & Syllabus */}
        <div className="lg:col-span-6 space-y-5">
          <Card className="p-5 border-border space-y-4 text-xs">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" /> 1. Target Exam Session
            </h2>

            {/* Exam Picker */}
            <div>
              <label className="block text-muted-foreground font-semibold mb-1">Select Scheduled Exam</label>
              {loading ? (
                <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Loading exam timetable...</div>
              ) : (
                <select
                  value={form.examId}
                  onChange={(e) => handleExamChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground font-medium"
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

            {/* Question Count & Marks */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Target Question Count</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={form.questionCount}
                  onChange={(e) => setForm({ ...form, questionCount: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground"
                />
              </div>
              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Total Exam Marks</label>
                <input
                  type="number"
                  min={1}
                  value={form.totalMarks}
                  onChange={(e) => setForm({ ...form, totalMarks: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground"
                />
              </div>
            </div>
          </Card>

          {/* Syllabus Grounding */}
          <Card className="p-5 border-border space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 font-bold text-foreground text-sm">
                <BookOpen className="w-4 h-4 text-violet-400" /> 2. Official Syllabus Grounding
              </span>
              <Link href="/coe-admin/curriculum" className="text-amber-400 hover:underline text-[11px] font-bold">
                Select from Archive →
              </Link>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Provide textbook unit titles, chapter outlines, or learning goals to ground the questions strictly in curriculum.
            </p>
            <textarea
              rows={8}
              value={form.syllabusText}
              onChange={(e) => setForm({ ...form, syllabusText: e.target.value })}
              placeholder="Paste units, chapters, and key concepts from Tamil Nadu Samacheer Kalvi syllabus here..."
              className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground font-mono text-xs leading-relaxed"
            />
          </Card>

          {/* Sample Past Paper */}
          <Card className="p-5 border-border space-y-3 text-xs">
            <button
              type="button"
              onClick={() => setShowSample(!showSample)}
              className="w-full flex items-center justify-between text-sm font-bold text-foreground"
            >
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" /> 3. Sample Past Paper Reference (Optional)
              </span>
              {showSample ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>
            {showSample && (
              <>
                <p className="text-[10px] text-muted-foreground">
                  The model will adhere to the stylistic tone, compulsory question slot, and phrasing of this paper without copying.
                </p>
                <textarea
                  rows={5}
                  value={form.samplePaperText}
                  onChange={(e) => setForm({ ...form, samplePaperText: e.target.value })}
                  placeholder="Paste excerpt from previous year public board exam paper..."
                  className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground font-mono text-xs leading-relaxed"
                />
              </>
            )}
          </Card>
        </div>

        {/* Right: 10 Policy Categories & 5 Sub-Options */}
        <div className="lg:col-span-6 space-y-5">
          <Card className="p-5 border-border space-y-4 text-xs">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" /> 4. Exam Policy Directives (10 Policies × 5 Options)
            </h2>

            {/* Policy Category Dropdown */}
            <div>
              <label className="block text-muted-foreground font-semibold mb-1">
                A. Policy Master Category (1 to 10)
              </label>
              <select
                value={selectedPolicyId}
                onChange={(e) => handlePolicyChange(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl bg-secondary border border-border text-foreground font-bold text-xs"
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
              <div className="space-y-2">
                {activeCategory?.options?.map((opt) => {
                  const isSelected = selectedOptionId === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedOptionId(opt.id)}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col gap-1 ${
                        isSelected
                          ? "bg-amber-500/20 border-amber-500/50 text-amber-100 shadow-md shadow-amber-500/10"
                          : "bg-secondary/40 border-border hover:bg-secondary/80 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <div className="flex items-center justify-between">
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

          <Button
            onClick={handleGenerate}
            disabled={generating || !form.examId || exams.length === 0}
            className="w-full py-4 text-sm font-black bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xl shadow-amber-500/25 gap-2"
          >
            {generating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Generating Questions via Gemini...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" /> Generate {form.questionCount} Questions [{selectedOptionId}]
              </>
            )}
          </Button>

          <p className="text-[10px] text-muted-foreground text-center">
            All AI-generated questions are automatically quarantined in the review queue for COE sign-off before publishing.
          </p>
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
