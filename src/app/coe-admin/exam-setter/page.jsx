"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { Button } from "@/components/ui/Button";
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
  Eye,
  Send,
  Loader2,
  BookOpen,
  HelpCircle,
  ArrowRight,
} from "lucide-react";

const NOTEBOOK_LLM_PROMPT = `Act as an expert Tamil Nadu Samacheer Kalvi & DGE Examination Setter.
Generate a complete, authentic examination question paper in JSON format matching this exact schema:

{
  "examTitle": "Official Model Examination 2026",
  "subjectCode": "MAT-10",
  "subjectName": "Mathematics",
  "prepClass": 10,
  "medium": "English",
  "examDate": "2026-11-20",
  "startTime": "09:30 AM",
  "durationMinutes": 180,
  "totalMarks": 100,
  "passingMarks": 35,
  "instructions": "Dear candidate, please read each question calmly. Manage your 180 minutes steadily. Best wishes!",
  "status": "PUBLISHED",
  "paperType": "MODEL",
  "syllabusUnits": [
    {
      "unitNumber": 1,
      "title": "Relations and Functions",
      "chapters": [
        { "chapterNumber": 1, "title": "Ordered Pair & Cartesian Product" }
      ]
    }
  ],
  "questions": [
    {
      "questionNumber": 1,
      "section": "Part I - One Mark Questions",
      "marks": 1,
      "questionText": "If n(A x B) = 6 and A = {1, 3}, then n(B) is:",
      "options": [
        { "id": "A", "text": "1" },
        { "id": "B", "text": "2" },
        { "id": "C", "text": "3" },
        { "id": "D", "text": "6" }
      ],
      "correctAnswer": "C",
      "explanation": "Since n(A x B) = n(A) x n(B) and n(A) = 2, we have 6 = 2 x n(B) => n(B) = 3."
    }
  ]
}

Ensure:
1. "durationMinutes" is set accurately (e.g. 180 for 3 hours, 150 for 2.5 hours).
2. "startTime" is formatted in 12-Hour AM/PM (e.g. "09:30 AM" or "02:00 PM").
3. Each question has detailed step-by-step "explanation" and correct answer.
4. Output ONLY valid JSON with no markdown wrapping or preamble.`;

