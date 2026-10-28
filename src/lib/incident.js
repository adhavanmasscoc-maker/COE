/**
 * Incident Management
 * Creates, saves, and retrieves incidents from SQLite.
 * Safe message + incidentId returned to client; no stack traces in production.
 */
import { db } from "@/lib/db";

/** @param {Object} opts */
export async function createIncident({ route, userId, role, rollNo, step, message, raw }) {
  const incidentId = `INC-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  const safeMessage = typeof message === "string" ? message.slice(0, 500) : String(message).slice(0, 500);

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
  } catch (dbErr) {
    // If DB write fails, still return the incidentId so the caller can return it to the client
    console.error("[Incident DB write failed]", dbErr?.message);
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

/** GET incidents list for COE Help Panel */
export async function getIncidents({ status, limit = 50 } = {}) {
  const where = status ? { status } : {};
  return db.incidentLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
