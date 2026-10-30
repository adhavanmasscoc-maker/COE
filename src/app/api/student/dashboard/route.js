import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/lib/db";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

// Helper to resolve real practice questions counts from DB or question files
function resolvePracticeCounts(subjectCode, dbItemCount) {
  const code = (subjectCode || "").toUpperCase();
  let countA = 0;
  let countB = 0;

  if (dbItemCount >= 100) {
    countA = 50;
    countB = dbItemCount - 50;
  } else if (dbItemCount > 0) {
    countA = dbItemCount;
    countB = 0;
  }

  // Check questions/exams JSON files if DB count is 0
  if (countA === 0) {
    const readCount = (fname) => {
      try {
        const fp = path.join(process.cwd(), "questions", "exams", fname);
        if (fs.existsSync(fp)) {
          const content = JSON.parse(fs.readFileSync(fp, "utf8"));
          if (Array.isArray(content.questions)) return content.questions.length;
          if (Array.isArray(content.set1)) return content.set1.length;
          if (Array.isArray(content.set2)) return content.set2.length;
        }
      } catch {}
      return 0;
    };

    if (code === "CHE-12") {
      countA = readCount("CHEMISTRY-12-50-SET1.json") || 50;
      countB = readCount("CHEMISTRY-12-50-SET2.json") || 50;
    } else if (code === "PHY-12") {
      countA = readCount("PHYSICS-12-50-SET1.json") || 50;
      countB = readCount("PHYSICS-12-50-SET2.json") || 50;
    } else if (code === "ENG-10") {
      countA = readCount("ENGLISH-10-50-SET1.json") || 50;
      countB = readCount("ENGLISH-10-50-SET2.json") || 50;
    } else if (code === "ENG-12") {
      countA = readCount("ENGLISH-12-50-SET1.json") || 50;
      countB = readCount("ENGLISH-12-50-SET2.json") || 50;
    } else if (code === "MAT-10") {
      countA = readCount("MATHEMATICS-10-14-SET1.json") || 14;
    } else if (code === "CSC-12") {
      countA = readCount("COMPUTER_SCIENCE-12-15-SET1.json") || 15;
    }
  }

  return {
    practiceA: { count: countA, enabled: countA > 0 },
    practiceB: { count: countB, enabled: countB > 0 },
  };
}

