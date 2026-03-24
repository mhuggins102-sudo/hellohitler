/**
 * Firebase service for daily puzzle stats.
 *
 * Falls back to localStorage when Firebase is not configured.
 */

import { getTodayString } from '../utils/seededRandom';

const STORAGE_KEY = 'wikipath-daily-results';
const SUBMITTED_KEY = 'wikipath-daily-submitted';
const COMPLETED_KEY_PREFIX = 'wikipath-daily-completed-';

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
  if (!results[date].leaderboard) {
    results[date].leaderboard = [];
  }
  return results[date];
}

/**
 * Check if the player already completed a daily puzzle for a given date.
 */
export function hasCompletedDaily(dateStr?: string): boolean {
  const date = dateStr || getTodayString();
  const completed = localStorage.getItem(COMPLETED_KEY_PREFIX + date);
  return completed === 'true';
}

/** Alias for backwards compat */
export function hasCompletedToday(): boolean {
  return hasCompletedDaily(getTodayString());
}

/**
 * Mark a daily puzzle as completed (prevents replay).
 */
export function markDailyCompleted(dateStr?: string): void {
  const date = dateStr || getTodayString();
  localStorage.setItem(COMPLETED_KEY_PREFIX + date, 'true');
}

/**
 * Check if the player already submitted a result for a given date.
 */
export function hasSubmittedDaily(dateStr?: string): boolean {
  const date = dateStr || getTodayString();
  const submitted = localStorage.getItem(SUBMITTED_KEY);
  return submitted === date;
}

/** Alias for backwards compat */
export function hasSubmittedToday(): boolean {
  return hasSubmittedDaily(getTodayString());
}

/**
 * Submit a daily puzzle result with the player's name.
 */
export async function submitDailyResult(steps: number, playerName: string, dateStr?: string): Promise<void> {
  const date = dateStr || getTodayString();

  if (hasSubmittedDaily(date)) return;

  const results = getStoredResults();
  const data = ensureDateEntry(results, date);

  data.entries.push(steps);
  data.submittedByPlayer = true;
  data.playerName = playerName;
  data.playerSteps = steps;

  data.leaderboard.push({
    name: playerName,
    steps,
    timestamp: Date.now(),
  });

  data.leaderboard.sort((a, b) => a.steps - b.steps || a.timestamp - b.timestamp);

  saveResults(results);
  localStorage.setItem(SUBMITTED_KEY, date);
}

/**
 * Fetch the distribution and leaderboard for a given date's puzzle.
 */
export async function fetchDailyDistribution(dateStr?: string): Promise<{
  distribution: Record<number, number>;
  totalPlayers: number;
  leaderboard: LeaderboardEntry[];
}> {
  const date = dateStr || getTodayString();
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
 * Get the player's saved result for a given date (if any).
 */
export function getPlayerResult(dateStr?: string): { name: string; steps: number } | null {
  const date = dateStr || getTodayString();
  const results = getStoredResults();
  const data = results[date];
  if (data?.submittedByPlayer && data.playerName && data.playerSteps !== undefined) {
    return { name: data.playerName, steps: data.playerSteps };
  }
  return null;
}

/** Alias for backwards compat */
export function getPlayerTodayResult(): { name: string; steps: number } | null {
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
