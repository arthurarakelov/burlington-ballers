import React, { useState, useEffect } from 'react';
import { LOCATIONS } from '../../constants/locations';
import { getNextSaturday, getTodayDate, getMaxDate, isValidGameDate, formatDateWithDay, convertTo12Hour } from '../../utils/dateUtils';
import { weatherService } from '../../services/weatherService';

const CreateGame = ({ onBack, onCreateGame }) => {
  const [newGame, setNewGame] = useState({
    location: '',
    date: '',
    time: '11:00'
  });
  const [creating, setCreating] = useState(false);
  const [dateError, setDateError] = useState('');

  useEffect(() => {
    if (!newGame.date) {
      setNewGame(prev => ({
        ...prev,
        date: getNextSaturday(),
        time: '11:00'
      }));
    }
  }, [newGame.date]);

  const handleCreateGame = async () => {
    if (!newGame.location || !newGame.date || !newGame.time || creating) return;
    
    // Validate date
    if (!isValidGameDate(newGame.date)) {
      setDateError('Date must be today or future, within 90 days');
      return;
    }
    
    setCreating(true);
    setDateError('');
    
    try {
      const selectedLocation = LOCATIONS.find(loc => loc.value === newGame.location);
      
      // Fetch real weather data
      console.log('Fetching weather for', newGame.date, newGame.time);
      let weather;
      try {
        weather = await weatherService.getWeatherData(newGame.date, newGame.time);
        console.log('Weather data received:', weather);
      } catch (weatherError) {
        console.error('Weather service failed:', weatherError);
        weather = { temp: 75, condition: "TBD", icon: "Sun" };
      }
      
      const gameData = {
        title: `${newGame.location} Game`,
        location: selectedLocation.address,
        address: selectedLocation.address,
        date: newGame.date,
        time: convertTo12Hour(newGame.time),
        weather: weather
      };
      
      console.log('Submitting game data:', gameData);
      
      await onCreateGame(gameData);
      // Only reset form after successful creation
      setNewGame({ location: '', date: '', time: '11:00' });
      setDateError('');
    } catch (error) {
      console.error('Error in CreateGame component:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    setNewGame({...newGame, date: selectedDate});
    
    // Clear error when user changes date
    if (dateError) {
      setDateError('');
    }
    
    // Show immediate feedback
    if (selectedDate && !isValidGameDate(selectedDate)) {
      setDateError('Date must be today or future, within 90 days');
    }
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
            {LOCATIONS.map(loc => (
              <option key={loc.value} value={loc.value} className="bg-black text-white">
                {loc.value}
              </option>
            ))}
          </select>
          
          <div className="grid grid-cols-2 gap-8">
            <input
              type="date"
              value={newGame.date}
              onChange={handleDateChange}
              min={getTodayDate()}
              max={getMaxDate()}
              className="w-full bg-transparent border-0 border-b border-gray-800 focus:border-orange-400 outline-none py-4 text-lg font-light text-gray-300 transition-all duration-700"
            />
            <input
              type="time"
              value={newGame.time}
              onChange={(e) => setNewGame({...newGame, time: e.target.value})}
              className="w-full bg-transparent border-0 border-b border-gray-800 focus:border-orange-400 outline-none py-4 text-lg font-light text-gray-300 transition-all duration-700"
            />
          </div>

          {dateError && (
            <div className="text-center text-red-400 text-sm font-light">
              {dateError}
            </div>
          )}
          
          <button 
            onClick={handleCreateGame}
            disabled={!newGame.location || !newGame.date || !newGame.time || creating || dateError}
            className="w-full py-6 bg-transparent border border-gray-800 hover:border-orange-400 text-white font-light text-lg tracking-widest transition-all duration-700 hover:bg-orange-400/5 mt-16 group disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <span className="group-hover:tracking-[0.4em] transition-all duration-500">
              {creating ? 'CREATING...' : 'LAUNCH'}
            </span>
          </button>
          
          {/* Debug info */}
          <div className="mt-8 text-xs text-gray-600">
            <p>Location: {newGame.location || 'Not selected'}</p>
            <p>Date: {newGame.date ? formatDateWithDay(newGame.date) : 'Not set'}</p>
            <p>Time: {newGame.time || 'Not set'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateGame;