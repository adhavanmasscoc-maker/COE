"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import {
  ShieldCheck,
  ArrowLeft,
  PlusCircle,
  Trash2,
  CheckCircle,
  FileText,
  Loader2,
  AlertCircle,
  Sparkles,
  Building,
  Edit,
  Lock,
  Unlock,
  ChevronDown,
  ChevronUp
} from "lucide-react";

function COEPapersContent() {
  const [prepClass, setPrepClass] = useState(10); // 10 or 12
  const [papers, setPapers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState("");

  // New Paper Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSubjectId, setNewSubjectId] = useState("");
  const [newYear, setNewYear] = useState("2024");
  const [newSource, setNewSource] = useState("Directorate of Government Examinations (DGE), Government of Tamil Nadu");
  const [newPaperType, setNewPaperType] = useState("PUBLIC_EXAM");
  const [newMarks, setNewMarks] = useState("100");
  const [newDuration, setNewDuration] = useState("150");
  const [newPublish, setNewPublish] = useState(true);

  // Edit Solution State
  const [activePaperForSolution, setActivePaperForSolution] = useState(null);
  const [solutionTitle, setSolutionTitle] = useState("");
  const [solutionContent, setSolutionContent] = useState("");
  const [solutionPublish, setSolutionPublish] = useState(true);

  const fetchData = async (standard) => {
    setLoading(true);
    try {
      // 1. Fetch papers
      const papersRes = await fetch(`/api/papers?prepClass=${standard}`);
      const papersJson = await papersRes.json();
      if (papersRes.ok) {
        setPapers(papersJson.papers || []);
      }

      // 2. Fetch subjects for dropdown
      const subsRes = await fetch(`/api/syllabus?prepClass=${standard}`);
      const subsJson = await subsRes.json();
      if (subsRes.ok && subsJson.subjects?.length > 0) {
        setSubjects(subsJson.subjects);
        setNewSubjectId(subsJson.subjects[0].id);
      }
    } catch (err) {
      setError("Network error fetching paper library.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(prepClass);
  }, [prepClass]);

  // Create Question Paper in SQLite
  const handleCreatePaper = async (e) => {
    e.preventDefault();
    if (!newTitle || !newSubjectId) return;

    try {
      const res = await fetch("/api/admin/papers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId: newSubjectId,
          prepClass,
          examYear: newYear,
          title: newTitle,
          board: "Tamil Nadu State Board",
          sourceInfo: newSource,
          paperType: newPaperType,
          maxMarks: newMarks,
          durationMinutes: newDuration,
          isPublished: newPublish,
        }),
      });

      const json = await res.json();
      if (res.ok) {
        setNotification(`Question paper "${newTitle}" created successfully!`);
        setShowAddForm(false);
        setNewTitle("");
        fetchData(prepClass);
      } else {
        setNotification(json.error || "Failed to create question paper.");
      }
    } catch (err) {
      setNotification("Network error creating paper.");
    } finally {
      setTimeout(() => setNotification(""), 3500);
    }
  };

  // Toggle Paper Publication
  const handleTogglePaperPublish = async (paperId, currentStatus, title) => {
    const nextStatus = !currentStatus;
    try {
      const res = await fetch(`/api/admin/papers/${paperId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: nextStatus }),
      });

      if (res.ok) {
        setNotification(`Paper "${title}" is now ${nextStatus ? "PUBLISHED to Student Portal" : "SAVED as DRAFT"}.`);
        fetchData(prepClass);
      }
    } catch (err) {
      setNotification("Network error updating status.");
    } finally {
      setTimeout(() => setNotification(""), 3500);
    }
  };

  // Open Solution Editor for a paper
  const openSolutionEditor = (paper) => {
    setActivePaperForSolution(paper.id);
    if (paper.solution) {
      setSolutionTitle(paper.solution.title);
      setSolutionContent(paper.solution.content);
      setSolutionPublish(paper.solution.isPublished);
    } else {
      setSolutionTitle(`Step-by-Step Worked Solutions - ${paper.title}`);
      setSolutionContent("Section I:\n1. Detailed solution step by step...\n\nSection II:\n...");
      setSolutionPublish(true);
    }
  };

  // Save Worked Solution
  const handleSaveSolution = async (e, paperId) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/admin/papers/${paperId}/solution`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: solutionTitle,
          content: solutionContent,
          isPublished: solutionPublish,
        }),
      });

      if (res.ok) {
        setNotification("Worked solution saved successfully!");
        setActivePaperForSolution(null);
        fetchData(prepClass);
      } else {
        setNotification("Failed to save solution.");
      }
    } catch (err) {
      setNotification("Network error saving solution.");
    } finally {
      setTimeout(() => setNotification(""), 3500);
    }
  };

  // Toggle Solution Publication independently
  const handleToggleSolutionPublish = async (paperId, currentStatus) => {
    const nextStatus = !currentStatus;
    try {
      const res = await fetch(`/api/admin/papers/${paperId}/solution`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: nextStatus }),
      });

      if (res.ok) {
        setNotification(`Worked solution is now ${nextStatus ? "PUBLISHED to Students" : "UNPUBLISHED (Hidden)"}.`);
        fetchData(prepClass);
      }
    } catch (err) {
      setNotification("Network error toggling solution publication.");
    } finally {
      setTimeout(() => setNotification(""), 3500);
    }
  };

  // Delete Paper
  const handleDeletePaper = async (paperId, title) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/papers/${paperId}`, { method: "DELETE" });
      if (res.ok) {
        setNotification(`Paper "${title}" deleted from library.`);
        fetchData(prepClass);
      }
    } catch (err) {
      setNotification("Network error deleting paper.");
    } finally {
      setTimeout(() => setNotification(""), 3500);
    }
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-secondary/80 border border-border">
        <div className="flex items-center gap-3">
          <Link
            href="/coe-admin/dashboard"
            className="p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
            title="Return to COE Control Center"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-foreground">
                COE Question Paper & Worked Solution Manager
              </h1>
              <Badge variant="warning">Independent Publishing</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Catalog previous-year public papers with source attribution and publish your worked solutions independently
            </p>
          </div>
        </div>

        {/* Standard Switcher */}
        <div className="flex items-center gap-2 bg-card p-1.5 rounded-xl border border-border">
          <button
            type="button"
            onClick={() => setPrepClass(10)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              prepClass === 10
                ? "bg-sky-500 text-slate-950 font-bold shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Class 10
          </button>
          <button
            type="button"
            onClick={() => setPrepClass(12)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              prepClass === 12
                ? "bg-purple-500 text-white font-bold shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Class 12
          </button>
        </div>
      </div>

      {/* Real-time Notification Toast */}
      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300 font-medium transition-all animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">
            Question Paper Library (Class {prepClass} Standards)
          </h2>
          <p className="text-xs text-muted-foreground">
            {papers.length} Papers Cataloged • Manage solutions and publication flags independently
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setShowAddForm(!showAddForm)}
          className="gap-1.5 text-xs font-semibold"
        >
          <PlusCircle className="w-4 h-4" /> Add Question Paper
        </Button>
      </div>

      {/* Add Paper Form */}
      {showAddForm && (
        <Card className="border-sky-500/30 bg-sky-500/[0.02]">
          <form onSubmit={handleCreatePaper} className="space-y-4">
            <h3 className="font-bold text-sm text-foreground">Catalog New Public Question Paper</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] text-muted-foreground mb-1">Paper Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Class 10 Mathematics Public Examination March 2024"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground"
                />
              </div>

              <div>
                <label className="block text-[11px] text-muted-foreground mb-1">Subject</label>
                <select
                  value={newSubjectId}
                  onChange={(e) => setNewSubjectId(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground"
                >
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name} ({sub.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-muted-foreground mb-1">Exam Year</label>
                <input
                  type="number"
                  required
                  value={newYear}
                  onChange={(e) => setNewYear(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-muted-foreground mb-1">Paper Type</label>
                <select
                  value={newPaperType}
                  onChange={(e) => setNewPaperType(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground"
                >
                  <option value="PUBLIC_EXAM">Annual Public Exam</option>
                  <option value="QUARTERLY">Quarterly Exam</option>
                  <option value="HALF_YEARLY">Half-Yearly Exam</option>
                  <option value="MODEL">Model Exam</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-muted-foreground mb-1">Max Marks / Duration (Mins)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={newMarks}
                    onChange={(e) => setNewMarks(e.target.value)}
                    placeholder="Marks"
                    className="w-full px-2 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground font-mono"
                  />
                  <input
                    type="number"
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    placeholder="Mins"
                    className="w-full px-2 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground font-mono"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[11px] text-muted-foreground mb-1">Official Source Attribution</label>
                <input
                  type="text"
                  value={newSource}
                  onChange={(e) => setNewSource(e.target.value)}
                  placeholder="e.g. Directorate of Government Examinations (DGE), Tamil Nadu"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={newPublish}
                  onChange={(e) => setNewPublish(e.target.checked)}
                  className="rounded border-border text-sky-500 focus:ring-sky-500"
                />
                <span>Publish paper to student portal immediately</span>
              </label>

              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Save Question Paper
                </Button>
              </div>
            </div>
          </form>
        </Card>
      )}

      {/* Papers Table & Solution Management */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-sky-400" />
            Loading question papers...
          </div>
        ) : papers.length === 0 ? (
          <Card className="p-8 text-center text-xs text-muted-foreground">
            No question papers found for Class {prepClass}. Click "Add Question Paper" to add one.
          </Card>
        ) : (
          papers.map((paper) => (
            <Card key={paper.id} className="border-border p-5 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="font-mono text-xs">
                      {paper.subject?.code}
                    </Badge>
                    <Badge variant="purple">{paper.paperType}</Badge>
                    <span className="font-mono text-xs font-bold text-foreground">
                      {paper.examYear}
                    </span>
                    {paper.isPublished ? (
                      <Badge variant="success">Paper Live</Badge>
                    ) : (
                      <Badge variant="secondary">Paper Draft</Badge>
                    )}
                  </div>

                  <h3 className="font-bold text-base text-foreground">{paper.title}</h3>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                    <Building className="w-3.5 h-3.5 text-sky-400" />
                    <span>{paper.sourceInfo}</span>
                    <span>• {paper.maxMarks} Marks</span>
                    <span>• {paper.durationMinutes} mins</span>
                  </div>
                </div>

                {/* Paper Status Switcher */}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={paper.isPublished ? "outline" : "primary"}
                    onClick={() => handleTogglePaperPublish(paper.id, paper.isPublished, paper.title)}
                    className="text-xs py-1 px-3"
                  >
                    {paper.isPublished ? "Unpublish Paper" : "Publish Paper"}
                  </Button>

                  <button
                    type="button"
                    onClick={() => handleDeletePaper(paper.id, paper.title)}
                    className="p-2 rounded-lg text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete paper"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Worked Solution Section (Independent Publishing) */}
              <div className="p-4 rounded-xl bg-secondary/50 border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-xs text-foreground">COE Worked Solutions:</span>
                    {paper.hasSolution ? (
                      paper.isSolutionPublished ? (
                        <Badge variant="success">Solution Published (Visible to Student)</Badge>
                      ) : (
                        <Badge variant="warning">Solution Saved as Draft (Hidden)</Badge>
                      )
                    ) : (
                      <Badge variant="secondary">No Solution Added Yet</Badge>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Worked solutions can be kept private until candidates finish practice.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {paper.hasSolution && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleSolutionPublish(paper.id, paper.isSolutionPublished)}
                      className="text-xs py-1 px-2.5"
                    >
                      {paper.isSolutionPublished ? "Hide Solution" : "Publish Solution"}
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => openSolutionEditor(paper)}
                    className="text-xs py-1 px-3 gap-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    {paper.hasSolution ? "Edit Solution" : "Write Worked Solution"}
                  </Button>
                </div>
              </div>

              {/* Solution Editor Form (if active) */}
              {activePaperForSolution === paper.id && (
                <div className="p-4 rounded-xl bg-card border border-border space-y-3 animate-in fade-in">
                  <h4 className="font-bold text-xs text-foreground flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Worked Solution Editor: {paper.title}
                  </h4>

                  <div>
                    <label className="block text-[11px] text-muted-foreground mb-1">Solution Title</label>
                    <input
                      type="text"
                      required
                      value={solutionTitle}
                      onChange={(e) => setSolutionTitle(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-muted-foreground mb-1">
                      Step-by-Step Worked Solutions & Explanations (Text / Math notation)
                    </label>
                    <textarea
                      rows={6}
                      required
                      value={solutionContent}
                      onChange={(e) => setSolutionContent(e.target.value)}
                      className="w-full p-3 text-xs rounded-lg border border-border bg-background text-foreground font-mono leading-relaxed"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={solutionPublish}
                        onChange={(e) => setSolutionPublish(e.target.checked)}
                        className="rounded border-border text-emerald-500 focus:ring-emerald-500"
                      />
                      <span>Make this worked solution visible to students now</span>
                    </label>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setActivePaperForSolution(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={(e) => handleSaveSolution(e, paper.id)}
                      >
                        Save Solution
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

export default function COEPapersPage() {
  return (
    <AdminGuard>
      <Suspense fallback={<div className="p-8 text-center text-xs text-muted-foreground">Loading papers manager...</div>}>
        <COEPapersContent />
      </Suspense>
    </AdminGuard>
  );
}
