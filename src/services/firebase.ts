/**
 * Firebase service for daily puzzle stats.
 *
 * Uses Firestore for shared leaderboard data.
 * localStorage is used only for local flags (completed, submitted).
 */

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  Firestore,
} from 'firebase/firestore';
import { getTodayString } from '../utils/seededRandom';
import type { GameMode } from '../types/game';

const COMPLETED_KEY_PREFIX = 'wikipath-daily-completed-';
const SUBMITTED_KEY_PREFIX = 'wikipath-daily-submitted-';
const PLAYER_RESULT_PREFIX = 'wikipath-daily-player-';
const PUZZLE_SUBMITTED_PREFIX = 'wikipath-puzzle-submitted-';
const USERNAME_KEY = 'wikipath-username';
const GAME_HISTORY_KEY = 'wikipath-game-history';

// --- Username persistence ---

export function getStoredUsername(): string | null {
  return localStorage.getItem(USERNAME_KEY);
}

export function setStoredUsername(name: string): void {
  localStorage.setItem(USERNAME_KEY, name);
}

// --- Firebase initialization ---

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let db: Firestore | null = null;

function getDb(): Firestore | null {
  if (db) return db;
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.warn('Firebase not configured — leaderboard will not be shared.');
    return null;
  }
  try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    return db;
  } catch (e) {
    console.error('Firebase init failed:', e);
    return null;
  }
}

// --- Types ---

export interface LeaderboardEntry {
  name: string;
  steps: number;
  timestamp: number;
  elapsedTime?: number | null;
}

export interface GameHistoryEntry {
  mode: GameMode;
  startTitle: string;
  startDisplayTitle: string;
  targetTitle: string;
  targetDisplayTitle: string;
  steps: number;
  elapsedTime: number | null;
  date: string;
  puzzleId: string;
  path: string[];
  hardMode: boolean;
  timerEnabled: boolean;
  dailyDate?: string | null;
}

// --- Local flags (localStorage) ---

export function hasCompletedDaily(dateStr?: string): boolean {
  const date = dateStr || getTodayString();
  return localStorage.getItem(COMPLETED_KEY_PREFIX + date) === 'true';
}

export function hasCompletedToday(): boolean {
  return hasCompletedDaily(getTodayString());
}

export function markDailyCompleted(dateStr?: string): void {
  const date = dateStr || getTodayString();
  localStorage.setItem(COMPLETED_KEY_PREFIX + date, 'true');
}

export function hasSubmittedDaily(dateStr?: string): boolean {
  const date = dateStr || getTodayString();
  return localStorage.getItem(SUBMITTED_KEY_PREFIX + date) === 'true';
}

// --- Game history (localStorage) ---

export function addGameHistoryEntry(entry: GameHistoryEntry): void {
  const history = getGameHistory();
  history.unshift(entry);
  // Keep last 200 entries
  if (history.length > 200) history.length = 200;
  localStorage.setItem(GAME_HISTORY_KEY, JSON.stringify(history));
}

