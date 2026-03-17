import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import GameCard from './GameCard';
import useSwipeGesture from '../../hooks/useSwipeGesture';

const SwipeableGameCard = ({ game, user, onClick, onJoin, onDecline }) => {
  const [swipeDirection, setSwipeDirection] = useState(null);

  const isAttending = game.attendees?.some(a => a.userUid === user?.uid);
  const hasDeclined = game.declined?.some(d => d.userUid === user?.uid);
  const hasResponded = isAttending || hasDeclined;

  const handleSwipeLeft = () => {
    if (!user || hasResponded) return;
    setSwipeDirection('left');
    setTimeout(() => {
      onDecline(game.id);
      setSwipeDirection(null);
    }, 200);
  };

  const handleSwipeRight = () => {
    if (!user || hasResponded) return;
    setSwipeDirection('right');
    setTimeout(() => {
      onJoin(game.id, game.time);
      setSwipeDirection(null);
    }, 200);
  };

  const { elementRef, isSwiping } = useSwipeGesture(
    handleSwipeLeft,
    handleSwipeRight,
    80
  );

  return (
    <div ref={elementRef} className="relative">
      {/* Swipe indicators */}
      {isSwiping && !hasResponded && user && (
        <>
          <div className={`absolute left-0 top-0 bottom-0 w-16 bg-rose-500/20 rounded-l-2xl flex items-center justify-center transition-all duration-200 z-10 ${
            swipeDirection === 'left' ? 'bg-rose-500/30' : ''
          }`}>
            <X className="w-6 h-6 text-rose-400" />
          </div>
          <div className={`absolute right-0 top-0 bottom-0 w-16 bg-emerald-500/20 rounded-r-2xl flex items-center justify-center transition-all duration-200 z-10 ${
            swipeDirection === 'right' ? 'bg-emerald-500/30' : ''
          }`}>
            <Check className="w-6 h-6 text-emerald-400" />
          </div>
        </>
      )}

      <div className={`transition-transform duration-200 ${
        swipeDirection === 'left' ? 'translate-x-[-20px] scale-[0.97]' :
        swipeDirection === 'right' ? 'translate-x-[20px] scale-[0.97]' : ''
      }`}>
        <GameCard
          game={game}
          onClick={onClick}
          statusIcon={hasResponded && (
            <div className="absolute bottom-3 right-3 z-30 pointer-events-none">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                isAttending
                  ? 'bg-emerald-500/20'
                  : 'bg-rose-500/20'
              }`}>
                {isAttending
                  ? <Check className="w-3 h-3 text-emerald-400" />
                  : <X className="w-3 h-3 text-rose-400" />
                }
              </div>
            </div>
          )}
        />
      </div>
    </div>
  );
};

export default SwipeableGameCard;
