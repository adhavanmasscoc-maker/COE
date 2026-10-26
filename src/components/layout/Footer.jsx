"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Shield, BookOpen, Clock } from "lucide-react";

export function Footer() {
  const pathname = usePathname();

  // Hide footer during distraction-free exam mode
  if (pathname?.includes("/exam-mock")) {
    return null;
  }

  return (
    <footer className="w-full border-t border-border bg-card/50 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-sky-400" />
            <span>Academic Controller of Examinations (COE) Private System</span>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              TN Samacheer Kalvi Standards
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Localhost Realtime Sync
            </span>
          </div>

          <p className="text-[11px]">
            Controller of Examinations Portal • Secondary & Higher Secondary Cadre
          </p>
        </div>
      </div>
    </footer>
  );
}
