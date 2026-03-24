import { GameHeader } from '../components/GameHeader';
import { PathTracker } from '../components/PathTracker';
import { ArticleViewer } from '../components/ArticleViewer';
import { VictoryModal } from '../components/VictoryModal';
import { useGameStore } from '../store/gameStore';

export function GamePage() {
  const { error } = useGameStore();

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
      <GameHeader />

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 px-4 py-2 text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        <PathTracker />
        <ArticleViewer />
      </div>

      <VictoryModal />
    </div>
  );
}
