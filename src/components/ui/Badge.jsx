import React from "react";
import { clsx } from "clsx";

const variants = {
  default:   "badge badge-violet",
  violet:    "badge badge-violet",
  cyan:      "badge badge-cyan",
  success:   "badge badge-emerald",
  emerald:   "badge badge-emerald",
  warning:   "badge badge-amber",
  amber:     "badge badge-amber",
  danger:    "badge badge-rose",
  rose:      "badge badge-rose",
  muted:     "badge badge-muted",
  secondary: "badge badge-muted",
  purple:    "badge badge-violet",
};

export function Badge({ children, variant = "default", className = "" }) {
  return (
    <span className={clsx(variants[variant] || variants.default, className)}>
      {children}
    </span>
  );
}
