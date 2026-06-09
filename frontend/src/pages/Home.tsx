import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, Bot, BarChart3, Zap, UserCircle2 } from "lucide-react";

export function Home() {
  const { t } = useTranslation("home");

  const FEATURES = [
    { icon: Bot, titleKey: "features.aiAgent.title", descKey: "features.aiAgent.desc" },
    { icon: BarChart3, titleKey: "features.backtest.title", descKey: "features.backtest.desc" },
    { icon: Zap, titleKey: "features.streaming.title", descKey: "features.streaming.desc" },
    { icon: UserCircle2, titleKey: "features.strategyReplay.title", descKey: "features.strategyReplay.desc" },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
        <Link
          to="/agent"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition"
        >
          {t("cta")} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16 max-w-5xl w-full">
        {FEATURES.map(({ icon: Icon, titleKey, descKey }) => (
          <div key={titleKey} className="border rounded-lg p-6 space-y-3">
            <Icon className="h-8 w-8 text-primary" />
            <h3 className="font-semibold">{t(titleKey)}</h3>
            <p className="text-sm text-muted-foreground">{t(descKey)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
