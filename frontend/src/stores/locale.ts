import { create } from "zustand";
import i18next from "@/i18n";

interface LocaleState {
  language: "zh" | "en";
  setLanguage: (lang: "zh" | "en") => void;
}

function detectInitial(): "zh" | "en" {
  const stored = localStorage.getItem("vibe-language");
  if (stored === "zh" || stored === "en") return stored;
  const nav = navigator.language;
  if (nav.startsWith("zh")) return "zh";
  return "zh";
}

const initial = detectInitial();

// Ensure i18next is in sync with detected language
i18next.changeLanguage(initial);

export const useLocaleStore = create<LocaleState>((set) => ({
  language: initial,
  setLanguage: (lang) => {
    localStorage.setItem("vibe-language", lang);
    i18next.changeLanguage(lang);
    set({ language: lang });
  },
}));
