"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  Award,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Sparkles,
  Save,
  Eye,
  Loader2,
  Calendar,
  Layers,
  ChevronRight
} from "lucide-react";

function COEAdminResultsContent() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState("ALL");
  const [notification, setNotification] = useState("");
  const [savingKey, setSavingKey] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Form states keyed by `${examId}_${studentId}`
  const [formInputs, setFormInputs] = useState({});

  const handleAutoGradeAll = async (examId) => {
    setActionLoadingId(examId + "_grade");
    try {
      const res = await fetch("/api/admin/results/auto-grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examScheduleId: examId }),
      });
      const data = await res.json();
      if (res.ok) {
        showMsg(data.message || "Submissions auto-graded successfully! Results are held privately.");
        fetchResults();
      } else {
        alert(data.error || "Failed to auto-grade submissions.");
      }
    } catch {
      alert("Network error auto-grading submissions.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handlePublishAllResults = async (examId, isPublished) => {
    setActionLoadingId(examId + "_pub");
    try {
      const res = await fetch("/api/admin/results/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examScheduleId: examId, isPublished }),
      });
      const data = await res.json();
      if (res.ok) {
        showMsg(data.message || (isPublished ? "Results officially published to students!" : "Results withdrawn."));
        fetchResults();
      } else {
        alert(data.error || "Failed to publish results.");
      }
    } catch {
      alert("Network error updating publication status.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const fetchResults = async () => {
    setLoading(true);
    try {
      const url = selectedClass === "ALL" ? "/api/admin/results" : `/api/admin/results?prepClass=${selectedClass}`;
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) {
        setExams(data.exams || []);

        // Initialize form inputs from existing results or submissions
        const initial = {};
        data.exams?.forEach((exam) => {
          exam.candidates?.forEach((c) => {
            const key = `${exam.id}_${c.studentId}`;
            initial[key] = {
              marksObtained: c.result?.marksObtained ?? (c.submission?.score ?? ""),
              maxMarks: c.result?.maxMarks ?? exam.totalMarks,
              remarks: c.result?.remarks || "",
              isPublished: c.result?.isPublished || false,
            };
          });
        });
        setFormInputs(initial);
      }
    } catch (err) {
      console.error("Error fetching results:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [selectedClass]);

  const showMsg = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 4500);
  };

  const handleInputChange = (key, field, value) => {
    setFormInputs((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }));
  };

  // Save or update marks in SQLite
  const handleSaveMarks = async (exam, candidate, publishOverride) => {
    const key = `${exam.id}_${candidate.studentId}`;
    const form = formInputs[key];
    if (!form || form.marksObtained === "") {
      alert("Please enter marks obtained before saving.");
      return;
    }

    setSavingKey(key);
    try {
      const isPublished = publishOverride !== undefined ? publishOverride : form.isPublished;
      const res = await fetch("/api/admin/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examScheduleId: exam.id,
          studentId: candidate.studentId,
          marksObtained: form.marksObtained,
          maxMarks: form.maxMarks || exam.totalMarks,
          remarks: form.remarks,
          isPublished,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        handleInputChange(key, "isPublished", isPublished);
        showMsg(
          `Marks recorded for ${candidate.fullName}: ${form.marksObtained}/${form.maxMarks || exam.totalMarks} (${
            data.result.grade
          } - ${data.result.gradeLabel}) • ${isPublished ? "PUBLISHED to Student Portal" : "Saved as Draft"}.`
        );
        fetchResults();
      } else {
        alert(data.error || "Failed to save marks.");
      }
    } catch (err) {
      alert("Network error saving marks.");
    } finally {
      setSavingKey(null);
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
                Marks Entry & Result Publishing Engine
              </h1>
              <Badge variant="warning">COE Evaluation Portal</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Evaluate objective and descriptive marks, provide official feedback, and publish grade statements.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/coe-admin/exams">
            <Button size="sm" variant="outline" className="gap-1.5 text-xs">
              <Calendar className="w-4 h-4 text-amber-400" /> Exam Schedules
            </Button>
          </Link>
          <Link href="/student/results?previewRollNo=TN2026-0901">
            <Button size="sm" className="gap-1.5 text-xs bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold">
              <Eye className="w-4 h-4" /> Preview Marksheet
            </Button>
          </Link>
        </div>
      </div>

      {/* Floating Status Notification */}
      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in-50">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Standard Filter */}
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

        <span className="text-xs text-muted-foreground font-mono">
          Exams Scheduled: {exams.length}
        </span>
      </div>

      {/* Main Examination Marks Entry Cards */}
      {loading ? (
        <div className="p-12 text-center text-xs text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-amber-400" />
          Loading candidate submissions and evaluation cards from SQLite...
        </div>
      ) : exams.length === 0 ? (
        <Card className="p-8 text-center text-xs text-muted-foreground">
          No examinations found for this filter. Schedule exams first via the Exam Schedules section.
        </Card>
      ) : (
        <div className="space-y-6">
          {exams.map((exam) => (
            <Card key={exam.id} className="border-border overflow-hidden">
              {/* Exam Header */}
              <div className="p-4 sm:p-5 bg-secondary/50 border-b border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base text-foreground">
                      {exam.subject}
                    </h3>
                    <Badge variant="purple">Class {exam.prepClass}</Badge>
                    <Badge variant="secondary" className="font-mono text-[10px]">{exam.code}</Badge>
                    <Badge variant={exam.status === "PUBLISHED" ? "success" : "secondary"}>
                      {exam.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
                    <span>
                      Date: {new Date(exam.examDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <span>• Duration: {exam.durationMinutes} mins</span>
                    <span>• Maximum Marks: {exam.totalMarks}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="warning" className="text-xs py-1">
                    Candidates: {exam.candidates?.length || 0} Assigned
                  </Badge>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAutoGradeAll(exam.id)}
                    disabled={actionLoadingId === exam.id + "_grade"}
                    className="text-xs font-bold gap-1.5 border-violet-500/30 text-violet-300 hover:bg-violet-500/10"
                    title="Auto-grade all candidate answers against answer keys"
                  >
                    {actionLoadingId === exam.id + "_grade" ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    )}
                    Auto-Grade All
                  </Button>

                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handlePublishAllResults(exam.id, true)}
                    disabled={actionLoadingId === exam.id + "_pub"}
                    className="text-xs font-bold gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-sm"
                    title="Publish evaluated marks to student portal"
                  >
                    {actionLoadingId === exam.id + "_pub" ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Award className="w-3.5 h-3.5" />
                    )}
                    Publish Results
                  </Button>
                </div>
              </div>

              {/* Candidates Evaluation Rows */}
              <div className="p-4 sm:p-6 space-y-6">
                {exam.candidates?.map((candidate) => {
                  const key = `${exam.id}_${candidate.studentId}`;
                  const form = formInputs[key] || {
                    marksObtained: "",
                    maxMarks: exam.totalMarks,
                    remarks: "",
                    isPublished: false,
                  };
                  const isSaving = savingKey === key;

                  return (
                    <div
                      key={candidate.studentId}
                      className="p-5 rounded-2xl bg-card border border-border shadow-sm space-y-4"
                    >
                      {/* Candidate Meta Info & Submission Receipt */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-border">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-foreground">
                              {candidate.fullName}
                            </span>
                            <span className="font-mono text-xs text-sky-400 font-semibold">
                              ({candidate.rollNo})
                            </span>
                            <Badge variant="secondary" className="text-[10px]">
                              Class {candidate.currentClass} Student
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            Exam Prep Standard: Class {candidate.prepClass} Tamil Nadu Samacheer Kalvi
                          </p>
                        </div>

                        {/* Submission status */}
                        {candidate.submission ? (
                          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-xs text-emerald-400">
                            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                            <span>
                              <strong>Submitted:</strong> {Math.floor(candidate.submission.timeTakenSecs / 60)}m {candidate.submission.timeTakenSecs % 60}s
                            </span>
                            <Badge variant="success" className="ml-1 text-[10px]">
                              Auto-Score: {candidate.submission.score} Marks
                            </Badge>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium bg-secondary px-3 py-1.5 rounded-xl border border-border">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Test Not Yet Taken</span>
                          </div>
                        )}
                      </div>

                      {/* Marks & Remarks Input Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
                        {/* Marks Obtained */}
                        <div className="md:col-span-3">
                          <label className="block text-muted-foreground font-semibold mb-1">
                            Marks Obtained
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              step="0.5"
                              min="0"
                              max={form.maxMarks}
                              value={form.marksObtained}
                              onChange={(e) => handleInputChange(key, "marksObtained", e.target.value)}
                              placeholder="0"
                              className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground font-bold text-sm"
                            />
                            {candidate.submission?.score !== undefined && (
                              <button
                                type="button"
                                onClick={() => handleInputChange(key, "marksObtained", candidate.submission.score)}
                                className="px-2 py-1.5 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400 text-[10px] font-bold hover:bg-sky-500/20 whitespace-nowrap"
                                title="Autofill from objective submission score"
                              >
                                Autofill Score
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Maximum Marks */}
                        <div className="md:col-span-2">
                          <label className="block text-muted-foreground font-semibold mb-1">
                            Max Marks
                          </label>
                          <input
                            type="number"
                            value={form.maxMarks}
                            onChange={(e) => handleInputChange(key, "maxMarks", e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground font-semibold text-sm"
                          />
                        </div>

                        {/* Calculated Percentage & Grade Preview */}
                        <div className="md:col-span-2 flex flex-col justify-center">
                          <span className="text-muted-foreground font-semibold text-[11px] mb-1">
                            Calculated Grade
                          </span>
                          {form.marksObtained !== "" && form.maxMarks > 0 ? (
                            <div className="flex items-center gap-1.5">
                              <Badge variant="purple" className="text-xs font-bold">
                                {Math.round((parseFloat(form.marksObtained) / parseFloat(form.maxMarks)) * 100)}%
                              </Badge>
                              <span className="font-extrabold text-foreground text-xs">
                                Grade {candidate.result?.grade || (parseFloat(form.marksObtained) / parseFloat(form.maxMarks) >= 0.9 ? "A+" : "A")}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground italic text-[11px]">Pending marks</span>
                          )}
                        </div>

                        {/* Remarks / Feedback */}
                        <div className="md:col-span-5">
                          <label className="block text-muted-foreground font-semibold mb-1">
                            COE Remarks & Subject Feedback
                          </label>
                          <input
                            type="text"
                            value={form.remarks}
                            onChange={(e) => handleInputChange(key, "remarks", e.target.value)}
                            placeholder="e.g. Exceptional mastery of concepts. Excellent presentation."
                            className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground"
                          />
                        </div>
                      </div>

                      {/* Action Bar */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-border">
                        <div className="flex items-center gap-2">
                          {candidate.result?.isPublished ? (
                            <Badge variant="success" className="gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Live on Student Portal
                            </Badge>
                          ) : candidate.result ? (
                            <Badge variant="secondary">Saved as Private Draft</Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">Unrecorded</Badge>
                          )}
                          {candidate.result?.createdAt && (
                            <span className="text-[10px] text-muted-foreground font-mono">
                              Last updated: {new Date(candidate.result.createdAt).toLocaleDateString("en-IN")}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSaveMarks(exam, candidate, false)}
                            disabled={isSaving}
                            className="flex-1 sm:flex-none text-xs"
                          >
                            <Save className="w-3.5 h-3.5 mr-1" /> Save Draft
                          </Button>

                          <Button
                            size="sm"
                            onClick={() => handleSaveMarks(exam, candidate, !form.isPublished)}
                            disabled={isSaving}
                            className={`flex-1 sm:flex-none text-xs font-bold ${
                              form.isPublished
                                ? "bg-rose-500 hover:bg-rose-400 text-white"
                                : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20"
                            }`}
                          >
                            {isSaving ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                            ) : form.isPublished ? (
                              "Unpublish from Student"
                            ) : (
                              "Publish Result to Student"
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function COEAdminResultsPage() {
  return (
    <AdminGuard>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
        </div>
      }>
        <COEAdminResultsContent />
      </Suspense>
    </AdminGuard>
  );
}
