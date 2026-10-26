"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/Card";
import {
  ShieldCheck, Users, Calendar, FileText, CheckCircle, PlusCircle,
  Eye, Award, Sparkles, RefreshCw, Loader2, AlertCircle,
  Layers, Bell, BarChart3, ClipboardList, UserCheck, Clock, FileJson
} from "lucide-react";

export default function COEAdminDashboardPage() {
  const [students, setStudents]   = useState([]);
  const [pending, setPending]     = useState([]);
  const [exams, setExams]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [notice, setNotice]       = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [sRes, pRes, eRes] = await Promise.all([
        fetch("/api/admin/students"),
        fetch("/api/admin/students/pending"),
        fetch("/api/admin/exams"),
      ]);
      if (sRes.ok) { const j = await sRes.json(); setStudents(j.students || []); }
      if (pRes.ok) { const j = await pRes.json(); setPending(j.pending || []); }
      if (eRes.ok) { const j = await eRes.json(); setExams(j.exams || []); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const updateMedium = async (studentId, name, medium) => {
    setUpdatingId(studentId);
    try {
      const res = await fetch(`/api/admin/students/${studentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ medium }),
      });
      if (res.ok) {
        setStudents((prev) => prev.map((s) => s.id === studentId ? { ...s, medium } : s));
        showNotice(`Updated medium for ${name} to ${medium} Medium.`);
      }
    } catch { showNotice("Error updating medium."); }
    finally { setUpdatingId(null); }
  };

  const togglePublish = async (exam) => {
    const nextStatus = exam.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    try {
      const res = await fetch(`/api/admin/exams/${exam.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        setExams((prev) => prev.map((e) => e.id === exam.id ? { ...e, status: nextStatus } : e));
        showNotice(`"${exam.subject?.name}" exam is now ${nextStatus === "PUBLISHED" ? "published to students" : "saved as draft"}.`);
      }
    } catch { showNotice("Error updating exam status."); }
  };

  const showNotice = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(""), 4000);
  };

  return (
    <AdminGuard>
      <div className="page-content space-y-8">

      {/* Page header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-float-up">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <ShieldCheck className="w-6 h-6 text-slate-900" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-[#f0f0ff]">COE Administration</h1>
              <span className="badge badge-amber">Master Control</span>
            </div>
            <p className="text-xs text-[#5c5c8a]">Tamil Nadu Samacheer Kalvi · Controller of Examinations</p>
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="flex flex-wrap gap-2">
          <Link href="/coe-admin/exam-setter">
            <Button variant="emerald" size="sm" className="gap-1.5 shadow-md shadow-emerald-500/20">
              <Sparkles className="w-4 h-4 text-amber-300" />Exam Setter (JSON)
            </Button>
          </Link>
          <Link href="/coe-admin/student-preview">
            <Button variant="secondary" size="sm" className="gap-1.5">
              <Eye className="w-4 h-4 text-cyan-400" />Student Preview
            </Button>
          </Link>
          <Link href="/coe-admin/students">
            <Button variant="secondary" size="sm" className="gap-1.5 relative">
              <Users className="w-4 h-4" />Students
              {pending.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {pending.length}
                </span>
              )}
            </Button>
          </Link>
          <Link href="/coe-admin/exams">
            <Button variant="secondary" size="sm" className="gap-1.5"><Calendar className="w-4 h-4" />Exams</Button>
          </Link>
          <Link href="/coe-admin/results">
            <Button variant="amber" size="sm" className="gap-1.5"><Award className="w-4 h-4" />Marks Entry</Button>
          </Link>
        </div>
      </div>

      {/* Toast notification */}
      {notice && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-300 font-medium animate-scale-in">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />{notice}
        </div>
      )}

      {/* Pending registrations alert */}
      {pending.length > 0 && (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-rose-500/8 border border-rose-500/25 animate-float-up">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-rose-500/15 flex items-center justify-center">
              <Bell className="w-4 h-4 text-rose-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#f0f0ff]">
                {pending.length} Pending Registration{pending.length > 1 ? "s" : ""}
              </p>
              <p className="text-xs text-[#5c5c8a]">Students awaiting COE approval</p>
            </div>
          </div>
          <Link href="/coe-admin/students">
            <Button variant="danger" size="sm">Review Now →</Button>
          </Link>
        </div>
      )}

      {/* Stat grid — Every card opens its separate inside page */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <Link href="/coe-admin/students?filter=active" className="block cursor-pointer">
          <StatCard label="Active Students" value={loading ? "…" : students.length} icon={UserCheck} color="violet"
            trend="Approved registrations" />
        </Link>
        <Link href="/coe-admin/students?filter=pending" className="block cursor-pointer">
          <StatCard label="Pending Approval" value={loading ? "…" : pending.length} icon={Clock} color="rose"
            trend="Awaiting COE review" />
        </Link>
        <Link href="/coe-admin/exams?status=PUBLISHED" className="block cursor-pointer">
          <StatCard label="Live Exams" value={loading ? "…" : exams.filter(e => e.status === "PUBLISHED").length} icon={Calendar} color="emerald"
            trend="Published to student portal" />
        </Link>
        <Link href="/coe-admin/exams?status=DRAFT" className="block cursor-pointer">
          <StatCard label="Draft Schedules" value={loading ? "…" : exams.filter(e => e.status !== "PUBLISHED").length} icon={RefreshCw} color="amber"
            trend="Unpublished drafts" />
        </Link>
      </div>

      {/* Quick navigation cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { href: "/coe-admin/exam-setter", label: "Exam Setter", desc: "JSON Ingestion", icon: FileJson, color: "emerald" },
          { href: "/coe-admin/student-preview", label: "Student Preview", desc: "Live portal check", icon: Eye, color: "cyan" },
          { href: "/coe-admin/students", label: "Students", desc: "Manage & approve", icon: Users, color: "violet" },
          { href: "/coe-admin/syllabus", label: "Syllabus", desc: "Chapters & units", icon: Layers, color: "purple" },
          { href: "/coe-admin/papers", label: "Papers", desc: "PYQ & solutions", icon: ClipboardList, color: "amber" },
          { href: "/coe-admin/results", label: "Marks", desc: "Entry & publish", icon: Award, color: "rose" },
        ].map(({ href, label, desc, icon: Icon, color }) => (
          <Link key={href} href={href}>
            <div className={`glass rounded-2xl p-4 border border-${color}-500/20 card-glow cursor-pointer group h-full transition-all hover:scale-[1.02]`}>
              <div className={`w-9 h-9 rounded-xl bg-${color}-500/15 flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 text-${color}-400`} />
              </div>
              <p className="text-sm font-bold text-[#f0f0ff]">{label}</p>
              <p className="text-xs text-[#5c5c8a]">{desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Student Accounts Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-[#f0f0ff]">Registered Candidates</h2>
            <p className="text-xs text-[#5c5c8a] mt-0.5">Active student accounts with subject assignments</p>
          </div>
          <Link href="/coe-admin/students">
            <Button variant="secondary" size="sm" className="gap-1.5">
              <Users className="w-3.5 h-3.5" />Manage All
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="glass rounded-2xl p-8 text-center border border-[rgba(124,58,237,0.15)]">
            <Loader2 className="w-6 h-6 animate-spin text-violet-400 mx-auto mb-2" />
            <p className="text-xs text-[#5c5c8a]">Loading candidate accounts…</p>
          </div>
        ) : students.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center border border-[rgba(124,58,237,0.15)]">
            <Users className="w-8 h-8 text-[#5c5c8a] mx-auto mb-2" />
            <p className="text-sm text-[#5c5c8a]">No active students yet. Approve pending registrations to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {students.map((student) => (
              <div key={student.id} className="glass rounded-2xl p-5 border border-[rgba(124,58,237,0.2)] card-glow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                      {student.fullName?.[0] || "?"}
                    </div>
                    <div>
                      <h3 className="font-bold text-[#f0f0ff] text-sm">{student.fullName}</h3>
                      <p className="text-[11px] font-mono text-[#5c5c8a]">{student.rollNo}</p>
                    </div>
                  </div>
                  <span className="badge badge-muted">{student.subjectsCount} Subjects</span>
                </div>

                <div className="grid grid-cols-3 gap-2 p-3 glass-sm rounded-xl mb-3 text-xs">
                  <div>
                    <span className="text-[10px] text-[#5c5c8a] uppercase font-bold block">School</span>
                    <span className="font-bold text-[#f0f0ff]">Class {student.currentClass}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-violet-400 uppercase font-bold block">Prep Level</span>
                    <span className="font-bold text-violet-300">Class {student.examPrepClass}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#5c5c8a] uppercase font-bold block mb-1">Medium</span>
                    <div className="flex gap-1">
                      {["English", "Tamil"].map((m) => (
                        <button key={m} disabled={updatingId === student.id}
                          onClick={() => updateMedium(student.id, student.fullName, m)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                            student.medium === m
                              ? "bg-violet-500/30 text-violet-200 border border-violet-400/40"
                              : "text-[#5c5c8a] hover:text-[#a8a8d0] border border-transparent"
                          }`}
                        >
                          {m === "Tamil" ? "தமிழ்" : "EN"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Assigned subjects */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {student.subjects?.map((sub) => (
                    <span key={sub.id} className="badge badge-muted text-[10px]">{sub.name}</span>
                  ))}
                </div>

                <div className="flex items-center justify-end pt-2 border-t border-[rgba(124,58,237,0.1)]">
                  <Link href={`/coe-admin/student-preview?rollNo=${student.rollNo}`}
                    className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 font-semibold transition-colors">
                    Preview Portal <Eye className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Exam Schedule Engine */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-[#f0f0ff]">Exam Schedule Engine</h2>
            <p className="text-xs text-[#5c5c8a] mt-0.5">Draft & publish examinations to the student portal</p>
          </div>
          <Link href="/coe-admin/exams">
            <Button variant="secondary" size="sm" className="gap-1.5">
              <PlusCircle className="w-3.5 h-3.5" />Manage Exams
            </Button>
          </Link>
        </div>

        <div className="glass rounded-2xl border border-[rgba(124,58,237,0.2)] overflow-hidden">
          {exams.length === 0 ? (
            <div className="p-8 text-center">
              <Calendar className="w-8 h-8 text-[#5c5c8a] mx-auto mb-2" />
              <p className="text-sm text-[#5c5c8a]">No exams scheduled yet. Click "Manage Exams" to create one.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Prep Class</th>
                    <th>Exam Date</th>
                    <th>Duration & Marks</th>
                    <th>Questions</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {exams.map((exam) => (
                    <tr key={exam.id}>
                      <td>
                        <span className="font-bold text-[#f0f0ff] block text-xs">{exam.subject?.name}</span>
                        <span className="font-mono text-[10px] text-[#5c5c8a]">{exam.subject?.code}</span>
                      </td>
                      <td><span className="badge badge-violet">Class {exam.prepClass}</span></td>
                      <td className="font-mono text-xs">
                        {new Date(exam.examDate).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </td>
                      <td className="text-xs">{exam.durationMinutes}m · {exam.totalMarks}M</td>
                      <td className="font-bold text-[#f0f0ff] text-xs">{exam._count?.questions || 0}</td>
                      <td>
                        {exam.status === "PUBLISHED"
                          ? <span className="badge badge-emerald">Live</span>
                          : <span className="badge badge-muted">Draft</span>}
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button size="xs"
                            variant={exam.status === "PUBLISHED" ? "outline" : "success"}
                            onClick={() => togglePublish(exam)}>
                            {exam.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                          </Button>
                          <Link href="/coe-admin/exams">
                            <Button size="xs" variant="ghost" className="text-violet-400">Edit</Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      </div>
    </AdminGuard>
  );
}

