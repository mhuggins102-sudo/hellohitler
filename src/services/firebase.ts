/**
 * Firebase service for daily puzzle stats.
 *
 * Falls back to localStorage when Firebase is not configured.
 * To enable Firebase:
 * 1. Create a Firebase project at console.firebase.google.com
 * 2. Enable Firestore
 * 3. Create a .env file with your Firebase config:
 *    VITE_FIREBASE_API_KEY=...
 *    VITE_FIREBASE_AUTH_DOMAIN=...
 *    VITE_FIREBASE_PROJECT_ID=...
 *    VITE_FIREBASE_STORAGE_BUCKET=...
 *    VITE_FIREBASE_MESSAGING_SENDER_ID=...
 *    VITE_FIREBASE_APP_ID=...
 */

import { getTodayString } from '../utils/seededRandom';

const STORAGE_KEY = 'wikipath-daily-results';
const SUBMITTED_KEY = 'wikipath-daily-submitted';

interface DailyResults {
  [date: string]: {
    entries: number[];
    submittedByPlayer: boolean;
  };
}

function getStoredResults(): DailyResults {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveResults(results: DailyResults): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
}

/**
 * Check if the player already submitted a result today.
 */
export function hasSubmittedToday(): boolean {
  const submitted = localStorage.getItem(SUBMITTED_KEY);
  return submitted === getTodayString();
}

/**
 * Submit a daily puzzle result.
 */
export async function submitDailyResult(steps: number): Promise<void> {
  const date = getTodayString();

  // Prevent duplicate submissions
  if (hasSubmittedToday()) return;

  const results = getStoredResults();
  if (!results[date]) {
    results[date] = { entries: [], submittedByPlayer: false };
  }

  results[date].entries.push(steps);
  results[date].submittedByPlayer = true;
  saveResults(results);

  localStorage.setItem(SUBMITTED_KEY, date);
}

/**
 * Fetch the distribution of results for today's puzzle.
 * Returns a map of steps -> count.
 */
export async function fetchDailyDistribution(): Promise<{
  distribution: Record<number, number>;
  totalPlayers: number;
}> {
  const date = getTodayString();
  const results = getStoredResults();
  const entries = results[date]?.entries || [];

  const distribution: Record<number, number> = {};
  for (const steps of entries) {
    distribution[steps] = (distribution[steps] || 0) + 1;
  }

  return {
    distribution,
    totalPlayers: entries.length,
  };
}
