import { useState, useEffect } from 'react';
import { ArrowLeft, Settings, MessageCircle } from 'lucide-react';
import LoginScreen from './components/auth/LoginScreen';
import UsernameSetup from './components/auth/UsernameSetup';
import GameDashboard from './components/games/GameDashboard';
import GameDetails from './components/games/GameDetails';
import CreateGame from './components/games/CreateGame';
import UserSettings from './components/user/UserSettings';
import GameChat from './components/chat/GameChat';
import WesMode from './components/ui/WesMode';
import { ToastProvider, useToast } from './components/ui/Toast';
import { convertTo12Hour } from './utils/dateUtils';
import { useAuth } from './hooks/useAuth';
import { useMouseTracking } from './hooks/useMouseTracking';
import FloatingOrbs from './components/ui/FloatingOrbs';
import Button from './components/ui/Button';
import { gameService } from './services/gameService';
import { notificationScheduler } from './services/notificationScheduler';
import './App.css';

const BasketballSchedulerContent = () => {
  const { user, loading: authLoading, setUsername } = useAuth();
  const mousePosition = useMouseTracking();
  const toast = useToast();
  const [currentView, setCurrentView] = useState('games');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [games, setGames] = useState([]);
  const [gameEditTrigger, setGameEditTrigger] = useState(0);

  // Start notification scheduler when app loads
  useEffect(() => {
    notificationScheduler.start();
    return () => notificationScheduler.stop();
  }, []);

  // Subscribe to games (works for both authenticated and unauthenticated users)
  useEffect(() => {
    setLoading(true);
    setGames([]);

    const initializeGames = async () => {
      try {
        await gameService.deletePastGames();
        const { chatService } = await import('./services/chatService');
        await chatService.cleanupOldMessages();
      } catch (error) {
        console.error('Error cleaning up past games and old messages:', error);
      }

      const unsubscribe = gameService.subscribeToGames((gamesData) => {
        setGames(gamesData);
        setLoading(false);
      }, (error) => {
        console.error('Error loading games:', error);
        setLoading(false);
        setGames([]);
        if (user) toast.showError('Database connection error', error.message);
      });

      return unsubscribe;
    };

    const unsubscribePromise = initializeGames();

    return () => {
      unsubscribePromise.then(unsubscribe => {
        if (unsubscribe) unsubscribe();
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const sortByArrivalTime = (arr) =>
    [...arr].sort((a, b) => new Date(`1970/01/01 ${a.arrivalTime}`) - new Date(`1970/01/01 ${b.arrivalTime}`));

  const handleCreateGame = async (gameData) => {
    if (!user) return;

    try {
      await gameService.createGame(gameData, user);
      toast.showSuccess('Game created successfully!');
      transitionToView('games');
    } catch (error) {
      console.error('Error creating game:', error);
      toast.showError('Failed to create game', error.message);
    }
  };

  const handleAttendGame = async (gameId, arrivalTime) => {
    if (!user) return;

    const optimisticAttendee = {
      userUid: user.uid,
      userName: user.name,
      userPhoto: user.photo,
      arrivalTime: convertTo12Hour(arrivalTime)
    };

    setSelectedEvent(prev => ({
      ...prev,
      attendees: sortByArrivalTime([...(prev.attendees || []), optimisticAttendee]),
      declined: prev.declined?.filter(d => d.userUid !== user.uid) || []
    }));

    setGames(prev => prev.map(game =>
      game.id === gameId ? {
        ...game,
        attendees: sortByArrivalTime([...(game.attendees || []), optimisticAttendee]),
        declined: game.declined?.filter(d => d.userUid !== user.uid) || []
      } : game
    ));

    try {
      await gameService.createRSVP(gameId, user, 'attending', convertTo12Hour(arrivalTime));
      toast.showSuccess('You\'re now attending this game!');
      await refreshSelectedGame(gameId);
    } catch (error) {
      console.error('Error joining game:', error);
      toast.showError('Failed to join game', error.message);
      await refreshSelectedGame(gameId);
    }
  };

  const handleLeaveGame = async (gameId) => {
    if (!user) return;

    setSelectedEvent(prev => ({
      ...prev,
      attendees: prev.attendees?.filter(a => a.userUid !== user.uid) || [],
      declined: prev.declined?.filter(d => d.userUid !== user.uid) || []
    }));

    setGames(prev => prev.map(game =>
      game.id === gameId ? {
        ...game,
        attendees: game.attendees?.filter(a => a.userUid !== user.uid) || [],
        declined: game.declined?.filter(d => d.userUid !== user.uid) || []
      } : game
    ));

    try {
      await gameService.removeRSVP(gameId, user.uid);
      toast.showSuccess('You\'ve left the game');
      await refreshSelectedGame(gameId);
    } catch (error) {
      console.error('Error leaving game:', error);
      toast.showError('Failed to leave game', error.message);
      await refreshSelectedGame(gameId);
    }
  };

  const handleDeclineGame = async (gameId) => {
    if (!user) return;

    const optimisticDeclined = { userUid: user.uid, userName: user.name, userPhoto: user.photo };

    setSelectedEvent(prev => ({
      ...prev,
      attendees: prev.attendees?.filter(a => a.userUid !== user.uid) || [],
      declined: [...(prev.declined || []), optimisticDeclined]
    }));

    setGames(prev => prev.map(game =>
      game.id === gameId ? {
        ...game,
        attendees: game.attendees?.filter(a => a.userUid !== user.uid) || [],
        declined: [...(game.declined || []), optimisticDeclined]
      } : game
    ));

    try {
      await gameService.createRSVP(gameId, user, 'declined');
      toast.showSuccess('Marked as can\'t make it');
      await refreshSelectedGame(gameId);
    } catch (error) {
      console.error('Error declining game:', error);
      toast.showError('Failed to decline game', error.message);
      await refreshSelectedGame(gameId);
    }
  };

  const handleMaybeGame = async (gameId) => {
    if (!user) return;

    const optimisticMaybe = { userUid: user.uid, userName: user.name, userPhoto: user.photo };

    setSelectedEvent(prev => ({
      ...prev,
      attendees: prev.attendees?.filter(a => a.userUid !== user.uid) || [],
      declined: prev.declined?.filter(d => d.userUid !== user.uid) || [],
      maybe: [...(prev.maybe || []), optimisticMaybe]
    }));

    setGames(prev => prev.map(game =>
      game.id === gameId ? {
        ...game,
        attendees: game.attendees?.filter(a => a.userUid !== user.uid) || [],
        declined: game.declined?.filter(d => d.userUid !== user.uid) || [],
        maybe: [...(game.maybe || []), optimisticMaybe]
      } : game
    ));

    try {
      await gameService.createRSVP(gameId, user, 'maybe');
      toast.showSuccess('Marked as maybe');
      await refreshSelectedGame(gameId);
    } catch (error) {
      console.error('Error marking as maybe:', error);
      toast.showError('Failed to mark as maybe', error.message);
      await refreshSelectedGame(gameId);
    }
  };

  const handleDeleteGame = async (gameId) => {
    if (!user) return;

    if (!window.confirm('Are you sure you want to delete this game? This action cannot be undone.')) {
      return;
    }

    try {
      await gameService.deleteGame(gameId, user);
      toast.showSuccess('Game deleted successfully');
      transitionBack();
    } catch (error) {
      console.error('Error deleting game:', error);
      toast.showError('Failed to delete game', error.message);
    }
  };

  const handleEditGameLocation = async (gameId, newLocation, newAddress) => {
    if (!user) return;

    try {
      const oldGame = { ...selectedEvent };
      await gameService.updateGameLocation(gameId, user, newLocation, newAddress);
      await refreshSelectedGame(gameId);
      const changeDescription = `Location changed from "${oldGame.location}" to "${newLocation}"`;
      await notificationScheduler.sendGameChangeNotifications(gameId, oldGame, selectedEvent, changeDescription);
    } catch (error) {
      console.error('Error updating game location:', error);
      toast.showError('Failed to update location', error.message);
    }
  };

  const handleEditGameTime = async (gameId, newTime) => {
    if (!user) return;

    try {
      const oldGame = { ...selectedEvent };
      await gameService.updateGameTime(gameId, user, newTime);
      await refreshSelectedGame(gameId);
      const changeDescription = `Time changed from ${oldGame.time} to ${newTime}`;
      await notificationScheduler.sendGameChangeNotifications(gameId, oldGame, selectedEvent, changeDescription);
    } catch (error) {
      console.error('Error updating game time:', error);
      toast.showError('Failed to update time', error.message);
    }
  };

  const refreshSelectedGame = async (gameId) => {
    try {
      const updatedGames = await gameService.getGames();
      const updatedGame = updatedGames.find(game => game.id === gameId);
      if (updatedGame) setSelectedEvent(updatedGame);
    } catch (error) {
      console.error('Error refreshing selected game:', error);
    }
  };

  const handleUsernameSet = async (username, emailPreferences) => {
    try {
      await setUsername(username);
      if (emailPreferences) {
        await updateUserEmailPreferences(user.uid, emailPreferences);
      }
    } catch (error) {
      console.error('Error setting username:', error);
    }
  };

  const handleUpdateUserSettings = async (settings) => {
    try {
      if (settings.username !== user.username && settings.username !== user.name) {
        await setUsername(settings.username);
      }
      await updateUserEmailPreferences(user.uid, settings.emailPreferences, settings.wesMode);
      toast.showSuccess('Settings updated successfully!');
      transitionToView('games');
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.showError('Failed to update settings', error.message);
      throw error;
    }
  };

  const updateUserEmailPreferences = async (userUid, emailPreferences, wesMode) => {
    try {
      const { doc, setDoc } = await import('firebase/firestore');
      const { db } = await import('./services/firebase');

      const userDocRef = doc(db, 'users', userUid);
      await setDoc(userDocRef, {
        emailPreferences,
        wesMode,
        updatedAt: new Date()
      }, { merge: true });
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  };

  const transitionToGame = (game) => {
    setGameEditTrigger(0);
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedEvent(game);
      setTimeout(() => setIsTransitioning(false), 50);
    }, 150);
  };

  const transitionToView = (view) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentView(view);
      setTimeout(() => setIsTransitioning(false), 50);
    }, 150);
  };

  const transitionBack = async () => {
    setIsTransitioning(true);
    setTimeout(async () => {
      setSelectedEvent(null);
      setCurrentView('games');
      try {
        const updatedGames = await gameService.getGames();
        setGames(updatedGames);
      } catch (error) {
        console.error('Error refreshing games:', error);
      }
      setTimeout(() => setIsTransitioning(false), 50);
    }, 150);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-gray-800 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
            <div className="absolute inset-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-black rounded-full"></div>
            </div>
          </div>
          <p className="text-sm font-medium text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen games={games} />;
  }

  if (user.needsUsernameSetup) {
    return (
      <UsernameSetup
        user={user}
        onUsernameSet={handleUsernameSet}
        loading={authLoading}
      />
    );
  }

  const mainContent = () => {
    if (currentView === 'create') {
      return (
        <CreateGame
          onBack={() => transitionToView('games')}
          onCreateGame={handleCreateGame}
          hideHeader={true}
        />
      );
    }

    if (currentView === 'settings') {
      return (
        <UserSettings
          user={user}
          onBack={() => transitionToView('games')}
          onUpdateSettings={handleUpdateUserSettings}
          hideHeader={true}
        />
      );
    }

    if (currentView === 'chat') {
      return (
        <GameChat
          user={user}
          hideHeader={true}
        />
      );
    }

    if (selectedEvent) {
      return (
        <GameDetails
          game={selectedEvent}
          user={user}
          onBack={() => transitionBack()}
          onJoinGame={handleAttendGame}
          onLeaveGame={handleLeaveGame}
          onDeclineGame={handleDeclineGame}
          onMaybeGame={handleMaybeGame}
          onDeleteGame={handleDeleteGame}
          onEditLocation={handleEditGameLocation}
          onEditTime={handleEditGameTime}
          editTrigger={gameEditTrigger}
          hideHeader={true}
        />
      );
    }

    return (
      <GameDashboard
        user={user}
        games={games}
        loading={loading}
        onCreateGame={() => transitionToView('create')}
        onSelectGame={transitionToGame}
        onJoinGame={handleAttendGame}
        onDeclineGame={handleDeclineGame}
        onOpenSettings={() => transitionToView('settings')}
        hideHeader={true}
      />
    );
  };

  const getTransitionClasses = () =>
    isTransitioning
      ? "transition-opacity duration-300 ease-out opacity-0"
      : "transition-opacity duration-300 ease-out opacity-100";

  const getHeaderContent = () => {
    const isGamesView = currentView === 'games' && !selectedEvent;
    const isGameDetails = !!selectedEvent;

    return {
      title: 'Burlington Ballers',
      subtitle: user?.name,
      rightContent: (
        <div className="flex items-center gap-1">
          <Button
            onClick={() => {
              if (isGameDetails) {
                transitionBack();
              } else {
                transitionToView('games');
              }
            }}
            variant="ghost"
            size="sm"
            disabled={isGamesView}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <Button
            onClick={() => transitionToView('chat')}
            variant={currentView === 'chat' ? 'default' : 'ghost'}
            size="sm"
            disabled={currentView === 'chat'}
          >
            <MessageCircle className="w-5 h-5" />
          </Button>

          <Button
            onClick={() => transitionToView('settings')}
            variant={currentView === 'settings' ? 'default' : 'ghost'}
            size="sm"
            disabled={currentView === 'settings'}
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      )
    };
  };

  const headerContent = getHeaderContent();

  return (
    <WesMode user={user}>
      <div className="min-h-screen bg-black text-white relative overflow-hidden">
        <FloatingOrbs mousePosition={mousePosition} />

        <div className="relative z-10">
          <div className="max-w-lg mx-auto px-4 sm:px-6 pb-20 safe-bottom">
            <div className="fixed top-0 left-0 right-0 bg-black/80 backdrop-blur-sm z-30 safe-top">
              <div className="max-w-lg mx-auto px-4 sm:px-6 py-3">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <h1 className="text-lg font-light tracking-wide text-white truncate">
                      {headerContent.title}
                    </h1>
                    <p className="text-xs text-gray-400 truncate">{headerContent.subtitle}</p>
                  </div>
                  <div className="flex-shrink-0">
                    {headerContent.rightContent}
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-20">
              <div className={getTransitionClasses()}>
                {mainContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </WesMode>
  );
};

const BasketballScheduler = () => {
  return (
    <ToastProvider>
      <BasketballSchedulerContent />
    </ToastProvider>
  );
};

export default BasketballScheduler;
