// Combat Vehicles for BattleTech

import type { Unit, Weapon, Location } from '@/types/battletech';
import { UnitType, Config, WeaponType, MovementMode } from '@/types/battletech';

// Helper for vehicle locations (Front, Left, Right, Rear, Turret)
function createVehicleLocations(
  armor: { [key: string]: number },
  structure: { [key: string]: number }
): Map<string, Location> {
  const locations = new Map<string, Location>();
  const locNames = ['FRONT', 'LEFT', 'RIGHT', 'REAR', 'TURRET'];
  
  locNames.forEach(name => {
    locations.set(name, {
      name,
      armor: armor[name] || 0,
      maxArmor: armor[name] || 0,
      structure: structure[name] || 0,
      maxStructure: structure[name] || 0,
      criticals: [] // Vehicles don't use critical hit system like mechs
    });
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
    tonnage: options.tonnage || 1,
    isCluster: options.isCluster || false,
    isStreak: options.isStreak || false,
    ammoPerTon: options.ammoPerTon
  };
}

// Scorpion Light Tank (25 tons)
export function createScorpion(): Unit {
  return {
    id: `scorpion-${Date.now()}`,
    name: 'Scorpion Light Tank',
    unitType: UnitType.VEHICLE,
    config: Config.BIPED, // Using BIPED as placeholder for tracked
    tonnage: 25,
    bv2: 382,
    walkingMP: 7,
    runningMP: 11,
    jumpingMP: 0,
    currentMP: 7,
    movementMode: MovementMode.STANDING,
    heat: 0,
    heatSinks: 1,
    doubleHeatSinks: false,
    locations: createVehicleLocations(
      { FRONT: 22, LEFT: 18, RIGHT: 18, REAR: 14, TURRET: 18 },
      { FRONT: 3, LEFT: 3, RIGHT: 3, REAR: 3, TURRET: 3 }
    ),
    weapons: [
      createWeapon('ac5', 'AC/5', 5, 1, 3, 6, 12, 18, WeaponType.BALLISTIC, 'TURRET', 40, { tonnage: 8 }),
      createWeapon('srm2', 'SRM-2', 4, 2, 0, 3, 6, 9, WeaponType.MISSILE, 'TURRET', 50, { tonnage: 1 })
    ],
    ammo: [
      { type: 'AC/5', shots: 40, location: 'TURRET', explosive: true },
      { type: 'SRM-2', shots: 50, location: 'TURRET', explosive: true }
    ],
    hasECM: false, hasAMS: false, hasCASE: false, hasXLEngine: false,
    hasXXLEngine: false, hasCompactEngine: false, hasTSM: false, hasMASC: false,
    engineHits: 0, gyroHits: 0, sensorHits: 0, lifeSupportHits: 0,
    pilot: { name: 'Vehicle Crew', gunnery: 4, piloting: 5, hits: 0, conscious: true },
    alive: true, shutdown: false, prone: false, immobile: false, position: null, facing: 0
  };
}

// Vedette Medium Tank (50 tons)
export function createVedette(): Unit {
  return {
    id: `vedette-${Date.now()}`,
    name: 'Vedette Medium Tank',
    unitType: UnitType.VEHICLE,
    config: Config.BIPED,
    tonnage: 50,
    bv2: 615,
    walkingMP: 5,
    runningMP: 8,
    jumpingMP: 0,
    currentMP: 5,
    movementMode: MovementMode.STANDING,
    heat: 0,
    heatSinks: 1,
    doubleHeatSinks: false,
    locations: createVehicleLocations(
      { FRONT: 32, LEFT: 26, RIGHT: 26, REAR: 20, TURRET: 26 },
      { FRONT: 5, LEFT: 5, RIGHT: 5, REAR: 5, TURRET: 5 }
    ),
    weapons: [
      createWeapon('ac5', 'AC/5', 5, 1, 3, 6, 12, 18, WeaponType.BALLISTIC, 'TURRET', 40, { tonnage: 8 }),
      createWeapon('srm6', 'SRM-6', 12, 4, 0, 3, 6, 9, WeaponType.MISSILE, 'TURRET', 15, { tonnage: 3 })
    ],
    ammo: [
      { type: 'AC/5', shots: 40, location: 'TURRET', explosive: true },
      { type: 'SRM-6', shots: 15, location: 'TURRET', explosive: true }
    ],
    hasECM: false, hasAMS: false, hasCASE: false, hasXLEngine: false,
    hasXXLEngine: false, hasCompactEngine: false, hasTSM: false, hasMASC: false,
    engineHits: 0, gyroHits: 0, sensorHits: 0, lifeSupportHits: 0,
    pilot: { name: 'Vehicle Crew', gunnery: 4, piloting: 5, hits: 0, conscious: true },
    alive: true, shutdown: false, prone: false, immobile: false, position: null, facing: 0
  };
}

// Rommel Heavy Tank (65 tons)
export function createRommel(): Unit {
  return {
    id: `rommel-${Date.now()}`,
    name: 'Rommel Heavy Tank',
    unitType: UnitType.VEHICLE,
    config: Config.BIPED,
    tonnage: 65,
    bv2: 993,
    walkingMP: 5,
    runningMP: 8,
    jumpingMP: 0,
    currentMP: 5,
    movementMode: MovementMode.STANDING,
    heat: 0,
    heatSinks: 1,
    doubleHeatSinks: false,
    locations: createVehicleLocations(
      { FRONT: 40, LEFT: 32, RIGHT: 32, REAR: 26, TURRET: 32 },
      { FRONT: 7, LEFT: 7, RIGHT: 7, REAR: 7, TURRET: 7 }
    ),
    weapons: [
      createWeapon('ac20', 'AC/20', 20, 7, 0, 3, 6, 9, WeaponType.BALLISTIC, 'TURRET', 10, { tonnage: 14 }),
      createWeapon('srm6-1', 'SRM-6', 12, 4, 0, 3, 6, 9, WeaponType.MISSILE, 'FRONT', 15, { tonnage: 3 }),
      createWeapon('srm6-2', 'SRM-6', 12, 4, 0, 3, 6, 9, WeaponType.MISSILE, 'FRONT', 15, { tonnage: 3 })
    ],
    ammo: [
      { type: 'AC/20', shots: 5, location: 'TURRET', explosive: true },
      { type: 'AC/20', shots: 5, location: 'TURRET', explosive: true },
      { type: 'SRM-6', shots: 15, location: 'FRONT', explosive: true },
      { type: 'SRM-6', shots: 15, location: 'FRONT', explosive: true }
    ],
    hasECM: false, hasAMS: false, hasCASE: false, hasXLEngine: false,
    hasXXLEngine: false, hasCompactEngine: false, hasTSM: false, hasMASC: false,
    engineHits: 0, gyroHits: 0, sensorHits: 0, lifeSupportHits: 0,
    pilot: { name: 'Vehicle Crew', gunnery: 4, piloting: 5, hits: 0, conscious: true },
    alive: true, shutdown: false, prone: false, immobile: false, position: null, facing: 0
  };
}

// Demolisher Heavy Tank (80 tons)
export function createDemolisher(): Unit {
  return {
    id: `demolisher-${Date.now()}`,
    name: 'Demolisher Heavy Tank',
    unitType: UnitType.VEHICLE,
    config: Config.BIPED,
    tonnage: 80,
    bv2: 1136,
    walkingMP: 3,
    runningMP: 5,
    jumpingMP: 0,
    currentMP: 3,
    movementMode: MovementMode.STANDING,
    heat: 0,
    heatSinks: 1,
    doubleHeatSinks: false,
    locations: createVehicleLocations(
      { FRONT: 46, LEFT: 38, RIGHT: 38, REAR: 30, TURRET: 38 },
      { FRONT: 8, LEFT: 8, RIGHT: 8, REAR: 8, TURRET: 8 }
    ),
    weapons: [
      createWeapon('ac20-1', 'AC/20', 20, 7, 0, 3, 6, 9, WeaponType.BALLISTIC, 'TURRET', 10, { tonnage: 14 }),
      createWeapon('ac20-2', 'AC/20', 20, 7, 0, 3, 6, 9, WeaponType.BALLISTIC, 'TURRET', 10, { tonnage: 14 }),
      createWeapon('lrm10', 'LRM-10', 10, 4, 6, 7, 14, 21, WeaponType.MISSILE, 'TURRET', 12, { tonnage: 5 })
    ],
    ammo: [
      { type: 'AC/20', shots: 5, location: 'TURRET', explosive: true },
      { type: 'AC/20', shots: 5, location: 'TURRET', explosive: true },
      { type: 'AC/20', shots: 5, location: 'TURRET', explosive: true },
      { type: 'AC/20', shots: 5, location: 'TURRET', explosive: true },
      { type: 'LRM-10', shots: 12, location: 'TURRET', explosive: true }
    ],
    hasECM: false, hasAMS: false, hasCASE: false, hasXLEngine: false,
    hasXXLEngine: false, hasCompactEngine: false, hasTSM: false, hasMASC: false,
    engineHits: 0, gyroHits: 0, sensorHits: 0, lifeSupportHits: 0,
    pilot: { name: 'Vehicle Crew', gunnery: 4, piloting: 5, hits: 0, conscious: true },
    alive: true, shutdown: false, prone: false, immobile: false, position: null, facing: 0
  };
}

// Striker Light Tank (35 tons)
export function createStriker(): Unit {
  return {
    id: `striker-${Date.now()}`,
    name: 'Striker Light Tank',
    unitType: UnitType.VEHICLE,
    config: Config.BIPED,
    tonnage: 35,
    bv2: 534,
    walkingMP: 6,
    runningMP: 9,
    jumpingMP: 0,
    currentMP: 6,
    movementMode: MovementMode.STANDING,
    heat: 0,
    heatSinks: 1,
    doubleHeatSinks: false,
    locations: createVehicleLocations(
      { FRONT: 24, LEFT: 20, RIGHT: 20, REAR: 16, TURRET: 20 },
      { FRONT: 4, LEFT: 4, RIGHT: 4, REAR: 4, TURRET: 4 }
    ),
    weapons: [
      createWeapon('srm6-1', 'SRM-6', 12, 4, 0, 3, 6, 9, WeaponType.MISSILE, 'TURRET', 15, { tonnage: 3 }),
      createWeapon('srm6-2', 'SRM-6', 12, 4, 0, 3, 6, 9, WeaponType.MISSILE, 'TURRET', 15, { tonnage: 3 }),
      createWeapon('lrm10', 'LRM-10', 10, 4, 6, 7, 14, 21, WeaponType.MISSILE, 'TURRET', 12, { tonnage: 5 })
    ],
    ammo: [
      { type: 'SRM-6', shots: 15, location: 'TURRET', explosive: true },
      { type: 'SRM-6', shots: 15, location: 'TURRET', explosive: true },
      { type: 'LRM-10', shots: 12, location: 'TURRET', explosive: true }
    ],
    hasECM: false, hasAMS: false, hasCASE: false, hasXLEngine: false,
    hasXXLEngine: false, hasCompactEngine: false, hasTSM: false, hasMASC: false,
    engineHits: 0, gyroHits: 0, sensorHits: 0, lifeSupportHits: 0,
    pilot: { name: 'Vehicle Crew', gunnery: 4, piloting: 5, hits: 0, conscious: true },
    alive: true, shutdown: false, prone: false, immobile: false, position: null, facing: 0
  };
}
