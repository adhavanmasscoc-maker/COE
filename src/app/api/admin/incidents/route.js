import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getIncidents } from "@/lib/incident";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/incidents
 * Lists incident records for the COE Help Panel.
 * Query params: ?status=open|acknowledged|resolved  ?limit=N
 */
export async function GET(request) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "COE Admin authorization required." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const limit = parseInt(searchParams.get("limit") || "100", 10);

    const incidents = await getIncidents({ status, limit });

    // Also pull recent missed heartbeats (last 30 minutes)
    const cutoff = new Date(Date.now() - 30 * 60 * 1000);
    const heartbeatWarnings = await db.examHeartbeat.findMany({
      where: {
        status: { in: ["warning", "missed"] },
        createdAt: { gte: cutoff },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({
      success: true,
      total: incidents.length,
      incidents,
      heartbeatWarnings,
    });
  } catch (err) {
    console.error("[Admin incidents GET error]", err);
    return NextResponse.json({ error: "Failed to load incidents." }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/incidents
 * Update incident status: { incidentId, status: "acknowledged"|"resolved" }
 */
export async function PATCH(request) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "COE Admin authorization required." }, { status: 403 });
    }

    const body = await request.json();
    const { incidentId, status } = body;

    if (!incidentId || !["acknowledged", "resolved"].includes(status)) {
      return NextResponse.json({ error: "incidentId and valid status required." }, { status: 400 });
    }

    const updated = await db.incidentLog.update({
      where: { incidentId },
      data: {
        status,
        resolvedAt: status === "resolved" ? new Date() : undefined,
      },
    });

    return NextResponse.json({ success: true, incident: updated });
  } catch (err) {
    console.error("[Admin incidents PATCH error]", err);
    return NextResponse.json({ error: "Failed to update incident." }, { status: 500 });
  }
}
