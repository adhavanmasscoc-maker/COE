"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  Users, UserCheck, UserX, Clock, CheckCircle, XCircle,
  Loader2, AlertCircle, RefreshCw, Eye, Languages,
  Hash, User, Calendar, ShieldCheck, UserPlus, Edit2,
  Trash2, Copy, Check, Key, Lock, Sparkles, X, ShieldAlert
} from "lucide-react";

// ── API helpers ──────────────────────────────────────────────────────
async function apiGet(url) {
  const r = await fetch(url);
  return r.ok ? r.json() : null;
}

async function apiPatch(url, body) {
  const r = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return r.ok ? r.json() : null;
}

async function apiPost(url, body) {
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return r.ok ? r.json() : null;
}

async function apiDelete(url) {
  const r = await fetch(url, { method: "DELETE" });
  return r.ok ? r.json() : null;
}

// ── Approval row ─────────────────────────────────────────────────────
function PendingRow({ p, onApprove, onReject, busy }) {
  const [currentClass, setCurrentClass] = useState(String(p.currentClass && p.currentClass > 0 ? p.currentClass : "10"));
  const [examPrepClass, setExamPrepClass] = useState(String(p.examPrepClass && p.examPrepClass > 0 ? p.examPrepClass : "10"));

  return (
    <tr className={busy ? "opacity-60 pointer-events-none" : ""}>
      <td>
        <span className="font-bold text-[#f0f0ff] block">{p.fullName}</span>
        <span className="font-mono text-[10px] text-[#5c5c8a]">{p.rollNo}</span>
      </td>
      <td>
        <span className={`badge ${p.medium === "Tamil" ? "badge-amber" : "badge-cyan"}`}>
          {p.medium === "Tamil" ? "தமிழ்" : p.medium}
        </span>
      </td>
      <td className="text-xs text-[#5c5c8a]">
        {new Date(p.createdAt).toLocaleDateString("en-IN", {
          day: "numeric", month: "short", year: "numeric",
        })}
      </td>
      <td>
        <div className="flex items-center gap-2">
          <div>
            <label className="text-[10px] text-[#5c5c8a] block mb-0.5">Current Class</label>
            <select value={currentClass} onChange={(e) => setCurrentClass(e.target.value)}
              className="bg-[rgba(13,13,26,0.8)] border border-[rgba(124,58,237,0.3)] text-[#f0f0ff] text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-violet-400">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((cls) => (
                <option key={cls} value={cls}>Class {cls}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-[#5c5c8a] block mb-0.5">Prep Level</label>
            <select value={examPrepClass} onChange={(e) => setExamPrepClass(e.target.value)}
              className="bg-[rgba(13,13,26,0.8)] border border-[rgba(124,58,237,0.3)] text-[#f0f0ff] text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-violet-400">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((cls) => (
                <option key={cls} value={cls}>Class {cls}</option>
              ))}
            </select>
          </div>
        </div>
      </td>
      <td>
        <div className="flex items-center gap-2">
          <Button size="xs" variant="success" onClick={() => onApprove(p, currentClass, examPrepClass)} className="gap-1">
            <UserCheck className="w-3 h-3" />Approve
          </Button>
          <Button size="xs" variant="danger" onClick={() => onReject(p)} className="gap-1">
            <UserX className="w-3 h-3" />Reject
          </Button>
        </div>
      </td>
    </tr>
  );
}

// ── Main page content ────────────────────────────────────────────────
function COEStudentsContent() {
  const searchParams = useSearchParams();
  const initialFilter = searchParams.get("filter") || "all";
  const [filter, setFilter]     = useState(initialFilter);
  const [students, setStudents] = useState([]);
  const [pending, setPending]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [busy, setBusy]         = useState(null); // id of row being processed
  const [notice, setNotice]     = useState({ msg: "", type: "ok" });
  const [updatingId, setUpdatingId] = useState(null);

  // Pre-Register Student State
  const [showPreRegModal, setShowPreRegModal] = useState(false);
  const [preRegLoading, setPreRegLoading] = useState(false);
  const [preRegForm, setPreRegForm] = useState({
    fullName: "",
    rollNo: `TN2026-${Math.floor(1000 + Math.random() * 9000)}`,
    password: "password123",
    currentClass: 10,
    examPrepClass: 10,
    medium: "English",
  });
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [copiedCreds, setCopiedCreds] = useState(false);

  // Edit Student State
  const [editingStudent, setEditingStudent] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: "",
    rollNo: "",
    currentClass: 10,
    examPrepClass: 10,
    medium: "English",
  });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [sData, pData] = await Promise.all([
        apiGet("/api/admin/students"),
        apiGet("/api/admin/students/pending"),
      ]);
      if (sData) setStudents(sData.students || []);
      if (pData) setPending(pData.pending || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const toast = (msg, type = "ok") => {
    setNotice({ msg, type });
    setTimeout(() => setNotice({ msg: "", type: "ok" }), 4000);
  };

  // Helper generator functions
  const autoGenRoll = () => {
    const num = Math.floor(1000 + Math.random() * 9000);
    setPreRegForm((prev) => ({ ...prev, rollNo: `TN2026-${num}` }));
  };

  const autoGenPass = () => {
    const words = ["Pass", "Exam", "Success", "Board", "Score"];
    const w = words[Math.floor(Math.random() * words.length)];
    const n = Math.floor(100 + Math.random() * 900);
    setPreRegForm((prev) => ({ ...prev, password: `Ak@${w}${n}` }));
  };

  // Submit Pre-Registration
  const handlePreRegSubmit = async (e) => {
    e.preventDefault();
    setPreRegLoading(true);
    try {
      const res = await apiPost("/api/admin/students/pre-register", preRegForm);
      if (res?.success) {
        setCreatedCredentials(res.credentials);
        toast(`Candidate ${res.student.fullName} pre-registered successfully!`);
        fetchAll();
      } else {
        alert(res?.error || "Failed to pre-register student.");
      }
    } catch {
      alert("Network error creating student account.");
    } finally {
      setPreRegLoading(false);
    }
  };

  // Copy Private Credentials
  const copyCredentialsText = () => {
    if (!createdCredentials) return;
    const text = `Official Tamil Nadu Board Examination Portal Credentials:\nStudent Name: ${createdCredentials.fullName}\nRoll Number / Username: ${createdCredentials.rollNo}\nPassword: ${createdCredentials.password}\nLogin Portal: https://ak-coe-exam.vercel.app/auth/login-student\n\nPlease keep these credentials secure and private.`;
    navigator.clipboard.writeText(text);
    setCopiedCreds(true);
    setTimeout(() => setCopiedCreds(false), 3000);
  };

  // Open Edit Modal
  const openEditModal = (student) => {
    setEditingStudent(student);
    setEditForm({
      fullName: student.fullName,
      rollNo: student.rollNo,
      currentClass: student.currentClass,
      examPrepClass: student.examPrepClass,
      medium: student.medium,
    });
  };

  // Save Edit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingStudent) return;
    setEditLoading(true);
    try {
      const res = await apiPatch(`/api/admin/students/${editingStudent.id}`, editForm);
      if (res?.success) {
        toast(`Student details for ${res.profile.fullName} updated successfully!`);
        setEditingStudent(null);
        fetchAll();
      } else {
        alert(res?.error || "Failed to update student details.");
      }
    } catch {
      alert("Network error updating student.");
    } finally {
      setEditLoading(false);
    }
  };

  // Delete Student
  const handleDeleteStudent = async (student) => {
    if (!confirm(`Are you sure you want to permanently delete student "${student.fullName}" (${student.rollNo})?\n\nThis will remove all associated submissions, progress, and login accounts from SQLite.`)) return;
    setBusy(student.id);
    try {
      const res = await apiDelete(`/api/admin/students/${student.id}`);
      if (res?.success) {
        toast(`Student ${student.fullName} deleted successfully.`, "warn");
        fetchAll();
      } else {
        alert(res?.error || "Failed to delete student.");
      }
    } catch {
      alert("Network error deleting student.");
    } finally {
      setBusy(null);
    }
  };

  // Approve: promote user to STUDENT, assign class + subjects
  const handleApprove = async (p, currentClass, examPrepClass) => {
    setBusy(p.userId);
    const res = await apiPost("/api/admin/students/approve", {
      userId: p.userId,
      profileId: p.profileId,
      currentClass: parseInt(currentClass),
      examPrepClass: parseInt(examPrepClass),
    });
    setBusy(null);
    if (res?.success) {
      toast(`✓ ${p.fullName} approved and activated as Class ${examPrepClass} student.`);
      fetchAll();
    } else {
      toast(res?.error || "Failed to approve student.", "err");
    }
  };

  // Reject: delete user record
  const handleReject = async (p) => {
    if (!confirm(`Reject and permanently delete registration for ${p.fullName} (${p.rollNo})?`)) return;
    setBusy(p.userId);
    const res = await apiPost("/api/admin/students/reject", { userId: p.userId });
    setBusy(null);
    if (res?.success) {
      toast(`Rejected registration for ${p.fullName}.`, "warn");
      fetchAll();
    } else {
      toast("Failed to reject registration.", "err");
    }
  };

  const updateMedium = async (studentId, name, medium) => {
    setUpdatingId(studentId);
    const res = await apiPatch(`/api/admin/students/${studentId}`, { medium });
    setUpdatingId(null);
    if (res?.success) {
      setStudents((prev) => prev.map((s) => s.id === studentId ? { ...s, medium } : s));
      toast(`Updated medium for ${name} to ${medium}.`);
    }
  };

  return (
    <div className="page-content space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-float-up">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-[#f0f0ff]">Student Management</h1>
            <p className="text-xs text-[#5c5c8a]">Approve registrations, edit profiles, pre-register candidates & dispatch private credentials</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setCreatedCredentials(null);
              setShowPreRegModal(true);
            }}
            className="gap-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20"
          >
            <UserPlus className="w-4 h-4" /> Pre-Register Student
          </Button>
          <Link href="/coe-admin/student-preview">
            <Button variant="amber" size="sm" className="gap-1.5 text-xs">
              <Eye className="w-3.5 h-3.5" />Student Previewer
            </Button>
          </Link>
          <Button variant="secondary" size="sm" onClick={fetchAll} className="gap-1.5 text-xs">
            <RefreshCw className="w-3.5 h-3.5" />Refresh
          </Button>
        </div>
      </div>

      {/* Toast */}
      {notice.msg && (
        <div className={`flex items-center gap-2 p-3.5 rounded-xl text-xs font-medium animate-scale-in ${
          notice.type === "err"
            ? "bg-rose-500/10 border border-rose-500/25 text-rose-300"
            : notice.type === "warn"
            ? "bg-amber-500/10 border border-amber-500/25 text-amber-300"
            : "bg-emerald-500/10 border border-emerald-500/25 text-emerald-300"
        }`}>
          <CheckCircle className="w-4 h-4 flex-shrink-0" />{notice.msg}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[rgba(124,58,237,0.15)] pb-3">
        {[
          { key: "all", label: "All Records", count: pending.length + students.length },
          { key: "pending", label: "Pending Approval", count: pending.length, highlight: pending.length > 0 },
          { key: "active", label: "Active Students", count: students.length },
        ].map(({ key, label, count, highlight }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === key
                ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                : "text-[#5c5c8a] hover:text-[#f0f0ff] hover:bg-[rgba(124,58,237,0.1)]"
            }`}
          >
            <span>{label}</span>
            <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
              highlight
                ? "bg-rose-500 text-white"
                : filter === key
                ? "bg-violet-800 text-white"
                : "bg-[rgba(124,58,237,0.15)] text-[#a8a8d0]"
            }`}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Pending Approvals */}
      {(filter === "all" || filter === "pending") && (
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-base font-bold text-[#f0f0ff]">Pending Registrations</h2>
          {pending.length > 0 && (
            <span className="badge badge-rose">{pending.length} awaiting review</span>
          )}
        </div>

        <div className="glass rounded-2xl border border-[rgba(124,58,237,0.2)] overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <Loader2 className="w-5 h-5 animate-spin text-violet-400 mx-auto mb-2" />
              <p className="text-xs text-[#5c5c8a]">Loading pending registrations…</p>
            </div>
          ) : pending.length === 0 ? (
            <div className="p-8 text-center">
              <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-[#f0f0ff] mb-1">All caught up!</p>
              <p className="text-xs text-[#5c5c8a]">No pending student registrations.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Language</th>
                    <th>Registered On</th>
                    <th>Class Assignment</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pending.map((p) => (
                    <PendingRow key={p.userId} p={p}
                      onApprove={handleApprove}
                      onReject={handleReject}
                      busy={busy === p.userId}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      )}

      {/* Active Students */}
      {(filter === "all" || filter === "active") && (
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-base font-bold text-[#f0f0ff]">Active Student Accounts</h2>
          <span className="badge badge-muted">{students.length} registered</span>
        </div>

        {loading ? (
          <div className="glass rounded-2xl p-8 text-center border border-[rgba(124,58,237,0.15)]">
            <Loader2 className="w-5 h-5 animate-spin text-violet-400 mx-auto" />
          </div>
        ) : students.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center border border-[rgba(124,58,237,0.15)]">
            <Users className="w-8 h-8 text-[#5c5c8a] mx-auto mb-2" />
            <p className="text-sm text-[#5c5c8a]">No active students yet. Approve pending registrations above or click &quot;Pre-Register Student&quot;.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {students.map((s) => (
              <div key={s.id} className="glass rounded-2xl p-5 border border-[rgba(124,58,237,0.2)] card-glow space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold">
                      {s.fullName?.[0] || "?"}
                    </div>
                    <div>
                      <h3 className="font-bold text-[#f0f0ff]">{s.fullName}</h3>
                      <p className="text-[11px] font-mono text-sky-400 font-semibold">{s.rollNo}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="badge badge-emerald">Active</span>
                    <button
                      onClick={() => openEditModal(s)}
                      className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-amber-300 hover:bg-amber-500/10 transition-colors"
                      title="Edit Student Details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteStudent(s)}
                      className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete Student Account"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Class info + medium toggle */}
                <div className="grid grid-cols-3 gap-2 p-3 glass-sm rounded-xl text-xs">
                  <div>
                    <span className="text-[10px] text-[#5c5c8a] uppercase font-bold block">School</span>
                    <span className="font-bold text-[#f0f0ff]">Class {s.currentClass}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-violet-400 uppercase font-bold block">Prep Level</span>
                    <span className="font-bold text-violet-300">Class {s.examPrepClass}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#5c5c8a] uppercase font-bold block mb-1">Medium</span>
                    <div className="flex gap-1">
                      {["English", "Tamil"].map((m) => (
                        <button key={m} disabled={updatingId === s.id}
                          onClick={() => updateMedium(s.id, s.fullName, m)}
                          className={`px-1.5 py-0.5 rounded-lg text-[10px] font-bold transition-all border ${
                            s.medium === m
                              ? "bg-violet-500/30 text-violet-200 border-violet-400/40"
                              : "text-[#5c5c8a] border-transparent hover:text-[#a8a8d0]"
                          }`}
                        >
                          {m === "Tamil" ? "த" : "EN"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Subjects */}
                <div>
                  <p className="text-[10px] text-[#5c5c8a] uppercase font-bold mb-1.5">Assigned Core Curriculum Subjects</p>
                  <div className="flex flex-wrap gap-1.5">
                    {s.subjects?.map((sub) => (
                      <span key={sub.id} className="badge badge-muted text-[10px]">{sub.name}</span>
                    ))}
                    {(!s.subjects || s.subjects.length === 0) && (
                      <span className="text-xs text-rose-400">No subjects assigned — edit to auto-assign</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-[rgba(124,58,237,0.1)]">
                  <span className="text-[11px] text-[#5c5c8a] font-mono">{s.academicYear}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(s)}
                      className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" /> Edit
                    </button>
                    <span className="text-border">•</span>
                    <Link href={`/student/dashboard?previewRollNo=${s.rollNo}`}
                      className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 font-semibold transition-colors">
                      <Eye className="w-3.5 h-3.5" />Preview Portal
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      )}

      {/* Pre-Register Student Modal */}
      {showPreRegModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-lg w-full p-6 border-amber-500/30 animate-in fade-in-50 zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-400">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Pre-Register Candidate</h3>
                  <p className="text-[11px] text-muted-foreground">Provision student with private credentials</p>
                </div>
              </div>
              <button
                onClick={() => setShowPreRegModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createdCredentials ? (
              /* Success & Private Credential Dispatch Card */
              <div className="space-y-4 animate-scale-in">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span>Candidate registered successfully! Send the private credentials below to the student.</span>
                </div>

                <div className="p-4 rounded-xl bg-secondary/80 border border-amber-500/30 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-border">
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-400" /> Private Candidate Credentials
                    </span>
                    <span className="badge badge-amber text-[10px]">Confidential</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Candidate Name:</span>
                      <span className="font-bold text-foreground">{createdCredentials.fullName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Roll Number (Username):</span>
                      <span className="font-mono font-bold text-sky-400 bg-sky-950/40 px-2 py-0.5 rounded border border-sky-500/30">
                        {createdCredentials.rollNo}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Password:</span>
                      <span className="font-mono font-bold text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">
                        {createdCredentials.password}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Login Portal URL:</span>
                      <span className="font-mono text-[11px] text-[#a8a8d0]">/auth/login-student</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-[11px] text-[#a8a8d0] flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
                  <span>These credentials are confidential and securely hashed with bcrypt in SQLite. Copy and share them privately with the candidate.</span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    variant="primary"
                    onClick={copyCredentialsText}
                    className="gap-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950"
                  >
                    {copiedCreds ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copiedCreds ? "Credentials Copied to Clipboard!" : "Copy Private Credentials"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowPreRegModal(false);
                      setCreatedCredentials(null);
                    }}
                    className="text-xs"
                  >
                    Done
                  </Button>
                </div>
              </div>
            ) : (
              /* Pre-Registration Form */
              <form onSubmit={handlePreRegSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Full Candidate Name</label>
                  <input
                    type="text"
                    required
                    value={preRegForm.fullName}
                    onChange={(e) => setPreRegForm({ ...preRegForm, fullName: e.target.value })}
                    placeholder="e.g. Vikram R"
                    className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-muted-foreground font-semibold">Roll Number</label>
                      <button
                        type="button"
                        onClick={autoGenRoll}
                        className="text-[10px] text-amber-400 hover:underline flex items-center gap-0.5"
                      >
                        <Sparkles className="w-2.5 h-2.5" /> Auto
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      value={preRegForm.rollNo}
                      onChange={(e) => setPreRegForm({ ...preRegForm, rollNo: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground font-mono"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-muted-foreground font-semibold">Password</label>
                      <button
                        type="button"
                        onClick={autoGenPass}
                        className="text-[10px] text-amber-400 hover:underline flex items-center gap-0.5"
                      >
                        <Sparkles className="w-2.5 h-2.5" /> Secure
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      value={preRegForm.password}
                      onChange={(e) => setPreRegForm({ ...preRegForm, password: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-muted-foreground font-semibold mb-1">School Class</label>
                    <select
                      value={preRegForm.currentClass}
                      onChange={(e) => setPreRegForm({ ...preRegForm, currentClass: parseInt(e.target.value, 10) })}
                      className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((cls) => (
                        <option key={cls} value={cls}>Class {cls}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-muted-foreground font-semibold mb-1">Prep Standard</label>
                    <select
                      value={preRegForm.examPrepClass}
                      onChange={(e) => setPreRegForm({ ...preRegForm, examPrepClass: parseInt(e.target.value, 10) })}
                      className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground font-bold text-amber-300"
                    >
                      <option value={10}>Class 10</option>
                      <option value={12}>Class 12</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-muted-foreground font-semibold mb-1">Medium</label>
                    <select
                      value={preRegForm.medium}
                      onChange={(e) => setPreRegForm({ ...preRegForm, medium: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground"
                    >
                      <option value="English">English</option>
                      <option value="Tamil">Tamil (தமிழ்)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowPreRegModal(false)}
                    disabled={preRegLoading}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={preRegLoading}
                    className="gap-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950"
                  >
                    {preRegLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                    Create & Generate Private Credentials
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </div>
      )}

      {/* Edit Student Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 border-violet-500/30 animate-in fade-in-50 zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-violet-400" />
                <h3 className="text-base font-bold text-foreground">Edit Student Profile</h3>
              </div>
              <button
                onClick={() => setEditingStudent(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground"
                />
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Roll Number (Username)</label>
                <input
                  type="text"
                  required
                  value={editForm.rollNo}
                  onChange={(e) => setEditForm({ ...editForm, rollNo: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground font-mono"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">School Class</label>
                  <select
                    value={editForm.currentClass}
                    onChange={(e) => setEditForm({ ...editForm, currentClass: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((cls) => (
                      <option key={cls} value={cls}>Class {cls}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Prep Standard</label>
                  <select
                    value={editForm.examPrepClass}
                    onChange={(e) => setEditForm({ ...editForm, examPrepClass: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground font-bold text-violet-300"
                  >
                    <option value={10}>Class 10</option>
                    <option value={12}>Class 12</option>
                  </select>
                </div>

                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Medium</label>
                  <select
                    value={editForm.medium}
                    onChange={(e) => setEditForm({ ...editForm, medium: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-secondary border border-border text-foreground"
                  >
                    <option value="English">English</option>
                    <option value="Tamil">Tamil</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingStudent(null)}
                  disabled={editLoading}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={editLoading}
                  className="text-xs font-bold"
                >
                  {editLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save Changes"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function COEStudentsPage() {
  return (
    <AdminGuard>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
        </div>
      }>
        <COEStudentsContent />
      </Suspense>
    </AdminGuard>
  );
}
