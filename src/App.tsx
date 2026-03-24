import { useEffect } from 'react';
import { HomePage } from './pages/HomePage';
import { GamePage } from './pages/GamePage';
import { useGameStore } from './store/gameStore';
import { decodePuzzle } from './utils/puzzleLink';

function App() {
  const status = useGameStore((state) => state.status);
  const startDailyGame = useGameStore((state) => state.startDailyGame);
  const startSharedPuzzle = useGameStore((state) => state.startSharedPuzzle);

  // Handle URL params on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const dailyDate = params.get('daily');
    if (dailyDate && /^\d{4}-\d{2}-\d{2}$/.test(dailyDate)) {
      window.history.replaceState({}, '', window.location.pathname);
      startDailyGame(dailyDate);
      return;
    }

    const puzzleParam = params.get('puzzle');
    if (puzzleParam) {
      const puzzle = decodePuzzle(puzzleParam);
      if (puzzle) {
        window.history.replaceState({}, '', window.location.pathname);
        startSharedPuzzle(puzzle.start, puzzle.target);
      }
    }
  }, [startDailyGame, startSharedPuzzle]);

  if (status === 'setup') {
    return <HomePage />;
  }

  return <GamePage />;
}

export default App;
