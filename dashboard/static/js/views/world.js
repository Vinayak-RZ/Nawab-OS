/** @module views/world — auto-split from app.js */
export function registerViewsWorld(ctx) {
  function renderWorldOptionsForDocs(selectedWorldId) {
    const tree = ctx.state.worlds || ctx.state._worldFull?.worlds || {};
    const root = tree.root;
    const children = tree.children || [];
    const sel = selectedWorldId || "";
    let html = `<option value="root"${sel === "root" || !sel ? " selected" : ""}>${ctx.esc(root?.name || "Main world")}</option>`;
    html += children.map(c =>
      `<option value="${ctx.esc(c.id)}"${sel === c.id ? " selected" : ""}>${ctx.esc(c.name)} · ${ctx.esc(c.kind || "project")}</option>`
    ).join("");
    return html;
  }

  function githubRepoDocuments(vault, fullName) {
    const facets = vault?.facets || vault?.folders || [];
    const docs = [];
    for (const facet of facets) {
      for (const doc of facet.documents || []) {
        if (doc.github_repo === fullName) docs.push(doc);
      }
    }
    return docs.sort((a, b) => (a.github_path || a.filename || "").localeCompare(b.github_path || b.filename || ""));
  }

  function findReadmeDoc(docs) {
    const readmes = docs.filter(d => {
      const path = d.github_path || d.filename || "";
      return /^readme\.md$/i.test(path.split("/").pop() || "");
    });
    if (!readmes.length) return null;
    return readmes.sort((a, b) => (a.github_path || a.filename || "").length - (b.github_path || b.filename || "").length)[0];
  }

  function countGithubTreeFiles(node) {
    let n = (node.files || []).length;
    for (const k of Object.keys(node.dirs || {})) n += ctx.countGithubTreeFiles(node.dirs[k]);
    return n;
  }

  function renderGithubTreeNode(node, worldId, depth = 0) {
    const dirKeys = Object.keys(node.dirs || {}).sort();
    const files = (node.files || []).sort((a, b) => a._fileName.localeCompare(b._fileName));
    let html = "";
    for (const k of dirKeys) {
      const child = node.dirs[k];
      const fileCount = ctx.countGithubTreeFiles(child);
      html += `<details class="github-tree-dir"${depth < 2 ? " open" : ""}>
        <summary><span class="mono">${ctx.esc(k)}</span> <span class="muted">${fileCount} file${fileCount !== 1 ? "s" : ""}</span></summary>
        <div class="github-tree">${ctx.renderGithubTreeNode(child, worldId, depth + 1)}</div>
      </details>`;
    }
    for (const d of files) {
      const path = d.github_path || d.filename || d.title;
      const isReadme = /^readme\.md$/i.test((path || "").split("/").pop() || "");
      html += `<div class="github-tree-file">
        <span class="github-tree-file__path mono${isReadme ? " is-readme" : ""}">${ctx.esc(path)}</span>
        <span class="github-tree-file__actions">
          <button type="button" class="button-outline-on-dark button-sm" data-vault-view-doc="${d.id}" data-world-id="${ctx.esc(worldId)}" data-doc-title="${ctx.esc(d.title || path)}">View</button>
          <button type="button" class="button-primary button-sm" data-tag-vault-doc="${d.id}" data-world-id="${ctx.esc(worldId)}" data-doc-title="${ctx.esc(d.title || path)}" data-doc-path="${ctx.esc(path)}">Tag in agent</button>
        </span>
      </div>`;
    }
    return html;
  }

  function tagVaultDocInChat(docId, worldId, title, path) {
    if (!ctx.state._chatAttachments) ctx.state._chatAttachments = [];
    const id = Number(docId);
    if (!ctx.state._chatAttachments.some(a => a.doc_id === id)) {
      ctx.state._chatAttachments.push({
        type: "vault",
        doc_id: id,
        title: title || path || "Document",
        path: path || "",
        world_id: worldId,
      });
    }
    ctx.goView("chat");
  }

  function buildVaultGraph(vault, world) {
    if (vault?.nodes && vault?.edges) return vault;
    const v = vault?.vault || vault || {};
    const w = world || {};
    const nodes = [];
    const edges = [];
    const wid = w.id || v.world_id || "world";
    const worldNid = `vault-world:${wid}`;
    nodes.push({ data: { id: worldNid, label: (w.name || "World").slice(0, 36), type: "world_root", world_id: wid } });
  
    const facets = v.facets || v.folders || [];
    facets.forEach((facet) => {
      const fid = facet.id || facet.folder || "slot";
      const fnid = `vault-facet:${wid}:${fid}`;
      const label = `${facet.label || facet.folder || "Folder"} (${facet.file_count || 0})`;
      nodes.push({ data: { id: fnid, label: label.slice(0, 40), type: "vault_facet", facet_id: fid, folder: facet.folder } });
      edges.push({ data: { source: worldNid, target: fnid, label: "folder" } });
      (facet.documents || []).slice(0, 14).forEach((doc, i) => {
        const did = `vault-doc:${doc.id || i}`;
        nodes.push({
          data: {
            id: did,
            label: (doc.title || doc.filename || "Document").slice(0, 36),
            type: "vault_file",
            doc_id: doc.id,
            facet_id: fid,
            source: doc.source_type || "upload",
          },
        });
        edges.push({ data: { source: fnid, target: did, label: "doc" } });
      });
      (facet.files || []).slice(0, 8).forEach((file, i) => {
        const dnid = `vault-disk:${wid}:${fid}:${i}`;
        nodes.push({
          data: {
            id: dnid,
            label: (file.name || file.relative || "file").slice(0, 32),
            type: "vault_file",
            path: file.relative,
            facet_id: fid,
            source: "disk",
          },
        });
        edges.push({ data: { source: fnid, target: dnid, label: "disk" } });
      });
    });
    (v.github_repos || []).slice(0, 10).forEach((repo) => {
      const rid = `gh-repo:${repo.id}`;
      nodes.push({
        data: {
          id: rid,
          label: (repo.full_name || "repo").split("/").pop().slice(0, 28),
          type: "vault_repo",
          link_id: repo.id,
          repo: repo.full_name,
        },
      });
      edges.push({ data: { source: worldNid, target: rid, label: "github" } });
    });
    if (nodes.length <= 1) {
      nodes.push({ data: { id: "vault-empty", label: "Add docs or link GitHub", type: "empty" } });
      edges.push({ data: { source: worldNid, target: "vault-empty", label: "start" } });
    }
    return { nodes, edges };
  }

  function vaultGraphForWorld(world) {
    const wid = world?.id;
    if (!wid || wid === "root") return { nodes: [], edges: [] };
    if (ctx.state._vaultLoading && ctx.state._vaultWorldId !== wid) {
      return { nodes: [{ data: { id: "vault-loading", label: "Loading vault…", type: "loading" } }], edges: [] };
    }
    if (ctx.state._vaultWorldId === wid && ctx.state._vaultGraph?.nodes?.length) return ctx.state._vaultGraph;
    const vault = ctx.vaultReadyFor(wid) ? ctx.vaultPayload() : null;
    if (vault) return ctx.buildVaultGraph(vault, world);
    if (ctx.state._vaultLoading) {
      return { nodes: [{ data: { id: "vault-loading", label: "Loading vault…", type: "loading" } }], edges: [] };
    }
    return { nodes: [{ data: { id: "vault-empty", label: "Vault not loaded", type: "empty" } }], edges: [] };
  }

  function worldGraphLegendHtml(tab) {
    if (tab === "vault") {
      return `
        <span><i style="border-color:#051f13"></i> World</span>
        <span><i style="border-color:#00666b"></i> Folder</span>
        <span><i style="border-color:#8f706b;border-radius:50%"></i> File</span>
        <span><i style="border-color:#f75440;background:#2d312e"></i> GitHub</span>`;
    }
    return `
      <span><i style="border-color:#051f13"></i> Main</span>
      <span><i style="border-color:#f75440"></i> Project</span>
      <span><i style="border-color:#ffb4a8"></i> Idea</span>
      <span><i style="border-color:#00666b"></i> Research</span>
      <span><i style="border-color:#f75440;background:#f7544033"></i> Active</span>`;
  }

  function renderWorldCreateForm(formId = "world-create-form") {
    return `
      <form class="world-form human-form" id="${ctx.esc(formId)}">
        <div class="human-form__row">
          <label class="human-field"><span class="caption-uppercase">Name</span>
            <input class="text-input-on-dark" name="name" placeholder="e.g. Stamped Energy" required></label>
          <label class="human-field"><span class="caption-uppercase">Category</span>
            <select class="text-input-on-dark" name="kind" id="world-create-kind">
              <option value="project">Startup / venture</option>
              <option value="technical">Technical project</option>
              <option value="idea">Idea / exploration</option>
              <option value="research">Technical research</option>
            </select></label>
          <label class="human-field"><span class="caption-uppercase">Knowledge template</span>
            <select class="text-input-on-dark" name="template">
              <option value="startup">Startup — ICP, GTM, product, leads…</option>
              <option value="technical">Technical — architecture, stack, ADRs…</option>
              <option value="idea">Idea — hypothesis, research, next steps</option>
              <option value="research">Research — papers, synthesis, industry</option>
            </select></label>
        </div>
        <label class="human-field"><span class="caption-uppercase">Description</span>
          <input class="text-input-on-dark" name="description" placeholder="One-line summary"></label>
        <label class="human-field"><span class="caption-uppercase">Context for agents</span>
          <textarea class="text-input-on-dark" name="context" rows="3" placeholder="What should agents know when this world is active?"></textarea></label>
        <div class="human-form__row">
          <label class="human-field"><span class="caption-uppercase">Local docs path</span>
            <input class="text-input-on-dark" name="repo_path" placeholder="Optional: C:\\docs\\my-project"></label>
          <label class="human-field"><span class="caption-uppercase">GitHub repo</span>
            <input class="text-input-on-dark" name="github_repo" placeholder="Optional: owner/repo"></label>
        </div>
        <div class="human-form__actions">
          <button type="submit" class="button-primary button-sm">Create world</button>
          <button type="button" class="button-outline-on-dark button-sm" data-toggle-ui="worldCreateOpen">Cancel</button>
        </div>
      </form>`;
  }

  function worldById(id) {
    const tree = ctx.worldTreeData();
    const wid = id || "root";
    if (wid === "root" || wid === tree.root?.id) return tree.root || null;
    return (tree.children || []).find(c => c.id === wid) || null;
  }

  function inspectorWorldId() {
    return ctx.state.inspectorWorldId || ctx.currentWorldId() || "root";
  }

  async function loadWorldVault(worldId, { force = false } = {}) {
    if (!worldId || worldId === "root") {
      ctx.clearVaultScopedState();
      ctx.invalidateGraphCache("graph-world");
      return;
    }
    if (!force && ctx.vaultReadyFor(worldId)) return;
  
    const gen = ++ctx.vaultLoadGen;
    ctx.state._vaultLoading = true;
    ctx.state._vaultWorldId = worldId;
    if (ctx.currentView === "world") ctx.patchWorldPanels();
  
    try {
      const res = await ctx.api(`/worlds/${encodeURIComponent(worldId)}/vault`);
      if (gen !== ctx.vaultLoadGen) return;
      ctx.state._worldVault = res.vault || null;
      ctx.state._vaultGraph = res.vault_graph || null;
      ctx.state._vaultWorldId = worldId;
      ctx.invalidateGraphCache("graph-world");
    } catch (_) {
      if (gen !== ctx.vaultLoadGen) return;
      ctx.clearVaultScopedState();
    } finally {
      if (gen === ctx.vaultLoadGen) ctx.state._vaultLoading = false;
    }
  }

  async function reloadVault(worldId, opts = {}) {
    if (!worldId || worldId === "root") {
      ctx.clearVaultScopedState();
      return;
    }
    if (opts.force) ctx.state._vaultWorldId = null;
    await ctx.loadWorldVault(worldId, { force: true });
  }

  async function reloadWorldTree() {
    try {
      const w = await ctx.api("/graph/world");
      ctx.state._worldFull = w;
      ctx.state._worldGraph = w?.graph ?? null;
      ctx.state._worldHierarchyGraph = w?.hierarchy_graph ?? null;
      ctx.state._worldPreviews = w?.world_previews ?? {};
      if (w?.worlds) ctx.state.worlds = w.worlds;
      ctx.populateWorldSelect();
      ctx.invalidateGraphCache("graph-world");
    } catch (e) {
      console.warn("world tree reload failed:", e);
    }
  }

  async function ensureVaultForWorld(worldId, opts = {}) {
    if (!worldId || worldId === "root") {
      ctx.clearVaultScopedState();
      return;
    }
    if (!opts.force && ctx.vaultReadyFor(worldId)) return;
    await ctx.loadWorldVault(worldId, { force: !!opts.force });
  }

  function patchWorldTreeNav() {
    const inspectId = ctx.inspectorWorldId();
    const activeId = ctx.state.activeWorldId || "root";
    ctx.$("[data-inspect-world]").forEach(btn => {
      const id = btn.dataset.inspectWorld;
      btn.classList.toggle("is-inspect", id === inspectId);
      btn.classList.toggle("is-active", id === activeId);
    });
    const heroActive = document.querySelector(".worlds-stat [data-active-world-label]");
    if (heroActive) heroActive.textContent = ctx.activeWorldLabel();
  }

  function patchWorldPanels() {
    if (ctx.currentView !== "world") return;
    const inspectId = ctx.inspectorWorldId();
    const selected = ctx.worldById(inspectId);
    const snap = ctx.state._worldFull?.snapshot || ctx.state.snapshot || {};
  
    const insp = document.getElementById("world-inspector");
    if (insp) insp.innerHTML = ctx.renderWorldInspector(selected, snap);
  
    const mount = document.getElementById("world-vault-mount");
    if (!ctx.isRootWorld(selected)) {
      const html = ctx.renderWorldVaultPanel(selected);
      if (mount) mount.innerHTML = html;
    } else if (mount) mount.innerHTML = "";
  
    ctx.patchWorldTreeNav();
    ctx.drawGraphs();
  }

  async function onWorldContextChanged(opts = {}) {
    const activeId = ctx.currentWorldId();
    const inspectId = ctx.inspectorWorldId();
    const vaultWorldId = opts.vaultWorldId
      || (ctx.currentView === "world" ? inspectId : activeId);
  
    if (!vaultWorldId || vaultWorldId === "root") {
      ctx.clearVaultScopedState();
    } else {
      await ctx.ensureVaultForWorld(vaultWorldId, { force: !!opts.forceVault });
    }
  
    if (ctx.currentView === "world" && opts.reloadTree) {
      await ctx.reloadWorldTree();
    } else if (ctx.currentView === "world" || ctx.currentView === "dashboard") {
      await ctx.loadGraphData();
    }
    ctx.drawGraphs();
  }

  function selectInspectorWorld(id) {
    const nextId = id || "root";
    if (ctx.inspectorWorldId() === nextId && ctx.vaultReadyFor(nextId) && !ctx.state._vaultLoading) return;
    ctx.state.inspectorWorldId = nextId;
    if (ctx.currentView !== "world") return;
    ctx.state._motionSkipOnce = true;
    if (!ctx.state.ui) ctx.state.ui = {};
    ctx.state.ui.vaultFacet = null;
    ctx.clearVaultScopedState();
    ctx.invalidateGraphCache("graph-world");
    ctx.patchWorldPanels();
    ctx.reloadVault(nextId, { force: true }).then(() => {
      ctx.patchWorldPanels();
      FOSMotion?.flashElement?.(ctx.$("#world-inspector"));
      window.FOSGraph?.highlightWorld("graph-world", ctx.inspectorWorldId(), ctx.currentWorldId());
    }).catch(console.error);
  }

  function renderWorldTreeNav(root, children, inspectId, activeId) {
    const rootId = root?.id || "root";
    const rootBtn = `
      <button type="button" class="world-tree-item is-root${inspectId === rootId ? " is-inspect" : ""}${activeId === rootId ? " is-active" : ""}"
        data-inspect-world="${ctx.esc(rootId)}">
        <span class="dot" aria-hidden="true"></span>
        <span class="meta">
          <span class="name">${ctx.esc(root?.name || "Main world")}</span>
          <span class="sub">Top-level · all ventures</span>
        </span>
      </button>`;
    const childBtns = children.map(c => `
      <button type="button" class="world-tree-item kind-${ctx.esc(c.kind || "project")}${inspectId === c.id ? " is-inspect" : ""}${activeId === c.id ? " is-active" : ""}"
        data-inspect-world="${ctx.esc(c.id)}">
        <span class="dot" aria-hidden="true"></span>
        <span class="meta">
          <span class="name">${ctx.esc(c.name)}</span>
          <span class="sub">${ctx.esc(c.kind || "project")} · ${ctx.esc((c.description || "No description").slice(0, 42))}</span>
        </span>
      </button>`).join("");
    return `
      <nav class="world-tree-nav" aria-label="World hierarchy">
        ${rootBtn}
        ${children.length ? `<div class="world-tree-children">${childBtns}</div>` : ""}
      </nav>`;
  }

  function renderWorldInspector(w, snap) {
    if (!w) return `<p class="body-md muted">Select a world to inspect its context.</p>`;
    const id = w.id || "root";
    const isRoot = id === "root";
    const kind = isRoot ? "root" : (w.kind || "project");
    const activeId = ctx.currentWorldId();
    const previews = ctx.state._worldPreviews || ctx.state._worldFull?.world_previews || {};
    const preview = previews[id] || "";
    const crm = snap?.crm || {};
    const fin = snap?.finance || {};
    const editing = ctx.state.worldEditing === id;
  
    if (editing) {
      return `
        <form class="world-edit-form" id="world-edit-form" data-world-id="${ctx.esc(id)}">
          <div class="world-inspector-title">
            <h2>Edit ${ctx.esc(w.name)}</h2>
            ${ctx.worldKindBadge(kind)}
          </div>
          ${!isRoot ? `
            <label>Name<input class="text-input-on-dark" name="name" value="${ctx.esc(w.name || "")}" required></label>
            <label>Category
              <select class="text-input-on-dark" name="kind" id="world-edit-kind">
                <option value="project"${w.kind === "project" ? " selected" : ""}>Startup / venture</option>
                <option value="idea"${w.kind === "idea" ? " selected" : ""}>Idea</option>
                <option value="research"${w.kind === "research" ? " selected" : ""}>Technical research</option>
                <option value="technical"${w.kind === "technical" ? " selected" : ""}>Technical project</option>
              </select>
            </label>
            <label>Knowledge template
              <select class="text-input-on-dark" name="template" id="world-edit-template">
                ${(ctx.state._worldTemplates || []).map(t =>
                  `<option value="${ctx.esc(t.id)}"${(w.template || "") === t.id ? " selected" : ""}>${ctx.esc(t.label)}</option>`
                ).join("") || `<option value="startup"${(w.template || "startup") === "startup" ? " selected" : ""}>Startup / venture</option>`}
              </select>
            </label>` : `
            <label>Name<input class="text-input-on-dark" name="name" value="${ctx.esc(w.name || "")}"></label>`}
          <label>Description<textarea class="text-input-on-dark" name="description" rows="2">${ctx.esc(w.description || "")}</textarea></label>
          <label>Agent context<textarea class="text-input-on-dark" name="context" rows="5">${ctx.esc(w.context || "")}</textarea></label>
          <div class="world-inspector-actions">
            <button type="submit" class="button-primary button-sm">Save</button>
            <button type="button" class="button-tertiary-text button-sm" data-cancel-edit>Cancel</button>
          </div>
        </form>`;
    }
  
    const globalFacts = isRoot ? [
      ["Contacts", crm.total_contacts || 0],
      ["Follow-ups", crm.followups_due || 0],
      ["Open tasks", snap?.tasks_open || 0],
      ["Approvals", snap?.approvals_pending || 0],
    ] : [];
    if (isRoot && fin?.set) {
      globalFacts.push(["Runway", fin.runway_months != null ? `${fin.runway_months} mo` : "—"]);
    }
  
    const childIndex = isRoot ? (ctx.worldTreeData().children || []) : [];
    const goals = (snap?.goals_active || []).slice(0, 5);
  
    return `
      <div class="world-inspector-title">
        <div>
          <h2>${ctx.esc(w.name)}</h2>
          <p class="world-meta">id: ${ctx.esc(id)}${w.updated_at ? ` · updated ${ctx.esc(w.updated_at)}` : ""}</p>
        </div>
        ${ctx.worldKindBadge(kind)}
      </div>
      ${activeId === id
        ? `<p class="world-meta" style="color:var(--color-primary)">● Active for chat &amp; agents</p>`
        : `<p class="world-meta">Not active — switch from the top bar or below</p>`}
      <div class="world-inspector-section">
        <h4>Description</h4>
        <p>${ctx.esc(w.description || "No description yet.")}</p>
      </div>
      <div class="world-inspector-section">
        <h4>Agent context</h4>
        <p>${ctx.esc(w.context || "No focused context — add what the agent should know in this world.")}</p>
      </div>
      ${globalFacts.length ? `
        <div class="world-inspector-section">
          <h4>Global snapshot</h4>
          <div class="world-inspector-facts">${globalFacts.map(([k, v]) =>
            `<div class="world-inspector-fact"><span class="k">${ctx.esc(k)}</span><span class="v">${ctx.esc(String(v))}</span></div>`
          ).join("")}</div>
        </div>` : ""}
      ${isRoot && childIndex.length ? `
        <div class="world-inspector-section">
          <h4>Sub-worlds indexed (${childIndex.length})</h4>
          <div class="world-inspector-facts">${childIndex.map(c =>
            `<div class="world-inspector-fact"><span class="k">${ctx.esc(c.name)}</span><span class="v">${ctx.esc(c.kind || "project")}</span></div>`
          ).join("")}</div>
        </div>` : ""}
      ${!isRoot ? `
        <div class="world-inspector-section">
          <h4>Template</h4>
          <p class="body-md">${ctx.esc(w.template || kind)} — facet folders on disk under <code class="mono">data/knowledge/</code></p>
          ${w.github_repo ? `<p class="world-meta">GitHub: ${ctx.esc(w.github_repo)}</p>` : ""}
          ${w.repo_path ? `<p class="world-meta">Repo: ${ctx.esc(w.repo_path)}</p>` : ""}
        </div>` : ""}
      ${!isRoot && ctx.worldTreeData().root ? `
        <div class="world-inspector-section">
          <h4>Parent</h4>
          <p class="body-md">${ctx.esc(ctx.worldTreeData().root.name)} <span class="world-meta">(main world)</span></p>
        </div>` : ""}
      ${goals.length && isRoot ? `
        <div class="world-inspector-section">
          <h4>Active goals</h4>
          <p class="body-md">${goals.map(g => ctx.esc(typeof g === "string" ? g : g.title || g)).join(" · ")}</p>
        </div>` : ""}
      <div class="world-inspector-section">
        <h4>What the agent sees</h4>
        <pre class="world-context-preview">${ctx.esc(preview || "Preview loads when graph data is fetched…")}</pre>
      </div>
      <div class="world-inspector-actions">
        <button type="button" class="button-primary button-sm" data-use-world="${ctx.esc(id)}">Use in chat</button>
        <button type="button" class="button-outline-on-dark button-sm" data-set-active-world="${ctx.esc(id)}">Set active</button>
        <button type="button" class="button-tertiary-text button-sm" data-edit-world="${ctx.esc(id)}">Edit</button>
        ${!isRoot ? `<button type="button" class="button-tertiary-text button-sm" data-delete-world="${ctx.esc(id)}">Delete</button>` : ""}
      </div>`;
  }

  function renderVaultDocForm(w, facets, facetId) {
    const editing = ctx.state.ui?.vaultDocEdit;
    const fid = facetId || facets[0]?.id || facets[0]?.folder || "docs";
    const facet = facets.find(f => (f.id || f.folder) === fid) || facets[0] || { label: fid, id: fid };
    const title = editing ? (editing.title || "") : "";
    const desc = editing ? (editing.description || "") : "";
    const editId = editing?.id || "";
    return `
      <form class="human-form vault-doc-form" id="vault-doc-form" data-world-id="${ctx.esc(w.id)}" data-facet-id="${ctx.esc(fid)}">
        ${editId ? `<input type="hidden" name="doc_id" value="${editId}">` : ""}
        <div class="human-form__row">
          <label class="human-field"><span class="caption-uppercase">Category slot</span>
            <select class="text-input-on-dark" name="facet_id" id="vault-doc-facet">
              ${facets.map(f => {
                const id = f.id || f.folder;
                return `<option value="${ctx.esc(id)}"${id === fid ? " selected" : ""}>${ctx.esc(f.label)}</option>`;
              }).join("")}
            </select></label>
          <label class="human-field"><span class="caption-uppercase">Title</span>
            <input class="text-input-on-dark" name="title" required placeholder="e.g. Current ICP" value="${ctx.esc(title)}"></label>
        </div>
        <label class="human-field"><span class="caption-uppercase">Description (indexed for search)</span>
          <textarea class="text-input-on-dark" name="description" rows="3" placeholder="Short summary agents use to find this doc. Full content goes to ${ctx.esc(ctx.vaultStorageLabel())}.">${ctx.esc(desc)}</textarea></label>
        ${editId ? `
        <label class="human-field"><span class="caption-uppercase">Document body (markdown)</span>
          <textarea class="text-input-on-dark" name="content" id="vault-doc-content" rows="8" placeholder="Loading…"></textarea></label>` : `
        <label class="human-field"><span class="caption-uppercase">Upload file</span>
          <input type="file" name="file" accept=".pdf,.docx,.txt,.md,.markdown,.csv,.json"></label>
        <label class="human-field"><span class="caption-uppercase">Or paste markdown</span>
          <textarea class="text-input-on-dark" name="content" rows="6" placeholder="# ICP\n\nTarget: …"></textarea></label>`}
        <div class="human-form__actions">
          <button type="submit" class="button-primary button-sm">${editId ? "Update document" : "Add document"}</button>
          <button type="button" class="button-outline-on-dark button-sm" data-vault-cancel-doc>Cancel</button>
        </div>
        <p class="world-meta">Slot: <strong>${ctx.esc(facet.label)}</strong> · Full files in ${ctx.esc(ctx.vaultStorageLabel())}; only title + description in vector index.</p>
      </form>`;
  }

  function renderGithubReposPanel(w, vault) {
    const status = ctx.state._githubStatus || {};
    const connected = !!status.connected;
    const oauthOk = !!status.oauth_configured;
    const linked = vault.github_repos || [];
    const ghRepos = ctx.state._githubRepos || [];
    const pickOpts = ghRepos.map(r =>
      `<option value="${ctx.esc(r.full_name)}">${ctx.esc(r.full_name)}${r.private ? " (private)" : ""}</option>`
    ).join("");
    const linkedRows = linked.map(r => {
      const syncing = ctx.isLinkSyncing(r.id);
      const repoDocs = ctx.githubRepoDocuments(vault, r.full_name);
      const readme = ctx.findReadmeDoc(repoDocs);
      const mdFiles = repoDocs.filter(d => ctx.isMarkdownFilename(d.github_path || d.filename));
      const treeHtml = mdFiles.length
        ? `<div class="github-tree github-tree--repo">${ctx.renderGithubTreeNode(ctx.buildGithubPathTree(mdFiles), w.id)}</div>`
        : "";
      return `
      <div class="github-repo-row">
        <div>
          <strong class="mono">${ctx.esc(r.full_name)}</strong>
          ${syncing ? `<span class="sync-badge">Syncing</span>` : ""}
          <span class="world-meta">${r.file_count || repoDocs.length || 0} files synced${r.synced_at ? ` · ${ctx.esc(r.synced_at)}` : ""}</span>
          ${r.last_error ? `<span class="world-meta" style="color:var(--color-warn)">${ctx.esc(r.last_error)}</span>` : ""}
        </div>
        <div class="github-repo-row__actions">
          <button type="button" class="button-primary button-sm" data-vault-view-doc="${readme?.id || ""}" data-world-id="${ctx.esc(w.id)}" data-doc-title="${ctx.esc(readme?.title || `${r.full_name} README`)}"${!readme || syncing ? " disabled" : ""}>Open README</button>
          <button type="button" class="button-outline-on-dark button-sm${syncing ? " is-busy" : ""}" data-github-sync="${r.id}" data-world-id="${ctx.esc(w.id)}"${syncing ? " disabled" : ""}>${syncing ? "Syncing…" : `Sync to ${ctx.esc(ctx.vaultStorageLabel())}`}</button>
          <button type="button" class="button-tertiary-text button-sm" data-github-unlink="${r.id}" data-world-id="${ctx.esc(w.id)}"${syncing ? " disabled" : ""}>Unlink</button>
        </div>
        ${repoDocs.length ? `<details class="github-repo-files" open>
          <summary class="caption-uppercase">Repo structure · ${mdFiles.length} markdown file${mdFiles.length === 1 ? "" : "s"}</summary>
          ${treeHtml || "<p class='muted body-md'>No markdown files synced yet.</p>"}
        </details>` : `<p class="body-md muted github-repo-files-empty">No files synced yet — link and sync to browse the repo tree here.</p>`}
      </div>`;
    }).join("");
  
    if (!oauthOk) {
      return `<section class="github-repos-panel">
        <p class="section-eyebrow">GitHub</p>
        <p class="body-md muted">Add <code>GITHUB_CLIENT_ID</code> and <code>GITHUB_CLIENT_SECRET</code> to <code>.env</code>, register callback <code>${ctx.esc(status.redirect_uri || "/api/github/callback")}</code>, then restart.</p>
      </section>`;
    }
  
    if (!connected) {
      return `<section class="github-repos-panel">
        <p class="section-eyebrow">GitHub repositories</p>
        <p class="body-md muted">Authorize GitHub to browse your repos and sync docs into this world's knowledge graph (${ctx.esc(ctx.vaultStorageLabel())}).</p>
        <a class="button-primary button-sm" href="/api/github/auth/start?world_id=${encodeURIComponent(w.id)}">Connect GitHub</a>
      </section>`;
    }
  
    return `<section class="github-repos-panel">
      <div class="github-repos-panel__head">
        <div>
          <p class="section-eyebrow">GitHub repositories</p>
          <p class="body-md muted">Connected as <strong>${ctx.esc(status.user?.login || "GitHub")}</strong> — link multiple repos; files sync to ${ctx.esc(ctx.vaultStorageLabel())} with searchable descriptions.</p>
        </div>
      </div>
      <div class="human-form__row" style="align-items:flex-end">
        <label class="human-field" style="flex:1">
          <span class="caption-uppercase">Add repository</span>
          <select class="text-input-on-dark" id="github-repo-pick">
            <option value="">Select a repository…</option>
            ${pickOpts}
          </select>
        </label>
        <button type="button" class="button-primary button-sm" data-github-add="${ctx.esc(w.id)}"${ctx.state._syncingLinkIds.size ? " disabled" : ""}>Link &amp; sync</button>
      </div>
      <div class="github-repo-list">${linkedRows || "<p class='body-md muted'>No GitHub repos linked yet.</p>"}</div>
    </section>`;
  }

  function renderVaultRegistryBar(vault, w) {
    const facets = vault.facets || vault.folders || [];
    const storage = vault.storage_backend || (ctx.vaultStorageLabel() === "S3" ? "s3" : "local");
    return `
      <div class="vault-registry-bar" role="status" aria-live="polite">
        <span class="vault-registry-chip"><span class="k">Template</span> ${ctx.esc(vault.template_id || w.template || "startup")}</span>
        <span class="vault-registry-chip"><span class="k">Slots</span> ${facets.length}</span>
        <span class="vault-registry-chip"><span class="k">Docs</span> ${vault.document_count || 0}</span>
        <span class="vault-registry-chip"><span class="k">Storage</span> ${ctx.esc(storage)}</span>
        <button type="button" class="button-tertiary-text button-sm" data-vault-reload="${ctx.esc(w.id)}">Reload registry</button>
      </div>`;
  }

  function renderWorldVaultPanel(w) {
    if (!w || w.id === "root") return "";
    if (ctx.state._vaultLoading || ctx.state._vaultWorldId !== w.id) {
      return `
      <section class="driver-card vault-panel knowledge-panel panel-loading" style="margin-top:var(--space-md)">
        <p class="section-eyebrow">Knowledge vault</p>
        <h3 class="title-sm">${ctx.esc(w.name)}</h3>
        <div class="skeleton-grid" style="margin-top:var(--space-sm)">
          ${ctx.skeletonCard(3)}${ctx.skeletonCard(3)}${ctx.skeletonCard(3)}
        </div>
      </section>`;
    }
    const vault = ctx.vaultPayload() || {};
    const facets = vault.facets || vault.folders || [];
    const counts = vault.domain_counts || {};
    const activeFacet = ctx.state.ui?.vaultFacet || facets[0]?.id || facets[0]?.folder || null;
    const showForm = ctx.state.ui?.vaultDocForm || ctx.state.ui?.vaultDocEdit;
    const facetDocs = (facets.find(f => (f.id || f.folder) === activeFacet) || {}).documents || [];
  
    const facetTabs = facets.map(f => {
      const id = f.id || f.folder;
      const n = (f.documents || []).length + (f.files || []).length;
      return `<button type="button" class="vault-facet-tab${id === activeFacet ? " is-active" : ""}" data-vault-facet="${ctx.esc(id)}">${ctx.esc(f.label)} <span class="badge-pill">${n}</span></button>`;
    }).join("");
  
    const docRows = facetDocs.map(d => {
      const pathLabel = d.github_path ? ` · ${d.github_path}` : "";
      const canView = ctx.isMarkdownFilename(d.filename || d.github_path);
      return `
      <article class="vault-doc-card" data-doc-id="${d.id}">
        <div class="vault-doc-card__head">
          <h4>${ctx.esc(d.title)}</h4>
          <span class="world-meta">${ctx.esc(d.filename || "")}${ctx.esc(pathLabel)} · ${ctx.formatBytes(d.size_bytes)}${d.source_type === "github" ? " · GitHub" : ""}</span>
        </div>
        <p class="body-md">${ctx.esc(d.description || "No description")}</p>
        <div class="vault-doc-card__actions">
          ${canView ? `<button type="button" class="button-primary button-sm" data-vault-view-doc="${d.id}" data-world-id="${ctx.esc(w.id)}" data-doc-title="${ctx.esc(d.title)}">View</button>` : ""}
          <button type="button" class="button-outline-on-dark button-sm" data-tag-vault-doc="${d.id}" data-world-id="${ctx.esc(w.id)}" data-doc-title="${ctx.esc(d.title)}" data-doc-path="${ctx.esc(d.github_path || d.filename || "")}">Tag in agent</button>
          <button type="button" class="button-outline-on-dark button-sm" data-vault-edit-doc="${d.id}">Edit</button>
          <button type="button" class="button-tertiary-text button-sm" data-vault-delete-doc="${d.id}">Remove</button>
        </div>
      </article>`;
    }).join("");
  
    const diskFiles = (facets.find(f => (f.id || f.folder) === activeFacet) || {}).files || [];
    const diskList = diskFiles.length ? `<ul class="vault-file-list">${diskFiles.map(file =>
      `<li class="mono">${ctx.esc(file.relative || file.name)} <span class="muted">on disk</span></li>`
    ).join("")}</ul>` : "";
  
    return `
      <section class="driver-card vault-panel knowledge-panel" style="margin-top:var(--space-md)">
        <div class="vault-panel-head">
          <div>
            <p class="section-eyebrow">Knowledge graph</p>
            <h3 class="title-sm">${ctx.esc(w.name)} — ${ctx.esc(vault.template_id || w.template || "startup")} template</h3>
            <p class="body-md muted">Category slots for this world type. Add docs with a searchable description; large files live in ${ctx.esc(ctx.vaultStorageLabel())}. Open the <strong>Files</strong> tab in the map above for the folder graph.</p>
            <p class="world-meta">${vault.document_count || 0} registered docs · ${ctx.esc(vault.vault_path || "")}${vault.repo_path ? ` · repo: ${ctx.esc(vault.repo_path)}` : ""}</p>
          </div>
          <div class="vault-panel-actions">
            <button type="button" class="button-primary button-sm" data-vault-add-doc="${ctx.esc(w.id)}">Add document</button>
            <button type="button" class="button-outline-on-dark button-sm" data-world-graph-tab="vault">Open file map</button>
            <input class="text-input-on-dark" id="vault-repo-path" placeholder="Local repo path" value="${ctx.esc(w.repo_path || "")}">
            <button type="button" class="button-outline-on-dark button-sm" data-vault-link="${ctx.esc(w.id)}">Link repo</button>
            <button type="button" class="button-outline-on-dark button-sm" data-vault-ingest="${ctx.esc(w.id)}">Re-ingest</button>
          </div>
        </div>
        ${ctx.renderGithubReposPanel(w, vault)}
        ${ctx.renderVaultRegistryBar(vault, w)}
        <div class="vault-facet-tabs" role="tablist">${facetTabs || "<span class='muted'>No categories</span>"}</div>
        ${showForm ? ctx.renderVaultDocForm(w, facets, activeFacet) : ""}
        <div class="vault-doc-grid">${docRows || "<p class='body-md muted'>No documents in this slot yet — add your ICP, GTM notes, research, etc.</p>"}</div>
        ${diskList}
        <div class="vault-search-row">
          <input class="text-input-on-dark" id="vault-search-q" placeholder="Search descriptions in this world…">
          <button type="button" class="button-outline-on-dark button-sm" data-vault-search="${ctx.esc(w.id)}">Search</button>
        </div>
        <pre class="vault-search-results mono" id="vault-search-results" hidden></pre>
      </section>`;
  }

  function renderWorld() {
    const w = ctx.state._worldFull || {};
    const tree = w.worlds || ctx.state.worlds || {};
    const root = tree.root || {};
    const children = tree.children || [];
    const inspectId = ctx.inspectorWorldId();
    const activeId = ctx.currentWorldId();
    const selected = ctx.worldById(inspectId) || root;
    const snap = w.snapshot || ctx.state.snapshot || {};
    const founder = ctx.state.config?.my_name || "You";
    if (ctx.isRootWorld(selected) && ctx.worldGraphTab === "vault") ctx.worldGraphTab = "hierarchy";
    const showVaultGraphTab = !ctx.isRootWorld(selected);
  
    return `
      <div class="worlds-page">
        <section class="worlds-hero">
          <div class="worlds-hero-lead">
            <h2>${ctx.esc(founder)}'s world map</h2>
            <p><strong>Your venture map</strong> — create worlds, set context, link doc repos, and switch active context. You define each world; agents read what you write.</p>
          </div>
          <div class="worlds-stat">
            <span class="n">${children.length + 1}</span>
            <span class="l">Worlds</span>
          </div>
          <div class="worlds-stat">
            <span class="n">${children.length}</span>
            <span class="l">Sub-worlds</span>
          </div>
          <div class="worlds-stat">
            <span class="n" data-active-world-label>${ctx.esc(ctx.activeWorldLabel())}</span>
            <span class="l">Active context</span>
          </div>
        </section>
  
        <div class="worlds-workspace">
          <section class="worlds-panel">
            <div class="worlds-panel-head">
              <h3>Hierarchy</h3>
            </div>
            <div class="worlds-panel-body">
              ${ctx.renderWorldTreeNav(root, children, inspectId, activeId)}
            </div>
          </section>
  
          <section class="worlds-panel">
            <div class="worlds-panel-head">
              <h3>Map</h3>
              <div class="world-graph-tabs" role="tablist">
                <button type="button" class="world-graph-tab${ctx.worldGraphTab === "hierarchy" ? " is-active" : ""}" data-world-graph-tab="hierarchy">Hierarchy</button>
                <button type="button" class="world-graph-tab${ctx.worldGraphTab === "ecosystem" ? " is-active" : ""}" data-world-graph-tab="ecosystem">Ecosystem</button>
                ${showVaultGraphTab ? `<button type="button" class="world-graph-tab${ctx.worldGraphTab === "vault" ? " is-active" : ""}" data-world-graph-tab="vault">Files</button>` : ""}
              </div>
            </div>
            <div id="graph-world" class="graph-canvas world-graph-canvas" role="img" aria-label="World graph"></div>
            <div class="world-graph-legend" id="world-graph-legend">
              ${ctx.worldGraphLegendHtml(ctx.worldGraphTab)}
            </div>
          </section>
  
          <section class="worlds-panel">
            <div class="worlds-panel-head">
              <h3>Inspector</h3>
            </div>
            <div class="worlds-panel-body" id="world-inspector">
              ${ctx.renderWorldInspector(selected, snap)}
            </div>
          </section>
        </div>
  
        ${!ctx.isRootWorld(selected) ? `<div id="world-vault-mount">${ctx.renderWorldVaultPanel(selected)}</div>` : ""}
  
        <section class="world-create-panel driver-card${ctx.state.ui?.worldCreateOpen ? " is-open" : ""}" id="world-create-panel">
          <div class="world-create-panel__head">
            <div>
              <p class="section-eyebrow">You create</p>
              <h3 class="title-sm">New world</h3>
              <p class="body-md muted">Add a venture, project, or idea under your root world. You choose the context — agents only use what you define.</p>
            </div>
            <button type="button" class="button-outline-on-dark button-sm" data-toggle-ui="worldCreateOpen" aria-expanded="${ctx.state.ui?.worldCreateOpen ? "true" : "false"}">
              ${ctx.state.ui?.worldCreateOpen ? "Hide form" : "Create world"}
            </button>
          </div>
          ${ctx.state.ui?.worldCreateOpen ? ctx.renderWorldCreateForm("world-create-form") : ""}
        </section>
      </div>`;
  }

  function isRootWorld(w) {
    return !w || w.id === "root";
  }

  async function createWorldFromForm(form) {
    const fd = new FormData(form);
    const name = (fd.get("name") || "").toString().trim();
    if (!name) return;
    try {
      const res = await ctx.api("/worlds", {
        method: "POST",
        body: JSON.stringify({
          name,
          kind: (fd.get("kind") || "project").toString(),
          template: (fd.get("template") || "").toString().trim() || undefined,
          description: (fd.get("description") || "").toString().trim(),
          context: (fd.get("context") || "").toString().trim(),
          repo_path: (fd.get("repo_path") || "").toString().trim(),
          github_repo: (fd.get("github_repo") || "").toString().trim(),
        }),
      });
      ctx.state.worlds = res.tree;
      ctx.setActiveWorld(res.world?.id);
      await ctx.refresh();
      if (ctx.currentView === "world") {
        await ctx.reloadWorldTree();
        ctx.selectInspectorWorld(res.world?.id);
      }
      form.reset();
      if (ctx.state.ui) ctx.state.ui.worldCreateOpen = false;
    } catch (e) { alert(e.message); }
  }

  async function saveWorldEdit(form) {
    const id = form.dataset.worldId;
    if (!id) return;
    const fd = new FormData(form);
    const payload = {
      name: (fd.get("name") || "").toString().trim(),
      description: (fd.get("description") || "").toString(),
      context: (fd.get("context") || "").toString(),
    };
    if (id !== "root") {
      payload.kind = (fd.get("kind") || "project").toString();
      const tpl = (fd.get("template") || "").toString().trim();
      if (tpl) payload.template = tpl;
    }
    try {
      const res = await ctx.api(`/worlds/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      ctx.state.worlds = res.tree;
      ctx.state.worldEditing = null;
      if (ctx.currentView === "world") {
        await ctx.reloadWorldTree();
        await ctx.reloadVault(id, { force: true });
        ctx.patchWorldPanels();
      } else await ctx.refresh();
    } catch (e) { alert(e.message); }
  }

  async function submitVaultDoc(form) {
    const worldId = form.dataset.worldId;
    const docId = (form.querySelector("[name=doc_id]")?.value || "").trim();
    const fd = new FormData(form);
    const title = (fd.get("title") || "").toString().trim();
    const facetId = (fd.get("facet_id") || form.dataset.facetId || "docs").toString();
    const description = (fd.get("description") || "").toString().trim();
    const content = (fd.get("content") || "").toString();
    const file = form.querySelector('input[type="file"]')?.files?.[0];
    try {
      if (docId) {
        await ctx.api(`/worlds/${encodeURIComponent(worldId)}/vault/documents/${encodeURIComponent(docId)}`, {
          method: "PATCH",
          body: JSON.stringify({ title, description, facet_id: facetId, content: content || undefined }),
        });
      } else if (file) {
        const up = new FormData();
        up.append("file", file);
        up.append("title", title);
        up.append("description", description);
        up.append("facet_id", facetId);
        await ctx.apiUpload(`/worlds/${encodeURIComponent(worldId)}/vault/documents`, up);
      } else if (content.trim()) {
        await ctx.api(`/worlds/${encodeURIComponent(worldId)}/vault/documents`, {
          method: "POST",
          body: JSON.stringify({ title, description, facet_id: facetId, content }),
        });
      } else {
        return alert("Upload a file or paste markdown content.");
      }
      if (ctx.state.ui) {
        ctx.state.ui.vaultDocForm = false;
        ctx.state.ui.vaultDocEdit = null;
      }
      await ctx.reloadVault(worldId, { force: true });
      ctx.afterVaultMutation(worldId);
    } catch (e) { alert(e.message); }
  }

  async function startVaultDocEdit(worldId, docId) {
    if (!ctx.state.ui) ctx.state.ui = {};
    try {
      const res = await ctx.api(`/worlds/${encodeURIComponent(worldId)}/vault/documents/${encodeURIComponent(docId)}/content`);
      ctx.state.ui.vaultDocEdit = res.document;
      ctx.state.ui.vaultDocForm = true;
      ctx.state.ui.vaultFacet = res.document?.facet_id || ctx.state.ui.vaultFacet;
      if (ctx.currentView === "world") ctx.patchWorldPanels();
      else ctx.render();
      const ta = ctx.$("#vault-doc-content");
      if (ta) ta.value = res.content || "";
    } catch (e) { alert(e.message); }
  }

  async function connectGithubRepo(worldId) {
    const full_name = ctx.$("#github-repo-pick")?.value?.trim();
    if (!full_name) return alert("Select a repository");
    const btn = document.querySelector(`[data-github-add="${worldId}"]`);
    if (btn) btn.disabled = true;
    try {
      const res = await ctx.api(`/worlds/${encodeURIComponent(worldId)}/repos`, {
        method: "POST",
        body: JSON.stringify({ full_name }),
        timeoutMs: 120000,
      });
      if (res.job?.status === "failed") throw new Error(res.job.message || "Could not start sync");
      if (res.job?.id) {
        await ctx.runGithubSyncJob(res.job.id, `Syncing ${full_name}`, { worldId, linkId: res.repo?.id });
      } else {
        await ctx.reloadVault(worldId, { force: true });
        ctx.afterVaultMutation(worldId);
      }
    } catch (e) {
      alert(e.message);
    } finally {
      if (btn) btn.disabled = ctx.state._syncingLinkIds.size > 0;
    }
  }

  async function syncGithubRepo(worldId, linkId) {
    if (ctx.isLinkSyncing(linkId)) return;
    try {
      const res = await ctx.api(`/worlds/${encodeURIComponent(worldId)}/repos/${encodeURIComponent(linkId)}/sync`, {
        method: "POST",
        body: "{}",
        timeoutMs: 120000,
      });
      if (res.job?.status === "failed") throw new Error(res.job.message || "Could not start sync");
      if (res.job?.id) {
        const name = (ctx.state._worldVault?.github_repos || []).find(r => String(r.id) === String(linkId))?.full_name || "repository";
        await ctx.runGithubSyncJob(res.job.id, `Re-syncing ${name}`, { worldId, linkId });
      }
    } catch (e) {
      alert(e.message);
    }
  }

  async function unlinkGithubRepo(worldId, linkId) {
    if (!confirm("Unlink this repo and remove its synced documents from this world?")) return;
    try {
      await ctx.api(`/worlds/${encodeURIComponent(worldId)}/repos/${encodeURIComponent(linkId)}`, { method: "DELETE" });
      await ctx.reloadVault(worldId, { force: true });
      ctx.afterVaultMutation(worldId);
    } catch (e) { alert(e.message); }
  }

  async function deleteVaultDoc(worldId, docId) {
    if (!confirm("Remove this document from the knowledge graph?")) return;
    try {
      await ctx.api(`/worlds/${encodeURIComponent(worldId)}/vault/documents/${encodeURIComponent(docId)}`, { method: "DELETE" });
      await ctx.reloadVault(worldId, { force: true });
      ctx.afterVaultMutation(worldId);
    } catch (e) { alert(e.message); }
  }

  async function vaultIngest(worldId) {
    try {
      const res = await ctx.api(`/worlds/${encodeURIComponent(worldId)}/vault/ingest`, { method: "POST", body: "{}" });
      alert(`Ingested ${res.files || 0} files (${res.total_chunks || 0} chunks)`);
      await ctx.reloadVault(worldId, { force: true });
      ctx.afterVaultMutation(worldId);
    } catch (e) { alert(e.message); }
  }

  async function vaultLinkRepo(worldId) {
    const path = ctx.$("#vault-repo-path")?.value?.trim();
    if (!path) return alert("Enter a local repo path");
    try {
      const res = await ctx.api(`/worlds/${encodeURIComponent(worldId)}/vault/link-repo`, {
        method: "POST",
        body: JSON.stringify({ repo_path: path }),
      });
      if (res.error) return alert(res.error);
      alert(`Linked and ingested ${res.files || 0} files`);
      await ctx.reloadVault(worldId, { force: true });
      await ctx.refresh();
      ctx.afterVaultMutation(worldId);
    } catch (e) { alert(e.message); }
  }

  async function vaultSearch(worldId) {
    const q = ctx.$("#vault-search-q")?.value?.trim();
    if (!q) return;
    const out = ctx.$("#vault-search-results");
    try {
      const res = await ctx.api(`/vault/search?${new URLSearchParams({ q, world_id: worldId })}`);
      const text = (res.hits || []).map(h =>
        `[${h.metadata?.domain || "?"}] ${h.metadata?.source || ""}\n${(h.text || "").slice(0, 200)}`
      ).join("\n\n---\n\n") || "No hits.";
      if (out) { out.textContent = text; out.hidden = false; }
    } catch (e) { if (out) { out.textContent = e.message; out.hidden = false; } }
  }

  async function deleteWorld(id) {
    if (!confirm("Delete this sub-world?")) return;
    try {
      const res = await ctx.api(`/worlds/${encodeURIComponent(id)}`, { method: "DELETE" });
      ctx.state.worlds = res.tree;
      if (ctx.currentWorldId() === id) ctx.setActiveWorld("root");
      if (ctx.inspectorWorldId() === id) ctx.selectInspectorWorld("root");
      await ctx.refresh();
      if (ctx.currentView === "world") {
        ctx.state._worldFull = await ctx.api("/graph/world");
        ctx.state._worldPreviews = ctx.state._worldFull?.world_previews || {};
        ctx.render();
      }
    } catch (e) { alert(e.message); }
  }

  ctx.renderWorldOptionsForDocs = renderWorldOptionsForDocs;
  ctx.githubRepoDocuments = githubRepoDocuments;
  ctx.findReadmeDoc = findReadmeDoc;
  ctx.countGithubTreeFiles = countGithubTreeFiles;
  ctx.renderGithubTreeNode = renderGithubTreeNode;
  ctx.tagVaultDocInChat = tagVaultDocInChat;
  ctx.buildVaultGraph = buildVaultGraph;
  ctx.vaultGraphForWorld = vaultGraphForWorld;
  ctx.worldGraphLegendHtml = worldGraphLegendHtml;
  ctx.renderWorldCreateForm = renderWorldCreateForm;
  ctx.worldById = worldById;
  ctx.inspectorWorldId = inspectorWorldId;
  ctx.loadWorldVault = loadWorldVault;
  ctx.reloadVault = reloadVault;
  ctx.reloadWorldTree = reloadWorldTree;
  ctx.ensureVaultForWorld = ensureVaultForWorld;
  ctx.patchWorldTreeNav = patchWorldTreeNav;
  ctx.patchWorldPanels = patchWorldPanels;
  ctx.onWorldContextChanged = onWorldContextChanged;
  ctx.selectInspectorWorld = selectInspectorWorld;
  ctx.renderWorldTreeNav = renderWorldTreeNav;
  ctx.renderWorldInspector = renderWorldInspector;
  ctx.renderVaultDocForm = renderVaultDocForm;
  ctx.renderGithubReposPanel = renderGithubReposPanel;
  ctx.renderVaultRegistryBar = renderVaultRegistryBar;
  ctx.renderWorldVaultPanel = renderWorldVaultPanel;
  ctx.renderWorld = renderWorld;
  ctx.isRootWorld = isRootWorld;
  ctx.createWorldFromForm = createWorldFromForm;
  ctx.saveWorldEdit = saveWorldEdit;
  ctx.submitVaultDoc = submitVaultDoc;
  ctx.startVaultDocEdit = startVaultDocEdit;
  ctx.connectGithubRepo = connectGithubRepo;
  ctx.syncGithubRepo = syncGithubRepo;
  ctx.unlinkGithubRepo = unlinkGithubRepo;
  ctx.deleteVaultDoc = deleteVaultDoc;
  ctx.vaultIngest = vaultIngest;
  ctx.vaultLinkRepo = vaultLinkRepo;
  ctx.vaultSearch = vaultSearch;
  ctx.deleteWorld = deleteWorld;
}
