import { create } from "zustand";
import i18next from "@/i18n";

interface LocaleState {
  language: "zh" | "en";
  setLanguage: (lang: "zh" | "en") => void;
}

function detectInitial(): "zh" | "en" {
  // i18next-browser-languagedetector already resolved the language from
  // localStorage ('vibe-language') → navigator.language during init.
  const resolved = i18next.language?.split("-")[0];
  if (resolved === "en") return "en";
  return "zh";
}

const initial = detectInitial();

export const useLocaleStore = create<LocaleState>((set) => ({
  language: initial,
  setLanguage: (lang) => {
    localStorage.setItem("vibe-language", lang);
    i18next.changeLanguage(lang);
    set({ language: lang });
  },
}));
