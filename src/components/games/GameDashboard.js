import React from 'react';
import GameCard from './GameCard';

const GameDashboard = ({ user, games, loading, onCreateGame, onSelectGame }) => {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-md mx-auto px-8 py-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-20">
          <div>
            <h1 className="text-2xl font-thin tracking-[-0.02em] mb-1">
              <span className="bg-gradient-to-r from-orange-200 to-orange-400 bg-clip-text text-transparent">
                BURLINGTON BALLERS
              </span>
            </h1>
            <p className="text-xs font-light text-gray-500 tracking-widest">Hello, {user?.name || 'Player'}</p>
          </div>
          <button 
            onClick={onCreateGame}
            className="text-gray-400 hover:text-orange-400 transition-all duration-500 text-sm font-light tracking-wide"
          >
            + NEW
          </button>
        </div>

        {/* Games */}
        <div className="space-y-12">
          {loading ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4 animate-bounce">🏀</div>
              <p className="text-gray-400 font-light">Loading games...</p>
            </div>
          ) : games.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 font-light mb-4">No games scheduled yet</p>
              <button 
                onClick={onCreateGame}
                className="text-orange-400 hover:text-orange-300 font-light tracking-wide"
              >
                Create the first game →
              </button>
            </div>
          ) : (
            games.map((game) => (
              <GameCard 
                key={game.id} 
                game={game} 
                onClick={onSelectGame}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-20">
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent mx-auto mb-4"></div>
          <p className="text-xs font-thin text-gray-600 tracking-[0.3em]">LEGENDS</p>
        </div>
      </div>
    </div>
  );
};

export default GameDashboard;