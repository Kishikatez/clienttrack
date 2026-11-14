export const LEAD_STATUSES = [
  "New",
  "Contacted",
  "Qualified",
  "Converted",
  "Lost",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export type ClientRecord = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  created_at: string;
};

export type LeadRecord = {
  id: string;
  client_id: string | null;
  client_name: string | null;
  title: string;
  value: number;
  status: LeadStatus;
  created_at: string;
};

export type PageResult<T> = {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
};

export type DashboardData = {
  totalClients: number;
  totalLeads: number;
  newLeads: number;
  qualifiedLeads: number;
  convertedLeads: number;
  totalValue: number;
  recentClients: ClientRecord[];
  recentLeads: LeadRecord[];
  statusCounts: Record<LeadStatus, number>;
};
