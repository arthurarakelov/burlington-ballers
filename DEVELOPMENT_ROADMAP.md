# Burlington Ballers - Development Roadmap

## Current Status ✅
- **Sleek Login Screen**: Black design with floating orbs, basketball emoji, and gradient text
- **Game Creation**: Users can create games at two Burlington parks (Wildwood & Simonds) with automatic Saturday 11 AM defaults
- **Game Management**: Join/leave games with custom arrival times
- **Game Discovery**: View upcoming games with player count and weather info
- **Responsive Design**: Mobile-first design with smooth animations and hover effects
- **Next Game Preview**: Login screen shows upcoming game info

## Technical Stack
- **Frontend**: React with functional components and hooks
- **Styling**: Tailwind CSS with custom gradients and animations
- **Icons**: Lucide React
- **State**: Local state management (useState)
- **Deployment**: Vercel with custom domain (burlingtonballers.com)

## Current Limitations
- No persistent data (refreshing loses games)
- No real user authentication
- No weather API integration
- Single-user experience (no real multiplayer)
- All code in single file (needs refactoring)

---

## Phase 1: Code Organization & Structure 🔄
**Timeline**: 1 day

### Refactoring Tasks
- [ ] Create proper folder structure:
  ```
  src/
  ├── components/
  │   ├── auth/
  │   ├── games/
  │   └── ui/
  ├── hooks/
  ├── services/
  ├── utils/
  └── constants/
  ```
- [ ] Break down App.js into focused components:
  - `LoginScreen` - Authentication UI
  - `GameDashboard` - Main games list
  - `GameDetails` - Individual game view
  - `CreateGame` - Game creation form
  - `GameCard` - Reusable game item
- [ ] Extract custom hooks:
  - `useAuth` - Authentication state
  - `useGames` - Game data management
  - `useMouseTracking` - Mouse position for animations
- [ ] Create utility functions:
  - Date/time formatting
  - Location constants
  - Weather utilities

---

## Phase 2: Backend Infrastructure 🚀
**Timeline**: 1-2 days

### Firebase Setup
- [ ] Create Firebase project
- [ ] Enable Authentication (Google provider)
- [ ] Set up Firestore database
- [ ] Configure security rules
- [ ] Install Firebase dependencies:
  ```bash
  npm install firebase
  ```

### Database Schema Design
```javascript
// Collections
users: {
  uid: string,
  name: string,
  email: string,
  photo: string,
  createdAt: timestamp
}

games: {
  id: string,
  title: string,
  location: string,
  address: string,
  date: string,
  time: string,
  organizerUid: string,
  organizerName: string,
  organizerPhoto: string,
  createdAt: timestamp,
  weather?: object
}

rsvps: {
  id: string,
  gameId: string,
  userUid: string,
  userName: string,
  userPhoto: string,
  status: 'attending' | 'declined',
  arrivalTime?: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Weather API Integration
- [ ] Set up OpenWeatherMap API key
- [ ] Create weather service for Burlington, MA coordinates
- [ ] Implement weather caching to avoid API limits

---

## Phase 3: Authentication & Data Persistence 🔐
**Timeline**: 1 day

### Google Authentication
- [ ] Replace local auth with Firebase Auth
- [ ] Implement Google sign-in flow
- [ ] Add user profile management
- [ ] Persist login state
- [ ] Update UI to show real user photos/names

### Firestore Integration
- [ ] Replace local state with Firestore
- [ ] Implement real-time game loading
- [ ] Add RSVP management with user associations
- [ ] Handle loading states and errors

---

## Phase 4: Enhanced RSVP System 📝
**Timeline**: 1 day

### "Can't Make It" Feature
- [ ] Update database schema for declined status
- [ ] Add "Can't Make It" button alongside "JOIN"
- [ ] Show declined users in separate "Can't Make It (X)" section
- [ ] Use red styling for declined users
- [ ] Allow status changes between attending/declined/not responded
- [ ] Implement real-time updates for all users

### UI/UX Enhancements
- [ ] Add smooth transitions for status changes
- [ ] Improve mobile responsiveness
- [ ] Add confirmation dialogs for actions
- [ ] Enhanced error handling and user feedback

---

## Phase 5: Polish & Production 🎨
**Timeline**: 1 day

### Final Features
- [ ] Real-time weather data integration
- [ ] Enhanced loading states throughout app
- [ ] Comprehensive error handling
- [ ] Mobile optimization testing
- [ ] Performance optimizations
- [ ] Final testing across devices

### Deployment
- [ ] Environment variable configuration
- [ ] Production Firebase setup
- [ ] Deploy to Vercel
- [ ] Domain configuration
- [ ] Analytics setup (optional)

---

## Required External Services

### Firebase (Free Tier)
- **Authentication**: Google provider
- **Firestore**: Real-time database
- **Hosting**: Optional backup to Vercel

### OpenWeatherMap (Free Tier)
- **Current Weather**: Burlington, MA coordinates
- **5-day Forecast**: For upcoming games

### Vercel (Free Tier) - Current
- **Hosting**: Already configured
- **Custom Domain**: burlingtonballers.com

---

## Estimated Timeline: 4-5 days
## Monthly Costs: $0 (all free tiers)

## Success Metrics
- [ ] Real user authentication with Google
- [ ] Persistent game data across sessions  
- [ ] Real-time multiplayer functionality
- [ ] Declined RSVP tracking
- [ ] Live weather integration
- [ ] Mobile-optimized experience
- [ ] Clean, maintainable code structure

---

*🚀 Ready to build the future of Burlington basketball!*