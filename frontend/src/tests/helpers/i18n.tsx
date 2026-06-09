import { I18nextProvider } from "react-i18next";
import i18n from "@/i18n";

/** Wraps a React element in I18nextProvider for tests that render components using useTranslation. */
export function wrapWithI18n(ui: React.ReactElement) {
  return <I18nextProvider i18n={i18n}>{ui}</I18nextProvider>;
}
