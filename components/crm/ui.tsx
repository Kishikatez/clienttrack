"use client";

import { X } from "lucide-react";
import { useI18n } from "@/components/I18nProvider";
import { formatMessage } from "@/lib/format";
import { statusLabel } from "@/lib/i18n/dictionaries";
import type { LeadStatus } from "@/lib/types";

export const fieldClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-start text-sm text-[#0f2744] outline-none focus:ring-2 focus:ring-indigo-500";
export const labelClass = "mb-1 block text-start text-sm font-medium";
export const primaryClass =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60";
export const secondaryClass =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-[#0f2744] hover:bg-slate-50 disabled:opacity-60";
export const dangerClass =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-60";

export function Banner({
  tone,
  children,
}: {
  tone: "ok" | "error";
  children: React.ReactNode;
}) {
  return (
    <p
      role="status"
      className={`rounded-lg px-3 py-2 text-sm ${tone === "ok" ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"}`}
    >
      {children}
    </p>
  );
}

export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const { t } = useI18n();

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-4 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-xl"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 id="dialog-title" className="text-lg font-semibold">
            {title}
          </h2>
          <button type="button" onClick={onClose} aria-label={t("close")} className="rounded-lg p-1 hover:bg-slate-100">
            <X className="size-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Pagination({
  page,
  pageSize,
  total,
  onPage,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPage: (page: number) => void;
}) {
  const { t } = useI18n();
  const pages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
      <p className="text-slate-500">{formatMessage(t("showing"), { total })}</p>
      <div className="flex items-center gap-2">
        <button type="button" className={secondaryClass} disabled={page <= 1} onClick={() => onPage(page - 1)}>
          {t("previous")}
        </button>
        <span>{formatMessage(t("pageOf"), { page, pages })}</span>
        <button type="button" className={secondaryClass} disabled={page >= pages} onClick={() => onPage(page + 1)}>
          {t("next")}
        </button>
      </div>
    </div>
  );
}

const statusTone: Record<LeadStatus, string> = {
  New: "bg-slate-100 text-slate-700",
  Contacted: "bg-sky-50 text-sky-800",
  Qualified: "bg-indigo-50 text-indigo-800",
  Converted: "bg-emerald-50 text-emerald-800",
  Lost: "bg-rose-50 text-rose-800",
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  const { t } = useI18n();
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusTone[status]}`}>
      {t(statusLabel(status))}
    </span>
  );
}
