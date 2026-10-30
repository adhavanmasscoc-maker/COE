"use client";

import React from "react";
import { clsx } from "clsx";

/**
 * Accessible Skeleton loader component with smooth shimmer
 * Prevents layout shifts (CLS) on mobile and desktop
 */
export function Skeleton({ className = "", ...props }) {
  return (
    <div
      aria-hidden="true"
      className={clsx(
        "animate-pulse rounded-lg bg-secondary/70 border border-border/40",
        className
      )}
      {...props}
    />
  );
}

export function SkeletonCard({ lines = 3, className = "" }) {
  return (
    <div className={clsx("p-5 rounded-2xl bg-secondary/40 border border-border/50 space-y-3", className)}>
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-4 w-full" />
      {lines > 2 && <Skeleton className="h-4 w-4/5" />}
      {lines > 3 && <Skeleton className="h-4 w-2/3" />}
      <div className="pt-2 flex gap-2">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  );
}

export default Skeleton;

