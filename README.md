## Colvin's Golf Hub

Personal golf dashboard with JSON-backed persistence for bag, specs, wishlist, passport rounds, and TopTracer sessions.

### Prerequisites

- Node.js installed (LTS is recommended).
- From the project root (`colvins-golf-hub`), run the dependency install once:

```bash
npm install
```

> Note: If `npm install` fails from your editor's integrated terminal, try running it from a regular system terminal in this folder.

### Running the app

From the project root:

```bash
npm start
```

Then open `http://localhost:3000/` in your browser.

The server will:

- Serve `index.html` and static assets from the project root.
- Expose a JSON persistence API:
  - `GET /api/state` – read the current app state from `data/appState.json`.
  - `PUT /api/state` – overwrite `data/appState.json` with the state sent from the frontend.

### Data persistence

- Initial data is seeded from `data/appState.json`.
- When you interact with the UI (edit bag, specs, wishlist, add rounds, save TopTracer sessions, etc.), the frontend updates an in-memory `appState` and calls `PUT /api/state` to persist changes.
- On each page load/refresh, the frontend:
  - Calls `GET /api/state`.
  - Merges the result into its `defaultState`.
  - Renders from that merged state.

If the backend is unreachable or the JSON file is unreadable, the frontend falls back to the built-in defaults so the page still works (but those fallback changes will not be persisted).

