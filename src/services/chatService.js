import { 
  collection, 
  doc, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  limit
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
  }
};