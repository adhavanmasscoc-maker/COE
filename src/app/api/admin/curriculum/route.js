import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const CURRICULUM_DIR = path.join(process.cwd(), "data", "curriculum");

/**
 * GET /api/admin/curriculum
 * Returns list of official syllabus, blueprints, and past papers stored on server.
 * Optional query parameter: ?file=filename.ext to fetch file contents.
 */
export async function GET(request) {
  try {
    const session = await getCurrentSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "COE Admin authorization required." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const requestedFile = searchParams.get("file");

    if (!fs.existsSync(CURRICULUM_DIR)) {
      fs.mkdirSync(CURRICULUM_DIR, { recursive: true });
    }

    if (requestedFile) {
      // Prevent directory traversal
      const safeName = path.basename(requestedFile);
      const filePath = path.join(CURRICULUM_DIR, safeName);
      if (!fs.existsSync(filePath)) {
        return NextResponse.json({ error: `File ${safeName} not found in curriculum repository.` }, { status: 404 });
      }

      const content = fs.readFileSync(filePath, "utf-8");
      const ext = path.extname(safeName).toLowerCase();
      let parsed = null;
      if (ext === ".json") {
        try { parsed = JSON.parse(content); } catch {}
      }

      return NextResponse.json({
        success: true,
        filename: safeName,
        extension: ext,
        content,
        parsedData: parsed,
      });
    }

    // List all files in data/curriculum/
    const files = fs.readdirSync(CURRICULUM_DIR).map((file) => {
      const filePath = path.join(CURRICULUM_DIR, file);
      const stats = fs.statSync(filePath);
      return {
        name: file,
        sizeBytes: stats.size,
        lastModified: stats.mtime.toISOString(),
        category: file.includes("class10")
          ? "Class 10 (Secondary)"
          : file.includes("class12")
          ? "Class 12 (Higher Secondary)"
          : "General Curriculum",
        type: path.extname(file).replace(".", "").toUpperCase(),
      };
    });

    return NextResponse.json({
      success: true,
      repositoryPath: "data/curriculum/",
      count: files.length,
      files,
    });
  } catch (err) {
    console.error("Error reading curriculum repository:", err);
    return NextResponse.json({ error: "Failed to access curriculum archive.", message: err.message }, { status: 500 });
  }
}
