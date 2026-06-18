/**
 * Nawab OS dashboard — modular entry point.
 * Source modules live under ./ ; legacy monolith: ../app.js
 */
import { registerDom } from "./core/dom.js";
import { registerFormat } from "./core/format.js";
import { registerStorage } from "./core/storage.js";
import { registerConstants } from "./core/constants.js";
import { registerApi } from "./core/api.js";
import { registerGlobals } from "./state/globals.js";
import { registerStateWorld } from "./state/world.js";
import { registerUiLoading } from "./ui/loading.js";
import { registerFeaturesGraphs } from "./features/graphs.js";
import { registerFeaturesLive } from "./features/live.js";
import { registerFeaturesOps } from "./features/ops.js";
import { registerFeaturesMdEditor } from "./features/md-editor.js";
import { registerViewsDashboard } from "./views/dashboard.js";
import { registerViewsChat } from "./views/chat.js";
import { registerViewsDocuments } from "./views/documents.js";
import { registerViewsAgents } from "./views/agents.js";
import { registerViewsWorld } from "./views/world.js";
import { registerViewsCrm } from "./views/crm.js";
import { registerViewsOutreach } from "./views/outreach.js";
import { registerViewsGoals } from "./views/goals.js";
import { registerViewsMemory } from "./views/memory.js";
import { registerViewsHistory } from "./views/history.js";
import { registerViewsApprovals } from "./views/approvals.js";
import { registerViewsTools } from "./views/tools.js";
import { registerViewsActivity } from "./views/activity.js";
import { registerViewsSettings } from "./views/settings.js";
import { registerShellMisc } from "./shell/misc.js";
import { registerShellData } from "./shell/data.js";
import { registerShellNavigation } from "./shell/navigation.js";
import { registerShellEvents } from "./shell/events.js";
import { registerRender } from "./shell/render.js";
import { registerShellBoot } from "./shell/boot.js";
import { registerRouter } from "./shell/router.js";
import { wireDomListeners } from "./shell/init.js";

const ctx = {};

function registerAll() {
  registerDom(ctx);
  registerFormat(ctx);
  registerStorage(ctx);
  registerConstants(ctx);
  registerGlobals(ctx);
  registerApi(ctx);
  registerStateWorld(ctx);
  registerUiLoading(ctx);
  registerFeaturesLive(ctx);
  registerFeaturesGraphs(ctx);
  registerFeaturesOps(ctx);
  registerFeaturesMdEditor(ctx);
  registerViewsDashboard(ctx);
  registerViewsChat(ctx);
  registerViewsDocuments(ctx);
  registerViewsAgents(ctx);
  registerViewsWorld(ctx);
  registerViewsCrm(ctx);
  registerViewsOutreach(ctx);
  registerViewsGoals(ctx);
  registerViewsMemory(ctx);
  registerViewsHistory(ctx);
  registerViewsApprovals(ctx);
  registerViewsTools(ctx);
  registerViewsActivity(ctx);
  registerViewsSettings(ctx);
  registerShellMisc(ctx);
  registerShellData(ctx);
  registerShellNavigation(ctx);
  registerShellEvents(ctx);
  registerRender(ctx);
  registerShellBoot(ctx);
  registerRouter(ctx);
}

registerAll();
ctx.initRouter();
wireDomListeners(ctx);

// Legacy globals for enhance.js and deferred scripts
window.__FOS = ctx;
Object.defineProperty(window, "currentView", {
  get: () => ctx.currentView,
  set: v => { ctx.currentView = v; },
});
window.drawGraphs = (...a) => ctx.drawGraphs(...a);
window.drawDashboardCharts = (...a) => ctx.drawDashboardCharts(...a);
window.render = (...a) => ctx.render(...a);

ctx.boot();
ctx.scheduleBackgroundRefresh();
