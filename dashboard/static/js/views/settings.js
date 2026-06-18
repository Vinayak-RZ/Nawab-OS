/** @module views/settings — auto-split from app.js */
export function registerViewsSettings(ctx) {
  function renderInfrastructureHealth() {
    const h = ctx.state._infraHealth;
    if (!h) {
      return `<section class="driver-card span-12">
        <div class="infra-health-head">
          <p class="caption-uppercase">Infrastructure</p>
          <button type="button" class="button-outline-on-dark button-sm" id="btn-infra-refresh">Check health</button>
        </div>
        <p class="body-md muted" style="margin-top:var(--space-sm)">Monitor EC2 host, S3 vault bucket, and disk on this server.</p>
      </section>`;
    }
    const host = h.host || {};
    const s3 = h.s3 || {};
    const disk = h.disk || {};
    const app = h.app || {};
    const hostRows = host.platform === "ec2"
      ? ctx.infraKvRow("Instance", host.instance_id, true)
        + ctx.infraKvRow("Region", host.region)
        + ctx.infraKvRow("Type", host.instance_type)
        + ctx.infraKvRow("IAM role", host.iam_role)
      : ctx.infraKvRow("Host", "Local / dev");
    const s3Rows = s3.configured
      ? ctx.infraKvRow("Bucket", s3.bucket, true)
        + ctx.infraKvRow("Region", s3.region)
        + ctx.infraKvRow("Read/write", s3.read_write_ok ? "OK" : (s3.reachable ? "Reachable only" : "Failed"))
      : ctx.infraKvRow("Storage", "Local disk only");
    const diskRows = ctx.infraKvRow("Data path", disk.path, true)
      + ctx.infraKvRow("Free", disk.free_gb != null ? `${disk.free_gb} GB` : null)
      + ctx.infraKvRow("Used", disk.used_pct != null ? `${disk.used_pct}%` : null);
    const overallOk = !!h.ok;
    return `<section class="driver-card span-12">
      <div class="infra-health-head">
        <div>
          <p class="caption-uppercase">Infrastructure</p>
          <p class="world-meta">Last checked ${ctx.esc(ctx.fmtTime(h.checked_at) || h.checked_at || "—")} · App storage: <strong>${ctx.esc(app.storage_backend || "—")}</strong></p>
        </div>
        <div class="infra-health-head__actions">
          <span class="badge-pill${overallOk ? " badge-pill--ok" : " badge-pill--warn"}">${overallOk ? "All checks passed" : "Needs attention"}</span>
          <button type="button" class="button-outline-on-dark button-sm" id="btn-infra-refresh">Refresh</button>
        </div>
      </div>
      <div class="infra-health-grid">
        ${ctx.infraHealthCard("EC2 host", host.ok !== false, hostRows, host.detail)}
        ${ctx.infraHealthCard("S3 vault", s3.configured ? !!s3.ok : true, s3Rows, s3.detail)}
        ${ctx.infraHealthCard("Disk", !!disk.ok, diskRows, disk.detail)}
      </div>
    </section>`;
  }

  function renderSettings() {
    const c = ctx.state.config || {};
    const integ = c.integrations || {};
    const wa = ctx.state._whatsapp || {};
    const level = (c.autonomy_level || "balanced").toLowerCase();
    const waStatus = !c.whatsapp_enabled
      ? "Disabled in .env"
      : wa.connected
        ? `Connected${wa.linked_phone ? ` (${ctx.esc(wa.linked_phone)})` : ""}`
        : wa.qr_pending
          ? "Scan QR below"
          : "Bridge not connected";
    const waQr = wa.qr_data_url
      ? `<img src="${wa.qr_data_url}" alt="WhatsApp QR code" width="280" height="280" style="margin-top:var(--space-sm);border-radius:8px">`
      : "";
    const pauseBtn = c.agent_paused
      ? `<button type="button" class="button-primary" id="toggle-pause">Resume agent</button>`
      : `<button type="button" class="button-outline-on-dark" id="toggle-pause">Pause agent</button>`;
    return `<div class="dashboard-grid settings-page">
      ${ctx.renderInfrastructureHealth()}
      <section class="driver-card span-4 settings-panel">
        <p class="caption-uppercase">Identity</p>
        <dl class="settings-kv" style="margin-top:var(--space-sm)">
          <div class="settings-kv__row"><dt>Name</dt><dd>${ctx.esc(c.my_name)}</dd></div>
          <div class="settings-kv__row"><dt>Company</dt><dd>${ctx.esc(c.company_name)}</dd></div>
        </dl>
        <p class="body-md muted" style="margin-top:var(--space-sm)">Edit identity in <code>.env</code> — restart to persist.</p>
      </section>
      <section class="driver-card span-8 human-panel">
        <p class="section-eyebrow">Your policy</p>
        <h3 class="title-sm">Agent behavior</h3>
        <p class="body-md muted" style="margin-bottom:var(--space-sm)">You set how much the agent can do without asking. Changes apply for this session.</p>
        <form class="human-form" id="agent-config-form">
          <div class="human-form__row">
            <label class="human-field"><span class="caption-uppercase">Autonomy</span>
              <select class="text-input-on-dark" name="autonomy_level">
                <option value="cautious"${level === "cautious" ? " selected" : ""}>Cautious — ask before most actions</option>
                <option value="balanced"${level === "balanced" ? " selected" : ""}>Balanced — routine tools auto-run</option>
                <option value="autonomous"${level === "autonomous" ? " selected" : ""}>Autonomous — minimal prompts</option>
              </select></label>
            <label class="human-field human-field--checkbox">
              <input type="checkbox" name="auto_approve" value="1"${c.auto_approve ? " checked" : ""}>
              <span>Auto-approve low-risk tool calls</span>
            </label>
          </div>
          <div class="human-form__actions">
            <button type="submit" class="button-primary button-sm">Save policy</button>
            ${pauseBtn}
          </div>
        </form>
      </section>
      <section class="driver-card span-4 settings-panel">
        <p class="caption-uppercase">Channels</p>
        <dl class="settings-kv" style="margin-top:var(--space-sm)">
          <div class="settings-kv__row"><dt>Web UI</dt><dd>${c.web_ui_enabled ? "On" : "Off"}</dd></div>
          <div class="settings-kv__row"><dt>Telegram</dt><dd>${c.telegram_enabled ? "On" : "Off"}</dd></div>
          <div class="settings-kv__row"><dt>Port</dt><dd>${c.dashboard_port}</dd></div>
        </dl>
      </section>
      <section class="driver-card span-4">
        <p class="caption-uppercase">Access</p>
        <p class="body-md muted" style="margin-top:var(--space-sm)">Lock this dashboard on shared or production hosts with a 6-digit PIN (<code>DASHBOARD_PIN</code> in <code>.env</code>).</p>
        <div class="human-form__actions" style="margin-top:var(--space-sm)">
          <button type="button" class="button-outline-on-dark button-sm" id="btn-logout">Lock dashboard</button>
        </div>
      </section>
      <section class="driver-card span-8">
        <p class="caption-uppercase">Integrations</p>
        <div class="integration-grid" style="margin-top:var(--space-sm)">
          ${ctx.integrationCard("Gmail", integ.gmail, "SMTP send + IMAP inbox via app password")}
          ${ctx.integrationCard("Google Calendar", integ.calendar, "OAuth token in data/google_token.json")}
          ${ctx.integrationCard("Qdrant", integ.qdrant, "Vector memory + knowledge vault")}
          ${ctx.integrationCard("X / Twitter", integ.x, "Posting and monitoring API keys")}
          ${ctx.integrationCard("Serper", integ.serper, "Web search")}
          ${ctx.integrationCard("Tavily", integ.tavily, "Research search")}
          ${ctx.integrationCard("GitHub", integ.github || integ.github_oauth, integ.github ? "Connected — link repos in Worlds" : (integ.github_oauth ? "OAuth ready — connect in Worlds" : "Set GITHUB_CLIENT_ID in .env"))}
          ${ctx.integrationCard("WhatsApp", integ.whatsapp && wa.connected, "Allowlisted CRM contacts only; every send needs approval")}
        </div>
      </section>
      ${c.whatsapp_enabled ? `<section class="driver-card span-12 human-panel" id="whatsapp-settings-panel">
        <p class="section-eyebrow">WhatsApp</p>
        <h3 class="title-sm">Linked device</h3>
        <p class="body-md muted">Personal WhatsApp via Baileys (unofficial). Only contacts you allow in CRM are stored or messaged. Outbound always requires your approval.</p>
        <dl class="settings-kv" style="margin-top:var(--space-sm)">
          <div class="settings-kv__row"><dt>Status</dt><dd>${waStatus}</dd></div>
          <div class="settings-kv__row"><dt>Allowlisted</dt><dd>${wa.allowlist_count ?? wa.allowlist_size ?? "—"} contacts</dd></div>
        </dl>
        ${waQr}
        <p class="caption muted" style="margin-top:var(--space-xs)">Open WhatsApp → Linked devices → Link a device. QR refreshes every few seconds while pending.</p>
      </section>` : ""}
    </div>`;
  }

  function stopWhatsappPoll() {
    if (ctx.whatsappPollTimer) { clearInterval(ctx.whatsappPollTimer); ctx.whatsappPollTimer = null; }
  }

  async function pollWhatsappSettings() {
    if (ctx.currentView !== "settings") { ctx.stopWhatsappPoll(); return; }
    try {
      const status = await ctx.api("/whatsapp/status");
      ctx.state._whatsapp = { ...(ctx.state._whatsapp || {}), ...status };
      if (status.qr_pending) {
        const qr = await ctx.api("/whatsapp/qr").catch(() => ({}));
        ctx.state._whatsapp.qr_data_url = qr.qr_data_url || null;
      } else {
        ctx.state._whatsapp.qr_data_url = null;
      }
      if (ctx.currentView === "settings") ctx.render({ graphs: false });
    } catch (_) { /* bridge may be offline */ }
  }

  function startWhatsappPollIfNeeded() {
    ctx.stopWhatsappPoll();
    const c = ctx.state.config || {};
    if (ctx.currentView !== "settings" || !c.whatsapp_enabled) return;
    void ctx.pollWhatsappSettings();
    ctx.whatsappPollTimer = setInterval(pollWhatsappSettings, 5000);
  }

  async function refreshInfraHealth() {
    const btn = document.getElementById("btn-infra-refresh");
    if (btn) btn.disabled = true;
    try {
      ctx.state._infraHealth = await ctx.api("/infrastructure/health");
      ctx.render();
      ctx.afterRender();
    } catch (e) {
      console.error("Infrastructure health check failed:", e);
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  async function saveAgentConfig(form) {
    const fd = new FormData(form);
    try {
      const res = await ctx.api("/agent/config", {
        method: "POST",
        body: JSON.stringify({
          autonomy_level: (fd.get("autonomy_level") || "balanced").toString(),
          auto_approve: fd.get("auto_approve") === "1",
        }),
      });
      ctx.state.config = { ...(ctx.state.config || {}), ...res };
      ctx.updateStatus();
      ctx.render();
    } catch (e) { alert(e.message); }
  }

  ctx.renderInfrastructureHealth = renderInfrastructureHealth;
  ctx.renderSettings = renderSettings;
  ctx.stopWhatsappPoll = stopWhatsappPoll;
  ctx.pollWhatsappSettings = pollWhatsappSettings;
  ctx.startWhatsappPollIfNeeded = startWhatsappPollIfNeeded;
  ctx.refreshInfraHealth = refreshInfraHealth;
  ctx.saveAgentConfig = saveAgentConfig;
}
