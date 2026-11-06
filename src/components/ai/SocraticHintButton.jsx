"use client";
import React, { useState } from "react";
import { Lightbulb, Sparkles, ChevronRight, ShieldAlert } from "lucide-react";

export default function SocraticHintButton({
  onGetHint,
  isLoading = false,
  language = "ta",
  className = ""
}) {
  const [currentLevel, setCurrentLevel] = useState(1);
  const isTa = language === "ta";

  const levels = [
    {
      level: 1,
      title: isTa ? "நிலை 1: அடிப்படை சூத்திரம்" : "Level 1: Core Concept",
      desc: isTa ? "பாடப்புத்தக தேற்றம் & சூத்திரம்" : "Textbook formula & theorem"
    },
    {
      level: 2,
      title: isTa ? "நிலை 2: முதல் கணக்கீடு" : "Level 2: First Math Step",
      desc: isTa ? "மதிப்புகளை பிரதியிடுதல்" : "Substitution & setup"
    },
    {
      level: 3,
      title: isTa ? "நிலை 3: பொதுவான பிழை" : "Level 3: Pitfall Caution",
      desc: isTa ? "தவிர்க்க வேண்டிய தவறுகள்" : "Common mistake to avoid"
    }
  ];

  const handleNextHint = (lvl) => {
    setCurrentLevel(lvl);
    if (onGetHint) {
      onGetHint(lvl);
    }
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1.5 font-medium text-cyan-400">
          <Lightbulb className="w-3.5 h-3.5" />
          {isTa ? "சோக்ரடீஸ் நிலை வழிகாட்டல் (3 நிலைகள்)" : "Socratic Progressive Hints (3 Levels)"}
        </span>
        <span className="text-[10px] text-slate-400">
          {isTa ? "விடை கசியாமல் வழிகாட்டும்" : "Zero-leak guidance"}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {levels.map((item) => {
          const isActive = currentLevel === item.level;
          return (
            <button
              key={item.level}
              type="button"
              disabled={isLoading}
              onClick={() => handleNextHint(item.level)}
              className={`text-left p-2.5 rounded-xl border transition-all flex flex-col justify-between ${
                isActive
                  ? "bg-cyan-500/10 border-cyan-500/50 text-cyan-300 shadow-sm shadow-cyan-500/20"
                  : "bg-slate-800/40 border-slate-700/50 text-slate-400 hover:bg-slate-800/70 hover:text-slate-200"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-bold">{item.title}</span>
                {isActive && <Sparkles className="w-3 h-3 text-cyan-400" />}
              </div>
              <span className="text-[10px] opacity-75 mt-1 line-clamp-1">{item.desc}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

