/** @module shell/boot — auto-split from app.js */
export function registerShellBoot(ctx) {
  function showBootError(err) {
    console.error(`${ctx.APP_NAME} boot failed:`, err);
    ctx.setConnectionStatus("Offline", "paused");
    const msg = ctx.esc(err?.message || String(err));
    ctx.$("#content").innerHTML = `<div class="driver-card span-12">
      <p class="title-md">Could not connect to ${ctx.esc(ctx.APP_NAME)}</p>
      <p class="body-md muted" style="margin-top:8px">${msg}</p>
      <p class="body-md muted" style="margin-top:12px">Make sure <code>python main.py</code> is running, then tap <strong>Refresh</strong> in the top bar.</p>
    </div>`;
  }

  function showPinGate(message, lockedSeconds) {
    const gate = ctx.$("#pin-gate");
    const app = document.querySelector(".app");
    const err = ctx.$("#pin-error");
    const input = ctx.$("#pin-input");
    if (gate) {
      gate.hidden = false;
      gate.classList.add("is-visible");
    }
    if (app) app.setAttribute("inert", "");
    if (err) {
      if (message) {
        err.textContent = message;
        err.hidden = false;
      } else {
        err.hidden = true;
        err.textContent = "";
      }
    }
    if (input && !lockedSeconds) {
      input.disabled = false;
      input.focus();
    }
    if (input && lockedSeconds) {
      input.disabled = true;
      if (err) {
        err.textContent = `Too many attempts. Wait ${lockedSeconds}s.`;
        err.hidden = false;
      }
    }
    ctx.setConnectionStatus("Locked", "paused");
  }

  function hidePinGate() {
    const gate = ctx.$("#pin-gate");
    const app = document.querySelector(".app");
    if (gate) {
      gate.hidden = true;
      gate.classList.remove("is-visible");
    }
    if (app) app.removeAttribute("inert");
  }

  async function fetchAuthStatus() {
    const r = await fetch("/api/auth/status", { credentials: "same-origin", headers: { Accept: "application/json" } });
    return r.json();
  }

  function bindPinGate() {
    if (window.__FOS_PIN_BOUND) return;
    window.__FOS_PIN_BOUND = true;
    ctx.$("#pin-form")?.addEventListener("submit", async e => {
      e.preventDefault();
      const pin = (ctx.$("#pin-input")?.value || "").trim();
      const err = ctx.$("#pin-error");
      if (!/^\d{6}$/.test(pin)) {
        if (err) { err.textContent = "Enter exactly 6 digits"; err.hidden = false; }
        return;
      }
      try {
        const res = await fetch("/api/auth/pin", {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pin }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Incorrect PIN");
        ctx.hidePinGate();
        ctx.$("#pin-input").value = "";
        if (err) err.hidden = true;
        await ctx.startApp();
      } catch (ex) {
        if (err) { err.textContent = ex.message; err.hidden = false; }
        const st = await ctx.fetchAuthStatus().catch(() => ({}));
        if (st.locked_seconds) ctx.showPinGate(ex.message, st.locked_seconds);
      }
    });
    ctx.$("#pin-input")?.addEventListener("input", e => {
      e.target.value = e.target.value.replace(/\D/g, "").slice(0, 6);
    });
  }

  function applyBootUrlParams() {
    ctx.resolveBootRoute();

    const p = new URLSearchParams(location.search);
    const world = p.get("world");
    if (world) {
      ctx.state.inspectorWorldId = world;
      ctx.setActiveWorld(world);
    }

    const companies = p.get("companies");
    if (companies && ctx.currentView === "outreach") {
      const ids = companies.split(",").map(s => parseInt(s.trim(), 10)).filter(Boolean);
      if (ids.length) {
        if (!ctx.state.ui) ctx.state.ui = {};
        ctx.state.ui.crmOutreachSelected = ids;
      }
      p.delete("companies");
    }

    if (p.get("github") === "connected" || p.get("github_error")) {
      const err = p.get("github_error");
      if (err) console.warn("GitHub auth:", err);
      p.delete("github");
      p.delete("github_error");
      const path = location.pathname || "/";
      const qs = p.toString();
      history.replaceState({}, "", path + (qs ? `?${qs}` : ""));
    }
  }

  async function startApp() {
    try {
      await ctx.refresh(true);
    } catch (e) {
      ctx.showBootError(e);
      return;
    }
    ctx.applyBootUrlParams();
    ctx.syncMobileNav(ctx.currentView);
    const gen = ++ctx.viewDataLoadGen;
    ctx.setViewLoading(true);
    ctx.render({ post: false });
    try {
      await ctx.loadViewData(ctx.currentView);
      if (gen !== ctx.viewDataLoadGen) return;
      ctx.setViewLoading(false);
      ctx.render();
    } catch (e) {
      console.error(e);
      if (gen === ctx.viewDataLoadGen) ctx.setViewLoading(false);
    }
    ctx.startLivePoll();
    if (typeof decorateNavIcons === "function") decorateNavIcons();
  }

  async function boot() {
    ctx.initContentDelegation();
    ctx.initMdEditorDialog();
    ctx.bindPinGate();
    let auth = window.__FOS_AUTH;
    if (!auth) {
      try {
        auth = await ctx.fetchAuthStatus();
      } catch (e) {
        ctx.showBootError(e);
        return;
      }
    }
    if (auth.pin_required && !auth.authenticated) {
      ctx.showPinGate(null, auth.locked_seconds || 0);
      return;
    }
    ctx.hidePinGate();
    await ctx.startApp();
  }

  ctx.showBootError = showBootError;
  ctx.showPinGate = showPinGate;
  ctx.hidePinGate = hidePinGate;
  ctx.fetchAuthStatus = fetchAuthStatus;
  ctx.bindPinGate = bindPinGate;
  ctx.applyBootUrlParams = applyBootUrlParams;
  ctx.startApp = startApp;
  ctx.boot = boot;
}
