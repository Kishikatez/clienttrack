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
  dangerClass,
  fieldClass,
  labelClass,
  primaryClass,
  secondaryClass,
} from "@/components/crm/ui";
import type { ClientRecord, PageResult } from "@/lib/types";

type Draft = {
  id?: string;
  name: string;
  email: string;
  phone: string;
  company: string;
};

const emptyDraft: Draft = { name: "", email: "", phone: "", company: "" };

export function ClientManager({ openCreate = false }: { openCreate?: boolean }) {
  const { t, errorText, date } = useI18n();
  const [draftQuery, setDraftQuery] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<PageResult<ClientRecord>>({
    data: [],
    page: 1,
    pageSize: 8,
    total: 0,
  });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState<Draft | null>(openCreate ? emptyDraft : null);
  const [pendingDelete, setPendingDelete] = useState<ClientRecord | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({
      page: String(page),
      pageSize: "8",
      q: query,
    });

    apiSend<PageResult<ClientRecord>>(`/api/clients?${params}`, { signal: controller.signal })
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
  }, [page, query, reloadKey]);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!form) return;
    setSaving(true);
    setError("");
    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      company: form.company,
    };
    const response = form.id
      ? await apiSend<ClientRecord>(`/api/clients/${form.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        })
      : await apiSend<ClientRecord>("/api/clients", {
          method: "POST",
          body: JSON.stringify(payload),
        });
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
    const response = await apiSend<{ ok: boolean }>(`/api/clients/${pendingDelete.id}`, {
      method: "DELETE",
    });
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
          <h1 className="text-2xl font-semibold">{t("clientManagement")}</h1>
          <p className="mt-1 text-sm text-slate-600">{t("clientSubtitle")}</p>
        </div>
        <button type="button" className={primaryClass} onClick={() => { setForm(emptyDraft); setError(""); }}>
          <Plus className="size-4" />
          {t("addClient")}
        </button>
      </div>

      <form
        className="flex flex-col gap-2 sm:flex-row"
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
          placeholder={t("searchClients")}
          aria-label={t("searchClients")}
        />
        <button className={secondaryClass} type="submit">
          {t("search")}
        </button>
      </form>

      {notice ? <Banner tone="ok">{t(notice === "deleted" ? "deleted" : "saved")}</Banner> : null}
      {error ? <Banner tone="error">{errorText(error)}</Banner> : null}

      {loading ? <p className="text-sm text-slate-500">{t("loading")}</p> : null}
      {!loading && result.data.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-600">
          {t("emptyClients")}
        </div>
      ) : null}

      <div className="space-y-3 md:hidden">
        {result.data.map((client) => (
          <article key={client.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="font-semibold" dir="auto">{client.name}</h2>
            <p className="text-sm text-slate-500" dir="auto">{client.company || "—"}</p>
            <p className="mt-2 text-sm" dir="ltr">{client.email || "—"}</p>
            <p className="text-sm" dir="ltr">{client.phone || "—"}</p>
            <p className="mt-2 text-xs text-slate-400">{date(client.created_at)}</p>
            <ClientActions client={client} onEdit={setForm} onDelete={setPendingDelete} />
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
        <table className="w-full min-w-[720px] border-collapse text-start text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">{t("name")}</th>
              <th className="px-4 py-3 font-medium">{t("company")}</th>
              <th className="px-4 py-3 font-medium">{t("email")}</th>
              <th className="px-4 py-3 font-medium">{t("phone")}</th>
              <th className="px-4 py-3 font-medium">{t("createdAt")}</th>
              <th className="px-4 py-3 font-medium">{t("actions")}</th>
            </tr>
          </thead>
          <tbody>
            {result.data.map((client) => (
              <tr key={client.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium" dir="auto">{client.name}</td>
                <td className="px-4 py-3" dir="auto">{client.company || "—"}</td>
                <td className="px-4 py-3" dir="ltr">{client.email || "—"}</td>
                <td className="px-4 py-3" dir="ltr">{client.phone || "—"}</td>
                <td className="px-4 py-3">{date(client.created_at)}</td>
                <td className="px-4 py-3">
                  <ClientActions client={client} onEdit={setForm} onDelete={setPendingDelete} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={result.page} pageSize={result.pageSize} total={result.total} onPage={(next) => { setLoading(true); setPage(next); }} />

      {form ? (
        <Modal title={form.id ? t("editClient") : t("addClient")} onClose={() => setForm(null)}>
          <form className="space-y-3" onSubmit={save}>
            <Field label={t("name")} value={form.name} onChange={(name) => setForm({ ...form, name })} required />
            <Field label={t("email")} value={form.email} onChange={(email) => setForm({ ...form, email })} type="email" ltr hint={t("optional")} />
            <Field label={t("phone")} value={form.phone} onChange={(phone) => setForm({ ...form, phone })} ltr hint={t("optional")} />
            <Field label={t("company")} value={form.company} onChange={(company) => setForm({ ...form, company })} hint={t("optional")} />
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className={secondaryClass} onClick={() => setForm(null)}>{t("cancel")}</button>
              <button type="submit" className={primaryClass} disabled={saving}>{t("save")}</button>
            </div>
          </form>
        </Modal>
      ) : null}

      {pendingDelete ? (
        <Modal title={t("deleteClient")} onClose={() => setPendingDelete(null)}>
          <p className="text-sm leading-6 text-slate-600">{t("confirmDeleteClient")}</p>
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" className={secondaryClass} onClick={() => setPendingDelete(null)}>{t("cancel")}</button>
            <button type="button" className={dangerClass} disabled={saving} onClick={remove}>{t("delete")}</button>
          </div>
        </Modal>
      ) : null}
    </section>
  );
}

function ClientActions({
  client,
  onEdit,
  onDelete,
}: {
  client: ClientRecord;
  onEdit: (draft: Draft) => void;
  onDelete: (client: ClientRecord) => void;
}) {
  const { t } = useI18n();
  return (
    <div className="mt-3 flex flex-wrap gap-2 md:mt-0">
      <Link href={`/clients/${client.id}`} className={secondaryClass}>{t("view")}</Link>
      <button
        type="button"
        className={secondaryClass}
        onClick={() =>
          onEdit({
            id: client.id,
            name: client.name,
            email: client.email ?? "",
            phone: client.phone ?? "",
            company: client.company ?? "",
          })
        }
      >
        <Pencil className="size-4" />
        {t("edit")}
      </button>
      <button type="button" className={secondaryClass} onClick={() => onDelete(client)}>
        <Trash2 className="size-4" />
        {t("delete")}
      </button>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  ltr = false,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  ltr?: boolean;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className={labelClass}>
        {label}
        {hint ? <span className="ms-2 font-normal text-slate-400">{hint}</span> : null}
      </span>
      <input
        className={fieldClass}
        type={type}
        value={value}
        required={required}
        dir={ltr ? "ltr" : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
