/** @module features/ops — auto-split from app.js */
export function registerFeaturesOps(ctx) {
  function isLinkSyncing(linkId) {
    return ctx.state._syncingLinkIds.has(String(linkId));
  }

  function renderOpsStack() {
    const host = document.getElementById("ops-stack");
    if (!host) return;
    const now = Date.now();
    const items = Object.values(ctx.state._operations || {})
      .filter(o => o.status === "running" || (o.finishedAt && now - o.finishedAt < 8000))
      .slice(0, 5);
    if (!items.length) {
      host.innerHTML = "";
      host.hidden = true;
      return;
    }
    host.hidden = false;
    host.innerHTML = items.map(o => {
      const pct = Math.round((o.progress || 0) * 100);
      const cls = o.status === "running" ? "is-running" : (o.status === "error" ? "is-error" : "is-done");
      const statusLabel = o.status === "running" ? "Working" : (o.status === "error" ? "Failed" : "Done");
      return `<div class="ops-card ${cls}" data-op-id="${ctx.esc(o.id)}">
        <div class="ops-card__head">
          <span class="ops-card__title">${ctx.esc(o.title)}</span>
          <span class="ops-card__status">${statusLabel}</span>
        </div>
        <p class="ops-card__detail">${ctx.esc(o.detail || "")}</p>
        ${o.status === "running" ? `<div class="ops-card__bar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><span style="width:${pct}%"></span></div>` : ""}
      </div>`;
    }).join("");
  }

  async function runGithubSyncJob(jobId, title, meta = {}) {
    const opId = jobId;
    ctx.state._operations[opId] = {
      id: opId,
      title,
      detail: "Scanning repository…",
      progress: 0,
      status: "running",
    };
    if (meta.linkId != null) ctx.state._syncingLinkIds.add(String(meta.linkId));
    ctx.renderOpsStack();
    if (meta.worldId && ctx.currentView === "world") ctx.render();
  
    try {
      while (true) {
        const batch = await ctx.api(`/sync-jobs/${encodeURIComponent(jobId)}/batch`, {
          method: "POST",
          body: JSON.stringify({ batch_size: 8 }),
          timeoutMs: 180000,
        });
        const op = ctx.state._operations[opId];
        if (op) {
          op.progress = batch.progress || 0;
          op.detail = batch.message || `${batch.imported || 0} files imported`;
          op.status = batch.status === "failed" ? "error" : (batch.done ? "done" : "running");
        }
        ctx.renderOpsStack();
        if (batch.done) break;
      }
    } catch (e) {
      const op = ctx.state._operations[opId];
      if (op) {
        op.status = "error";
        op.detail = e.message || "Sync failed";
        op.finishedAt = Date.now();
      }
      ctx.renderOpsStack();
      throw e;
    } finally {
      const op = ctx.state._operations[opId];
      if (op && !op.finishedAt) op.finishedAt = Date.now();
      if (meta.linkId != null) ctx.state._syncingLinkIds.delete(String(meta.linkId));
      ctx.renderOpsStack();
      try {
        await ctx.refresh();
        if (meta.worldId) await ctx.reloadVault(meta.worldId, { force: true });
        if (ctx.currentView === "world") ctx.patchWorldPanels();
        else if (ctx.currentView === "agents") ctx.patchAgentsVaultPanel();
        ctx.updateBadges();
      } catch (_) { /* ignore refresh errors */ }
      setTimeout(() => {
        delete ctx.state._operations[opId];
        ctx.renderOpsStack();
      }, 8000);
    }
  }

  async function resumeActiveSyncJobs(worldId) {
    const res = await ctx.api(`/worlds/${encodeURIComponent(worldId)}/sync-jobs`).catch(() => ({ jobs: [] }));
    for (const j of res.jobs || []) {
      if (!j?.id || ctx.state._operations[j.id]) continue;
      ctx.runGithubSyncJob(j.id, `Syncing ${j.full_name}`, { worldId, linkId: j.link_id }).catch(console.error);
    }
  }

  ctx.isLinkSyncing = isLinkSyncing;
  ctx.renderOpsStack = renderOpsStack;
  ctx.runGithubSyncJob = runGithubSyncJob;
  ctx.resumeActiveSyncJobs = resumeActiveSyncJobs;
}
