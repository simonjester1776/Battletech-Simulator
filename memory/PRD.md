# Product Requirements Document (PRD)
## BattleTech Tactical Simulator v2.0

**Last Updated:** April 1, 2026  
**Version:** 2.1.1  
**Status:** ✅ Production Ready

---

## Executive Summary

BattleTech Tactical Simulator is a comprehensive, full-stack tactical combat game that brings the classic BattleTech tabletop experience to the web. Version 2.0 introduces online multiplayer, mission objectives, aerospace fighters, and a completely refactored codebase for production deployment.

---

## Product Vision

Create a feature-rich, accessible BattleTech simulator that rivals professional applications like MekLab while providing:
- Seamless online multiplayer experience
- Comprehensive unit roster (Mechs, Vehicles, Battle Armor, Aerospace)
- Engaging campaign progression
- Mission-based objectives with rewards
- Production-grade reliability and performance

---

## Target Users

### Primary
- BattleTech tabletop players seeking digital gameplay
- Strategy game enthusiasts
- Multiplayer tactical combat fans

### Secondary
- BattleTech newcomers learning the game
- Solo players enjoying campaign mode
- Competitive players seeking online matches

---

## Core Features (v2.0)

### 1. Online Multiplayer ✅
**Status:** Implemented

**Features:**
- Real-time WebSocket communication
- Room-based matchmaking
- 8-character unique room codes
- Host/guest role management
- Live player tracking
- Activity log
- Automatic reconnection
- Copy room code functionality

**Technical:**
- FastAPI backend (port 8001)
- WebSocket endpoint: `/ws/{room_id}`
- REST API for room management
- In-memory room storage

### 2. Local Gameplay ✅
**Status:** Complete

**Modes:**
- Single Player (vs AI)
- Local Hotseat (pass-and-play)
- Campaign Mode (progression)

**Features:**
- Save/Load system (localStorage)
- Export game state
- Keyboard shortcuts
- Mission objectives overlay

### 3. Unit Roster ✅
**Status:** Complete (34 units available)

**BattleMechs (23 variants):**
- Light: Locust, Commando, Urbanmech, Jenner (4)
- Medium: Hunchback, Shadowhawk, Griffin, Phoenix Hawk, Trebuchet, Centurion, Wolverine (7)
- Heavy: Warhammer, Thunderbolt, Catapult, Orion, Marauder, Timber Wolf (6)
- Clan: Stormcrow, Mad Dog, Warhawk (3)
- Assault: Awesome, Stalker, Atlas, King Crab (4)

**Combat Vehicles (5 variants):**
- Scorpion, Striker, Vedette, Rommel, Demolisher

**Battle Armor (6 variants):**
- Standard, Elemental, Salamander, Longinus, Sylph, Infiltrator

**Aerospace Fighters (7 variants - Mechanics Ready):**
- Light: Sparrowhawk, Chippewa
- Medium: Shilone, Lucifer
- Heavy: Thunderbird, Corsair
- Clan: Visigoth
- **Status:** Air combat mechanics implemented, UI integration pending

### 4. Mission Objectives System ✅
**Status:** Implemented (UI complete, game integration pending)

**Objective Types:**
1. Eliminate All - Destroy all enemy units
2. Assassination - Eliminate specific target
3. Defend Structure - Hold position X turns
4. Capture Zone - Secure strategic point
5. Escort Unit - Protect to extraction
6. Survive - Keep forces alive X turns

**Features:**
- Progress tracking (0-100%)
- Required vs optional objectives
- Turn-based time limits
- Rewards system (C-Bills, salvage, reputation)
- In-battle overlay display
- Mission summary screen

### 5. Mech Lab ✅
**Status:** Fully Functional (v2.0.1)

**Features:**
- Chassis selector with all 34 units (Mechs, Vehicles, Battle Armor)
- Real-time weapon customization
- Tonnage and critical slot tracking
- Heat management calculator
- Tech base filtering (Inner Sphere, Clan, Both)
- Weapon type filtering
- Cost estimation
- Save/Export custom designs

