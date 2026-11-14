export async function apiSend<T>(
  url: string,
  init?: RequestInit,
): Promise<{ ok: true; body: T } | { ok: false; error: string }> {
  try {
    const response = await fetch(url, {
      ...init,
      headers: {
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...(init?.headers ?? {}),
      },
    });
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) {
      return { ok: false, error: body.error ?? "save_failed" };
    }
    return { ok: true, body: body as T };
  } catch {
    return { ok: false, error: "load_failed" };
  }
}
