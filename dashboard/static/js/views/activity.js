/** @module views/activity — auto-split from app.js */
export function registerViewsActivity(ctx) {
  function renderActivity() {
    const full = ctx.state._activity?.traces_full || [];
    const actions = ctx.state._activity?.actions || ctx.state.actions || [];
    const tracesHtml = full.length ? full.map(t => `
      <article class="trace-card">
        <div class="trace-card-head">
          <span class="mono">${ctx.esc(t.actor)}</span>
          <span class="muted">${t.duration_s}s</span>
        </div>
        <p class="message">${ctx.esc(t.message)}</p>
        ${ctx.renderLiveFlow(t.events, "No tools in this turn")}
        ${t.final ? `<p class="world-meta" style="margin-top:var(--space-xs)">→ ${ctx.esc(t.final)}</p>` : ""}
      </article>`).join("") : "<p class='body-md muted'>No agent turns logged today. Send a message in Chat to see the decision flow here.</p>";
    const act = actions.slice(0, 20).map(a => `<div class="activity-row">
      <div class="mono">${ctx.esc(a.tool_name)}</div>
      <div class="meta">${ctx.esc(a.actor)} · ${ctx.esc((a.created_at || "").slice(0, 16))}</div></div>`).join("") || "<p class='muted'>No actions logged.</p>";
    return `<div class="dashboard-grid">
      <section class="driver-card span-8"><p class="caption-uppercase">Decision flow</p><div style="margin-top:var(--space-sm)">${tracesHtml}</div></section>
      <section class="driver-card span-4"><p class="caption-uppercase">Tool log</p><div style="margin-top:var(--space-sm)">${act}</div></section>
    </div>`;
  }

  ctx.renderActivity = renderActivity;
}
