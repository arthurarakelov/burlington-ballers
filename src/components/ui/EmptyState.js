import React from 'react';
import { Calendar } from 'lucide-react';
import Button from './Button';

const EmptyState = ({ onCreateGame }) => {
  return (
    <div className="bb-panel text-center py-16 px-4">
      <div className="w-16 h-16 mx-auto mb-5 rounded-lg bg-white/[0.08] flex items-center justify-center">
        <Calendar className="w-7 h-7 text-orange-200" />
      </div>
      <h2 className="text-2xl font-black text-white mb-2">No games scheduled</h2>
      <p className="text-sm text-white/50 mb-8">The court is clear.</p>
      <Button onClick={onCreateGame} size="lg" className="px-8">
        New Game
      </Button>
    </div>
  );
};

export default EmptyState;
