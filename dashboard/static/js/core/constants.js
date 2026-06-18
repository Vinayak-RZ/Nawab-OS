/** App-wide constants */
export const APP_NAME = "Nawab OS";

export const DEFAULT_SPECIALISTS = [
  { id: "pulse", label: "Pulse", role: "aggregator", tool_count: 0, brief: "Operating pulse across parallel projects" },
  { id: "outreach", label: "Outreach", role: "outreach", tool_count: 0, brief: "Outreach drafts and CRM pipeline" },
  { id: "leads", label: "Leads", role: "leads", tool_count: 0, brief: "Lead lists and contact priorities" },
  { id: "market", label: "Market intel", role: "research", tool_count: 0, brief: "Industry and competitor intelligence" },
  { id: "vault", label: "Vault", role: "knowledge", tool_count: 0, brief: "Knowledge vault librarian" },
];

export const RAG_MODES = [
  { id: "auto", label: "Auto", hint: "Agent picks retrieval" },
  { id: "hybrid", label: "Hybrid RAG", hint: "Dense + BM25 fusion" },
  { id: "graphrag", label: "GraphRAG", hint: "Knowledge graph communities" },
  { id: "vault", label: "Vault", hint: "World knowledge vault" },
  { id: "documents", label: "Documents", hint: "Ingested document store" },
];

export const TITLES = {
  dashboard: "Control center",
  chat: "Ask agent",
  agents: "Agent fleet",
  world: "Worlds",
  approvals: "Approvals",
  crm: "CRM & pipeline",
  outreach: "Outreach",
  goals: "Goals & tasks",
  memory: "Memory",
  documents: "Documents",
  history: "History",
  tools: "Tools",
  activity: "Activity",
  settings: "Settings",
};

export const CRM_STATUSES = ["prospect", "contacted", "replied", "meeting", "won", "lost", "nurture"];
export const COMPANY_STATUSES = ["prospect", "contacted", "responded", "meeting_set", "closed", "dead"];
export const CHART_COLORS = ["#f75440", "#00666b", "#03904a", "#051f13", "#5a403c", "#8f706b", "#e3beb8"];

export const MSG_READ_INITIAL_LINES = 15;
export const MSG_READ_EXPAND_LINES = 30;
export const LIVE_POLL_MS = 5000;
export const LIVE_POLL_HIDDEN_MS = 30000;
export const REFRESH_MS = 30000;

export const AGENT_ROLES = {
  aggregator: { label: "Aggregator", cls: "agent-role--aggregator", avatar: "agent-avatar--aggregator" },
  outreach: { label: "Outreach", cls: "agent-role--outreach", avatar: "agent-avatar--outreach" },
  leads: { label: "Leads", cls: "agent-role--leads", avatar: "agent-avatar--leads" },
  research: { label: "Intel", cls: "agent-role--research", avatar: "agent-avatar--research" },
  knowledge: { label: "Vault", cls: "agent-role--vault", avatar: "agent-avatar--knowledge" },
};

export const AGENT_INITIALS = {
  supervisor: "SV",
  pulse: "PL",
  outreach: "OR",
  leads: "LD",
  market: "MK",
  vault: "VL",
};

export const WORLD_KINDS = {
  root: { label: "Main", cls: "world-kind--root" },
  project: { label: "Startup", cls: "world-kind--project" },
  startup: { label: "Startup", cls: "world-kind--project" },
  technical: { label: "Technical", cls: "world-kind--research" },
  idea: { label: "Idea", cls: "world-kind--idea" },
  research: { label: "Research", cls: "world-kind--research" },
};

export function registerConstants(ctx) {
  Object.assign(ctx, {
    APP_NAME, DEFAULT_SPECIALISTS, RAG_MODES, TITLES, CRM_STATUSES, COMPANY_STATUSES,
    CHART_COLORS, MSG_READ_INITIAL_LINES, MSG_READ_EXPAND_LINES, LIVE_POLL_MS,
    LIVE_POLL_HIDDEN_MS, REFRESH_MS, AGENT_ROLES, AGENT_INITIALS, WORLD_KINDS,
  });
}
