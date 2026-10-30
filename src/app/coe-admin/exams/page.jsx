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
  Award,
  CheckSquare,
  Square,
  Edit3,
  Sliders,
  Filter,
  Radio,
  Send,
  Shuffle
} from "lucide-react";
import { ExamLifecycleStepper, calculateExamPhase } from "@/components/admin/ExamLifecycleStepper";

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

function safeFormatDate(dateVal, options = {}) {
  try {
    if (!dateVal) return "TBD";
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return "TBD";
    return d.toLocaleDateString("en-IN", options);
  } catch {
    return "TBD";
  }
}

function safeFormatTime(dateVal, options = {}) {
  try {
    if (!dateVal) return "TBD";
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return "TBD";
    return d.toLocaleTimeString("en-IN", options);
  } catch {
    return "TBD";
  }
}

function safeISODate(dateVal) {
  try {
    if (!dateVal) return new Date().toISOString().slice(0, 10);
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return new Date().toISOString().slice(0, 10);
    return d.toISOString().slice(0, 10);
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

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

  // Multi-subject batch scheduling state (Phase 4.1 & 4.4)
  const [selectedSubjectIds, setSelectedSubjectIds] = useState([]);
  const [perSubjectRows, setPerSubjectRows] = useState({});

  // Question Bank & Random Swapper state (Phase 6 & 100-QB Pool Manager)
  const [randomSwapperExam, setRandomSwapperExam] = useState(null);
  const [randomPoolData, setRandomPoolData] = useState(null);
  const [loadingPool, setLoadingPool] = useState(false);
  const [swappingId, setSwappingId] = useState(null);
  const [regenerating, setRegenerating] = useState(false);
  const [swapperTab, setSwapperTab] = useState("CURRENT"); // "CURRENT" | "BROWSE_BANK"
  const [swapperPoolRange, setSwapperPoolRange] = useState("FIRST_50"); // "FIRST_50" | "SECOND_50" | "ALL" | "FIRST_25"
  const [swapperCount, setSwapperCount] = useState(25);
  const [swapperTotalMarks, setSwapperTotalMarks] = useState(25);
  const [swapperSelectionMode, setSwapperSelectionMode] = useState("random"); // "random" | "sequential" | "policy"
  const [swapperPolicyId, setSwapperPolicyId] = useState(1);
  const [selectedBankCheckboxes, setSelectedBankCheckboxes] = useState(new Set());
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [swapperShuffleOptions, setSwapperShuffleOptions] = useState(false);
  const [shufflingActive, setShufflingActive] = useState(false);

  // Reschedule Date, Time, Duration & Marks state
  const [rescheduleModal, setRescheduleModal] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [rescheduleDuration, setRescheduleDuration] = useState(45);
  const [rescheduleTotalMarks, setRescheduleTotalMarks] = useState(25);
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [rescheduleResultPolicy, setRescheduleResultPolicy] = useState("0"); // "0", "1", "5", "10", "custom", "date"
  const [rescheduleCustomMinutes, setRescheduleCustomMinutes] = useState(5);
  const [reschedulePublishDate, setReschedulePublishDate] = useState("");
  const [rescheduleSubmitting, setRescheduleSubmitting] = useState(false);
  const [rescheduleAuditLogs, setRescheduleAuditLogs] = useState([]);

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
    // Live update / periodic auto-refresh (Phase 4.3: list never stays stale)
    const interval = setInterval(() => {
      fetchExams();
    }, 25000);
    return () => clearInterval(interval);
  }, [selectedClass]);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const toggleSubjectSelect = (subId) => {
    setSelectedSubjectIds((prev) => {
      const next = prev.includes(subId) ? prev.filter((id) => id !== subId) : [...prev, subId];
      if (!prev.includes(subId) && !perSubjectRows[subId]) {
        setPerSubjectRows((r) => ({
          ...r,
          [subId]: {
            date: examDateOnly,
            time: `${examHour}:${examMinute} ${examAmpm}`,
            durationMinutes: formData.durationMinutes,
            totalMarks: formData.totalMarks,
            instructions: formData.instructions,
            status: formData.status,
            randomQuestionCount: 10,
          },
        }));
      }
      return next;
    });
  };

  const updatePerSubjectRow = (subId, field, val) => {
    setPerSubjectRows((prev) => ({
      ...prev,
      [subId]: {
        ...(prev[subId] || {}),
        [field]: val,
      },
    }));
  };

  // Phase 4.3: Apply common details to all rows
  const applyCommonDetailsToAllRows = () => {
    const commonTime = `${examHour}:${examMinute} ${examAmpm}`;
    setPerSubjectRows((prev) => {
      const updated = { ...prev };
      selectedSubjectIds.forEach((id) => {
        updated[id] = {
          ...(updated[id] || {}),
          date: examDateOnly,
          time: commonTime,
          durationMinutes: formData.durationMinutes,
          totalMarks: formData.totalMarks,
          instructions: formData.instructions,
        };
      });
      return updated;
    });
  };

  // Phase 4.3: Copy single row's time to all rows
  const copyTimeToAllRows = (sourceSubId) => {
    const source = perSubjectRows[sourceSubId] || {};
    const timeToCopy = source.time || `${examHour}:${examMinute} ${examAmpm}`;
    const dateToCopy = source.date || examDateOnly;
    setPerSubjectRows((prev) => {
      const updated = { ...prev };
      selectedSubjectIds.forEach((id) => {
        updated[id] = {
          ...(updated[id] || {}),
          date: dateToCopy,
          time: timeToCopy,
        };
      });
      return updated;
    });
  };

  const openRescheduleModal = async (exam) => {
    setRescheduleModal(exam);
    const d = new Date(exam.examDate);
    setRescheduleDate(d.toISOString().slice(0, 10));
    setRescheduleTime(d.toTimeString().slice(0, 5));
    setRescheduleDuration(exam.durationMinutes || 45);
    setRescheduleTotalMarks(exam.totalMarks || 25);
    setRescheduleReason("");
    setRescheduleAuditLogs([]);

    // Pre-populate result release policy
    if (exam.resultPublishDate) {
      setRescheduleResultPolicy("date");
      setReschedulePublishDate(new Date(exam.resultPublishDate).toISOString().slice(0, 16));
    } else if (exam.resultPublishDelayMinutes !== undefined && exam.resultPublishDelayMinutes !== null) {
      const mins = exam.resultPublishDelayMinutes;
      if ([0, 1, 5, 10].includes(mins)) {
        setRescheduleResultPolicy(String(mins));
      } else {
        setRescheduleResultPolicy("custom");
        setRescheduleCustomMinutes(mins);
      }
    } else {
      setRescheduleResultPolicy("0");
    }

    try {
      const res = await fetch(`/api/admin/exams/${exam.id}/date`);
      const data = await res.json();
      if (res.ok && data.logs) {
        setRescheduleAuditLogs(data.logs);
      }
    } catch {}
  };

  const handleSaveReschedule = async (e) => {
    e.preventDefault();
    if (!rescheduleModal || !rescheduleDate || !rescheduleTime) return;
    setRescheduleSubmitting(true);
    try {
      const combinedIso = new Date(`${rescheduleDate}T${rescheduleTime}:00`).toISOString();

      let delayMinutes = 0;
      let targetPublishDate = null;
      if (rescheduleResultPolicy === "custom") {
        delayMinutes = parseInt(rescheduleCustomMinutes, 10) || 0;
      } else if (rescheduleResultPolicy === "date") {
        targetPublishDate = reschedulePublishDate ? new Date(reschedulePublishDate).toISOString() : null;
      } else {
        delayMinutes = parseInt(rescheduleResultPolicy, 10) || 0;
      }

      const res = await fetch(`/api/admin/exams/${rescheduleModal.id}/date`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examDate: combinedIso,
          reason: rescheduleReason || "Scheduled date, duration & marks modified by Controller of Examinations",
          resultPublishDelayMinutes: delayMinutes,
          resultPublishDate: targetPublishDate,
          totalMarks: parseInt(rescheduleTotalMarks, 10) || rescheduleModal.totalMarks || 25,
          durationMinutes: parseInt(rescheduleDuration, 10) || rescheduleModal.durationMinutes || 45,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showMsg(`Exam schedule & result policy updated for ${rescheduleModal.subject?.name}!`);
        setRescheduleModal(null);
        fetchExams();
      } else {
        alert(data.error || "Failed to update date.");
      }
    } catch {
      alert("Network error updating date.");
    } finally {
      setRescheduleSubmitting(false);
    }
  };

  const openRandomSwapper = async (exam) => {
    setRandomSwapperExam(exam);
    setLoadingPool(true);
    setEditingQuestion(null);
    setSelectedBankCheckboxes(new Set());
    setSwapperTab("CURRENT");
    const initialCount = exam._count?.questions || 25;
    setSwapperCount(initialCount);
    setSwapperTotalMarks(exam.totalMarks || initialCount);
    try {
      const res = await fetch(`/api/admin/exams/${exam.id}/random-questions`);
      const data = await res.json();
      if (res.ok) {
        setRandomPoolData(data);
      } else {
        alert(data.error || "Failed to load question pool.");
      }
    } catch {
      alert("Network error loading random question pool.");
    } finally {
      setLoadingPool(false);
    }
  };

  const handleGenerateFromPool = async (overrideParams = {}) => {
    if (!randomSwapperExam || regenerating) return;
    setRegenerating(true);
    try {
      const payload = {
        action: "regenerate",
        poolRange: overrideParams.poolRange || swapperPoolRange,
        count: overrideParams.count || swapperCount,
        totalMarks: overrideParams.totalMarks || swapperTotalMarks || swapperCount,
        selectionMode: overrideParams.selectionMode || swapperSelectionMode,
        policyId: overrideParams.policyId || swapperPolicyId,
        selectedBankItemIds: overrideParams.selectedBankItemIds || Array.from(selectedBankCheckboxes),
        shuffleOptions: overrideParams.shuffleOptions !== undefined ? overrideParams.shuffleOptions : swapperShuffleOptions,
      };

      const res = await fetch(`/api/admin/exams/${randomSwapperExam.id}/random-questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        showMsg(data.message || "Questions successfully generated from pool and applied!");
        openRandomSwapper(randomSwapperExam);
        fetchExams();
      } else {
        alert(data.error || "Failed to generate questions from pool.");
      }
    } catch {
      alert("Network error generating questions.");
    } finally {
      setRegenerating(false);
    }
  };

  const handleTriggerShuffle = async (mode = "shuffle_questions") => {
    if (!randomSwapperExam || shufflingActive) return;
    setShufflingActive(true);
    try {
      const res = await fetch(`/api/admin/exams/${randomSwapperExam.id}/random-questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: mode }),
      });
      const data = await res.json();
      if (res.ok) {
        showMsg(data.message || "Questions successfully scrambled!");
        openRandomSwapper(randomSwapperExam);
        fetchExams();
      } else {
        alert(data.error || "Failed to shuffle.");
      }
    } catch {
      alert("Network error shuffling questions.");
    } finally {
      setShufflingActive(false);
    }
  };

  const startEditQuestion = (q) => {
    let optA = "", optB = "", optC = "", optD = "";
    if (Array.isArray(q.options)) {
      q.options.forEach((opt) => {
        const id = String(opt.id || "").toUpperCase();
        if (id === "A") optA = opt.text || "";
        if (id === "B") optB = opt.text || "";
        if (id === "C") optC = opt.text || "";
        if (id === "D") optD = opt.text || "";
      });
    } else if (q.options && typeof q.options === "object") {
      optA = q.options.A || q.options.a || "";
      optB = q.options.B || q.options.b || "";
      optC = q.options.C || q.options.c || "";
      optD = q.options.D || q.options.d || "";
    }

    setEditingQuestion({
      id: q.id,
      questionNumber: q.questionNumber,
      questionText: q.questionText,
      marks: q.marks || 2,
      optA,
      optB,
      optC,
      optD,
      correctAnswer: q.correctAnswer || "A",
      explanation: q.explanation || "",
      difficulty: q.difficulty || "MEDIUM",
    });
  };

  const handleSaveQuestionEdit = async (e) => {
    if (e) e.preventDefault();
    if (!editingQuestion || !randomSwapperExam || savingEdit) return;
    setSavingEdit(true);
    try {
      const optionsArr = [
        { id: "A", text: editingQuestion.optA },
        { id: "B", text: editingQuestion.optB },
        { id: "C", text: editingQuestion.optC },
        { id: "D", text: editingQuestion.optD },
      ];
      const payload = {
        action: "edit_question",
        questionId: editingQuestion.id,
        questionText: editingQuestion.questionText,
        marks: editingQuestion.marks,
        options: optionsArr,
        correctAnswer: editingQuestion.correctAnswer,
        explanation: editingQuestion.explanation,
        difficulty: editingQuestion.difficulty,
      };

      const res = await fetch(`/api/admin/exams/${randomSwapperExam.id}/random-questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        showMsg("Question updated successfully!");
        setEditingQuestion(null);
        openRandomSwapper(randomSwapperExam);
      } else {
        alert(data.error || "Failed to update question.");
      }
    } catch {
      alert("Network error updating question.");
    } finally {
      setSavingEdit(false);
    }
  };

  const toggleBankCheckbox = (id) => {
    setSelectedBankCheckboxes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectBankPreset = (preset) => {
    if (!randomPoolData?.bankItems) return;
    const items = randomPoolData.bankItems;
    const next = new Set();
    if (preset === "FIRST_25") {
      items.filter((b) => b.questionNumber <= 25).forEach((b) => next.add(b.id));
    } else if (preset === "FIRST_50") {
      items.filter((b) => b.questionNumber <= 50).forEach((b) => next.add(b.id));
    } else if (preset === "SECOND_50") {
      items.filter((b) => b.questionNumber > 50).forEach((b) => next.add(b.id));
    } else if (preset === "ALL") {
      items.forEach((b) => next.add(b.id));
    }
    setSelectedBankCheckboxes(next);
  };

  const handleRegenerateRandomSelection = async () => {
    handleGenerateFromPool();
  };

  const handleSwapQuestion = async (qId) => {
    if (!randomSwapperExam || swappingId) return;
    setSwappingId(qId);
    try {
      const res = await fetch(`/api/admin/exams/${randomSwapperExam.id}/random-questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "swap", swapQuestionId: qId }),
      });
      const data = await res.json();
      if (res.ok) {
        showMsg("Question swapped with another question from bank!");
        openRandomSwapper(randomSwapperExam);
      } else {
        alert(data.error || "Failed to swap question.");
      }
    } catch {
      alert("Network error swapping question.");
    } finally {
      setSwappingId(null);
    }
  };

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
          `Exam "${exam.subject?.name || "Subject"}" (Class ${exam.prepClass}) is now ${
            nextStatus === "PUBLISHED" ? "PUBLISHED to Student Portal" : "saved as DRAFT (Hidden)"
          }.`
        );
      }
    } catch (err) {
      showMsg("Network error updating exam status.");
    }
  };

  // Create new exam (Single or Multi-Subject Batch - Phase 4.1 & 4.4)
  const handleCreateExam = async (e) => {
    e.preventDefault();
    try {
      let payload = null;
      if (selectedSubjectIds.length > 0) {
        const batch = selectedSubjectIds.map((subId) => {
          const row = perSubjectRows[subId] || {};
          const sDate = row.date || examDateOnly;
          const sTime = row.time || `${examHour}:${examMinute} ${examAmpm}`;

          let h = 9, m = "30";
          const match12 = sTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
          if (match12) {
            h = parseInt(match12[1], 10);
            if (match12[3]?.toUpperCase() === "PM" && h < 12) h += 12;
            if (match12[3]?.toUpperCase() === "AM" && h === 12) h = 0;
            m = match12[2];
          }
          const isoExamDate = new Date(`${sDate}T${String(h).padStart(2, "0")}:${m}:00`).toISOString();

          return {
            subjectId: subId,
            prepClass: formData.prepClass,
            examDate: isoExamDate,
            durationMinutes: parseInt(row.durationMinutes ?? formData.durationMinutes, 10),
            totalMarks: parseInt(row.totalMarks ?? formData.totalMarks, 10),
            instructions: row.instructions ?? formData.instructions,
            status: row.status ?? formData.status ?? "PUBLISHED",
            randomSelectCount: parseInt(row.randomQuestionCount || 10, 10),
          };
        });
        payload = { batch };
      } else {
        const h = (parseInt(examHour, 10) % 12) + (examAmpm === "PM" ? 12 : 0);
        const isoExamDate = new Date(`${examDateOnly}T${String(h).padStart(2, "0")}:${examMinute}:00`).toISOString();
        payload = {
          ...formData,
          examDate: isoExamDate,
          randomSelectCount: 10,
        };
      }

      const res = await fetch("/api/admin/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        showMsg(data.message || `Successfully scheduled and published ${selectedSubjectIds.length || 1} examination(s)!`);
        setShowCreateModal(false);
        setSelectedSubjectIds([]);
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
          <Link href="/coe-admin/live-monitoring">
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-xs border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10 font-bold"
            >
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              Live Test-Takers
            </Button>
          </Link>
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
              ) : exams.filter(e => e && (statusFilter === "ALL" || e.status === statusFilter)).length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-muted-foreground">
                    No examination schedules found for selected filter. Click &quot;Create Exam Schedule&quot; above to schedule one.
                  </td>
                </tr>
              ) : (
                exams
                  .filter(e => e && (statusFilter === "ALL" || e.status === statusFilter))
                  .map((exam) => (
                  <tr key={exam.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-bold text-foreground block">{exam.subject?.name || "Exam Subject"}</span>
                      <span className="font-mono text-[10px] text-muted-foreground">{exam.subject?.code || "N/A"}</span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="purple">Class {exam.prepClass}</Badge>
                    </td>
                    <td className="py-3 px-4 font-mono text-muted-foreground">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Calendar className="w-3.5 h-3.5 text-sky-400" />
                        <span>
                          {safeFormatDate(exam.examDate, {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        <span className="text-foreground font-semibold">
                          {safeFormatTime(exam.examDate, {
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </span>
                        <button
                          type="button"
                          onClick={() => openRescheduleModal(exam)}
                          className="px-1.5 py-0.5 rounded text-[10px] font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 ml-1"
                          title="Reschedule Exam Date & Time"
                        >
                          Edit
                        </button>
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
                    <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <Link
                        href={`/coe-admin/exam-setter?examId=${exam.id}&sub=${exam.subject?.code || ""}&date=${safeISODate(exam.examDate)}&time=${safeFormatTime(exam.examDate, { hour: "2-digit", minute: "2-digit", hour12: false })}&marks=${exam.totalMarks || 100}&count=${exam._count?.questions || 10}`}
                      >
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs py-1 px-2 text-violet-300 border-violet-500/30 hover:bg-violet-500/15"
                          title="Open AI Exam Setter (JSON Template)"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span className="hidden xl:inline ml-1 font-semibold">JSON Setter</span>
                        </Button>
                      </Link>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openRandomSwapper(exam)}
                        className="text-xs py-1 px-2 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/15"
                        title="Question Bank Random Pool & Swap"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="hidden xl:inline ml-1 font-semibold">Bank Pool</span>
                      </Button>

                      <Button
                        size="sm"
                        variant={exam.status === "PUBLISHED" ? "outline" : "primary"}
                        onClick={() => toggleStatus(exam)}
                        className="text-xs py-1 px-2.5"
                      >
                        {exam.status === "PUBLISHED" ? "Unpublish" : "Publish"}
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

      {/* Create New Exam Schedule Modal (Single & Multi-Subject Batch - Phase 4) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <Card className="max-w-3xl w-full p-5 sm:p-6 border-amber-500/30 animate-in fade-in-50 zoom-in-95 my-auto max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-border flex-shrink-0">
              <div>
                <h3 className="text-base sm:text-lg font-black text-foreground flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-400" /> Multi-Subject Examination Scheduler
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Tick multiple subjects in one step, adjust per-subject dates &amp; times, and publish all at once.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  setSelectedSubjectIds([]);
                }}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExam} className="space-y-4 text-xs overflow-y-auto pr-1 flex-1">
              {/* Preparation Class Picker */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/40 border border-border">
                <span className="font-semibold text-foreground">Standard Curriculum Class:</span>
                <div className="flex gap-2">
                  {[10, 12].map((cls) => (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => {
                        setFormData((f) => ({ ...f, prepClass: cls }));
                        setSelectedSubjectIds([]);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        formData.prepClass === cls
                          ? "bg-violet-600 text-white shadow-md shadow-violet-500/25"
                          : "bg-secondary text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Class {cls}
                    </button>
                  ))}
                </div>
              </div>

              {/* Multi-Subject Checkbox Selector (Phase 4.1) */}
              <div className="p-3.5 rounded-xl bg-secondary/30 border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                    Select Subjects to Schedule (Tick Multiple Subjects in 1 Step)
                  </span>
                  <span className="badge badge-amber font-mono text-[10px]">
                    {selectedSubjectIds.length} Selected
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Tick 5 or more subjects to schedule an entire examination series simultaneously:
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto pr-1 pt-1">
                  {subjects
                    .filter((s) => s.prepClass === formData.prepClass)
                    .map((sub) => {
                      const isChecked = selectedSubjectIds.includes(sub.id);
                      return (
                        <label
                          key={sub.id}
                          className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                            isChecked
                              ? "bg-violet-500/15 border-violet-500/40 text-violet-200 font-semibold"
                              : "bg-card border-border text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleSubjectSelect(sub.id)}
                            className="rounded border-border text-violet-600 focus:ring-0"
                          />
                          <span className="truncate">{sub.name}</span>
                          <span className="font-mono text-[9px] text-muted-foreground ml-auto">{sub.code}</span>
                        </label>
                      );
                    })}
                </div>
              </div>

              {/* Baseline Default Configuration (Applied once) */}
              <div className="p-3.5 rounded-xl bg-card border border-border space-y-3">
                <span className="font-bold text-foreground text-xs block">
                  Baseline Exam Configuration (Applied as default to all selected subjects)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-muted-foreground font-semibold mb-1">Baseline Date</label>
                    <input
                      type="date"
                      value={examDateOnly}
                      onChange={(e) => setExamDateOnly(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-secondary border border-border text-foreground font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-muted-foreground font-semibold mb-1">Baseline Time</label>
                    <div className="grid grid-cols-3 gap-1">
                      <select
                        value={examHour}
                        onChange={(e) => setExamHour(e.target.value)}
                        className="px-1.5 py-1.5 rounded-lg bg-secondary border border-border text-foreground font-mono"
                      >
                        {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")).map((hr) => (
                          <option key={hr} value={hr}>{hr}</option>
                        ))}
                      </select>
                      <select
                        value={examMinute}
                        onChange={(e) => setExamMinute(e.target.value)}
                        className="px-1.5 py-1.5 rounded-lg bg-secondary border border-border text-foreground font-mono"
                      >
                        {["00", "15", "30", "45"].map((min) => (
                          <option key={min} value={min}>{min}</option>
                        ))}
                      </select>
                      <select
                        value={examAmpm}
                        onChange={(e) => setExamAmpm(e.target.value)}
                        className="px-1.5 py-1.5 rounded-lg bg-secondary border border-border text-amber-400 font-bold"
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-muted-foreground font-semibold mb-1">Duration &amp; Marks</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <input
                        type="number"
                        value={formData.durationMinutes}
                        onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                        placeholder="Mins"
                        className="w-full px-2 py-1.5 rounded-lg bg-secondary border border-border text-foreground"
                      />
                      <input
                        type="number"
                        value={formData.totalMarks}
                        onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value })}
                        placeholder="Marks"
                        className="w-full px-2 py-1.5 rounded-lg bg-secondary border border-border text-foreground"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Candidate Instructions</label>
                  <input
                    type="text"
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-secondary border border-border text-foreground text-xs"
                    placeholder="Candidate guidance message"
                  />
                </div>
              </div>

              {/* Vertically Scrollable Sequence of Selected Subjects (Phase 4.4) */}
              {selectedSubjectIds.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground text-xs flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-sky-400" />
                      Sequence of Selected Examinations ({selectedSubjectIds.length} Subjects — Vertically Scrollable)
                    </span>
                    <button
                      type="button"
                      onClick={applyCommonDetailsToAllRows}
                      className="px-2.5 py-1 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-300 hover:bg-sky-500/25 text-[10.5px] font-bold"
                    >
                      Apply Common Details to All Rows
                    </button>
                  </div>

                  <div className="max-h-56 overflow-y-auto space-y-2.5 p-2 rounded-xl bg-slate-950/40 border border-border pr-1">
                    {selectedSubjectIds.map((subId, idx) => {
                      const sub = subjects.find((s) => s.id === subId);
                      const row = perSubjectRows[subId] || {};
                      return (
                        <div key={subId} className="p-3 rounded-xl bg-card border border-border space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-foreground flex items-center gap-1.5">
                              <span className="w-4 h-4 rounded-md bg-secondary flex items-center justify-center text-[10px] text-muted-foreground font-mono">
                                {idx + 1}
                              </span>
                              {sub?.name}
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => copyTimeToAllRows(subId)}
                                className="text-[10px] text-amber-400 hover:text-amber-300 hover:underline font-semibold"
                                title="Copy this date & time to all selected rows"
                              >
                                Copy Time to All
                              </button>
                              <span className="badge badge-purple text-[10px]">{sub?.code}</span>
                              <span className="badge badge-emerald text-[9px]">10 MCQs Auto-Sampled</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                            <div>
                              <label className="text-[10px] text-muted-foreground block mb-0.5">Subject Date</label>
                              <input
                                type="date"
                                value={row.date || examDateOnly}
                                onChange={(e) => updatePerSubjectRow(subId, "date", e.target.value)}
                                className="w-full px-2 py-1 rounded-md bg-secondary border border-border text-[11px] font-mono"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-muted-foreground block mb-0.5">Subject Time</label>
                              <input
                                type="text"
                                value={row.time || `${examHour}:${examMinute} ${examAmpm}`}
                                onChange={(e) => updatePerSubjectRow(subId, "time", e.target.value)}
                                className="w-full px-2 py-1 rounded-md bg-secondary border border-border text-[11px] font-mono"
                                placeholder="09:30 AM"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-muted-foreground block mb-0.5">Duration (mins)</label>
                              <input
                                type="number"
                                value={row.durationMinutes ?? formData.durationMinutes}
                                onChange={(e) => updatePerSubjectRow(subId, "durationMinutes", e.target.value)}
                                className="w-full px-2 py-1 rounded-md bg-secondary border border-border text-[11px]"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-muted-foreground block mb-0.5">Marks</label>
                              <input
                                type="number"
                                value={row.totalMarks ?? formData.totalMarks}
                                onChange={(e) => updatePerSubjectRow(subId, "totalMarks", e.target.value)}
                                className="w-full px-2 py-1 rounded-md bg-secondary border border-border text-[11px]"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-border flex items-center justify-end gap-2 flex-shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowCreateModal(false);
                    setSelectedSubjectIds([]);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold gap-1.5 shadow-md shadow-amber-500/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  {selectedSubjectIds.length > 0
                    ? `Publish All ${selectedSubjectIds.length} Selected Examinations`
                    : "Publish Single Examination Schedule"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Random Question Bank Pool & Swapper Modal (Phase 6 & 100-QB Pool Manager) */}
      {randomSwapperExam && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <Card className="max-w-4xl w-full p-5 sm:p-6 border-emerald-500/30 animate-in fade-in-50 zoom-in-95 my-auto max-h-[94vh] flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-border flex-shrink-0">
              <div>
                <h3 className="text-base sm:text-lg font-black text-foreground flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-emerald-400" />
                  Question Bank &amp; Random Swapper
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Exam: <strong className="text-foreground">{randomSwapperExam.subject?.name}</strong> ({randomSwapperExam.subject?.code}) · 100-Question Pool · Class {randomSwapperExam.prepClass}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/coe-admin/exam-setter?examId=${randomSwapperExam.id}&sub=${randomSwapperExam.subject?.code || ""}&date=${safeISODate(randomSwapperExam.examDate)}&time=${safeFormatTime(randomSwapperExam.examDate, { hour: "2-digit", minute: "2-digit", hour12: false })}&marks=${randomSwapperExam.totalMarks || 100}&count=${randomSwapperExam._count?.questions || 25}`}
                >
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs py-1 px-2.5 text-violet-300 border-violet-500/30 hover:bg-violet-500/15 gap-1.5"
                    title="Open live questions in AI JSON Exam Setter"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    Open in JSON Setter
                  </Button>
                </Link>
                <button
                  type="button"
                  onClick={() => setRandomSwapperExam(null)}
                  className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {loadingPool ? (
              <div className="py-16 text-center text-xs text-muted-foreground">
                <Loader2 className="w-7 h-7 animate-spin mx-auto mb-3 text-emerald-400" />
                Loading question bank pool and active questions...
              </div>
            ) : (
              <div className="space-y-4 overflow-y-auto pr-1 flex-1 text-xs">
                {/* Top Generator Control Ribbon */}
                <div className="p-4 rounded-xl bg-secondary/40 border border-emerald-500/20 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="font-bold text-foreground text-xs flex items-center gap-1.5">
                      <Sliders className="w-4 h-4 text-emerald-400" />
                      Question Bank Selector &amp; Policy Generator:
                    </span>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      Active: <strong className="text-emerald-300">{randomPoolData?.currentQuestions?.length || 0} Qs</strong> / Bank Pool: <strong className="text-sky-300">{randomPoolData?.bankTotal || 0} Qs</strong>
                    </span>
                  </div>

                  {/* Range and Count Selector Controls */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* 1. Pool Range */}
                    <div>
                      <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
                        1. Select Pool Range (From 100 QB)
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSwapperPoolRange("FIRST_50")}
                          className={`px-2 py-1.5 rounded-lg border text-[11px] font-semibold transition-all ${
                            swapperPoolRange === "FIRST_50"
                              ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold shadow-sm"
                              : "border-border bg-card/60 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          First 50 (Set A / Q1-50)
                        </button>
                        <button
                          type="button"
                          onClick={() => setSwapperPoolRange("SECOND_50")}
                          className={`px-2 py-1.5 rounded-lg border text-[11px] font-semibold transition-all ${
                            swapperPoolRange === "SECOND_50"
                              ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold shadow-sm"
                              : "border-border bg-card/60 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          Remaining 50 (Set B / Q51-100)
                        </button>
                        <button
                          type="button"
                          onClick={() => setSwapperPoolRange("FIRST_25")}
                          className={`px-2 py-1.5 rounded-lg border text-[11px] font-semibold transition-all ${
                            swapperPoolRange === "FIRST_25"
                              ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold shadow-sm"
                              : "border-border bg-card/60 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          First 25 (Q1-25)
                        </button>
                        <button
                          type="button"
                          onClick={() => setSwapperPoolRange("ALL")}
                          className={`px-2 py-1.5 rounded-lg border text-[11px] font-semibold transition-all ${
                            swapperPoolRange === "ALL"
                              ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold shadow-sm"
                              : "border-border bg-card/60 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          All 100 Questions Pool
                        </button>
                      </div>
                    </div>

                    {/* 2. Count & Marks Presets */}
                    <div>
                      <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
                        2. Presets (Questions &amp; Total Marks)
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {[
                          { q: 10, m: 10, label: "10 Qs (10 Marks)" },
                          { q: 25, m: 25, label: "25 Qs (25 Marks)" },
                          { q: 50, m: 50, label: "50 Qs (50 Marks)" },
                          { q: 15, m: 15, label: "15 Qs (15 Marks)" },
                        ].map((preset) => (
                          <button
                            key={preset.q}
                            type="button"
                            onClick={() => {
                              setSwapperCount(preset.q);
                              setSwapperTotalMarks(preset.m);
                            }}
                            className={`py-1.5 px-2 rounded-lg border text-xs font-mono font-bold transition-all text-center ${
                              swapperCount === preset.q && swapperTotalMarks === preset.m
                                ? "bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm"
                                : "border-border bg-card/60 text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground bg-secondary/40 p-1.5 rounded-lg border border-border/50">
                        <span>Selected: <strong className="text-amber-300">{swapperCount} Qs</strong></span>
                        <div className="flex items-center gap-1 font-mono">
                          <span>Max Marks:</span>
                          <input
                            type="number"
                            min="1"
                            max="200"
                            value={swapperTotalMarks}
                            onChange={(e) => setSwapperTotalMarks(parseInt(e.target.value, 10) || swapperCount)}
                            className="w-14 px-1.5 py-0.5 rounded bg-secondary border border-border text-amber-300 font-bold text-xs text-center"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 3. Selection Method & Policies */}
                    <div>
                      <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">
                        3. Method &amp; Policy Strategy
                      </label>
                      <select
                        value={swapperSelectionMode}
                        onChange={(e) => setSwapperSelectionMode(e.target.value)}
                        className="input-field text-xs mb-1.5"
                      >
                        <option value="random">Any {swapperCount} Random (Non-Duplicate)</option>
                        <option value="sequential">Sequential (Order 1..{swapperCount})</option>
                        <option value="policy">10 TN Policies Sorted/Balanced</option>
                      </select>

                      {swapperSelectionMode === "policy" && (
                        <select
                          value={swapperPolicyId}
                          onChange={(e) => setSwapperPolicyId(Number(e.target.value))}
                          className="input-field text-[11px] border-violet-500/40 text-violet-300"
                        >
                          <option value={1}>Policy 1: Easy-Only (Recall &amp; Definitions)</option>
                          <option value={2}>Policy 2: Moderate Standard (Application)</option>
                          <option value={3}>Policy 3: Challenging Paper (Hard Problems)</option>
                          <option value={4}>Policy 4: Real-Life Application</option>
                          <option value={5}>Policy 5: Diagram &amp; Visual Representation</option>
                          <option value={6}>Policy 6: Balanced Blueprint (30% Easy, 50% Med, 20% Hard)</option>
                          <option value={7}>Policy 7: Numerical &amp; Derivations</option>
                          <option value={8}>Policy 8: Case-Based Assertion-Reason</option>
                          <option value={9}>Policy 9: Fast-Paced Speed Test</option>
                          <option value={10}>Policy 10: Remedial &amp; Confidence Booster</option>
                        </select>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons Row */}
                  <div className="flex items-center justify-between pt-2 border-t border-border flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-muted-foreground">
                        Will replace active questions with <strong>{swapperCount} questions</strong> from <strong>{swapperPoolRange}</strong> ({swapperSelectionMode}).
                      </span>
                      <label className="inline-flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-muted-foreground hover:text-foreground">
                        <input
                          type="checkbox"
                          checked={swapperShuffleOptions}
                          onChange={(e) => setSwapperShuffleOptions(e.target.checked)}
                          className="rounded border-border accent-emerald-500"
                        />
                        <span>Also Scramble ABCD Options</span>
                      </label>
                    </div>
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => handleGenerateFromPool()}
                      disabled={regenerating}
                      className="gap-1.5 font-bold text-xs bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/25 py-1.5 px-4"
                    >
                      {regenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                      Generate &amp; Apply {swapperCount} Questions to Exam
                    </Button>
                  </div>
                </div>

                {/* Quick Sequence & Option Randomizer Toolbar (Phase 6.5) */}
                <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/25 flex items-center justify-between flex-wrap gap-2.5">
                  <div className="flex items-center gap-2">
                    <Shuffle className="w-4 h-4 text-violet-400" />
                    <div>
                      <span className="text-xs font-bold text-violet-200 block">Randomize Question Sequence &amp; Choices</span>
                      <span className="text-[10px] text-muted-foreground">Scramble Q1 ↔ Q10 order and option placements each time for authentic anti-cheat variability.</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleTriggerShuffle("shuffle_questions")}
                      disabled={shufflingActive || regenerating}
                      className="text-xs py-1 px-2.5 text-violet-300 border-violet-500/30 hover:bg-violet-500/20 font-bold gap-1"
                      title="Randomize Question Order (e.g. Q1 becomes Q10, Q10 becomes Q1)"
                    >
                      {shufflingActive ? <Loader2 className="w-3 h-3 animate-spin" /> : <Shuffle className="w-3 h-3 text-violet-400" />}
                      Shuffle Question Numbers (1..N)
                    </Button>

                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleTriggerShuffle("shuffle_options")}
                      disabled={shufflingActive || regenerating}
                      className="text-xs py-1 px-2.5 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/20 font-bold gap-1"
                      title="Scramble ABCD option choices for every question while preserving official correct answer"
                    >
                      {shufflingActive ? <Loader2 className="w-3 h-3 animate-spin" /> : <Shuffle className="w-3 h-3 text-cyan-400" />}
                      Shuffle Options (A, B, C, D)
                    </Button>

                    <Button
                      type="button"
                      size="sm"
                      variant="primary"
                      onClick={() => handleTriggerShuffle("shuffle_all")}
                      disabled={shufflingActive || regenerating}
                      className="text-xs py-1 px-3 bg-violet-600 hover:bg-violet-500 text-white font-bold gap-1 shadow-md shadow-violet-600/30"
                      title="Shuffle both question order AND ABCD options in one click"
                    >
                      {shufflingActive ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3 text-amber-300" />}
                      Shuffle Everything (Questions + Options)
                    </Button>
                  </div>
                </div>

                {/* Sub-Navigation Tabs */}
                <div className="flex items-center gap-2 border-b border-border pb-2">
                  <button
                    type="button"
                    onClick={() => { setSwapperTab("CURRENT"); setEditingQuestion(null); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      swapperTab === "CURRENT"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Active Exam Questions ({randomPoolData?.currentQuestions?.length || 0})
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSwapperTab("BROWSE_BANK"); setEditingQuestion(null); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      swapperTab === "BROWSE_BANK"
                        ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    Browse 100-QB Pool ({randomPoolData?.bankTotal || 0}) [Multi-Select]
                  </button>
                  {editingQuestion && (
                    <span className="badge badge-amber text-[10px] ml-auto">
                      Editing Q#{editingQuestion.questionNumber}
                    </span>
                  )}
                </div>

                {/* Inline Question Editor Card (when active) */}
                {editingQuestion && (
                  <form onSubmit={handleSaveQuestionEdit} className="p-4 rounded-xl bg-card border border-amber-500/40 space-y-3 animate-in fade-in-50">
                    <div className="flex items-center justify-between border-b border-border pb-2">
                      <span className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                        <Edit3 className="w-4 h-4 text-amber-400" />
                        Edit Question #{editingQuestion.questionNumber}
                      </span>
                      <button
                        type="button"
                        onClick={() => setEditingQuestion(null)}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        Cancel
                      </button>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Question Text</label>
                      <textarea
                        rows={2}
                        value={editingQuestion.questionText}
                        onChange={(e) => setEditingQuestion((q) => ({ ...q, questionText: e.target.value }))}
                        className="input-field text-xs font-medium"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Option A</label>
                        <input
                          type="text"
                          value={editingQuestion.optA}
                          onChange={(e) => setEditingQuestion((q) => ({ ...q, optA: e.target.value }))}
                          className="input-field text-xs"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Option B</label>
                        <input
                          type="text"
                          value={editingQuestion.optB}
                          onChange={(e) => setEditingQuestion((q) => ({ ...q, optB: e.target.value }))}
                          className="input-field text-xs"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Option C</label>
                        <input
                          type="text"
                          value={editingQuestion.optC}
                          onChange={(e) => setEditingQuestion((q) => ({ ...q, optC: e.target.value }))}
                          className="input-field text-xs"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Option D</label>
                        <input
                          type="text"
                          value={editingQuestion.optD}
                          onChange={(e) => setEditingQuestion((q) => ({ ...q, optD: e.target.value }))}
                          className="input-field text-xs"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Correct Answer</label>
                        <select
                          value={editingQuestion.correctAnswer}
                          onChange={(e) => setEditingQuestion((q) => ({ ...q, correctAnswer: e.target.value }))}
                          className="input-field text-xs font-bold"
                        >
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                          <option value="D">D</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Marks</label>
                        <input
                          type="number"
                          value={editingQuestion.marks}
                          onChange={(e) => setEditingQuestion((q) => ({ ...q, marks: parseInt(e.target.value, 10) || 2 }))}
                          className="input-field text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Difficulty</label>
                        <select
                          value={editingQuestion.difficulty}
                          onChange={(e) => setEditingQuestion((q) => ({ ...q, difficulty: e.target.value }))}
                          className="input-field text-xs"
                        >
                          <option value="EASY">EASY</option>
                          <option value="MEDIUM">MEDIUM</option>
                          <option value="HARD">HARD</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Explanation</label>
                      <input
                        type="text"
                        value={editingQuestion.explanation}
                        onChange={(e) => setEditingQuestion((q) => ({ ...q, explanation: e.target.value }))}
                        className="input-field text-xs"
                        placeholder="Detailed solution or syllabus rationale"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-border">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setEditingQuestion(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        disabled={savingEdit}
                        className="bg-amber-600 hover:bg-amber-500 font-bold"
                      >
                        {savingEdit ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        Save Question Edits
                      </Button>
                    </div>
                  </form>
                )}

                {/* TAB 1: Active Exam Questions */}
                {swapperTab === "CURRENT" && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground block">
                        Currently Configured Questions ({randomPoolData?.currentQuestions?.length || 0}):
                      </span>
                    </div>

                    {randomPoolData?.currentQuestions?.map((q) => (
                      <div key={q.id} className="p-3.5 rounded-xl bg-card border border-border space-y-2 hover:border-emerald-500/30 transition-colors">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono text-emerald-400 font-bold">Q{q.questionNumber}.</span>
                              <Badge variant={q.difficulty === "HARD" ? "destructive" : q.difficulty === "EASY" ? "success" : "purple"}>
                                {q.difficulty || "MEDIUM"}
                              </Badge>
                              <span className="text-[10px] text-muted-foreground font-mono">{q.marks} Marks</span>
                            </div>
                            <p className="font-medium text-foreground text-xs leading-relaxed">
                              {q.questionText}
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => startEditQuestion(q)}
                              className="text-[11px] py-0.5 px-2.5 border-amber-500/30 text-amber-300 hover:bg-amber-500/15 gap-1 font-semibold"
                              title="Edit this question inline"
                            >
                              <Edit3 className="w-3 h-3 text-amber-400" />
                              Edit
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleSwapQuestion(q.id)}
                              disabled={swappingId === q.id}
                              className="text-[11px] py-0.5 px-2.5 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/15 gap-1 font-semibold"
                              title="Replace this question with another unused question from the bank"
                            >
                              {swappingId === q.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3 text-emerald-400" />}
                              Swap
                            </Button>
                          </div>
                        </div>

                        {q.options && (
                          <div className="grid grid-cols-2 gap-1.5 text-[11px] text-muted-foreground pt-1">
                            {Array.isArray(q.options)
                              ? q.options.map((opt) => (
                                  <div key={opt.id} className={`px-2 py-1 rounded-md border ${
                                    opt.id === q.correctAnswer ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300 font-semibold" : "border-border bg-secondary/30"
                                  }`}>
                                    <span className="font-bold font-mono mr-1.5">{opt.id}:</span>
                                    <span>{opt.text}</span>
                                  </div>
                                ))
                              : Object.keys(q.options).map((key) => (
                                  <div key={key} className={`px-2 py-1 rounded-md border ${
                                    key === q.correctAnswer ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300 font-semibold" : "border-border bg-secondary/30"
                                  }`}>
                                    <span className="font-bold font-mono mr-1.5">{key}:</span>
                                    <span>{q.options[key]}</span>
                                  </div>
                                ))}
                          </div>
                        )}

                        {q.explanation && (
                          <div className="text-[10px] text-muted-foreground bg-secondary/30 p-2 rounded-lg font-mono">
                            <span className="font-bold text-slate-400 mr-1">Explanation:</span>
                            {q.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* TAB 2: Browse 100-QB Pool with Multi-Select Checkboxes */}
                {swapperTab === "BROWSE_BANK" && (
                  <div className="space-y-3">
                    {/* Quick selection toolbar */}
                    <div className="p-3 rounded-xl bg-card border border-border flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] font-bold text-muted-foreground mr-1">Quick Select:</span>
                        <button
                          type="button"
                          onClick={() => selectBankPreset("FIRST_25")}
                          className="px-2 py-1 rounded border border-border hover:bg-secondary text-[11px] font-semibold text-foreground"
                        >
                          First 25
                        </button>
                        <button
                          type="button"
                          onClick={() => selectBankPreset("FIRST_50")}
                          className="px-2 py-1 rounded border border-emerald-500/30 hover:bg-emerald-500/10 text-[11px] font-semibold text-emerald-300"
                        >
                          First 50 (Set A)
                        </button>
                        <button
                          type="button"
                          onClick={() => selectBankPreset("SECOND_50")}
                          className="px-2 py-1 rounded border border-sky-500/30 hover:bg-sky-500/10 text-[11px] font-semibold text-sky-300"
                        >
                          Remaining 50 (Set B)
                        </button>
                        <button
                          type="button"
                          onClick={() => selectBankPreset("ALL")}
                          className="px-2 py-1 rounded border border-border hover:bg-secondary text-[11px] font-semibold text-foreground"
                        >
                          All 100
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedBankCheckboxes(new Set())}
                          className="px-2 py-1 rounded border border-rose-500/30 hover:bg-rose-500/10 text-[11px] font-semibold text-rose-300"
                        >
                          Clear
                        </button>
                      </div>

                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        disabled={selectedBankCheckboxes.size === 0 || regenerating}
                        onClick={() => handleGenerateFromPool({ selectionMode: "custom", count: selectedBankCheckboxes.size })}
                        className="bg-sky-600 hover:bg-sky-500 font-bold gap-1 text-xs"
                      >
                        <CheckSquare className="w-3.5 h-3.5" />
                        Apply Selected ({selectedBankCheckboxes.size} Qs) to Exam
                      </Button>
                    </div>

                    {/* Bank Items List */}
                    <div className="space-y-2">
                      {randomPoolData?.bankItems?.map((b) => {
                        const isChecked = selectedBankCheckboxes.has(b.id);
                        return (
                          <div
                            key={b.id}
                            onClick={() => toggleBankCheckbox(b.id)}
                            className={`p-3 rounded-xl border transition-all cursor-pointer ${
                              isChecked
                                ? "bg-sky-500/10 border-sky-500/50"
                                : "bg-card border-border hover:border-slate-600"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <button
                                type="button"
                                className="mt-0.5 text-sky-400"
                                onClick={(e) => { e.stopPropagation(); toggleBankCheckbox(b.id); }}
                              >
                                {isChecked ? <CheckSquare className="w-4 h-4 text-sky-400" /> : <Square className="w-4 h-4 text-muted-foreground" />}
                              </button>
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-sky-300">#Q{b.questionNumber}</span>
                                  <Badge variant={b.difficulty === "HARD" ? "destructive" : b.difficulty === "EASY" ? "success" : "purple"}>
                                    {b.difficulty || "MEDIUM"}
                                  </Badge>
                                  {b.isSelected && (
                                    <span className="badge badge-emerald text-[9px] py-0">In Current Exam</span>
                                  )}
                                  {b.topic && (
                                    <span className="text-[10px] text-muted-foreground font-medium">{b.topic}</span>
                                  )}
                                </div>
                                <p className="text-xs text-foreground font-medium">{b.questionText}</p>

                                {b.options && (
                                  <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px] text-muted-foreground">
                                    {Array.isArray(b.options)
                                      ? b.options.map((opt) => (
                                          <div key={opt.id} className={`px-2 py-0.5 rounded border text-[10px] ${
                                            opt.id === b.correctAnswer ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300 font-semibold" : "border-border"
                                          }`}>
                                            <span className="font-bold mr-1">{opt.id}:</span>
                                            <span>{opt.text}</span>
                                          </div>
                                        ))
                                      : Object.keys(b.options).map((key) => (
                                          <div key={key} className={`px-2 py-0.5 rounded border text-[10px] ${
                                            key === b.correctAnswer ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300 font-semibold" : "border-border"
                                          }`}>
                                            <span className="font-bold mr-1">{key}:</span>
                                            <span>{b.options[key]}</span>
                                          </div>
                                        ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
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
                                {sub.studentName || sub.student?.fullName || "Candidate"} ({sub.rollNo || sub.student?.user?.username || "Roll No"})
                              </span>
                              <div className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
                                <span>Time Spent: {Math.floor((sub.timeTakenSecs || 0) / 60)}m {(sub.timeTakenSecs || 0) % 60}s</span>
                                <span>• Submitted: {safeFormatTime(sub.submittedAt)}</span>
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
                              {normalizeOptionsList(q.options).map((opt) => (
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
                            Submitted at {safeFormatTime(selectedSubmission.submittedAt)} • Time Taken: {Math.floor((selectedSubmission.timeTakenSecs || 0) / 60)} mins
                          </span>
                        </div>
                        <Badge variant="success" className="text-xs font-mono font-bold">
                          Total Score: {selectedSubmission.score || 0} / {examDetail?.totalMarks || 100}
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
                                {normalizeOptionsList(q.options).map((opt) => {
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
                      {normalizeOptionsList(q.options).map((opt) => (
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

      {/* Reschedule Exam Date Modal */}
      {rescheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in-50">
          <Card className="max-w-lg w-full p-6 space-y-4 border-amber-500/30 bg-card shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-foreground">
                  Reschedule Examination Date & Time
                </h3>
              </div>
              <button
                onClick={() => setRescheduleModal(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-secondary/50 border border-border text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subject:</span>
                <span className="font-bold text-foreground">
                  {rescheduleModal.subject?.name} ({rescheduleModal.subject?.code})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Standard:</span>
                <span className="font-semibold text-foreground">Class {rescheduleModal.prepClass}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current Date & Time:</span>
                <span className="font-mono text-amber-400 font-bold">
                  {safeFormatDate(rescheduleModal.examDate)} at {safeFormatTime(rescheduleModal.examDate)}
                </span>
              </div>
            </div>

            <form onSubmit={handleSaveReschedule} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">
                    New Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">
                    New Time (24h) *
                  </label>
                  <input
                    type="time"
                    required
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground font-mono text-xs"
                  />
                </div>
              </div>

              {/* Duration and Total Marks Settings */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-secondary/30 border border-border">
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="360"
                    value={rescheduleDuration}
                    onChange={(e) => setRescheduleDuration(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-secondary border border-border text-foreground font-mono text-xs"
                  />
                  <div className="flex gap-1 mt-1.5">
                    {[30, 45, 60, 90].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setRescheduleDuration(mins)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${
                          Number(rescheduleDuration) === mins
                            ? "bg-amber-500/20 border-amber-500 text-amber-300 font-bold"
                            : "border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">
                    Maximum Total Marks
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="200"
                    value={rescheduleTotalMarks}
                    onChange={(e) => setRescheduleTotalMarks(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-secondary border border-border text-foreground font-mono text-xs"
                  />
                  <div className="flex gap-1 mt-1.5">
                    {[10, 25, 50, 100].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setRescheduleTotalMarks(m)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${
                          Number(rescheduleTotalMarks) === m
                            ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold"
                            : "border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {m}M
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">
                  Reason for Rescheduling (Audit Log) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Physics rescheduled from Nov 3 to Nov 2 per COE directive"
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground text-xs"
                />
              </div>

              {/* COE Phase 0 Result Release Policy */}
              <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 space-y-2">
                <label className="block text-foreground font-bold">
                  Result Publication Policy (COE Phase 0 Release Timing)
                </label>
                <p className="text-[11px] text-muted-foreground">
                  Determine when evaluated marks and answer sheets unlock for student viewing.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    value={rescheduleResultPolicy}
                    onChange={(e) => setRescheduleResultPolicy(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground text-xs font-semibold"
                  >
                    <option value="0">Immediate Release (0 mins delay)</option>
                    <option value="1">1 Minute after student submits</option>
                    <option value="5">5 Minutes after student submits</option>
                    <option value="10">10 Minutes after student submits</option>
                    <option value="custom">Custom Delay (in Minutes)</option>
                    <option value="date">Specific Date & Time Release</option>
                  </select>

                  {rescheduleResultPolicy === "custom" && (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="1440"
                        value={rescheduleCustomMinutes}
                        onChange={(e) => setRescheduleCustomMinutes(e.target.value)}
                        placeholder="Minutes"
                        className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground text-xs font-mono"
                      />
                      <span className="text-[11px] text-muted-foreground whitespace-nowrap">mins after submit</span>
                    </div>
                  )}

                  {rescheduleResultPolicy === "date" && (
                    <input
                      type="datetime-local"
                      value={reschedulePublishDate}
                      onChange={(e) => setReschedulePublishDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground text-xs font-mono"
                    />
                  )}
                </div>
              </div>

              {rescheduleAuditLogs.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-border">
                  <span className="text-[11px] font-bold text-muted-foreground block">
                    Previous Schedule Change Audit Logs:
                  </span>
                  <div className="max-h-28 overflow-y-auto space-y-1 pr-1">
                    {rescheduleAuditLogs.map((log) => (
                      <div key={log.id} className="p-2 rounded bg-secondary/30 border border-border text-[10px] space-y-0.5">
                        <div className="flex justify-between text-muted-foreground font-mono">
                          <span>{safeFormatDate(log.newDate)} {safeFormatTime(log.newDate)}</span>
                          <span>by {log.changedBy}</span>
                        </div>
                        <p className="text-foreground italic">&ldquo;{log.reason}&rdquo;</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2 border-t border-border">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setRescheduleModal(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  variant="primary"
                  disabled={rescheduleSubmitting}
                  className="gap-1.5 font-bold bg-amber-600 hover:bg-amber-500 text-white"
                >
                  {rescheduleSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Calendar className="w-3.5 h-3.5" />}
                  Confirm Reschedule
                </Button>
              </div>
            </form>
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
