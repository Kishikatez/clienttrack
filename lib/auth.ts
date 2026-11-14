import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthUser = {
  id: string;
  email: string;
};

export async function getAuthContext() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;
  const id = !error && typeof claims?.sub === "string" ? claims.sub : null;
  const email = typeof claims?.email === "string" ? claims.email : "";

  return {
    supabase,
    user: id ? ({ id, email } satisfies AuthUser) : null,
  };
}

export async function requireUser() {
  const context = await getAuthContext();
  if (!context.user) redirect("/login");
  return context as typeof context & { user: AuthUser };
}
