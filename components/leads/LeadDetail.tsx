"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiSend } from "@/lib/api-client";
import { useI18n } from "@/components/I18nProvider";
import { Banner, StatusBadge, dangerClass, secondaryClass } from "@/components/crm/ui";
import type { LeadRecord } from "@/lib/types";

export function LeadDetail({ id }: { id: string }) {
  const { t, errorText, date, money } = useI18n();
  const router = useRouter();
  const [lead, setLead] = useState<LeadRecord | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiSend<{ lead: LeadRecord }>(`/api/leads/${id}`).then((response) => {
      if (!response.ok) setError(response.error);
      else setLead(response.body.lead);
      setLoading(false);
    });
  }, [id]);

  async function remove() {
    const response = await apiSend(`/api/leads/${id}`, { method: "DELETE" });
    if (!response.ok) {
      setError(response.error);
      return;
    }
    router.push("/leads");
    router.refresh();
  }

  if (loading) return <p className="text-sm text-slate-500">{t("loading")}</p>;
  if (!lead) {
    return (
      <div className="space-y-3">
        <Banner tone="error">{errorText(error || "not_found")}</Banner>
        <Link href="/leads" className={secondaryClass}>{t("back")}</Link>
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <Link href="/leads" className="text-sm font-medium text-indigo-700">{t("back")}</Link>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-2xl font-semibold" dir="auto">{lead.title}</h1>
          <StatusBadge status={lead.status} />
        </div>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">{t("associatedClient")}</dt>
            <dd className="mt-1 font-medium" dir="auto">
              {lead.client_id ? (
                <Link href={`/clients/${lead.client_id}`} className="text-indigo-700">{lead.client_name || t("view")}</Link>
              ) : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">{t("dealValue")}</dt>
            <dd className="mt-1 font-medium">{money(lead.value)}</dd>
          </div>
          <div>
            <dt className="text-slate-500">{t("createdAt")}</dt>
            <dd className="mt-1 font-medium">{date(lead.created_at)}</dd>
          </div>
        </dl>
        {error ? <div className="mt-4"><Banner tone="error">{errorText(error)}</Banner></div> : null}
        <div className="mt-5">
          <button type="button" className={dangerClass} onClick={remove}>{t("deleteLead")}</button>
        </div>
      </div>
    </section>
  );
}
