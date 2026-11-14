"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { mapAuthError, validateEmail, validatePassword } from "@/lib/validation";

export type AuthState = {
  error?: string;
  message?: string;
};

async function origin() {
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const proto = headerStore.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

export async function login(_state: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const emailError = validateEmail(email, true);
  if (emailError) return { error: emailError };
  if (!password) return { error: "invalid_credentials" };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) return { error: mapAuthError(error) };
  redirect("/dashboard");
}

export async function register(_state: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");
  const emailError = validateEmail(email, true);
  if (emailError) return { error: emailError };
  const passwordError = validatePassword(password);
  if (passwordError) return { error: passwordError };
  if (password !== confirm) return { error: "password_mismatch" };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: { emailRedirectTo: `${await origin()}/auth/confirm` },
  });

  if (error) return { error: mapAuthError(error) };
  if (data.session) redirect("/dashboard");
  return { message: "check_email" };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
