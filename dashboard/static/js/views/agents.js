/** @module views/agents — auto-split from app.js */
export function registerViewsAgents(ctx) {
  function supervisorMeta(agents) {
    const sup = agents?.supervisor || {};
    return {
      id: "supervisor",
      label: "Supervisor",
      role: "aggregator",
      tool_count: agents?.total_tools,
      brief: sup.role || "Orchestrates specialists — picks who to run when routing is Auto",
    };
  }

  function listSpecialists(agents) {
    const specs = agents?.specialists || [];
    const list = specs.length ? specs : ctx.DEFAULT_SPECIALISTS;
    return list.map(s => ({ ...s, label: s.label || s.id }));
  }

  function populateSpecialistSelect() {
    const specs = ctx.listSpecialists(ctx.state._agents || {});
    let current = ctx.state.selectedSpecialist ?? "";
    if (current && !specs.some(s => s.id === current)) current = "";
    ctx.state.selectedSpecialist = current;
  
    const specOpts = specs.map(s =>
      `<option value="${ctx.esc(s.id)}">${ctx.esc(s.label)}</option>`
    ).join("");
    const html = `<option value="">Auto — supervisor decides</option>${specOpts}`;
  
    const el = ctx.$("#specialist-select-agents");
    if (el) {
      el.innerHTML = html;
      el.value = current;
    }
    const chatEl = ctx.$("#chat-specialist-select");
    if (chatEl) {
      chatEl.innerHTML = html;
      chatEl.value = current;
    }
  }

  function routingLabel(agents) {
    const specId = ctx.currentSpecialistId();
    if (!specId) return "Supervisor · auto-route";
    const spec = ctx.listSpecialists(agents || ctx.state._agents || {}).find(s => s.id === specId);
    return `Supervisor → ${spec?.label || specId}`;
  }

  function routingMeta(agents) {
    const pool = ctx.state._agents || agents || {};
    const specId = ctx.currentSpecialistId();
    if (specId) {
      return ctx.listSpecialists(pool).find(s => s.id === specId)
        || { id: specId, label: specId, role: "specialist" };
    }
    return ctx.supervisorMeta(pool);
  }

  function agentBusy(live, agentId) {
    const jobs = live?.jobs || [];
    const id = String(agentId || "");
    if (jobs.some(j => (j.status === "running") && (j.specialist === id || (id === "supervisor" && j.mode === "chat")))) {
      return true;
    }
    const actor = live?.active ? String(live.actor || "") : "";
    if (id === "supervisor") return actor === "user";
    return actor === `subagent:${id}` || (id && actor.includes(id));
  }

  function agentRoleBadge(role) {
    const m = ctx.AGENT_ROLES[role] || { label: role || "Specialist", cls: "" };
    return `<span class="agent-role-badge ${m.cls}">${ctx.esc(m.label)}</span>`;
  }

  function agentAvatar(agentId, role) {
    const m = ctx.AGENT_ROLES[role] || ctx.AGENT_ROLES.aggregator;
    const initials = ctx.AGENT_INITIALS[agentId] || (agentId || "??").slice(0, 2).toUpperCase();
    return `<span class="agent-avatar ${m.avatar || "agent-avatar--aggregator"}" aria-hidden="true">${ctx.esc(initials)}</span>`;
  }

  function lastRunForAgent(agentId, runs) {
    const hit = (runs || []).find(r => r.agent === agentId);
    if (!hit?.ts) return "";
    const d = new Date(typeof hit.ts === "number" && hit.ts < 1e12 ? hit.ts * 1000 : hit.ts);
    return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  function collectAgentRuns() {
    const fromApi = ctx.state._agentRunsApi || [];
    const local = ctx.readJsonStorage("fos_agent_runs", []);
    const merged = [...local];
    for (const r of fromApi) {
      if (!merged.some(m => m.id === r.id)) merged.push({ ...r, source: "trace" });
    }
    merged.sort((a, b) => (b.ts || 0) - (a.ts || 0));
    return merged.slice(0, 50);
  }

  function persistAgentRun(record) {
    const rows = ctx.readJsonStorage("fos_agent_runs", []);
    rows.unshift(record);
    localStorage.setItem("fos_agent_runs", JSON.stringify(rows.slice(0, 50)));
  }

  function renderFleetAutoCard(live) {
    const isSel = !ctx.currentSpecialistId();
    return `<button type="button" class="fleet-card fleet-card--auto${isSel ? " is-selected" : ""}" data-select-specialist="" aria-pressed="${isSel}">
      ${isSel ? `<span class="fleet-card__active-label">Routing</span>` : ""}
      <div class="fleet-card__top">
        <span class="agent-avatar agent-avatar--aggregator" aria-hidden="true">AU</span>
        <span class="fleet-card__status" title="Supervisor routes"></span>
      </div>
      <div class="fleet-card__name">Auto</div>
      <span class="agent-role-badge agent-role--aggregator">Supervisor picks</span>
      <div class="fleet-card__meta"><span>Default routing</span></div>
    </button>`;
  }

  function renderSupervisorBanner(agents, live) {
    const sup = ctx.supervisorMeta(agents);
    const busy = ctx.agentBusy(live, "supervisor");
    return `<div class="supervisor-banner driver-card">
      <div class="agent-card-title-row">
        ${ctx.agentAvatar("supervisor", sup.role)}
        <div>
          <h2 class="title-md">${ctx.esc(sup.label)} <span class="supervisor-main-tag">Main agent</span></h2>
          <p class="world-meta">${ctx.esc((sup.brief || "").slice(0, 140))}</p>
        </div>
      </div>
      <span class="agent-status ${busy ? "busy" : "ready"}">${busy ? "Working" : "Always on"}</span>
    </div>`;
  }

  function renderFleetCard(a, live, sel, runs) {
    const isBusy = ctx.agentBusy(live, a.id);
    const isSel = sel === a.id;
    const last = ctx.lastRunForAgent(a.id, runs);
    return `<button type="button" class="fleet-card${isBusy ? " is-busy" : ""}${isSel ? " is-selected" : ""}" data-select-specialist="${ctx.esc(a.id)}" aria-pressed="${isSel}">
      ${isSel ? `<span class="fleet-card__active-label">Direct</span>` : ""}
      <div class="fleet-card__top">
        ${ctx.agentAvatar(a.id, a.role)}
        <span class="fleet-card__status ${isBusy ? "is-busy" : ""}" title="${isBusy ? "Working" : "Idle"}"></span>
      </div>
      <div class="fleet-card__name">${ctx.esc(a.label)}</div>
      ${a.role ? ctx.agentRoleBadge(a.role) : ""}
      <p class="fleet-card__brief">${ctx.esc((a.brief || "").slice(0, 72))}</p>
      <div class="fleet-card__meta">
        <span>${a.tool_count ?? "—"} tools</span>
        ${last ? `<span>${ctx.esc(last)}</span>` : ""}
      </div>
    </button>`;
  }

  function renderAgentCards(agents, live, selectable = false) {
    const specs = ctx.listSpecialists(agents);
    const sel = ctx.currentSpecialistId();
    const runs = ctx.collectAgentRuns();
    if (!selectable) {
      return `<div class="agent-grid">${specs.map(a => {
        const card = { ...a, label: a.label || a.id };
        const busy = ctx.agentBusy(live, a.id);
        return `<article class="agent-card${busy ? " is-busy" : ""}">
          <div class="agent-card-head">${ctx.renderFleetCardInner(card, live, runs)}</div>
        </article>`;
      }).join("")}</div>`;
    }
    return `<div class="fleet-rail">${ctx.renderFleetAutoCard(live)}${specs.map(a =>
      ctx.renderFleetCard(a, live, sel, runs)
    ).join("")}</div>`;
  }

  function renderFleetCardInner(a, live, runs) {
    const isBusy = ctx.agentBusy(live, a.id);
    const last = ctx.lastRunForAgent(a.id, runs);
    return `
      <div class="agent-card-title-row">
        ${ctx.agentAvatar(a.id, a.role)}
        <div><h3>${ctx.esc(a.label)}</h3>${a.role ? ctx.agentRoleBadge(a.role) : ""}</div>
      </div>
      <span class="agent-status ${isBusy ? "busy" : "ready"}">${isBusy ? "Working" : "Ready"}</span>
      <p class="agent-meta">${a.tool_count ?? 0} tools${last ? ` · ${ctx.esc(last)}` : ""}</p>`;
  }

  function renderAgentRunsTable(runs) {
    if (!runs.length) {
      return `<div class="empty-ctx.state"><p class="title-sm">No specialist runs yet</p></div>`;
    }
    return `<div class="table-wrap"><table class="data-table">
      <thead><tr><th>Time</th><th>Agent</th><th>Task</th><th>Duration</th><th>Tools</th><th></th></tr></thead>
      <tbody>${runs.map(r => {
        const ts = r.ts ? ctx.fmtTime(r.ts) : "—";
        const tools = (r.tools || []).slice(0, 4).join(", ");
        const expanded = ctx.state.expandedRunId === r.id;
        return `<tr class="data-row${expanded ? " is-expanded" : ""}" data-run-id="${ctx.esc(r.id)}">
          <td class="mono muted">${ctx.esc(ts)}</td>
          <td><span class="fleet-inline-badge">${ctx.esc((r.agent || "").toUpperCase())}</span></td>
          <td class="task-cell">${ctx.esc((r.task || "").slice(0, 120))}</td>
          <td class="mono">${r.duration_s ? `${r.duration_s}s` : "—"}</td>
          <td class="muted">${ctx.esc(tools || "—")}</td>
          <td><button type="button" class="button-tertiary-text button-sm" data-toggle-run="${ctx.esc(r.id)}">${expanded ? "Hide" : "View"}</button></td>
        </tr>
        ${expanded ? `<tr class="data-row-detail"><td colspan="6"><pre class="run-result mono">${ctx.esc(r.result || "No output recorded")}</pre></td></tr>` : ""}`;
      }).join("")}</tbody>
    </table></div>`;
  }

  function renderAgentsToolsPanel() {
    const t = ctx.state._tools || {};
    const byCat = t.by_category || {};
    const cats = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
    return `<div class="console-split">
      <div class="driver-card">${cats.map(([cat, n]) =>
        `<div class="kv-row"><span class="k">${ctx.esc(cat)}</span><span class="v">${n}</span></div>`
      ).join("") || "<p class='muted'>No tools loaded</p>"}</div>
      <div class="driver-card tool-list-compact">${(t.tools || []).slice(0, 24).map(x =>
        `<div class="tool-chip">${ctx.esc(x.name)}${x.requires_approval ? '<span class="badge-pill">approval</span>' : ""}</div>`
      ).join("")}</div>
    </div>`;
  }

  function renderAgentsCrmPanel() {
    const crm = ctx.state._crm || {};
    const pipeline = crm.pipeline || {};
    const contacts = crm.contacts || [];
    const followups = crm.followups_due || [];
    const pipeRows = Object.entries(pipeline).map(([k, v]) =>
      `<div class="kv-row"><span class="k">${ctx.esc(k)}</span><span class="v">${v}</span></div>`
    ).join("");
    const fu = followups.slice(0, 8).map(c =>
      `<li>${ctx.esc(c.name)} <span class="muted">${ctx.esc(c.company || "")}</span></li>`
    ).join("") || "<li class='muted'>None due</li>";
    const recent = contacts.slice(0, 10).map(c =>
      `<tr><td>${ctx.esc(c.name)}</td><td>${ctx.esc(c.company || "—")}</td><td>${ctx.esc(c.status || "—")}</td></tr>`
    ).join("");
    return `<div class="console-split">
      <section class="driver-card"><p class="caption-uppercase">Pipeline</p>${pipeRows || "<p class='muted'>Empty</p>"}
        <p class="caption-uppercase" style="margin-top:var(--space-sm)">Follow-ups due</p><ul class="list-plain">${fu}</ul></section>
      <section class="driver-card"><p class="caption-uppercase">Contacts (${contacts.length})</p>
        <div class="table-wrap"><table class="data-table"><thead><tr><th>Name</th><th>Company</th><th>Status</th></tr></thead>
        <tbody>${recent || "<tr><td colspan='3' class='muted'>No contacts</td></tr>"}</tbody></table></div>
        <button type="button" class="button-outline-on-dark button-sm" data-goto="crm" style="margin-top:var(--space-xs)">Open CRM</button>
      </section>
    </div>`;
  }

  function renderAgentsVaultPanel() {
    const wid = ctx.currentWorldId();
    const vault = ctx.vaultReadyFor(wid) ? (ctx.vaultPayload() || {}) : {};
    const facets = vault.folders || vault.facets || [];
    const q = ctx.state._agentsVaultQ || "";
    const loading = wid !== "root" && !ctx.vaultReadyFor(wid);
    return `<div class="console-split">
      <section class="driver-card">
        <p class="caption-uppercase">Vault · ${ctx.esc(ctx.activeWorldLabel())}</p>
        ${loading ? "<p class='body-md muted' style='margin-top:var(--space-xs)'>Loading vault registry…</p>" : `<div class="vault-facet-grid" style="margin-top:var(--space-xs)">${facets.map(f =>
          `<div class="vault-facet-card"><div class="vault-facet-head"><h4>${ctx.esc(f.domain_label || f.label || f.folder || "")}</h4><span class="badge-pill">${f.file_count ?? 0} files</span></div></div>`
        ).join("") || "<p class='muted'>Select a sub-world or link a repo in Worlds</p>"}</div>`}
        <button type="button" class="button-outline-on-dark button-sm" data-goto="world" style="margin-top:var(--space-sm)">Manage vault</button>
      </section>
      <section class="driver-card">
        <div class="search-row">
          <input type="search" class="text-input-on-dark" id="agents-vault-q" placeholder="Search vault…" value="${ctx.esc(q)}">
          <button type="button" class="button-primary button-sm" id="agents-vault-search">Search</button>
        </div>
        <pre class="run-result mono" id="agents-vault-results" hidden></pre>
      </section>
    </div>`;
  }

  function renderAgentsTabPanel() {
    const tab = ctx.state.agentsTab || "runs";
    const runs = ctx.collectAgentRuns();
    if (tab === "runs") return ctx.renderAgentRunsTable(runs);
    if (tab === "live") {
      const live = ctx.state.live || {};
      return ctx.renderLivePanel(live, "agents-tab-live");
    }
    if (tab === "tools") return ctx.renderAgentsToolsPanel();
    if (tab === "crm") return ctx.renderAgentsCrmPanel();
    if (tab === "vault") return ctx.renderAgentsVaultPanel();
    return "";
  }

  function renderAgents() {
    const agents = ctx.state._agents || {};
    const live = ctx.state.live || agents.live || {};
    const meta = ctx.routingMeta(agents);
    const routeLabel = ctx.routingLabel(agents);
    const direct = ctx.isDirectSpecialist();
    const draft = ctx.state._delegateDraft || "";
    const runs = ctx.collectAgentRuns();
    const pending = (ctx.state.approvals || []).length;
    const busyCount = (agents.specialists || []).filter(s => ctx.agentBusy(live, s.id)).length;
    const skills = agents.skills || [];
    const tab = ctx.state.agentsTab || "runs";
    const hasResult = !!(ctx.state._delegateResult || "").trim();
    const actions = ctx.state._agentActions || [];
  
    return `<div class="agents-console">
      <header class="console-toolbar driver-card">
        <div class="console-kpis">
          <div class="console-kpi"><span class="console-kpi__val">${agents.specialists?.length || 5}</span><span class="console-kpi__lbl">Specialists</span></div>
          <div class="console-kpi"><span class="console-kpi__val">${busyCount || "0"}</span><span class="console-kpi__lbl">Active</span></div>
          <div class="console-kpi"><span class="console-kpi__val">${runs.length}</span><span class="console-kpi__lbl">Runs</span></div>
          <div class="console-kpi"><span class="console-kpi__val">${agents.total_tools || 0}</span><span class="console-kpi__lbl">Tools</span></div>
          <div class="console-kpi"><span class="console-kpi__val">${pending}</span><span class="console-kpi__lbl">Approvals</span></div>
        </div>
        <div class="console-toolbar__actions">
          <span class="badge-pill" data-active-world-label>${ctx.esc(ctx.activeWorldLabel())}</span>
          ${skills.map(s => `<span class="skill-chip${s.installed ? "" : " is-missing"}">${ctx.esc(s.name)}</span>`).join("")}
          <button type="button" class="button-outline-on-dark button-sm" data-goto="chat">Chat</button>
          <button type="button" class="button-outline-on-dark button-sm" data-goto="approvals"${pending ? "" : " disabled"}>Approvals${pending ? ` (${pending})` : ""}</button>
        </div>
      </header>
  
      ${ctx.renderSupervisorBanner(agents, live)}
  
      <section class="agent-picker-bar driver-card">
        <div class="agent-picker-bar__head">
          <div>
            <p class="caption-uppercase">Specialist routing</p>
            <p class="world-meta">Supervisor is always on — pick <strong>Auto</strong> or a specialist for direct tasks</p>
          </div>
          <label class="world-select-wrap agent-picker-bar__select">
            <span class="caption-uppercase">Dropdown</span>
            <select id="specialist-select-agents" class="world-select agent-select" aria-label="Specialist override"></select>
          </label>
          <span class="badge-pill agent-routing-badge">${ctx.esc(routeLabel)}</span>
        </div>
        <div class="agent-picker-bar__cards">${ctx.renderAgentCards(agents, live, true)}</div>
      </section>
  
      <div class="agents-workspace">
        <section class="task-composer driver-card">
          <div class="task-composer__head">
            <div class="agent-card-title-row">
              ${ctx.agentAvatar(direct ? meta.id : "supervisor", direct ? meta.role : "aggregator")}
              <div>
                <h2 class="title-md">${direct ? ctx.esc(meta.label) : "Supervisor"}</h2>
                <p class="world-meta">${direct ? ctx.esc((meta.brief || "").slice(0, 100)) : "Auto-route — supervisor will delegate to the best specialist"}</p>
              </div>
            </div>
            <span class="agent-status ${ctx.agentBusy(live, direct ? meta.id : "supervisor") ? "busy" : "ready"}">${ctx.esc(routeLabel)}</span>
          </div>
          <textarea class="text-input-on-dark task-composer__input" id="delegate-selected" rows="3" placeholder="${direct ? `Task for ${ctx.esc(meta.label)}…` : "Message supervisor…"}">${ctx.esc(draft)}</textarea>
          <div class="task-composer__foot">
            <button type="button" class="button-primary" id="delegate-selected-btn">${direct ? `Run ${ctx.esc(meta.label)}` : "Send to supervisor"}</button>
            <span class="world-meta mono" data-active-world-label>${ctx.esc(ctx.activeWorldLabel())}</span>
          </div>
          ${hasResult ? `<div class="delegate-result-wrap msg-read-more-host driver-card" data-msg-scope="agents-delegate" data-msg-index="0">
            <div class="msg-md delegate-result-body">${window.FOSMarkdown?.render?.(ctx.state._delegateResult || "") || ctx.esc(ctx.state._delegateResult || "")}</div>
            <button type="button" class="msg-read-more" hidden>Read more</button>
          </div>` : ""}
          <section class="driver-card chat-runtime-panel agents-runtime-panel">
            <p class="caption-uppercase">Runtime</p>
            <div id="graph-runtime-agents" class="graph-canvas graph-canvas--compact chat-runtime-panel__graph"></div>
          </section>
        </section>
  
        <aside class="agents-rail driver-card">
          ${ctx.renderLivePanel(live, "agents-live-panel")}
          <p class="caption-uppercase" style="margin-top:var(--space-sm)">Recent actions</p>
          <div class="action-feed">${actions.slice(0, 8).map(a =>
            `<div class="action-feed__item"><span class="mono">${ctx.esc(a.tool_name)}</span><span class="muted">${ctx.esc((a.created_at || "").slice(11, 16))}</span></div>`
          ).join("") || "<p class='muted'>No actions yet</p>"}</div>
        </aside>
      </div>
  
      <section class="driver-card agents-panel">
        <div class="workspace-tabs">
          <button type="button" class="workspace-tab${tab === "runs" ? " is-active" : ""}" data-agents-tab="runs">Run history</button>
          <button type="button" class="workspace-tab${tab === "live" ? " is-active" : ""}" data-agents-tab="live">Live runtime</button>
          <button type="button" class="workspace-tab${tab === "tools" ? " is-active" : ""}" data-agents-tab="tools">Tools</button>
          <button type="button" class="workspace-tab${tab === "crm" ? " is-active" : ""}" data-agents-tab="crm">CRM</button>
          <button type="button" class="workspace-tab${tab === "vault" ? " is-active" : ""}" data-agents-tab="vault">Vault</button>
        </div>
        <div class="agents-tab-body">${ctx.renderAgentsTabPanel()}</div>
      </section>
    </div>`;
  }

  function patchAgentsVaultPanel() {
    if (ctx.currentView !== "agents" || ctx.state.agentsTab !== "vault") return;
    const panel = document.querySelector(".agents-console .console-split");
    if (!panel) return;
    panel.outerHTML = ctx.renderAgentsVaultPanel();
  }

  function selectSpecialist(id) {
    const value = id || "";
    ctx.state.selectedSpecialist = value;
    localStorage.setItem("fos_selected_specialist", value);
    ctx.populateSpecialistSelect();
    ctx.render();
  }

  async function agentsVaultSearch() {
    const q = ctx.$("#agents-vault-q")?.value?.trim();
    ctx.state._agentsVaultQ = q;
    const out = ctx.$("#agents-vault-results");
    const wid = ctx.currentWorldId();
    if (!q || !wid || wid === "root") return;
    try {
      const res = await ctx.api(`/vault/search?${new URLSearchParams({ q, world_id: wid })}`);
      const text = (res.hits || []).map(h =>
        `[${h.metadata?.domain || "?"}] ${h.metadata?.source || ""}\n${(h.text || "").slice(0, 240)}`
      ).join("\n\n---\n\n") || "No hits.";
      if (out) { out.textContent = text; out.hidden = false; }
    } catch (e) {
      if (out) { out.textContent = e.message; out.hidden = false; }
    }
  }

  async function delegateAgent() {
    const specId = ctx.currentSpecialistId();
    const ta = ctx.$("#delegate-selected");
    const task = (ta?.value || "").trim();
    if (!task) return;
    const btn = ctx.$("#delegate-selected-btn");
    const meta = ctx.routingMeta(ctx.state._agents || {});
    const direct = !!specId;
    const started = Date.now();
    if (btn) { btn.disabled = true; btn.textContent = "Running…"; }
    ctx.startLivePoll();
    ctx.state.agentsTab = "live";
    localStorage.setItem("fos_agents_tab", "live");
    ctx.state._delegateResult = "Agent working…";
    ctx.render();
    try {
      const res = await ctx.api("/chat/async", {
        method: "POST",
        body: JSON.stringify(ctx.chatPayload({ message: task, specialist: direct ? specId : undefined })),
        timeoutMs: 20000,
      });
      const done = await ctx.pollAgentJob(res.job.id);
      const job = done?.job;
      const result = job?.result || job?.error || "(no response)";
      ctx.state._delegateResult = result;
      ctx.state._delegateDraft = "";
      if (ta) ta.value = "";
      if (job?.session_id) ctx.setChatSessionId(job.session_id);
      ctx.persistAgentRun({
        id: job?.run_id || `local-${started}`,
        agent: direct ? specId : "supervisor",
        task,
        result,
        duration_s: job?.elapsed_s || Math.round((Date.now() - started) / 1000),
        ts: Math.floor(started / 1000),
        tools: (job?.events || []).filter(e => e.name).map(e => e.name),
        source: "delegate",
        artifacts: job?.artifacts,
      });
      ctx.state.agentsTab = "runs";
      localStorage.setItem("fos_agents_tab", "runs");
      ctx.state.expandedRunId = job?.run_id || `local-${started}`;
      if (done?.pending_approvals) {
        ctx.state.approvals = done.pending_approvals;
        ctx.updateBadges();
      }
    } catch (e) {
      ctx.state._delegateResult = "Error: " + e.message;
    }
    if (btn) {
      btn.disabled = false;
      btn.textContent = direct ? `Run ${meta.label}` : "Send to supervisor";
    }
    try {
      const runs = await ctx.api("/agents/runs");
      ctx.state._agentRunsApi = runs.runs || [];
      ctx.state._agentActions = runs.actions || [];
    } catch (_) {}
    ctx.state._activeJob = null;
    ctx.pollLive();
    ctx.render();
    ctx.drawGraphs();
  }

  ctx.supervisorMeta = supervisorMeta;
  ctx.listSpecialists = listSpecialists;
  ctx.populateSpecialistSelect = populateSpecialistSelect;
  ctx.routingLabel = routingLabel;
  ctx.routingMeta = routingMeta;
  ctx.agentBusy = agentBusy;
  ctx.agentRoleBadge = agentRoleBadge;
  ctx.agentAvatar = agentAvatar;
  ctx.lastRunForAgent = lastRunForAgent;
  ctx.collectAgentRuns = collectAgentRuns;
  ctx.persistAgentRun = persistAgentRun;
  ctx.renderFleetAutoCard = renderFleetAutoCard;
  ctx.renderSupervisorBanner = renderSupervisorBanner;
  ctx.renderFleetCard = renderFleetCard;
  ctx.renderAgentCards = renderAgentCards;
  ctx.renderFleetCardInner = renderFleetCardInner;
  ctx.renderAgentRunsTable = renderAgentRunsTable;
  ctx.renderAgentsToolsPanel = renderAgentsToolsPanel;
  ctx.renderAgentsCrmPanel = renderAgentsCrmPanel;
  ctx.renderAgentsVaultPanel = renderAgentsVaultPanel;
  ctx.renderAgentsTabPanel = renderAgentsTabPanel;
  ctx.renderAgents = renderAgents;
  ctx.patchAgentsVaultPanel = patchAgentsVaultPanel;
  ctx.selectSpecialist = selectSpecialist;
  ctx.agentsVaultSearch = agentsVaultSearch;
  ctx.delegateAgent = delegateAgent;
}
