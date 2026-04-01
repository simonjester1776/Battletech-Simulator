// Additional BattleTech Unit Definitions

import type { Unit, Weapon, Location } from '@/types/battletech';
import { UnitType, Config, WeaponType, MovementMode } from '@/types/battletech';

// Helper to create locations for a biped mech
function createBipedLocations(
  armor: { [key: string]: number },
  structure: { [key: string]: number },
  criticals: { [key: string]: string[] }
): Map<string, Location> {
  const locations = new Map<string, Location>();
  
  const locNames = ['HD', 'CT', 'CTR', 'RT', 'RTR', 'LT', 'LTR', 'RA', 'LA', 'RL', 'LL'];
  
  locNames.forEach(name => {
    const critItems = criticals[name] || [];
    locations.set(name, {
      name,
      armor: armor[name] || 0,
      maxArmor: armor[name] || 0,
      structure: structure[name] || 0,
      maxStructure: structure[name] || 0,
      criticals: critItems.map(item => ({ item, hit: false }))
    });
  });
  
  return locations;
}

// Helper to create weapons
function createWeapon(
  id: string,
  name: string,
  damage: number,
  heat: number,
  minRange: number,
  shortRange: number,
  mediumRange: number,
  longRange: number,
  type: WeaponType,
  location: string,
  shots: number = 999,
  options: Partial<Weapon> = {}
): Weapon {
  return {
    id,
    name,
    damage,
    heat,
    minRange,
    shortRange,
    mediumRange,
    longRange,
    type,
    location,
    shotsRemaining: shots,
    criticalSlots: options.criticalSlots || 1,
    tonnage: options.tonnage || 1,
    isCluster: options.isCluster || false,
    isStreak: options.isStreak || false,
    ammoPerTon: options.ammoPerTon
  };
}

