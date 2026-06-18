/** @module features/live — auto-split from app.js */
export function registerFeaturesLive(ctx) {
  function renderLiveFlow(events, emptyLabel = "Waiting for activity…") {
    if (!events?.length) {
      return `<p class="body-md muted">${ctx.esc(emptyLabel)}</p>`;
    }
    return `<div class="tool-flow">${events.map((e, i) => {
      const arrow = i > 0 ? '<span class="tool-flow-arrow" aria-hidden="true">→</span>' : "";
      if (e.type === "phase") {
        return `${arrow}<span class="tool-flow-node">${ctx.esc(e.label)}</span>`;
      }
      const cls = e.decision === "approve" ? " is-approve" : e.decision === "deny" ? " is-deny" : "";
      return `${arrow}<span class="tool-flow-node${cls}">${ctx.esc(e.name || e.label)}</span>`;
    }).join("")}</div>`;
  }

  function renderLivePanel(live, id = "live-panel") {
    const jobs = live?.jobs?.length ? live.jobs : (live?.active ? [live] : []);
    const active = jobs.some(j => j.active || j.status === "running") || live?.active;
    const primary = jobs[0] || live || {};
    const events = primary.events || live?.events || [];
    const phaseOpts = events.map((e, i) =>
      `<option value="${i}"${i === events.length - 1 ? " selected" : ""}>${ctx.esc(e.label || e.name || "Step")}</option>`
    ).join("");
    const jobCards = jobs.length ? jobs.map(j => `
      <div class="live-job${j.active || j.status === "running" ? " is-active" : ""}">
        <div class="live-job__head">
          <span class="mono">${ctx.esc(j.specialist || j.mode || "agent")}</span>
          <span class="muted">${j.elapsed_s || 0}s</span>
        </div>
        <p class="live-job__phase">${ctx.esc(j.phase || "Working…")}</p>
        ${(j.active || j.status === "running") ? `<button type="button" class="button-outline-on-dark button-sm" data-cancel-job="${ctx.esc(j.id)}">Stop</button>` : `<span class="badge-pill">${ctx.esc(j.status || "done")}</span>`}
      </div>`).join("") : "";
    return `<section class="live-panel${active ? " is-active" : ""}" id="${id}" aria-live="polite">
      <div class="live-panel__head">
        <p class="caption-uppercase">Live operation</p>
        ${active && primary.id ? `<button type="button" class="button-outline-on-dark button-sm" data-cancel-job="${ctx.esc(primary.id)}">Stop</button>` : ""}
      </div>
      <p class="live-phase" id="${id}-phase">${ctx.esc(primary.phase || live?.phase || "Idle — send a message or delegate a task")}</p>
      ${events.length ? `<label class="live-phase-select"><span class="caption-uppercase">Step</span>
        <select class="world-select" id="${id}-step" aria-label="Current step">${phaseOpts}</select></label>` : ""}
      <div id="${id}-flow">${ctx.renderLiveFlow(events)}</div>
      ${jobCards ? `<div class="live-jobs">${jobCards}</div>` : ""}
      ${active && live?.elapsed_s ? `<p class="world-meta">${live.elapsed_s}s elapsed · ${ctx.esc(live.actor || primary.specialist || "")}</p>` : ""}
    </section>`;
  }

  function updateLiveStrip(live) {
    const strip = ctx.$("#live-strip");
    const txt = ctx.$("#live-strip-text");
    if (!strip) return;
    const active = !!live?.active;
    if (active !== ctx.lastLiveActive) {
      FOSMotion?.pulseLiveStrip?.(active);
      ctx.lastLiveActive = active;
    }
    if (txt && active) txt.textContent = live.phase || "Agent working…";
  }

  function patchLiveUI(live) {
    ctx.state.live = live || {};
    ctx.updateLiveStrip(live);
    ctx.$("[id$='-phase']").forEach(el => { el.textContent = live?.phase || "Idle"; });
    ctx.$("[id$='-flow']").forEach(el => { el.innerHTML = ctx.renderLiveFlow(live?.events || []); });
    ctx.$(".live-panel").forEach(el => el.classList.toggle("is-active", !!live?.active));
  }

  async function pollLive() {
    try {
      const live = await ctx.api("/live", { timeoutMs: 15000 });
      ctx.state.live = live;
      ctx.patchLiveUI(live);
      if (["dashboard", "agents", "chat"].includes(ctx.currentView)) {
        const fetchRuntime = live?.active || (ctx._runtimePollTick++ % 4 === 0);
        if (fetchRuntime) {
          const prevSig = ctx.graphDataSignature(ctx.state._runtimeGraph, "runtime");
          ctx.state._runtimeGraph = await ctx.api("/graph/runtime").catch(() => ctx.state._runtimeGraph);
          const nextSig = ctx.graphDataSignature(ctx.state._runtimeGraph, "runtime");
          if (prevSig !== nextSig) {
            ctx.invalidateGraphCache("graph-runtime-dash", "graph-runtime-agents", "graph-runtime-chat");
            ctx.drawGraphs();
          }
        }
      }
    } catch (_) { /* ignore */ }
  }

  function startLivePoll() {
    ctx.stopLivePoll();
    ctx._runtimePollTick = 0;
    void ctx.pollLive();
    ctx.scheduleLivePoll();
  }

  function stopLivePoll() {
    if (ctx.livePollTimer) {
      clearTimeout(ctx.livePollTimer);
      ctx.livePollTimer = null;
    }
  }

  ctx.renderLiveFlow = renderLiveFlow;
  ctx.renderLivePanel = renderLivePanel;
  ctx.updateLiveStrip = updateLiveStrip;
  ctx.patchLiveUI = patchLiveUI;
  ctx.pollLive = pollLive;
  ctx.startLivePoll = startLivePoll;
  ctx.stopLivePoll = stopLivePoll;
}
