import { useEffect } from 'react';
import { HomePage } from './pages/HomePage';
import { GamePage } from './pages/GamePage';
import { useGameStore } from './store/gameStore';

function App() {
  const status = useGameStore((state) => state.status);
  const startDailyGame = useGameStore((state) => state.startDailyGame);

  // Handle ?daily=YYYY-MM-DD URL param on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const dailyDate = params.get('daily');
    if (dailyDate && /^\d{4}-\d{2}-\d{2}$/.test(dailyDate)) {
      // Clear the URL param so it doesn't re-trigger
      window.history.replaceState({}, '', window.location.pathname);
      startDailyGame(dailyDate);
    }
  }, [startDailyGame]);

  if (status === 'setup') {
    return <HomePage />;
  }

  return <GamePage />;
}

export default App;
