import { 
  collection, 
  doc, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  limit,
  where,
  getDocs,
  deleteDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

// Chat collection reference
const chatRef = collection(db, 'chat');

export const chatService = {
  // Send a new chat message
  async sendMessage(message, user) {
    try {
      const messageData = {
        message: message.trim(),
        userUid: user.uid,
        userName: user.name,
        userPhoto: user.photo,
        userEmail: user.email,
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(chatRef, messageData);
      return docRef.id;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Subscribe to real-time chat messages
  subscribeToMessages(callback, errorCallback = null) {
    // Get the last 50 messages, ordered by creation time (newest first)
    const q = query(
      chatRef, 
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    
    return onSnapshot(q, (snapshot) => {
      try {
        const messages = [];
        
        snapshot.docs.forEach(doc => {
          const messageData = { id: doc.id, ...doc.data() };
          messages.push(messageData);
        });
        
        callback(messages);
      } catch (error) {
        console.error('Error processing messages:', error);
        if (errorCallback) errorCallback(error);
      }
    }, (error) => {
      console.error('Error in messages subscription:', error);
      if (errorCallback) errorCallback(error);
    });
  },

  // Clean up messages older than 7 days
  async cleanupOldMessages() {
    try {
      // Calculate date 7 days ago
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const cutoffTimestamp = Timestamp.fromDate(sevenDaysAgo);

      console.log('🧹 Cleaning up chat messages older than:', sevenDaysAgo.toLocaleDateString());

      // Query for old messages
      const oldMessagesQuery = query(
        chatRef,
        where('createdAt', '<', cutoffTimestamp)
      );

      const snapshot = await getDocs(oldMessagesQuery);
      
      if (snapshot.empty) {
        console.log('✅ No old chat messages to clean up');
        return 0;
      }

      // Delete old messages
      const deletePromises = snapshot.docs.map(messageDoc => {
        console.log('🗑️ Deleting old message:', messageDoc.id);
        return deleteDoc(doc(chatRef, messageDoc.id));
      });

      await Promise.all(deletePromises);
      console.log(`✅ Successfully cleaned up ${snapshot.docs.length} old chat messages`);
      
      return snapshot.docs.length;
    } catch (error) {
      console.error('❌ Error cleaning up old chat messages:', error);
      throw error;
    }
  },

  // Debug function to check message ages
  async checkMessageAges() {
    try {
      const q = query(chatRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      console.log(`📊 Total messages: ${snapshot.docs.length}`);
      
      const now = new Date();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      snapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate() || new Date(0);
        const ageInDays = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
        const isOld = createdAt < sevenDaysAgo;
        
        console.log(`${index + 1}. ${data.userName}: "${data.message?.substring(0, 50)}..." - ${ageInDays} days old ${isOld ? '⚠️ OLD' : '✅'}`);
        console.log(`   Created: ${createdAt.toLocaleDateString()} ${createdAt.toLocaleTimeString()}`);
      });
      
      return snapshot.docs.length;
    } catch (error) {
      console.error('Error checking message ages:', error);
      throw error;
    }
  }
};