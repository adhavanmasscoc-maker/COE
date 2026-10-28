import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 1. Fetch Students with Profiles and Assigned Subjects
    const students = await db.studentProfile.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            role: true,
            createdAt: true,
            // Notice: passwordHash is deliberately omitted or masked for security!
          },
        },
        subjects: {
          include: {
            subject: {
              select: {
                id: true,
                name: true,
                code: true,
                prepClass: true,
                medium: true,
              },
            },
          },
        },
      },
    });

    // 2. Fetch Syllabus Units and Chapters Count
    const subjects = await db.subject.findMany({
      include: {
        units: {
          include: {
            chapters: true,
          },
        },
      },
    });

    // 3. Fetch Question Papers and Solutions
    const questionPapers = await db.questionPaper.findMany({
      include: {
        solution: true,
        subject: {
          select: { name: true, code: true, prepClass: true },
        },
      },
    });

    // 4. Fetch Exam Schedules
    const schedules = await db.examSchedule.findMany({
      include: {
        subject: {
          select: { name: true, code: true },
        },
      },
    });

    // 5. Fetch Notices
    const notices = await db.notice.findMany();

    // 6. Security & Data Isolation Audit Verification
    const studentA = students.find((s) => s.currentClass === 9);
    const studentB = students.find((s) => s.currentClass === 11);

    const isolationVerified =
      studentA &&
      studentB &&
      studentA.examPrepClass === 10 &&
      studentB.examPrepClass === 12 &&
      studentA.subjects.every((s) => s.subject.prepClass === 10) &&
      studentB.subjects.every((s) => s.subject.prepClass === 12);

    return NextResponse.json({
      status: "success",
      database: "SQLite (dev.db)",
      dataIsolation: {
        status: isolationVerified ? "VERIFIED_ISOLATED" : "CHECK_FAILED",
        studentA: {
          name: studentA?.fullName,
          rollNo: studentA?.user?.username,
          currentSchoolClass: studentA?.currentClass,
          examPrepClass: studentA?.examPrepClass,
          assignedSubjectsCount: studentA?.subjects.length,
          subjects: studentA?.subjects.map((s) => `${s.subject.name} (${s.subject.code})`),
        },
        studentB: {
          name: studentB?.fullName,
          rollNo: studentB?.user?.username,
          currentSchoolClass: studentB?.currentClass,
          examPrepClass: studentB?.examPrepClass,
          assignedSubjectsCount: studentB?.subjects.length,
          subjects: studentB?.subjects.map((s) => `${s.subject.name} (${s.subject.code})`),
        },
      },
      counts: {
        students: students.length,
        subjects: subjects.length,
        questionPapers: questionPapers.length,
        workedSolutions: questionPapers.filter((q) => q.solution).length,
        schedules: schedules.length,
        notices: notices.length,
      },
      schedulesSummary: schedules.map((sc) => ({
        subject: sc.subject.name,
        prepClass: sc.prepClass,
        date: sc.examDate,
        status: sc.status,
      })),
    });
  } catch (error) {
    console.error("Database health check error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: error.message,
        hint: "Run 'npm run db:push' and 'npm run db:seed' to initialize the SQLite database.",
      },
      { status: 500 }
    );
  }
}
