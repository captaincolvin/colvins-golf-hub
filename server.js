const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const DATA_DIR = path.join(__dirname, 'data');
const STATE_KEYS = ['userPrefs', 'bag', 'passport', 'topTracer'];
const LEGACY_PATH = path.join(DATA_DIR, 'appState.json');

function dataPath(key) {
  return path.join(DATA_DIR, `${key}.json`);
}

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Migration: if any of the 4 files are missing, try to create them from appState.json
function ensureSplitFiles() {
  const allExist = STATE_KEYS.every((key) => fs.existsSync(dataPath(key)));
  if (allExist) return;

  let legacy = {};
  try {
    if (fs.existsSync(LEGACY_PATH)) {
      const raw = fs.readFileSync(LEGACY_PATH, 'utf8');
      legacy = JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Could not read appState.json for migration.', err);
  }

  const defaults = {
    userPrefs: { theme: null, defaultTabId: 'clubhouse' },
    bag: { clubs: [], specs: {}, wishlist: [] },
    passport: { rounds: [] },
    topTracer: { sessions: [] }
  };

  STATE_KEYS.forEach((key) => {
    const filePath = dataPath(key);
    if (!fs.existsSync(filePath)) {
      const data = legacy[key] != null ? legacy[key] : defaults[key];
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      console.log(`Created ${key}.json from ${legacy[key] != null ? 'appState.json' : 'defaults'}.`);
    }
  });
}

ensureSplitFiles();

app.use(express.json());
app.use(express.static(__dirname));

function readJsonFile(filePath, fallback = {}) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    return fallback;
  }
}

function readStateFromDisk() {
  const state = {};
  STATE_KEYS.forEach((key) => {
    state[key] = readJsonFile(dataPath(key), {});
  });
  return state;
}

function writeStateToDisk(state) {
  const writes = STATE_KEYS.map((key) => {
    const value = state[key];
    const filePath = dataPath(key);
    const json = JSON.stringify(value != null ? value : {}, null, 2);
    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, json, 'utf8', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });
  return Promise.all(writes);
}

function isValidState(state) {
  if (!state || typeof state !== 'object') return false;
  return STATE_KEYS.every((key) => Object.prototype.hasOwnProperty.call(state, key));
}

app.get('/api/state', (req, res) => {
  const state = readStateFromDisk();
  res.json(state);
});

app.put('/api/state', async (req, res) => {
  const incoming = req.body;
  if (!isValidState(incoming)) {
    return res.status(400).json({ error: 'Invalid state shape.' });
  }
  try {
    await writeStateToDisk(incoming);
    res.status(204).send();
  } catch (err) {
    console.error('Failed to write state files.', err);
    res.status(500).json({ error: 'Failed to persist state.' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Colvin's Golf Hub server running at http://localhost:${PORT}`);
  console.log(`Network: http://<this-machine-ip>:${PORT}`);
});
