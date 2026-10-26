"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { Button } from "@/components/ui/Button";
import {
  Users, UserCheck, UserX, Clock, CheckCircle, XCircle,
  Loader2, AlertCircle, RefreshCw, Eye, Languages,
  Hash, User, Calendar, ShieldCheck,
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
      <div className="flex items-center justify-between animate-float-up">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-[#f0f0ff]">Student Management</h1>
            <p className="text-xs text-[#5c5c8a]">Approve registrations, manage accounts & subjects</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
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
            <p className="text-sm text-[#5c5c8a]">No active students yet. Approve pending registrations above.</p>
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
                      <p className="text-[11px] font-mono text-[#5c5c8a]">{s.rollNo}</p>
                    </div>
                  </div>
                  <span className="badge badge-emerald">Active</span>
                </div>

                {/* Class info + medium toggle */}
                <div className="grid grid-cols-3 gap-2 p-3 glass-sm rounded-xl text-xs">
                  <div>
                    <span className="text-[10px] text-[#5c5c8a] uppercase font-bold block">School</span>
                    <span className="font-bold text-[#f0f0ff]">Class {s.currentClass}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-violet-400 uppercase font-bold block">Prep</span>
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
                  <p className="text-[10px] text-[#5c5c8a] uppercase font-bold mb-1.5">Assigned Subjects</p>
                  <div className="flex flex-wrap gap-1.5">
                    {s.subjects?.map((sub) => (
                      <span key={sub.id} className="badge badge-muted text-[10px]">{sub.name}</span>
                    ))}
                    {(!s.subjects || s.subjects.length === 0) && (
                      <span className="text-xs text-rose-400">No subjects assigned — approve subjects via seed</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-[rgba(124,58,237,0.1)]">
                  <span className="text-[11px] text-[#5c5c8a] font-mono">{s.academicYear}</span>
                  <Link href={`/student/dashboard?previewRollNo=${s.rollNo}`}
                    className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 font-semibold transition-colors">
                    <Eye className="w-3.5 h-3.5" />Preview Portal
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
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
