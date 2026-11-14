"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { setCurrency as saveCurrency, setLocale } from "@/app/actions/preferences";
import { formatDate, formatMoney, parseCurrency, type Currency } from "@/lib/format";
import { messageFor } from "@/lib/i18n/errors";
import {
  dictionaries,
  parseLocale,
  type Locale,
  type MessageKey,
} from "@/lib/i18n/dictionaries";
import { createClient } from "@/lib/supabase/client";

interface I18nContextProps {
  lang: Locale;
  setLang: (locale: Locale) => void;
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  t: (key: MessageKey) => string;
  errorText: (code: string) => string;
  date: (value: string) => string;
  money: (value: number) => string;
}

const I18nContext = createContext<I18nContextProps | undefined>(undefined);

function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "ar";
}

function readCookie(name: string) {
  return document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Locale>("en");
  const [currency, setCurrencyState] = useState<Currency>("SAR");
  const [preferenceError, setPreferenceError] = useState(false);
  const languageChanged = useRef(false);

  useEffect(() => {
    let active = true;
    const cookieLocale = parseLocale(readCookie("ct-lang") ?? readCookie("lang"));
    const cookieCurrency = parseCurrency(readCookie("ct-currency"));
    const timeout = window.setTimeout(() => {
      if (!active) return;
      setLangState(cookieLocale);
      setCurrencyState(cookieCurrency);
    });

    document.documentElement.lang = cookieLocale;
    document.documentElement.dir = cookieLocale === "ar" ? "rtl" : "ltr";

    async function loadProfileLanguage() {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        if (error.name !== "AuthSessionMissingError") {
          console.error("Could not read the authenticated user language", error);
        }
        return;
      }

      const user = data.user;
      if (!user) return;

      const metadataLocale = isLocale(user.user_metadata?.lang)
        ? user.user_metadata.lang
        : isLocale(user.app_metadata?.lang)
          ? user.app_metadata.lang
          : cookieLocale;
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("lang")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        console.error("Could not read the profile language", profileError);
      }

      const profileLocale = isLocale(profile?.lang) ? profile.lang : metadataLocale;
      if (active && !languageChanged.current) {
        setLangState(profileLocale);
        document.documentElement.lang = profileLocale;
        document.documentElement.dir = profileLocale === "ar" ? "rtl" : "ltr";
      }
    }

    void loadProfileLanguage().catch((error: unknown) => {
      console.error("Could not initialize language preferences", error);
    });

    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  const setLang = useCallback((locale: Locale) => {
    languageChanged.current = true;
    setLangState(locale);
    setPreferenceError(false);
    document.cookie = `ct-lang=${locale};path=/;max-age=31536000;SameSite=Lax`;

    void (async () => {
      await setLocale(locale);
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;

      const { data: profile, error } = await supabase
        .from("profiles")
        .update({ lang: locale })
        .eq("id", data.user.id)
        .select("id")
        .maybeSingle();

      if (error) throw error;
      if (!profile) throw new Error("No profile exists for the authenticated user");
    })().catch((error: unknown) => {
      console.error("Could not save the language preference", error);
      setPreferenceError(true);
    });
  }, []);

  const setCurrency = useCallback((next: Currency) => {
    setCurrencyState(next);
    void saveCurrency(next).catch((error: unknown) => {
      console.error("Could not save the currency preference", error);
    });
  }, []);

  const t = useCallback((key: MessageKey) => dictionaries[lang][key], [lang]);
  const errorText = useCallback((code: string) => messageFor(lang, code), [lang]);
  const date = useCallback((value: string) => formatDate(value, lang), [lang]);
  const money = useCallback(
    (value: number) => formatMoney(value, currency, lang),
    [currency, lang],
  );

  return (
    <I18nContext.Provider
      value={{ lang, setLang, currency, setCurrency, t, errorText, date, money }}
    >
      {preferenceError ? (
        <p role="alert" className="bg-white px-4 py-2 text-sm text-slate-900">
          {t("languageSaveFailed")}
        </p>
      ) : null}
      {children}
    </I18nContext.Provider>
  );
}

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used within I18nProvider");
  return context;
};
