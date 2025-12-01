import { useState, useCallback, useEffect } from 'react';
import { Chess } from 'chess.js';
import type { Square } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import type { Difficulty } from '../types';
import { getBestMove } from '../utils/chessAI';
import { saveLeaderboardEntry, generateEntryId } from '../utils/leaderboard';
import { useTimer } from '../hooks/useTimer';
import './GameScreen.css';

interface GameScreenProps {
  difficulty: Difficulty;
  onBackToHome: () => void;
}

type GameStatus = 'playing' | 'checkmate' | 'draw' | 'stalemate';

export function GameScreen({ difficulty, onBackToHome }: GameScreenProps) {
  const [game, setGame] = useState(new Chess());
  const [moveCount, setMoveCount] = useState(0);
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
  const [isThinking, setIsThinking] = useState(false);
  const [winner, setWinner] = useState<'player' | 'computer' | 'draw' | null>(null);
  const { time, start, pause, reset, formatTime } = useTimer();

  const checkGameEnd = useCallback((currentGame: Chess) => {
    if (currentGame.isCheckmate()) {
      setGameStatus('checkmate');
      const computerWon = currentGame.turn() === 'w';
      setWinner(computerWon ? 'computer' : 'player');
      pause();
      
      if (!computerWon) {
        saveLeaderboardEntry({
          id: generateEntryId(),
          difficulty,
          time,
          moves: moveCount,
          date: new Date().toISOString(),
          playerWon: true,
        });
      }
    } else if (currentGame.isStalemate()) {
      setGameStatus('stalemate');
      setWinner('draw');
      pause();
    } else if (currentGame.isDraw()) {
      setGameStatus('draw');
      setWinner('draw');
      pause();
    }
  }, [difficulty, moveCount, pause, time]);

  const makeComputerMove = useCallback((currentGame: Chess) => {
    if (currentGame.isGameOver() || currentGame.turn() !== 'b') return;

    setIsThinking(true);
    
    setTimeout(() => {
      const gameCopy = new Chess(currentGame.fen());
      const bestMove = getBestMove(gameCopy, difficulty);
      
      if (bestMove) {
        const newGame = new Chess(currentGame.fen());
        newGame.move(bestMove);
        setGame(newGame);
        checkGameEnd(newGame);
      }
      setIsThinking(false);
    }, 300);
  }, [difficulty, checkGameEnd]);

  const onDrop = useCallback(({ sourceSquare, targetSquare }: { piece: { isSparePiece: boolean; position: string; pieceType: string }; sourceSquare: string; targetSquare: string | null }): boolean => {
    if (gameStatus !== 'playing' || game.turn() !== 'w' || isThinking || !targetSquare) {
      return false;
    }

    try {
      const gameCopy = new Chess(game.fen());
      const move = gameCopy.move({
        from: sourceSquare as Square,
        to: targetSquare as Square,
        promotion: 'q',
      });

      if (move === null) return false;

      setGame(gameCopy);
      setMoveCount((prev) => prev + 1);
      
      if (!time) start();

      if (!gameCopy.isGameOver()) {
        makeComputerMove(gameCopy);
      } else {
        checkGameEnd(gameCopy);
      }

      return true;
    } catch {
      return false;
    }
  }, [game, gameStatus, isThinking, time, start, makeComputerMove, checkGameEnd]);

  const resetGame = useCallback(() => {
    setGame(new Chess());
    setMoveCount(0);
    setGameStatus('playing');
    setWinner(null);
    setIsThinking(false);
    reset();
  }, [reset]);

  useEffect(() => {
    // Cleanup timer on unmount
    return () => {
      pause();
    };
  }, [pause]);

  const getDifficultyLabel = (diff: Difficulty): string => {
    return diff.charAt(0).toUpperCase() + diff.slice(1);
  };

  const getStatusMessage = (): string => {
    if (isThinking) return '🤔 Computer is thinking...';
    if (gameStatus === 'checkmate') {
      return winner === 'player' ? '🎉 Checkmate! You won!' : '😔 Checkmate! Computer wins!';
    }
    if (gameStatus === 'stalemate') return '🤝 Stalemate! It\'s a draw!';
    if (gameStatus === 'draw') return '🤝 Draw!';
    if (game.inCheck()) return '⚠️ Check!';
    return game.turn() === 'w' ? '♟️ Your turn (White)' : '🤖 Computer\'s turn (Black)';
  };

  return (
    <div className="game-screen">
      <header className="game-header">
        <button className="back-btn" onClick={onBackToHome}>
          ← Back to Home
        </button>
        <div className="game-info">
          <span className={`difficulty-badge ${difficulty}`}>
            {getDifficultyLabel(difficulty)}
          </span>
        </div>
      </header>

      <div className="game-stats">
        <div className="stat">
          <span className="stat-label">⏱️ Time</span>
          <span className="stat-value">{formatTime(time)}</span>
        </div>
        <div className="stat">
          <span className="stat-label">♟️ Moves</span>
          <span className="stat-value">{moveCount}</span>
        </div>
      </div>

      <div className="status-message">
        {getStatusMessage()}
      </div>

      <div className="board-container">
        <Chessboard
          options={{
            position: game.fen(),
            onPieceDrop: onDrop,
            allowDragging: gameStatus === 'playing' && game.turn() === 'w' && !isThinking,
            boardStyle: {
              borderRadius: '8px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            },
          }}
        />
      </div>

      {gameStatus !== 'playing' && (
        <div className="game-over-actions">
          <button className="play-again-btn" onClick={resetGame}>
            🔄 Play Again
          </button>
          <button className="home-btn" onClick={onBackToHome}>
            🏠 Back to Home
          </button>
        </div>
      )}
    </div>
  );
}
