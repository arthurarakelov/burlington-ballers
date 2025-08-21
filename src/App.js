import { useState, useEffect } from 'react';
import { Sun, Cloud } from 'lucide-react';
import LoginScreen from './components/auth/LoginScreen';
import UsernameSetup from './components/auth/UsernameSetup';
import GameDashboard from './components/games/GameDashboard';
import GameDetails from './components/games/GameDetails';
import CreateGame from './components/games/CreateGame';
import { convertTo12Hour } from './utils/dateUtils';
import { useAuth } from './hooks/useAuth';
import { gameService } from './services/gameService';
import './App.css';

const BasketballScheduler = () => {
  const { user, loading: authLoading, setUsername } = useAuth();
  const [currentView, setCurrentView] = useState('games'); 
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  
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
          alert('Firestore error: ' + error.message);
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
      setCurrentView('games');
    } catch (error) {
      console.error('Error creating game:', error);
      alert('Error creating game: ' + error.message);
    }
  };

  const handleAttendGame = async (gameId, arrivalTime) => {
    console.log('handleAttendGame called:', { gameId, arrivalTime, user });
    if (!user) {
      console.log('No user for attending game');
      return;
    }
    
    try {
      console.log('Creating RSVP:', { gameId, user, status: 'attending', arrivalTime: convertTo12Hour(arrivalTime) });
      await gameService.createRSVP(gameId, user, 'attending', convertTo12Hour(arrivalTime));
      console.log('RSVP created successfully');
      
      // Manually refresh the selected game
      await refreshSelectedGame(gameId);
    } catch (error) {
      console.error('Error joining game:', error);
    }
  };

  const handleLeaveGame = async (gameId) => {
    console.log('handleLeaveGame called:', { gameId, user });
    if (!user) {
      console.log('No user for leaving game');
      return;
    }
    
    try {
      console.log('Removing RSVP:', { gameId, userUid: user.uid });
      await gameService.removeRSVP(gameId, user.uid);
      console.log('RSVP removed successfully');
      
      // Manually refresh the selected game
      await refreshSelectedGame(gameId);
    } catch (error) {
      console.error('Error leaving game:', error);
    }
  };

  const handleDeclineGame = async (gameId) => {
    console.log('handleDeclineGame called:', { gameId, user });
    if (!user) {
      console.log('No user for declining game');
      return;
    }
    
    try {
      console.log('Creating decline RSVP:', { gameId, user, status: 'declined' });
      await gameService.createRSVP(gameId, user, 'declined');
      console.log('Decline RSVP created successfully');
      
      // Manually refresh the selected game
      await refreshSelectedGame(gameId);
    } catch (error) {
      console.error('Error declining game:', error);
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
      
      // Navigate back to games list
      setSelectedEvent(null);
      setCurrentView('games');
    } catch (error) {
      console.error('Error deleting game:', error);
      alert('Error deleting game: ' + error.message);
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
      alert('Error updating game location: ' + error.message);
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
      alert('Error updating game time: ' + error.message);
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

  const handleUsernameSet = async (username) => {
    try {
      await setUsername(username);
    } catch (error) {
      console.error('Error setting username:', error);
      // Error is handled in the useAuth hook
    }
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

  if (currentView === 'create') {
    return (
      <CreateGame 
        onBack={() => setCurrentView('games')}
        onCreateGame={handleCreateGame}
      />
    );
  }

  if (selectedEvent) {
    return (
      <GameDetails 
        game={selectedEvent}
        user={user}
        onBack={() => setSelectedEvent(null)}
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
      onCreateGame={() => setCurrentView('create')}
      onSelectGame={setSelectedEvent}
    />
  );
};

export default BasketballScheduler;