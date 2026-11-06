"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Mic, MicOff, Volume2, VolumeX, Globe, Radio } from "lucide-react";

/**
 * LiveVoiceMic - Real-time bilingual (Tamil & English) speech-to-text mic button
 * and text-to-speech speaker for the AKNEX AI Academic Coach.
 *
 * Props:
 * - onTranscript: (transcript: string) => void  // Called with final recognized speech
 * - onLiveChange?: (interim: string) => void    // Called with real-time interim transcript
 * - language: "en" | "ta"                       // Active conversation language
 * - onLanguageChange?: (lang: "en" | "ta") => void
 * - lastAiResponse?: string                     // Optional text to read aloud via TTS
 * - size?: "sm" | "md" | "lg"
 */
export default function LiveVoiceMic({
  onTranscript,
  onLiveChange,
  language = "ta",
  onLanguageChange,
  lastAiResponse = "",
  size = "md",
}) {
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [supported, setSupported] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);

  const isTamil = language === "ta";
  const activeLangCode = isTamil ? "ta-IN" : "en-IN";

  // Initialize SpeechRecognition on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = activeLangCode;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let currentInterim = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        if (item.isFinal) {
          finalTranscript += item[0].transcript;
        } else {
          currentInterim += item[0].transcript;
        }
      }

      if (currentInterim) {
        setInterimText(currentInterim);
        if (onLiveChange) onLiveChange(currentInterim);
      }

      if (finalTranscript) {
        setInterimText("");
        if (onTranscript) onTranscript(finalTranscript.trim());
      }
    };

    recognition.onerror = (event) => {
      if (event.error !== "no-speech") {
        console.warn("Speech recognition error:", event.error);
      }
      setIsListening(false);
      setInterimText("");
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimText("");
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch {}
    };
  }, [activeLangCode, onTranscript, onLiveChange]);

  // Toggle listening
  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) {
      alert(
        isTamil
          ? "உங்கள் உலாவியில் குரல் உள்ளீடு ஆதரிக்கப்படவில்லை (Google Chrome / Edge பரிந்துரைக்கப்படுகிறது)."
          : "Voice input is not supported in this browser. Please use Chrome or Edge."
      );
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setInterimText("");
    } else {
      // Cancel TTS before starting to listen
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
      try {
        recognitionRef.current.lang = activeLangCode;
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn("Could not start recognition:", err);
      }
    }
  }, [isListening, activeLangCode, isTamil]);

  // Text-To-Speech: Speak AI response aloud in Tamil or English
  const toggleSpeakResponse = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!lastAiResponse) return;

    // Clean KaTeX & Markdown tokens for clear audio speech
    const cleanText = lastAiResponse
      .replace(/\$\$[\s\S]*?\$\$/g, " formula ")
      .replace(/\$[^$]+?\$/g, " equation ")
      .replace(/[#*`_>•]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = activeLangCode;
    utterance.rate = isTamil ? 0.95 : 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, [isSpeaking, lastAiResponse, activeLangCode, isTamil]);

  const buttonSizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-9 h-9 text-sm",
    lg: "w-11 h-11 text-base",
  }[size];

  return (
    <div className="inline-flex items-center gap-1.5 relative">
      {/* Mic Live Recognition Button */}
      <button
        type="button"
        onClick={toggleListening}
        title={
          isListening
            ? isTamil
              ? "கேட்கிறது... நிறுத்த அழுத்தவும்"
              : "Listening live... Click to stop"
            : isTamil
              ? "தமிழில் பேச மைக் பொத்தானை அழுத்தவும்"
              : "Click mic to speak in English"
        }
        className={`relative rounded-xl flex items-center justify-center transition-all ${buttonSizeClasses} ${
          isListening
            ? "bg-rose-500 text-white shadow-[0_0_16px_rgba(244,63,94,0.6)] ring-2 ring-rose-400 animate-pulse"
            : "bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 shadow-sm"
        }`}
      >
        {isListening ? (
          <>
            <Radio className="w-4 h-4 animate-spin text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-400 rounded-full animate-ping" />
          </>
        ) : (
          <Mic className="w-4 h-4" />
        )}
      </button>

      {/* Language Switcher Pill */}
      {onLanguageChange && (
        <button
          type="button"
          onClick={() => onLanguageChange(isTamil ? "en" : "ta")}
          title={isTamil ? "ஆங்கிலத்திற்கு மாற்றவும்" : "Switch to Tamil"}
          className="h-8 px-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-500/50 text-[10px] font-bold text-slate-300 hover:text-cyan-300 flex items-center gap-1 transition-colors"
        >
          <Globe className="w-3 h-3 text-cyan-400" />
          <span>{isTamil ? "தமிழ்" : "ENG"}</span>
        </button>
      )}

      {/* TTS Read-Aloud Speaker Button (when AI response exists) */}
      {lastAiResponse && (
        <button
          type="button"
          onClick={toggleSpeakResponse}
          title={
            isSpeaking
              ? isTamil
                ? "பேசுவதை நிறுத்தவும்"
                : "Stop audio read-aloud"
              : isTamil
                ? "விடையை குரலில் கேட்க"
                : "Listen to explanation via speech"
          }
          className={`h-8 px-2 rounded-lg border text-xs flex items-center gap-1 transition-all ${
            isSpeaking
              ? "bg-emerald-500/20 text-emerald-300 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)] animate-pulse"
              : "bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200"
          }`}
        >
          {isSpeaking ? (
            <VolumeX className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Volume2 className="w-3.5 h-3.5 text-slate-400 hover:text-cyan-400" />
          )}
          <span className="text-[10px] font-mono hidden sm:inline">
            {isSpeaking ? (isTamil ? "நிறுத்து" : "Stop") : (isTamil ? "கேட்க" : "Audio")}
          </span>
        </button>
      )}

      {/* Floating Interim Transcript Toast when listening */}
      {isListening && interimText && (
        <div className="absolute bottom-full mb-2 left-0 z-50 bg-slate-900/95 border border-cyan-500/40 text-cyan-300 text-xs px-3 py-1.5 rounded-lg shadow-xl backdrop-blur-md max-w-xs whitespace-normal animate-fade-in font-medium">
          <span className="text-rose-400 mr-1.5 font-bold uppercase tracking-wider text-[10px]">
            ● {isTamil ? "கேட்கிறது" : "Listening"}:
          </span>
          &ldquo;{interimText}&rdquo;
        </div>
      )}
    </div>
  );
}

