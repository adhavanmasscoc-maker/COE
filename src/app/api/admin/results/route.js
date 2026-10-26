import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// Helper to determine Grade from percentage
function calculateGrade(percentage) {
  if (percentage >= 90) return { grade: "A+", label: "Outstanding" };
  if (percentage >= 80) return { grade: "A", label: "Excellent" };
  if (percentage >= 70) return { grade: "B+", label: "Very Good" };
  if (percentage >= 60) return { grade: "B", label: "Good" };
  if (percentage >= 50) return { grade: "C", label: "Satisfactory" };
  if (percentage >= 35) return { grade: "D", label: "Pass" };
  return { grade: "E", label: "Needs Improvement" };
}

// GET /api/admin/results: List exams, candidates, their submissions, and entered marks
export async function GET(request) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "COE Admin authorization required." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const prepClassParam = searchParams.get("prepClass");

    const whereClause = {};
    if (prepClassParam) {
      whereClause.prepClass = parseInt(prepClassParam, 10);
    }

    // 1. Fetch all exams matching class filter
    const exams = await db.examSchedule.findMany({
      where: whereClause,
      include: {
        subject: { select: { id: true, name: true, code: true, prepClass: true } },
        submissions: {
          include: {
            student: {
              include: { user: { select: { username: true } } },
            },
          },
        },
        results: {
          include: {
            student: {
              include: { user: { select: { username: true } } },
            },
          },
        },
      },
      orderBy: { examDate: "desc" },
    });

    // 2. Fetch all student profiles to identify candidates eligible for each exam
    const allStudents = await db.studentProfile.findMany({
      include: {
        user: { select: { username: true } },
      },
    });

    // Structure data for the admin marks entry table
    const structuredExams = exams.map((exam) => {
      // Eligible candidates are students whose examPrepClass matches exam.prepClass
      const eligibleStudents = allStudents.filter((s) => s.examPrepClass === exam.prepClass);

      const candidates = eligibleStudents.map((student) => {
        const submission = exam.submissions.find((sub) => sub.studentId === student.id);
        const result = exam.results.find((res) => res.studentId === student.id);

        let percentage = null;
        let gradeInfo = null;
        if (result) {
          percentage = Math.round((result.marksObtained / result.maxMarks) * 100);
          gradeInfo = calculateGrade(percentage);
        }

        return {
          studentId: student.id,
          fullName: student.fullName,
          rollNo: student.user.username,
          currentClass: student.currentClass,
          prepClass: student.examPrepClass,
          submission: submission
            ? {
                id: submission.id,
                timeTakenSecs: submission.timeTakenSecs,
                score: submission.score,
                isSubmitted: submission.isSubmitted,
                submittedAt: submission.submittedAt,
              }
            : null,
          result: result
            ? {
                id: result.id,
                marksObtained: result.marksObtained,
                maxMarks: result.maxMarks,
                percentage,
                grade: gradeInfo.grade,
                gradeLabel: gradeInfo.label,
                remarks: result.remarks,
                isPublished: result.isPublished,
                createdAt: result.createdAt,
              }
            : null,
        };
      });

      return {
        id: exam.id,
        subject: exam.subject.name,
        code: exam.subject.code,
        prepClass: exam.prepClass,
        examDate: exam.examDate,
        totalMarks: exam.totalMarks,
        durationMinutes: exam.durationMinutes,
        status: exam.status,
        candidates,
      };
    });

    return NextResponse.json({ success: true, exams: structuredExams });
  } catch (error) {
    console.error("Admin results GET error:", error);
    return NextResponse.json({ error: "Internal server error fetching results." }, { status: 500 });
  }
}

// POST /api/admin/results: Record or update marks for a student
export async function POST(request) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "COE Admin authorization required." }, { status: 403 });
    }

    const body = await request.json();
    const { examScheduleId, studentId, marksObtained, maxMarks, remarks, isPublished } = body;

    if (!examScheduleId || !studentId || marksObtained === undefined || maxMarks === undefined) {
      return NextResponse.json(
        { error: "Exam ID, Student ID, marks obtained, and max marks are required." },
        { status: 400 }
      );
    }

    const scored = parseFloat(marksObtained);
    const max = parseFloat(maxMarks);

    if (scored < 0 || scored > max) {
      return NextResponse.json(
        { error: `Marks obtained (${scored}) must be between 0 and maximum marks (${max}).` },
        { status: 400 }
      );
    }

    // Upsert the exam result in SQLite
    const result = await db.examResult.upsert({
      where: {
        examScheduleId_studentId: {
          examScheduleId,
          studentId,
        },
      },
      create: {
        examScheduleId,
        studentId,
        marksObtained: scored,
        maxMarks: max,
        remarks: remarks || null,
        isPublished: isPublished !== undefined ? Boolean(isPublished) : false,
      },
      update: {
        marksObtained: scored,
        maxMarks: max,
        remarks: remarks || null,
        isPublished: isPublished !== undefined ? Boolean(isPublished) : false,
      },
    });

    const percentage = Math.round((result.marksObtained / result.maxMarks) * 100);
    const gradeInfo = calculateGrade(percentage);

    return NextResponse.json({
      success: true,
      result: {
        ...result,
        percentage,
        grade: gradeInfo.grade,
        gradeLabel: gradeInfo.label,
      },
    });
  } catch (error) {
    console.error("Admin results POST error:", error);
    return NextResponse.json({ error: "Failed to save marks in database." }, { status: 500 });
  }
}
