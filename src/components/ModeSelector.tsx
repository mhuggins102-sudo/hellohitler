interface ModeSelectorProps {
  onSelectClassic: () => void;
  onSelectFreePlay: () => void;
  onSelectDaily: () => void;
  reversed: boolean;
  onToggleReversed: () => void;
  hardMode: boolean;
  onToggleHardMode: () => void;
  timerEnabled: boolean;
  onToggleTimer: () => void;
  onOpenHistory: () => void;
}

export function ModeSelector({ onSelectClassic, onSelectFreePlay, onSelectDaily, reversed, onToggleReversed, hardMode, onToggleHardMode, timerEnabled, onToggleTimer, onOpenHistory }: ModeSelectorProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* History button - top right */}
      <div className="fixed top-4 right-4 z-10">
        <button
          onClick={onOpenHistory}
          title="Puzzle History"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-md transition-all text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <span className="text-sm font-medium hidden sm:inline">History</span>
        </button>
      </div>

      {/* Logo */}
      <div className="text-center mb-6">
        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          WikiPath
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-3 text-lg max-w-md mx-auto">
          Use Wikipedia links to navigate from<br />one random topic to another.
        </p>
      </div>

      {/* Mode cards */}
      <div className="grid gap-4 w-full max-w-md">
        {/* Classic mode */}
        <button
          onClick={onSelectClassic}
          className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 text-left hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg transition-all"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-2xl shrink-0">
              🎯
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-gray-100 text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Classic
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {reversed
                  ? <><strong>Adolf Hitler</strong> → find your way to random end in as few clicks as possible.</>
                  : <>Random start → find your way to <strong>Adolf Hitler</strong> in as few clicks as possible.</>
                }
              </p>
            </div>
          </div>
        </button>

        {/* Daily puzzle */}
        <button
          onClick={onSelectDaily}
          className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 text-left hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-lg transition-all"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-2xl shrink-0">
              📅
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-gray-100 text-lg group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                Daily Puzzle
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Same puzzle for everyone today. See how you compare to other players!
              </p>
            </div>
          </div>
        </button>

        {/* Free play */}
        <button
          onClick={onSelectFreePlay}
          className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 text-left hover:border-green-400 dark:hover:border-green-500 hover:shadow-lg transition-all"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-2xl shrink-0">
              🔀
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-gray-100 text-lg group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                Free Play
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Choose your own start and target articles. Challenge your friends!
              </p>
            </div>
          </div>
        </button>
      </div>

      {/* Direction toggle + Hard Mode + Timer - centered below cards */}
      <div className="grid grid-cols-3 gap-3 mt-6 w-full max-w-md">
        {/* Direction toggle */}
        <button
          onClick={onToggleReversed}
          title={reversed ? 'Direction: Adolf Hitler → Random/Target' : 'Direction: Random/Start → Adolf Hitler'}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border transition-all ${
            reversed
              ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700 shadow-sm'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-md'
          }`}
        >
          <span className="text-lg">☸️</span>
          <span className={`text-sm font-medium ${
            reversed
              ? 'text-purple-600 dark:text-purple-400'
              : 'text-gray-600 dark:text-gray-300'
          }`}>
            {reversed ? '← Hitler' : 'Hitler →'}
          </span>
        </button>

        {/* Hard Mode toggle */}
        <button
          onClick={onToggleHardMode}
          title="Hard Mode: country-related articles are blocked (Classic & Free Play only)"
          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border transition-all ${
            hardMode
              ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700 shadow-sm'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-red-400 dark:hover:border-red-500 hover:shadow-md'
          }`}
        >
          <span className="text-lg">💀</span>
          <span className={`text-sm font-medium ${
            hardMode
              ? 'text-red-600 dark:text-red-400'
              : 'text-gray-600 dark:text-gray-300'
          }`}>
            Hard
          </span>
        </button>

        {/* Timer toggle */}
        <button
          onClick={onToggleTimer}
          title="Timer: track elapsed time as a tiebreaker (always on for Daily)"
          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border transition-all ${
            timerEnabled
              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 shadow-sm'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md'
          }`}
        >
          <svg className={`w-4 h-4 ${timerEnabled ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className={`text-sm font-medium ${
            timerEnabled
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-gray-600 dark:text-gray-300'
          }`}>
            Timer
          </span>
        </button>
      </div>

      {/* Footer */}
      <p className="text-xs text-gray-400 dark:text-gray-600 mt-12">
        Powered by Wikipedia. Click links to navigate between articles.
      </p>
    </div>
  );
}
