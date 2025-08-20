import React from 'react';
import GameCard from './GameCard';
import FloatingOrbs from '../ui/FloatingOrbs';
import { useMouseTracking } from '../../hooks/useMouseTracking';

const GameDashboard = ({ user, games, loading, onCreateGame, onSelectGame }) => {
  const mousePosition = useMouseTracking();
  
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <FloatingOrbs mousePosition={mousePosition} />
      
      <div className="relative z-10">
        <div className="max-w-md mx-auto px-8 py-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-20">
          <div>
            <h1 className="text-xl font-light tracking-wide text-white mb-1">
              Burlington Ballers
            </h1>
            <p className="text-xs text-gray-400">{user?.name}</p>
          </div>
          <button 
            onClick={onCreateGame}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg transition-colors duration-200"
          >
            New Game
          </button>
        </div>

        {/* Games */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="relative w-16 h-16 mx-auto mb-6">
                <div className="absolute inset-0 border-4 border-gray-800 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-black rounded-full"></div>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-400">Loading games...</p>
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

      </div>
    </div>
    </div>
  );
};

export default GameDashboard;