export function getGameHistory(): GameHistoryEntry[] {
  try {
    const stored = localStorage.getItem(GAME_HISTORY_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return [];
}

export function getGameHistoryByMode(mode: GameMode): GameHistoryEntry[] {
  return getGameHistory().filter(e => e.mode === mode);
}

// --- Firestore operations ---

/**
 * Submit a daily puzzle result.
 * Writes to Firestore collection: dailyPuzzles/{date}/submissions
 */
export async function submitDailyResult(
  steps: number,
  playerName: string,
  dateStr?: string,
  pathTitles?: string[],
  elapsedTime?: number | null,
): Promise<void> {
  const date = dateStr || getTodayString();

  if (hasSubmittedDaily(date)) return;

  const entry: LeaderboardEntry & { path?: string[] } = {
    name: playerName,
    steps,
    timestamp: Date.now(),
  };
  if (pathTitles) entry.path = pathTitles;
  if (elapsedTime != null) entry.elapsedTime = elapsedTime;

  // Save to Firestore
  const firestore = getDb();
  if (firestore) {
    try {
      const submissionsRef = collection(firestore, 'dailyPuzzles', date, 'submissions');
      await addDoc(submissionsRef, entry);
    } catch (e) {
      console.error('Firestore write failed:', e);
    }
  }

  // Mark as submitted locally
  localStorage.setItem(SUBMITTED_KEY_PREFIX + date, 'true');

  // Save player result locally for getPlayerResult()
  localStorage.setItem(
    PLAYER_RESULT_PREFIX + date,
    JSON.stringify({ name: playerName, steps, path: pathTitles || [], elapsedTime: elapsedTime ?? null }),
  );
}

function sortLeaderboard(leaderboard: LeaderboardEntry[]): void {
  leaderboard.sort((a, b) => {
    if (a.steps !== b.steps) return a.steps - b.steps;
    // Tiebreaker: faster elapsed time wins
    const aTime = a.elapsedTime ?? Infinity;
    const bTime = b.elapsedTime ?? Infinity;
    if (aTime !== bTime) return aTime - bTime;
    return a.timestamp - b.timestamp;
  });
}

/**
 * Fetch distribution and leaderboard from Firestore.
 * Merges local player data to guarantee the current player always appears.
 */
export async function fetchDailyDistribution(dateStr?: string): Promise<{
  distribution: Record<number, number>;
  totalPlayers: number;
  leaderboard: LeaderboardEntry[];
}> {
  const date = dateStr || getTodayString();
  const localPlayer = getPlayerResult(date);

  const buildLocal = () => {
    if (localPlayer) {
      return {
        distribution: { [localPlayer.steps]: 1 } as Record<number, number>,
        totalPlayers: 1,
        leaderboard: [{ name: localPlayer.name, steps: localPlayer.steps, timestamp: 0, elapsedTime: localPlayer.elapsedTime }],
      };
    }
    return { distribution: {} as Record<number, number>, totalPlayers: 0, leaderboard: [] as LeaderboardEntry[] };
  };

  const firestore = getDb();
  if (!firestore) return buildLocal();

  try {
    const submissionsRef = collection(firestore, 'dailyPuzzles', date, 'submissions');
    const snapshot = await getDocs(submissionsRef);

    const distribution: Record<number, number> = {};
    const leaderboard: LeaderboardEntry[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      const steps = data.steps as number;
      distribution[steps] = (distribution[steps] || 0) + 1;
      leaderboard.push({
        name: data.name as string,
        steps,
        timestamp: data.timestamp as number,
        elapsedTime: (data.elapsedTime as number | undefined) ?? null,
      });
    });

    // Merge local player if their entry isn't in Firestore results
    if (localPlayer && !leaderboard.some((e) => e.name === localPlayer.name && e.steps === localPlayer.steps)) {
      leaderboard.push({ name: localPlayer.name, steps: localPlayer.steps, timestamp: 0, elapsedTime: localPlayer.elapsedTime });
      distribution[localPlayer.steps] = (distribution[localPlayer.steps] || 0) + 1;
    }

    if (leaderboard.length === 0) return buildLocal();

    sortLeaderboard(leaderboard);

    return {
      distribution,
      totalPlayers: leaderboard.length,
      leaderboard,
    };
  } catch (e) {
    console.error('Firestore read failed:', e);
    return buildLocal();
  }
}

/**
 * Get the player's saved result for a given date.
 */
export function getPlayerResult(dateStr?: string): { name: string; steps: number; path: string[]; elapsedTime?: number | null } | null {
  const date = dateStr || getTodayString();
  try {
    const stored = localStorage.getItem(PLAYER_RESULT_PREFIX + date);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return null;
}

export function getPlayerTodayResult(): { name: string; steps: number; path: string[] } | null {
  return getPlayerResult(getTodayString());
}

/**
 * Get all dates that have been completed.
 */
export function getCompletedDates(): string[] {
  const dates: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(COMPLETED_KEY_PREFIX)) {
      const date = key.slice(COMPLETED_KEY_PREFIX.length);
      if (localStorage.getItem(key) === 'true') {
        dates.push(date);
      }
    }
  }
  return dates.sort().reverse();
}

