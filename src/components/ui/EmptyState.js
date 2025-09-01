import React from 'react';
import { Calendar, Plus } from 'lucide-react';

const EmptyState = ({ onCreateGame }) => {

  return (
    <div className="text-center space-y-8 py-20">
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

      <h2 className="text-2xl font-light text-white">
        No games scheduled
      </h2>

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
    </div>
  );
};

export default EmptyState;