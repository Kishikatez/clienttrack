import { NextResponse } from "next/server";
import { deleteClient, getClient, updateClient } from "@/lib/crm";
import { apiError, readJson, requireApiUser } from "@/lib/http";
import { isUuid, validateClientInput } from "@/lib/validation";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
  const auth = await requireApiUser();
  if (!auth.user) return auth.response;

  const { id } = await context.params;
  if (!isUuid(id)) return apiError("invalid_id", 400);

  try {
    const result = await getClient(auth.supabase, auth.user.id, id);
    if (!result) return apiError("not_found", 404);
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/clients/[id]", error);
    return apiError("load_failed", 500);
  }
}

export async function PATCH(request: Request, context: Context) {
  const auth = await requireApiUser();
  if (!auth.user) return auth.response;

  const { id } = await context.params;
  if (!isUuid(id)) return apiError("invalid_id", 400);

  const body = await readJson(request);
  if ("error" in body && body.error) return apiError(body.error, 400);

  const parsed = validateClientInput(body.data);
  if ("error" in parsed && parsed.error) return apiError(parsed.error, 400);

  const result = await updateClient(auth.supabase, auth.user.id, id, parsed.data);
  if ("error" in result && result.error) {
    return apiError(result.error, result.error === "not_found" ? 404 : 400);
  }
  return NextResponse.json(result.data);
}

export async function DELETE(_request: Request, context: Context) {
  const auth = await requireApiUser();
  if (!auth.user) return auth.response;

  const { id } = await context.params;
  if (!isUuid(id)) return apiError("invalid_id", 400);

  const result = await deleteClient(auth.supabase, auth.user.id, id);
  if ("error" in result && result.error) {
    const status = result.error === "not_found" ? 404 : result.error === "delete_blocked" ? 409 : 400;
    return apiError(result.error, status);
  }
  return NextResponse.json({ ok: true });
}
