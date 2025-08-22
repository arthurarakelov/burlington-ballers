import React from 'react';
import { Calendar, Plus } from 'lucide-react';
import FloatingOrbs from './FloatingOrbs';
import { useMouseTracking } from '../../hooks/useMouseTracking';

const EmptyState = ({ onCreateGame }) => {
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
            </div>
          </div>

          {/* Empty state content */}
          <div className="text-center space-y-8">
            <div className="relative">
              {/* Animated basketball icon */}
              <div className="w-20 h-20 mx-auto mb-6 relative">
                <div className="absolute inset-0 border-4 border-gray-800 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-orange-500 rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-black" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-light text-white">
                No games scheduled
              </h2>
              <p className="text-gray-400 font-light leading-relaxed">
                Ready to ball? Create your first game and get the crew together for some hoops.
              </p>
            </div>

            <div className="w-16 h-px bg-gradient-to-r from-transparent via-orange-400 to-transparent mx-auto"></div>

            <button
              onClick={onCreateGame}
              className="group relative px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium text-lg rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-orange-500/25 active:scale-95"
            >
              <div className="flex items-center gap-3">
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                <span>Create First Game</span>
              </div>
            </button>

            <div className="pt-8 space-y-3 text-sm text-gray-500">
              <p>💡 Pro tip: Games are automatically cleaned up after they're over</p>
              <p>🏀 Invite friends and track who's coming</p>
              <p>🌤️ Real-time weather updates for outdoor games</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmptyState;