"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiSend } from "@/lib/api-client";
import { useI18n } from "@/components/I18nProvider";
import { Banner, StatusBadge, dangerClass, secondaryClass } from "@/components/crm/ui";
import type { ClientRecord, LeadRecord } from "@/lib/types";

export function ClientDetail({ id }: { id: string }) {
  const { t, errorText, date, money } = useI18n();
  const router = useRouter();
  const [client, setClient] = useState<ClientRecord | null>(null);
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiSend<{ client: ClientRecord; leads: LeadRecord[] }>(`/api/clients/${id}`).then((response) => {
      if (!response.ok) {
        setError(response.error);
      } else {
        setClient(response.body.client);
        setLeads(response.body.leads);
      }
      setLoading(false);
    });
  }, [id]);

  async function remove() {
    const response = await apiSend(`/api/clients/${id}`, { method: "DELETE" });
    if (!response.ok) {
      setError(response.error);
      return;
    }
    router.push("/clients");
    router.refresh();
  }

  if (loading) return <p className="text-sm text-slate-500">{t("loading")}</p>;
  if (!client) {
    return (
      <div className="space-y-3">
        <Banner tone="error">{errorText(error || "not_found")}</Banner>
        <Link href="/clients" className={secondaryClass}>{t("back")}</Link>
      </div>
    );
  }

  return (
    <section className="space-y-5">
      <Link href="/clients" className="text-sm font-medium text-indigo-700">{t("back")}</Link>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-semibold" dir="auto">{client.name}</h1>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <Info label={t("company")} value={client.company || "—"} />
          <Info label={t("email")} value={client.email || "—"} ltr />
          <Info label={t("phone")} value={client.phone || "—"} ltr />
          <Info label={t("createdAt")} value={date(client.created_at)} />
        </dl>
        {error ? <div className="mt-4"><Banner tone="error">{errorText(error)}</Banner></div> : null}
        <div className="mt-5">
          <button type="button" className={dangerClass} onClick={remove}>{t("deleteClient")}</button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">{t("relatedLeads")}</h2>
        {leads.length === 0 ? <p className="mt-3 text-sm text-slate-600">{t("noRelatedLeads")}</p> : null}
        <ul className="mt-3 divide-y divide-slate-100">
          {leads.map((lead) => (
            <li key={lead.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>
                <Link href={`/leads/${lead.id}`} className="font-medium text-indigo-700" dir="auto">{lead.title}</Link>
                <p className="text-sm text-slate-500">{money(lead.value)}</p>
              </div>
              <StatusBadge status={lead.status} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Info({ label, value, ltr = false }: { label: string; value: string; ltr?: boolean }) {
  return (
    <div>
      <dt className="text-slate-500">{label}</dt>
      <dd className="mt-1 font-medium" dir={ltr ? "ltr" : "auto"}>{value}</dd>
    </div>
  );
}
