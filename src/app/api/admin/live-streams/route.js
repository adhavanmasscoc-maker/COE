import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getAllActiveStreams } from "@/lib/liveStreamStore";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/live-streams
 * Fetches all active student live screen streams and their current heartbeats
 */
export async function GET(request) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "COE Admin authorization required." }, { status: 403 });
    }

    const streams = getAllActiveStreams();

    // Also fetch latest heartbeats within last 15 minutes
    const cutoff = new Date(Date.now() - 15 * 60 * 1000);
    const activeHeartbeats = await db.examHeartbeat.findMany({
      where: {
        createdAt: { gte: cutoff },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        examSchedule: {
          include: {
            subject: { select: { name: true, code: true } },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      streams,
      heartbeats: activeHeartbeats,
      serverTime: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[Live streams GET error]", err);
    return NextResponse.json({ error: "Failed to load live screen streams." }, { status: 500 });
  }
}
