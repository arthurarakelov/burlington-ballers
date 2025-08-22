import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import FloatingOrbs from '../ui/FloatingOrbs';
import Button from '../ui/Button';
import { useMouseTracking } from '../../hooks/useMouseTracking';

const UsernameSetup = ({ user, onUsernameSet, loading }) => {
  const mousePosition = useMouseTracking();
  const [username, setUsername] = useState('');
  const [emailPreferences, setEmailPreferences] = useState({
    rsvpReminders: false,     // Remind about games they haven't responded to
    attendanceReminders: false, // 24hr reminders for games they're attending
    gameChangeNotifications: false // Updates to games they've RSVPd to
  });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }
    
    if (username.trim().length < 2) {
      setError('Username must be at least 2 characters');
      return;
    }
    
    if (username.trim().length > 20) {
      setError('Username must be 20 characters or less');
      return;
    }
    
    // Basic validation for inappropriate characters
    if (!/^[a-zA-Z0-9\s\-_]+$/.test(username.trim())) {
      setError('Username can only contain letters, numbers, spaces, hyphens, and underscores');
      return;
    }
    
    setError('');
    onUsernameSet(username.trim(), emailPreferences);
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
            </div>
          </div>
          
          {/* Username setup */}
          <div className="text-center mb-16">
            <div className="mb-8">
              {user?.photo && (
                <img 
                  src={user.photo} 
                  alt="Profile" 
                  className="w-16 h-16 rounded-full mx-auto mb-4"
                />
              )}
              <h2 className="text-2xl font-light mb-2">Welcome!</h2>
              <p className="text-sm text-gray-400 mb-8">
                Choose a username that other players will see
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full bg-transparent border-0 border-b border-gray-800 focus:border-orange-400 outline-none py-4 text-lg font-light text-gray-300 text-center transition-all duration-500 placeholder:text-gray-600"
                  maxLength={20}
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-2">
                  This will be visible to other players
                </p>
              </div>
              
              {error && (
                <p className="text-red-400 text-sm font-light">{error}</p>
              )}
            </form>
            
            {/* Email Preferences Section */}
            <div className="mt-8 pt-8 border-t border-gray-800">
              <div className="flex items-center gap-3 mb-6">
                <Mail className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-medium text-white">Email Notifications</h3>
              </div>
              
              <p className="text-sm text-gray-400 mb-6">
                Email notifications are off by default. Turn on any you'd like to receive - you can change these anytime in settings.
              </p>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <h4 className="text-sm font-medium text-gray-200">RSVP Reminders</h4>
                    <p className="text-xs text-gray-500">Remind me about games I haven't responded to</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailPreferences.rsvpReminders}
                      onChange={(e) => setEmailPreferences(prev => ({
                        ...prev,
                        rsvpReminders: e.target.checked
                      }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <h4 className="text-sm font-medium text-gray-200">Attendance Reminders</h4>
                    <p className="text-xs text-gray-500">24hr reminders for games I'm attending</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailPreferences.attendanceReminders}
                      onChange={(e) => setEmailPreferences(prev => ({
                        ...prev,
                        attendanceReminders: e.target.checked
                      }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <h4 className="text-sm font-medium text-gray-200">Game Change Notifications</h4>
                    <p className="text-xs text-gray-500">When games I've RSVPd to change (time/location)</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailPreferences.gameChangeNotifications}
                      onChange={(e) => setEmailPreferences(prev => ({
                        ...prev,
                        gameChangeNotifications: e.target.checked
                      }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <Button 
                onClick={handleSubmit}
                disabled={!username.trim()}
                loading={loading}
                className="w-full"
              >
                Continue
              </Button>
            </div>
            
            <p className="text-xs text-gray-600 mt-6">
              You can change this later in your profile
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsernameSetup;