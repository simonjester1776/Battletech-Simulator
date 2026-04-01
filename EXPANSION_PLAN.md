# BattleTech Comprehensive Expansion Plan

## Vision
Transform the tactical simulator into a comprehensive indie BattleTech experience with multiplayer battles, campaign progression, and extensive unit/rules coverage.

## Phase 1: Core Infrastructure (Current Focus)
### 1.1 Multiplayer System
- [x] WebSocket server for real-time battles
- [ ] Lobby system for matchmaking
- [ ] Hot-seat mode (local 2-player)
- [ ] Network play with room codes
- [ ] Spectator mode
- [ ] Replay system

### 1.2 Campaign Framework
- [ ] Player profile system
- [ ] Mercenary company management
- [ ] Mission generator
- [ ] Salvage system
- [ ] Mech repair & maintenance
- [ ] C-Bill economy
- [ ] Pilot roster & advancement
- [ ] Reputation system

## Phase 2: Rules Expansion
### 2.1 Advanced Combat Rules
- [ ] Physical attacks (Punch, Kick, Charge, DFA)
- [ ] Melee weapons (Hatchet, Sword, etc.)
- [ ] Partial cover mechanics
- [ ] Elevation effects (height advantage)
- [ ] Advanced movement (Sprinting, Evade)
- [ ] Floating criticals
- [ ] MASC & TSM effects
- [ ] Advanced heat effects

### 2.2 Special Equipment
- [ ] ECM/BAP systems
- [ ] C3 networks
- [ ] TAG & Arrow IV
- [ ] Stealth Armor
- [ ] Reactive/Ferro-Fibrous armor
- [ ] Targeting computers
- [ ] Guardian ECM

## Phase 3: Unit Expansion
### 3.1 Mechs (Target: 50+ variants)
**Priority Additions:**
- Light: Raven, Spider, Wolfhound, Panther, Mongoose
- Medium: Shadowhawk, Griffin, Trebuchet, Enforcer, Phoenix Hawk
- Heavy: Thunderbolt, Orion, Grasshopper, Black Knight, Rifleman
- Assault: Highlander, Banshee, Victor, Zeus, Cyclops

**Clan Mechs:**
- Kit Fox, Adder, Stormcrow, Mad Dog, Warhawk, Executioner, Gargoyle

### 3.2 Combat Vehicles (Target: 20+)
- Light: Scorpion, Locust (hover), Striker
- Medium: Bulldog, Vedette, Pegasus
- Heavy: Rommel, Manticore, Demolisher
- Assault: Behemoth, Schrek PPC Carrier

### 3.3 Battle Armor (Target: 10+)
- Inner Sphere: Standard, Longinus, Sloth, Infiltrator
- Clan: Elemental, Salamander, Sylph, Gnome

### 3.4 Aerospace
- Light: Chippewa, Sparrowhawk
- Medium: Corsair, Thunderbird  
- Heavy: Shilone, Lucifer

## Phase 4: Campaign Content
### 4.1 Mission Types
- [ ] Assassination
- [ ] Escort
- [ ] Base defense
- [ ] Recon
- [ ] Capture
- [ ] Pirate hunting
- [ ] Planetary assault

### 4.2 Progression Systems
- [ ] Pilot skills (Gunnery, Piloting, Special Abilities)
- [ ] Mech customization (weapon swaps, armor allocation)
- [ ] Tech advancement (LosTech discoveries)
- [ ] Company reputation (affects contracts)
- [ ] Financial management

### 4.3 Narrative Content
- [ ] Succession Wars era missions
- [ ] Clan Invasion storyline
- [ ] Mercenary career path
- [ ] Multiple endings based on choices

## Phase 5: Advanced Features
### 5.1 Map Editor
- [ ] Custom hex terrain
- [ ] Building placement
- [ ] Elevation editor
- [ ] Scenario creator

### 5.2 Mod Support
- [ ] Custom mech import (JSON format)
- [ ] Custom missions
- [ ] Balance tweaking tools

### 5.3 Tournament Mode
- [ ] Ranked matchmaking
- [ ] BV-balanced force selection
- [ ] Leaderboards
- [ ] Competitive rulesets

## Technical Requirements

### Backend Additions
- WebSocket server (Socket.io or native WS)
- Campaign database (SQLite or IndexedDB)
- Mission generator engine
- Salvage/economy calculator
- AI improvement for mission variety

### Frontend Enhancements
- Multiplayer lobby UI
- Campaign management screens
- Mech lab interface
- Pilot management UI
- Mission briefing/debriefing screens

### Data Structure
- Expanded unit database
- Mission templates
- Loot tables
- Tech progression trees
- Contract/mission data

## Timeline Estimate
- **Phase 1**: 3-4 implementation sessions
- **Phase 2**: 2-3 sessions
- **Phase 3**: 4-5 sessions (content heavy)
- **Phase 4**: 3-4 sessions
- **Phase 5**: 2-3 sessions (polish)

**Total**: ~15-20 major development sessions to reach comprehensive status

## Success Criteria
- ✅ 50+ playable units
- ✅ Full multiplayer support
- ✅ Working campaign with 10+ mission types
- ✅ Salvage & progression systems
- ✅ Advanced combat rules
- ✅ Polished UX rivaling commercial sims

## Current Status: Phase 1 - Session 1
**Completed:**
- 16 mech variants
- Save/load system
- Bug fixes
- Quality of life improvements

**Next Steps:**
- Implement WebSocket multiplayer
- Create campaign framework
- Add 15 more mech variants
- Add combat vehicle support
