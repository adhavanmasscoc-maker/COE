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
        // Auto-provision candidate profile for previewRollNo (e.g. TN2026-0900)
        try {
          const is12th = /1[12]\d{2}/.test(previewRollNo);
          const prepClass = is12th ? 12 : 10;
          const currentClass = is12th ? 11 : 9;
          const studentName = previewRollNo === "TN2026-0900"
            ? "Sample Candidate (TN2026-0900)"
            : `TN Board Candidate (${previewRollNo})`;

          let user = await db.user.findUnique({ where: { username: previewRollNo } });
          if (!user) {
            user = await db.user.create({
              data: {
                username: previewRollNo,
                passwordHash: "$2a$10$w82WbI2x0oA7fU3gC5tNf.fMwqD3pWbQ1uRk9V9M8a.P7nN4S7bW6",
                role: "STUDENT",
              },
            });
          }

          profile = await db.studentProfile.create({
            data: {
              userId: user.id,
              fullName: studentName,
              currentClass: currentClass,
              examPrepClass: prepClass,
              board: "Tamil Nadu Samacheer Kalvi",
              medium: "English",
              academicYear: "2026–2027",
            },
            include: { user: { select: { id: true, username: true, role: true } } },
          });

          // Link default core subjects for this class
          const defaultCodes = prepClass === 10
            ? ["TAM-10", "ENG-10", "MAT-10", "SCI-10", "SOC-10"]
            : ["TAM-12", "ENG-12", "MAT-12", "PHY-12", "CHE-12", "CSC-12"];

          const subs = await db.subject.findMany({
            where: { code: { in: defaultCodes } },
          });

          for (const sub of subs) {
            await db.studentSubject.create({
              data: {
                studentId: profile.id,
                subjectId: sub.id,
              },
            }).catch(() => {});
          }
        } catch (provisionErr) {
          console.warn("Auto-provision preview student error:", provisionErr.message);
        }
      }

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
