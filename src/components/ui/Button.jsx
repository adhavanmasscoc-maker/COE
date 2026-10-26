import React from "react";
import { clsx } from "clsx";

const variants = {
  primary:
    "btn-primary px-4 py-2 text-sm font-semibold !text-white hover:!text-white active:!text-white rounded-lg shadow-lg shadow-violet-500/25 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none",
  secondary:
    "px-4 py-2 text-sm font-medium text-[#c4b5fd] bg-[rgba(26,26,56,0.9)] border border-[rgba(124,58,237,0.3)] rounded-lg hover:bg-[rgba(124,58,237,0.25)] hover:border-violet-400 hover:!text-white active:!text-white transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none",
  outline:
    "btn-ghost px-4 py-2 text-sm font-medium text-[#c4b5fd] hover:!text-white active:!text-white border border-[rgba(124,58,237,0.3)] hover:bg-violet-600/20 hover:border-violet-400 rounded-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none",
  ghost:
    "px-3 py-2 text-sm font-medium text-[#a8a8d0] hover:!text-white active:!text-white rounded-lg hover:bg-white/10 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none",
  danger:
    "px-4 py-2 text-sm font-semibold text-rose-300 hover:!text-white active:!text-white bg-rose-500/15 border border-rose-500/30 rounded-lg hover:bg-rose-600 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none",
  success:
    "px-4 py-2 text-sm font-semibold text-emerald-300 hover:!text-white active:!text-white bg-emerald-500/15 border border-emerald-500/30 rounded-lg hover:bg-emerald-600 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none",
  amber:
    "px-4 py-2 text-sm font-bold text-slate-950 hover:text-slate-950 active:text-slate-950 bg-gradient-to-r from-amber-400 to-orange-400 rounded-lg shadow-lg shadow-amber-500/20 hover:from-amber-300 hover:to-orange-300 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none",
};

const sizes = {
  xs: "!px-2.5 !py-1 !text-xs",
  sm: "!px-3 !py-1.5 !text-xs",
  md: "",
  lg: "!px-6 !py-3 !text-base",
  icon: "!p-2 !rounded-xl",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) {
  return (
    <button
      className={clsx(variants[variant] || variants.primary, sizes[size], "inline-flex items-center gap-1.5 cursor-pointer", className)}
      {...props}
    >
      {children}
    </button>
  );
}
