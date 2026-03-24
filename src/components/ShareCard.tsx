import type { GameMode } from '../types/game';
import { getDailyPuzzleNumber, getPuzzleNumberForDate, getTodayString } from '../utils/seededRandom';
import { encodePuzzle } from '../utils/puzzleLink';

/**
 * Get the app URL (for sharing)
 */
export function getAppUrl(): string {
  return typeof window !== 'undefined' ? window.location.origin : '';
}

/**
 * Generate a shareable puzzle URL for classic/freeplay modes.
 */
export function generatePuzzleUrl(startTitle: string, targetTitle: string): string {
  const appUrl = getAppUrl();
  const encoded = encodePuzzle(startTitle, targetTitle);
  return `${appUrl}?puzzle=${encoded}`;
}

/**
 * Generate Wordle-style spoiler-free share text.
 * For daily puzzles, includes a link to that specific puzzle date.
 * For classic/freeplay, includes a puzzle link so others can play the same route.
 */
export function generateShareText(
  steps: number,
  mode: GameMode,
  dailyDate?: string | null,
  startTitle?: string,
  targetTitle?: string,
): string {
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
    let url: string;
    if (mode === 'daily') {
      url = `${appUrl}?daily=${dateStr}`;
    } else if (startTitle && targetTitle) {
      url = generatePuzzleUrl(startTitle, targetTitle);
    } else {
      url = appUrl;
    }
    lines.push('', url);
  }

  return lines.join('\n');
}