const SAMPLE_180M_MAT10 = {
  examTitle: "Class 10 Mathematics Public Practice Examination 2026",
  subjectCode: "MAT-10",
  subjectName: "Mathematics",
  prepClass: 10,
  medium: "English",
  examDate: "2026-11-15",
  startTime: "09:30 AM",
  durationMinutes: 180,
  totalMarks: 100,
  passingMarks: 35,
  instructions: "Dear candidate, take a deep breath. Read each question carefully and calmly. Manage your 180 minutes with confidence. Best wishes for your success!",
  status: "PUBLISHED",
  paperType: "PUBLIC_EXAM",
  syllabusUnits: [
    {
      unitNumber: 1,
      title: "Relations and Functions",
      chapters: [
        { chapterNumber: 1, title: "Ordered Pairs & Cartesian Product" },
        { chapterNumber: 2, title: "Relations & Types of Functions" }
      ]
    },
    {
      unitNumber: 2,
      title: "Numbers and Sequences",
      chapters: [
        { chapterNumber: 1, title: "Euclid's Division Lemma" },
        { chapterNumber: 2, title: "Arithmetic & Geometric Progressions" }
      ]
    }
  ],
  questions: [
    {
      questionNumber: 1,
      section: "Part I — 1 Mark Multiple Choice Questions",
      marks: 1,
      questionText: "If n(A × B) = 6 and A = {1, 3}, then n(B) is:",
      options: [
        { id: "A", text: "1" },
        { id: "B", text: "2" },
        { id: "C", text: "3" },
        { id: "D", text: "6" }
      ],
      correctAnswer: "C",
      explanation: "By the multiplication principle of Cartesian products, n(A × B) = n(A) × n(B). Given n(A) = 2 and n(A × B) = 6: 6 = 2 × n(B) ⟹ n(B) = 3."
    },
    {
      questionNumber: 2,
      section: "Part I — 1 Mark Multiple Choice Questions",
      marks: 1,
      questionText: "The least number that is divisible by all numbers from 1 to 10 (both inclusive) is:",
      options: [
        { id: "A", text: "2025" },
        { id: "B", text: "5040" },
        { id: "C", text: "2520" },
        { id: "D", text: "100" }
      ],
      correctAnswer: "C",
      explanation: "The LCM of numbers 1 through 10 is 2³ × 3² × 5 × 7 = 8 × 9 × 5 × 7 = 2520."
    },
    {
      questionNumber: 3,
      section: "Part I — 1 Mark Multiple Choice Questions",
      marks: 1,
      questionText: "If the first term of an A.P. is a and common difference is d, then the sum of first n terms is given by:",
      options: [
        { id: "A", text: "n/2 [2a + (n - 1)d]" },
        { id: "B", text: "n/2 [a + (n - 1)d]" },
        { id: "C", text: "n [2a + (n - 1)d]" },
        { id: "D", text: "a + (n - 1)d" }
      ],
      correctAnswer: "A",
      explanation: "The standard arithmetic series formula is S_n = (n/2) * [2a + (n - 1)d]."
    },
    {
      questionNumber: 4,
      section: "Part I — 1 Mark Multiple Choice Questions",
      marks: 1,
      questionText: "Which of the following is a relation from A = {1, 2, 3, 4} to B = {4, 7}?",
      options: [
        { id: "A", text: "{(1, 4), (2, 7), (3, 8)}" },
        { id: "B", text: "{(1, 4), (2, 7), (3, 4), (4, 7)}" },
        { id: "C", text: "{(4, 1), (7, 2)}" },
        { id: "D", text: "{(1, 7), (2, 4), (5, 4)}" }
      ],
      correctAnswer: "B",
      explanation: "Every element of the relation must be an ordered pair (a, b) where a ∈ A and b ∈ B. Only option B satisfies this completely."
    },
    {
      questionNumber: 5,
      section: "Part I — 1 Mark Multiple Choice Questions",
      marks: 1,
      questionText: "Euclid's division lemma states that for positive integers a and b, there exist unique integers q and r such that a = bq + r, where r must satisfy:",
      options: [
        { id: "A", text: "1 < r < b" },
        { id: "B", text: "0 ≤ r < b" },
        { id: "C", text: "0 < r ≤ b" },
        { id: "D", text: "0 < r < b" }
      ],
      correctAnswer: "B",
      explanation: "By Euclid's Division Lemma, the remainder r is non-negative and strictly less than the divisor b: 0 ≤ r < b."
    }
  ]
};

const SAMPLE_180M_PHY12 = {
  examTitle: "Class 12 Physics Higher Secondary Public Board Examination 2026",
  subjectCode: "PHY-12",
  subjectName: "Physics",
  prepClass: 12,
  medium: "English",
  examDate: "2026-11-22",
  startTime: "09:30 AM",
  durationMinutes: 180,
  totalMarks: 70,
  passingMarks: 24,
  instructions: "Dear candidate, manage your 180 minutes with calm confidence. Draw neat diagrams where necessary. Best wishes!",
  status: "PUBLISHED",
  paperType: "PUBLIC_EXAM",
  syllabusUnits: [
    {
      unitNumber: 1,
      title: "Electrostatics",
      chapters: [
        { chapterNumber: 1, title: "Coulomb's Law and Electric Field" },
        { chapterNumber: 2, title: "Gauss Law and Electric Potential" }
      ]
    }
  ],
  questions: [
    {
      questionNumber: 1,
      section: "Part I — Multiple Choice",
      marks: 1,
      questionText: "Two point charges +3 μC and +4 μC repel each other with a force of 10 N. If a charge of -6 μC is added to each of them, then the new force will be:",
      options: [
        { id: "A", text: "5 N (attractive)" },
        { id: "B", text: "10 N (repulsive)" },
        { id: "C", text: "20 N (attractive)" },
        { id: "D", text: "5 N (repulsive)" }
      ],
      correctAnswer: "A",
      explanation: "Initial charges: q1 = 3, q2 = 4 (product = 12). New charges: q1' = 3 - 6 = -3 μC, q2' = 4 - 6 = -2 μC (product = 6). Since product is halved and charges have like signs, force magnitude is halved to 5 N, and signs are like so it remains repulsive, or if opposite attractive based on resultant."
    },
    {
      questionNumber: 2,
      section: "Part I — Multiple Choice",
      marks: 1,
      questionText: "The electric flux through a closed Gaussian surface enclosing an electric dipole is:",
      options: [
        { id: "A", text: "q / ε₀" },
        { id: "B", text: "2q / ε₀" },
        { id: "C", text: "Zero" },
        { id: "D", text: "Infinite" }
      ],
      correctAnswer: "C",
      explanation: "By Gauss's law, total electric flux Φ = q_enclosed / ε₀. An electric dipole consists of equal and opposite charges (+q and -q), so net enclosed charge is +q - q = 0. Therefore, Φ = 0."
    }
  ]
};

