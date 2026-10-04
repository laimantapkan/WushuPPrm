import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import fs from 'fs';
import { initialAppState } from './src/data/initialData.ts';
import { AppState } from './src/types/index.ts';

const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const STORE_FILE = path.resolve(DATA_DIR, 'store.json');

function getStore(): AppState {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(STORE_FILE)) {
      fs.writeFileSync(STORE_FILE, JSON.stringify(initialAppState, null, 2), 'utf-8');
      return initialAppState;
    }
    const content = fs.readFileSync(STORE_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading store file, falling back to initial data', err);
    return initialAppState;
  }
}

function saveStore(data: AppState): boolean {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    data.lastUpdated = new Date().toISOString();
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Failed to save state to disk', err);
    return false;
  }
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(express.json({ limit: '10mb' }));
  app.use(express.static(path.resolve(process.cwd(), 'public')));

  // Disable cache for API endpoints
  app.use('/api', (_req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
  });

  // Initialize Store
  let state = getStore();

  // WebSocket Server for Real-Time Synchronization Across Multiple Devices
  const wss = new WebSocketServer({ server, path: '/ws' });

  function broadcastState(updatedByClient?: string) {
    const payload = JSON.stringify({
      type: 'STATE_UPDATE',
      state,
      updatedBy: updatedByClient || 'server',
    });
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
  }

  wss.on('connection', (ws) => {
    // Send current state on connection
    ws.send(JSON.stringify({ type: 'STATE_INIT', state }));

    ws.on('message', (message) => {
      try {
        const parsed = JSON.parse(message.toString());
        if (parsed.type === 'UPDATE_STATE') {
          state = parsed.state;
          saveStore(state);
          broadcastState(parsed.clientId);
        } else if (parsed.type === 'RESET_STATE') {
          state = JSON.parse(JSON.stringify(initialAppState));
          state.lastUpdated = new Date().toISOString();
          saveStore(state);
          broadcastState('reset');
        }
      } catch (err) {
        console.error('Error handling WebSocket message', err);
      }
    });
  });

  // REST API Endpoints
  app.get('/api/state', (_req, res) => {
    res.json(state);
  });

  app.post('/api/state', (req, res) => {
    try {
      const newState = req.body;
      if (!newState || typeof newState !== 'object') {
        res.status(400).json({ error: 'Invalid state format' });
        return;
      }
      state = newState;
      saveStore(state);
      broadcastState();
      res.json({ success: true, state });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update state' });
    }
  });

  app.post('/api/reset', (_req, res) => {
    state = JSON.parse(JSON.stringify(initialAppState));
    state.lastUpdated = new Date().toISOString();
    saveStore(state);
    broadcastState('reset');
    res.json({ success: true, state });
  });

  // Mount Vite in Dev mode, or serve static files in Production
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Wushu Porprov 2026 Server running on http://localhost:${PORT}`);
  });
}

startServer();
