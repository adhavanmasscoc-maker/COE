import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(request, { params }) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Access denied. Administrator privileges required." },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { medium, examPrepClass } = body;

    const updateData = {};
    if (medium !== undefined) updateData.medium = medium;
    if (examPrepClass !== undefined) updateData.examPrepClass = parseInt(examPrepClass, 10);

    const updatedProfile = await db.studentProfile.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: `Updated profile for ${updatedProfile.fullName} successfully.`,
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Update student profile error:", error);
    return NextResponse.json(
      { error: "Failed to update candidate profile in database." },
      { status: 500 }
    );
  }
}
