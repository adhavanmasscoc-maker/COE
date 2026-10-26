import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function DELETE(request, { params }) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
    }

    const { id } = params;

    await db.syllabusChapter.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Chapter deleted from syllabus.",
    });
  } catch (error) {
    console.error("Delete syllabus chapter error:", error);
    return NextResponse.json(
      { error: "Failed to delete chapter from database." },
      { status: 500 }
    );
  }
}
