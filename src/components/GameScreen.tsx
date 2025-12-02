import { useState, useCallback, useEffect, useMemo } from 'react';
import { Chess } from 'chess.js';
import type { Square, Move } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import type { SquareHandlerArgs } from 'react-chessboard';
import type { Difficulty } from '../types';
import { getBestMove } from '../utils/chessAI';
import { saveLeaderboardEntry, generateEntryId } from '../utils/leaderboard';
import { useTimer } from '../hooks/useTimer';
import { MoveGuide } from './MoveGuide';
import './GameScreen.css';
import '../styles/move-guide.css';

const LOCALSTORAGE_KEY = 'chess_move_guide_enabled';

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
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Move[]>([]);
  const [moveGuideEnabled, setMoveGuideEnabled] = useState<boolean>(() => {
    const stored = localStorage.getItem(LOCALSTORAGE_KEY);
    return stored === null ? true : stored === 'true';
  });
  const [showMoveGuidePanel, setShowMoveGuidePanel] = useState(true);
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

  // Clear selection when it's not player's turn or game ends
  const clearSelection = useCallback(() => {
    setSelectedSquare(null);
    setLegalMoves([]);
  }, []);

  // Get legal moves from a specific square
  const getLegalMovesFromSquare = useCallback((square: Square): Move[] => {
    return game.moves({ square, verbose: true });
  }, [game]);

  // Handle square click (for selecting pieces, moving, or clearing selection)
  const handleSquareClick = useCallback(({ piece, square }: SquareHandlerArgs) => {
    if (gameStatus !== 'playing' || game.turn() !== 'w' || isThinking) {
      return;
    }

    // If a piece is selected, check if this is a valid destination
    if (selectedSquare && legalMoves.length > 0) {
      const isLegalMove = legalMoves.some(m => m.to === square);
      
      if (isLegalMove) {
        // Execute the move
        try {
          const gameCopy = new Chess(game.fen());
          const move = gameCopy.move({
            from: selectedSquare,
            to: square as Square,
            promotion: 'q',
          });

          if (move) {
            setGame(gameCopy);
            setMoveCount((prev) => prev + 1);
            clearSelection();

            if (!time) start();

            if (!gameCopy.isGameOver()) {
              makeComputerMove(gameCopy);
            } else {
              checkGameEnd(gameCopy);
            }
          }
        } catch {
          clearSelection();
        }
        return;
      }
    }

    // If clicking on own piece, select it
    if (piece) {
      const clickedPiece = game.get(square as Square);
      if (clickedPiece && clickedPiece.color === 'w') {
        const moves = getLegalMovesFromSquare(square as Square);
        if (moves.length > 0) {
          setSelectedSquare(square as Square);
          setLegalMoves(moves);
          setShowMoveGuidePanel(true);
        } else {
          clearSelection();
        }
        return;
      }
    }

    // Clear selection for any other click
    clearSelection();
  }, [game, gameStatus, isThinking, selectedSquare, legalMoves, time, start, makeComputerMove, checkGameEnd, clearSelection, getLegalMovesFromSquare]);

  // Compute square styles for highlighting
  const squareStyles = useMemo(() => {
    if (!moveGuideEnabled || !selectedSquare || legalMoves.length === 0) {
      return {};
    }

    const styles: Record<string, React.CSSProperties> = {};

    // Highlight selected square
    styles[selectedSquare] = {
      background: 'rgba(255, 235, 59, 0.4)',
    };

    // Highlight legal move destinations
    legalMoves.forEach(move => {
      const isCapture = move.captured;
      if (isCapture) {
        styles[move.to] = {
          background: 'radial-gradient(circle, transparent 50%, rgba(244, 67, 54, 0.4) 50%, rgba(244, 67, 54, 0.4) 70%, transparent 70%)',
        };
      } else {
        styles[move.to] = {
          background: 'radial-gradient(circle, rgba(102, 187, 106, 0.5) 25%, transparent 25%)',
        };
      }
    });

    return styles;
  }, [moveGuideEnabled, selectedSquare, legalMoves]);

  // Toggle move guide and persist to localStorage
  const toggleMoveGuide = useCallback(() => {
    setMoveGuideEnabled(prev => {
      const newValue = !prev;
      localStorage.setItem(LOCALSTORAGE_KEY, String(newValue));
      return newValue;
    });
  }, []);

  // Close move guide panel
  const closeMoveGuidePanel = useCallback(() => {
    setShowMoveGuidePanel(false);
  }, []);

  const onDrop = useCallback(({ sourceSquare, targetSquare }: { piece: { isSparePiece: boolean; position: string; pieceType: string }; sourceSquare: string; targetSquare: string | null }): boolean => {
    // We keep onDrop for accessibility but it won't be the primary interaction
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
      clearSelection();
      
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
  }, [game, gameStatus, isThinking, time, start, makeComputerMove, checkGameEnd, clearSelection]);

  const resetGame = useCallback(() => {
    setGame(new Chess());
    setMoveCount(0);
    setGameStatus('playing');
    setWinner(null);
    setIsThinking(false);
    clearSelection();
    reset();
  }, [reset, clearSelection]);

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
          <button
            className={`move-guide-toggle ${moveGuideEnabled ? 'active' : ''}`}
            onClick={toggleMoveGuide}
            aria-pressed={moveGuideEnabled}
            title={moveGuideEnabled ? 'Move Guide: On' : 'Move Guide: Off'}
          >
            <span className="move-guide-toggle-icon">💡</span>
            <span className="move-guide-toggle-label">
              Move Guide: {moveGuideEnabled ? 'On' : 'Off'}
            </span>
          </button>
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
            onSquareClick: handleSquareClick,
            squareStyles: squareStyles,
            allowDragging: gameStatus === 'playing' && game.turn() === 'w' && !isThinking,
            boardStyle: {
              borderRadius: '8px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            },
          }}
        />
      </div>

      {moveGuideEnabled && showMoveGuidePanel && (
        <MoveGuide
          selectedSquare={selectedSquare}
          legalMoves={legalMoves}
          onClose={closeMoveGuidePanel}
        />
      )}

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
