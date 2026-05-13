# Board Annotator

A 5-step browser tool for creating board JSON files (`data_*.json`) from board images.

## Usage

Start a local server at the project root (so image paths resolve):

```bash
python3 -m http.server 5500
# then open http://127.0.0.1:5500/tools/annotator/index.html
```

Or with the Vite dev server: `npm run dev` → open `/tools/annotator/index.html`.

## Workflow

| Step | What you do |
|---|---|
| 1 | Upload a board image (NSFW-checked automatically) |
| 2 | Click each square to place a numbered marker |
| 3 | Click pairs of squares to draw snake/ladder arrows (or type numbers) |
| 4 | Fill in board metadata |
| 5 | Review, download JSON, and send for approval |

**Transition logic:** if `from > to` → snake (red); if `from < to` → ladder (green).

## Email approval setup (EmailJS)

1. Create a free account at [emailjs.com](https://www.emailjs.com/)
2. Connect a Gmail service → note the **Service ID**
3. Create a template with these variables and note the **Template ID**:

```
Subject: New board for approval: {{board_id}}

Board: {{board_name}}
Approval link: {{approval_url}}

--- JSON ---
{{json_content}}
```

4. Copy your **Public Key** from EmailJS → Account → API Keys
5. In Step 5, enter all three and click **Save credentials** — they persist in localStorage

## Approval page (`approve.html`)

The email contains a link to `approve.html?data=<encoded>`. On that page:

1. Review the board preview with all markers and transition arrows
2. Enter a GitHub Personal Access Token (PAT) with `Contents: write` for `urvashibala/SnakesNLadders`
3. Click **Approve & Upload** — commits `src/boards/data_<id>.json` and `public/boards/<image>` via GitHub API
4. GitHub Actions rebuilds and deploys the site

The PAT is stored only in your browser's localStorage; it is never sent anywhere except `api.github.com`.

## GitHub Actions (auto-deploy)

`.github/workflows/deploy.yml` builds with Vite and deploys to GitHub Pages on every push to `main`.  
Enable in repo Settings → Pages → Source: **GitHub Actions**.
