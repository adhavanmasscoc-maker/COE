// scripts/test_ai_models.mjs
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";

// Simple env loader
const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  content.split("\n").forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let val = (match[2] || "").trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[match[1]] = val;
    }
  });
}

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("Error: GEMINI_API_KEY is missing from environment.");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function verifySetup() {
  console.log("--- 1. Testing text-embedding-004 ---");
  try {
    const embedModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const sampleText = "Tamil Nadu Higher Secondary Mathematics: Matrices and Determinants";
    const embedResult = await embedModel.embedContent(sampleText);
    const vector = embedResult.embedding.values;
    console.log("Embedding Success!");
    console.log(`Vector Dimensions: ${vector.length} (Expected: 768)`);
    console.log(`First 3 Dimensions: [${vector.slice(0, 3).join(", ")}...]`);
  } catch (err) {
    console.error("Embedding Test Failed:", err.message);
  }

  console.log("\n--- 2. Testing Gemini 1.5 Flash ---");
  try {
    const flashModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = "State the condition for a matrix A to be invertible in one short sentence.";
    const result = await flashModel.generateContent(prompt);
    console.log("Flash Model Success!");
    console.log("Response:", result.response.text().trim());
  } catch (err) {
    console.error("Flash Model Test Failed:", err.message);
  }
}

verifySetup();

