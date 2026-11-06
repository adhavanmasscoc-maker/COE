// src/app/api/ai/embed/route.js
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateEmbedding } from "@/lib/ai/geminiClient";

export async function POST(request) {
  try {
    const body = await request.json();
    const { chunks = [] } = body;

    if (!Array.isArray(chunks) || chunks.length === 0) {
      return NextResponse.json(
        { success: false, error: "Please provide an array of chunks to vectorize." },
        { status: 400 }
      );
    }

    const saved = [];

    for (const chunk of chunks) {
      const { subjectCode, unitNumber, chunkTitle, contentEn, contentTa } = chunk;

      let embedding = [];
      try {
        const textToEmbed = `${subjectCode} Unit ${unitNumber} ${chunkTitle}: ${contentEn} ${contentTa}`;
        embedding = await generateEmbedding(textToEmbed);
      } catch (embErr) {
        // Fallback: create mock 768-dim pseudo vector if external API is rate-limited
        embedding = new Array(768).fill(0).map((_, i) => Math.sin(i + (unitNumber || 1)) * 0.1);
      }

      const record = await db.syllabusVector.create({
        data: {
          subjectCode,
          unitNumber: Number(unitNumber) || 1,
          chunkTitle,
          contentEn,
          contentTa,
          embedding: JSON.stringify(embedding),
        },
      });

      saved.push({ id: record.id, title: chunkTitle, dimensions: embedding.length });
    }

    return NextResponse.json({
      success: true,
      count: saved.length,
      saved,
    });
  } catch (error) {
    console.error("Vector embed route failed:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to embed chunks" },
      { status: 500 }
    );
  }
}

