"use client";

import { useI18n } from "@/components/I18nProvider";
import { AuthCard } from "@/components/auth/AuthCard";

export default function LoginWrapper({ notice }: { notice?: string }) {
  const { t } = useI18n();

  return (
    <div aria-label={t("loginTitle")}>
      <AuthCard mode="login" notice={notice} title={t("loginTitle")} />
    </div>
  );
}
