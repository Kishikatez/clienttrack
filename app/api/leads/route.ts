import { NextResponse } from "next/server";
import { createLead, listLeads } from "@/lib/crm";
import { apiError, pageParams, readJson, requireApiUser } from "@/lib/http";
import { validateLeadInput } from "@/lib/validation";

export async function GET(request: Request) {
  const auth = await requireApiUser();
  if (!auth.user) return auth.response;

  const url = new URL(request.url);
  const { page, pageSize } = pageParams(url);

  try {
    const result = await listLeads(auth.supabase, auth.user.id, {
      q: url.searchParams.get("q") ?? "",
      status: url.searchParams.get("status") ?? "",
      clientId: url.searchParams.get("clientId") ?? "",
      page,
      pageSize,
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/leads", error);
    return apiError("load_failed", 500);
  }
}

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (!auth.user) return auth.response;

  const body = await readJson(request);
  if ("error" in body) return apiError(body.error, 400);

  const parsed = validateLeadInput(body.data);
  if ("error" in parsed) return apiError(parsed.error, 400);

  try {
    const result = await createLead(auth.supabase, auth.user.id, parsed.data);
    if ("error" in result) {
      return apiError(result.error, result.error === "client_not_found" ? 404 : 400);
    }
    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    console.error("POST /api/leads", error);
    return apiError("save_failed", 500);
  }
}
