// Tamil Nadu Samacheer Kalvi - Dual Language Internationalization (English & Tamil)
// Architecture: Locale JSON files with fallback, missing key diagnostics, and t('key') helper.

import enLocales from "@/locales/en.json";
import taLocales from "@/locales/ta.json";

export const translations = {
  en: enLocales,
  ta: taLocales,
};

/**
 * Returns translated string for the given language and key.
 * If translation is missing in the chosen language, falls back to English.
 * If missing in English, returns the fallback string or key.
 */
export function getTranslation(lang, key, fallback = "") {
  const currentLang = (lang === "ta" || lang === "Tamil") ? "ta" : "en";
  const localeDict = translations[currentLang] || translations.en;

  if (localeDict && localeDict[key] !== undefined) {
    return localeDict[key];
  }

  // Fallback to English
  if (translations.en && translations.en[key] !== undefined) {
    if (process.env.NODE_ENV === "development") {
      console.warn(`[i18n] Missing translation in "${currentLang}" for key: "${key}". Falling back to English.`);
    }
    return translations.en[key];
  }

  if (process.env.NODE_ENV === "development") {
    console.warn(`[i18n] Missing key completely: "${key}".`);
  }

  return fallback || key;
}

/**
 * Direct t() helper bound to a specific language
 */
export function createTranslator(lang = "en") {
  return function t(key, fallback = "") {
    return getTranslation(lang, key, fallback);
  };
}

export default translations;
