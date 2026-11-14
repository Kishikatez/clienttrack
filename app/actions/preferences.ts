"use server";

import { cookies } from "next/headers";
import { parseCurrency } from "@/lib/format";
import { parseLocale } from "@/lib/i18n/dictionaries";

const year = 60 * 60 * 24 * 365;

export async function setLocale(value: string) {
  const locale = parseLocale(value);
  const store = await cookies();
  store.set("ct-lang", locale, { path: "/", maxAge: year, sameSite: "lax" });
}

export async function setCurrency(value: string) {
  const currency = parseCurrency(value);
  const store = await cookies();
  store.set("ct-currency", currency, { path: "/", maxAge: year, sameSite: "lax" });
}
