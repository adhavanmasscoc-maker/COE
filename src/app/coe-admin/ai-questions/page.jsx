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
  AlertCircle, FileText, ChevronDown, ChevronUp, Shield, FolderArchive,
  Upload, FileUp, X, CheckSquare, Square, Trash2, ArrowUpRight
} from "lucide-react";

const QUICK_SYLLABUS_PRESETS = [
  {
    label: "Class 10 Mathematics (Core)",
    prepClass: 10,
    text: "Unit 1: Relations and Functions (Cartesian Product, Relations, Types of Functions, Composition)\nUnit 2: Numbers and Sequences (Euclid Division Lemma, AP and GP Formulas, Special Series)\nUnit 3: Algebra (Linear Equations 3 Variables, GCD/LCM Polynomials, Quadratic Formula, Matrices)\nUnit 4: Geometry (Similar Triangles, Thales Theorem, Angle Bisector Theorem, Pythagoras Theorem)\nUnit 5: Coordinate Geometry (Area of Triangle, Slope of Line, Straight Line Equations)"
  },
  {
    label: "Class 12 Computer Science (Core)",
    prepClass: 12,
    text: "Unit 1: Problem Solving & Algorithmic Strategies (Function Specification, LEGB Scope Rule, Big O Complexity, Searching & Sorting)\nUnit 2: Python Programming (Tokens, Control Flow, Functions & Lambda, Strings, Lists, Tuples, Sets, Dictionaries)\nUnit 3: Database & SQL Integration (RDBMS, SQL DDL/DML/DQL Commands, WHERE/ORDER BY/GROUP BY, SQLite3 Module)\nUnit 4: Data Visualization (Matplotlib, Pyplot bar/plot/show, CSV DictReader & DictWriter)"
  },
  {
    label: "Class 10 Science (Physics & Chem)",
    prepClass: 10,
    text: "Unit 1: Laws of Motion (Inertia, Newton's Laws, Linear Momentum, Conservation of Momentum)\nUnit 2: Optics (Refraction, Convex/Concave Lenses, Lens Formula, Human Eye Defects)\nUnit 3: Electricity (Ohm's Law, Resistors in Series & Parallel, Joule's Heating, Electric Power)\nUnit 7: Atoms and Molecules (Atomic Mass, Molecular Mass, Mole Concept, Avogadro's Hypothesis)"
  },
  {
    label: "Class 12 Physics (Electro & Current)",
    prepClass: 12,
    text: "Unit 1: Electrostatics (Coulomb's Law, Electric Dipole, Gauss's Law, Capacitors in Series/Parallel, Van de Graaff)\nUnit 2: Current Electricity (Drift Velocity, Ohm's Law, Kirchhoff's Laws, Wheatstone Bridge, Potentiometer)\nUnit 3: Magnetism and Magnetic Effects (Biot-Savart Law, Ampere's Circuital Law, Cyclotron, Moving Coil Galvanometer)"
  }
];

