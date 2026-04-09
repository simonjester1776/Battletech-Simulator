# MechLab Quick Start Guide

## Getting Started

### 1. **Selecting a Mech**
- Open the MechLab
- Navigate to the **Chassis Selection** tab
- Browse available mech classes:
  - **Light** (20-35 tons)
  - **Medium** (40-55 tons)
  - **Heavy** (60-75 tons)
  - **Assault** (80-100 tons)
- Click your desired mech to load its base configuration

### 2. **Understanding the Layout**

```
┌─ MechLab ─────────────────────────────────┐
│                                              │
│ [Chassis] [Weapons] [Armor] [Equipment]     │
│                                              │
│ ┌─ Component Details ──────────┐            │
│ │ • Tonnage: 50.5 / 60t        │            │
│ │ • Critical Slots: 52 / 78    │            │
│ │ • Heat: 8 dissipation        │            │
│ │ • BV2: 3,245 (base)          │            │
│ └──────────────────────────────┘            │
│                                              │
│ [⚠️ OVERLOADED if constraints violated]    │
└──────────────────────────────────────────────┘
```

### 3. **Adding Weapons**
- Click **Weapons** tab
- Select weapon category:
  - Ballistic Weapons
  - Energy Weapons
  - Missile Weapons
  - Special Weapons
- Choose specific weapon (e.g., PPC, AC/20, LRM-20)
- Weapon automatically assigned to available hardpoint
- **Summary updates in real-time**

### 4. **Distributing Armor**
- Click **Armor** tab
- Adjust armor per location:
  - Center Torso (CT)
  - Left/Right Torso (LT/RT)
  - Left/Right Arm (LA/RA)
  - Left/Right Leg (LL/RL)
  - Head
- Green bars = allocating armor (within limits)
- Red bars = exceeding armor capacity
- Unarmored locations are vulnerabilities

### 5. **Adding Equipment**
- Click **Equipment & Ammo** tab
- Available slots show remaining capacity
- Add:
  - Ammunition (required for ballistic/missile weapons)
  - Heat Sinks
  - Gyrog systems
  - Cockpit upgrades

## Key Indicators

### Color Coding
| Color | Meaning | Action |
|-------|---------|--------|
| 🟢 Green | Within limits | ✅ Safe to proceed |
| 🔴 Red | Over limit | ⚠️ Reduce components |
| 🟡 Yellow | Warning | ℹ️ Informational |

### Status Bar
- **Tonnage**: Current / Maximum
- **Critical Slots**: Used / Total (78)
- **Heat**: Dissipation efficiency
- **Battle Value**: Estimated power level

## Understanding Constraints

### Tonnage System
```
Available = Base Mech Tonnage
Used = All components (weapons, armor, equipment)

Example (Centurion @ 50 tons):
- Base weight: 50t
- Weapons + ammo: 18t
- Armor: 15.5t
- Equipment: 3.5t
├─ Gyro: 2.5t
├─ Heat Sinks: 0.5t
└─ Engine: ?
Total Used: 37t / 50t ✅
```

### Critical Slots
```
Each mech has 78 total critical slots:
- Torsos: 12 slots each
- Arms: 12 slots each
- Legs: 6 slots each
- Head: 6 slots

Weapons/Equipment consume slots based on tonnage and type
- Small weapons: 1 slot
- Medium weapons: 2-3 slots
- Large weapons: 4+ slots

Visual warning when approaching limit!
```

### Heat Management
```
Heat Dissipation = Base dissipation + Equipment

Example:
- Base dissipation: 10 points/turn
- Heat Sinks: +10 more
- Total cooling: 20 points/turn
- Weapon heat generation: 6 per medium laser
```

## Common Loadout Patterns

### Balanced Build
- **Weapons**: Mix of ballistic + energy
- **Armor**: Full coverage
- **Heat**: Self-sufficient (weapons ≤ dissipation)
- **Result**: Reliable mid-range combatant

### Brawler Build
- **Weapons**: Close-range (AC, SRMs, flamers)
- **Armor**: Maximum (80%+ tonnage to armor)
- **Heat**: Overheated acceptable (short engagement)
- **Result**: Durable short-range fighter

### Sniper Build
- **Weapons**: Long-range (PPCs, LRMs, ACs)
- **Armor**: Moderate (50% tonnage)
- **Heat**: Very efficient (low generation)
- **Result**: Effective at range, fragile close-in

### Missile Platform Build
- **Weapons**: LRM racks + ammo (multiple types)
- **Armor**: Moderate
- **Heat**: Very low (missiles don't generate heat)
- **Result**: Support role, indirect fire

## Troubleshooting

### "Build is Overloaded"
**Problem**: Red warning box appears
**Solutions**:
1. Remove excess armor from less-critical locations
2. Replace heavy weapons with lighter alternatives
3. Increase mech tonnage class
4. Reduce ammunition loadout

### "Cannot Add More Weapons"
**Problem**: No more hardpoints or critical slots
**Solutions**:
1. Check remaining critical slots in Summary
2. Remove less-effective weapons
3. Replace with more efficient weapon (higher damage/tonnage ratio)
4. Consider switching to larger mech

### "Build is Too Hot"
**Problem**: Weapon heat > dissipation capacity
**Cautions**:
- Mech will overheat quickly in combat
- Consider:
  - Adding heat sinks
  - Reducing weapon count
  - Choosing cooler alternatives

### "Armor Not Distributing"
**Problem**: Cannot add armor to certain locations
**Check**:
1. Is overall tonnage budget exceeded?
2. Are critical slots maxed out?
3. Try removing some weapons first

## Tips for Optimal Builds

### 1. **Balance Trinity**
- ✅ Firepower (weapons output)
- ✅ Protection (armor + heat management)
- ✅ Mobility (tonnage efficiency)

### 2. **Loadout Efficiency**
- Prioritize medium-range weapons (versatile)
- Full armor coverage (no exposed locations)
- Heat efficiency ≥ 1.0 (cool enough for sustained fire)

### 3. **Specialization Strategy**
- Decide role first (brawler, sniper, support)
- Build tools to match role
- Accept limitations (heat tank is weak at range)

### 4. **Ammunition Management**
- Always carry minimum 2x ammunition per weapon
- Mix ammo types for versatility
- Consider tonnage cost vs. firepower gain

## Advanced Features

### Saving Loadouts (When Available)
- Planned for v2.3
- Save favorite configurations
- Quick-load templates

### Loadout Comparison
- Planned for v2.3
- Compare two builds side-by-side
- See advantages/disadvantages

### AI Suggestions
- Planned for v2.4
- Smart configuration recommendations
- Automated optimization

## Support & Feedback

For issues or suggestions about MechLab:
1. Check if build is valid (no red warnings)
2. Verify all components are compatible
3. Consult the Enhancement document for known limitations

---

**Last Updated**: 2024  
**Version**: 1.0
