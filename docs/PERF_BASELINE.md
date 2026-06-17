# Performance baseline — Nawab OS

Recorded before the performance overhaul (Phases 0–3). Re-measure after each phase deploy.

## Architecture

- **Edge:** Cloudflare (proxied A record)
- **Origin:** EC2 `ap-southeast-2` → nginx → Gunicorn → Flask
- **Data:** SQLite on EBS, Qdrant Cloud, S3 vault

## Pre-optimization issues (code audit)

| Area | Issue | Est. impact |
|------|--------|-------------|
| Boot | ~11 API calls; `/agents`, `/world`, `/graph/runtime` fetched 2–3× | 2–4s TTI |
| Polling | `pollLive` every 1.5s + `/graph/runtime` each tick | ~80 req/min/tab |
| State | `/api/state` every 30s; `collect_state` + `build_snapshot` disk write | High SQLite load |
| Gunicorn | Sync workers; `GUNICORN_THREADS` ignored | 2 concurrent requests |
| Static | No `Cache-Control`; Flask serves `/static/` | Full re-download |
| JS | ~290KB `app.js` + ~1.2MB CDN libs on every page | Slow LCP |

## Measurement checklist

### Lighthouse (production)

Run in Chrome Incognito on `https://nawab-os.stamped.work` after PIN login:

- [ ] Performance score
- [ ] LCP, TBT, TTFB
- [ ] Total network transfer

### API timing

Responses include `X-Response-Time-ms` (Flask `after_request`). Watch in DevTools Network:

| Endpoint | Pre | Post Phase 1 | Post Phase 3 |
|----------|-----|--------------|--------------|
| `/api/summary` | n/a | | |
| `/api/state` | | | |
| `/api/live` | | | |
| `/api/graph/runtime` | | | |

### Idle tab (5 minutes on Control center)

Count requests to `/api/live`, `/api/summary`, `/api/state`:

| Metric | Pre | Post Phase 1 |
|--------|-----|--------------|
| Total API calls | ~400+ | target <50 |
| `/api/live` calls | ~200 | target <60 |

### nginx

```bash
# On EC2 — slowest paths
sudo awk '{print $NF, $7}' /var/log/nginx/access.log | sort -rn | head -20
```

### Cloudflare cache rules (apply in dashboard)

1. **Cache static assets:** URI Path starts with `/static/` → Cache eligibility: eligible, Edge TTL: respect origin
2. **Bypass API:** URI Path starts with `/api/` → Bypass cache
3. **Speed:** Brotli ON, Auto Minify CSS/JS/HTML

## Post-phase targets

| Metric | Target |
|--------|--------|
| Boot API calls | ≤ 5 |
| Idle req/min | < 10 |
| Lighthouse Performance | ≥ 70 |
| Static cache hit (CF) | > 80% |
