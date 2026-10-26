"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import {
  FileText,
  ArrowLeft,
  Calendar,
  Clock,
  Award,
  CheckCircle2,
  Lock,
  ChevronDown,
  ChevronUp,
  Download,
  Building,
  Loader2,
  AlertCircle,
  Sparkles
} from "lucide-react";

function StudentPapersContent() {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [prepClass, setPrepClass] = useState(10);
  const [selectedSubjectCode, setSelectedSubjectCode] = useState("ALL");
  const [expandedSolutions, setExpandedSolutions] = useState({});

  const fetchPapers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/papers");
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Failed to load question papers.");
      } else {
        setPapers(json.papers || []);
        setPrepClass(json.prepClass);
      }
    } catch (err) {
      setError("Network error fetching question papers from database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, []);

  const toggleExpand = (paperId) => {
    setExpandedSolutions((prev) => ({
      ...prev,
      [paperId]: !prev[paperId],
    }));
  };

  // Distinct subjects present in papers
  const distinctSubjects = Array.from(
    new Set(papers.map((p) => p.subject?.code).filter(Boolean))
  );

  const filteredPapers =
    selectedSubjectCode === "ALL"
      ? papers
      : papers.filter((p) => p.subject?.code === selectedSubjectCode);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-sky-400" />
        <p className="text-sm text-muted-foreground font-medium">
          Loading official previous-year question papers & solutions...
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
      {/* Header & Breadcrumb */}
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
                Previous-Year Papers & Worked Solutions
              </h1>
              <Badge variant="purple">Class {prepClass} Standards</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Official Tamil Nadu State Board public examination papers with verified source attribution
            </p>
          </div>
        </div>

        <Badge variant="success" className="px-3 py-1 text-xs">
          {papers.length} Papers Available
        </Badge>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          type="button"
          onClick={() => setSelectedSubjectCode("ALL")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            selectedSubjectCode === "ALL"
              ? "bg-primary text-primary-foreground border-primary shadow-sm"
              : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
          }`}
        >
          All Subjects ({papers.length})
        </button>

        {distinctSubjects.map((code) => {
          const subPaper = papers.find((p) => p.subject?.code === code);
          const isSelected = selectedSubjectCode === code;
          return (
            <button
              key={code}
              type="button"
              onClick={() => setSelectedSubjectCode(code)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                isSelected
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              {subPaper?.subject?.name || code}
            </button>
          );
        })}
      </div>

      {/* Question Papers List */}
      <div className="space-y-4">
        {filteredPapers.length === 0 ? (
          <Card className="p-8 text-center text-xs text-muted-foreground">
            No question papers currently cataloged for this selection.
          </Card>
        ) : (
          filteredPapers.map((paper) => {
            const isExpanded = expandedSolutions[paper.id];
            return (
              <Card key={paper.id} className="border-border overflow-hidden">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="font-mono text-xs">
                        {paper.subject?.code}
                      </Badge>
                      <Badge variant="purple">{paper.paperType.replace("_", " ")}</Badge>
                      <span className="text-xs font-bold text-foreground font-mono">
                        {paper.examYear}
                      </span>
                    </div>

                    <h2 className="text-base sm:text-lg font-bold text-foreground">{paper.title}</h2>

                    {/* Official Source Attribution */}
                    {paper.sourceInfo && (
                      <div className="flex items-center gap-1.5 text-xs text-sky-400 font-medium">
                        <Building className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>Source Attribution: {paper.sourceInfo}</span>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-1">
                      <span className="flex items-center gap-1 font-semibold text-foreground">
                        <Award className="w-3.5 h-3.5 text-amber-400" /> Max: {paper.maxMarks} Marks
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-sky-400" /> {paper.durationMinutes} mins
                      </span>
                      <span className="text-muted-foreground">• Board: {paper.board}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button
                      variant={isExpanded ? "primary" : "outline"}
                      size="sm"
                      onClick={() => toggleExpand(paper.id)}
                      className="gap-1.5 text-xs w-full sm:w-auto"
                    >
                      {paper.isSolutionPublished ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          {isExpanded ? "Hide Worked Solution" : "View Worked Solution"}
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5 text-amber-400" />
                          Solution Pending Release
                        </>
                      )}
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5 ml-1" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 ml-1" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Collapsible Worked Solutions Panel */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-border bg-secondary/40 -mx-5 -mb-5 p-5 animate-in fade-in">
                    {paper.isSolutionPublished && paper.solution ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-emerald-400" />
                            <h3 className="font-bold text-sm text-foreground">
                              {paper.solution.title}
                            </h3>
                          </div>
                          <Badge variant="success">COE Solved & Verified</Badge>
                        </div>

                        {/* Solution Text Content formatted */}
                        <div className="p-4 rounded-xl bg-card border border-border text-xs text-foreground font-mono whitespace-pre-line leading-relaxed">
                          {paper.solution.content}
                        </div>

                        <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          Prepared and authorized by the Controller of Examinations for academic reference.
                        </p>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center space-y-1">
                        <p className="text-xs font-semibold text-amber-300">
                          Worked Solutions are being finalized by the Controller of Examinations.
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Attempt the questions first independently; detailed answer keys will be published after evaluation.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function StudentPapersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-muted-foreground">Loading question papers...</div>}>
      <StudentPapersContent />
    </Suspense>
  );
}
