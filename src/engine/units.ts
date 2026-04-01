// BattleTech Unit Definitions - Accurate Record Sheet Data

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

// AS7-D Atlas (Classic)
export function createAtlasD(): Unit {
  const criticals: { [key: string]: string[] } = {
    'HD': ['Life Support', 'Sensors', 'Cockpit', 'None', 'None', 'None'],
    'CT': ['Engine', 'Engine', 'Engine', 'Gyro', 'Gyro', 'Gyro', 'Engine', 'Engine', 'Engine', 'None', 'None', 'None'],
    'CTR': ['None', 'None', 'None', 'None', 'None', 'None'],
    'RT': ['LRM-20', 'LRM-20', 'LRM-20', 'LRM-20', 'LRM-20', 'Ammo LRM-20', 'Ammo LRM-20', 'None', 'None', 'None', 'None', 'None'],
    'RTR': ['None', 'None', 'None', 'None', 'None', 'None'],
    'LT': ['AC/20', 'AC/20', 'AC/20', 'AC/20', 'AC/20', 'AC/20', 'AC/20', 'AC/20', 'AC/20', 'AC/20', 'Ammo AC/20', 'Ammo AC/20'],
    'LTR': ['None', 'None', 'None', 'None', 'None', 'None'],
    'RA': ['Medium Laser', 'None', 'None', 'None', 'None', 'None'],
    'LA': ['Medium Laser', 'None', 'None', 'None', 'None', 'None'],
    'RL': ['None', 'None', 'None', 'None', 'None', 'None'],
    'LL': ['None', 'None', 'None', 'None', 'None', 'None']
  };
  
  const armor = {
    'HD': 9, 'CT': 47, 'CTR': 14, 'RT': 32, 'RTR': 10,
    'LT': 32, 'LTR': 10, 'RA': 34, 'LA': 34, 'RL': 41, 'LL': 41
  };
  
  const structure = {
    'HD': 3, 'CT': 31, 'RT': 21, 'LT': 21, 'RA': 17, 'LA': 17, 'RL': 21, 'LL': 21
  };
  
  return {
    id: `atlas-d-${Date.now()}`,
    name: 'AS7-D Atlas',
    unitType: UnitType.MECH,
    config: Config.BIPED,
    tonnage: 100,
    bv2: 1897,
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
      createWeapon('ac20', 'AC/20', 20, 7, 0, 3, 6, 9, WeaponType.BALLISTIC, 'LT', 10, { criticalSlots: 10, tonnage: 14 }),
      createWeapon('lrm20', 'LRM-20', 20, 6, 6, 7, 14, 21, WeaponType.MISSILE, 'RT', 12, { criticalSlots: 5, tonnage: 10, ammoPerTon: 6 }),
      createWeapon('ml1', 'Medium Laser', 5, 3, 0, 3, 6, 9, WeaponType.ENERGY, 'RA', 999, { tonnage: 1 }),
      createWeapon('ml2', 'Medium Laser', 5, 3, 0, 3, 6, 9, WeaponType.ENERGY, 'LA', 999, { tonnage: 1 })
    ],
    ammo: [
      { type: 'AC/20', shots: 10, location: 'LT', explosive: true },
      { type: 'AC/20', shots: 10, location: 'LT', explosive: true },
      { type: 'LRM-20', shots: 6, location: 'RT', explosive: true },
      { type: 'LRM-20', shots: 6, location: 'RT', explosive: true }
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

// Timber Wolf (Mad Cat) Prime
export function createTimberWolf(): Unit {
  const criticals: { [key: string]: string[] } = {
    'HD': ['Life Support', 'Sensors', 'Cockpit', 'Ferro-Fibrous', 'None', 'None'],
    'CT': ['Engine', 'Engine', 'Engine', 'Gyro', 'Gyro', 'Gyro', 'Engine', 'Engine', 'Engine', 'Endo Steel', 'Endo Steel', 'Endo Steel'],
    'CTR': ['Endo Steel', 'Endo Steel', 'None', 'None', 'None', 'None'],
    'RT': ['ER Large Laser', 'LRM-20', 'LRM-20', 'LRM-20', 'LRM-20', 'LRM-20', 'Ammo LRM-20', 'Ammo LRM-20', 'Endo Steel', 'Ferro-Fibrous', 'Ferro-Fibrous', 'Ferro-Fibrous'],
    'RTR': ['Endo Steel', 'Ferro-Fibrous', 'None', 'None', 'None', 'None'],
    'LT': ['ER Large Laser', 'LRM-20', 'LRM-20', 'LRM-20', 'LRM-20', 'LRM-20', 'Ammo LRM-20', 'Ammo LRM-20', 'Endo Steel', 'Ferro-Fibrous', 'Ferro-Fibrous', 'Ferro-Fibrous'],
    'LTR': ['Endo Steel', 'Ferro-Fibrous', 'None', 'None', 'None', 'None'],
    'RA': ['Medium Pulse Laser', 'Medium Pulse Laser', 'Endo Steel', 'Ferro-Fibrous', 'None', 'None'],
    'LA': ['Medium Pulse Laser', 'Medium Pulse Laser', 'Endo Steel', 'Ferro-Fibrous', 'None', 'None'],
    'RL': ['Endo Steel', 'Ferro-Fibrous', 'None', 'None', 'None', 'None'],
    'LL': ['Endo Steel', 'Ferro-Fibrous', 'None', 'None', 'None', 'None']
  };
  
  const armor = {
    'HD': 9, 'CT': 35, 'CTR': 12, 'RT': 25, 'RTR': 8,
    'LT': 25, 'LTR': 8, 'RA': 23, 'LA': 23, 'RL': 32, 'LL': 32
  };
  
  const structure = {
    'HD': 3, 'CT': 23, 'RT': 16, 'LT': 16, 'RA': 12, 'LA': 12, 'RL': 16, 'LL': 16
  };
  
  return {
    id: `timber-wolf-${Date.now()}`,
    name: 'Timber Wolf Prime',
    unitType: UnitType.MECH,
    config: Config.BIPED,
    tonnage: 75,
    bv2: 2737,
    walkingMP: 5,
    runningMP: 8,
    jumpingMP: 0,
    currentMP: 5,
    movementMode: MovementMode.STANDING,
    heat: 0,
    heatSinks: 15,
    doubleHeatSinks: true,
    locations: createBipedLocations(armor, structure, criticals),
    weapons: [
      createWeapon('erll1', 'ER Large Laser', 8, 12, 0, 7, 14, 19, WeaponType.ENERGY, 'RT', 999, { tonnage: 4 }),
      createWeapon('erll2', 'ER Large Laser', 8, 12, 0, 7, 14, 19, WeaponType.ENERGY, 'LT', 999, { tonnage: 4 }),
      createWeapon('lrm20-1', 'LRM-20', 20, 6, 6, 7, 14, 21, WeaponType.MISSILE, 'RT', 18, { criticalSlots: 5, tonnage: 10, ammoPerTon: 6 }),
      createWeapon('lrm20-2', 'LRM-20', 20, 6, 6, 7, 14, 21, WeaponType.MISSILE, 'LT', 18, { criticalSlots: 5, tonnage: 10, ammoPerTon: 6 }),
      createWeapon('mpl1', 'Medium Pulse Laser', 7, 4, 0, 2, 4, 6, WeaponType.ENERGY, 'RA', 999, { tonnage: 2 }),
      createWeapon('mpl2', 'Medium Pulse Laser', 7, 4, 0, 2, 4, 6, WeaponType.ENERGY, 'LA', 999, { tonnage: 2 })
    ],
    ammo: [
      { type: 'LRM-20', shots: 6, location: 'RT', explosive: true },
      { type: 'LRM-20', shots: 6, location: 'RT', explosive: true },
      { type: 'LRM-20', shots: 6, location: 'LT', explosive: true },
      { type: 'LRM-20', shots: 6, location: 'LT', explosive: true }
    ],
    hasECM: false,
    hasAMS: false,
    hasCASE: true,
    hasXLEngine: true,
    hasXXLEngine: false,
    hasCompactEngine: false,
    hasTSM: false,
    hasMASC: false,
    engineHits: 0,
    gyroHits: 0,
    sensorHits: 0,
    lifeSupportHits: 0,
    pilot: { name: 'Star Commander', gunnery: 3, piloting: 4, hits: 0, conscious: true },
    alive: true,
    shutdown: false,
    prone: false,
    immobile: false,
    position: null,
    facing: 0
  };
}

// Warhammer WHM-6R
export function createWarhammer(): Unit {
  const criticals: { [key: string]: string[] } = {
    'HD': ['Life Support', 'Sensors', 'Cockpit', 'None', 'None', 'None'],
    'CT': ['Engine', 'Engine', 'Engine', 'Gyro', 'Gyro', 'Gyro', 'Engine', 'Engine', 'Engine', 'None', 'None', 'None'],
    'CTR': ['None', 'None', 'None', 'None', 'None', 'None'],
    'RT': ['PPC', 'PPC', 'PPC', 'Machine Gun', 'Ammo MG', 'None', 'None', 'None', 'None', 'None', 'None', 'None'],
    'RTR': ['None', 'None', 'None', 'None', 'None', 'None'],
    'LT': ['PPC', 'PPC', 'PPC', 'SRM-6', 'SRM-6', 'Ammo SRM-6', 'None', 'None', 'None', 'None', 'None', 'None'],
    'LTR': ['None', 'None', 'None', 'None', 'None', 'None'],
    'RA': ['Medium Laser', 'None', 'None', 'None', 'None', 'None'],
    'LA': ['Medium Laser', 'None', 'None', 'None', 'None', 'None'],
    'RL': ['None', 'None', 'None', 'None', 'None', 'None'],
    'LL': ['None', 'None', 'None', 'None', 'None', 'None']
  };
  
  const armor = {
    'HD': 6, 'CT': 20, 'CTR': 7, 'RT': 16, 'RTR': 5,
    'LT': 16, 'LTR': 5, 'RA': 14, 'LA': 14, 'RL': 18, 'LL': 18
  };
  
  const structure = {
    'HD': 3, 'CT': 15, 'RT': 11, 'LT': 11, 'RA': 9, 'LA': 9, 'RL': 11, 'LL': 11
  };
  
  return {
    id: `warhammer-${Date.now()}`,
    name: 'WHM-6R Warhammer',
    unitType: UnitType.MECH,
    config: Config.BIPED,
    tonnage: 70,
    bv2: 1225,
    walkingMP: 4,
    runningMP: 6,
    jumpingMP: 0,
    currentMP: 4,
    movementMode: MovementMode.STANDING,
    heat: 0,
    heatSinks: 18,
    doubleHeatSinks: false,
    locations: createBipedLocations(armor, structure, criticals),
    weapons: [
      createWeapon('ppc1', 'PPC', 10, 10, 3, 6, 12, 18, WeaponType.ENERGY, 'RT', 999, { criticalSlots: 3, tonnage: 7 }),
      createWeapon('ppc2', 'PPC', 10, 10, 3, 6, 12, 18, WeaponType.ENERGY, 'LT', 999, { criticalSlots: 3, tonnage: 7 }),
      createWeapon('srm6', 'SRM-6', 12, 4, 0, 3, 6, 9, WeaponType.MISSILE, 'LT', 15, { criticalSlots: 2, tonnage: 3, ammoPerTon: 15 }),
      createWeapon('mg', 'Machine Gun', 2, 0, 0, 1, 2, 3, WeaponType.MACHINE_GUN, 'RT', 200, { tonnage: 0.5, ammoPerTon: 200 }),
      createWeapon('ml1', 'Medium Laser', 5, 3, 0, 3, 6, 9, WeaponType.ENERGY, 'RA', 999, { tonnage: 1 }),
      createWeapon('ml2', 'Medium Laser', 5, 3, 0, 3, 6, 9, WeaponType.ENERGY, 'LA', 999, { tonnage: 1 })
    ],
    ammo: [
      { type: 'SRM-6', shots: 15, location: 'LT', explosive: true },
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

// Hunchback HBK-4G
export function createHunchback(): Unit {
  const criticals: { [key: string]: string[] } = {
    'HD': ['Life Support', 'Sensors', 'Cockpit', 'None', 'None', 'None'],
    'CT': ['Engine', 'Engine', 'Engine', 'Gyro', 'Gyro', 'Gyro', 'Engine', 'Engine', 'Engine', 'None', 'None', 'None'],
    'CTR': ['None', 'None', 'None', 'None', 'None', 'None'],
    'RT': ['Medium Laser', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None'],
    'RTR': ['None', 'None', 'None', 'None', 'None', 'None'],
    'LT': ['Medium Laser', 'Small Laser', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None'],
    'LTR': ['None', 'None', 'None', 'None', 'None', 'None'],
    'RA': ['AC/20', 'AC/20', 'AC/20', 'AC/20', 'AC/20', 'AC/20', 'AC/20', 'AC/20', 'AC/20', 'AC/20', 'Ammo AC/20', 'Ammo AC/20'],
    'LA': ['Medium Laser', 'None', 'None', 'None', 'None', 'None'],
    'RL': ['None', 'None', 'None', 'None', 'None', 'None'],
    'LL': ['None', 'None', 'None', 'None', 'None', 'None']
  };
  
  const armor = {
    'HD': 6, 'CT': 16, 'CTR': 5, 'RT': 12, 'RTR': 4,
    'LT': 12, 'LTR': 4, 'RA': 16, 'LA': 6, 'RL': 12, 'LL': 12
  };
  
  const structure = {
    'HD': 3, 'CT': 11, 'RT': 8, 'LT': 8, 'RA': 6, 'LA': 6, 'RL': 8, 'LL': 8
  };
  
  return {
    id: `hunchback-${Date.now()}`,
    name: 'HBK-4G Hunchback',
    unitType: UnitType.MECH,
    config: Config.BIPED,
    tonnage: 50,
    bv2: 1044,
    walkingMP: 4,
    runningMP: 6,
    jumpingMP: 0,
    currentMP: 4,
    movementMode: MovementMode.STANDING,
    heat: 0,
    heatSinks: 13,
    doubleHeatSinks: false,
    locations: createBipedLocations(armor, structure, criticals),
    weapons: [
      createWeapon('ac20', 'AC/20', 20, 7, 0, 3, 6, 9, WeaponType.BALLISTIC, 'RA', 10, { criticalSlots: 10, tonnage: 14 }),
      createWeapon('ml1', 'Medium Laser', 5, 3, 0, 3, 6, 9, WeaponType.ENERGY, 'RT', 999, { tonnage: 1 }),
      createWeapon('ml2', 'Medium Laser', 5, 3, 0, 3, 6, 9, WeaponType.ENERGY, 'LT', 999, { tonnage: 1 }),
      createWeapon('ml3', 'Medium Laser', 5, 3, 0, 3, 6, 9, WeaponType.ENERGY, 'LA', 999, { tonnage: 1 }),
      createWeapon('sl', 'Small Laser', 3, 1, 0, 1, 2, 3, WeaponType.ENERGY, 'LT', 999, { tonnage: 0.5 })
    ],
    ammo: [
      { type: 'AC/20', shots: 5, location: 'RA', explosive: true },
      { type: 'AC/20', shots: 5, location: 'RA', explosive: true }
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

// Jenner JR7-D
export function createJenner(): Unit {
  const criticals: { [key: string]: string[] } = {
    'HD': ['Life Support', 'Sensors', 'Cockpit', 'None', 'None', 'None'],
    'CT': ['Engine', 'Engine', 'Engine', 'Gyro', 'Gyro', 'Gyro', 'Engine', 'Engine', 'Engine', 'Jump Jet', 'Jump Jet', 'Jump Jet'],
    'CTR': ['None', 'None', 'None', 'None', 'None', 'None'],
    'RT': ['SRM-4', 'Ammo SRM-4', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None'],
    'RTR': ['None', 'None', 'None', 'None', 'None', 'None'],
    'LT': ['SRM-4', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None'],
    'LTR': ['None', 'None', 'None', 'None', 'None', 'None'],
    'RA': ['Medium Laser', 'Medium Laser', 'None', 'None', 'None', 'None'],
    'LA': ['Medium Laser', 'Medium Laser', 'None', 'None', 'None', 'None'],
    'RL': ['Jump Jet', 'None', 'None', 'None', 'None', 'None'],
    'LL': ['Jump Jet', 'None', 'None', 'None', 'None', 'None']
  };
  
  const armor = {
    'HD': 5, 'CT': 8, 'CTR': 2, 'RT': 6, 'RTR': 2,
    'LT': 6, 'LTR': 2, 'RA': 4, 'LA': 4, 'RL': 6, 'LL': 6
  };
  
  const structure = {
    'HD': 3, 'CT': 6, 'RT': 5, 'LT': 5, 'RA': 3, 'LA': 3, 'RL': 5, 'LL': 5
  };
  
  return {
    id: `jenner-${Date.now()}`,
    name: 'JR7-D Jenner',
    unitType: UnitType.MECH,
    config: Config.BIPED,
    tonnage: 35,
    bv2: 744,
    walkingMP: 7,
    runningMP: 11,
    jumpingMP: 5,
    currentMP: 7,
    movementMode: MovementMode.STANDING,
    heat: 0,
    heatSinks: 10,
    doubleHeatSinks: false,
    locations: createBipedLocations(armor, structure, criticals),
    weapons: [
      createWeapon('ml1', 'Medium Laser', 5, 3, 0, 3, 6, 9, WeaponType.ENERGY, 'RA', 999, { tonnage: 1 }),
      createWeapon('ml2', 'Medium Laser', 5, 3, 0, 3, 6, 9, WeaponType.ENERGY, 'RA', 999, { tonnage: 1 }),
      createWeapon('ml3', 'Medium Laser', 5, 3, 0, 3, 6, 9, WeaponType.ENERGY, 'LA', 999, { tonnage: 1 }),
      createWeapon('ml4', 'Medium Laser', 5, 3, 0, 3, 6, 9, WeaponType.ENERGY, 'LA', 999, { tonnage: 1 }),
      createWeapon('srm4-1', 'SRM-4', 8, 3, 0, 3, 6, 9, WeaponType.MISSILE, 'RT', 25, { criticalSlots: 1, tonnage: 2, ammoPerTon: 25 }),
      createWeapon('srm4-2', 'SRM-4', 8, 3, 0, 3, 6, 9, WeaponType.MISSILE, 'LT', 25, { criticalSlots: 1, tonnage: 2, ammoPerTon: 25 })
    ],
    ammo: [
      { type: 'SRM-4', shots: 25, location: 'RT', explosive: true }
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

// Import additional mechs
import { 
  createLocust, 
  createCommando, 
  createUrbanmech,
  createCenturion,
  createWolverine,
  createCatapult,
  createMarauder,
  createAwesome,
  createStalker,
  createKingCrab
} from './additional-units';

// Import medium/heavy mechs
import {
  createShadowhawk,
  createGriffin,
  createPhoenixHawk,
  createTrebuchet
} from './mechs-medium-advanced';

// Import heavy mechs and clan mechs
import {
  createThunderbolt,
  createOrion,
  createStormcrow,
  createMadDog,
  createWarhawk
} from './mechs-heavy-clan';

// Import vehicles
import {
  createScorpion,
  createVedette,
  createRommel,
  createDemolisher,
  createStriker
} from './vehicles';

// Get all available units (Mechs + Vehicles)
export function getAllUnits(): Unit[] {
  return [
    // Light Mechs (20-35 tons)
    createLocust(),
    createCommando(),
    createUrbanmech(),
    createJenner(),
    
    // Medium Mechs (40-55 tons)
    createHunchback(),
    createShadowhawk(),
    createGriffin(),
    createPhoenixHawk(),
    createTrebuchet(),
    createCenturion(),
    createWolverine(),
    
    // Heavy Mechs (60-75 tons)
    createWarhammer(),
    createThunderbolt(),
    createCatapult(),
    createOrion(),
    createMarauder(),
    createTimberWolf(),
    
    // Clan Mechs
    createStormcrow(),
    createMadDog(),
    createWarhawk(),
    
    // Assault Mechs (80-100 tons)
    createAwesome(),
    createStalker(),
    createAtlasD(),
    createKingCrab()
  ];
}

// Get vehicles only
export function getAllVehicles(): Unit[] {
  return [
    createScorpion(),
    createStriker(),
    createVedette(),
    createRommel(),
    createDemolisher()
  ];
}

// Get all units including vehicles
export function getAllUnitsAndVehicles(): Unit[] {
  return [
    ...getAllUnits(),
    ...getAllVehicles()
  ];
}

// Create a copy of a unit with new ID
export function cloneUnit(unit: Unit): Unit {
  return {
    ...unit,
    id: `${unit.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    locations: new Map(unit.locations),
    weapons: unit.weapons.map(w => ({ ...w, shotsRemaining: w.shotsRemaining })),
    ammo: unit.ammo.map(a => ({ ...a })),
    pilot: { ...unit.pilot },
    position: null
  };
}
