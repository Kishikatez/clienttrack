import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseEnv, supabaseCookieOptions } from "@/lib/supabase/env";

/**
 * Server Supabase client.
 * Reads the session from HTTP-only cookies and writes refreshed cookies
 * when the route handler or server action is allowed to set cookies.
 */
export async function createClient() {
  const cookieStore = await cookies();
  const { url, key } = getSupabaseEnv();

  return createServerClient(url, key, {
    cookieOptions: supabaseCookieOptions,
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot write cookies. The root proxy refreshes
          // the session on the next request instead.
        }
      },
    },
  });
}
