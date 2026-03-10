const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const DATA_DIR = path.join(__dirname, 'data');
const DATA_PATH = path.join(DATA_DIR, 'appState.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Load default state from JSON file
let defaultState = {};
try {
  const raw = fs.readFileSync(DATA_PATH, 'utf8');
  defaultState = JSON.parse(raw);
} catch (err) {
  console.warn('Could not read initial appState.json, using empty default.', err);
  defaultState = {};
}

app.use(express.json());

// Serve static frontend files
app.use(express.static(__dirname));

// Helper to safely read current state from disk
function readStateFromDisk() {
  try {
    const raw = fs.readFileSync(DATA_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to read appState.json, falling back to defaultState.', err);
    return defaultState;
  }
}

// Helper to safely write state to disk
function writeStateToDisk(state) {
  return new Promise((resolve, reject) => {
    const json = JSON.stringify(state, null, 2);
    fs.writeFile(DATA_PATH, json, 'utf8', (err) => {
      if (err) {
        console.error('Failed to write appState.json.', err);
        return reject(err);
      }
      resolve();
    });
  });
}

// Basic shape validation for incoming state
function isValidState(state) {
  if (!state || typeof state !== 'object') return false;
  const requiredKeys = ['userPrefs', 'bag', 'passport', 'topTracer'];
  return requiredKeys.every((key) => Object.prototype.hasOwnProperty.call(state, key));
}

// GET current app state
app.get('/api/state', (req, res) => {
  const state = readStateFromDisk();
  res.json(state);
});

// PUT updated app state
app.put('/api/state', async (req, res) => {
  const incoming = req.body;

  if (!isValidState(incoming)) {
    return res.status(400).json({ error: 'Invalid state shape.' });
  }

  try {
    await writeStateToDisk(incoming);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to persist state.' });
  }
});

app.listen(PORT, () => {
  console.log(`Colvin's Golf Hub server running at http://localhost:${PORT}`);
});

