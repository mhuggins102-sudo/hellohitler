import { create } from 'zustand';
import type { GameMode, GameStatus, Article, ArticleContent, PathEntry } from '../types/game';
import { fetchArticle, fetchRandomArticle } from '../services/wikipediaApi';
import { DEFAULT_TARGET, DEFAULT_TARGET_DISPLAY } from '../utils/constants';
import { getDailyPuzzle } from '../services/dailyPuzzle';
import { hasCompletedDaily, markDailyCompleted, addGameHistoryEntry } from '../services/firebase';
import { getPuzzleId } from '../utils/puzzleLink';

interface GameStore {
  mode: GameMode;
  startArticle: Article | null;
  targetArticle: Article | null;
  currentArticle: ArticleContent | null;
  path: PathEntry[];
  steps: number;
  status: GameStatus;
  loading: boolean;
  error: string | null;
  hardMode: boolean;
  puzzleId: string | null;
  timerEnabled: boolean;
  startTime: number | null;
  elapsedTime: number | null;

  // Cache of fetched articles for back-navigation
  articleCache: Map<string, ArticleContent>;

  // Actions
  startClassicGame: (reversed?: boolean) => Promise<void>;
  startFreePlayGame: (startTitle: string, targetTitle: string) => Promise<void>;
  startDailyGame: (dateStr?: string) => Promise<void>;
  startSharedPuzzle: (startTitle: string, targetTitle: string, options?: { hardMode?: boolean; timer?: boolean }) => Promise<void>;
  dailyDate: string | null;
  setHardMode: (on: boolean) => void;
  setTimerEnabled: (on: boolean) => void;
  navigateTo: (title: string) => Promise<void>;
  goBack: () => void;
  reset: () => void;
}