const SAMPLE_180M_CS12 = {
  examTitle: "Class 12 Computer Science Official Examination 2026",
  subjectCode: "CS-12",
  subjectName: "Computer Science",
  prepClass: 12,
  medium: "English",
  examDate: "2026-11-25",
  startTime: "02:00 PM",
  durationMinutes: 180,
  totalMarks: 70,
  passingMarks: 24,
  instructions: "Dear candidate, read each algorithm and Python syntax question carefully. Manage your time calmly.",
  status: "PUBLISHED",
  paperType: "PUBLIC_EXAM",
  syllabusUnits: [
    {
      unitNumber: 1,
      title: "Problem Solving and Python",
      chapters: [
        { chapterNumber: 1, title: "Functions and Scoping" },
        { chapterNumber: 2, title: "Data Abstraction and Object Orientation" }
      ]
    }
  ],
  questions: [
    {
      questionNumber: 1,
      section: "Part I — Objectives",
      marks: 1,
      questionText: "In Python, which keyword is used to define an anonymous or in-line function?",
      options: [
        { id: "A", text: "def" },
        { id: "B", text: "lambda" },
        { id: "C", text: "inline" },
        { id: "D", text: "function" }
      ],
      correctAnswer: "B",
      explanation: "The 'lambda' keyword in Python creates small, anonymous function objects at runtime."
    }
  ]
};

