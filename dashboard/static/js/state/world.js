/** @module state/world — auto-split from app.js */
export function registerStateWorld(ctx) {
  function ownerLabel() {
    const c = ctx.state.config || {};
    return c.my_name ? `${c.my_name}'s ${ctx.APP_NAME}` : ctx.APP_NAME;
  }

  function currentWorldId() {
    return ctx.state.activeWorldId || ctx.$("#world-select")?.value || "root";
  }

  function activeWorldLabel() {
    const tree = ctx.state.worlds || ctx.state._worldFull?.worlds || {};
    const id = ctx.currentWorldId();
    if (id === "root") return tree.root?.name || "Main world";
    const child = (tree.children || []).find(c => c.id === id);
    return child?.name || id;
  }

  function setActiveWorld(id) {
    ctx.state.activeWorldId = id || "root";
    localStorage.setItem("fos_active_world", ctx.state.activeWorldId);
    ctx.populateWorldSelect();
    ctx.updateWorldContextChrome();
  }

  function syncWorldSelectValue() {
    const sel = ctx.$("#world-select");
    if (!sel) return;
    const id = ctx.state.activeWorldId || "root";
    if ([...sel.options].some(o => o.value === id)) sel.value = id;
  }

  function updateWorldContextChrome() {
    const label = ctx.activeWorldLabel();
    document.querySelectorAll("[data-active-world-label]").forEach(el => {
      el.textContent = label;
    });
    ctx.syncWorldSelectValue();
    if (ctx.currentView === "world") ctx.patchWorldTreeNav();
  }

  function currentSpecialistId() {
    const raw = ctx.$("#specialist-select-agents")?.value
      ?? ctx.state.selectedSpecialist
      ?? "";
    return raw === "auto" ? "" : (raw || "");
  }

  function currentRagMode() {
    return ctx.$("#rag-mode-select")?.value || ctx.state.ragMode || "auto";
  }

  function isDirectSpecialist() {
    return !!ctx.currentSpecialistId();
  }

  function populateWorldSelect() {
    const sel = ctx.$("#world-select");
    if (!sel) return;
    const tree = ctx.state.worlds || ctx.state._worldFull?.worlds || {};
    const root = tree.root;
    const children = tree.children || [];
    const childOpts = children.map(c =>
      `<option value="${ctx.esc(c.id)}">${ctx.esc(c.name)} · ${ctx.esc(c.kind || "project")}</option>`
    ).join("");
    sel.innerHTML = `
      <optgroup label="Main">
        <option value="root">${ctx.esc(root?.name || "Main world")} — all context</option>
      </optgroup>
      ${children.length ? `<optgroup label="Sub-worlds">${childOpts}</optgroup>` : ""}`;
    const current = ctx.state.activeWorldId || "root";
    if ([...sel.options].some(o => o.value === current)) sel.value = current;
    else {
      sel.value = "root";
      ctx.state.activeWorldId = "root";
      localStorage.setItem("fos_active_world", "root");
    }
  }

  ctx.ownerLabel = ownerLabel;
  ctx.currentWorldId = currentWorldId;
  ctx.activeWorldLabel = activeWorldLabel;
  ctx.setActiveWorld = setActiveWorld;
  ctx.syncWorldSelectValue = syncWorldSelectValue;
  ctx.updateWorldContextChrome = updateWorldContextChrome;
  ctx.currentSpecialistId = currentSpecialistId;
  ctx.currentRagMode = currentRagMode;
  ctx.isDirectSpecialist = isDirectSpecialist;
  ctx.populateWorldSelect = populateWorldSelect;
}
