"use client";

import Link from "next/link";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useI18n } from "@/components/I18nProvider";

export function PublicHeader({ signedIn = false }: { signedIn?: boolean }) {
  const { t } = useI18n();

  return (
    <header className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white px-4 py-4 sm:px-8">
      <Link href="/" className="text-lg font-semibold text-[#0f2744]">
        {t("appName")}
      </Link>
      <div className="ms-auto flex flex-wrap items-center gap-2">
        <LanguageSwitcher />
        {signedIn ? (
          <Link href="/dashboard" className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white">
            {t("goToDashboard")}
          </Link>
        ) : (
          <Link href="/login" className="rounded-full bg-[#0f2744] px-4 py-2 text-sm font-medium text-white">
            {t("signIn")}
          </Link>
        )}
      </div>
    </header>
  );
}
