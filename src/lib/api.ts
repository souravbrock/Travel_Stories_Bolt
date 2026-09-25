const RAW = (import.meta.env.VITE_API_BASE as string | undefined) ?? "/api";
export const API_BASE = RAW.replace(/\/+$/, "");

/** GET JSON from the PHP API. Throws a descriptive Error on failure. */
export async function apiGet<T>(path: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`);
  } catch {
    throw new Error(
      `API unreachable at ${API_BASE}${path} — is the PHP backend running and config.php present?`,
    );
  }
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = (await res.json()) as { error?: string };
      if (body?.error) detail = body.error;
    } catch {
      /* keep statusText */
    }
    throw new Error(`API ${res.status} on ${path}: ${detail}`);
  }
  return (await res.json()) as T;
}

/** POST JSON to the PHP API. Throws a descriptive Error on failure. */
export async function apiPost<T>(path: string, payload: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error(`API unreachable at ${API_BASE}${path}`);
  }
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = (await res.json()) as { error?: string };
      if (body?.error) detail = body.error;
    } catch {
      /* keep statusText */
    }
    throw new Error(detail);
  }
  return (await res.json()) as T;
}
