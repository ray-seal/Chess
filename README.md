<p align="center">
  <img src="./public/logo.svg" alt="Chess Game Logo" width="120" />
</p>

# Chess Game

A simple chess game where you play against the computer with 4 difficulty settings: Easy, Medium, Hard, and Expert.

## Features

- **4 Difficulty Levels**: Choose from Easy, Medium, Hard, or Expert AI opponents
- **Leaderboard**: Track your best wins with local storage persistence
- **Two Sorting Options**: View leaderboard by fastest times or least moves
- **PWA Support**: Install as a Progressive Web App for offline play
- **Responsive Design**: Works on desktop and mobile devices

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
