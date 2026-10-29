"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { getTranslation } from "@/lib/i18n";

const LanguageContext = createContext({
  language: "en",
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: (key, fallback) => key,
  isTamil: false,
  mounted: false,
});

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // 1. Check local storage
    const saved = localStorage.getItem("exam_portal_lang");
    if (saved) {
      const normalized = (saved === "ta" || saved === "Tamil") ? "ta" : "en";
      setLanguageState(normalized);
      document.documentElement.lang = normalized;
      return;
    }

    // 2. Or check authenticated user session
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data?.authenticated && (data.user?.language || data.user?.medium)) {
          const userLang = (data.user.language === "ta" || data.user.medium === "Tamil") ? "ta" : "en";
          setLanguageState(userLang);
          localStorage.setItem("exam_portal_lang", userLang);
          document.documentElement.lang = userLang;
        }
      })
      .catch(() => {});
  }, []);

  const setLanguage = (newLang) => {
    const normalized = (newLang === "ta" || newLang === "Tamil") ? "ta" : "en";
    setLanguageState(normalized);
    localStorage.setItem("exam_portal_lang", normalized);
    document.documentElement.lang = normalized;

    // Persist to user profile if logged in
    fetch("/api/auth/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language: normalized }),
    }).catch(() => {});

    // Dispatch custom event so any non-React code or separate tabs react
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("languagechange", { detail: normalized }));
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === "ta" ? "en" : "ta");
  };

  const t = (key, fallback = "") => {
    return getTranslation(language, key, fallback);
  };

  const isTamil = language === "ta" || language === "Tamil";

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t, isTamil, mounted }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
