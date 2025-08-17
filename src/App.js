import { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Clock, Cloud, Sun, CloudRain } from 'lucide-react';

const BasketballScheduler = () => {
  const [currentView, setCurrentView] = useState('games'); 
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [userName, setUserName] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [arrivalTime, setArrivalTime] = useState('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const [games, setGames] = useState([
    {
      id: 1,
      title: "Wildwood Park Game",
      location: "114 Bedford St, Burlington, MA 01803",
      date: "Aug 18, 2025",
      time: "6:00 PM",
      organizer: "Mike Johnson",
      attendees: [
        { name: "Mike Johnson", phone: "Mike Johnson", arrivalTime: "6:00 PM" },
        { name: "Sarah Chen", phone: "Sarah Chen", arrivalTime: "6:15 PM" },
        { name: "Alex Rivera", phone: "Alex Rivera", arrivalTime: "6:30 PM" }
      ],
      weather: { temp: 78, condition: "perfect", icon: Sun }
    },
    {
      id: 2,
      title: "Simonds Park Game",
      location: "10 Bedford St, Burlington, MA 01803", 
      date: "Aug 20, 2025", 
      time: "9:00 AM",
      organizer: "Emma Davis",
      attendees: [
        { name: "Emma Davis", phone: "Emma Davis", arrivalTime: "8:45 AM" },
        { name: "Chris Park", phone: "Chris Park", arrivalTime: "9:00 AM" }
      ],
      weather: { temp: 72, condition: "ideal", icon: Cloud }
    }
  ]);

  const [newGame, setNewGame] = useState({
    location: '',
    date: '',
    time: '11:00'
  });

  const locations = [
    { value: 'Wildwood Park', address: '114 Bedford St, Burlington, MA 01803' },
    { value: 'Simonds Park', address: '10 Bedford St, Burlington, MA 01803' }
  ];

  // Calculate next Saturday
  const getNextSaturday = () => {
    const today = new Date();
    const daysUntilSaturday = (6 - today.getDay()) % 7; // Saturday is day 6
    const nextSaturday = new Date(today);
    
    if (daysUntilSaturday === 0 && today.getDay() === 6) {
      // If today is Saturday, get next Saturday
      nextSaturday.setDate(today.getDate() + 7);
    } else {
      nextSaturday.setDate(today.getDate() + (daysUntilSaturday || 7));
    }
    
    return nextSaturday.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  };

  // Set defaults when switching to create view
  useEffect(() => {
    if (currentView === 'create' && !newGame.date) {
      setNewGame(prev => ({
        ...prev,
        date: getNextSaturday(),
        time: '11:00'
      }));
    }
  }, [currentView]);

  // Mouse tracking for interactive elements
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Set default arrival time when event is selected
  useEffect(() => {
    if (selectedEvent) {
      // Convert 12-hour format to 24-hour format for input
      const convertTo24Hour = (time12h) => {
        const [time, modifier] = time12h.split(' ');
        let [hours, minutes] = time.split(':');
        if (hours === '12') {
          hours = '00';
        }
        if (modifier === 'PM') {
          hours = String(parseInt(hours, 10) + 12);
        }
        // Ensure hours is a string and pad it
        hours = String(hours).padStart(2, '0');
        return `${hours}:${minutes}`;
      };
      
      setArrivalTime(convertTo24Hour(selectedEvent.time));
    }
  }, [selectedEvent]);

  const handleLogin = () => {
    if (userName.trim().length >= 2) {
      setIsLoggedIn(true);
    }
  };

  const handleCreateGame = () => {
    if (!newGame.location || !newGame.date || !newGame.time) return;
    
    const selectedLocation = locations.find(loc => loc.value === newGame.location);
    const game = {
      id: games.length + 1,
      title: `${newGame.location} Game`,
      location: selectedLocation.address,
      date: newGame.date,
      time: newGame.time,
      organizer: userName,
      attendees: [{ name: userName, phone: userName, arrivalTime: newGame.time }],
      weather: { temp: 75, condition: "perfect", icon: Sun }
    };
    setGames([...games, game]);
    setNewGame({ location: '', date: '', time: '' });
    setCurrentView('games');
  };

  const handleAttendGame = (gameId, arrivalTime) => {
    // Convert 24-hour format to 12-hour format with AM/PM
    const convertTo12Hour = (time24) => {
      const [hours, minutes] = time24.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${displayHour}:${minutes} ${ampm}`;
    };
    
    const updatedGames = games.map(game => {
      if (game.id === gameId) {
        const isAlreadyAttending = game.attendees.some(a => a.phone === userName);
        if (!isAlreadyAttending) {
          return {
            ...game,
            attendees: [...game.attendees, { 
              name: userName, 
              phone: userName, 
              arrivalTime: convertTo12Hour(arrivalTime)
            }]
          };
        }
      }
      return game;
    });
    
    setGames(updatedGames);
    // Update the selectedEvent to reflect the new attendee list
    const updatedGame = updatedGames.find(g => g.id === gameId);
    setSelectedEvent(updatedGame);
  };

  const handleLeaveGame = (gameId) => {
    const updatedGames = games.map(game => {
      if (game.id === gameId) {
        return {
          ...game,
          attendees: game.attendees.filter(a => a.name !== userName)
        };
      }
      return game;
    });
    
    setGames(updatedGames);
    // Update the selectedEvent to reflect the updated attendee list
    const updatedGame = updatedGames.find(g => g.id === gameId);
    setSelectedEvent(updatedGame);
  };

  // Ultra-smooth login screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-black text-white relative overflow-hidden">
        {/* Dynamic floating orbs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute w-[800px] h-[800px] rounded-full opacity-30 animate-pulse duration-[8000ms]"
            style={{
              background: 'radial-gradient(circle, rgba(251,146,60,0.15) 0%, transparent 70%)',
              left: mousePosition.x - 400,
              top: mousePosition.y - 400,
              transition: 'all 2s ease-out'
            }}
          />
          <div 
            className="absolute w-[600px] h-[600px] rounded-full opacity-20 animate-pulse duration-[6000ms]"
            style={{
              background: 'radial-gradient(circle, rgba(239,68,68,0.15) 0%, transparent 70%)',
              left: mousePosition.x - 300,
              top: mousePosition.y - 300,
              transition: 'all 3s ease-out',
              animationDelay: '1s'
            }}
          />
          <div 
            className="absolute w-[400px] h-[400px] rounded-full opacity-25 animate-pulse duration-[4000ms]"
            style={{
              background: 'radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%)',
              left: mousePosition.x - 200,
              top: mousePosition.y - 200,
              transition: 'all 4s ease-out',
              animationDelay: '2s'
            }}
          />
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen px-8">
          <div className="max-w-md w-full">
            {/* Hero */}
            <div className="text-center mb-16">
              <div className="text-9xl mb-8 animate-bounce duration-[3000ms]">🏀</div>
              
              <div className="space-y-4 mb-16">
                <h1 className="text-7xl font-thin tracking-[-0.05em]">
                  <span className="bg-gradient-to-r from-orange-200 via-orange-300 to-orange-400 bg-clip-text text-transparent">
                    BURLINGTON
                  </span>
                </h1>
                <h2 className="text-2xl font-extralight text-gray-400 tracking-[0.3em]">
                  BALLERS
                </h2>
              </div>

              <div className="w-24 h-px bg-gradient-to-r from-transparent via-orange-400 to-transparent mx-auto mb-8"></div>
              <p className="text-sm font-light text-gray-500 tracking-widest">WHERE LEGENDS BEGIN</p>
            </div>

            {/* Next Game Preview */}
            {games.length > 0 && (
              <div className="mb-16">
                <div className="w-16 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent mx-auto mb-8"></div>
                
                {(() => {
                  // Find the next upcoming game
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
                  );
                })()}
              </div>
            )}

            {/* Minimal login */}
            <div className="space-y-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Your name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full bg-transparent border-0 border-b border-gray-800 focus:border-orange-400 outline-none py-4 text-xl font-light placeholder-gray-600 text-center transition-all duration-700 focus:placeholder-gray-400"
                />
                <div className="absolute bottom-0 left-0 w-0 h-px bg-gradient-to-r from-orange-400 to-red-400 transition-all duration-700 focus-within:w-full"></div>
              </div>
              
              <button 
                onClick={handleLogin}
                disabled={userName.trim().length < 2}
                className="w-full py-6 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-400/50 hover:border-orange-400 hover:from-orange-500/20 hover:to-red-500/20 text-white font-light text-lg tracking-widest transition-all duration-700 disabled:opacity-30 disabled:cursor-not-allowed disabled:border-gray-800 disabled:from-transparent disabled:to-transparent group"
              >
                <span className="group-hover:tracking-[0.4em] transition-all duration-500">ENTER</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Minimal create screen
  if (currentView === 'create') {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="max-w-md mx-auto px-8 py-16">
          <div className="flex items-center justify-between mb-16">
            <button 
              onClick={() => setCurrentView('games')}
              className="text-gray-400 hover:text-orange-400 transition-all duration-500 text-sm font-light tracking-wide"
            >
              ← BACK
            </button>
            <h2 className="text-lg font-light tracking-[0.3em] text-gray-300">CREATE</h2>
            <div className="w-12"></div>
          </div>

          <div className="space-y-12">
            <select
              value={newGame.location}
              onChange={(e) => setNewGame({...newGame, location: e.target.value})}
              className="w-full bg-transparent border-0 border-b border-gray-800 focus:border-orange-400 outline-none py-4 text-lg font-light text-gray-300 transition-all duration-700"
            >
              <option value="" className="bg-black text-gray-400">Select location</option>
              {locations.map(loc => (
                <option key={loc.value} value={loc.value} className="bg-black text-white">
                  {loc.value}
                </option>
              ))}
            </select>
            
            <div className="grid grid-cols-2 gap-8">
              <input
                type="date"
                value={newGame.date}
                onChange={(e) => setNewGame({...newGame, date: e.target.value})}
                className="w-full bg-transparent border-0 border-b border-gray-800 focus:border-orange-400 outline-none py-4 text-lg font-light text-gray-300 transition-all duration-700"
              />
              <input
                type="time"
                value={newGame.time}
                onChange={(e) => setNewGame({...newGame, time: e.target.value})}
                className="w-full bg-transparent border-0 border-b border-gray-800 focus:border-orange-400 outline-none py-4 text-lg font-light text-gray-300 transition-all duration-700"
              />
            </div>

            <button 
              onClick={handleCreateGame}
              className="w-full py-6 bg-transparent border border-gray-800 hover:border-orange-400 text-white font-light text-lg tracking-widest transition-all duration-700 hover:bg-orange-400/5 mt-16 group"
            >
              <span className="group-hover:tracking-[0.4em] transition-all duration-500">LAUNCH</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Minimal event details
  if (selectedEvent) {
    const attendees = selectedEvent.attendees.sort((a, b) => {
      const timeA = new Date(`1970/01/01 ${a.arrivalTime}`);
      const timeB = new Date(`1970/01/01 ${b.arrivalTime}`);
      return timeA - timeB;
    });

    const isAttending = attendees.some(a => a.phone === userName);
    const WeatherIcon = selectedEvent.weather.icon;

    return (
      <div className="min-h-screen bg-black text-white">
        <div className="max-w-md mx-auto px-8 py-16">
          <div className="flex items-center justify-between mb-16">
            <button 
              onClick={() => setSelectedEvent(null)}
              className="text-gray-400 hover:text-orange-400 transition-all duration-500 text-sm font-light tracking-wide"
            >
              ← BACK
            </button>
            <div className="w-12"></div>
          </div>

          {/* Event header */}
          <div className="text-center mb-16">
            <h3 className="text-3xl font-light mb-4">{selectedEvent.title}</h3>
            <div className="space-y-2 text-gray-400 font-light">
              <div className="flex items-center justify-center gap-3">
                <MapPin className="w-4 h-4" />
                <span>{selectedEvent.location}</span>
              </div>
              <div className="flex items-center justify-center gap-3">
                <Calendar className="w-4 h-4" />
                <span>{selectedEvent.date} • {selectedEvent.time}</span>
              </div>
              <div className="flex items-center justify-center gap-3">
                <WeatherIcon className="w-4 h-4" />
                <span>{selectedEvent.weather.temp}° {selectedEvent.weather.condition}</span>
              </div>
              <div className="flex items-center justify-center gap-3">
                <Users className="w-4 h-4" />
                <span>Created by {selectedEvent.organizer}</span>
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
                  <span className="font-light">{attendee.name}</span>
                  <span className="text-sm text-gray-400 font-light">{attendee.arrivalTime}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Join/Leave section */}
          {!isAttending ? (
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
                
                <button 
                  onClick={() => handleAttendGame(selectedEvent.id, arrivalTime)}
                  disabled={!arrivalTime}
                  className="w-full py-6 bg-transparent border border-gray-800 hover:border-orange-400 text-white font-light text-lg tracking-widest transition-all duration-700 hover:bg-orange-400/5 disabled:opacity-30 disabled:cursor-not-allowed group"
                >
                  <span className="group-hover:tracking-[0.4em] transition-all duration-500">JOIN</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="w-24 h-px bg-gradient-to-r from-transparent via-red-400 to-transparent mx-auto"></div>
              
              <button 
                onClick={() => handleLeaveGame(selectedEvent.id)}
                className="w-full py-6 bg-transparent border border-red-800 hover:border-red-400 text-white font-light text-lg tracking-widest transition-all duration-700 hover:bg-red-400/5 group"
              >
                <span className="group-hover:tracking-[0.4em] transition-all duration-500">LEAVE</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Ultra-minimal main dashboard
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-md mx-auto px-8 py-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-20">
          <div>
            <h1 className="text-2xl font-thin tracking-[-0.02em] mb-1">
              <span className="bg-gradient-to-r from-orange-200 to-orange-400 bg-clip-text text-transparent">
                BURLINGTON BALLERS
              </span>
            </h1>
            <p className="text-xs font-light text-gray-500 tracking-widest">Hello, {userName}</p>
          </div>
          <button 
            onClick={() => setCurrentView('create')}
            className="text-gray-400 hover:text-orange-400 transition-all duration-500 text-sm font-light tracking-wide"
          >
            + NEW
          </button>
        </div>

        {/* Games */}
        <div className="space-y-12">
          {games.map((game, index) => {
            const WeatherIcon = game.weather.icon;
            return (
              <div 
                key={game.id}
                onClick={() => setSelectedEvent(game)}
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
          })}
        </div>

        {/* Footer */}
        <div className="text-center mt-20">
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent mx-auto mb-4"></div>
          <p className="text-xs font-thin text-gray-600 tracking-[0.3em]">LEGENDS</p>
        </div>
      </div>
    </div>
  );
};

export default BasketballScheduler;