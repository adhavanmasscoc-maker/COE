import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// PATCH /api/admin/results/[id]: Update result publish status or marks
export async function PATCH(request, { params }) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "COE Admin authorization required." }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();
    const { isPublished, marksObtained, remarks } = body;

    const dataToUpdate = {};
    if (isPublished !== undefined) {
      dataToUpdate.isPublished = Boolean(isPublished);
    }
    if (marksObtained !== undefined) {
      dataToUpdate.marksObtained = parseFloat(marksObtained);
    }
    if (remarks !== undefined) {
      dataToUpdate.remarks = remarks;
    }

    const updated = await db.examResult.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true, result: updated });
  } catch (error) {
    console.error("Admin result PATCH error:", error);
    return NextResponse.json({ error: "Failed to update result." }, { status: 500 });
  }
}

// DELETE /api/admin/results/[id]: Remove an exam result
export async function DELETE(request, { params }) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "COE Admin authorization required." }, { status: 403 });
    }

    const { id } = params;
    await db.examResult.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Result deleted successfully." });
  } catch (error) {
    console.error("Admin result DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete result." }, { status: 500 });
  }
}
