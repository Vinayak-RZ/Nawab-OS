#!/usr/bin/env node
/**
 * Split dashboard/static/app.js into registry modules (ctx injection pattern).
 * Usage: node scripts/build-js-modules.mjs
 */
import fs from "fs";
import path from "path";

const SRC = path.resolve("dashboard/static/app.js");
const OUT = path.resolve("dashboard/static/js");

const SKIP_FUNCTIONS = new Set([
  "readJsonStorage", "sleep", "api", "apiUpload", "esc", "fmtMoney", "fmtTime",
  "$", "$$", "loadSelectedSpecialist",
]);

const MODULE_RULES = [
  { re: /^(renderCrm|loadCrm|submitCrm|importCrm|openCrm|pollCrm|approveCrm|skipCrm|crmTab|crmOutreach|scheduleCrm|updateCrm|saveCrm|renderWorldOptionsForCrm)/, mod: "views/crm" },
  { re: /^(renderWorld|loadWorld|worldById|inspectorWorldId|selectInspector|patchWorld|reloadWorld|renderVault|renderGithub|submitVault|startVault|deleteVault|ensureVault|vaultIngest|vaultLink|vaultSearch|vaultGraph|buildVault|findReadme|countGithub|tagVault|onWorldContext|isRootWorld|renderWorldTree|renderWorldInspector|renderWorldCreate|saveWorld|submitWorld|createWorld|deleteWorld|editWorld|WORLD_KINDS|worldGraph|patchWorldTree|reloadVault|connectGithub|syncGithub|unlinkGithub|githubRepo|renderGithubTree)/, mod: "views/world" },
  { re: /^(renderChat|sendChat|chatSession|setChatSession|applyChatSession|loadChat|renderMessage|msgRead|msgExpand|initMsgRead|renderArtifactLinks|renderChatSessions|openMdEditor|renderChatAttachment|openVaultAttach|pollAgentJob|patchChatJob|startAgentJob|cancelActiveJob|animateLatestChat|chatPayload|togglePause|logoutPin)/, mod: "views/chat" },
  { re: /^(renderDocument|saveDocument|selectDocument|uploadDocument|createNewDocument|isMarkdownFilename|openDocuments|renderWorldOptionsForDocs|saveCurrentDocument)/, mod: "views/documents" },
  { re: /^(renderAgent|renderFleet|renderSupervisor|delegateAgent|agentsVault|selectSpecialist|populateSpecialist|listSpecialists|supervisorMeta|routingLabel|routingMeta|agentBusy|agentRole|agentAvatar|lastRunForAgent|collectAgentRuns|persistAgentRun|patchAgentsVault)/, mod: "views/agents" },
  { re: /^(renderDashboard|drawDashboard|chartPanelNote|renderUpNext|handleNudge|renderOperator|openOperator)/, mod: "views/dashboard" },
  { re: /^(renderHistory|loadHistory)/, mod: "views/history" },
  { re: /^(renderSettings|pollWhatsapp|stopWhatsapp|startWhatsapp|refreshInfra|renderInfrastructure|saveAgentConfig)/, mod: "views/settings" },
  { re: /^(renderGoals|submitGoal|markGoal|submitReminder|updateReminder)/, mod: "views/goals" },
  { re: /^(renderMemory|searchMemory)/, mod: "views/memory" },
  { re: /^(renderApprovals|renderApproval|decideApproval)/, mod: "views/approvals" },
  { re: /^(renderTools)/, mod: "views/tools" },
  { re: /^(renderActivity)/, mod: "views/activity" },
  { re: /^(drawGraphs|loadGraphData|renderGraph|buildVaultGraph|vaultGraphFor|switchWorldGraph|graphDataSignature|invalidateGraphCache|clearVaultScoped|vaultPayload|vaultReady)/, mod: "features/graphs" },
  { re: /^(pollLive|startLivePoll|stopLivePoll|patchLiveUI|updateLiveStrip|renderLive)/, mod: "features/live" },
  { re: /^(renderViewSkeleton|skeletonLine|skeletonCard|setViewLoading|beginActionBusy|endActionBusy|runWithActionBusy|shouldSkipActionBusy)/, mod: "ui/loading" },
  { re: /^(renderOpsStack|runGithubSync|resumeActiveSync|isLinkSyncing)/, mod: "features/ops" },
  { re: /^(openVaultDocViewer|saveMdEditor|initMdEditor|resetMdEditor)/, mod: "features/md-editor" },
  { re: /^(showPinGate|hidePinGate|fetchAuthStatus|bindPinGate|applyBootUrlParams|startApp|boot|showBootError)/, mod: "shell/boot" },
  { re: /^(goView|afterRender|renderNotifications|openNotification|syncMobileNav|openSidebar|closeMobileShell|updateBadges|updateStatus|setConnectionStatus|mobilePrimaryViews)/, mod: "shell/navigation" },
  { re: /^(refresh|loadViewData|loadBootExtras|scheduleBackground)/, mod: "shell/data" },
  { re: /^(initContentDelegation)/, mod: "shell/events" },
  { re: /^(render|animateLatestChatMessage)/, mod: "shell/render" },
  { re: /^(populateWorldSelect|populateSpecialist|renderRagMode|activeWorldLabel|setActiveWorld|syncWorldSelect|updateWorldContext|currentWorldId|currentRagMode|currentSpecialist|ownerLabel|isDirectSpecialist)/, mod: "state/world" },
];

