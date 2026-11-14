import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv, supabaseCookieOptions } from "@/lib/supabase/env";

const PROTECTED_PREFIXES = ["/dashboard", "/clients", "/leads"];

function isProtectedPath(pathname: string) {
  return PROTECTED_PREFIXES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

function copyCookies(from: NextResponse, to: NextResponse) {
  const setCookies = from.headers.getSetCookie();

  if (setCookies.length > 0) {
    for (const cookie of setCookies) {
      to.headers.append("set-cookie", cookie);
    }
    return to;
  }

  from.cookies.getAll().forEach(({ name, value }) => {
    to.cookies.set(name, value);
  });
  return to;
}

/**
 * Refreshes the Supabase session and applies the optimistic route guard.
 * Pages and API handlers still check the user themselves. Proxy is not the
 * only security layer.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  let url: string;
  let key: string;

  try {
    ({ url, key } = getSupabaseEnv());
  } catch {
    return supabaseResponse;
  }

  const supabase = createServerClient(url, key, {
    cookieOptions: supabaseCookieOptions,
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        supabaseResponse = NextResponse.next({ request });

        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  const { data, error } = await supabase.auth.getClaims();
  const userId =
    error || typeof data?.claims?.sub !== "string" ? null : data.claims.sub;

  const { pathname } = request.nextUrl;
  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (isProtectedPath(pathname) && !userId) {
    const redirect = NextResponse.redirect(new URL("/login", request.url));
    return copyCookies(supabaseResponse, redirect);
  }

  if (isAuthPage && userId) {
    const redirect = NextResponse.redirect(new URL("/dashboard", request.url));
    return copyCookies(supabaseResponse, redirect);
  }

  return supabaseResponse;
}
