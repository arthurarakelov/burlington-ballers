import { collection, getDocs, query, where, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { emailService } from './emailService';
import { chatService } from './chatService';

class NotificationScheduler {
  constructor() {
    this.scheduledJobs = new Map();
    this.lastNotificationCheck = null;
    this.gameChangeRateLimit = new Map(); // Track rate limiting for game changes
  }

  // Start the notification scheduler
  start() {
    console.log('Starting notification scheduler...');
    
    // Check for notifications every minute
    this.intervalId = setInterval(() => {
      this.checkAndSendNotifications();
    }, 60000); // 60 seconds

    // Also check immediately
    this.checkAndSendNotifications();
  }

  // Stop the scheduler
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // Main notification checking function
  async checkAndSendNotifications() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Only send notifications at 5:00 PM (17:00)
    if (currentHour === 17 && currentMinute === 0) {
      console.log('5 PM notification time - checking for notifications to send...');
      
      // Prevent sending multiple times in the same minute
      const today = now.toDateString();
      if (this.lastNotificationCheck === today) {
        return;
      }
      this.lastNotificationCheck = today;

      await this.sendDailyNotifications();
    }

    // Note: Chat message cleanup now happens on app load, similar to past games cleanup
  }

  // Send all daily notifications (both RSVP and attendance reminders)
  async sendDailyNotifications() {
    try {
      console.log('Sending daily notifications...');
      
      // Get tomorrow's date for checking games
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowDateString = tomorrow.toISOString().split('T')[0]; // YYYY-MM-DD format

      // Get all games for tomorrow
      const gamesRef = collection(db, 'games');
      const gamesQuery = query(gamesRef, where('date', '==', tomorrowDateString));
      const gamesSnapshot = await getDocs(gamesQuery);

      if (gamesSnapshot.empty) {
        console.log('No games tomorrow, skipping notifications');
        return;
      }

      const games = gamesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log(`Found ${games.length} games for tomorrow, checking notifications...`);

      // Process each game
      for (const game of games) {
        await this.processGameNotifications(game);
      }

      console.log('Daily notifications completed');
    } catch (error) {
      console.error('Error sending daily notifications:', error);
    }
  }

  // Process notifications for a specific game
  async processGameNotifications(game) {
    try {
      // Get all users
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);

      if (usersSnapshot.empty) {
        return;
      }

      // Get RSVPs for this game
      const rsvpsRef = collection(db, 'rsvps');
      const rsvpsQuery = query(rsvpsRef, where('gameId', '==', game.id));
      const rsvpsSnapshot = await getDocs(rsvpsQuery);
      
      const rsvps = rsvpsSnapshot.docs.map(doc => doc.data());
      const attendingUsers = rsvps.filter(rsvp => rsvp.status === 'attending');
      const declinedUsers = rsvps.filter(rsvp => rsvp.status === 'declined');
      const respondedUserIds = rsvps.map(rsvp => rsvp.userUid);

      // Process each user
      for (const userDoc of usersSnapshot.docs) {
        const user = userDoc.data();
        const userId = userDoc.id;

        if (!user.email || !user.emailPreferences) {
          continue;
        }

        const hasResponded = respondedUserIds.includes(userId);
        const isAttending = attendingUsers.some(rsvp => rsvp.userUid === userId);

        // Send RSVP reminder to users who haven't responded
        if (!hasResponded && user.emailPreferences.rsvpReminders) {
          console.log(`Sending RSVP reminder to ${user.email} for game: ${game.title}`);
          try {
            await emailService.sendRSVPReminder(user.email, user.username || user.googleName, game);
          } catch (error) {
            console.error(`Failed to send RSVP reminder to ${user.email}:`, error);
          }
        }

        // Send attendance reminder to users who are attending
        if (isAttending && user.emailPreferences.attendanceReminders) {
          console.log(`Sending attendance reminder to ${user.email} for game: ${game.title}`);
          try {
            await emailService.sendAttendanceReminder(user.email, user.username || user.googleName, game);
          } catch (error) {
            console.error(`Failed to send attendance reminder to ${user.email}:`, error);
          }
        }
      }
    } catch (error) {
      console.error(`Error processing notifications for game ${game.id}:`, error);
    }
  }

  // Handle real-time game change notifications
  async sendGameChangeNotifications(gameId, oldGame, newGame, changeDescription) {
    try {
      // Check rate limiting (max 2 notifications per game per hour)
      const rateLimitKey = `${gameId}_${new Date().getHours()}`;
      const currentCount = this.gameChangeRateLimit.get(rateLimitKey) || 0;
      
      if (currentCount >= 2) {
        console.log(`Rate limit reached for game ${gameId} this hour`);
        return;
      }

      // Get users who have RSVP'd yes to this game
      const rsvpsRef = collection(db, 'rsvps');
      const rsvpsQuery = query(
        rsvpsRef, 
        where('gameId', '==', gameId),
        where('status', '==', 'attending')
      );
      const rsvpsSnapshot = await getDocs(rsvpsQuery);

      if (rsvpsSnapshot.empty) {
        console.log('No attending users for this game, skipping change notifications');
        return;
      }

      const attendingUsers = rsvpsSnapshot.docs.map(doc => doc.data());

      // Get user details and send notifications
      for (const rsvp of attendingUsers) {
        try {
          const userDocRef = doc(db, 'users', rsvp.userUid);
          const userDoc = await getDoc(userDocRef);
          
          if (!userDoc.exists()) continue;
          
          const user = userDoc.data();
          
          if (!user.email || !user.emailPreferences?.gameChangeNotifications) {
            continue;
          }

          console.log(`Sending game change notification to ${user.email} for game: ${newGame.title}`);
          await emailService.sendGameChangeNotification(
            user.email, 
            user.username || user.googleName, 
            newGame, 
            changeDescription
          );
        } catch (error) {
          console.error(`Failed to send change notification to user ${rsvp.userUid}:`, error);
        }
      }

      // Update rate limit counter
      this.gameChangeRateLimit.set(rateLimitKey, currentCount + 1);

      // Clean up old rate limit entries (keep only current hour)
      const currentHour = new Date().getHours();
      for (const [key, value] of this.gameChangeRateLimit.entries()) {
        if (!key.endsWith(`_${currentHour}`)) {
          this.gameChangeRateLimit.delete(key);
        }
      }

    } catch (error) {
      console.error('Error sending game change notifications:', error);
    }
  }

}

export const notificationScheduler = new NotificationScheduler();