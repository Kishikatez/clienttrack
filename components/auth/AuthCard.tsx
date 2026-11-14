"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login, register, type AuthState } from "@/app/auth/actions";
import { PublicHeader } from "@/components/PublicHeader";
import { useI18n } from "@/components/I18nProvider";
import { Banner, fieldClass, labelClass, primaryClass } from "@/components/crm/ui";

const initial: AuthState = {};

export function AuthCard({
  mode,
  notice,
  title,
}: {
  mode: "login" | "register";
  notice?: string;
  title?: string;
}) {
  const { t, errorText } = useI18n();
  const action = mode === "login" ? login : register;
  const [state, formAction, pending] = useActionState(action, initial);

  return (
    <div className="min-h-screen bg-slate-50">
      <PublicHeader />
      <main className="mx-auto flex w-full max-w-md flex-col px-4 py-12">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-[#0f2744]">
            {title ?? (mode === "login" ? t("loginTitle") : t("registerTitle"))}
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {mode === "login" ? t("loginSubtitle") : t("registerSubtitle")}
          </p>

          <div className="mt-4 space-y-3">
            {notice ? (
              <Banner tone={notice === "registration_success" ? "ok" : "error"}>
                {errorText(notice)}
              </Banner>
            ) : null}
            {state.error ? <Banner tone="error">{errorText(state.error)}</Banner> : null}
            {state.message ? <Banner tone="ok">{errorText(state.message)}</Banner> : null}
          </div>

          <form action={formAction} className="mt-5 space-y-4">
            {mode === "register" ? (
              <label className="block">
                <span className={labelClass}>{t("name")}</span>
                <input className={fieldClass} name="name" autoComplete="name" required maxLength={100} />
              </label>
            ) : null}
            <label className="block">
              <span className={labelClass}>{t("email")}</span>
              <input className={fieldClass} name="email" type="email" autoComplete="email" required dir="ltr" />
            </label>
            <label className="block">
              <span className={labelClass}>{t("password")}</span>
              <input
                className={fieldClass}
                name="password"
                type="password"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                required
                minLength={mode === "register" ? 8 : undefined}
                dir="ltr"
              />
            </label>
            {mode === "register" ? (
              <label className="block">
                <span className={labelClass}>{t("confirmPassword")}</span>
                <input className={fieldClass} name="confirmPassword" type="password" autoComplete="new-password" required minLength={8} dir="ltr" />
              </label>
            ) : null}
            <button className={`${primaryClass} w-full`} type="submit" disabled={pending}>
              {pending ? t("loading") : mode === "login" ? t("signIn") : t("signUp")}
            </button>
          </form>

          <p className="mt-5 text-sm text-slate-600">
            {mode === "login" ? t("noAccount") : t("alreadyHaveAccount")}{" "}
            <Link href={mode === "login" ? "/register" : "/login"} className="font-medium text-indigo-700">
              {mode === "login" ? t("signUp") : t("signIn")}
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}
