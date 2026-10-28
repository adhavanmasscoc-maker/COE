"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  AlertTriangle, ArrowLeft, CheckCircle2, Clock,
  Loader2, RefreshCw, Wifi, WifiOff, ShieldAlert,
  X, Activity, Filter
} from "lucide-react";

const STATUS_COLORS = {
  open: "badge-rose",
  acknowledged: "badge-amber",
  resolved: "badge-emerald",
};

const STATUS_ICONS = {
  open: <AlertTriangle className="w-3.5 h-3.5" />,
  acknowledged: <Clock className="w-3.5 h-3.5" />,
  resolved: <CheckCircle2 className="w-3.5 h-3.5" />,
};

function COEIncidentPanelContent() {
  const [incidents, setIncidents] = useState([]);
  const [heartbeatWarnings, setHeartbeatWarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [notification, setNotification] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const url = statusFilter === "ALL"
        ? "/api/admin/incidents"
        : `/api/admin/incidents?status=${statusFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) {
        setIncidents(data.incidents || []);
        setHeartbeatWarnings(data.heartbeatWarnings || []);
      }
    } catch (err) {
      console.error("Failed to load incidents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [statusFilter]);

  const showMsg = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 4000);
  };

  const updateStatus = async (incidentId, newStatus) => {
    try {
      const res = await fetch("/api/admin/incidents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ incidentId, status: newStatus }),
      });
      if (res.ok) {
        showMsg(`Incident ${incidentId} marked as ${newStatus}.`);
        fetchData();
      }
    } catch {
      showMsg("Failed to update incident status.");
    }
  };

  const openCount = incidents.filter((i) => i.status === "open").length;

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
      {/* Header */}
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
              <h1 className="text-xl sm:text-2xl font-black text-foreground">COE Help Panel</h1>
              <Badge variant="warning">Incident Tracker</Badge>
              {openCount > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-black bg-rose-500 text-white rounded-full animate-pulse">
                  {openCount}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Real-time error incidents from all routes · Exam heartbeat monitoring · Student connectivity alerts
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={fetchData}
          className="gap-1.5 text-xs"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </Button>
      </div>

      {/* Notification */}
      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* Heartbeat Warnings */}
      {heartbeatWarnings.length > 0 && (
        <Card className="border-amber-500/30 overflow-hidden">
          <div className="p-4 bg-amber-500/10 border-b border-amber-500/20 flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-amber-300">
              Live Exam Connectivity Warnings ({heartbeatWarnings.length})
            </h2>
            <span className="text-[10px] text-amber-400/70 ml-1">— last 30 minutes</span>
          </div>
          <div className="divide-y divide-border">
            {heartbeatWarnings.map((hb) => (
              <div key={hb.id} className="p-4 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Wifi className="w-3.5 h-3.5 text-rose-400" />
                  <span className="font-bold text-foreground">{hb.rollNo}</span>
                  <Badge variant="warning" className="text-[10px]">{hb.status}</Badge>
                </div>
                <div className="text-muted-foreground font-mono">
                  Answered: {hb.answeredCount} · Time left: {Math.floor(hb.timeLeftSecs / 60)}m ·{" "}
                  {new Date(hb.createdAt).toLocaleTimeString("en-IN")}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Filters */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-card p-1 rounded-xl border border-border">
          {[
            { key: "ALL", label: "All Incidents" },
            { key: "open", label: "Open" },
            { key: "acknowledged", label: "Acknowledged" },
            { key: "resolved", label: "Resolved" },
          ].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setStatusFilter(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === key
                  ? "bg-primary text-primary-foreground font-bold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <span className="text-xs text-muted-foreground font-mono">{incidents.length} incidents</span>
      </div>

      {/* Incidents Table */}
      <Card className="border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-secondary/70 border-b border-border text-muted-foreground uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Incident ID</th>
                <th className="py-3 px-4">Route</th>
                <th className="py-3 px-4">Roll No</th>
                <th className="py-3 px-4">Step</th>
                <th className="py-3 px-4">Message</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-muted-foreground">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-400" />
                    Loading incident records...
                  </td>
                </tr>
              ) : incidents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-muted-foreground">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                    No incidents. All systems operating normally.
                  </td>
                </tr>
              ) : (
                incidents.map((inc) => (
                  <tr key={inc.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="py-3 px-4 font-mono text-[10px] text-violet-300">{inc.incidentId}</td>
                    <td className="py-3 px-4 font-mono text-muted-foreground">{inc.route}</td>
                    <td className="py-3 px-4">
                      {inc.rollNo ? (
                        <span className="font-mono font-bold text-sky-300">{inc.rollNo}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {inc.step ? (
                        <Badge variant="secondary" className="text-[10px]">{inc.step}</Badge>
                      ) : "—"}
                    </td>
                    <td className="py-3 px-4 text-foreground max-w-xs truncate" title={inc.message}>
                      {inc.message}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`badge ${STATUS_COLORS[inc.status] || "badge-muted"} inline-flex items-center gap-1`}>
                        {STATUS_ICONS[inc.status]}
                        {inc.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-muted-foreground text-[10px]">
                      {new Date(inc.createdAt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
                    </td>
                    <td className="py-3 px-4 text-right space-x-1">
                      {inc.status === "open" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateStatus(inc.incidentId, "acknowledged")}
                          className="text-[10px] py-1 px-2 text-amber-400 border-amber-500/30"
                        >
                          Acknowledge
                        </Button>
                      )}
                      {inc.status !== "resolved" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => updateStatus(inc.incidentId, "resolved")}
                          className="text-[10px] py-1 px-2 text-emerald-400 hover:bg-emerald-500/10"
                        >
                          Resolve
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default function COEIncidentPanelPage() {
  return (
    <AdminGuard>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
        </div>
      }>
        <COEIncidentPanelContent />
      </Suspense>
    </AdminGuard>
  );
}
