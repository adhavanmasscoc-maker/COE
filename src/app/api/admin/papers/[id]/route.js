import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(request, { params }) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();
    const { isPublished, title, maxMarks, durationMinutes } = body;

    const updateData = {};
    if (isPublished !== undefined) updateData.isPublished = Boolean(isPublished);
    if (title !== undefined) updateData.title = title.trim();
    if (maxMarks !== undefined) updateData.maxMarks = parseInt(maxMarks, 10);
    if (durationMinutes !== undefined) updateData.durationMinutes = parseInt(durationMinutes, 10);

    const updated = await db.questionPaper.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: `Paper status updated: ${updated.isPublished ? "PUBLISHED to Student Portal" : "SAVED as DRAFT"}.`,
      paper: updated,
    });
  } catch (error) {
    console.error("Update question paper error:", error);
    return NextResponse.json(
      { error: "Failed to update question paper." },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
    }

    const { id } = params;

    await db.questionPaper.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Question paper deleted from database.",
    });
  } catch (error) {
    console.error("Delete question paper error:", error);
    return NextResponse.json(
      { error: "Failed to delete question paper." },
      { status: 500 }
    );
  }
}
