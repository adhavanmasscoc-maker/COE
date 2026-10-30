"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PracticeRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/student/practice/CHE-12/set-a");
  }, [router]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center p-6 text-xs text-muted-foreground">
      Loading practice curriculum portal...
    </div>
  );
}