function AIQuestionGeneratorContent() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showSample, setShowSample] = useState(false);
  const [prefilledSource, setPrefilledSource] = useState("");

  // Policy configuration (10 policies x 5 options)
  const [selectedPolicyId, setSelectedPolicyId] = useState(4); // Default: Balanced Mix
  const [selectedOptionId, setSelectedOptionId] = useState("4A"); // Standard Board Mix
  const [customText, setCustomText] = useState("");

  // Target exam form
  const [form, setForm] = useState({
    examId: "",
    subjectName: "",
    prepClass: 10,
    totalMarks: 50,
    questionCount: 25,
    syllabusText: "",
    samplePaperText: "",
  });

  // Solution 1: Pre-Saved Server Repository Files
  const [serverFiles, setServerFiles] = useState([]);
  const [selectedServerFiles, setSelectedServerFiles] = useState(new Set());
  const [serverFilesLoading, setServerFilesLoading] = useState(false);

  // Solution 2: In-Memory Multi-File FormData + PDF extraction
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [activeGroundingTab, setActiveGroundingTab] = useState("server"); // "server" | "upload" | "presets"

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
      prepClass: preset.prepClass,
      syllabusText: preset.text,
    }));
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
      let res;
      const selectedFilesArray = Array.from(selectedServerFiles);

      // SOLUTION 2: Use FormData if files are uploaded
      if (uploadedFiles.length > 0) {
        const formData = new FormData();
        formData.append("examId", form.examId);
        formData.append("subjectName", form.subjectName);
        formData.append("prepClass", form.prepClass.toString());
        formData.append("totalMarks", form.totalMarks.toString());
        formData.append("questionCount", form.questionCount.toString());
        formData.append("policyId", selectedPolicyId.toString());
        formData.append("optionId", selectedOptionId);
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
          body: formData, // Browser automatically sets multipart/form-data boundary
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
            totalMarks: form.totalMarks,
            questionCount: parseInt(form.questionCount, 10),
            policyId: selectedPolicyId,
            optionId: selectedOptionId,
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
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
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
              <Badge variant="success">HTTP 413 Safe</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Timetable &amp; Syllabus Grounding · Pre-Saved Server Archive &amp; In-Memory Multi-File Uploader · 50 Policy Directives
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/coe-admin/curriculum">
            <Button variant="outline" className="text-xs gap-2 border-border hover:bg-secondary">
              <FolderArchive className="w-4 h-4 text-amber-400" /> Explore Curriculum Library
            </Button>
          </Link>
        </div>
      </div>

      {/* Info on HTTP 413 Mitigation */}
      <div className="p-3.5 rounded-xl bg-violet-500/10 border border-violet-500/25 text-violet-300 text-xs flex items-start gap-2.5">
        <FolderArchive className="w-4 h-4 flex-shrink-0 mt-0.5 text-violet-400" />
        <div>
          <strong>Multi-File Payload Optimization Active:</strong> To avoid browser HTTP 413 (Payload Too Large) and binary serialization crashes, the portal uses:
          <span className="block mt-1 text-slate-300">
            • <strong>Solution 1 (Pre-Saved Server Archive):</strong> Selected syllabi and past papers are read directly from disk (<code className="font-mono bg-violet-500/20 px-1 py-0.5 rounded text-violet-200">data/curriculum/</code>) with 0KB browser upload overhead.
          </span>
          <span className="block text-slate-300">
            • <strong>Solution 2 (In-Memory Text Extraction):</strong> Custom uploaded PDFs are parsed in-memory on the server via <code className="font-mono bg-violet-500/20 px-1 py-0.5 rounded text-violet-200">pdf-parse</code>, merging all documents before passing to Gemini&apos;s 1,000,000+ token context window.
          </span>
        </div>
      </div>

      {/* Security & Gating Notice */}
      <div className="p-3.5 rounded-xl bg-sky-500/10 border border-sky-500/25 text-sky-300 text-xs flex items-start gap-2">
        <Shield className="w-4 h-4 flex-shrink-0 mt-0.5 text-sky-400" />
        <div>
          <strong>Server-Side Protection &amp; Human-in-the-Loop Gating:</strong> The Gemini API key is securely executed only on server routes. Generated questions start in <span className="font-mono text-amber-300 font-bold">needs_review</span> quarantine. The exam cannot be verified or published until the COE explicitly inspects and approves each question.
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
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
          <div>
            <CheckCircle2 className="w-4 h-4 inline mr-1.5 text-emerald-400" />
            <strong>{result.message || "Questions successfully generated!"}</strong>
            {result.processedFilesCount > 0 && ` (${result.processedFilesCount} uploaded file(s) parsed via pdf-parse)`}
            {result.serverCurriculumFilesCount > 0 && ` (${result.serverCurriculumFilesCount} server repository file(s) included)`}
          </div>
          <Link href="/coe-admin/exams" className="underline text-amber-300 font-bold flex items-center gap-1">
            Review in Scheduler <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Target Exam Session & Grounding */}
        <div className="lg:col-span-6 space-y-5">
          <Card className="p-5 border-border space-y-4 text-xs">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" /> 1. Target Exam Session
            </h2>

            {/* Exam Picker */}
            <div>
              <label className="block text-muted-foreground font-semibold mb-1">Select Scheduled Exam Session</label>
              {loading ? (
                <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Loading exam timetable...</div>
              ) : (
                <select
                  value={form.examId}
                  onChange={(e) => handleExamChange(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-secondary border border-border text-foreground font-medium"
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

          {/* Reference Materials & Grounding Center */}
          <Card className="p-5 border-border space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="flex items-center gap-2 font-bold text-foreground text-sm">
                <BookOpen className="w-4 h-4 text-violet-400" /> 2. Reference Materials &amp; Syllabi
              </span>
              <div className="flex items-center gap-1 bg-secondary p-0.5 rounded-lg border border-border">
                <button
                  type="button"
                  onClick={() => setActiveGroundingTab("server")}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                    activeGroundingTab === "server" ? "bg-amber-500 text-slate-950 shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Server Archive ({selectedServerFiles.size})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveGroundingTab("upload")}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                    activeGroundingTab === "upload" ? "bg-amber-500 text-slate-950 shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Upload PDFs ({uploadedFiles.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveGroundingTab("presets")}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                    activeGroundingTab === "presets" ? "bg-amber-500 text-slate-950 shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Quick Presets
                </button>
              </div>
            </div>

            {/* TAB 1: Pre-Saved Server Repository (Solution 1) */}
            {activeGroundingTab === "server" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Select official syllabi, blueprints, and past papers stored directly on the server:</span>
                  <button type="button" onClick={selectAllServerFiles} className="text-amber-400 hover:underline font-bold">
                    {selectedServerFiles.size === serverFiles.length ? "Deselect All" : "Select All"}
                  </button>
                </div>

                {serverFilesLoading ? (
                  <div className="p-4 text-center text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin inline mr-1" /> Loading repository files...</div>
                ) : (
                  <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                    {serverFiles.map((file) => {
                      const isChecked = selectedServerFiles.has(file.name);
                      return (
                        <div
                          key={file.name}
                          onClick={() => toggleServerFile(file.name)}
                          className={`cursor-pointer p-2 rounded-lg border text-xs flex items-center justify-between transition-all ${
                            isChecked
                              ? "bg-amber-500/15 border-amber-500/40 text-amber-200"
                              : "bg-secondary/40 border-border hover:bg-secondary/70 text-muted-foreground"
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            {isChecked ? <CheckSquare className="w-4 h-4 text-amber-400 flex-shrink-0" /> : <Square className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                            <span className="font-mono text-[11.5px] truncate">{file.name}</span>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0 text-[10px]">
                            <span className="px-1.5 py-0.5 rounded bg-background border border-border uppercase font-mono">{file.type}</span>
                            <span>{(file.sizeBytes / 1024).toFixed(1)} KB</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="text-[10px] text-muted-foreground italic">
                  ✓ Selected files are bundled directly by Node.js fs on the server, avoiding browser HTTP 413 upload restrictions.
                </div>
              </div>
            )}

            {/* TAB 2: Upload Custom PDFs (Solution 2 - In-Memory pdf-parse) */}
            {activeGroundingTab === "upload" && (
              <div className="space-y-3">
                <div className="p-4 rounded-xl border border-dashed border-border bg-secondary/30 text-center space-y-2">
                  <FileUp className="w-6 h-6 text-indigo-400 mx-auto" />
                  <p className="text-xs text-foreground font-semibold">Upload Syllabus PDFs, Past Papers, or Text Documents</p>
                  <p className="text-[10px] text-muted-foreground">Files are read in-memory via pdf-parse on the server without payload timeout errors.</p>
                  <label className="inline-block mt-2">
                    <span className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer shadow-md shadow-indigo-600/20">
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
                    <div className="text-[11px] font-bold text-foreground">Attached Upload Files ({uploadedFiles.length}):</div>
                    {uploadedFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-secondary/60 border border-border text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="w-4 h-4 text-sky-400 flex-shrink-0" />
                          <span className="truncate font-mono text-[11px] text-foreground">{file.name}</span>
                          <span className="text-[10px] text-muted-foreground">({(file.size / 1024).toFixed(1)} KB)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeUploadedFile(idx)}
                          className="text-muted-foreground hover:text-rose-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: Quick Presets */}
            {activeGroundingTab === "presets" && (
              <div className="space-y-2">
                <div className="text-[11px] text-muted-foreground">Select a Samacheer Kalvi master syllabus outline:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {QUICK_SYLLABUS_PRESETS.map((preset, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => applyPreset(preset)}
                      className="p-2.5 rounded-xl border border-border bg-secondary/40 hover:bg-secondary text-left transition-all"
                    >
                      <div className="font-bold text-foreground text-xs">{preset.label}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">Click to auto-populate units &amp; concepts</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Syllabus Textarea for manual refinement */}
            <div className="space-y-1 pt-2 border-t border-border">
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
            </div>
          </Card>

          {/* Sample Past Paper Reference */}
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
                  rows={4}
                  value={form.samplePaperText}
                  onChange={(e) => setForm({ ...form, samplePaperText: e.target.value })}
                  placeholder="Paste excerpt from previous year public board exam paper..."
                  className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground font-mono text-xs leading-relaxed"
                />
              </>
            )}
          </Card>
        </div>

        {/* Right Column: 10 Policy Categories & 5 Sub-Options */}
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
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
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

          {/* Action Button */}
          <Button
            onClick={handleGenerate}
            disabled={generating || !form.examId || exams.length === 0}
            className="w-full py-4 text-sm font-black bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xl shadow-amber-500/25 gap-2"
          >
            {generating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Processing Documents &amp; Calling Gemini...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" /> Generate {form.questionCount} Questions [{selectedOptionId}]
                {uploadedFiles.length > 0 && ` + ${uploadedFiles.length} Uploaded File(s)`}
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
