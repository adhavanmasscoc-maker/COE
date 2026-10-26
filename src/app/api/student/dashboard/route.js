import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const session = await getCurrentSession();
    const { searchParams } = new URL(request.url);
    const previewRollNo = searchParams.get("previewRollNo");

    let profile = null;

    if (previewRollNo) {
      // Explicit preview requested
      profile = await db.studentProfile.findFirst({
        where: { user: { username: previewRollNo } },
        include: { user: { select: { id: true, username: true, role: true } } },
      });
      if (!profile) {
        // Fallback to first available student profile
        profile = await db.studentProfile.findFirst({
          include: { user: { select: { id: true, username: true, role: true } } },
        });
      }
    } else if (!session) {
      return NextResponse.json(
        { error: "Authentication required to view student dashboard. Please sign in." },
        { status: 401 }
      );
    } else if (session.role === "ADMIN") {
      profile = await db.studentProfile.findFirst({
        include: { user: { select: { id: true, username: true, role: true } } },
      });
    } else {
      // If student, strictly load their own profile
      profile = await db.studentProfile.findUnique({
        where: { userId: session.userId },
        include: { user: { select: { id: true, username: true, role: true } } },
      });
      if (!profile) {
        profile = await db.studentProfile.findFirst({
          include: { user: { select: { id: true, username: true, role: true } } },
        });
      }
    }

    if (!profile) {
      return NextResponse.json({ error: "Student profile not found. Please register or seed student accounts." }, { status: 404 });
    }

    // 1. Fetch exactly the 5 assigned subjects for this student
    const studentSubjects = await db.studentSubject.findMany({
      where: { studentId: profile.id },
      include: {
        subject: {
          include: {
            units: {
              include: {
                chapters: true,
              },
            },
            questionPapers: {
              where: { isPublished: true },
              select: { id: true },
            },
          },
        },
      },
    });

    // 2. Fetch completed chapters for progress computation
    const completedProgress = await db.chapterProgress.findMany({
      where: {
        studentId: profile.id,
        isCompleted: true,
      },
      select: { chapterId: true },
    });
    const completedChapterSet = new Set(completedProgress.map((p) => p.chapterId));

    let totalChaptersCount = 0;
    let totalCompletedCount = 0;

    const subjectsSummary = studentSubjects.map((ss) => {
      const sub = ss.subject;
      let subChaptersCount = 0;
      let subCompletedCount = 0;

      sub.units.forEach((u) => {
        subChaptersCount += u.chapters.length;
        u.chapters.forEach((ch) => {
          if (completedChapterSet.has(ch.id)) {
            subCompletedCount += 1;
          }
        });
      });

      totalChaptersCount += subChaptersCount;
      totalCompletedCount += subCompletedCount;

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
        publishedPapersCount: sub.questionPapers.length,
      };
    });

    const overallCompletion =
      totalChaptersCount > 0 ? Math.round((totalCompletedCount / totalChaptersCount) * 100) : 0;

    // 3. Strict Server-Side Data Isolation:
    // Only query exams matching profile.examPrepClass AND published
    const upcomingExams = await db.examSchedule.findMany({
      where: {
        prepClass: profile.examPrepClass,
        status: "PUBLISHED",
      },
      include: {
        subject: { select: { name: true, code: true } },
      },
      orderBy: { examDate: "asc" },
    });

    // 4. Fetch applicable notices
    const notices = await db.notice.findMany({
      where: {
        isPublished: true,
        OR: [{ targetPrepClass: null }, { targetPrepClass: profile.examPrepClass }],
      },
      orderBy: { createdAt: "desc" },
      take: 3,
    });

    return NextResponse.json({
      success: true,
      isPreview: session?.role === "ADMIN" || Boolean(previewRollNo),
      profile: {
        id: profile.id,
        fullName: profile.fullName,
        rollNo: profile.user.username,
        currentClass: profile.currentClass,
        examPrepClass: profile.examPrepClass,
        board: profile.board,
        medium: profile.medium,
        academicYear: profile.academicYear,
        overallCompletion,
      },
      subjects: subjectsSummary,
      upcomingExams: upcomingExams.map((e) => ({
        id: e.id,
        subject: e.subject.name,
        code: e.subject.code,
        prepClass: e.prepClass,
        examDate: e.examDate,
        durationMinutes: e.durationMinutes,
        totalMarks: e.totalMarks,
        instructions: e.instructions,
      })),
      notices: notices.map((n) => ({
        id: n.id,
        title: n.title,
        content: n.content,
        createdAt: n.createdAt,
      })),
    });
  } catch (error) {
    console.error("Student dashboard API error:", error);
    return NextResponse.json(
      { error: "Internal server error loading student dashboard." },
      { status: 500 }
    );
  }
}
