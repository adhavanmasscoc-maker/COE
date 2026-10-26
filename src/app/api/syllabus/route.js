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

    // 1. Fetch subjects matching the target preparation standard
    const subjects = await db.subject.findMany({
      where: { prepClass: targetPrepClass },
      include: {
        units: {
          orderBy: { unitNumber: "asc" },
          include: {
            chapters: {
              orderBy: { chapterNumber: "asc" },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    // 2. If student, fetch their completion records
    let completedChapterIds = new Set();
    if (session.role === "STUDENT" && session.profileId) {
      const progressRecords = await db.chapterProgress.findMany({
        where: {
          studentId: session.profileId,
          isCompleted: true,
        },
        select: { chapterId: true },
      });
      completedChapterIds = new Set(progressRecords.map((p) => p.chapterId));
    }

    // 3. Format response with completion status
    const formattedSubjects = subjects.map((sub) => {
      let subChaptersCount = 0;
      let subCompletedCount = 0;

      const units = sub.units.map((unit) => {
        const chapters = unit.chapters.map((ch) => {
          subChaptersCount += 1;
          const isDone = completedChapterIds.has(ch.id);
          if (isDone) subCompletedCount += 1;
          return {
            id: ch.id,
            chapterNumber: ch.chapterNumber,
            title: ch.title,
            description: ch.description,
            isCompleted: isDone,
          };
        });

        return {
          id: unit.id,
          unitNumber: unit.unitNumber,
          title: unit.title,
          chapters,
        };
      });

      const progressPercent =
        subChaptersCount > 0 ? Math.round((subCompletedCount / subChaptersCount) * 100) : 0;

      return {
        id: sub.id,
        name: sub.name,
        code: sub.code,
        prepClass: sub.prepClass,
        medium: sub.medium,
        totalChapters: subChaptersCount,
        completedChapters: subCompletedCount,
        progressPercent,
        units,
      };
    });

    return NextResponse.json({
      success: true,
      prepClass: targetPrepClass,
      role: session.role,
      subjects: formattedSubjects,
    });
  } catch (error) {
    console.error("Syllabus API error:", error);
    return NextResponse.json(
      { error: "Internal server error fetching syllabus." },
      { status: 500 }
    );
  }
}
