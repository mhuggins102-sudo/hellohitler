import { useState, useEffect } from 'react';
import { ModeSelector } from '../components/ModeSelector';
import { ArticleSearch } from '../components/ArticleSearch';
import { DailyDistribution } from '../components/DailyDistribution';
import { DailyLeaderboard } from '../components/DailyLeaderboard';
import { generateShareText } from '../components/ShareCard';
import { PuzzleHistory } from '../components/PuzzleHistory';
import { useGameStore } from '../store/gameStore';
import { DEFAULT_TARGET } from '../utils/constants';
import { generatePuzzleUrl } from '../components/ShareCard';
import { hasCompletedDaily, getPlayerResult, fetchDailyDistribution } from '../services/firebase';
import { captureAndSave, shareText } from '../services/shareService';
import { getTodayString, getPuzzleNumberForDate } from '../utils/seededRandom';
import type { LeaderboardEntry } from '../services/firebase';

export function HomePage() {
  const { startClassicGame, startFreePlayGame, startDailyGame, loading, error, hardMode, setHardMode, timerEnabled, setTimerEnabled } = useGameStore();
  const [showFreePlay, setShowFreePlay] = useState(false);
  const [showDailyCompleted, setShowDailyCompleted] = useState(false);
  const [showDailyHistory, setShowDailyHistory] = useState(false);
  const [showPuzzleHistory, setShowPuzzleHistory] = useState(false);
  const [freePlayStart, setFreePlayStart] = useState('');
  const [freePlayTarget, setFreePlayTarget] = useState(DEFAULT_TARGET);
  const [reversed, setReversed] = useState(false);
  const [dailyResult, setDailyResult] = useState<{ name: string; steps: number; path: string[] } | null>(null);
  const [dailyViewDate, setDailyViewDate] = useState(getTodayString());
  const [dailyStats, setDailyStats] = useState<{
    distribution: Record<number, number>;
    totalPlayers: number;
    leaderboard: LeaderboardEntry[];
  } | null>(null);

  const [shared, setShared] = useState(false);
  const [saving, setSaving] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  // Poll daily stats when viewing completed state
  useEffect(() => {
    if (!showDailyCompleted) return;
    const load = async () => {
      const stats = await fetchDailyDistribution(dailyViewDate);
      setDailyStats(stats);
    };
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [showDailyCompleted, dailyViewDate]);

  const handleDailyClick = () => {
    const today = getTodayString();
    if (hasCompletedDaily(today)) {
      const result = getPlayerResult(today);
      setDailyResult(result);
      setDailyViewDate(today);
      setShowDailyCompleted(true);
    } else {
      startDailyGame();
    }
  };

  const handleToggleReversed = () => {
    setReversed((prev) => !prev);
  };

  const handleSwapDirection = () => {
    setReversed((prev) => !prev);
    const oldStart = freePlayStart;
    const oldTarget = freePlayTarget;
    setFreePlayStart(oldTarget);
    setFreePlayTarget(oldStart);
  };

  const handleSaveImage = async () => {
    if (!dailyResult) return;
    setSaving(true);
    try {
      await captureAndSave(dailyResult.steps, 'daily', dailyResult.path, '', dailyViewDate);
    } finally {
      setSaving(false);
    }
  };

  const handleSharePuzzle = async () => {
    if (!dailyResult) return;
    const text = generateShareText(dailyResult.steps, 'daily', dailyViewDate);
    const success = await shareText(text);
    if (success) {
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  // Generate past puzzle dates (last 30 days)
  const getPastPuzzles = () => {
    const puzzles: Array<{ date: string; puzzleNumber: number; completed: boolean }> = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      puzzles.push({
        date: dateStr,
        puzzleNumber: getPuzzleNumberForDate(dateStr),
        completed: hasCompletedDaily(dateStr),
      });
    }
    return puzzles;
  };

  // ---- Daily History View ----
  if (showDailyHistory) {
    const puzzles = getPastPuzzles();
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
        <div className="w-full max-w-md">
          <button
            onClick={() => setShowDailyHistory(false)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-6 flex items-center gap-1 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Daily Puzzle Archive
          </h2>

          <div className="space-y-2">
            {puzzles.map(({ date, puzzleNumber, completed }) => {
              const isToday = date === getTodayString();
              const result = completed ? getPlayerResult(date) : null;

              return (
                <button
                  key={date}
                  onClick={() => {
                    if (completed) {
                      const r = getPlayerResult(date);
                      setDailyResult(r);
                      setDailyViewDate(date);
                      setShowDailyHistory(false);
                      setShowDailyCompleted(true);
                    } else {
                      startDailyGame(date);
                    }
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-left ${
                    completed
                      ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800 hover:border-green-400'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-md'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                        Daily #{puzzleNumber}
                      </span>
                      {isToday && (
                        <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium">
                          Today
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{date}</span>
                  </div>
                  <div>
                    {completed ? (
                      <div className="flex items-center gap-2">
                        {result && (
                          <span className="text-sm font-bold text-green-600 dark:text-green-400">
                            {result.steps} {result.steps === 1 ? 'step' : 'steps'}
                          </span>
                        )}
                        <span className="text-green-500">✓</span>
                      </div>
                    ) : (
                      <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">Play</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ---- Daily Completed View ----
  if (showDailyCompleted) {
    const puzzleNum = getPuzzleNumberForDate(dailyViewDate);
    const isToday = dailyViewDate === getTodayString();

    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setShowDailyCompleted(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center gap-1 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <button
              onClick={() => {
                setShowDailyCompleted(false);
                setShowDailyHistory(true);
              }}
              className="text-sm text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium"
            >
              Daily Puzzle Archive
            </button>
          </div>

          <div className="text-center mb-6">
            <div className="text-4xl mb-2">✅</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {isToday ? 'Already Completed!' : `Daily #${puzzleNum}`}
            </h2>
            {dailyResult && (
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                <span className="font-semibold">{dailyResult.name}</span>, you finished {isToday ? "today's" : 'this'} puzzle in{' '}
                <span className="font-bold text-blue-600 dark:text-blue-400">{dailyResult.steps}</span>{' '}
                {dailyResult.steps === 1 ? 'step' : 'steps'}.
              </p>
            )}
            {isToday && (
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                Come back tomorrow for a new puzzle!
              </p>
            )}
          </div>

          {dailyStats && dailyStats.totalPlayers > 0 && (
            <>
              <DailyDistribution
                distribution={dailyStats.distribution}
                playerSteps={dailyResult?.steps ?? 0}
                totalPlayers={dailyStats.totalPlayers}
              />
              <DailyLeaderboard
                leaderboard={dailyStats.leaderboard}
                playerSteps={dailyResult?.steps ?? 0}
              />
            </>
          )}

          {/* Share buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSaveImage}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {saving ? 'Saving...' : 'Save Image'}
            </button>
            <button
              onClick={handleSharePuzzle}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              {shared ? 'Shared!' : 'Share Puzzle'}
            </button>
          </div>

        </div>
      </div>
    );
  }

  // ---- Free Play Setup ----
  if (showFreePlay) {
    const startLabel = reversed ? 'Start Article (default: Adolf Hitler)' : 'Start Article';
    const targetLabel = reversed ? 'Target Article' : 'Target Article (default: Adolf Hitler)';

    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
        <div className="w-full max-w-md relative">
          <button
            onClick={() => setShowFreePlay(false)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-6 flex items-center gap-1 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Free Play Setup
            </h2>

            <div className="flex items-center gap-2">
              {/* Direction toggle */}
              <button
                onClick={handleSwapDirection}
                title={reversed ? 'Direction: Hitler → Your choice' : 'Direction: Your choice → Hitler'}
                className={`flex items-center justify-center w-10 h-10 rounded-lg border transition-all ${
                  reversed
                    ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-500'
                }`}
              >
                <span className="text-lg">☸️</span>
              </button>

              {/* Hard Mode toggle */}
              <button
                onClick={() => setHardMode(!hardMode)}
                title="Hard Mode"
                className={`flex items-center justify-center w-10 h-10 rounded-lg border transition-all ${
                  hardMode
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-red-400 dark:hover:border-red-500'
                }`}
              >
                <span className="text-lg">💀</span>
              </button>

              {/* Timer toggle */}
              <button
                onClick={() => setTimerEnabled(!timerEnabled)}
                title="Timer"
                className={`flex items-center justify-center w-10 h-10 rounded-lg border transition-all ${
                  timerEnabled
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500'
                }`}
              >
                <svg className={`w-5 h-5 ${timerEnabled ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <ArticleSearch
              key={`start-${reversed}`}
              label={startLabel}
              placeholder="Search for starting article..."
              onSelect={setFreePlayStart}
              defaultValue={reversed ? DEFAULT_TARGET : ''}
            />
            <ArticleSearch
              key={`target-${reversed}`}
              label={targetLabel}
              placeholder="Search for target article..."
              onSelect={setFreePlayTarget}
              defaultValue={reversed ? '' : DEFAULT_TARGET}
            />

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (freePlayStart && freePlayTarget) {
                    startFreePlayGame(freePlayStart, freePlayTarget);
                  }
                }}
                disabled={!freePlayStart || !freePlayTarget || loading}
                className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Starting...' : 'Start Game'}
              </button>
              <button
                onClick={async () => {
                  if (freePlayStart && freePlayTarget) {
                    const url = generatePuzzleUrl(freePlayStart, freePlayTarget, {
                      hardMode,
                      timer: timerEnabled,
                    });
                    try {
                      await navigator.clipboard.writeText(url);
                    } catch {
                      // fallback
                      const ta = document.createElement('textarea');
                      ta.value = url;
                      document.body.appendChild(ta);
                      ta.select();
                      document.execCommand('copy');
                      document.body.removeChild(ta);
                    }
                    setLinkCopied(true);
                    setTimeout(() => setLinkCopied(false), 2000);
                  }
                }}
                disabled={!freePlayStart || !freePlayTarget}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                {linkCopied ? 'Copied!' : 'Generate Link'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---- Home Screen ----
  return (
    <>
      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-100 text-red-800 px-4 py-2 rounded-lg shadow text-sm">
          {error}
        </div>
      )}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-gray-500 mt-4">Setting up your game...</p>
        </div>
      ) : (
        <ModeSelector
          onSelectClassic={() => startClassicGame(reversed)}
          onSelectFreePlay={() => {
            if (reversed) {
              setFreePlayStart(DEFAULT_TARGET);
              setFreePlayTarget('');
            } else {
              setFreePlayStart('');
              setFreePlayTarget(DEFAULT_TARGET);
            }
            setShowFreePlay(true);
          }}
          onSelectDaily={handleDailyClick}
          reversed={reversed}
          onToggleReversed={handleToggleReversed}
          hardMode={hardMode}
          onToggleHardMode={() => setHardMode(!hardMode)}
          timerEnabled={timerEnabled}
          onToggleTimer={() => setTimerEnabled(!timerEnabled)}
          onOpenHistory={() => setShowPuzzleHistory(true)}
        />
      )}
      {showPuzzleHistory && (
        <PuzzleHistory onClose={() => setShowPuzzleHistory(false)} />
      )}
    </>
  );
}
