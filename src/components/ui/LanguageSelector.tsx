"use client";

import React, { useState, useRef, useEffect } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";
import { useI18n, SupportedLocale } from "@/lib/i18n";

interface LanguageSelectorProps {
  variant?: "header" | "footer" | "compact";
  className?: string;
}

export function LanguageSelector({ variant = "header", className = "" }: LanguageSelectorProps) {
  const { locale, setLocale, availableLocales, t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentCountry = availableLocales.find((c) => c.code === locale) || availableLocales[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (code: SupportedLocale) => {
    setLocale(code);
    setIsOpen(false);
  };

  if (variant === "footer") {
    return (
      <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label={t.nav.selectLanguage}
          className="inline-flex items-center gap-2 rounded-md bg-[#111827] hover:bg-[#161f30] px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white border border-[#1f2937] transition"
        >
          <span className="text-sm leading-none" role="img" aria-label={currentCountry.country}>
            {currentCountry.flag}
          </span>
          <span className="font-mono text-slate-200">
            {currentCountry.nativeCountry} ({currentCountry.nativeLanguage})
          </span>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </button>

        {isOpen && (
          <div className="absolute bottom-full left-0 mb-2 w-64 rounded-lg bg-[#0d131f] border border-[#1f2937] shadow-xl py-1.5 z-50 focus:outline-none backdrop-blur-md">
            <div className="px-3 py-1.5 border-b border-[#1f2937]/60 text-[10px] uppercase font-mono tracking-wider text-slate-400">
              {t.nav.selectLanguage}
            </div>
            <div className="max-h-64 overflow-y-auto py-1">
              {availableLocales.map((item) => {
                const isActive = item.code === locale;
                return (
                  <button
                    key={item.code}
                    onClick={() => handleSelect(item.code)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition ${
                      isActive
                        ? "bg-sky-500/10 text-sky-400 font-medium"
                        : "text-slate-300 hover:bg-[#161f30] hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base leading-none">{item.flag}</span>
                      <div className="flex flex-col">
                        <span className="text-xs">{item.nativeCountry}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {item.nativeLanguage} · {item.country}
                        </span>
                      </div>
                    </div>
                    {isActive && <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Header and Compact variants
  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label={t.nav.selectLanguage}
        className="inline-flex items-center gap-1.5 rounded-md bg-[#111827] hover:bg-[#161f30] px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white border border-[#1f2937] transition"
      >
        <span className="text-sm leading-none" role="img" aria-label={currentCountry.country}>
          {currentCountry.flag}
        </span>
        <span className="hidden sm:inline font-mono text-[11px] text-slate-200">
          {currentCountry.code.toUpperCase()}
        </span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-60 sm:w-64 rounded-lg bg-[#0d131f] border border-[#1f2937] shadow-xl py-1.5 z-50 focus:outline-none backdrop-blur-md animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-1.5 border-b border-[#1f2937]/60 text-[10px] uppercase font-mono tracking-wider text-slate-400 flex items-center justify-between">
            <span>{t.nav.selectLanguage}</span>
            <Globe className="w-3 h-3 text-sky-400" />
          </div>
          <div className="max-h-72 overflow-y-auto py-1">
            {availableLocales.map((item) => {
              const isActive = item.code === locale;
              return (
                <button
                  key={item.code}
                  onClick={() => handleSelect(item.code)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition ${
                    isActive
                      ? "bg-sky-500/10 text-sky-400 font-medium"
                      : "text-slate-300 hover:bg-[#161f30] hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base leading-none">{item.flag}</span>
                    <div className="flex flex-col">
                      <span className="text-xs leading-tight">{item.nativeCountry}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {item.nativeLanguage} ({item.code})
                      </span>
                    </div>
                  </div>
                  {isActive && <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
