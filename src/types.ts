export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface LeaderboardEntry {
  id: string;
  difficulty: Difficulty;
  time: number; // in seconds
  moves: number;
  date: string;
  playerWon: boolean;
}

export type LeaderboardSortMode = 'time' | 'moves';
