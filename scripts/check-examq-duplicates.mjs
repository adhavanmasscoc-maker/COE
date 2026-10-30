import { createClient } from "@libsql/client/web";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
  console.log("Checking ExamQuestion duplicates on Turso...");
  const rs = await client.execute(`
    SELECT examScheduleId, questionNumber, COUNT(*) as cnt
    FROM ExamQuestion
    GROUP BY examScheduleId, questionNumber
    HAVING cnt > 1;
  `);

  console.log("Duplicates found:", rs.rows.length);
  if (rs.rows.length > 0) {
    console.log(rs.rows);
  } else {
    console.log("No duplicates! Clean for unique index.");
  }
}

main().catch(console.error);
