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
  BookOpen,
  Loader2,
  AlertCircle,
  Sparkles,
  Layers,
  ChevronRight
} from "lucide-react";

function COESyllabusContent() {
  const [prepClass, setPrepClass] = useState(10); // 10 or 12
  const [subjects, setSubjects] = useState([]);
  const [selectedSubId, setSelectedSubId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState("");

  // New Unit Form State
  const [showUnitForm, setShowUnitForm] = useState(false);
  const [newUnitNumber, setNewUnitNumber] = useState("");
  const [newUnitTitle, setNewUnitTitle] = useState("");

  // New Chapter Form State
  const [activeUnitIdForChapter, setActiveUnitIdForChapter] = useState(null);
  const [newChapterNumber, setNewChapterNumber] = useState("");
  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [newChapterDesc, setNewChapterDesc] = useState("");

  const fetchSyllabusData = async (standard) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/syllabus?prepClass=${standard}`);
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Failed to load syllabus.");
      } else {
        setSubjects(json.subjects || []);
        if (json.subjects?.length > 0) {
          setSelectedSubId(json.subjects[0].id);
        }
      }
    } catch (err) {
      setError("Network error fetching syllabus data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSyllabusData(prepClass);
  }, [prepClass]);

  const currentSubject = subjects.find((s) => s.id === selectedSubId) || subjects[0];

  // Create Unit in SQLite
  const handleCreateUnit = async (e) => {
    e.preventDefault();
    if (!currentSubject || !newUnitTitle) return;

    try {
      const res = await fetch("/api/admin/syllabus/unit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId: currentSubject.id,
          unitNumber: newUnitNumber || (currentSubject.units.length + 1).toString(),
          title: newUnitTitle,
        }),
      });

      const json = await res.json();
      if (res.ok) {
        setNotification(`Unit "${newUnitTitle}" added successfully!`);
        setShowUnitForm(false);
        setNewUnitTitle("");
        setNewUnitNumber("");
        fetchSyllabusData(prepClass);
      } else {
        setNotification(json.error || "Failed to create unit.");
      }
    } catch (err) {
      setNotification("Network error creating unit.");
    } finally {
      setTimeout(() => setNotification(""), 3500);
    }
  };

  // Create Chapter in SQLite
  const handleCreateChapter = async (e, unitId) => {
    e.preventDefault();
    if (!newChapterTitle) return;

    try {
      const res = await fetch("/api/admin/syllabus/chapter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitId,
          chapterNumber: newChapterNumber || "1",
          title: newChapterTitle,
          description: newChapterDesc,
        }),
      });

      const json = await res.json();
      if (res.ok) {
        setNotification(`Chapter "${newChapterTitle}" added to syllabus!`);
        setActiveUnitIdForChapter(null);
        setNewChapterTitle("");
        setNewChapterNumber("");
        setNewChapterDesc("");
        fetchSyllabusData(prepClass);
      } else {
        setNotification(json.error || "Failed to add chapter.");
      }
    } catch (err) {
      setNotification("Network error adding chapter.");
    } finally {
      setTimeout(() => setNotification(""), 3500);
    }
  };

  // Delete Chapter from SQLite
  const handleDeleteChapter = async (chapterId, title) => {
    if (!confirm(`Are you sure you want to remove "${title}" from the syllabus?`)) return;

    try {
      const res = await fetch(`/api/admin/syllabus/chapter/${chapterId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setNotification(`Chapter "${title}" removed.`);
        fetchSyllabusData(prepClass);
      } else {
        setNotification("Failed to delete chapter.");
      }
    } catch (err) {
      setNotification("Network error deleting chapter.");
    } finally {
      setTimeout(() => setNotification(""), 3500);
    }
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
      {/* Top Admin Header */}
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
                COE Syllabus Curriculum Manager
              </h1>
              <Badge variant="warning">Administrative CRUD</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Add, edit, or remove syllabus units and chapters directly in the SQLite database
            </p>
          </div>
        </div>

        {/* Standard Selector (Class 10 Secondary vs Class 12 Higher Secondary) */}
        <div className="flex items-center gap-2 bg-card p-1.5 rounded-xl border border-border">
          <span className="text-xs text-muted-foreground px-2 font-medium">Select Standard:</span>
          <button
            type="button"
            onClick={() => setPrepClass(10)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              prepClass === 10
                ? "bg-sky-500 text-slate-950 font-bold shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Class 10 (Secondary)
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
            Class 12 (Higher Sec)
          </button>
        </div>
      </div>

      {/* Live Toast Feedback */}
      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300 font-medium transition-all animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Subject Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {subjects.map((sub) => {
          const isSelected = sub.id === currentSubject?.id;
          return (
            <button
              key={sub.id}
              type="button"
              onClick={() => setSelectedSubId(sub.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                isSelected
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <span>{sub.name}</span>
              <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-secondary font-mono text-muted-foreground">
                {sub.code}
              </span>
            </button>
          );
        })}
      </div>

      {/* Subject Header & Add Unit Action */}
      {currentSubject && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-foreground">{currentSubject.name}</h2>
              <Badge variant="secondary">{currentSubject.code}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {currentSubject.units.length} Units • {currentSubject.totalChapters} Total Chapters in Syllabus
            </p>
          </div>

          <Button
            size="sm"
            onClick={() => setShowUnitForm(!showUnitForm)}
            className="gap-1.5 text-xs font-semibold"
          >
            <PlusCircle className="w-4 h-4" /> Add Syllabus Unit
          </Button>
        </div>
      )}

      {/* Add Unit Inline Form */}
      {showUnitForm && (
        <Card className="border-sky-500/30 bg-sky-500/[0.02]">
          <form onSubmit={handleCreateUnit} className="space-y-3">
            <h3 className="font-bold text-sm text-foreground">Create New Syllabus Unit</h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] text-muted-foreground mb-1">Unit Number</label>
                <input
                  type="number"
                  placeholder={(currentSubject?.units?.length + 1).toString()}
                  value={newUnitNumber}
                  onChange={(e) => setNewUnitNumber(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground font-mono"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="block text-[11px] text-muted-foreground mb-1">Unit Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unit 4: Coordinate Geometry"
                  value={newUnitTitle}
                  onChange={(e) => setNewUnitTitle(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowUnitForm(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Save Unit to SQLite
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Units & Chapters Tree */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-sky-400" />
            Loading curriculum tree...
          </div>
        ) : currentSubject?.units?.length === 0 ? (
          <Card className="p-8 text-center text-xs text-muted-foreground">
            No units cataloged yet. Click "Add Syllabus Unit" above to add the first unit.
          </Card>
        ) : (
          currentSubject?.units?.map((unit) => (
            <Card key={unit.id} className="border-border p-0 overflow-hidden">
              {/* Unit Title Bar */}
              <div className="p-4 bg-secondary/50 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center text-xs font-bold font-mono">
                    U{unit.unitNumber}
                  </span>
                  <h3 className="font-bold text-sm text-foreground">{unit.title}</h3>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setActiveUnitIdForChapter(activeUnitIdForChapter === unit.id ? null : unit.id)
                  }
                  className="text-xs py-1 px-2.5 gap-1"
                >
                  <PlusCircle className="w-3.5 h-3.5" /> Add Chapter
                </Button>
              </div>

              {/* Add Chapter Form (if toggled for this unit) */}
              {activeUnitIdForChapter === unit.id && (
                <div className="p-4 bg-secondary/30 border-b border-border">
                  <form onSubmit={(e) => handleCreateChapter(e, unit.id)} className="space-y-3">
                    <h4 className="font-bold text-xs text-foreground">
                      Add Chapter under {unit.title}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[10px] text-muted-foreground mb-1">Chapter No.</label>
                        <input
                          type="number"
                          placeholder={(unit.chapters.length + 1).toString()}
                          value={newChapterNumber}
                          onChange={(e) => setNewChapterNumber(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground font-mono"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label className="block text-[10px] text-muted-foreground mb-1">Chapter Title</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Distance between two points & Slope formula"
                          value={newChapterTitle}
                          onChange={(e) => setNewChapterTitle(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground"
                        />
                      </div>
                      <div className="sm:col-span-4">
                        <label className="block text-[10px] text-muted-foreground mb-1">Topics / Description (Optional)</label>
                        <input
                          type="text"
                          placeholder="Key formulas, exercise numbers, or focus points"
                          value={newChapterDesc}
                          onChange={(e) => setNewChapterDesc(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveUnitIdForChapter(null)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" size="sm">
                        Save Chapter
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* Chapters List */}
              <div className="divide-y divide-border">
                {unit.chapters.map((ch) => (
                  <div
                    key={ch.id}
                    className="p-3.5 px-4 flex items-center justify-between gap-4 hover:bg-secondary/20 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-muted-foreground">
                          {unit.unitNumber}.{ch.chapterNumber}
                        </span>
                        <span className="text-sm font-semibold text-foreground">{ch.title}</span>
                      </div>
                      {ch.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">{ch.description}</p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteChapter(ch.id, ch.title)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete chapter from syllabus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

export default function COESyllabusPage() {
  return (
    <AdminGuard>
      <Suspense fallback={<div className="p-8 text-center text-xs text-muted-foreground">Loading syllabus editor...</div>}>
        <COESyllabusContent />
      </Suspense>
    </AdminGuard>
  );
}
