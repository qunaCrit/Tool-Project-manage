"use client";

import styles from "@/app/page.module.css";

import { useTranslation } from "./provider";

export function LanguageToggle() {
  const { language, setLanguage, t } = useTranslation();

  return (
    <div aria-label={t("language.label")} className={styles.languageToggle}>
      <button
        aria-pressed={language === "vi"}
        className={language === "vi" ? styles.activeLanguage : undefined}
        onClick={() => setLanguage("vi")}
        type="button"
      >
        {t("language.vi")}
      </button>
      <button
        aria-pressed={language === "en"}
        className={language === "en" ? styles.activeLanguage : undefined}
        onClick={() => setLanguage("en")}
        type="button"
      >
        {t("language.en")}
      </button>
    </div>
  );
}
