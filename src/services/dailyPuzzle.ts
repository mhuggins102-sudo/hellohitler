import { CURATED_ARTICLES, DEFAULT_TARGET } from '../utils/constants';
import { createDailyRng, getTodayString, getDailyPuzzleNumber } from '../utils/seededRandom';

export interface DailyPuzzle {
  startArticle: string;
  targetArticle: string;
  dateString: string;
  puzzleNumber: number;
}

/**
 * Generates the daily puzzle for today (or a given date string).
 * Uses seeded RNG so all players get the same puzzle.
 */
export function getDailyPuzzle(dateStr?: string): DailyPuzzle {
  const date = dateStr || getTodayString();
  const rng = createDailyRng(`wikipath-daily-${date}`);

  const articles = [...CURATED_ARTICLES];

  // Pick start article
  const startIdx = Math.floor(rng() * articles.length);
  const startArticle = articles[startIdx];

  // Pick target article (different from start)
  // ~50% of daily puzzles use Hitler as target for thematic consistency,
  // the other 50% pick a random target
  const useDefaultTarget = rng() < 0.5;

  let targetArticle: string;
  if (useDefaultTarget) {
    targetArticle = DEFAULT_TARGET;
  } else {
    // Remove start from candidates
    const candidates = articles.filter((_, i) => i !== startIdx);
    // Also remove Hitler from random target pool so it's only used in the 50% case
    const filtered = candidates.filter(a => a !== DEFAULT_TARGET);
    const targetIdx = Math.floor(rng() * filtered.length);
    targetArticle = filtered[targetIdx];
  }

  return {
    startArticle,
    targetArticle,
    dateString: date,
    puzzleNumber: getDailyPuzzleNumber(),
  };
}
