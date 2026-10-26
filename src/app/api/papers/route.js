import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const targetPrepClass =
      session.role === "ADMIN"
        ? parseInt(searchParams.get("prepClass") || "10", 10)
        : session.examPrepClass;

    const subjectId = searchParams.get("subjectId");

    const whereClause = {
      prepClass: targetPrepClass,
    };

    if (subjectId) {
      whereClause.subjectId = subjectId;
    }

    // Students can ONLY see published papers
    if (session.role === "STUDENT") {
      whereClause.isPublished = true;
    }

    const papers = await db.questionPaper.findMany({
      where: whereClause,
      include: {
        subject: { select: { id: true, name: true, code: true, prepClass: true } },
        solution: true,
      },
      orderBy: [{ examYear: "desc" }, { createdAt: "desc" }],
    });

    // If student, filter out unpublished solutions
    const formattedPapers = papers.map((p) => {
      let visibleSolution = null;
      if (p.solution) {
        if (session.role === "ADMIN" || p.solution.isPublished) {
          visibleSolution = p.solution;
        }
      }

      return {
        id: p.id,
        title: p.title,
        examYear: p.examYear,
        prepClass: p.prepClass,
        board: p.board,
        sourceInfo: p.sourceInfo,
        paperType: p.paperType,
        maxMarks: p.maxMarks,
        durationMinutes: p.durationMinutes,
        filePathOrUrl: p.filePathOrUrl,
        isPublished: p.isPublished,
        subject: p.subject,
        hasSolution: Boolean(p.solution),
        isSolutionPublished: Boolean(p.solution?.isPublished),
        solution: visibleSolution,
      };
    });

    return NextResponse.json({
      success: true,
      prepClass: targetPrepClass,
      role: session.role,
      papers: formattedPapers,
    });
  } catch (error) {
    console.error("Papers API error:", error);
    return NextResponse.json(
      { error: "Internal server error fetching question papers." },
      { status: 500 }
    );
  }
}
