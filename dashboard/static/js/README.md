# Dashboard frontend modules

The UI is split from the legacy monolith (`../app.legacy.js`) into ES modules loaded by `main.js`.

## Layout

| Path | Role |
|------|------|
| `core/` | DOM helpers, API client, formatting, constants |
| `state/` | Mutable app state and world context helpers |
| `ui/` | Loading skeletons and busy states |
| `features/` | Graphs, live polling, GitHub ops, markdown editor |
| `views/` | One module per screen (CRM, chat, world, …) |
| `shell/` | Boot, navigation, render router, events, data refresh |

## Pattern

Modules use a **registry** pattern: each exports `registerX(ctx)` and attaches functions to a shared `ctx` object. `main.js` wires registration order and exposes `window.__FOS` for legacy scripts (`enhance.js`, charts).

## Regenerating from legacy

If you edit `app.legacy.js` and need to re-split:

```bash
cp dashboard/static/app.legacy.js dashboard/static/app.js
node scripts/build-js-modules.mjs
# Re-apply manual fixes: shell/render.js, shell/data.js, shell/init.js, main.js
```

Prefer editing modules directly; the splitter is for bulk migration only.
