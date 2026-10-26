import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// POST /api/admin/exams/[id]/questions: Add question to exam schedule
export async function POST(request, { params }) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "COE Admin authorization required." }, { status: 403 });
    }

    const { id: examScheduleId } = params;
    const body = await request.json();
    const { questionNumber, questionText, marks, options, correctAnswer, explanation } = body;

    if (!questionText || !options) {
      return NextResponse.json({ error: "Question text and options are required." }, { status: 400 });
    }

    // Determine question number if not provided
    let qNum = questionNumber;
    if (!qNum) {
      const count = await db.examQuestion.count({
        where: { examScheduleId },
      });
      qNum = count + 1;
    }

    const optionsStr = typeof options === "string" ? options : JSON.stringify(options);

    const question = await db.examQuestion.create({
      data: {
        examScheduleId,
        questionNumber: parseInt(qNum, 10),
        questionText,
        marks: marks ? parseInt(marks, 10) : 2,
        options: optionsStr,
        correctAnswer: correctAnswer || null,
        explanation: explanation || null,
      },
    });

    return NextResponse.json({ success: true, question }, { status: 201 });
  } catch (error) {
    console.error("Admin add question error:", error);
    return NextResponse.json({ error: "Failed to add question to exam in database." }, { status: 500 });
  }
}

// DELETE /api/admin/exams/[id]/questions?questionId=...
export async function DELETE(request, { params }) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "COE Admin authorization required." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const questionId = searchParams.get("questionId");

    if (!questionId) {
      return NextResponse.json({ error: "Question ID is required." }, { status: 400 });
    }

    await db.examQuestion.delete({
      where: { id: questionId },
    });

    return NextResponse.json({ success: true, message: "Question deleted successfully." });
  } catch (error) {
    console.error("Admin delete question error:", error);
    return NextResponse.json({ error: "Failed to delete question." }, { status: 500 });
  }
}
