// app/dashboard/DashboardWrapper.tsx
"use client";

import { useI18n } from "@/components/I18nProvider";
import DashboardClient from "./DashboardClient";

export default function DashboardWrapper({ email }: { email: string }) {
  const { t } = useI18n();
  return (
    <section className="mx-auto max-w-6xl">
      <div>
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{t("dashboardTitle")}</h1>
            <p className="text-slate-500 mt-2">
              {t("welcome")}, {email}
            </p>
          </div>
        </header>
        <DashboardClient />
      </div>
    </section>
  );
}
