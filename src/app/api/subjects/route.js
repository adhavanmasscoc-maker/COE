import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const prepClassParam = searchParams.get("prepClass");

    let whereClause = {};
    if (prepClassParam && prepClassParam !== "ALL") {
      const clsNum = parseInt(prepClassParam, 10);
      if (!isNaN(clsNum)) {
        whereClause.prepClass = clsNum;
      }
    }

    const subjects = await db.subject.findMany({
      where: whereClause,
      include: {
        _count: {
          select: { units: true, examSchedules: true, questionPapers: true },
        },
      },
      orderBy: [{ prepClass: "asc" }, { code: "asc" }],
    });

    // Tag streams for better UI filtering
    const enriched = subjects.map((s) => {
      let stream = "Core";
      if (s.prepClass === 12 || s.prepClass === 11) {
        if (["PHY-12", "CHE-12", "BIO-12", "CS-12", "BOT-12", "ZOO-12", "MAT-12"].includes(s.code)) {
          stream = "Science";
        } else if (["ACC-12", "COM-12", "ECO-12", "BMS-12", "CA-12", "HIS-12", "GEO-12", "POL-12"].includes(s.code)) {
          stream = "Commerce / Arts";
        } else {
          stream = "Language";
        }
      }
      return {
        ...s,
        stream,
      };
    });

    return NextResponse.json({
      success: true,
      count: enriched.length,
      subjects: enriched,
    });
  } catch (error) {
    console.error("[Subjects API Error]", error);
    return NextResponse.json(
      { error: "Failed to fetch subjects from SQLite." },
      { status: 500 }
    );
  }
}
