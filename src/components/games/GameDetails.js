import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { convertTo24Hour, convertTo12Hour, formatDateWithDay } from '../../utils/dateUtils';
import { LOCATIONS } from '../../constants/locations';
import Button from '../ui/Button';
import TimePicker from '../ui/TimePicker';
import AnimatedCounter from '../ui/AnimatedCounter';
import AnimatedWeatherIcon from '../ui/AnimatedWeatherIcon';

const SectionLabel = ({ color, children }) => (
  <div className="mb-2 flex items-center justify-between gap-3">
    <div className="flex items-center gap-2">
      <div className={`h-2 w-2 rounded-full ${color}`} />
      <h4 className="text-sm font-extrabold text-white/75">{children}</h4>
    </div>
  </div>
);

const PlayerRow = ({ photo, name, detail, muted }) => (
  <div className="bb-player-row">
    <div className="flex min-w-0 items-center gap-3">
      {photo ? (
        <img src={photo} alt={name} className={`bb-player-avatar ${muted ? 'opacity-50' : ''}`} />
      ) : (
        <div className={`bb-player-avatar ${muted ? 'opacity-50' : ''}`} />
      )}
      <span className={`truncate text-[15px] ${muted ? 'text-white/34' : 'text-white/84'}`}>{name}</span>
    </div>
    {detail && <span className="flex-shrink-0 text-sm text-white/45">{detail}</span>}
  </div>
);

