import { useRef, useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { ShareCard, generateShareText } from './ShareCard';
import { DailyDistribution } from './DailyDistribution';
import { captureAndShare, copyToClipboard } from '../services/shareService';
import { submitDailyResult, fetchDailyDistribution } from '../services/firebase';

export function VictoryModal() {
  const { status, steps, path, mode, targetArticle, reset } = useGameStore();
  const shareCardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [dailyStats, setDailyStats] = useState<{
    distribution: Record<number, number>;
    totalPlayers: number;
  } | null>(null);

  // Submit daily result and fetch distribution
  useEffect(() => {
    if (status !== 'won' || mode !== 'daily') return;

    const run = async () => {
      await submitDailyResult(steps);
      const stats = await fetchDailyDistribution();
      setDailyStats(stats);
    };
    run();
  }, [status, mode, steps]);

  if (status !== 'won') return null;

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
    const text = generateShareText(steps, mode);
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
            {steps === 1 ? 'step' : 'steps'}!
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
                  dangerouslySetInnerHTML={{ __html: entry.displayTitle }}
                />
              </span>
            ))}
          </div>
        </div>

        {/* Daily distribution */}
        {mode === 'daily' && dailyStats && dailyStats.totalPlayers > 0 && (
          <DailyDistribution
            distribution={dailyStats.distribution}
            playerSteps={steps}
            totalPlayers={dailyStats.totalPlayers}
          />
        )}

        {/* Share buttons */}
        <div className="flex gap-3 mb-4 mt-6">
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
        <div className="fixed -left-[9999px] top-0">
          <ShareCard
            ref={shareCardRef}
            path={path}
            steps={steps}
            mode={mode}
            targetTitle={targetArticle?.displayTitle || ''}
          />
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
