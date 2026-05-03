const BASE = process.env.EXPO_PUBLIC_DOMAIN
  ? `https://${process.env.EXPO_PUBLIC_DOMAIN}`
  : "";

export async function apiFetch<T = unknown>(path: string, options?: RequestInit): Promise<T> {
  const url = `${BASE}${path}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers ?? {}),
      },
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
