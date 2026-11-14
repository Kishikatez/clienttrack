"use client";

import { LogOut } from "lucide-react";
import { logout } from "@/app/auth/actions";
import { useI18n } from "@/components/I18nProvider";

export function LogoutButton() {
  const { t } = useI18n();

  return (
    <form action={logout}>
      <button
        type="submit"
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-[#0f2744] hover:bg-slate-50"
      >
        <LogOut className="size-4" aria-hidden />
        {t("logout")}
      </button>
    </form>
  );
}
