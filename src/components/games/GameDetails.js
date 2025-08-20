import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Users, Sun, Cloud, CloudRain, CloudDrizzle, CloudSnow, CloudLightning } from 'lucide-react';
import { convertTo24Hour } from '../../utils/dateUtils';
import { LOCATIONS } from '../../constants/locations';

const GameDetails = ({ game, user, onBack, onJoinGame, onLeaveGame, onDeclineGame, onDeleteGame, onEditLocation }) => {
  const [arrivalTime, setArrivalTime] = useState('');
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [editLocation, setEditLocation] = useState('');

  const attendees = (game.attendees || []).sort((a, b) => {
    const timeA = new Date(`1970/01/01 ${a.arrivalTime}`);
    const timeB = new Date(`1970/01/01 ${b.arrivalTime}`);
    return timeA - timeB;
  });

  const isAttending = attendees.some(a => a.userUid === user?.uid);
  const hasDeclined = game.declined?.some(d => d.userUid === user?.uid) || false;
  const declinedCount = game.declined?.length || 0;
  const isOrganizer = game.organizerUid === user?.uid;

  // Debug logging
  console.log('GameDetails Debug:', {
    gameId: game.id,
    attendees,
    declined: game.declined,
    user,
    isAttending,
    hasDeclined,
    arrivalTime
  });
  
  // Get the correct weather icon component
  const getWeatherIcon = (iconName) => {
    const icons = {
      Sun: Sun,
      Cloud: Cloud,
      CloudRain: CloudRain,
      CloudDrizzle: CloudDrizzle,
      CloudSnow: CloudSnow,
      CloudLightning: CloudLightning
    };
    return icons[iconName] || Sun;
  };
  
  const WeatherIcon = getWeatherIcon(game.weather.icon);

  useEffect(() => {
    if (game) {
      setArrivalTime(convertTo24Hour(game.time));
    }
  }, [game]);

  const handleJoinGame = () => {
    console.log('JOIN clicked:', { gameId: game.id, arrivalTime, user });
    if (arrivalTime) {
      onJoinGame(game.id, arrivalTime);
    } else {
      console.log('No arrival time set');
    }
  };

  const handleLeaveGame = () => {
    console.log('LEAVE clicked:', { gameId: game.id, user });
    onLeaveGame(game.id);
  };

  const handleDeclineGame = () => {
    console.log('DECLINE clicked:', { gameId: game.id, user });
    if (onDeclineGame) {
      onDeclineGame(game.id);
    } else {
      console.log('onDeclineGame handler not provided');
    }
  };

  const handleDeleteGame = () => {
    console.log('DELETE clicked:', { gameId: game.id, user });
    if (onDeleteGame) {
      onDeleteGame(game.id);
    } else {
      console.log('onDeleteGame handler not provided');
    }
  };

  const handleEditLocation = () => {
    setIsEditingLocation(true);
    // Find current location in LOCATIONS array
    const currentLocationKey = LOCATIONS.find(loc => loc.address === game.location)?.value || '';
    setEditLocation(currentLocationKey);
  };

  const handleSaveLocation = () => {
    if (!editLocation || !onEditLocation) return;
    
    const selectedLocation = LOCATIONS.find(loc => loc.value === editLocation);
    if (selectedLocation) {
      onEditLocation(game.id, selectedLocation.value, selectedLocation.address);
      setIsEditingLocation(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingLocation(false);
    setEditLocation('');
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-md mx-auto px-8 py-16">
        <div className="flex items-center justify-between mb-16">
          <button 
            onClick={onBack}
            className="text-gray-400 hover:text-orange-400 transition-all duration-500 text-sm font-light tracking-wide"
          >
            ← BACK
          </button>
          {isOrganizer && (
            <div className="flex items-center gap-4">
              <button 
                onClick={handleEditLocation}
                className="text-blue-400 hover:text-blue-300 transition-all duration-500 text-sm font-light tracking-wide"
              >
                EDIT
              </button>
              <button 
                onClick={handleDeleteGame}
                className="text-red-400 hover:text-red-300 transition-all duration-500 text-sm font-light tracking-wide"
              >
                DELETE
              </button>
            </div>
          )}
          {!isOrganizer && <div className="w-12"></div>}
        </div>

        {/* Event header */}
        <div className="text-center mb-16">
          <h3 className="text-3xl font-light mb-4">{game.title}</h3>
          <div className="space-y-2 text-gray-400 font-light">
            <div className="flex items-center justify-center gap-3">
              <MapPin className="w-4 h-4" />
              {isEditingLocation ? (
                <div className="flex items-center gap-2">
                  <select
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm text-white"
                  >
                    <option value="">Select location</option>
                    {LOCATIONS.map(loc => (
                      <option key={loc.value} value={loc.value}>
                        {loc.value}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleSaveLocation}
                    disabled={!editLocation}
                    className="text-green-400 hover:text-green-300 text-xs disabled:opacity-50"
                  >
                    SAVE
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="text-gray-400 hover:text-gray-300 text-xs"
                  >
                    CANCEL
                  </button>
                </div>
              ) : (
                <span>{game.location}</span>
              )}
            </div>
            <div className="flex items-center justify-center gap-3">
              <Calendar className="w-4 h-4" />
              <span>{game.date} • {game.time}</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <WeatherIcon className="w-4 h-4" />
              <span>{game.weather.temp}° {game.weather.condition}</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Users className="w-4 h-4" />
              <span>Created by {game.organizerName || game.organizer}</span>
            </div>
          </div>
        </div>

        <div className="w-24 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent mx-auto mb-12"></div>

        {/* Players */}
        <div className="mb-16">
          <h4 className="text-center text-sm font-light tracking-widest text-gray-500 mb-8">
            CONFIRMED ({attendees.length})
          </h4>
          <div className="space-y-4">
            {attendees.map((attendee, idx) => (
              <div key={idx} className="flex items-center justify-between py-3 border-b border-gray-900 last:border-0">
                <div className="flex items-center gap-3">
                  {attendee.userPhoto && (
                    <img 
                      src={attendee.userPhoto} 
                      alt={attendee.userName || attendee.name} 
                      className="w-6 h-6 rounded-full"
                    />
                  )}
                  <span className="font-light">{attendee.userName || attendee.name}</span>
                </div>
                <span className="text-sm text-gray-400 font-light">{attendee.arrivalTime}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Declined Players */}
        {declinedCount > 0 && (
          <div className="mb-16">
            <h4 className="text-center text-sm font-light tracking-widest text-red-400 mb-8">
              CAN'T MAKE IT ({declinedCount})
            </h4>
            <div className="space-y-4">
              {game.declined.map((declined, idx) => (
                <div key={idx} className="flex items-center justify-between py-3 border-b border-gray-900 last:border-0">
                  <div className="flex items-center gap-3">
                    {declined.userPhoto && (
                      <img 
                        src={declined.userPhoto} 
                        alt={declined.userName} 
                        className="w-6 h-6 rounded-full opacity-60"
                      />
                    )}
                    <span className="font-light text-red-400">{declined.userName}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RSVP Actions */}
        {!isAttending && !hasDeclined ? (
          <div className="space-y-8">
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-orange-400 to-transparent mx-auto"></div>
            
            <div className="space-y-6">
              <h4 className="text-center text-sm font-light tracking-widest text-gray-500">ARRIVAL TIME</h4>
              <input
                type="time"
                value={arrivalTime}
                onChange={(e) => setArrivalTime(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-gray-800 focus:border-orange-400 outline-none py-4 text-lg font-light text-center transition-all duration-700"
              />
              
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={handleJoinGame}
                  disabled={!arrivalTime}
                  className="py-4 bg-transparent border border-gray-800 hover:border-orange-400 text-white font-light text-sm tracking-widest transition-all duration-700 hover:bg-orange-400/5 disabled:opacity-30 disabled:cursor-not-allowed group"
                >
                  <span className="group-hover:tracking-[0.3em] transition-all duration-500">JOIN</span>
                </button>
                
                <button 
                  onClick={handleDeclineGame}
                  className="py-4 bg-transparent border border-red-800/50 hover:border-red-400 text-red-400 font-light text-sm tracking-widest transition-all duration-700 hover:bg-red-400/5 group"
                >
                  <span className="group-hover:tracking-[0.3em] transition-all duration-500">CAN'T MAKE IT</span>
                </button>
              </div>
            </div>
          </div>
        ) : isAttending ? (
          <div className="space-y-8">
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-orange-400 to-transparent mx-auto"></div>
            
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={handleLeaveGame}
                className="py-4 bg-transparent border border-red-800 hover:border-red-400 text-white font-light text-sm tracking-widest transition-all duration-700 hover:bg-red-400/5 group"
              >
                <span className="group-hover:tracking-[0.3em] transition-all duration-500">LEAVE</span>
              </button>
              
              <button 
                onClick={handleDeclineGame}
                className="py-4 bg-transparent border border-red-800/50 hover:border-red-400 text-red-400 font-light text-sm tracking-widest transition-all duration-700 hover:bg-red-400/5 group"
              >
                <span className="group-hover:tracking-[0.3em] transition-all duration-500">CAN'T MAKE IT</span>
              </button>
            </div>
          </div>
        ) : hasDeclined ? (
          <div className="space-y-8">
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-red-400 to-transparent mx-auto"></div>
            
            <p className="text-center text-red-400 font-light mb-6">You've declined this game</p>
            
            <div className="space-y-6">
              <h4 className="text-center text-sm font-light tracking-widest text-gray-500">CHANGE YOUR MIND?</h4>
              <input
                type="time"
                value={arrivalTime}
                onChange={(e) => setArrivalTime(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-gray-800 focus:border-orange-400 outline-none py-4 text-lg font-light text-center transition-all duration-700"
              />
              
              <button 
                onClick={handleJoinGame}
                disabled={!arrivalTime}
                className="w-full py-6 bg-transparent border border-gray-800 hover:border-orange-400 text-white font-light text-lg tracking-widest transition-all duration-700 hover:bg-orange-400/5 disabled:opacity-30 disabled:cursor-not-allowed group"
              >
                <span className="group-hover:tracking-[0.4em] transition-all duration-500">JOIN GAME</span>
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default GameDetails;