interface DailyDistributionProps {
  distribution: Record<number, number>;
  playerSteps: number;
  totalPlayers: number;
}

export function DailyDistribution({ distribution, playerSteps, totalPlayers }: DailyDistributionProps) {
  if (totalPlayers === 0) return null;

  // Find the max step count and max frequency for scaling
  const entries = Object.entries(distribution)
    .map(([steps, count]) => ({ steps: Number(steps), count }))
    .sort((a, b) => a.steps - b.steps);

  const maxCount = Math.max(...entries.map(e => e.count));

  // Calculate percentile
  const betterThan = entries
    .filter(e => e.steps > playerSteps)
    .reduce((sum, e) => sum + e.count, 0);
  const percentile = Math.round((betterThan / totalPlayers) * 100);

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mt-4">
      <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
        Today's Results ({totalPlayers} {totalPlayers === 1 ? 'player' : 'players'})
      </h3>

      {/* Percentile */}
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
        You did better than <span className="font-bold text-blue-600 dark:text-blue-400">{percentile}%</span> of players!
      </p>

      {/* Histogram */}
      <div className="space-y-1.5">
        {entries.map(({ steps, count }) => (
          <div key={steps} className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400 w-8 text-right font-mono">
              {steps}
            </span>
            <div className="flex-1 h-5 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
              <div
                className={`h-full rounded transition-all ${
                  steps === playerSteps
                    ? 'bg-blue-500'
                    : 'bg-gray-400 dark:bg-gray-500'
                }`}
                style={{ width: `${(count / maxCount) * 100}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 w-8 font-mono">
              {count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
