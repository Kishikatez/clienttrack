import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "@/lib/supabase/env";

/**
 * Browser Supabase client.
 * Authenticated CRM requests go through server route handlers so the session
 * cookie can stay HTTP-only. This client is for public browser calls only.
 */
export function createClient() {
  const { url, key } = getSupabaseEnv();
  return createBrowserClient(url, key);
}
