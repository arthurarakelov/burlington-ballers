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
      setNewGame(prev => ({ ...prev, date: getNextSaturday(), time: '11:00' }));
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

      await onCreateGame({
        title: `${newGame.location} Game`,
        location: selectedLocation.address,
        address: selectedLocation.address,
        date: newGame.date,
        time: convertTo12Hour(newGame.time),
        weather
      });
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
    if (dateError) setDateError('');
    if (selectedDate && !isValidGameDate(selectedDate)) {
      setDateError('Date must be today or future, within 90 days');
    }
  };

  return (
    <div className={hideHeader ? "" : "min-h-screen bg-[#09090b] text-white"}>
      <div className={hideHeader ? "" : "max-w-lg mx-auto px-4 sm:px-6 py-12"}>
        <div className="space-y-5 pt-4">
          <div className="bg-white/[0.05] rounded-2xl p-5 space-y-5">
            <div>
              <label className="block text-xs font-medium text-white/40 mb-2 uppercase tracking-wider">Location</label>
              <select
                value={newGame.location}
                onChange={(e) => setNewGame({...newGame, location: e.target.value})}
                className="w-full bg-white/[0.07] rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-orange-500/40 transition-all"
              >
                <option value="" className="bg-[#18181b]">Select location</option>
                {LOCATIONS.map(loc => (
                  <option key={loc.value} value={loc.value} className="bg-[#18181b]">{loc.value}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-white/40 mb-2 uppercase tracking-wider">Date</label>
                <input
                  type="date"
                  value={newGame.date}
                  onChange={handleDateChange}
                  min={getTodayDate()}
                  max={getMaxDate()}
                  className="w-full bg-white/[0.07] rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-orange-500/40 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/40 mb-2 uppercase tracking-wider">Time</label>
                <input
                  type="time"
                  value={newGame.time}
                  onChange={(e) => setNewGame({...newGame, time: e.target.value})}
                  className="w-full bg-white/[0.07] rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-orange-500/40 transition-all"
                />
              </div>
            </div>

            {dateError && (
              <p className="text-center text-rose-400 text-sm">{dateError}</p>
            )}
          </div>

          <Button
            onClick={handleCreateGame}
            disabled={!newGame.location || !newGame.date || !newGame.time || !!dateError}
            loading={creating}
            size="lg"
            className="w-full"
          >
            Create Game
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateGame;
