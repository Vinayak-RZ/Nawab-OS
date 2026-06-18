/** HTTP API client */
export function registerApi(ctx) {
  async function apiUpload(path, formData, method = "POST") {
    const r = await fetch("/api" + path, { method, body: formData, credentials: "same-origin" });
    const data = await r.json().catch(() => ({}));
    if (r.status === 401 && data.pin_required) {
      ctx.showPinGate();
      throw new Error("Enter your PIN to continue");
    }
    if (!r.ok) throw new Error(data.error || r.statusText);
    return data;
  }

  async function api(path, opts = {}) {
    const ctrl = new AbortController();
    const ms = opts.timeoutMs ?? 30000;
    const timer = setTimeout(() => ctrl.abort(), ms);
    const { timeoutMs: _t, headers, signal, ...fetchOpts } = opts;
    try {
      const r = await fetch("/api" + path, {
        ...fetchOpts,
        credentials: "same-origin",
        headers: { "Content-Type": "application/json", ...(headers || {}) },
        signal: signal || ctrl.signal,
      });
      const data = await r.json().catch(() => ({}));
      if (r.status === 401 && data.pin_required) {
        ctx.showPinGate();
        throw new Error("Enter your PIN to continue");
      }
      if (!r.ok) throw new Error(data.error || r.statusText);
      return data;
    } catch (e) {
      if (e.name === "AbortError") throw new Error("Request timed out — is the server running?");
      throw e;
    } finally {
      clearTimeout(timer);
    }
  }

  ctx.api = api;
  ctx.apiUpload = apiUpload;
}
