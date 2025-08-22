# Firebase Setup Guide 🔧

## Current Issue: Google Sign-In Not Configured

You're seeing `Firebase: Error (auth/configuration-not-found)` because Google authentication isn't enabled in your Firebase project.

## Required Steps:

### 1. Firebase Console Setup

1. **Go to Firebase Console**: https://console.firebase.google.com
2. **Select your project**: `burlingtonballers-84ebe`

### 2. Enable Google Authentication

1. Click **"Authentication"** in the left sidebar
2. Click **"Sign-in method"** tab  
3. Find **"Google"** in the list of providers
4. Click on **Google** row
5. **Toggle "Enable"** to ON
6. **Add your email** in the "Project support email" field (required)
7. Click **"Save"**

### 3. Enable Firestore Database

1. Click **"Firestore Database"** in the left sidebar
2. Click **"Create database"**
3. Choose **"Start in test mode"** (for development)
4. Select location: **"us-central1"** (recommended)
5. Click **"Done"**

### 4. (Optional) Add Custom Domain

If you want to use `burlingtonballers.com`:
1. In Authentication > Settings > **Authorized domains**
2. Click **"Add domain"**
3. Enter: `burlingtonballers.com`
4. Click **"Add"**

## Security Rules (Production)

After testing, update Firestore rules in Firebase Console > Firestore > Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Anyone authenticated can read games
    match /games/{gameId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null 
        && request.auth.uid == resource.data.organizerUid;
      allow update, delete: if request.auth != null 
        && request.auth.uid == resource.data.organizerUid;
    }
    
    // Users can manage their own RSVPs, read others
    match /rsvps/{rsvpId} {
      allow read: if request.auth != null;
      allow create, update: if request.auth != null 
        && request.auth.uid == resource.data.userUid;
      allow delete: if request.auth != null 
        && request.auth.uid == resource.data.userUid;
    }
  }
}
```

## Verification

After completing these steps:

1. **Refresh your app** (localhost:3000)
2. **Click "Sign in with Google"**
3. **Should open Google popup** for authentication
4. **Complete sign-in flow**
5. **You should see the dashboard** with your name

## Troubleshooting

**Still getting errors?**
- Verify Google provider is **enabled** (green toggle)
- Check **project support email** is filled in
- Try **hard refresh** (Cmd+Shift+R / Ctrl+Shift+F5)
- Check browser **console for detailed errors**

**Popup blocked?**
- Allow popups for localhost:3000
- The app will automatically try redirect method as fallback

**Need help?**
- Check Firebase Console > Authentication > Users (should show signed-in users)
- Check browser Network tab for failed requests
- Firebase Console > Authentication > Settings > View logs

## What Happens After Setup

Once authentication works:
1. ✅ **Sign in with Google**
2. ✅ **Create real games** (stored in Firestore)
3. ✅ **RSVP with real user profiles**
4. ✅ **Decline games** ("Can't Make It")
5. ✅ **Real-time updates** across all users
6. ✅ **Persistent data** across sessions

Your Burlington Ballers app will be fully functional! 🏀