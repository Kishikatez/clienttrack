"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { apiSend } from "@/lib/api-client";
import { useI18n } from "@/components/I18nProvider";
import {
  Banner,
  Modal,
  Pagination,
  StatusBadge,
  dangerClass,
  fieldClass,
  labelClass,
  primaryClass,
  secondaryClass,
} from "@/components/crm/ui";
import { LEAD_STATUSES, type ClientRecord, type LeadRecord, type LeadStatus, type PageResult } from "@/lib/types";
import { statusLabel } from "@/lib/i18n/dictionaries";

type Draft = {
  id?: string;
  title: string;
  client_id: string;
  value: string;
  status: LeadStatus;
};

const emptyDraft: Draft = { title: "", client_id: "", value: "", status: "New" };

export function LeadManager({ openCreate = false }: { openCreate?: boolean }) {
  const { t, errorText, date, money } = useI18n();
  const [draftQuery, setDraftQuery] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<PageResult<LeadRecord>>({
    data: [],
    page: 1,
    pageSize: 8,
    total: 0,
  });
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState<Draft | null>(openCreate ? emptyDraft : null);
  const [pendingDelete, setPendingDelete] = useState<LeadRecord | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ page: String(page), pageSize: "8", q: query });
    if (status) params.set("status", status);

    apiSend<PageResult<LeadRecord>>(`/api/leads?${params}`, { signal: controller.signal })
      .then((response) => {
        if (controller.signal.aborted) return;
        if (!response.ok) {
          setError(response.error);
          return;
        }
        setResult(response.body);
        setError("");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [page, query, status, reloadKey]);

  useEffect(() => {
    if (!form) return;
    apiSend<PageResult<ClientRecord>>("/api/clients?page=1&pageSize=100").then((response) => {
      if (response.ok) setClients(response.body.data);
    });
  }, [form]);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!form) return;
    setSaving(true);
    const payload = {
      title: form.title,
      client_id: form.client_id,
      value: form.value,
      status: form.status,
    };
    const response = form.id
      ? await apiSend<LeadRecord>(`/api/leads/${form.id}`, { method: "PATCH", body: JSON.stringify(payload) })
      : await apiSend<LeadRecord>("/api/leads", { method: "POST", body: JSON.stringify(payload) });
    setSaving(false);
    if (!response.ok) {
      setError(response.error);
      return;
    }
    setForm(null);
    setNotice("saved");
    setLoading(true);
    setReloadKey((value) => value + 1);
  }

  async function remove() {
    if (!pendingDelete) return;
    setSaving(true);
    const response = await apiSend(`/api/leads/${pendingDelete.id}`, { method: "DELETE" });
    setSaving(false);
    if (!response.ok) {
      setError(response.error);
      setPendingDelete(null);
      return;
    }
    setPendingDelete(null);
    setNotice("deleted");
    setLoading(true);
    setReloadKey((value) => value + 1);
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{t("leadManagement")}</h1>
          <p className="mt-1 text-sm text-slate-600">{t("leadSubtitle")}</p>
        </div>
        <button type="button" className={primaryClass} onClick={() => { setForm(emptyDraft); setError(""); }}>
          <Plus className="size-4" />
          {t("addLead")}
        </button>
      </div>

      <form
        className="grid gap-2 md:grid-cols-[1fr_220px_auto]"
        onSubmit={(event) => {
          event.preventDefault();
          setPage(1);
          setLoading(true);
          setQuery(draftQuery.trim());
        }}
      >
        <input
          className={fieldClass}
          value={draftQuery}
          onChange={(event) => setDraftQuery(event.target.value)}
          placeholder={t("searchLeads")}
          aria-label={t("searchLeads")}
        />
        <select
          className={fieldClass}
          value={status}
          aria-label={t("status")}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
            setLoading(true);
          }}
        >
          <option value="">{t("allStatuses")}</option>
          {LEAD_STATUSES.map((item) => (
            <option key={item} value={item}>{t(statusLabel(item))}</option>
          ))}
        </select>
        <button className={secondaryClass} type="submit">{t("search")}</button>
      </form>

      {notice ? <Banner tone="ok">{t(notice === "deleted" ? "deleted" : "saved")}</Banner> : null}
      {error ? <Banner tone="error">{errorText(error)}</Banner> : null}
      {loading ? <p className="text-sm text-slate-500">{t("loading")}</p> : null}
      {!loading && result.data.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-600">{t("emptyLeads")}</div>
      ) : null}

      <div className="space-y-3 md:hidden">
        {result.data.map((lead) => (
          <article key={lead.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-semibold" dir="auto">{lead.title}</h2>
              <StatusBadge status={lead.status} />
            </div>
            <p className="mt-2 text-sm" dir="auto">{lead.client_name || "—"}</p>
            <p className="text-sm font-medium">{money(lead.value)}</p>
            <p className="mt-1 text-xs text-slate-400">{date(lead.created_at)}</p>
            <LeadActions lead={lead} onEdit={setForm} onDelete={setPendingDelete} />
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
        <table className="w-full min-w-[760px] border-collapse text-start text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">{t("title")}</th>
              <th className="px-4 py-3 font-medium">{t("associatedClient")}</th>
              <th className="px-4 py-3 font-medium">{t("dealValue")}</th>
              <th className="px-4 py-3 font-medium">{t("status")}</th>
              <th className="px-4 py-3 font-medium">{t("createdAt")}</th>
              <th className="px-4 py-3 font-medium">{t("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {result.data.map((lead) => (
              <tr key={lead.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium" dir="auto">{lead.title}</td>
                <td className="px-4 py-3" dir="auto">{lead.client_name || "—"}</td>
                <td className="px-4 py-3">{money(lead.value)}</td>
                <td className="px-4 py-3"><StatusBadge status={lead.status} /></td>
                <td className="px-4 py-3">{date(lead.created_at)}</td>
                <td className="px-4 py-3">
                  <LeadActions lead={lead} onEdit={setForm} onDelete={setPendingDelete} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={result.page} pageSize={result.pageSize} total={result.total} onPage={(next) => { setLoading(true); setPage(next); }} />

      {form ? (
        <Modal title={form.id ? t("editLead") : t("addLead")} onClose={() => setForm(null)}>
          <form className="space-y-3" onSubmit={save}>
            <label className="block">
              <span className={labelClass}>{t("title")}</span>
              <input className={fieldClass} value={form.title} required onChange={(event) => setForm({ ...form, title: event.target.value })} />
            </label>
            <label className="block">
              <span className={labelClass}>{t("associatedClient")}</span>
              <select className={fieldClass} required value={form.client_id} onChange={(event) => setForm({ ...form, client_id: event.target.value })}>
                <option value="">{t("selectClient")}</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
              {clients.length === 0 ? <p className="mt-1 text-xs text-slate-500">{t("noClientOption")}</p> : null}
            </label>
            <label className="block">
              <span className={labelClass}>{t("dealValue")}</span>
              <input className={fieldClass} dir="ltr" inputMode="decimal" required value={form.value} onChange={(event) => setForm({ ...form, value: event.target.value })} />
            </label>
            <label className="block">
              <span className={labelClass}>{t("status")}</span>
              <select className={fieldClass} value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as LeadStatus })}>
                {LEAD_STATUSES.map((item) => (
                  <option key={item} value={item}>{t(statusLabel(item))}</option>
                ))}
              </select>
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className={secondaryClass} onClick={() => setForm(null)}>{t("cancel")}</button>
              <button type="submit" className={primaryClass} disabled={saving}>{t("save")}</button>
            </div>
          </form>
        </Modal>
      ) : null}

      {pendingDelete ? (
        <Modal title={t("deleteLead")} onClose={() => setPendingDelete(null)}>
          <p className="text-sm leading-6 text-slate-600">{t("confirmDeleteLead")}</p>
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" className={secondaryClass} onClick={() => setPendingDelete(null)}>{t("cancel")}</button>
            <button type="button" className={dangerClass} disabled={saving} onClick={remove}>{t("delete")}</button>
          </div>
        </Modal>
      ) : null}
    </section>
  );
}

function LeadActions({
  lead,
  onEdit,
  onDelete,
}: {
  lead: LeadRecord;
  onEdit: (draft: Draft) => void;
  onDelete: (lead: LeadRecord) => void;
}) {
  const { t } = useI18n();
  return (
    <div className="mt-3 flex flex-wrap gap-2 md:mt-0">
      <Link href={`/leads/${lead.id}`} className={secondaryClass}>{t("view")}</Link>
      <button
        type="button"
        className={secondaryClass}
        onClick={() =>
          onEdit({
            id: lead.id,
            title: lead.title,
            client_id: lead.client_id ?? "",
            value: String(lead.value),
            status: lead.status,
          })
        }
      >
        <Pencil className="size-4" />
        {t("edit")}
      </button>
      <button type="button" className={secondaryClass} onClick={() => onDelete(lead)}>
        <Trash2 className="size-4" />
        {t("delete")}
      </button>
    </div>
  );
}
