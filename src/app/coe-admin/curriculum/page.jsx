"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  BookOpen, FileText, ArrowLeft, Sparkles, CheckCircle2,
  FolderArchive, Search, ArrowUpRight, Copy, Loader2, CheckSquare, Square,
  Layers, Award, Zap, HelpCircle, ChevronRight, Hash, BookmarkCheck,
  Code, Calculator, FileCheck, Check, Database, ListChecks, History
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
        return { id: String.fromCharCode(65 + idx), text: item };
      }
      if (item && typeof item === "object") {
        return {
          id: String(item.id || item.key || String.fromCharCode(65 + idx)).toUpperCase(),
          text: String(item.text !== undefined ? item.text : item.label !== undefined ? item.label : item.value !== undefined ? item.value : ""),
        };
      }
      return { id: String.fromCharCode(65 + idx), text: String(item || "") };
    });
  }
  if (parsed && typeof parsed === "object") {
    return Object.keys(parsed).map((k) => {
      const val = parsed[k];
      return {
        id: k.toUpperCase(),
        text: typeof val === "object" && val !== null ? String(val.text || val.label || "") : String(val !== undefined && val !== null ? val : ""),
      };
    });
  }
  return [];
}

export default function CurriculumRepositoryPage() {
  const router = useRouter();

  // Navigation Tabs:
  // "master" = State Master Syllabus (Standards 10 & 12)
  // "chapters" = Curriculum Platform & Detailed Chapters
  // "official" = Official Exam Engine (Summative & Either-Or)
  // "practice" = Practice Exam Engine (Formative & Explanations)
  // "formulas" = Formulas, Syntax & Recurring Patterns
  // "past_papers" = Public Exam MCQ Archives (2020-2026)
  // "files" = Server File Repository (Raw JSON / Markdown)
  const [activeTab, setActiveTab] = useState("master");

  const [files, setFiles] = useState([]);
  const [allData, setAllData] = useState({});
  const [loading, setLoading] = useState(true);

  // File explorer states
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [checkedFiles, setCheckedFiles] = useState(new Set());

  // Interactive filters
  const [standardFilter, setStandardFilter] = useState(10); // 10 or 12
  const [subjectFilter, setSubjectFilter] = useState("ALL");
  const [pastPaperSubject, setPastPaperSubject] = useState("MAT-10"); // "MAT-10" or "CSC-12"

  useEffect(() => {
    fetchCurriculumData();
  }, []);

  const fetchCurriculumData = async () => {
    setLoading(true);
    try {
      const [filesRes, allDataRes] = await Promise.all([
        fetch("/api/admin/curriculum"),
        fetch("/api/admin/curriculum?allData=true")
      ]);

      const filesJson = await filesRes.json();
      const allDataJson = await allDataRes.json();

      if (filesRes.ok && filesJson.files) {
        setFiles(filesJson.files);
        if (filesJson.files.length > 0) {
          const first = filesJson.files[0].name;
          setSelectedFile(first);
          setCheckedFiles(new Set([first]));
        }
      }

      if (allDataRes.ok && allDataJson.data) {
        setAllData(allDataJson.data);
        if (filesJson.files?.length > 0) {
          const first = filesJson.files[0].name;
          const content = allDataJson.data[first];
          setFileContent(typeof content === "object" ? JSON.stringify(content, null, 2) : content || "");
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadFileContent = (filename) => {
    setSelectedFile(filename);
    const content = allData[filename];
    setFileContent(typeof content === "object" ? JSON.stringify(content, null, 2) : content || "");
  };

  const toggleCheck = (filename, e) => {
    if (e) e.stopPropagation();
    setCheckedFiles((prev) => {
      const next = new Set(prev);
      if (next.has(filename)) next.delete(filename);
      else next.add(filename);
      return next;
    });
  };

  const selectAll = () => {
    if (checkedFiles.size === files.length) {
      setCheckedFiles(new Set());
    } else {
      setCheckedFiles(new Set(files.map((f) => f.name)));
    }
  };

  const handleCopyToClipboard = (textToCopy) => {
    navigator.clipboard.writeText(textToCopy || fileContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendToExamSetter = (customText, sourceLabel) => {
    const selectedList = Array.from(checkedFiles);
    sessionStorage.setItem("coe_selected_curriculum_files", JSON.stringify(selectedList));
    sessionStorage.setItem("coe_prefill_syllabus", customText || fileContent);
    sessionStorage.setItem("coe_prefill_source", sourceLabel || selectedList.join(", ") || selectedFile || "Curriculum Repository");
    router.push("/coe-admin/ai-questions");
  };

  // Helper getters from allData
  const masterSyllabus = allData["tn_master_syllabus.json"]?.standards || [];
  const curriculumPlatformStandards = allData["curriculum_platform.json"]?.curriculumPlatform?.standards ||
                                     allData["curriculum_platform_and_examination_engine.json"]?.curriculumPlatform?.standards || [];
  const officialExams = allData["official_exam_engine.json"]?.officialExams || [];
  const practiceModules = allData["practice_exam_engine.json"]?.practiceModules || [];
  const revisionModules = allData["revision_modules.json"]?.revisionModules ||
                         allData["curriculum_platform_and_examination_engine.json"]?.revisionModules || {};

  // Standard filter helpers
  const currentMasterStd = masterSyllabus.find((s) => s.standard === standardFilter);
  const currentPlatformStd = curriculumPlatformStandards.find((s) => s.standard === standardFilter);

  const filteredMasterSubjects = currentMasterStd?.subjects?.filter((sub) => {
    if (subjectFilter === "ALL") return true;
    return sub.subjectCode === subjectFilter || sub.name.toLowerCase().includes(subjectFilter.toLowerCase());
  }) || [];

  return (
    <AdminGuard>
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-secondary/80 border border-border">
          <div className="flex items-center gap-3">
            <Link
              href="/coe-admin/dashboard"
              className="p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-foreground">Curriculum &amp; Syllabus Repository</h1>
                <Badge variant="success">Server Archive</Badge>
                <Badge variant="warning">HTTP 413 Safe</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Official Tamil Nadu Samacheer Kalvi master syllabi, blueprints, question engines, and public board papers (2020–2026)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => handleSendToExamSetter()}
              disabled={checkedFiles.size === 0 && !fileContent}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold gap-2 text-xs shadow-lg shadow-amber-500/20"
            >
              <Sparkles className="w-4 h-4" /> Send {checkedFiles.size > 0 ? `(${checkedFiles.size}) Files` : ""} to AI Exam Setter
            </Button>
          </div>
        </div>

        {/* Info Callout */}
        <div className="p-3.5 rounded-xl bg-violet-500/10 border border-violet-500/25 text-violet-300 text-xs flex items-start gap-2.5">
          <FolderArchive className="w-4 h-4 flex-shrink-0 mt-0.5 text-violet-400" />
          <div>
            <strong>HTTP 413 Safe Architecture:</strong> By selecting pre-saved server repository files, the server reads raw text directly from <code className="font-mono bg-violet-500/20 px-1 py-0.5 rounded text-violet-200">data/curriculum/</code> without browser upload payload limits, feeding hundreds of pages directly into Gemini&apos;s 1M+ token context window.
          </div>
        </div>

        {/* Master Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-border">
          {[
            { id: "master", label: "Master Syllabi (10 & 12)", icon: BookOpen, count: masterSyllabus.length ? "9 Subjects" : "" },
            { id: "chapters", label: "Chapter Outlines & Platform", icon: Layers, count: "Detailed Units" },
            { id: "official", label: "Official Exam Engine", icon: Award, count: `${officialExams.length} Exams` },
            { id: "practice", label: "Practice Modules", icon: Zap, count: `${practiceModules.length} Modules` },
            { id: "formulas", label: "Formulas & Syntax Banks", icon: Calculator, count: "High-Yield" },
            { id: "past_papers", label: "Public Papers (2020–2026)", icon: History, count: "14 Sessions" },
            { id: "files", label: "Server File Archive", icon: FolderArchive, count: `${files.length} Files` },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                    : "bg-secondary/40 text-muted-foreground hover:bg-secondary/80 hover:text-foreground border border-border/60"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${isActive ? "bg-slate-900/30 text-slate-950" : "bg-background text-muted-foreground"}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 text-muted-foreground text-xs gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
            <span>Loading master curriculum data &amp; exam engines from server repository...</span>
          </div>
        ) : (
          <>
            {/* ============================================================== */}
            {/* TAB 1: MASTER SYLLABI (STANDARDS 10 & 12)                       */}
            {/* ============================================================== */}
            {activeTab === "master" && (
              <div className="space-y-5">
                {/* Standard & Filter Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-secondary/40 border border-border">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground">Select Standard:</span>
                    <button
                      onClick={() => setStandardFilter(10)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        standardFilter === 10 ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "bg-secondary text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Class 10 (SSLC)
                    </button>
                    <button
                      onClick={() => setStandardFilter(12)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        standardFilter === 12 ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "bg-secondary text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Class 12 (Plus Two)
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-semibold">Filter Subject:</span>
                    <select
                      value={subjectFilter}
                      onChange={(e) => setSubjectFilter(e.target.value)}
                      className="px-3 py-1.5 rounded-lg bg-secondary border border-border text-foreground text-xs font-medium"
                    >
                      <option value="ALL">All Subjects</option>
                      {currentMasterStd?.subjects?.map((sub) => (
                        <option key={sub.subjectCode} value={sub.subjectCode}>
                          {sub.name} ({sub.subjectCode})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Subjects Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {filteredMasterSubjects.map((sub) => {
                    const syllabusString = `Subject: ${sub.name} (${sub.subjectCode})\nStandard: Class ${standardFilter}\nUnits:\n${sub.units?.map((u) => `Unit ${u.unitNumber}: ${u.title}\nConcepts: ${u.coreConcepts?.join(", ")}`).join("\n\n")}`;
                    return (
                      <Card key={sub.subjectCode} className="p-5 border-border space-y-4 flex flex-col justify-between">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between border-b border-border pb-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-foreground text-sm">{sub.name}</span>
                                <Badge variant="neutral">{sub.subjectCode}</Badge>
                                <span className="text-[11px] text-muted-foreground font-mono">({sub.medium} Medium)</span>
                              </div>
                              <p className="text-[11px] text-muted-foreground mt-0.5">{sub.unitsCount || sub.units?.length} Official Units in DGE Syllabus</p>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleSendToExamSetter(syllabusString, `${sub.name} (Class ${standardFilter})`)}
                              className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold gap-1"
                            >
                              <Sparkles className="w-3.5 h-3.5" /> Use in AI Setter
                            </Button>
                          </div>

                          {/* Units List */}
                          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                            {sub.units?.map((u) => (
                              <div key={u.unitNumber} className="p-3 rounded-xl bg-secondary/40 border border-border/80 space-y-1.5">
                                <div className="flex items-center justify-between text-xs font-bold text-foreground">
                                  <span className="flex items-center gap-1.5">
                                    <span className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-300 flex items-center justify-center text-[10px] font-mono">
                                      {u.unitNumber}
                                    </span>
                                    {u.title}
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                  {u.coreConcepts?.map((concept, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-0.5 rounded-md bg-background/80 border border-border text-[10.5px] text-muted-foreground"
                                    >
                                      {concept}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
                          <span>Tamil Nadu State Board Curriculum</span>
                          <button
                            type="button"
                            onClick={() => handleCopyToClipboard(syllabusString)}
                            className="text-amber-400 hover:underline flex items-center gap-1 font-bold"
                          >
                            <Copy className="w-3.5 h-3.5" /> Copy Syllabus
                          </button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 2: CHAPTER OUTLINES & DETAILED PLATFORM                     */}
            {/* ============================================================== */}
            {activeTab === "chapters" && (
              <div className="space-y-5">
                <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/40 border border-border">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground">Standard:</span>
                    <button
                      onClick={() => setStandardFilter(10)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        standardFilter === 10 ? "bg-indigo-600 text-white" : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      Class 10
                    </button>
                    <button
                      onClick={() => setStandardFilter(12)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        standardFilter === 12 ? "bg-indigo-600 text-white" : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      Class 12
                    </button>
                  </div>
                  <span className="text-xs text-muted-foreground">Detailed Chapter Outlines &amp; Descriptions</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {currentPlatformStd?.subjects?.map((sub) => (
                    <Card key={sub.subjectCode} className="p-5 border-border space-y-4">
                      <div className="flex items-center justify-between border-b border-border pb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground text-sm">{sub.name}</span>
                          <Badge variant="neutral">{sub.subjectCode}</Badge>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleSendToExamSetter(JSON.stringify(sub, null, 2), `${sub.name} Chapters`)}
                          className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold gap-1"
                        >
                          <Sparkles className="w-3.5 h-3.5" /> Ground Exam
                        </Button>
                      </div>

                      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                        {sub.units?.map((u) => (
                          <div key={u.unitNumber} className="p-3 rounded-xl bg-secondary/40 border border-border space-y-2">
                            <div className="font-bold text-xs text-foreground flex items-center gap-1.5">
                              <span className="px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 font-mono text-[10px]">
                                Unit {u.unitNumber}
                              </span>
                              {u.title}
                            </div>
                            <div className="space-y-1.5 pl-2 border-l border-border">
                              {u.chapters?.map((ch) => (
                                <div key={ch.chapterNumber} className="text-xs space-y-0.5">
                                  <div className="font-semibold text-foreground text-[11.5px]">• {ch.title}</div>
                                  <div className="text-[11px] text-muted-foreground leading-snug">{ch.description}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 3: OFFICIAL EXAM ENGINE (SUMMATIVE & EITHER-OR)             */}
            {/* ============================================================== */}
            {activeTab === "official" && (
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs flex items-center justify-between">
                  <span>
                    ✓ Official Summative Engines with Part I MCQs, Part II Short Answers, and Part IV Comprehensive Either-Or Questions + Step-wise Evaluation Rubrics.
                  </span>
                  <Badge variant="success">ANSWERS_LOCKED_UNTIL_RESULT_DATE</Badge>
                </div>

                <div className="space-y-6">
                  {officialExams.map((exam) => (
                    <Card key={exam.examId} className="p-6 border-border space-y-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-foreground text-base">{exam.subjectName}</span>
                            <Badge variant="warning">Class {exam.standard}</Badge>
                            <span className="font-mono text-xs text-muted-foreground">({exam.examId})</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Total Marks: {exam.totalMarks} · Duration: {exam.durationMinutes} mins · Medium: {exam.medium}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleSendToExamSetter(JSON.stringify(exam, null, 2), `Official Engine: ${exam.subjectName}`)}
                          className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold gap-1 self-start sm:self-auto"
                        >
                          <Sparkles className="w-3.5 h-3.5" /> Use as Blueprint in AI Setter
                        </Button>
                      </div>

                      {/* Sections */}
                      <div className="space-y-4">
                        {exam.sections?.map((sec) => (
                          <div key={sec.sectionId} className="p-4 rounded-xl bg-secondary/40 border border-border space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-amber-300 flex items-center gap-2">
                                <BookmarkCheck className="w-4 h-4 text-amber-400" />
                                {sec.title}
                              </span>
                              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-background border border-border">
                                {sec.sectionId}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 gap-3">
                              {sec.questions?.map((q, idx) => {
                                const evalKey = exam.postExamEvaluationKey?.[q.questionId];
                                return (
                                  <div key={q.questionId || idx} className="p-3 rounded-lg bg-background/60 border border-border text-xs space-y-2">
                                    <div className="flex items-start justify-between gap-2">
                                      <span className="font-semibold text-foreground">
                                        Q{q.questionNumber}: {q.questionText}
                                      </span>
                                      {q.maxMarks && <Badge variant="neutral">{q.maxMarks} Marks</Badge>}
                                    </div>

                                    {/* MCQ Options if present */}
                                    {q.options && (
                                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
                                        {normalizeOptionsList(q.options).map((opt) => (
                                          <div key={opt.id} className="px-2 py-1 rounded bg-secondary/80 border border-border/80">
                                            <strong>({opt.id})</strong> {opt.text}
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                    {/* Evaluation Rubrics & Key */}
                                    {evalKey && (
                                      <div className="mt-2 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-200 space-y-1">
                                        {evalKey.correctOption && (
                                          <div><strong>Correct Key:</strong> ({evalKey.correctOption.toUpperCase()}) - {evalKey.explanation}</div>
                                        )}
                                        {evalKey.modelAnswer && (
                                          <div><strong>Model Answer:</strong> {evalKey.modelAnswer}</div>
                                        )}
                                        {evalKey.evaluationKeywords && (
                                          <div className="flex flex-wrap gap-1 mt-1">
                                            <span className="text-emerald-400 font-bold">Keywords:</span>
                                            {evalKey.evaluationKeywords.map((kw, i) => (
                                              <span key={i} className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px]">
                                                {kw}
                                              </span>
                                            ))}
                                          </div>
                                        )}
                                        {evalKey.stepRubric && (
                                          <div className="space-y-1 mt-1">
                                            <div className="text-emerald-400 font-bold">Step-wise Rubric:</div>
                                            {evalKey.stepRubric.map((s) => (
                                              <div key={s.step} className="flex justify-between text-[10.5px] font-mono">
                                                <span>Step {s.step}: {s.description}</span>
                                                <span className="font-bold">{s.marks} Marks</span>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 4: PRACTICE MODULES (FORMATIVE & INSTANT FEEDBACK)          */}
            {/* ============================================================== */}
            {activeTab === "practice" && (
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/25 text-sky-300 text-xs flex items-center justify-between">
                  <span>Formative assessment modules with immediate concept feedback, instant explanations, and topic tags.</span>
                  <Badge variant="neutral">IMMEDIATE_FEEDBACK</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {practiceModules.map((module) => (
                    <Card key={module.practiceId} className="p-5 border-border space-y-4">
                      <div className="flex items-center justify-between border-b border-border pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground text-sm">{module.subjectName}</span>
                            <Badge variant="warning">Class {module.standard}</Badge>
                            <span className="text-[10px] font-mono text-muted-foreground">{module.practiceId}</span>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{module.topic}</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleSendToExamSetter(JSON.stringify(module, null, 2), `Practice: ${module.subjectName}`)}
                          className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold gap-1"
                        >
                          <Sparkles className="w-3.5 h-3.5" /> Clone
                        </Button>
                      </div>

                      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                        {module.questions?.map((q, idx) => (
                          <div key={q.questionId || idx} className="p-3 rounded-xl bg-secondary/40 border border-border text-xs space-y-2">
                            <div className="font-semibold text-foreground">
                              {idx + 1}. {q.questionText}
                            </div>
                            <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px]">
                              {normalizeOptionsList(q.options).map((opt) => {
                                const isCorrect = opt.id.toLowerCase() === q.correctAnswer?.toLowerCase();
                                return (
                                  <div
                                    key={opt.id}
                                    className={`px-2 py-1 rounded border ${
                                      isCorrect ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-200 font-bold" : "bg-background/80 border-border text-muted-foreground"
                                    }`}
                                  >
                                    ({opt.id}) {opt.text}
                                  </div>
                                );
                              })}
                            </div>
                            {q.instantExplanation && (
                              <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-[11px] text-sky-200">
                                <strong>Explanation:</strong> {q.instantExplanation}
                              </div>
                            )}
                            {q.conceptTag && (
                              <div className="text-[10px] text-muted-foreground font-mono">
                                Concept Tag: <span className="text-amber-300">{q.conceptTag}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 5: FORMULAS, SYNTAX & RECURRING PATTERNS                    */}
            {/* ============================================================== */}
            {activeTab === "formulas" && (
              <div className="space-y-6">
                {/* Recurring Exam Patterns */}
                <div className="p-5 rounded-2xl bg-secondary/60 border border-border space-y-3">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <History className="w-4 h-4 text-amber-400" /> Recurring Public Board Exam Patterns (2020–2026 Analysis)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {revisionModules.recurringPastExamPatterns?.map((pat, i) => (
                      <div key={i} className="p-3.5 rounded-xl bg-background/80 border border-border text-xs space-y-1">
                        <Badge variant="warning">{pat.subjectCode}</Badge>
                        <p className="text-[11.5px] text-muted-foreground leading-relaxed pt-1">
                          {pat.patternDescription}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Formula & Syntax Banks */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {revisionModules.formulaAndSyntaxBanks?.map((bank, idx) => (
                    <Card key={idx} className="p-5 border-border space-y-4">
                      <div className="flex items-center justify-between border-b border-border pb-3">
                        <div className="flex items-center gap-2">
                          <Calculator className="w-4 h-4 text-indigo-400" />
                          <span className="font-bold text-foreground text-sm">{bank.category}</span>
                          <Badge variant="neutral">{bank.subjectCode}</Badge>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleSendToExamSetter(JSON.stringify(bank, null, 2), `${bank.category} Formula Bank`)}
                          className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold gap-1"
                        >
                          <Sparkles className="w-3.5 h-3.5" /> Use in AI Setter
                        </Button>
                      </div>

                      <div className="space-y-2">
                        {bank.items?.map((item, itemIdx) => (
                          <div key={itemIdx} className="p-2.5 rounded-xl bg-secondary/40 border border-border text-xs flex items-center justify-between">
                            <span className="font-semibold text-foreground">{item.name}</span>
                            <code className="font-mono text-amber-300 bg-background/80 px-2 py-0.5 rounded border border-border text-[11px]">
                              {item.formula || item.syntax}
                            </code>
                          </div>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>

                {/* High-Yield Concept Summaries */}
                <div className="p-5 rounded-2xl bg-secondary/60 border border-border space-y-3">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-violet-400" /> High-Yield Concept Summaries
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {revisionModules.highYieldConceptSummaries?.map((c, i) => (
                      <div key={i} className="p-3.5 rounded-xl bg-background/80 border border-border text-xs space-y-1">
                        <div className="flex items-center gap-2 font-bold text-foreground">
                          <Badge variant="neutral">{c.subjectCode}</Badge>
                          <span>{c.chapterTitle}</span>
                        </div>
                        <p className="text-[11.5px] text-muted-foreground leading-relaxed pt-1">
                          {c.keyTakeaways}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 6: PUBLIC BOARD EXAM MCQ ARCHIVES (2020-2026)              */}
            {/* ============================================================== */}
            {activeTab === "past_papers" && (
              <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-secondary/40 border border-border">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground">Select Subject Archive:</span>
                    <button
                      onClick={() => setPastPaperSubject("MAT-10")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        pastPaperSubject === "MAT-10" ? "bg-amber-500 text-slate-950 font-bold" : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      Class 10 Mathematics (2020–2026)
                    </button>
                    <button
                      onClick={() => setPastPaperSubject("CSC-12")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        pastPaperSubject === "CSC-12" ? "bg-amber-500 text-slate-950 font-bold" : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      Class 12 Computer Science (2020–2026)
                    </button>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => {
                      const fileName = pastPaperSubject === "MAT-10" ? "class10_math_public_exams_2020_2026.md" : "class12_csc_public_exams_2020_2026.md";
                      handleSendToExamSetter(allData[fileName], fileName);
                    }}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Ground AI Exam on 7 Years of Board Papers
                  </Button>
                </div>

                <Card className="p-6 border-border space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <div className="flex items-center gap-2 font-mono text-xs font-bold text-foreground">
                      <FileText className="w-4 h-4 text-amber-400" />
                      {pastPaperSubject === "MAT-10" ? "class10_math_public_exams_2020_2026.md" : "class12_csc_public_exams_2020_2026.md"}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        const fileName = pastPaperSubject === "MAT-10" ? "class10_math_public_exams_2020_2026.md" : "class12_csc_public_exams_2020_2026.md";
                        handleCopyToClipboard(allData[fileName]);
                      }}
                      className="text-xs gap-1"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />} Copy Raw Markdown
                    </Button>
                  </div>

                  <div className="rounded-xl bg-background/80 border border-border p-4 font-mono text-[11.5px] leading-relaxed max-h-[600px] overflow-y-auto whitespace-pre-wrap text-foreground">
                    {pastPaperSubject === "MAT-10" ? allData["class10_math_public_exams_2020_2026.md"] : allData["class12_csc_public_exams_2020_2026.md"]}
                  </div>
                </Card>
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 7: SERVER FILE ARCHIVE (RAW JSON & MARKDOWN EXPLORER)      */}
            {/* ============================================================== */}
            {activeTab === "files" && (
              <div className="space-y-4">
                {/* Search & Actions Bar */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-8 relative">
                    <Search className="w-4 h-4 absolute left-3.5 top-3 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search curriculum documents, chapters, subjects..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div className="md:col-span-4 flex items-center justify-between px-4 py-2 rounded-xl bg-secondary/50 border border-border text-xs text-muted-foreground">
                    <button onClick={selectAll} className="text-amber-400 hover:underline font-bold flex items-center gap-1.5">
                      {checkedFiles.size === files.length ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                      {checkedFiles.size === files.length ? "Deselect All" : "Select All"}
                    </button>
                    <span className="font-mono font-bold text-foreground">
                      {checkedFiles.size} / {files.length} selected
                    </span>
                  </div>
                </div>

                {/* Main Content Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* File List (Left Col) */}
                  <div className="lg:col-span-5 space-y-3">
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">
                      Curriculum Documents ({files.length})
                    </div>
                    <div className="space-y-2">
                      {files
                        .filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase()) || f.category.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((file) => {
                          const isSelected = selectedFile === file.name;
                          const isChecked = checkedFiles.has(file.name);
                          return (
                            <div
                              key={file.name}
                              onClick={() => loadFileContent(file.name)}
                              className={`cursor-pointer w-full text-left p-3.5 rounded-xl border transition-all flex flex-col gap-1.5 ${
                                isSelected
                                  ? "bg-amber-500/15 border-amber-500/40 text-amber-200 shadow-md shadow-amber-500/5"
                                  : "bg-secondary/40 border-border hover:bg-secondary/80 text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2.5 font-mono text-xs font-bold truncate">
                                  <button
                                    type="button"
                                    onClick={(e) => toggleCheck(file.name, e)}
                                    className="text-amber-400 hover:text-amber-300"
                                  >
                                    {isChecked ? <CheckSquare className="w-4 h-4 text-amber-400" /> : <Square className="w-4 h-4 text-muted-foreground" />}
                                  </button>
                                  <FileText className={`w-4 h-4 flex-shrink-0 ${isSelected ? "text-amber-400" : "text-sky-400"}`} />
                                  <span className="truncate">{file.name}</span>
                                </div>
                                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-background border border-border">
                                  {file.type}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-[11px] opacity-75 pl-6">
                                <span>{file.category}</span>
                                <span>{(file.sizeBytes / 1024).toFixed(1)} KB</span>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  {/* Document Viewer (Right Col) */}
                  <div className="lg:col-span-7">
                    <Card className="p-5 border-border space-y-4">
                      <div className="flex items-center justify-between border-b border-border pb-3">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-amber-400" />
                          <span className="font-mono text-xs font-bold text-foreground truncate max-w-xs">
                            {selectedFile || "Select a document to preview"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCopyToClipboard()}
                            disabled={!fileContent}
                            className="text-xs gap-1.5 text-muted-foreground hover:text-foreground"
                          >
                            {copied ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Copied
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" /> Copy Text
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleSendToExamSetter()}
                            disabled={!fileContent}
                            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs gap-1"
                          >
                            <ArrowUpRight className="w-3.5 h-3.5" /> Use in Exam Setter
                          </Button>
                        </div>
                      </div>

                      {!fileContent ? (
                        <div className="p-12 text-center text-xs text-muted-foreground">
                          Select a curriculum markdown or JSON blueprint from the left panel to inspect.
                        </div>
                      ) : (
                        <div className="rounded-xl bg-background/80 border border-border/80 p-4 font-mono text-[11.5px] leading-relaxed max-h-[600px] overflow-y-auto whitespace-pre-wrap text-foreground">
                          {fileContent}
                        </div>
                      )}
                    </Card>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminGuard>
  );
}
