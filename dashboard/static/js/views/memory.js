/** @module views/memory — auto-split from app.js */
export function registerViewsMemory(ctx) {
  function renderMemory() {
    const results = ctx.state._memoryResults || [];
    const m = ctx.state._memoryFull || {};
    const cols = m.collections || [];
    const kg = m.knowledge_graph || {};
    const items = results.map(r => `<div class="memory-hit">
      <span class="badge-pill">${ctx.esc(r.collection)}</span>
      <p class="body-md" style="margin-top:var(--space-xxs);max-width:72ch">${ctx.esc(r.text)}</p></div>`).join("");
    const colCards = cols.map(c => `
      <div class="memory-collection">
        <h4>${ctx.esc(c.name)} <span class="muted">(${c.count} vectors)</span></h4>
        ${(c.samples || []).map(s => `<p class="memory-sample">${ctx.esc(s.text)}</p>`).join("") || "<p class='muted'>Empty collection</p>"}
      </div>`).join("");
    return `
      <div class="search-row">
        <input type="search" class="text-input-on-dark" id="memory-q" placeholder="Semantic search across all memory…" value="${ctx.esc(ctx.state._memoryQ || "")}">
        <button class="button-primary" id="memory-search">Search</button>
      </div>
      <div class="graph-tabs">
        <button type="button" class="graph-tab ${ctx.memoryGraphTab === "graph" ? "is-active" : ""}" data-memory-tab="graph">Memory graph</button>
        <button type="button" class="graph-tab ${ctx.memoryGraphTab === "collections" ? "is-active" : ""}" data-memory-tab="collections">Collections</button>
        <button type="button" class="graph-tab ${ctx.memoryGraphTab === "search" ? "is-active" : ""}" data-memory-tab="search">Search results</button>
      </div>
      <div id="memory-tab-graph" ${ctx.memoryGraphTab !== "graph" ? "hidden" : ""}>
        <p class="body-md" style="margin-bottom:var(--space-sm)">Knowledge graph (${(kg.entities || []).length} entities, ${(kg.relations || []).length} relations) plus recent vector memory chunks.</p>
        <div id="graph-memory" class="graph-canvas"></div>
        <div class="graph-detail" id="graph-memory-detail">Click a node to inspect</div>
      </div>
      <div id="memory-tab-collections" ${ctx.memoryGraphTab !== "collections" ? "hidden" : ""}>${colCards || "<p class='body-md'>No vector memory yet.</p>"}</div>
      <div id="memory-tab-search" ${ctx.memoryGraphTab !== "search" ? "hidden" : ""}>
        <div id="memory-results">${items || '<p class="body-md">Search to find relevant memories.</p>'}</div>
      </div>`;
  }

  async function searchMemory() {
    const q = ctx.$("#memory-q")?.value?.trim();
    ctx.state._memoryQ = q;
    if (!q) return;
    const res = await ctx.api("/memory/search?q=" + encodeURIComponent(q));
    ctx.state._memoryResults = res.results;
    ctx.render();
  }

  ctx.renderMemory = renderMemory;
  ctx.searchMemory = searchMemory;
}
