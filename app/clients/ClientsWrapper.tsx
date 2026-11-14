"use client";

import { useI18n } from "@/components/I18nProvider";
import { ClientManager } from "@/components/clients/ClientManager";

export default function ClientsWrapper() {
  const { t } = useI18n();

  return (
    <div role="region" aria-label={t("clients")}>
      <ClientManager />
    </div>
  );
}
