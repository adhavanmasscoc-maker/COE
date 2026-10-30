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

// GET /api/student/results: Fetch published statement of marks and list scheduled / pending result releases
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

    const now = Date.now();

    // 1. Fetch all submissions by this student
    const submissions = await db.examSubmission.findMany({
      where: {
        studentId: studentProfile.id,
        isSubmitted: true,
      },
      include: {
        examSchedule: {
          include: {
            subject: { select: { id: true, name: true, code: true, prepClass: true, medium: true } },
          },
        },
      },
      orderBy: { submittedAt: "desc" },
    });

    // 2. Fetch all ExamResult records for this student
    const existingResults = await db.examResult.findMany({
      where: { studentId: studentProfile.id },
    });
    const resultMap = new Map(existingResults.map((r) => [r.examScheduleId, r]));

    const formattedResults = [];
    const pendingResults = [];

    let totalMarksObtained = 0;
    let totalMaxMarks = 0;
    let highestScoringSubject = null;
    let maxScoredPercent = -1;

    for (const sub of submissions) {
      const exam = sub.examSchedule;
      const res = resultMap.get(exam.id);

      // Evaluate result publication rules
      let isReleased = Boolean(res?.isPublished);
      let expectedPublishAt = null;

      if (!isReleased) {
        if (exam.resultPublishDate) {
          expectedPublishAt = new Date(exam.resultPublishDate);
          if (now >= expectedPublishAt.getTime()) {
            isReleased = true;
          }
        } else if (exam.resultPublishDelayMinutes && exam.resultPublishDelayMinutes > 0) {
          const subTime = new Date(sub.submittedAt).getTime();
          expectedPublishAt = new Date(subTime + exam.resultPublishDelayMinutes * 60 * 1000);
          if (now >= expectedPublishAt.getTime()) {
            isReleased = true;
          }
        }
      }

      // If condition has arrived, auto-update isPublished to true in DB
      if (isReleased && res && !res.isPublished) {
        await db.examResult.update({
          where: { id: res.id },
          data: { isPublished: true },
        }).catch(() => {});
      }

      if (isReleased) {
        const marksObtained = res ? res.marksObtained : (sub.score || 0);
        const maxMarks = res ? res.maxMarks : (exam.totalMarks || 25);
        const percentage = maxMarks > 0 ? Math.round((marksObtained / maxMarks) * 100) : 0;
        const gradeInfo = calculateGrade(percentage);

        totalMarksObtained += marksObtained;
        totalMaxMarks += maxMarks;

        if (percentage > maxScoredPercent) {
          maxScoredPercent = percentage;
          highestScoringSubject = exam.subject?.name || "Official Examination";
        }

        formattedResults.push({
          id: res?.id || sub.id,
          submissionId: sub.id,
          examId: exam.id,
          subject: exam.subject?.name || "Official Examination",
          code: exam.subject?.code || "EXAM",
          medium: exam.subject?.medium || "English",
          prepClass: exam.prepClass,
          examDate: exam.examDate,
          marksObtained,
          maxMarks,
          percentage,
          grade: gradeInfo.grade,
          gradeLabel: gradeInfo.label,
          remarks: res?.remarks || (percentage >= 40 ? "Passed Examination" : "Candidate Appeared"),
          publishedAt: res?.createdAt || sub.submittedAt,
        });
      } else {
        // Pending release: do NOT expose score yet to prevent early leaks
        const remainingSeconds = expectedPublishAt
          ? Math.max(0, Math.round((expectedPublishAt.getTime() - now) / 1000))
          : null;

        pendingResults.push({
          examId: exam.id,
          submissionId: sub.id,
          subject: exam.subject?.name || "Official Examination",
          code: exam.subject?.code || "EXAM",
          prepClass: exam.prepClass,
          submittedAt: sub.submittedAt,
          expectedPublishAt: expectedPublishAt ? expectedPublishAt.toISOString() : null,
          remainingSeconds,
          statusMessage: expectedPublishAt
            ? `Result scheduled for release at ${expectedPublishAt.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true })}`
            : "Under private evaluation by the Controller of Examinations",
        });
      }
    }

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
      pendingResults,
    });
  } catch (error) {
    console.error("Student results GET error:", error);
    return NextResponse.json({ error: "Internal server error fetching results." }, { status: 500 });
  }
}
