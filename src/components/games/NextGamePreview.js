import React from 'react';
import { Users } from 'lucide-react';
import { compareGamesByStartTime, formatDateWithDay, isGameCompleted } from '../../utils/dateUtils';
import AnimatedWeatherIcon from '../ui/AnimatedWeatherIcon';

const NextGamePreview = ({ games }) => {
  const upcomingGames = games
    .filter(game => !isGameCompleted(game.date, game.time))
    .sort(compareGamesByStartTime);

  if (upcomingGames.length === 0) return null;

  const nextGame = upcomingGames[0];

  return (
    <div className="mb-8 space-y-4">
      <div>
        <p className="bb-kicker">Next Game</p>
        <h2 className="text-2xl font-black text-white leading-tight">{nextGame.title}</h2>
        <p className="mt-2 text-sm text-white/60">{formatDateWithDay(nextGame.date)} · {nextGame.time}</p>
      </div>
      <div className="flex flex-wrap gap-2 text-xs text-white/50">
        <div className="bb-pill">
          <Users className="w-3.5 h-3.5 text-emerald-300" />
          <span className="text-emerald-200 font-medium">
              {nextGame.attendees?.length || 0}
            {nextGame.maybe?.length > 0 && <span className="text-amber-200"> +{nextGame.maybe.length}</span>}
          </span>
        </div>
        <div className="bb-pill">
          <AnimatedWeatherIcon iconName={nextGame.weather?.icon || 'Sun'} className="w-3.5 h-3.5" />
          <span>{nextGame.weather?.temp || '--'}° {nextGame.weather?.condition || ''}</span>
        </div>
      </div>
    </div>
  );
};

export default NextGamePreview;
