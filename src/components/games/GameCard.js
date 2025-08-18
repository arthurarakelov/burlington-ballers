import React from 'react';
import { MapPin, Clock, Users } from 'lucide-react';

const GameCard = ({ game, onClick }) => {
  const WeatherIcon = game.weather.icon;
  
  return (
    <div 
      onClick={() => onClick(game)}
      className="group cursor-pointer border-b border-gray-900 pb-8 last:border-0 hover:border-gray-800 transition-all duration-700"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-light mb-2 group-hover:text-orange-400 transition-all duration-500">
            {game.title}
          </h3>
          <div className="text-sm text-gray-400 font-light space-y-1">
            <div className="flex items-center gap-2">
              <MapPin className="w-3 h-3" />
              <span>{game.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3" />
              <span>{game.date} • {game.time}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs font-light text-gray-500">
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>{game.attendees.length}</span>
          </div>
          <div className="flex items-center gap-1">
            <WeatherIcon className="w-3 h-3" />
            <span>{game.weather.temp}°</span>
          </div>
        </div>
      </div>
      
      <div className="w-0 group-hover:w-8 h-px bg-gradient-to-r from-orange-400 to-transparent transition-all duration-700"></div>
    </div>
  );
};

export default GameCard;