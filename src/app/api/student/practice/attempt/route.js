import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getOrRestoreStudentProfile } from "@/lib/studentProfileHelper";

export const dynamic = "force-dynamic";

// POST /api/student/practice/attempt: Record a practice session attempt in Turso
export async function POST(request) {
  try {
    const session = await getCurrentSession();
    const body = await request.json();
    const {
      subjectCode,
      setName,
      medium,
      totalTimeSpent,
      timePerQuestion,
      answers,
      questionsWithAnswers,
      score,
      totalMarks,
      previewRollNo,
    } = body;

    if (!session && !previewRollNo) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const studentProfile = await getOrRestoreStudentProfile(session, previewRollNo);
    if (!studentProfile) {
      return NextResponse.json({ error: "Student profile not found." }, { status: 404 });
    }

    // Determine current attempt number for this student, subject, and set
    const previousAttemptsCount = await db.practiceAttempt.count({
      where: {
        studentId: studentProfile.id,
        subjectCode: subjectCode || "CHE-12",
        setName: setName || "set-a",
      },
    });

    const attemptNumber = previousAttemptsCount + 1;
    const maxMarks = Number(totalMarks) || 50;
    const earnedScore = Number(score) || 0;
    const percentage = maxMarks > 0 ? Math.round((earnedScore / maxMarks) * 1000) / 10 : 0;

    // Store raw answers along with full question breakdown for syllabus practice review
    const answersPayload = {
      rawAnswers: answers || {},
      questionsWithAnswers: Array.isArray(questionsWithAnswers) ? questionsWithAnswers : null,
    };

    const record = await db.practiceAttempt.create({
      data: {
        studentId: studentProfile.id,
        subjectCode: subjectCode || "CHE-12",
        setName: setName || "set-a",
        medium: medium || studentProfile.medium || "English",
        attemptNumber,
        totalTimeSpent: Number(totalTimeSpent) || 0,
        timePerQuestion: typeof timePerQuestion === "string" ? timePerQuestion : JSON.stringify(timePerQuestion || {}),
        answersJson: JSON.stringify(answersPayload),
        score: earnedScore,
        totalMarks: maxMarks,
        percentage,
        mode: "PRACTICE",
      },
    });

    return NextResponse.json({
      success: true,
      attemptId: record.id,
      attemptNumber,
      score: earnedScore,
      totalMarks: maxMarks,
      percentage,
      createdAt: record.createdAt,
    });
  } catch (error) {
    console.error("[Practice Attempt Save Error]:", error);
    return NextResponse.json(
      { error: "Failed to persist practice attempt." },
      { status: 500 }
    );
  }
}

// GET /api/student/practice/attempt: Retrieve analytics / previous attempts
export async function GET(request) {
  try {
    const session = await getCurrentSession();
    const { searchParams } = new URL(request.url);
    const previewRollNo = searchParams.get("previewRollNo");
    const subjectCode = searchParams.get("subjectCode");

    if (!session && !previewRollNo) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const studentProfile = await getOrRestoreStudentProfile(session, previewRollNo);
    if (!studentProfile) {
      return NextResponse.json({ error: "Student profile not found." }, { status: 404 });
    }

    const where = { studentId: studentProfile.id };
    if (subjectCode) {
      where.subjectCode = subjectCode;
    }

    const attempts = await db.practiceAttempt.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    // Aggregate statistics
    const totalAttempts = attempts.length;
    let avgScore = 0;
    let highestScore = 0;
    if (totalAttempts > 0) {
      const sumPct = attempts.reduce((acc, a) => acc + (a.percentage || 0), 0);
      avgScore = Math.round(sumPct / totalAttempts);
      highestScore = Math.max(...attempts.map((a) => a.percentage || 0));
    }

    return NextResponse.json({
      success: true,
      totalAttempts,
      averagePercentage: avgScore,
      highestPercentage: highestScore,
      attempts: attempts.map((a) => {
        let parsedPayload = {};
        try {
          parsedPayload = JSON.parse(a.answersJson || "{}");
        } catch {
          parsedPayload = {};
        }

        const rawAnswers = parsedPayload.rawAnswers || parsedPayload || {};
        const questionsWithAnswers = parsedPayload.questionsWithAnswers || null;

        return {
          id: a.id,
          subjectCode: a.subjectCode,
          setName: a.setName,
          medium: a.medium,
          attemptNumber: a.attemptNumber,
          score: a.score,
          totalMarks: a.totalMarks,
          percentage: a.percentage,
          totalTimeSpent: a.totalTimeSpent,
          answers: rawAnswers,
          questionsWithAnswers,
          createdAt: a.createdAt,
        };
      }),
    });
  } catch (error) {
    console.error("[Practice Attempt GET Error]:", error);
    return NextResponse.json(
      { error: "Failed to retrieve practice history." },
      { status: 500 }
    );
  }
}

