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

    // Official Tamil Nadu Board Curriculum Priority Ordering
    const SUBJECT_PRIORITY = [
      // Class 10
      "TAM-10", "ENG-10", "MAT-10", "SCI-10", "SOC-10",
      // Class 12 Priority: Languages -> Math & Science -> Commerce & Humanities
      "TAM-12", "ENG-12", "MAT-12", "PHY-12", "CHE-12", "CSC-12", "CS-12", "BIO-12", "BOT-12", "ZOO-12",
      "ACC-12", "COM-12", "ECO-12", "BMS-12", "CA-12", "HIS-12", "GEO-12", "POL-12",
      // Class 11 Priority
      "TAM-11", "ENG-11", "MAT-11", "PHY-11", "CHE-11", "CS-11", "BIO-11", "ACC-11", "COM-11", "ECO-11",
      // Class 9
      "TAM-09", "ENG-09", "MAT-09", "SCI-09", "SOC-09"
    ];

    // Tag streams and apply curriculum order
    const enriched = subjects.map((s) => {
      let stream = "Core";
      if (s.prepClass === 12 || s.prepClass === 11) {
        if (["PHY-12", "CHE-12", "BIO-12", "CS-12", "CSC-12", "BOT-12", "ZOO-12", "MAT-12"].includes(s.code)) {
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
    }).sort((a, b) => {
      if (a.prepClass !== b.prepClass) return a.prepClass - b.prepClass;
      const idxA = SUBJECT_PRIORITY.indexOf(a.code);
      const idxB = SUBJECT_PRIORITY.indexOf(b.code);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.name.localeCompare(b.name);
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
