"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Bot,
  Sparkles,
  ArrowLeft,
  Send,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Loader2,
  RefreshCw,
  Flame,
  Award,
  FileText,
  SlidersHorizontal,
  ChevronRight,
  Calculator,
} from "lucide-react";
import ChatBubble from "@/components/ai/ChatBubble";
import MathRenderer from "@/components/ai/MathRenderer";
import SocraticHintButton from "@/components/ai/SocraticHintButton";

export default function AiCoachPage() {
  const [subjectCode, setSubjectCode] = useState("MAT-12");
  const [language, setLanguage] = useState("ta");
  const [studentName, setStudentName] = useState("மாணவர்");
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [statusStep, setStatusStep] = useState("");
  const [diagnostics, setDiagnostics] = useState(null);
  const [isScratchpadOpen, setIsScratchpadOpen] = useState(false);
  const [scratchpadText, setScratchpadText] = useState("");
  const [isFeatureEnabled, setIsFeatureEnabled] = useState(true);

  const messagesEndRef = useRef(null);

  // Load student profile & status
  useEffect(() => {
    // Check feature toggle
    fetch("/api/ai/status")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.enabled !== undefined) {
          setIsFeatureEnabled(data.enabled);
        }
      })
      .catch(() => {});

    // Check student session
    fetch("/api/student/dashboard")
      .then((res) => res.json())
      .then((data) => {
        if (data?.profile?.fullName) {
          setStudentName(data.profile.fullName);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch diagnostics for selected subject
  useEffect(() => {
    fetch(`/api/ai/diagnostic?subjectCode=${subjectCode}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.success) {
          setDiagnostics(data);
        }
      })
      .catch(() => {});
  }, [subjectCode]);

  // Initial welcome message per subject
  useEffect(() => {
    const isTa = language === "ta";
    const welcome = isTa
      ? `வணக்கம் மதிப்புமிக்க அன்பு மாணவர் ${studentName}! 

நான் உங்கள் தமிழ்நாடு மாநிலக் கல்வி வாரிய (சமச்சீர் கல்வி) **${subjectCode}** தனிப்பயன் AI கல்வி ஆலோசகர். 

உங்களுக்கு உதவக்கூடிய பகுதிகள்:
1. 🎯 **பாட வாரியான பலவீன பகுதிகளை சரிசெய்தல்** (Weakness Mastery)
2. 📐 **முக்கிய தேற்றங்கள் & சூத்திரங்களின் விளக்கம்** (KaTeX Formula Cards)
3. 💡 **படிப்படியான சோக்ரடீஸ் முறை கணக்கீட்டு வழிகாட்டல்**

உங்கள் சந்தேகத்தை கீழே உள்ள பெட்டியில் தட்டச்சு செய்யுங்கள்!`
      : `Greetings, esteemed student ${studentName}! 

I am your dedicated Tamil Nadu State Board (Samacheer Kalvi) **${subjectCode}** AI Academic Coach. 

How I can empower your preparation:
1. 🎯 **Targeted Weakness Remediation** based on your diagnostic metrics
2. 📐 **Step-by-step KaTeX Formula & Proof Derivations**
3. 💡 **Zero-Leak Socratic Problem Solving**

Type your question below or click on any recommended weak chapter!`;

    setMessages([
      {
        role: "assistant",
        content: welcome,
        timestamp: Date.now(),
      },
    ]);
  }, [subjectCode, language, studentName]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, statusStep]);

  const handleSendMessage = async (textToSend = null) => {
    const text = textToSend || inputMessage.trim();
    if (!text) return;

    setMessages((prev) => [
      ...prev,
      { role: "user", content: text, timestamp: Date.now() },
    ]);
    if (!textToSend) setInputMessage("");

    setIsLoading(true);
    setStatusStep(
      language === "ta"
        ? "🔍 தமிழ்நாடு சமச்சீர் கல்வி பாடத்திட்டம் ஸ்கேன் செய்யப்படுகிறது..."
        : "🔍 Scanning Samacheer Kalvi syllabus & textbook vectors..."
    );

    try {
      const t1 = setTimeout(() => {
        setStatusStep(
          language === "ta"
            ? "📑 தொடர்புடைய பாடப்பகுதி சூத்திரங்கள் கண்டறியப்பட்டன..."
            : "📑 Relevant textbook theorems and formulas retrieved..."
        );
      }, 700);

      const t2 = setTimeout(() => {
        setStatusStep(
          language === "ta"
            ? "🧠 சோக்ரடீஸ் கற்பித்தல் முறை மூலம் கணித விடை தொகுக்கப்படுகிறது..."
            : "🧠 Formulating Socratic explanation & KaTeX typesetting..."
        );
      }, 1500);

      const res = await fetch("/api/ai/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          subjectCode,
          language,
          history: messages,
          mode: "chat",
          studentName,
        }),
      });

      clearTimeout(t1);
      clearTimeout(t2);

      const data = await res.json();

      if (res.ok && data.success) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.reply,
            timestamp: Date.now(),
            sources: data.sources,
          },
        ]);
      } else {
        if (data?.disabled) setIsFeatureEnabled(false);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.error || "மன்னிக்கவும், பதிலை தயாரிப்பதில் பிழை ஏற்பட்டது.",
            timestamp: Date.now(),
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "இணைய இணைப்பில் சிக்கல் உள்ளது. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
      setStatusStep("");
    }
  };

  const subjectOptions = [
    { code: "MAT-12", name: "12th Mathematics / கணிதம்" },
    { code: "PHY-12", name: "12th Physics / இயற்பியல்" },
    { code: "CHE-12", name: "12th Chemistry / வேதியியல்" },
    { code: "CSC-12", name: "12th Computer Science" },
    { code: "MAT-10", name: "10th Mathematics / கணிதம்" },
    { code: "SCI-10", name: "10th Science / அறிவியல்" },
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="border-b border-cyan-500/20 bg-slate-900/70 backdrop-blur-md px-6 py-3.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/student/dashboard"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition border border-slate-700/60"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {language === "ta" ? "முகப்பு" : "Dashboard"}
          </Link>
          <div className="h-4 w-[1px] bg-slate-700" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/25">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-wide flex items-center gap-2">
                <span>{language === "ta" ? "AI கல்வி பயிற்சியாளர் & வழிகாட்டி" : "AI Academic Coach & Diagnostic Workspace"}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                  Gemini 1.5 Flash
                </span>
              </h1>
            </div>
          </div>
        </div>

        {/* Controls: Subject, Language, Scratchpad */}
        <div className="flex items-center gap-3">
          {/* Subject Dropdown */}
          <select
            value={subjectCode}
            onChange={(e) => setSubjectCode(e.target.value)}
            className="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-cyan-300 font-semibold focus:border-cyan-500 outline-none"
          >
            {subjectOptions.map((s) => (
              <option key={s.code} value={s.code}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(language === "ta" ? "en" : "ta")}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-cyan-300 transition"
          >
            {language === "ta" ? "தமிழ் (TA)" : "English (EN)"}
          </button>

          {/* Scratchpad Toggle */}
          <button
            onClick={() => setIsScratchpadOpen(!isScratchpadOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
              isScratchpadOpen
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50"
                : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>{language === "ta" ? "குறிப்பேடு" : "Scratchpad"}</span>
          </button>
        </div>
      </header>

      {/* Main 2-Column Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
        {/* Left Column (5 Cols): Diagnostics & Weakness Radar */}
        <div className="lg:col-span-5 flex flex-col gap-4 overflow-y-auto pr-1">
          {/* Respectful Student Card */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/20 card-glow backdrop-blur-md">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                {language === "ta" ? "மாணவர் சுயவிவரம்" : "Student Profile"}
              </span>
              <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {language === "ta" ? "அங்கீகரிக்கப்பட்டது" : "Verified Candidate"}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white mb-1">
              {language === "ta" ? `அன்புள்ள ${studentName}` : `Dear Student ${studentName}`}
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              {language === "ta"
                ? "உங்கள் தேர்வு முடிவுகள் மற்றும் பயிற்சி முயற்சிகளின் அடிப்படையில் தனிப்பயனாக்கப்பட்ட கல்வி பகுப்பாய்வு."
                : "Personalized academic diagnostic based on your continuous CBT practice assessments."}
            </p>
          </div>

          {/* Weakness Breakdown Card */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-rose-500/20 card-glow backdrop-blur-md">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-rose-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                {language === "ta" ? "கவனம் தேவைப்படும் அலகுகள்" : "Target Weakness Units"}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                priorityRanking.js
              </span>
            </div>

            {diagnostics?.weakestUnits ? (
              <div className="space-y-2.5">
                {diagnostics.weakestUnits.map((u, i) => (
                  <div
                    key={i}
                    onClick={() =>
                      handleSendMessage(
                        language === "ta"
                          ? `${subjectCode} அலகு ${u.unit} (${u.titleTa}): இந்த அலகின் முக்கிய தேற்றங்கள் மற்றும் அடிக்கடி கேட்கப்படும் வினாக்களுக்கு வழிகாட்டவும்.`
                          : `Please guide me on ${subjectCode} Unit ${u.unit} (${u.title}): What are the core formulas and common exam traps?`
                      )
                    }
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900 transition cursor-pointer group"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-200 group-hover:text-cyan-300">
                        Unit {u.unit}: {language === "ta" ? u.titleTa : u.title}
                      </span>
                      <span className="text-[10px] text-rose-400 font-bold">
                        {u.weight}% {language === "ta" ? "தேர்ச்சி" : "Mastery"}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full"
                        style={{ width: `${u.weight}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                <span>{language === "ta" ? "புள்ளிவிவரங்கள் கணக்கிடப்படுகின்றன..." : "Calculating diagnostics..."}</span>
              </div>
            )}
          </div>

          {/* Quick Formula Starters */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/20 card-glow backdrop-blur-md">
            <span className="text-xs text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1.5 mb-3">
              <Lightbulb className="w-3.5 h-3.5" />
              {language === "ta" ? "விரைவு சூத்திர வழிகாட்டல்" : "Quick Formula Triggers"}
            </span>
            <div className="grid grid-cols-1 gap-2 text-xs">
              <button
                onClick={() =>
                  handleSendMessage(
                    language === "ta"
                      ? "அணிக்கோவையின் நேர்மாறு காணும் சூத்திரம் மற்றும் செங்குத்து அணி பண்புகளை விளக்குக."
                      : "Explain the matrix inverse formula A^{-1} and orthogonal matrix conditions with worked steps."
                  )
                }
                className="text-left p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-300 transition"
              >
                <MathRenderer content={"📐 Matrix Inversion: $A^{-1} = \\frac{1}{|A|}\\text{adj}(A)$"} />
              </button>
              <button
                onClick={() =>
                  handleSendMessage(
                    language === "ta"
                      ? "கலப்பு எண்களின் துருவ வடிவம் மற்றும் டி மாய்வரின் தேற்றத்தை சூத்திரத்துடன் விளக்குக."
                      : "Explain Polar form of complex numbers and De Moivre's Theorem with examples."
                  )
                }
                className="text-left p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-300 transition"
              >
                <MathRenderer content={"🌀 De Moivre's Theorem: $(\\cos\\theta + i\\sin\\theta)^n$"} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (7 Cols): Chat Interface & Optional Scratchpad */}
        <div className="lg:col-span-7 flex flex-col rounded-2xl bg-slate-900/60 border border-cyan-500/20 card-glow backdrop-blur-xl overflow-hidden">
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-800/80 bg-slate-900/90 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-sm text-white">
                {language === "ta" ? "நேரடி சோக்ரடீஸ் கலந்துரையாடல்" : "Socratic Interactive Session"}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              powered by aknex-official.vercel.app
            </span>
          </div>

          {/* Optional Scratchpad Drawer */}
          {isScratchpadOpen && (
            <div className="p-3 bg-slate-950/95 border-b border-cyan-800/40 text-xs shrink-0">
              <div className="flex items-center justify-between text-cyan-400 mb-1">
                <span className="font-semibold flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5" />
                  {language === "ta" ? "கணித குறிப்பேடு (Scratchpad)" : "Calculation Scratchpad"}
                </span>
                <button
                  onClick={() => setScratchpadText("")}
                  className="text-[10px] text-rose-400 hover:underline"
                >
                  Clear
                </button>
              </div>
              <textarea
                value={scratchpadText}
                onChange={(e) => setScratchpadText(e.target.value)}
                placeholder={
                  language === "ta"
                    ? "கணக்கீடுகள், சூத்திரங்கள் அல்லது தற்காலிக குறிப்புகளை இங்கே எழுதலாம்..."
                    : "Jot down intermediate calculations or formula scratchwork here..."
                }
                rows={3}
                className="w-full bg-slate-900/90 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[380px]">
            {messages.map((msg, idx) => (
              <ChatBubble key={idx} message={msg} studentName={studentName} />
            ))}

            {/* Smooth generation progression steps */}
            {isLoading && (
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-950/80 border border-cyan-500/30 text-xs text-cyan-300 animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                <span className="font-medium">{statusStep}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-4 border-t border-slate-800 bg-slate-900/90 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                disabled={isLoading || !isFeatureEnabled}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={
                  language === "ta"
                    ? "உங்கள் கணித / அறிவியல் வினாவை தட்டச்சு செய்யுங்கள்..."
                    : "Type your mathematics or science query..."
                }
                className="flex-1 bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder-slate-500 outline-none transition disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isLoading || !inputMessage.trim() || !isFeatureEnabled}
                className="px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-cyan-500/20 transition flex items-center gap-2"
              >
                <span>{language === "ta" ? "அனுப்பு" : "Send"}</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

