"use client";

import {
  LayoutDashboard,
  Target,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CurrencySwitcher } from "@/components/CurrencySwitcher";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { LogoutButton } from "@/components/LogoutButton";
import { useI18n } from "@/components/I18nProvider";

const links = [
  { href: "/dashboard", key: "dashboard" as const, icon: LayoutDashboard },
  { href: "/clients", key: "clients" as const, icon: Users },
  { href: "/leads", key: "leads" as const, icon: Target },
];

export function AppShell({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  const { t } = useI18n();
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50">
      <aside
        className="fixed inset-y-0 start-0 z-40 hidden w-72 flex-col border-e border-slate-200 bg-white lg:flex"
      >
        <div className="flex items-center justify-between px-5 py-5">
          <Link href="/dashboard" className="text-lg font-semibold tracking-tight">
            {t("appName")}
          </Link>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${active ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50"}`}
              >
                <Icon className="size-4" aria-hidden />
                {t(link.key)}
              </Link>
            );
          })}
        </nav>
        <p className="px-5 py-4 text-xs text-slate-400">{t("tagline")}</p>
      </aside>

      <div className="min-w-0 lg:ps-72">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
          <div className="ms-auto flex flex-wrap items-center justify-end gap-2">
            <LanguageSwitcher />
            <CurrencySwitcher />
            <span dir="ltr" className="hidden max-w-48 truncate text-sm text-slate-500 sm:inline" title={email}>
              {email}
            </span>
            <LogoutButton />
          </div>
        </header>
        <nav
          aria-label={t("navigation")}
          className="flex gap-2 overflow-x-auto border-b border-slate-200 bg-white px-4 py-2 lg:hidden"
        >
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${active ? "bg-indigo-50 text-indigo-700" : "text-slate-700 hover:bg-slate-100"}`}
              >
                <Icon className="size-4" aria-hidden />
                {t(link.key)}
              </Link>
            );
          })}
        </nav>
        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
