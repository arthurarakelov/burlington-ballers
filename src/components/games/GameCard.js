import React from 'react';
import { ChevronRight, Clock, MapPin, Users } from 'lucide-react';
import { formatDateWithDay } from '../../utils/dateUtils';
import AnimatedWeatherIcon from '../ui/AnimatedWeatherIcon';

const GameCard = ({ game, onClick, statusIcon }) => {
  const attendeeCount = game.attendees?.length || 0;
  const maybeCount = game.maybe?.length || 0;
  const gameDate = new Date(`${game.date}T00:00:00`);
  const month = gameDate.toLocaleDateString([], { month: 'short' });
  const day = gameDate.toLocaleDateString([], { day: '2-digit' });

  return (
    <article
      onClick={() => onClick(game)}
      className="bb-game-card group active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-3 mb-5">
        <div className="bb-date-tile">
          <span className="bb-date-month">{month}</span>
          <span className="bb-date-day">{day}</span>
        </div>
        <div className="flex items-center gap-2">
          {statusIcon}
          <ChevronRight className="w-5 h-5 text-white/30 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>

      <div className="flex min-h-[126px] flex-col justify-between gap-5">
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-black text-white leading-tight mb-3">
            {game.title}
          </h3>
          <div className="grid gap-2">
            <div className="bb-meta-line">
              <MapPin className="w-4 h-4" />
              <span className="truncate">{game.location}</span>
            </div>
            <div className="bb-meta-line">
              <Clock className="w-4 h-4" />
              <span>{formatDateWithDay(game.date)} · {game.time}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="bb-pill">
            <Users className="w-3.5 h-3.5 text-emerald-300" />
            <span className="text-emerald-200">{attendeeCount}</span>
            {maybeCount > 0 && (
              <span className="text-amber-200">+{maybeCount}</span>
            )}
          </div>
          <div className="bb-pill">
            <AnimatedWeatherIcon iconName={game.weather?.icon || 'Sun'} className="w-3.5 h-3.5" />
            <span>{game.weather?.temp || '--'}°</span>
          </div>
        </div>
      </div>
    </article>
  );
};

export default React.memo(GameCard);
