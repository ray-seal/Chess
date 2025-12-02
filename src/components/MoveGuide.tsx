import type { Move } from 'chess.js';
import '../styles/move-guide.css';

interface MoveGuideProps {
  selectedSquare: string | null;
  legalMoves: Move[];
  onClose: () => void;
}

export function MoveGuide({ selectedSquare, legalMoves, onClose }: MoveGuideProps) {
  if (!selectedSquare || legalMoves.length === 0) {
    return null;
  }

  const getPieceSymbol = (piece: string): string => {
    const symbols: Record<string, string> = {
      p: '♟',
      n: '♞',
      b: '♝',
      r: '♜',
      q: '♛',
      k: '♚',
    };
    return symbols[piece.toLowerCase()] || piece;
  };

  const formatMove = (move: Move): string => {
    return move.san;
  };

  const pieceType = legalMoves[0]?.piece;
  const pieceSymbol = pieceType ? getPieceSymbol(pieceType) : '';

  return (
    <div className="move-guide-panel" role="region" aria-label="Move Guide">
      <div className="move-guide-panel-header">
        <h3 className="move-guide-panel-title">
          {pieceSymbol} Legal Moves from {selectedSquare.toUpperCase()}
        </h3>
        <button
          className="move-guide-close-btn"
          onClick={onClose}
          aria-label="Close move guide"
        >
          ×
        </button>
      </div>
      <div className="move-guide-content">
        {legalMoves.length > 0 ? (
          legalMoves.map((move, index) => (
            <span key={index} className="move-guide-move">
              {formatMove(move)}
            </span>
          ))
        ) : (
          <span className="move-guide-empty">No legal moves available</span>
        )}
      </div>
    </div>
  );
}
