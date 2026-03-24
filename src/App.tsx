import { HomePage } from './pages/HomePage';
import { GamePage } from './pages/GamePage';
import { useGameStore } from './store/gameStore';

function App() {
  const status = useGameStore((state) => state.status);

  if (status === 'setup') {
    return <HomePage />;
  }

  return <GamePage />;
}

export default App;
