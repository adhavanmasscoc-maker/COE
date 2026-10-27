"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function ActivityTracker({ studentRollNo = null, studentName = null }) {
  const pathname = usePathname();
  const startTimeRef = useRef(Date.now());
  const tabSwitchesRef = useRef(0);
  const lastPathRef = useRef(pathname);

  // Send telemetry beacon to backend
  const sendTelemetry = async (action, details = "", extra = {}) => {
    try {
      const elapsedSecs = Math.max(0, Math.floor((Date.now() - startTimeRef.current) / 1000));
      await fetch("/api/student/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          details,
          durationSeconds: elapsedSecs,
          tabSwitchCount: tabSwitchesRef.current,
          rollNo: studentRollNo,
          studentName: studentName,
          ...extra,
        }),
      });
    } catch (_) {
      // Non-blocking telemetry
    }
  };

  // 1. Track Page View on route change
  useEffect(() => {
    if (pathname !== lastPathRef.current) {
      lastPathRef.current = pathname;
      sendTelemetry("PAGE_VIEW", `Candidate navigated to page: ${pathname}`);
    }
  }, [pathname]);

  // 2. Anti-Cheat: Track window blur / visibility change (switching tabs to search for answers)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        tabSwitchesRef.current += 1;
        sendTelemetry(
          "TAB_SWITCH_ALERT",
          `Candidate switched tabs or minimized window (Help alert trigger #${tabSwitchesRef.current}) on page ${pathname}`
        );
      }
    };

    const handleWindowBlur = () => {
      // Window lost focus (candidate clicked outside or opened split screen/another application)
      tabSwitchesRef.current += 1;
      sendTelemetry(
        "TAB_SWITCH_ALERT",
        `Candidate window lost focus / split screen opened (Help alert #${tabSwitchesRef.current}) on page ${pathname}`
      );
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);

    // 3. Heartbeat every 30 seconds to keep total duration updated in database
    const interval = setInterval(() => {
      sendTelemetry("HEARTBEAT", `Active session heartbeat on ${pathname}`);
    }, 30000);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      clearInterval(interval);
    };
  }, [pathname]);

  // 4. Click tracker for interactive options and buttons
  useEffect(() => {
    const handleClick = (e) => {
      const target = e.target.closest("button, a, input[type='radio'], input[type='checkbox']");
      if (!target) return;

      const btnText = target.innerText || target.getAttribute("aria-label") || target.value || target.tagName;
      const cleanText = String(btnText).replace(/\s+/g, " ").trim().slice(0, 80);

      // Avoid spamming telemetry on simple pagination or generic clicks
      if (cleanText) {
        sendTelemetry("CLICK", `Candidate clicked: "${cleanText}" on ${pathname}`);
      }
    };

    document.addEventListener("click", handleClick, { passive: true });
    return () => document.removeEventListener("click", handleClick);
  }, [pathname]);

  return null;
}
