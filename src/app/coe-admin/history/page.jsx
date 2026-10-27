"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  ShieldAlert,
  Smartphone,
  Monitor,
  Clock,
  User,
  Activity,
  Search,
  Filter,
  RefreshCw,
  Download,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Info,
  Calendar,
  Layers,
  MousePointer,
  Radio,
  Eye,
  LogOut,
  Fingerprint
} from "lucide-react";

export default function HistoryPage() {
  return (
    <AdminGuard>
      <HistoryContent />
    </AdminGuard>
  );
}

function HistoryContent() {
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [deviceFilter, setDeviceFilter] = useState("ALL");
  const [alertFilter, setAlertFilter] = useState("ALL");

  const fetchHistory = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (actionFilter !== "ALL") params.set("action", actionFilter);
      if (deviceFilter !== "ALL") params.set("device", deviceFilter);
      if (alertFilter === "tab_switch") params.set("alert", "tab_switch");
      params.set("limit", "300");

      const res = await fetch(`/api/admin/history?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setLogs(data.logs || []);
        setSummary(data.summary || null);
        setError("");
      } else {
        setError(data.error || "Failed to load telemetry history.");
      }
    } catch {
      setError("Network error fetching telemetry history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [actionFilter, deviceFilter, alertFilter]);

  // Auto-refresh every 10 seconds if enabled
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchHistory();
    }, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh, search, actionFilter, deviceFilter, alertFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    fetchHistory();
  };

  const handleExportCSV = () => {
    if (!logs || logs.length === 0) return;
    const headers = [
      "Time",
      "Total Duration",
      "Login Time",
      "Last Login",
      "Logout Time",
      "Student Name",
      "Roll No",
      "DOB",
      "IP Address",
      "Device Type",
      "Is Mobile",
      "Action",
      "Details",
      "Tab Switch Alerts",
      "Integrity Status"
    ];

    const rows = logs.map((l) => [
      new Date(l.time).toISOString(),
      `"${l.totalDuration}"`,
      l.loginTime ? new Date(l.loginTime).toISOString() : "N/A",
      l.lastLoginTime ? new Date(l.lastLoginTime).toISOString() : "N/A",
      l.logoutTime ? new Date(l.logoutTime).toISOString() : "ACTIVE",
      `"${l.studentName}"`,
      `"${l.rollNo}"`,
      `"${l.dob || "N/A"}"`,
      `"${l.ipAddress}"`,
      `"${l.deviceType}"`,
      l.isMobile ? "YES" : "NO",
      `"${l.action}"`,
      `"${(l.details || "").replace(/"/g, '""')}"`,
      l.tabSwitchCount || 0,
      `"${l.integrityBadge}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `COE_Student_Device_History_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="page-content space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-float-up">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge badge-amber text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Fingerprint className="w-3.5 h-3.5 text-amber-400" />
              COE Surveillance & Telemetry
            </span>
            <span className="badge badge-violet text-[10px] font-mono">
              Live SQLite Audit
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#f0f0ff] tracking-tight">
            Student Device, IP & Click History
          </h1>
          <p className="text-xs text-[#5c5c8a] mt-1">
            Real-time biometric, device IP, active click streams, and anti-cheat window focus tracking to ensure independent mobile attendance.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              autoRefresh
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                : "glass-sm text-[#5c5c8a] hover:text-[#a8a8d0]"
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${autoRefresh ? "animate-pulse text-emerald-400" : ""}`} />
            {autoRefresh ? "Auto-Refresh ON (10s)" : "Auto-Refresh Paused"}
          </button>

          <Button
            size="sm"
            variant="secondary"
            onClick={() => { setLoading(true); fetchHistory(); }}
            className="gap-1.5 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>

          <Button
            size="sm"
            variant="primary"
            onClick={handleExportCSV}
            disabled={logs.length === 0}
            className="gap-1.5 text-xs font-bold"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Prominent COE Surveillance Notice Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-violet-500/10 to-indigo-500/10 border border-amber-500/25 animate-float-up space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
          <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>COE Official Notice: Candidate Mobile Attendance & Anti-Cheat Protocol</span>
        </div>
        <p className="text-xs text-[#a8a8d0] leading-relaxed">
          Candidates must independently attend examinations exclusively on their registered personal mobile devices. The portal actively records candidate client IP, user-agent hardware signatures, interactive button/option clicks, and window blur / tab-switch events. Any unauthorized desktop attendance or window unfocus during active papers is flagged below for COE proctor review.
        </p>
      </div>

      {/* Telemetry Metrics KPI Cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 animate-float-up">
          <div className="glass rounded-2xl p-4 border border-violet-500/20 card-glow flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#5c5c8a] font-semibold">Total Telemetry Events</span>
              <Activity className="w-4 h-4 text-violet-400" />
            </div>
            <div className="text-2xl font-black text-[#f0f0ff] mt-2">{summary.totalRecords}</div>
            <span className="text-[10px] text-violet-300 mt-1">Across all student actions & clicks</span>
          </div>

          <div className="glass rounded-2xl p-4 border border-emerald-500/20 card-glow flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#5c5c8a] font-semibold">Mobile Attendance Rate</span>
              <Smartphone className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-300 mt-2">{summary.mobileRatePercent}%</div>
            <span className="text-[10px] text-emerald-400/80 mt-1">{summary.mobileCount} verified mobile sessions</span>
          </div>

          <div className="glass rounded-2xl p-4 border border-rose-500/20 card-glow flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#5c5c8a] font-semibold">Anti-Cheat Tab Alerts</span>
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-black text-rose-300 mt-2">{summary.tabSwitchAlerts}</div>
            <span className="text-[10px] text-rose-400/80 mt-1">Candidate left exam screen</span>
          </div>

          <div className="glass rounded-2xl p-4 border border-cyan-500/20 card-glow flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#5c5c8a] font-semibold">Active Unique Candidates</span>
              <User className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-black text-cyan-300 mt-2">{summary.uniqueStudentsActive}</div>
            <span className="text-[10px] text-cyan-400/80 mt-1">Participating students</span>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="glass rounded-2xl p-4 border border-[rgba(124,58,237,0.2)] space-y-3 animate-float-up">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#5c5c8a] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Student Name, Roll No (e.g. TN2026-1102), Client IP, or Click action…"
              className="input-field pl-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {/* Action filter */}
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="input-field text-xs cursor-pointer min-w-[130px]"
            >
              <option value="ALL">All Actions</option>
              <option value="LOGIN">Logins</option>
              <option value="CLICK">Student Clicks</option>
              <option value="TAB_SWITCH_ALERT">⚠️ Tab Switch Alerts</option>
              <option value="PAGE_VIEW">Page Views</option>
              <option value="LOGOUT">Logouts</option>
            </select>

            {/* Device filter */}
            <select
              value={deviceFilter}
              onChange={(e) => setDeviceFilter(e.target.value)}
              className="input-field text-xs cursor-pointer min-w-[130px]"
            >
              <option value="ALL">All Devices</option>
              <option value="mobile">📱 Mobile Only</option>
              <option value="desktop">💻 Desktop Only</option>
            </select>

            {/* Tab switch quick toggle */}
            <button
              type="button"
              onClick={() => setAlertFilter(alertFilter === "tab_switch" ? "ALL" : "tab_switch")}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border whitespace-nowrap ${
                alertFilter === "tab_switch"
                  ? "bg-rose-500/25 border-rose-500/40 text-rose-200"
                  : "glass-sm text-[#5c5c8a] hover:text-[#a8a8d0]"
              }`}
            >
              ⚠️ Tab Switches Only
            </button>

            <Button type="submit" size="sm" variant="primary">
              Filter
            </Button>
          </div>
        </form>
      </div>

      {/* Main Telemetry Table */}
      <div className="glass rounded-2xl border border-[rgba(124,58,237,0.2)] overflow-hidden shadow-2xl animate-float-up">
        <div className="p-4 border-b border-[rgba(124,58,237,0.15)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-violet-400" />
            <h2 className="text-sm font-bold text-[#f0f0ff]">
              Live Student Device, IP & Interaction Logs ({logs.length})
            </h2>
          </div>
          <span className="text-xs text-[#5c5c8a]">
            Records stored permanently in SQLite
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-[#5c5c8a] space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin text-violet-400 mx-auto" />
            <p>Querying SQLite telemetry database…</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#5c5c8a] space-y-2">
            <Info className="w-8 h-8 text-[#5c5c8a] mx-auto opacity-50" />
            <p className="font-semibold text-[#a8a8d0]">No telemetry records matching criteria.</p>
            <p>Student logins, clicks, and device telemetry will automatically stream here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[rgba(124,58,237,0.08)] border-b border-[rgba(124,58,237,0.15)] text-[#a8a8d0] font-bold">
                  <th className="py-3 px-3.5 whitespace-nowrap">Time</th>
                  <th className="py-3 px-3.5 whitespace-nowrap">Candidate Name</th>
                  <th className="py-3 px-3.5 whitespace-nowrap">Roll No</th>
                  <th className="py-3 px-3.5 whitespace-nowrap">DOB</th>
                  <th className="py-3 px-3.5 whitespace-nowrap">Device IP</th>
                  <th className="py-3 px-3.5 whitespace-nowrap">Device Type</th>
                  <th className="py-3 px-3.5 whitespace-nowrap">Action & Clicks</th>
                  <th className="py-3 px-3.5 whitespace-nowrap">Total Duration</th>
                  <th className="py-3 px-3.5 whitespace-nowrap">Login Time</th>
                  <th className="py-3 px-3.5 whitespace-nowrap">Last Login</th>
                  <th className="py-3 px-3.5 whitespace-nowrap">Logout Time</th>
                  <th className="py-3 px-3.5 whitespace-nowrap text-right">Preview</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(124,58,237,0.08)] text-[#f0f0ff]">
                {logs.map((log) => {
                  const isAlert = log.tabSwitchCount > 0;
                  const isLogin = log.action === "LOGIN";
                  const isLogout = log.action === "LOGOUT";

                  return (
                    <tr
                      key={log.id}
                      className={`hover:bg-violet-500/5 transition-colors ${
                        isAlert ? "bg-rose-500/5" : ""
                      }`}
                    >
                      {/* Time */}
                      <td className="py-3 px-3.5 whitespace-nowrap font-mono text-[11px] text-[#a8a8d0]">
                        {new Date(log.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                        <div className="text-[10px] text-[#5c5c8a]">
                          {new Date(log.time).toLocaleDateString()}
                        </div>
                      </td>

                      {/* Student Name */}
                      <td className="py-3 px-3.5 whitespace-nowrap font-bold text-violet-200">
                        {log.studentName}
                      </td>

                      {/* Roll No */}
                      <td className="py-3 px-3.5 whitespace-nowrap font-mono text-xs font-bold text-amber-300">
                        {log.rollNo}
                      </td>

                      {/* DOB */}
                      <td className="py-3 px-3.5 whitespace-nowrap font-mono text-xs text-[#a8a8d0]">
                        {log.dob || "On File"}
                      </td>

                      {/* Device IP */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-cyan-300">
                          {log.ipAddress}
                        </span>
                      </td>

                      {/* Device Type */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {log.isMobile ? (
                            <span className="badge badge-emerald text-[11px] font-medium flex items-center gap-1">
                              <Smartphone className="w-3 h-3 text-emerald-400" />
                              {log.deviceType}
                            </span>
                          ) : (
                            <span className="badge badge-amber text-[11px] font-medium flex items-center gap-1">
                              <Monitor className="w-3 h-3 text-amber-400" />
                              {log.deviceType}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Action & Clicks */}
                      <td className="py-3 px-3.5 max-w-[280px]">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          {isAlert ? (
                            <span className="badge badge-rose text-[10px] font-bold flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> TAB SWITCH ALERT
                            </span>
                          ) : isLogin ? (
                            <span className="badge badge-emerald text-[10px] font-bold">
                              LOGIN SUCCESS
                            </span>
                          ) : isLogout ? (
                            <span className="badge badge-violet text-[10px] font-bold">
                              LOGGED OUT
                            </span>
                          ) : (
                            <span className="badge badge-cyan text-[10px] font-bold flex items-center gap-1">
                              <MousePointer className="w-2.5 h-2.5" /> {log.action}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#a8a8d0] truncate" title={log.details}>
                          {log.details}
                        </p>
                      </td>

                      {/* Total Duration in Site */}
                      <td className="py-3 px-3.5 whitespace-nowrap font-mono text-xs font-semibold text-emerald-300">
                        {log.totalDuration}
                      </td>

                      {/* Login Time */}
                      <td className="py-3 px-3.5 whitespace-nowrap font-mono text-[11px] text-[#a8a8d0]">
                        {log.loginTime ? new Date(log.loginTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                      </td>

                      {/* Last Login */}
                      <td className="py-3 px-3.5 whitespace-nowrap font-mono text-[11px] text-[#5c5c8a]">
                        {log.lastLoginTime ? new Date(log.lastLoginTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "First Session"}
                      </td>

                      {/* Logout Time */}
                      <td className="py-3 px-3.5 whitespace-nowrap font-mono text-[11px]">
                        {log.logoutTime ? (
                          <span className="text-[#a8a8d0]">
                            {new Date(log.logoutTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        ) : (
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Active
                          </span>
                        )}
                      </td>

                      {/* Student Preview Link */}
                      <td className="py-3 px-3.5 whitespace-nowrap text-right">
                        <Link
                          href={`/student/dashboard?previewRollNo=${encodeURIComponent(log.rollNo)}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg glass-sm text-[11px] text-violet-300 hover:text-violet-100 hover:bg-violet-500/20 transition-all font-semibold"
                        >
                          <Eye className="w-3 h-3" /> View <ChevronRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
