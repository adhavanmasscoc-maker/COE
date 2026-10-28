"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  Calendar,
  Clock,
  PlusCircle,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Trash2,
  FileText,
  HelpCircle,
  Eye,
  Loader2,
  RefreshCw,
  Layers,
  Sparkles,
  ChevronRight,
  X,
  Activity,
  Info,
  Users,
  Download,
  Printer,
  Zap,
  FileCheck,
  BookOpen,
  Award
} from "lucide-react";
import { ExamLifecycleStepper, calculateExamPhase } from "@/components/admin/ExamLifecycleStepper";

function COEAdminExamsContent() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status") || "ALL";
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState("ALL"); // ALL, 10, 12
  const [statusFilter, setStatusFilter] = useState(initialStatus); // ALL, PUBLISHED, DRAFT
  const [notification, setNotification] = useState("");

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQuestionsModal, setShowQuestionsModal] = useState(false);
  const [lifecycleExamModal, setLifecycleExamModal] = useState(null);
  const [activeExam, setActiveExam] = useState(null);
  const [examDetail, setExamDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Submissions inspector & Solutions modal state
  const [submissionsInspectorExam, setSubmissionsInspectorExam] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [solutionsModalExam, setSolutionsModalExam] = useState(null);
  const [fastPhaseLoading, setFastPhaseLoading] = useState(false);

  // New Exam Form State (12-hour clock with AM/PM & supportive instructions)
  const [examDateOnly, setExamDateOnly] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10)
  );
  const [examHour, setExamHour] = useState("09");
  const [examMinute, setExamMinute] = useState("30");
  const [examAmpm, setExamAmpm] = useState("AM");

  const [formData, setFormData] = useState({
    prepClass: 10,
    subjectId: "",
    durationMinutes: 90,
    totalMarks: 50,
    instructions: "Dear candidate, take a deep breath. Read each question carefully and calmly. Manage your time with confidence. Best wishes for your success!",
    status: "PUBLISHED",
  });

  // New Question Form State
  const [qFormData, setQFormData] = useState({
    questionText: "",
    marks: 2,
    optA: "",
    optB: "",
    optC: "",
    optD: "",
    correctAnswer: "A",
    explanation: "",
  });

  const fetchExams = async () => {
    setLoading(true);
    try {
      const url = selectedClass === "ALL" ? "/api/admin/exams" : `/api/admin/exams?prepClass=${selectedClass}`;
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) {
        setExams(data.exams || []);
      }
    } catch (err) {
      console.error("Error fetching exams:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await fetch("/api/subjects?prepClass=ALL");
      const data = await res.json();
      if (res.ok && data.subjects) {
        setSubjects(data.subjects);
        if (data.subjects.length > 0 && !formData.subjectId) {
          const defaultSub = data.subjects.find((s) => s.prepClass === formData.prepClass) || data.subjects[0];
          setFormData((prev) => ({ ...prev, subjectId: defaultSub.id }));
        }
      }
    } catch (err) {
      console.error("Error fetching subjects:", err);
    }
  };

  useEffect(() => {
    fetchExams();
  }, [selectedClass]);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const showMsg = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 4000);
  };

  const openSubmissionsInspector = async (exam) => {
    setSubmissionsInspectorExam(exam);
    setSelectedSubmission(null);
    setLoadingDetail(true);
    try {
      const res = await fetch(`/api/admin/exams/${exam.id}`);
      const data = await res.json();
      if (res.ok) {
        setExamDetail(data.exam);
        if (data.exam?.submissions?.length > 0) {
          setSelectedSubmission(data.exam.submissions[0]);
        }
      }
    } catch (e) {
      console.error("Submissions inspector error:", e);
    } finally {
      setLoadingDetail(false);
    }
  };

  const openSolutionsModal = async (exam) => {
    setSolutionsModalExam(exam);
    setLoadingDetail(true);
    try {
      const res = await fetch(`/api/admin/exams/${exam.id}`);
      const data = await res.json();
      if (res.ok) {
        setExamDetail(data.exam);
      }
    } catch (e) {
      console.error("Solutions modal error:", e);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleFastAdvancePhase = async (examId, targetPhase) => {
    setFastPhaseLoading(true);
    try {
      const res = await fetch(`/api/admin/exams/${examId}/fast-phase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetPhase }),
      });
      const data = await res.json();
      if (res.ok) {
        showMsg(`Success: Exam transitioned to Phase ${targetPhase}/10.`);
        fetchExams();
        if (lifecycleExamModal && lifecycleExamModal.id === examId) {
          setLifecycleExamModal(data.exam);
        }
      } else {
        alert(data.error || "Failed to update exam phase.");
      }
    } catch {
      alert("Network error updating phase.");
    } finally {
      setFastPhaseLoading(false);
    }
  };

  // Toggle Publish / Draft
  const toggleStatus = async (exam) => {
    const nextStatus = exam.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    try {
      const res = await fetch(`/api/admin/exams/${exam.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        setExams((prev) =>
          prev.map((e) => (e.id === exam.id ? { ...e, status: nextStatus } : e))
        );
        showMsg(
          `Exam "${exam.subject.name}" (Class ${exam.prepClass}) is now ${
            nextStatus === "PUBLISHED" ? "PUBLISHED to Student Portal" : "saved as DRAFT (Hidden)"
          }.`
        );
      }
    } catch (err) {
      showMsg("Network error updating exam status.");
    }
  };

  // Create new exam
  const handleCreateExam = async (e) => {
    e.preventDefault();
    try {
      const h = (parseInt(examHour, 10) % 12) + (examAmpm === "PM" ? 12 : 0);
      const isoExamDate = new Date(`${examDateOnly}T${String(h).padStart(2, "0")}:${examMinute}:00`).toISOString();

      const res = await fetch("/api/admin/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          examDate: isoExamDate,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showMsg("Official examination schedule created successfully!");
        setShowCreateModal(false);
        fetchExams();
      } else {
        alert(data.error || "Failed to create examination.");
      }
    } catch (err) {
      alert("Network error creating exam.");
    }
  };

  // Load Exam Detail for questions and submissions modal
  const openQuestionsModal = async (exam) => {
    setActiveExam(exam);
    setShowQuestionsModal(true);
    setLoadingDetail(true);
    try {
      const res = await fetch(`/api/admin/exams/${exam.id}`);
      const data = await res.json();
      if (res.ok) {
        setExamDetail(data.exam);
      }
    } catch (err) {
      console.error("Error loading exam detail:", err);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Add Question to active exam
  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!activeExam) return;

    const options = [
      { id: "A", text: qFormData.optA },
      { id: "B", text: qFormData.optB },
      { id: "C", text: qFormData.optC },
      { id: "D", text: qFormData.optD },
    ];

    try {
      const res = await fetch(`/api/admin/exams/${activeExam.id}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionText: qFormData.questionText,
          marks: qFormData.marks,
          options,
          correctAnswer: qFormData.correctAnswer,
          explanation: qFormData.explanation,
        }),
      });

      if (res.ok) {
        // Refresh detail
        const detRes = await fetch(`/api/admin/exams/${activeExam.id}`);
        const detData = await detRes.json();
        if (detRes.ok) setExamDetail(detData.exam);

        setQFormData({
          questionText: "",
          marks: 2,
          optA: "",
          optB: "",
          optC: "",
          optD: "",
          correctAnswer: "A",
          explanation: "",
        });
        showMsg("Question added to examination paper successfully.");
        fetchExams();
      }
    } catch (err) {
      alert("Failed to add question.");
    }
  };

  // Delete Question
  const handleDeleteQuestion = async (qId) => {
    if (!confirm("Are you sure you want to remove this question?")) return;
    try {
      const res = await fetch(`/api/admin/exams/${activeExam.id}/questions?questionId=${qId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        const detRes = await fetch(`/api/admin/exams/${activeExam.id}`);
        const detData = await detRes.json();
        if (detRes.ok) setExamDetail(detData.exam);
        fetchExams();
        showMsg("Question deleted.");
      }
    } catch (err) {
      alert("Failed to delete question.");
    }
  };

  // Delete whole exam
  const handleDeleteExam = async (examId, subjectName) => {
    if (!confirm(`Are you sure you want to delete examination for "${subjectName}"? This will delete all attached questions and student submissions.`)) return;
    try {
      const res = await fetch(`/api/admin/exams/${examId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showMsg(`Examination for "${subjectName}" deleted.`);
        fetchExams();
      }
    } catch (err) {
      alert("Failed to delete exam.");
    }
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
      {/* Top Banner Navigation */}
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
              <h1 className="text-xl sm:text-2xl font-black text-foreground">
                Examination Schedule & Draft/Publish Engine
              </h1>
              <Badge variant="warning">COE Master Control</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Schedule test sessions, manage authentic questions, and publish to Class 10 or Class 12 candidates.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setShowCreateModal(true)}
            className="gap-1.5 text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/20"
          >
            <PlusCircle className="w-4 h-4" /> Create Exam Schedule
          </Button>
        </div>
      </div>

      {/* Floating Status Notification */}
      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in-50">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Class Filter Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-card p-1 rounded-xl border border-border">
          <button
            type="button"
            onClick={() => setSelectedClass("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedClass === "ALL"
                ? "bg-primary text-primary-foreground font-bold shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All Standards
          </button>
          <button
            type="button"
            onClick={() => setSelectedClass("10")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedClass === "10"
                ? "bg-sky-500 text-slate-950 font-bold shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Class 10
          </button>
          <button
            type="button"
            onClick={() => setSelectedClass("12")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedClass === "12"
                ? "bg-purple-500 text-white font-bold shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Class 12
          </button>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 bg-card p-1 rounded-xl border border-border">
          {[
            { key: "ALL", label: "All Status" },
            { key: "PUBLISHED", label: "Live Published" },
            { key: "DRAFT", label: "Draft Schedules" },
          ].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setStatusFilter(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === key
                  ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <span className="text-xs text-muted-foreground font-mono">
          Scheduled Exams: {exams.filter(e => statusFilter === "ALL" || e.status === statusFilter).length}
        </span>
      </div>

      {/* Examinations Table */}
      <div className="border border-border rounded-2xl overflow-hidden bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-secondary/70 border-b border-border text-muted-foreground uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Subject & Code</th>
                <th className="py-3 px-4">Prep Class</th>
                <th className="py-3 px-4">Scheduled Date & Time</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Questions</th>
                <th className="py-3 px-4">Submissions</th>
                <th className="py-3 px-4">10-Phase Lifecycle</th>
                <th className="py-3 px-4">Portal Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-muted-foreground">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-400" />
                    Loading exam schedules...
                  </td>
                </tr>
              ) : exams.filter(e => statusFilter === "ALL" || e.status === statusFilter).length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-muted-foreground">
                    No examination schedules found for selected filter. Click &quot;Create Exam Schedule&quot; above to schedule one.
                  </td>
                </tr>
              ) : (
                exams
                  .filter(e => statusFilter === "ALL" || e.status === statusFilter)
                  .map((exam) => (
                  <tr key={exam.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-bold text-foreground block">{exam.subject?.name}</span>
                      <span className="font-mono text-[10px] text-muted-foreground">{exam.subject?.code}</span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="purple">Class {exam.prepClass}</Badge>
                    </td>
                    <td className="py-3 px-4 font-mono text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-sky-400" />
                        <span>
                          {new Date(exam.examDate).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        <span className="text-foreground font-semibold">
                          {new Date(exam.examDate).toLocaleTimeString("en-IN", {
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground font-medium">
                      {exam.durationMinutes} mins ({exam.totalMarks} Marks)
                    </td>
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => openQuestionsModal(exam)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-secondary hover:bg-secondary/80 border border-border text-foreground font-semibold"
                      >
                        <FileText className="w-3.5 h-3.5 text-amber-400" />
                        <span>{exam._count?.questions || 0} Questions</span>
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 font-bold">
                          <span className="text-emerald-400">
                            {exam.stats?.completedCount ?? (exam._count?.submissions || 0)} Completed
                          </span>
                          <span className="text-border">•</span>
                          <span className="text-amber-400">
                            {exam.stats?.pendingCount ?? 0} Pending
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                          <span>Total: {exam.stats?.totalEligible ?? (exam._count?.submissions || 0)}</span>
                          {(exam.stats?.completedCount > 0 || exam._count?.submissions > 0) && (
                            <button
                              type="button"
                              onClick={() => openSubmissionsInspector(exam)}
                              className="text-sky-400 hover:text-sky-300 hover:underline font-bold ml-1 inline-flex items-center gap-0.5"
                            >
                              Inspect Answers <ChevronRight className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div
                        onClick={() => setLifecycleExamModal(exam)}
                        className="cursor-pointer group p-1.5 rounded-xl hover:bg-violet-500/10 transition-all border border-transparent hover:border-violet-500/25"
                        title="Click to view full 10-Phase Examination Lifecycle"
                      >
                        <ExamLifecycleStepper exam={exam} mode="compact" />
                        <span className="text-[9px] text-[#5c5c8a] group-hover:text-violet-300 font-semibold flex items-center gap-0.5 mt-0.5">
                          Inspect 10 Phases <ChevronRight className="w-2.5 h-2.5" />
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {exam.status === "PUBLISHED" ? (
                        <Badge variant="success">Published to Student</Badge>
                      ) : (
                        <Badge variant="secondary">Draft Only (Hidden)</Badge>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <Button
                        size="sm"
                        variant={exam.status === "PUBLISHED" ? "outline" : "primary"}
                        onClick={() => toggleStatus(exam)}
                        className="text-xs py-1 px-3"
                      >
                        {exam.status === "PUBLISHED" ? "Unpublish" : "Publish Now"}
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteExam(exam.id, exam.subject?.name)}
                        className="text-xs py-1 px-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                        title="Delete Exam"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create New Exam Schedule Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-lg w-full p-6 border-amber-500/30 animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
              <h3 className="text-lg font-black text-foreground flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-400" /> Schedule Examination
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExam} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">
                    Preparation Class
                  </label>
                  <select
                    value={formData.prepClass}
                    onChange={(e) => {
                      const newCls = parseInt(e.target.value, 10);
                      const matchingSub = subjects.find((s) => s.prepClass === newCls);
                      setFormData({
                        ...formData,
                        prepClass: newCls,
                        subjectId: matchingSub ? matchingSub.id : formData.subjectId,
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground font-medium"
                  >
                    <option value={10}>Class 10 (Secondary)</option>
                    <option value={12}>Class 12 (Higher Secondary)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">
                    Subject
                  </label>
                  <select
                    value={formData.subjectId}
                    onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground font-medium"
                  >
                    {subjects
                      .filter((s) => s.prepClass === formData.prepClass)
                      .map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name} ({sub.code})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* 12-Hour AM/PM Time Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1 text-xs">
                    Exam Date
                  </label>
                  <input
                    type="date"
                    value={examDateOnly}
                    onChange={(e) => setExamDateOnly(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground font-semibold mb-1 text-xs">
                    Conducting Time (12-Hour AM/PM)
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <select
                      value={examHour}
                      onChange={(e) => setExamHour(e.target.value)}
                      className="px-2 py-2 rounded-xl bg-secondary border border-border text-foreground font-mono text-xs"
                    >
                      {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")).map((hr) => (
                        <option key={hr} value={hr}>{hr}</option>
                      ))}
                    </select>

                    <select
                      value={examMinute}
                      onChange={(e) => setExamMinute(e.target.value)}
                      className="px-2 py-2 rounded-xl bg-secondary border border-border text-foreground font-mono text-xs"
                    >
                      {["00", "15", "30", "45"].map((min) => (
                        <option key={min} value={min}>{min}</option>
                      ))}
                    </select>

                    <select
                      value={examAmpm}
                      onChange={(e) => setExamAmpm(e.target.value)}
                      className="px-2 py-2 rounded-xl bg-secondary border border-border text-amber-400 font-bold text-xs"
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">
                    Duration (Mins)
                  </label>
                  <input
                    type="number"
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                    required
                    min={10}
                    max={360}
                    className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">
                    Total Marks
                  </label>
                  <input
                    type="number"
                    value={formData.totalMarks}
                    onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value })}
                    required
                    min={10}
                    max={200}
                    className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">
                    Initial Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground font-medium"
                  >
                    <option value="DRAFT">DRAFT (Hidden from Student)</option>
                    <option value="PUBLISHED">PUBLISHED (Visible Immediately)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1 text-xs">
                  Encouraging Candidate Instructions
                </label>
                <textarea
                  rows={2}
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground text-xs leading-relaxed"
                  placeholder="e.g. Read each question with care and confidence. Manage your time calmly. Best wishes!"
                />
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Save Schedule
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Manage Questions & View Submissions Modal */}
      {showQuestionsModal && activeExam && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-4xl w-full max-h-[90vh] flex flex-col p-6 border-border animate-in fade-in-50">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-foreground">
                    {activeExam.subject?.name} ({activeExam.subject?.code})
                  </h3>
                  <Badge variant="purple">Class {activeExam.prepClass}</Badge>
                  <Badge variant={activeExam.status === "PUBLISHED" ? "success" : "secondary"}>
                    {activeExam.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Official Question Paper Composition & Candidate Submissions
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowQuestionsModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 pr-1">
              {loadingDetail ? (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-400" />
                  Loading examination composition...
                </div>
              ) : (
                <>
                  {/* Full 10-Phase Examination Lifecycle Stepper */}
                  <ExamLifecycleStepper exam={examDetail || activeExam} mode="full" />

                  {/* Candidate Submissions Section if any exist */}
                  {examDetail?.submissions && examDetail.submissions.length > 0 && (
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                      <h4 className="font-bold text-xs text-emerald-300 mb-2 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Recorded Candidate Submissions ({examDetail.submissions.length})
                      </h4>
                      <div className="space-y-2">
                        {examDetail.submissions.map((sub) => (
                          <div
                            key={sub.id}
                            className="bg-card p-3 rounded-lg border border-border flex items-center justify-between text-xs"
                          >
                            <div>
                              <span className="font-bold text-foreground">
                                {sub.student?.fullName} ({sub.student?.user?.username})
                              </span>
                              <div className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
                                <span>Time Spent: {Math.floor(sub.timeTakenSecs / 60)}m {sub.timeTakenSecs % 60}s</span>
                                <span>• Submitted: {new Date(sub.submittedAt).toLocaleTimeString("en-IN")}</span>
                              </div>
                            </div>
                            <Badge variant="success" className="font-mono">
                              Preliminary Score: {sub.score} Marks
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Existing Questions List */}
                  <div>
                    <h4 className="font-bold text-xs text-foreground mb-3 flex items-center justify-between">
                      <span>Existing Questions ({examDetail?.questions?.length || 0})</span>
                      <span className="text-muted-foreground text-[11px]">
                        Target Max Marks: {activeExam.totalMarks}
                      </span>
                    </h4>

                    {examDetail?.questions?.length === 0 ? (
                      <div className="p-4 rounded-xl bg-secondary/50 border border-border text-center text-xs text-muted-foreground">
                        No questions in this paper yet. Use the form below to add multiple choice questions.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {examDetail?.questions?.map((q, idx) => (
                          <div
                            key={q.id}
                            className="p-4 rounded-xl bg-secondary/40 border border-border space-y-2 text-xs"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-bold text-foreground">
                                Q{idx + 1}. {q.questionText}
                              </span>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <Badge variant="secondary">+{q.marks} Marks</Badge>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteQuestion(q.id)}
                                  className="text-rose-400 hover:text-rose-300 p-1"
                                  title="Delete Question"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                              {q.options?.map((opt) => (
                                <div
                                  key={opt.id}
                                  className={`p-2 rounded-lg border flex items-center gap-2 ${
                                    opt.id === q.correctAnswer
                                      ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-semibold"
                                      : "bg-card border-border text-muted-foreground"
                                  }`}
                                >
                                  <span className="font-bold">{opt.id}.</span>
                                  <span>{opt.text}</span>
                                  {opt.id === q.correctAnswer && (
                                    <span className="ml-auto text-[10px] text-emerald-400 font-bold">(Correct)</span>
                                  )}
                                </div>
                              ))}
                            </div>

                            {q.explanation && (
                              <p className="text-[11px] text-muted-foreground pt-1 italic">
                                * Explanation: {q.explanation}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Add New Question Form */}
                  <div className="p-4 rounded-xl bg-card border border-border space-y-3">
                    <h4 className="font-bold text-xs text-foreground flex items-center gap-1.5">
                      <PlusCircle className="w-4 h-4 text-amber-400" /> Add New Examination Question
                    </h4>

                    <form onSubmit={handleAddQuestion} className="space-y-3 text-xs">
                      <div>
                        <label className="block text-muted-foreground font-semibold mb-1">
                          Question Prompt / Problem Text
                        </label>
                        <textarea
                          rows={2}
                          value={qFormData.questionText}
                          onChange={(e) => setQFormData({ ...qFormData, questionText: e.target.value })}
                          required
                          placeholder="e.g. Find the 15th term of the AP..."
                          className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-muted-foreground font-semibold mb-1">
                            Option A
                          </label>
                          <input
                            type="text"
                            value={qFormData.optA}
                            onChange={(e) => setQFormData({ ...qFormData, optA: e.target.value })}
                            required
                            placeholder="Option A text"
                            className="w-full px-3 py-1.5 rounded-lg bg-secondary border border-border text-foreground"
                          />
                        </div>
                        <div>
                          <label className="block text-muted-foreground font-semibold mb-1">
                            Option B
                          </label>
                          <input
                            type="text"
                            value={qFormData.optB}
                            onChange={(e) => setQFormData({ ...qFormData, optB: e.target.value })}
                            required
                            placeholder="Option B text"
                            className="w-full px-3 py-1.5 rounded-lg bg-secondary border border-border text-foreground"
                          />
                        </div>
                        <div>
                          <label className="block text-muted-foreground font-semibold mb-1">
                            Option C
                          </label>
                          <input
                            type="text"
                            value={qFormData.optC}
                            onChange={(e) => setQFormData({ ...qFormData, optC: e.target.value })}
                            required
                            placeholder="Option C text"
                            className="w-full px-3 py-1.5 rounded-lg bg-secondary border border-border text-foreground"
                          />
                        </div>
                        <div>
                          <label className="block text-muted-foreground font-semibold mb-1">
                            Option D
                          </label>
                          <input
                            type="text"
                            value={qFormData.optD}
                            onChange={(e) => setQFormData({ ...qFormData, optD: e.target.value })}
                            required
                            placeholder="Option D text"
                            className="w-full px-3 py-1.5 rounded-lg bg-secondary border border-border text-foreground"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-muted-foreground font-semibold mb-1">
                            Correct Answer Option
                          </label>
                          <select
                            value={qFormData.correctAnswer}
                            onChange={(e) => setQFormData({ ...qFormData, correctAnswer: e.target.value })}
                            className="w-full px-3 py-1.5 rounded-lg bg-secondary border border-border text-foreground font-bold"
                          >
                            <option value="A">Option A</option>
                            <option value="B">Option B</option>
                            <option value="C">Option C</option>
                            <option value="D">Option D</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-muted-foreground font-semibold mb-1">
                            Marks for Question
                          </label>
                          <input
                            type="number"
                            value={qFormData.marks}
                            onChange={(e) => setQFormData({ ...qFormData, marks: e.target.value })}
                            min={1}
                            max={10}
                            className="w-full px-3 py-1.5 rounded-lg bg-secondary border border-border text-foreground"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-muted-foreground font-semibold mb-1">
                          Worked Solution / Explanation (Shown during post-exam review)
                        </label>
                        <input
                          type="text"
                          value={qFormData.explanation}
                          onChange={(e) => setQFormData({ ...qFormData, explanation: e.target.value })}
                          placeholder="Brief step-by-step rationale..."
                          className="w-full px-3 py-1.5 rounded-lg bg-secondary border border-border text-foreground"
                        />
                      </div>

                      <Button
                        type="submit"
                        size="sm"
                        className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                      >
                        Add Question to Paper
                      </Button>
                    </form>
                  </div>
                </>
              )}
            </div>

            <div className="pt-3 mt-4 border-t border-border flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowQuestionsModal(false)}
              >
                Close Paper Manager
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Dedicated 10-Phase Lifecycle Details Modal */}
      {lifecycleExamModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-4xl w-full p-6 border-violet-500/30 animate-in fade-in-50 zoom-in-95 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-foreground">
                    {lifecycleExamModal.subject?.name} ({lifecycleExamModal.subject?.code})
                  </h3>
                  <Badge variant="purple">Class {lifecycleExamModal.prepClass}</Badge>
                  <Badge variant={lifecycleExamModal.status === "PUBLISHED" ? "success" : "secondary"}>
                    {lifecycleExamModal.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Full 10-Phase End-to-End Board Examination Pipeline & Real-Time Surveillance
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLifecycleExamModal(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Full 10-Phase Stepper */}
            <ExamLifecycleStepper exam={lifecycleExamModal} mode="full" />

            {/* Fast 10-Phase Pipeline Controller */}
            <div className="p-4 rounded-2xl bg-secondary/80 border border-violet-500/25 space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-foreground">Fast 10-Phase Lifecycle Controller</span>
                  <Badge variant="warning" className="text-[10px]">COE Instant Mode</Badge>
                </div>
                <Button
                  size="xs"
                  onClick={() => handleFastAdvancePhase(lifecycleExamModal.id, 10)}
                  disabled={fastPhaseLoading}
                  className="bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20"
                >
                  {fastPhaseLoading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Award className="w-3.5 h-3.5 mr-1" />}
                  Fast-Forward to Phase 10 (Publish Results)
                </Button>
              </div>

              <div>
                <p className="text-[11px] text-muted-foreground mb-2">
                  1-Click Jump to any phase of the examination lifecycle:
                </p>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      disabled={fastPhaseLoading}
                      onClick={() => handleFastAdvancePhase(lifecycleExamModal.id, p)}
                      className="px-2 py-1.5 rounded-lg text-xs font-mono font-bold bg-card hover:bg-violet-600/30 border border-border hover:border-violet-400/40 text-foreground transition-all flex flex-col items-center gap-0.5"
                    >
                      <span className="text-[9px] text-[#5c5c8a]">Phase</span>
                      <span>{p}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* View Official Paper with Solutions button */}
              <div className="pt-2 flex items-center justify-between flex-wrap gap-2 border-t border-border text-xs">
                <span className="text-muted-foreground text-[11px]">
                  Official Master Key & Explanations:
                </span>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => {
                    const target = lifecycleExamModal;
                    setLifecycleExamModal(null);
                    openSolutionsModal(target);
                  }}
                  className="gap-1.5 border-violet-500/30 text-violet-300 hover:bg-violet-500/15"
                >
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  View Official Q-Paper & Complete Solutions
                </Button>
              </div>
            </div>

            <div className="pt-2 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="text-xs text-[#a8a8d0] flex items-center gap-1.5">
                <Info className="w-4 h-4 text-violet-400 flex-shrink-0" />
                <span>Phases advance automatically as questions are set, exams published, candidate responses collected, and results released.</span>
              </div>
              <Button
                size="sm"
                variant="primary"
                onClick={() => {
                  const target = lifecycleExamModal;
                  setLifecycleExamModal(null);
                  openQuestionsModal(target);
                }}
                className="text-xs font-bold whitespace-nowrap"
              >
                Manage Questions & Paper
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Student Submissions & Written Answer Inspector Modal */}
      {submissionsInspectorExam && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-5xl w-full max-h-[90vh] flex flex-col p-6 border-sky-500/30 animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-foreground">
                    Student Submissions & Written Answers Inspector
                  </h3>
                  <Badge variant="cyan">{submissionsInspectorExam.subject?.name}</Badge>
                  <Badge variant="purple">Class {submissionsInspectorExam.prepClass}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Inspect exact candidate choices, preliminary scoring, and compare with official answer key.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSubmissionsInspectorExam(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingDetail ? (
              <div className="p-12 text-center text-xs text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-sky-400" />
                Decrypting candidate responses from SQLite AES-256 vault...
              </div>
            ) : !examDetail?.submissions || examDetail.submissions.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                No candidate submissions recorded yet for this examination.
              </div>
            ) : (
              <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 overflow-hidden">
                {/* Left: Candidate list */}
                <div className="md:col-span-4 border-r border-border pr-4 space-y-2 overflow-y-auto max-h-[65vh]">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase mb-2">
                    Candidates ({examDetail.submissions.length})
                  </h4>
                  {examDetail.submissions.map((sub) => {
                    const isSelected = selectedSubmission?.id === sub.id;
                    return (
                      <div
                        key={sub.id}
                        onClick={() => setSelectedSubmission(sub)}
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                          isSelected
                            ? "bg-sky-500/15 border-sky-500/40 text-foreground shadow-sm"
                            : "bg-secondary/40 border-border hover:bg-secondary/70 text-muted-foreground"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-bold text-foreground">{sub.studentName}</span>
                          <span className="font-mono text-[10px] text-sky-400 font-bold">{sub.rollNo}</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span>Time: {Math.floor(sub.timeTakenSecs / 60)}m {sub.timeTakenSecs % 60}s</span>
                          <span className="font-bold text-emerald-400">Score: {sub.score} Marks</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Right: Selected Candidate's Written Question Paper */}
                <div className="md:col-span-8 overflow-y-auto max-h-[65vh] space-y-4 pr-1">
                  {selectedSubmission ? (
                    <>
                      <div className="p-3.5 rounded-xl bg-secondary/70 border border-border flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-foreground text-sm block">
                            {selectedSubmission.studentName} ({selectedSubmission.rollNo})
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            Submitted at {new Date(selectedSubmission.submittedAt).toLocaleTimeString("en-IN")} • Time Taken: {Math.floor(selectedSubmission.timeTakenSecs / 60)} mins
                          </span>
                        </div>
                        <Badge variant="success" className="text-xs font-mono font-bold">
                          Total Score: {selectedSubmission.score} / {examDetail.totalMarks}
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        {examDetail.questions?.map((q, idx) => {
                          const chosen = selectedSubmission.answers?.[q.id];
                          const isCorrect = chosen && chosen === q.correctAnswer;
                          const isUnattempted = !chosen;

                          return (
                            <div key={q.id} className="p-4 rounded-xl bg-card border border-border space-y-2 text-xs">
                              <div className="flex items-start justify-between gap-2">
                                <span className="font-bold text-foreground">
                                  Q{idx + 1}. {q.questionText}
                                </span>
                                <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                                  isCorrect
                                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                    : isUnattempted
                                    ? "bg-slate-700 text-slate-300"
                                    : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                }`}>
                                  {isCorrect ? `+${q.marks || 1} Marks (Correct)` : isUnattempted ? "0 Marks (Unattempted)" : "0 Marks (Incorrect)"}
                                </span>
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-[11px]">
                                {q.options?.map((opt) => {
                                  const isCandidateOpt = chosen === opt.id;
                                  const isCorrectOpt = q.correctAnswer === opt.id;

                                  let optClass = "bg-secondary/40 border-border text-muted-foreground";
                                  if (isCorrectOpt) {
                                    optClass = "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-semibold";
                                  } else if (isCandidateOpt && !isCorrectOpt) {
                                    optClass = "bg-rose-500/15 border-rose-500/40 text-rose-300 font-semibold line-through";
                                  }

                                  return (
                                    <div key={opt.id} className={`p-2 rounded-lg border flex items-center justify-between ${optClass}`}>
                                      <span><strong>{opt.id}.</strong> {opt.text}</span>
                                      {isCorrectOpt && <span className="text-[10px] text-emerald-400 font-bold ml-1">✓ Correct</span>}
                                      {isCandidateOpt && !isCorrectOpt && <span className="text-[10px] text-rose-400 font-bold ml-1">✗ Candidate</span>}
                                    </div>
                                  );
                                })}
                              </div>

                              {q.explanation && (
                                <p className="text-[11px] text-muted-foreground pt-1 italic">
                                  * Explanation: {q.explanation}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="p-8 text-center text-xs text-muted-foreground">
                      Select a candidate on the left to inspect their written answers.
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="pt-3 mt-4 border-t border-border flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSubmissionsInspectorExam(null)}
              >
                Close Inspector
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Official Question Paper & Worked Solutions Modal (Phase 10 Release) */}
      {solutionsModalExam && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-4xl w-full max-h-[90vh] flex flex-col p-6 border-amber-500/40 bg-card animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-base font-black text-foreground">
                    Official Board Master Question Paper & Worked Solutions
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Published under Controller of Examinations — Tamil Nadu Samacheer Kalvi
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => window.print()}
                  className="gap-1 text-xs"
                >
                  <Printer className="w-3.5 h-3.5" /> Print / Save PDF
                </Button>
                <button
                  onClick={() => setSolutionsModalExam(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
              {/* Header Box */}
              <div className="p-4 rounded-xl bg-secondary/60 border border-border text-center space-y-1">
                <h4 className="font-extrabold text-sm text-foreground uppercase tracking-wide">
                  Directorate of Government Examinations — Tamil Nadu
                </h4>
                <p className="font-bold text-amber-400 text-xs">
                  {solutionsModalExam.subject?.name} ({solutionsModalExam.subject?.code}) — Class {solutionsModalExam.prepClass}
                </p>
                <div className="flex items-center justify-center gap-4 text-[11px] text-muted-foreground font-mono pt-1">
                  <span>Duration: {solutionsModalExam.durationMinutes} Minutes</span>
                  <span>•</span>
                  <span>Maximum Marks: {solutionsModalExam.totalMarks}</span>
                  <span>•</span>
                  <span>Status: Phase 10 / Released</span>
                </div>
              </div>

              {/* Questions with Worked Solutions */}
              <div className="space-y-4">
                {examDetail?.questions?.map((q, idx) => (
                  <div key={q.id} className="p-4 rounded-xl bg-secondary/30 border border-border space-y-2.5">
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-bold text-foreground">
                        Q{idx + 1}. {q.questionText}
                      </span>
                      <Badge variant="secondary">+{q.marks || 1} Marks</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      {q.options?.map((opt) => (
                        <div
                          key={opt.id}
                          className={`p-2.5 rounded-lg border flex items-center justify-between ${
                            opt.id === q.correctAnswer
                              ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-bold"
                              : "bg-card border-border text-muted-foreground"
                          }`}
                        >
                          <span><strong>{opt.id}.</strong> {opt.text}</span>
                          {opt.id === q.correctAnswer && (
                            <span className="text-[10px] text-emerald-400 font-bold">✓ Official Key</span>
                          )}
                        </div>
                      ))}
                    </div>

                    {q.explanation && (
                      <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-[11px] text-emerald-200">
                        <strong className="block text-emerald-300 font-semibold mb-0.5">Step-by-step Solution & Rationale:</strong>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 mt-4 border-t border-border flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSolutionsModalExam(null)}
              >
                Close Solutions Viewer
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function COEAdminExamsPage() {
  return (
    <AdminGuard>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
        </div>
      }>
        <COEAdminExamsContent />
      </Suspense>
    </AdminGuard>
  );
}
