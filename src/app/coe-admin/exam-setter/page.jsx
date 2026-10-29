"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  FileJson,
  Sparkles,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Clock,
  Award,
  Layers,
  Send,
  Loader2,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Code2,
  BookOpen
} from "lucide-react";

// Generate exact template matching Phase 5.2
function generateExactTemplate({ sub, date, time, total_marks, language, level, count }) {
  const qCount = parseInt(count, 10) || (total_marks <= 25 ? 10 : 20);
  const questions = [];

  for (let i = 1; i <= qCount; i++) {
    questions.push({
      id: i,
      question: `<<QUESTION_${i}>>`,
      options: {
        A: `<<OPTION_A>>`,
        B: `<<OPTION_B>>`,
        C: `<<OPTION_C>>`,
        D: `<<OPTION_D>>`
      },
      answer: `<<CORRECT_OPTION_LETTER>>`
    });
  }

  return {
    sub: sub || "TAM",
    date: date || new Date().toISOString().slice(0, 10),
    time: time || "09:30",
    total_marks: parseInt(total_marks, 10) || 25,
    language: language || "Tamil",
    level: level || "10 police-level questions",
    questions
  };
}

// Sample Completed 25-Mark Tamil Paper for instant demonstration
const SAMPLE_25M_TAMIL = {
  sub: "TAM-10",
  date: "2026-11-20",
  time: "09:30",
  total_marks: 25,
  language: "Tamil",
  level: "10 police-level questions",
  questions: [
    {
      id: 1,
      question: "தமிழ்நாட்டின் அரசு முத்திரையில் பொறிக்கப்பட்டுள்ள கோவில் கோபுரம் எது?",
      options: {
        A: "மதுரை மீனாட்சி அம்மன் கோவில்",
        B: "ஸ்ரீவில்லிபுத்தூர் ஆண்டாள் கோவில்",
        C: "தஞ்சை பெரிய கோவில்",
        D: "காஞ்சி கைலாசநாதர் கோவில்"
      },
      answer: "B"
    },
    {
      id: 2,
      question: "‘காற்றே வா’ என்னும் தலைப்பில் வசன கவிதை இயற்றியவர் யார்?",
      options: {
        A: "மகாகவி பாரதியார்",
        B: "பாவேந்தர் பாரதிதாசன்",
        C: "கவிமணி தேசிக விநாயகம் பிள்ளை",
        D: "நாமக்கல் கவிஞர்"
      },
      answer: "A"
    },
    {
      id: 3,
      question: "‘செய்குதம்பி பாவலர்’ அவர்களின் சிறப்பான கலைத்திறன் பட்டம் எது?",
      options: {
        A: "கவியரசு",
        B: "சதாவதானி",
        C: "பாவலரேறு",
        D: "சொல்லின் செல்வர்"
      },
      answer: "B"
    },
    {
      id: 4,
      question: "முல்லைப்பாட்டு நூலின் ஆசிரியர் யார் மற்றும் அது எந்த இலக்கிய வகையைச் சார்ந்தது?",
      options: {
        A: "நப்பூதனார் — பத்துப்பாட்டு",
        B: "கபிலர் — எட்டுத்தொகை",
        C: "நக்கீரர் — பதினெண்கீழ்க்கணக்கு",
        D: "பரணர் — சங்க மருவிய காலம்"
      },
      answer: "A"
    },
    {
      id: 5,
      question: "சிலப்பதிகாரத்தை இயற்றிய இளங்கோவடிகள் எந்த நாட்டின் அரச மரபினர்?",
      options: {
        A: "சேர நாடு",
        B: "சோழ நாடு",
        C: "பாண்டிய நாடு",
        D: "பல்லவ நாடு"
      },
      answer: "A"
    },
    {
      id: 6,
      question: "தொகைநிலைத் தொடர்கள் எத்தனை வகைப்படும்?",
      options: {
        A: "நான்கு",
        B: "ஐந்து",
        C: "ஆறு",
        D: "எட்டு"
      },
      answer: "C"
    },
    {
      id: 7,
      question: "‘கெடுப்பதூஉம் கெட்டார்க்குச் சார்வாய்’ — இதில் பயின்று வந்துள்ள அளபெடை எது?",
      options: {
        A: "செய்யுளிசை அளபெடை",
        B: "இன்னிசை அளபெடை",
        C: "சொல்லிசை அளபெடை",
        D: "ஒற்றளபெடை"
      },
      answer: "B"
    },
    {
      id: 8,
      question: "கம்பராமாயணத்தில் உள்ள காண்டங்களின் மொத்த எண்ணிக்கை எத்தனை?",
      options: {
        A: "ஐந்து காண்டங்கள்",
        B: "ஆறு காண்டங்கள்",
        C: "ஏழு காண்டங்கள்",
        D: "எட்டு காண்டங்கள்"
      },
      answer: "B"
    },
    {
      id: 9,
      question: "‘செங்காந்தள்’ என்பதன் இலக்கணக் குறிப்பு என்ன?",
      options: {
        A: "வினைத்தொகை",
        B: "பண்புத்தொகை",
        C: "உம்மைத்தொகை",
        D: "வேற்றுமைத்தொகை"
      },
      answer: "B"
    },
    {
      id: 10,
      question: "திருக்குறளில் உள்ள மொத்த அதிகாரங்கள் மற்றும் குறட்பாக்களின் எண்ணிக்கை யாது?",
      options: {
        A: "133 அதிகாரங்கள், 1330 குறள்கள்",
        B: "130 அதிகாரங்கள், 1300 குறள்கள்",
        C: "140 அதிகாரங்கள், 1400 குறள்கள்",
        D: "125 அதிகாரங்கள், 1250 குறள்கள்"
      },
      answer: "A"
    }
  ]
};

