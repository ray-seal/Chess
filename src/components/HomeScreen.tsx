import type { Difficulty } from '../types';
import { Leaderboard } from './Leaderboard';
import '../styles/logo.css';
import './HomeScreen.css';

interface HomeScreenProps {
  onStartGame: (difficulty: Difficulty) => void;
}

const difficulties: { level: Difficulty; label: string; description: string; emoji: string }[] = [
  { level: 'easy', label: 'Easy', description: 'Perfect for beginners', emoji: '🌱' },
  { level: 'medium', label: 'Medium', description: 'A fair challenge', emoji: '⚔️' },
  { level: 'hard', label: 'Hard', description: 'For experienced players', emoji: '🔥' },
  { level: 'expert', label: 'Expert', description: 'Master level AI', emoji: '👑' },
];

export function HomeScreen({ onStartGame }: HomeScreenProps) {
  return (
    <div className="home-screen">
      <header className="home-header">
        <img src="/logo.svg" alt="Chess Game Logo" className="app-logo" />
        <h1>♟️ Chess Game</h1>
        <p>Challenge the AI and test your skills!</p>
      </header>

      <section className="difficulty-section">
        <h2>Select Difficulty</h2>
        <div className="difficulty-buttons">
          {difficulties.map(({ level, label, description, emoji }) => (
            <button
              key={level}
              className={`difficulty-btn ${level}`}
              onClick={() => onStartGame(level)}
            >
              <span className="difficulty-emoji">{emoji}</span>
              <span className="difficulty-label">{label}</span>
              <span className="difficulty-desc">{description}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="leaderboard-section">
        <Leaderboard />
      </section>
    </div>
  );
}
