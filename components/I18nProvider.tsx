"use client";

import { createContext, useContext, useMemo } from "react";
import { formatDate, formatMoney, type Currency } from "@/lib/format";
import { translate, type Locale, type MessageKey } from "@/lib/i18n/dictionaries";
import { messageFor } from "@/lib/i18n/errors";

type I18nValue = {
  locale: Locale;
  currency: Currency;
  dir: "ltr" | "rtl";
  t: (key: MessageKey) => string;
  errorText: (code: string | undefined) => string;
  money: (value: number) => string;
  date: (value: string) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({
  locale,
  currency,
  children,
}: {
  locale: Locale;
  currency: Currency;
  children: React.ReactNode;
}) {
  const value = useMemo<I18nValue>(
    () => ({
      locale,
      currency,
      dir: locale === "ar" ? "rtl" : "ltr",
      t: (key) => translate(locale, key),
      errorText: (code) => messageFor(locale, code),
      money: (amount) => formatMoney(amount, currency, locale),
      date: (iso) => formatDate(iso, locale),
    }),
    [locale, currency],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const value = useContext(I18nContext);
  if (!value) {
    throw new Error("useI18n must be used inside I18nProvider");
  }
  return value;
}
