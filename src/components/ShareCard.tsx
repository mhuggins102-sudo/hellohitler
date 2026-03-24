import { forwardRef } from 'react';
import type { PathEntry } from '../types/game';
import type { GameMode } from '../types/game';
import { getDailyPuzzleNumber } from '../utils/seededRandom';

interface ShareCardProps {
  path: PathEntry[];
  steps: number;
  mode: GameMode;
  targetTitle: string;
}

export const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  ({ path, steps, mode, targetTitle }, ref) => {
    const puzzleNumber = getDailyPuzzleNumber();

    return (
      <div
        ref={ref}
        className="bg-gradient-to-br from-blue-600 to-purple-700 text-white p-6 rounded-2xl w-[400px] max-w-full shadow-xl"
      >
        {/* Header */}
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold tracking-tight">WikiPath</h2>
          <p className="text-blue-200 text-sm mt-1">
            {mode === 'daily' ? `Daily #${puzzleNumber}` : mode === 'classic' ? 'Classic Mode' : 'Free Play'}
          </p>
        </div>

        {/* Steps count */}
        <div className="text-center mb-5">
          <div className="text-5xl font-bold">{steps}</div>
          <div className="text-blue-200 text-sm mt-1">
            {steps === 1 ? 'step' : 'steps'}
          </div>
        </div>

        {/* Path visualization */}
        <div className="bg-white/10 backdrop-blur rounded-xl p-4">
          <div className="space-y-1">
            {path.map((entry, index) => (
              <div key={`${entry.title}-${index}`} className="flex items-center gap-2">
                {index > 0 && (
                  <div className="text-blue-300 text-xs ml-2 -mt-1 mb-0.5">↓</div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-blue-300 text-xs font-mono w-4 text-right">
                    {index === 0 ? '▸' : index}
                  </span>
                  <span
                    className={`text-sm ${
                      index === path.length - 1
                        ? 'font-bold text-yellow-300'
                        : index === 0
                          ? 'font-medium text-green-300'
                          : 'text-white/90'
                    }`}
                  >
                    {entry.displayTitle.replace(/<[^>]*>/g, '')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Target */}
        <div className="text-center mt-4 text-sm text-blue-200">
          Target: <span className="font-medium text-yellow-300">{targetTitle}</span>
        </div>
      </div>
    );
  }
);

ShareCard.displayName = 'ShareCard';

/**
 * Generate Wordle-style spoiler-free share text
 */
export function generateShareText(steps: number, mode: GameMode): string {
  const puzzleNumber = getDailyPuzzleNumber();
  const squares = '⬜'.repeat(Math.max(0, steps - 1)) + '🎯';

  const header = mode === 'daily'
    ? `WikiPath Daily #${puzzleNumber}`
    : mode === 'classic'
      ? 'WikiPath Classic'
      : 'WikiPath Free Play';

  return `${header}\n🟩 ${steps} ${steps === 1 ? 'step' : 'steps'}\n${squares}`;
}
