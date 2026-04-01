# Changelog

All notable changes to the BattleTech Tactical Simulator project.

## [2.0.0] - 2026-04-01

### 🚀 Major Features

#### Online Multiplayer
- Added FastAPI backend server with WebSocket support
- Implemented room-based matchmaking system
- Created NetworkMultiplayerLobby component
- Real-time player connection tracking
- Host/guest role management
- Room code sharing system
- Automatic reconnection handling
- Activity log for player events

#### Aerospace Fighters
- Added 7 new aerospace fighter variants:
  - Light: Sparrowhawk (30t), Chippewa (25t)
  - Medium: Shilone (50t), Lucifer (45t)
  - Heavy: Thunderbird (60t), Corsair (50t)
  - Clan: Visigoth (60t)
- Implemented altitude-based combat system (6 levels)
- Added air-to-ground attack modifiers
- Created air-to-air dogfighting mechanics
- Thrust and fuel point management
- Bombing run capabilities
- Wing-mounted weapon systems

#### Mission Objectives System
- Created 6 objective types:
  - Eliminate All - Destroy all enemies
  - Assassination - Eliminate specific target
  - Defend Structure - Hold position for X turns
  - Capture Zone - Secure strategic point
  - Escort Unit - Protect unit to extraction
  - Survive - Keep forces alive for duration
- Progress tracking (0-100%)
- Rewards system (C-Bills, salvage, reputation)
- Turn-based time limits
- Required vs optional objectives
- Mission completion/failure conditions
- In-game objectives overlay

### 🔨 Refactoring & Architecture

#### Code Organization (65% reduction in main app)
- **App.tsx:** Reduced from 816 lines → 280 lines
- Created `/src/screens/` directory:
  - `MainMenu.tsx` - Clean gradient-styled menu
  - `UnitSetup.tsx` - Dual-panel unit selection
  - `BattleScreen.tsx` - Main battle interface
- Created `/src/hooks/` directory:
  - `useKeyboardShortcuts.ts` - Centralized shortcuts
- Improved component separation and modularity

#### Production Readiness
- Added `ErrorBoundary.tsx` for graceful error handling
- Implemented keyboard shortcuts (Ctrl+S, Ctrl+L, Ctrl+E, Space)
- Added proper TypeScript types throughout
- Improved state management patterns
- Better code reusability

### 🛠️ Backend Infrastructure

#### New Backend Service
- FastAPI application on port 8001
- WebSocket endpoint: `/ws/{room_id}`
- REST API endpoints:
  - `POST /api/rooms/create` - Create game room
  - `GET /api/rooms/{id}` - Get room details
  - `GET /api/rooms` - List all rooms
  - `DELETE /api/rooms/{id}` - Delete room
  - `GET /api/health` - Health check
- CORS configuration for production
- Supervisor integration for process management

#### WebSocket Features
- Real-time bidirectional communication
- Message broadcasting to room participants
- Player join/leave notifications
- Game state synchronization (ready for integration)
- Automatic cleanup on disconnect

### 📦 New Files Created (15 total)

**Screens (3):**
- `/src/screens/MainMenu.tsx`
- `/src/screens/UnitSetup.tsx`
- `/src/screens/BattleScreen.tsx`

**Components (3):**
- `/src/components/ErrorBoundary.tsx`
- `/src/components/NetworkMultiplayerLobby.tsx`
- `/src/components/ObjectivesOverlay.tsx`

**Backend (3):**
- `/app/backend/server.py`
- `/app/backend/requirements.txt`
- `/app/backend/.env`

**Libraries (2):**
- `/src/lib/websocket-client.ts`
- `/src/lib/mission-objectives.ts`

**Services (1):**
- `/src/services/room-api.ts`

**Hooks (1):**
- `/src/hooks/useKeyboardShortcuts.ts`

**Engine (1):**
- `/src/engine/aerospace.ts`

**Documentation (3):**
- `/app/REFACTORING_SUMMARY.md`
- `/app/INTEGRATION_TEST.md`
- `/app/FEATURE_SUMMARY.md`

### 🎨 UI/UX Improvements

- Updated main menu with "Online Multiplayer" button
- Added objectives overlay in battle screen
- Improved visual hierarchy and gradients
- Better loading states and feedback
- Responsive design improvements
- Activity log in multiplayer lobby
- Room code copy button
- Player count indicators

### 🔧 Technical Improvements

- Environment variables properly configured
- No hardcoded URLs or ports
- CORS properly configured
- Supervisor configuration optimized
- .gitignore updated for deployment
- Build process verified
- Health checks implemented

### 🧪 Testing & Documentation

- Created comprehensive README.md
- Added INTEGRATION_TEST.md guide
- Documented all API endpoints
- Added smoke test suite
- Health check endpoints
- Deployment readiness validated

### 📝 Configuration

**New Environment Variables:**
- Frontend: `VITE_BACKEND_URL`, `VITE_WS_URL`
- Backend: `ENVIRONMENT`, `HOST`, `PORT`

### 🐛 Bug Fixes

- Fixed supervisor backend command configuration
- Removed .env blocking from .gitignore
- Corrected TypeScript types for WebSocket
- Fixed unit selection type mismatches

### ⚡ Performance

- Hot reload enabled for both services
- Optimized supervisor restart conditions
- Efficient WebSocket message handling
- Lazy loading where appropriate

### 🔐 Security

- No hardcoded secrets
- Environment-based configuration
- CORS properly configured
- Input validation on WebSocket messages

---

## [1.0.0] - Previous Release

### Initial Features
- Single player tactical combat
- Local hotseat multiplayer
- Campaign mode with progression
- Mech Lab for customization
- 40+ BattleMech variants (IS + Clan)
- Combat vehicles
- Battle armor
- Hex-grid combat engine
- Turn-based gameplay (Movement → Combat → Heat)
- Save/load system (localStorage)
- Physical combat mechanics
- Heat management
- Armor damage tracking
- Weapon systems

---

## Upcoming Features

### High Priority
- [ ] Complete aerospace fighter UI integration
- [ ] Live mission objective progress tracking
- [ ] Multiplayer game state synchronization
- [ ] Turn-by-turn WebSocket sync

### Medium Priority
- [ ] Campaign mission objective integration
- [ ] AI opponent difficulty levels
- [ ] Mission summary rewards screen
- [ ] Enhanced UI animations

### Future Plans
- [ ] Custom mission editor
- [ ] Replay system
- [ ] Spectator mode for multiplayer
- [ ] Mobile responsive design
- [ ] Sound effects and music
- [ ] Achievements system
- [ ] Leaderboards
- [ ] Tournament mode

---

## Migration Notes

### Upgrading from 1.0.0 to 2.0.0

**Breaking Changes:**
- None - All existing features remain functional

**New Requirements:**
- Python 3.11+ (for backend)
- FastAPI and uvicorn (auto-installed)

**Environment Setup:**
1. Create `/app/backend/.env` with backend configuration
2. Update `/app/.env` with new variables
3. Install backend dependencies: `pip install -r backend/requirements.txt`
4. Start backend service via supervisor

**Data Migration:**
- Save files remain compatible
- No database migration needed (no DB used)

---

## Contributors

- Main Development Team
- Deployment Agent (health checks)
- Community Testing

---

## Links

- [README](README.md)
- [Integration Tests](INTEGRATION_TEST.md)
- [Feature Summary](FEATURE_SUMMARY.md)
- [Refactoring Details](REFACTORING_SUMMARY.md)
