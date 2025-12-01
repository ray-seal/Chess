import { useState, useEffect } from 'react';
import type { Difficulty, LeaderboardSortMode, LeaderboardEntry } from '../types';
import { getTopEntries } from '../utils/leaderboard';
import './Leaderboard.css';

interface LeaderboardProps {
  selectedDifficulty?: Difficulty;
}

export function Leaderboard({ selectedDifficulty }: LeaderboardProps) {
  const [sortMode, setSortMode] = useState<LeaderboardSortMode>('time');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    setEntries(getTopEntries(sortMode, selectedDifficulty, 5));
  }, [sortMode, selectedDifficulty]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getDifficultyLabel = (difficulty: Difficulty): string => {
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
  };

  return (
    <div className="leaderboard">
      <h2>🏆 Leaderboard</h2>
      
      <div className="leaderboard-toggle">
        <button
          className={sortMode === 'time' ? 'active' : ''}
          onClick={() => setSortMode('time')}
        >
          ⏱️ Fastest Times
        </button>
        <button
          className={sortMode === 'moves' ? 'active' : ''}
          onClick={() => setSortMode('moves')}
        >
          ♟️ Least Moves
        </button>
      </div>

      {entries.length === 0 ? (
        <p className="no-entries">No wins recorded yet. Start playing!</p>
      ) : (
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Difficulty</th>
              <th>Time</th>
              <th>Moves</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => (
              <tr key={entry.id}>
                <td className="rank">{index + 1}</td>
                <td className={`difficulty ${entry.difficulty}`}>
                  {getDifficultyLabel(entry.difficulty)}
                </td>
                <td>{formatTime(entry.time)}</td>
                <td>{entry.moves}</td>
                <td>{formatDate(entry.date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
