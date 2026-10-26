import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/admin/exams/[id]: Get full exam schedule with questions and submissions
export async function GET(request, { params }) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "COE Admin authorization required." }, { status: 403 });
    }

    const { id } = params;
    const exam = await db.examSchedule.findUnique({
      where: { id },
      include: {
        subject: true,
        questions: {
          orderBy: { questionNumber: "asc" },
        },
        submissions: {
          include: {
            student: {
              include: {
                user: { select: { username: true } },
              },
            },
          },
          orderBy: { submittedAt: "desc" },
        },
      },
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam schedule not found." }, { status: 404 });
    }

    // Parse options json for each question
    const formattedQuestions = exam.questions.map((q) => {
      let parsedOptions = [];
      try {
        parsedOptions = typeof q.options === "string" ? JSON.parse(q.options) : q.options;
      } catch (e) {
        parsedOptions = [];
      }
      return {
        ...q,
        options: parsedOptions,
      };
    });

    return NextResponse.json({
      success: true,
      exam: {
        ...exam,
        questions: formattedQuestions,
      },
    });
  } catch (error) {
    console.error("Admin exam details GET error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

// PATCH /api/admin/exams/[id]: Update exam status or fields
export async function PATCH(request, { params }) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "COE Admin authorization required." }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();
    const { status, examDate, durationMinutes, totalMarks, instructions } = body;

    const dataToUpdate = {};
    if (status !== undefined) {
      if (!["DRAFT", "PUBLISHED", "COMPLETED"].includes(status)) {
        return NextResponse.json({ error: "Invalid status value." }, { status: 400 });
      }
      dataToUpdate.status = status;
    }
    if (examDate !== undefined) {
      dataToUpdate.examDate = new Date(examDate);
    }
    if (durationMinutes !== undefined) {
      dataToUpdate.durationMinutes = parseInt(durationMinutes, 10);
    }
    if (totalMarks !== undefined) {
      dataToUpdate.totalMarks = parseInt(totalMarks, 10);
    }
    if (instructions !== undefined) {
      dataToUpdate.instructions = instructions;
    }

    const updated = await db.examSchedule.update({
      where: { id },
      data: dataToUpdate,
      include: {
        subject: { select: { name: true, code: true } },
      },
    });

    return NextResponse.json({ success: true, exam: updated });
  } catch (error) {
    console.error("Admin exam PATCH error:", error);
    return NextResponse.json({ error: "Failed to update exam in database." }, { status: 500 });
  }
}

// DELETE /api/admin/exams/[id]: Delete an exam schedule
export async function DELETE(request, { params }) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "COE Admin authorization required." }, { status: 403 });
    }

    const { id } = params;
    await db.examSchedule.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Exam schedule deleted successfully." });
  } catch (error) {
    console.error("Admin exam DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete exam from database." }, { status: 500 });
  }
}
