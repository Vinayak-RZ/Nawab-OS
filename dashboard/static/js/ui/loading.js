/** @module ui/loading — auto-split from app.js */
export function registerUiLoading(ctx) {
  function setViewLoading(on, opts = {}) {
    ctx.state._viewLoading = !!on;
    const bar = document.getElementById("global-progress");
    const inner = bar?.querySelector(".global-progress__bar");
    if (bar) {
      bar.hidden = !on;
      bar.setAttribute("aria-hidden", on ? "false" : "true");
      if (on && opts.progress == null) {
        bar.classList.add("is-indeterminate");
        if (inner) inner.style.width = "";
      } else if (on && opts.progress != null) {
        bar.classList.remove("is-indeterminate");
        if (inner) inner.style.width = `${Math.min(100, opts.progress)}%`;
      } else {
        bar.classList.remove("is-indeterminate");
        if (inner) inner.style.width = "0";
      }
    }
  }

  function beginActionBusy(btn) {
    ctx.actionBusyDepth++;
    if (ctx.actionBusyDepth === 1) {
      ctx._actionOwnedLoading = !ctx.state._viewLoading;
      if (ctx._actionOwnedLoading) ctx.setViewLoading(true);
      document.body.classList.add("is-action-busy");
    }
    const target = btn?.closest?.("button, [role='button']") || btn;
    if (target && !ctx.actionBusyButton) {
      ctx.actionBusyButton = target;
      target.classList.add("is-loading");
      target.setAttribute("aria-busy", "true");
      if ("disabled" in target) target.disabled = true;
    }
  }

  function endActionBusy(btn) {
    const tracked = ctx.actionBusyButton;
    if (tracked) {
      tracked.classList.remove("is-loading");
      tracked.removeAttribute("aria-busy");
      if ("disabled" in tracked && !tracked.dataset.keepDisabled) tracked.disabled = false;
      ctx.actionBusyButton = null;
    }
    ctx.actionBusyDepth = Math.max(0, ctx.actionBusyDepth - 1);
    if (ctx.actionBusyDepth === 0) {
      if (ctx._actionOwnedLoading) {
        ctx.setViewLoading(false);
        ctx._actionOwnedLoading = false;
      }
      document.body.classList.remove("is-action-busy");
    }
  }

  function runWithActionBusy(fn, btn) {
    ctx.beginActionBusy(btn);
    try {
      const result = fn();
      if (result != null && typeof result.then === "function") {
        return result.finally(() => ctx.endActionBusy(btn));
      }
      ctx.endActionBusy(btn);
      return result;
    } catch (err) {
      ctx.endActionBusy(btn);
      throw err;
    }
  }

  function shouldSkipActionBusy(el) {
    if (!el) return true;
    if (el.id === "chat-send" || el.id === "chat-clear") return true;
    if (el.dataset.toggleUi !== undefined) return true;
    if (el.dataset.goto !== undefined) return true;
    if (el.dataset.toggleRun !== undefined) return true;
    if (el.dataset.memoryTab !== undefined) return true;
    if (el.dataset.vaultFacet !== undefined) return true;
    if (el.dataset.vaultAddDoc !== undefined) return true;
    if (el.dataset.vaultCancelDoc !== undefined) return true;
    if (el.dataset.removeAttachment !== undefined) return true;
    if (el.dataset.historyTab !== undefined) return true;
    if (el.dataset.pickVaultDoc !== undefined) return true;
    if (el.dataset.cancelEdit !== undefined) return true;
    if (el.dataset.editWorld !== undefined) return true;
    if (el.dataset.docsAction === "toggle") return true;
    if (el.hasAttribute("data-outreach-save-companies")) return true;
    if (el.matches?.("[data-crm-company-toggle]")) return true;
    return false;
  }

  function skeletonLine(width = "72%") {
    return `<span class="skeleton" style="display:block;height:12px;width:${width}"></span>`;
  }

  function skeletonCard(lines = 3) {
    const body = Array.from({ length: lines }, (_, i) => ctx.skeletonLine(i === 0 ? "38%" : "88%")).join("");
    return `<div class="skeleton-card driver-card">${body}</div>`;
  }

  function renderViewSkeleton(view) {
    const grid3 = `<div class="skeleton-grid">${ctx.skeletonCard(2)}${ctx.skeletonCard(2)}${ctx.skeletonCard(2)}</div>`;
    if (view === "dashboard") {
      return `<div class="view-skeleton dashboard-grid">${ctx.skeletonCard(2)}<div class="span-8">${ctx.skeletonCard(4)}</div><div class="span-4">${ctx.skeletonCard(2)}</div>${grid3}</div>`;
    }
    if (view === "chat") {
      return `<div class="view-skeleton"><div class="skeleton-card driver-card">${ctx.skeletonLine("30%")}${ctx.skeletonLine("60%")}</div><div class="skeleton-card driver-card" style="min-height:280px">${ctx.skeletonLine("100%")}${ctx.skeletonLine("92%")}${ctx.skeletonLine("78%")}</div></div>`;
    }
    if (view === "world") {
      return `<div class="view-skeleton dashboard-grid"><div class="span-4">${ctx.skeletonCard(3)}</div><div class="span-8">${ctx.skeletonCard(5)}</div>${grid3}</div>`;
    }
    if (view === "documents") {
      return `<div class="view-skeleton docs-workspace"><div class="skeleton-card driver-card">${ctx.skeletonCard(4)}</div><div class="skeleton-card driver-card">${ctx.skeletonCard(6)}</div></div>`;
    }
    if (view === "outreach") {
      return `<div class="view-skeleton">${ctx.skeletonCard(2)}${ctx.skeletonCard(4)}</div>`;
    }
    return `<div class="view-skeleton">${ctx.skeletonCard(3)}${grid3}</div>`;
  }

  ctx.setViewLoading = setViewLoading;
  ctx.beginActionBusy = beginActionBusy;
  ctx.endActionBusy = endActionBusy;
  ctx.runWithActionBusy = runWithActionBusy;
  ctx.shouldSkipActionBusy = shouldSkipActionBusy;
  ctx.skeletonLine = skeletonLine;
  ctx.skeletonCard = skeletonCard;
  ctx.renderViewSkeleton = renderViewSkeleton;
}
