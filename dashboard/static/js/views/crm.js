/** @module views/crm — auto-split from app.js */
export function registerViewsCrm(ctx) {
  function crmTab() {
    return ctx.state.ui?.crmTab || localStorage.getItem("fos_crm_tab") || "contacts";
  }

  function renderWorldOptionsForCrm(selectedId) {
    const tree = ctx.state.worlds || ctx.state._worldFull?.worlds || {};
    const root = tree.root;
    const children = tree.children || [];
    const opts = [];
    if (root) opts.push(`<option value="${ctx.esc(root.id || "root")}"${(selectedId || "root") === (root.id || "root") ? " selected" : ""}>${ctx.esc(root.name || "Main world")}</option>`);
    children.forEach(c => {
      opts.push(`<option value="${ctx.esc(c.id)}"${selectedId === c.id ? " selected" : ""}>${ctx.esc(c.name || c.id)}</option>`);
    });
    return opts.join("");
  }

  function renderCrmTabs(counts = {}) {
    const tab = ctx.crmTab();
    const tabs = [
      ["contacts", "Contacts", counts.contacts],
      ["companies", "Companies", counts.companies],
      ["pipeline", "Pipeline", null],
      ["outreach", "Outreach", null],
    ];
    return `<nav class="crm-tabs" role="tablist" aria-label="CRM sections">${tabs.map(([id, label, n]) =>
      `<button type="button" role="tab" aria-selected="${tab === id}" class="crm-tab${tab === id ? " crm-tab--active" : ""}" data-crm-tab="${id}">${ctx.esc(label)}${n != null ? `<span class="crm-tab__count">${n}</span>` : ""}</button>`
    ).join("")}</nav>`;
  }

  function renderCrmContactsPanel() {
    const contacts = ctx.state._crm?.contacts || [];
    const followups = ctx.state._crm?.followups_due || [];
    const formOpen = !!ctx.state.ui?.crmFormOpen;
    const companies = ctx.state._crmCompanies?.companies || [];
    const statusOpts = (cur) => ctx.CRM_STATUSES.map(s =>
      `<option value="${s}"${s === cur ? " selected" : ""}>${ctx.esc(s)}</option>`
    ).join("");
    const companyOpts = `<option value="">— None —</option>` + companies.map(co =>
      `<option value="${co.id}">${ctx.esc(co.name)}</option>`
    ).join("");
  
    const rows = contacts.slice(0, 50).map(c => `<tr>
      <td>${ctx.esc(c.name)}</td><td>${ctx.esc(c.company || "—")}</td><td>${ctx.esc(c.role || "—")}</td>
      <td><select class="text-input-on-dark crm-status-select" data-crm-status="${c.id}" aria-label="Status for ${ctx.esc(c.name)}">${statusOpts(c.status || "prospect")}</select></td>
      <td class="muted">${ctx.esc(c.email || "")}</td>
      <td class="muted">${ctx.esc(c.phone || "")}</td>
      <td><label class="human-field--checkbox" style="margin:0">
        <input type="checkbox" data-crm-whatsapp="${c.id}" ${c.whatsapp_enabled ? "checked" : ""} ${c.phone ? "" : "disabled"} aria-label="Allow WhatsApp for ${ctx.esc(c.name)}">
      </label></td>
      <td>
        <button type="button" class="button-outline-on-dark button-sm" data-crm-followup="${c.id}" data-followup-days="3">3d</button>
        <button type="button" class="button-outline-on-dark button-sm" data-crm-followup="${c.id}" data-followup-days="7">7d</button>
        ${c.whatsapp_enabled ? `<button type="button" class="button-tertiary-text button-sm" data-crm-wa-thread="${c.id}">WA</button>` : ""}
      </td></tr>`).join("");
  
    const fu = followups.map(c => `<li class="crm-followup-row">
      <span>${ctx.esc(c.name)} @ ${ctx.esc(c.company || "?")}</span>
      <button type="button" class="button-outline-on-dark button-sm" data-goto="crm">Open</button>
    </li>`).join("") || "<li class='muted'>None due</li>";
  
    return `
      <section class="driver-card span-12 human-panel">
        <div class="human-panel__head">
          <div>
            <p class="section-eyebrow">Contacts</p>
            <h3 class="title-sm">People &amp; follow-ups</h3>
          </div>
          <button type="button" class="button-primary button-sm" data-toggle-ui="crmFormOpen">${formOpen ? "Hide form" : "Add contact"}</button>
        </div>
        ${formOpen ? `
        <form class="human-form" id="crm-create-form">
          <div class="human-form__row">
            <label class="human-field"><span class="caption-uppercase">Name</span>
              <input class="text-input-on-dark" name="name" required placeholder="Full name"></label>
            <label class="human-field"><span class="caption-uppercase">Company</span>
              <select class="text-input-on-dark" name="company_id">${companyOpts}</select></label>
          </div>
          <div class="human-form__row">
            <label class="human-field"><span class="caption-uppercase">Role</span>
              <input class="text-input-on-dark" name="role" placeholder="Title"></label>
            <label class="human-field"><span class="caption-uppercase">Email</span>
              <input class="text-input-on-dark" name="email" type="email" placeholder="email@company.com"></label>
          </div>
          <div class="human-form__row">
            <label class="human-field"><span class="caption-uppercase">Status</span>
              <select class="text-input-on-dark" name="status">${statusOpts("prospect")}</select></label>
            <label class="human-field"><span class="caption-uppercase">Phone</span>
              <input class="text-input-on-dark" name="phone" placeholder="+44 7911 123456"></label>
          </div>
          <div class="human-form__row">
            <label class="human-field"><span class="caption-uppercase">LinkedIn</span>
              <input class="text-input-on-dark" name="linkedin_url" placeholder="https://linkedin.com/in/…"></label>
            <label class="human-field human-field--checkbox" style="align-self:end">
              <input type="checkbox" name="whatsapp_enabled" value="1">
              <span>Allow WhatsApp (read/write this contact only)</span>
            </label>
          </div>
          <label class="human-field"><span class="caption-uppercase">Notes</span>
            <textarea class="text-input-on-dark" name="notes" rows="2" placeholder="Context for follow-ups"></textarea></label>
          <div class="human-form__actions">
            <button type="submit" class="button-primary button-sm">Save contact</button>
            <button type="button" class="button-outline-on-dark button-sm" data-toggle-ui="crmFormOpen">Cancel</button>
          </div>
        </form>` : ""}
      </section>
      <section class="driver-card span-12"><p class="caption-uppercase">Follow-ups due</p><ul class="list-plain" style="margin-top:var(--space-sm)">${fu}</ul></section>
      <section class="band-light span-12">
        <p class="caption-uppercase" style="color:var(--color-muted)">Contacts (${contacts.length})</p>
        <div class="table-wrap"><table><thead><tr><th>Name</th><th>Company</th><th>Role</th><th>Status</th><th>Email</th><th>Phone</th><th>WA</th><th>Follow up</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="8" class="muted">No contacts yet — use Add contact above.</td></tr>'}</tbody></table></div>
        ${ctx.state._crmWaThread?.length ? `<div class="driver-card" style="margin-top:var(--space-md)">
          <p class="caption-uppercase">WhatsApp thread</p>
          <ul class="list-plain" style="margin-top:var(--space-sm)">${ctx.state._crmWaThread.map(m =>
            `<li><span class="muted">${ctx.esc((m.sent_at || "").slice(0, 16).replace("T", " "))}</span> `
            + `<strong>${ctx.esc(m.direction || "")}</strong>: ${ctx.esc((m.body || "").slice(0, 200))}</li>`
          ).join("")}</ul>
        </div>` : ""}
      </section>`;
  }

  function renderCrmCompaniesPanel() {
    if (ctx.state._crmCompaniesLoading) {
      return `<section class="driver-card span-12 crm-loading-panel" aria-busy="true">
        <div class="crm-skeleton crm-skeleton--title"></div>
        <div class="crm-skeleton crm-skeleton--row"></div>
        <div class="crm-skeleton crm-skeleton--row"></div>
        <div class="crm-skeleton crm-skeleton--row"></div>
      </section>`;
    }
    if (ctx.state._crmCompaniesError) {
      return `<section class="driver-card span-12 crm-error-panel">
        <p class="body-md">Could not load companies — ${ctx.esc(ctx.state._crmCompaniesError)}</p>
        <button type="button" class="button-primary button-sm" data-crm-reload>Retry</button>
      </section>`;
    }
    const companies = ctx.state._crmCompanies?.companies || [];
    const unlinked = ctx.state._crmCompanies?.meta?.unlinked_contact_companies || 0;
    const formOpen = !!ctx.state.ui?.crmCompanyFormOpen;
    const detailId = ctx.state.ui?.crmCompanyDetail;
    const wid = ctx.currentWorldId();
    const statusOpts = (cur) => ctx.COMPANY_STATUSES.map(s =>
      `<option value="${s}"${s === cur ? " selected" : ""}>${ctx.esc(s)}</option>`
    ).join("");
  
    const rows = companies.map(co => `<tr>
      <td><button type="button" class="button-tertiary-text" data-crm-company-detail="${co.id}">${ctx.esc(co.name)}</button></td>
      <td>${ctx.esc(co.sector || co.industry || "—")}</td>
      <td><span class="crm-status-pill crm-status-pill--${ctx.esc((co.status || "prospect").replace(/\s+/g, "-"))}">${ctx.esc(co.status || "prospect")}</span></td>
      <td>${co.contact_count ?? 0}</td>
      <td class="muted">${ctx.esc((co.last_contacted_at || "").slice(0, 10))}</td>
    </tr>`).join("");
  
    let detail = "";
    if (detailId) {
      const co = companies.find(c => String(c.id) === String(detailId)) || ctx.state._crmCompanyDetail?.company;
      const contacts = ctx.state._crmCompanyDetail?.contacts || [];
      if (co) {
        detail = `<aside class="crm-company-drawer driver-card">
          <div class="human-panel__head">
            <h4 class="title-sm">${ctx.esc(co.name)}</h4>
            <button type="button" class="button-outline-on-dark button-sm" data-crm-company-close>Close</button>
          </div>
          <dl class="settings-kv">
            <div class="settings-kv__row"><dt>Sector</dt><dd>${ctx.esc(co.sector || co.industry || "—")}</dd></div>
            <div class="settings-kv__row"><dt>Status</dt><dd>${ctx.esc(co.status || "prospect")}</dd></div>
            <div class="settings-kv__row"><dt>Website</dt><dd>${co.website ? `<a href="${ctx.esc(co.website)}" target="_blank" rel="noopener">${ctx.esc(co.website)}</a>` : "—"}</dd></div>
          </dl>
          ${co.research_summary ? `<p class="body-md" style="margin-top:var(--space-sm)">${ctx.esc(co.research_summary)}</p>` : ""}
          ${co.notes ? `<p class="muted body-sm">${ctx.esc(co.notes)}</p>` : ""}
          <p class="caption-uppercase" style="margin-top:var(--space-md)">Linked contacts (${contacts.length})</p>
          <ul class="list-plain">${contacts.map(c => `<li>${ctx.esc(c.name)} — ${ctx.esc(c.role || "")} ${c.email ? `<span class="muted">${ctx.esc(c.email)}</span>` : ""}</li>`).join("") || "<li class='muted'>None</li>"}</ul>
        </aside>`;
      }
    }
  
    const importBanner = unlinked > 0 ? `
      <div class="crm-import-banner">
        <div>
          <p class="body-md"><strong>${unlinked}</strong> unique company name${unlinked === 1 ? "" : "s"} on contacts not yet linked to company records.</p>
          <p class="body-sm muted">Import creates company rows and links your existing contacts automatically.</p>
        </div>
        <button type="button" class="button-primary button-sm" data-crm-import-companies>Import from contacts</button>
      </div>` : "";
  
    const emptyState = !rows ? `
      <div class="crm-empty-state">
        <p class="body-md">No company records yet.</p>
        <p class="body-sm muted">${unlinked > 0 ? "Import from contacts above, or add a company manually." : "Add companies manually, or enter company names when adding contacts."}</p>
      </div>` : "";
  
    return `
      <section class="driver-card span-12 human-panel">
        <div class="human-panel__head">
          <div>
            <h3 class="title-sm">Companies</h3>
            <p class="body-sm muted">${companies.length} account${companies.length === 1 ? "" : "s"}</p>
          </div>
          <div class="human-panel__actions">
            <button type="button" class="button-outline-on-dark button-sm" data-crm-reload>Refresh</button>
            <button type="button" class="button-primary button-sm" data-toggle-ui="crmCompanyFormOpen">${formOpen ? "Hide form" : "Add company"}</button>
          </div>
        </div>
        ${importBanner}
        ${formOpen ? `
        <form class="human-form" id="crm-company-form">
          <div class="human-form__row">
            <label class="human-field"><span class="caption-uppercase">Name</span>
              <input class="text-input-on-dark" name="name" required placeholder="Company name"></label>
            <label class="human-field"><span class="caption-uppercase">World</span>
              <select class="text-input-on-dark" name="world_id" required>${ctx.renderWorldOptionsForCrm(wid)}</select></label>
          </div>
          <div class="human-form__row">
            <label class="human-field"><span class="caption-uppercase">Sector</span>
              <input class="text-input-on-dark" name="sector" placeholder="e.g. Manufacturing"></label>
            <label class="human-field"><span class="caption-uppercase">Status</span>
              <select class="text-input-on-dark" name="status">${statusOpts("prospect")}</select></label>
          </div>
          <div class="human-form__row">
            <label class="human-field"><span class="caption-uppercase">Website</span>
              <input class="text-input-on-dark" name="website" placeholder="https://…"></label>
            <label class="human-field"><span class="caption-uppercase">LinkedIn</span>
              <input class="text-input-on-dark" name="linkedin_url" placeholder="https://linkedin.com/company/…"></label>
          </div>
          <label class="human-field"><span class="caption-uppercase">Notes</span>
            <textarea class="text-input-on-dark" name="notes" rows="2"></textarea></label>
          <div class="human-form__actions">
            <button type="submit" class="button-primary button-sm">Save company</button>
            <button type="button" class="button-outline-on-dark button-sm" data-toggle-ui="crmCompanyFormOpen">Cancel</button>
          </div>
        </form>` : ""}
      </section>
      <section class="band-light span-12 crm-companies-layout">
        ${emptyState || `<div class="table-wrap"><table><thead><tr><th>Name</th><th>Sector</th><th>Status</th><th>Contacts</th><th>Last contact</th></tr></thead>
        <tbody>${rows}</tbody></table></div>`}
        ${detail}
      </section>`;
  }

  function renderCrmPipelinePanel() {
    const pipeline = ctx.state._crm?.pipeline || {};
    const pipeRows = Object.entries(pipeline).map(([k, v]) =>
      `<div class="kv"><span class="k">${ctx.esc(k)}</span><span class="v">${v}</span></div>`
    ).join("") || "<p class='muted'>No pipeline data</p>";
    const companies = ctx.state._crmCompanies?.companies || [];
    const byStatus = {};
    companies.forEach(co => {
      const s = co.status || "prospect";
      byStatus[s] = (byStatus[s] || 0) + 1;
    });
    const coRows = Object.entries(byStatus).map(([k, v]) =>
      `<div class="kv"><span class="k">${ctx.esc(k)}</span><span class="v">${v} companies</span></div>`
    ).join("") || "<p class='muted'>No company pipeline data</p>";
  
    return `<section class="driver-card span-6"><p class="caption-uppercase">Contact pipeline</p><div style="margin-top:var(--space-sm)">${pipeRows}</div></section>
      <section class="driver-card span-6"><p class="caption-uppercase">Company pipeline</p><div style="margin-top:var(--space-sm)">${coRows}</div></section>`;
  }

  function crmOutreachWorldId() {
    return ctx.state.ui?.crmOutreachWorld || ctx.currentWorldId();
  }

  function crmOutreachStep() {
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

  function renderCrmOutreachSteps(step) {
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

  function renderCrmOutreachRunningPanel() {
    const job = ctx.state._crmOutreachJob || {};
    const camp = ctx.state._crmCampaignDetail?.campaign || ctx.state._crmCampaignReview?.campaign || {};
    const phase = job.phase || camp.status || "Starting…";
    const companies = ctx.state._crmCampaignReview?.companies || ctx.state._crmCampaignDetail?.review?.companies || [];
    const total = companies.length || camp.batch_size || "?";
    return `<section class="driver-card span-12 crm-outreach-running">
      <p class="section-eyebrow">Outreach in progress</p>
      <h3 class="title-sm">${ctx.esc(camp.name || "Campaign")}</h3>
      ${ctx.renderCrmOutreachSteps("running")}
      <div class="crm-outreach-progress-strip">
        <div class="crm-outreach-progress-strip__bar"><div class="crm-outreach-progress-strip__fill" style="width:40%"></div></div>
        <p class="body-md"><strong>${ctx.esc(phase)}</strong></p>
        <p class="muted body-sm">Researching companies via knowledge tree + web, then drafting messages. This runs in the background — you can leave this page.</p>
        <p class="muted body-sm">Batch: ${total} companies · World: <span data-active-world-label>${ctx.esc(ctx.activeWorldLabel())}</span></p>
      </div>
      <button type="button" class="button-outline-on-dark button-sm" data-crm-outreach-refresh>Refresh status</button>
    </section>`;
  }

  function renderCrmOutreachCompletePanel(review) {
    const prog = review.progress || {};
    const by = prog.by_status || {};
    return `<section class="driver-card span-12">
      <p class="section-eyebrow">Campaign complete</p>
      <h3 class="title-sm">${ctx.esc(review.campaign?.name || "Campaign")}</h3>
      ${ctx.renderCrmOutreachSteps("complete")}
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

  function renderCrmOutreachReviewPanel(review) {
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
      ${ctx.renderCrmOutreachSteps("review")}
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

  function renderCrmOutreachSetupPanel() {
    const campaigns = ctx.state._crmCampaigns?.campaigns || [];
    const wid = ctx.crmOutreachWorldId();
    const companies = (ctx.state._crmCompanies?.companies || []).filter(c => {
      if (wid && wid !== "root" && c.world_id && c.world_id !== wid) return false;
      return c.status === "prospect" || !c.status;
    });
    const batchSize = ctx.state.ui?.crmOutreachBatch || 5;
    const selected = new Set(ctx.state.ui?.crmOutreachSelected || []);
    const tree = ctx.state.worlds || ctx.state._worldFull?.worlds || {};
    const hasSubWorld = (tree.children || []).length > 0;
  
    const companyChecks = companies.map(co => {
      const on = selected.has(co.id);
      const contacts = co.contact_count || 0;
      return `<label class="crm-company-check human-field--checkbox">
        <input type="checkbox" data-crm-company-toggle="${co.id}" ${on ? "checked" : ""} ${selected.size >= batchSize && !on ? "disabled" : ""}>
        <span>${ctx.esc(co.name)} <span class="muted">${ctx.esc(co.sector || "")} · ${contacts} contact(s)</span></span>
      </label>`;
    }).join("");
  
    const batchOpts = [5, 10, 15, 20].map(n =>
      `<option value="${n}"${batchSize === n ? " selected" : ""}>${n}</option>`
    ).join("");
  
    const history = campaigns.slice(0, 12).map(c => {
      const badge = c.status === "review" ? "button-primary" : "button-tertiary-text";
      return `<tr>
        <td><button type="button" class="${badge} button-sm" data-crm-campaign="${c.id}">${ctx.esc(c.name)}</button></td>
        <td><span class="badge-pill">${ctx.esc(c.status)}</span></td>
        <td class="muted">${ctx.esc((c.created_at || "").slice(0, 10))}</td>
        <td>${c.status === "review" ? `<button type="button" class="button-outline-on-dark button-sm" data-crm-campaign="${c.id}">Continue review</button>` : ""}</td>
      </tr>`;
    }).join("") || '<tr><td colspan="4" class="muted">No campaigns yet</td></tr>';
  
    const emptyCompanies = !companies.length
      ? `<div class="crm-outreach-empty">
          <p class="body-md">No prospect companies available for this world.</p>
          <p class="body-sm muted">Go to Companies and import from your existing contacts, or add companies manually.</p>
          <div class="human-form__actions">
            <button type="button" class="button-primary button-sm" data-crm-tab="companies">Open companies</button>
          </div>
        </div>`
      : `<p class="caption-uppercase">Companies (${selected.size}/${batchSize} selected)</p>
         <div class="crm-company-checklist">${companyChecks}</div>`;
  
    return `<section class="driver-card span-12 human-panel">
      <div class="human-panel__head">
        <div>
          <h3 class="title-sm">Batch outreach</h3>
          <p class="body-sm muted">Research, strategy, and personalized drafts — you approve every send.</p>
        </div>
      </div>
      ${ctx.renderCrmOutreachSteps("setup")}
      ${!hasSubWorld ? `<p class="crm-outreach-warn">Create a sub-world under <strong>World</strong> first — outreach requires a venture context for vault research.</p>` : ""}
      <form class="human-form" id="crm-outreach-form" style="margin-top:var(--space-md)">
        <div class="human-form__row">
          <label class="human-field"><span class="caption-uppercase">World (required)</span>
            <select class="text-input-on-dark" name="world_id" id="crm-outreach-world">${ctx.renderWorldOptionsForCrm(wid)}</select></label>
          <label class="human-field"><span class="caption-uppercase">Batch size</span>
            <select class="text-input-on-dark" name="batch_size" id="crm-outreach-batch">${batchOpts}</select></label>
        </div>
        <label class="human-field"><span class="caption-uppercase">Outreach brief</span>
          <textarea class="text-input-on-dark" name="brief" rows="3" placeholder="e.g. Indian manufacturing SMBs — energy cost savings, 15-min discovery call, direct tone"></textarea></label>
        ${emptyCompanies}
        <div class="human-form__actions">
          <button type="submit" class="button-primary button-sm" ${selected.size && wid !== "root" ? "" : "disabled"}>
            Start outreach (${selected.size || 0} companies)
          </button>
        </div>
      </form>
      <section style="margin-top:var(--space-lg)">
        <p class="caption-uppercase">Recent campaigns</p>
        <div class="table-wrap"><table><thead><tr><th>Campaign</th><th>Status</th><th>Created</th><th></th></tr></thead><tbody>${history}</tbody></table></div>
      </section>
    </section>`;
  }

  function renderCrmOutreachPanel() {
    const step = ctx.crmOutreachStep();
    const review = ctx.state._crmCampaignReview;
  
    if (step === "running") return ctx.renderCrmOutreachRunningPanel();
    if (step === "complete" && review?.campaign) return ctx.renderCrmOutreachCompletePanel(review);
    if (step === "review" && review?.campaign) return ctx.renderCrmOutreachReviewPanel(review);
    return ctx.renderCrmOutreachSetupPanel();
  }

  function renderCrm() {
    const tab = ctx.crmTab();
    const counts = {
      contacts: ctx.state._crm?.contacts?.length || 0,
      companies: ctx.state._crmCompanies?.companies?.length || 0,
    };
    let body = "";
    if (tab === "contacts") body = ctx.renderCrmContactsPanel();
    else if (tab === "companies") body = ctx.renderCrmCompaniesPanel();
    else if (tab === "pipeline") body = ctx.renderCrmPipelinePanel();
    else body = ctx.renderCrmOutreachPanel();
  
    return `<div class="dashboard-grid">
      <section class="driver-card span-12 crm-shell">
        <div class="human-panel__head crm-shell__head">
          <div>
            <h2 class="title-md" style="text-wrap:balance">CRM</h2>
            <p class="body-sm muted">Contacts, companies, pipeline, and batch outreach in one place.</p>
          </div>
        </div>
        ${ctx.renderCrmTabs(counts)}
      </section>
      ${body}
    </div>`;
  }

  async function loadCrmData() {
    const tab = ctx.crmTab();
    if (!ctx.state.ui) ctx.state.ui = {};
    if (!ctx.state.ui.crmOutreachWorld) ctx.state.ui.crmOutreachWorld = ctx.currentWorldId();
    const wid = tab === "outreach" ? ctx.crmOutreachWorldId() : ctx.currentWorldId();
    const companiesQ = tab === "companies"
      ? "?include_unassigned=1"
      : (wid && wid !== "root"
        ? `?world_id=${encodeURIComponent(wid)}&include_unassigned=1`
        : "?include_unassigned=1");
    const worldQ = wid && wid !== "root" ? `?world_id=${encodeURIComponent(wid)}` : "";
    ctx.state._crmCompaniesLoading = true;
    ctx.state._crmCompaniesError = null;
    try {
      const [crm, companies, campaigns] = await Promise.all([
        ctx.api("/crm/contacts"),
        ctx.api(`/crm/companies${companiesQ}`),
        tab === "outreach" ? ctx.api(`/crm/outreach/campaigns${worldQ}`).catch(() => ({ campaigns: [] })) : Promise.resolve(ctx.state._crmCampaigns || { campaigns: [] }),
      ]);
      ctx.state._crm = crm;
      ctx.state._crmCompanies = companies;
      if (tab === "outreach") {
        ctx.state._crmCampaigns = campaigns;
        if (ctx.state.ui?.crmCampaignId) {
          const cid = ctx.state.ui.crmCampaignId;
          const [detail, review] = await Promise.all([
            ctx.api(`/crm/outreach/campaigns/${cid}`).catch(() => null),
            ctx.api(`/crm/outreach/campaigns/${cid}/review`).catch(() => null),
          ]);
          ctx.state._crmCampaignDetail = detail;
          ctx.state._crmCampaignReview = review?.campaign ? review : detail?.review;
          const camp = ctx.state._crmCampaignReview?.campaign || detail?.campaign;
          if (camp && ["researching", "drafting", "created"].includes(camp.status)) {
            ctx.state._crmOutreachJob = { active: true, phase: camp.status, status: camp.status };
            if (!ctx.state._crmOutreachPollId) ctx.pollCrmOutreachJob(cid);
          } else if (camp?.status === "review") {
            ctx.state._crmOutreachJob = { phase: "Ready for review", active: false };
          }
        }
      }
    } catch (e) {
      ctx.state._crmCompaniesError = e.message || "Could not load CRM data";
    } finally {
      ctx.state._crmCompaniesLoading = false;
    }
  }

  async function submitCrmContact(form) {
    const fd = new FormData(form);
    const name = (fd.get("name") || "").toString().trim();
    if (!name) return;
    const companyId = (fd.get("company_id") || "").toString().trim();
    try {
      await ctx.api("/crm/contacts", {
        method: "POST",
        body: JSON.stringify({
          name,
          company_id: companyId ? parseInt(companyId, 10) : null,
          role: (fd.get("role") || "").toString().trim(),
          email: (fd.get("email") || "").toString().trim(),
          status: (fd.get("status") || "prospect").toString(),
          linkedin_url: (fd.get("linkedin_url") || "").toString().trim(),
          phone: (fd.get("phone") || "").toString().trim(),
          whatsapp_enabled: fd.get("whatsapp_enabled") === "1",
          notes: (fd.get("notes") || "").toString().trim(),
        }),
      });
      await ctx.loadCrmData();
      if (ctx.state.ui) ctx.state.ui.crmFormOpen = false;
      await ctx.refresh();
      ctx.render();
      form.reset();
    } catch (e) { alert(e.message); }
  }

  async function importCrmCompaniesFromContacts() {
    const wid = ctx.currentWorldId();
    const world_id = wid && wid !== "root" ? wid : null;
    try {
      const res = await ctx.api("/crm/companies/import-from-contacts", {
        method: "POST",
        body: JSON.stringify({ world_id }),
      });
      await ctx.loadCrmData();
      ctx.render();
      const msg = `Imported ${res.created || 0} companies and linked ${res.linked_contacts || 0} contacts.`;
      if (ctx.state._toast) ctx.state._toast(msg);
      else alert(msg);
    } catch (e) { alert(e.message); }
  }

  async function submitCrmCompany(form) {
    const fd = new FormData(form);
    const name = (fd.get("name") || "").toString().trim();
    const world_id = (fd.get("world_id") || "").toString().trim();
    if (!name || !world_id) return;
    try {
      await ctx.api("/crm/companies", {
        method: "POST",
        body: JSON.stringify({
          name,
          world_id,
          sector: (fd.get("sector") || "").toString().trim(),
          status: (fd.get("status") || "prospect").toString(),
          website: (fd.get("website") || "").toString().trim(),
          linkedin_url: (fd.get("linkedin_url") || "").toString().trim(),
          notes: (fd.get("notes") || "").toString().trim(),
        }),
      });
      await ctx.loadCrmData();
      if (ctx.state.ui) ctx.state.ui.crmCompanyFormOpen = false;
      ctx.render();
      form.reset();
    } catch (e) { alert(e.message); }
  }

  async function openCrmCompanyDetail(cid) {
    if (!cid) return;
    try {
      const res = await ctx.api(`/crm/companies/${encodeURIComponent(cid)}`);
      ctx.state._crmCompanyDetail = res;
      if (!ctx.state.ui) ctx.state.ui = {};
      ctx.state.ui.crmCompanyDetail = cid;
      ctx.render();
    } catch (e) { alert(e.message); }
  }

  async function submitCrmOutreach(form) {
    const fd = new FormData(form);
    const world_id = (fd.get("world_id") || "").toString().trim();
    const batch_size = parseInt(fd.get("batch_size") || "5", 10) || 5;
    const brief = (fd.get("brief") || "").toString().trim();
    const company_ids = ctx.state.ui?.crmOutreachSelected || [];
    if (!world_id || world_id === "root") return alert("Select a sub-world for outreach (not Main world).");
    if (!company_ids.length) return alert("Select at least one company.");
    if (!brief) return alert("Add a brief so the agent knows what kind of message to write.");
    try {
      const created = await ctx.api("/crm/outreach/campaigns", {
        method: "POST",
        body: JSON.stringify({ world_id, batch_size, brief, company_ids }),
      });
      const start = await ctx.api(`/crm/outreach/campaigns/${created.campaign_id}/start`, { method: "POST" });
      ctx.state._crmOutreachJob = { ...(start.job || {}), active: true, phase: "Starting…" };
      if (!ctx.state.ui) ctx.state.ui = {};
      ctx.state.ui.crmCampaignId = created.campaign_id;
      ctx.state.ui.crmOutreachSelected = [];
      ctx.state.ui.crmTab = "outreach";
      ctx.render();
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
          ctx.render();
          return;
        }
        ctx.state._crmOutreachJob = { active: true, phase: job.phase || camp.status || "running…", status: camp.status };
        ctx.render();
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
    if (!ctx.state.ui) ctx.state.ui = {};
    ctx.state.ui.crmTab = "outreach";
    ctx.state.ui.crmCampaignId = campaignId;
    localStorage.setItem("fos_crm_tab", "outreach");
    try {
      ctx.state._crmCampaignReview = await ctx.api(`/crm/outreach/campaigns/${campaignId}/review`);
      ctx.render();
    } catch (e) { alert(e.message); }
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
      await ctx.loadCrmData();
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

  async function updateCrmStatus(cid, status) {
    if (!cid || !status) return;
    try {
      await ctx.api(`/crm/contacts/${encodeURIComponent(cid)}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      ctx.state._crm = await ctx.api("/crm/contacts");
      await ctx.refresh();
      ctx.render();
    } catch (e) { alert(e.message); }
  }

  async function updateCrmWhatsapp(cid, enabled) {
    if (!cid) return;
    try {
      await ctx.api(`/crm/contacts/${encodeURIComponent(cid)}`, {
        method: "PATCH",
        body: JSON.stringify({ whatsapp_enabled: !!enabled }),
      });
      ctx.state._crm = await ctx.api("/crm/contacts");
      await ctx.refresh();
      ctx.render();
    } catch (e) { alert(e.message); }
  }

  async function loadCrmWaThread(cid) {
    if (!cid) return;
    try {
      const res = await ctx.api(`/whatsapp/messages?contact_id=${encodeURIComponent(cid)}`);
      ctx.state._crmWaThread = res.messages || [];
      ctx.render();
    } catch (e) { alert(e.message); }
  }

  async function scheduleCrmFollowup(contactId, days) {
    const d = parseInt(days, 10) || 7;
    await ctx.api(`/crm/contacts/${contactId}/followup`, {
      method: "POST",
      body: JSON.stringify({ days: d }),
      timeoutMs: 15000,
    });
    ctx.state._crm = await ctx.api("/crm/contacts");
    if (ctx.currentView === "crm") ctx.render();
  }

  ctx.crmTab = crmTab;
  ctx.renderWorldOptionsForCrm = renderWorldOptionsForCrm;
  ctx.renderCrmTabs = renderCrmTabs;
  ctx.renderCrmContactsPanel = renderCrmContactsPanel;
  ctx.renderCrmCompaniesPanel = renderCrmCompaniesPanel;
  ctx.renderCrmPipelinePanel = renderCrmPipelinePanel;
  ctx.crmOutreachWorldId = crmOutreachWorldId;
  ctx.crmOutreachStep = crmOutreachStep;
  ctx.renderCrmOutreachSteps = renderCrmOutreachSteps;
  ctx.renderCrmOutreachRunningPanel = renderCrmOutreachRunningPanel;
  ctx.renderCrmOutreachCompletePanel = renderCrmOutreachCompletePanel;
  ctx.renderCrmOutreachReviewPanel = renderCrmOutreachReviewPanel;
  ctx.renderCrmOutreachSetupPanel = renderCrmOutreachSetupPanel;
  ctx.renderCrmOutreachPanel = renderCrmOutreachPanel;
  ctx.renderCrm = renderCrm;
  ctx.loadCrmData = loadCrmData;
  ctx.submitCrmContact = submitCrmContact;
  ctx.importCrmCompaniesFromContacts = importCrmCompaniesFromContacts;
  ctx.submitCrmCompany = submitCrmCompany;
  ctx.openCrmCompanyDetail = openCrmCompanyDetail;
  ctx.submitCrmOutreach = submitCrmOutreach;
  ctx.pollCrmOutreachJob = pollCrmOutreachJob;
  ctx.openCrmCampaignReview = openCrmCampaignReview;
  ctx.skipCrmCompany = skipCrmCompany;
  ctx.saveCrmDraftEdits = saveCrmDraftEdits;
  ctx.approveCrmDraft = approveCrmDraft;
  ctx.skipCrmDraft = skipCrmDraft;
  ctx.updateCrmStatus = updateCrmStatus;
  ctx.updateCrmWhatsapp = updateCrmWhatsapp;
  ctx.loadCrmWaThread = loadCrmWaThread;
  ctx.scheduleCrmFollowup = scheduleCrmFollowup;
}