const initialState = {
  mode: 'classic' as GameMode,
  startArticle: null as Article | null,
  targetArticle: null as Article | null,
  currentArticle: null as ArticleContent | null,
  path: [] as PathEntry[],
  steps: 0,
  status: 'setup' as GameStatus,
  loading: false,
  error: null as string | null,
  articleCache: new Map<string, ArticleContent>(),
  dailyDate: null as string | null,
  hardMode: false,
  puzzleId: null as string | null,
  timerEnabled: false,
  startTime: null as number | null,
  elapsedTime: null as number | null,
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  startClassicGame: async (reversed = false) => {
    const hardMode = get().hardMode;
    const timerEnabled = get().timerEnabled;
    set({ ...initialState, mode: 'classic', loading: true, articleCache: new Map(), hardMode, timerEnabled });

    try {
      const random = await fetchRandomArticle();
      if (!random) throw new Error('Failed to get random article');

      if (reversed) {
        const hitlerArticle = await fetchArticle(DEFAULT_TARGET);
        if (!hitlerArticle) throw new Error('Failed to fetch start article');

        const targetCheck = await fetchArticle(random.title);
        if (!targetCheck) throw new Error('Failed to fetch target article');

        const startArticle: Article = { title: hitlerArticle.title, displayTitle: hitlerArticle.displayTitle };
        const targetArticle: Article = { title: targetCheck.title, displayTitle: targetCheck.displayTitle };
        const currentArticle: ArticleContent = hitlerArticle;
        const firstEntry: PathEntry = { ...startArticle, timestamp: Date.now() };

        const cache = new Map<string, ArticleContent>();
        cache.set(hitlerArticle.title, currentArticle);

        set({
          startArticle,
          targetArticle,
          currentArticle,
          path: [firstEntry],
          steps: 0,
          status: 'playing',
          loading: false,
          articleCache: cache,
          puzzleId: getPuzzleId(startArticle.title, targetArticle.title),
          startTime: Date.now(),
        });
      } else {
        const article = await fetchArticle(random.title);
        if (!article) throw new Error('Failed to fetch article');

        const startArticle: Article = { title: article.title, displayTitle: article.displayTitle };
        const targetArticle: Article = { title: DEFAULT_TARGET, displayTitle: DEFAULT_TARGET_DISPLAY };
        const currentArticle: ArticleContent = article;
        const firstEntry: PathEntry = { ...startArticle, timestamp: Date.now() };

        const cache = new Map<string, ArticleContent>();
        cache.set(article.title, currentArticle);

        set({
          startArticle,
          targetArticle,
          currentArticle,
          path: [firstEntry],
          steps: 0,
          status: 'playing',
          loading: false,
          articleCache: cache,
          puzzleId: getPuzzleId(startArticle.title, targetArticle.title),
          startTime: Date.now(),
        });
      }
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  startFreePlayGame: async (startTitle: string, targetTitle: string) => {
    const hardMode = get().hardMode;
    const timerEnabled = get().timerEnabled;
    const pid = getPuzzleId(startTitle, targetTitle);
    set({ ...initialState, mode: 'freeplay', loading: true, articleCache: new Map(), hardMode, timerEnabled, puzzleId: pid });

    try {
      const article = await fetchArticle(startTitle);
      if (!article) throw new Error('Failed to fetch start article');

      const startArticle: Article = { title: article.title, displayTitle: article.displayTitle };

      const targetCheck = await fetchArticle(targetTitle);
      if (!targetCheck) throw new Error('Target article not found');
      const targetArticle: Article = { title: targetCheck.title, displayTitle: targetCheck.displayTitle };

      const currentArticle: ArticleContent = article;
      const firstEntry: PathEntry = { ...startArticle, timestamp: Date.now() };

      const cache = new Map<string, ArticleContent>();
      cache.set(article.title, currentArticle);

      set({
        startArticle,
        targetArticle,
        currentArticle,
        path: [firstEntry],
        steps: 0,
        status: 'playing',
        loading: false,
        articleCache: cache,
        puzzleId: getPuzzleId(startArticle.title, targetArticle.title),
        startTime: Date.now(),
      });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  startSharedPuzzle: async (startTitle: string, targetTitle: string, options?: { hardMode?: boolean; timer?: boolean }) => {
    const pid = getPuzzleId(startTitle, targetTitle);
    const hardMode = options?.hardMode ?? false;
    const timerEnabled = options?.timer ?? false;
    set({ ...initialState, mode: 'freeplay', loading: true, articleCache: new Map(), hardMode, timerEnabled, puzzleId: pid });

    try {
      const article = await fetchArticle(startTitle);
      if (!article) throw new Error('Failed to fetch start article');

      const startArticle: Article = { title: article.title, displayTitle: article.displayTitle };

      const targetCheck = await fetchArticle(targetTitle);
      if (!targetCheck) throw new Error('Target article not found');
      const targetArticle: Article = { title: targetCheck.title, displayTitle: targetCheck.displayTitle };

      const currentArticle: ArticleContent = article;
      const firstEntry: PathEntry = { ...startArticle, timestamp: Date.now() };

      const cache = new Map<string, ArticleContent>();
      cache.set(article.title, currentArticle);

      set({
        startArticle,
        targetArticle,
        currentArticle,
        path: [firstEntry],
        steps: 0,
        status: 'playing',
        loading: false,
        articleCache: cache,
        puzzleId: getPuzzleId(startArticle.title, targetArticle.title),
        startTime: Date.now(),
      });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  startDailyGame: async (dateStr?: string) => {
    if (hasCompletedDaily(dateStr)) {
      set({ error: 'You already completed this daily puzzle!' });
      return;
    }

    const puzzle = getDailyPuzzle(dateStr);
    set({ ...initialState, mode: 'daily', loading: true, articleCache: new Map(), dailyDate: dateStr || null, hardMode: puzzle.hardMode, timerEnabled: true });

    try {
      const article = await fetchArticle(puzzle.startArticle);
      if (!article) throw new Error('Failed to fetch daily start article');

      const startArticle: Article = { title: article.title, displayTitle: article.displayTitle };

      const targetCheck = await fetchArticle(puzzle.targetArticle);
      const targetArticle: Article = {
        title: targetCheck?.title || puzzle.targetArticle,
        displayTitle: targetCheck?.displayTitle || puzzle.targetArticle,
      };

      const currentArticle: ArticleContent = article;
      const firstEntry: PathEntry = { ...startArticle, timestamp: Date.now() };

      const cache = new Map<string, ArticleContent>();
      cache.set(article.title, currentArticle);

      set({
        startArticle,
        targetArticle,
        currentArticle,
        path: [firstEntry],
        steps: 0,
        status: 'playing',
        loading: false,
        articleCache: cache,
        startTime: Date.now(),
      });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  setHardMode: (on: boolean) => {
    set({ hardMode: on });
  },

  setTimerEnabled: (on: boolean) => {
    set({ timerEnabled: on });
  },

  navigateTo: async (title: string) => {
    const { articleCache, targetArticle, loading } = get();
    if (loading) return;

    set({ loading: true, error: null });

    try {
      let article: ArticleContent;

      const cached = articleCache.get(title);
      if (cached) {
        article = cached;
      } else {
        const fetched = await fetchArticle(title);
        if (!fetched) throw new Error(`Article "${title}" not found`);
        article = fetched;
        articleCache.set(fetched.title, article);
      }

      const newEntry: PathEntry = {
        title: article.title,
        displayTitle: article.displayTitle,
        timestamp: Date.now(),
      };

      const newPath = [...get().path, newEntry];
      const newSteps = get().steps + 1;

      const won = targetArticle &&
        article.title.toLowerCase() === targetArticle.title.toLowerCase();

      if (won && get().mode === 'daily') {
        markDailyCompleted(get().dailyDate || undefined);
      }

      const elapsed = won && get().startTime ? Date.now() - get().startTime! : null;

      if (won) {
        const state = get();
        addGameHistoryEntry({
          mode: state.mode,
          startTitle: state.startArticle?.title || '',
          startDisplayTitle: state.startArticle?.displayTitle || '',
          targetTitle: state.targetArticle?.title || '',
          targetDisplayTitle: state.targetArticle?.displayTitle || '',
          steps: newSteps,
          elapsedTime: elapsed,
          date: new Date().toISOString(),
          puzzleId: state.puzzleId || '',
          path: newPath.map(e => e.displayTitle),
          hardMode: state.hardMode,
          timerEnabled: state.timerEnabled,
          dailyDate: state.dailyDate,
        });
      }

      set({
        currentArticle: article,
        path: newPath,
        steps: newSteps,
        status: won ? 'won' : 'playing',
        loading: false,
        elapsedTime: elapsed,
      });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  goBack: () => {
    const { path, articleCache } = get();
    if (path.length <= 1) return;

    const newPath = path.slice(0, -1);
    const prevEntry = newPath[newPath.length - 1];
    const prevArticle = articleCache.get(prevEntry.title);

    if (prevArticle) {
      set({
        currentArticle: prevArticle,
        path: newPath,
        steps: get().steps - 1,
      });
    }
  },

  reset: () => {
    const hardMode = get().hardMode;
    const timerEnabled = get().timerEnabled;
    set({ ...initialState, articleCache: new Map(), hardMode, timerEnabled });
  },
}));
