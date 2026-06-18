/** Static DOM listeners — wired once at boot */
export function wireDomListeners(ctx) {
  ctx.$$(".nav button").forEach(b => b.addEventListener("click", () => ctx.goView(b.dataset.view)));
  ctx.$("#btn-sidebar-open")?.addEventListener("click", ctx.openSidebar);

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

  ctx.$("#vault-picker-close")?.addEventListener("click", () => ctx.$("#vault-picker-dialog")?.close());
  ctx.$("#vault-picker-dialog")?.addEventListener("click", (e) => {
    if (e.target.id === "vault-picker-dialog") ctx.$("#vault-picker-dialog").close();
  });
  ctx.$("#sidebar-close")?.addEventListener("click", ctx.closeMobileShell);
  ctx.$("#sidebar-backdrop")?.addEventListener("click", ctx.closeMobileShell);

  document.querySelectorAll(".mobile-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      const v = tab.dataset.mobileView;
      if (v === "more") {
        ctx.syncMobileNav(ctx.currentView);
        document.getElementById("mobile-menu-drawer")?.showModal();
      } else {
        ctx.goView(v);
      }
    });
  });
  document.querySelectorAll(".mobile-menu-link").forEach(b => {
    b.addEventListener("click", () => ctx.goView(b.dataset.view));
  });

  const mobileMenuDrawer = ctx.$("#mobile-menu-drawer");
  ctx.$("#mobile-menu-close")?.addEventListener("click", () => mobileMenuDrawer?.close());
  mobileMenuDrawer?.addEventListener("click", (e) => {
    if (e.target === mobileMenuDrawer) mobileMenuDrawer.close();
  });

  ctx.$("#btn-refresh")?.addEventListener("click", async () => {
    await ctx.refresh();
    const gen = ++ctx.viewDataLoadGen;
    ctx.setViewLoading(true);
    try {
      await ctx.loadViewData(ctx.currentView);
      if (gen === ctx.viewDataLoadGen) ctx.render();
    } finally {
      if (gen === ctx.viewDataLoadGen) ctx.setViewLoading(false);
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) ctx.closeMobileShell();
  });

  const notifDialog = ctx.$("#notif-drawer");
  ctx.$("#btn-notifications")?.addEventListener("click", () => {
    ctx.renderNotifications();
    notifDialog?.showModal();
  });
  notifDialog?.addEventListener("click", (e) => {
    if (e.target === notifDialog) notifDialog.close();
  });
  ctx.$("#notif-read-all")?.addEventListener("click", async () => {
    await ctx.api("/notifications/read-all", { method: "POST" });
    await ctx.refresh();
    ctx.renderNotifications();
    ctx.updateBadges();
  });

  ctx.$("#world-select")?.addEventListener("change", async e => {
    const sel = e.target;
    const newId = sel.value || "root";
    sel.disabled = true;
    try {
      ctx.setActiveWorld(newId);
      ctx.clearVaultScopedState();
      ctx.invalidateGraphCache("graph-world");
      if (ctx.currentView === "world") {
        ctx.state.inspectorWorldId = newId;
        if (!ctx.state.ui) ctx.state.ui = {};
        ctx.state.ui.vaultFacet = null;
        ctx.patchWorldPanels();
      }
      await ctx.onWorldContextChanged({ vaultWorldId: newId, forceVault: true });
      if (ctx.currentView === "world") ctx.patchWorldPanels();
      else if (ctx.currentView === "agents" && ctx.state.agentsTab === "vault") ctx.patchAgentsVaultPanel();
      else ctx.render({ graphs: false });
      ctx.updateWorldContextChrome();
    } catch (err) {
      console.error("world switch failed:", err);
    } finally {
      sel.disabled = false;
    }
  });

  window.addEventListener("error", (e) => {
    console.error("UI error:", e.error || e.message);
    if (!ctx.state?.config?.my_name) ctx.setConnectionStatus("UI error — hard refresh", "paused");
  });

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      ctx.scheduleBackgroundRefresh();
      if (!ctx.livePollTimer && ctx.state?.config) ctx.startLivePoll();
    } else {
      if (ctx.refreshTimer) {
        clearTimeout(ctx.refreshTimer);
        ctx.refreshTimer = null;
      }
      ctx.stopLivePoll();
    }
  });
}
