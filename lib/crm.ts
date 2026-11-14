import type { SupabaseClient } from "@supabase/supabase-js";
import { LEAD_STATUSES, type ClientRecord, type DashboardData, type LeadRecord, type LeadStatus } from "@/lib/types";
import { isUuid, mapDatabaseError, sanitizeSearch } from "@/lib/validation";

type ClientRow = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  created_at: string;
};

type LeadRow = {
  id: string;
  client_id: string | null;
  title: string;
  value: number | string;
  status: string;
  created_at: string;
};

const clientColumns = "id, name, email, phone, company, created_at";
const leadColumns = "id, client_id, title, value, status, created_at";

function toClient(row: ClientRow): ClientRecord {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    company: row.company,
    created_at: row.created_at,
  };
}

function toNumber(value: number | string) {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : 0;
}

function toLead(row: LeadRow, clientName: string | null = null): LeadRecord {
  const status = LEAD_STATUSES.includes(row.status as LeadStatus)
    ? (row.status as LeadStatus)
    : "New";

  return {
    id: row.id,
    client_id: row.client_id,
    client_name: clientName,
    title: row.title,
    value: toNumber(row.value),
    status,
    created_at: row.created_at,
  };
}

async function clientNames(supabase: SupabaseClient, userId: string, ids: string[]) {
  const unique = [...new Set(ids.filter(Boolean))];
  const names = new Map<string, string>();
  if (unique.length === 0) return names;

  const { data, error } = await supabase
    .from("clients")
    .select("id, name")
    .eq("user_id", userId)
    .in("id", unique);

  if (error) throw error;
  for (const row of data ?? []) names.set(row.id, row.name);
  return names;
}

