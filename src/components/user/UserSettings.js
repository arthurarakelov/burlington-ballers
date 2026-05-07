import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';

const Toggle = ({ checked, onChange }) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input type="checkbox" checked={checked} onChange={onChange} className="sr-only peer" />
    <div className="bb-toggle-track peer"></div>
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
    <div className={hideHeader ? "" : "bb-app-root min-h-screen text-white"}>
      <div className={hideHeader ? "" : "max-w-lg mx-auto px-4 sm:px-6 py-12"}>
        <div className="mx-auto max-w-2xl space-y-4">
          <div>
            <p className="bb-kicker">Account</p>
            <h2 className="text-2xl font-black text-white">Settings</h2>
          </div>

          {/* Profile */}
          <div className="bb-panel">
            <div className="flex items-center gap-4 mb-4">
              {user?.photo ? (
                <img src={user.photo} alt="Profile" className="w-12 h-12 rounded-lg object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-white/10" />
              )}
              <div>
                <p className="text-sm text-white/60">Signed in with Google</p>
                <p className="text-xs text-white/30">{user?.email}</p>
              </div>
            </div>
            <div>
              <label className="bb-field-label">Display Name</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your display name"
                className="bb-input"
                maxLength={20}
              />
              <p className="text-xs text-white/20 mt-2">Visible to other players</p>
            </div>
          </div>

          {/* Email Notifications */}
          <div className="bb-panel py-2">
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

          <div className="rounded-lg border border-white/10 bg-white/[0.04] px-5 py-1">
            <p className="text-xs text-white/30 py-3">Notifications sent to {user?.email}</p>
          </div>

          {/* Wes Mode */}
          <div className="bb-panel py-2">
            <SettingRow label="Wes Mode">
              <Toggle checked={wesMode} onChange={(e) => setWesMode(e.target.checked)} />
            </SettingRow>
          </div>

          {error && (
            <div className="rounded-lg border border-rose-400/20 bg-rose-500/10 px-4 py-3">
              <p className="text-rose-200 text-sm">{error}</p>
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
