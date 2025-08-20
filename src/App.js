import { useState, useEffect } from 'react';
import { Sun, Cloud } from 'lucide-react';
import LoginScreen from './components/auth/LoginScreen';
import GameDashboard from './components/games/GameDashboard';
import GameDetails from './components/games/GameDetails';
import CreateGame from './components/games/CreateGame';
import { convertTo12Hour } from './utils/dateUtils';
import { useAuth } from './hooks/useAuth';
import { gameService } from './services/gameService';
import './App.css';

const BasketballScheduler = () => {
  const { user, loading: authLoading } = useAuth();
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
      // Show sample data when not authenticated
      setGames([
        {
          id: 1,
          title: "Wildwood Park Game",
          location: "114 Bedford St, Burlington, MA 01803",
          date: "Aug 18, 2025",
          time: "6:00 PM",
          organizer: "Mike Johnson",
          attendees: [
            { name: "Mike Johnson", phone: "Mike Johnson", arrivalTime: "6:00 PM" },
            { name: "Sarah Chen", phone: "Sarah Chen", arrivalTime: "6:15 PM" },
            { name: "Alex Rivera", phone: "Alex Rivera", arrivalTime: "6:30 PM" }
          ],
          weather: { temp: 78, condition: "perfect", icon: Sun }
        },
        {
          id: 2,
          title: "Simonds Park Game",
          location: "10 Bedford St, Burlington, MA 01803", 
          date: "Aug 20, 2025", 
          time: "9:00 AM",
          organizer: "Emma Davis",
          attendees: [
            { name: "Emma Davis", phone: "Emma Davis", arrivalTime: "8:45 AM" },
            { name: "Chris Park", phone: "Chris Park", arrivalTime: "9:00 AM" }
          ],
          weather: { temp: 72, condition: "ideal", icon: Cloud }
        }
      ]);
      setLoading(false);
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

  // Show loading screen during authentication check
  if (authLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🏀</div>
          <p className="text-lg font-light tracking-widest">LOADING...</p>
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