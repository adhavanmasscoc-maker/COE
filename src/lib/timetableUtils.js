/**
 * Timetable Pure Utilities
 * Formats Asia/Kolkata date and 12-hour time with translated AM/PM,
 * computes deterministic countdown string, and derives lifecycle status.
 */

// Formats Asia/Kolkata date and 12-hour time with translated AM/PM
export function formatExamDateTime(isoStr, isTamil) {
  if (!isoStr) return { dateStr: "TBD", timeStr: "TBD" };
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return { dateStr: "TBD", timeStr: "TBD" };

  const dateStr = d.toLocaleDateString(isTamil ? "ta-IN" : "en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const timeFormatted = d.toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const isPM = timeFormatted.toUpperCase().includes("PM");
  const timePart = timeFormatted.replace(/\s*(AM|PM|am|pm)/i, "").trim();
  const ampm = isTamil ? (isPM ? "பிற்பகல்" : "முற்பகல்") : isPM ? "PM" : "AM";
  const timeStr = `${timePart} ${ampm}`;

  return { dateStr, timeStr };
}

// Translated countdown string without monospace
export function formatCountdownText(targetMs, nowMs, isTamil) {
  if (!targetMs || isNaN(targetMs)) return null;
  const diffSecs = Math.max(0, Math.floor((targetMs - nowMs) / 1000));
  if (diffSecs <= 0) return null;

  const days = Math.floor(diffSecs / 86400);
  const hours = Math.floor((diffSecs % 86400) / 3600);
  const mins = Math.floor((diffSecs % 3600) / 60);
  const secs = diffSecs % 60;

  if (days >= 1) {
    if (isTamil) {
      return `இன்னும் ${days} ${days > 1 ? "நாட்கள்" : "நாள்"}${hours > 0 ? ` ${hours} மணி` : ""}`;
    }
    return `Starts in ${days}d${hours > 0 ? ` ${hours}h` : ""}`;
  }

  if (diffSecs < 600) {
    if (isTamil) {
      return `இன்னும் ${mins} நிமிடம் ${secs} விநாடி`;
    }
    return `Starts in ${mins}m ${secs}s`;
  }

  if (hours > 0) {
    if (isTamil) {
      return `இன்னும் ${hours} மணி ${mins} நிமிடம்`;
    }
    return `Starts in ${hours}h ${mins}m`;
  }

  if (isTamil) {
    return `இன்னும் ${mins} நிமிடம்`;
  }
  return `Starts in ${mins}m`;
}

// Deterministic lifecycle status derivation
export function getLifecycle(exam, nowMs) {
  if (exam.isSubmitted || exam.status === "COMPLETED") {
    if (exam.isResultPublished) return "RESULTS_PUBLISHED";
    return "COMPLETED";
  }

  const startMs = new Date(exam.examDate).getTime();
  const durationMs = (exam.durationMinutes || 45) * 60 * 1000;
  const endMs = startMs + durationMs;

  if (nowMs >= endMs) return "CLOSED";
  if (nowMs >= startMs) return "LIVE";
  return "UPCOMING";
}

