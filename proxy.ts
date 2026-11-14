import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          supabaseResponse = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Get authenticated user claims safely
  const { data, error } = await supabase.auth.getClaims();

  const claims = data?.claims ?? null;
  const user = error ? null : claims;

  const pathname = request.nextUrl.pathname;

  // Protected routes
  const protectedRoutes = ["/dashboard", "/clients"];

  const isProtected = protectedRoutes.some(
    (route) =>
      pathname === route || pathname.startsWith(`${route}/`)
  );

  // Authentication routes
  const isAuthPage =
    pathname === "/login" || pathname === "/register";

  // Redirect unauthenticated users
  if (isProtected && !user) {
    return NextResponse.redirect(
      new URL("/login", request.url)
    );
  }

  // Redirect authenticated users
  if (isAuthPage && user) {
    return NextResponse.redirect(
      new URL("/dashboard", request.url)
    );
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
