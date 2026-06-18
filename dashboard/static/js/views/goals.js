/** @module views/goals — auto-split from app.js */
export function registerViewsGoals(ctx) {
  function renderGoals() {
    const g = ctx.state._goals || {};
    const goalsFormOpen = !!ctx.state.ui?.goalsFormOpen;
    const reminderFormOpen = !!ctx.state.ui?.reminderFormOpen;
    const goals = (g.active || []).map(x => `<li class="goal-row">
      <span><strong>${ctx.esc(x.title)}</strong>${x.detail ? " — " + ctx.esc(x.detail) : ""}</span>
      <button type="button" class="button-outline-on-dark button-sm" data-goal-done="${x.id}">Done</button>
    </li>`).join("") || "<li class='muted'>No active goals — add one below.</li>";
    const tasks = (ctx.state.tasks || []).map(t => `<li>${ctx.esc(t.title)} <span class="muted">P${t.priority || 3}</span></li>`).join("") || "<li class='muted'>No open tasks</li>";
    const rems = (g.reminders || []).map(r => `<li class="reminder-row">
      <span>${ctx.esc(r.text)} <span class="muted">${ctx.esc((r.due_at || "").slice(0, 16).replace("T", " "))}</span></span>
      <span class="reminder-row__actions">
        <button type="button" class="button-outline-on-dark button-sm" data-reminder-done="${r.id}">Done</button>
        <button type="button" class="button-tertiary-text button-sm" data-reminder-cancel="${r.id}">Cancel</button>
      </span>
    </li>`).join("") || "<li class='muted'>No reminders</li>";
    const plans = (g.plans || []).map(p => `<li>${ctx.esc(p.goal)}</li>`).join("") || "<li class='muted'>No open plans</li>";
  
    return `<div class="dashboard-grid">
      <section class="driver-card span-12 human-panel">
        <div class="human-panel__head">
          <div>
            <p class="section-eyebrow">Goals</p>
            <h3 class="title-sm">Outcomes you own</h3>
            <p class="body-md muted">Track goals and reminders directly — no agent required.</p>
          </div>
          <div class="human-panel__actions">
            <button type="button" class="button-primary button-sm" data-toggle-ui="goalsFormOpen">${goalsFormOpen ? "Hide goal form" : "New goal"}</button>
            <button type="button" class="button-outline-on-dark button-sm" data-toggle-ui="reminderFormOpen">${reminderFormOpen ? "Hide reminder" : "Reminder"}</button>
          </div>
        </div>
        ${goalsFormOpen ? `
        <form class="human-form" id="goal-create-form">
          <div class="human-form__row">
            <label class="human-field"><span class="caption-uppercase">Goal</span>
              <input class="text-input-on-dark" name="title" required placeholder="What are you driving toward?"></label>
            <label class="human-field"><span class="caption-uppercase">Priority</span>
              <select class="text-input-on-dark" name="priority">
                <option value="1">P1 — critical</option>
                <option value="2">P2 — high</option>
                <option value="3" selected>P3 — normal</option>
                <option value="4">P4 — low</option>
                <option value="5">P5 — someday</option>
              </select></label>
          </div>
          <label class="human-field"><span class="caption-uppercase">Detail</span>
            <textarea class="text-input-on-dark" name="detail" rows="2" placeholder="Optional context"></textarea></label>
          <div class="human-form__actions">
            <button type="submit" class="button-primary button-sm">Add goal</button>
            <button type="button" class="button-outline-on-dark button-sm" data-toggle-ui="goalsFormOpen">Cancel</button>
          </div>
        </form>` : ""}
        ${reminderFormOpen ? `
        <form class="human-form" id="reminder-create-form" style="margin-top:var(--space-sm)">
          <div class="human-form__row">
            <label class="human-field"><span class="caption-uppercase">Reminder</span>
              <input class="text-input-on-dark" name="text" required placeholder="Follow up with…"></label>
            <label class="human-field"><span class="caption-uppercase">Due</span>
              <input class="text-input-on-dark" name="due_at" type="datetime-local" required></label>
          </div>
          <div class="human-form__actions">
            <button type="submit" class="button-primary button-sm">Save reminder</button>
            <button type="button" class="button-outline-on-dark button-sm" data-toggle-ui="reminderFormOpen">Cancel</button>
          </div>
        </form>` : ""}
      </section>
      <section class="driver-card span-6"><p class="caption-uppercase">Active goals</p><ul class="list-plain goal-list" style="margin-top:var(--space-sm)">${goals}</ul></section>
      <section class="driver-card span-6"><p class="caption-uppercase">Open tasks</p><ul class="list-plain" style="margin-top:var(--space-sm)">${tasks}</ul></section>
      <section class="driver-card span-6"><p class="caption-uppercase">Reminders</p><ul class="list-plain" style="margin-top:var(--space-sm)">${rems}</ul></section>
      <section class="driver-card span-6"><p class="caption-uppercase">Plans &amp; projects</p><ul class="list-plain" style="margin-top:var(--space-sm)">${plans}</ul></section>
    </div>`;
  }

  async function submitGoal(form) {
    const fd = new FormData(form);
    const title = (fd.get("title") || "").toString().trim();
    if (!title) return;
    try {
      await ctx.api("/goals", {
        method: "POST",
        body: JSON.stringify({
          title,
          detail: (fd.get("detail") || "").toString().trim(),
          priority: parseInt(fd.get("priority") || "3", 10) || 3,
        }),
      });
      ctx.state._goals = await ctx.api("/goals");
      if (ctx.state.ui) ctx.state.ui.goalsFormOpen = false;
      await ctx.refresh();
      ctx.render();
      form.reset();
    } catch (e) { alert(e.message); }
  }

  async function markGoalDone(gid) {
    if (!gid) return;
    try {
      await ctx.api(`/goals/${encodeURIComponent(gid)}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "done" }),
      });
      ctx.state._goals = await ctx.api("/goals");
      await ctx.refresh();
      ctx.render();
    } catch (e) { alert(e.message); }
  }

  async function submitReminder(form) {
    const fd = new FormData(form);
    const text = (fd.get("text") || "").toString().trim();
    const dueRaw = (fd.get("due_at") || "").toString().trim();
    if (!text || !dueRaw) return;
    const due_at = dueRaw.length === 16 ? `${dueRaw}:00` : dueRaw;
    try {
      await ctx.api("/reminders", {
        method: "POST",
        body: JSON.stringify({ text, due_at }),
      });
      ctx.state._goals = await ctx.api("/goals");
      if (ctx.state.ui) ctx.state.ui.reminderFormOpen = false;
      ctx.render();
      form.reset();
    } catch (e) { alert(e.message); }
  }

  async function updateReminderStatus(reminderId, status) {
    await ctx.api(`/reminders/${reminderId}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
      timeoutMs: 15000,
    });
    ctx.state._goals = await ctx.api("/goals");
    if (ctx.currentView === "goals") ctx.render();
    if (ctx.currentView === "dashboard") {
      const wid = ctx.currentWorldId();
      const q = wid && wid !== "root" ? `?world_id=${encodeURIComponent(wid)}` : "";
      ctx.state._nudges = (await ctx.api(`/nudges${q}`).catch(() => ({ nudges: [] }))).nudges || [];
      ctx.render();
    }
  }

  ctx.renderGoals = renderGoals;
  ctx.submitGoal = submitGoal;
  ctx.markGoalDone = markGoalDone;
  ctx.submitReminder = submitReminder;
  ctx.updateReminderStatus = updateReminderStatus;
}
