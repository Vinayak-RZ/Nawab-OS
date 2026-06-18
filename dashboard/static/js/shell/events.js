/** @module shell/events — auto-split from app.js */
export function registerShellEvents(ctx) {
  function initContentDelegation() {
    const root = document.getElementById("content");
    if (!root || root.dataset.delegation === "1") return;
    root.dataset.delegation = "1";
  
    root.addEventListener("click", e => {
      const el = e.target.closest(
        "[data-operator],[data-toggle-ui],[data-goto],[data-approve],[data-reject],"
        + "[data-select-specialist],[data-agents-tab],[data-toggle-run],[data-memory-tab],"
        + "[data-inspect-world],[data-world-graph-tab],[data-use-world],[data-set-active-world],"
        + "[data-edit-world],[data-cancel-edit],[data-delete-world],[data-vault-ingest],"
        + "[data-vault-link],[data-vault-search],[data-vault-facet],[data-vault-add-doc],"
        + "[data-vault-cancel-doc],[data-vault-edit-doc],[data-vault-delete-doc],[data-vault-view-doc],[data-vault-reload],"
        + "[data-github-add],[data-github-sync],[data-github-unlink],[data-goal-done],"
        + "[data-history-tab],[data-history-session],[data-open-chat-session],[data-new-chat-session],"
        + "[data-chat-session],[data-cancel-job],[data-cancel-active-job],[data-md-artifact],[data-open-document],"
        + "[data-select-document],[data-docs-action],[data-tag-vault-doc],[data-nudge-index],"
        + "[data-remove-attachment],[data-open-vault-picker],[data-pick-vault-doc],"
        + "[data-crm-followup],[data-crm-wa-thread],[data-crm-tab],[data-crm-company-detail],[data-crm-company-close],"
        + "[data-crm-import-companies],[data-crm-reload],"
        + "[data-crm-outreach-start],[data-crm-campaign],[data-crm-draft-approve],[data-crm-draft-skip],[data-crm-company-toggle],"
        + "[data-crm-skip-company],[data-crm-outreach-refresh],[data-crm-outreach-back],[data-outreach-open-crm-companies],[data-outreach-save-companies],"
        + "[data-msg-read-more],"
        + "#chat-send,#chat-clear,#memory-search,#toggle-pause,#agents-vault-search,"
        + "#delegate-selected-btn,#btn-logout,#btn-infra-refresh"
      );
      if (!el) return;
  
      const dispatch = () => {
      if (el.dataset.msgReadMore) {
        if (!ctx.state._msgExpand) ctx.state._msgExpand = {};
        const key = el.dataset.msgReadMore;
        ctx.state._msgExpand[key] = (ctx.state._msgExpand[key] || 0) + 1;
        ctx.initMsgReadMore(el.closest(".msg-read-more-host") || root);
        return;
      }
      if (el.id === "chat-send") return ctx.sendChat();
      if (el.id === "chat-clear") {
        ctx.chatHistory = [];
        localStorage.setItem("fos_chat", "[]");
        ctx.setChatSessionId(null);
        return ctx.render();
      }
      if (el.id === "memory-search") return ctx.searchMemory();
      if (el.id === "toggle-pause") return ctx.togglePause();
      if (el.id === "agents-vault-search") return ctx.agentsVaultSearch();
      if (el.id === "delegate-selected-btn") return ctx.delegateAgent();
      if (el.id === "btn-logout") return ctx.logoutPin();
      if (el.id === "btn-infra-refresh") return ctx.refreshInfraHealth();
      if (el.dataset.operator) return ctx.openOperatorAction(el.dataset.operator);
      if (el.dataset.toggleUi) {
        if (!ctx.state.ui) ctx.state.ui = {};
        ctx.state.ui[el.dataset.toggleUi] = !ctx.state.ui[el.dataset.toggleUi];
        return ctx.render();
      }
      if (el.dataset.goto) return ctx.goView(el.dataset.goto);
      if (el.dataset.approve) return ctx.decideApproval(el.dataset.approve, true);
      if (el.dataset.reject) return ctx.decideApproval(el.dataset.reject, false);
      if (el.dataset.selectSpecialist !== undefined) return ctx.selectSpecialist(el.dataset.selectSpecialist || "");
      if (el.dataset.agentsTab) {
        ctx.state.agentsTab = el.dataset.agentsTab;
        localStorage.setItem("fos_agents_tab", ctx.state.agentsTab);
        ctx.render();
        if (ctx.state.agentsTab === "vault") {
          ctx.onWorldContextChanged({ vaultWorldId: ctx.currentWorldId(), forceVault: false })
            .then(() => ctx.patchAgentsVaultPanel());
        } else {
          ctx.drawGraphs();
        }
        return;
      }
      if (el.dataset.toggleRun) {
        const id = el.dataset.toggleRun;
        ctx.state.expandedRunId = ctx.state.expandedRunId === id ? null : id;
        return ctx.render();
      }
      if (el.dataset.memoryTab) { ctx.memoryGraphTab = el.dataset.memoryTab; return ctx.render({ graphs: false }); }
      if (el.dataset.inspectWorld) return ctx.selectInspectorWorld(el.dataset.inspectWorld);
      if (el.dataset.worldGraphTab) return ctx.switchWorldGraphTab(el.dataset.worldGraphTab);
      if (el.dataset.useWorld) { ctx.setActiveWorld(el.dataset.useWorld); return ctx.goView("chat"); }
      if (el.dataset.setActiveWorld) {
        ctx.setActiveWorld(el.dataset.setActiveWorld);
        ctx.clearVaultScopedState();
        ctx.invalidateGraphCache("graph-world");
        return ctx.onWorldContextChanged({ vaultWorldId: el.dataset.setActiveWorld, forceVault: true })
          .then(() => (ctx.currentView === "world" ? ctx.patchWorldPanels() : ctx.render({ graphs: false })));
      }
      if (el.dataset.editWorld) { ctx.state.worldEditing = el.dataset.editWorld; return ctx.render(); }
      if (el.dataset.cancelEdit !== undefined) { ctx.state.worldEditing = null; return ctx.render(); }
      if (el.dataset.deleteWorld) return ctx.deleteWorld(el.dataset.deleteWorld);
      if (el.dataset.vaultIngest) return ctx.vaultIngest(el.dataset.vaultIngest);
      if (el.dataset.vaultLink) return ctx.vaultLinkRepo(el.dataset.vaultLink);
      if (el.dataset.vaultSearch) return ctx.vaultSearch(el.dataset.vaultSearch);
      if (el.dataset.vaultReload) return ctx.reloadVaultFromServer(el.dataset.vaultReload);
      if (el.dataset.vaultFacet) {
        if (!ctx.state.ui) ctx.state.ui = {};
        ctx.state.ui.vaultFacet = el.dataset.vaultFacet;
        return ctx.patchWorldPanels();
      }
      if (el.dataset.vaultAddDoc !== undefined) {
        if (!ctx.state.ui) ctx.state.ui = {};
        ctx.state.ui.vaultDocForm = true;
        ctx.state.ui.vaultDocEdit = null;
        return ctx.patchWorldPanels();
      }
      if (el.dataset.vaultCancelDoc !== undefined) {
        if (ctx.state.ui) { ctx.state.ui.vaultDocForm = false; ctx.state.ui.vaultDocEdit = null; }
        return ctx.patchWorldPanels();
      }
      if (el.dataset.vaultEditDoc) return ctx.startVaultDocEdit(ctx.inspectorWorldId(), el.dataset.vaultEditDoc);
      if (el.dataset.vaultViewDoc) {
        const worldId = el.dataset.worldId || ctx.inspectorWorldId();
        const docId = el.dataset.vaultViewDoc;
        if (!docId) return;
        return ctx.openVaultDocViewer(worldId, docId, el.dataset.docTitle || "Document");
      }
      if (el.dataset.tagVaultDoc) {
        return ctx.tagVaultDocInChat(el.dataset.tagVaultDoc, el.dataset.worldId, el.dataset.docTitle, el.dataset.docPath);
      }
      if (el.dataset.nudgeIndex !== undefined) return ctx.handleNudgeAction(el.dataset.nudgeIndex);
      if (el.dataset.removeAttachment !== undefined) {
        const idx = Number(el.dataset.removeAttachment);
        if (!Number.isNaN(idx)) ctx.state._chatAttachments?.splice(idx, 1);
        return ctx.render();
      }
      if (el.dataset.openVaultPicker !== undefined) return ctx.openVaultAttachPicker().catch(e => alert(e.message));
      if (el.dataset.pickVaultDoc) {
        ctx.tagVaultDocInChat(el.dataset.pickVaultDoc, el.dataset.worldId, el.dataset.docTitle, el.dataset.docPath);
        ctx.$("#vault-picker-dialog")?.close();
        return;
      }
      if (el.dataset.crmTab) {
        if (!ctx.state.ui) ctx.state.ui = {};
        ctx.state.ui.crmTab = el.dataset.crmTab;
        localStorage.setItem("fos_crm_tab", ctx.state.ui.crmTab);
        return ctx.loadCrmData().then(() => ctx.render());
      }
      if (el.dataset.crmOutreachRefresh !== undefined) {
        const cid = ctx.state.ui?.crmCampaignId;
        if (cid) return ctx.pollCrmOutreachJob(cid, true);
        return ctx.loadOutreachData().then(() => ctx.render());
      }
      if (el.hasAttribute("data-outreach-save-companies")) return ctx.saveOutreachCompanySelection();
      if (el.hasAttribute("data-outreach-open-crm-companies")) {
        if (!ctx.state.ui) ctx.state.ui = {};
        ctx.state.ui.crmTab = "companies";
        localStorage.setItem("fos_crm_tab", "companies");
        return ctx.goView("crm");
      }
      if (el.dataset.crmCompanyDetail) return ctx.openCrmCompanyDetail(el.dataset.crmCompanyDetail);
      if (el.dataset.crmCompanyClose !== undefined) {
        if (ctx.state.ui) ctx.state.ui.crmCompanyDetail = null;
        ctx.state._crmCompanyDetail = null;
        return ctx.render();
      }
      if (el.dataset.crmImportCompanies !== undefined) return ctx.importCrmCompaniesFromContacts();
      if (el.dataset.crmReload !== undefined) return ctx.loadCrmData().then(() => ctx.render());
      if (el.dataset.crmFollowup) return ctx.scheduleCrmFollowup(el.dataset.crmFollowup, el.dataset.followupDays);
      if (el.dataset.crmWaThread) return ctx.loadCrmWaThread(el.dataset.crmWaThread);
      if (el.dataset.crmCampaign) return ctx.openCrmCampaignReview(el.dataset.crmCampaign);
      if (el.hasAttribute("data-crm-outreach-back")) return ctx.closeCrmCampaignReview();
      if (el.dataset.crmDraftApprove) return ctx.runWithActionBusy(() => ctx.approveCrmDraft(el.dataset.crmDraftApprove), el);
      if (el.dataset.crmDraftSkip) return ctx.runWithActionBusy(() => ctx.skipCrmDraft(el.dataset.crmDraftSkip), el);
      if (el.dataset.crmSkipCompany) {
        if (!confirm("Skip all pending messages for this company?")) return;
        return ctx.runWithActionBusy(() => ctx.skipCrmCompany(el.dataset.crmSkipCompany), el);
      }
      if (el.dataset.reminderDone) return ctx.updateReminderStatus(el.dataset.reminderDone, "done");
      if (el.dataset.reminderCancel) return ctx.updateReminderStatus(el.dataset.reminderCancel, "cancelled");
      if (el.dataset.notifAction) return ctx.openNotificationAction(el.dataset.notifAction, el.dataset.notifId);
      if (el.dataset.vaultDeleteDoc) return ctx.deleteVaultDoc(ctx.inspectorWorldId(), el.dataset.vaultDeleteDoc);
      if (el.dataset.githubAdd) return ctx.connectGithubRepo(el.dataset.githubAdd);
      if (el.dataset.githubSync) return ctx.syncGithubRepo(el.dataset.worldId, el.dataset.githubSync);
      if (el.dataset.githubUnlink) return ctx.unlinkGithubRepo(el.dataset.worldId, el.dataset.githubUnlink);
      if (el.dataset.goalDone) return ctx.markGoalDone(el.dataset.goalDone);
      if (el.dataset.historyTab) {
        ctx.historyTab = el.dataset.historyTab;
        localStorage.setItem("fos_history_tab", ctx.historyTab);
        return ctx.render();
      }
      if (el.dataset.historySession) return ctx.loadHistorySession(el.dataset.historySession);
      if (el.dataset.openChatSession) {
        ctx.setChatSessionId(el.dataset.openChatSession);
        return ctx.loadChatFromServer().then(() => ctx.goView("chat"));
      }
      if (el.hasAttribute("data-new-chat-session")) {
        ctx.setChatSessionId(null);
        ctx.chatHistory = [];
        localStorage.setItem("fos_chat", "[]");
        return ctx.loadChatSessionsList().then(() => {
          if (ctx.currentView === "chat") ctx.render();
          else ctx.goView("chat");
        });
      }
      if (el.dataset.chatSession) {
        ctx.setChatSessionId(el.dataset.chatSession);
        return ctx.loadChatFromServer().then(() => ctx.render());
      }
      if (el.dataset.cancelJob) return ctx.cancelActiveJob(el.dataset.cancelJob);
      if (el.dataset.cancelActiveJob !== undefined) return ctx.cancelActiveJob();
      if (el.dataset.openDocument) return ctx.openDocumentsWorkspace(Number(el.dataset.openDocument));
      if (el.dataset.mdArtifact) return ctx.openDocumentsWorkspace(Number(el.dataset.mdArtifact));
      if (el.dataset.selectDocument) return ctx.selectDocument(el.dataset.selectDocument);
      if (el.dataset.docsAction) {
        const action = el.dataset.docsAction;
        if (action === "new") return ctx.createNewDocument().catch(e => alert(e.message));
        if (action === "toggle") {
          if (ctx.documentsEditMode) {
            ctx.state._documentDraft = document.getElementById("docs-source")?.value ?? ctx.state._documentDraft;
          }
          ctx.documentsEditMode = !ctx.documentsEditMode;
          return ctx.render();
        }
        if (action === "save") return ctx.saveCurrentDocument().catch(e => alert(e.message));
        if (action === "memory") return ctx.saveDocumentToMemory().catch(e => alert(e.message));
      }
      };
  
      if (ctx.shouldSkipActionBusy(el)) return dispatch();
      return ctx.runWithActionBusy(dispatch, el);
    });
  
    root.addEventListener("submit", e => {
      const form = e.target;
      if (!(form instanceof HTMLFormElement)) return;
      const handlers = {
        "world-create-form": ctx.createWorldFromForm,
        "crm-create-form": ctx.submitCrmContact,
        "crm-company-form": ctx.submitCrmCompany,
        "crm-outreach-form": ctx.submitCrmOutreach,
        "goal-create-form": ctx.submitGoal,
        "reminder-create-form": ctx.submitReminder,
        "agent-config-form": ctx.saveAgentConfig,
        "world-edit-form": ctx.saveWorldEdit,
        "vault-doc-form": ctx.submitVaultDoc,
      };
      if (handlers[form.id]) {
        e.preventDefault();
        const submitBtn = form.querySelector('[type="submit"]');
        ctx.runWithActionBusy(() => handlers[form.id](form), submitBtn);
      }
    });
  
    root.addEventListener("change", e => {
      if (e.target.id === "chat-file") return ctx.uploadFile(e);
      if (e.target.id === "docs-upload") {
        const f = e.target.files?.[0];
        if (f) ctx.uploadDocumentFile(f).catch(err => alert(err.message));
        e.target.value = "";
        return;
      }
      if (e.target.id === "specialist-select-agents") return ctx.selectSpecialist(e.target.value);
      if (e.target.id === "chat-specialist-select") return ctx.selectSpecialist(e.target.value);
      if (e.target.id === "rag-mode-select") {
        ctx.state.ragMode = e.target.value || "auto";
        localStorage.setItem("fos_rag_mode", ctx.state.ragMode);
        return;
      }
      if (e.target.matches("[data-crm-status]")) {
        ctx.updateCrmStatus(e.target.dataset.crmStatus, e.target.value);
      }
      if (e.target.matches("[data-crm-whatsapp]")) {
        ctx.updateCrmWhatsapp(e.target.dataset.crmWhatsapp, e.target.checked);
      }
      if (e.target.matches("[data-crm-company-toggle]")) {
        ctx.toggleOutreachDraftCompany(e.target);
      }
      if (e.target.id === "crm-outreach-batch") {
        ctx.setOutreachBatchSize(e.target.value);
      }
      if (e.target.id === "crm-outreach-world") {
        if (!ctx.state.ui) ctx.state.ui = {};
        ctx.state.ui.crmOutreachWorld = e.target.value;
        ctx.restoreOutreachSelectionForWorld(e.target.value);
        ctx.loadOutreachData().then(() => ctx.render());
      }
    });
  
    root.addEventListener("blur", e => {
      if (e.target.matches(".crm-draft-subject, .crm-draft-body")) {
        const id = e.target.dataset.draftId;
        if (id) ctx.saveCrmDraftEdits(id).catch(() => {});
      }
    }, true);
  
    root.addEventListener("keydown", e => {
      if (e.target.id === "chat-input" && e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        ctx.sendChat();
      }
      if (e.target.id === "memory-q" && e.key === "Enter") ctx.searchMemory();
    });
  
    root.addEventListener("input", e => {
      if (e.target.id === "outreach-company-search") {
        ctx.filterOutreachCompanyList(e.target.value);
      }
      if (e.target.matches(".crm-draft-body--fit, .outreach-auto-textarea")) {
        ctx.fitOutreachTextarea?.(e.target);
      }
      if (e.target.matches(".crm-draft-body[data-channel='whatsapp']")) {
        const id = e.target.dataset.draftId;
        const counter = document.querySelector(`.crm-wa-count[data-draft-id="${id}"]`);
        if (counter) counter.textContent = `${e.target.value.length}/300`;
      }
      if (e.target.id === "delegate-selected") ctx.state._delegateDraft = e.target.value;
    });
  }

  ctx.initContentDelegation = initContentDelegation;
}
