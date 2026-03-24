import { useState, useEffect } from 'react';
import { getGameHistoryByMode, getCompletedDates, getPlayerResult, fetchPuzzleDistribution, fetchDailyDistribution } from '../services/firebase';
import type { GameHistoryEntry, LeaderboardEntry } from '../services/firebase';
import { getPuzzleNumberForDate } from '../utils/seededRandom';
import { formatElapsedTime, generateShareText } from './ShareCard';
import { captureAndSave, shareText } from '../services/shareService';
import { DailyDistribution } from './DailyDistribution';
import { DailyLeaderboard } from './DailyLeaderboard';
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
        <div className="flex items-center justify-between mb-4 shrink-0">
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
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4 shrink-0">
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

// --- Daily History Tab ---

function DailyHistoryTab() {
  const completedDates = getCompletedDates();
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

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
        const isExpanded = expandedDate === date;

        return (
          <div key={date}>
            <button
              onClick={() => setExpandedDate(isExpanded ? null : date)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-left ${
                isExpanded
                  ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800'
                  : 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div>
                <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                  Daily #{puzzleNum}
                </span>
                <div className="text-xs text-gray-500 dark:text-gray-400">{date}</div>
              </div>
              <div className="flex items-center gap-2">
                {result && (
                  <div className="text-right">
                    <span className="text-sm font-bold text-green-600 dark:text-green-400">
                      {result.steps} {result.steps === 1 ? 'step' : 'steps'}
                    </span>
                    {result.elapsedTime != null && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {formatElapsedTime(result.elapsedTime)}
                      </div>
                    )}
                  </div>
                )}
                <svg className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {isExpanded && result && (
              <DailyDetailView date={date} result={result} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function DailyDetailView({ date, result }: { date: string; result: { name: string; steps: number; path: string[]; elapsedTime?: number | null } }) {
  const [stats, setStats] = useState<{ distribution: Record<number, number>; totalPlayers: number; leaderboard: LeaderboardEntry[] } | null>(null);
  const [saving, setSaving] = useState(false);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    fetchDailyDistribution(date).then(setStats);
  }, [date]);

  const handleSaveImage = async () => {
    setSaving(true);
    try {
      await captureAndSave(result.steps, 'daily', result.path, '', date);
    } finally {
      setSaving(false);
    }
  };

  const handleSharePuzzle = async () => {
    const text = generateShareText(result.steps, 'daily', date);
    const success = await shareText(text);
    if (success) {
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  return (
    <div className="mt-2 ml-2 mr-2 mb-1 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
      {/* Path */}
      {result.path.length > 0 && (
        <div className="mb-3">
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Path</h4>
          <div className="flex flex-wrap items-center gap-1">
            {result.path.map((title, i) => (
              <span key={`${title}-${i}`} className="flex items-center gap-1">
                {i > 0 && <span className="text-gray-400 text-sm">→</span>}
                <span className={`text-sm px-2 py-0.5 rounded-full ${
                  i === 0
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : i === result.path.length - 1
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 font-medium'
                      : 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                }`}>
                  {title}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Leaderboard */}
      {stats && stats.totalPlayers > 0 && (
        <>
          <DailyDistribution distribution={stats.distribution} playerSteps={result.steps} totalPlayers={stats.totalPlayers} />
          <DailyLeaderboard leaderboard={stats.leaderboard} playerSteps={result.steps} />
        </>
      )}

      {/* Share buttons */}
      <div className="flex gap-2 mt-3">
        <button
          onClick={handleSaveImage}
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {saving ? 'Saving...' : 'Save Image'}
        </button>
        <button
          onClick={handleSharePuzzle}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          {shared ? 'Shared!' : 'Share Puzzle'}
        </button>
      </div>
    </div>
  );
}

// --- Classic / Free Play History Tab ---

function GameHistoryTab({ mode }: { mode: GameMode }) {
  const history = getGameHistoryByMode(mode);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

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
        const isExpanded = expandedIndex === index;

        return (
          <div key={`${entry.puzzleId}-${index}`}>
            <button
              onClick={() => setExpandedIndex(isExpanded ? null : index)}
              className={`w-full px-4 py-3 rounded-xl border transition-all text-left ${
                isExpanded
                  ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800'
                  : 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
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
                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <span className="text-sm font-bold text-green-600 dark:text-green-400">
                      {entry.steps} {entry.steps === 1 ? 'step' : 'steps'}
                    </span>
                    {entry.elapsedTime != null && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {formatElapsedTime(entry.elapsedTime)}
                      </div>
                    )}
                  </div>
                  <svg className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </button>

            {isExpanded && (
              <GameDetailView entry={entry} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function GameDetailView({ entry }: { entry: GameHistoryEntry }) {
  const [stats, setStats] = useState<{ distribution: Record<number, number>; totalPlayers: number; leaderboard: LeaderboardEntry[] } | null>(null);
  const [saving, setSaving] = useState(false);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    if (entry.puzzleId) {
      fetchPuzzleDistribution(entry.puzzleId).then(setStats);
    }
  }, [entry.puzzleId]);

  const handleSaveImage = async () => {
    setSaving(true);
    try {
      await captureAndSave(entry.steps, entry.mode, entry.path, entry.targetDisplayTitle);
    } finally {
      setSaving(false);
    }
  };

  const handleSharePuzzle = async () => {
    const text = generateShareText(
      entry.steps, entry.mode, null,
      entry.startTitle, entry.targetTitle,
      entry.timerEnabled ? entry.elapsedTime : null,
      { hardMode: entry.hardMode, timer: entry.timerEnabled },
    );
    const success = await shareText(text);
    if (success) {
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  return (
    <div className="mt-2 ml-2 mr-2 mb-1 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
      {/* Path */}
      {entry.path.length > 0 && (
        <div className="mb-3">
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Path</h4>
          <div className="flex flex-wrap items-center gap-1">
            {entry.path.map((title, i) => (
              <span key={`${title}-${i}`} className="flex items-center gap-1">
                {i > 0 && <span className="text-gray-400 text-sm">→</span>}
                <span className={`text-sm px-2 py-0.5 rounded-full ${
                  i === 0
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : i === entry.path.length - 1
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 font-medium'
                      : 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                }`}>
                  {title}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Leaderboard */}
      {stats && stats.totalPlayers > 0 && (
        <>
          <DailyDistribution distribution={stats.distribution} playerSteps={entry.steps} totalPlayers={stats.totalPlayers} />
          <DailyLeaderboard leaderboard={stats.leaderboard} playerSteps={entry.steps} />
        </>
      )}

      {/* Share buttons */}
      <div className="flex gap-2 mt-3">
        <button
          onClick={handleSaveImage}
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          {saving ? 'Saving...' : 'Save Image'}
        </button>
        <button
          onClick={handleSharePuzzle}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          {shared ? 'Shared!' : 'Share Puzzle'}
        </button>
      </div>
    </div>
  );
}
