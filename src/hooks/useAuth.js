import { useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  signInWithRedirect,
  getRedirectResult
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, getDocs, updateDoc, onSnapshot } from 'firebase/firestore';
import { auth, googleProvider, db } from '../services/firebase';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let userDocUnsubscribe = null;
    
    const authUnsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Check if user document exists
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            // Set up real-time listener for user document
            userDocUnsubscribe = onSnapshot(userDocRef, (doc) => {
              if (doc.exists()) {
                const userData = doc.data();
                setUser({
                  uid: firebaseUser.uid,
                  name: userData.username || firebaseUser.displayName,
                  email: firebaseUser.email,
                  photo: firebaseUser.photoURL,
                  username: userData.username,
                  emailPreferences: userData.emailPreferences || {
                    rsvpReminders: false,
                    attendanceReminders: false,
                    gameChangeNotifications: false
                  },
                  wesMode: userData.wesMode || false,
                  needsUsernameSetup: !userData.username
                });
              }
            }, (error) => {
              console.error('Error in user document listener:', error);
              setError(error.message);
            });
            
            // Update last login
            await setDoc(userDocRef, { lastLogin: new Date() }, { merge: true });
          } else {
            // New user, create basic document but flag that username setup is needed
            const userDoc = {
              uid: firebaseUser.uid,
              googleName: firebaseUser.displayName, // Store original Google name
              email: firebaseUser.email,
              photo: firebaseUser.photoURL,
              lastLogin: new Date(),
              createdAt: new Date()
            };
            
            await setDoc(userDocRef, userDoc, { merge: true });
            setUser({
              uid: firebaseUser.uid,
              name: firebaseUser.displayName,
              email: firebaseUser.email,
              photo: firebaseUser.photoURL,
              needsUsernameSetup: true // New user needs to set username
            });
          }
        } catch (err) {
          console.error('Error handling user document:', err);
          setError(err.message);
        }
      } else {
        // Clean up user document listener when logged out
        if (userDocUnsubscribe) {
          userDocUnsubscribe();
          userDocUnsubscribe = null;
        }
        setUser(null);
      }
      setLoading(false);
    });

    // Check for redirect result on mount
    getRedirectResult(auth).catch((error) => {
      console.error('Redirect sign-in error:', error);
      setError(error.message);
      setLoading(false);
    });

    return () => {
      authUnsubscribe();
      if (userDocUnsubscribe) {
        userDocUnsubscribe();
      }
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      setError(null);
      setLoading(true);
      
      // Try popup first, fallback to redirect on mobile
      try {
        await signInWithPopup(auth, googleProvider);
      } catch (popupError) {
        if (popupError.code === 'auth/popup-blocked' || 
            popupError.code === 'auth/popup-closed-by-user') {
          // Fallback to redirect method
          await signInWithRedirect(auth, googleProvider);
        } else {
          throw popupError;
        }
      }
    } catch (error) {
      console.error('Sign-in error:', error);
      
      // Provide helpful error messages
      let errorMessage = error.message;
      if (error.code === 'auth/configuration-not-found') {
        errorMessage = 'Google Sign-In is not configured. Please contact the administrator.';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Popup was blocked. Please allow popups and try again.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
    } catch (error) {
      console.error('Sign-out error:', error);
      setError(error.message);
    }
  };

  const setUsername = async (username) => {
    if (!user?.uid) {
      throw new Error('No authenticated user');
    }

    try {
      setLoading(true);
      setError(null);
      
      // Update user document with username
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, { 
        username,
        usernameSetAt: new Date()
      }, { merge: true });
      
      // Update existing RSVPs to use the new username
      await updateUserRSVPs(user.uid, username);
      
      // Update local user state
      setUser(prev => ({
        ...prev,
        name: username,
        username,
        needsUsernameSetup: false
      }));
      
      setLoading(false);
    } catch (error) {
      console.error('Error setting username:', error);
      setError(error.message);
      setLoading(false);
      throw error;
    }
  };

  // Helper function to update existing RSVPs with new username
  const updateUserRSVPs = async (userUid, newUsername) => {
    try {
      // Get all RSVPs for this user
      const rsvpsRef = collection(db, 'rsvps');
      const userRSVPsQuery = query(rsvpsRef, where('userUid', '==', userUid));
      const rsvpSnapshot = await getDocs(userRSVPsQuery);
      
      // Update each RSVP with the new username
      const updatePromises = rsvpSnapshot.docs.map(rsvpDoc => {
        return updateDoc(doc(db, 'rsvps', rsvpDoc.id), {
          userName: newUsername,
          updatedAt: new Date()
        });
      });
      
      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error updating RSVPs with new username:', error);
      // Don't throw - this is not critical to the username setting process
    }
  };

  return {
    user,
    loading,
    error,
    signInWithGoogle,
    logout,
    setUsername
  };
};