import { translate, type Locale, type MessageKey } from "@/lib/i18n/dictionaries";

const codes: Record<string, MessageKey> = {
  name_required: "nameRequired",
  name_too_long: "nameTooLong",
  title_required: "titleRequired",
  title_too_long: "titleTooLong",
  email_invalid: "emailInvalid",
  email_too_long: "emailTooLong",
  password_too_short: "passwordTooShort",
  password_mismatch: "passwordMismatch",
  phone_invalid: "phoneInvalid",
  phone_too_long: "phoneTooLong",
  company_too_long: "companyTooLong",
  value_invalid: "valueInvalid",
  status_invalid: "statusInvalid",
  client_required: "clientRequired",
  client_not_found: "clientNotFound",
  not_found: "notFound",
  unauthorized: "unauthorized",
  delete_blocked: "deleteBlocked",
  save_failed: "saveFailed",
  load_failed: "loadFailed",
  invalid_credentials: "invalidCredentials",
  email_not_confirmed: "emailNotConfirmed",
  user_exists: "userExists",
  auth_failed: "authFailed",
  check_email: "checkEmail",
  verification: "verificationFailed",
  invalid_id: "invalidId",
};

export function messageFor(locale: Locale, code: string | undefined) {
  if (!code) return translate(locale, "saveFailed");
  return translate(locale, codes[code] ?? "saveFailed");
}
