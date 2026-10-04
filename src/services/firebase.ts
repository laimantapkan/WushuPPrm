import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, onSnapshot, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { AppState } from '../types';
import { initialAppState, normalizeAppState } from '../data/initialData';

const LOCAL_STORAGE_KEY = 'wushu_porprov_state_v6';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
}

const getStoredLocalState = (): AppState => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && Array.isArray(parsed.athletes) && parsed.athletes.length > 0) {
        return normalizeAppState(parsed);
      }
    }
  } catch (e) {
    console.error('Failed to load state from localStorage:', e);
  }
  return initialAppState;
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const STATE_DOC_REF = doc(db, 'app', 'state');

export class FirebaseService {
  private static listeners: Array<(state: AppState) => void> = [];
  private static statusListeners: Array<(connected: boolean) => void> = [];
  private static currentState: AppState = getStoredLocalState();
  private static isInitialized = false;

  static getInitialState(): AppState {
    return this.currentState;
  }

  static init(onStateChange: (state: AppState) => void, onStatusChange?: (connected: boolean) => void) {
    this.listeners.push(onStateChange);
    if (onStatusChange) {
      this.statusListeners.push(onStatusChange);
      onStatusChange(true);
    }

    // Immediately deliver current stored state
    onStateChange(this.currentState);

    if (!this.isInitialized) {
      this.isInitialized = true;
      this.subscribeToRealtimeStore();
    }
  }

  static removeListener(onStateChange: (state: AppState) => void) {
    this.listeners = this.listeners.filter((l) => l !== onStateChange);
  }

  private static saveToLocalStorage(state: AppState) {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }

  private static saveToServerHttp(state: AppState) {
    fetch('/api/state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state),
    }).catch((err) => console.error('Failed to save state to server disk:', err));
  }

  private static subscribeToRealtimeStore() {
    // Also fetch initial state from Express server disk (/api/state) to verify backup
    fetch('/api/state?t=' + Date.now(), { cache: 'no-store' })
      .then((res) => res.json())
      .then((serverState: AppState) => {
        if (serverState && Array.isArray(serverState.athletes) && serverState.athletes.length > 0) {
          const normalized = normalizeAppState(serverState);
          const serverTime = new Date(normalized.lastUpdated || 0).getTime();
          const currentTime = new Date(this.currentState.lastUpdated || 0).getTime();
          if (serverTime > currentTime) {
            this.currentState = normalized;
            this.saveToLocalStorage(normalized);
            this.notifyListeners(normalized);
          }
        }
      })
      .catch((e) => console.warn('Server fetch warning:', e));

    // Listen to real-time changes in Firestore
    onSnapshot(
      STATE_DOC_REF,
      (snapshot) => {
        if (snapshot.exists()) {
          const firestoreData = snapshot.data() as AppState;
          if (firestoreData && Array.isArray(firestoreData.athletes)) {
            const normalized = normalizeAppState(firestoreData);
            const firestoreTime = new Date(normalized.lastUpdated || 0).getTime();
            const currentTime = new Date(this.currentState.lastUpdated || 0).getTime();

            // Only overwrite if firestore data is newer or has distinct changes
            if (firestoreTime >= currentTime || JSON.stringify(normalized) !== JSON.stringify(this.currentState)) {
              this.currentState = normalized;
              this.saveToLocalStorage(normalized);
              this.notifyListeners(normalized);
            }
          }
        } else {
          // If Firestore document doesn't exist yet, save our current state into Firestore
          this.updateState(this.currentState);
        }
        this.notifyStatus(true);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'app/state');
        this.notifyStatus(false);
      }
    );

    // Test Connection
    getDocFromServer(STATE_DOC_REF).catch((err) => {
      console.warn('Firestore initial fetch error:', err);
    });
  }

  private static notifyListeners(state: AppState) {
    this.listeners.forEach((listener) => listener(state));
  }

  private static notifyStatus(connected: boolean) {
    this.statusListeners.forEach((listener) => listener(connected));
  }

  static async updateState(newState: AppState) {
    const normalized = normalizeAppState(newState);
    normalized.lastUpdated = new Date().toISOString();
    this.currentState = normalized;
    
    // 1. Save synchronously to localStorage
    this.saveToLocalStorage(normalized);
    
    // 2. Notify UI
    this.notifyListeners(normalized);

    // 3. Save to server disk backup
    this.saveToServerHttp(normalized);

    // 4. Clean undefined fields before writing to Firestore
    try {
      const cleanData = JSON.parse(JSON.stringify(normalized));
      await setDoc(STATE_DOC_REF, cleanData);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'app/state');
    }
  }

  static async resetData() {
    const resetState = { ...initialAppState, lastUpdated: new Date().toISOString() };
    this.currentState = resetState;
    this.saveToLocalStorage(resetState);
    this.notifyListeners(resetState);
    this.saveToServerHttp(resetState);

    try {
      const cleanData = JSON.parse(JSON.stringify(resetState));
      await setDoc(STATE_DOC_REF, cleanData);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'app/state');
    }
  }
}
