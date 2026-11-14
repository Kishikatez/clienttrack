"use client";

import { useI18n } from "@/components/I18nProvider";
import type { Currency } from "@/lib/format";

export function CurrencySwitcher() {
  const { currency, setCurrency, t } = useI18n();

  return (
    <label className="inline-flex items-center gap-2 text-sm text-slate-600">
      <span className="sr-only">{t("currency")}</span>
      <select
        value={currency}
        onChange={(event) => setCurrency(event.target.value as Currency)}
        className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-[#0f2744] outline-none focus:ring-2 focus:ring-indigo-500"
        dir="ltr"
      >
        <option value="SAR">{t("sar")}</option>
        <option value="AED">{t("aed")}</option>
      </select>
    </label>
  );
}
