interface ModeSelectorProps {
  onSelectClassic: () => void;
  onSelectFreePlay: () => void;
  onSelectDaily: () => void;
}

export function ModeSelector({ onSelectClassic, onSelectFreePlay, onSelectDaily }: ModeSelectorProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Logo */}
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          WikiPath
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-3 text-lg max-w-md mx-auto">
          Navigate from one Wikipedia article to another using only the links within each page.
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
                Random start → find your way to <strong>Adolf Hitler</strong> in as few clicks as possible.
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

      {/* Footer */}
      <p className="text-xs text-gray-400 dark:text-gray-600 mt-12">
        Powered by Wikipedia. Click links to navigate between articles.
      </p>
    </div>
  );
}
