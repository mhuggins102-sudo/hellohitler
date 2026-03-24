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
const COMPLETED_KEY = 'wikipath-daily-completed';

export interface LeaderboardEntry {
  name: string;
  steps: number;
  timestamp: number;
}

interface DailyData {
  entries: number[];
  leaderboard: LeaderboardEntry[];
  submittedByPlayer: boolean;
  playerName?: string;
  playerSteps?: number;
}

interface DailyResults {
  [date: string]: DailyData;
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

function ensureDateEntry(results: DailyResults, date: string): DailyData {
  if (!results[date]) {
    results[date] = { entries: [], leaderboard: [], submittedByPlayer: false };
  }
  // Migration: ensure leaderboard array exists for old data
  if (!results[date].leaderboard) {
    results[date].leaderboard = [];
  }
  return results[date];
}

/**
 * Check if the player already completed today's daily puzzle.
 */
export function hasCompletedToday(): boolean {
  const completed = localStorage.getItem(COMPLETED_KEY);
  return completed === getTodayString();
}

/**
 * Mark today's daily puzzle as completed (prevents replay).
 */
export function markDailyCompleted(): void {
  localStorage.setItem(COMPLETED_KEY, getTodayString());
}

/**
 * Check if the player already submitted a result today.
 */
export function hasSubmittedToday(): boolean {
  const submitted = localStorage.getItem(SUBMITTED_KEY);
  return submitted === getTodayString();
}

/**
 * Submit a daily puzzle result with the player's name.
 */
export async function submitDailyResult(steps: number, playerName: string): Promise<void> {
  const date = getTodayString();

  // Prevent duplicate submissions
  if (hasSubmittedToday()) return;

  const results = getStoredResults();
  const data = ensureDateEntry(results, date);

  data.entries.push(steps);
  data.submittedByPlayer = true;
  data.playerName = playerName;
  data.playerSteps = steps;

  // Add to leaderboard
  data.leaderboard.push({
    name: playerName,
    steps,
    timestamp: Date.now(),
  });

  // Sort leaderboard by steps (ascending), then by timestamp (earlier is better)
  data.leaderboard.sort((a, b) => a.steps - b.steps || a.timestamp - b.timestamp);

  saveResults(results);
  localStorage.setItem(SUBMITTED_KEY, date);
}

/**
 * Fetch the distribution and leaderboard for today's puzzle.
 */
export async function fetchDailyDistribution(): Promise<{
  distribution: Record<number, number>;
  totalPlayers: number;
  leaderboard: LeaderboardEntry[];
}> {
  const date = getTodayString();
  const results = getStoredResults();
  const data = results[date];
  const entries = data?.entries || [];
  const leaderboard = data?.leaderboard || [];

  const distribution: Record<number, number> = {};
  for (const steps of entries) {
    distribution[steps] = (distribution[steps] || 0) + 1;
  }

  return {
    distribution,
    totalPlayers: entries.length,
    leaderboard,
  };
}

/**
 * Get the player's saved result for today (if any).
 */
export function getPlayerTodayResult(): { name: string; steps: number } | null {
  const date = getTodayString();
  const results = getStoredResults();
  const data = results[date];
  if (data?.submittedByPlayer && data.playerName && data.playerSteps !== undefined) {
    return { name: data.playerName, steps: data.playerSteps };
  }
  return null;
}
