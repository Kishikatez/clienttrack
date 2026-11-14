import { NextResponse } from "next/server";
import { deleteLead, getLead, updateLead } from "@/lib/crm";
import { apiError, readJson, requireApiUser } from "@/lib/http";
import { isUuid, validateLeadInput } from "@/lib/validation";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
  const auth = await requireApiUser();
  if (!auth.user) return auth.response;

  const { id } = await context.params;
  if (!isUuid(id)) return apiError("invalid_id", 400);

  try {
    const result = await getLead(auth.supabase, auth.user.id, id);
    if (!result) return apiError("not_found", 404);
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/leads/[id]", error);
    return apiError("load_failed", 500);
  }
}

export async function PATCH(request: Request, context: Context) {
  const auth = await requireApiUser();
  if (!auth.user) return auth.response;

  const { id } = await context.params;
  if (!isUuid(id)) return apiError("invalid_id", 400);

  const body = await readJson(request);
  if ("error" in body) return apiError(body.error, 400);

  const parsed = validateLeadInput(body.data);
  if ("error" in parsed) return apiError(parsed.error, 400);

  try {
    const result = await updateLead(auth.supabase, auth.user.id, id, parsed.data);
    if ("error" in result) {
      const status = result.error === "not_found" || result.error === "client_not_found" ? 404 : 400;
      return apiError(result.error, status);
    }
    return NextResponse.json(result.data);
  } catch (error) {
    console.error("PATCH /api/leads/[id]", error);
    return apiError("save_failed", 500);
  }
}

export async function DELETE(_request: Request, context: Context) {
  const auth = await requireApiUser();
  if (!auth.user) return auth.response;

  const { id } = await context.params;
  if (!isUuid(id)) return apiError("invalid_id", 400);

  const result = await deleteLead(auth.supabase, auth.user.id, id);
  if ("error" in result) {
    return apiError(result.error, result.error === "not_found" ? 404 : 400);
  }
  return NextResponse.json({ ok: true });
}
