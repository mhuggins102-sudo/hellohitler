import seedrandom from 'seedrandom';

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
 * Gets the daily puzzle number (days since epoch date).
 */
export function getDailyPuzzleNumber(): number {
  const epoch = new Date('2026-01-01').getTime();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.floor((today.getTime() - epoch) / (1000 * 60 * 60 * 24));
}
