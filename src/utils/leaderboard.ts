import type { LeaderboardEntry, Difficulty, LeaderboardSortMode } from '../types';

const STORAGE_KEY = 'chess-leaderboard';

export function getLeaderboard(): LeaderboardEntry[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveLeaderboardEntry(entry: LeaderboardEntry): void {
  const entries = getLeaderboard();
  entries.push(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function getTopEntries(
  sortMode: LeaderboardSortMode,
  difficulty?: Difficulty,
  limit: number = 5
): LeaderboardEntry[] {
  let entries = getLeaderboard().filter(entry => entry.playerWon);
  
  if (difficulty) {
    entries = entries.filter(entry => entry.difficulty === difficulty);
  }
  
  if (sortMode === 'time') {
    entries.sort((a, b) => a.time - b.time);
  } else {
    entries.sort((a, b) => a.moves - b.moves);
  }
  
  return entries.slice(0, limit);
}

export function clearLeaderboard(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function generateEntryId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
