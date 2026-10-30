import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const session = await getCurrentSession();
    const { searchParams } = new URL(request.url);
    const previewRollNo = searchParams.get("previewRollNo");

    if (!session && !previewRollNo) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    let defaultClass = 10;
    let studentProfileId = null;

    if (previewRollNo) {
      const p = await db.studentProfile.findFirst({
        where: { user: { username: previewRollNo } },
      });
      if (p) {
        defaultClass = p.examPrepClass || 10;
        studentProfileId = p.id;
      } else {
        const is12th = /1[12]\d{2}/.test(previewRollNo);
        defaultClass = is12th ? 12 : 10;
      }
    } else if (session) {
      defaultClass = session.examPrepClass || (session.role === "ADMIN" ? 10 : 10);
      studentProfileId = session.profileId || null;
    }

    const requestedClass = searchParams.get("prepClass");
    const targetPrepClass = requestedClass ? parseInt(requestedClass, 10) : defaultClass;

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
    const activeStudentId = studentProfileId || (session?.role === "STUDENT" ? session.profileId : null);
    if (activeStudentId) {
      const progressRecords = await db.chapterProgress.findMany({
        where: {
          studentId: activeStudentId,
          isCompleted: true,
        },
        select: { chapterId: true },
      });
      completedChapterIds = new Set(progressRecords.map((p) => p.chapterId));
    }

    // 2b. Fetch QuestionBank counts per subject
    const qbGroup = await db.questionBankItem.groupBy({
      by: ["subjectId"],
      _count: { id: true },
    }).catch(() => []);
    const qbCounts = new Map(qbGroup.map((g) => [g.subjectId, g._count.id]));

    // 3. Format response with completion status
    const formattedSubjects = subjects.map((sub) => {
      let subChaptersCount = 0;
      let subCompletedCount = 0;

      const qbCount = qbCounts.get(sub.id) || (sub.code === "CHE-12" ? 100 : 0);

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
        questionBankCount: qbCount,
        units,
      };
    });

    return NextResponse.json({
      success: true,
      prepClass: targetPrepClass,
      role: session?.role || "STUDENT",
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
