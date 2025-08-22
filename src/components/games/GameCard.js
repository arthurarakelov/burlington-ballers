import React from 'react';
import { MapPin, Clock, Users } from 'lucide-react';
import { formatDateWithDay } from '../../utils/dateUtils';
import AnimatedCounter from '../ui/AnimatedCounter';
import AnimatedWeatherIcon from '../ui/AnimatedWeatherIcon';

const GameCard = ({ game, onClick, statusIcon }) => {
  
  return (
    <div 
      onClick={() => onClick(game)}
      className="group cursor-pointer bg-gray-900/30 hover:bg-gray-800/60 backdrop-blur-sm border border-gray-800/50 hover:border-gray-600/80 rounded-xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-gray-900/20 hover:scale-[1.02]"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-medium mb-3 text-gray-100 group-hover:text-white transition-colors duration-300 truncate">
            {game.title}
          </h3>
          <div className="space-y-2.5">
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <span className="text-sm text-gray-300 font-medium truncate">{game.location}</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <span className="text-sm text-gray-400 font-light">{formatDateWithDay(game.date)} • {game.time}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-3 ml-4">
          <div className="flex items-center gap-2 bg-gray-800/50 rounded-lg px-3 py-1.5">
            <Users className="w-4 h-4 text-blue-400" />
            <AnimatedCounter value={game.attendees.length} className="text-sm font-semibold text-blue-300" />
          </div>
          <div className="flex items-center gap-2 bg-gray-800/30 rounded-lg px-3 py-1.5">
            <AnimatedWeatherIcon iconName={game.weather.icon} className="w-4 h-4" />
            <span className="text-sm font-medium text-gray-300">{game.weather.temp}°</span>
          </div>
        </div>
      </div>
      
      {/* Status icon passed from parent */}
      {statusIcon}
    </div>
  );
};

export default GameCard;