**Recent Fix (v2.1.1):**
- Fixed chassis selector crash
- Implemented proper state management for chassis changes
- Weapon loadouts now reset correctly when changing chassis

### 6. Combat System ✅
**Status:** Complete

**Phases:**
- Initiative (roll for turn order)
- Movement (walk/run/jump)
- Combat (weapon fire)
- Heat (heat management)

**Mechanics:**
- Hex-grid positioning
- Line of sight calculations
- To-hit modifiers
- Armor damage tracking
- Critical hits
- Heat buildup
- Physical attacks (punch, kick)
- Weapon ranges

### 6. Combat System ✅
**Status:** Complete

**Phases:**
- Initiative (roll for turn order)
- Movement (walk/run/jump)
- Combat (weapon fire)
- Heat (heat management)

**Mechanics:**
- Hex-grid positioning
- Line of sight calculations
- To-hit modifiers
- Armor damage tracking
- Critical hits
- Heat buildup
- Physical attacks (punch, kick)
- Weapon ranges

### 7. Campaign Mode ✅
**Status:** Complete (objectives integration pending)

**Features:**
- Mercenary company management
- Contract system
- C-Bills economy
- Mech repairs
- Pilot management
- Salvage system
- Reputation tracking

---

## Technical Architecture

### Frontend
- **Framework:** React 18.3.1
- **Build Tool:** Vite 7.2.4
- **Language:** TypeScript 5.5.3
- **Styling:** TailwindCSS + shadcn/ui
- **Port:** 3000

**Key Files:**
- `/src/App.tsx` - Main app (280 lines, refactored from 816)
- `/src/screens/` - Screen components
- `/src/components/` - UI components
- `/src/engine/` - Game logic
- `/src/lib/` - Utilities

### Backend
- **Framework:** FastAPI 0.115.0
- **Runtime:** Python 3.11+
- **WebSocket:** websockets 14.1
- **Server:** uvicorn
- **Port:** 8001

**Key Files:**
- `/app/backend/server.py` - WebSocket server
- `/app/backend/.env` - Configuration

### State Management
- **Local:** React hooks + useState
- **Persistence:** Browser localStorage
- **Multiplayer:** In-memory (backend)

### Deployment
- **Process Manager:** Supervisor
- **Environment:** Kubernetes-ready
- **Health Checks:** `/api/health` endpoint

---

## User Flows

### Flow 1: Single Player Game
1. User opens app → Main menu
2. Clicks "Single Player"
3. Selects player units (3)
4. Selects enemy units (2)
5. Clicks "Start Battle"
6. Plays through phases:
   - Movement → Combat → Heat (repeat)
7. Game ends when all units destroyed
8. Views mission objectives summary
9. Option to save/restart/menu

### Flow 2: Online Multiplayer
**Host:**
1. Click "Online Multiplayer"
2. Click "Host Game"
3. Room created → Room code displayed
4. Copy code → Share with opponent
5. Wait for player to join
6. Click "Start Game"

**Guest:**
1. Click "Online Multiplayer"
2. Enter room code
3. Click "Join"
4. Connected → Wait for host
5. Game starts

### Flow 3: Campaign Mission
1. Click "Campaign Mode"
2. View available contracts
3. Select contract → View objectives
4. Accept contract
5. Deploy mechs → Battle
6. Complete objectives
7. Receive rewards (C-Bills, salvage, rep)
8. Repair mechs → Repeat

---

## API Specification

### REST Endpoints

| Method | Path | Description | Response |
|--------|------|-------------|----------|
| GET | `/api/health` | Health check | `{"status":"healthy"}` |
| POST | `/api/rooms/create` | Create room | `{"room_id":"abc12345"}` |
| GET | `/api/rooms/{id}` | Get room | Room object |
| GET | `/api/rooms` | List rooms | `{"rooms":[...]}` |
| DELETE | `/api/rooms/{id}` | Delete room | `{"status":"deleted"}` |

### WebSocket Protocol

**Connection:** `ws://localhost:8001/ws/{room_id}`

**Client Messages:**
```json
{
  "type": "game_state_update",
  "game_state": {...}
}
```

