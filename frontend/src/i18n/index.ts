import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// English
import commonEn from "./locales/en/common.json";
import homeEn from "./locales/en/home.json";
import settingsEn from "./locales/en/settings.json";
import agentEn from "./locales/en/agent.json";
import alphaZooEn from "./locales/en/alphaZoo.json";
import runDetailEn from "./locales/en/runDetail.json";
import compareEn from "./locales/en/compare.json";
import correlationEn from "./locales/en/correlation.json";
import chartEn from "./locales/en/chart.json";

// Chinese
import commonZh from "./locales/zh/common.json";
import homeZh from "./locales/zh/home.json";
import settingsZh from "./locales/zh/settings.json";
import agentZh from "./locales/zh/agent.json";
import alphaZooZh from "./locales/zh/alphaZoo.json";
import runDetailZh from "./locales/zh/runDetail.json";
import compareZh from "./locales/zh/compare.json";
import correlationZh from "./locales/zh/correlation.json";
import chartZh from "./locales/zh/chart.json";

i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: commonEn,
        home: homeEn,
        settings: settingsEn,
        agent: agentEn,
        alphaZoo: alphaZooEn,
        runDetail: runDetailEn,
        compare: compareEn,
        correlation: correlationEn,
        chart: chartEn,
      },
      zh: {
        common: commonZh,
        home: homeZh,
        settings: settingsZh,
        agent: agentZh,
        alphaZoo: alphaZooZh,
        runDetail: runDetailZh,
        compare: compareZh,
        correlation: correlationZh,
        chart: chartZh,
      },
    },
    fallbackLng: "zh",
    defaultNS: "common",
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "vibe-language",
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18next;
