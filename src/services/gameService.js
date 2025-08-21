import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs,
  getDoc,
  query, 
  orderBy, 
  onSnapshot,
  where,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { isGameInPast } from '../utils/dateUtils';

// Games collection reference
const gamesRef = collection(db, 'games');
const rsvpsRef = collection(db, 'rsvps');

export const gameService = {
  // Create a new game
  async createGame(gameData, user) {
    try {
      const game = {
        ...gameData,
        organizerUid: user.uid,
        organizerName: user.name, // This now uses the custom username
        organizerPhoto: user.photo,
        organizerEmail: user.email, // Store email for potential notifications
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(gamesRef, game);
      
      // Automatically RSVP the organizer
      await this.createRSVP(docRef.id, user, 'attending', gameData.time);
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating game:', error);
      throw error;
    }
  },

  // Delete a game (only by organizer)
  async deleteGame(gameId, user) {
    try {
      // First verify the user is the organizer
      const gameDoc = await getDoc(doc(db, 'games', gameId));
      if (!gameDoc.exists()) {
        throw new Error('Game not found');
      }
      
      const gameData = gameDoc.data();
      if (gameData.organizerUid !== user.uid) {
        throw new Error('Only the game organizer can delete this game');
      }
      
      // Delete all RSVPs for this game first
      const rsvpsQuery = query(rsvpsRef, where('gameId', '==', gameId));
      const rsvpsSnapshot = await getDocs(rsvpsQuery);
      
      const deletePromises = rsvpsSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      // Then delete the game
      await deleteDoc(doc(db, 'games', gameId));
      
      console.log('Game and related RSVPs deleted successfully');
    } catch (error) {
      console.error('Error deleting game:', error);
      throw error;
    }
  },

  // Update game location (only by organizer)
  async updateGameLocation(gameId, user, newLocation, newAddress) {
    try {
      // First verify the user is the organizer
      const gameDoc = await getDoc(doc(db, 'games', gameId));
      if (!gameDoc.exists()) {
        throw new Error('Game not found');
      }
      
      const gameData = gameDoc.data();
      if (gameData.organizerUid !== user.uid) {
        throw new Error('Only the game organizer can edit this game');
      }
      
      // Update the game location
      await updateDoc(doc(db, 'games', gameId), {
        title: `${newLocation} Game`,
        location: newAddress,
        address: newAddress,
        updatedAt: serverTimestamp()
      });
      
      console.log('Game location updated successfully');
    } catch (error) {
      console.error('Error updating game location:', error);
      throw error;
    }
  },

  // Update game time (only by organizer)
  async updateGameTime(gameId, user, newTime) {
    try {
      // First verify the user is the organizer
      const gameDoc = await getDoc(doc(db, 'games', gameId));
      if (!gameDoc.exists()) {
        throw new Error('Game not found');
      }
      
      const gameData = gameDoc.data();
      if (gameData.organizerUid !== user.uid) {
        throw new Error('Only the game organizer can edit this game');
      }
      
      // Update the game time
      await updateDoc(doc(db, 'games', gameId), {
        time: newTime,
        updatedAt: serverTimestamp()
      });
      
      console.log('Game time updated successfully');
    } catch (error) {
      console.error('Error updating game time:', error);
      throw error;
    }
  },

  // Get all games
  async getGames() {
    try {
      const q = query(gamesRef, orderBy('date', 'asc'), orderBy('time', 'asc'));
      const snapshot = await getDocs(q);
      const games = [];
      
      for (const doc of snapshot.docs) {
        const gameData = { id: doc.id, ...doc.data() };
        
        // Get RSVPs for this game
        const rsvps = await this.getGameRSVPs(doc.id);
        gameData.attendees = rsvps.filter(rsvp => rsvp.status === 'attending');
        gameData.declined = rsvps.filter(rsvp => rsvp.status === 'declined');
        
        games.push(gameData);
      }
      
      return games;
    } catch (error) {
      console.error('Error fetching games:', error);
      throw error;
    }
  },

  // Subscribe to real-time games updates  
  subscribeToGames(callback, errorCallback = null) {
    const q = query(gamesRef, orderBy('date', 'asc'), orderBy('time', 'asc'));
    
    return onSnapshot(q, async (snapshot) => {
      try {
        const games = [];
        
        for (const doc of snapshot.docs) {
          const gameData = { id: doc.id, ...doc.data() };
          
          // Get RSVPs for this game
          const rsvps = await this.getGameRSVPs(doc.id);
          gameData.attendees = rsvps.filter(rsvp => rsvp.status === 'attending');
          gameData.declined = rsvps.filter(rsvp => rsvp.status === 'declined');
          
          games.push(gameData);
        }
        
        callback(games);
      } catch (error) {
        console.error('Error processing games:', error);
        if (errorCallback) errorCallback(error);
      }
    }, (error) => {
      console.error('Error in games subscription:', error);
      if (errorCallback) errorCallback(error);
    });
  },

  // Create or update RSVP
  async createRSVP(gameId, user, status, arrivalTime = null) {
    try {
      // Always get the latest user data to ensure we have the most recent username
      let userName = user.name;
      let userEmail = user.email;
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        userName = userData.username || userData.googleName || user.name;
      }
      
      const rsvpData = {
        gameId,
        userUid: user.uid,
        userName: userName, // Use the latest username from DB
        userPhoto: user.photo,
        userEmail: userEmail, // Store email for potential reminders
        status, // 'attending' or 'declined'
        arrivalTime,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Check if RSVP already exists
      const existingRSVP = await this.getUserRSVP(gameId, user.uid);
      
      if (existingRSVP) {
        // Update existing RSVP with latest username
        await updateDoc(doc(db, 'rsvps', existingRSVP.id), {
          userName: userName, // Update username too
          status,
          arrivalTime,
          updatedAt: serverTimestamp()
        });
        return existingRSVP.id;
      } else {
        // Create new RSVP
        const docRef = await addDoc(rsvpsRef, rsvpData);
        return docRef.id;
      }
    } catch (error) {
      console.error('Error creating/updating RSVP:', error);
      throw error;
    }
  },

  // Remove RSVP (leave game)
  async removeRSVP(gameId, userUid) {
    try {
      const rsvp = await this.getUserRSVP(gameId, userUid);
      if (rsvp) {
        await deleteDoc(doc(db, 'rsvps', rsvp.id));
      }
    } catch (error) {
      console.error('Error removing RSVP:', error);
      throw error;
    }
  },

  // Get user's RSVP for a specific game
  async getUserRSVP(gameId, userUid) {
    try {
      const q = query(
        rsvpsRef, 
        where('gameId', '==', gameId),
        where('userUid', '==', userUid)
      );
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() };
      }
      return null;
    } catch (error) {
      console.error('Error fetching user RSVP:', error);
      throw error;
    }
  },

  // Get all RSVPs for a game
  async getGameRSVPs(gameId) {
    try {
      const q = query(rsvpsRef, where('gameId', '==', gameId));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching game RSVPs:', error);
      throw error;
    }
  },

  // Delete past games automatically
  async deletePastGames() {
    try {
      console.log('Checking for past games to delete...');
      const snapshot = await getDocs(gamesRef);
      const pastGames = [];
      
      for (const doc of snapshot.docs) {
        const gameData = doc.data();
        if (isGameInPast(gameData.date, gameData.time)) {
          pastGames.push({ id: doc.id, ...gameData });
        }
      }
      
      console.log(`Found ${pastGames.length} past games to delete`);
      
      for (const game of pastGames) {
        console.log(`Deleting past game: ${game.title} on ${game.date} at ${game.time}`);
        
        // Delete all RSVPs for this game first
        const rsvpsQuery = query(rsvpsRef, where('gameId', '==', game.id));
        const rsvpsSnapshot = await getDocs(rsvpsQuery);
        
        const deletePromises = rsvpsSnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
        
        // Then delete the game
        await deleteDoc(doc(db, 'games', game.id));
      }
      
      console.log(`Successfully deleted ${pastGames.length} past games`);
      return pastGames.length;
    } catch (error) {
      console.error('Error deleting past games:', error);
      throw error;
    }
  }
};