"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function QbMathRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/student/qb/12/math");
  }, [router]);
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#fbf9f4" }}>
      <Loader2 style={{ width: 24, height: 24, animation: "spin 1s linear infinite", color: "#7c3aed" }} />
    </div>
  );
}

