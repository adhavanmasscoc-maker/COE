"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function PracticeRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const previewRoll = searchParams.get("previewRollNo");
  const prepClassParam = searchParams.get("prepClass");

  useEffect(() => {
    // Determine target standard: Class 10 SSLC vs Class 12 HSE
    let targetStandard = 10;
    if (prepClassParam === "12") {
      targetStandard = 12;
    } else if (previewRoll) {
      // Class 10 candidates: 9105, TN2026-0901, TN2026-0900, TN2026-1005
      // Class 12 candidates: TN2026-1102, MATI2026, 1111, TN2026-RAMESH, 11203
      if (previewRoll === "9105" || previewRoll.startsWith("TN2026-09") || previewRoll.startsWith("TN2026-10")) {
        targetStandard = 10;
      } else if (previewRoll.startsWith("TN2026-11") || previewRoll === "1111" || previewRoll === "11203" || previewRoll === "MATI2026") {
        targetStandard = 12;
      }
    }

    // Class 10 strictly directs to 10th Standard English (ENG-10)
    // Class 12 strictly directs to 12th Standard English (ENG-12) or Chemistry (CHE-12)
    const defaultSubject = targetStandard === 10 ? "ENG-10" : "ENG-12";
    const previewQuery = previewRoll ? `?previewRollNo=${encodeURIComponent(previewRoll)}` : "";
    router.replace(`/student/practice/${defaultSubject}/set-a${previewQuery}`);
  }, [router, previewRoll, prepClassParam]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-xs text-muted-foreground gap-2">
      <Loader2 className="w-5 h-5 animate-spin text-violet-400" />
      <span>Loading official practice curriculum portal...</span>
    </div>
  );
}

export default function PracticeRedirectPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[50vh] flex items-center justify-center p-6">
        <Loader2 className="w-5 h-5 animate-spin text-violet-400" />
      </div>
    }>
      <PracticeRedirectContent />
    </Suspense>
  );
}

