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
    <div className={hideHeader ? "" : "bb-app-root min-h-screen text-white"}>
      <div className={hideHeader ? "" : "max-w-lg mx-auto px-4 sm:px-6 py-12"}>
        <div className="mx-auto max-w-2xl space-y-5">
          <div className="bb-panel space-y-5">
            <div>
              <p className="bb-kicker">New run</p>
              <h2 className="text-2xl font-black text-white">Create Game</h2>
            </div>
            <div>
              <label className="bb-field-label">Location</label>
              <select
                value={newGame.location}
                onChange={(e) => setNewGame({...newGame, location: e.target.value})}
                className="bb-select"
              >
                <option value="" className="bg-[#182621]">Select location</option>
                {LOCATIONS.map(loc => (
                  <option key={loc.value} value={loc.value} className="bg-[#182621]">{loc.value}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="bb-field-label">Date</label>
                <input
                  type="date"
                  value={newGame.date}
                  onChange={handleDateChange}
                  min={getTodayDate()}
                  max={getMaxDate()}
                  className="bb-input"
                />
              </div>
              <div>
                <label className="bb-field-label">Time</label>
                <input
                  type="time"
                  value={newGame.time}
                  onChange={(e) => setNewGame({...newGame, time: e.target.value})}
                  className="bb-input"
                />
              </div>
            </div>

            {dateError && (
              <p className="rounded-lg border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-center text-rose-200 text-sm">{dateError}</p>
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
