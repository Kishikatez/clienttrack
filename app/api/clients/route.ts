import { NextResponse } from "next/server";
import { createClient, listClients } from "@/lib/crm";
import { apiError, pageParams, readJson, requireApiUser } from "@/lib/http";
import { validateClientInput } from "@/lib/validation";

export async function GET(request: Request) {
  const auth = await requireApiUser();
  if (!auth.user) return auth.response;

  const url = new URL(request.url);
  const { page, pageSize } = pageParams(url);

  try {
    const result = await listClients(auth.supabase, auth.user.id, {
      q: url.searchParams.get("q") ?? "",
      page,
      pageSize,
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/clients", error);
    return apiError("load_failed", 500);
  }
}

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (!auth.user) return auth.response;

  const body = await readJson(request);
  if ("error" in body && body.error) return apiError(body.error, 400);

  const parsed = validateClientInput(body.data);
  if ("error" in parsed && parsed.error) return apiError(parsed.error, 400);

  const result = await createClient(auth.supabase, auth.user.id, parsed.data);
  if ("error" in result && result.error) return apiError(result.error, 400);
  return NextResponse.json(result.data, { status: 201 });
}
