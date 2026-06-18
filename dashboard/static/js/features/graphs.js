/** @module features/graphs — auto-split from app.js */
export function registerFeaturesGraphs(ctx) {
  function clearVaultScopedState() {
    ctx.state._worldVault = null;
    ctx.state._vaultGraph = null;
    ctx.state._vaultWorldId = null;
    ctx.state._vaultLoading = false;
  }

  function vaultPayload() {
    return ctx.state._worldVault?.vault || ctx.state._worldVault || null;
  }

  function vaultReadyFor(worldId) {
    return !!(worldId && worldId !== "root" && ctx.state._vaultWorldId === worldId && ctx.vaultPayload());
  }

  function graphDataSignature(graphData, extra = "") {
    if (!graphData) return `${extra}:empty`;
    const nodes = graphData.nodes || [];
    const edges = graphData.edges || [];
    const meta = graphData.meta || {};
    const labels = nodes.slice(0, 12).map(n => `${n.data?.id}:${n.data?.label}`).join("|");
    return `${extra}:${nodes.length}:${edges.length}:${meta.updated || ""}:${meta.document_count || ""}:${labels}`;
  }

  function invalidateGraphCache(...ids) {
    if (!ids.length) {
      Object.keys(ctx.graphDrawCache).forEach(k => delete ctx.graphDrawCache[k]);
      return;
    }
    ids.forEach(id => delete ctx.graphDrawCache[id]);
  }

  function renderGraphOrPlaceholder(containerId, graphData, opts = {}, emptyMessage = "Nothing to visualize yet.") {
    if (!window.FOSGraph) return null;
    const el = document.getElementById(containerId);
    if (!el) return null;
    let ph = el.parentElement?.querySelector(`[data-graph-placeholder-for="${containerId}"]`);
    if (!ph) {
      ph = document.createElement("p");
      ph.className = "graph-placeholder body-md muted";
      ph.dataset.graphPlaceholderFor = containerId;
      el.insertAdjacentElement("afterend", ph);
    }
    const nodes = graphData?.nodes || [];
    const edges = graphData?.edges || [];
    const onlyEmpty = nodes.length === 1 && nodes[0]?.data?.type === "empty";
    const loading = nodes.length === 1 && nodes[0]?.data?.type === "loading";
    const hasGraph = (nodes.length + edges.length) > 0 && !onlyEmpty && !loading;
    const sig = ctx.graphDataSignature(graphData, `${containerId}:${opts.layout?.name || "default"}:${opts.onSelect ? "interactive" : "static"}`);
    let cy = null;
    if (hasGraph) {
      if (ctx.graphDrawCache[containerId] === sig && FOSGraph.getCy(containerId) && !opts.onSelect) {
        cy = FOSGraph.getCy(containerId);
      } else {
        cy = FOSGraph.render(containerId, graphData, opts);
        ctx.graphDrawCache[containerId] = sig;
      }
    } else {
      FOSGraph.destroy(containerId);
      delete ctx.graphDrawCache[containerId];
    }
    if (!cy) {
      el.classList.add("is-empty");
      ph.hidden = false;
      ph.textContent = loading ? (nodes[0]?.data?.label || "Loading…") : emptyMessage;
    } else {
      el.classList.remove("is-empty");
      ph.hidden = true;
    }
    return cy;
  }

  function switchWorldGraphTab(tab) {
    ctx.worldGraphTab = tab;
    document.querySelectorAll("[data-world-graph-tab]").forEach(btn => {
      btn.classList.toggle("is-active", btn.dataset.worldGraphTab === tab);
    });
    const legend = document.getElementById("world-graph-legend");
    if (legend) legend.innerHTML = ctx.worldGraphLegendHtml(tab);
    ctx.drawGraphs();
  }

  async function drawGraphs() {
    if (!window.FOSGraph) return;
    try {
      if (window.FOSVendors) await window.FOSVendors.ensure(["cytoscape"]);
    } catch (e) {
      console.warn("cytoscape load failed:", e);
      return;
    }
    if (ctx.currentView === "dashboard" && ctx.state._runtimeGraph) {
      ctx.renderGraphOrPlaceholder(
        "graph-runtime-dash",
        ctx.state._runtimeGraph,
        { layout: { name: "breadthfirst", directed: true, padding: 20 } },
        "Runtime graph appears when an agent is active.",
      );
    }
    if (ctx.currentView === "agents" && ctx.state._runtimeGraph) {
      if (document.getElementById("graph-runtime-agents")) {
        ctx.renderGraphOrPlaceholder(
          "graph-runtime-agents",
          ctx.state._runtimeGraph,
          { layout: { name: "breadthfirst", directed: true, padding: 16 } },
          "Runtime graph appears when an agent is active.",
        );
      }
    }
    if (ctx.currentView === "chat" && ctx.state._runtimeGraph && document.getElementById("graph-runtime-chat")) {
      ctx.renderGraphOrPlaceholder(
        "graph-runtime-chat",
        ctx.state._runtimeGraph,
        { layout: { name: "breadthfirst", directed: true, padding: 16 } },
        "Runtime graph appears when an agent is active.",
      );
    }
    if (ctx.currentView === "world") {
      const selected = ctx.worldById(ctx.inspectorWorldId());
      if (ctx.worldGraphTab === "vault" && !ctx.isRootWorld(selected)) {
        ctx.renderGraphOrPlaceholder(
          "graph-world",
          ctx.vaultGraphForWorld(selected),
          {
            layout: FOSGraph.HIERARCHY_LAYOUT,
            onSelect: (d) => {
              if (d.facet_id) {
                ctx.state.ui = { ...(ctx.state.ui || {}), vaultFacet: d.facet_id };
                ctx.patchWorldPanels();
              }
            },
          },
          "No files yet — add documents or link a GitHub repo in the knowledge panel below.",
        );
      } else {
        const graph = ctx.worldGraphTab === "ecosystem"
          ? ctx.state._worldGraph
          : (ctx.state._worldHierarchyGraph || ctx.state._worldGraph);
        if (graph) {
          ctx.renderGraphOrPlaceholder(
            "graph-world",
            graph,
            {
              layout: ctx.worldGraphTab === "hierarchy" ? FOSGraph.HIERARCHY_LAYOUT : FOSGraph.LAYOUT,
              onSelect: (d) => {
                if (d.world_id) ctx.selectInspectorWorld(d.world_id);
              },
            },
            "World map will appear once your hierarchy is loaded.",
          );
          window.FOSGraph?.highlightWorld("graph-world", ctx.inspectorWorldId(), ctx.currentWorldId());
        } else {
          ctx.renderGraphOrPlaceholder("graph-world", null, {}, "World map will appear once your hierarchy is loaded.");
        }
      }
    }
    if (ctx.currentView === "memory" && ctx.state._memoryGraph) {
      ctx.renderGraphOrPlaceholder(
        "graph-memory",
        ctx.state._memoryGraph,
        {
          onSelect: (d) => {
            const el = ctx.$("#graph-memory-detail");
            if (el) el.textContent = `${d.type}: ${d.label}`;
          },
        },
        "Memory graph fills in as you store knowledge and run agents.",
      );
    }
  }

  async function loadGraphData() {
    const view = ctx.currentView;
    const needsRuntime = ["dashboard", "agents", "chat", "world"].includes(view);
    if (needsRuntime && !ctx.state._runtimeGraph) {
      try {
        ctx.state._runtimeGraph = await ctx.api("/graph/runtime");
      } catch (_) {
        ctx.state._runtimeGraph = null;
      }
    }
    if (view === "world") {
      if (!ctx.state._worldFull?.graph) {
        try {
          const w = await ctx.api("/graph/world");
          ctx.state._worldGraph = w?.graph ?? null;
          ctx.state._worldHierarchyGraph = w?.hierarchy_graph ?? null;
          ctx.state._worldPreviews = w?.world_previews ?? {};
          ctx.state._worldFull = w;
          ctx.invalidateGraphCache("graph-world");
        } catch (_) { /* keep prior graph */ }
      }
    } else if (view === "dashboard" && ctx.state._world) {
      ctx.state._worldGraph = ctx.state._world.graph ?? ctx.state._worldGraph ?? null;
      if (ctx.state._world.worlds && !ctx.state.worlds?.root) ctx.state.worlds = ctx.state._world.worlds;
    }
    if (view === "memory") {
      if (!ctx.state._memoryFull?.graph) {
        try {
          const m = await ctx.api("/graph/memory");
          ctx.state._memoryGraph = m.graph ?? null;
          ctx.state._memoryFull = m;
          ctx.invalidateGraphCache("graph-memory");
        } catch (_) { /* keep prior graph */ }
      }
    }
  }

  ctx.clearVaultScopedState = clearVaultScopedState;
  ctx.vaultPayload = vaultPayload;
  ctx.vaultReadyFor = vaultReadyFor;
  ctx.graphDataSignature = graphDataSignature;
  ctx.invalidateGraphCache = invalidateGraphCache;
  ctx.renderGraphOrPlaceholder = renderGraphOrPlaceholder;
  ctx.switchWorldGraphTab = switchWorldGraphTab;
  ctx.drawGraphs = drawGraphs;
  ctx.loadGraphData = loadGraphData;
}