export async function GET(request) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required to view student dashboard. Please sign in." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const requestedPreviewRoll = searchParams.get("previewRollNo");

    let profile = null;
    const isAdmin = session.role === "ADMIN";

    // Data security: previewRollNo is ONLY honored for verified COE admin sessions
    if (isAdmin && requestedPreviewRoll) {
      profile = await db.studentProfile.findFirst({
        where: { user: { username: requestedPreviewRoll } },
        include: { user: { select: { id: true, username: true, role: true } } },
      });
      if (!profile) {
        profile = await db.studentProfile.findFirst({
          include: { user: { select: { id: true, username: true, role: true } } },
        });
      }
    } else if (isAdmin) {
      profile = await db.studentProfile.findFirst({
        include: { user: { select: { id: true, username: true, role: true } } },
      });
    } else {
      // Regular student: strictly query own database profile by authenticated session ID
      profile = await db.studentProfile.findUnique({
        where: { userId: session.userId },
        include: { user: { select: { id: true, username: true, role: true } } },
      });
    }

    // If student or prep standard cannot be resolved, return structured empty state
    if (!profile || !profile.examPrepClass) {
      return NextResponse.json(
        {
          success: true,
          serverNow: Date.now(),
          profile: null,
          subjects: [],
          upcomingExams: [],
          emptyReason: "UNRESOLVED_CURRICULUM",
        },
        {
          headers: { "Cache-Control": "private, no-store" },
        }
      );
    }

    // 1. Fetch student's assigned curriculum subjects
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

    const assignedSubjectIds = studentSubjects.map((ss) => ss.subject.id);
    const assignedCodes = new Set(studentSubjects.map((ss) => (ss.subject.code || "").toUpperCase()));

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
        nameEn: sub.nameEn || sub.name,
        nameTa: sub.nameTa || sub.name,
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

    // 3. Question Bank items count per subject
    const qbCounts = await db.questionBankItem.groupBy({
      by: ["subjectId"],
      _count: { id: true },
    });
    const qbCountMap = new Map(qbCounts.map((c) => [c.subjectId, c._count.id]));

    // 4. Strict Server-Side Data Isolation:
    // Only query exams matching profile.examPrepClass, status=PUBLISHED, and in assigned subjects
    const rawUpcomingExams = await db.examSchedule.findMany({
      where: {
        prepClass: profile.examPrepClass,
        status: "PUBLISHED",
        subjectId: { in: assignedSubjectIds },
      },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            nameEn: true,
            nameTa: true,
            code: true,
            prepClass: true,
          },
        },
      },
      orderBy: { examDate: "asc" },
    });

    // Zero-tolerance stream isolation filter
    const seniorKeywords = ["chemistry", "physics", "biology", "botany", "zoology", "computer science"];
    const validExams = rawUpcomingExams.filter((exam) => {
      if (exam.prepClass !== profile.examPrepClass) return false;
      const code = (exam.subject?.code || "").toUpperCase();
      const name = (exam.subject?.name || "").toLowerCase();

      // Class 10 student must NEVER receive -12 code or senior subjects
      if (profile.examPrepClass === 10) {
        if (code.endsWith("-12")) return false;
        if (seniorKeywords.some((k) => name.includes(k))) return false;
      }
      if (!assignedCodes.has(code)) return false;
      return true;
    });

    // Duplicate detection: If two rows have same subject code, standard, and start time, keep one
    const seenMap = new Map();
    const dedupedExams = [];
    for (const exam of validExams) {
      const key = `${exam.subject.code}_${exam.prepClass}_${new Date(exam.examDate).getTime()}`;
      if (seenMap.has(key)) {
        console.warn(`[COE Data-Health Warning]: Duplicate exam schedule detected: ${exam.subject.code} at ${exam.examDate}. Omitting duplicate examId: ${exam.id}`);
      } else {
        seenMap.set(key, exam);
        dedupedExams.push(exam);
      }
    }

    const examIds = dedupedExams.map((e) => e.id);
    const existingSubmissions = await db.examSubmission.findMany({
      where: {
        studentId: profile.id,
        examScheduleId: { in: examIds },
      },
      select: {
        examScheduleId: true,
        isSubmitted: true,
        submittedAt: true,
        score: true,
      },
    });
    const subMap = new Map(existingSubmissions.map((s) => [s.examScheduleId, s]));

    const existingResults = await db.examResult.findMany({
      where: {
        studentId: profile.id,
        examScheduleId: { in: examIds },
      },
      select: {
        examScheduleId: true,
        isPublished: true,
        marksObtained: true,
        maxMarks: true,
      },
    });
    const resMap = new Map(existingResults.map((r) => [r.examScheduleId, r]));

    const serverNow = Date.now();

    const enrichedUpcomingExams = dedupedExams.map((exam) => {
      const sub = subMap.get(exam.id);
      const res = resMap.get(exam.id);

      let isResultPublished = Boolean(res?.isPublished);
      let expectedPublishAt = null;

      if (sub?.isSubmitted && !isResultPublished) {
        if (exam.resultPublishDate) {
          expectedPublishAt = new Date(exam.resultPublishDate);
          if (serverNow >= expectedPublishAt.getTime()) {
            isResultPublished = true;
          }
        } else if (exam.resultPublishDelayMinutes && exam.resultPublishDelayMinutes > 0) {
          const subTime = new Date(sub.submittedAt).getTime();
          expectedPublishAt = new Date(subTime + exam.resultPublishDelayMinutes * 60 * 1000);
          if (serverNow >= expectedPublishAt.getTime()) {
            isResultPublished = true;
          }
        } else if (res) {
          isResultPublished = true;
        }
      }

      const remainingSeconds = expectedPublishAt
        ? Math.max(0, Math.round((expectedPublishAt.getTime() - serverNow) / 1000))
        : null;

      const qbItemCount = qbCountMap.get(exam.subjectId) || 0;
      const practice = resolvePracticeCounts(exam.subject.code, qbItemCount);

      // NO answer leaks: only necessary timetable fields
      return {
        id: exam.id,
        subject: exam.subject.name,
        subjectEn: exam.subject.nameEn || exam.subject.name,
        subjectTa: exam.subject.nameTa || exam.subject.name,
        code: exam.subject.code,
        prepClass: exam.prepClass,
        examDate: exam.examDate,
        durationMinutes: exam.durationMinutes,
        totalMarks: exam.totalMarks,
        instructions: exam.instructions,
        isSubmitted: Boolean(sub?.isSubmitted),
        submittedAt: sub?.submittedAt || null,
        isResultPublished,
        expectedPublishAt: expectedPublishAt ? expectedPublishAt.toISOString() : null,
        remainingSeconds,
        score: isResultPublished ? (res?.marksObtained ?? sub?.score ?? null) : null,
        practiceA: practice.practiceA,
        practiceB: practice.practiceB,
      };
    });

    // 5. Fetch applicable notices with updated proctoring protocol wording
    const notices = await db.notice.findMany({
      where: {
        isPublished: true,
        OR: [{ targetPrepClass: null }, { targetPrepClass: profile.examPrepClass }],
      },
      orderBy: { createdAt: "desc" },
      take: 3,
    });

    // Reword proctoring notice last sentence to: "Desktop attendance or leaving the exam window will be flagged for COE review."
    const sanitizedNotices = notices.map((n) => {
      let content = n.content || "";
      if (content.includes("result in automated disqualification")) {
        content = content.replace(
          "Desktop attendance or leaving the exam window will result in automated disqualification.",
          "Desktop attendance or leaving the exam window will be flagged for COE review."
        );
      }
      return {
        id: n.id,
        title: n.title,
        content,
        createdAt: n.createdAt,
      };
    });

    return NextResponse.json(
      {
        success: true,
        serverNow,
        isPreview: isAdmin && Boolean(requestedPreviewRoll),
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
        upcomingExams: enrichedUpcomingExams,
        notices: sanitizedNotices,
      },
      {
        headers: { "Cache-Control": "private, no-store" },
      }
    );
  } catch (error) {
    console.error("Student dashboard API error:", error);
    return NextResponse.json(
      { error: "Internal server error loading student dashboard." },
      { status: 500, headers: { "Cache-Control": "private, no-store" } }
    );
  }
}
