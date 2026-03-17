import React from 'react';
import { Calendar } from 'lucide-react';
import Button from './Button';

const EmptyState = ({ onCreateGame }) => {
  return (
    <div className="text-center py-20 px-4">
      <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-white/[0.05] flex items-center justify-center">
        <Calendar className="w-7 h-7 text-white/20" />
      </div>
      <h2 className="text-xl font-semibold text-white mb-2">No games scheduled</h2>
      <p className="text-sm text-white/40 mb-8">Create the first game to get started</p>
      <Button onClick={onCreateGame} size="lg" className="px-8">
        New Game
      </Button>
    </div>
  );
};

export default EmptyState;
