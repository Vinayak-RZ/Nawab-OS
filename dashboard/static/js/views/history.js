/** @module views/history — auto-split from app.js */
export function registerViewsHistory(ctx) {
  function renderHistoryMessageContent(m) {
    const content = m.content || "";
    if (m.role === "agent" || m.role === "assistant") {
      const md = window.FOSMarkdown?.render?.(content) || ctx.esc(content);
      return `<div class="msg-md history-msg__body">${md}</div>`;
    }
    return `<p class="body-md history-msg__body">${ctx.esc(content)}</p>`;
  }

  function renderHistory() {
    const hist = ctx.state._history || {};
    const sessions = hist.sessions || [];
    const artifacts = ctx.state._artifacts || [];
    const selected = ctx.state._historySession;
    const tab = ctx.historyTab;
    const sessionsHtml = sessions.length ? sessions.map(s => `
      <button type="button" class="history-session${selected?.id === s.id ? " is-active" : ""}" data-history-session="${ctx.esc(s.id)}">
        <span class="history-session__title">${ctx.esc(s.title || "Conversation")}</span>
        <span class="history-session__meta muted">${ctx.esc(s.specialist || "supervisor")} · ${s.message_count || 0} msgs · ${ctx.fmtHistoryTime(s.updated_at)}</span>
      </button>`).join("") : "<p class='body-md muted'>No conversations yet. Ask the agent something to start a session.</p>";
  
    let detailHtml = "<p class='body-md muted'>Select a conversation to view messages, runs, and linked documents.</p>";
    if (selected?.messages?.length) {
      const msgs = selected.messages.map(m => `
        <div class="history-msg history-msg--${ctx.esc(m.role)}">
          <span class="caption-uppercase">${ctx.esc(m.role)}</span>
          ${ctx.renderHistoryMessageContent(m)}
          <span class="muted" style="font-size:11px">${ctx.fmtHistoryTime(m.created_at)}</span>
        </div>`).join("");
      const runs = (selected.runs || []).map(r => `
        <article class="history-run">
          <div class="history-run__head">
            <span class="mono">${ctx.esc(r.specialist || r.actor || "agent")}</span>
            <span class="muted">${r.duration_s || 0}s</span>
          </div>
          ${ctx.renderLiveFlow((r.tools || []).map(t => ({ name: t.name, decision: t.decision, t: t.t })), "No tools")}
          ${r.assistant_reply ? `<div class="history-run__reply msg-md">${window.FOSMarkdown?.render?.(r.assistant_reply) || ctx.esc(r.assistant_reply)}</div>` : ""}
        </article>`).join("") || "";
      const arts = (selected.artifacts || []).map(a => `
        <button type="button" class="history-doc-btn" data-open-document="${a.id}">
          <span class="badge-pill">${ctx.esc(a.kind)}</span>
          <span>${ctx.esc(a.title)}</span>
        </button>`).join("") || "<p class='muted'>No documents in this session.</p>";
      detailHtml = `
        <div class="history-detail__actions">
          <button type="button" class="button-primary button-sm" data-open-chat-session="${ctx.esc(selected.id)}">Open in chat</button>
          <button type="button" class="button-outline-on-dark button-sm" data-new-chat-session>New conversation</button>
        </div>
        <p class="caption-uppercase" style="margin-top:var(--space-sm)">Messages</p>
        <div class="history-messages">${msgs}</div>
        ${runs ? `<p class="caption-uppercase" style="margin-top:var(--space-md)">Runs</p>${runs}` : ""}
        <p class="caption-uppercase" style="margin-top:var(--space-md)">Documents</p>
        <div class="history-artifacts">${arts}</div>`;
    }
  
    const documentsHtml = artifacts.length ? artifacts.map(a => `
      <article class="history-doc-card" tabindex="0" data-open-document="${a.id}">
        <div class="history-doc-card__head">
          <span class="badge-pill">${ctx.esc(a.kind)}</span>
          <span class="muted">${ctx.fmtHistoryTime(a.created_at)}</span>
        </div>
        <h3 class="title-sm">${ctx.esc(a.title || "Untitled")}</h3>
        ${a.run_id ? `<p class="world-meta">Run ${ctx.esc(a.run_id)}</p>` : ""}
        <span class="history-doc-card__open">Open in workspace</span>
      </article>`).join("") : "<p class='body-md muted'>No agent documents yet. Markdown files and charts created by agents appear here.</p>";
  
    return `
      <header class="driver-card history-header">
        <div>
          <p class="section-eyebrow">Agent ledger</p>
          <h2 class="title-md">History</h2>
          <p class="body-md muted">Persistent conversations, runs, and documents created by agents.</p>
        </div>
      </header>
      <div class="graph-tabs">
        <button type="button" class="graph-tab ${tab === "conversations" ? "is-active" : ""}" data-history-tab="conversations">Conversations</button>
        <button type="button" class="graph-tab ${tab === "documents" ? "is-active" : ""}" data-history-tab="documents">Documents</button>
      </div>
      ${tab === "conversations" ? `<div class="history-layout">
        <section class="driver-card history-sessions">${sessionsHtml}</section>
        <section class="driver-card history-detail">${detailHtml}</section>
      </div>` : `<section class="driver-card history-documents-grid">${documentsHtml}</section>`}`;
  }

  async function loadHistorySession(sessionId) {
    ctx.state._historySelectedId = sessionId;
    try {
      ctx.state._historySession = await ctx.api(`/history/sessions/${sessionId}`);
    } catch (_) {
      ctx.state._historySession = null;
    }
    ctx.render();
  }

  ctx.renderHistoryMessageContent = renderHistoryMessageContent;
  ctx.renderHistory = renderHistory;
  ctx.loadHistorySession = loadHistorySession;
}
