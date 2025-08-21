import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Users, Sun, Cloud, CloudRain, CloudDrizzle, CloudSnow, CloudLightning } from 'lucide-react';
import { convertTo24Hour, convertTo12Hour, formatDateWithDay } from '../../utils/dateUtils';
import { LOCATIONS } from '../../constants/locations';
import FloatingOrbs from '../ui/FloatingOrbs';
import { useMouseTracking } from '../../hooks/useMouseTracking';

const GameDetails = ({ game, user, onBack, onJoinGame, onLeaveGame, onDeclineGame, onDeleteGame, onEditLocation, onEditTime }) => {
  const mousePosition = useMouseTracking();
  const [arrivalTime, setArrivalTime] = useState('');
  const [isEditingGame, setIsEditingGame] = useState(false);
  const [editLocation, setEditLocation] = useState('');
  const [editTime, setEditTime] = useState('');

  const attendees = (game.attendees || []).sort((a, b) => {
    const timeA = new Date(`1970/01/01 ${a.arrivalTime}`);
    const timeB = new Date(`1970/01/01 ${b.arrivalTime}`);
    return timeA - timeB;
  });

  const isAttending = attendees.some(a => a.userUid === user?.uid);
  const hasDeclined = game.declined?.some(d => d.userUid === user?.uid) || false;
  const declinedCount = game.declined?.length || 0;
  const isOrganizer = game.organizerUid === user?.uid;

  
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

  const handleEditGame = () => {
    setIsEditingGame(true);
    // Find current location in LOCATIONS array
    const currentLocationKey = LOCATIONS.find(loc => loc.address === game.location)?.value || '';
    setEditLocation(currentLocationKey);
    setEditTime(convertTo24Hour(game.time));
  };

  const handleSaveGame = async () => {
    if (!editLocation || !editTime) return;
    
    try {
      // Save location if changed
      const selectedLocation = LOCATIONS.find(loc => loc.value === editLocation);
      if (selectedLocation && selectedLocation.address !== game.location) {
        await onEditLocation(game.id, selectedLocation.value, selectedLocation.address);
      }
      
      // Save time if changed
      const timeIn12Hour = convertTo12Hour(editTime);
      if (timeIn12Hour !== game.time) {
        await onEditTime(game.id, timeIn12Hour);
      }
      
      setIsEditingGame(false);
    } catch (error) {
      console.error('Error saving game changes:', error);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingGame(false);
    setEditLocation('');
    setEditTime('');
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <FloatingOrbs mousePosition={mousePosition} />
      
      <div className="relative z-10">
        <div className="max-w-md mx-auto px-8 py-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-20">
          <div>
            <h1 className="text-xl font-light tracking-wide text-white mb-1">
              Burlington Ballers
            </h1>
            <p className="text-xs text-gray-400">{user?.name}</p>
          </div>
          {isOrganizer && (
            <button 
              onClick={handleEditGame}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg transition-colors duration-200"
            >
              Edit
            </button>
          )}
        </div>

        {/* Event header */}
        <div className="text-center mb-16">
          <h3 className="text-3xl font-light mb-4">{game.title}</h3>
          <div className="space-y-2 text-gray-400 font-light">
            {isEditingGame ? (
              <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-800 rounded-xl p-8 space-y-8">
                <div className="text-center">
                  <h4 className="text-sm font-light text-gray-400 mb-6">Edit Game Details</h4>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-light text-gray-500 mb-3 tracking-wider">LOCATION</label>
                    <select
                      value={editLocation}
                      onChange={(e) => setEditLocation(e.target.value)}
                      className="w-full bg-transparent border-0 border-b border-gray-800 focus:border-orange-400 outline-none py-3 text-base font-light text-gray-300 transition-all duration-500"
                    >
                      <option value="" className="bg-black text-gray-400">Select location</option>
                      {LOCATIONS.map(loc => (
                        <option key={loc.value} value={loc.value} className="bg-black text-white">
                          {loc.value}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-light text-gray-500 mb-3 tracking-wider">TIME</label>
                    <input
                      type="time"
                      value={editTime}
                      onChange={(e) => setEditTime(e.target.value)}
                      className="w-full bg-transparent border-0 border-b border-gray-800 focus:border-orange-400 outline-none py-3 text-base font-light text-gray-300 transition-all duration-500"
                    />
                  </div>
                </div>
                
                <div className="w-16 h-px bg-gradient-to-r from-transparent via-orange-400 to-transparent mx-auto my-6"></div>
                
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <button
                      onClick={handleCancelEdit}
                      className="flex-1 px-6 py-3 bg-transparent border border-gray-600 hover:border-gray-500 hover:bg-gray-500/10 text-gray-300 hover:text-white font-medium text-sm rounded-lg transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveGame}
                      disabled={!editLocation || !editTime}
                      className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Save Changes
                    </button>
                  </div>
                  
                  <div className="w-16 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent mx-auto"></div>
                  
                  <button
                    onClick={handleDeleteGame}
                    className="w-full px-6 py-3 bg-transparent border border-red-600 hover:border-red-500 hover:bg-red-500/10 text-red-400 hover:text-red-300 font-medium text-sm rounded-lg transition-colors duration-200"
                  >
                    Delete Game
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-center gap-3">
                  <MapPin className="w-4 h-4" />
                  <span>{game.location}</span>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDateWithDay(game.date)} • {game.time}</span>
                </div>
              </>
            )}
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
          <h4 className="text-center text-sm font-light text-gray-500 mb-6">
            Confirmed ({attendees.length})
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
            <h4 className="text-center text-sm font-light text-red-400 mb-6">
              Can't make it ({declinedCount})
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
              <h4 className="text-center text-sm font-light text-gray-500">Arrival Time</h4>
              <input
                type="time"
                value={arrivalTime}
                onChange={(e) => setArrivalTime(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 focus:border-blue-400 outline-none px-4 py-3 text-lg font-light text-white rounded-lg transition-all duration-300"
              />
              
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={handleJoinGame}
                  disabled={!arrivalTime}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Join
                </button>
                
                <button 
                  onClick={handleDeclineGame}
                  className="px-6 py-3 bg-transparent border border-gray-600 hover:border-gray-500 hover:bg-gray-500/10 text-gray-300 hover:text-white font-medium text-sm rounded-lg transition-colors duration-200"
                >
                  Can't make it
                </button>
              </div>
            </div>
          </div>
        ) : isAttending ? (
          <div className="space-y-8">
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent mx-auto"></div>
            
            <p className="text-center text-blue-400 font-medium mb-6">You're attending this game</p>
            
            <button 
              onClick={handleDeclineGame}
              className="w-full px-6 py-3 bg-transparent border border-gray-600 hover:border-gray-500 hover:bg-gray-500/10 text-gray-300 hover:text-white font-medium text-sm rounded-lg transition-colors duration-200"
            >
              Can't make it anymore
            </button>
          </div>
        ) : hasDeclined ? (
          <div className="space-y-8">
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-red-400 to-transparent mx-auto"></div>
            
            <p className="text-center text-red-400 font-light mb-6">You've declined this game</p>
            
            <div className="space-y-6">
              <h4 className="text-center text-sm font-light text-gray-500">Change your mind?</h4>
              <input
                type="time"
                value={arrivalTime}
                onChange={(e) => setArrivalTime(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 focus:border-blue-400 outline-none px-4 py-3 text-lg font-light text-white rounded-lg transition-all duration-300"
              />
              
              <button 
                onClick={handleJoinGame}
                disabled={!arrivalTime}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-medium text-lg rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Join Game
              </button>
            </div>
          </div>
        ) : null}
        
        {/* Back button at bottom */}
        <div className="mt-16 text-center">
          <button 
            onClick={onBack}
            className="px-6 py-3 bg-transparent border border-gray-600 hover:border-gray-500 hover:bg-gray-500/10 text-gray-300 hover:text-white font-medium text-sm rounded-lg transition-colors duration-200"
          >
            ← Back to Games
          </button>
        </div>
        
        </div>
      </div>
    </div>
  );
};

export default GameDetails;