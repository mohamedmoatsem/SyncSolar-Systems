const BASE = process.env.EXPO_PUBLIC_DOMAIN
  ? `https://${process.env.EXPO_PUBLIC_DOMAIN}`
  : "";

let _authToken: string | null = null;
let _systemId: number | null = null;

export function setApiAuth(token: string | null, systemId: number | null) {
  _authToken = token;
  _systemId = systemId;
}

export async function apiFetch<T = unknown>(path: string, options?: RequestInit): Promise<T> {
  let url = `${BASE}${path}`;

  if (_systemId !== null && !url.includes("system_id=")) {
    const sep = url.includes("?") ? "&" : "?";
    url = `${url}${sep}system_id=${_systemId}`;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string> ?? {}),
  };

  if (_authToken) {
    headers["Authorization"] = `Bearer ${_authToken}`;
  }

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status}: ${text}`);
    }
    return res.json() as Promise<T>;
  } catch (err: any) {
    if (err.name === "AbortError") throw new Error("Request timed out");
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

export function apiUrl(path: string) {
  return BASE ? `${BASE}${path}` : path;
}
