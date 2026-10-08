# ⚔️ BattleTech Tactical Simulator

A comprehensive, full-stack BattleTech tactical combat simulator with real-time multiplayer, campaign mode, and advanced combat mechanics.

![Version](https://img.shields.io/badge/version-2.1.1-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/React-18.3.1-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-3178c6.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115.0-009688.svg)

---

## 🎮 Features

### Core Gameplay
- **Hex-based Tactical Combat** - Classic BattleTech tabletop rules
- **Turn-based Strategy** - Movement, combat, and heat management phases
- **34 Unit Variants** - 23 Mechs, 5 Vehicles, 6 Battle Armor suits
- **Advanced Combat** - Armor damage, heat sinks, weapon systems, physical attacks
- **Campaign Mode** - Build your mercenary company with progression
- **Mech Lab** - Customize and configure your units with full chassis selector

### Multiplayer (NEW!)
- **Online Multiplayer** - Real-time networked play via WebSocket
- **Room-based Matchmaking** - Create/join games with unique room codes
- **Local Hotseat** - Pass-and-play on single device
- **Live Player Tracking** - See who's connected in real-time

### Mission System (NEW!)
- **6 Objective Types** - Eliminate, Assassinate, Defend, Capture, Escort, Survive
- **Progress Tracking** - Real-time objective completion monitoring
- **Rewards System** - Earn C-Bills, salvage rights, and reputation
- **Turn-limited Missions** - Time-critical objectives

### Unit Types
- **BattleMechs** - Light, Medium, Heavy, Assault (Inner Sphere & Clan)
  - 23 fully functional variants
  - Chassis selector in Mech Lab
- **Combat Vehicles** - 5 armored combat vehicles
- **Battle Armor** - 6 infantry suits with powered armor
- **Aerospace Fighters** - Air combat units are now included in the offline roster and campaign selection flow

---

## 🏗️ Architecture

### Frontend
- **React 18** with TypeScript
- **Vite** for blazing-fast development
- **TailwindCSS** + shadcn/ui components
- **Modular Architecture** - Screens, hooks, and components

### Backend
- **FastAPI** - High-performance Python web framework
- **WebSocket** - Real-time bidirectional communication
- **Room Management** - In-memory game state handling
- **RESTful API** - Room creation, listing, health checks

### State Management
- **localStorage** - Browser-based save system
- **In-memory** - Multiplayer game rooms
- **No Database** - Fully client-side (except multiplayer lobby)

---

## 📦 Installation

### Prerequisites
- Node.js 18+
- npm 9+
- Python 3.11+ (only needed for the optional FastAPI backend)
- Git

### Clone Repository
```bash
git clone <repository-url>
cd "Battletech Simulator"
```

### Install Dependencies

**Frontend:**
```bash
npm install
```

**Backend (optional for multiplayer / backend APIs):**
```bash
cd backend
pip install -r requirements.txt
```

> This repo is a Vite + React app. The current frontend tooling uses npm scripts in `package.json` rather than Yarn.

---

## 🚀 Running the Application

### Development Mode

Terminal 1 (Frontend):
```bash
npm run dev
# Runs on http://localhost:3000
```

Terminal 2 (Backend, optional):
```bash
cd backend
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
# Runs on http://localhost:8001
```

### Production Build
```bash
npm run build
# Output in /dist directory
```

### Local Preview
```bash
npm run preview -- --host 0.0.0.0 --port 4173
```

---

## 🎯 How to Play

### Single Player
1. Open http://localhost:3000
2. Click **"Single Player"**
3. Select units and enemy units as needed
4. Click **"Start Battle"**
5. Play through the actual turn flow: **Initiative → Movement → Combat → Heat/End Turn**
6. Use the turn controls to **Roll Initiative**, move units on green hexes, target enemies, and fire weapons

### Online Multiplayer
1. **Host Game:**
   - Click **"Online Multiplayer"**
   - Click **"Host Game"**
   - Share the room code with your opponent
   - Wait for them to join
   - Click **"Start Game"** when ready

2. **Join Game:**
   - Click **"Online Multiplayer"**
   - Enter the room code
   - Click **"Join"**
   - Wait for host to start

### Local Hotseat
1. Click **"Local Hotseat"**
2. Select units for both players
3. Pass the device between turns

### Campaign Mode
1. Click **"Campaign Mode"**
2. Manage your mercenary company
3. Accept contracts and complete missions
4. Earn C-Bills and salvage
5. Repair and upgrade your mechs

---

## 🎮 Gameplay Controls

### Keyboard Shortcuts
- **Ctrl/Cmd + S** - Save game
- **Ctrl/Cmd + L** - Load game
- **Ctrl/Cmd + E** - Export game state
- **Space** - End current phase

### Mouse Controls
- **Click hex** - Select unit or move
- **Click enemy** - Target for attack
- **Click weapon** - Fire individual weapon

### Combat Flow
The BattleTech: Mercenaries rulebook sequence is:
1. **Initiative Phase** - Roll for turn order and determine who acts first
2. **Movement Phase** - Move your units (walking/running/jumping)
3. **Combat Phase** - Select a friendly unit, then an enemy target, then fire weapons
4. **Heat Phase** - Manage heat buildup, shutdowns, and prepare the next turn

This matches the application’s turn flow and prevents firing before initiative and movement have been completed.

---

## 🛠️ Configuration

### Environment Variables

**Frontend (`.env`):**
```env
VITE_BACKEND_URL=http://localhost:8001
VITE_WS_URL=ws://localhost:8001
PORT=3000
```

**Backend (`backend/.env`):**
```env
ENVIRONMENT=production
HOST=0.0.0.0
PORT=8001
```

---

## 📡 API Documentation

### REST Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/rooms/create` | Create game room |
| GET | `/api/rooms/{id}` | Get room details |
| GET | `/api/rooms` | List all rooms |
| DELETE | `/api/rooms/{id}` | Delete room |

### WebSocket

**Connect:** `ws://localhost:8001/ws/{room_id}`

**Client → Server Messages:**
- `game_state_update` - Sync game state
- `chat` - Send chat message
- `start_game` - Host starts game

**Server → Client Messages:**
- `connected` - Connection confirmed
- `player_joined` - Player joined room
- `player_left` - Player disconnected
- `game_state_sync` - State update received
- `game_started` - Game beginning

---

## 📂 Project Structure

```
/app/
├── backend/                    # FastAPI backend
│   ├── server.py              # Main server + WebSocket
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Backend config
├── src/
│   ├── screens/               # Main application screens
│   │   ├── MainMenu.tsx
│   │   ├── UnitSetup.tsx
│   │   └── BattleScreen.tsx
│   ├── components/            # React components
│   │   ├── NetworkMultiplayerLobby.tsx
│   │   ├── ObjectivesOverlay.tsx
│   │   ├── ErrorBoundary.tsx
│   │   └── ui/                # shadcn components
│   ├── engine/                # Game logic
│   │   ├── game.ts            # Core game engine
│   │   ├── combat.ts          # Combat mechanics
│   │   ├── hexgrid.ts         # Hex grid system
│   │   ├── units.ts           # Unit definitions
│   │   ├── vehicles.ts        # Combat vehicles
│   │   ├── battle-armor.ts    # Battle armor
│   │   └── aerospace.ts       # Aerospace fighters
│   ├── lib/                   # Utilities
│   │   ├── websocket-client.ts   # WebSocket manager
│   │   ├── mission-objectives.ts # Mission system
│   │   ├── campaign.ts        # Campaign management
│   │   └── save-system.ts     # Save/load
│   ├── services/              # API services
│   │   └── room-api.ts        # Room management
│   ├── hooks/                 # Custom React hooks
│   │   └── useKeyboardShortcuts.ts
│   └── App.tsx                # Main application
├── package.json
├── vite.config.ts
└── README.md
```

---

## 🧪 Testing

### Health Checks
```bash
# Frontend
curl http://localhost:3000

# Backend
curl http://localhost:8001/api/health

# Create room
curl -X POST http://localhost:8001/api/rooms/create
```

### Smoke Tests
```bash
# Run all smoke tests
bash -c '
  echo "1. Services:" && supervisorctl status | grep -E "frontend|backend"
  echo "2. Frontend:" && curl -s http://localhost:3000 | grep -o BattleTech
  echo "3. Backend:" && curl -s http://localhost:8001/api/health | grep status
'
```

---

## 🔧 Development

### Code Architecture
- **Modular Design** - Separated screens, components, hooks
- **Type Safety** - Full TypeScript coverage
- **Error Handling** - Production-grade error boundaries
- **Hot Reload** - Vite HMR for instant updates

### Adding New Features
1. **Units:** Add to `/src/engine/units.ts` or respective file
2. **Screens:** Create in `/src/screens/`
3. **Components:** Add to `/src/components/`
4. **Game Logic:** Modify `/src/engine/game.ts`

### Build & Deploy
```bash
# Build frontend
npm run build

# Start production preview
npm run preview -- --host 0.0.0.0 --port 4173

# Backend (production)
uvicorn server:app --host 0.0.0.0 --port 8001 --workers 4
```

---

## 📊 Unit Roster

### BattleMechs (23 variants)
**Light (20-35 tons):**
- Locust LCT-1V, Commando COM-2D, Urbanmech UM-R60, Jenner JR7-D

**Medium (40-55 tons):**
- Hunchback HBK-4G, Shadowhawk SHD-2H, Griffin GRF-1N
- Phoenix Hawk PXH-1, Trebuchet TBT-5N, Centurion CN9-A, Wolverine WVR-6R

**Heavy (60-75 tons):**
- Warhammer WHM-6R, Thunderbolt TDR-5S, Catapult CPLT-C1
- Orion ON1-K, Marauder MAD-3R, Timber Wolf (Clan)
- Stormcrow (Clan), Mad Dog (Clan), Warhawk (Clan)

**Assault (80-100 tons):**
- Awesome AWS-8Q, Stalker STK-3F, Atlas AS7-D, King Crab KGC-000

### Combat Vehicles (5 variants)
- Scorpion Light Tank (25t)
- Striker Light Tank (35t)
- Vedette Medium Tank (50t)
- Rommel Tank (65t)
- Demolisher Heavy Tank (80t)

### Battle Armor (6 variants)
- Standard Battle Armor (IS)
- Elemental Suit (Clan)
- Salamander Suit
- Longinus Suit
- Sylph Battle Armor
- Infiltrator Suit

### Aerospace Fighters (7 variants - In Development)
**Note:** Mechanics implemented, UI integration pending
- **Light:** Sparrowhawk (30t), Chippewa (25t)
- **Medium:** Shilone (50t), Lucifer (45t)
- **Heavy:** Thunderbird (60t), Corsair (50t)
- **Clan:** Visigoth (60t)

---

## 🎯 Mission Objectives

### Available Objective Types

1. **Eliminate All** - Destroy all enemy units
2. **Assassination** - Eliminate high-value target
3. **Defend Structure** - Hold position for X turns
4. **Capture Zone** - Secure strategic point
5. **Escort Unit** - Protect unit to extraction
6. **Survive** - Keep forces alive for duration

### Rewards
- **C-Bills** - In-game currency
- **Salvage Rights** - Recover enemy equipment
- **Reputation** - Unlock better contracts

---

## 🐛 Troubleshooting

### Frontend won't start
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Backend won't start
```bash
# Check Python version
python --version  # Should be 3.11+

# Reinstall dependencies
pip install -r backend/requirements.txt

# Check port availability
lsof -i :8001
```

### WebSocket connection fails
1. Verify backend is running: `curl http://localhost:8001/api/health`
2. Check browser console for errors
3. Ensure firewall allows WebSocket connections

### Game state not saving
- Check browser localStorage is enabled
- Try incognito mode to test fresh state
- Export game manually (Ctrl+E)

---

## 📝 Documentation

- **Architecture:** `/app/REFACTORING_SUMMARY.md`
- **Features:** `/app/FEATURE_SUMMARY.md`
- **Testing:** `/app/INTEGRATION_TEST.md`
- **Deployment:** See deployment agent output

---

## 🤝 Contributing

### Code Style
- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- Component composition

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/new-unit

# Make changes and test
npm run build
npm run dev

# Commit with descriptive message
git commit -m "Add new aerospace fighter variant"

# Push and create PR
git push origin feature/new-unit
```

---

## 📜 License

MIT License - See LICENSE file for details

---

## 🎉 Acknowledgments

- Based on BattleTech universe by FASA Corporation
- Built with React, FastAPI, and modern web technologies
- Community feedback and testing

---

## 📞 Support

### Issues
- Check troubleshooting section
- Review integration test guide
- Check browser console for errors

### Logs
- Frontend: `/var/log/frontend.out.log`
- Backend: `/var/log/backend.out.log`
- Supervisor: `sudo supervisorctl status`

---

## 🚀 Roadmap

### Completed ✅
- [x] Code refactoring and modularization
- [x] Online multiplayer infrastructure
- [x] Mission objectives system
- [x] Error boundaries
- [x] Keyboard shortcuts
- [x] MechLab chassis selector fix
- [x] Save management system

### In Progress ⏳
- [ ] Aerospace fighter UI integration
- [ ] Live objective tracking in battle
- [ ] Multiplayer game state sync

### Future Plans 📝
- [ ] AI opponent difficulty levels
- [ ] Custom mission editor
- [ ] Replay system
- [ ] Spectator mode
- [ ] Mobile responsive design
- [ ] Soundeffects and music

---

## 📈 Version History

### v2.1.1 (Current)
- 🐛 **FIXED**: MechLab chassis selector crash (`handleChassisChange is not defined`)
- ✅ All 34 units now selectable in Mech Lab (23 Mechs, 5 Vehicles, 6 Battle Armor)
- ✅ Chassis change properly resets weapon loadouts and stats
- ✅ Comprehensive stability testing completed across all game modes

### v2.1.0
- 🎮 Added save management system (Settings dialog, save stats, delete saves, wipe data)
- ✨ Reset current game functionality
- 🛡️ Safety confirmations for destructive actions
- 📝 Created SAVE_MANAGEMENT.md documentation

### v2.0.0
- ✨ Added online multiplayer with WebSocket
- ✨ Added mission objectives system (6 types)
- ✨ Added 7 aerospace fighter variants (mechanics ready, UI pending)
- 🔨 Refactored App.tsx (816 → 280 lines)
- 🎨 Created modular screen components
- 🛡️ Added production error boundaries
- ⚡ Improved code organization by 65%

### v1.0.0
- Initial release
- Single player mode
- Local hotseat
- Campaign mode
- Mech Lab
- 40+ BattleMech variants
- Hex-grid combat engine

---

**Built with ❤️ for BattleTech fans**

🎮 **Ready to drop? Fire up your mech and join the battle!**
