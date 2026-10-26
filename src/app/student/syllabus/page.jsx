"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import {
  BookOpen,
  ArrowLeft,
  CheckCircle2,
  Circle,
  TrendingUp,
  FileText,
  Loader2,
  AlertCircle,
  Sparkles,
  Layers
} from "lucide-react";

function SyllabusExplorerContent() {
  const searchParams = useSearchParams();
  const initialSubjectCode = searchParams.get("code");

  const [subjects, setSubjects] = useState([]);
  const [selectedSubId, setSelectedSubId] = useState(null);
  const [prepClass, setPrepClass] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [togglingId, setTogglingId] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  const fetchSyllabus = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/syllabus");
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Failed to load syllabus records.");
      } else {
        setSubjects(json.subjects || []);
        setPrepClass(json.prepClass);

        if (json.subjects?.length > 0) {
          if (initialSubjectCode) {
            const matched = json.subjects.find((s) => s.code === initialSubjectCode);
            setSelectedSubId(matched ? matched.id : json.subjects[0].id);
          } else {
            setSelectedSubId(json.subjects[0].id);
          }
        }
      }
    } catch (err) {
      setError("Network error fetching syllabus data from SQLite.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSyllabus();
  }, []);

  const currentSubject = subjects.find((s) => s.id === selectedSubId) || subjects[0];

  const handleToggleChapter = async (chapterId, currentStatus) => {
    setTogglingId(chapterId);
    const newStatus = !currentStatus;

    try {
      const res = await fetch("/api/syllabus/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapterId, isCompleted: newStatus }),
      });

      if (res.ok) {
        // Update local subjects state dynamically
        setSubjects((prevSubs) =>
          prevSubs.map((sub) => {
            let hasChapter = false;
            let subCompleted = 0;
            let subTotal = 0;

            const updatedUnits = sub.units.map((unit) => {
              const updatedChapters = unit.chapters.map((ch) => {
                subTotal += 1;
                if (ch.id === chapterId) {
                  hasChapter = true;
                  if (newStatus) subCompleted += 1;
                  return { ...ch, isCompleted: newStatus };
                }
                if (ch.isCompleted) subCompleted += 1;
                return ch;
              });
              return { ...unit, chapters: updatedChapters };
            });

            if (hasChapter) {
              const progressPercent = Math.round((subCompleted / subTotal) * 100);
              return {
                ...sub,
                units: updatedUnits,
                completedChapters: subCompleted,
                totalChapters: subTotal,
                progressPercent,
              };
            }
            return sub;
          })
        );

        setToastMessage(newStatus ? "Chapter marked as completed! Progress updated." : "Chapter marked as pending revision.");
        setTimeout(() => setToastMessage(""), 3000);
      }
    } catch (err) {
      console.error("Error toggling chapter progress:", err);
    } finally {
      setTogglingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-sky-400" />
        <p className="text-sm text-muted-foreground font-medium">
          Loading official syllabus curriculum tree...
        </p>
      </div>
    );
  }

  if (error || subjects.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-md mx-auto">
        <Card className="border-rose-500/30 p-6 text-center">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-foreground mb-1">Unable to Load Syllabus</h2>
          <p className="text-xs text-muted-foreground mb-4">{error || "No subjects found."}</p>
          <Link href="/student/dashboard">
            <Button size="sm">Return to Dashboard</Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Calculate overall syllabus metrics
  const totalAllChapters = subjects.reduce((acc, s) => acc + s.totalChapters, 0);
  const completedAllChapters = subjects.reduce((acc, s) => acc + s.completedChapters, 0);
  const overallPercentage =
    totalAllChapters > 0 ? Math.round((completedAllChapters / totalAllChapters) * 100) : 0;

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/student/dashboard"
            className="p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
            title="Return to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-foreground">
                Syllabus & Chapter Explorer
              </h1>
              <Badge variant="purple">Class {prepClass} Standards</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Official Tamil Nadu Samacheer Kalvi Curriculum • Mark chapters as studied to track completion
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-secondary/80 border border-border">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <div className="text-xs">
            <span className="text-muted-foreground">Total Mastery: </span>
            <span className="font-bold text-emerald-400">{overallPercentage}%</span>
            <span className="text-muted-foreground ml-1">
              ({completedAllChapters}/{totalAllChapters} chapters)
            </span>
          </div>
        </div>
      </div>

      {/* Real-time Toast Feedback */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300 font-medium transition-all animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 5 Core Subject Horizontal Switcher Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {subjects.map((sub) => {
          const isSelected = sub.id === currentSubject?.id;
          return (
            <button
              key={sub.id}
              type="button"
              onClick={() => setSelectedSubId(sub.id)}
              className={`flex-shrink-0 flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                isSelected
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <span>{sub.name}</span>
              <span
                className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${
                  isSelected ? "bg-slate-950/20 text-white" : "bg-secondary text-muted-foreground"
                }`}
              >
                {sub.progressPercent}%
              </span>
            </button>
          );
        })}
      </div>

      {/* Current Subject Overview Card */}
      {currentSubject && (
        <Card className="border-border bg-gradient-to-r from-card to-secondary/30">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="secondary" className="font-mono text-xs">
                  {currentSubject.code}
                </Badge>
                <h2 className="text-xl font-bold text-foreground">{currentSubject.name}</h2>
              </div>
              <p className="text-xs text-muted-foreground">
                {currentSubject.completedChapters} of {currentSubject.totalChapters} chapters completed
              </p>
            </div>

            <div className="w-full sm:w-64 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Subject Progress</span>
                <span className="font-bold text-emerald-400">{currentSubject.progressPercent}%</span>
              </div>
              <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-sky-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${currentSubject.progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Units & Chapters List */}
      <div className="space-y-4">
        {currentSubject?.units?.length === 0 ? (
          <Card className="p-8 text-center text-xs text-muted-foreground">
            No units or chapters currently cataloged for this subject.
          </Card>
        ) : (
          currentSubject?.units?.map((unit) => (
            <Card key={unit.id} className="border-border overflow-hidden p-0">
              {/* Unit Header */}
              <div className="p-4 bg-secondary/50 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center text-xs font-bold font-mono">
                    U{unit.unitNumber}
                  </span>
                  <h3 className="font-bold text-sm text-foreground">{unit.title}</h3>
                </div>
                <Badge variant="secondary" className="text-[10px]">
                  {unit.chapters.length} Chapters
                </Badge>
              </div>

              {/* Chapters in Unit */}
              <div className="divide-y divide-border">
                {unit.chapters.map((ch) => (
                  <div
                    key={ch.id}
                    className={`p-4 flex items-center justify-between gap-4 transition-colors ${
                      ch.isCompleted ? "bg-emerald-500/[0.03]" : "hover:bg-secondary/20"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        disabled={togglingId === ch.id}
                        onClick={() => handleToggleChapter(ch.id, ch.isCompleted)}
                        className="mt-0.5 text-muted-foreground hover:text-emerald-400 transition-colors"
                        title={ch.isCompleted ? "Mark as uncompleted" : "Mark as studied"}
                      >
                        {ch.isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-500/20" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                        )}
                      </button>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-muted-foreground">
                            {unit.unitNumber}.{ch.chapterNumber}
                          </span>
                          <span
                            className={`text-sm font-semibold ${
                              ch.isCompleted ? "line-through text-muted-foreground" : "text-foreground"
                            }`}
                          >
                            {ch.title}
                          </span>
                        </div>
                        {ch.description && (
                          <p className="text-xs text-muted-foreground mt-0.5">{ch.description}</p>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={togglingId === ch.id}
                      onClick={() => handleToggleChapter(ch.id, ch.isCompleted)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                        ch.isCompleted
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                          : "bg-secondary text-muted-foreground border-border hover:text-foreground"
                      }`}
                    >
                      {ch.isCompleted ? "Studied ✓" : "Mark Studied"}
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

export default function StudentSyllabusPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-muted-foreground">Loading syllabus...</div>}>
      <SyllabusExplorerContent />
    </Suspense>
  );
}
