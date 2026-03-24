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
 * Includes hardMode and timer settings as query params.
 */
export function generatePuzzleUrl(
  startTitle: string,
  targetTitle: string,
  options?: { hardMode?: boolean; timer?: boolean },
): string {
  const appUrl = getAppUrl();
  const encoded = encodePuzzle(startTitle, targetTitle);
  let url = `${appUrl}?puzzle=${encoded}`;
  if (options?.hardMode) url += '&h=1';
  if (options?.timer) url += '&t=1';
  return url;
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
  elapsedTime?: number | null,
  options?: { hardMode?: boolean; timer?: boolean },
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
  ];

  if (elapsedTime != null) {
    lines.push(`⏱️ ${formatElapsedTime(elapsedTime)}`);
  }

  lines.push(squares);

  if (appUrl) {
    let url: string;
    if (mode === 'daily') {
      url = `${appUrl}?daily=${dateStr}`;
    } else if (startTitle && targetTitle) {
      url = generatePuzzleUrl(startTitle, targetTitle, options);
    } else {
      url = appUrl;
    }
    lines.push('', url);
  }

  return lines.join('\n');
}

export function formatElapsedTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}
