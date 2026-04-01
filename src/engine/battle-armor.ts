// Battle Armor Units for BattleTech

import type { Unit, Weapon, Location } from '@/types/battletech';
import { UnitType, Config, WeaponType, MovementMode } from '@/types/battletech';

// Helper for battle armor (simplified location structure)
function createBattleArmorLocations(
  armor: number,
  structure: number
): Map<string, Location> {
  const locations = new Map<string, Location>();
  
  // Battle armor uses simplified damage tracking
  locations.set('SQUAD', {
    name: 'SQUAD',
    armor,
    maxArmor: armor,
    structure,
    maxStructure: structure,
    criticals: []
  });
  
  return locations;
}

function createWeapon(
  id: string, name: string, damage: number, heat: number,
  minRange: number, shortRange: number, mediumRange: number, longRange: number,
  type: WeaponType, location: string, shots: number = 999,
  options: Partial<Weapon> = {}
): Weapon {
  return {
    id, name, damage, heat, minRange, shortRange, mediumRange, longRange,
    type, location, shotsRemaining: shots,
    criticalSlots: options.criticalSlots || 1,
    tonnage: options.tonnage || 0.1,
    isCluster: options.isCluster || false,
    isStreak: options.isStreak || false,
    ammoPerTon: options.ammoPerTon
  };
}

// Elemental Battle Armor (Clan) - 5 troopers
export function createElemental(): Unit {
  return {
    id: `elemental-${Date.now()}`,
    name: 'Elemental Battle Armor',
    unitType: UnitType.BATTLE_ARMOR,
    config: Config.BIPED,
    tonnage: 1, // 1 ton per trooper x 5
    bv2: 548,
    walkingMP: 1,
    runningMP: 2,
    jumpingMP: 3,
    currentMP: 1,
    movementMode: MovementMode.STANDING,
    heat: 0,
    heatSinks: 0,
    doubleHeatSinks: false,
    locations: createBattleArmorLocations(10, 5), // 2 armor per trooper
    weapons: [
      createWeapon('slas1', 'Small Laser', 3, 1, 0, 1, 2, 3, WeaponType.ENERGY, 'SQUAD', 999),
      createWeapon('slas2', 'Small Laser', 3, 1, 0, 1, 2, 3, WeaponType.ENERGY, 'SQUAD', 999),
      createWeapon('srm2', 'SRM-2', 4, 0, 0, 3, 6, 9, WeaponType.MISSILE, 'SQUAD', 10)
    ],
    ammo: [
      { type: 'SRM-2', shots: 10, location: 'SQUAD', explosive: false }
    ],
    hasECM: false, hasAMS: false, hasCASE: false, hasXLEngine: false,
    hasXXLEngine: false, hasCompactEngine: false, hasTSM: false, hasMASC: false,
    engineHits: 0, gyroHits: 0, sensorHits: 0, lifeSupportHits: 0,
    pilot: { name: 'Point Commander', gunnery: 3, piloting: 4, hits: 0, conscious: true },
    alive: true, shutdown: false, prone: false, immobile: false, position: null, facing: 0
  };
}

// Standard Inner Sphere Battle Armor - 4 troopers
export function createStandardBA(): Unit {
  return {
    id: `standardba-${Date.now()}`,
    name: 'Standard Battle Armor',
    unitType: UnitType.BATTLE_ARMOR,
    config: Config.BIPED,
    tonnage: 1,
    bv2: 282,
    walkingMP: 1,
    runningMP: 2,
    jumpingMP: 3,
    currentMP: 1,
    movementMode: MovementMode.STANDING,
    heat: 0,
    heatSinks: 0,
    doubleHeatSinks: false,
    locations: createBattleArmorLocations(8, 4),
    weapons: [
      createWeapon('ml', 'Medium Laser', 5, 3, 0, 3, 6, 9, WeaponType.ENERGY, 'SQUAD', 999),
      createWeapon('srm2', 'SRM-2', 4, 0, 0, 3, 6, 9, WeaponType.MISSILE, 'SQUAD', 10)
    ],
    ammo: [
      { type: 'SRM-2', shots: 10, location: 'SQUAD', explosive: false }
    ],
    hasECM: false, hasAMS: false, hasCASE: false, hasXLEngine: false,
    hasXXLEngine: false, hasCompactEngine: false, hasTSM: false, hasMASC: false,
    engineHits: 0, gyroHits: 0, sensorHits: 0, lifeSupportHits: 0,
    pilot: { name: 'Squad Leader', gunnery: 4, piloting: 5, hits: 0, conscious: true },
    alive: true, shutdown: false, prone: false, immobile: false, position: null, facing: 0
  };
}

// Salamander Battle Armor (Clan) - 5 troopers, Flamers
export function createSalamander(): Unit {
  return {
    id: `salamander-${Date.now()}`,
    name: 'Salamander Battle Armor',
    unitType: UnitType.BATTLE_ARMOR,
    config: Config.BIPED,
    tonnage: 1,
    bv2: 414,
    walkingMP: 2,
    runningMP: 3,
    jumpingMP: 3,
    currentMP: 2,
    movementMode: MovementMode.STANDING,
    heat: 0,
    heatSinks: 0,
    doubleHeatSinks: false,
    locations: createBattleArmorLocations(10, 5),
    weapons: [
      createWeapon('flamer1', 'Flamer', 2, 3, 0, 1, 2, 3, WeaponType.ENERGY, 'SQUAD', 999),
      createWeapon('flamer2', 'Flamer', 2, 3, 0, 1, 2, 3, WeaponType.ENERGY, 'SQUAD', 999),
      createWeapon('mg', 'Machine Gun', 2, 0, 0, 1, 2, 3, WeaponType.MACHINE_GUN, 'SQUAD', 100)
    ],
    ammo: [
      { type: 'Machine Gun', shots: 100, location: 'SQUAD', explosive: false }
    ],
    hasECM: false, hasAMS: false, hasCASE: false, hasXLEngine: false,
    hasXXLEngine: false, hasCompactEngine: false, hasTSM: false, hasMASC: false,
    engineHits: 0, gyroHits: 0, sensorHits: 0, lifeSupportHits: 0,
    pilot: { name: 'Point Commander', gunnery: 3, piloting: 4, hits: 0, conscious: true },
    alive: true, shutdown: false, prone: false, immobile: false, position: null, facing: 0
  };
}

