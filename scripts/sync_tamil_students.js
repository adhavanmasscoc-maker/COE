const { createClient } = require("@libsql/client/web");
const fs = require("fs");

let tursoUrl = "libsql://aknex-exam-db-aadhavank.aws-ap-south-1.turso.io";
let tursoToken = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTMzNjY0NTMsImlkIjoiMDFhMThjZjgtM2EwMS03NDAyLWE2MmQtYmI1MmRiZTZkNmExIiwia2lkIjoiaERvVmJ3b0dTYXZaaWFjTExVVU56c1VLaHBNU1hoMzVoSk8yZGlUN2FnRSIsInJpZCI6ImY2ZTNmYTUyLThmNTMtNDJlMi1iZjcwLTIxMTkxYzg5YjY0ZiJ9.hdc6PMQEIveXiH-DxiIqypTPP7lE2UYHNWS-eaZS-R3BJzplTFadwc4VXrX1yD-DS8mf_JeHf39-ZFIb53gsAw";

try {
  const envContent = fs.readFileSync(".env", "utf8");
  for (const line of envContent.split("\n")) {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const val = match[2].trim().replace(/^["']|["']$/g, "");
      if (key === "TURSO_DATABASE_URL") tursoUrl = val;
      if (key === "TURSO_AUTH_TOKEN") tursoToken = val;
    }
  }
} catch (e) {}

const client = createClient({ url: tursoUrl, authToken: tursoToken });

async function syncTamilLanguage() {
  console.log("Updating all Tamil medium student users to language = 'ta' in Turso...");
  const res = await client.execute({
    sql: "UPDATE User SET language = 'ta' WHERE id IN (SELECT userId FROM StudentProfile WHERE medium = 'Tamil');",
    args: []
  });
  console.log("Rows affected:", res.rowsAffected);

  const check = await client.execute({
    sql: "SELECT u.id, u.username, u.language, p.fullName, p.medium FROM User u JOIN StudentProfile p ON u.id = p.userId WHERE p.medium = 'Tamil'",
    args: []
  });
  console.log("Tamil students:", check.rows);
}

syncTamilLanguage().catch(console.error);

