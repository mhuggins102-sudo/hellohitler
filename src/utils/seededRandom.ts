import seedrandom from 'seedrandom';

const EPOCH = '2026-01-01';

/**
 * Creates a seeded random number generator based on a date string.
 * Same date = same sequence of random numbers.
 */
export function createDailyRng(dateStr: string): () => number {
  return seedrandom(dateStr);
}

/**
 * Gets today's date as a string in YYYY-MM-DD format.
 */
export function getTodayString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

/**
 * Gets the daily puzzle number (days since epoch date) for today.
 */
export function getDailyPuzzleNumber(): number {
  return getPuzzleNumberForDate(getTodayString());
}

/**
 * Gets the puzzle number for a specific date string.
 */
export function getPuzzleNumberForDate(dateStr: string): number {
  const epoch = new Date(EPOCH).getTime();
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.floor((target.getTime() - epoch) / (1000 * 60 * 60 * 24));
}

/**
 * Gets the date string (YYYY-MM-DD) for a specific puzzle number.
 */
export function getDateForPuzzleNumber(puzzleNum: number): string {
  const epoch = new Date(EPOCH);
  epoch.setHours(0, 0, 0, 0);
  const target = new Date(epoch.getTime() + puzzleNum * 24 * 60 * 60 * 1000);
  return `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}-${String(target.getDate()).padStart(2, '0')}`;
}
