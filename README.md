## Colvin's Golf Hub

Personal golf dashboard for bag, specs, wishlist, passport rounds, and TopTracer sessions.

This project is designed to run as a **pure static site** (for example on GitHub Pages) and uses the browser's `localStorage` for persistence.

### How persistence works

- The app keeps an in-memory `appState` object that drives all UI.
- **When the backend is running** (`npm start`): On load it fetches `/api/state` and uses that. Saves go to the server, which writes to `data/userPrefs.json`, `data/bag.json`, `data/passport.json`, and `data/topTracer.json`. All devices hitting the same server see the same data.
- **When no backend is present** (e.g. opening `index.html` or GitHub Pages): It uses `localStorage` under the key `colvinGolfHubStateV1`. Data is per browser/device and does not sync.

### Running with shared data (backend)

From the project root:

```bash
npm install
npm start
```

Then open `http://localhost:3000` or, from other devices on your network, `http://<this-machine-ip>:3000`. The same JSON files are used for every client, so data stays consistent across devices and refreshes.

### Running locally (static only)

You can open `index.html` directly in your browser. For a static server without the API (e.g. to mimic GitHub Pages):

```bash
npx serve .
```

Data will then be stored only in the browser’s `localStorage` (per origin).

### Deploying to GitHub Pages

1. Create a new GitHub repository and add the contents of this folder (at minimum `index.html`).
2. Commit and push to GitHub.
3. In the repo, go to **Settings → Pages**.
4. Under **Source**, choose your main branch and root (or `/docs` if you move the file there), then save.
5. After GitHub builds the site, open:
   - `https://<your-username>.github.io/<repo-name>/`

From there, the site will behave the same as locally:

- All your edits persist in your browser via `localStorage`.
- No backend or environment variables are required.

