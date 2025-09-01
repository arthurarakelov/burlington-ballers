import React from 'react';
import { Settings } from 'lucide-react';
import SwipeableGameCard from './SwipeableGameCard';
import FloatingOrbs from '../ui/FloatingOrbs';
import EmptyState from '../ui/EmptyState';
import Button from '../ui/Button';
import { GameCardSkeleton } from '../ui/SkeletonLoader';
import { useMouseTracking } from '../../hooks/useMouseTracking';

const GameDashboard = ({ user, games, loading, onCreateGame, onSelectGame, onJoinGame, onDeclineGame, onOpenSettings, hideHeader }) => {
  const mousePosition = useMouseTracking();
  
  // Always show loading first, then empty state only when not loading
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

  // If no games and not loading, show empty state
  if (games.length === 0) {
    return <EmptyState onCreateGame={onCreateGame} />;
  }
  
  return (
    <div className={hideHeader ? "" : "min-h-screen bg-black text-white relative overflow-hidden"}>
      {!hideHeader && <FloatingOrbs mousePosition={mousePosition} />}
      
      <div className="relative z-10">
        <div className={hideHeader ? "pt-4" : "max-w-md mx-auto px-8 py-16"}>
          {/* Header */}
          {!hideHeader && (
            <div className="flex items-center justify-between mb-20">
              <div>
                <h1 className="text-xl font-light tracking-wide text-white mb-1">
                  Burlington Ballers
                </h1>
                <p className="text-xs text-gray-400">{user?.name}</p>
              </div>
              <div className="flex items-center gap-3">
                <Button onClick={onOpenSettings} variant="ghost" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
                <Button onClick={onCreateGame} size="sm">
                  New Game
                </Button>
              </div>
            </div>
          )}

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