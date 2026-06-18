/** @module views/approvals — auto-split from app.js */
export function registerViewsApprovals(ctx) {
  function renderApprovals() {
    const appr = ctx.state.approvals || [];
    if (!appr.length) {
      return `<section class="driver-card empty-state"><p class="title-sm">No pending approvals</p></section>`;
    }
    return `<section class="driver-card">${appr.map(a => `
      <div class="approval-block">
        <div class="approval-meta caption-uppercase"><span class="mono">#${a.id}</span> · ${ctx.esc(a.tool_name)}</div>
        <div class="approval-summary body-md">${ctx.esc(a.summary)}</div>
        <div class="approval-actions">
          <button type="button" class="button-primary button-sm" data-approve="${a.id}">Approve</button>
          <button type="button" class="button-outline-on-dark button-sm" data-reject="${a.id}">Reject</button>
        </div>
      </div>`).join("")}</section>`;
  }

  async function decideApproval(id, approve) {
    try {
      const res = await ctx.api(`/approvals/${id}/${approve ? "approve" : "reject"}`, { method: "POST" });
      ctx.chatHistory.push({ role: "system", text: res.result });
      localStorage.setItem("fos_chat", JSON.stringify(ctx.chatHistory));
      await ctx.refresh();
      if (ctx.currentView === "approvals") ctx.render();
    } catch (e) { alert(e.message); }
  }

  ctx.renderApprovals = renderApprovals;
  ctx.decideApproval = decideApproval;
}
