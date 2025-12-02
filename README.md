<p align="center">
  <img src="./public/logo.svg" alt="Chess Game Logo" width="120" />
</p>

# Chess Game

A simple chess game where you play against the computer with 4 difficulty settings: Easy, Medium, Hard, and Expert.

## Features

- **4 Difficulty Levels**: Choose from Easy, Medium, Hard, or Expert AI opponents
- **Tap-to-Move Interaction**: Click/tap to select a piece, then tap a highlighted square to move
- **Move Guide**: Optional panel showing legal moves for selected pieces with visual highlights
- **Leaderboard**: Track your best wins with local storage persistence
- **Two Sorting Options**: View leaderboard by fastest times or least moves
- **PWA Support**: Install as a Progressive Web App for offline play
- **Responsive Design**: Works on desktop and mobile devices

## How to Play

1. **Select a Piece**: Tap or click on one of your pieces (white) to select it
2. **View Legal Moves**: When Move Guide is enabled, legal destination squares will be highlighted:
   - Green dots indicate empty squares you can move to
   - Red rings indicate squares where you can capture an opponent's piece
3. **Make a Move**: Tap or click on a highlighted square to move your piece there
4. **Clear Selection**: Tap an empty non-highlighted square or select a different piece

### Move Guide Toggle

Use the "Move Guide" toggle in the game header to enable or disable:
- Square highlighting for legal moves
- The Move Guide panel showing move notation

Your preference is saved and will persist across sessions.

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Deployment on Vercel

1. Push your code to a GitHub repository
2. Connect your repository to Vercel
3. Vercel will automatically detect the Vite configuration and deploy

## Tech Stack

- React 19
- TypeScript
- Vite
- chess.js - Chess game logic
- react-chessboard - Chess board UI component
- vite-plugin-pwa - PWA support
