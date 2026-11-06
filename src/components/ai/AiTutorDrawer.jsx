"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Bot,
  Sparkles,
  X,
  Send,
  HelpCircle,
  RotateCcw,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronRight,
  Maximize2,
  Minimize2,
} from "lucide-react";
import ChatBubble from "./ChatBubble";
import SocraticHintButton from "./SocraticHintButton";
import MathRenderer from "./MathRenderer";
import LiveVoiceMic from "./LiveVoiceMic";

export default function AiTutorDrawer({
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
  activeQuestion = null,
  subjectCode = "MAT-12",
  studentName = "மாணவர்",
  language = "ta",
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalOpen;
  const onClose = controlledOnClose || (() => setInternalOpen(false));

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [statusStep, setStatusStep] = useState("");
  const [isFeatureEnabled, setIsFeatureEnabled] = useState(true);
  const [activeHintLevel, setActiveHintLevel] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeLang, setActiveLang] = useState(language);

  useEffect(() => {
    setActiveLang(language);
  }, [language]);

  const messagesEndRef = useRef(null);

  // Check if AI feature is enabled
  useEffect(() => {
    fetch("/api/ai/status")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.enabled !== undefined) {
          setIsFeatureEnabled(data.enabled);
        }
      })
      .catch(() => setIsFeatureEnabled(true));
  }, []);

  // Initialize greeting when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const isTa = language === "ta";
      const welcome = isTa
        ? `வணக்கம் அன்பு மாணவர் ${studentName}! நான் உங்கள் சமச்சீர் கல்வி AI கல்வி ஆலோசகர். 

வினாக்களுக்கு நேரடி விடையைக் கூறாமல், படிப்படியான கணித மற்றும் அறிவியல் வழிகாட்டலை உங்களுக்கு வழங்குவேன். 

கீழே உள்ள **நிலை 1, 2, 3 குறிப்புகளைப்** பயன்படுத்தவும் அல்லது உங்கள் சந்தேகங்களை நேரடியாக கேட்கவும்!`
        : `Greetings, dear student ${studentName}! I am your Samacheer Kalvi AI Academic Coach. 

I provide step-by-step Socratic guidance and mathematical reasoning without spoiling the final answer. 

Use the **3-level hint ladder** below or type your question directly!`;

      setMessages([
        {
          role: "assistant",
          content: welcome,
          timestamp: Date.now(),
        },
      ]);
    }
  }, [isOpen, language, studentName, messages.length]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, statusStep]);

  const handleSendMessage = async (textToSend = null, mode = "chat", hintLevel = 1) => {
    const text = textToSend || inputMessage.trim();
    if (!text && mode === "chat") return;

    if (mode === "chat") {
      setMessages((prev) => [
        ...prev,
        { role: "user", content: text, timestamp: Date.now() },
      ]);
      setInputMessage("");
    }

    setIsLoading(true);
    setStatusStep(
      language === "ta"
        ? "🔍 தமிழ்நாடு பாடத்திட்டம் ஸ்கேன் செய்யப்படுகிறது..."
        : "🔍 Scanning Samacheer Kalvi syllabus..."
    );

    try {
      // Progression simulation
      const t1 = setTimeout(() => {
        setStatusStep(
          language === "ta"
            ? "📑 பாடப்புத்தக பகுதிகள் கண்டறியப்பட்டன..."
            : "📑 Syllabus reference chunks retrieved..."
        );
      }, 700);

      const t2 = setTimeout(() => {
        setStatusStep(
          language === "ta"
            ? "🧠 சோக்ரடீஸ் கற்பித்தல் முறை மூலம் விடை தொகுக்கப்படுகிறது..."
            : "🧠 Formulating Socratic explanation & KaTeX math..."
        );
      }, 1500);

      const res = await fetch("/api/ai/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          subjectCode,
          currentQuestionContext: activeQuestion
            ? {
                questionText: activeQuestion.questionText || activeQuestion.question_en || activeQuestion.question,
                options: activeQuestion.options,
                userAnswer: activeQuestion.userAnswer || activeQuestion.selectedOption,
                questionNumber: activeQuestion.questionNumber || activeQuestion.id,
              }
            : null,
          language: activeLang,
          history: messages,
          mode,
          hintLevel,
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
        if (data?.disabled) {
          setIsFeatureEnabled(false);
        }
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.error || "வழிகாட்டலை தயாரிப்பதில் சிரமம் ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.",
            timestamp: Date.now(),
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "இணைப்பில் பிழை ஏற்பட்டது. தயவுசெய்து சிறிது நேரம் கழித்து மீண்டும் முயற்சிக்கவும்.",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
      setStatusStep("");
    }
  };

  const handleTriggerHint = (level) => {
    setActiveHintLevel(level);
    handleSendMessage(
      `Please provide Level ${level} Socratic hint for the active question.`,
      "hint",
      level
    );
  };

  return (
    <>
      {/* Floating Action Trigger Button when drawer is closed */}
      {!isOpen && (
        <button
          onClick={() => setInternalOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white font-semibold text-sm shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105 active:scale-95 transition-all border border-cyan-300/30 group"
          title="Open AI Tutor / AI கல்வி ஆலோசகர்"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-cyan-200 group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse border-2 border-slate-900" />
          </div>
          <span>{language === "ta" ? "AI ஆசிரியர் / உதவி" : "AI Tutor & Hints"}</span>
          <Sparkles className="w-4 h-4 text-amber-300 animate-spin-slow" />
        </button>
      )}

      {/* Slide-over Drawer Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden pointer-events-none">
          {/* Backdrop on mobile */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto md:hidden"
            onClick={onClose}
          />

          <div
            className={`fixed inset-y-0 right-0 pointer-events-auto flex flex-col bg-[#090d16]/95 backdrop-blur-xl border-l border-cyan-500/20 shadow-2xl transition-all duration-300 ${
              isExpanded ? "w-full md:w-[680px]" : "w-full md:w-[420px]"
            }`}
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                      <span>{language === "ta" ? "AI கல்வி வழிகாட்டி" : "AI Socratic Tutor"}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-950/80 text-cyan-400 border border-cyan-800/50">
                        {subjectCode}
                      </span>
                    </h2>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {language === "ta" ? `அன்புடன், ${studentName}` : `Addressing: ${studentName}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition hidden md:block"
                  title={isExpanded ? "Collapse" : "Expand"}
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
                  title="Close Drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Context Header: If active question is present */}
            {activeQuestion && (
              <div className="p-3 bg-slate-900/90 border-b border-cyan-950/60 text-xs shrink-0">
                <div className="flex items-center justify-between text-cyan-400 mb-1">
                  <span className="font-semibold flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    {language === "ta" ? "தற்போதைய வினா சூழல்" : "Active Question Context"}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Q#{activeQuestion.questionNumber || activeQuestion.id || 1}
                  </span>
                </div>
                <p className="text-slate-300 line-clamp-2 italic mb-2">
                  &ldquo;{activeQuestion.questionText || activeQuestion.question_en || activeQuestion.question}&rdquo;
                </p>

                {/* Socratic Hint Ladder */}
                <SocraticHintButton
                  onGetHint={handleTriggerHint}
                  isLoading={isLoading}
                  language={language}
                />
              </div>
            )}

            {/* Feature Disabled Notice */}
            {!isFeatureEnabled && (
              <div className="m-4 p-4 rounded-xl bg-amber-950/30 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold mb-1">
                    {language === "ta" ? "AI ஆசிரியர் தற்காலிகமாக முடக்கப்பட்டுள்ளது" : "AI Tutor Temporarily Paused"}
                  </p>
                  <p className="text-amber-300/80 leading-relaxed">
                    {language === "ta"
                      ? "தேர்வு கட்டுப்பாட்டாளரால் (COE) இந்த அம்சம் தற்காலிகமாக இடைநிறுத்தப்பட்டுள்ளது. மீண்டும் இயக்கப்படும்போது தானாக செயல்படும்."
                      : "This feature has been temporarily paused by the Controller of Examinations (COE). It will resume automatically once re-enabled."}
                  </p>
                </div>
              </div>
            )}

            {/* Chat Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, idx) => (
                <ChatBubble
                  key={idx}
                  message={msg}
                  studentName={studentName}
                />
              ))}

              {/* Status progression indicator */}
              {isLoading && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-cyan-500/20 text-xs text-cyan-300 animate-pulse">
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                  <span className="font-medium">{statusStep}</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Footer Input Area with Quick Action Chips & Live Mic */}
            <div className="p-3.5 border-t border-slate-800/80 bg-slate-900/90 shrink-0">
              {/* Quick Action Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 no-scrollbar">
                <button
                  type="button"
                  onClick={() => handleTriggerHint(1)}
                  disabled={isLoading}
                  className="px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-800/40 text-[10px] font-bold text-cyan-300 hover:bg-cyan-900/60 whitespace-nowrap transition"
                >
                  💡 {activeLang === "ta" ? "நிலை 1 சூத்திரம்" : "Level 1 Rule"}
                </button>
                <button
                  type="button"
                  onClick={() => handleTriggerHint(2)}
                  disabled={isLoading}
                  className="px-2.5 py-1 rounded-lg bg-blue-950/60 border border-blue-800/40 text-[10px] font-bold text-blue-300 hover:bg-blue-900/60 whitespace-nowrap transition"
                >
                  ⚡ {activeLang === "ta" ? "நிலை 2 நீக்குதல்" : "Level 2 Elimination"}
                </button>
                <button
                  type="button"
                  onClick={() => handleTriggerHint(3)}
                  disabled={isLoading}
                  className="px-2.5 py-1 rounded-lg bg-indigo-950/60 border border-indigo-800/40 text-[10px] font-bold text-indigo-300 hover:bg-indigo-900/60 whitespace-nowrap transition"
                >
                  📐 {activeLang === "ta" ? "நிலை 3 படிமுறை" : "Level 3 Setup"}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleSendMessage(
                      activeLang === "ta"
                        ? "இப்பாடப்பகுதிக்கான முக்கிய சூத்திரங்களை சுருக்கமாகக் கூறுக."
                        : "State the core formulas and key governing equations for this topic."
                    )
                  }
                  disabled={isLoading}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-[10px] font-medium text-slate-300 hover:text-white whitespace-nowrap transition"
                >
                  {activeLang === "ta" ? "சூத்திரங்கள்" : "Formulas"}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleSendMessage(
                      activeLang === "ta"
                        ? "மாணவர்கள் பொதுவாக செய்யும் தவறுகள் அல்லது பொறிகளை அடையாளம் காண்க."
                        : "Identify the common student traps and pitfalls for this problem."
                    )
                  }
                  disabled={isLoading}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-[10px] font-medium text-amber-300 hover:text-amber-200 whitespace-nowrap transition"
                >
                  {activeLang === "ta" ? "பொறிகள் (Traps)" : "Traps"}
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                {/* Live Mic Button (Tamil / English + TTS Audio) */}
                <LiveVoiceMic
                  language={activeLang}
                  onLanguageChange={setActiveLang}
                  onTranscript={(transcript) => {
                    setInputMessage((prev) => (prev ? `${prev} ${transcript}` : transcript));
                  }}
                  lastAiResponse={
                    messages.filter((m) => m.role === "assistant").slice(-1)[0]?.content
                  }
                  size="sm"
                />

                <input
                  type="text"
                  value={inputMessage}
                  disabled={isLoading || !isFeatureEnabled}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={
                    activeLang === "ta"
                      ? "கேளுங்கள் அல்லது மைக்கை அழுத்திப் பேசுங்கள்..."
                      : "Type or click mic to speak live..."
                  }
                  className="flex-1 bg-slate-950/80 border border-slate-700/80 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 outline-none transition disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={isLoading || !inputMessage.trim() || !isFeatureEnabled}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-cyan-500/20 transition shrink-0"
                  title="Send Question"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

              <div className="mt-2 text-center">
                <span className="text-[10px] text-slate-400 font-mono">
                  powered by aknex-official.vercel.app
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

