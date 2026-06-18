/** @module shell/misc — auto-split from app.js */
export function registerShellMisc(ctx) {
  function buildGithubPathTree(docs) {
    const root = { name: "", dirs: {}, files: [] };
    for (const doc of docs) {
      const path = doc.github_path || doc.filename || doc.title || "file";
      const parts = path.split("/").filter(Boolean);
      const fileName = parts.pop() || path;
      let node = root;
      for (const part of parts) {
        if (!node.dirs[part]) node.dirs[part] = { name: part, dirs: {}, files: [] };
        node = node.dirs[part];
      }
      node.files.push({ ...doc, _fileName: fileName });
    }
    return root;
  }

  function livePollDelayMs() {
    return document.hidden ? ctx.LIVE_POLL_HIDDEN_MS : ctx.LIVE_POLL_MS;
  }

  function scheduleLivePoll() {
    if (ctx.livePollTimer) clearTimeout(ctx.livePollTimer);
    ctx.livePollTimer = setTimeout(async () => {
      await ctx.pollLive();
      ctx.scheduleLivePoll();
    }, ctx.livePollDelayMs());
  }

  function worldKindMeta(kind) {
    return ctx.WORLD_KINDS[kind] || ctx.WORLD_KINDS.project;
  }

  function worldKindBadge(kind) {
    const m = ctx.worldKindMeta(kind || "project");
    return `<span class="world-kind-badge ${m.cls}">${ctx.esc(m.label)}</span>`;
  }

  function worldTreeData() {
    return ctx.state._worldFull?.worlds || ctx.state.worlds || {};
  }

  function afterVaultMutation(worldId) {
    if (ctx.currentView === "world" && ctx.inspectorWorldId() === worldId) ctx.patchWorldPanels();
    else if (ctx.currentView === "agents" && ctx.currentWorldId() === worldId) ctx.patchAgentsVaultPanel();
    else ctx.render({ graphs: false });
  }

  function vaultStorageLabel() {
    const b = ctx.state._worldVault?.storage_backend || ctx.state._worldVault?.vault?.storage_backend;
    return b === "s3" ? "S3" : "local object storage";
  }

  function formatBytes(n) {
    const b = Number(n) || 0;
    if (b < 1024) return `${b} B`;
    if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / 1048576).toFixed(1)} MB`;
  }

  function draftApproveDisabledReason(d) {
    if (d.channel === "email") {
      if (!(d.subject || "").trim()) return "Subject required";
      if (!(d.body || "").trim()) return "Body required";
      if (!(d.email || "").trim()) return "Contact has no email";
    }
    if (d.channel === "whatsapp") {
      if (!(d.body || "").trim()) return "Message required";
      if ((d.body || "").length > 300) return "Max 300 characters";
      if (!d.whatsapp_enabled) return "WhatsApp not allowlisted";
      if (!(d.phone || "").trim()) return "No phone on contact";
    }
    return "";
  }

  function fmtHistoryTime(ts) {
    if (!ts) return "";
    const d = typeof ts === "number" ? new Date(ts * 1000) : new Date(ts);
    if (Number.isNaN(d.getTime())) return String(ts).slice(0, 16);
    return d.toLocaleString();
  }

  function infraKvRow(label, value, mono = false) {
    const val = value == null || value === "" ? "—" : String(value);
    return `<div class="infra-kv"><dt>${ctx.esc(label)}</dt><dd${mono ? ' class="infra-kv__val"' : ""}>${ctx.esc(val)}</dd></div>`;
  }

  function infraHealthCard(title, ok, rows, detail) {
    const status = ok ? "Healthy" : "Issue";
    return `<div class="integration-card infra-health-card${ok ? " is-connected" : " is-warning"}">
      <div class="integration-card__head">
        <span class="title-sm">${ctx.esc(title)}</span>
        <span class="integration-card__status">${status}</span>
      </div>
      <dl class="infra-kv-list">${rows}</dl>
      ${detail ? `<p class="integration-card__detail">${ctx.esc(detail)}</p>` : ""}
    </div>`;
  }

  function integrationCard(name, connected, detail) {
    return `<div class="integration-card${connected ? " is-connected" : ""}">
      <div class="integration-card__head">
        <span class="title-sm">${ctx.esc(name)}</span>
        <span class="integration-card__status">${connected ? "Active" : "Not configured"}</span>
      </div>
      <p class="integration-card__detail">${ctx.esc(detail)}</p>
    </div>`;
  }

  function toggleCrmOutreachCompany(el) {
    const id = parseInt(el.dataset.crmCompanyToggle, 10);
    if (!id) return;
    if (!ctx.state.ui) ctx.state.ui = {};
    const batch = ctx.state.ui.crmOutreachBatch || 5;
    const sel = new Set(ctx.state.ui.crmOutreachSelected || []);
    if (el.checked) {
      if (sel.size >= batch) { el.checked = false; return; }
      sel.add(id);
    } else {
      sel.delete(id);
    }
    ctx.state.ui.crmOutreachSelected = [...sel];
    ctx.render();
  }

  function closeCrmCampaignReview() {
    if (ctx.state._crmOutreachPollId) clearTimeout(ctx.state._crmOutreachPollId);
    ctx.state._crmOutreachPollId = null;
    if (ctx.state.ui) {
      ctx.state.ui.crmCampaignId = null;
      ctx.state.ui.crmOutreachSelected = [];
    }
    ctx.state._crmCampaignReview = null;
    ctx.state._crmCampaignDetail = null;
    ctx.state._crmOutreachJob = null;
    ctx.loadCrmData().then(() => ctx.render());
  }

  async function uploadFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    ctx.chatHistory.push({ role: "user", text: `📎 Uploaded: ${file.name}` });
    ctx.render();
    try {
      fd.append("world_id", ctx.currentWorldId());
      const r = await fetch("/api/upload", { method: "POST", body: fd, credentials: "same-origin" });
      const res = await r.json().catch(() => ({}));
      if (r.status === 401 && res.pin_required) {
        ctx.showPinGate();
        throw new Error("Enter your PIN to continue");
      }
      if (!r.ok) throw new Error(res.error || r.statusText);
      ctx.chatHistory.push({ role: "agent", text: res.reply });
    } catch (err) {
      ctx.chatHistory.push({ role: "system", text: "Upload failed: " + err.message });
    }
    localStorage.setItem("fos_chat", JSON.stringify(ctx.chatHistory));
    e.target.value = "";
    ctx.render();
  }

  function initSidebarCollapse() {
    const app = document.querySelector(".app");
    const btn = ctx.$("#btn-sidebar-collapse");
    const key = "fos_sidebar_collapsed";
    if (localStorage.getItem(key) === "1") app?.classList.add("sidebar-collapsed");
    const syncLabel = () => {
      const collapsed = app?.classList.contains("sidebar-collapsed");
      btn?.setAttribute("aria-label", collapsed ? "Expand sidebar" : "Collapse sidebar");
      btn?.setAttribute("title", collapsed ? "Expand sidebar" : "Collapse sidebar");
    };
    syncLabel();
    btn?.addEventListener("click", () => {
      app?.classList.toggle("sidebar-collapsed");
      localStorage.setItem(key, app?.classList.contains("sidebar-collapsed") ? "1" : "0");
      syncLabel();
    });
  }

  ctx.buildGithubPathTree = buildGithubPathTree;
  ctx.livePollDelayMs = livePollDelayMs;
  ctx.scheduleLivePoll = scheduleLivePoll;
  ctx.worldKindMeta = worldKindMeta;
  ctx.worldKindBadge = worldKindBadge;
  ctx.worldTreeData = worldTreeData;
  ctx.afterVaultMutation = afterVaultMutation;
  ctx.vaultStorageLabel = vaultStorageLabel;
  ctx.formatBytes = formatBytes;
  ctx.draftApproveDisabledReason = draftApproveDisabledReason;
  ctx.fmtHistoryTime = fmtHistoryTime;
  ctx.infraKvRow = infraKvRow;
  ctx.infraHealthCard = infraHealthCard;
  ctx.integrationCard = integrationCard;
  ctx.toggleCrmOutreachCompany = toggleCrmOutreachCompany;
  ctx.closeCrmCampaignReview = closeCrmCampaignReview;
  ctx.uploadFile = uploadFile;
  ctx.initSidebarCollapse = initSidebarCollapse;
}
