import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Users, ArrowLeft } from 'lucide-react';
import { convertTo24Hour, convertTo12Hour, formatDateWithDay } from '../../utils/dateUtils';
import { LOCATIONS } from '../../constants/locations';
import FloatingOrbs from '../ui/FloatingOrbs';
import Button from '../ui/Button';
import AnimatedCounter from '../ui/AnimatedCounter';
import AnimatedWeatherIcon from '../ui/AnimatedWeatherIcon';
import { useMouseTracking } from '../../hooks/useMouseTracking';

const GameDetails = ({ game, user, onBack, onJoinGame, onLeaveGame, onDeclineGame, onMaybeGame, onDeleteGame, onEditLocation, onEditTime, editTrigger, hideHeader }) => {
  const mousePosition = useMouseTracking();
  const [arrivalTime, setArrivalTime] = useState('');
  const [isEditingGame, setIsEditingGame] = useState(false);
  const [editLocation, setEditLocation] = useState('');
  const [editTime, setEditTime] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [loadingStates, setLoadingStates] = useState({
    joining: false,
    leaving: false,
    declining: false,
    maybe: false,
    deleting: false,
    saving: false
  });

  // Calculate comprehensive RSVP data
  const rsvps = game.rsvps || [];
  const attending = rsvps.filter(rsvp => rsvp.status === 'attending').sort((a, b) => {
    if (!a.arrivalTime || !b.arrivalTime) return 0;
    const timeA = new Date(`1970/01/01 ${a.arrivalTime}`);
    const timeB = new Date(`1970/01/01 ${b.arrivalTime}`);
    return timeA - timeB;
  });
  const maybe = rsvps.filter(rsvp => rsvp.status === 'maybe').sort((a, b) => (a.userName || '').localeCompare(b.userName || ''));
  const declined = rsvps.filter(rsvp => rsvp.status === 'declined').sort((a, b) => (a.userName || '').localeCompare(b.userName || ''));
  
  // Calculate users who haven't responded
  const respondedUserIds = new Set(rsvps.map(rsvp => rsvp.userUid));
  const haventResponded = allUsers.filter(u => !respondedUserIds.has(u.uid)).sort((a, b) => {
    const nameA = a.username || a.googleName || a.name || '';
    const nameB = b.username || b.googleName || b.name || '';
    return nameA.localeCompare(nameB);
  });

  // Determine user's current RSVP status
  const userRSVP = rsvps.find(rsvp => rsvp.userUid === user?.uid);
  const userStatus = userRSVP?.status || 'no_response';
  const isAttending = userStatus === 'attending';
  const hasMaybe = userStatus === 'maybe';
  const hasDeclined = userStatus === 'declined';
  const hasntResponded = userStatus === 'no_response';
  
  const isOrganizer = game.organizerUid === user?.uid;

  // For backward compatibility, also check old structure
  const legacyAttendees = game.attendees || [];
  const legacyDeclined = game.declined || [];
  const allAttending = [...attending, ...legacyAttendees].filter((item, index, self) => 
    index === self.findIndex(t => t.userUid === item.userUid)
  );
  const allDeclined = [...declined, ...legacyDeclined].filter((item, index, self) => 
    index === self.findIndex(t => t.userUid === item.userUid)
  );

  // Load all users to calculate who hasn't responded
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const { collection, getDocs } = await import('firebase/firestore');
        const { db } = await import('../../services/firebase');
        
        const usersRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersRef);
        
        const users = usersSnapshot.docs.map(doc => ({
          uid: doc.id,
          ...doc.data()
        }));
        
        setAllUsers(users);
      } catch (error) {
        console.error('Error loading users:', error);
      }
    };
    
    loadUsers();
  }, []);
  
  // Check if edit mode should be triggered from parent
  useEffect(() => {
    if (editTrigger > 0) {
      handleEditGame();
    }
  }, [editTrigger]);

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

  const handleMaybeGame = async () => {
    if (onMaybeGame && !loadingStates.maybe) {
      setLoadingStates(prev => ({ ...prev, maybe: true }));
      try {
        await onMaybeGame(game.id);
      } finally {
        setLoadingStates(prev => ({ ...prev, maybe: false }));
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

        {/* RSVP Sections */}
        <div className="space-y-12 mb-16">
          {/* Attending */}
          {attending.length > 0 && (
            <div>
              <h4 className="text-center text-base font-semibold text-green-400 mb-8">
                ✅ Attending (<AnimatedCounter value={attending.length} className="font-bold" />)
              </h4>
              <div className="space-y-3">
                {attending.map((attendee, idx) => (
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
          )}

          {/* Maybe */}
          {maybe.length > 0 && (
            <div>
              <h4 className="text-center text-base font-semibold text-yellow-400 mb-8">
                🤔 Maybe (<AnimatedCounter value={maybe.length} className="font-bold" />)
              </h4>
              <div className="space-y-3">
                {maybe.map((maybeUser, idx) => (
                  <div key={idx} className="flex items-center justify-between py-4 px-4 bg-yellow-900/10 rounded-lg border border-yellow-900/30">
                    <div className="flex items-center gap-4">
                      {maybeUser.userPhoto && (
                        <img 
                          src={maybeUser.userPhoto} 
                          alt={maybeUser.userName} 
                          className="w-8 h-8 rounded-full border-2 border-yellow-400/50"
                        />
                      )}
                      <span className="font-medium text-yellow-200">{maybeUser.userName}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Declined */}
          {declined.length > 0 && (
            <div>
              <h4 className="text-center text-base font-semibold text-red-400 mb-8">
                ❌ Can't Make It (<AnimatedCounter value={declined.length} className="font-bold" />)
              </h4>
              <div className="space-y-3">
                {declined.map((declinedUser, idx) => (
                  <div key={idx} className="flex items-center justify-between py-4 px-4 bg-red-900/10 rounded-lg border border-red-900/30">
                    <div className="flex items-center gap-4">
                      {declinedUser.userPhoto && (
                        <img 
                          src={declinedUser.userPhoto} 
                          alt={declinedUser.userName} 
                          className="w-8 h-8 rounded-full opacity-70 border-2 border-red-400/30"
                        />
                      )}
                      <span className="font-medium text-red-300">{declinedUser.userName}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* RSVP Actions */}
        {hasntResponded ? (
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
              
              <div className="space-y-3">
                <Button 
                  onClick={handleJoinGame}
                  disabled={!arrivalTime}
                  loading={loadingStates.joining}
                  className="w-full"
                >
                  Join Game
                </Button>
                
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    onClick={handleMaybeGame}
                    variant="secondary"
                    loading={loadingStates.maybe}
                  >
                    Maybe
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
          </div>
        ) : isAttending ? (
          <div className="space-y-8">
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-green-400 to-transparent mx-auto"></div>
            
            <p className="text-center text-green-400 font-medium mb-6">✅ You're attending this game</p>
            
            <div className="grid grid-cols-2 gap-4">
              <Button 
                onClick={handleMaybeGame}
                variant="secondary"
                loading={loadingStates.maybe}
              >
                Change to Maybe
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
        ) : hasMaybe ? (
          <div className="space-y-8">
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-yellow-400 to-transparent mx-auto"></div>
            
            <p className="text-center text-yellow-400 font-medium mb-6">🤔 You might attend this game</p>
            
            <div className="space-y-6">
              <h4 className="text-center text-sm font-light text-gray-500">Ready to commit?</h4>
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
              
              <div className="space-y-3">
                <Button 
                  onClick={handleJoinGame}
                  disabled={!arrivalTime}
                  loading={loadingStates.joining}
                  className="w-full"
                >
                  Join Game
                </Button>
                
                <Button 
                  onClick={handleDeclineGame}
                  variant="secondary"
                  loading={loadingStates.declining}
                  className="w-full"
                >
                  Can't make it
                </Button>
              </div>
            </div>
          </div>
        ) : hasDeclined ? (
          <div className="space-y-8">
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-red-400 to-transparent mx-auto"></div>
            
            <p className="text-center text-red-400 font-light mb-6">❌ You've declined this game</p>
            
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
              
              <div className="space-y-3">
                <Button 
                  onClick={handleJoinGame}
                  disabled={!arrivalTime}
                  loading={loadingStates.joining}
                  className="w-full"
                >
                  Join Game
                </Button>
                
                <Button 
                  onClick={handleMaybeGame}
                  variant="secondary"
                  loading={loadingStates.maybe}
                  className="w-full"
                >
                  Maybe
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        {/* Haven't Responded - Bottom Section */}
        {haventResponded.length > 0 && (
          <div className="mt-16">
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent mx-auto mb-8"></div>
            
            <div>
              <h4 className="text-center text-base font-semibold text-gray-400 mb-8">
                ⏳ Haven't Responded (<AnimatedCounter value={haventResponded.length} className="font-bold" />)
              </h4>
              <div className="space-y-3">
                {haventResponded.map((nonResponder, idx) => {
                  const displayName = nonResponder.username || nonResponder.googleName || nonResponder.name || 'Unknown User';
                  const photoUrl = nonResponder.photoURL || nonResponder.photo;
                  return (
                    <div key={idx} className="flex items-center justify-between py-4 px-4 bg-gray-900/10 rounded-lg border border-gray-700/30">
                      <div className="flex items-center gap-4">
                        {photoUrl && (
                          <img 
                            src={photoUrl} 
                            alt={displayName} 
                            className="w-8 h-8 rounded-full opacity-60 border-2 border-gray-500/30"
                          />
                        )}
                        <span className="font-medium text-gray-400">{displayName}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        
        
        </div>
      </div>
    </div>
  );
};

export default GameDetails;