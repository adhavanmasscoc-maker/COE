const { createClient } = require("@libsql/client/web");
const crypto = require("crypto");

let tursoUrl = "libsql://aknex-exam-db-aadhavank.aws-ap-south-1.turso.io";
let tursoToken = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTMzNjY0NTMsImlkIjoiMDFhMThjZjgtM2EwMS03NDAyLWE2MmQtYmI1MmRiZTZkNmExIiwia2lkIjoiaERvVmJ3b0dTYXZaaWFjTExVVU56c1VLaHBNU1hoMzVoSk8yZGlUN2FnRSIsInJpZCI6ImY2ZTNmYTUyLThmNTMtNDJlMi1iZjcwLTIxMTkxYzg5YjY0ZiJ9.hdc6PMQEIveXiH-DxiIqypTPP7lE2UYHNWS-eaZS-R3BJzplTFadwc4VXrX1yD-DS8mf_JeHf39-ZFIb53gsAw";

const client = createClient({ url: tursoUrl, authToken: tursoToken });

function tryDecrypt(raw, secret) {
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!parsed || !parsed._enc) return parsed;
    const key = crypto.createHash("sha256").update(secret).digest();
    const iv = Buffer.from(parsed.iv, "hex");
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    let dec = decipher.update(parsed.cipher, "base64", "utf8");
    dec += decipher.final("utf8");
    return JSON.parse(dec);
  } catch (e) {
    return null;
  }
}

async function testDec() {
  const subs = await client.execute({
    sql: "SELECT id, answersJson FROM ExamSubmission WHERE id IN ('cmvwl1c2z0043cqzq89pr73op', 'cmvwkwvbw000fw0oobqpxyyiw')",
    args: []
  });

  const secrets = [
    "tn_board_samacheer_coe_tamperproof_secure_key_2026",
    "tn-samacheer-kalvi-coe-super-secret-key-2026-secure-32chars"
  ];

  for (const s of subs.rows) {
    console.log("\nSubmission:", s.id);
    for (const sec of secrets) {
      const res = tryDecrypt(s.answersJson, sec);
      if (res) {
        console.log(`Success with secret: "${sec}"!`);
        console.log("Raw answers:", res.rawAnswers);
        console.log("Answers count:", Object.keys(res.rawAnswers || {}).length);
        console.log("Candidate answer for Q24:", res.questionsWithAnswers?.find(q => q.questionNumber === 24));
        console.log("Candidate answer for Q25:", res.questionsWithAnswers?.find(q => q.questionNumber === 25));
        break;
      }
    }
  }
}

testDec().catch(console.error);
