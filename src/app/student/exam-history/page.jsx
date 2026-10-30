import { redirect } from "next/navigation";

export default function ExamHistoryRedirect({ searchParams }) {
  const query = new URLSearchParams(searchParams || {}).toString();
  redirect(`/student/history${query ? `?${query}` : ""}`);
}

