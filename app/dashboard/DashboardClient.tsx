// app/dashboard/DashboardClient.tsx
"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/components/I18nProvider";

type Stats = {
  totalClients: number;
  activeLeads: number;
  convertedLeads: number;
};

export default function DashboardClient() {
  const { lang, t, errorText } = useI18n();
  const [timestamp, setTimestamp] = useState<number | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsError, setStatsError] = useState(false);

  useEffect(() => {
    let interval: number | undefined;
    const timeout = window.setTimeout(() => {
      setTimestamp(Date.now());
      interval = window.setInterval(() => setTimestamp(Date.now()), 1000);
    });

    return () => {
      window.clearTimeout(timeout);
      if (interval !== undefined) window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    fetch("/api/stats", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("stats_load_failed");
        return (await response.json()) as Stats;
      })
      .then((result) => {
        setStats(result);
        setStatsError(false);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        console.error("Could not load dashboard statistics", error);
        setStatsError(true);
      });

    return () => controller.abort();
  }, []);

  const formatted = timestamp
    ? new Date(timestamp).toLocaleString(lang === "ar" ? "ar" : "en")
    : "—";

  return (
    <section className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
      <div className="rounded-xl bg-white p-6 text-slate-900 shadow-sm">
        <p className="text-slate-500">{t("currentTime")}</p>
        <h2 className="mt-3 text-3xl font-bold">{formatted}</h2>
      </div>
      <div className="rounded-xl bg-white p-6 text-slate-900 shadow-sm">
        <p className="text-slate-500">{t("totalClients")}</p>
        <h2 className="mt-3 text-3xl font-bold">{stats?.totalClients ?? "—"}</h2>
      </div>
      <div className="rounded-xl bg-white p-6 text-slate-900 shadow-sm">
        <p className="text-slate-500">{t("activeLeads")}</p>
        <h2 className="mt-3 text-3xl font-bold">{stats?.activeLeads ?? "—"}</h2>
      </div>
      <div className="rounded-xl bg-white p-6 text-slate-900 shadow-sm">
        <p className="text-slate-500">{t("convertedLeads")}</p>
        <h2 className="mt-3 text-3xl font-bold">{stats?.convertedLeads ?? "—"}</h2>
      </div>
      {statsError ? (
        <p role="alert" className="text-sm text-red-700 md:col-span-3">
          {errorText("stats_load_failed")}
        </p>
      ) : null}
    </section>
  );
}
