/** @module shell/render — view router and main render loop */
export function registerRender(ctx) {
  function renderRagModeSelect(id = "rag-mode-select") {
    const opts = ctx.RAG_MODES.map(m =>
      `<option value="${ctx.esc(m.id)}" title="${ctx.esc(m.hint)}">${ctx.esc(m.label)}</option>`
    ).join("");
    return `<label class="chat-control">
      <span class="caption-uppercase">Retrieval</span>
      <select id="${ctx.esc(id)}" class="world-select agent-select" aria-label="RAG mode">${opts}</select>
    </label>`;
  }

  function animateLatestChatMessage() {
    requestAnimationFrame(() => {
      const msgs = ctx.$("#chat-messages")?.querySelectorAll(".msg:not(.system)");
      const last = msgs?.[msgs.length - 1];
      FOSMotion?.animateNewMessage?.(last);
    });
  }

  function render(opts = {}) {
    const el = ctx.$("#content");
    if (!el) return;
    const fns = {
      dashboard: ctx.renderDashboard,
      chat: ctx.renderChat,
      agents: ctx.renderAgents,
      world: ctx.renderWorld,
      approvals: ctx.renderApprovals,
      crm: ctx.renderCrm,
      outreach: ctx.renderOutreach,
      goals: ctx.renderGoals,
      memory: ctx.renderMemory,
      history: ctx.renderHistory,
      documents: ctx.renderDocuments,
      tools: ctx.renderTools,
      activity: ctx.renderActivity,
      settings: ctx.renderSettings,
    };
    try {
      if (ctx.state._viewLoading) {
        el.innerHTML = ctx.renderViewSkeleton(ctx.currentView);
      } else {
        const fn = fns[ctx.currentView] || ctx.renderDashboard;
        el.innerHTML = fn();
      }
    } catch (e) {
      console.error("render failed:", e);
      el.innerHTML = `<div class="driver-card span-12">
        <p class="title-md">Dashboard could not render</p>
        <p class="body-md muted" style="margin-top:8px">${ctx.esc(e?.message || String(e))}</p>
        <button type="button" class="button-primary button-sm" id="render-retry" style="margin-top:12px">Retry</button>
      </div>`;
      ctx.$("#render-retry")?.addEventListener("click", () => ctx.boot());
      return;
    }
    document.querySelector(".content")?.classList.toggle("content--worlds", ctx.currentView === "world");
    document.querySelector(".content")?.classList.toggle("content--wide", ["agents", "world", "activity", "chat", "history", "documents"].includes(ctx.currentView));
    document.querySelector(".content")?.classList.toggle("content--chat", ctx.currentView === "chat");
    ctx.populateSpecialistSelect();
    const ragEl = ctx.$("#rag-mode-select");
    if (ragEl) ragEl.value = ctx.state.ragMode || "auto";
    if (opts.post !== false) {
      ctx.afterRender({ graphs: opts.graphs !== false });
      if (ctx.state._scrollWorldCreate && ctx.currentView === "world") {
        ctx.state._scrollWorldCreate = false;
        requestAnimationFrame(() => document.getElementById("world-create-panel")?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
      }
    }
    if (ctx.currentView === "chat") {
      const chatEl = ctx.$("#chat-messages");
      if (chatEl) chatEl.scrollTop = chatEl.scrollHeight;
    }
  }

  ctx.renderRagModeSelect = renderRagModeSelect;
  ctx.animateLatestChatMessage = animateLatestChatMessage;
  ctx.render = render;
}
