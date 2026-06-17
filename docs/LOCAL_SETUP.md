# Local development — Nawab OS

## 1. Clone and branch

```bash
git clone https://github.com/Vinayak-RZ/Nawab-OS.git
cd Nawab-OS
git fetch origin
git checkout cursor/frontend-ux-overhaul-cb1c
```

For README viewer only (smaller scope):

```bash
git checkout cursor/github-repo-readme-viewer-cb1c
```

## 2. Python environment

```bash
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
pip install pytest          # for tests
```

## 3. Environment file

```bash
cp .env.example .env
```

Minimum for dashboard:

```env
DASHBOARD_PIN=482910          # optional; omit to skip PIN locally
```

For GitHub repo linking (Worlds view):

```env
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
```

GitHub OAuth callback URL (register in GitHub app settings):

```
http://127.0.0.1:5000/api/github/callback
```

Storage (pick one):

```env
# Local object storage (default if unset):
# files go to ./data/vault-objects/

# Or S3:
AWS_S3_BUCKET=your-bucket
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
```

## 4. Run

```bash
python main.py
```

Open the URL printed in the terminal (typically `http://127.0.0.1:5000`).

## 5. Verify handoff APIs

After PIN login:

```bash
curl -s -b cookies.txt -c cookies.txt -X POST http://127.0.0.1:5000/api/auth/pin \
  -H 'Content-Type: application/json' -d '{"pin":"482910"}'

curl -s -b cookies.txt http://127.0.0.1:5000/api/nudges
curl -s -b cookies.txt http://127.0.0.1:5000/api/health
```

## 6. Cursor skills (optional)

```bash
npx skillfish add affaan-m/everything-claude-code frontend-patterns
npx skillfish add anthropics/claude-plugins-official frontend-design
```

## 7. What to read next

- `docs/CURRENT_STATE.md` — what's done vs WIP
- `docs/UX_OVERHAUL_PLAN.md` — phased plan to continue
- `DESIGN.md` — do not change theme during UX work