const GameDetails = ({ game, user, onBack, onJoinGame, onLeaveGame, onDeclineGame, onMaybeGame, onDeleteGame, onEditLocation, onEditTime, editTrigger, hideHeader }) => {
  const [arrivalTime, setArrivalTime] = useState('');
  const [isEditingGame, setIsEditingGame] = useState(false);
  const [editLocation, setEditLocation] = useState('');
  const [editTime, setEditTime] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [loadingStates, setLoadingStates] = useState({
    joining: false, leaving: false, declining: false,
    maybe: false, deleting: false, saving: false
  });

  const rsvps = game.rsvps || [];
  const attending = rsvps.filter(r => r.status === 'attending').sort((a, b) => {
    if (!a.arrivalTime || !b.arrivalTime) return 0;
    return new Date(`1970/01/01 ${a.arrivalTime}`) - new Date(`1970/01/01 ${b.arrivalTime}`);
  });
  const maybe = rsvps.filter(r => r.status === 'maybe').sort((a, b) => (a.userName || '').localeCompare(b.userName || ''));
  const declined = rsvps.filter(r => r.status === 'declined').sort((a, b) => (a.userName || '').localeCompare(b.userName || ''));

  const respondedUserIds = new Set(rsvps.map(r => r.userUid));
  const haventResponded = allUsers.filter(u => !respondedUserIds.has(u.uid)).sort((a, b) => {
    const nameA = a.username || a.googleName || a.name || '';
    const nameB = b.username || b.googleName || b.name || '';
    return nameA.localeCompare(nameB);
  });

  const userRSVP = rsvps.find(r => r.userUid === user?.uid);
  const userStatus = userRSVP?.status || 'no_response';
  const isAttending = userStatus === 'attending';
  const hasMaybe = userStatus === 'maybe';
  const hasDeclined = userStatus === 'declined';
  const hasntResponded = userStatus === 'no_response';
  const isOrganizer = game.organizerUid === user?.uid;

  useEffect(() => {
    let cancelled = false;
    const loadUsers = async () => {
      try {
        const { collection, getDocs } = await import('firebase/firestore');
        const { db } = await import('../../services/firebase');
        const snap = await getDocs(collection(db, 'users'));
        if (!cancelled) setAllUsers(snap.docs.map(d => ({ uid: d.id, ...d.data() })));
      } catch (e) { console.error('Error loading users:', e); }
    };
    loadUsers();
    return () => { cancelled = true; };
  }, []);

  const handleEditGame = useCallback(() => {
    setIsEditingGame(true);
    setEditLocation(LOCATIONS.find(l => l.address === game.location)?.value || '');
    setEditTime(convertTo24Hour(game.time));
  }, [game.location, game.time]);

  useEffect(() => { if (editTrigger > 0) handleEditGame(); }, [editTrigger, handleEditGame]);
  useEffect(() => { if (game) setArrivalTime(convertTo24Hour(game.time)); }, [game.id, game.time]); // eslint-disable-line

  const withLoading = (key, fn) => async () => {
    if (loadingStates[key]) return;
    setLoadingStates(p => ({ ...p, [key]: true }));
    try { await fn(); } finally { setLoadingStates(p => ({ ...p, [key]: false })); }
  };

  const handleJoinGame = withLoading('joining', () => arrivalTime && onJoinGame(game.id, arrivalTime));
  const handleDeclineGame = withLoading('declining', () => onDeclineGame(game.id));
  const handleMaybeGame = withLoading('maybe', () => onMaybeGame(game.id));
  const handleDeleteGame = withLoading('deleting', () => onDeleteGame(game.id));

  const handleSaveGame = async () => {
    if (!editLocation || !editTime || loadingStates.saving) return;
    setLoadingStates(p => ({ ...p, saving: true }));
    try {
      const loc = LOCATIONS.find(l => l.value === editLocation);
      if (loc && loc.address !== game.location) await onEditLocation(game.id, loc.value, loc.address);
      const t12 = convertTo12Hour(editTime);
      if (t12 !== game.time) await onEditTime(game.id, t12);
      setIsEditingGame(false);
    } catch (e) { console.error('Error saving:', e); }
    finally { setLoadingStates(p => ({ ...p, saving: false })); }
  };

  const renderTimePicker = (prompt, extraButtons) => (
    <div className="space-y-4">
      {prompt && <p className="text-center text-sm text-white/50">{prompt}</p>}
      <TimePicker value={arrivalTime} onChange={setArrivalTime} />
      <div className="space-y-2.5">
        <Button onClick={handleJoinGame} disabled={!arrivalTime} loading={loadingStates.joining} className="w-full">
          Join Game
        </Button>
        {extraButtons}
        {isOrganizer && (
          <Button onClick={handleEditGame} variant="secondary" className="w-full">Edit Game</Button>
        )}
      </div>
    </div>
  );

  const rosterSections = [
    {
      key: 'attending',
      color: 'bg-emerald-300',
      label: 'Attending',
      count: attending.length,
      rows: attending,
      render: (a, i) => <PlayerRow key={i} photo={a.userPhoto} name={a.userName || a.name} detail={a.arrivalTime} />
    },
    {
      key: 'maybe',
      color: 'bg-amber-300',
      label: 'Maybe',
      count: maybe.length,
      rows: maybe,
      render: (m, i) => <PlayerRow key={i} photo={m.userPhoto} name={m.userName} />
    },
    {
      key: 'declined',
      color: 'bg-rose-300',
      label: "Can't Make It",
      count: declined.length,
      rows: declined,
      render: (d, i) => <PlayerRow key={i} photo={d.userPhoto} name={d.userName} muted />
    },
    {
      key: 'open',
      color: 'bg-white/35',
      label: 'No Response',
      count: haventResponded.length,
      rows: haventResponded,
      render: (u, i) => {
        const name = u.username || u.googleName || u.name || 'Unknown';
        return <PlayerRow key={i} photo={u.photoURL || u.photo} name={name} muted />;
      }
    }
  ];

  return (
    <div className={hideHeader ? "" : "bb-app-root min-h-screen text-white"}>
      <div className={hideHeader ? "" : "max-w-lg mx-auto px-4 sm:px-6 py-12"}>
        <section className="bb-detail-hero">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="bb-kicker">Game plan</p>
              <h2 className="text-3xl font-black leading-tight text-white sm:text-4xl">{game.title}</h2>
              <p className="mt-2 text-sm text-white/45">Organized by {game.organizerName || game.organizer}</p>
            </div>
            <div className="bb-pill bb-pill-accent self-start">
              <AnimatedWeatherIcon iconName={game.weather?.icon || 'Sun'} className="h-4 w-4" />
              <span>{game.weather?.temp || '--'}° {game.weather?.condition || ''}</span>
            </div>
          </div>

          {isEditingGame ? (
            <div className="mt-5 space-y-4 rounded-lg border border-white/10 bg-black/18 p-4">
              <div>
                <label className="bb-field-label">Location</label>
                <select value={editLocation} onChange={e => setEditLocation(e.target.value)}
                  className="bb-select">
                  <option value="" className="bg-[#182621]">Select location</option>
                  {LOCATIONS.map(l => <option key={l.value} value={l.value} className="bg-[#182621]">{l.value}</option>)}
                </select>
              </div>
              <div>
                <label className="bb-field-label">Time</label>
                <input type="time" value={editTime} onChange={e => setEditTime(e.target.value)}
                  className="bb-input" />
              </div>
              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <Button onClick={() => { setIsEditingGame(false); setEditLocation(''); setEditTime(''); }} variant="secondary">Cancel</Button>
                <Button onClick={handleSaveGame} disabled={!editLocation || !editTime} loading={loadingStates.saving}>Save</Button>
              </div>
              <Button onClick={handleDeleteGame} variant="danger" loading={loadingStates.deleting} className="w-full">Delete Game</Button>
            </div>
          ) : (
            <div className="bb-detail-meta">
              <div className="bb-detail-meta-item">
                <MapPin className="h-4 w-4 text-orange-200" />
                <span className="truncate">{game.location}</span>
              </div>
              <div className="bb-detail-meta-item">
                <Calendar className="h-4 w-4 text-teal-200" />
                <span>{formatDateWithDay(game.date)}</span>
              </div>
              <div className="bb-detail-meta-item">
                <Clock className="h-4 w-4 text-amber-200" />
                <span>{game.time}</span>
              </div>
            </div>
          )}
        </section>

        <section className="bb-roster-grid">
          {rosterSections.filter(section => section.count > 0).map(section => (
            <div key={section.key} className="bb-roster-section">
              <SectionLabel color={section.color}>
                {section.label} · <AnimatedCounter value={section.count} />
              </SectionLabel>
              <div className="divide-y divide-white/[0.07]">
                {section.rows.map(section.render)}
              </div>
            </div>
          ))}
        </section>

        <section className="bb-action-panel">
          {hasntResponded ? (
            <div className="space-y-4">
              <p className="text-center text-sm font-semibold text-white/70">When will you arrive?</p>
              {renderTimePicker(null, (
                <div className="grid grid-cols-2 gap-2.5">
                  <Button onClick={handleMaybeGame} variant="secondary" loading={loadingStates.maybe}>Maybe</Button>
                  <Button onClick={handleDeclineGame} variant="secondary" loading={loadingStates.declining}>Can't make it</Button>
                </div>
              ))}
            </div>
          ) : isAttending ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-300" />
                <p className="text-sm font-semibold text-emerald-200">You're attending</p>
              </div>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <Button onClick={handleMaybeGame} variant="secondary" loading={loadingStates.maybe}>Change to Maybe</Button>
                <Button onClick={handleDeclineGame} variant="secondary" loading={loadingStates.declining}>Can't make it</Button>
              </div>
              <Button onClick={withLoading('leaving', () => onLeaveGame(game.id))} variant="secondary" loading={loadingStates.leaving} className="w-full">Leave Game</Button>
              {isOrganizer && <Button onClick={handleEditGame} variant="secondary" className="w-full">Edit Game</Button>}
            </div>
          ) : hasMaybe ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2">
                <div className="h-2 w-2 rounded-full bg-amber-300" />
                <p className="text-sm font-semibold text-amber-200">You might attend</p>
              </div>
              {renderTimePicker('Ready to commit?', (
                <Button onClick={handleDeclineGame} variant="secondary" loading={loadingStates.declining} className="w-full">Can't make it</Button>
              ))}
            </div>
          ) : hasDeclined ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2">
                <div className="h-2 w-2 rounded-full bg-rose-300" />
                <p className="text-sm font-semibold text-rose-200">You've declined</p>
              </div>
              {renderTimePicker('Change your mind?', (
                <Button onClick={handleMaybeGame} variant="secondary" loading={loadingStates.maybe} className="w-full">Maybe</Button>
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
};

export default GameDetails;
