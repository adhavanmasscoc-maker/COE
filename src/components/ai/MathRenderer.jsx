"use client";
import React, { useMemo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

/**
 * Renders mixed Markdown and LaTeX equations ($inline$ and $$display$$) safely.
 */
export default function MathRenderer({ content = "", className = "" }) {
  const parts = useMemo(() => {
    if (!content || typeof content !== "string") return [];

    // Split text by display math $$...$$ and inline math $...$
    // Regex handles both $$...$$ and $...$
    const tokens = [];
    const regex = /(\$\$[\s\S]*?\$\$|\$[^$\n]+?\$)/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        tokens.push({
          type: "text",
          value: content.slice(lastIndex, match.index),
        });
      }

      const raw = match[0];
      if (raw.startsWith("$$") && raw.endsWith("$$")) {
        tokens.push({
          type: "display-math",
          value: raw.slice(2, -2).trim(),
        });
      } else if (raw.startsWith("$") && raw.endsWith("$")) {
        tokens.push({
          type: "inline-math",
          value: raw.slice(1, -1).trim(),
        });
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < content.length) {
      tokens.push({
        type: "text",
        value: content.slice(lastIndex),
      });
    }

    return tokens;
  }, [content]);

  return (
    <div className={`prose-sm leading-relaxed ${className}`}>
      {parts.map((part, idx) => {
        if (part.type === "display-math") {
          try {
            const html = katex.renderToString(part.value, {
              displayMode: true,
              throwOnError: false,
            });
            return (
              <div
                key={idx}
                className="my-3 overflow-x-auto py-1 text-center"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            );
          } catch {
            return (
              <div key={idx} className="my-2 p-2 bg-slate-900 rounded font-mono text-xs text-amber-300">
                $${part.value}$$
              </div>
            );
          }
        }

        if (part.type === "inline-math") {
          try {
            const html = katex.renderToString(part.value, {
              displayMode: false,
              throwOnError: false,
            });
            return (
              <span
                key={idx}
                className="inline-block px-0.5"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            );
          } catch {
            return (
              <span key={idx} className="font-mono text-xs text-amber-300 px-1 bg-slate-900/40 rounded">
                ${part.value}$
              </span>
            );
          }
        }

        // Normal text: handle line breaks and bold
        return (
          <span key={idx} className="whitespace-pre-wrap">
            {part.value}
          </span>
        );
      })}
    </div>
  );
}

