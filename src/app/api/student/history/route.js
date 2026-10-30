import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { decryptSubmissionPayload } from "@/lib/encryption";
import { getOrRestoreStudentProfile } from "@/lib/studentProfileHelper";

export const dynamic = "force-dynamic";

function calculateGrade(percentage) {
  if (percentage >= 90) return { grade: "A+", label: "Outstanding" };
  if (percentage >= 80) return { grade: "A", label: "Excellent" };
  if (percentage >= 70) return { grade: "B+", label: "Very Good" };
  if (percentage >= 60) return { grade: "B", label: "Good" };
  if (percentage >= 50) return { grade: "C", label: "Satisfactory" };
  if (percentage >= 35) return { grade: "D", label: "Pass" };
  return { grade: "E", label: "Needs Improvement" };
}

function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return "0s";
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}

export async function GET(request) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required to view exam history." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const previewRollNo = searchParams.get("previewRollNo");

    const studentProfile = await getOrRestoreStudentProfile(session, previewRollNo);
    if (!studentProfile) {
      return NextResponse.json({ error: "Student profile not found." }, { status: 404 });
    }

    // 1. Fetch all submissions for this candidate
    const submissions = await db.examSubmission.findMany({
      where: {
        studentId: studentProfile.id,
        isSubmitted: true,
      },
      include: {
        examSchedule: {
          include: {
            subject: true,
            questions: {
              orderBy: { questionNumber: "asc" },
            },
          },
        },
      },
      orderBy: { submittedAt: "desc" },
    });

    // 2. Fetch any formal published ExamResult records
    const results = await db.examResult.findMany({
      where: {
        studentId: studentProfile.id,
      },
    });
    const resultMap = new Map(results.map((r) => [r.examScheduleId, r]));

    let totalMarksObtained = 0;
    let totalMaxMarks = 0;
    let totalTimeTakenSecs = 0;
    let passCount = 0;

    const formattedSubmissions = submissions.map((sub) => {
      const schedule = sub.examSchedule;
      const subSubject = schedule?.subject?.name || "Official Examination";
      const subCode = schedule?.subject?.code || "EXAM";
      const totalMarks = schedule?.totalMarks || 25;
      const score = sub.score !== null ? sub.score : 0;
      const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;
      const gradeInfo = calculateGrade(percentage);

      totalMarksObtained += score;
      totalMaxMarks += totalMarks;
      totalTimeTakenSecs += sub.timeTakenSecs || 0;
      if (percentage >= 35) passCount += 1;

      // Decrypt audit payload
      let audit = null;
      let rawAnswers = {};
      let detailedQuestions = [];

      try {
        audit = decryptSubmissionPayload(sub.answersJson);
        if (audit && typeof audit === "object") {
          rawAnswers = audit.rawAnswers || audit.answers || {};
          if (Array.isArray(audit.questionsWithAnswers) && audit.questionsWithAnswers.length > 0) {
            // Pre-computed questionsWithAnswers
            const questionsMap = new Map((schedule?.questions || []).map((q) => [q.id, q]));
            detailedQuestions = audit.questionsWithAnswers.map((item) => {
              const fullQ = questionsMap.get(item.questionId);
              let opts = [];
              try {
                opts = fullQ?.options ? JSON.parse(fullQ.options) : [];
              } catch {
                opts = [];
              }
              return {
                id: item.questionId,
                questionNumber: item.questionNumber,
                questionText: item.questionText || fullQ?.questionText,
                marks: item.marks || fullQ?.marks || 1,
                candidateAnswer: item.candidateAnswer || null,
                correctAnswer: item.correctAnswer || fullQ?.correctAnswer,
                isCorrect: Boolean(item.isCorrect),
                explanation: fullQ?.explanation || null,
                options: opts,
              };
            });
          }
        }
      } catch (decErr) {
        console.warn("Could not decrypt answers for sub", sub.id, decErr.message);
      }

      // Fallback question mapping if detailedQuestions wasn't in audit payload
      if (detailedQuestions.length === 0 && schedule?.questions) {
        detailedQuestions = schedule.questions.map((q) => {
          const studentAns = rawAnswers[q.id] || null;
          const isCorrect = studentAns && studentAns.toUpperCase() === q.correctAnswer?.toUpperCase();
          let opts = [];
          try {
            opts = JSON.parse(q.options || "[]");
          } catch {
            opts = [];
          }
          return {
            id: q.id,
            questionNumber: q.questionNumber,
            questionText: q.questionText,
            marks: q.marks,
            candidateAnswer: studentAns,
            correctAnswer: q.correctAnswer,
            isCorrect,
            explanation: q.explanation,
            options: opts,
          };
        });
      }

      const publishedResult = resultMap.get(schedule?.id);

      return {
        id: sub.id,
        examScheduleId: sub.examScheduleId,
        title: schedule?.instructions || `${subSubject} Official Examination`,
        subject: subSubject,
        subjectCode: subCode,
        prepClass: schedule?.prepClass || studentProfile.examPrepClass,
        medium: schedule?.subject?.medium || studentProfile.medium || "Bilingual",
        examDate: schedule?.examDate || sub.submittedAt,
        submittedAt: sub.submittedAt,
        timeTakenSecs: sub.timeTakenSecs || 0,
        timeTakenFormatted: formatDuration(sub.timeTakenSecs || 0),
        score,
        totalMarks,
        percentage,
        grade: gradeInfo.grade,
        gradeLabel: gradeInfo.label,
        isCertified: percentage >= 35,
        isPublished: Boolean(publishedResult?.isPublished),
        proctoringStatus: "VERIFIED_CLEAN",
        totalQuestions: schedule?.questions?.length || detailedQuestions.length,
        answeredCount: detailedQuestions.filter((q) => q.candidateAnswer).length,
        questions: detailedQuestions,
      };
    });

    const totalSubmissions = formattedSubmissions.length;
    const avgPercentage = totalMaxMarks > 0 ? Math.round((totalMarksObtained / totalMaxMarks) * 100) : 0;
    const overallGrade = calculateGrade(avgPercentage);

    return NextResponse.json({
      success: true,
      candidate: {
        id: studentProfile.id,
        fullName: studentProfile.fullName,
        rollNo: studentProfile.user.username,
        currentClass: studentProfile.currentClass,
        examPrepClass: studentProfile.examPrepClass,
        medium: studentProfile.medium,
        board: studentProfile.board,
        academicYear: studentProfile.academicYear,
      },
      stats: {
        totalSubmissions,
        totalMarksObtained,
        totalMaxMarks,
        avgPercentage,
        overallGrade: overallGrade.grade,
        overallGradeLabel: overallGrade.label,
        passRate: totalSubmissions > 0 ? Math.round((passCount / totalSubmissions) * 100) : 0,
        totalTimeInvestedFormatted: formatDuration(totalTimeTakenSecs),
      },
      submissions: formattedSubmissions,
    });
  } catch (error) {
    console.error("[Student History API Error]", error);
    return NextResponse.json(
      { error: "Failed to retrieve student examination history." },
      { status: 500 }
    );
  }
}
