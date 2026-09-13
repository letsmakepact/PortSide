"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import { SupportedLocale, TranslationDictionary, SUPPORTED_LOCALES } from "./types";
import { enUS } from "./locales/en-US";
import { enGB } from "./locales/en-GB";
import { sv } from "./locales/sv";
import { zhCN } from "./locales/zh-CN";
import { nl } from "./locales/nl";
import { hi } from "./locales/hi";
import { enIN } from "./locales/en-IN";

const DICTIONARIES: Record<SupportedLocale, TranslationDictionary> = {
  "en-US": enUS,
  "en-GB": enGB,
  sv,
  "zh-CN": zhCN,
  nl,
  hi,
  "en-IN": enIN,
};

interface I18nContextValue {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  t: TranslationDictionary;
  availableLocales: typeof SUPPORTED_LOCALES;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const STORAGE_KEY = "portside_locale";
const COOKIE_KEY = "portside_locale";

function detectBestLocale(): SupportedLocale {
  if (typeof window === "undefined") return "en-US";

  try {
    // 1. Explicit URL parameter: ?lang= or ?locale=
    const searchParams = new URLSearchParams(window.location.search);
    const queryLang = searchParams.get("lang") || searchParams.get("locale");
    if (queryLang) {
      const match = mapStringToLocale(queryLang);
      if (match) {
        try {
          localStorage.setItem(STORAGE_KEY, match);
          document.cookie = `${COOKIE_KEY}=${match}; path=/; max-age=31536000; SameSite=Lax`;
        } catch {}
        return match;
      }
    }

    // 2. Local storage preference
    const stored = localStorage.getItem(STORAGE_KEY) as SupportedLocale | null;
    if (stored && DICTIONARIES[stored]) {
      return stored;
    }

    // 3. Cookie preference
    const cookieMatch = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_KEY}=([^;]*)`));
    if (cookieMatch && cookieMatch[1]) {
      const val = decodeURIComponent(cookieMatch[1]) as SupportedLocale;
      if (DICTIONARIES[val]) return val;
    }

    // 4. Auto-detect from browser languages array (navigator.languages)
    const languages = navigator.languages || [navigator.language];
    for (const lang of languages) {
      const match = mapStringToLocale(lang);
      if (match) return match;
    }

    // 5. Auto-detect from client timezone (Intl.DateTimeFormat)
    try {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone.toLowerCase();
      if (timeZone.includes("stockholm") || timeZone.includes("sweden")) return "sv";
      if (
        timeZone.includes("shanghai") ||
        timeZone.includes("beijing") ||
        timeZone.includes("urumqi") ||
        timeZone.includes("chongqing") ||
        timeZone.includes("harbin")
      ) {
        return "zh-CN";
      }
      if (timeZone.includes("amsterdam")) return "nl";
      if (
        timeZone.includes("london") ||
        timeZone.includes("belfast") ||
        timeZone.includes("gibraltar")
      ) {
        return "en-GB";
      }
      if (timeZone.includes("kolkata") || timeZone.includes("calcutta") || timeZone.includes("delhi")) {
        return "hi";
      }
    } catch {}
  } catch {
    // ignore storage or cookie errors
  }

  return "en-US";
}

function mapStringToLocale(raw: string): SupportedLocale | null {
  if (!raw) return null;
  const lower = raw.toLowerCase().trim();

  if (lower.startsWith("zh") || lower.includes("cn") || lower.includes("china")) return "zh-CN";
  if (lower.startsWith("sv") || lower.includes("se") || lower.includes("sweden")) return "sv";
  if (lower.startsWith("nl") || lower.includes("dutch") || lower.includes("netherlands")) return "nl";
  if (lower.startsWith("hi") || lower.includes("hindi")) return "hi";
  if (lower === "en-gb" || lower === "en_gb" || lower.includes("uk") || lower.includes("britain")) return "en-GB";
  if (lower === "en-in" || lower === "en_in" || lower.includes("india")) return "en-IN";
  if (lower.startsWith("en")) return "en-US";

  return null;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<SupportedLocale>("en-US");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const detected = detectBestLocale();
    setLocaleState(detected);
    setMounted(true);
    document.documentElement.lang = detected;
  }, []);

  const setLocale = (newLocale: SupportedLocale) => {
    if (!DICTIONARIES[newLocale]) return;
    setLocaleState(newLocale);
    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
      document.cookie = `${COOKIE_KEY}=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
      document.documentElement.lang = newLocale;
    } catch {
      // ignore storage errors
    }
  };

  const t = useMemo(() => {
    return DICTIONARIES[locale] || DICTIONARIES["en-US"];
  }, [locale]);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
      availableLocales: SUPPORTED_LOCALES,
    }),
    [locale, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    // Return fallback context if used outside provider (e.g. during static generation)
    return {
      locale: "en-US",
      setLocale: () => {},
      t: DICTIONARIES["en-US"],
      availableLocales: SUPPORTED_LOCALES,
    };
  }
  return context;
}
