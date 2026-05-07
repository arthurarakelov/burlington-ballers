import React from 'react';
import { CalendarPlus, Clock, MapPin, Plus, Users } from 'lucide-react';
import SwipeableGameCard from './SwipeableGameCard';
import EmptyState from '../ui/EmptyState';
import Button from '../ui/Button';
import { GameCardSkeleton } from '../ui/SkeletonLoader';
import AnimatedWeatherIcon from '../ui/AnimatedWeatherIcon';
import { compareGamesByStartTime, formatDateWithDay } from '../../utils/dateUtils';

const GameDashboard = ({ user, games, loading, onCreateGame, onSelectGame, onJoinGame, onDeclineGame, onOpenSettings, hideHeader }) => {
  if (loading) {
    return (
      <div className="bb-game-grid">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-slide-in-up" style={{ animationDelay: `${i * 80}ms` }}>
            <GameCardSkeleton />
          </div>
        ))}
      </div>
    );
  }

  if (games.length === 0) {
    return <EmptyState onCreateGame={onCreateGame} />;
  }

  const sortedGames = [...games].sort(compareGamesByStartTime);
  const nextGame = sortedGames[0];
  const attendingTotal = games.reduce((sum, game) => sum + (game.attendees?.length || 0), 0);
  const maybeTotal = games.reduce((sum, game) => sum + (game.maybe?.length || 0), 0);
  const userCommitted = games.filter(game => game.attendees?.some(a => a.userUid === user?.uid)).length;

  return (
    <div className={hideHeader ? "" : "bb-app-root min-h-screen text-white"}>
      <div className={hideHeader ? "" : "max-w-lg mx-auto px-4 sm:px-6 py-12"}>
        <section className="bb-dashboard-hero">
          <div className="bb-next-game">
            <div className="bb-next-game-content">
              <div>
                <div className="flex items-center justify-between gap-3 mb-5">
                  <span className="bb-pill bb-pill-accent">Next run</span>
                  <div className="bb-pill">
                    <Users className="w-3.5 h-3.5 text-emerald-300" />
                    <span>{nextGame.attendees?.length || 0}</span>
                    {nextGame.maybe?.length > 0 && <span className="text-amber-200">+{nextGame.maybe.length}</span>}
                  </div>
                </div>

                <h2 className="text-3xl sm:text-4xl font-black leading-tight text-white mb-3">
                  {nextGame.title}
                </h2>
                <div className="grid gap-2 text-sm sm:text-[15px]">
                  <div className="bb-meta-line">
                    <Clock className="w-4 h-4" />
                    <span>{formatDateWithDay(nextGame.date)} at {nextGame.time}</span>
                  </div>
                  <div className="bb-meta-line">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{nextGame.location}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div className="flex items-center gap-2 text-white/70">
                  <AnimatedWeatherIcon iconName={nextGame.weather?.icon || 'Sun'} className="w-5 h-5" />
                  <span className="text-sm">
                    {nextGame.weather?.temp || '--'}° {nextGame.weather?.condition || ''}
                  </span>
                </div>
                <Button onClick={onCreateGame} size="lg">
                  <Plus className="w-4 h-4" />
                  New Game
                </Button>
              </div>
            </div>
          </div>

          <div className="bb-stat-grid">
            <div className="bb-stat">
              <div className="bb-stat-value">{games.length}</div>
              <div className="bb-stat-label">Scheduled</div>
            </div>
            <div className="bb-stat">
              <div className="bb-stat-value">{attendingTotal}</div>
              <div className="bb-stat-label">Total RSVPs</div>
            </div>
            <div className="bb-stat">
              <div className="bb-stat-value">{userCommitted}</div>
              <div className="bb-stat-label">You are in</div>
            </div>
            {maybeTotal > 0 && (
              <div className="bb-stat">
                <div className="bb-stat-value">{maybeTotal}</div>
                <div className="bb-stat-label">Maybe</div>
              </div>
            )}
          </div>
        </section>

        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <p className="bb-kicker">Upcoming games</p>
            <h2 className="text-xl font-black text-white">Schedule</h2>
          </div>
          <Button onClick={onCreateGame} variant="secondary" size="sm" aria-label="New game">
            <CalendarPlus className="w-4 h-4" />
          </Button>
        </div>

        <div className="bb-game-grid">
          {games.map((game, index) => (
            <div
              key={game.id}
              className="animate-slide-in-up"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <SwipeableGameCard
                game={game}
                user={user}
                onClick={onSelectGame}
                onJoin={onJoinGame}
                onDecline={onDeclineGame}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameDashboard;
