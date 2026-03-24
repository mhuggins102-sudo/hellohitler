import { useGameStore } from '../store/gameStore';

export function GameHeader() {
  const { currentArticle, targetArticle, steps, status, goBack, reset, path } = useGameStore();

  if (status !== 'playing' && status !== 'won') return null;

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between gap-4 shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={goBack}
          disabled={path.length <= 1}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed p-1"
          title="Go back"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="min-w-0">
          <h1 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
            {currentArticle?.displayTitle || ''}
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Target: <span className="font-medium text-amber-600 dark:text-amber-400">{targetArticle?.displayTitle}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 leading-none">{steps}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">steps</div>
        </div>
        <button
          onClick={reset}
          className="text-xs px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
        >
          Give Up
        </button>
      </div>
    </header>
  );
}
