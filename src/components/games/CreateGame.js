import React, { useState, useEffect } from 'react';
import { LOCATIONS } from '../../constants/locations';
import { getNextSaturday, getTodayDate, getMaxDate, isValidGameDate, convertTo12Hour } from '../../utils/dateUtils';
import { weatherService } from '../../services/weatherService';
import Button from '../ui/Button';

const CreateGame = ({ onBack, onCreateGame, hideHeader }) => {
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

    if (!isValidGameDate(newGame.date)) {
      setDateError('Date must be today or future, within 90 days');
      return;
    }

    setCreating(true);
    setDateError('');

    try {
      const selectedLocation = LOCATIONS.find(loc => loc.value === newGame.location);

      let weather;
      try {
        weather = await weatherService.getWeatherData(newGame.date, newGame.time);
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

      await onCreateGame(gameData);
      setNewGame({ location: '', date: '', time: '11:00' });
      setDateError('');
    } catch (error) {
      console.error('Error creating game:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    setNewGame({...newGame, date: selectedDate});

    if (dateError) {
      setDateError('');
    }

    if (selectedDate && !isValidGameDate(selectedDate)) {
      setDateError('Date must be today or future, within 90 days');
    }
  };

  return (
    <div className={hideHeader ? "" : "min-h-screen bg-black text-white relative overflow-hidden"}>
      <div className="relative z-10">
        <div className={hideHeader ? "" : "max-w-lg mx-auto px-4 sm:px-6 py-12"}>

        <div className="space-y-8">
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

          <div className="grid grid-cols-2 gap-4">
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
              className="w-full bg-gray-900 border border-gray-700 focus:border-blue-400 outline-none px-4 py-3 text-lg font-light text-white rounded-lg transition-all duration-300"
            />
          </div>

          {dateError && (
            <div className="text-center text-red-400 text-sm font-light">
              {dateError}
            </div>
          )}

          <Button
            onClick={handleCreateGame}
            disabled={!newGame.location || !newGame.date || !newGame.time || dateError}
            loading={creating}
            size="lg"
            className="w-full mt-8"
          >
            Create Game
          </Button>
        </div>
      </div>
    </div>
    </div>
  );
};

export default CreateGame;
