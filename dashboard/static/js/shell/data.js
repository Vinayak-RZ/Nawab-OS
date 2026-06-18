/** @module shell/data — auto-split from app.js */
export function registerShellData(ctx) {
  async function loadViewData(view) {
    if (view === "crm") await ctx.loadCrmData();
    if (view === "settings") {
      ctx.state._whatsapp = await ctx.api("/whatsapp/status").catch(() => ({}));
      if (ctx.state._whatsapp.qr_pending) {
        const qr = await ctx.api("/whatsapp/qr").catch(() => ({}));
        ctx.state._whatsapp.qr_data_url = qr.qr_data_url || null;
      }
    }
    if (view === "goals") ctx.state._goals = await ctx.api("/goals");
    if (view === "tools") ctx.state._tools = await ctx.api("/tools");
    if (view === "agents") {
      const [ag, act, runs, crm, tools] = await Promise.all([
        ctx.api("/agents"),
        ctx.api("/activity").catch(() => ({})),
        ctx.api("/agents/runs").catch(() => ({ runs: [], actions: [] })),
        ctx.api("/crm/contacts").catch(() => ({})),
        ctx.api("/tools").catch(() => ({})),
      ]);
      ctx.state._agents = ag;
      if (!ctx.state._agents?.specialists?.length) {
        ctx.state._agents = { ...ctx.state._agents, specialists: ctx.DEFAULT_SPECIALISTS };
      }
      ctx.state._activity = act;
      ctx.state._agentRunsApi = runs.runs || [];
      ctx.state._agentActions = runs.actions || act.actions || [];
      ctx.state._crm = crm;
      ctx.state._tools = tools;
      const wid = ctx.currentWorldId();
      if (wid && wid !== "root") await ctx.ensureVaultForWorld(wid);
      else ctx.clearVaultScopedState();
    }
    if (view === "settings") {
      ctx.state._infraHealth = await ctx.api("/infrastructure/health").catch(() => ctx.state._infraHealth || null);
    }
    if (view === "activity") ctx.state._activity = await ctx.api("/activity");
    if (view === "history") {
      const wid = ctx.currentWorldId();
      const q = wid && wid !== "root" ? `?world_id=${encodeURIComponent(wid)}` : "";
      ctx.state._history = await ctx.api(`/history${q}`).catch(() => ({ sessions: [], recent_runs: [] }));
      ctx.state._artifacts = (await ctx.api(`/artifacts${q}`).catch(() => ({ artifacts: [] }))).artifacts || [];
      if (ctx.state._historySelectedId) {
        ctx.state._historySession = await ctx.api(`/history/sessions/${ctx.state._historySelectedId}`).catch(() => null);
      } else if (ctx.state._history.sessions?.[0]) {
        ctx.state._historySelectedId = ctx.state._history.sessions[0].id;
        ctx.state._historySession = await ctx.api(`/history/sessions/${ctx.state._historySelectedId}`).catch(() => null);
      }
    }
    if (view === "documents") {
      ctx.state._artifacts = (await ctx.api("/artifacts?limit=100").catch(() => ({ artifacts: [] }))).artifacts || [];
      if (ctx.state._documentsSelectedId) {
        try {
          const data = await ctx.api(`/artifacts/${ctx.state._documentsSelectedId}/content`, { timeoutMs: 15000 });
          ctx.state._documentDraft = data.content || "";
        } catch {
          ctx.state._documentDraft = "";
        }
      } else {
        ctx.state._documentDraft = "";
      }
    }
    if (view === "world") {
      ctx.state._worldFull = await ctx.api("/graph/world");
      ctx.state._worldGraph = ctx.state._worldFull?.graph ?? null;
      ctx.state._worldHierarchyGraph = ctx.state._worldFull?.hierarchy_graph ?? null;
      ctx.state._worldPreviews = ctx.state._worldFull?.world_previews || {};
      ctx.invalidateGraphCache("graph-world");
      if (!ctx.state._worldTemplates?.length) {
        ctx.state._worldTemplates = (await ctx.api("/world-templates").catch(() => ({}))).templates || [];
      }
      if (!ctx.state.inspectorWorldId) ctx.state.inspectorWorldId = ctx.currentWorldId();
      ctx.state._githubStatus = await ctx.api("/github/status").catch(() => ({}));
      if (ctx.state._githubStatus?.connected) {
        ctx.state._githubRepos = (await ctx.api("/github/repos").catch(() => ({}))).repos || [];
      } else {
        ctx.state._githubRepos = [];
      }
      await ctx.ensureVaultForWorld(ctx.inspectorWorldId());
      await ctx.resumeActiveSyncJobs(ctx.inspectorWorldId());
    }
    if (view === "memory") {
      ctx.state._memoryFull = await ctx.api("/graph/memory");
      ctx.state._memoryGraph = ctx.state._memoryFull?.graph ?? null;
      ctx.invalidateGraphCache("graph-memory");
    }
    if (view === "dashboard" || view === "chat" || view === "agents") {
      if (!ctx.state._agents?.specialists?.length) {
        ctx.state._agents = await ctx.api("/agents").catch(() => ({ specialists: ctx.DEFAULT_SPECIALISTS }));
      }
    }
    if (view === "chat") {
      ctx.state._activity = await ctx.api("/activity").catch(() => ctx.state._activity || {});
      ctx.state._agentRunsApi = (await ctx.api("/agents/runs").catch(() => ({}))).runs || ctx.state._agentRunsApi;
      await ctx.loadChatSessionsList();
      await ctx.loadChatFromServer();
      const wid = ctx.currentWorldId();
      if (wid && wid !== "root") await ctx.ensureVaultForWorld(wid);
    }
    if (view === "dashboard") {
      ctx.state._world = await ctx.api("/world").catch(() => ctx.state._world || {});
      ctx.state._worldGraph = ctx.state._world?.graph ?? ctx.state._worldGraph ?? null;
      if (!ctx.state._agents?.specialists?.length) {
        ctx.state._agents = await ctx.api("/agents").catch(() => ({ specialists: ctx.DEFAULT_SPECIALISTS }));
      }
      const wid = ctx.currentWorldId();
      const q = wid && wid !== "root" ? `?world_id=${encodeURIComponent(wid)}` : "";
      ctx.state._nudges = (await ctx.api(`/nudges${q}`).catch(() => ({ nudges: [] }))).nudges || [];
    }
    if (["dashboard", "agents", "chat", "world", "memory"].includes(view)) {
      await ctx.loadGraphData();
    }
  }

  async function refresh(full = false) {
    const prevWorld = ctx.state.activeWorldId;
    const prevSpec = ctx.state.selectedSpecialist;
    const prevUi = ctx.state.ui;
    if (full || !ctx.state.config?.my_name) {
      ctx.state = { ...ctx.state, ...(await ctx.api("/state")) };
    } else {
      const s = await ctx.api("/summary");
      ctx.state.usage = s.usage ?? ctx.state.usage;
      ctx.state.unread_notifications = s.unread_notifications ?? ctx.state.unread_notifications;
      if (s.worlds) ctx.state.worlds = s.worlds;
      if (s.config) ctx.state.config = s.config;
      ctx.state.snapshot = {
        ...(ctx.state.snapshot || {}),
        approvals_pending: s.approvals_pending ?? ctx.state.snapshot?.approvals_pending ?? 0,
        reminders_pending: s.reminders_pending ?? ctx.state.snapshot?.reminders_pending ?? 0,
        tasks_open: s.tasks_open ?? ctx.state.snapshot?.tasks_open ?? 0,
        crm: {
          ...(ctx.state.snapshot?.crm || {}),
          followups_due: s.crm_followups_due ?? ctx.state.snapshot?.crm?.followups_due ?? 0,
        },
      };
    }
    ctx.state.activeWorldId = prevWorld || ctx.state.activeWorldId || "root";
    ctx.state.selectedSpecialist = prevSpec ?? ctx.state.selectedSpecialist ?? "";
    ctx.state.ui = prevUi || ctx.state.ui;
    try {
      ctx.populateWorldSelect();
      ctx.populateSpecialistSelect();
    } catch (e) {
      console.error("populate selects failed:", e);
    }
    ctx.updateBadges();
    ctx.updateStatus();
    if (typeof decorateNavIcons === "function") decorateNavIcons();
  }

  async function loadBootExtras() {
    /* Deprecated — boot data loads via ctx.refresh() + ctx.loadViewData(). Kept for compatibility. */
  }

  function scheduleBackgroundRefresh() {
    if (ctx.refreshTimer) clearTimeout(ctx.refreshTimer);
    if (document.hidden) return;
    ctx.refreshTimer = setTimeout(async () => {
      try {
        await ctx.refresh(false);
        ctx.updateBadges();
        ctx.updateStatus();
      } catch (e) {
        console.error(e);
        ctx.setConnectionStatus("Reconnecting…", "paused");
      }
      ctx.scheduleBackgroundRefresh();
    }, ctx.REFRESH_MS);
  }

  ctx.loadViewData = loadViewData;
  ctx.refresh = refresh;
  ctx.loadBootExtras = loadBootExtras;
  ctx.scheduleBackgroundRefresh = scheduleBackgroundRefresh;
}
