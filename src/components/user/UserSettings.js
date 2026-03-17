import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';

const Toggle = ({ checked, onChange }) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
    <div className="w-[51px] h-[31px] bg-white/10 rounded-full peer peer-checked:bg-orange-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-[27px] after:w-[27px] after:transition-all peer-checked:after:translate-x-5"></div>
  </label>
);

const SettingRow = ({ label, description, children }) => (
  <div className="flex items-center justify-between py-3">
    <div className="flex-1 mr-4">
      <h3 className="text-[15px] text-white/80">{label}</h3>
      {description && <p className="text-xs text-white/30 mt-0.5">{description}</p>}
    </div>
    {children}
  </div>
);

const UserSettings = ({ user, onBack, onUpdateSettings, hideHeader }) => {
  const [username, setUsername] = useState(user?.username || user?.name || '');
  const [emailPreferences, setEmailPreferences] = useState({
    rsvpReminders: user?.emailPreferences?.rsvpReminders ?? false,
    gameChangeNotifications: user?.emailPreferences?.gameChangeNotifications ?? false
  });
  const [wesMode, setWesMode] = useState(user?.wesMode ?? false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    if (user?.emailPreferences) {
      setEmailPreferences({
        rsvpReminders: user.emailPreferences.rsvpReminders ?? false,
        gameChangeNotifications: user.emailPreferences.gameChangeNotifications ?? false
      });
    }
    if (user?.wesMode !== undefined) setWesMode(user.wesMode);
  }, [user?.emailPreferences, user?.wesMode]);

  const handleSaveSettings = async () => {
    const trimmed = username.trim();
    if (!trimmed) { setError('Username is required'); return; }
    if (trimmed.length < 2) { setError('Username must be at least 2 characters'); return; }
    if (trimmed.length > 20) { setError('Username must be 20 characters or less'); return; }
    if (!/^[a-zA-Z0-9\s\-_]+$/.test(trimmed)) {
      setError('Letters, numbers, spaces, hyphens, and underscores only');
      return;
    }

    setError('');
    setIsLoading(true);
    try {
      await onUpdateSettings({ username: trimmed, emailPreferences, wesMode });
    } catch (err) {
      setError('Failed to update settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={hideHeader ? "" : "min-h-screen bg-[#09090b] text-white"}>
      <div className={hideHeader ? "" : "max-w-lg mx-auto px-4 sm:px-6 py-12"}>
        <div className="space-y-4 pt-4">

          {/* Profile */}
          <div className="bg-white/[0.05] rounded-2xl px-5 py-4">
            <div className="flex items-center gap-4 mb-4">
              {user?.photo ? (
                <img src={user.photo} alt="Profile" className="w-12 h-12 rounded-full" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-white/10" />
              )}
              <div>
                <p className="text-sm text-white/60">Signed in with Google</p>
                <p className="text-xs text-white/30">{user?.email}</p>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-white/40 mb-2 uppercase tracking-wider">Display Name</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your display name"
                className="w-full bg-white/[0.07] rounded-xl px-4 py-3 text-white placeholder-white/30 outline-none focus:ring-2 focus:ring-orange-500/40 transition-all"
                maxLength={20}
              />
              <p className="text-xs text-white/20 mt-2">Visible to other players</p>
            </div>
          </div>

          {/* Email Notifications */}
          <div className="bg-white/[0.05] rounded-2xl px-5 py-2">
            <SettingRow label="RSVP Reminders" description="Remind me about games I haven't responded to">
              <Toggle
                checked={emailPreferences.rsvpReminders}
                onChange={(e) => setEmailPreferences(prev => ({ ...prev, rsvpReminders: e.target.checked }))}
              />
            </SettingRow>
            <div className="h-px bg-white/[0.06]" />
            <SettingRow label="Game Changes" description="When games I've RSVPd to change">
              <Toggle
                checked={emailPreferences.gameChangeNotifications}
                onChange={(e) => setEmailPreferences(prev => ({ ...prev, gameChangeNotifications: e.target.checked }))}
              />
            </SettingRow>
          </div>

          <div className="bg-white/[0.04] rounded-2xl px-5 py-1">
            <p className="text-xs text-white/30 py-3">Notifications sent to {user?.email}</p>
          </div>

          {/* Wes Mode */}
          <div className="bg-white/[0.05] rounded-2xl px-5 py-2">
            <SettingRow label="Wes Mode">
              <Toggle checked={wesMode} onChange={(e) => setWesMode(e.target.checked)} />
            </SettingRow>
          </div>

          {error && (
            <div className="bg-rose-500/10 rounded-xl px-4 py-3">
              <p className="text-rose-400 text-sm">{error}</p>
            </div>
          )}

          <Button onClick={handleSaveSettings} loading={isLoading} className="w-full" size="lg">
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;
