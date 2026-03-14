import React from 'react';
import SwipeableGameCard from './SwipeableGameCard';
import EmptyState from '../ui/EmptyState';
import Button from '../ui/Button';
import { GameCardSkeleton } from '../ui/SkeletonLoader';

const GameDashboard = ({ user, games, loading, onCreateGame, onSelectGame, onJoinGame, onDeclineGame, onOpenSettings, hideHeader }) => {
  if (loading) {
    return (
      <div className="space-y-4 pt-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-slide-in-up" style={{ animationDelay: `${i * 100}ms` }}>
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
    <div className={hideHeader ? "" : "min-h-screen bg-black text-white relative overflow-hidden"}>
      <div className="relative z-10">
        <div className={hideHeader ? "pt-4" : "max-w-lg mx-auto px-4 sm:px-6 py-12"}>
          {/* Games */}
          <div className="space-y-4">
            {games.map((game, index) => (
              <div
                key={game.id}
                className="animate-slide-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
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

            {/* New Game Button */}
            <div className="pt-6">
              <Button
                onClick={onCreateGame}
                className="w-full"
                size="lg"
              >
                New Game
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameDashboard;
