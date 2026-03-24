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

const COMPLETED_KEY_PREFIX = 'wikipath-daily-completed-';
const SUBMITTED_KEY_PREFIX = 'wikipath-daily-submitted-';
const PLAYER_RESULT_PREFIX = 'wikipath-daily-player-';
const PUZZLE_SUBMITTED_PREFIX = 'wikipath-puzzle-submitted-';

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
): Promise<void> {
  const date = dateStr || getTodayString();

  if (hasSubmittedDaily(date)) return;

  const entry: LeaderboardEntry & { path?: string[] } = {
    name: playerName,
    steps,
    timestamp: Date.now(),
  };
  if (pathTitles) entry.path = pathTitles;

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
    JSON.stringify({ name: playerName, steps, path: pathTitles || [] }),
  );
}

/**
 * Fetch distribution and leaderboard from Firestore.
 */
export async function fetchDailyDistribution(dateStr?: string): Promise<{
  distribution: Record<number, number>;
  totalPlayers: number;
  leaderboard: LeaderboardEntry[];
}> {
  const date = dateStr || getTodayString();

  const firestore = getDb();
  if (!firestore) {
    // No Firebase — return empty (or single-player data if submitted)
    const playerResult = getPlayerResult(date);
    if (playerResult) {
      return {
        distribution: { [playerResult.steps]: 1 },
        totalPlayers: 1,
        leaderboard: [{ name: playerResult.name, steps: playerResult.steps, timestamp: 0 }],
      };
    }
    return { distribution: {}, totalPlayers: 0, leaderboard: [] };
  }

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
      });
    });

    // Sort client-side: by steps ascending, then timestamp ascending
    leaderboard.sort((a, b) => a.steps - b.steps || a.timestamp - b.timestamp);

    return {
      distribution,
      totalPlayers: leaderboard.length,
      leaderboard,
    };
  } catch (e) {
    console.error('Firestore read failed:', e);
    return { distribution: {}, totalPlayers: 0, leaderboard: [] };
  }
}

/**
 * Get the player's saved result for a given date.
 */
export function getPlayerResult(dateStr?: string): { name: string; steps: number; path: string[] } | null {
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

export function hasSubmittedPuzzle(puzzleId: string): boolean {
  return localStorage.getItem(PUZZLE_SUBMITTED_PREFIX + puzzleId) === 'true';
}

export async function submitPuzzleResult(
  puzzleId: string,
  steps: number,
  playerName: string,
  pathTitles?: string[],
): Promise<void> {
  if (hasSubmittedPuzzle(puzzleId)) return;

  const entry: LeaderboardEntry & { path?: string[] } = {
    name: playerName,
    steps,
    timestamp: Date.now(),
  };
  if (pathTitles) entry.path = pathTitles;

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
}

export async function fetchPuzzleDistribution(puzzleId: string): Promise<{
  distribution: Record<number, number>;
  totalPlayers: number;
  leaderboard: LeaderboardEntry[];
}> {
  const firestore = getDb();
  if (!firestore) {
    return { distribution: {}, totalPlayers: 0, leaderboard: [] };
  }

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
      });
    });

    leaderboard.sort((a, b) => a.steps - b.steps || a.timestamp - b.timestamp);

    return {
      distribution,
      totalPlayers: leaderboard.length,
      leaderboard,
    };
  } catch (e) {
    console.error('Firestore read failed:', e);
    return { distribution: {}, totalPlayers: 0, leaderboard: [] };
  }
}
