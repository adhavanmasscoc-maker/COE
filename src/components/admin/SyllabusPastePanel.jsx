"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  Code,
  Copy,
  ChevronDown,
  ChevronUp,
  Save,
  BookOpen,
  Layers,
  Sparkles,
  RefreshCw,
} from "lucide-react";

const SAMPLE_JSON_SINGLE = {
  subject: "Computer Science",
  prepClass: 12,
  label: "Class 12 Computer Science (Full Syllabus)",
  units: [
    {
      unit: "Unit 1: Problem Solving & Algorithmic Strategies",
      topics: [
        "Function Specification & LEGB Scope Rule",
        "Big O Asymptotic Complexity",
        "Linear Search, Binary Search",
        "Bubble Sort, Insertion Sort, Selection Sort",
      ],
    },
    {
      unit: "Unit 2: Python Programming Core",
      topics: [
        "Tokens, Literals, Identifiers, Keywords",
        "Control Flow Statements (if, elif, for, while)",
        "Functions, Scope, Recursive Functions, Lambda",
        "Strings, Lists, Tuples, Sets, Dictionaries",
      ],
    },
    {
      unit: "Unit 3: Database & Structured Query Language (SQL)",
      topics: [
        "Relational Model Concepts & Integrity Rules",
        "SQL DDL (CREATE, ALTER, DROP)",
        "SQL DML (INSERT, UPDATE, DELETE)",
        "SQL DQL (SELECT, WHERE, GROUP BY, ORDER BY)",
        "Python-SQLite3 Cursor and Connection Interface",
      ],
    },
  ],
};

