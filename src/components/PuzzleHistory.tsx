import { useState } from 'react';
import { getGameHistoryByMode, getCompletedDates, getPlayerResult } from '../services/firebase';
import { getPuzzleNumberForDate } from '../utils/seededRandom';
import { formatElapsedTime } from './ShareCard';
import type { GameMode } from '../types/game';

interface PuzzleHistoryProps {
  onClose: () => void;
}

type Tab = 'classic' | 'daily' | 'freeplay';

export function PuzzleHistory({ onClose }: PuzzleHistoryProps) {
  const [activeTab, setActiveTab] = useState<Tab>('classic');

  const tabs: { key: Tab; label: string }[] = [
    { key: 'classic', label: 'Classic' },
    { key: 'daily', label: 'Daily' },
    { key: 'freeplay', label: 'Free Play' },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full p-6 my-8 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Puzzle History</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 -mx-2 px-2">
          {activeTab === 'daily' ? <DailyHistoryTab /> : <GameHistoryTab mode={activeTab} />}
        </div>
      </div>
    </div>
  );
}

function DailyHistoryTab() {
  const completedDates = getCompletedDates();

  if (completedDates.length === 0) {
    return (
      <p className="text-center text-gray-500 dark:text-gray-400 py-8 text-sm">
        No completed daily puzzles yet.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {completedDates.map(date => {
        const result = getPlayerResult(date);
        const puzzleNum = getPuzzleNumberForDate(date);

        return (
          <div
            key={date}
            className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                  Daily #{puzzleNum}
                </span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">{date}</span>
            </div>
            <div className="text-right">
              {result && (
                <>
                  <span className="text-sm font-bold text-green-600 dark:text-green-400">
                    {result.steps} {result.steps === 1 ? 'step' : 'steps'}
                  </span>
                  {result.elapsedTime != null && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatElapsedTime(result.elapsedTime)}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function GameHistoryTab({ mode }: { mode: GameMode }) {
  const history = getGameHistoryByMode(mode);

  if (history.length === 0) {
    return (
      <p className="text-center text-gray-500 dark:text-gray-400 py-8 text-sm">
        No completed {mode === 'classic' ? 'classic' : 'free play'} games yet.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {history.map((entry, index) => {
        const dateObj = new Date(entry.date);
        const dateStr = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;

        return (
          <div
            key={`${entry.puzzleId}-${index}`}
            className="px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="text-sm text-gray-900 dark:text-gray-100 truncate">
                  <span className="font-medium">{entry.startDisplayTitle}</span>
                  <span className="text-gray-400 mx-1">→</span>
                  <span className="font-medium text-amber-600 dark:text-amber-400">{entry.targetDisplayTitle}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">{dateStr}</span>
                  {entry.hardMode && (
                    <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded font-medium">
                      Hard
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-sm font-bold text-green-600 dark:text-green-400">
                  {entry.steps} {entry.steps === 1 ? 'step' : 'steps'}
                </span>
                {entry.elapsedTime != null && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {formatElapsedTime(entry.elapsedTime)}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
