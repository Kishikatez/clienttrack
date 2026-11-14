import { LEAD_STATUSES, type LeadStatus } from "@/lib/types";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[0-9+\-().\s]{6,30}$/;
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: string) {
  return uuidPattern.test(value);
}

export function sanitizeSearch(value: string) {
  return value.replace(/[%_,.*()"'\\]/g, " ").replace(/\s+/g, " ").trim().slice(0, 80);
}

export function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function optionalText(value: unknown) {
  const text = cleanText(value);
  return text.length > 0 ? text : null;
}

export function validateEmail(value: unknown, required = false) {
  const email = cleanText(value);
  if (!email) return required ? "email_invalid" : null;
  if (email.length > 150) return "email_too_long";
  if (!emailPattern.test(email)) return "email_invalid";
  return null;
}

export function validatePassword(value: unknown) {
  const password = typeof value === "string" ? value : "";
  if (password.length < 8) return "password_too_short";
  if (password.length > 72) return "password_too_short";
  return null;
}

export function validateClientInput(input: Record<string, unknown>) {
  const name = cleanText(input.name);
  if (!name) return { error: "name_required" as const };
  if (name.length > 100) return { error: "name_too_long" as const };

  const emailError = validateEmail(input.email);
  if (emailError === "email_invalid") return { error: "email_invalid" as const };
  if (emailError === "email_too_long") return { error: "email_too_long" as const };

  const phone = optionalText(input.phone);
  if (phone && phone.length > 30) return { error: "phone_too_long" as const };
  if (phone && !phonePattern.test(phone)) return { error: "phone_invalid" as const };

  const company = optionalText(input.company);
  if (company && company.length > 100) return { error: "company_too_long" as const };

  return {
    data: {
      name,
      email: optionalText(input.email),
      phone,
      company,
    },
  };
}

export function validateLeadInput(input: Record<string, unknown>) {
  const title = cleanText(input.title);
  if (!title) return { error: "title_required" as const };
  if (title.length > 150) return { error: "title_too_long" as const };

  const clientId = cleanText(input.client_id);
  if (!clientId) return { error: "client_required" as const };
  if (!isUuid(clientId)) return { error: "client_not_found" as const };

  const rawValue =
    typeof input.value === "number" ? input.value : Number(cleanText(input.value));
  if (!Number.isFinite(rawValue) || rawValue < 0 || rawValue > 9_999_999_999.99) {
    return { error: "value_invalid" as const };
  }
  const value = Math.round(rawValue * 100) / 100;

  const status = cleanText(input.status) || "New";
  if (!LEAD_STATUSES.includes(status as LeadStatus)) {
    return { error: "status_invalid" as const };
  }

  return {
    data: {
      title,
      client_id: clientId,
      value,
      status: status as LeadStatus,
    },
  };
}

export function mapAuthError(error: { message: string; code?: string }) {
  const code = error.code ?? "";
  const message = error.message.toLowerCase();

  if (code === "invalid_credentials" || message.includes("invalid login")) {
    return "invalid_credentials";
  }
  if (code === "email_not_confirmed" || message.includes("not confirmed")) {
    return "email_not_confirmed";
  }
  if (
    code === "user_already_exists" ||
    message.includes("already registered") ||
    message.includes("already been registered")
  ) {
    return "user_exists";
  }
  return "auth_failed";
}

export function mapDatabaseError(error: { code?: string; message?: string }) {
  if (error.code === "23503") return "delete_blocked";
  if (error.code === "23514") return "status_invalid";
  return "save_failed";
}
