"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  BookOpen, FileText, ArrowLeft, Sparkles, Download, CheckCircle2,
  FolderArchive, Search, Eye, ArrowUpRight, Copy, Loader2
} from "lucide-react";

export default function CurriculumRepositoryPage() {
  const router = useRouter();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [contentLoading, setContentLoading] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/curriculum");
      const data = await res.json();
      if (res.ok && data.files) {
        setFiles(data.files);
        if (data.files.length > 0) {
          loadFileContent(data.files[0].name);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadFileContent = async (filename) => {
    setSelectedFile(filename);
    setContentLoading(true);
    try {
      const res = await fetch(`/api/admin/curriculum?file=${encodeURIComponent(filename)}`);
      const data = await res.json();
      if (res.ok && data.content) {
        setFileContent(data.content);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setContentLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(fileContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendToExamSetter = () => {
    // Store in sessionStorage and navigate
    sessionStorage.setItem("coe_prefill_syllabus", fileContent);
    sessionStorage.setItem("coe_prefill_source", selectedFile || "Curriculum Repository");
    router.push("/coe-admin/ai-questions");
  };

  const filteredFiles = files.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminGuard>
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-secondary/80 border border-border">
          <div className="flex items-center gap-3">
            <Link
              href="/coe-admin/dashboard"
              className="p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-card transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-foreground">Curriculum &amp; Syllabus Repository</h1>
                <Badge variant="success">Server Archive</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Official Tamil Nadu Samacheer Kalvi blueprints, past papers (2020–2026), and subject syllabi stored locally on server
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleSendToExamSetter}
              disabled={!fileContent}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold gap-2 text-xs shadow-lg shadow-amber-500/20"
            >
              <Sparkles className="w-4 h-4" /> Send to AI Question Setter
            </Button>
          </div>
        </div>

        {/* Search & Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-3 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search syllabus documents, chapters, subjects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:border-amber-400"
            />
          </div>
          <div className="flex items-center justify-between px-4 py-2 rounded-xl bg-secondary/50 border border-border text-xs text-muted-foreground">
            <span>Archived Documents:</span>
            <span className="font-bold text-foreground">{files.length}</span>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* File List (Left Col) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">
              Curriculum Files (data/curriculum)
            </div>
            {loading ? (
              <div className="flex items-center justify-center p-8 text-muted-foreground text-xs gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" /> Loading curriculum library...
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground bg-secondary/40 rounded-xl border border-border">
                No matching curriculum documents found.
              </div>
            ) : (
              filteredFiles.map((file) => {
                const isSelected = selectedFile === file.name;
                return (
                  <button
                    key={file.name}
                    onClick={() => loadFileContent(file.name)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex flex-col gap-1.5 ${
                      isSelected
                        ? "bg-amber-500/15 border-amber-500/40 text-amber-200 shadow-md shadow-amber-500/5"
                        : "bg-secondary/40 border-border hover:bg-secondary/80 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 font-mono text-xs font-bold truncate">
                        <FileText className={`w-4 h-4 flex-shrink-0 ${isSelected ? "text-amber-400" : "text-sky-400"}`} />
                        <span className="truncate">{file.name}</span>
                      </div>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-background border border-border">
                        {file.type}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] opacity-75">
                      <span>{file.category}</span>
                      <span>{(file.sizeBytes / 1024).toFixed(1)} KB</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Document Viewer (Right Col) */}
          <div className="lg:col-span-8">
            <Card className="p-5 border-border space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span className="font-mono text-xs font-bold text-foreground">
                    {selectedFile || "Select a document to preview"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCopyToClipboard}
                    disabled={!fileContent}
                    className="text-xs gap-1.5 text-muted-foreground hover:text-foreground"
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy Text
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSendToExamSetter}
                    disabled={!fileContent}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs gap-1"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" /> Use in Exam Setter
                  </Button>
                </div>
              </div>

              {contentLoading ? (
                <div className="flex items-center justify-center p-16 text-muted-foreground text-xs gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-amber-400" /> Loading document contents...
                </div>
              ) : !fileContent ? (
                <div className="p-12 text-center text-xs text-muted-foreground">
                  Select a curriculum markdown or JSON blueprint from the left panel to inspect.
                </div>
              ) : (
                <div className="rounded-xl bg-background/80 border border-border/80 p-4 font-mono text-[11.5px] leading-relaxed max-h-[600px] overflow-y-auto whitespace-pre-wrap text-foreground">
                  {fileContent}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
