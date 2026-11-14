"use client";

import { useI18n } from "@/components/I18nProvider";
import { LeadManager } from "@/components/leads/LeadManager";

export default function LeadsWrapper() {
  const { t } = useI18n();

  return (
    <div role="region" aria-label={t("leads")}>
      <LeadManager />
    </div>
  );
}