// Locust LCT-1V (20 tons - LIGHT)
export function createLocust(): Unit {
  const criticals: { [key: string]: string[] } = {
    'HD': ['Life Support', 'Sensors', 'Cockpit', 'None', 'None', 'None'],
    'CT': ['Engine', 'Engine', 'Engine', 'Gyro', 'Gyro', 'Gyro', 'Engine', 'Engine', 'Engine', 'None', 'None', 'None'],
    'CTR': ['None', 'None', 'None', 'None', 'None', 'None'],
    'RT': ['Machine Gun', 'Machine Gun', 'Ammo MG', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None'],
    'RTR': ['None', 'None', 'None', 'None', 'None', 'None'],
    'LT': ['Medium Laser', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None'],
    'LTR': ['None', 'None', 'None', 'None', 'None', 'None'],
    'RA': ['None', 'None', 'None', 'None', 'None', 'None'],
    'LA': ['None', 'None', 'None', 'None', 'None', 'None'],
    'RL': ['None', 'None', 'None', 'None', 'None', 'None'],
    'LL': ['None', 'None', 'None', 'None', 'None', 'None']
  };
  
  const armor = {
    'HD': 3, 'CT': 4, 'CTR': 1, 'RT': 3, 'RTR': 1,
    'LT': 3, 'LTR': 1, 'RA': 2, 'LA': 2, 'RL': 3, 'LL': 3
  };
  
  const structure = {
    'HD': 3, 'CT': 4, 'RT': 3, 'LT': 3, 'RA': 2, 'LA': 2, 'RL': 3, 'LL': 3
  };
  
  return {
    id: `locust-${Date.now()}`,
    name: 'LCT-1V Locust',
    unitType: UnitType.MECH,
    config: Config.BIPED,
    tonnage: 20,
    bv2: 356,
    walkingMP: 8,
    runningMP: 12,
    jumpingMP: 0,
    currentMP: 8,
    movementMode: MovementMode.STANDING,
    heat: 0,
    heatSinks: 10,
    doubleHeatSinks: false,
    locations: createBipedLocations(armor, structure, criticals),
    weapons: [
      createWeapon('ml', 'Medium Laser', 5, 3, 0, 3, 6, 9, WeaponType.ENERGY, 'LT', 999, { tonnage: 1 }),
      createWeapon('mg1', 'Machine Gun', 2, 0, 0, 1, 2, 3, WeaponType.MACHINE_GUN, 'RT', 200, { tonnage: 0.5 }),
      createWeapon('mg2', 'Machine Gun', 2, 0, 0, 1, 2, 3, WeaponType.MACHINE_GUN, 'RT', 200, { tonnage: 0.5 })
    ],
    ammo: [
      { type: 'Machine Gun', shots: 200, location: 'RT', explosive: true }
    ],
    hasECM: false,
    hasAMS: false,
    hasCASE: false,
    hasXLEngine: false,
    hasXXLEngine: false,
    hasCompactEngine: false,
    hasTSM: false,
    hasMASC: false,
    engineHits: 0,
    gyroHits: 0,
    sensorHits: 0,
    lifeSupportHits: 0,
    pilot: { name: 'MechWarrior', gunnery: 4, piloting: 5, hits: 0, conscious: true },
    alive: true,
    shutdown: false,
    prone: false,
    immobile: false,
    position: null,
    facing: 0
  };
}

// Commando COM-2D (25 tons - LIGHT)
export function createCommando(): Unit {
  const criticals: { [key: string]: string[] } = {
    'HD': ['Life Support', 'Sensors', 'Cockpit', 'None', 'None', 'None'],
    'CT': ['Engine', 'Engine', 'Engine', 'Gyro', 'Gyro', 'Gyro', 'Engine', 'Engine', 'Engine', 'None', 'None', 'None'],
    'CTR': ['None', 'None', 'None', 'None', 'None', 'None'],
    'RT': ['SRM-6', 'SRM-6', 'Ammo SRM-6', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None'],
    'RTR': ['None', 'None', 'None', 'None', 'None', 'None'],
    'LT': ['SRM-4', 'Ammo SRM-4', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None'],
    'LTR': ['None', 'None', 'None', 'None', 'None', 'None'],
    'RA': ['Medium Laser', 'None', 'None', 'None', 'None', 'None'],
    'LA': ['None', 'None', 'None', 'None', 'None', 'None'],
    'RL': ['None', 'None', 'None', 'None', 'None', 'None'],
    'LL': ['None', 'None', 'None', 'None', 'None', 'None']
  };
  
  const armor = {
    'HD': 6, 'CT': 8, 'CTR': 2, 'RT': 6, 'RTR': 2,
    'LT': 6, 'LTR': 2, 'RA': 4, 'LA': 4, 'RL': 6, 'LL': 6
  };
  
  const structure = {
    'HD': 3, 'CT': 5, 'RT': 4, 'LT': 4, 'RA': 3, 'LA': 3, 'RL': 4, 'LL': 4
  };
  
  return {
    id: `commando-${Date.now()}`,
    name: 'COM-2D Commando',
    unitType: UnitType.MECH,
    config: Config.BIPED,
    tonnage: 25,
    bv2: 541,
    walkingMP: 6,
    runningMP: 9,
    jumpingMP: 0,
    currentMP: 6,
    movementMode: MovementMode.STANDING,
    heat: 0,
    heatSinks: 10,
    doubleHeatSinks: false,
    locations: createBipedLocations(armor, structure, criticals),
    weapons: [
      createWeapon('srm6', 'SRM-6', 12, 4, 0, 3, 6, 9, WeaponType.MISSILE, 'RT', 15, { criticalSlots: 2, tonnage: 3 }),
      createWeapon('srm4', 'SRM-4', 8, 3, 0, 3, 6, 9, WeaponType.MISSILE, 'LT', 25, { criticalSlots: 1, tonnage: 2 }),
      createWeapon('ml', 'Medium Laser', 5, 3, 0, 3, 6, 9, WeaponType.ENERGY, 'RA', 999, { tonnage: 1 })
    ],
    ammo: [
      { type: 'SRM-6', shots: 15, location: 'RT', explosive: true },
      { type: 'SRM-4', shots: 25, location: 'LT', explosive: true }
    ],
    hasECM: false,
    hasAMS: false,
    hasCASE: false,
    hasXLEngine: false,
    hasXXLEngine: false,
    hasCompactEngine: false,
    hasTSM: false,
    hasMASC: false,
    engineHits: 0,
    gyroHits: 0,
    sensorHits: 0,
    lifeSupportHits: 0,
    pilot: { name: 'MechWarrior', gunnery: 4, piloting: 5, hits: 0, conscious: true },
    alive: true,
    shutdown: false,
    prone: false,
    immobile: false,
    position: null,
    facing: 0
  };
}

// Urbanmech UM-R60 (30 tons - LIGHT)
export function createUrbanmech(): Unit {
  const criticals: { [key: string]: string[] } = {
    'HD': ['Life Support', 'Sensors', 'Cockpit', 'None', 'None', 'None'],
    'CT': ['Engine', 'Engine', 'Engine', 'Gyro', 'Gyro', 'Gyro', 'Engine', 'Engine', 'Engine', 'None', 'None', 'None'],
    'CTR': ['None', 'None', 'None', 'None', 'None', 'None'],
    'RT': ['AC/10', 'AC/10', 'AC/10', 'AC/10', 'AC/10', 'AC/10', 'AC/10', 'Ammo AC/10', 'None', 'None', 'None', 'None'],
    'RTR': ['None', 'None', 'None', 'None', 'None', 'None'],
    'LT': ['Jump Jet', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None'],
    'LTR': ['None', 'None', 'None', 'None', 'None', 'None'],
    'RA': ['Small Laser', 'None', 'None', 'None', 'None', 'None'],
    'LA': ['None', 'None', 'None', 'None', 'None', 'None'],
    'RL': ['None', 'None', 'None', 'None', 'None', 'None'],
    'LL': ['None', 'None', 'None', 'None', 'None', 'None']
  };
  
  const armor = {
    'HD': 6, 'CT': 12, 'CTR': 4, 'RT': 10, 'RTR': 4,
    'LT': 10, 'LTR': 4, 'RA': 8, 'LA': 8, 'RL': 12, 'LL': 12
  };
  
  const structure = {
    'HD': 3, 'CT': 6, 'RT': 5, 'LT': 5, 'RA': 4, 'LA': 4, 'RL': 5, 'LL': 5
  };
  
  return {
    id: `urbanmech-${Date.now()}`,
    name: 'UM-R60 Urbanmech',
    unitType: UnitType.MECH,
    config: Config.BIPED,
    tonnage: 30,
    bv2: 454,
    walkingMP: 2,
    runningMP: 3,
    jumpingMP: 1,
    currentMP: 2,
    movementMode: MovementMode.STANDING,
    heat: 0,
    heatSinks: 10,
    doubleHeatSinks: false,
    locations: createBipedLocations(armor, structure, criticals),
    weapons: [
      createWeapon('ac10', 'AC/10', 10, 3, 0, 5, 10, 15, WeaponType.BALLISTIC, 'RT', 20, { criticalSlots: 7, tonnage: 12 }),
      createWeapon('sl', 'Small Laser', 3, 1, 0, 1, 2, 3, WeaponType.ENERGY, 'RA', 999, { tonnage: 0.5 })
    ],
    ammo: [
      { type: 'AC/10', shots: 20, location: 'RT', explosive: true }
    ],
    hasECM: false,
    hasAMS: false,
    hasCASE: false,
    hasXLEngine: false,
    hasXXLEngine: false,
    hasCompactEngine: false,
    hasTSM: false,
    hasMASC: false,
    engineHits: 0,
    gyroHits: 0,
    sensorHits: 0,
    lifeSupportHits: 0,
    pilot: { name: 'MechWarrior', gunnery: 4, piloting: 5, hits: 0, conscious: true },
    alive: true,
    shutdown: false,
    prone: false,
    immobile: false,
    position: null,
    facing: 0
  };
}

// Centurion CN9-A (50 tons - MEDIUM)
export function createCenturion(): Unit {
  const criticals: { [key: string]: string[] } = {
    'HD': ['Life Support', 'Sensors', 'Cockpit', 'None', 'None', 'None'],
    'CT': ['Engine', 'Engine', 'Engine', 'Gyro', 'Gyro', 'Gyro', 'Engine', 'Engine', 'Engine', 'None', 'None', 'None'],
    'CTR': ['None', 'None', 'None', 'None', 'None', 'None'],
    'RT': ['AC/10', 'AC/10', 'AC/10', 'AC/10', 'AC/10', 'AC/10', 'AC/10', 'Ammo AC/10', 'Ammo AC/10', 'None', 'None', 'None'],
    'RTR': ['None', 'None', 'None', 'None', 'None', 'None'],
    'LT': ['LRM-10', 'LRM-10', 'Ammo LRM-10', 'Medium Laser', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None'],
    'LTR': ['None', 'None', 'None', 'None', 'None', 'None'],
    'RA': ['Medium Laser', 'None', 'None', 'None', 'None', 'None'],
    'LA': ['None', 'None', 'None', 'None', 'None', 'None'],
    'RL': ['None', 'None', 'None', 'None', 'None', 'None'],
    'LL': ['None', 'None', 'None', 'None', 'None', 'None']
  };
  
  const armor = {
    'HD': 6, 'CT': 16, 'CTR': 4, 'RT': 12, 'RTR': 4,
    'LT': 12, 'LTR': 4, 'RA': 10, 'LA': 10, 'RL': 12, 'LL': 12
  };
  
  const structure = {
    'HD': 3, 'CT': 11, 'RT': 8, 'LT': 8, 'RA': 6, 'LA': 6, 'RL': 8, 'LL': 8
  };
  
  return {
    id: `centurion-${Date.now()}`,
    name: 'CN9-A Centurion',
    unitType: UnitType.MECH,
    config: Config.BIPED,
    tonnage: 50,
    bv2: 945,
    walkingMP: 4,
    runningMP: 6,
    jumpingMP: 0,
    currentMP: 4,
    movementMode: MovementMode.STANDING,
    heat: 0,
    heatSinks: 10,
    doubleHeatSinks: false,
    locations: createBipedLocations(armor, structure, criticals),
    weapons: [
      createWeapon('ac10', 'AC/10', 10, 3, 0, 5, 10, 15, WeaponType.BALLISTIC, 'RT', 40, { criticalSlots: 7, tonnage: 12 }),
      createWeapon('lrm10', 'LRM-10', 10, 4, 6, 7, 14, 21, WeaponType.MISSILE, 'LT', 12, { criticalSlots: 2, tonnage: 5 }),
      createWeapon('ml1', 'Medium Laser', 5, 3, 0, 3, 6, 9, WeaponType.ENERGY, 'RA', 999, { tonnage: 1 }),
      createWeapon('ml2', 'Medium Laser', 5, 3, 0, 3, 6, 9, WeaponType.ENERGY, 'LT', 999, { tonnage: 1 })
    ],
    ammo: [
      { type: 'AC/10', shots: 20, location: 'RT', explosive: true },
      { type: 'AC/10', shots: 20, location: 'RT', explosive: true },
      { type: 'LRM-10', shots: 12, location: 'LT', explosive: true }
    ],
    hasECM: false,
    hasAMS: false,
    hasCASE: false,
    hasXLEngine: false,
    hasXXLEngine: false,
    hasCompactEngine: false,
    hasTSM: false,
    hasMASC: false,
    engineHits: 0,
    gyroHits: 0,
    sensorHits: 0,
    lifeSupportHits: 0,
    pilot: { name: 'MechWarrior', gunnery: 4, piloting: 5, hits: 0, conscious: true },
    alive: true,
    shutdown: false,
    prone: false,
    immobile: false,
    position: null,
    facing: 0
  };
}

// Wolverine WVR-6R (55 tons - MEDIUM)
export function createWolverine(): Unit {
  const criticals: { [key: string]: string[] } = {
    'HD': ['Life Support', 'Sensors', 'Cockpit', 'None', 'None', 'None'],
    'CT': ['Engine', 'Engine', 'Engine', 'Gyro', 'Gyro', 'Gyro', 'Engine', 'Engine', 'Engine', 'Jump Jet', 'Jump Jet', 'Jump Jet'],
    'CTR': ['None', 'None', 'None', 'None', 'None', 'None'],
    'RT': ['SRM-6', 'SRM-6', 'Ammo SRM-6', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None'],
    'RTR': ['None', 'None', 'None', 'None', 'None', 'None'],
    'LT': ['None', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None'],
    'LTR': ['None', 'None', 'None', 'None', 'None', 'None'],
    'RA': ['AC/5', 'AC/5', 'AC/5', 'AC/5', 'Ammo AC/5', 'None'],
    'LA': ['Medium Laser', 'Medium Laser', 'None', 'None', 'None', 'None'],
    'RL': ['Jump Jet', 'None', 'None', 'None', 'None', 'None'],
    'LL': ['Jump Jet', 'None', 'None', 'None', 'None', 'None']
  };
  
  const armor = {
    'HD': 6, 'CT': 18, 'CTR': 6, 'RT': 14, 'RTR': 5,
    'LT': 14, 'LTR': 5, 'RA': 12, 'LA': 12, 'RL': 14, 'LL': 14
  };
  
  const structure = {
    'HD': 3, 'CT': 12, 'RT': 9, 'LT': 9, 'RA': 7, 'LA': 7, 'RL': 9, 'LL': 9
  };
  
  return {
    id: `wolverine-${Date.now()}`,
    name: 'WVR-6R Wolverine',
    unitType: UnitType.MECH,
    config: Config.BIPED,
    tonnage: 55,
    bv2: 1101,
    walkingMP: 5,
    runningMP: 8,
    jumpingMP: 5,
    currentMP: 5,
    movementMode: MovementMode.STANDING,
    heat: 0,
    heatSinks: 13,
    doubleHeatSinks: false,
    locations: createBipedLocations(armor, structure, criticals),
    weapons: [
      createWeapon('ac5', 'AC/5', 5, 1, 3, 6, 12, 18, WeaponType.BALLISTIC, 'RA', 40, { criticalSlots: 4, tonnage: 8 }),
      createWeapon('srm6', 'SRM-6', 12, 4, 0, 3, 6, 9, WeaponType.MISSILE, 'RT', 15, { criticalSlots: 2, tonnage: 3 }),
      createWeapon('ml1', 'Medium Laser', 5, 3, 0, 3, 6, 9, WeaponType.ENERGY, 'LA', 999, { tonnage: 1 }),
      createWeapon('ml2', 'Medium Laser', 5, 3, 0, 3, 6, 9, WeaponType.ENERGY, 'LA', 999, { tonnage: 1 })
    ],
    ammo: [
      { type: 'AC/5', shots: 40, location: 'RA', explosive: true },
      { type: 'SRM-6', shots: 15, location: 'RT', explosive: true }
    ],
    hasECM: false,
    hasAMS: false,
    hasCASE: false,
    hasXLEngine: false,
    hasXXLEngine: false,
    hasCompactEngine: false,
    hasTSM: false,
    hasMASC: false,
    engineHits: 0,
    gyroHits: 0,
    sensorHits: 0,
    lifeSupportHits: 0,
    pilot: { name: 'MechWarrior', gunnery: 4, piloting: 5, hits: 0, conscious: true },
    alive: true,
    shutdown: false,
    prone: false,
    immobile: false,
    position: null,
    facing: 0
  };
}

// Catapult CPLT-C1 (65 tons - HEAVY)
export function createCatapult(): Unit {
  const criticals: { [key: string]: string[] } = {
    'HD': ['Life Support', 'Sensors', 'Cockpit', 'None', 'None', 'None'],
    'CT': ['Engine', 'Engine', 'Engine', 'Gyro', 'Gyro', 'Gyro', 'Engine', 'Engine', 'Engine', 'Jump Jet', 'Jump Jet', 'Jump Jet'],
    'CTR': ['None', 'None', 'None', 'None', 'None', 'None'],
    'RT': ['LRM-15', 'LRM-15', 'LRM-15', 'Ammo LRM-15', 'Ammo LRM-15', 'None', 'None', 'None', 'None', 'None', 'None', 'None'],
    'RTR': ['None', 'None', 'None', 'None', 'None', 'None'],
    'LT': ['LRM-15', 'LRM-15', 'LRM-15', 'Ammo LRM-15', 'Ammo LRM-15', 'None', 'None', 'None', 'None', 'None', 'None', 'None'],
    'LTR': ['None', 'None', 'None', 'None', 'None', 'None'],
    'RA': ['Medium Laser', 'Medium Laser', 'None', 'None', 'None', 'None'],
    'LA': ['Medium Laser', 'Medium Laser', 'None', 'None', 'None', 'None'],
    'RL': ['Jump Jet', 'None', 'None', 'None', 'None', 'None'],
    'LL': ['Jump Jet', 'None', 'None', 'None', 'None', 'None']
  };
  
  const armor = {
    'HD': 8, 'CT': 20, 'CTR': 7, 'RT': 16, 'RTR': 5,
    'LT': 16, 'LTR': 5, 'RA': 14, 'LA': 14, 'RL': 16, 'LL': 16
  };
  
  const structure = {
    'HD': 3, 'CT': 14, 'RT': 10, 'LT': 10, 'RA': 8, 'LA': 8, 'RL': 10, 'LL': 10
  };
  
  return {
    id: `catapult-${Date.now()}`,
    name: 'CPLT-C1 Catapult',
    unitType: UnitType.MECH,
    config: Config.BIPED,
    tonnage: 65,
    bv2: 1165,
    walkingMP: 4,
    runningMP: 6,
    jumpingMP: 4,
    currentMP: 4,
    movementMode: MovementMode.STANDING,
    heat: 0,
    heatSinks: 14,
    doubleHeatSinks: false,
    locations: createBipedLocations(armor, structure, criticals),
    weapons: [
      createWeapon('lrm15-1', 'LRM-15', 15, 5, 6, 7, 14, 21, WeaponType.MISSILE, 'RT', 16, { criticalSlots: 3, tonnage: 7 }),
      createWeapon('lrm15-2', 'LRM-15', 15, 5, 6, 7, 14, 21, WeaponType.MISSILE, 'LT', 16, { criticalSlots: 3, tonnage: 7 }),
      createWeapon('ml1', 'Medium Laser', 5, 3, 0, 3, 6, 9, WeaponType.ENERGY, 'RA', 999, { tonnage: 1 }),
      createWeapon('ml2', 'Medium Laser', 5, 3, 0, 3, 6, 9, WeaponType.ENERGY, 'RA', 999, { tonnage: 1 }),
      createWeapon('ml3', 'Medium Laser', 5, 3, 0, 3, 6, 9, WeaponType.ENERGY, 'LA', 999, { tonnage: 1 }),
      createWeapon('ml4', 'Medium Laser', 5, 3, 0, 3, 6, 9, WeaponType.ENERGY, 'LA', 999, { tonnage: 1 })
    ],
    ammo: [
      { type: 'LRM-15', shots: 8, location: 'RT', explosive: true },
      { type: 'LRM-15', shots: 8, location: 'RT', explosive: true },
      { type: 'LRM-15', shots: 8, location: 'LT', explosive: true },
      { type: 'LRM-15', shots: 8, location: 'LT', explosive: true }
    ],
    hasECM: false,
    hasAMS: false,
    hasCASE: false,
    hasXLEngine: false,
    hasXXLEngine: false,
    hasCompactEngine: false,
    hasTSM: false,
    hasMASC: false,
    engineHits: 0,
    gyroHits: 0,
    sensorHits: 0,
    lifeSupportHits: 0,
    pilot: { name: 'MechWarrior', gunnery: 4, piloting: 5, hits: 0, conscious: true },
    alive: true,
    shutdown: false,
    prone: false,
    immobile: false,
    position: null,
    facing: 0
  };
}

// Marauder MAD-3R (75 tons - HEAVY)
export function createMarauder(): Unit {
  const criticals: { [key: string]: string[] } = {
    'HD': ['Life Support', 'Sensors', 'Cockpit', 'None', 'None', 'None'],
    'CT': ['Engine', 'Engine', 'Engine', 'Gyro', 'Gyro', 'Gyro', 'Engine', 'Engine', 'Engine', 'None', 'None', 'None'],
    'CTR': ['None', 'None', 'None', 'None', 'None', 'None'],
    'RT': ['PPC', 'PPC', 'PPC', 'Medium Laser', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None'],
    'RTR': ['None', 'None', 'None', 'None', 'None', 'None'],
    'LT': ['PPC', 'PPC', 'PPC', 'Medium Laser', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None'],
    'LTR': ['None', 'None', 'None', 'None', 'None', 'None'],
    'RA': ['AC/5', 'AC/5', 'AC/5', 'AC/5', 'Ammo AC/5', 'Ammo AC/5'],
    'LA': ['None', 'None', 'None', 'None', 'None', 'None'],
    'RL': ['None', 'None', 'None', 'None', 'None', 'None'],
    'LL': ['None', 'None', 'None', 'None', 'None', 'None']
  };
  
  const armor = {
    'HD': 9, 'CT': 22, 'CTR': 8, 'RT': 18, 'RTR': 6,
    'LT': 18, 'LTR': 6, 'RA': 16, 'LA': 16, 'RL': 18, 'LL': 18
  };
  
  const structure = {
    'HD': 3, 'CT': 16, 'RT': 12, 'LT': 12, 'RA': 10, 'LA': 10, 'RL': 12, 'LL': 12
  };
  
  return {
    id: `marauder-${Date.now()}`,
    name: 'MAD-3R Marauder',
    unitType: UnitType.MECH,
    config: Config.BIPED,
    tonnage: 75,
    bv2: 1366,
    walkingMP: 4,
    runningMP: 6,
    jumpingMP: 0,
    currentMP: 4,
    movementMode: MovementMode.STANDING,
    heat: 0,
    heatSinks: 16,
    doubleHeatSinks: false,
    locations: createBipedLocations(armor, structure, criticals),
    weapons: [
      createWeapon('ppc1', 'PPC', 10, 10, 3, 6, 12, 18, WeaponType.ENERGY, 'RT', 999, { criticalSlots: 3, tonnage: 7 }),
      createWeapon('ppc2', 'PPC', 10, 10, 3, 6, 12, 18, WeaponType.ENERGY, 'LT', 999, { criticalSlots: 3, tonnage: 7 }),
      createWeapon('ac5', 'AC/5', 5, 1, 3, 6, 12, 18, WeaponType.BALLISTIC, 'RA', 80, { criticalSlots: 4, tonnage: 8 }),
      createWeapon('ml1', 'Medium Laser', 5, 3, 0, 3, 6, 9, WeaponType.ENERGY, 'RT', 999, { tonnage: 1 }),
      createWeapon('ml2', 'Medium Laser', 5, 3, 0, 3, 6, 9, WeaponType.ENERGY, 'LT', 999, { tonnage: 1 })
    ],
    ammo: [
      { type: 'AC/5', shots: 40, location: 'RA', explosive: true },
      { type: 'AC/5', shots: 40, location: 'RA', explosive: true }
    ],
    hasECM: false,
    hasAMS: false,
    hasCASE: false,
    hasXLEngine: false,
    hasXXLEngine: false,
    hasCompactEngine: false,
    hasTSM: false,
    hasMASC: false,
    engineHits: 0,
    gyroHits: 0,
    sensorHits: 0,
    lifeSupportHits: 0,
    pilot: { name: 'MechWarrior', gunnery: 4, piloting: 5, hits: 0, conscious: true },
    alive: true,
    shutdown: false,
    prone: false,
    immobile: false,
    position: null,
    facing: 0
  };
}

// Awesome AWS-8Q (80 tons - ASSAULT)
export function createAwesome(): Unit {
  const criticals: { [key: string]: string[] } = {
    'HD': ['Life Support', 'Sensors', 'Cockpit', 'None', 'None', 'None'],
    'CT': ['Engine', 'Engine', 'Engine', 'Gyro', 'Gyro', 'Gyro', 'Engine', 'Engine', 'Engine', 'None', 'None', 'None'],
    'CTR': ['None', 'None', 'None', 'None', 'None', 'None'],
    'RT': ['PPC', 'PPC', 'PPC', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None'],
    'RTR': ['None', 'None', 'None', 'None', 'None', 'None'],
    'LT': ['PPC', 'PPC', 'PPC', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None'],
    'LTR': ['None', 'None', 'None', 'None', 'None', 'None'],
    'RA': ['Small Laser', 'None', 'None', 'None', 'None', 'None'],
    'LA': ['PPC', 'PPC', 'PPC', 'None', 'None', 'None'],
    'RL': ['None', 'None', 'None', 'None', 'None', 'None'],
    'LL': ['None', 'None', 'None', 'None', 'None', 'None']
  };
  
  const armor = {
    'HD': 9, 'CT': 25, 'CTR': 9, 'RT': 20, 'RTR': 7,
    'LT': 20, 'LTR': 7, 'RA': 18, 'LA': 18, 'RL': 20, 'LL': 20
  };
  
  const structure = {
    'HD': 3, 'CT': 18, 'RT': 13, 'LT': 13, 'RA': 10, 'LA': 10, 'RL': 13, 'LL': 13
  };
  
  return {
    id: `awesome-${Date.now()}`,
    name: 'AWS-8Q Awesome',
    unitType: UnitType.MECH,
    config: Config.BIPED,
    tonnage: 80,
    bv2: 1468,
    walkingMP: 3,
    runningMP: 5,
    jumpingMP: 0,
    currentMP: 3,
    movementMode: MovementMode.STANDING,
    heat: 0,
    heatSinks: 28,
    doubleHeatSinks: false,
    locations: createBipedLocations(armor, structure, criticals),
    weapons: [
      createWeapon('ppc1', 'PPC', 10, 10, 3, 6, 12, 18, WeaponType.ENERGY, 'RT', 999, { criticalSlots: 3, tonnage: 7 }),
      createWeapon('ppc2', 'PPC', 10, 10, 3, 6, 12, 18, WeaponType.ENERGY, 'LT', 999, { criticalSlots: 3, tonnage: 7 }),
      createWeapon('ppc3', 'PPC', 10, 10, 3, 6, 12, 18, WeaponType.ENERGY, 'LA', 999, { criticalSlots: 3, tonnage: 7 }),
      createWeapon('sl', 'Small Laser', 3, 1, 0, 1, 2, 3, WeaponType.ENERGY, 'RA', 999, { tonnage: 0.5 })
    ],
    ammo: [],
    hasECM: false,
    hasAMS: false,
    hasCASE: false,
    hasXLEngine: false,
    hasXXLEngine: false,
    hasCompactEngine: false,
    hasTSM: false,
    hasMASC: false,
    engineHits: 0,
    gyroHits: 0,
    sensorHits: 0,
    lifeSupportHits: 0,
    pilot: { name: 'MechWarrior', gunnery: 4, piloting: 5, hits: 0, conscious: true },
    alive: true,
    shutdown: false,
    prone: false,
    immobile: false,
    position: null,
    facing: 0
  };
}

// Stalker STK-3F (85 tons - ASSAULT)
export function createStalker(): Unit {
  const criticals: { [key: string]: string[] } = {
    'HD': ['Life Support', 'Sensors', 'Cockpit', 'None', 'None', 'None'],
    'CT': ['Engine', 'Engine', 'Engine', 'Gyro', 'Gyro', 'Gyro', 'Engine', 'Engine', 'Engine', 'None', 'None', 'None'],
    'CTR': ['None', 'None', 'None', 'None', 'None', 'None'],
    'RT': ['LRM-10', 'LRM-10', 'Ammo LRM-10', 'Ammo LRM-10', 'Medium Laser', 'Medium Laser', 'None', 'None', 'None', 'None', 'None', 'None'],
    'RTR': ['None', 'None', 'None', 'None', 'None', 'None'],
    'LT': ['LRM-10', 'LRM-10', 'Ammo LRM-10', 'Ammo LRM-10', 'Medium Laser', 'Medium Laser', 'None', 'None', 'None', 'None', 'None', 'None'],
    'LTR': ['None', 'None', 'None', 'None', 'None', 'None'],
    'RA': ['LRM-20', 'LRM-20', 'LRM-20', 'LRM-20', 'LRM-20', 'Ammo LRM-20'],
    'LA': ['LRM-20', 'LRM-20', 'LRM-20', 'LRM-20', 'LRM-20', 'Ammo LRM-20'],
    'RL': ['None', 'None', 'None', 'None', 'None', 'None'],
    'LL': ['None', 'None', 'None', 'None', 'None', 'None']
  };
  
  const armor = {
    'HD': 9, 'CT': 26, 'CTR': 10, 'RT': 22, 'RTR': 7,
    'LT': 22, 'LTR': 7, 'RA': 20, 'LA': 20, 'RL': 22, 'LL': 22
  };
  
  const structure = {
    'HD': 3, 'CT': 19, 'RT': 14, 'LT': 14, 'RA': 11, 'LA': 11, 'RL': 14, 'LL': 14
  };
  
  return {
    id: `stalker-${Date.now()}`,
    name: 'STK-3F Stalker',
    unitType: UnitType.MECH,
    config: Config.BIPED,
    tonnage: 85,
    bv2: 1559,
    walkingMP: 3,
    runningMP: 5,
    jumpingMP: 0,
    currentMP: 3,
    movementMode: MovementMode.STANDING,
    heat: 0,
    heatSinks: 20,
    doubleHeatSinks: false,
    locations: createBipedLocations(armor, structure, criticals),
    weapons: [
      createWeapon('lrm20-1', 'LRM-20', 20, 6, 6, 7, 14, 21, WeaponType.MISSILE, 'RA', 12, { criticalSlots: 5, tonnage: 10 }),
      createWeapon('lrm20-2', 'LRM-20', 20, 6, 6, 7, 14, 21, WeaponType.MISSILE, 'LA', 12, { criticalSlots: 5, tonnage: 10 }),
      createWeapon('lrm10-1', 'LRM-10', 10, 4, 6, 7, 14, 21, WeaponType.MISSILE, 'RT', 24, { criticalSlots: 2, tonnage: 5 }),
      createWeapon('lrm10-2', 'LRM-10', 10, 4, 6, 7, 14, 21, WeaponType.MISSILE, 'LT', 24, { criticalSlots: 2, tonnage: 5 }),
      createWeapon('ml1', 'Medium Laser', 5, 3, 0, 3, 6, 9, WeaponType.ENERGY, 'RT', 999, { tonnage: 1 }),
      createWeapon('ml2', 'Medium Laser', 5, 3, 0, 3, 6, 9, WeaponType.ENERGY, 'RT', 999, { tonnage: 1 }),
      createWeapon('ml3', 'Medium Laser', 5, 3, 0, 3, 6, 9, WeaponType.ENERGY, 'LT', 999, { tonnage: 1 }),
      createWeapon('ml4', 'Medium Laser', 5, 3, 0, 3, 6, 9, WeaponType.ENERGY, 'LT', 999, { tonnage: 1 })
    ],
    ammo: [
      { type: 'LRM-20', shots: 6, location: 'RA', explosive: true },
      { type: 'LRM-20', shots: 6, location: 'LA', explosive: true },
      { type: 'LRM-10', shots: 12, location: 'RT', explosive: true },
      { type: 'LRM-10', shots: 12, location: 'RT', explosive: true },
      { type: 'LRM-10', shots: 12, location: 'LT', explosive: true },
      { type: 'LRM-10', shots: 12, location: 'LT', explosive: true }
    ],
    hasECM: false,
    hasAMS: false,
    hasCASE: false,
    hasXLEngine: false,
    hasXXLEngine: false,
    hasCompactEngine: false,
    hasTSM: false,
    hasMASC: false,
    engineHits: 0,
    gyroHits: 0,
    sensorHits: 0,
    lifeSupportHits: 0,
    pilot: { name: 'MechWarrior', gunnery: 4, piloting: 5, hits: 0, conscious: true },
    alive: true,
    shutdown: false,
    prone: false,
    immobile: false,
    position: null,
    facing: 0
  };
}

// King Crab KGC-000 (100 tons - ASSAULT)
export function createKingCrab(): Unit {
  const criticals: { [key: string]: string[] } = {
    'HD': ['Life Support', 'Sensors', 'Cockpit', 'None', 'None', 'None'],
    'CT': ['Engine', 'Engine', 'Engine', 'Gyro', 'Gyro', 'Gyro', 'Engine', 'Engine', 'Engine', 'LRM-15', 'LRM-15', 'LRM-15'],
    'CTR': ['Ammo LRM-15', 'Ammo LRM-15', 'None', 'None', 'None', 'None'],
    'RT': ['Medium Laser', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None'],
    'RTR': ['None', 'None', 'None', 'None', 'None', 'None'],
    'LT': ['Medium Laser', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None'],
    'LTR': ['None', 'None', 'None', 'None', 'None', 'None'],
    'RA': ['AC/20', 'AC/20', 'AC/20', 'AC/20', 'AC/20', 'AC/20', 'AC/20', 'AC/20', 'AC/20', 'AC/20', 'Ammo AC/20', 'Ammo AC/20'],
    'LA': ['AC/20', 'AC/20', 'AC/20', 'AC/20', 'AC/20', 'AC/20', 'AC/20', 'AC/20', 'AC/20', 'AC/20', 'Ammo AC/20', 'Ammo AC/20'],
    'RL': ['None', 'None', 'None', 'None', 'None', 'None'],
    'LL': ['None', 'None', 'None', 'None', 'None', 'None']
  };
  
  const armor = {
    'HD': 9, 'CT': 46, 'CTR': 14, 'RT': 32, 'RTR': 10,
    'LT': 32, 'LTR': 10, 'RA': 34, 'LA': 34, 'RL': 42, 'LL': 42
  };
  
  const structure = {
    'HD': 3, 'CT': 31, 'RT': 21, 'LT': 21, 'RA': 17, 'LA': 17, 'RL': 21, 'LL': 21
  };
  
  return {
    id: `kingcrab-${Date.now()}`,
    name: 'KGC-000 King Crab',
    unitType: UnitType.MECH,
    config: Config.BIPED,
    tonnage: 100,
    bv2: 1873,
    walkingMP: 3,
    runningMP: 5,
    jumpingMP: 0,
    currentMP: 3,
    movementMode: MovementMode.STANDING,
    heat: 0,
    heatSinks: 13,
    doubleHeatSinks: false,
    locations: createBipedLocations(armor, structure, criticals),
    weapons: [
      createWeapon('ac20-1', 'AC/20', 20, 7, 0, 3, 6, 9, WeaponType.BALLISTIC, 'RA', 10, { criticalSlots: 10, tonnage: 14 }),
      createWeapon('ac20-2', 'AC/20', 20, 7, 0, 3, 6, 9, WeaponType.BALLISTIC, 'LA', 10, { criticalSlots: 10, tonnage: 14 }),
      createWeapon('lrm15', 'LRM-15', 15, 5, 6, 7, 14, 21, WeaponType.MISSILE, 'CT', 16, { criticalSlots: 3, tonnage: 7 }),
      createWeapon('ml1', 'Medium Laser', 5, 3, 0, 3, 6, 9, WeaponType.ENERGY, 'RT', 999, { tonnage: 1 }),
      createWeapon('ml2', 'Medium Laser', 5, 3, 0, 3, 6, 9, WeaponType.ENERGY, 'LT', 999, { tonnage: 1 })
    ],
    ammo: [
      { type: 'AC/20', shots: 5, location: 'RA', explosive: true },
      { type: 'AC/20', shots: 5, location: 'RA', explosive: true },
      { type: 'AC/20', shots: 5, location: 'LA', explosive: true },
      { type: 'AC/20', shots: 5, location: 'LA', explosive: true },
      { type: 'LRM-15', shots: 8, location: 'CTR', explosive: true },
      { type: 'LRM-15', shots: 8, location: 'CTR', explosive: true }
    ],
    hasECM: false,
    hasAMS: false,
    hasCASE: false,
    hasXLEngine: false,
    hasXXLEngine: false,
    hasCompactEngine: false,
    hasTSM: false,
    hasMASC: false,
    engineHits: 0,
    gyroHits: 0,
    sensorHits: 0,
    lifeSupportHits: 0,
    pilot: { name: 'MechWarrior', gunnery: 4, piloting: 5, hits: 0, conscious: true },
    alive: true,
    shutdown: false,
    prone: false,
    immobile: false,
    position: null,
    facing: 0
  };
}
