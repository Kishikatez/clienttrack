import type { Locale } from "@/lib/i18n/dictionaries";

export type Currency = "SAR" | "AED";

export function parseCurrency(value: string | undefined): Currency {
  return value === "AED" ? "AED" : "SAR";
}

export function formatMoney(value: number, currency: Currency, locale: Locale) {
  return new Intl.NumberFormat(locale === "ar" ? "ar" : "en", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatDate(value: string, locale: Locale) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(locale === "ar" ? "ar" : "en", {
    dateStyle: "medium",
  }).format(date);
}

export function formatMessage(
  template: string,
  values: Record<string, string | number>,
) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    String(values[key] ?? ""),
  );
}
