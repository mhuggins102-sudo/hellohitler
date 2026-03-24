import { useGameStore } from '../store/gameStore';

export function PathTracker() {
  const { path, status } = useGameStore();

  if (status !== 'playing' && status !== 'won') return null;

  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700 w-full md:w-64 shrink-0 overflow-y-auto">
      <div className="p-3">
        <h2 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
          Your Path
        </h2>
        <ol className="space-y-1">
          {path.map((entry, index) => (
            <li key={`${entry.title}-${index}`} className="flex items-start gap-2">
              <span className="text-xs font-mono text-gray-400 dark:text-gray-500 mt-0.5 w-5 text-right shrink-0">
                {index === 0 ? '>' : index}
              </span>
              <span
                className={`text-sm leading-snug ${
                  index === path.length - 1
                    ? 'font-medium text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                {entry.displayTitle}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