export async function listClients(
  supabase: SupabaseClient,
  userId: string,
  options: { q?: string; page: number; pageSize: number },
) {
  const from = (options.page - 1) * options.pageSize;
  const to = from + options.pageSize - 1;
  let query = supabase
    .from("clients")
    .select(clientColumns, { count: "exact" })
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(from, to);

  const q = sanitizeSearch(options.q ?? "");
  if (q) {
    query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%,company.ilike.%${q}%`);
  }

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    data: ((data ?? []) as ClientRow[]).map(toClient),
    page: options.page,
    pageSize: options.pageSize,
    total: count ?? 0,
  };
}

export async function getClient(supabase: SupabaseClient, userId: string, id: string) {
  if (!isUuid(id)) return null;

  const { data, error } = await supabase
    .from("clients")
    .select(clientColumns)
    .eq("user_id", userId)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const { data: leads, error: leadsError } = await supabase
    .from("leads")
    .select(leadColumns)
    .eq("user_id", userId)
    .eq("client_id", id)
    .order("created_at", { ascending: false });

  if (leadsError) throw leadsError;

  return {
    client: toClient(data as ClientRow),
    leads: ((leads ?? []) as LeadRow[]).map((lead) => toLead(lead, data.name)),
  };
}

export async function createClient(
  supabase: SupabaseClient,
  userId: string,
  input: { name: string; email: string | null; phone: string | null; company: string | null },
) {
  const { data, error } = await supabase
    .from("clients")
    .insert({ user_id: userId, ...input })
    .select(clientColumns)
    .single();

  if (error) return { error: mapDatabaseError(error) };
  return { data: toClient(data as ClientRow) };
}

export async function updateClient(
  supabase: SupabaseClient,
  userId: string,
  id: string,
  input: { name: string; email: string | null; phone: string | null; company: string | null },
) {
  if (!isUuid(id)) return { error: "not_found" as const };

  const { data, error } = await supabase
    .from("clients")
    .update(input)
    .eq("user_id", userId)
    .eq("id", id)
    .select(clientColumns)
    .maybeSingle();

  if (error) return { error: mapDatabaseError(error) };
  if (!data) return { error: "not_found" as const };
  return { data: toClient(data as ClientRow) };
}

export async function deleteClient(supabase: SupabaseClient, userId: string, id: string) {
  if (!isUuid(id)) return { error: "not_found" as const };

  const { data, error } = await supabase
    .from("clients")
    .delete()
    .eq("user_id", userId)
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    return { error: error.code === "23503" ? ("delete_blocked" as const) : ("save_failed" as const) };
  }
  if (!data) return { error: "not_found" as const };
  return { ok: true as const };
}

export async function listLeads(
  supabase: SupabaseClient,
  userId: string,
  options: { q?: string; status?: string; clientId?: string; page: number; pageSize: number },
) {
  const from = (options.page - 1) * options.pageSize;
  const to = from + options.pageSize - 1;
  let query = supabase
    .from("leads")
    .select(leadColumns, { count: "exact" })
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(from, to);

  const q = sanitizeSearch(options.q ?? "");
  if (q) query = query.ilike("title", `%${q}%`);
  if (options.status && LEAD_STATUSES.includes(options.status as LeadStatus)) {
    query = query.eq("status", options.status);
  }
  if (options.clientId && isUuid(options.clientId)) {
    query = query.eq("client_id", options.clientId);
  }

  const { data, error, count } = await query;
  if (error) throw error;

  const rows = (data ?? []) as LeadRow[];
  const names = await clientNames(
    supabase,
    userId,
    rows.map((row) => row.client_id).filter((id): id is string => Boolean(id)),
  );

  return {
    data: rows.map((row) => toLead(row, row.client_id ? names.get(row.client_id) ?? null : null)),
    page: options.page,
    pageSize: options.pageSize,
    total: count ?? 0,
  };
}

export async function getLead(supabase: SupabaseClient, userId: string, id: string) {
  if (!isUuid(id)) return null;

  const { data, error } = await supabase
    .from("leads")
    .select(leadColumns)
    .eq("user_id", userId)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const row = data as LeadRow;
  let clientName: string | null = null;
  if (row.client_id) {
    const names = await clientNames(supabase, userId, [row.client_id]);
    clientName = names.get(row.client_id) ?? null;
  }

  return { lead: toLead(row, clientName) };
}

async function ownsClient(supabase: SupabaseClient, userId: string, clientId: string) {
  const { data, error } = await supabase
    .from("clients")
    .select("id")
    .eq("user_id", userId)
    .eq("id", clientId)
    .maybeSingle();

  if (error) throw error;
  return Boolean(data);
}

export async function createLead(
  supabase: SupabaseClient,
  userId: string,
  input: { title: string; client_id: string; value: number; status: LeadStatus },
) {
  if (!(await ownsClient(supabase, userId, input.client_id))) {
    return { error: "client_not_found" as const };
  }

  const { data, error } = await supabase
    .from("leads")
    .insert({ user_id: userId, ...input })
    .select(leadColumns)
    .single();

  if (error) return { error: mapDatabaseError(error) };

  const row = data as LeadRow;
  const names = await clientNames(supabase, userId, [input.client_id]);
  return { data: toLead(row, names.get(input.client_id) ?? null) };
}

export async function updateLead(
  supabase: SupabaseClient,
  userId: string,
  id: string,
  input: { title: string; client_id: string; value: number; status: LeadStatus },
) {
  if (!isUuid(id)) return { error: "not_found" as const };
  if (!(await ownsClient(supabase, userId, input.client_id))) {
    return { error: "client_not_found" as const };
  }

  const { data, error } = await supabase
    .from("leads")
    .update(input)
    .eq("user_id", userId)
    .eq("id", id)
    .select(leadColumns)
    .maybeSingle();

  if (error) return { error: mapDatabaseError(error) };
  if (!data) return { error: "not_found" as const };

  const names = await clientNames(supabase, userId, [input.client_id]);
  return { data: toLead(data as LeadRow, names.get(input.client_id) ?? null) };
}

export async function deleteLead(supabase: SupabaseClient, userId: string, id: string) {
  if (!isUuid(id)) return { error: "not_found" as const };

  const { data, error } = await supabase
    .from("leads")
    .delete()
    .eq("user_id", userId)
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) return { error: "save_failed" as const };
  if (!data) return { error: "not_found" as const };
  return { ok: true as const };
}

export async function getDashboard(supabase: SupabaseClient, userId: string): Promise<DashboardData> {
  const [clientsCount, leadRows, recentClients, recentLeadPage] = await Promise.all([
    supabase.from("clients").select("id", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("leads").select("value, status").eq("user_id", userId),
    supabase
      .from("clients")
      .select(clientColumns)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5),
    listLeads(supabase, userId, { page: 1, pageSize: 5 }),
  ]);

  if (clientsCount.error) throw clientsCount.error;
  if (leadRows.error) throw leadRows.error;
  if (recentClients.error) throw recentClients.error;

  const statusCounts = Object.fromEntries(LEAD_STATUSES.map((status) => [status, 0])) as Record<
    LeadStatus,
    number
  >;
  let totalValue = 0;

  for (const row of leadRows.data ?? []) {
    const status = LEAD_STATUSES.includes(row.status as LeadStatus)
      ? (row.status as LeadStatus)
      : "New";
    statusCounts[status] += 1;
    totalValue += toNumber(row.value);
  }

  return {
    totalClients: clientsCount.count ?? 0,
    totalLeads: (leadRows.data ?? []).length,
    newLeads: statusCounts.New,
    qualifiedLeads: statusCounts.Qualified,
    convertedLeads: statusCounts.Converted,
    totalValue,
    recentClients: ((recentClients.data ?? []) as ClientRow[]).map(toClient),
    recentLeads: recentLeadPage.data,
    statusCounts,
  };
}
