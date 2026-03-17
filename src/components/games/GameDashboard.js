import React from 'react';
import SwipeableGameCard from './SwipeableGameCard';
import EmptyState from '../ui/EmptyState';
import Button from '../ui/Button';
import { GameCardSkeleton } from '../ui/SkeletonLoader';

const GameDashboard = ({ user, games, loading, onCreateGame, onSelectGame, onJoinGame, onDeclineGame, onOpenSettings, hideHeader }) => {
  if (loading) {
    return (
      <div className="space-y-3 pt-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-slide-in-up" style={{ animationDelay: `${i * 80}ms` }}>
            <GameCardSkeleton />
          </div>
        ))}
      </div>
    );
  }

  if (games.length === 0) {
    return <EmptyState onCreateGame={onCreateGame} />;
  }

  return (
    <div className={hideHeader ? "" : "min-h-screen bg-[#09090b] text-white"}>
      <div className={hideHeader ? "pt-4" : "max-w-lg mx-auto px-4 sm:px-6 py-12"}>
        <div className="space-y-3">
          {games.map((game, index) => (
            <div
              key={game.id}
              className="animate-slide-in-up"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <SwipeableGameCard
                game={game}
                user={user}
                onClick={onSelectGame}
                onJoin={onJoinGame}
                onDecline={onDeclineGame}
              />
            </div>
          ))}

          <div className="pt-4">
            <Button onClick={onCreateGame} className="w-full" size="lg">
              New Game
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameDashboard;