// Longinus Battle Armor (Inner Sphere) - 4 troopers, Heavy weapons
export function createLonginus(): Unit {
  return {
    id: `longinus-${Date.now()}`,
    name: 'Longinus Battle Armor',
    unitType: UnitType.BATTLE_ARMOR,
    config: Config.BIPED,
    tonnage: 2,
    bv2: 524,
    walkingMP: 1,
    runningMP: 2,
    jumpingMP: 2,
    currentMP: 1,
    movementMode: MovementMode.STANDING,
    heat: 0,
    heatSinks: 0,
    doubleHeatSinks: false,
    locations: createBattleArmorLocations(12, 6),
    weapons: [
      createWeapon('mpl', 'Medium Pulse Laser', 6, 4, 0, 2, 4, 6, WeaponType.ENERGY, 'SQUAD', 999),
      createWeapon('srm4', 'SRM-4', 8, 0, 0, 3, 6, 9, WeaponType.MISSILE, 'SQUAD', 15)
    ],
    ammo: [
      { type: 'SRM-4', shots: 15, location: 'SQUAD', explosive: false }
    ],
    hasECM: false, hasAMS: false, hasCASE: false, hasXLEngine: false,
    hasXXLEngine: false, hasCompactEngine: false, hasTSM: false, hasMASC: false,
    engineHits: 0, gyroHits: 0, sensorHits: 0, lifeSupportHits: 0,
    pilot: { name: 'Squad Leader', gunnery: 4, piloting: 5, hits: 0, conscious: true },
    alive: true, shutdown: false, prone: false, immobile: false, position: null, facing: 0
  };
}

// Sylph Battle Armor (Clan) - 5 troopers, Scout/Fast
export function createSylph(): Unit {
  return {
    id: `sylph-${Date.now()}`,
    name: 'Sylph Battle Armor',
    unitType: UnitType.BATTLE_ARMOR,
    config: Config.BIPED,
    tonnage: 1,
    bv2: 376,
    walkingMP: 3,
    runningMP: 5,
    jumpingMP: 5,
    currentMP: 3,
    movementMode: MovementMode.STANDING,
    heat: 0,
    heatSinks: 0,
    doubleHeatSinks: false,
    locations: createBattleArmorLocations(8, 4),
    weapons: [
      createWeapon('erml', 'ER Medium Laser', 7, 5, 0, 3, 8, 15, WeaponType.ENERGY, 'SQUAD', 999),
      createWeapon('mg', 'Machine Gun', 2, 0, 0, 1, 2, 3, WeaponType.MACHINE_GUN, 'SQUAD', 100)
    ],
    ammo: [
      { type: 'Machine Gun', shots: 100, location: 'SQUAD', explosive: false }
    ],
    hasECM: true, hasAMS: false, hasCASE: false, hasXLEngine: false,
    hasXXLEngine: false, hasCompactEngine: false, hasTSM: false, hasMASC: false,
    engineHits: 0, gyroHits: 0, sensorHits: 0, lifeSupportHits: 0,
    pilot: { name: 'Point Commander', gunnery: 3, piloting: 4, hits: 0, conscious: true },
    alive: true, shutdown: false, prone: false, immobile: false, position: null, facing: 0
  };
}

// Infiltrator Mk. I Battle Armor (Inner Sphere) - 4 troopers, Stealth
export function createInfiltrator(): Unit {
  return {
    id: `infiltrator-${Date.now()}`,
    name: 'Infiltrator Mk. I',
    unitType: UnitType.BATTLE_ARMOR,
    config: Config.BIPED,
    tonnage: 1,
    bv2: 338,
    walkingMP: 2,
    runningMP: 3,
    jumpingMP: 3,
    currentMP: 2,
    movementMode: MovementMode.STANDING,
    heat: 0,
    heatSinks: 0,
    doubleHeatSinks: false,
    locations: createBattleArmorLocations(9, 5),
    weapons: [
      createWeapon('slas', 'Small Laser', 3, 1, 0, 1, 2, 3, WeaponType.ENERGY, 'SQUAD', 999),
      createWeapon('mg1', 'Machine Gun', 2, 0, 0, 1, 2, 3, WeaponType.MACHINE_GUN, 'SQUAD', 100),
      createWeapon('mg2', 'Machine Gun', 2, 0, 0, 1, 2, 3, WeaponType.MACHINE_GUN, 'SQUAD', 100)
    ],
    ammo: [
      { type: 'Machine Gun', shots: 200, location: 'SQUAD', explosive: false }
    ],
    hasECM: true, hasAMS: false, hasCASE: false, hasXLEngine: false,
    hasXXLEngine: false, hasCompactEngine: false, hasTSM: false, hasMASC: false,
    engineHits: 0, gyroHits: 0, sensorHits: 0, lifeSupportHits: 0,
    pilot: { name: 'Squad Leader', gunnery: 4, piloting: 5, hits: 0, conscious: true },
    alive: true, shutdown: false, prone: false, immobile: false, position: null, facing: 0
  };
}
