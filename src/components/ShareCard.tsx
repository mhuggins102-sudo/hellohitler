import type { GameMode } from '../types/game';
import { getDailyPuzzleNumber, getPuzzleNumberForDate, getTodayString } from '../utils/seededRandom';

/**
 * Get the app URL (for sharing)
 */
export function getAppUrl(): string {
  return typeof window !== 'undefined' ? window.location.origin : '';
}

/**
 * Generate Wordle-style spoiler-free share text.
 * For daily puzzles, includes a link to that specific puzzle date.
 */
export function generateShareText(steps: number, mode: GameMode, dailyDate?: string | null): string {
  const dateStr = dailyDate || getTodayString();
  const puzzleNumber = mode === 'daily' ? getPuzzleNumberForDate(dateStr) : getDailyPuzzleNumber();
  const squares = '⬜'.repeat(Math.max(0, steps - 1)) + '🎯';
  const appUrl = getAppUrl();

  const header = mode === 'daily'
    ? `WikiPath Daily #${puzzleNumber}`
    : mode === 'classic'
      ? 'WikiPath Classic'
      : 'WikiPath Free Play';

  const lines = [
    header,
    `🟩 ${steps} ${steps === 1 ? 'step' : 'steps'}`,
    squares,
  ];

  if (appUrl) {
    const url = mode === 'daily'
      ? `${appUrl}?daily=${dateStr}`
      : appUrl;
    lines.push('', url);
  }

  return lines.join('\n');
}
