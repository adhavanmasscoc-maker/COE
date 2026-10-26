"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import {
  GraduationCap,
  ShieldCheck,
  KeyRound,
  Calendar,
  User,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Lock,
  Loader2,
  UserPlus,
  Languages,
  Hash,
  Sparkles,
  BookOpen,
  FileText,
  Award,
  Zap,
} from "lucide-react";

// ─── Feature pills ──────────────────────────────────────────────────
const features = [
  { icon: BookOpen,  label: "Syllabus Explorer" },
  { icon: FileText,  label: "PYQ Library" },
  { icon: Award,     label: "Live Results" },
  { icon: Zap,       label: "Exam Engine" },
];

// ─── Register Form ──────────────────────────────────────────────────
function RegisterForm({ onBack, initialRollNo = "" }) {
  const [name, setName] = useState("");
  const [rollNo, setRollNo] = useState(initialRollNo);
  const [dob, setDob] = useState("");
  const [currentClass, setCurrentClass] = useState("10");
  const [examPrepClass, setExamPrepClass] = useState("10");
  const [language, setLanguage] = useState("English");
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  // Fetch subjects whenever examPrepClass changes
  useEffect(() => {
    let ignore = false;
    setLoadingSubjects(true);
    fetch(`/api/subjects?prepClass=${examPrepClass}`)
      .then((r) => r.json())
      .then((data) => {
        if (ignore) return;
        if (data?.subjects) {
          setAvailableSubjects(data.subjects);
          // By default, pre-select default core subjects (up to 5 or 6)
          const defaultCodes = data.subjects.slice(0, 6).map((s) => s.code);
          setSelectedSubjects(defaultCodes);
        } else {
          setAvailableSubjects([]);
          setSelectedSubjects([]);
        }
      })
      .catch(() => {})
      .finally(() => { if (!ignore) setLoadingSubjects(false); });

    return () => { ignore = true; };
  }, [examPrepClass]);

  const toggleSubject = (code) => {
    setSelectedSubjects((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  if (done) {
    return (
      <div className="text-center py-8 px-2 space-y-5 animate-scale-in">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-[#f0f0ff] mb-1">Registration Submitted</h3>
          <p className="text-sm text-[#5c5c8a] leading-relaxed">
            Your candidate application is under COE review with {selectedSubjects.length} selected subjects. You&apos;ll be able to sign in once your account is approved.
          </p>
        </div>
        <Button variant="outline" onClick={onBack}>← Back to Sign In</Button>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedSubjects.length === 0) {
      setError("Please select at least 1 subject for your syllabus.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          rollNo,
          dob,
          language,
          currentClass: parseInt(currentClass, 10),
          examPrepClass: parseInt(examPrepClass, 10),
          selectedSubjectCodes: selectedSubjects,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Registration failed."); setLoading(false); return; }
      setDone(true);
    } catch {
      setError("Network error. Try again.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-float-up max-h-[80vh] overflow-y-auto pr-1">
      <div className="text-center mb-4">
        <div className="w-10 h-10 rounded-2xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center mx-auto mb-2">
          <UserPlus className="w-5 h-5 text-violet-400" />
        </div>
        <h2 className="text-lg font-bold text-[#f0f0ff]">Candidate Registration</h2>
        <p className="text-xs text-[#5c5c8a]">Tamil Nadu Samacheer Kalvi · Institutional Examination</p>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-xs text-rose-300">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /><span>{error}</span>
        </div>
      )}

      {[
        { id: "reg-name", label: "Full Name", type: "text", value: name, set: setName, icon: User, placeholder: "e.g. Adhavan S" },
        { id: "reg-roll", label: "Roll Number (4–16 Characters)", type: "text", value: rollNo, set: (v) => setRollNo(v.toUpperCase()), icon: Hash, placeholder: "e.g. TN2026-0901, 1001, or ADHA2026", mono: true, minLength: 4, maxLength: 16 },
        { id: "reg-dob", label: "Date of Birth (YYYY-MM-DD)", type: "date", value: dob, set: setDob, icon: Calendar, mono: true },
      ].map(({ id, label, type, value, set, icon: Icon, placeholder, mono, minLength, maxLength }) => (
        <div key={id}>
          <label htmlFor={id} className="flex items-center gap-1.5 text-xs font-semibold text-[#a8a8d0] mb-1">
            <Icon className="w-3.5 h-3.5 text-violet-400" />{label}
          </label>
          <input
            id={id}
            type={type}
            value={value}
            onChange={(e) => set(e.target.value)}
            required
            minLength={minLength}
            maxLength={maxLength}
            placeholder={placeholder}
            className={`input-field ${mono ? "font-mono text-xs" : "text-xs"}`}
          />
        </div>
      ))}

      {/* Class Level Pickers: 1 to 12 */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-[#a8a8d0] block mb-1">Current Class</label>
          <select
            value={currentClass}
            onChange={(e) => {
              const v = e.target.value;
              setCurrentClass(v);
              // Smart auto-advance suggestion: 9->10, 11->12
              if (v === "9") setExamPrepClass("10");
              else if (v === "11") setExamPrepClass("12");
              else setExamPrepClass(v);
            }}
            className="input-field text-xs cursor-pointer"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((cls) => (
              <option key={cls} value={cls}>Class {cls}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-[#a8a8d0] block mb-1">Exam Prep Level</label>
          <select
            value={examPrepClass}
            onChange={(e) => setExamPrepClass(e.target.value)}
            className="input-field text-xs cursor-pointer"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((cls) => (
              <option key={cls} value={cls}>Class {cls}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Subject Selection (Official TN DGE) */}
      <div className="p-3 rounded-2xl glass-sm border border-violet-500/20 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#f0f0ff] flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-violet-400" />
            Class {examPrepClass} Subjects
          </span>
          <span className="badge badge-violet text-[10px]">{selectedSubjects.length} Selected</span>
        </div>
        <p className="text-[11px] text-[#5c5c8a]">
          Select the official Tamil Nadu DGE curriculum subjects you are appearing for:
        </p>

        {loadingSubjects ? (
          <div className="py-3 text-center text-xs text-[#5c5c8a]">
            <Loader2 className="w-4 h-4 animate-spin text-violet-400 mx-auto mb-1" />
            Loading official subjects...
          </div>
        ) : availableSubjects.length === 0 ? (
          <p className="text-[11px] text-[#5c5c8a] italic">Standard subjects will be mapped upon COE approval.</p>
        ) : (
          <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
            {availableSubjects.map((sub) => {
              const isChecked = selectedSubjects.includes(sub.code);
              return (
                <label
                  key={sub.code}
                  className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-all border ${
                    isChecked
                      ? "bg-violet-500/15 border-violet-500/30 text-violet-200"
                      : "bg-white/[0.02] border-transparent text-[#5c5c8a] hover:bg-white/[0.05]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleSubject(sub.code)}
                      className="rounded border-violet-500/40 text-violet-600 focus:ring-0"
                    />
                    <span className="font-medium text-[#f0f0ff]">{sub.name}</span>
                  </div>
                  <span className="font-mono text-[10px] text-[#5c5c8a]">{sub.code}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <label className="flex items-center gap-1.5 text-xs font-semibold text-[#a8a8d0] mb-1">
          <Languages className="w-3.5 h-3.5 text-violet-400" />Preferred Exam Language
        </label>
        <div className="grid grid-cols-2 gap-2">
          {["English", "Tamil"].map((lang) => (
            <button key={lang} type="button" onClick={() => setLanguage(lang)}
              className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                language === lang
                  ? "bg-violet-500/20 border-violet-400/50 text-violet-200"
                  : "glass-sm text-[#5c5c8a] hover:text-[#a8a8d0]"
              }`}
            >
              {lang === "Tamil" ? "தமிழ்" : "English"}
            </button>
          ))}
        </div>
      </div>

      <p className="text-[10px] text-[#5c5c8a] flex items-center gap-1">
        <Lock className="w-3 h-3 text-emerald-400 flex-shrink-0" /> Encrypted credential storage via salted bcrypt
      </p>

      <Button type="submit" disabled={loading} className="w-full justify-center !py-2.5">
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</> : <>Submit Registration <ArrowRight className="w-4 h-4" /></>}
      </Button>

      <p className="text-center text-xs text-[#5c5c8a]">
        Already registered?{" "}
        <button type="button" onClick={onBack} className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">
          Sign in
        </button>
      </p>
    </form>
  );
}

// ─── Login Panel ────────────────────────────────────────────────────
function LoginPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [tab, setTab] = useState("student"); // student | admin | register
  const [rollNo, setRollNo] = useState("");
  const [dob, setDob] = useState("");
  const [adminUser, setAdminUser] = useState("");
  const [adminPass, setAdminPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isUnregisteredCandidate, setIsUnregisteredCandidate] = useState(false);
  const [registerRollNo, setRegisterRollNo] = useState("");

  useEffect(() => {
    const reason = searchParams.get("reason");
    const err = searchParams.get("error");
    if (reason === "authentication_required") setError("Sign in to access the examination area.");
    else if (reason === "session_expired") setError("Your session expired. Please sign in again.");
    else if (err === "admin_access_denied") setError("Only the COE Administrator may access that area.");
    else if (err === "student_access_denied") setError("Please sign in with a valid student roll number.");
  }, [searchParams]);

  const handleStudentLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError(""); setSuccess(""); setIsUnregisteredCandidate(false);
    try {
      const res = await fetch("/api/auth/login-student", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rollNo, dob }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.isUnregistered) {
          setError(data.error);
          setIsUnregisteredCandidate(true);
          setRegisterRollNo(rollNo);
        } else {
          setError(data.error || "Sign in failed.");
          setIsUnregisteredCandidate(false);
        }
        setLoading(false);
        return;
      }
      setSuccess("Authenticated! Redirecting…");
      setTimeout(() => { router.push("/student/dashboard"); router.refresh(); }, 600);
    } catch { setError("Network error. Try again."); setLoading(false); }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError(""); setSuccess(""); setIsUnregisteredCandidate(false);
    try {
      const res = await fetch("/api/auth/login-admin", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: adminUser, password: adminPass }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Authentication failed."); setLoading(false); return; }
      setSuccess("COE access granted! Redirecting…");
      setTimeout(() => { router.push("/coe-admin/dashboard"); router.refresh(); }, 600);
    } catch { setError("Network error. Try again."); setLoading(false); }
  };

  if (tab === "register") {
    return (
      <RegisterForm
        initialRollNo={registerRollNo}
        onBack={() => {
          setTab("student");
          setError("");
          setIsUnregisteredCandidate(false);
        }}
      />
    );
  }

  return (
    <div className="animate-float-up">
      {/* Tab switcher */}
      <div className="grid grid-cols-2 p-1 glass-sm rounded-2xl mb-6">
        {[
          { key: "student", label: "Student", icon: GraduationCap },
          { key: "admin",   label: "COE Admin", icon: ShieldCheck },
        ].map(({ key, label, icon: Icon }) => (
          <button key={key} type="button" id={`tab-${key}`}
            onClick={() => { setTab(key); setError(""); }}
            className={`flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition-all ${
              tab === key
                ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/30"
                : "text-[#5c5c8a] hover:text-[#a8a8d0]"
            }`}
          >
            <Icon className="w-4 h-4" />{label}
          </button>
        ))}
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-start gap-2 p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/25 text-xs text-rose-300 animate-scale-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /><span>{error}</span>
        </div>
      )}

      {/* Unregistered Candidate Recommendation Banner */}
      {isUnregisteredCandidate && (
        <div className="p-3.5 mb-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-2.5 animate-scale-in">
          <div className="flex items-center gap-2 font-bold text-xs text-amber-300">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Recommended: Register Candidate Account First
          </div>
          <p className="text-[11px] text-[#a8a8d0] leading-relaxed">
            Roll Number <strong>{registerRollNo}</strong> is not yet enrolled in the COE database. To ensure examinations, syllabus, and results reach you, please register as a student first.
          </p>
          <Button
            type="button"
            size="sm"
            variant="warning"
            onClick={() => {
              setTab("register");
              setError("");
              setIsUnregisteredCandidate(false);
            }}
            className="w-full justify-center gap-1.5 font-bold shadow-md shadow-amber-500/20"
          >
            <UserPlus className="w-3.5 h-3.5" /> Register This Candidate Now →
          </Button>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-300 font-medium animate-scale-in">
          <CheckCircle2 className="w-4 h-4" /><span>{success}</span>
        </div>
      )}

      {/* Student Form */}
      {tab === "student" && (
        <form onSubmit={handleStudentLogin} className="space-y-4">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-[#f0f0ff]">Student Sign In</h2>
            <p className="text-xs text-[#5c5c8a] mt-0.5">Use your Roll Number and Date of Birth</p>
          </div>

          <div>
            <label htmlFor="student-roll-no" className="flex items-center gap-1.5 text-xs font-semibold text-[#a8a8d0] mb-1.5">
              <User className="w-3.5 h-3.5 text-violet-400" />Roll Number
            </label>
            <input id="student-roll-no" type="text" value={rollNo}
              onChange={(e) => setRollNo(e.target.value)} required
              placeholder="e.g. TN2026-0901" className="input-field font-mono" />
          </div>

          <div>
            <label htmlFor="student-dob" className="flex items-center gap-1.5 text-xs font-semibold text-[#a8a8d0] mb-1.5">
              <Calendar className="w-3.5 h-3.5 text-violet-400" />Date of Birth
            </label>
            <input id="student-dob" type="date" value={dob}
              onChange={(e) => setDob(e.target.value)} required className="input-field font-mono" />
            <p className="text-[11px] text-[#5c5c8a] mt-1.5 flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-400" />Hashed with bcrypt — never stored as plaintext
            </p>
          </div>

          <Button id="btn-student-login" type="submit" disabled={loading} className="w-full justify-center !py-2.5">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Authenticating…</> : <>Enter Student Portal <ArrowRight className="w-4 h-4" /></>}
          </Button>

          <p className="text-center text-xs text-[#5c5c8a]">
            New student?{" "}
            <button type="button" id="btn-go-register" onClick={() => { setTab("register"); setError(""); }}
              className="text-violet-400 hover:text-violet-300 font-semibold transition-colors inline-flex items-center gap-1">
              <UserPlus className="w-3 h-3" />Register here
            </button>
          </p>
        </form>
      )}

      {/* Admin Form */}
      {tab === "admin" && (
        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-[#f0f0ff]">COE Administration</h2>
            <p className="text-xs text-[#5c5c8a] mt-0.5">Controller of Examinations secure access</p>
          </div>

          <div>
            <label htmlFor="coe-username" className="flex items-center gap-1.5 text-xs font-semibold text-[#a8a8d0] mb-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />COE Admin Username
            </label>
            <input id="coe-username" type="text" value={adminUser}
              onChange={(e) => setAdminUser(e.target.value)} required
              placeholder="e.g. 1" autoComplete="username" className="input-field font-mono" />
          </div>

          <div>
            <label htmlFor="coe-password" className="flex items-center gap-1.5 text-xs font-semibold text-[#a8a8d0] mb-1.5">
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />Master Passphrase
            </label>
            <input id="coe-password" type="password" value={adminPass}
              onChange={(e) => setAdminPass(e.target.value)} required
              placeholder="Passphrase" autoComplete="current-password" className="input-field font-mono" />
          </div>

          <Button id="btn-coe-login" type="submit" variant="amber" disabled={loading} className="w-full justify-center !py-2.5">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Verifying…</> : <>Access Control Center <ArrowRight className="w-4 h-4" /></>}
          </Button>
        </form>
      )}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left — Hero Panel */}
      <div className="relative flex-1 flex flex-col justify-center px-8 py-16 lg:px-16 overflow-hidden">
        {/* Decorative orbs */}
        <div className="orb w-80 h-80 bg-violet-600/30 top-[-5%] left-[-10%]" />
        <div className="orb w-60 h-60 bg-indigo-600/20 bottom-[10%] right-[-5%]" />
        <div className="orb w-40 h-40 bg-cyan-500/15 top-[40%] left-[30%]" />

        <div className="relative z-10 max-w-xl">
          {/* Brand badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-sm border border-violet-500/30 mb-6 animate-float-up">
            <span className="dot-live" />
            <span className="text-xs font-semibold text-violet-300">Tamil Nadu Samacheer Kalvi</span>
          </div>

          <h1 className="text-4xl lg:text-6xl font-black text-[#f0f0ff] leading-tight mb-4 animate-float-up" style={{ animationDelay: "60ms" }}>
            Aknex{" "}
            <span className="gradient-text">COE</span>
            <br />
            <span className="text-3xl lg:text-5xl text-[#a8a8d0] font-bold">Exam Portal</span>
          </h1>

          <p className="text-base text-[#5c5c8a] leading-relaxed mb-8 max-w-sm animate-float-up" style={{ animationDelay: "120ms" }}>
            A secure, institutional examination management system supervised by the Controller of Examinations. Class 10 &amp; 12 preparation.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 stagger animate-float-up" style={{ animationDelay: "180ms" }}>
            {features.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass-sm border border-violet-500/15 text-xs font-medium text-[#a8a8d0]">
                <Icon className="w-3.5 h-3.5 text-violet-400" />{label}
              </div>
            ))}
          </div>

          {/* Board info */}
          <div className="mt-10 flex items-center gap-3 animate-float-up" style={{ animationDelay: "240ms" }}>
            <div className="flex -space-x-2">
              {["10", "12"].map((cls) => (
                <div key={cls} className="w-9 h-9 rounded-xl glass border border-violet-500/30 flex items-center justify-center text-xs font-bold text-violet-300">
                  {cls}
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs font-semibold text-[#f0f0ff]">Class 10 &amp; Class 12</p>
              <p className="text-[11px] text-[#5c5c8a]">State Board Preparation</p>
            </div>
            <div className="ml-4 w-px h-8 bg-violet-500/20" />
            <div>
              <p className="text-xs font-semibold text-[#f0f0ff]">Bilingual</p>
              <p className="text-[11px] text-[#5c5c8a]">English / தமிழ்</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right — Auth Panel */}
      <div className="flex items-center justify-center px-6 py-12 lg:py-0 lg:w-[440px] lg:min-h-screen bg-[rgba(13,13,26,0.6)] border-t lg:border-t-0 lg:border-l border-[rgba(124,58,237,0.15)]">
        <div className="w-full max-w-sm">
          {/* Auth card */}
          <div className="glass rounded-3xl p-8 border border-[rgba(124,58,237,0.25)] shadow-2xl shadow-violet-950/50">
            <Suspense fallback={
              <div className="py-12 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-violet-400 mx-auto mb-2" />
                <p className="text-xs text-[#5c5c8a]">Loading…</p>
              </div>
            }>
              <LoginPanel />
            </Suspense>
          </div>

          {/* Footer */}
          <p className="text-center text-[11px] text-[#5c5c8a] mt-5">
            Aknex COE &copy; {new Date().getFullYear()} — Examination Management System
          </p>
        </div>
      </div>
    </div>
  );
}