// --- Shared puzzle leaderboard ---

function getPuzzlePlayerResult(puzzleId: string): { name: string; steps: number; elapsedTime?: number | null } | null {
  try {
    const stored = localStorage.getItem('wikipath-puzzle-player-' + puzzleId);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return null;
}

export function hasSubmittedPuzzle(puzzleId: string): boolean {
  return localStorage.getItem(PUZZLE_SUBMITTED_PREFIX + puzzleId) === 'true';
}

export async function submitPuzzleResult(
  puzzleId: string,
  steps: number,
  playerName: string,
  pathTitles?: string[],
  elapsedTime?: number | null,
): Promise<void> {
  if (hasSubmittedPuzzle(puzzleId)) return;

  const entry: LeaderboardEntry & { path?: string[] } = {
    name: playerName,
    steps,
    timestamp: Date.now(),
  };
  if (pathTitles) entry.path = pathTitles;
  if (elapsedTime != null) entry.elapsedTime = elapsedTime;

  const firestore = getDb();
  if (firestore) {
    try {
      const submissionsRef = collection(firestore, 'sharedPuzzles', puzzleId, 'submissions');
      await addDoc(submissionsRef, entry);
    } catch (e) {
      console.error('Firestore write failed:', e);
    }
  }

  localStorage.setItem(PUZZLE_SUBMITTED_PREFIX + puzzleId, 'true');

  // Save player result locally for fallback
  localStorage.setItem(
    'wikipath-puzzle-player-' + puzzleId,
    JSON.stringify({ name: playerName, steps, path: pathTitles || [], elapsedTime: elapsedTime ?? null }),
  );
}

export async function fetchPuzzleDistribution(puzzleId: string): Promise<{
  distribution: Record<number, number>;
  totalPlayers: number;
  leaderboard: LeaderboardEntry[];
}> {
  const localPlayer = getPuzzlePlayerResult(puzzleId);

  const buildLocal = () => {
    if (localPlayer) {
      return {
        distribution: { [localPlayer.steps]: 1 } as Record<number, number>,
        totalPlayers: 1,
        leaderboard: [{ name: localPlayer.name, steps: localPlayer.steps, timestamp: 0, elapsedTime: localPlayer.elapsedTime }],
      };
    }
    return { distribution: {} as Record<number, number>, totalPlayers: 0, leaderboard: [] as LeaderboardEntry[] };
  };

  const firestore = getDb();
  if (!firestore) return buildLocal();

  try {
    const submissionsRef = collection(firestore, 'sharedPuzzles', puzzleId, 'submissions');
    const snapshot = await getDocs(submissionsRef);

    const distribution: Record<number, number> = {};
    const leaderboard: LeaderboardEntry[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      const steps = data.steps as number;
      distribution[steps] = (distribution[steps] || 0) + 1;
      leaderboard.push({
        name: data.name as string,
        steps,
        timestamp: data.timestamp as number,
        elapsedTime: (data.elapsedTime as number | undefined) ?? null,
      });
    });

    // Merge local player if their entry isn't in Firestore results
    if (localPlayer && !leaderboard.some((e) => e.name === localPlayer.name && e.steps === localPlayer.steps)) {
      leaderboard.push({ name: localPlayer.name, steps: localPlayer.steps, timestamp: 0, elapsedTime: localPlayer.elapsedTime });
      distribution[localPlayer.steps] = (distribution[localPlayer.steps] || 0) + 1;
    }

    if (leaderboard.length === 0) return buildLocal();

    sortLeaderboard(leaderboard);

    return {
      distribution,
      totalPlayers: leaderboard.length,
      leaderboard,
    };
  } catch (e) {
    console.error('Firestore read failed:', e);
    return buildLocal();
  }
}
