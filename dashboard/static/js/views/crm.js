/** @module views/crm — contacts, companies, pipeline */
export function registerViewsCrm(ctx) {
  function crmTab() {
    const tab = ctx.state.ui?.crmTab || localStorage.getItem("fos_crm_tab") || "contacts";
    if (tab === "outreach") return "contacts";
    return tab;
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
            <button type="button" class="button-outline-on-dark button-sm" data-goto="outreach">Start outreach</button>
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

  function renderCrm() {
    const tab = ctx.crmTab();
    const counts = {
      contacts: ctx.state._crm?.contacts?.length || 0,
      companies: ctx.state._crmCompanies?.companies?.length || 0,
    };
    let body = "";
    if (tab === "contacts") body = ctx.renderCrmContactsPanel();
    else if (tab === "companies") body = ctx.renderCrmCompaniesPanel();
    else body = ctx.renderCrmPipelinePanel();

    return `<div class="dashboard-grid">
      <section class="driver-card span-12 crm-shell">
        <div class="human-panel__head crm-shell__head">
          <div>
            <h2 class="title-md" style="text-wrap:balance">CRM</h2>
            <p class="body-sm muted">Contacts, companies, and pipeline. Batch outreach lives on the <button type="button" class="button-tertiary-text button-sm" data-goto="outreach">Outreach</button> page.</p>
          </div>
        </div>
        ${ctx.renderCrmTabs(counts)}
      </section>
      ${body}
    </div>`;
  }

  async function loadCrmData() {
    const tab = ctx.crmTab();
    const wid = ctx.currentWorldId();
    const companiesQ = tab === "companies"
      ? "?include_unassigned=1"
      : (wid && wid !== "root"
        ? `?world_id=${encodeURIComponent(wid)}&include_unassigned=1`
        : "?include_unassigned=1");
    ctx.state._crmCompaniesLoading = true;
    ctx.state._crmCompaniesError = null;
    try {
      const [crm, companies] = await Promise.all([
        ctx.api("/crm/contacts"),
        ctx.api(`/crm/companies${companiesQ}`),
      ]);
      ctx.state._crm = crm;
      ctx.state._crmCompanies = companies;
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
  ctx.renderCrm = renderCrm;
  ctx.loadCrmData = loadCrmData;
  ctx.submitCrmContact = submitCrmContact;
  ctx.importCrmCompaniesFromContacts = importCrmCompaniesFromContacts;
  ctx.submitCrmCompany = submitCrmCompany;
  ctx.openCrmCompanyDetail = openCrmCompanyDetail;
  ctx.updateCrmStatus = updateCrmStatus;
  ctx.updateCrmWhatsapp = updateCrmWhatsapp;
  ctx.loadCrmWaThread = loadCrmWaThread;
  ctx.scheduleCrmFollowup = scheduleCrmFollowup;
}
