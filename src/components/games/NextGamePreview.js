import React from 'react';
import { Users } from 'lucide-react';
import { formatDateWithDay } from '../../utils/dateUtils';
import AnimatedWeatherIcon from '../ui/AnimatedWeatherIcon';

const NextGamePreview = ({ games }) => {
  const now = new Date();
  const upcomingGames = games.filter(game => {
    const gameDate = new Date(game.date + ' ' + game.time);
    return gameDate > now;
  }).sort((a, b) => {
    const dateA = new Date(a.date + ' ' + a.time);
    const dateB = new Date(b.date + ' ' + b.time);
    return dateA - dateB;
  });

  if (upcomingGames.length === 0) return null;

  const nextGame = upcomingGames[0];

  return (
    <div className="mb-10">
      <div className="bg-white/[0.05] rounded-2xl p-5 text-center space-y-3">
        <p className="text-xs font-semibold text-white/30 uppercase tracking-wider">Next Game</p>
        <p className="text-lg font-semibold text-white">{nextGame.title}</p>
        <p className="text-sm text-white/50">{formatDateWithDay(nextGame.date)} · {nextGame.time}</p>
        <div className="flex items-center justify-center gap-5 text-xs text-white/40">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-400 font-medium">
              {nextGame.attendees?.length || 0}
              {nextGame.maybe?.length > 0 && <span className="text-amber-400"> +{nextGame.maybe.length}</span>}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <AnimatedWeatherIcon iconName={nextGame.weather.icon} className="w-3.5 h-3.5" />
            <span>{nextGame.weather.temp}° {nextGame.weather.condition}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NextGamePreview;
