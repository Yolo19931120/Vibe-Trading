import { useLocaleStore } from "@/stores/locale";
import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
  const language = useLocaleStore((s) => s.language);
  const setLanguage = useLocaleStore((s) => s.setLanguage);

  return (
    <button
      type="button"
      onClick={() => setLanguage(language === "zh" ? "en" : "zh")}
      className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
      title={language === "zh" ? "Switch to English" : "切换到中文"}
    >
      <span
        className={cn(
          "rounded px-1 py-0.5",
          language === "zh" ? "bg-primary/10 text-primary" : "text-muted-foreground"
        )}
      >
        中
      </span>
      <span className="text-muted-foreground">/</span>
      <span
        className={cn(
          "rounded px-1 py-0.5",
          language === "en" ? "bg-primary/10 text-primary" : "text-muted-foreground"
        )}
      >
        EN
      </span>
    </button>
  );
}
