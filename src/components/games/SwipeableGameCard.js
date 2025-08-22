import React, { useState } from 'react';
import { Check, X, ChevronLeft, ChevronRight } from 'lucide-react';
import GameCard from './GameCard';
import useSwipeGesture from '../../hooks/useSwipeGesture';

const SwipeableGameCard = ({ game, user, onClick, onJoin, onDecline }) => {
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [showHints, setShowHints] = useState(false);

  // Check if user has already responded
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
      // For swipe right (join), we need to provide a default arrival time
      const defaultTime = game.time; // Use game time as default
      onJoin(game.id, defaultTime);
      setSwipeDirection(null);
    }, 200);
  };

  const { elementRef, isSwiping } = useSwipeGesture(
    handleSwipeLeft,
    handleSwipeRight,
    80 // threshold
  );

  // Show hints on long press (for discovery)
  const handleTouchStart = () => {
    if (!user || hasResponded) return;
    const timer = setTimeout(() => setShowHints(true), 500);
    return () => clearTimeout(timer);
  };

  const handleTouchEnd = () => {
    setShowHints(false);
  };

  return (
    <div 
      ref={elementRef}
      className="relative"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Swipe Action Indicators */}
      {(showHints || isSwiping) && !hasResponded && user && (
        <>
          {/* Left swipe indicator (Decline) */}
          <div className={`absolute left-0 top-0 bottom-0 w-20 bg-red-500/20 border-2 border-red-500/50 rounded-l-xl flex items-center justify-center transition-all duration-200 z-10 ${
            swipeDirection === 'left' ? 'bg-red-500/40' : ''
          }`}>
            <X className="w-8 h-8 text-red-400" />
          </div>

          {/* Right swipe indicator (Join) */}
          <div className={`absolute right-0 top-0 bottom-0 w-20 bg-green-500/20 border-2 border-green-500/50 rounded-r-xl flex items-center justify-center transition-all duration-200 z-10 ${
            swipeDirection === 'right' ? 'bg-green-500/40' : ''
          }`}>
            <Check className="w-8 h-8 text-green-400" />
          </div>

          {/* Swipe hints */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
            <div className="bg-gray-900/90 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center gap-3">
              <div className="flex items-center gap-1 text-red-400">
                <ChevronLeft className="w-4 h-4" />
                <X className="w-4 h-4" />
                <span className="text-xs font-medium">Decline</span>
              </div>
              <div className="w-px h-4 bg-gray-600"></div>
              <div className="flex items-center gap-1 text-green-400">
                <span className="text-xs font-medium">Join</span>
                <Check className="w-4 h-4" />
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Game Card */}
      <div className={`transition-transform duration-200 ${
        swipeDirection === 'left' ? 'transform translate-x-[-20px] scale-95' : 
        swipeDirection === 'right' ? 'transform translate-x-[20px] scale-95' : ''
      }`}>
        <GameCard 
          game={game} 
          onClick={onClick}
          statusIcon={hasResponded && (
            <div className="absolute bottom-3 right-3 z-30 pointer-events-none">
              <div className={`p-1.5 rounded-full backdrop-blur-sm ${
                isAttending 
                  ? 'bg-green-500/90 text-white' 
                  : 'bg-red-500/90 text-white'
              }`}>
                {isAttending ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
              </div>
            </div>
          )}
        />
      </div>
    </div>
  );
};

export default SwipeableGameCard;