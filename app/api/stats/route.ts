import { NextResponse } from "next/server";
import { apiError, requireApiUser } from "@/lib/http";

export async function GET() {
  const auth = await requireApiUser();
  if (!auth.user) return auth.response;

  try {
    const [clients, activeLeads, convertedLeads] = await Promise.all([
      auth.supabase
        .from("clients")
        .select("id", { count: "exact", head: true })
        .eq("user_id", auth.user.id),
      auth.supabase
        .from("leads")
        .select("id", { count: "exact", head: true })
        .eq("user_id", auth.user.id)
        .in("status", ["New", "Contacted", "Qualified"]),
      auth.supabase
        .from("leads")
        .select("id", { count: "exact", head: true })
        .eq("user_id", auth.user.id)
        .eq("status", "Converted"),
    ]);

    const error = clients.error ?? activeLeads.error ?? convertedLeads.error;
    if (error) throw error;

    return NextResponse.json({
      totalClients: clients.count ?? 0,
      activeLeads: activeLeads.count ?? 0,
      convertedLeads: convertedLeads.count ?? 0,
    });
  } catch (error) {
    console.error("GET /api/stats", error);
    return apiError("load_failed", 500);
  }
}
