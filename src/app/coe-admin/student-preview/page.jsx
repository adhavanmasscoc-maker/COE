"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  Eye,
  GraduationCap,
  Users,
  Calendar,
  Award,
  BookOpen,
  Bell,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Loader2,
  Clock,
  Layers,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";

function StudentPreviewContent() {
  const searchParams = useSearchParams();
  const initialRoll = searchParams.get("rollNo") || "TN2026-0901";

  const [studentList, setStudentList] = useState([]);
  const [selectedRoll, setSelectedRoll] = useState(initialRoll);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load all students for the dropdown
  useEffect(() => {
    fetch("/api/admin/students")
      .then((r) => r.json())
      .then((data) => {
        if (data?.students) {
          setStudentList(data.students);
          if (!data.students.some((s) => s.rollNo === selectedRoll) && data.students.length > 0) {
            setSelectedRoll(data.students[0].rollNo);
          }
        }
      })
      .catch(() => {});
  }, []);

  // Fetch dashboard preview for selected student
  const loadStudentDashboard = async (roll) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/student/dashboard?previewRollNo=${roll}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load student preview.");
      }
      setDashboardData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedRoll) {
      loadStudentDashboard(selectedRoll);
    }
  }, [selectedRoll]);

  const activeProfile = dashboardData?.profile;

  return (
    <div className="page-content space-y-6">
      {/* Top Banner Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-secondary/80 border border-border animate-float-up">
        <div className="flex items-center gap-3">
          <Link
            href="/coe-admin/students"
            className="p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-foreground">
                Student Portal Verification Hub
              </h1>
              <Badge variant="warning">Live COE Simulator</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Inspect any student&apos;s real-time portal view to verify announcements, active exam alerts, and published marks reached them.
            </p>
          </div>
        </div>

        {/* Student Selector Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex-1 sm:flex-initial">
            <label className="text-[10px] text-muted-foreground block mb-1 font-bold">
              Select Candidate to Preview
            </label>
            <select
              value={selectedRoll}
              onChange={(e) => setSelectedRoll(e.target.value)}
              className="px-3 py-2 rounded-xl bg-card border border-border text-foreground font-semibold text-xs focus:outline-none focus:border-amber-400"
            >
              {studentList.map((s) => (
                <option key={s.id} value={s.rollNo}>
                  {s.fullName} ({s.rollNo} • Class {s.examPrepClass})
                </option>
              ))}
            </select>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => loadStudentDashboard(selectedRoll)}
            className="mt-4 gap-1 text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <Card className="p-12 text-center border-border">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto mb-3" />
          <h3 className="font-bold text-sm text-foreground">Loading Candidate Simulation...</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Querying SQLite database for candidate {selectedRoll}
          </p>
        </Card>
      ) : error ? (
        <Card className="p-8 text-center border-rose-500/30 bg-rose-500/10 text-rose-300">
          <AlertCircle className="w-6 h-6 mx-auto mb-2" />
          <p className="font-bold text-sm">{error}</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Verification Audit Checklist Bar */}
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-emerald-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span>
                <strong>Verification Active:</strong> You are viewing live portal state for candidate{" "}
                <strong className="underline">{activeProfile?.fullName}</strong> ({selectedRoll}).
              </span>
            </div>
            <Link
              href={`/student/dashboard?previewRollNo=${selectedRoll}`}
              target="_blank"
              className="flex items-center gap-1 font-bold text-emerald-300 hover:text-white"
            >
              Open Full-Screen Session <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Simulated Candidate Dashboard */}
          <div className="p-6 rounded-3xl bg-[rgba(13,13,26,0.6)] border border-violet-500/30 shadow-2xl space-y-6">
            {/* Candidate Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg">
                  {activeProfile?.fullName?.[0] || "?"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-foreground">{activeProfile?.fullName}</h2>
                    <Badge variant="purple">Class {activeProfile?.examPrepClass} Candidate</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono">
                    Roll No: {selectedRoll} • School Grade: Class {activeProfile?.currentClass} • Medium: {activeProfile?.medium}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="secondary">Academic Year 2026–2027</Badge>
                <Badge variant="success">Account Active</Badge>
              </div>
            </div>

            {/* 1. Announcements & Circulars Check */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-amber-400" />
                COE Circulars & Alerts Received by Student ({dashboardData?.notices?.length || 0})
              </span>

              {dashboardData?.notices?.length === 0 ? (
                <div className="p-3.5 rounded-xl bg-secondary/40 border border-border text-xs text-muted-foreground italic">
                  No active circulars currently targeted to this candidate.
                </div>
              ) : (
                dashboardData?.notices?.map((n) => (
                  <div key={n.id} className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200">
                    <span className="font-bold block text-sm">{n.title}</span>
                    <p className="mt-0.5">{n.content}</p>
                  </div>
                ))
              )}
            </div>

            {/* 2. Scheduled Examinations Check */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-cyan-400" />
                Scheduled Examinations Published to Candidate ({dashboardData?.upcomingExams?.length || 0})
              </span>

              {dashboardData?.upcomingExams?.length === 0 ? (
                <div className="p-4 rounded-xl bg-secondary/40 border border-border text-xs text-muted-foreground italic">
                  No live examinations currently published to this student&apos;s standard.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {dashboardData?.upcomingExams?.map((exam) => (
                    <div key={exam.id} className="p-4 rounded-2xl bg-card border border-border space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-foreground">{exam.subject?.name}</span>
                        <span className="badge badge-emerald">Live on Portal</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>
                          {new Date(exam.examDate).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </span>
                        <span>•</span>
                        <span>{exam.durationMinutes} mins ({exam.totalMarks} Marks)</span>
                      </div>
                      {exam.instructions && (
                        <p className="text-[11px] text-[#c4b5fd] italic bg-violet-500/10 p-2 rounded-lg">
                          "{exam.instructions}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Assigned Subjects & Syllabus Progress Check */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-violet-400" />
                Assigned Curriculum Subjects & Syllabus Progress ({dashboardData?.subjects?.length || 0})
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {dashboardData?.subjects?.map((sub) => (
                  <div key={sub.id} className="p-3.5 rounded-xl bg-card border border-border space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-foreground">{sub.name}</span>
                      <span className="font-mono text-[10px] text-muted-foreground">{sub.code}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>{sub.completedChapters || 0} / {sub.totalChapters || 0} Topics</span>
                      <span className="font-bold text-emerald-400">{sub.progressPercent || 0}%</span>
                    </div>
                    <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-sky-500 h-full rounded-full"
                        style={{ width: `${sub.progressPercent || 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Published Marksheet Statement Check */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                Published Results & Official Marks Statement ({dashboardData?.publishedResults?.length || 0})
              </span>

              {dashboardData?.publishedResults?.length === 0 ? (
                <div className="p-4 rounded-xl bg-secondary/40 border border-border text-xs text-muted-foreground italic">
                  No examination results published for this candidate yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="data-table text-xs">
                    <thead>
                      <tr>
                        <th>Subject</th>
                        <th>Marks Obtained</th>
                        <th>Maximum Marks</th>
                        <th>Percentage</th>
                        <th>COE Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData?.publishedResults?.map((res) => (
                        <tr key={res.id}>
                          <td className="font-bold text-foreground">{res.subjectName}</td>
                          <td className="font-mono font-bold text-emerald-400">{res.marksObtained}</td>
                          <td className="font-mono text-muted-foreground">{res.maxMarks}</td>
                          <td className="font-mono text-foreground font-bold">
                            {Math.round((res.marksObtained / res.maxMarks) * 100)}%
                          </td>
                          <td className="text-muted-foreground italic">{res.remarks || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StudentPreviewPage() {
  return (
    <AdminGuard>
      <Suspense fallback={<div className="p-8 text-center text-xs text-muted-foreground">Loading preview...</div>}>
        <StudentPreviewContent />
      </Suspense>
    </AdminGuard>
  );
}