const CTX_PROPS = [
  "state", "currentView", "chatHistory", "historyTab", "documentsEditMode", "mdEditorState",
  "memoryGraphTab", "worldGraphTab", "viewDataLoadGen", "vaultLoadGen", "graphDrawCache",
  "livePollTimer", "whatsappPollTimer", "lastLiveActive", "_runtimePollTick",
  "actionBusyDepth", "actionBusyButton", "refreshTimer",
];

const CTX_CONSTS = [
  "APP_NAME", "DEFAULT_SPECIALISTS", "RAG_MODES", "TITLES", "CRM_STATUSES", "COMPANY_STATUSES",
  "CHART_COLORS", "AGENT_ROLES", "AGENT_INITIALS", "MSG_READ_INITIAL_LINES", "MSG_READ_EXPAND_LINES",
  "LIVE_POLL_MS", "LIVE_POLL_HIDDEN_MS", "REFRESH_MS", "WORLD_KINDS",
];

const CTX_METHODS = [
  "api", "apiUpload", "esc", "fmtMoney", "fmtTime", "sleep", "readJsonStorage",
  "render", "goView", "afterRender", "refresh", "loadViewData", "loadCrmData",
  "currentWorldId", "activeWorldLabel", "setActiveWorld", "syncWorldSelectValue",
  "updateWorldContextChrome", "currentSpecialistId", "currentRagMode", "ownerLabel",
  "isDirectSpecialist", "populateWorldSelect", "populateSpecialistSelect", "renderRagModeSelect",
  "drawGraphs", "drawDashboardCharts", "setViewLoading", "showPinGate", "loadGraphData",
  "clearVaultScopedState", "invalidateGraphCache", "patchWorldPanels", "patchAgentsVaultPanel",
  "onWorldContextChanged", "reloadVault", "ensureVaultForWorld", "inspectorWorldId",
  "selectInspectorWorld", "worldById", "isRootWorld", "startLivePoll", "stopLivePoll",
  "initMsgReadMore", "initContentDelegation", "initMdEditorDialog", "decorateNavIcons",
  "loadChatFromServer", "loadChatSessionsList", "setChatSessionId", "chatSessionId",
  "submitCrmContact", "submitCrmCompany", "importCrmCompaniesFromContacts", "openCrmCompanyDetail",
  "submitCrmOutreach", "openCrmCampaignReview", "closeCrmCampaignReview", "pollCrmOutreachJob",
  "approveCrmDraft", "skipCrmDraft", "skipCrmCompany", "saveCrmDraftEdits",
  "scheduleCrmFollowup", "loadCrmWaThread", "updateCrmStatus", "updateCrmWhatsapp",
  "searchMemory", "togglePause", "delegateAgent", "agentsVaultSearch",
  "decideApproval", "selectSpecialist", "loadHistorySession", "sendChat",
  "openOperatorAction", "refreshInfraHealth", "logoutPin", "markGoalDone",
  "submitGoal", "submitReminder", "saveAgentConfig", "saveWorldEdit", "submitVaultDoc",
  "deleteWorld", "vaultIngest", "vaultLinkRepo", "vaultSearch", "reloadVaultFromServer",
  "startVaultDocEdit", "deleteVaultDoc", "connectGithubRepo", "syncGithubRepo", "unlinkGithubRepo",
  "handleNudgeAction", "tagVaultDocInChat", "openVaultAttachPicker", "openVaultDocViewer",
  "updateReminderStatus", "openNotificationAction", "patchWorldTreeNav", "reloadWorldTree",
  "createWorld", "submitWorldCreate", "saveCurrentDocument", "saveDocumentToMemory",
  "selectDocument", "uploadDocumentFile", "createNewDocument", "openDocumentsWorkspace",
];

