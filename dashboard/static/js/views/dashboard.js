/** @module views/dashboard — auto-split from app.js */
export function registerViewsDashboard(ctx) {
  function renderUpNext() {
    const nudges = ctx.state._nudges || [];
    if (!nudges.length) return "";
    const items = nudges.slice(0, 8).map((n, i) => `
      <li class="up-next-item${(n.priority || 9) <= 2 ? " is-urgent" : ""}">
        <div class="up-next-item__body">
          <p class="up-next-item__title">${ctx.esc(n.title)}</p>
          <p class="up-next-item__meta muted">${ctx.esc(n.body || "")}</p>
        </div>
        <button type="button" class="button-outline-on-dark button-sm" data-nudge-index="${i}">Open</button>
      </li>`).join("");
    return `<section class="driver-card span-12 up-next-panel">
      <p class="caption-uppercase">Up next</p>
      <p class="body-md muted">Reminders, follow-ups, approvals, and vault prompts for your active world.</p>
      <ul class="up-next-list">${items}</ul>
    </section>`;
  }

  function handleNudgeAction(index) {
    const n = ctx.state._nudges?.[Number(index)];
    if (!n) return;
    if (n.kind === "vault_leads" && n.meta?.doc_id) {
      ctx.tagVaultDocInChat(n.meta.doc_id, n.meta.world_id, n.title, "");
      return;
    }
    const action = n.action || "chat";
    if (action === "crm") return ctx.goView("crm");
    if (action === "goals") return ctx.goView("goals");
    if (action === "approvals") return ctx.goView("approvals");
    if (action === "documents") return ctx.goView("documents");
    if (action === "world") return ctx.goView("world");
    ctx.goView(action);
  }

  function chartPanelNote(canvasId, message, show) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const panel = canvas.closest(".chart-panel");
    if (!panel) return;
    let note = panel.querySelector(".chart-empty");
    if (!note) {
      note = document.createElement("p");
      note.className = "chart-empty muted body-md";
      panel.appendChild(note);
    }
    note.textContent = message;
    note.hidden = !show;
    canvas.hidden = show;
  }

  function drawDashboardCharts() {
    const narrow = window.innerWidth < 640;
    const tools = ctx.state._world?.tools_by_category || ctx.state.about?.tools_by_category || {};
    const entries = Object.entries(tools).slice(0, narrow ? 5 : 8);
    if (entries.length && ctx.$("#chart-tools")) {
      ctx.chartPanelNote("chart-tools", "", false);
      FOSCharts.bar("chart-tools", entries.map(([k]) => k), entries.map(([, v]) => v), { colors: ctx.CHART_COLORS });
    } else {
      ctx.chartPanelNote("chart-tools", "No tool data yet.", true);
    }
    const crm = ctx.state.snapshot?.crm?.by_status || {};
    const segs = Object.entries(crm).filter(([, v]) => v > 0).map(([k, v]) => ({ label: k, value: v }));
    if (segs.length && ctx.$("#chart-crm")) {
      ctx.chartPanelNote("chart-crm", "", false);
      FOSCharts.donut("chart-crm", segs, { centerLabel: "contacts", colors: ctx.CHART_COLORS });
    } else {
      ctx.chartPanelNote("chart-crm", "No CRM contacts yet — add leads in Chat or CRM.", true);
    }
    const hist = [...(ctx.state.usage_history || [])].reverse();
    const points = hist.map(h => h.llm_calls || h.calls || 0);
    if (points.length && ctx.$("#chart-usage")) {
      ctx.chartPanelNote("chart-usage", "", false);
      FOSCharts.spark("chart-usage", points);
    } else {
      ctx.chartPanelNote("chart-usage", "No LLM usage in the last 7 days.", true);
    }
  }

  function renderOperatorPanel() {
    const cfg = ctx.state.config || {};
    const pending = ctx.state.snapshot?.approvals_pending || 0;
    const paused = cfg.agent_paused;
    return `
      <section class="driver-card span-12 operator-panel" aria-label="Direct actions">
        <div class="operator-panel__head">
          <div>
            <p class="section-eyebrow">You drive</p>
            <h3 class="title-sm">Direct controls</h3>
            <p class="body-md muted">Manage worlds, CRM, goals, and agent policy yourself. Chat is optional — use it when you want help.</p>
          </div>
          <div class="operator-panel__status">
            <span class="pill ${paused ? "warn" : "ok"}">${paused ? "Agent paused" : "Agent on standby"}</span>
            <span class="pill info">${ctx.esc(cfg.autonomy_level || "balanced")} autonomy</span>
          </div>
        </div>
        <div class="operator-grid">
          <button type="button" class="operator-card" data-operator="create-world">
            <span class="operator-card__title">New world</span>
            <span class="operator-card__desc">Add a venture, project, or idea</span>
          </button>
          <button type="button" class="operator-card" data-operator="add-contact">
            <span class="operator-card__title">Add contact</span>
            <span class="operator-card__desc">CRM lead or relationship</span>
          </button>
          <button type="button" class="operator-card" data-operator="add-goal">
            <span class="operator-card__title">New goal</span>
            <span class="operator-card__desc">Track an outcome you own</span>
          </button>
          <button type="button" class="operator-card" data-operator="add-reminder">
            <span class="operator-card__title">Reminder</span>
            <span class="operator-card__desc">Schedule a follow-up</span>
          </button>
          <button type="button" class="operator-card" data-operator="settings">
            <span class="operator-card__title">Agent policy</span>
            <span class="operator-card__desc">Autonomy &amp; approvals</span>
          </button>
          <button type="button" class="operator-card${pending ? " operator-card--alert" : ""}" data-operator="approvals">
            <span class="operator-card__title">Approvals${pending ? ` (${pending})` : ""}</span>
            <span class="operator-card__desc">Review before agents act</span>
          </button>
        </div>
      </section>`;
  }

  function openOperatorAction(action) {
    if (!ctx.state.ui) ctx.state.ui = {};
    if (action === "create-world") {
      ctx.state.ui.worldCreateOpen = true;
      if (ctx.currentView === "world") {
        ctx.render();
        requestAnimationFrame(() => document.getElementById("world-create-panel")?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
      } else {
        ctx.goView("world");
        ctx.state._scrollWorldCreate = true;
      }
      return;
    }
    if (action === "add-contact") {
      ctx.state.ui.crmFormOpen = true;
      if (ctx.currentView === "crm") ctx.render();
      else ctx.goView("crm");
      return;
    }
    if (action === "add-goal") {
      ctx.state.ui.goalsFormOpen = true;
      if (ctx.currentView === "goals") ctx.render();
      else ctx.goView("goals");
      return;
    }
    if (action === "add-reminder") {
      ctx.state.ui.reminderFormOpen = true;
      if (ctx.currentView === "goals") ctx.render();
      else ctx.goView("goals");
      return;
    }
    if (action === "settings") ctx.goView("settings");
    if (action === "approvals") ctx.goView("approvals");
  }

  function renderDashboard() {
    const snap = ctx.state.snapshot || {};
    const crm = snap.crm || {};
    const fin = ctx.state.finance || {};
    const usage = ctx.state.usage || {};
    const about = ctx.state.about || {};
    const cfg = ctx.state.config || {};
    const pending = snap.approvals_pending || 0;
    const finPill = fin.set
      ? `<span class="pill ${fin.status === "healthy" ? "ok" : fin.status === "warning" ? "warn" : "info"}">${ctx.esc(fin.status)}</span>`
      : "";
    const runway = fin.set
      ? (fin.runway || (fin.runway_months != null ? fin.runway_months + " mo" : "—"))
      : null;
    const goals = (ctx.state.goals || []).slice(0, 5).map(g => `<li>${ctx.esc(g.title)}</li>`).join("")
      || "<li class='muted'>No active goals — add one in Goals or use Direct controls.</li>";
    const approvalCell = pending > 0
      ? `<div class="spec-cell race-position-cell"><dt>Approvals</dt><dd>${pending}</dd></div>`
      : `<div class="spec-cell"><dt>Approvals</dt><dd>0</dd></div>`;
    const live = ctx.state.live || {};
    const agents = ctx.state._agents || {};
  
    return `<div class="dashboard-grid">
        ${ctx.renderUpNext()}
        ${ctx.renderOperatorPanel()}
        <section class="driver-card span-8">
          ${ctx.renderLivePanel(live)}
        </section>
        <section class="driver-card span-4">
          <p class="caption-uppercase">World ctx.state</p>
          <p class="world-meta" style="margin-top:var(--space-xxs)">Updated ${ctx.esc(snap.ts || "now")}</p>
          <dl class="stat-grid" style="margin-top:var(--space-sm)">
            <div class="spec-cell"><dt>Tools</dt><dd>${about.total_tools || 0}</dd></div>
            <div class="spec-cell"><dt>Agents</dt><dd>${(agents.specialists?.length || 4) + 1}</dd></div>
            <div class="spec-cell"><dt>Contacts</dt><dd>${crm.total_contacts || 0}</dd></div>
            ${approvalCell}
          </dl>
          <div class="capability-strip" style="margin-top:var(--space-sm)">
            <button type="button" class="button-outline-on-dark button-sm" data-goto="chat">Ask agent</button>
            <button type="button" class="button-outline-on-dark button-sm" data-goto="world">Worlds</button>
            <button type="button" class="button-outline-on-dark button-sm" data-goto="documents">Documents</button>
            <button type="button" class="button-outline-on-dark button-sm" data-goto="crm">CRM</button>
            <button type="button" class="button-outline-on-dark button-sm" data-goto="goals">Goals</button>
          </div>
        </section>
        <section class="driver-card span-4 chart-panel">
          <p class="caption-uppercase">Tools by category</p>
          <canvas id="chart-tools" role="img" aria-label="Bar chart of tools by category"></canvas>
        </section>
        <section class="driver-card span-4 chart-panel">
          <p class="caption-uppercase">CRM pipeline</p>
          <div class="donut-wrap"><canvas id="chart-crm" role="img" aria-label="CRM contacts by status"></canvas></div>
        </section>
        <section class="driver-card span-4 chart-panel">
          <p class="caption-uppercase">LLM usage (7d)</p>
          <canvas id="chart-usage" role="img" aria-label="LLM calls sparkline"></canvas>
        </section>
        <section class="driver-card span-8">
          <p class="caption-uppercase">Recent activity</p>
          <div class="activity-timeline">${(ctx.state.actions || []).slice(0, 8).map(a =>
            `<div class="activity-timeline__row"><span class="mono">${ctx.esc(a.tool_name)}</span><span class="muted">${ctx.esc((a.created_at || "").slice(11, 19))}</span></div>`
          ).join("") || "<p class='muted'>No tool actions yet</p>"}</div>
        </section>
        <section class="driver-card span-4">
          <p class="caption-uppercase">Specialist status</p>
          <div class="specialist-chips">${ctx.listSpecialists(agents).map(s =>
            `<span class="specialist-chip${ctx.agentBusy(live, s.id) ? " is-busy" : ""}">${ctx.esc(s.label)}</span>`
          ).join("")}</div>
          <button type="button" class="button-outline-on-dark button-sm" data-goto="agents" style="margin-top:var(--space-sm)">Open agents</button>
        </section>
        <section class="driver-card span-6">
          <p class="caption-uppercase">Runway ${finPill}</p>
          ${runway ? `<dl class="stat-grid" style="margin-top:var(--space-sm)">
            <div class="spec-cell"><dt>Cash</dt><dd class="small">${ctx.fmtMoney(fin.cash)}</dd></div>
            <div class="spec-cell"><dt>Burn</dt><dd class="small">${ctx.fmtMoney(fin.monthly_burn)}</dd></div>
            <div class="spec-cell"><dt>MRR</dt><dd class="small">${ctx.fmtMoney(fin.mrr)}</dd></div>
            <div class="spec-cell"><dt>Runway</dt><dd class="small">${ctx.esc(runway)}</dd></div>
          </dl>` : `<p class="body-md" style="margin-top:var(--space-sm)">Set cash, burn, and MRR in Settings or ask the agent to track runway.</p>`}
        </section>
        <section class="driver-card span-6">
          <p class="caption-uppercase">Active goals</p>
          <ul class="list-plain" style="margin-top:var(--space-sm)">${goals}</ul>
          <dl class="stat-grid" style="margin-top:var(--space-sm)">
            <div class="spec-cell"><dt>Tasks open</dt><dd>${snap.tasks_open || 0}</dd></div>
            <div class="spec-cell"><dt>LLM today</dt><dd class="small">${usage.llm_calls || 0}</dd></div>
          </dl>
        </section>
      </div>`;
  }

  ctx.renderUpNext = renderUpNext;
  ctx.handleNudgeAction = handleNudgeAction;
  ctx.chartPanelNote = chartPanelNote;
  ctx.drawDashboardCharts = drawDashboardCharts;
  ctx.renderOperatorPanel = renderOperatorPanel;
  ctx.openOperatorAction = openOperatorAction;
  ctx.renderDashboard = renderDashboard;
}
