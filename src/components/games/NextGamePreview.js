import React from 'react';
import { Users } from 'lucide-react';

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
  const WeatherIcon = nextGame.weather.icon;
  
  return (
    <div className="mb-16">
      <div className="w-16 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent mx-auto mb-8"></div>
      
      <div className="text-center space-y-4">
        <h3 className="text-xs font-light tracking-[0.3em] text-gray-500 uppercase">Next Game</h3>
        <div className="space-y-2">
          <p className="text-lg font-light text-gray-300">{nextGame.title}</p>
          <p className="text-sm text-gray-400">{nextGame.date} • {nextGame.time}</p>
          <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>{nextGame.attendees.length} players</span>
            </div>
            <div className="flex items-center gap-1">
              <WeatherIcon className="w-3 h-3" />
              <span>{nextGame.weather.temp}° {nextGame.weather.condition}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NextGamePreview;