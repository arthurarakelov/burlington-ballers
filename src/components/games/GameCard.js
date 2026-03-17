import React from 'react';
import { MapPin, Clock, Users } from 'lucide-react';
import { formatDateWithDay } from '../../utils/dateUtils';
import AnimatedWeatherIcon from '../ui/AnimatedWeatherIcon';

const GameCard = ({ game, onClick, statusIcon }) => {
  const attendeeCount = game.attendees?.length || 0;
  const maybeCount = game.maybe?.length || 0;

  return (
    <div
      onClick={() => onClick(game)}
      className="relative group cursor-pointer bg-white/[0.05] hover:bg-white/[0.08] rounded-2xl p-4 sm:p-5 transition-all duration-200 active:scale-[0.98]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-[17px] font-semibold text-white mb-2 truncate">
            {game.title}
          </h3>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <MapPin className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
              <span className="text-sm text-white/60 truncate">{game.location}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Clock className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
              <span className="text-sm text-white/50">{formatDateWithDay(game.date)} · {game.time}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <div className="flex items-center gap-1.5 bg-white/[0.08] rounded-lg px-2.5 py-1.5">
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-sm font-semibold text-emerald-400">{attendeeCount}</span>
            {maybeCount > 0 && (
              <span className="text-sm text-amber-400/80">+{maybeCount}</span>
            )}
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1">
            <AnimatedWeatherIcon iconName={game.weather.icon} className="w-3.5 h-3.5" />
            <span className="text-xs text-white/40">{game.weather.temp}°</span>
          </div>
        </div>
      </div>

      {statusIcon}
    </div>
  );
};

export default React.memo(GameCard);
