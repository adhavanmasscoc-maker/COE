"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldAlert } from "lucide-react";

export function AdminGuard({ children }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function verifyAdmin() {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          if (isMounted) {
            setAuthorized(false);
            setChecking(false);
            router.push("/?error=admin_access_denied");
          }
          return;
        }

        const data = await res.json();
        if (data.authenticated && data.user?.role === "ADMIN") {
          if (isMounted) {
            setAuthorized(true);
            setChecking(false);
          }
        } else {
          if (isMounted) {
            setAuthorized(false);
            setChecking(false);
            router.push("/?error=admin_access_denied");
          }
        }
      } catch (err) {
        if (isMounted) {
          setAuthorized(false);
          setChecking(false);
          router.push("/?error=admin_access_denied");
        }
      }
    }

    verifyAdmin();

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (checking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
        <p className="text-xs text-[#5c5c8a] font-mono">Verifying Administrative Privileges...</p>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="glass rounded-2xl p-8 text-center max-w-sm border border-rose-500/30">
          <ShieldAlert className="w-12 h-12 text-rose-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-[#f0f0ff] mb-1">Access Prohibited</h2>
          <p className="text-xs text-[#5c5c8a]">Administrative clearance required.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
