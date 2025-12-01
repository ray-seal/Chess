import { useState, useCallback } from 'react';
import type { Difficulty } from './types';
import { HomeScreen } from './components/HomeScreen';
import { GameScreen } from './components/GameScreen';
import './App.css';

type Screen = 'home' | 'game';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('easy');

  const handleStartGame = useCallback((difficulty: Difficulty) => {
    setSelectedDifficulty(difficulty);
    setCurrentScreen('game');
  }, []);

  const handleBackToHome = useCallback(() => {
    setCurrentScreen('home');
  }, []);

  return (
    <div className="app">
      {currentScreen === 'home' && (
        <HomeScreen onStartGame={handleStartGame} />
      )}
      {currentScreen === 'game' && (
        <GameScreen
          difficulty={selectedDifficulty}
          onBackToHome={handleBackToHome}
        />
      )}
    </div>
  );
}

export default App;
