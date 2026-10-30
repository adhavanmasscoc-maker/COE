import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getOrRestoreStudentProfile } from "@/lib/studentProfileHelper";

export const dynamic = "force-dynamic";

function calculateGrade(percentage) {
  if (percentage >= 90) return { grade: "A+", label: "Outstanding", gpa: 10 };
  if (percentage >= 80) return { grade: "A", label: "Excellent", gpa: 9 };
  if (percentage >= 70) return { grade: "B+", label: "Very Good", gpa: 8 };
  if (percentage >= 60) return { grade: "B", label: "Good", gpa: 7 };
  if (percentage >= 50) return { grade: "C", label: "Satisfactory", gpa: 6 };
  if (percentage >= 35) return { grade: "D", label: "Pass", gpa: 5 };
  return { grade: "E", label: "Needs Improvement", gpa: 0 };
}

// GET /api/student/results: Fetch published performance statement
export async function GET(request) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required to view examination results." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const previewRollNo = searchParams.get("previewRollNo");

    const studentProfile = await getOrRestoreStudentProfile(session, previewRollNo);

    if (!studentProfile) {
      return NextResponse.json({ error: "Student profile not found." }, { status: 404 });
    }

    // Strict server isolation: fetch ONLY published results for this student
    const results = await db.examResult.findMany({
      where: {
        studentId: studentProfile.id,
        isPublished: true,
      },
      include: {
        examSchedule: {
          include: {
            subject: { select: { name: true, code: true, prepClass: true, medium: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    let totalMarksObtained = 0;
    let totalMaxMarks = 0;
    let highestScoringSubject = null;
    let maxScoredPercent = -1;

    const formattedResults = results.map((res) => {
      const percentage = Math.round((res.marksObtained / res.maxMarks) * 100);
      const gradeInfo = calculateGrade(percentage);

      totalMarksObtained += res.marksObtained;
      totalMaxMarks += res.maxMarks;

      if (percentage > maxScoredPercent) {
        maxScoredPercent = percentage;
        highestScoringSubject = res.examSchedule.subject.name;
      }

      return {
        id: res.id,
        examId: res.examScheduleId,
        subject: res.examSchedule.subject.name,
        code: res.examSchedule.subject.code,
        medium: res.examSchedule.subject.medium,
        prepClass: res.examSchedule.prepClass,
        examDate: res.examSchedule.examDate,
        marksObtained: res.marksObtained,
        maxMarks: res.maxMarks,
        percentage,
        grade: gradeInfo.grade,
        gradeLabel: gradeInfo.label,
        remarks: res.remarks,
        publishedAt: res.createdAt,
      };
    });

    const overallPercentage =
      totalMaxMarks > 0 ? Math.round((totalMarksObtained / totalMaxMarks) * 100) : 0;
    const overallGrade = calculateGrade(overallPercentage);

    return NextResponse.json({
      success: true,
      candidate: {
        fullName: studentProfile.fullName,
        rollNo: studentProfile.user.username,
        currentClass: studentProfile.currentClass,
        examPrepClass: studentProfile.examPrepClass,
        board: studentProfile.board,
        medium: studentProfile.medium,
        academicYear: studentProfile.academicYear,
      },
      analytics: {
        totalEvaluated: formattedResults.length,
        totalMarksObtained,
        totalMaxMarks,
        overallPercentage,
        overallGrade: overallGrade.grade,
        overallClassification: overallGrade.label,
        highestScoringSubject: highestScoringSubject || "N/A",
      },
      results: formattedResults,
    });
  } catch (error) {
    console.error("Student results GET error:", error);
    return NextResponse.json({ error: "Internal server error fetching results." }, { status: 500 });
  }
}
