"use client";

import { useI18n } from "@/components/I18nProvider";
import { AuthCard } from "@/components/auth/AuthCard";

export default function RegisterWrapper() {
  const { t } = useI18n();

  return (
    <div aria-label={t("registerTitle")}>
      <AuthCard mode="register" title={t("registerTitle")} />
    </div>
  );
}