**Server Messages:**
```json
{
  "type": "connected",
  "player_id": "abc123",
  "is_host": true
}
```

---

## Non-Functional Requirements

### Performance
- Page load: < 2 seconds
- WebSocket latency: < 100ms
- Game state updates: Real-time
- Build time: < 30 seconds

### Reliability
- Error boundaries for all screens
- Auto-reconnect on network loss
- Save state every turn
- Health checks every 30s

### Scalability
- Support 100+ concurrent rooms
- In-memory room management
- Efficient WebSocket broadcasting

### Security
- Environment-based configuration
- No hardcoded secrets
- CORS properly configured
- Input validation on messages

### Accessibility
- Keyboard shortcuts
- Clear visual feedback
- Error messages
- Loading states

---

## Success Metrics

### User Engagement
- Average session length: 20+ minutes
- Multiplayer adoption: 30%+ of sessions
- Campaign completion: 50%+ of players
- Return rate: 60%+ within 7 days

### Technical Health
- Uptime: 99.5%+
- API response time: < 200ms
- WebSocket connection success: 95%+
- Zero critical bugs

### Feature Adoption
- Online multiplayer: Used by 40%+ of players
- Mission objectives: Viewed in 80%+ of games
- Mech Lab: Used by 50%+ of campaign players
- Save/Load: Used by 70%+ of players

---

## Future Roadmap

### Phase 3 (Q2 2026)
- [ ] Complete aerospace UI integration
- [ ] Live mission objective tracking
- [ ] Multiplayer turn-by-turn sync
- [ ] Mobile responsive design

### Phase 4 (Q3 2026)
- [ ] AI difficulty levels
- [ ] Custom mission editor
- [ ] Replay system
- [ ] Spectator mode

### Phase 5 (Q4 2026)
- [ ] Sound effects & music
- [ ] Achievements system
- [ ] Leaderboards
- [ ] Tournament mode

---

## Known Limitations

### Current
1. Aerospace fighters not in unit selection UI
2. Mission objectives need live game integration
3. Multiplayer game state sync pending
4. No persistent database (by design)

### By Design
1. No server-side game state persistence
2. Rooms cleared on server restart
3. No user accounts/authentication
4. Browser localStorage limits

---

## Dependencies

### Frontend
- React 18.3.1
- Vite 7.2.4
- TailwindCSS 3.4.17
- shadcn/ui components
- lucide-react icons

### Backend
- FastAPI 0.115.0
- uvicorn 0.32.0
- websockets 14.1
- python-dotenv 1.0.1
- pydantic 2.10.3

---

## Testing Strategy

### Unit Tests
- Game logic (combat, movement, heat)
- Utility functions
- Component rendering

### Integration Tests
- API endpoints
- WebSocket connections
- State management
- Save/load system

### E2E Tests
- Full game flow
- Multiplayer sessions
- Campaign progression
- Mission completion

### Manual Tests
- Browser compatibility
- Network conditions
- UI/UX validation
- Performance profiling

---

## Release Criteria

### v2.0 (Current)
- [x] All core features implemented
- [x] No critical bugs
- [x] Deployment ready
- [x] Documentation complete
- [x] Health checks passing
- [x] Zero breaking changes

### Next Release
- [ ] Aerospace fighters in UI
- [ ] Mission objectives live
- [ ] Multiplayer fully synced
- [ ] Mobile responsive
- [ ] Performance optimized

---

## Appendix

### Glossary
- **BV2:** Battle Value 2 (unit point cost)
- **C-Bills:** In-game currency
- **IS:** Inner Sphere faction
- **Clan:** Clan faction
- **MP:** Movement Points
- **Hotseat:** Local multiplayer (pass-and-play)

### References
- [README.md](../README.md)
- [CHANGELOG.md](../CHANGELOG.md)
- [QUICKSTART.md](../QUICKSTART.md)
- [FEATURE_SUMMARY.md](../FEATURE_SUMMARY.md)

---

**Document Version:** 2.0  
**Last Review:** April 1, 2026  
**Next Review:** May 1, 2026  
**Owner:** Development Team
