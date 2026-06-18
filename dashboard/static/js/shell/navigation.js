/** @module shell/navigation — auto-split from app.js */
export function registerShellNavigation(ctx) {
  function mobilePrimaryViews() {
    return window.FOS_MOBILE_PRIMARY_VIEWS || new Set(["dashboard", "chat", "agents", "world"]);
  }

  function closeMobileShell() {
    document.getElementById("sidebar")?.classList.remove("is-open");
    document.body.classList.remove("mobile-nav-open");
    const backdrop = document.getElementById("sidebar-backdrop");
    if (backdrop) {
      backdrop.classList.remove("is-visible");
      backdrop.setAttribute("hidden", "");
    }
    document.getElementById("mobile-menu-drawer")?.close?.();
  }

  function openSidebar() {
    const sidebar = document.getElementById("sidebar");
    const backdrop = document.getElementById("sidebar-backdrop");
    if (!sidebar || !backdrop) return;
    sidebar.classList.add("is-open");
    document.body.classList.add("mobile-nav-open");
    backdrop.removeAttribute("hidden");
    requestAnimationFrame(() => backdrop.classList.add("is-visible"));
  }

  function syncMobileNav(view) {
    const primary = ctx.mobilePrimaryViews();
    document.querySelectorAll(".mobile-tab").forEach(tab => {
      const v = tab.dataset.mobileView;
      if (v === "more") tab.classList.toggle("is-active", !primary.has(view));
      else tab.classList.toggle("is-active", v === view);
    });
    document.querySelectorAll(".mobile-menu-link").forEach(btn => {
      btn.classList.toggle("is-active", btn.dataset.view === view);
    });
  }

  function goView(view) {
    ctx.currentView = view;
    ctx.$$(".nav button").forEach(b => b.classList.toggle("is-active", b.dataset.view === view));
    ctx.$("#view-title").textContent = ctx.TITLES[view] || view;
    ctx.syncMobileNav(view);
    ctx.closeMobileShell();
    FOSMotion?.animateTopbarTitle?.();
    if (["dashboard", "agents", "chat", "activity", "world"].includes(view)) ctx.startLivePoll();
    else ctx.stopLivePoll();
    const gen = ++ctx.viewDataLoadGen;
    ctx.setViewLoading(true);
    ctx.render({ post: false });
    ctx.loadViewData(view).then(() => {
      if (gen !== ctx.viewDataLoadGen) return;
      ctx.setViewLoading(false);
      ctx.render();
    }).catch((e) => {
      console.error(e);
      if (gen === ctx.viewDataLoadGen) ctx.setViewLoading(false);
    });
  }

  function afterRender(opts = {}) {
    try {
      if (ctx.currentView === "dashboard") ctx.drawDashboardCharts();
    } catch (e) {
      console.warn("dashboard charts skipped:", e);
    }
    try {
      if (opts.graphs !== false) ctx.drawGraphs();
    } catch (e) {
      console.warn("graphs skipped:", e);
    }
    if (ctx.state._motionSkipOnce) {
      ctx.state._motionSkipOnce = false;
    } else {
      FOSMotion?.runView?.(ctx.currentView);
    }
    FOSMotion?.ensureContentVisible?.();
    const contentRoot = document.getElementById("content");
    const enhanceDone = window.FOSMarkdown?.enhance?.(contentRoot);
    const finishReadMore = () => {
      if (ctx.currentView === "chat" || ctx.currentView === "agents") ctx.initMsgReadMore(contentRoot);
    };
    if (enhanceDone?.then) enhanceDone.then(finishReadMore).catch(finishReadMore);
    else finishReadMore();
    if (ctx.currentView === "documents" && !ctx.documentsEditMode) {
      const prev = ctx.$("#docs-preview");
      if (prev) void window.FOSMarkdown?.renderInto?.(prev, ctx.state._documentDraft ?? "");
    }
    ctx.startWhatsappPollIfNeeded();
  }

  function updateBadges() {
    const n = (ctx.state.approvals || []).length;
    const nb = ctx.$("#nav-approval-badge");
    if (nb) { nb.textContent = n; nb.hidden = !n; }
    const mob = ctx.$("#mobile-approval-badge");
    if (mob) { mob.textContent = n; mob.hidden = !n; }
    const mobMenu = ctx.$("#mobile-menu-approval-badge");
    if (mobMenu) { mobMenu.textContent = n; mobMenu.hidden = !n; }
    const unr = ctx.state.unread_notifications || 0;
    const nb2 = ctx.$("#notif-badge");
    if (nb2) { nb2.textContent = unr; nb2.hidden = !unr; }
  }

  function setConnectionStatus(label, kind = "ok") {
    const dot = ctx.$("#status-dot");
    const txt = ctx.$("#status-text");
    const mobDot = ctx.$("#mobile-status-dot");
    const mobTxt = ctx.$("#mobile-status-text");
    if (txt) txt.textContent = label;
    if (mobTxt) mobTxt.textContent = label;
    dot?.classList.toggle("ok", kind === "ok");
    dot?.classList.toggle("paused", kind !== "ok");
    mobDot?.classList.toggle("ok", kind === "ok");
    mobDot?.classList.toggle("paused", kind !== "ok");
  }

  function updateStatus() {
    const c = ctx.state.config || {};
    if (c.agent_paused) ctx.setConnectionStatus("Agent paused", "paused");
    else ctx.setConnectionStatus("Online", "ok");
    const sub = ctx.$("#brand-sub");
    if (sub) sub.textContent = c.my_name || c.company_name || ctx.APP_NAME;
    document.title = c.my_name ? `${ctx.APP_NAME} — ${c.my_name}` : ctx.APP_NAME;
  }

  async function openNotificationAction(action, notifId) {
    if (notifId) {
      await ctx.api(`/notifications/${encodeURIComponent(notifId)}/read`, { method: "POST" }).catch(() => {});
      await ctx.refresh();
      ctx.updateBadges();
    }
    if (action === "approvals") ctx.goView("approvals");
    else if (action === "crm") ctx.goView("crm");
    else if (action === "goals") ctx.goView("goals");
    else if (action === "chat") ctx.goView("chat");
    else ctx.goView(action || "dashboard");
    ctx.$("#notif-drawer")?.close();
  }

  function renderNotifications() {
    const items = ctx.state.notifications || [];
    ctx.$("#notif-list").innerHTML = items.length ? items.map(n => {
      const action = n.meta?.action || (n.kind === "approval" ? "approvals" : n.kind === "agent" ? "chat" : "");
      const actionBtn = action
        ? `<button type="button" class="button-outline-on-dark button-sm" data-notif-action="${ctx.esc(action)}" data-notif-id="${ctx.esc(n.id)}" style="margin-top:8px">Open</button>`
        : "";
      const url = n.meta?.url;
      const link = !actionBtn && url ? `<a class="button-outline-on-dark button-sm" href="${ctx.esc(url)}" target="_blank" rel="noopener" style="margin-top:8px;display:inline-block">Open</a>` : "";
      return `
      <div class="notif-item ${n.read ? "" : "unread"}" data-notif-id="${ctx.esc(n.id)}">
        <div class="title">${ctx.esc(n.title)}</div>
        <div class="body">${ctx.esc(n.body)}</div>
        <div class="muted" style="font-size:11px;margin-top:4px">${ctx.fmtTime(n.ts)}</div>
        ${actionBtn || link}
      </div>`;
    }).join("") : "<p class='muted'>No notifications yet.</p>";
  }

  ctx.mobilePrimaryViews = mobilePrimaryViews;
  ctx.closeMobileShell = closeMobileShell;
  ctx.openSidebar = openSidebar;
  ctx.syncMobileNav = syncMobileNav;
  ctx.goView = goView;
  ctx.afterRender = afterRender;
  ctx.updateBadges = updateBadges;
  ctx.setConnectionStatus = setConnectionStatus;
  ctx.updateStatus = updateStatus;
  ctx.openNotificationAction = openNotificationAction;
  ctx.renderNotifications = renderNotifications;
}
