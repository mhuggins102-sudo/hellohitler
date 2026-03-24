import { useState, useEffect, useRef } from 'react';
import { ModeSelector } from '../components/ModeSelector';
import { ArticleSearch } from '../components/ArticleSearch';
import { DailyDistribution } from '../components/DailyDistribution';
import { DailyLeaderboard } from '../components/DailyLeaderboard';
import { ShareCard, generateShareText } from '../components/ShareCard';
import { useGameStore } from '../store/gameStore';
import { DEFAULT_TARGET } from '../utils/constants';
import { hasCompletedToday, getPlayerTodayResult, fetchDailyDistribution } from '../services/firebase';
import { captureAndShare, copyToClipboard } from '../services/shareService';
import type { LeaderboardEntry } from '../services/firebase';

export function HomePage() {
  const { startClassicGame, startFreePlayGame, startDailyGame, loading, error } = useGameStore();
  const [showFreePlay, setShowFreePlay] = useState(false);
  const [showDailyCompleted, setShowDailyCompleted] = useState(false);
  const [freePlayStart, setFreePlayStart] = useState('');
  const [freePlayTarget, setFreePlayTarget] = useState(DEFAULT_TARGET);
  // false = normal (start -> Hitler), true = reversed (Hitler -> target)
  const [reversed, setReversed] = useState(false);
  const [dailyResult, setDailyResult] = useState<{ name: string; steps: number } | null>(null);
  const [dailyStats, setDailyStats] = useState<{
    distribution: Record<number, number>;
    totalPlayers: number;
    leaderboard: LeaderboardEntry[];
  } | null>(null);

  // Share state for daily completed page
  const shareCardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);

  // Poll daily stats when viewing completed state
  useEffect(() => {
    if (!showDailyCompleted) return;
    const load = async () => {
      const stats = await fetchDailyDistribution();
      setDailyStats(stats);
    };
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [showDailyCompleted]);

  const handleDailyClick = () => {
    if (hasCompletedToday()) {
      const result = getPlayerTodayResult();
      setDailyResult(result);
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
    // Swap the current values
    const oldStart = freePlayStart;
    const oldTarget = freePlayTarget;
    setFreePlayStart(oldTarget);
    setFreePlayTarget(oldStart);
  };

  const handleScreenshot = async () => {
    if (!shareCardRef.current) return;
    setSharing(true);
    try {
      await captureAndShare(shareCardRef.current);
    } finally {
      setSharing(false);
    }
  };

  const handleCopyText = async () => {
    if (!dailyResult) return;
    const text = generateShareText(dailyResult.steps, 'daily');
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (showDailyCompleted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
        <div className="w-full max-w-md">
          <button
            onClick={() => setShowDailyCompleted(false)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-6 flex items-center gap-1 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <div className="text-center mb-6">
            <div className="text-4xl mb-2">✅</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Already Completed!
            </h2>
            {dailyResult && (
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                <span className="font-semibold">{dailyResult.name}</span>, you finished today's puzzle in{' '}
                <span className="font-bold text-blue-600 dark:text-blue-400">{dailyResult.steps}</span>{' '}
                {dailyResult.steps === 1 ? 'step' : 'steps'}.
              </p>
            )}
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              Come back tomorrow for a new puzzle!
            </p>
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
              onClick={handleScreenshot}
              disabled={sharing}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {sharing ? 'Capturing...' : 'Share Image'}
            </button>
            <button
              onClick={handleCopyText}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {copied ? 'Copied!' : 'Copy Result'}
            </button>
          </div>

          {/* Hidden share card for screenshot capture */}
          {dailyResult && (
            <div className="fixed -left-[9999px] top-0">
              <ShareCard
                ref={shareCardRef}
                path={[]}
                steps={dailyResult.steps}
                mode="daily"
                targetTitle=""
              />
            </div>
          )}
        </div>
      </div>
    );
  }

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

            {/* Reverse direction button */}
            <button
              onClick={handleSwapDirection}
              title={reversed ? 'Direction: Hitler → Your choice' : 'Direction: Your choice → Hitler'}
              className="flex items-center gap-1 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors group"
            >
              <span className="text-xl" role="img" aria-label="Swap direction">☸️</span>
              <svg
                className={`w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-transform ${reversed ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </button>
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

            <button
              onClick={() => {
                if (freePlayStart && freePlayTarget) {
                  startFreePlayGame(freePlayStart, freePlayTarget);
                }
              }}
              disabled={!freePlayStart || !freePlayTarget || loading}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Starting...' : 'Start Game'}
            </button>
          </div>
        </div>
      </div>
    );
  }

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
            // Set Free Play defaults based on current home screen direction
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
        />
      )}
    </>
  );
}
