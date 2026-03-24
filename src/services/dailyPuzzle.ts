import { CURATED_ARTICLES, DEFAULT_TARGET } from '../utils/constants';
import { createDailyRng, getTodayString, getDailyPuzzleNumber } from '../utils/seededRandom';

export interface DailyPuzzle {
  startArticle: string;
  targetArticle: string;
  dateString: string;
  puzzleNumber: number;
  reversed: boolean;
  hardMode: boolean;
}

/**
 * Generates the daily puzzle for today (or a given date string).
 * Uses seeded RNG so all players get the same puzzle.
 */
export function getDailyPuzzle(dateStr?: string): DailyPuzzle {
  const date = dateStr || getTodayString();
  const rng = createDailyRng(`wikipath-daily-${date}`);

  const articles = [...CURATED_ARTICLES];

  // Determine mode distribution:
  // 1/3 Hitler → random (reversed), 1/3 random → Hitler (normal), 1/3 Hard mode
  const modeRoll = rng();
  let reversed: boolean;
  let hardMode: boolean;

  if (modeRoll < 1 / 3) {
    // Hitler → random end
    reversed = true;
    hardMode = false;
  } else if (modeRoll < 2 / 3) {
    // Random start → Hitler
    reversed = false;
    hardMode = false;
  } else {
    // Hard mode: half in each direction
    hardMode = true;
    reversed = rng() < 0.5;
  }

  // Pick a random article (not Hitler) for the non-Hitler endpoint
  const candidates = articles.filter(a => a !== DEFAULT_TARGET);
  const randomIdx = Math.floor(rng() * candidates.length);
  const randomArticle = candidates[randomIdx];

  const startArticle = reversed ? DEFAULT_TARGET : randomArticle;
  const targetArticle = reversed ? randomArticle : DEFAULT_TARGET;

  return {
    startArticle,
    targetArticle,
    dateString: date,
    puzzleNumber: getDailyPuzzleNumber(),
    reversed,
    hardMode,
  };
}
