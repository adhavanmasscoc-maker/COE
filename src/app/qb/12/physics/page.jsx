"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function QbPhysicsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/student/qb/12/physics");
  }, [router]);
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f7f3eb" }}>
      <Loader2 style={{ width: 24, height: 24, animation: "spin 1s linear infinite", color: "#7c3aed" }} />
    </div>
  );
}

