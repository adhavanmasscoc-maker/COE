import React from "react";
import { clsx } from "clsx";

export function Card({ children, className = "", hover = true, gradient = false, ...props }) {
  return (
    <div
      className={clsx(
        "glass rounded-2xl p-5",
        hover && "card-glow",
        gradient && "card-gradient-border",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }) {
  return <div className={clsx("mb-4", className)}>{children}</div>;
}

export function CardTitle({ children, className = "" }) {
  return (
    <h3 className={clsx("text-base font-bold text-[#f0f0ff] leading-snug", className)}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = "" }) {
  return (
    <p className={clsx("text-xs text-[#5c5c8a] mt-1 leading-relaxed", className)}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = "" }) {
  return <div className={clsx("", className)}>{children}</div>;
}

// Stat card variant
export function StatCard({ label, value, icon: Icon, color = "violet", trend, className = "" }) {
  const colorMap = {
    violet: { bg: "bg-violet-500/15", text: "text-violet-300", border: "border-violet-500/25" },
    cyan:   { bg: "bg-cyan-500/15",   text: "text-cyan-300",   border: "border-cyan-500/25" },
    emerald:{ bg: "bg-emerald-500/15",text: "text-emerald-300",border: "border-emerald-500/25" },
    amber:  { bg: "bg-amber-500/15",  text: "text-amber-300",  border: "border-amber-500/25" },
    rose:   { bg: "bg-rose-500/15",   text: "text-rose-300",   border: "border-rose-500/25" },
  };
  const c = colorMap[color] || colorMap.violet;

  return (
    <div className={clsx("glass rounded-2xl p-5 card-glow border", c.border, className)}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium text-[#5c5c8a] uppercase tracking-wider">{label}</p>
        {Icon && (
          <div className={clsx("w-8 h-8 rounded-xl flex items-center justify-center", c.bg)}>
            <Icon className={clsx("w-4 h-4", c.text)} />
          </div>
        )}
      </div>
      <p className={clsx("text-3xl font-black gradient-text")}>{value}</p>
      {trend && <p className="text-[11px] text-[#5c5c8a] mt-1.5">{trend}</p>}
    </div>
  );
}
