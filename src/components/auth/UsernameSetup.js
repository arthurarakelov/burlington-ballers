import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import Button from '../ui/Button';

const Toggle = ({ checked, onChange }) => (
  <label className="relative inline-flex cursor-pointer items-center">
    <input type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
    <div className="bb-toggle-track" />
  </label>
);

const PreferenceRow = ({ title, description, checked, onChange }) => (
  <div className="flex items-center justify-between gap-4 py-3">
    <div>
      <h4 className="text-sm font-semibold text-white/82">{title}</h4>
      <p className="mt-0.5 text-xs text-white/42">{description}</p>
    </div>
    <Toggle checked={checked} onChange={onChange} />
  </div>
);

const UsernameSetup = ({ user, onUsernameSet, loading }) => {
  const [username, setUsername] = useState('');
  const [emailPreferences, setEmailPreferences] = useState({
    rsvpReminders: false,
    attendanceReminders: false,
    gameChangeNotifications: false
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

    if (!/^[a-zA-Z0-9\s\-_]+$/.test(username.trim())) {
      setError('Username can only contain letters, numbers, spaces, hyphens, and underscores');
      return;
    }

    setError('');
    onUsernameSet(username.trim(), emailPreferences);
  };

  return (
    <div className="bb-app-root min-h-screen text-white">
      <div className="bb-court-lines" />

      <main className="bb-shell relative z-10 flex min-h-screen items-center py-10 safe-top safe-bottom">
        <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[0.8fr_1fr] lg:items-center">
          <section>
            <div className="bb-brand-mark mb-5 h-16 w-16">
              <img src="/ballers-logo.svg" alt="" className="h-12 w-12" />
            </div>
            <p className="bb-kicker">First run setup</p>
            <h1 className="mb-4 text-4xl font-black leading-none text-white sm:text-5xl">
              Welcome to Burlington Ballers
            </h1>
            <p className="max-w-md text-lg leading-7 text-white/62">
              Pick the name players will see on RSVPs, arrivals, and team chat.
            </p>
          </section>

          <section className="bb-panel">
            <div className="mb-6 flex items-center gap-4">
              {user?.photo ? (
                <img
                  src={user.photo}
                  alt="Profile"
                  className="h-14 w-14 rounded-lg object-cover"
                />
              ) : (
                <div className="h-14 w-14 rounded-lg bg-white/10" />
              )}
              <div className="min-w-0">
                <p className="text-sm text-white/55">Signed in as</p>
                <p className="truncate text-sm font-semibold text-white/85">{user?.email}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="bb-field-label">Display Name</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="bb-input"
                  maxLength={20}
                  disabled={loading}
                />
                <p className="mt-2 text-xs text-white/30">Visible to other players</p>
              </div>

              {error && (
                <p className="rounded-lg border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p>
              )}

              <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                <div className="mb-4 flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-teal-400/12">
                    <Mail className="h-4 w-4 text-teal-200" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white">Email Notifications</h3>
                    <p className="text-xs text-white/38">You can change these later in settings.</p>
                  </div>
                </div>

                <div className="divide-y divide-white/[0.07]">
                  <PreferenceRow
                    title="RSVP Reminders"
                    description="Remind me about games I haven't responded to"
                    checked={emailPreferences.rsvpReminders}
                    onChange={(e) => setEmailPreferences(prev => ({
                      ...prev,
                      rsvpReminders: e.target.checked
                    }))}
                  />
                  <PreferenceRow
                    title="Attendance Reminders"
                    description="24hr reminders for games I'm attending"
                    checked={emailPreferences.attendanceReminders}
                    onChange={(e) => setEmailPreferences(prev => ({
                      ...prev,
                      attendanceReminders: e.target.checked
                    }))}
                  />
                  <PreferenceRow
                    title="Game Change Notifications"
                    description="When games I've RSVPd to change"
                    checked={emailPreferences.gameChangeNotifications}
                    onChange={(e) => setEmailPreferences(prev => ({
                      ...prev,
                      gameChangeNotifications: e.target.checked
                    }))}
                  />
                </div>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!username.trim()}
                loading={loading}
                className="w-full"
                size="lg"
              >
                Continue
              </Button>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
};

export default UsernameSetup;
