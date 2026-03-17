import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, Calendar, Users, CloudSun } from 'lucide-react';
import { convertTo24Hour, convertTo12Hour, formatDateWithDay } from '../../utils/dateUtils';
import { LOCATIONS } from '../../constants/locations';
import Button from '../ui/Button';
import TimePicker from '../ui/TimePicker';
import AnimatedCounter from '../ui/AnimatedCounter';
import AnimatedWeatherIcon from '../ui/AnimatedWeatherIcon';

const SectionLabel = ({ color, children }) => (
  <div className="flex items-center gap-2 mb-3">
    <div className={`w-2 h-2 rounded-full ${color}`}></div>
    <h4 className="text-sm font-semibold text-white/70 uppercase tracking-wide">{children}</h4>
  </div>
);

const PlayerRow = ({ photo, name, detail, muted }) => (
  <div className="flex items-center justify-between py-3">
    <div className="flex items-center gap-3">
      {photo ? (
        <img src={photo} alt={name} className={`w-8 h-8 rounded-full ${muted ? 'opacity-50' : ''}`} />
      ) : (
        <div className={`w-8 h-8 rounded-full bg-white/10 ${muted ? 'opacity-50' : ''}`} />
      )}
      <span className={`text-[15px] ${muted ? 'text-white/30' : 'text-white/80'}`}>{name}</span>
    </div>
    {detail && <span className="text-sm text-white/40">{detail}</span>}
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
      {prompt && <p className="text-center text-sm text-white/40">{prompt}</p>}
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

  return (
    <div className={hideHeader ? "" : "min-h-screen bg-[#09090b] text-white"}>
      <div className={hideHeader ? "" : "max-w-lg mx-auto px-4 sm:px-6 py-12"}>

        {/* Game info header */}
        <div className="text-center mb-6 pt-2">
          <h3 className="text-2xl sm:text-[28px] font-bold text-white mb-4 leading-tight">{game.title}</h3>

          {isEditingGame ? (
            <div className="bg-white/[0.05] rounded-2xl p-5 space-y-4 text-left">
              <p className="text-sm font-semibold text-white/60 text-center">Edit Game</p>
              <div>
                <label className="block text-xs font-medium text-white/40 mb-2 uppercase tracking-wider">Location</label>
                <select value={editLocation} onChange={e => setEditLocation(e.target.value)}
                  className="w-full bg-white/[0.07] rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-orange-500/40 transition-all">
                  <option value="" className="bg-[#18181b]">Select location</option>
                  {LOCATIONS.map(l => <option key={l.value} value={l.value} className="bg-[#18181b]">{l.value}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-white/40 mb-2 uppercase tracking-wider">Time</label>
                <input type="time" value={editTime} onChange={e => setEditTime(e.target.value)}
                  className="w-full bg-white/[0.07] rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-orange-500/40 transition-all" />
              </div>
              <div className="flex gap-2.5 pt-2">
                <Button onClick={() => { setIsEditingGame(false); setEditLocation(''); setEditTime(''); }} variant="secondary" className="flex-1">Cancel</Button>
                <Button onClick={handleSaveGame} disabled={!editLocation || !editTime} loading={loadingStates.saving} className="flex-1">Save</Button>
              </div>
              <Button onClick={handleDeleteGame} variant="danger" loading={loadingStates.deleting} className="w-full">Delete Game</Button>
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="flex items-center justify-center gap-2 text-white/50">
                <MapPin className="w-4 h-4 text-white/30" />
                <span className="text-[15px]">{game.location}</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-white/50">
                <Calendar className="w-4 h-4 text-white/30" />
                <span className="text-[15px]">{formatDateWithDay(game.date)} · {game.time}</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-white/50">
                <AnimatedWeatherIcon iconName={game.weather.icon} className="w-4 h-4" />
                <span className="text-[15px]">{game.weather.temp}° {game.weather.condition}</span>
              </div>
              <p className="text-xs text-white/30 pt-1">by {game.organizerName || game.organizer}</p>
            </div>
          )}
        </div>

        {/* RSVP Lists */}
        <div className="space-y-5 mb-8">
          {attending.length > 0 && (
            <div className="bg-white/[0.04] rounded-2xl px-4 py-3">
              <SectionLabel color="bg-emerald-400">Attending · <AnimatedCounter value={attending.length} /></SectionLabel>
              <div className="divide-y divide-white/[0.06]">
                {attending.map((a, i) => (
                  <PlayerRow key={i} photo={a.userPhoto} name={a.userName || a.name} detail={a.arrivalTime} />
                ))}
              </div>
            </div>
          )}

          {maybe.length > 0 && (
            <div className="bg-white/[0.04] rounded-2xl px-4 py-3">
              <SectionLabel color="bg-amber-400">Maybe · <AnimatedCounter value={maybe.length} /></SectionLabel>
              <div className="divide-y divide-white/[0.06]">
                {maybe.map((m, i) => <PlayerRow key={i} photo={m.userPhoto} name={m.userName} />)}
              </div>
            </div>
          )}

          {declined.length > 0 && (
            <div className="bg-white/[0.04] rounded-2xl px-4 py-3">
              <SectionLabel color="bg-rose-400">Can't Make It · <AnimatedCounter value={declined.length} /></SectionLabel>
              <div className="divide-y divide-white/[0.06]">
                {declined.map((d, i) => <PlayerRow key={i} photo={d.userPhoto} name={d.userName} muted />)}
              </div>
            </div>
          )}

          {haventResponded.length > 0 && (
            <div className="bg-white/[0.03] rounded-2xl px-4 py-3">
              <SectionLabel color="bg-white/30">No Response · <AnimatedCounter value={haventResponded.length} /></SectionLabel>
              <div className="divide-y divide-white/[0.06]">
                {haventResponded.map((u, i) => {
                  const name = u.username || u.googleName || u.name || 'Unknown';
                  return <PlayerRow key={i} photo={u.photoURL || u.photo} name={name} muted />;
                })}
              </div>
            </div>
          )}
        </div>

        {/* RSVP Actions */}
        <div className="bg-white/[0.05] rounded-2xl p-5">
          {hasntResponded ? (
            <div className="space-y-4">
              <p className="text-center text-sm font-semibold text-white/60">When will you arrive?</p>
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
                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                <p className="text-sm font-semibold text-emerald-400">You're attending</p>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <Button onClick={handleMaybeGame} variant="secondary" loading={loadingStates.maybe}>Change to Maybe</Button>
                <Button onClick={handleDeclineGame} variant="secondary" loading={loadingStates.declining}>Can't make it</Button>
              </div>
              {isOrganizer && <Button onClick={handleEditGame} variant="secondary" className="w-full">Edit Game</Button>}
            </div>
          ) : hasMaybe ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                <p className="text-sm font-semibold text-amber-400">You might attend</p>
              </div>
              {renderTimePicker('Ready to commit?', (
                <Button onClick={handleDeclineGame} variant="secondary" loading={loadingStates.declining} className="w-full">Can't make it</Button>
              ))}
            </div>
          ) : hasDeclined ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-rose-400"></div>
                <p className="text-sm font-semibold text-rose-400">You've declined</p>
              </div>
              {renderTimePicker('Change your mind?', (
                <Button onClick={handleMaybeGame} variant="secondary" loading={loadingStates.maybe} className="w-full">Maybe</Button>
              ))}
            </div>
          ) : null}
        </div>

      </div>
    </div>
  );
};

export default GameDetails;
