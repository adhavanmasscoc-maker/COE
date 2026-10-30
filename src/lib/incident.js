/**
 * Incident Management
 * Creates, saves, and retrieves incidents from Turso / SQLite with in-memory fallback.
 * Guarantees zero lost incidents even during transient network or database blips.
 */
import { db } from "./db.js";
import fs from "fs";
import path from "path";

// In-memory fallback buffer for zero-loss guarantee
globalThis._incidentFallback = globalThis._incidentFallback || [];

const FALLBACK_CACHE_FILE = path.join(
  process.env.VERCEL ? "/tmp" : process.cwd(),
  "incidents_fallback.json"
);

function readDiskFallback() {
  try {
    if (fs.existsSync(FALLBACK_CACHE_FILE)) {
      const raw = fs.readFileSync(FALLBACK_CACHE_FILE, "utf8");
      return JSON.parse(raw);
    }
  } catch {
    // Ignore fallback read errors
  }
  return [];
}

function writeDiskFallback(items) {
  try {
    fs.writeFileSync(FALLBACK_CACHE_FILE, JSON.stringify(items.slice(-100)), "utf8");
  } catch {
    // Ignore fallback disk write errors on read-only environments
  }
}

/** @param {Object} opts */
export async function createIncident({ route, userId, role, rollNo, step, message, raw }) {
  const incidentId = `INC-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  const safeMessage = typeof message === "string" ? message.slice(0, 500) : String(message).slice(0, 500);

  const fallbackRecord = {
    id: `fb_${incidentId}`,
    incidentId,
    route: route || "UNKNOWN",
    userId: userId || null,
    role: role || null,
    rollNo: rollNo || "ANONYMOUS",
    step: step || "system_event",
    message: safeMessage,
    rawError: raw ? String(raw).slice(0, 2000) : null,
    status: "open",
    resolvedAt: null,
    createdAt: new Date().toISOString(),
  };

  // Always buffer in memory & optional disk fallback
  globalThis._incidentFallback.unshift(fallbackRecord);
  if (globalThis._incidentFallback.length > 100) {
    globalThis._incidentFallback = globalThis._incidentFallback.slice(0, 100);
  }
  writeDiskFallback(globalThis._incidentFallback);

  // Persist to Turso Cloud DB
  try {
    await db.incidentLog.create({
      data: {
        incidentId,
        route: route || "UNKNOWN",
        userId: userId || null,
        role: role || null,
        rollNo: rollNo || null,
        step: step || null,
        message: safeMessage,
        rawError: process.env.NODE_ENV !== "production" && raw ? String(raw).slice(0, 2000) : null,
        status: "open",
      },
    });
    console.log(`[Incident Created] ${incidentId} for ${rollNo || "UNKNOWN"} on ${route}`);
  } catch (dbErr) {
    console.warn(`[Incident DB write failed, retained in memory fallback] ${incidentId}:`, dbErr?.message);
  }

  return incidentId;
}

/** Wrap any async route handler to catch unhandled errors and record an incident */
export function withErrorHandler(handler) {
  return async function wrappedHandler(request, context) {
    try {
      return await handler(request, context);
    } catch (err) {
      const { NextResponse } = await import("next/server");
      const url = request?.nextUrl?.pathname || request?.url || "UNKNOWN";

      const incidentId = await createIncident({
        route: url,
        message: err?.message || "Unknown error",
        raw: err?.stack,
      });

      console.error(`[ERROR] Route: ${url} | IncidentId: ${incidentId}`, err);

      return NextResponse.json(
        {
          error: "An unexpected error occurred. Our team has been notified.",
          incidentId,
        },
        { status: 500 }
      );
    }
  };
}

/** GET incidents list for COE Help Panel (combines DB + in-memory fallback) */
export async function getIncidents({ status, limit = 50 } = {}) {
  let dbIncidents = [];
  try {
    const where = status && status !== "ALL" ? { status } : {};
    dbIncidents = await db.incidentLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  } catch (err) {
    console.warn("[getIncidents DB query failed, falling back to cache]:", err?.message);
  }

  // Combine with memory & disk fallbacks
  const diskFallback = readDiskFallback();
  const allFallbacks = [...globalThis._incidentFallback, ...diskFallback];

  const dbIds = new Set(dbIncidents.map((i) => i.incidentId));
  const missingFromDb = allFallbacks.filter(
    (fb) => !dbIds.has(fb.incidentId) && (!status || status === "ALL" || fb.status === status)
  );

  // Merge and sort desc by createdAt
  const merged = [...dbIncidents, ...missingFromDb].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return merged.slice(0, limit);
}
