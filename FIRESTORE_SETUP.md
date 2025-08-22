# Firestore Database Setup Required

## The Issue
You're seeing "Loading games..." because the Firestore database hasn't been created yet.

## Quick Fix - Create Firestore Database:

1. **Go to Firebase Console**: https://console.firebase.google.com
2. **Select your project**: `burlingtonballers-84ebe`
3. **Click "Firestore Database"** in the left sidebar
4. **Click "Create database"**
5. **Choose "Start in test mode"** 
6. **Select location**: Choose `us-central1` (recommended)
7. **Click "Done"**

## After Creating Database:

1. **Refresh your app** (localhost:3000)
2. **Try creating a game** - should work now
3. **Check browser console** for any remaining errors

## Verification:

After setup, you should see:
- ✅ **Games load** (even if empty list)
- ✅ **Game creation works** (form doesn't reset unexpectedly)
- ✅ **Console shows**: "Games loaded: []" or similar

## Troubleshooting:

**Still loading?** Check browser console for error messages
**Game creation fails?** Look for Firestore permission errors in console
**Need to see data?** Firebase Console → Firestore → View documents

The database will be completely empty initially, which is normal!