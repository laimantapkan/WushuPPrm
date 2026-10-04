import { AppState } from '../types';
import { initialAppState } from '../data/initialData';

const CLIENT_ID = 'client-' + Math.random().toString(36).substring(2, 9);

export class ApiService {
  private static ws: WebSocket | null = null;
  private static listeners: Array<(state: AppState) => void> = [];
  private static statusListeners: Array<(connected: boolean) => void> = [];
  private static isConnected = false;
  private static currentState: AppState = initialAppState;
  private static pollTimer: any = null;

  static init(onStateChange: (state: AppState) => void, onStatusChange?: (connected: boolean) => void) {
    this.listeners.push(onStateChange);
    if (onStatusChange) {
      this.statusListeners.push(onStatusChange);
      onStatusChange(this.isConnected);
    }

    // Initial Fetch via HTTP
    this.fetchStateHttp();

    // Start WebSocket
    if (!this.ws) {
      this.connectWebSocket();
    }

    // Poll every 1.5 seconds for instant multi-device sync across all mobile & desktop networks
    if (!this.pollTimer) {
      this.pollTimer = setInterval(() => {
        this.fetchStateHttp();
      }, 1500);
    }
  }

  static removeListener(onStateChange: (state: AppState) => void) {
    this.listeners = this.listeners.filter((l) => l !== onStateChange);
  }

  private static connectWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    try {
      const ws = new WebSocket(wsUrl);
      this.ws = ws;

      ws.onopen = () => {
        this.setConnectedStatus(true);
        this.fetchStateHttp();
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'STATE_INIT' || data.type === 'STATE_UPDATE') {
            if (data.state) {
              this.applyNewState(data.state);
            }
          }
        } catch (e) {
          console.error('Error parsing WS message:', e);
        }
      };

      ws.onclose = () => {
        this.ws = null;
        setTimeout(() => this.connectWebSocket(), 3000);
      };

      ws.onerror = () => {
        // HTTP polling keeps connection active
      };
    } catch (e) {
      console.warn('WebSocket connection error, using HTTP polling', e);
    }
  }

  private static setConnectedStatus(connected: boolean) {
    if (this.isConnected !== connected) {
      this.isConnected = connected;
      this.statusListeners.forEach((listener) => listener(connected));
    }
  }

  private static applyNewState(newState: AppState) {
    const hasChanged = JSON.stringify(newState) !== JSON.stringify(this.currentState);
    if (hasChanged) {
      this.currentState = newState;
      this.listeners.forEach((listener) => listener(newState));
    }
  }

  static async fetchStateHttp(): Promise<AppState> {
    try {
      const res = await fetch('/api/state?t=' + Date.now(), { cache: 'no-store' });
      if (res.ok) {
        const state: AppState = await res.json();
        this.setConnectedStatus(true);
        if (state) {
          this.applyNewState(state);
        }
        return state;
      }
    } catch (e) {
      console.error('HTTP fetch state error:', e);
      this.setConnectedStatus(false);
    }
    return this.currentState;
  }

  static async updateState(newState: AppState) {
    newState.lastUpdated = new Date().toISOString();
    this.applyNewState(newState);

    // Send HTTP POST to save on server disk
    try {
      const res = await fetch('/api/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newState),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.state) {
          this.applyNewState(data.state);
          this.setConnectedStatus(true);
        }
      }
    } catch (e) {
      console.error('Failed to post state via REST:', e);
    }

    // Also send WS broadcast
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(
          JSON.stringify({
            type: 'UPDATE_STATE',
            state: newState,
            clientId: CLIENT_ID,
          })
        );
      } catch (err) {
        console.error('WS send error:', err);
      }
    }
  }

  static resetData() {
    fetch('/api/reset', { method: 'POST' })
      .then((res) => res.json())
      .then((data) => {
        if (data.state) {
          this.applyNewState(data.state);
        }
      });

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'RESET_STATE', clientId: CLIENT_ID }));
    }
  }
}
