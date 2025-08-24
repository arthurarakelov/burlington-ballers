import React, { useState, useEffect } from 'react';
import { User, Mail, Bell, Save, ArrowLeft } from 'lucide-react';
import FloatingOrbs from '../ui/FloatingOrbs';
import Button from '../ui/Button';
import { useMouseTracking } from '../../hooks/useMouseTracking';

const UserSettings = ({ user, onBack, onUpdateSettings, hideHeader }) => {
  const mousePosition = useMouseTracking();
  const [username, setUsername] = useState(user?.username || user?.name || '');
  const [emailPreferences, setEmailPreferences] = useState({
    rsvpReminders: user?.emailPreferences?.rsvpReminders ?? false,
    attendanceReminders: user?.emailPreferences?.attendanceReminders ?? false,
    gameChangeNotifications: user?.emailPreferences?.gameChangeNotifications ?? false
  });
  const [wesMode, setWesMode] = useState(user?.wesMode ?? false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Update preferences when user data changes
  useEffect(() => {
    if (user?.emailPreferences) {
      setEmailPreferences({
        rsvpReminders: user.emailPreferences.rsvpReminders ?? false,
        attendanceReminders: user.emailPreferences.attendanceReminders ?? false,
        gameChangeNotifications: user.emailPreferences.gameChangeNotifications ?? false
      });
    }
    if (user?.wesMode !== undefined) {
      setWesMode(user.wesMode);
    }
  }, [user?.emailPreferences, user?.wesMode]);

  const handleSaveSettings = async () => {
    if (!username.trim()) {
      setError('Username is required');
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

    if (!/^[a-zA-Z0-9\s\-_]+$/.test(username.trim())) {
      setError('Username can only contain letters, numbers, spaces, hyphens, and underscores');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await onUpdateSettings({
        username: username.trim(),
        emailPreferences,
        wesMode
      });
    } catch (err) {
      setError('Failed to update settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
                  Settings
                </h1>
                <p className="text-xs text-gray-400">{user?.email}</p>
              </div>
              <Button onClick={onBack} variant="secondary" size="sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </div>
          )}

          <div className="space-y-8 pt-8">
            {/* Email Notifications Section - moved to top */}
            <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <Mail className="w-5 h-5 text-green-400" />
                <h2 className="text-lg font-medium text-white">Email Notifications</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3">
                  <div>
                    <h3 className="text-sm font-medium text-gray-200">RSVP Reminders</h3>
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

                <div className="flex items-center justify-between py-3">
                  <div>
                    <h3 className="text-sm font-medium text-gray-200">Attendance Reminders</h3>
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

                <div className="flex items-center justify-between py-3">
                  <div>
                    <h3 className="text-sm font-medium text-gray-200">Game Change Notifications</h3>
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

              <div className="mt-6 p-4 bg-blue-900/20 border border-blue-800/50 rounded-lg">
                <div className="flex items-start gap-3">
                  <Bell className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-blue-300 font-medium">Email notifications use your Google email</p>
                    <p className="text-xs text-blue-400/80 mt-1">
                      We'll send notifications to {user?.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Section - moved to bottom */}
            <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <User className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-medium text-white">Profile</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 mb-4">
                  {user?.photo && (
                    <img 
                      src={user.photo} 
                      alt="Profile" 
                      className="w-12 h-12 rounded-full border-2 border-gray-700"
                    />
                  )}
                  <div>
                    <p className="text-sm text-gray-400">Signed in with Google</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-3">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your display name"
                    className="w-full bg-gray-800/50 border border-gray-700 focus:border-blue-400 outline-none px-4 py-3 text-white rounded-lg transition-all duration-300"
                    maxLength={20}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    This name will be visible to other players
                  </p>
                </div>
              </div>
            </div>

            {/* Wes Mode Section */}
            <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between py-3">
                <div>
                  <h3 className="text-sm font-medium text-gray-200">Wes Mode</h3>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={wesMode}
                    onChange={(e) => setWesMode(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Save button */}
            <Button
              onClick={handleSaveSettings}
              loading={isLoading}
              className="w-full"
              size="lg"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;