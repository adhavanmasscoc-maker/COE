"use client";

import React, { useEffect } from "react";
import { AlertCircle, RefreshCw, Home, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function RootErrorBoundary({ error, reset }) {
  useEffect(() => {
    // Log exception to console
    console.error("[COE Portal Global Error Boundary Caught Exception]:", error);

    // Auto-reload once if ChunkLoadError (happens on fresh Vercel production deployment)
    if (error?.name === "ChunkLoadError" || error?.message?.includes("Loading chunk")) {
      const hasReloaded = sessionStorage.getItem("chunk_reload_lock");
      if (!hasReloaded) {
        sessionStorage.setItem("chunk_reload_lock", "true");
        window.location.reload();
      }
    }
  }, [error]);

  const handleRetry = () => {
    sessionStorage.removeItem("chunk_reload_lock");
    if (reset) {
      reset();
    } else {
      window.location.reload();
    }
  };

  const handleHardRefresh = () => {
    sessionStorage.removeItem("chunk_reload_lock");
    window.location.href = window.location.href.split("#")[0];
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="glass rounded-2xl p-6 sm:p-8 max-w-lg w-full border border-rose-500/30 text-center shadow-2xl space-y-4 animate-in fade-in-50 zoom-in-95">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-lg font-black text-foreground">COE Portal Session Recovered</h2>
          <p className="text-xs text-muted-foreground mt-1">
            An unexpected client-side runtime exception occurred. Your examination responses and records are safely preserved in the database.
          </p>
        </div>

        {error?.message && (
          <div className="p-3 rounded-xl bg-secondary/50 border border-border text-left font-mono text-[11px] text-rose-300 max-h-28 overflow-y-auto break-all">
            <strong>Exception:</strong> {error.message}
          </div>
        )}

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleRetry}
            className="w-full sm:w-auto gap-1.5 font-bold bg-amber-500 hover:bg-amber-400 text-slate-950"
          >
            <RefreshCw className="w-4 h-4" /> Try Again
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleHardRefresh}
            className="w-full sm:w-auto gap-1.5 font-bold border-border text-foreground hover:bg-secondary"
          >
            <RefreshCw className="w-4 h-4 text-emerald-400" /> Reload Fresh State
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => (window.location.href = "/")}
            className="w-full sm:w-auto gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <Home className="w-4 h-4" /> Home
          </Button>
        </div>
      </div>
    </div>
  );
}
