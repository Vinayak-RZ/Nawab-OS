/** @module views/chat — auto-split from app.js */
export function registerViewsChat(ctx) {
  function chatSessionId() {
    return localStorage.getItem("fos_chat_session") || "";
  }

  function setChatSessionId(id) {
    if (id) localStorage.setItem("fos_chat_session", id);
    else localStorage.removeItem("fos_chat_session");
  }

  function applyChatSessionResponse(res) {
    if (res?.session_id) ctx.setChatSessionId(res.session_id);
  }

  async function loadChatFromServer() {
    const sid = ctx.chatSessionId();
    if (!sid) return;
    try {
      const detail = await ctx.api(`/history/sessions/${sid}`);
      if (detail?.messages?.length) {
        ctx.chatHistory = detail.messages.map(m => ({
          role: m.role === "assistant" ? "agent" : m.role,
          text: m.content,
        }));
        localStorage.setItem("fos_chat", JSON.stringify(ctx.chatHistory));
      }
    } catch (_) {}
  }

  function chatPayload(extra = {}) {
    const payload = {
      world_id: ctx.currentWorldId(),
      rag_mode: ctx.currentRagMode(),
      session_id: ctx.chatSessionId() || undefined,
      specialist: ctx.currentSpecialistId() || undefined,
      ...extra,
    };
    const atts = (ctx.state._chatAttachments || []).filter(a => a?.doc_id);
    if (atts.length) {
      payload.attachments = atts.map(a => ({
        type: "vault",
        doc_id: a.doc_id,
        title: a.title,
        path: a.path,
      }));
    }
    return payload;
  }

  function renderMessageHtml(m) {
    if (m.pending) {
      return `<div class="msg-pending"><span class="live-pulse" aria-hidden="true"></span> ${ctx.esc(m.pendingLabel || "Agent working…")}</div>`;
    }
    const text = m.text || "";
    if (m.role === "agent" || m.role === "assistant") {
      const md = window.FOSMarkdown?.render?.(text) || ctx.esc(text);
      const arts = (m.artifacts || []).map(a =>
        `<button type="button" class="button-outline-on-dark button-sm md-artifact-btn" data-md-artifact="${a.id}">${ctx.esc(a.title || a.kind || "Document")}</button>`
      ).join("");
      return `<div class="msg-md">${md}</div>${arts ? `<div class="msg-artifacts">${arts}</div>` : ""}`;
    }
    return `<div class="msg-plain">${ctx.esc(text)}</div>`;
  }

  function msgExpandKey(scope, index) {
    return `msg:${scope}:${ctx.chatSessionId() || "default"}:${index}`;
  }

  function msgReadLineLimit(level) {
    if (level <= 0) return ctx.MSG_READ_INITIAL_LINES;
    if (level === 1) return ctx.MSG_READ_INITIAL_LINES + ctx.MSG_READ_EXPAND_LINES;
    return Infinity;
  }

  function initMsgReadMore(root) {
    const scope = root || document.getElementById("content");
    if (!scope) return;
    if (!ctx.state._msgExpand) ctx.state._msgExpand = {};
  
    scope.querySelectorAll(".msg-read-more-host").forEach(host => {
      const content = host.querySelector(":scope > .msg-md, :scope > .msg-plain");
      const btn = host.querySelector(".msg-read-more");
      if (!content || !btn) return;
  
      const msgScope = host.dataset.msgScope || "chat";
      const msgIndex = host.dataset.msgIndex ?? "0";
      const key = ctx.msgExpandKey(msgScope, msgIndex);
      const level = ctx.state._msgExpand[key] || 0;
      const lineHeight = parseFloat(getComputedStyle(content).lineHeight) || 21;
      const totalLines = Math.max(1, Math.round(content.scrollHeight / lineHeight));
      const maxLines = ctx.msgReadLineLimit(level);
  
      btn.dataset.msgReadMore = key;
      if (maxLines >= totalLines || level >= 2) {
        content.classList.remove("msg-body--clamped");
        content.style.maxHeight = "";
        btn.hidden = true;
        return;
      }
      content.classList.add("msg-body--clamped");
      content.style.maxHeight = `${maxLines * lineHeight}px`;
      btn.hidden = false;
      btn.textContent = "Read more";
    });
  }

  function renderArtifactLinks(artifacts) {
    if (!artifacts?.length) return "";
    return `<div class="msg-artifacts">${artifacts.map(a =>
      `<button type="button" class="button-outline-on-dark button-sm md-artifact-btn" data-md-artifact="${a.id}">${ctx.esc(a.title || a.kind || "File")}</button>`
    ).join("")}</div>`;
  }

  async function loadChatSessionsList() {
    const wid = ctx.currentWorldId();
    const q = wid && wid !== "root" ? `?world_id=${encodeURIComponent(wid)}` : "";
    try {
      const data = await ctx.api(`/history${q}`, { timeoutMs: 15000 });
      ctx.state._chatSessions = data.sessions || [];
    } catch (_) {
      ctx.state._chatSessions = ctx.state._chatSessions || [];
    }
  }

  function renderChatSessionsList() {
    const sessions = ctx.state._chatSessions || [];
    const active = ctx.chatSessionId();
    const items = sessions.map(s => `
      <button type="button" class="chat-session-chip${s.id === active ? " is-active" : ""}" data-chat-session="${ctx.esc(s.id)}">
        <span class="chat-session-chip__title">${ctx.esc(s.title || "Conversation")}</span>
        <span class="chat-session-chip__meta">${ctx.fmtHistoryTime(s.updated_at)}</span>
      </button>`).join("");
    return `<section class="chat-sessions-strip driver-card">
      <div class="chat-sessions-strip__head">
        <p class="caption-uppercase">Chats</p>
        <button type="button" class="button-primary button-sm" data-new-chat-session>+ New</button>
      </div>
      <div class="chat-sessions-strip__list">${items || "<span class='muted body-md'>No previous chats</span>"}</div>
    </section>`;
  }

  async function openMdEditor(artifactId) {
    ctx.openDocumentsWorkspace(artifactId);
  }

  function renderChatAttachmentChips() {
    const atts = ctx.state._chatAttachments || [];
    if (!atts.length) return "";
    return `<div class="chat-attachments">${atts.map((a, i) =>
      `<span class="chat-attachment-chip">
        <span>📎 ${ctx.esc(a.title || "File")}</span>
        <button type="button" class="chat-attachment-chip__remove" data-remove-attachment="${i}" aria-label="Remove attachment">×</button>
      </span>`
    ).join("")}</div>`;
  }

  async function openVaultAttachPicker() {
    const wid = ctx.currentWorldId();
    if (!wid || wid === "root") {
      alert("Select a project world (not Main) to attach vault documents.");
      return;
    }
    await ctx.ensureVaultForWorld(wid);
    const vault = ctx.vaultPayload() || {};
    const facets = vault.facets || vault.folders || [];
    const docs = [];
    for (const f of facets) {
      for (const d of f.documents || []) {
        if (ctx.isMarkdownFilename(d.filename || d.github_path)) docs.push(d);
      }
    }
    const list = ctx.$("#vault-picker-list");
    const dlg = ctx.$("#vault-picker-dialog");
    if (!list || !dlg) return;
    list.innerHTML = docs.length ? docs.map(d => `
      <button type="button" class="vault-picker-item" data-pick-vault-doc="${d.id}" data-world-id="${ctx.esc(wid)}" data-doc-title="${ctx.esc(d.title)}" data-doc-path="${ctx.esc(d.github_path || d.filename || "")}">
        <strong>${ctx.esc(d.title)}</strong>
        <span class="muted">${ctx.esc(d.github_path || d.filename || "")}</span>
      </button>`).join("") : "<p class='body-md muted'>No markdown docs in vault — link and sync a GitHub repo in Worlds.</p>";
    dlg.showModal();
  }

  async function pollAgentJob(jobId) {
    while (true) {
      const data = await ctx.api(`/chat/jobs/${encodeURIComponent(jobId)}`, { timeoutMs: 20000 });
      const job = data.job;
      if (!job) break;
      ctx.state._activeJob = job;
      ctx.patchLiveUI(ctx.state.live);
      ctx.patchChatJobBubble(job);
      if (["completed", "failed", "cancelled"].includes(job.status)) {
        return { job, pending_approvals: data.pending_approvals };
      }
      await ctx.sleep(1200);
    }
    return null;
  }

  function patchChatJobBubble(job) {
    const idx = ctx.chatHistory.findIndex(m => m.jobId === job.id);
    if (idx < 0) return;
    if (job.status === "running") {
      ctx.chatHistory[idx].pending = true;
      ctx.chatHistory[idx].pendingLabel = job.phase || "Agent working…";
    } else {
      ctx.chatHistory[idx].pending = false;
      ctx.chatHistory[idx].text = job.result || job.error || "(no response)";
      ctx.chatHistory[idx].artifacts = job.artifacts || [];
      if (job.session_id) ctx.setChatSessionId(job.session_id);
    }
    const el = ctx.$("#chat-messages");
    if (el && ctx.currentView === "chat") {
      el.innerHTML = ctx.renderChatMessagesInner();
      window.FOSMarkdown?.enhance?.(el);
      ctx.initMsgReadMore(el);
      el.scrollTop = el.scrollHeight;
    }
    ctx.updateLiveStrip({ active: job.status === "running", phase: job.phase });
    ctx.$("#chat-live-panel-phase, [id$='-phase']").forEach(n => {
      if (n) n.textContent = job.phase || "Idle";
    });
  }

  function renderChatMessagesInner() {
    const empty = !ctx.chatHistory.length;
    if (empty) return "";
    return ctx.chatHistory.map((m, i) => {
      if (m.pending) {
        return `<div class="msg ${m.role} is-pending"><div class="msg-bubble">${ctx.renderMessageHtml(m)}</div></div>`;
      }
      return `<div class="msg ${m.role}">
        <div class="msg-bubble msg-read-more-host" data-msg-scope="chat" data-msg-index="${i}">
          ${ctx.renderMessageHtml(m)}
          <button type="button" class="msg-read-more" hidden>Read more</button>
        </div>
      </div>`;
    }).join("");
  }

  async function startAgentJob(message, { direct = false, specId = "" } = {}) {
    const payload = ctx.chatPayload({ message });
    if (direct && specId) payload.specialist = specId;
    const started = await ctx.api("/chat/async", {
      method: "POST",
      body: JSON.stringify(payload),
      timeoutMs: 20000,
    });
    ctx.state._chatAttachments = [];
    const job = started.job;
    ctx.chatHistory.push({ role: "agent", text: "", pending: true, jobId: job.id, pendingLabel: job.phase || "Starting…" });
    localStorage.setItem("fos_chat", JSON.stringify(ctx.chatHistory));
    ctx.state._activeJob = job;
    ctx.render();
    ctx.startLivePoll();
    try {
      const done = await ctx.pollAgentJob(job.id);
      if (done?.job?.session_id) ctx.setChatSessionId(done.job.session_id);
      if (done?.pending_approvals) {
        ctx.state.approvals = done.pending_approvals;
        ctx.updateBadges();
      }
      localStorage.setItem("fos_chat", JSON.stringify(ctx.chatHistory));
      await ctx.loadChatSessionsList();
    } finally {
      ctx.state._activeJob = null;
      ctx.pollLive();
      if (ctx.currentView === "chat") ctx.render();
    }
  }

  async function cancelActiveJob(jobId) {
    const id = jobId || ctx.state._activeJob?.id;
    if (!id) return;
    try {
      await ctx.api(`/chat/jobs/${encodeURIComponent(id)}/cancel`, { method: "POST", timeoutMs: 10000 });
      if (ctx.state._activeJob?.id === id) {
        await ctx.pollAgentJob(id);
      } else {
        ctx.pollLive();
      }
    } catch (e) {
      alert(e.message);
    }
  }

  function renderChat() {
    const agents = ctx.state._agents || {};
    const meta = ctx.routingMeta(agents);
    const routeLabel = ctx.routingLabel(agents);
    const direct = ctx.isDirectSpecialist();
    const specs = ctx.listSpecialists(agents);
    const ragMode = ctx.state.ragMode || "auto";
    const ragMeta = ctx.RAG_MODES.find(m => m.id === ragMode) || ctx.RAG_MODES[0];
    const msgs = ctx.renderChatMessagesInner();
    const live = ctx.state.live || {};
    const empty = !ctx.chatHistory.length;
    const jobRunning = !!ctx.state._activeJob?.active || ctx.chatHistory.some(m => m.pending);
    const recentRuns = ctx.collectAgentRuns().slice(0, 4);
    return `<div class="chat-shell">
      <header class="chat-header driver-card">
        <div>
          <p class="section-eyebrow">Optional · agent assist</p>
          <h2 class="title-md">Ask agent</h2>
        </div>
        <div class="chat-header__meta">
          <span class="badge-pill" data-active-world-label>${ctx.esc(ctx.activeWorldLabel())}</span>
          <span class="badge-pill agent-routing-badge">${ctx.esc(routeLabel)}</span>
          ${jobRunning ? `<span class="badge-pill badge-pill--alert">Working</span>` : ""}
          <button type="button" class="button-outline-on-dark button-sm" data-goto="agents">Change specialist</button>
        </div>
      </header>
      ${ctx.renderChatSessionsList()}
      <div class="chat-layout chat-layout--rich">
        <div class="chat-wrap">
          <div class="chat-messages${empty ? " is-empty" : ""}" id="chat-messages">
            ${empty ? `<div class="chat-empty">
              <p class="title-md">Supervisor ready</p>
              <p class="body-md">Routing: <strong>${ctx.esc(routeLabel)}</strong> · Retrieval: <strong>${ctx.esc(ragMeta.label)}</strong></p>
              <div class="capability-strip chat-empty__chips">
                <button type="button" class="delegate-hint" data-goto="crm">CRM</button>
                <button type="button" class="delegate-hint" data-goto="goals">Goals</button>
                <button type="button" class="delegate-hint" data-goto="world">Vault / Worlds</button>
                <button type="button" class="delegate-hint" data-goto="documents">Documents</button>
                <button type="button" class="delegate-hint" data-goto="agents">Agents</button>
              </div>
            </div>` : msgs}
          </div>
          <div class="chat-composer driver-card">
            ${ctx.renderChatAttachmentChips()}
            <div class="chat-composer__controls">
              <label class="chat-control">
                <span class="caption-uppercase">Specialist</span>
                <select id="chat-specialist-select" class="world-select agent-select" aria-label="Specialist routing"></select>
              </label>
              ${ctx.renderRagModeSelect("rag-mode-select")}
            </div>
            <div class="chat-input-row">
              <textarea class="text-input-on-dark chat-input" id="chat-input" placeholder="${direct ? `Task for ${ctx.esc(meta.label)}…` : "Message supervisor…"}" rows="3"${jobRunning ? " disabled" : ""}></textarea>
              <button class="button-primary" id="chat-send"${jobRunning ? " disabled" : ""}>${direct ? `Run ${ctx.esc(meta.label)}` : "Send"}</button>
            </div>
            <div class="chat-toolbar">
              <label class="button-outline-on-dark button-sm upload-label">Upload<input type="file" id="chat-file" hidden accept=".pdf,.docx,.txt,.md,.csv,.json"></label>
              <button type="button" class="button-outline-on-dark button-sm" data-open-vault-picker>Attach vault</button>
              <button type="button" class="button-outline-on-dark button-sm" data-new-chat-session>New chat</button>
              ${jobRunning ? `<button type="button" class="button-outline-on-dark button-sm" data-cancel-active-job>Stop</button>` : ""}
              <button type="button" class="button-outline-on-dark button-sm" data-goto="world">Worlds</button>
            </div>
          </div>
          <section class="driver-card chat-runtime-panel">
            <p class="caption-uppercase">Runtime</p>
            <div id="graph-runtime-chat" class="graph-canvas graph-canvas--compact chat-runtime-panel__graph"></div>
          </section>
        </div>
        <aside class="chat-rail">
          ${ctx.renderLivePanel(live, "chat-live-panel")}
          <section class="driver-card chat-rail-card">
            <p class="caption-uppercase">Specialists</p>
            <div class="specialist-chips" style="margin-top:var(--space-xxs)">${specs.map(s =>
              `<span class="specialist-chip${ctx.currentSpecialistId() === s.id ? " is-selected" : ""}${ctx.agentBusy(live, s.id) ? " is-busy" : ""}">${ctx.esc(s.label)}</span>`
            ).join("")}</div>
          </section>
          ${recentRuns.length ? `<section class="driver-card chat-rail-card">
            <p class="caption-uppercase">Recent runs</p>
            <div class="activity-timeline">${recentRuns.map(r =>
              `<div class="activity-timeline__row"><span>${ctx.esc((r.agent || "").toUpperCase())}</span><span class="muted">${ctx.esc((r.task || "").slice(0, 40))}</span></div>`
            ).join("")}</div>
          </section>` : ""}
        </aside>
      </div>
    </div>`;
  }

  function animateLatestChatMessage() {
    requestAnimationFrame(() => {
      const msgs = ctx.$("#chat-messages")?.querySelectorAll(".msg:not(.system)");
      const last = msgs?.[msgs.length - 1];
      FOSMotion?.animateNewMessage?.(last);
    });
  }

  async function logoutPin() {
    try {
      await ctx.api("/auth/logout", { method: "POST", body: "{}" });
    } catch (_) { /* ignore */ }
    ctx.showPinGate();
  }

  async function sendChat() {
    const input = ctx.$("#chat-input");
    const text = (input?.value || "").trim();
    if (!text) return;
    if (ctx.chatHistory.some(m => m.pending)) return;
    const specId = ctx.currentSpecialistId();
    const meta = ctx.routingMeta(ctx.state._agents || {});
    const direct = !!specId;
    input.value = "";
    ctx.chatHistory.push({ role: "user", text });
    localStorage.setItem("fos_chat", JSON.stringify(ctx.chatHistory));
    ctx.render();
    ctx.animateLatestChatMessage();
    const btn = ctx.$("#chat-send");
    const btnLabel = direct ? `Run ${meta.label}` : "Send";
    if (btn) { btn.disabled = true; btn.textContent = "…"; }
    try {
      await ctx.startAgentJob(text, { direct, specId });
    } catch (e) {
      ctx.chatHistory.push({ role: "system", text: "Error: " + e.message });
      localStorage.setItem("fos_chat", JSON.stringify(ctx.chatHistory));
      ctx.render();
    }
    if (btn) { btn.disabled = false; btn.textContent = btnLabel; }
    ctx.animateLatestChatMessage();
  }

  async function togglePause() {
    const paused = !(ctx.state.config?.agent_paused);
    await ctx.api("/agent/pause", { method: "POST", body: JSON.stringify({ paused }) });
    await ctx.refresh();
    ctx.render();
  }

  ctx.chatSessionId = chatSessionId;
  ctx.setChatSessionId = setChatSessionId;
  ctx.applyChatSessionResponse = applyChatSessionResponse;
  ctx.loadChatFromServer = loadChatFromServer;
  ctx.chatPayload = chatPayload;
  ctx.renderMessageHtml = renderMessageHtml;
  ctx.msgExpandKey = msgExpandKey;
  ctx.msgReadLineLimit = msgReadLineLimit;
  ctx.initMsgReadMore = initMsgReadMore;
  ctx.renderArtifactLinks = renderArtifactLinks;
  ctx.loadChatSessionsList = loadChatSessionsList;
  ctx.renderChatSessionsList = renderChatSessionsList;
  ctx.openMdEditor = openMdEditor;
  ctx.renderChatAttachmentChips = renderChatAttachmentChips;
  ctx.openVaultAttachPicker = openVaultAttachPicker;
  ctx.pollAgentJob = pollAgentJob;
  ctx.patchChatJobBubble = patchChatJobBubble;
  ctx.renderChatMessagesInner = renderChatMessagesInner;
  ctx.startAgentJob = startAgentJob;
  ctx.cancelActiveJob = cancelActiveJob;
  ctx.renderChat = renderChat;
  ctx.animateLatestChatMessage = animateLatestChatMessage;
  ctx.logoutPin = logoutPin;
  ctx.sendChat = sendChat;
  ctx.togglePause = togglePause;
}