function assignMod(name) {
  if (SKIP_FUNCTIONS.has(name)) return null;
  for (const { re, mod } of MODULE_RULES) {
    if (re.test(name)) return mod;
  }
  return "shell/misc";
}

function parseFunctions(source) {
  const lines = source.split("\n");
  const fns = [];
  const fnRe = /^(async )?function (\w+)\s*\(/;
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(fnRe);
    if (!m) continue;
    const name = m[2];
    let depth = 0;
    let started = false;
    const body = [];
    for (let j = i; j < lines.length; j++) {
      const line = lines[j];
      for (const ch of line) {
        if (ch === "{") { depth++; started = true; }
        else if (ch === "}") depth--;
      }
      body.push(line);
      if (started && depth === 0) {
        fns.push({ name, body: body.join("\n") });
        i = j;
        break;
      }
    }
  }
  return fns;
}

function toCtxRefs(code) {
  const lines = code.split("\n");
  const head = lines[0];
  let body = lines.slice(1).join("\n");
  body = body.replace(/\$\$\(/g, "ctx.$$(");
  body = body.replace(/(?<!\$)\$\(/g, "ctx.$(");
  for (const m of [...CTX_METHODS_ALL].sort((a, b) => b.length - a.length)) {
    if (m === "$" || m === "$$") continue;
    const re = new RegExp(`(?<![.\\w])${m}\\(`, "g");
    body = body.replace(re, `ctx.${m}(`);
  }
  for (const p of CTX_PROPS) {
    const re = new RegExp(`(?<![.\\w])${p}\\b`, "g");
    body = body.replace(re, `ctx.${p}`);
  }
  for (const c of CTX_CONSTS) {
    const re = new RegExp(`(?<![.\\w])${c}\\b`, "g");
    body = body.replace(re, `ctx.${c}`);
  }
  body = body.replace(/ctx\.ctx\./g, "ctx.");
  return head + "\n" + body;
}

const source = fs.readFileSync(SRC, "utf8");
const fns = parseFunctions(source);
const ALL_FN_NAMES = fns.map(f => f.name);
const CTX_METHODS_ALL = [...new Set([...CTX_METHODS, ...ALL_FN_NAMES])].filter(n => n !== "$" && n !== "$$");
const byMod = new Map();

for (const fn of fns) {
  const mod = assignMod(fn.name);
  if (!mod) continue;
  if (!byMod.has(mod)) byMod.set(mod, []);
  byMod.get(mod).push(fn);
}

// Preserve hand-written core + globals
const preserve = new Set([
  path.join(OUT, "core/dom.js"),
  path.join(OUT, "core/format.js"),
  path.join(OUT, "core/storage.js"),
  path.join(OUT, "core/constants.js"),
  path.join(OUT, "core/api.js"),
  path.join(OUT, "state/globals.js"),
  path.join(OUT, "shell/render.js"),
  path.join(OUT, "shell/init.js"),
  path.join(OUT, "main.js"),
]);

for (const [mod, list] of byMod) {
  const filePath = path.join(OUT, `${mod}.js`);
  if (preserve.has(filePath)) continue;
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  const regName = "register" + mod.split("/").map(s =>
    s.replace(/-([a-z])/g, (_, c) => c.toUpperCase()).replace(/^./, c => c.toUpperCase())
  ).join("");
  const bodies = list.map(fn => "  " + toCtxRefs(fn.body).replace(/\n/g, "\n  "));
  const assigns = list.map(fn => `  ctx.${fn.name} = ${fn.name};`).join("\n");
  const content = `/** @module ${mod} — auto-split from app.js */\nexport function ${regName}(ctx) {\n${bodies.join("\n\n")}\n\n${assigns}\n}\n`;
  fs.writeFileSync(filePath, content);
}

console.log("Built modules:", [...byMod.keys()].sort().map(k => `${k}(${byMod.get(k).length})`).join(", "));
