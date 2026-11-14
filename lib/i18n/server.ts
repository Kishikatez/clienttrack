import { cookies } from "next/headers";
import { parseCurrency, type Currency } from "@/lib/format";
import { parseLocale, type Locale } from "@/lib/i18n/dictionaries";

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  return parseLocale(store.get("ct-lang")?.value);
}

export async function getCurrency(): Promise<Currency> {
  const store = await cookies();
  return parseCurrency(store.get("ct-currency")?.value);
}
