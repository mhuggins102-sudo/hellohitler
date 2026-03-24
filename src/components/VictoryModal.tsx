import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { generateShareText } from './ShareCard';
import { formatElapsedTime } from './ShareCard';
import { DailyDistribution } from './DailyDistribution';
import { DailyLeaderboard } from './DailyLeaderboard';
import { captureAndSave, shareText } from '../services/shareService';
import { submitDailyResult, fetchDailyDistribution, hasSubmittedDaily, submitPuzzleResult, fetchPuzzleDistribution, hasSubmittedPuzzle, getStoredUsername, setStoredUsername } from '../services/firebase';
import type { LeaderboardEntry } from '../services/firebase';

export function VictoryModal() {
  const { status, steps, path, mode, startArticle, targetArticle, dailyDate, puzzleId, reset, elapsedTime, timerEnabled, hardMode } = useGameStore();
  const [shared, setShared] = useState(false);
  const [saving, setSaving] = useState(false);
  const [playerName, setPlayerName] = useState(() => getStoredUsername() || '');
  const [nameSubmitted, setNameSubmitted] = useState(false);
  const [dailyStats, setDailyStats] = useState<{
    distribution: Record<number, number>;
    totalPlayers: number;
    leaderboard: LeaderboardEntry[];
  } | null>(null);

  const showLeaderboard = mode === 'daily' || !!puzzleId;

  // Check if already submitted, or auto-submit if username is stored
  useEffect(() => {
    if (status !== 'won') return;

    const autoSubmitAndFetch = async () => {
      if (mode === 'daily') {
        if (hasSubmittedDaily(dailyDate || undefined)) {
          setNameSubmitted(true);
          fetchDailyDistribution(dailyDate || undefined).then(setDailyStats);
          return;
        }
      } else if (puzzleId) {
        if (hasSubmittedPuzzle(puzzleId)) {
          setNameSubmitted(true);
          fetchPuzzleDistribution(puzzleId).then(setDailyStats);
          return;
        }
      }

      // Auto-submit if we have a stored username
      const storedName = getStoredUsername();
      if (storedName && showLeaderboard) {
        const pathTitles = path.map((e) => e.displayTitle);
        if (mode === 'daily') {
          await submitDailyResult(steps, storedName, dailyDate || undefined, pathTitles, elapsedTime);
          const stats = await fetchDailyDistribution(dailyDate || undefined);
          setDailyStats(stats);
        } else if (puzzleId) {
          await submitPuzzleResult(puzzleId, steps, storedName, pathTitles, elapsedTime);
          const stats = await fetchPuzzleDistribution(puzzleId);
          setDailyStats(stats);
        }
        setNameSubmitted(true);
      }
    };

    autoSubmitAndFetch();
  }, [status, mode, dailyDate, puzzleId]);

  // Poll for updated stats every 30 seconds after submission
  useEffect(() => {
    if (!nameSubmitted || !showLeaderboard) return;
    const interval = setInterval(async () => {
      const stats = mode === 'daily'
        ? await fetchDailyDistribution(dailyDate || undefined)
        : puzzleId ? await fetchPuzzleDistribution(puzzleId) : null;
      if (stats) setDailyStats(stats);
    }, 30000);
    return () => clearInterval(interval);
  }, [nameSubmitted, showLeaderboard, mode, dailyDate, puzzleId]);

  if (status !== 'won') return null;

  const handleNameSubmit = async () => {
    const trimmed = playerName.trim();
    if (!trimmed) return;
    setStoredUsername(trimmed);
    const pathTitles = path.map((e) => e.displayTitle);
    if (mode === 'daily') {
      await submitDailyResult(steps, trimmed, dailyDate || undefined, pathTitles, elapsedTime);
      const stats = await fetchDailyDistribution(dailyDate || undefined);
      setDailyStats(stats);
    } else if (puzzleId) {
      await submitPuzzleResult(puzzleId, steps, trimmed, pathTitles, elapsedTime);
      const stats = await fetchPuzzleDistribution(puzzleId);
      setDailyStats(stats);
    }
    setNameSubmitted(true);
  };

  const handleSaveImage = async () => {
    setSaving(true);
    try {
      const pathTitles = path.map((e) => e.displayTitle);
      await captureAndSave(steps, mode, pathTitles, targetArticle?.displayTitle || '', dailyDate);
    } finally {
      setSaving(false);
    }
  };

  const handleSharePuzzle = async () => {
    const text = generateShareText(
      steps, mode, dailyDate,
      startArticle?.title, targetArticle?.title,
      timerEnabled ? elapsedTime : null,
      { hardMode, timer: timerEnabled },
    );
    const success = await shareText(text);
    if (success) {
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full p-6 my-8">
        {/* Congrats */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🎉</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            You made it!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            You reached <span className="font-semibold text-amber-600 dark:text-amber-400">{targetArticle?.displayTitle}</span> in{' '}
            <span className="font-bold text-blue-600 dark:text-blue-400">{steps}</span>{' '}
            {steps === 1 ? 'step' : 'steps'}
            {timerEnabled && elapsedTime != null && (
              <span className="text-gray-500 dark:text-gray-400">
                {' '}in {formatElapsedTime(elapsedTime)}
              </span>
            )}
            !
          </p>
        </div>

        {/* Path summary */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-4">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Your Path
          </h3>
          <div className="flex flex-wrap items-center gap-1">
            {path.map((entry, index) => (
              <span key={`${entry.title}-${index}`} className="flex items-center gap-1">
                {index > 0 && <span className="text-gray-400 text-sm">→</span>}
                <span
                  className={`text-sm px-2 py-0.5 rounded-full ${
                    index === 0
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : index === path.length - 1
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 font-medium'
                        : 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  }`}
                >
                  {entry.displayTitle}
                </span>
              </span>
            ))}
          </div>
        </div>

        {/* Name entry + leaderboard (daily or shared puzzle) */}
        {showLeaderboard && !nameSubmitted && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-4">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Record Your Score
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
                placeholder="Enter your name..."
                maxLength={30}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              <button
                onClick={handleNameSubmit}
                disabled={!playerName.trim()}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit
              </button>
            </div>
          </div>
        )}

        {/* Distribution + leaderboard */}
        {showLeaderboard && dailyStats && dailyStats.totalPlayers > 0 && (
          <>
            <DailyDistribution
              distribution={dailyStats.distribution}
              playerSteps={steps}
              totalPlayers={dailyStats.totalPlayers}
            />
            <DailyLeaderboard
              leaderboard={dailyStats.leaderboard}
              playerSteps={steps}
            />
          </>
        )}

        {/* Share buttons */}
        <div className="flex gap-3 mb-4 mt-6">
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

        {/* Play again */}
        <button
          onClick={reset}
          className="w-full py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 font-medium transition-colors"
        >
          Play Again
        </button>
      </div>
    </div>
  );
}
