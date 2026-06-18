/** Client-side History API router — view ids map to canonical URL paths. */
export const VIEW_ROUTES = {
  dashboard: "/",
  chat: "/ask",
  agents: "/agents",
  world: "/worlds",
  crm: "/crm",
  outreach: "/outreach",
  goals: "/goals",
  memory: "/memory",
  documents: "/documents",
  history: "/history",
  approvals: "/approvals",
  tools: "/tools",
  activity: "/activity",
  settings: "/settings",
};

export const VALID_VIEWS = new Set(Object.keys(VIEW_ROUTES));

const LEGACY_PATH_TO_VIEW = {
  "/chat": "chat",
  "/control": "dashboard",
  "/dashboard": "dashboard",
};

const PATH_BY_VIEW = Object.fromEntries(
  Object.entries(VIEW_ROUTES).map(([view, path]) => [view, path])
);

export function normalizePathname(pathname) {
  if (!pathname || pathname === "/") return "/";
  return pathname.replace(/\/+$/, "") || "/";
}

export function pathToRoute(pathname) {
  const path = normalizePathname(pathname);

  const campaignMatch = path.match(/^\/outreach\/campaigns\/(\d+)(?:\/review)?$/);
  if (campaignMatch) {
    return {
      view: "outreach",
      params: { campaignId: parseInt(campaignMatch[1], 10) },
    };
  }
  if (path === "/outreach") {
    return { view: "outreach", params: {} };
  }

  if (LEGACY_PATH_TO_VIEW[path]) {
    const view = LEGACY_PATH_TO_VIEW[path];
    return { view, params: {}, redirect: PATH_BY_VIEW[view] };
  }

  for (const [view, routePath] of Object.entries(VIEW_ROUTES)) {
    if (routePath === path) return { view, params: {} };
  }

  return { view: "dashboard", params: {}, redirect: "/" };
}

export function routeToPath(view, params = {}) {
  if (view === "outreach" && params.campaignId) {
    return `/outreach/campaigns/${params.campaignId}`;
  }
  return PATH_BY_VIEW[view] || "/";
}

export function registerRouter(ctx) {
  let suppressPopstate = false;

  function applyRouteParams(view, params = {}) {
    ctx.routeParams = { ...params };
    if (view === "outreach") {
      if (!ctx.state.ui) ctx.state.ui = {};
      if (params.campaignId) {
        ctx.state.ui.crmCampaignId = params.campaignId;
      } else if (params.campaignId === null || params.campaignId === undefined) {
        if (!params.keepCampaign) ctx.state.ui.crmCampaignId = null;
      }
      if (params.companies?.length) {
        ctx.state.ui.crmOutreachSelected = params.companies.map(Number).filter(Boolean);
      }
    }
  }

  function updateRoute(view, params = {}, { replace = false } = {}) {
    if (!VALID_VIEWS.has(view)) view = "dashboard";
    const path = routeToPath(view, params);
    const search = window.location.search || "";
    const next = path + search;
    const current = window.location.pathname + search;
    if (next !== current) {
      const state = { view, params };
      if (replace) window.history.replaceState(state, "", next);
      else window.history.pushState(state, "", next);
    }
    applyRouteParams(view, params);
  }

  function syncRouteFromLocation({ replace = false } = {}) {
    const parsed = pathToRoute(window.location.pathname);
    if (parsed.redirect) {
      const search = window.location.search || "";
      window.history.replaceState({ view: parsed.view, params: parsed.params }, "", parsed.redirect + search);
    }
    applyRouteParams(parsed.view, parsed.params);
    ctx.currentView = parsed.view;
    return parsed;
  }

  function migrateLegacyStorage() {
    if (localStorage.getItem("fos_crm_tab") === "outreach") {
      localStorage.removeItem("fos_crm_tab");
      return { view: "outreach", params: {} };
    }
    return null;
  }

  function resolveBootRoute() {
    const params = new URLSearchParams(window.location.search);
    const legacyView = params.get("view");
    if (legacyView && VALID_VIEWS.has(legacyView)) {
      params.delete("view");
      const path = routeToPath(legacyView, {});
      const search = params.toString();
      const url = path + (search ? `?${search}` : "");
      window.history.replaceState({ view: legacyView, params: {} }, "", url);
      applyRouteParams(legacyView, {});
      ctx.currentView = legacyView;
      return { view: legacyView, params: {} };
    }

    const migrated = migrateLegacyStorage();
    if (migrated && window.location.pathname === "/") {
      const search = window.location.search || "";
      window.history.replaceState(migrated, "", routeToPath(migrated.view, migrated.params) + search);
      applyRouteParams(migrated.view, migrated.params);
      ctx.currentView = migrated.view;
      return migrated;
    }

    return syncRouteFromLocation({ replace: true });
  }

  function initRouter() {
    window.addEventListener("popstate", () => {
      if (suppressPopstate) return;
      const parsed = pathToRoute(window.location.pathname);
      applyRouteParams(parsed.view, parsed.params);
      ctx.goView(parsed.view, { skipUrl: true, params: parsed.params, fromPopstate: true });
    });
  }

  ctx.routeParams = {};
  ctx.pathToRoute = pathToRoute;
  ctx.routeToPath = routeToPath;
  ctx.updateRoute = updateRoute;
  ctx.syncRouteFromLocation = syncRouteFromLocation;
  ctx.resolveBootRoute = resolveBootRoute;
  ctx.applyRouteParams = applyRouteParams;
  ctx.initRouter = initRouter;
  ctx._routerSuppressPopstate = v => { suppressPopstate = v; };
}