function ExamSetterContent() {
  const searchParams = useSearchParams();
  const targetExamId = searchParams.get("examId") || "";
  const paramSub = searchParams.get("sub") || "TAM-10";
  const paramDate = searchParams.get("date") || new Date().toISOString().slice(0, 10);
  const paramTime = searchParams.get("time") || "09:30";
  const paramMarks = searchParams.get("marks") || "25";
  const paramLang = searchParams.get("lang") || "Tamil";
  const paramCount = searchParams.get("count") || "10";

  // Form Configuration
  const [examId, setExamId] = useState(targetExamId);
  const [sub, setSub] = useState(paramSub);
  const [date, setDate] = useState(paramDate);
  const [time, setTime] = useState(paramTime);
  const [totalMarks, setTotalMarks] = useState(paramMarks);
  const [language, setLanguage] = useState(paramLang);
  const [level, setLevel] = useState("10 police-level questions");
  const [questionCount, setQuestionCount] = useState(paramCount);

  // JSON Preview & Paste states
  const [generatedJson, setGeneratedJson] = useState("");
  const [pastedJson, setPastedJson] = useState("");
  const [copied, setCopied] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [validationSuccess, setValidationSuccess] = useState("");
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  // Regenerate template whenever parameters change
  useEffect(() => {
    const template = generateExactTemplate({
      sub,
      date,
      time,
      total_marks: totalMarks,
      language,
      level,
      count: questionCount
    });
    setGeneratedJson(JSON.stringify(template, null, 2));
  }, [sub, date, time, totalMarks, language, level, questionCount]);

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(generatedJson);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      alert("Failed to copy automatically. Please select text manually.");
    }
  };

  const handleValidatePasted = () => {
    setValidating(true);
    setValidationErrors([]);
    setValidationSuccess("");

    if (!pastedJson.trim()) {
      setValidationErrors(["Please paste JSON content to validate."]);
      setValidating(false);
      return;
    }

    try {
      const parsed = JSON.parse(pastedJson);
      const errors = [];

      if (!parsed.sub) errors.push("Missing top-level 'sub' field (subject code e.g. 'TAM-10').");
      if (!parsed.questions || !Array.isArray(parsed.questions)) {
        errors.push("Missing 'questions' array.");
      } else if (parsed.questions.length === 0) {
        errors.push("'questions' array is empty.");
      } else {
        parsed.questions.forEach((q, idx) => {
          const num = q.id || idx + 1;
          if (!q.question || q.question.includes("<<QUESTION")) {
            errors.push(`Question #${num}: Question text is missing or still contains template placeholder.`);
          }
          if (!q.options || typeof q.options !== "object") {
            errors.push(`Question #${num}: Missing 'options' object with A, B, C, D.`);
          } else {
            ["A", "B", "C", "D"].forEach((c) => {
              if (!q.options[c] || q.options[c].includes("<<OPTION")) {
                errors.push(`Question #${num}: Choice '${c}' is missing or has template placeholder.`);
              }
            });
          }
          const rawAns = String(q.answer || "").trim().toUpperCase();
          if (!["A", "B", "C", "D"].includes(rawAns)) {
            errors.push(`Question #${num}: 'answer' must be one of 'A', 'B', 'C', or 'D'.`);
          }
        });
      }

      if (errors.length > 0) {
        setValidationErrors(errors);
      } else {
        setValidationSuccess(`✓ Valid JSON schema! ${parsed.questions.length} questions ready for import.`);
      }
    } catch (e) {
      setValidationErrors([`JSON Syntax Error: ${e.message}`]);
    } finally {
      setValidating(false);
    }
  };

  const handleImportIntoExam = async () => {
    setImporting(true);
    setImportResult(null);
    try {
      const res = await fetch("/api/admin/exams/import-json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId,
          jsonContent: pastedJson
        })
      });

      const data = await res.json();
      if (res.ok) {
        setImportResult({ success: true, message: data.message });
      } else {
        setImportResult({ success: false, message: data.error || data.message, errors: data.errors });
      }
    } catch (e) {
      setImportResult({ success: false, message: "Network error transmitting JSON to server." });
    } finally {
      setImporting(false);
    }
  };

  const loadSample = (sampleObj) => {
    setPastedJson(JSON.stringify(sampleObj, null, 2));
    setValidationErrors([]);
    setValidationSuccess(`Loaded sample for ${sampleObj.sub} (${sampleObj.total_marks} Marks). Click Validate & Import!`);
  };

  return (
    <div className="page-content space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-float-up">
        <div className="flex items-center gap-3">
          <Link
            href="/coe-admin/exams"
            className="p-2 rounded-xl border border-border bg-card hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
            title="Return to Exam Schedules"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-foreground">AI Exam Setter & JSON Engine</h1>
              <Badge variant="purple" className="font-mono text-[10px]">Phase 5 Compliant</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Generate exact schema templates, copy to NotebookLM, and paste back verified examinations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/coe-admin/exams">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Calendar className="w-3.5 h-3.5" /> Examination Schedules
            </Button>
          </Link>
        </div>
      </div>

      {/* Grid: Left Template Config & Generator (5 cols) | Right Paste & Validator (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Template Config & Copy Box */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border-border space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-violet-400" />
                Template Parameters (Phase 5.2)
              </span>
              <span className="badge badge-cyan text-[10px]">{sub}</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-muted-foreground font-semibold block mb-1">Subject Code</label>
                <input
                  type="text"
                  value={sub}
                  onChange={(e) => setSub(e.target.value.toUpperCase())}
                  className="input-field font-mono"
                  placeholder="e.g. TAM-10, MAT-10, CSC-12"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted-foreground font-semibold block mb-1">Exam Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="input-field font-mono"
                  />
                </div>
                <div>
                  <label className="text-muted-foreground font-semibold block mb-1">Start Time (HH:MM)</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="input-field font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted-foreground font-semibold block mb-1">Total Marks</label>
                  <input
                    type="number"
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(e.target.value)}
                    className="input-field font-mono"
                  />
                </div>
                <div>
                  <label className="text-muted-foreground font-semibold block mb-1">Question Count</label>
                  <input
                    type="number"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(e.target.value)}
                    className="input-field font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted-foreground font-semibold block mb-1">Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="input-field cursor-pointer"
                  >
                    <option value="Tamil">Tamil (தமிழ்)</option>
                    <option value="English">English</option>
                  </select>
                </div>
                <div>
                  <label className="text-muted-foreground font-semibold block mb-1">Exam Level</label>
                  <input
                    type="text"
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="input-field text-xs"
                    placeholder="e.g. 10 police-level questions"
                  />
                </div>
              </div>
            </div>

            {/* Template JSON Output with 1-Click Copy */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-foreground">Exact Output JSON Template</span>
                <Button
                  variant={copied ? "success" : "primary"}
                  size="sm"
                  onClick={handleCopyJson}
                  className="gap-1.5 text-xs py-1 px-3 shadow-md"
                >
                  {copied ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy JSON</>}
                </Button>
              </div>

              <div className="relative rounded-xl border border-border bg-slate-950/70 p-3 max-h-56 overflow-y-auto">
                <pre className="text-[11px] font-mono text-emerald-400 whitespace-pre">
                  {generatedJson}
                </pre>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Paste & Import Area */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="border-border space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-border pb-3">
              <div>
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Paste & Import Completed JSON (NotebookLM / AI Output)
                </span>
                <p className="text-[11px] text-muted-foreground">
                  Paste the generated questions. They will be validated against the exact schema and saved into the exam.
                </p>
              </div>

              {/* Sample loader helper */}
              <button
                type="button"
                onClick={() => loadSample(SAMPLE_25M_TAMIL)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-violet-500/15 border border-violet-500/30 text-violet-300 hover:bg-violet-500/25 font-bold transition-all whitespace-nowrap cursor-pointer"
              >
                Load 25-Mark Tamil Sample →
              </button>
            </div>

            {/* Monospace Textarea */}
            <div>
              <textarea
                value={pastedJson}
                onChange={(e) => {
                  setPastedJson(e.target.value);
                  setValidationErrors([]);
                  setValidationSuccess("");
                  setImportResult(null);
                }}
                rows={14}
                className="w-full p-3 rounded-xl bg-slate-950/80 border border-border font-mono text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500"
                placeholder='Paste completed JSON here, e.g.:
{
  "sub": "TAM-10",
  "date": "2026-11-20",
  "time": "09:30",
  "total_marks": 25,
  "language": "Tamil",
  "level": "10 police-level questions",
  "questions": [ ... ]
}'
              />
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={handleValidatePasted}
                disabled={validating || !pastedJson.trim()}
                className="gap-1.5 text-xs"
              >
                {validating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                Validate Schema
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={handleImportIntoExam}
                disabled={importing || !pastedJson.trim() || validationErrors.length > 0}
                className="gap-2 text-xs font-bold bg-gradient-to-r from-violet-600 to-indigo-600 shadow-md shadow-violet-500/25"
              >
                {importing ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Importing into Exam...</>
                ) : (
                  <><Send className="w-3.5 h-3.5" /> Accept &amp; Import into Exam (Phase 5/10) <ArrowRight className="w-3.5 h-3.5" /></>
                )}
              </Button>
            </div>

            {/* Validation Feedback */}
            {validationSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-scale-in">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                <span>{validationSuccess}</span>
              </div>
            )}

            {validationErrors.length > 0 && (
              <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/35 text-rose-300 text-xs space-y-1.5 animate-scale-in">
                <div className="flex items-center gap-1.5 font-bold text-rose-400">
                  <AlertCircle className="w-4 h-4" />
                  <span>Validation Reported {validationErrors.length} Issue(s):</span>
                </div>
                <ul className="list-disc list-inside space-y-1 pl-1 text-[11px] max-h-36 overflow-y-auto">
                  {validationErrors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {importResult && (
              <div className={`p-3.5 rounded-xl border text-xs animate-scale-in ${
                importResult.success
                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300 font-semibold"
                  : "bg-rose-500/15 border-rose-500/30 text-rose-300"
              }`}>
                <div className="flex items-center gap-2">
                  {importResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
                  <span>{importResult.message}</span>
                </div>
                {importResult.success && (
                  <div className="mt-2 pt-2 border-t border-emerald-500/20 flex gap-2">
                    <Link href="/coe-admin/exams">
                      <Button variant="outline" size="sm" className="text-xs">
                        View Updated Schedule in COE Master Control →
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function ExamSetterPage() {
  return (
    <AdminGuard>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-6 h-6 animate-spin text-violet-400" />
        </div>
      }>
        <ExamSetterContent />
      </Suspense>
    </AdminGuard>
  );
}
