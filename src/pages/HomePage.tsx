import { useState } from 'react';
import { ModeSelector } from '../components/ModeSelector';
import { ArticleSearch } from '../components/ArticleSearch';
import { useGameStore } from '../store/gameStore';
import { DEFAULT_TARGET } from '../utils/constants';

export function HomePage() {
  const { startClassicGame, startFreePlayGame, startDailyGame, loading, error } = useGameStore();
  const [showFreePlay, setShowFreePlay] = useState(false);
  const [freePlayStart, setFreePlayStart] = useState('');
  const [freePlayTarget, setFreePlayTarget] = useState(DEFAULT_TARGET);

  if (showFreePlay) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
        <div className="w-full max-w-md">
          <button
            onClick={() => setShowFreePlay(false)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-6 flex items-center gap-1 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Free Play Setup
          </h2>

          <div className="space-y-4">
            <ArticleSearch
              label="Start Article"
              placeholder="Search for starting article..."
              onSelect={setFreePlayStart}
            />
            <ArticleSearch
              label="Target Article"
              placeholder="Search for target article..."
              onSelect={setFreePlayTarget}
              defaultValue={DEFAULT_TARGET}
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
          onSelectClassic={startClassicGame}
          onSelectFreePlay={() => setShowFreePlay(true)}
          onSelectDaily={startDailyGame}
        />
      )}
    </>
  );
}
