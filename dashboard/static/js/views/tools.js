/** @module views/tools — auto-split from app.js */
export function registerViewsTools(ctx) {
  function renderTools() {
    const t = ctx.state._tools || {};
    const rows = (t.tools || []).map(x => `<div class="tool-row">
      <div class="name">${ctx.esc(x.name)}${x.requires_approval ? ' <span class="badge-pill">approval</span>' : ""}</div>
      <div class="cat">${ctx.esc(x.category)}</div>
      <div class="desc">${ctx.esc(x.description)}</div></div>`).join("");
    return `<p class="body-md" style="margin-bottom:var(--space-xs);max-width:60ch">${t.total || 0} tools · ${Object.keys(t.by_category || {}).length} categories. Tool-RAG retrieves the most relevant set per message.</p>
    <div class="tool-list">${rows}</div>`;
  }

  ctx.renderTools = renderTools;
}
