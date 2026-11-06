"use client";
import React from "react";
import { Bot, User, Sparkles } from "lucide-react";
import MathRenderer from "./MathRenderer";

export default function ChatBubble({ message, studentName = "மாணவர்", isTyping = false }) {
  const isUser = message?.role === "user";

  return (
    <div className={`flex gap-3 mb-4 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shrink-0 shadow-lg shadow-cyan-500/20 text-white">
          <Bot className="w-4 h-4" />
        </div>
      )}

      <div
        className={`max-w-[85%] rounded-2xl p-4 text-sm shadow-md transition-all ${
          isUser
            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none border border-blue-400/30"
            : "bg-slate-900/80 backdrop-blur-md text-slate-100 rounded-tl-none border border-cyan-500/20 card-glow"
        }`}
      >
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5 pb-1 border-b border-white/5">
          <span className="font-semibold flex items-center gap-1.5">
            {isUser ? (
              <>
                <User className="w-3.5 h-3.5 text-blue-300" />
                <span>{studentName}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-cyan-300 font-medium">AI Academic Coach</span>
              </>
            )}
          </span>
          {message?.timestamp && (
            <span className="text-[10px] text-slate-400">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
        </div>

        {isUser ? (
          <p className="whitespace-pre-wrap leading-relaxed">{message?.content}</p>
        ) : (
          <MathRenderer content={message?.content || ""} className="text-slate-100" />
        )}

        {!isUser && (
          <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block"></span>
              Samacheer Kalvi Socratic Guide
            </span>
            <span className="text-cyan-400/80">powered by aknex-official.vercel.app</span>
          </div>
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-600/20 text-white">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
}

