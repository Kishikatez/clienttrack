// components/LanguageSwitcher.tsx
"use client";

import { useI18n } from "@/components/I18nProvider";

export function LanguageSwitcher() {
  const { lang, setLang, t } = useI18n();
  const toggle = () => setLang(lang === "en" ? "ar" : "en");
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={lang === "en" ? t("switchToArabic") : t("switchToEnglish")}
      className="rounded bg-gray-200 px-3 py-1 text-black transition hover:bg-gray-300"
    >
      {lang === "en" ? "العربية" : "English"}
    </button>
  );
}

export default LanguageSwitcher;
