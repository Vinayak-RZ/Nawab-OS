/** Mutable application state and module-level variables */
export function registerGlobals(ctx) {
  function loadSelectedSpecialist() {
    const stored = localStorage.getItem("fos_selected_specialist");
    if (stored !== null) return stored;
    const legacy = localStorage.getItem("fos_selected_agent");
    if (legacy && legacy !== "supervisor") return legacy;
    return "";
  }

  ctx.state = {
    live: {},
    selectedSpecialist: loadSelectedSpecialist(),
    ragMode: localStorage.getItem("fos_rag_mode") || "auto",
    activeWorldId: localStorage.getItem("fos_active_world") || "root",
    agentsTab: localStorage.getItem("fos_agents_tab") || "runs",
    expandedRunId: null,
    ui: {
      worldCreateOpen: false,
      crmFormOpen: false,
      goalsFormOpen: false,
      reminderFormOpen: false,
      vaultFacet: null,
      vaultDocForm: null,
      vaultDocEdit: null,
    },
    _worldTemplates: null,
    _operations: {},
    _chatAttachments: [],
  };
  ctx.state._syncingLinkIds = new Set();

  ctx.currentView = "dashboard";
  ctx.chatHistory = ctx.readJsonStorage("fos_chat", []);
  ctx.historyTab = localStorage.getItem("fos_history_tab") || "conversations";
  ctx.documentsEditMode = false;
  ctx.mdEditorState = { mode: null, artifactId: null, worldId: null, docId: null, editMode: false };
  ctx.livePollTimer = null;
  ctx._runtimePollTick = 0;
  ctx.whatsappPollTimer = null;
  ctx.memoryGraphTab = "graph";
  ctx.worldGraphTab = "hierarchy";
  ctx.lastLiveActive = false;
  ctx.viewDataLoadGen = 0;
  ctx.vaultLoadGen = 0;
  ctx.graphDrawCache = {};
  ctx.actionBusyDepth = 0;
  ctx.actionBusyButton = null;
  ctx.refreshTimer = null;

  ctx.loadSelectedSpecialist = loadSelectedSpecialist;
}
