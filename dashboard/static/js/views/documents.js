/** @module views/documents — auto-split from app.js */
export function registerViewsDocuments(ctx) {
  function openDocumentsWorkspace(artifactId) {
    if (artifactId != null) ctx.state._documentsSelectedId = Number(artifactId);
    ctx.goView("documents");
  }

  function renderDocuments() {
    const artifacts = ctx.state._artifacts || [];
    const selectedId = ctx.state._documentsSelectedId;
    const selected = artifacts.find(a => a.id === selectedId);
    const draft = ctx.state._documentDraft ?? "";
    const editing = ctx.documentsEditMode;
  
    const listItems = artifacts.length ? artifacts.map(a => `
      <button type="button" class="docs-list-item${a.id === selectedId ? " is-active" : ""}" data-select-document="${a.id}">
        <span class="badge-pill">${ctx.esc(a.kind || "md")}</span>
        <span class="docs-list-item__title">${ctx.esc(a.title || "Untitled")}</span>
        <span class="docs-list-item__meta muted">${ctx.fmtHistoryTime(a.created_at)}</span>
      </button>`).join("") : "<p class='body-md muted'>No documents yet. Create one or upload a file.</p>";
  
    let editorHtml = `<div class="docs-empty">
      <p class="title-sm">Document workspace</p>
      <p class="body-md muted">Select a document from the list, or create a new markdown file.</p>
      <button type="button" class="button-primary button-sm" data-docs-action="new">+ New document</button>
    </div>`;
  
    if (selected) {
      editorHtml = `
        <div class="docs-editor__toolbar">
          <input type="text" class="text-input-on-dark docs-title-input" id="docs-title-input" value="${ctx.esc(selected.title || "Untitled")}" aria-label="Document title">
          <select class="text-input-on-dark field-select docs-world-select" id="docs-world-select" aria-label="Project">
            ${ctx.renderWorldOptionsForDocs(selected.world_id || "root")}
          </select>
          <button type="button" class="button-outline-on-dark button-sm" data-docs-action="toggle">${editing ? "Preview" : "Edit"}</button>
          <button type="button" class="button-primary button-sm" data-docs-action="save">Save</button>
          <button type="button" class="button-outline-on-dark button-sm" data-docs-action="memory">Save to memory</button>
        </div>
        <div class="docs-editor__body">
          ${editing
            ? `<textarea id="docs-source" class="docs-source text-input-on-dark" aria-label="Document source">${ctx.esc(draft)}</textarea>`
            : `<div id="docs-preview" class="md-content msg-md docs-preview"></div>`}
        </div>`;
    }
  
    return `
      <header class="driver-card docs-header">
        <div>
          <p class="section-eyebrow">Markdown workspace</p>
          <h2 class="title-md">Documents</h2>
          <p class="body-md muted">View, edit, upload, and save agent-created files to memory or a project.</p>
        </div>
      </header>
      <div class="docs-workspace">
        <aside class="driver-card docs-list-panel">
          <div class="docs-list-panel__head">
            <button type="button" class="button-primary button-sm" data-docs-action="new">+ New</button>
            <label class="button-outline-on-dark button-sm upload-label">Upload<input type="file" id="docs-upload" hidden accept=".md,.txt,.markdown,.pdf,.docx,.csv,.json"></label>
          </div>
          <div class="docs-list">${listItems}</div>
        </aside>
        <section class="driver-card docs-editor-panel">${editorHtml}</section>
      </div>`;
  }

  async function createNewDocument() {
    const title = prompt("Document title", "Untitled");
    if (!title) return;
    const wid = ctx.currentWorldId();
    const res = await ctx.api("/artifacts", {
      method: "POST",
      body: JSON.stringify({
        title,
        content: `# ${title}\n\n`,
        world_id: wid && wid !== "root" ? wid : null,
      }),
      timeoutMs: 15000,
    });
    ctx.state._documentsSelectedId = res.artifact?.id;
    ctx.documentsEditMode = true;
    await ctx.loadViewData("documents");
    ctx.render();
  }

  async function uploadDocumentFile(file) {
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    const wid = ctx.currentWorldId();
    if (wid && wid !== "root") fd.append("world_id", wid);
    const res = await ctx.apiUpload("/artifacts", fd);
    ctx.state._documentsSelectedId = res.artifact?.id;
    ctx.documentsEditMode = false;
    await ctx.loadViewData("documents");
    ctx.render();
  }

  async function saveCurrentDocument() {
    const id = ctx.state._documentsSelectedId;
    if (!id) return;
    const content = document.getElementById("docs-source")?.value ?? ctx.state._documentDraft ?? "";
    const title = document.getElementById("docs-title-input")?.value ?? "Untitled";
    const worldSel = document.getElementById("docs-world-select")?.value ?? "root";
    await ctx.api(`/artifacts/${id}/content`, {
      method: "PUT",
      body: JSON.stringify({ content }),
      timeoutMs: 15000,
    });
    await ctx.api(`/artifacts/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ title, world_id: worldSel === "root" ? null : worldSel }),
      timeoutMs: 15000,
    });
    ctx.state._documentDraft = content;
    ctx.documentsEditMode = false;
    await ctx.loadViewData("documents");
    ctx.render();
  }

  async function saveDocumentToMemory() {
    const id = ctx.state._documentsSelectedId;
    if (!id) return;
    if (ctx.documentsEditMode) await ctx.saveCurrentDocument();
    const res = await ctx.api(`/artifacts/${id}/memory`, { method: "POST", body: "{}", timeoutMs: 20000 });
    alert(`Saved to memory (${res.collection || "documents"}).`);
  }

  async function selectDocument(artifactId) {
    ctx.state._documentsSelectedId = Number(artifactId);
    ctx.documentsEditMode = false;
    try {
      const data = await ctx.api(`/artifacts/${artifactId}/content`, { timeoutMs: 15000 });
      ctx.state._documentDraft = data.content || "";
    } catch (e) {
      ctx.state._documentDraft = "";
      alert(e.message || "Could not load document");
    }
    ctx.render();
  }

  function isMarkdownFilename(name) {
    const n = (name || "").toLowerCase();
    return n.endsWith(".md") || n.endsWith(".markdown") || n.endsWith(".rst");
  }

  ctx.openDocumentsWorkspace = openDocumentsWorkspace;
  ctx.renderDocuments = renderDocuments;
  ctx.createNewDocument = createNewDocument;
  ctx.uploadDocumentFile = uploadDocumentFile;
  ctx.saveCurrentDocument = saveCurrentDocument;
  ctx.saveDocumentToMemory = saveDocumentToMemory;
  ctx.selectDocument = selectDocument;
  ctx.isMarkdownFilename = isMarkdownFilename;
}
