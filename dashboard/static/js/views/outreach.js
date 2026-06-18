/** @module views/outreach — batch outreach campaigns (separate from CRM shell) */
export function registerViewsOutreach(ctx) {
  function outreachWorldId() {
    return ctx.state.ui?.crmOutreachWorld || ctx.currentWorldId();
  }

  function outreachStep() {
    const review = ctx.state._crmCampaignReview;
    const camp = review?.campaign;
    if (camp?.status === "done" || (review?.done && !review?.pending_count)) return "complete";
    if (review?.campaign && ["review"].includes(camp.status) && review.pending_count > 0) return "review";
    if (review?.campaign && ["review"].includes(camp.status) && !review.pending_count) return "complete";
    if (ctx.state._crmOutreachJob?.active || ["researching", "drafting", "created"].includes(camp?.status || ctx.state._crmOutreachJob?.status)) {
      return "running";
    }
    if (ctx.state.ui?.crmCampaignId && camp && !["review", "done", "failed"].includes(camp.status)) return "running";
    return "setup";
  }

  function outreachBatchSize() {
    return ctx.state.ui?.crmOutreachBatch || 5;
  }

  function outreachSavedIds() {
    return ctx.state.ui?.crmOutreachSelected || [];
  }

  function outreachDraftIds() {
    if (!ctx.state.ui) ctx.state.ui = {};
    if (!Array.isArray(ctx.state.ui.crmOutreachDraft)) {
      ctx.state.ui.crmOutreachDraft = [...outreachSavedIds()];
    }
    return ctx.state.ui.crmOutreachDraft;
  }

  function outreachSelectionDirty() {
    const draft = [...outreachDraftIds()].sort((a, b) => a - b).join(",");
    const saved = [...outreachSavedIds()].sort((a, b) => a - b).join(",");
    return draft !== saved;
  }

  function resetOutreachCompanySelection() {
    if (!ctx.state.ui) ctx.state.ui = {};
    ctx.state.ui.crmOutreachDraft = [];
    ctx.state.ui.crmOutreachSelected = [];
  }

  function ensureOutreachDraftInitialized() {
    if (!ctx.state.ui) ctx.state.ui = {};
    if (!Array.isArray(ctx.state.ui.crmOutreachDraft)) {
      ctx.state.ui.crmOutreachDraft = [...outreachSavedIds()];
    }
  }

  function syncOutreachCompanyPickerUi() {
    const batch = outreachBatchSize();
    const draft = new Set(outreachDraftIds());
    const savedN = outreachSavedIds().length;
    const dirty = outreachSelectionDirty();
    const root = document.getElementById("outreach-company-picker");
    if (!root) return;

    root.querySelectorAll("[data-crm-company-toggle]").forEach(inp => {
      const id = parseInt(inp.dataset.crmCompanyToggle, 10);
      const on = draft.has(id);
      inp.checked = on;
      inp.disabled = !on && draft.size >= batch;
      inp.closest(".outreach-company-row")?.classList.toggle("is-selected", on);
    });

    const fill = root.querySelector(".outreach-select-meter__fill");
    if (fill) fill.style.width = `${Math.min(100, (draft.size / batch) * 100)}%`;

    const draftEl = document.getElementById("outreach-draft-count");
    if (draftEl) draftEl.textContent = String(draft.size);

    const batchMaxEl = document.getElementById("outreach-batch-max");
    if (batchMaxEl) batchMaxEl.textContent = ` / ${batch}`;

    const meterEl = document.getElementById("outreach-select-meter");
    if (meterEl) {
      meterEl.setAttribute("aria-valuenow", String(draft.size));
      meterEl.setAttribute("aria-valuemax", String(batch));
    }

    const savedEl = document.getElementById("outreach-saved-count");
    if (savedEl) savedEl.textContent = String(savedN);

    const dirtyEl = document.getElementById("outreach-selection-dirty");
    if (dirtyEl) dirtyEl.hidden = !dirty;

    const saveBtn = document.getElementById("outreach-save-companies");
    if (saveBtn) {
      saveBtn.disabled = !dirty || draft.size === 0;
      saveBtn.classList.toggle("is-pulse", dirty && draft.size > 0);
    }

    const startBtn = document.getElementById("outreach-start-btn");
    if (startBtn) {
      const wid = outreachWorldId();
      const canStart = savedN > 0 && wid !== "root" && !dirty;
      startBtn.disabled = !canStart;
      if (dirty) {
        startBtn.title = "Save your company selection before starting";
      } else if (!savedN) {
        startBtn.title = "Select and save at least one company";
      } else {
        startBtn.title = "";
      }
    }

    const batchHint = document.getElementById("outreach-batch-hint");
    if (batchHint) {
      batchHint.textContent = draft.size >= batch
        ? `Batch limit reached (${batch})`
        : `Up to ${batch} companies per campaign`;
    }
  }

  function toggleOutreachDraftCompany(el) {
    const id = parseInt(el.dataset.crmCompanyToggle, 10);
    if (!id) return;
    if (!ctx.state.ui) ctx.state.ui = {};
    const batch = outreachBatchSize();
    const draft = new Set(outreachDraftIds());
    if (el.checked) {
      if (draft.size >= batch) {
        el.checked = false;
        return;
      }
      draft.add(id);
    } else {
      draft.delete(id);
    }
    ctx.state.ui.crmOutreachDraft = [...draft];
    syncOutreachCompanyPickerUi();
  }

  function saveOutreachCompanySelection() {
    if (!ctx.state.ui) ctx.state.ui = {};
    const draft = outreachDraftIds();
    if (!draft.length) return;
    ctx.state.ui.crmOutreachSelected = [...draft];
    const wid = outreachWorldId();
    if (wid) {
      try {
        localStorage.setItem(`fos_outreach_sel_${wid}`, JSON.stringify(draft));
      } catch { /* ignore quota */ }
    }
    syncOutreachCompanyPickerUi();
    const savedEl = document.getElementById("outreach-save-companies");
    if (savedEl) {
      savedEl.classList.add("is-saved-flash");
      setTimeout(() => savedEl?.classList.remove("is-saved-flash"), 600);
    }
  }

  function setOutreachBatchSize(size) {
    if (!ctx.state.ui) ctx.state.ui = {};
    const batch = parseInt(size, 10) || 5;
    ctx.state.ui.crmOutreachBatch = batch;
    let draft = outreachDraftIds();
    if (draft.length > batch) {
      ctx.state.ui.crmOutreachDraft = draft.slice(0, batch);
    }
    syncOutreachCompanyPickerUi();
  }

  function filterOutreachCompanyList(query) {
    const term = (query || "").trim().toLowerCase();
    document.querySelectorAll("#outreach-company-picker .outreach-company-row").forEach(row => {
      const hay = (row.dataset.search || "").toLowerCase();
      row.hidden = !!(term && !hay.includes(term));
    });
  }

  function prospectCompaniesForWorld() {
    const wid = outreachWorldId();
    return (ctx.state._crmCompanies?.companies || []).filter(c => {
      if (wid && wid !== "root" && c.world_id && c.world_id !== wid) return false;
      return c.status === "prospect" || !c.status;
    });
  }

  function draftApproveDisabledReason(d) {
    if (d.channel === "email") {
      if (!(d.subject || "").trim()) return "Subject required";
      if (!(d.body || "").trim()) return "Body required";
      if (!(d.email || "").trim()) return "Contact has no email";
    }
    if (d.channel === "whatsapp") {
      if (!(d.body || "").trim()) return "Message required";
      if ((d.body || "").length > 300) return "Max 300 characters";
      if (!d.whatsapp_enabled) return "WhatsApp not allowlisted";
      if (!(d.phone || "").trim()) return "No phone on contact";
    }
    return "";
  }

  function renderOutreachSteps(step) {
    const steps = [
      ["setup", "1. Setup"],
      ["running", "2. Research & draft"],
      ["review", "3. Review & send"],
      ["complete", "4. Done"],
    ];
    const order = { setup: 0, running: 1, review: 2, complete: 3 };
    const cur = order[step] ?? 0;
    return `<nav class="crm-outreach-steps" aria-label="Outreach progress">${steps.map(([id, label], i) => {
      const cls = i < cur ? "crm-outreach-step crm-outreach-step--done"
        : i === cur ? "crm-outreach-step crm-outreach-step--active"
        : "crm-outreach-step";
      return `<span class="${cls}">${ctx.esc(label)}</span>`;
    }).join("")}</nav>`;
  }

  function renderOutreachRunningPanel() {
    const job = ctx.state._crmOutreachJob || {};
    const camp = ctx.state._crmCampaignDetail?.campaign || ctx.state._crmCampaignReview?.campaign || {};
    const phase = job.phase || camp.status || "Starting…";
    const companies = ctx.state._crmCampaignReview?.companies || ctx.state._crmCampaignDetail?.review?.companies || [];
    const total = companies.length || camp.batch_size || "?";
    return `<section class="driver-card span-12 crm-outreach-running">
      <p class="section-eyebrow">Outreach in progress</p>
      <h3 class="title-sm">${ctx.esc(camp.name || "Campaign")}</h3>
      ${ctx.renderOutreachSteps("running")}
      <div class="crm-outreach-progress-strip">
        <div class="crm-outreach-progress-strip__bar"><div class="crm-outreach-progress-strip__fill" style="width:40%"></div></div>
        <p class="body-md"><strong>${ctx.esc(phase)}</strong></p>
        <p class="muted body-sm">Researching companies via knowledge tree + web, then drafting messages. This runs in the background — you can leave this page.</p>
        <p class="muted body-sm">Batch: ${total} companies · World: <span data-active-world-label>${ctx.esc(ctx.activeWorldLabel())}</span></p>
      </div>
      <button type="button" class="button-outline-on-dark button-sm" data-crm-outreach-refresh>Refresh status</button>
    </section>`;
  }

  function renderOutreachCompletePanel(review) {
    const prog = review.progress || {};
    const by = prog.by_status || {};
    return `<section class="driver-card span-12">
      <p class="section-eyebrow">Campaign complete</p>
      <h3 class="title-sm">${ctx.esc(review.campaign?.name || "Campaign")}</h3>
      ${ctx.renderOutreachSteps("complete")}
      <div class="crm-outreach-summary">
        <div class="kv"><span class="k">Sent</span><span class="v">${by.sent || 0}</span></div>
        <div class="kv"><span class="k">Skipped</span><span class="v">${by.skipped || 0}</span></div>
        <div class="kv"><span class="k">Failed</span><span class="v">${by.failed || 0}</span></div>
        <div class="kv"><span class="k">Companies</span><span class="v">${prog.companies_complete || 0}/${prog.companies_total || 0}</span></div>
      </div>
      <div class="human-form__actions" style="margin-top:var(--space-md)">
        <button type="button" class="button-primary button-sm" data-crm-outreach-back>Start new campaign</button>
      </div>
    </section>`;
  }

  function renderOutreachReviewPanel(review) {
    const camp = review.campaign;
    const strategy = review.strategy || {};
    const co = review.current_company;
    const research = review.current_research || {};
    const drafts = review.current_drafts || [];
    const prog = review.progress || {};
    const emailDrafts = drafts.filter(d => d.channel === "email");
    const waDrafts = drafts.filter(d => d.channel === "whatsapp");
    const coLabel = co?.company_name || co?.name || "Company";
    const coIdx = prog.company_index || 1;
    const coTotal = prog.companies_total || 1;

    const draftCard = (d) => {
      const reason = ctx.draftApproveDisabledReason(d);
      const waLen = (d.body || "").length;
      return `<div class="crm-draft-card driver-card" data-draft-id="${d.id}">
        <div class="crm-draft-card__head">
          <p class="caption-uppercase">${d.channel === "email" ? "Gmail" : "WhatsApp"} → ${ctx.esc(d.contact_name || "Contact")}</p>
          ${d.channel === "email" ? `<span class="muted body-sm">${ctx.esc(d.email || "")}</span>` : `<span class="muted body-sm">${ctx.esc(d.phone || "")}</span>`}
        </div>
        ${d.personalization_notes ? `<p class="body-sm muted">${ctx.esc(d.personalization_notes)}</p>` : ""}
        ${d.channel === "email" ? `<label class="human-field"><span class="caption-uppercase">Subject</span>
          <input class="text-input-on-dark crm-draft-subject" data-draft-id="${d.id}" value="${ctx.esc(d.subject || "")}"></label>` : ""}
        <label class="human-field"><span class="caption-uppercase">Message</span>
          <textarea class="text-input-on-dark crm-draft-body" data-draft-id="${d.id}" data-channel="${ctx.esc(d.channel)}" rows="${d.channel === "whatsapp" ? 3 : 6}">${ctx.esc(d.body || "")}</textarea>
          ${d.channel === "whatsapp" ? `<span class="caption muted crm-wa-count" data-draft-id="${d.id}">${waLen}/300</span>` : ""}
        </label>
        <div class="human-form__actions">
          <button type="button" class="button-primary button-sm" data-crm-draft-approve="${d.id}" ${reason ? "disabled title=\"" + ctx.esc(reason) + "\"" : ""}>Approve &amp; Send</button>
          <button type="button" class="button-outline-on-dark button-sm" data-crm-draft-skip="${d.id}">Skip message</button>
        </div>
        ${d.error_message ? `<p class="crm-draft-error">${ctx.esc(d.error_message)}</p>` : ""}
        ${reason ? `<p class="muted body-sm">${ctx.esc(reason)}</p>` : ""}
      </div>`;
    };

    return `<section class="driver-card span-12">
      <div class="human-panel__head">
        <div>
          <p class="section-eyebrow">Review &amp; send</p>
          <h3 class="title-sm">${ctx.esc(camp.name || "Campaign")}</h3>
          <p class="muted body-sm">Company ${coIdx} of ${coTotal} · ${review.pending_count || 0} message(s) left — approve one at a time</p>
        </div>
        <button type="button" class="button-outline-on-dark button-sm" data-crm-outreach-back>Exit review</button>
      </div>
      ${ctx.renderOutreachSteps("review")}
      <div class="crm-outreach-progress-meta">
        <div class="crm-outreach-progress-strip__bar"><div class="crm-outreach-progress-strip__fill" style="width:${Math.round(((prog.companies_complete || 0) / Math.max(coTotal, 1)) * 100)}%"></div></div>
        <div class="crm-outreach-stats">
          <span class="badge-pill">Sent ${(prog.by_status || {}).sent || 0}</span>
          <span class="badge-pill">Skipped ${(prog.by_status || {}).skipped || 0}</span>
          <span class="badge-pill">Pending ${review.pending_count || 0}</span>
        </div>
      </div>
      <details class="crm-strategy-details">
        <summary class="caption-uppercase">Cohort strategy</summary>
        <pre class="body-sm muted" style="white-space:pre-wrap">${ctx.esc(JSON.stringify(strategy, null, 2))}</pre>
      </details>
      ${co ? `<div class="crm-company-review driver-card">
        <div class="human-panel__head">
          <h4 class="title-sm">${ctx.esc(coLabel)}</h4>
          <button type="button" class="button-outline-on-dark button-sm" data-crm-skip-company="${co.company_id}">Skip company</button>
        </div>
        <p class="body-sm muted">${ctx.esc(research.sector || co.sector || "")}</p>
        ${research.crm_research_summary ? `<p class="body-sm">${ctx.esc(String(research.crm_research_summary).slice(0, 400))}</p>` : ""}
        ${(research.web_hits || []).length ? `<p class="caption-uppercase">Web signals</p><ul class="list-plain">${research.web_hits.slice(0, 3).map(w =>
          `<li class="body-sm">${ctx.esc(w.snippet || w.title || "")}${w.url ? ` <a href="${ctx.esc(w.url)}" target="_blank" rel="noopener">link</a>` : ""}</li>`
        ).join("")}</ul>` : ""}
        ${(research.vault_files_used || []).length ? `<p class="caption-uppercase">Vault files used</p><ul class="list-plain">${research.vault_files_used.map(f =>
          `<li class="body-sm">${ctx.esc(f.title || ("doc #" + f.doc_id))}</li>`
        ).join("")}</ul>` : ""}
      </div>` : ""}
      ${emailDrafts.length ? `<p class="caption-uppercase">Email drafts</p>` : ""}
      ${emailDrafts.map(draftCard).join("")}
      ${waDrafts.length ? `<p class="caption-uppercase" style="margin-top:var(--space-md)">WhatsApp drafts</p>` : ""}
      ${waDrafts.map(draftCard).join("")}
      ${!drafts.length && co ? `<p class="muted">No drafts for this company — contacts may lack email or WhatsApp allowlist.</p>` : ""}
    </section>`;
  }

  function restoreOutreachSelectionForWorld(wid) {
    if (!ctx.state.ui) ctx.state.ui = {};
    let saved = [];
    if (wid) {
      try {
        const raw = localStorage.getItem(`fos_outreach_sel_${wid}`);
        const parsed = raw ? JSON.parse(raw) : [];
        saved = Array.isArray(parsed) ? parsed.filter(id => Number.isFinite(id)) : [];
      } catch { /* ignore */ }
    }
    ctx.state.ui.crmOutreachSelected = saved;
    ctx.state.ui.crmOutreachDraft = [...saved];
  }

  function renderOutreachSetupPanel() {
    ensureOutreachDraftInitialized();
    const campaigns = ctx.state._crmCampaigns?.campaigns || [];
    const wid = outreachWorldId();
    const companies = prospectCompaniesForWorld();
    const batchSize = outreachBatchSize();
    const draft = new Set(outreachDraftIds());
    const savedN = outreachSavedIds().length;
    const dirty = outreachSelectionDirty();
    const tree = ctx.state.worlds || ctx.state._worldFull?.worlds || {};
    const hasSubWorld = (tree.children || []).length > 0;
    const loading = ctx.state._crmCompaniesLoading;
    const loadErr = ctx.state._crmCompaniesError;

    const companyRows = companies.map(co => {
      const on = draft.has(co.id);
      const contacts = co.contact_count || 0;
      const search = `${co.name || ""} ${co.sector || ""}`.trim();
      return `<label class="outreach-company-row human-field--checkbox${on ? " is-selected" : ""}" data-search="${ctx.esc(search)}">
        <input type="checkbox" data-crm-company-toggle="${co.id}" ${on ? "checked" : ""} ${draft.size >= batchSize && !on ? "disabled" : ""}>
        <span class="outreach-company-row__main">
          <span class="outreach-company-row__name">${ctx.esc(co.name)}</span>
          <span class="outreach-company-row__meta muted">${ctx.esc(co.sector || "—")} · ${contacts} contact${contacts === 1 ? "" : "s"}</span>
        </span>
      </label>`;
    }).join("");

    const batchOpts = [5, 10, 15, 20].map(n =>
      `<option value="${n}"${batchSize === n ? " selected" : ""}>${n}</option>`
    ).join("");

    const history = campaigns.slice(0, 12).map(c => {
      const badge = c.status === "review" ? "button-primary" : "button-tertiary-text";
      return `<tr>
        <td><button type="button" class="${badge} button-sm" data-crm-campaign="${c.id}">${ctx.esc(c.name)}</button></td>
        <td><span class="badge-pill badge-pill--${ctx.esc(c.status)}">${ctx.esc(c.status)}</span></td>
        <td class="muted">${ctx.esc((c.created_at || "").slice(0, 10))}</td>
        <td>${c.status === "review" ? `<button type="button" class="button-outline-on-dark button-sm" data-crm-campaign="${c.id}">Continue review</button>` : ""}</td>
      </tr>`;
    }).join("") || '<tr><td colspan="4" class="muted">No campaigns yet</td></tr>';

    const companyPicker = !companies.length
      ? `<div class="crm-outreach-empty">
          <p class="body-md">No prospect companies for this world.</p>
          <p class="body-sm muted">Import from CRM contacts or add companies manually, then return here to build a batch.</p>
          <div class="human-form__actions">
            <button type="button" class="button-primary button-sm" data-outreach-open-crm-companies>Open companies in CRM</button>
          </div>
        </div>`
      : `<div id="outreach-company-picker" class="outreach-company-picker">
          <div class="outreach-picker-toolbar">
            <div class="outreach-picker-toolbar__head">
              <p class="caption-uppercase">Companies</p>
              <div class="outreach-picker-toolbar__counts">
                <span class="outreach-count-pill" title="Currently selected (not yet saved)">
                  <strong id="outreach-draft-count">${draft.size}</strong><span class="muted" id="outreach-batch-max"> / ${batchSize}</span>
                </span>
                <span class="outreach-count-pill outreach-count-pill--saved" title="Saved for this campaign">
                  <strong id="outreach-saved-count">${savedN}</strong> saved
                </span>
                <span id="outreach-selection-dirty" class="outreach-dirty-badge"${dirty ? "" : " hidden"}>Unsaved</span>
              </div>
            </div>
            <div class="outreach-select-meter" id="outreach-select-meter" role="progressbar" aria-valuenow="${draft.size}" aria-valuemin="0" aria-valuemax="${batchSize}" aria-label="Selection progress">
              <div class="outreach-select-meter__fill" style="width:${Math.min(100, (draft.size / batchSize) * 100)}%"></div>
            </div>
            <p class="body-sm muted" id="outreach-batch-hint">${draft.size >= batchSize ? `Batch limit reached (${batchSize})` : `Pick up to ${batchSize}, then save`}</p>
            <div class="outreach-picker-toolbar__actions">
              <input type="search" id="outreach-company-search" class="text-input-on-dark outreach-company-search" placeholder="Filter companies…" autocomplete="off">
              <button type="button" id="outreach-save-companies" class="button-outline-on-dark button-sm" data-outreach-save-companies ${dirty && draft.size ? "" : "disabled"}>Save selection</button>
            </div>
          </div>
          <div class="outreach-company-list">${companyRows}</div>
        </div>`;

    const canStart = savedN > 0 && wid !== "root" && !dirty;

    return `<section class="driver-card span-12 human-panel outreach-setup">
      <div class="human-panel__head">
        <div>
          <h3 class="title-sm">Batch outreach</h3>
          <p class="body-sm muted">Pick companies, save your batch, then start — research and drafts run in the background.</p>
        </div>
      </div>
      ${ctx.renderOutreachSteps("setup")}
      ${!hasSubWorld ? `<p class="crm-outreach-warn">Create a sub-world under <strong>World</strong> first — outreach needs a venture context for vault research.</p>` : ""}
      ${loadErr ? `<p class="crm-draft-error">${ctx.esc(loadErr)}</p>` : ""}
      <form class="human-form outreach-setup-form" id="crm-outreach-form">
        <div class="outreach-setup-grid">
          <label class="human-field"><span class="caption-uppercase">World</span>
            <select class="text-input-on-dark" name="world_id" id="crm-outreach-world">${ctx.renderWorldOptionsForCrm(wid)}</select></label>
          <label class="human-field"><span class="caption-uppercase">Batch size</span>
            <select class="text-input-on-dark" name="batch_size" id="crm-outreach-batch">${batchOpts}</select></label>
        </div>
        <label class="human-field"><span class="caption-uppercase">Outreach brief</span>
          <textarea class="text-input-on-dark" name="brief" rows="3" placeholder="e.g. Indian manufacturing SMBs — energy cost savings, 15-min discovery call, direct tone"></textarea></label>
        ${loading ? `<p class="muted body-sm">Loading companies…</p>` : companyPicker}
        <div class="human-form__actions outreach-setup-actions">
          <button type="submit" id="outreach-start-btn" class="button-primary" ${canStart ? "" : "disabled"}${dirty ? ' title="Save your company selection before starting"' : !savedN ? ' title="Select and save at least one company"' : ""}>
            Start outreach${savedN ? ` (${savedN} companies)` : ""}
          </button>
        </div>
      </form>
      <section class="outreach-history">
        <p class="caption-uppercase">Recent campaigns</p>
        <div class="table-wrap"><table><thead><tr><th>Campaign</th><th>Status</th><th>Created</th><th></th></tr></thead><tbody>${history}</tbody></table></div>
      </section>
    </section>`;
  }

  function renderOutreachBody() {
    const step = ctx.outreachStep();
    const review = ctx.state._crmCampaignReview;
    if (step === "running") return ctx.renderOutreachRunningPanel();
    if (step === "complete" && review?.campaign) return ctx.renderOutreachCompletePanel(review);
    if (step === "review" && review?.campaign) return ctx.renderOutreachReviewPanel(review);
    return ctx.renderOutreachSetupPanel();
  }

  function renderOutreach() {
    return `<div class="dashboard-grid">
      <section class="driver-card span-12 crm-shell">
        <div class="human-panel__head crm-shell__head">
          <div>
            <nav class="body-sm muted" aria-label="Breadcrumb" style="margin-bottom:var(--space-xs)">
              <button type="button" class="button-tertiary-text button-sm" data-goto="crm">CRM</button>
              <span aria-hidden="true"> / </span>
              <span>Outreach</span>
            </nav>
            <h2 class="title-md" style="text-wrap:balance">Outreach</h2>
            <p class="body-sm muted">Batch campaigns — research, draft, and approve every message before send.</p>
          </div>
        </div>
      </section>
      ${ctx.renderOutreachBody()}
    </div>`;
  }

  async function loadOutreachData() {
    if (!ctx.state.ui) ctx.state.ui = {};
    if (!ctx.state.ui.crmOutreachWorld) ctx.state.ui.crmOutreachWorld = ctx.currentWorldId();
    const wid = ctx.outreachWorldId();
    const companiesQ = wid && wid !== "root"
      ? `?world_id=${encodeURIComponent(wid)}&include_unassigned=1`
      : "?include_unassigned=1";
    const worldQ = wid && wid !== "root" ? `?world_id=${encodeURIComponent(wid)}` : "";
    const campaignId = ctx.routeParams?.campaignId || ctx.state.ui?.crmCampaignId;

    ctx.state._crmCompaniesLoading = true;
    ctx.state._crmCompaniesError = null;
    try {
      const [companies, campaigns] = await Promise.all([
        ctx.api(`/crm/companies${companiesQ}`),
        ctx.api(`/crm/outreach/campaigns${worldQ}`).catch(() => ({ campaigns: [] })),
      ]);
      ctx.state._crmCompanies = companies;
      ctx.state._crmCampaigns = campaigns;
      if (!campaignId) {
        if (!Array.isArray(ctx.state.ui.crmOutreachDraft)) {
          if (outreachSavedIds().length) {
            ctx.state.ui.crmOutreachDraft = [...outreachSavedIds()];
          } else {
            restoreOutreachSelectionForWorld(wid);
          }
        }
      }
      if (campaignId) {
        ctx.state.ui.crmCampaignId = campaignId;
        const [detail, review] = await Promise.all([
          ctx.api(`/crm/outreach/campaigns/${campaignId}`).catch(() => null),
          ctx.api(`/crm/outreach/campaigns/${campaignId}/review`).catch(() => null),
        ]);
        ctx.state._crmCampaignDetail = detail;
        ctx.state._crmCampaignReview = review?.campaign ? review : detail?.review;
        const camp = ctx.state._crmCampaignReview?.campaign || detail?.campaign;
        if (camp && ["researching", "drafting", "created"].includes(camp.status)) {
          ctx.state._crmOutreachJob = { active: true, phase: camp.status, status: camp.status };
          if (!ctx.state._crmOutreachPollId) ctx.pollCrmOutreachJob(campaignId);
        } else if (camp?.status === "review") {
          ctx.state._crmOutreachJob = { phase: "Ready for review", active: false };
        }
      }
    } catch (e) {
      ctx.state._crmCompaniesError = e.message || "Could not load outreach data";
    } finally {
      ctx.state._crmCompaniesLoading = false;
    }
  }

  async function submitCrmOutreach(form) {
    const fd = new FormData(form);
    const world_id = (fd.get("world_id") || "").toString().trim();
    const batch_size = parseInt(fd.get("batch_size") || "5", 10) || 5;
    const brief = (fd.get("brief") || "").toString().trim();
    const company_ids = outreachSavedIds();
    if (outreachSelectionDirty()) return alert("Save your company selection before starting.");
    if (!world_id || world_id === "root") return alert("Select a sub-world for outreach (not Main world).");
    if (!company_ids.length) return alert("Select and save at least one company.");
    if (!brief) return alert("Add a brief so the agent knows what kind of message to write.");
    try {
      const created = await ctx.api("/crm/outreach/campaigns", {
        method: "POST",
        body: JSON.stringify({ world_id, batch_size, brief, company_ids }),
      });
      await ctx.api(`/crm/outreach/campaigns/${created.campaign_id}/start`, { method: "POST" });
      if (!ctx.state.ui) ctx.state.ui = {};
      ctx.state.ui.crmOutreachSelected = [];
      ctx.state.ui.crmOutreachDraft = [];
      try { localStorage.removeItem(`fos_outreach_sel_${world_id}`); } catch { /* ignore */ }
      ctx.goView("outreach", { params: { campaignId: created.campaign_id } });
      ctx.pollCrmOutreachJob(created.campaign_id);
    } catch (e) { alert(e.message); }
  }

  async function pollCrmOutreachJob(campaignId, once = false) {
    if (ctx.state._crmOutreachPollId) clearTimeout(ctx.state._crmOutreachPollId);
    const tick = async () => {
      try {
        const detail = await ctx.api(`/crm/outreach/campaigns/${campaignId}`);
        const camp = detail.campaign || {};
        const review = detail.review || {};
        const job = detail.job || {};
        ctx.state._crmCampaignDetail = detail;
        if (camp.status === "review" || camp.status === "done" || camp.status === "failed") {
          ctx.state._crmOutreachJob = { active: false, phase: camp.status === "review" ? "Ready for review" : camp.status };
          ctx.state._crmCampaignReview = review.campaign ? review : await ctx.api(`/crm/outreach/campaigns/${campaignId}/review`);
          ctx.state._crmOutreachPollId = null;
          if (ctx.currentView === "outreach") ctx.render();
          return;
        }
        ctx.state._crmOutreachJob = { active: true, phase: job.phase || camp.status || "running…", status: camp.status };
        if (ctx.currentView === "outreach") ctx.render();
        if (!once) ctx.state._crmOutreachPollId = setTimeout(tick, 2500);
      } catch {
        if (!once) ctx.state._crmOutreachPollId = setTimeout(tick, 4000);
      }
    };
    if (once) await tick();
    else ctx.state._crmOutreachPollId = setTimeout(tick, 500);
  }

  async function openCrmCampaignReview(campaignId) {
    if (!campaignId) return;
    ctx.goView("outreach", { params: { campaignId: parseInt(campaignId, 10) } });
  }

  function closeCrmCampaignReview() {
    if (ctx.state._crmOutreachPollId) clearTimeout(ctx.state._crmOutreachPollId);
    ctx.state._crmOutreachPollId = null;
    if (ctx.state.ui) {
      ctx.state.ui.crmCampaignId = null;
    }
    ctx.state._crmCampaignReview = null;
    ctx.state._crmCampaignDetail = null;
    ctx.state._crmOutreachJob = null;
    ctx.goView("outreach", { params: {} });
  }

  function toggleCrmOutreachCompany(el) {
    toggleOutreachDraftCompany(el);
  }

  async function skipCrmCompany(companyId) {
    const cid = ctx.state.ui?.crmCampaignId;
    if (!cid || !companyId) return;
    if (!confirm("Skip all pending messages for this company?")) return;
    try {
      await ctx.api(`/crm/outreach/campaigns/${cid}/companies/${companyId}/skip`, { method: "POST" });
      ctx.state._crmCampaignReview = await ctx.api(`/crm/outreach/campaigns/${cid}/review`);
      ctx.render();
    } catch (e) { alert(e.message); }
  }

  async function saveCrmDraftEdits(draftId) {
    const subj = document.querySelector(`.crm-draft-subject[data-draft-id="${draftId}"]`);
    const body = document.querySelector(`.crm-draft-body[data-draft-id="${draftId}"]`);
    const payload = {};
    if (subj) payload.subject = subj.value;
    if (body) payload.body = body.value;
    if (!Object.keys(payload).length) return;
    await ctx.api(`/crm/outreach/drafts/${draftId}`, { method: "PATCH", body: JSON.stringify(payload) });
  }

  async function approveCrmDraft(draftId) {
    if (!draftId) return;
    try {
      await ctx.saveCrmDraftEdits(draftId);
      const res = await ctx.api(`/crm/outreach/drafts/${draftId}/approve-send`, { method: "POST" });
      if (res.error) return alert(res.error);
      const cid = ctx.state.ui?.crmCampaignId;
      if (cid) ctx.state._crmCampaignReview = await ctx.api(`/crm/outreach/campaigns/${cid}/review`);
      ctx.render();
    } catch (e) { alert(e.message); }
  }

  async function skipCrmDraft(draftId) {
    if (!draftId) return;
    try {
      await ctx.api(`/crm/outreach/drafts/${draftId}/skip`, { method: "POST" });
      const cid = ctx.state.ui?.crmCampaignId;
      if (cid) ctx.state._crmCampaignReview = await ctx.api(`/crm/outreach/campaigns/${cid}/review`);
      ctx.render();
    } catch (e) { alert(e.message); }
  }

  ctx.outreachWorldId = outreachWorldId;
  ctx.outreachStep = outreachStep;
  ctx.draftApproveDisabledReason = draftApproveDisabledReason;
  ctx.renderOutreachSteps = renderOutreachSteps;
  ctx.renderOutreachRunningPanel = renderOutreachRunningPanel;
  ctx.renderOutreachCompletePanel = renderOutreachCompletePanel;
  ctx.renderOutreachReviewPanel = renderOutreachReviewPanel;
  ctx.renderOutreachSetupPanel = renderOutreachSetupPanel;
  ctx.renderOutreachBody = renderOutreachBody;
  ctx.renderOutreach = renderOutreach;
  ctx.loadOutreachData = loadOutreachData;
  ctx.submitCrmOutreach = submitCrmOutreach;
  ctx.pollCrmOutreachJob = pollCrmOutreachJob;
  ctx.openCrmCampaignReview = openCrmCampaignReview;
  ctx.closeCrmCampaignReview = closeCrmCampaignReview;
  ctx.toggleOutreachDraftCompany = toggleOutreachDraftCompany;
  ctx.saveOutreachCompanySelection = saveOutreachCompanySelection;
  ctx.setOutreachBatchSize = setOutreachBatchSize;
  ctx.filterOutreachCompanyList = filterOutreachCompanyList;
  ctx.syncOutreachCompanyPickerUi = syncOutreachCompanyPickerUi;
  ctx.restoreOutreachSelectionForWorld = restoreOutreachSelectionForWorld;
  ctx.resetOutreachCompanySelection = resetOutreachCompanySelection;
  ctx.toggleCrmOutreachCompany = toggleCrmOutreachCompany;
  ctx.skipCrmCompany = skipCrmCompany;
  ctx.saveCrmDraftEdits = saveCrmDraftEdits;
  ctx.approveCrmDraft = approveCrmDraft;
  ctx.skipCrmDraft = skipCrmDraft;
}
