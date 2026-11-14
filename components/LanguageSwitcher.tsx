"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setLocale } from "@/app/actions/preferences";
import { useI18n } from "@/components/I18nProvider";
import type { Locale } from "@/lib/i18n/dictionaries";

export function LanguageSwitcher() {
  const { locale, t } = useI18n();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function choose(next: Locale) {
    if (next === locale) return;
    startTransition(async () => {
      await setLocale(next);
      router.refresh();
    });
  }

  return (
    <div className="inline-flex items-center rounded-full border border-slate-200 bg-white p-1 text-sm">
      <span className="sr-only">{t("language")}</span>
      <button
        type="button"
        onClick={() => choose("en")}
        disabled={pending}
        className={`rounded-full px-3 py-1 ${locale === "en" ? "bg-[#0f2744] text-white" : "text-slate-600"}`}
        aria-pressed={locale === "en"}
      >
        {t("english")}
      </button>
      <button
        type="button"
        onClick={() => choose("ar")}
        disabled={pending}
        className={`rounded-full px-3 py-1 ${locale === "ar" ? "bg-[#0f2744] text-white" : "text-slate-600"}`}
        aria-pressed={locale === "ar"}
      >
        {t("arabic")}
      </button>
    </div>
  );
}
