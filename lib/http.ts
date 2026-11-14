import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth";

export function apiError(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

export async function requireApiUser() {
  const context = await getAuthContext();
  if (!context.user) {
    return {
      supabase: context.supabase,
      user: null,
      response: apiError("unauthorized", 401),
    };
  }
  return {
    supabase: context.supabase,
    user: context.user,
    response: null,
  };
}

export function pageParams(url: URL, fallbackSize = 8) {
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const requested = Number(url.searchParams.get("pageSize")) || fallbackSize;
  const pageSize = Math.min(100, Math.max(1, requested));
  return { page, pageSize };
}

export async function readJson(request: Request) {
  try {
    return { data: (await request.json()) as Record<string, unknown> };
  } catch {
    return { error: "save_failed" as const };
  }
}