export default function ExamSetterPage() {
  const [jsonInput, setJsonInput] = useState(JSON.stringify(SAMPLE_180M_MAT10, null, 2));
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [parsedExam, setParsedExam] = useState(SAMPLE_180M_MAT10);
  const [parseError, setParseError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successReceipt, setSuccessReceipt] = useState(null);

  const handleJsonChange = (val) => {
    setJsonInput(val);
    try {
      const parsed = JSON.parse(val);
      setParsedExam(parsed);
      setParseError("");
    } catch (e) {
      setParseError(e.message);
    }
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(NOTEBOOK_LLM_PROMPT);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 3000);
  };

  const loadPreset = (preset) => {
    const formatted = JSON.stringify(preset, null, 2);
    setJsonInput(formatted);
    setParsedExam(preset);
    setParseError("");
    setSuccessReceipt(null);
  };

  const handleDeployExam = async (overrideStatus) => {
    setSubmitting(true);
    setSuccessReceipt(null);
    try {
      let payload = JSON.parse(jsonInput);
      if (overrideStatus) {
        payload.status = overrideStatus;
      }

      const res = await fetch("/api/admin/exam-setter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to deploy exam schedule.");
      }

      setSuccessReceipt(data);
    } catch (err) {
      alert(`Deployment Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminGuard>
      <div className="page-content space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-float-up">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <FileJson className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-[#f0f0ff]">
                  Exam Setter & JSON Ingestion Engine
                </h1>
                <span className="badge badge-violet">NotebookLLM Ready</span>
              </div>
              <p className="text-xs text-[#5c5c8a]">
                Paste question papers and schedules from NotebookLLM or AI exam setters to publish immediately.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyPrompt}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold glass-sm border border-violet-500/30 text-violet-300 hover:text-white transition-all hover:bg-violet-600/20"
            >
              {copiedPrompt ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copiedPrompt ? "Prompt Copied!" : "Copy NotebookLLM Prompt"}
            </button>
            <Link href="/coe-admin/exams">
              <Button size="sm" variant="outline" className="text-xs">
                View All Exams →
              </Button>
            </Link>
          </div>
        </div>

        {/* Success Receipt Banner */}
        {successReceipt && (
          <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 animate-scale-in space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                {successReceipt.message}
              </div>
              <span className="badge badge-emerald">Live in SQLite</span>
            </div>
            {successReceipt.summary && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 glass-sm rounded-xl text-xs">
                <div>
                  <span className="text-[#5c5c8a] block text-[10px]">Subject</span>
                  <span className="font-bold text-[#f0f0ff]">{successReceipt.summary.subject}</span>
                </div>
                <div>
                  <span className="text-[#5c5c8a] block text-[10px]">Duration</span>
                  <span className="font-bold text-[#f0f0ff]">{successReceipt.summary.duration}</span>
                </div>
                <div>
                  <span className="text-[#5c5c8a] block text-[10px]">Questions</span>
                  <span className="font-bold text-[#f0f0ff]">{successReceipt.summary.questionsCount} Questions</span>
                </div>
                <div>
                  <span className="text-[#5c5c8a] block text-[10px]">Portal Status</span>
                  <span className="badge badge-emerald">{successReceipt.summary.status}</span>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2 pt-1">
              <Link href="/coe-admin/exams">
                <Button size="xs" variant="success">Inspect in Exam Schedules</Button>
              </Link>
              <Link href="/student/dashboard">
                <Button size="xs" variant="outline">Preview Student Portal</Button>
              </Link>
            </div>
          </div>
        )}

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-[#5c5c8a] font-semibold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Fast Presets:
          </span>
          <button
            onClick={() => loadPreset(SAMPLE_180M_MAT10)}
            className="px-2.5 py-1 rounded-lg text-xs font-medium glass-sm border border-violet-500/20 text-[#a8a8d0] hover:text-white hover:bg-violet-500/10"
          >
            Class 10 Math (180 mins / 3 hrs)
          </button>
          <button
            onClick={() => loadPreset(SAMPLE_180M_PHY12)}
            className="px-2.5 py-1 rounded-lg text-xs font-medium glass-sm border border-violet-500/20 text-[#a8a8d0] hover:text-white hover:bg-violet-500/10"
          >
            Class 12 Physics (180 mins / 3 hrs)
          </button>
          <button
            onClick={() => loadPreset(SAMPLE_180M_CS12)}
            className="px-2.5 py-1 rounded-lg text-xs font-medium glass-sm border border-violet-500/20 text-[#a8a8d0] hover:text-white hover:bg-violet-500/10"
          >
            Class 12 Computer Science (180 mins)
          </button>
        </div>

        {/* Main 2-Column Work Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: JSON Input Textarea */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#f0f0ff] flex items-center gap-1.5">
                <FileJson className="w-4 h-4 text-violet-400" />
                Raw Master JSON Payload
              </label>
              {parseError ? (
                <span className="text-[11px] text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Invalid JSON
                </span>
              ) : (
                <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Valid JSON Schema
                </span>
              )}
            </div>

            <textarea
              rows={22}
              value={jsonInput}
              onChange={(e) => handleJsonChange(e.target.value)}
              className="w-full p-4 rounded-2xl bg-[rgba(13,13,26,0.9)] border border-[rgba(124,58,237,0.3)] text-emerald-300 font-mono text-xs leading-relaxed focus:outline-none focus:border-violet-400 shadow-inner"
              placeholder="Paste the JSON from NotebookLLM here..."
            />

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <span className="text-xs text-[#5c5c8a]">
                Questions in payload:{" "}
                <strong className="text-[#f0f0ff]">{parsedExam?.questions?.length || 0}</strong>
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={submitting || Boolean(parseError)}
                  onClick={() => handleDeployExam("DRAFT")}
                >
                  Save as Draft
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={submitting || Boolean(parseError)}
                  onClick={() => handleDeployExam("PUBLISHED")}
                  className="gap-1.5 shadow-lg shadow-violet-600/30"
                >
                  {submitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Deploying…</>
                  ) : (
                    <><Send className="w-4 h-4" /> Publish Exam & Questions Immediately</>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Right: Live Visual Verification Panel */}
          <div className="lg:col-span-5 space-y-4">
            <div className="glass rounded-2xl p-5 border border-violet-500/25 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[rgba(124,58,237,0.15)]">
                <h3 className="font-bold text-sm text-[#f0f0ff] flex items-center gap-2">
                  <Eye className="w-4 h-4 text-violet-400" />
                  Live Exam Preview
                </h3>
                <span className="badge badge-amber text-[10px]">Pre-Flight Check</span>
              </div>

              {parseError ? (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs">
                  <p className="font-bold mb-1">JSON Syntax Error</p>
                  <p className="font-mono text-[11px]">{parseError}</p>
                </div>
              ) : (
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-[10px] text-[#5c5c8a] uppercase font-bold block">Title</span>
                    <p className="font-bold text-[#f0f0ff] text-sm">{parsedExam?.examTitle || "Untitled Exam"}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-3 glass-sm rounded-xl">
                    <div>
                      <span className="text-[10px] text-[#5c5c8a] block">Subject</span>
                      <span className="font-bold text-[#f0f0ff]">{parsedExam?.subjectName || parsedExam?.subjectCode}</span>
                      <span className="font-mono text-[10px] text-violet-300 block">{parsedExam?.subjectCode}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#5c5c8a] block">Standard</span>
                      <span className="badge badge-violet text-[10px]">Class {parsedExam?.prepClass}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 p-3 glass-sm rounded-xl">
                    <div>
                      <span className="text-[10px] text-[#5c5c8a] block">Duration</span>
                      <span className="font-bold text-amber-300 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {parsedExam?.durationMinutes || 180} mins ({(parsedExam?.durationMinutes || 180) / 60} hrs)
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#5c5c8a] block">Total Marks</span>
                      <span className="font-bold text-emerald-300 flex items-center gap-1">
                        <Award className="w-3.5 h-3.5" />
                        {parsedExam?.totalMarks || 100} Marks
                      </span>
                    </div>
                  </div>

                  <div className="p-3 glass-sm rounded-xl space-y-1">
                    <span className="text-[10px] text-[#5c5c8a] block">Scheduled Conducting Time</span>
                    <div className="flex items-center gap-2 font-mono text-xs text-[#f0f0ff]">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{parsedExam?.examDate || "2026-11-15"}</span>
                      <span>•</span>
                      <span>{parsedExam?.startTime || "09:30 AM"}</span>
                    </div>
                  </div>

                  {parsedExam?.instructions && (
                    <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-[11px] text-[#c4b5fd] italic">
                      "{parsedExam.instructions}"
                    </div>
                  )}

                  {/* Questions Preview Carousel / List */}
                  <div className="space-y-2 pt-2 border-t border-[rgba(124,58,237,0.15)]">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#f0f0ff]">
                        Questions ({parsedExam?.questions?.length || 0})
                      </span>
                      <span className="text-[10px] text-[#5c5c8a]">Step-by-step solutions linked</span>
                    </div>

                    <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                      {parsedExam?.questions?.slice(0, 6).map((q, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl glass-sm border border-[rgba(124,58,237,0.15)] space-y-1 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#f0f0ff]">Q{q.questionNumber || idx + 1}</span>
                            <span className="badge badge-emerald text-[9px]">{q.marks || 1}M</span>
                          </div>
                          <p className="text-[#a8a8d0] line-clamp-2">{q.questionText}</p>
                          <div className="flex items-center justify-between text-[10px] pt-1 text-[#5c5c8a]">
                            <span>Correct: <strong className="text-emerald-400">{q.correctAnswer}</strong></span>
                            <span>{q.options?.length || 0} options</span>
                          </div>
                        </div>
                      ))}
                      {(parsedExam?.questions?.length || 0) > 6 && (
                        <p className="text-center text-[10px] text-[#5c5c8a] pt-1">
                          + {(parsedExam.questions.length - 6)} more questions included in payload
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
