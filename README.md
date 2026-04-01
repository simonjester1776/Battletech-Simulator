# ⚔️ BattleTech Tactical Simulator

A comprehensive, full-stack BattleTech tactical combat simulator with real-time multiplayer, campaign mode, and advanced combat mechanics.

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/React-18.3.1-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-3178c6.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115.0-009688.svg)

---

## 🎮 Features

### Core Gameplay
- **Hex-based Tactical Combat** - Classic BattleTech tabletop rules
- **Turn-based Strategy** - Movement, combat, and heat management phases
- **40+ Unit Variants** - Mechs, Vehicles, Battle Armor, and Aerospace Fighters
- **Advanced Combat** - Armor damage, heat sinks, weapon systems, physical attacks
- **Campaign Mode** - Build your mercenary company with progression
- **Mech Lab** - Customize and configure your units

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
- **Combat Vehicles** - Armor, hover, and tracked units
- **Battle Armor** - Infantry in powered suits
- **Aerospace Fighters (NEW!)** - 7 fighter variants with altitude-based combat

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
- Node.js 18+ and Yarn
- Python 3.11+
- Git

### Clone Repository
```bash
git clone <repository-url>
cd battletech-simulator
```

### Install Dependencies

**Frontend:**
```bash
yarn install
```

**Backend:**
```bash
cd backend
pip install -r requirements.txt
```

---

## 🚀 Running the Application

### Development Mode

**Option 1: Using Supervisor (Recommended)**
```bash
sudo supervisorctl start frontend
sudo supervisorctl start backend
sudo supervisorctl status
```

**Option 2: Manual Start**

Terminal 1 (Frontend):
```bash
yarn start
# Runs on http://localhost:3000
```

Terminal 2 (Backend):
```bash
cd backend
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
# Runs on http://localhost:8001
```

### Production Build
```bash
yarn build
# Output in /dist directory
```

---

## 🎯 How to Play

### Single Player
1. Open http://localhost:3000
2. Click **"Single Player"**
3. Select your units and enemy units
4. Click **"Start Battle"**
5. Play through Movement → Combat → Heat phases

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
1. **Initiative Phase** - Roll for turn order
2. **Movement Phase** - Move your units (walking/running/jumping)
3. **Combat Phase** - Declare targets and fire weapons
4. **Heat Phase** - Manage heat buildup and shutdowns

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
yarn build

# Start production
yarn start

# Backend (production)
uvicorn server:app --host 0.0.0.0 --port 8001 --workers 4
```

---

## 📊 Unit Roster

### BattleMechs (40+ variants)
- **Light:** Locust, Jenner, Commando, Raven, Kit Fox
- **Medium:** Hunchback, Centurion, Griffin, Wolverine, Shadow Cat
- **Heavy:** Warhammer, Marauder, Archer, Thunderbolt, Timber Wolf
- **Assault:** Atlas, Awesome, Stalker, Zeus, Dire Wolf

### Combat Vehicles
- Scorpion Light Tank, Vedette Medium Tank, Manticore Heavy Tank

### Battle Armor
- Elemental Suit, Inner Sphere Standard

### Aerospace Fighters (NEW!)
- **Light:** Sparrowhawk, Chippewa
- **Medium:** Shilone, Lucifer
- **Heavy:** Thunderbird, Corsair
- **Clan:** Visigoth

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
rm -rf node_modules yarn.lock
yarn install
yarn start
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
yarn build
yarn start

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
- [x] Aerospace fighter units
- [x] Mission objectives system
- [x] Error boundaries
- [x] Keyboard shortcuts

### In Progress ⏳
- [ ] Aerospace UI integration
- [ ] Live objective tracking
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

### v2.0.0 (Current)
- ✨ Added online multiplayer with WebSocket
- ✨ Added 7 aerospace fighter variants
- ✨ Added mission objectives system (6 types)
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
