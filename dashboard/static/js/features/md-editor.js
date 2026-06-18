/** @module features/md-editor — auto-split from app.js */
export function registerFeaturesMdEditor(ctx) {
  function resetMdEditorDialog() {
    ctx.mdEditorState = { mode: null, artifactId: null, worldId: null, docId: null, editMode: false };
    ctx.$("#md-dialog-source").hidden = true;
    ctx.$("#md-dialog-preview").hidden = false;
    ctx.$("#md-dialog-save").hidden = true;
    ctx.$("#md-dialog-mode").hidden = false;
    ctx.$("#md-dialog-mode").textContent = "Edit";
  }

  async function openVaultDocViewer(worldId, docId, title) {
    const dlg = ctx.$("#md-editor-dialog");
    if (!dlg || !worldId || !docId) return;
    ctx.mdEditorState = { mode: "vault", artifactId: null, worldId, docId, editMode: false };
    ctx.$("#md-dialog-title").textContent = title || "Document";
    ctx.$("#md-dialog-preview").hidden = false;
    ctx.$("#md-dialog-source").hidden = true;
    ctx.$("#md-dialog-save").hidden = true;
    ctx.$("#md-dialog-mode").hidden = false;
    ctx.$("#md-dialog-mode").textContent = "Edit";
    ctx.$("#md-dialog-preview").innerHTML = "<p class='body-md muted'>Loading…</p>";
    dlg.showModal();
    try {
      const res = await ctx.api(`/worlds/${encodeURIComponent(worldId)}/vault/documents/${encodeURIComponent(docId)}/content`, { timeoutMs: 20000 });
      const content = res.content || "";
      ctx.$("#md-dialog-source").value = content;
      const prev = ctx.$("#md-dialog-preview");
      await window.FOSMarkdown?.renderInto?.(prev, content);
    } catch (e) {
      ctx.$("#md-dialog-preview").innerHTML = `<p class="body-md" style="color:var(--color-warn)">${ctx.esc(e.message || "Could not load document")}</p>`;
    }
  }

  async function saveMdEditor() {
    const content = ctx.$("#md-dialog-source")?.value ?? "";
    if (ctx.mdEditorState.mode === "vault" && ctx.mdEditorState.worldId && ctx.mdEditorState.docId) {
      await ctx.api(`/worlds/${encodeURIComponent(ctx.mdEditorState.worldId)}/vault/documents/${encodeURIComponent(ctx.mdEditorState.docId)}`, {
        method: "PATCH",
        body: JSON.stringify({ content }),
        timeoutMs: 15000,
      });
      const prev = ctx.$("#md-dialog-preview");
      await window.FOSMarkdown?.renderInto?.(prev, content);
      ctx.mdEditorState.editMode = false;
      ctx.$("#md-dialog-source").hidden = true;
      ctx.$("#md-dialog-preview").hidden = false;
      ctx.$("#md-dialog-save").hidden = true;
      ctx.$("#md-dialog-mode").textContent = "Edit";
      return;
    }
    if (!ctx.mdEditorState.artifactId) return;
    await ctx.api(`/artifacts/${ctx.mdEditorState.artifactId}/content`, {
      method: "PUT",
      body: JSON.stringify({ content }),
      timeoutMs: 15000,
    });
    const prev = ctx.$("#md-dialog-preview");
    await window.FOSMarkdown?.renderInto?.(prev, content);
    ctx.mdEditorState.editMode = false;
    ctx.$("#md-dialog-source").hidden = true;
    ctx.$("#md-dialog-preview").hidden = false;
    ctx.$("#md-dialog-save").hidden = true;
    ctx.$("#md-dialog-mode").textContent = "Edit";
  }

  function initMdEditorDialog() {
    ctx.$("#md-dialog-close")?.addEventListener("click", () => {
      ctx.$("#md-editor-dialog")?.close();
      ctx.resetMdEditorDialog();
    });
    ctx.$("#md-dialog-mode")?.addEventListener("click", async () => {
      if (ctx.mdEditorState.mode !== "vault" && !ctx.mdEditorState.artifactId) return;
      ctx.mdEditorState.editMode = !ctx.mdEditorState.editMode;
      const src = ctx.$("#md-dialog-source");
      const prev = ctx.$("#md-dialog-preview");
      if (ctx.mdEditorState.editMode) {
        src.hidden = false;
        prev.hidden = true;
        ctx.$("#md-dialog-save").hidden = false;
        ctx.$("#md-dialog-mode").textContent = "Preview";
      } else {
        const content = src?.value ?? "";
        await window.FOSMarkdown?.renderInto?.(prev, content);
        src.hidden = true;
        prev.hidden = false;
        ctx.$("#md-dialog-save").hidden = true;
        ctx.$("#md-dialog-mode").textContent = "Edit";
      }
    });
    ctx.$("#md-dialog-save")?.addEventListener("click", () => ctx.saveMdEditor().catch(e => alert(e.message)));
  }

  ctx.resetMdEditorDialog = resetMdEditorDialog;
  ctx.openVaultDocViewer = openVaultDocViewer;
  ctx.saveMdEditor = saveMdEditor;
  ctx.initMdEditorDialog = initMdEditorDialog;
}
