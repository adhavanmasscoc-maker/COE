"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  Monitor,
  ArrowLeft,
  RefreshCw,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Shield,
  Maximize2,
  X,
  Radio,
  Wifi,
  WifiOff,
  UserCheck
} from "lucide-react";

function LiveMonitoringContent() {
  const [streams, setStreams] = useState([]);
  const [heartbeats, setHeartbeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [selectedStream, setSelectedStream] = useState(null);
  const [warningMsg, setWarningMsg] = useState("");

  const fetchLiveStreams = async () => {
    try {
      const res = await fetch("/api/admin/live-streams");
      if (res.ok) {
        const data = await res.json();
        setStreams(data.streams || []);
        setHeartbeats(data.heartbeats || []);
        setLastRefreshed(new Date().toLocaleTimeString("en-IN"));
      }
    } catch (err) {
      console.error("Error fetching live streams:", err);
    } finally {
      setLoading(false);
    }
  };

  // Poll live streams every 3 seconds for smooth real-time viewing
  useEffect(() => {
    fetchLiveStreams();
    const interval = setInterval(fetchLiveStreams, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSendWarning = async (rollNo) => {
    const msg = prompt(`Enter warning message to send to candidate ${rollNo}:`, "Warning from COE: Tab switching detected. Please focus on your exam screen.");
    if (!msg) return;

    try {
      await fetch("/api/admin/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rollNo,
          category: "COE_PROCTOR_WARNING",
          message: `Proctor warning issued to candidate ${rollNo}: "${msg}"`,
        }),
      }).catch(() => {});

      setWarningMsg(`Warning successfully transmitted to candidate ${rollNo}.`);
      setTimeout(() => setWarningMsg(""), 4000);
    } catch {
      alert("Failed to send warning.");
    }
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
      {/* Top Banner & Header */}
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
              <h1 className="text-xl sm:text-2xl font-black text-foreground">Live Screen Proctoring</h1>
              <Badge variant="purple" className="flex items-center gap-1 font-mono">
                <Radio className="w-3 h-3 text-rose-400 animate-pulse" /> LIVE STREAM
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Real-time private candidate screen view • Tab switch prevention • Active session telemetry
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {lastRefreshed && (
            <span className="text-[11px] font-mono text-muted-foreground">
              Updated: {lastRefreshed}
            </span>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={fetchLiveStreams}
            className="gap-1.5 text-xs font-semibold"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
        </div>
      </div>

      {warningMsg && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {warningMsg}
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center justify-between border-sky-500/20 bg-card">
          <div>
            <span className="text-xs font-semibold text-muted-foreground">Active Streams</span>
            <div className="text-2xl font-black text-sky-400 mt-0.5">
              {streams.filter((s) => s.isOnline).length}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
            <Monitor className="w-5 h-5 text-sky-400" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between border-emerald-500/20 bg-card">
          <div>
            <span className="text-xs font-semibold text-muted-foreground">Heartbeat Active</span>
            <div className="text-2xl font-black text-emerald-400 mt-0.5">
              {heartbeats.length}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-emerald-400" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between border-amber-500/20 bg-card">
          <div>
            <span className="text-xs font-semibold text-muted-foreground">Tab Switch Flags</span>
            <div className="text-2xl font-black text-amber-400 mt-0.5">
              {streams.reduce((acc, s) => acc + (s.tabSwitchCount || 0), 0)}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
        </Card>
      </div>

      {/* Live Screen Streams Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Monitor className="w-4 h-4 text-sky-400" />
            Live Candidate Displays ({streams.length})
          </h2>
          <span className="text-[11px] text-muted-foreground">
            Click any display to view full-screen live feed
          </span>
        </div>

        {streams.length === 0 ? (
          <Card className="p-12 text-center border-dashed border-border bg-card">
            <Monitor className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-40" />
            <h3 className="text-sm font-bold text-foreground mb-1">No Active Screen Streams</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Screen streams will appear here as soon as candidates enter the examination hall and enable screen sharing.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {streams.map((stream) => {
              const hb = heartbeats.find((h) => h.rollNo === stream.rollNo);
              const isWarning = (stream.tabSwitchCount || 0) > 2;

              return (
                <Card
                  key={stream.rollNo}
                  className={`overflow-hidden border transition-all hover:border-sky-500/50 cursor-pointer ${
                    isWarning ? "border-amber-500/40" : "border-border"
                  }`}
                  onClick={() => setSelectedStream(stream)}
                >
                  {/* Stream Screen Preview */}
                  <div className="relative aspect-video bg-slate-950 flex items-center justify-center border-b border-border">
                    {stream.frame ? (
                      <img
                        src={stream.frame}
                        alt={`Screen of ${stream.rollNo}`}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-1.5 text-slate-500 text-xs">
                        <Monitor className="w-8 h-8 opacity-40" />
                        <span>Awaiting frame...</span>
                      </div>
                    )}

                    {/* Live Badge Overlay */}
                    <div className="absolute top-2 left-2 flex items-center gap-1.5">
                      {stream.isOnline ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/90 text-white shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                          LIVE
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/90 text-white">
                          <WifiOff className="w-2.5 h-2.5" />
                          OFFLINE
                        </span>
                      )}

                      {isWarning && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/90 text-slate-950">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          {stream.tabSwitchCount} Switches
                        </span>
                      )}
                    </div>

                    <button
                      className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white text-xs backdrop-blur-sm"
                      title="Enlarge Screen"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Candidate Info Footer */}
                  <div className="p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-foreground">
                          {stream.studentName}
                        </div>
                        <div className="text-[11px] font-mono text-sky-400 font-semibold">
                          {stream.rollNo}
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSendWarning(stream.rollNo);
                        }}
                        className="text-[10px] text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 h-7 px-2"
                      >
                        Warn Candidate
                      </Button>
                    </div>

                    {hb && (
                      <div className="pt-2 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                        <span>Answered: {hb.answeredCount}</span>
                        <span>Time Left: {Math.floor(hb.timeLeftSecs / 60)}m</span>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Full-Screen Enlarged Modal */}
      {selectedStream && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="max-w-5xl w-full bg-card border border-border rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-border flex items-center justify-between bg-secondary/50">
              <div className="flex items-center gap-2">
                <Monitor className="w-5 h-5 text-sky-400" />
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Live Display: {selectedStream.studentName} ({selectedStream.rollNo})
                  </h3>
                  <span className="text-[10px] text-muted-foreground">
                    Private proctor stream • Latency: {selectedStream.ageSecs}s
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSendWarning(selectedStream.rollNo)}
                  className="text-xs text-amber-400 border-amber-500/30 gap-1"
                >
                  <AlertTriangle className="w-3.5 h-3.5" /> Send Warning
                </Button>
                <button
                  onClick={() => setSelectedStream(null)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-black p-2 flex items-center justify-center overflow-auto min-h-[400px]">
              {selectedStream.frame ? (
                <img
                  src={selectedStream.frame}
                  alt={`Enlarged screen of ${selectedStream.rollNo}`}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg"
                />
              ) : (
                <div className="text-slate-500 text-xs">Awaiting display signal...</div>
              )}
            </div>

            <div className="p-3 border-t border-border bg-card flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${selectedStream.isOnline ? "bg-emerald-400" : "bg-rose-400"}`} />
                  {selectedStream.isOnline ? "Active Screen Stream" : "Stream Suspended"}
                </span>
                <span>Tab Switches: {selectedStream.tabSwitchCount || 0}</span>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setSelectedStream(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function COEAdminLiveMonitoringPage() {
  return (
    <AdminGuard>
      <LiveMonitoringContent />
    </AdminGuard>
  );
}
