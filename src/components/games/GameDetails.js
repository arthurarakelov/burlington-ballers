import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Users, ArrowLeft } from 'lucide-react';
import { convertTo24Hour, convertTo12Hour, formatDateWithDay } from '../../utils/dateUtils';
import { LOCATIONS } from '../../constants/locations';
import FloatingOrbs from '../ui/FloatingOrbs';
import Button from '../ui/Button';
import AnimatedCounter from '../ui/AnimatedCounter';
import AnimatedWeatherIcon from '../ui/AnimatedWeatherIcon';
import { useMouseTracking } from '../../hooks/useMouseTracking';

const GameDetails = ({ game, user, onBack, onJoinGame, onLeaveGame, onDeclineGame, onDeleteGame, onEditLocation, onEditTime, hideHeader }) => {
  const mousePosition = useMouseTracking();
  const [arrivalTime, setArrivalTime] = useState('');
  const [isEditingGame, setIsEditingGame] = useState(false);
  const [editLocation, setEditLocation] = useState('');
  const [editTime, setEditTime] = useState('');
  const [loadingStates, setLoadingStates] = useState({
    joining: false,
    leaving: false,
    declining: false,
    deleting: false,
    saving: false
  });

  const attendees = (game.attendees || []).sort((a, b) => {
    const timeA = new Date(`1970/01/01 ${a.arrivalTime}`);
    const timeB = new Date(`1970/01/01 ${b.arrivalTime}`);
    return timeA - timeB;
  });

  const isAttending = attendees.some(a => a.userUid === user?.uid);
  const hasDeclined = game.declined?.some(d => d.userUid === user?.uid) || false;
  const declinedCount = game.declined?.length || 0;
  const isOrganizer = game.organizerUid === user?.uid;

  useEffect(() => {
    if (game) {
      setArrivalTime(convertTo24Hour(game.time));
    }
  }, [game.id, game.time]);

  const handleJoinGame = async () => {
    if (arrivalTime && !loadingStates.joining) {
      setLoadingStates(prev => ({ ...prev, joining: true }));
      try {
        await onJoinGame(game.id, arrivalTime);
      } finally {
        setLoadingStates(prev => ({ ...prev, joining: false }));
      }
    }
  };

  const handleLeaveGame = async () => {
    if (!loadingStates.leaving) {
      setLoadingStates(prev => ({ ...prev, leaving: true }));
      try {
        await onLeaveGame(game.id);
      } finally {
        setLoadingStates(prev => ({ ...prev, leaving: false }));
      }
    }
  };

  const handleDeclineGame = async () => {
    if (onDeclineGame && !loadingStates.declining) {
      setLoadingStates(prev => ({ ...prev, declining: true }));
      try {
        await onDeclineGame(game.id);
      } finally {
        setLoadingStates(prev => ({ ...prev, declining: false }));
      }
    }
  };

  const handleDeleteGame = async () => {
    if (onDeleteGame && !loadingStates.deleting) {
      setLoadingStates(prev => ({ ...prev, deleting: true }));
      try {
        await onDeleteGame(game.id);
      } finally {
        setLoadingStates(prev => ({ ...prev, deleting: false }));
      }
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
    if (!editLocation || !editTime || loadingStates.saving) return;
    
    setLoadingStates(prev => ({ ...prev, saving: true }));
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
    } finally {
      setLoadingStates(prev => ({ ...prev, saving: false }));
    }
  };

  const handleCancelEdit = () => {
    setIsEditingGame(false);
    setEditLocation('');
    setEditTime('');
  };

  return (
    <div className={hideHeader ? "" : "min-h-screen bg-black text-white relative overflow-hidden"}>
      {!hideHeader && <FloatingOrbs mousePosition={mousePosition} />}
      
      <div className="relative z-10">
        <div className={hideHeader ? "" : "max-w-md mx-auto px-8 py-16"}>
        {/* Header */}
        {!hideHeader && (
          <div className="flex items-center justify-between mb-20">
            <div>
              <h1 className="text-xl font-light tracking-wide text-white mb-1">
                Burlington Ballers
              </h1>
              <p className="text-xs text-gray-400">{user?.name}</p>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={onBack} variant="secondary" size="sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
              {isOrganizer && (
                <Button onClick={handleEditGame} size="sm">
                  Edit
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Event header */}
        <div className="text-center mb-16">
          <h3 className="text-4xl font-semibold mb-6 text-white leading-tight">{game.title}</h3>
          <div className="space-y-3 text-gray-300">
            {isEditingGame ? (
              <div className="bg-gray-900/40 backdrop-blur-sm border border-gray-700 rounded-xl p-8 space-y-8">
                <div className="text-center">
                  <h4 className="text-lg font-medium text-gray-200 mb-6">Edit Game Details</h4>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-3 tracking-wide">Location</label>
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
                    <label className="block text-sm font-medium text-gray-400 mb-3 tracking-wide">Time</label>
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
                    <Button
                      onClick={handleCancelEdit}
                      variant="secondary"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveGame}
                      disabled={!editLocation || !editTime}
                      loading={loadingStates.saving}
                      className="flex-1"
                    >
                      Save Changes
                    </Button>
                  </div>
                  
                  <div className="w-16 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent mx-auto"></div>
                  
                  <Button
                    onClick={handleDeleteGame}
                    variant="danger"
                    loading={loadingStates.deleting}
                    className="w-full"
                  >
                    Delete Game
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-center gap-3">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <span className="text-base font-medium">{game.location}</span>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="text-base font-medium">{formatDateWithDay(game.date)} • {game.time}</span>
                </div>
              </>
            )}
            <div className="flex items-center justify-center gap-3">
              <AnimatedWeatherIcon iconName={game.weather.icon} className="w-5 h-5" />
              <span className="text-base font-medium">{game.weather.temp}° {game.weather.condition}</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Users className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-400">Created by {game.organizerName || game.organizer}</span>
            </div>
          </div>
        </div>

        <div className="w-24 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent mx-auto mb-12"></div>

        {/* Players */}
        <div className="mb-16">
          <h4 className="text-center text-base font-semibold text-green-400 mb-8">
            Confirmed (<AnimatedCounter value={attendees.length} className="font-bold" />)
          </h4>
          <div className="space-y-3">
            {attendees.map((attendee, idx) => (
              <div key={idx} className="flex items-center justify-between py-4 px-4 bg-gray-900/20 rounded-lg border border-gray-800/50">
                <div className="flex items-center gap-4">
                  {attendee.userPhoto && (
                    <img 
                      src={attendee.userPhoto} 
                      alt={attendee.userName || attendee.name} 
                      className="w-8 h-8 rounded-full border-2 border-green-400/50"
                    />
                  )}
                  <span className="font-medium text-gray-200">{attendee.userName || attendee.name}</span>
                </div>
                <span className="text-sm text-green-300 font-medium bg-green-900/30 px-3 py-1 rounded-full">{attendee.arrivalTime}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Declined Players */}
        {declinedCount > 0 && (
          <div className="mb-16">
            <h4 className="text-center text-base font-semibold text-red-400 mb-8">
              Can't make it (<AnimatedCounter value={declinedCount} className="font-bold" />)
            </h4>
            <div className="space-y-3">
              {game.declined.map((declined, idx) => (
                <div key={idx} className="flex items-center justify-between py-4 px-4 bg-red-900/10 rounded-lg border border-red-900/30">
                  <div className="flex items-center gap-4">
                    {declined.userPhoto && (
                      <img 
                        src={declined.userPhoto} 
                        alt={declined.userName} 
                        className="w-8 h-8 rounded-full opacity-70 border-2 border-red-400/30"
                      />
                    )}
                    <span className="font-medium text-red-300">{declined.userName}</span>
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
              <h4 className="text-center text-base font-medium text-gray-300">When will you arrive?</h4>
              <div className="flex justify-center gap-2">
                <select
                  value={arrivalTime.split(':')[0] || '11'}
                  onChange={(e) => {
                    const minutes = arrivalTime.split(':')[1] || '00';
                    setArrivalTime(`${e.target.value}:${minutes}`);
                  }}
                  className="bg-gray-900 border border-gray-700 focus:border-blue-400 outline-none px-3 py-3 text-lg font-light text-white rounded-lg transition-all duration-300 text-center"
                >
                  {Array.from({length: 12}, (_, i) => i + 1).map(hour => (
                    <option key={hour} value={hour.toString().padStart(2, '0')} className="bg-gray-900">{hour}</option>
                  ))}
                  {Array.from({length: 12}, (_, i) => i + 13).map(hour => (
                    <option key={hour} value={hour.toString()} className="bg-gray-900">{hour}</option>
                  ))}
                </select>
                <span className="flex items-center text-gray-400 text-lg">:</span>
                <select
                  value={arrivalTime.split(':')[1] || '00'}
                  onChange={(e) => {
                    const hours = arrivalTime.split(':')[0] || '11';
                    setArrivalTime(`${hours}:${e.target.value}`);
                  }}
                  className="bg-gray-900 border border-gray-700 focus:border-blue-400 outline-none px-3 py-3 text-lg font-light text-white rounded-lg transition-all duration-300 text-center"
                >
                  {['00', '15', '30', '45'].map(minute => (
                    <option key={minute} value={minute} className="bg-gray-900">{minute}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  onClick={handleJoinGame}
                  disabled={!arrivalTime}
                  loading={loadingStates.joining}
                >
                  Join
                </Button>
                
                <Button 
                  onClick={handleDeclineGame}
                  variant="secondary"
                  loading={loadingStates.declining}
                >
                  Can't make it
                </Button>
              </div>
            </div>
          </div>
        ) : isAttending ? (
          <div className="space-y-8">
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent mx-auto"></div>
            
            <p className="text-center text-blue-400 font-medium mb-6">You're attending this game</p>
            
            <Button 
              onClick={handleDeclineGame}
              variant="secondary"
              loading={loadingStates.declining}
              className="w-full"
            >
              Can't make it anymore
            </Button>
          </div>
        ) : hasDeclined ? (
          <div className="space-y-8">
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-red-400 to-transparent mx-auto"></div>
            
            <p className="text-center text-red-400 font-light mb-6">You've declined this game</p>
            
            <div className="space-y-6">
              <h4 className="text-center text-sm font-light text-gray-500">Change your mind?</h4>
              <div className="flex justify-center gap-2">
                <select
                  value={arrivalTime.split(':')[0] || '11'}
                  onChange={(e) => {
                    const minutes = arrivalTime.split(':')[1] || '00';
                    setArrivalTime(`${e.target.value}:${minutes}`);
                  }}
                  className="bg-gray-900 border border-gray-700 focus:border-blue-400 outline-none px-3 py-3 text-lg font-light text-white rounded-lg transition-all duration-300 text-center"
                >
                  {Array.from({length: 12}, (_, i) => i + 1).map(hour => (
                    <option key={hour} value={hour.toString().padStart(2, '0')} className="bg-gray-900">{hour}</option>
                  ))}
                  {Array.from({length: 12}, (_, i) => i + 13).map(hour => (
                    <option key={hour} value={hour.toString()} className="bg-gray-900">{hour}</option>
                  ))}
                </select>
                <span className="flex items-center text-gray-400 text-lg">:</span>
                <select
                  value={arrivalTime.split(':')[1] || '00'}
                  onChange={(e) => {
                    const hours = arrivalTime.split(':')[0] || '11';
                    setArrivalTime(`${hours}:${e.target.value}`);
                  }}
                  className="bg-gray-900 border border-gray-700 focus:border-blue-400 outline-none px-3 py-3 text-lg font-light text-white rounded-lg transition-all duration-300 text-center"
                >
                  {['00', '15', '30', '45'].map(minute => (
                    <option key={minute} value={minute} className="bg-gray-900">{minute}</option>
                  ))}
                </select>
              </div>
              
              <Button 
                onClick={handleJoinGame}
                disabled={!arrivalTime}
                loading={loadingStates.joining}
                size="lg"
                className="w-full"
              >
                Join Game
              </Button>
            </div>
          </div>
        ) : null}
        
        
        </div>
      </div>
    </div>
  );
};

export default GameDetails;