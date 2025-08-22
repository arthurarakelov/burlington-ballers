import { useState, useEffect } from 'react';
import { Sun, Cloud } from 'lucide-react';
import LoginScreen from './components/auth/LoginScreen';
import UsernameSetup from './components/auth/UsernameSetup';
import GameDashboard from './components/games/GameDashboard';
import GameDetails from './components/games/GameDetails';
import CreateGame from './components/games/CreateGame';
import UserSettings from './components/user/UserSettings';
import { ToastProvider, useToast } from './components/ui/Toast';
import { convertTo12Hour } from './utils/dateUtils';
import { useAuth } from './hooks/useAuth';
import { gameService } from './services/gameService';
import './App.css';

const BasketballSchedulerContent = () => {
  const { user, loading: authLoading, setUsername } = useAuth();
  const toast = useToast();
  const [currentView, setCurrentView] = useState('games'); // 'games', 'create', 'settings' 
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const [games, setGames] = useState([]);

  // Subscribe to games when user is authenticated
  useEffect(() => {
    if (user) {
      setLoading(true);
      
      // Clean up past games first, then subscribe to updates
      const initializeGames = async () => {
        try {
          await gameService.deletePastGames();
        } catch (error) {
          console.error('Error cleaning up past games:', error);
        }
        
        const unsubscribe = gameService.subscribeToGames((gamesData) => {
          console.log('Games loaded:', gamesData);
          setGames(gamesData);
          setLoading(false);
        }, (error) => {
          console.error('Error loading games:', error);
          setLoading(false);
          // Show empty games on error so we can see the real issue
          setGames([]);
          toast.showError('Database connection error', error.message);
        });
        
        return unsubscribe;
      };
      
      const unsubscribePromise = initializeGames();
      
      return () => {
        unsubscribePromise.then(unsubscribe => {
          if (unsubscribe) unsubscribe();
        });
      };
    } else {
      // Show real game data even when not authenticated (read-only preview)
      setLoading(true);
      
      const initializeGames = async () => {
        try {
          await gameService.deletePastGames();
        } catch (error) {
          console.error('Error cleaning up past games:', error);
        }
        
        const unsubscribe = gameService.subscribeToGames((gamesData) => {
          console.log('Games loaded (not authenticated):', gamesData);
          setGames(gamesData);
          setLoading(false);
        }, (error) => {
          console.error('Error loading games:', error);
          setLoading(false);
          setGames([]);
        });
        
        return unsubscribe;
      };
      
      const unsubscribePromise = initializeGames();
      
      return () => {
        unsubscribePromise.then(unsubscribe => {
          if (unsubscribe) unsubscribe();
        });
      };
    }
  }, [user]);


  const handleCreateGame = async (gameData) => {
    if (!user) {
      console.error('No user authenticated');
      return;
    }
    
    console.log('Creating game:', gameData, 'User:', user);
    
    try {
      const gameId = await gameService.createGame(gameData, user);
      console.log('Game created with ID:', gameId);
      toast.showSuccess('Game created successfully!');
      transitionToView('games');
    } catch (error) {
      console.error('Error creating game:', error);
      toast.showError('Failed to create game', error.message);
    }
  };

  const handleAttendGame = async (gameId, arrivalTime) => {
    console.log('handleAttendGame called:', { gameId, arrivalTime, user });
    if (!user) {
      console.log('No user for attending game');
      return;
    }
    
    // Optimistic update - update UI immediately
    const optimisticAttendee = {
      userUid: user.uid,
      userName: user.name,
      userPhoto: user.photo,
      arrivalTime: convertTo12Hour(arrivalTime)
    };
    
    // Update selected event
    setSelectedEvent(prev => ({
      ...prev,
      attendees: [...(prev.attendees || []), optimisticAttendee].sort((a, b) => {
        const timeA = new Date(`1970/01/01 ${a.arrivalTime}`);
        const timeB = new Date(`1970/01/01 ${b.arrivalTime}`);
        return timeA - timeB;
      }),
      declined: prev.declined?.filter(d => d.userUid !== user.uid) || []
    }));
    
    // Also update games array for dashboard
    setGames(prev => prev.map(game => 
      game.id === gameId ? {
        ...game,
        attendees: [...(game.attendees || []), optimisticAttendee].sort((a, b) => {
          const timeA = new Date(`1970/01/01 ${a.arrivalTime}`);
          const timeB = new Date(`1970/01/01 ${b.arrivalTime}`);
          return timeA - timeB;
        }),
        declined: game.declined?.filter(d => d.userUid !== user.uid) || []
      } : game
    ));
    
    try {
      console.log('Creating RSVP:', { gameId, user, status: 'attending', arrivalTime: convertTo12Hour(arrivalTime) });
      await gameService.createRSVP(gameId, user, 'attending', convertTo12Hour(arrivalTime));
      console.log('RSVP created successfully');
      toast.showSuccess('You\'re now attending this game!');
      
      // Refresh to get server state
      await refreshSelectedGame(gameId);
    } catch (error) {
      console.error('Error joining game:', error);
      toast.showError('Failed to join game', error.message);
      // Revert optimistic update on error
      await refreshSelectedGame(gameId);
    }
  };

  const handleLeaveGame = async (gameId) => {
    console.log('handleLeaveGame called:', { gameId, user });
    if (!user) {
      console.log('No user for leaving game');
      return;
    }
    
    // Optimistic update - remove from attendees immediately
    setSelectedEvent(prev => ({
      ...prev,
      attendees: prev.attendees?.filter(a => a.userUid !== user.uid) || [],
      declined: prev.declined?.filter(d => d.userUid !== user.uid) || []
    }));
    
    // Also update games array for dashboard
    setGames(prev => prev.map(game => 
      game.id === gameId ? {
        ...game,
        attendees: game.attendees?.filter(a => a.userUid !== user.uid) || [],
        declined: game.declined?.filter(d => d.userUid !== user.uid) || []
      } : game
    ));
    
    try {
      console.log('Removing RSVP:', { gameId, userUid: user.uid });
      await gameService.removeRSVP(gameId, user.uid);
      console.log('RSVP removed successfully');
      toast.showSuccess('You\'ve left the game');
      
      // Refresh to get server state
      await refreshSelectedGame(gameId);
    } catch (error) {
      console.error('Error leaving game:', error);
      toast.showError('Failed to leave game', error.message);
      // Revert optimistic update on error
      await refreshSelectedGame(gameId);
    }
  };

  const handleDeclineGame = async (gameId) => {
    console.log('handleDeclineGame called:', { gameId, user });
    if (!user) {
      console.log('No user for declining game');
      return;
    }
    
    // Optimistic update - add to declined immediately
    const optimisticDeclined = {
      userUid: user.uid,
      userName: user.name,
      userPhoto: user.photo
    };
    
    setSelectedEvent(prev => ({
      ...prev,
      attendees: prev.attendees?.filter(a => a.userUid !== user.uid) || [],
      declined: [...(prev.declined || []), optimisticDeclined]
    }));
    
    // Also update games array for dashboard
    setGames(prev => prev.map(game => 
      game.id === gameId ? {
        ...game,
        attendees: game.attendees?.filter(a => a.userUid !== user.uid) || [],
        declined: [...(game.declined || []), optimisticDeclined]
      } : game
    ));
    
    try {
      console.log('Creating decline RSVP:', { gameId, user, status: 'declined' });
      await gameService.createRSVP(gameId, user, 'declined');
      console.log('Decline RSVP created successfully');
      toast.showSuccess('Marked as can\'t make it');
      
      // Refresh to get server state
      await refreshSelectedGame(gameId);
    } catch (error) {
      console.error('Error declining game:', error);
      toast.showError('Failed to decline game', error.message);
      // Revert optimistic update on error
      await refreshSelectedGame(gameId);
    }
  };

  const handleDeleteGame = async (gameId) => {
    console.log('handleDeleteGame called:', { gameId, user });
    if (!user) {
      console.log('No user for deleting game');
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this game? This action cannot be undone.')) {
      return;
    }
    
    try {
      console.log('Deleting game:', { gameId, user });
      await gameService.deleteGame(gameId, user);
      console.log('Game deleted successfully');
      toast.showSuccess('Game deleted successfully');
      
      // Navigate back to games list
      transitionBack();
    } catch (error) {
      console.error('Error deleting game:', error);
      toast.showError('Failed to delete game', error.message);
    }
  };

  const handleEditGameLocation = async (gameId, newLocation, newAddress) => {
    console.log('handleEditGameLocation called:', { gameId, newLocation, newAddress, user });
    if (!user) {
      console.log('No user for editing game');
      return;
    }
    
    try {
      console.log('Updating game location:', { gameId, newLocation, newAddress, user });
      await gameService.updateGameLocation(gameId, user, newLocation, newAddress);
      console.log('Game location updated successfully');
      
      // Manually refresh the selected game
      await refreshSelectedGame(gameId);
    } catch (error) {
      console.error('Error updating game location:', error);
      toast.showError('Failed to update location', error.message);
    }
  };

  const handleEditGameTime = async (gameId, newTime) => {
    console.log('handleEditGameTime called:', { gameId, newTime, user });
    if (!user) {
      console.log('No user for editing game');
      return;
    }
    
    try {
      console.log('Updating game time:', { gameId, newTime, user });
      await gameService.updateGameTime(gameId, user, newTime);
      console.log('Game time updated successfully');
      
      // Manually refresh the selected game
      await refreshSelectedGame(gameId);
    } catch (error) {
      console.error('Error updating game time:', error);
      toast.showError('Failed to update time', error.message);
    }
  };

  // Helper function to refresh the selected game data
  const refreshSelectedGame = async (gameId) => {
    try {
      console.log('Refreshing selected game:', gameId);
      
      // Get fresh game data from Firestore
      const updatedGames = await gameService.getGames();
      const updatedGame = updatedGames.find(game => game.id === gameId);
      
      if (updatedGame) {
        console.log('Updated game data:', updatedGame);
        setSelectedEvent(updatedGame);
      }
    } catch (error) {
      console.error('Error refreshing selected game:', error);
    }
  };

  const handleUsernameSet = async (username, emailPreferences) => {
    try {
      await setUsername(username);
      // Also save email preferences during signup
      if (emailPreferences) {
        await updateUserEmailPreferences(user.uid, emailPreferences);
      }
    } catch (error) {
      console.error('Error setting username:', error);
      // Error is handled in the useAuth hook
    }
  };

  const handleUpdateUserSettings = async (settings) => {
    try {
      // Update username if changed
      if (settings.username !== user.username && settings.username !== user.name) {
        await setUsername(settings.username);
      }

      // Update email preferences
      await updateUserEmailPreferences(user.uid, settings.emailPreferences);
      
      toast.showSuccess('Settings updated successfully!');
      transitionToView('games');
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.showError('Failed to update settings', error.message);
      throw error;
    }
  };

  const updateUserEmailPreferences = async (userUid, emailPreferences) => {
    try {
      const { doc, setDoc } = await import('firebase/firestore');
      const { db } = await import('./services/firebase');
      
      const userDocRef = doc(db, 'users', userUid);
      await setDoc(userDocRef, { 
        emailPreferences,
        updatedAt: new Date()
      }, { merge: true });
      
    } catch (error) {
      console.error('Error updating email preferences:', error);
      throw error;
    }
  };

  // Enhanced transition helpers
  const transitionToGame = (game) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedEvent(game);
      setTimeout(() => setIsTransitioning(false), 50);
    }, 300);
  };

  const transitionToView = (view) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentView(view);
      setTimeout(() => setIsTransitioning(false), 50);
    }, 300);
  };

  const transitionBack = async () => {
    setIsTransitioning(true);
    setTimeout(async () => {
      setSelectedEvent(null);
      setCurrentView('games');
      // Refresh games data to ensure dashboard shows updated info
      try {
        const updatedGames = await gameService.getGames();
        setGames(updatedGames);
      } catch (error) {
        console.error('Error refreshing games:', error);
      }
      setTimeout(() => setIsTransitioning(false), 50);
    }, 300);
  };

  // Temporary debug function to manually update RSVPs - you can call this from console
  window.updateMyRSVPs = async () => {
    if (!user?.uid) {
      console.log('No user logged in');
      return;
    }
    
    try {
      const { collection, query, where, getDocs, updateDoc, doc } = await import('firebase/firestore');
      const { db } = await import('./services/firebase');
      
      // Get all RSVPs for current user
      const rsvpsRef = collection(db, 'rsvps');
      const userRSVPsQuery = query(rsvpsRef, where('userUid', '==', user.uid));
      const rsvpSnapshot = await getDocs(userRSVPsQuery);
      
      console.log(`Found ${rsvpSnapshot.docs.length} RSVPs to update`);
      
      // Update each RSVP with the current username
      const updatePromises = rsvpSnapshot.docs.map(rsvpDoc => {
        const rsvpData = rsvpDoc.data();
        console.log(`Updating RSVP ${rsvpDoc.id} from "${rsvpData.userName}" to "${user.name}"`);
        return updateDoc(doc(db, 'rsvps', rsvpDoc.id), {
          userName: user.name,
          updatedAt: new Date()
        });
      });
      
      await Promise.all(updatePromises);
      console.log(`Successfully updated ${updatePromises.length} RSVPs`);
      
      // Refresh the page to see changes
      window.location.reload();
    } catch (error) {
      console.error('Error updating RSVPs:', error);
    }
  };

  // Show loading screen during authentication check
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

  // Show login screen if not authenticated
  if (!user) {
    return (
      <LoginScreen games={games} />
    );
  }

  // Show username setup if needed
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
        />
      );
    }

    if (currentView === 'settings') {
      return (
        <UserSettings 
          user={user}
          onBack={() => transitionToView('games')}
          onUpdateSettings={handleUpdateUserSettings}
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
          onDeleteGame={handleDeleteGame}
          onEditLocation={handleEditGameLocation}
          onEditTime={handleEditGameTime}
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
      />
    );
  };

  return (
    <div className={`transition-all duration-300 ease-in-out ${
      isTransitioning 
        ? 'opacity-0 transform scale-95 translate-y-2' 
        : 'opacity-100 transform scale-100 translate-y-0'
    }`}>
      {mainContent()}
    </div>
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