export function SyllabusPastePanel({ onSyllabusImported, onApplySyllabus }) {
  const [inputText, setInputText] = useState("");
  const [parseMode, setParseMode] = useState("auto"); // "auto" | "json" | "text"
  const [parsedData, setParsedData] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [showSample, setShowSample] = useState(false);
  const [expandedUnit, setExpandedUnit] = useState(0);

  // Validate and parse JSON or text
  const handleValidateAndPreview = () => {
    setValidationErrors([]);
    setSuccessMsg("");
    setParsedData(null);

    const trimmed = inputText.trim();
    if (!trimmed) {
      setValidationErrors([{ line: 1, field: "input", message: "Please paste a JSON object or syllabus text." }]);
      return;
    }

    // Attempt JSON parsing
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed);
        const subjectsList = Array.isArray(parsed) ? parsed : [parsed];
        const errors = [];

        subjectsList.forEach((sub, sIdx) => {
          const prefix = Array.isArray(parsed) ? `Subject #${sIdx + 1}` : "Root";
          if (!sub.subject || typeof sub.subject !== "string") {
            errors.push({ line: sIdx + 1, field: "subject", message: `${prefix}: Missing or invalid "subject" name (e.g. "Computer Science").` });
          }
          if (!sub.prepClass || ![10, 11, 12].includes(Number(sub.prepClass))) {
            errors.push({ line: sIdx + 1, field: "prepClass", message: `${prefix}: "prepClass" must be 10, 11, or 12.` });
          }
          if (!Array.isArray(sub.units) || sub.units.length === 0) {
            errors.push({ line: sIdx + 1, field: "units", message: `${prefix}: "units" must be a non-empty array of unit objects.` });
          } else {
            sub.units.forEach((u, uIdx) => {
              if (!u.unit || typeof u.unit !== "string") {
                errors.push({ line: sIdx + 1, field: `units[${uIdx}].unit`, message: `${prefix} Unit #${uIdx + 1}: Missing "unit" title.` });
              }
            });
          }
        });

        if (errors.length > 0) {
          setValidationErrors(errors);
          return;
        }

        setParsedData(subjectsList);
      } catch (err) {
        // Try to extract line and column from JSON error message
        const match = err.message.match(/position (\d+)/i);
        const pos = match ? parseInt(match[1], 10) : null;
        let line = 1;
        let col = 1;
        if (pos !== null) {
          const lines = trimmed.slice(0, pos).split("\n");
          line = lines.length;
          col = lines[lines.length - 1].length + 1;
        }

        setValidationErrors([
          {
            line,
            col,
            field: "syntax",
            message: `JSON Syntax Error at Line ${line}, Col ${col}: ${err.message}`,
          },
        ]);
      }
    } else {
      // Raw Text parsing mode: treat lines starting with Unit/Chapter as units
      const lines = trimmed.split("\n").map((l) => l.trim()).filter(Boolean);
      const units = [];
      let currentUnit = null;

      lines.forEach((line) => {
        if (/^unit\s*\d+/i.test(line) || /^இயல்\s*\d+/i.test(line) || /^chapter\s*\d+/i.test(line)) {
          currentUnit = { unit: line, topics: [] };
          units.push(currentUnit);
        } else if (currentUnit) {
          currentUnit.topics.push(line.replace(/^[-*•\d.]+\s*/, ""));
        } else {
          currentUnit = { unit: "General Syllabus Topics", topics: [line] };
          units.push(currentUnit);
        }
      });

      if (units.length === 0) {
        setValidationErrors([{ line: 1, field: "text", message: "Could not parse any units or topics from the pasted text." }]);
        return;
      }

      const generatedSubject = {
        subject: "Custom Imported Subject",
        prepClass: 12,
        label: "Imported Syllabus Outline",
        units: units,
        rawText: trimmed,
      };

      setParsedData([generatedSubject]);
    }
  };

  // Convert parsed units into standard text outline
  const formatSyllabusText = (subject) => {
    return subject.units
      .map((u) => {
        const topicsStr = Array.isArray(u.topics) && u.topics.length > 0 ? ` (${u.topics.join(", ")})` : "";
        return `${u.unit}${topicsStr}`;
      })
      .join("\n");
  };

  // Save to presets and database
  const handleSaveToPresets = async () => {
    if (!parsedData || parsedData.length === 0) return;
    setSaving(true);
    setSuccessMsg("");
    setValidationErrors([]);

    try {
      // 1. Transform parsed data into database schema accepted by /api/admin/import
      const importPayload = parsedData.map((sub) => {
        const codePrefix = sub.subject.slice(0, 3).toUpperCase();
        const code = `${codePrefix}-${sub.prepClass || 12}`;
        return {
          subjectCode: code,
          name: sub.subject,
          prepClass: sub.prepClass || 12,
          medium: "English",
          units: sub.units.map((u, idx) => ({
            unitNumber: idx + 1,
            title: u.unit,
            chapters: (u.topics || []).map((t, tIdx) => ({
              chapterNumber: tIdx + 1,
              title: typeof t === "string" ? t : JSON.stringify(t),
            })),
          })),
        };
      });

      // 2. Persist to SQLite DB via /api/admin/import
      const res = await fetch("/api/admin/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "syllabus",
          data: importPayload,
        }),
      });

      // 3. Cache into localStorage for persistent client presets
      const newPresets = parsedData.map((sub) => ({
        subject: sub.subject,
        code: `${sub.subject.slice(0, 3).toUpperCase()}-${sub.prepClass || 12}`,
        prepClass: sub.prepClass || 12,
        label: sub.label || `Class ${sub.prepClass} ${sub.subject} (Imported)`,
        text: formatSyllabusText(sub),
        units: sub.units,
      }));

      try {
        const stored = localStorage.getItem("coe_custom_syllabus_presets");
        const existing = stored ? JSON.parse(stored) : [];
        const merged = [...existing, ...newPresets];
        localStorage.setItem("coe_custom_syllabus_presets", JSON.stringify(merged));
      } catch (lsErr) {
        console.warn("Could not cache presets to localStorage:", lsErr);
      }

      setSuccessMsg(`Successfully saved ${parsedData.length} subject syllabus preset(s)! They are now available in your Subject Picker.`);
      
      // Notify parent component
      if (onSyllabusImported) {
        onSyllabusImported(newPresets);
      }

      // Auto-apply first imported syllabus to form
      if (onApplySyllabus && newPresets.length > 0) {
        onApplySyllabus(newPresets[0]);
      }
    } catch (err) {
      setValidationErrors([{ line: 0, field: "api", message: `Save error: ${err.message}` }]);
    } finally {
      setSaving(false);
    }
  };

  const handleLoadSample = () => {
    setInputText(JSON.stringify(SAMPLE_JSON_SINGLE, null, 2));
    setValidationErrors([]);
    setSuccessMsg("");
  };

  return (
    <Card className="p-4 sm:p-5 border-border space-y-4 text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <h3 className="text-sm font-bold text-foreground">
            Paste Syllabus (JSON or Text)
          </h3>
          <Badge variant="emerald">Multi-Subject Support</Badge>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={handleLoadSample}
            className="text-[11px] gap-1 text-muted-foreground hover:text-foreground touch-target"
          >
            <Copy className="w-3.5 h-3.5" /> Load Example JSON
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => setShowSample(!showSample)}
            className="text-[11px] gap-1 text-muted-foreground hover:text-foreground touch-target"
          >
            <Code className="w-3.5 h-3.5" /> {showSample ? "Hide Schema" : "View Schema"}
          </Button>
        </div>
      </div>

      {/* Schema Explanation Modal/Drawer */}
      {showSample && (
        <div className="p-3.5 rounded-xl bg-secondary/80 border border-border text-[11px] space-y-2">
          <div className="font-semibold text-foreground flex items-center justify-between">
            <span>Expected JSON Format (Single Object or Array):</span>
            <Badge variant="cyan">Class 10 &amp; 12 Supported</Badge>
          </div>
          <pre className="p-2.5 rounded-lg bg-background font-mono text-[10px] text-emerald-300 overflow-x-auto leading-relaxed border border-border">
{`{
  "subject": "Commerce",
  "prepClass": 12,
  "label": "Class 12 Commerce (Tamil Nadu Board)",
  "units": [
    {
      "unit": "Unit 1: Principles of Management",
      "topics": ["Taylor's Scientific Management", "Fayol's 14 Principles", "Management by Objectives"]
    },
    {
      "unit": "Unit 2: Financial Markets",
      "topics": ["Money Market vs Capital Market", "Stock Exchanges (NSE, BSE)", "SEBI Functions"]
    }
  ]
}`}
          </pre>
        </div>
      )}

      {/* Paste Textarea */}
      <div className="space-y-1.5">
        <label className="block text-muted-foreground font-semibold text-[11px]">
          Paste JSON Object/Array or Structured Text Syllabus:
        </label>
        <textarea
          rows={6}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Paste JSON like { "subject": "Physics", "prepClass": 12, "units": [...] } or raw text syllabus...`}
          className="w-full px-3 py-2.5 rounded-xl bg-secondary border border-border text-foreground font-mono text-xs leading-relaxed focus:border-emerald-500 transition-colors"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <Button
          type="button"
          onClick={handleValidateAndPreview}
          className="touch-target px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white gap-1.5 shadow-md shadow-indigo-600/20"
        >
          <Sparkles className="w-4 h-4" /> Validate &amp; Preview
        </Button>

        {parsedData && (
          <Button
            type="button"
            onClick={handleSaveToPresets}
            disabled={saving}
            className="touch-target px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5 shadow-md shadow-emerald-600/20"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Saving Syllabus...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save {parsedData.length} Subject(s) to Presets
              </>
            )}
          </Button>
        )}
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-1.5">
          <div className="font-bold flex items-center gap-1.5 text-rose-400">
            <AlertCircle className="w-4 h-4" /> Validation Failed ({validationErrors.length} issue{validationErrors.length > 1 ? "s" : ""}):
          </div>
          <ul className="list-disc list-inside space-y-1 text-[11px]">
            {validationErrors.map((err, idx) => (
              <li key={idx}>
                {err.line > 0 && <span className="font-mono text-rose-200">[Line {err.line}{err.col ? `, Col ${err.col}` : ""}]: </span>}
                <span className="font-semibold text-rose-100">{err.field}: </span>
                {err.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Success Banner */}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Parsed Preview Table & Accordion */}
      {parsedData && parsedData.length > 0 && (
        <div className="p-3.5 rounded-xl bg-secondary/50 border border-border space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-foreground text-xs flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-cyan-400" /> Parsed Syllabus Preview ({parsedData.length} Subject{parsedData.length > 1 ? "s" : ""})
            </span>
            <Badge variant="cyan">Ready to Import</Badge>
          </div>

          <div className="space-y-3">
            {parsedData.map((sub, sIdx) => (
              <div key={sIdx} className="p-3 rounded-lg bg-background/80 border border-border space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-2">
                  <div>
                    <span className="font-bold text-foreground text-xs">{sub.subject}</span>
                    <span className="text-[10px] text-muted-foreground ml-2">Class {sub.prepClass} · {sub.units?.length || 0} Units</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={() => onApplySyllabus && onApplySyllabus({
                      subject: sub.subject,
                      prepClass: sub.prepClass,
                      text: formatSyllabusText(sub),
                    })}
                    className="text-[10px] text-amber-400 hover:text-amber-300 gap-1 touch-target"
                  >
                    Use in Exam Generator →
                  </Button>
                </div>

                {/* Unit List */}
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {sub.units.map((u, uIdx) => (
                    <div key={uIdx} className="p-2 rounded bg-secondary/60 text-[11px] space-y-1">
                      <div className="font-semibold text-foreground flex items-center justify-between">
                        <span>{u.unit}</span>
                        <span className="text-[10px] text-muted-foreground">{u.topics?.length || 0} topics</span>
                      </div>
                      {Array.isArray(u.topics) && u.topics.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {u.topics.map((t, tIdx) => (
                            <span key={tIdx} className="px-1.5 py-0.5 rounded bg-background text-[10px] text-muted-foreground font-mono">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

export default SyllabusPastePanel;
