import type { LeaderboardEntry } from '../services/firebase';

interface DailyLeaderboardProps {
  leaderboard: LeaderboardEntry[];
  playerSteps: number;
}

export function DailyLeaderboard({ leaderboard, playerSteps }: DailyLeaderboardProps) {
  if (leaderboard.length === 0) return null;

  // Show top 10 only
  const top10 = leaderboard.slice(0, 10);

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mt-4">
      <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
        Top 10 Today
      </h3>

      <div className="space-y-1">
        {top10.map((entry, index) => {
          const isPlayer = entry.steps === playerSteps;
          const rankColors = [
            'text-amber-500', // 1st - gold
            'text-gray-400',  // 2nd - silver
            'text-amber-700', // 3rd - bronze
          ];
          const rankColor = index < 3 ? rankColors[index] : 'text-gray-500 dark:text-gray-400';

          return (
            <div
              key={`${entry.name}-${entry.timestamp}`}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
                isPlayer
                  ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                  : ''
              }`}
            >
              <span className={`font-bold text-sm w-6 text-right ${rankColor}`}>
                {index + 1}.
              </span>
              <span className={`flex-1 text-sm truncate ${
                isPlayer
                  ? 'font-semibold text-blue-700 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-300'
              }`}>
                {entry.name}
              </span>
              <span className={`text-sm font-mono ${
                isPlayer
                  ? 'font-bold text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                {entry.steps} {entry.steps === 1 ? 'step' : 'steps'}
              </span>
            </div>
          );
        })}
      </div>

      {leaderboard.length > 10 && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-center">
          +{leaderboard.length - 10} more {leaderboard.length - 10 === 1 ? 'player' : 'players'}
        </p>
      )}
    </div>
  );
}
