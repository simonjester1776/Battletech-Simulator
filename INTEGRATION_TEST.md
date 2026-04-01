# BattleTech Tactical Simulator - Integration Test Guide

## Test Suite for All New Features

### Phase 1: Refactoring Tests ✅

**Test 1.1: Main Menu Navigation**
1. Open http://localhost:3000
2. Verify 5 buttons are visible:
   - Single Player (blue)
   - Campaign Mode (purple)
   - Local Hotseat (green)
   - Online Multiplayer (cyan) ← NEW
   - Mech Lab (orange)
3. All buttons should have smooth hover effects

**Test 1.2: Code Quality**
- App.tsx reduced from 816 to 280 lines ✅
- New modular structure in /src/screens/ ✅
- Error boundary wraps entire app ✅

---

### Phase 2: Multiplayer Tests 🆕

**Test 2.1: Backend Health Check**
```bash
curl http://localhost:8001/api/health
# Expected: {"status":"healthy","service":"battletech-multiplayer",...}
```

**Test 2.2: Create Room**
```bash
curl -X POST http://localhost:8001/api/rooms/create
# Expected: {"room_id":"abc12345","status":"created"}
```

**Test 2.3: UI Flow - Host Game**
1. Click "Online Multiplayer"
2. Backend health check should pass (green WiFi icon)
3. Click "Host Game"
4. Room code appears (8 characters)
5. Click "Copy" button → code copied to clipboard
6. Player count shows "1 player connected"
7. "Start Game" button is disabled (need 2+ players)

**Test 2.4: UI Flow - Join Game** (requires 2 browser tabs)
Tab 1: Host game → get room code (e.g., "abc12345")
Tab 2:
1. Click "Online Multiplayer"
2. Enter room code in "Join Game" section
3. Click "Join"
4. Should connect to same lobby
5. Both tabs show "2 players connected"
6. Host can now click "Start Game"

---

### Phase 3: Aerospace Fighters Tests 🆕

**Test 3.1: Verify Aerospace Units Exist**
```bash
grep -r "Sparrowhawk\|Shilone\|Thunderbird\|Visigoth" /app/src/engine/aerospace.ts
# Should find all 7 fighter variants
```

**Test 3.2: Check Combat Mechanics**
- Altitude system (6 levels) ✅
- Air-to-ground modifiers ✅
- Air-to-air dogfighting ✅
- Thrust & fuel management ✅

**Integration Status:** 
- ⚠️ Aerospace fighters NOT yet in unit selection UI
- ✅ All mechanics implemented and ready
- 📝 Next: Add to getAllUnitsAndVehicles() export

---

### Phase 4: Mission Objectives Tests 🆕

**Test 4.1: Objectives Overlay in Battle**
1. Start any game (Single Player or Hotseat)
2. During battle, look for objectives panel below hex grid
3. Should show: "Eliminate All Hostiles" with REQ badge
4. Progress indicator (not yet functional - needs game integration)

**Test 4.2: Objective Types Available**
- ✅ Eliminate All
- ✅ Assassination
- ✅ Defend Structure  
- ✅ Capture Zone
- ✅ Escort Unit
- ✅ Survive

**Test 4.3: Rewards System**
Each objective has:
- C-Bills (150,000 for elimination mission)
- Salvage picks (3 for elimination)
- Reputation points (+10 for elimination)

---

## Quick Smoke Test (5 minutes)

```bash
# 1. Services running?
sudo supervisorctl status
# Expected: frontend RUNNING, backend RUNNING

# 2. Frontend loads?
curl -s http://localhost:3000 | grep -i battletech
# Expected: HTML with "BattleTech Tactical Simulator"

# 3. Backend API works?
curl http://localhost:8001/api/health
# Expected: JSON with "healthy" status

# 4. Multiplayer create room?
curl -X POST http://localhost:8001/api/rooms/create
# Expected: room_id returned

# 5. Build has no errors in new code?
cd /app && yarn build 2>&1 | grep "src/screens\|src/lib/websocket\|src/lib/mission"
# Expected: No error lines (pre-existing warnings OK)
```

---

## Known Issues / TODO

1. **Aerospace Integration:** Need to add fighters to unit selection dropdown
2. **Objectives Integration:** Need to update objectives during battle based on game state
3. **Multiplayer Sync:** WebSocket connected but game state sync not yet implemented
4. **Testing:** E2E testing with playwright needed for full validation

---

## Success Criteria

- ✅ All 4 phases implemented
- ✅ No breaking changes to existing features
- ✅ Local hotseat still works
- ✅ Frontend + Backend both running
- ✅ Mission objectives visible in battle
- ⏳ Network multiplayer lobby functional (game sync pending)
- ⏳ Aerospace fighters ready (UI integration pending)

---

## Next Steps for Full Integration

1. Add aerospace fighters to UnitSetup.tsx dropdown
2. Connect mission objectives to actual game events
3. Implement multiplayer game state synchronization
4. Add turn-by-turn WebSocket sync
5. Full E2E testing with playwright
