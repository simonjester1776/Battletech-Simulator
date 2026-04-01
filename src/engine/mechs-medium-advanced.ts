// Advanced Medium Mechs (40-55 tons)

import type { Unit, Weapon, Location } from '@/types/battletech';
import { UnitType, Config, WeaponType, MovementMode } from '@/types/battletech';

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

// Shadowhawk SHD-2H (55 tons)
export function createShadowhawk(): Unit {
  const criticals: { [key: string]: string[] } = {
    'HD': ['Life Support', 'Sensors', 'Cockpit', 'None', 'None', 'None'],
    'CT': ['Engine', 'Engine', 'Engine', 'Gyro', 'Gyro', 'Gyro', 'Engine', 'Engine', 'Engine', 'Jump Jet', 'Jump Jet', 'None'],
    'CTR': ['None', 'None', 'None', 'None', 'None', 'None'],
    'RT': ['SRM-2', 'Ammo SRM-2', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None'],
    'RTR': ['None', 'None', 'None', 'None', 'None', 'None'],
    'LT': ['LRM-5', 'Ammo LRM-5', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None'],
    'LTR': ['None', 'None', 'None', 'None', 'None', 'None'],
    'RA': ['AC/5', 'AC/5', 'AC/5', 'AC/5', 'Ammo AC/5', 'None'],
    'LA': ['Medium Laser', 'None', 'None', 'None', 'None', 'None'],
    'RL': ['Jump Jet', 'None', 'None', 'None', 'None', 'None'],
    'LL': ['Jump Jet', 'None', 'None', 'None', 'None', 'None']
  };
  
  return {
    id: `shadowhawk-${Date.now()}`, name: 'SHD-2H Shadowhawk',
    unitType: UnitType.MECH, config: Config.BIPED, tonnage: 55, bv2: 1047,
    walkingMP: 5, runningMP: 8, jumpingMP: 3, currentMP: 5,
    movementMode: MovementMode.STANDING, heat: 0, heatSinks: 12, doubleHeatSinks: false,
    locations: createBipedLocations(
      { HD: 6, CT: 18, CTR: 6, RT: 14, RTR: 5, LT: 14, LTR: 5, RA: 12, LA: 12, RL: 14, LL: 14 },
      { HD: 3, CT: 12, RT: 9, LT: 9, RA: 7, LA: 7, RL: 9, LL: 9 },
      criticals
    ),
    weapons: [
      createWeapon('ac5', 'AC/5', 5, 1, 3, 6, 12, 18, WeaponType.BALLISTIC, 'RA', 40, { criticalSlots: 4, tonnage: 8 }),
      createWeapon('lrm5', 'LRM-5', 5, 2, 6, 7, 14, 21, WeaponType.MISSILE, 'LT', 24, { criticalSlots: 1, tonnage: 2 }),
      createWeapon('srm2', 'SRM-2', 4, 2, 0, 3, 6, 9, WeaponType.MISSILE, 'RT', 50, { criticalSlots: 1, tonnage: 1 }),
      createWeapon('ml', 'Medium Laser', 5, 3, 0, 3, 6, 9, WeaponType.ENERGY, 'LA', 999, { tonnage: 1 })
    ],
    ammo: [
      { type: 'AC/5', shots: 40, location: 'RA', explosive: true },
      { type: 'LRM-5', shots: 24, location: 'LT', explosive: true },
      { type: 'SRM-2', shots: 50, location: 'RT', explosive: true }
    ],
    hasECM: false, hasAMS: false, hasCASE: false, hasXLEngine: false,
    hasXXLEngine: false, hasCompactEngine: false, hasTSM: false, hasMASC: false,
    engineHits: 0, gyroHits: 0, sensorHits: 0, lifeSupportHits: 0,
    pilot: { name: 'MechWarrior', gunnery: 4, piloting: 5, hits: 0, conscious: true },
    alive: true, shutdown: false, prone: false, immobile: false, position: null, facing: 0
  };
}

// Griffin GRF-1N (55 tons)
export function createGriffin(): Unit {
  const criticals: { [key: string]: string[] } = {
    'HD': ['Life Support', 'Sensors', 'Cockpit', 'None', 'None', 'None'],
    'CT': ['Engine', 'Engine', 'Engine', 'Gyro', 'Gyro', 'Gyro', 'Engine', 'Engine', 'Engine', 'Jump Jet', 'Jump Jet', 'None'],
    'CTR': ['None', 'None', 'None', 'None', 'None', 'None'],
    'RT': ['LRM-10', 'LRM-10', 'Ammo LRM-10', 'Ammo LRM-10', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None'],
    'RTR': ['None', 'None', 'None', 'None', 'None', 'None'],
    'LT': ['PPC', 'PPC', 'PPC', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None'],
    'LTR': ['None', 'None', 'None', 'None', 'None', 'None'],
    'RA': ['Medium Laser', 'None', 'None', 'None', 'None', 'None'],
    'LA': ['None', 'None', 'None', 'None', 'None', 'None'],
    'RL': ['Jump Jet', 'None', 'None', 'None', 'None', 'None'],
    'LL': ['Jump Jet', 'None', 'None', 'None', 'None', 'None']
  };
  
  return {
    id: `griffin-${Date.now()}`, name: 'GRF-1N Griffin',
    unitType: UnitType.MECH, config: Config.BIPED, tonnage: 55, bv2: 1272,
    walkingMP: 5, runningMP: 8, jumpingMP: 5, currentMP: 5,
    movementMode: MovementMode.STANDING, heat: 0, heatSinks: 10, doubleHeatSinks: false,
    locations: createBipedLocations(
      { HD: 6, CT: 18, CTR: 6, RT: 14, RTR: 5, LT: 14, LTR: 5, RA: 12, LA: 12, RL: 14, LL: 14 },
      { HD: 3, CT: 12, RT: 9, LT: 9, RA: 7, LA: 7, RL: 9, LL: 9 },
      criticals
    ),
    weapons: [
      createWeapon('ppc', 'PPC', 10, 10, 3, 6, 12, 18, WeaponType.ENERGY, 'LT', 999, { criticalSlots: 3, tonnage: 7 }),
      createWeapon('lrm10', 'LRM-10', 10, 4, 6, 7, 14, 21, WeaponType.MISSILE, 'RT', 24, { criticalSlots: 2, tonnage: 5 }),
      createWeapon('ml', 'Medium Laser', 5, 3, 0, 3, 6, 9, WeaponType.ENERGY, 'RA', 999, { tonnage: 1 })
    ],
    ammo: [
      { type: 'LRM-10', shots: 12, location: 'RT', explosive: true },
      { type: 'LRM-10', shots: 12, location: 'RT', explosive: true }
    ],
    hasECM: false, hasAMS: false, hasCASE: false, hasXLEngine: false,
    hasXXLEngine: false, hasCompactEngine: false, hasTSM: false, hasMASC: false,
    engineHits: 0, gyroHits: 0, sensorHits: 0, lifeSupportHits: 0,
    pilot: { name: 'MechWarrior', gunnery: 4, piloting: 5, hits: 0, conscious: true },
    alive: true, shutdown: false, prone: false, immobile: false, position: null, facing: 0
  };
}

// Phoenix Hawk PXH-1 (45 tons)
export function createPhoenixHawk(): Unit {
  const criticals: { [key: string]: string[] } = {
    'HD': ['Life Support', 'Sensors', 'Cockpit', 'None', 'None', 'None'],
    'CT': ['Engine', 'Engine', 'Engine', 'Gyro', 'Gyro', 'Gyro', 'Engine', 'Engine', 'Engine', 'Jump Jet', 'Jump Jet', 'Jump Jet'],
    'CTR': ['None', 'None', 'None', 'None', 'None', 'None'],
    'RT': ['Large Laser', 'Large Laser', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None'],
    'RTR': ['None', 'None', 'None', 'None', 'None', 'None'],
    'LT': ['Machine Gun', 'Machine Gun', 'Ammo MG', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None'],
    'LTR': ['None', 'None', 'None', 'None', 'None', 'None'],
    'RA': ['Medium Laser', 'Medium Laser', 'None', 'None', 'None', 'None'],
    'LA': ['None', 'None', 'None', 'None', 'None', 'None'],
    'RL': ['Jump Jet', 'None', 'None', 'None', 'None', 'None'],
    'LL': ['Jump Jet', 'None', 'None', 'None', 'None', 'None']
  };
  
  return {
    id: `phoenixhawk-${Date.now()}`, name: 'PXH-1 Phoenix Hawk',
    unitType: UnitType.MECH, config: Config.BIPED, tonnage: 45, bv2: 1041,
    walkingMP: 6, runningMP: 9, jumpingMP: 6, currentMP: 6,
    movementMode: MovementMode.STANDING, heat: 0, heatSinks: 13, doubleHeatSinks: false,
    locations: createBipedLocations(
      { HD: 6, CT: 14, CTR: 4, RT: 11, RTR: 4, LT: 11, LTR: 4, RA: 9, LA: 9, RL: 11, LL: 11 },
      { HD: 3, CT: 10, RT: 7, LT: 7, RA: 6, LA: 6, RL: 7, LL: 7 },
      criticals
    ),
    weapons: [
      createWeapon('ll', 'Large Laser', 8, 8, 0, 3, 6, 9, WeaponType.ENERGY, 'RT', 999, { criticalSlots: 2, tonnage: 5 }),
      createWeapon('ml1', 'Medium Laser', 5, 3, 0, 3, 6, 9, WeaponType.ENERGY, 'RA', 999, { tonnage: 1 }),
      createWeapon('ml2', 'Medium Laser', 5, 3, 0, 3, 6, 9, WeaponType.ENERGY, 'RA', 999, { tonnage: 1 }),
      createWeapon('mg1', 'Machine Gun', 2, 0, 0, 1, 2, 3, WeaponType.MACHINE_GUN, 'LT', 200, { tonnage: 0.5 }),
      createWeapon('mg2', 'Machine Gun', 2, 0, 0, 1, 2, 3, WeaponType.MACHINE_GUN, 'LT', 200, { tonnage: 0.5 })
    ],
    ammo: [{ type: 'Machine Gun', shots: 200, location: 'LT', explosive: true }],
    hasECM: false, hasAMS: false, hasCASE: false, hasXLEngine: false,
    hasXXLEngine: false, hasCompactEngine: false, hasTSM: false, hasMASC: false,
    engineHits: 0, gyroHits: 0, sensorHits: 0, lifeSupportHits: 0,
    pilot: { name: 'MechWarrior', gunnery: 4, piloting: 5, hits: 0, conscious: true },
    alive: true, shutdown: false, prone: false, immobile: false, position: null, facing: 0
  };
}

// Trebuchet TBT-5N (50 tons)
export function createTrebuchet(): Unit {
  const criticals: { [key: string]: string[] } = {
    'HD': ['Life Support', 'Sensors', 'Cockpit', 'None', 'None', 'None'],
    'CT': ['Engine', 'Engine', 'Engine', 'Gyro', 'Gyro', 'Gyro', 'Engine', 'Engine', 'Engine', 'None', 'None', 'None'],
    'CTR': ['None', 'None', 'None', 'None', 'None', 'None'],
    'RT': ['LRM-15', 'LRM-15', 'LRM-15', 'Ammo LRM-15', 'Ammo LRM-15', 'None', 'None', 'None', 'None', 'None', 'None', 'None'],
    'RTR': ['None', 'None', 'None', 'None', 'None', 'None'],
    'LT': ['LRM-15', 'LRM-15', 'LRM-15', 'Ammo LRM-15', 'Ammo LRM-15', 'None', 'None', 'None', 'None', 'None', 'None', 'None'],
    'LTR': ['None', 'None', 'None', 'None', 'None', 'None'],
    'RA': ['Medium Laser', 'None', 'None', 'None', 'None', 'None'],
    'LA': ['Medium Laser', 'None', 'None', 'None', 'None', 'None'],
    'RL': ['None', 'None', 'None', 'None', 'None', 'None'],
    'LL': ['None', 'None', 'None', 'None', 'None', 'None']
  };
  
  return {
    id: `trebuchet-${Date.now()}`, name: 'TBT-5N Trebuchet',
    unitType: UnitType.MECH, config: Config.BIPED, tonnage: 50, bv2: 1134,
    walkingMP: 4, runningMP: 6, jumpingMP: 0, currentMP: 4,
    movementMode: MovementMode.STANDING, heat: 0, heatSinks: 16, doubleHeatSinks: false,
    locations: createBipedLocations(
      { HD: 6, CT: 16, CTR: 4, RT: 12, RTR: 4, LT: 12, LTR: 4, RA: 10, LA: 10, RL: 12, LL: 12 },
      { HD: 3, CT: 11, RT: 8, LT: 8, RA: 6, LA: 6, RL: 8, LL: 8 },
      criticals
    ),
    weapons: [
      createWeapon('lrm15-1', 'LRM-15', 15, 5, 6, 7, 14, 21, WeaponType.MISSILE, 'RT', 16, { criticalSlots: 3, tonnage: 7 }),
      createWeapon('lrm15-2', 'LRM-15', 15, 5, 6, 7, 14, 21, WeaponType.MISSILE, 'LT', 16, { criticalSlots: 3, tonnage: 7 }),
      createWeapon('ml1', 'Medium Laser', 5, 3, 0, 3, 6, 9, WeaponType.ENERGY, 'RA', 999, { tonnage: 1 }),
      createWeapon('ml2', 'Medium Laser', 5, 3, 0, 3, 6, 9, WeaponType.ENERGY, 'LA', 999, { tonnage: 1 })
    ],
    ammo: [
      { type: 'LRM-15', shots: 8, location: 'RT', explosive: true },
      { type: 'LRM-15', shots: 8, location: 'RT', explosive: true },
      { type: 'LRM-15', shots: 8, location: 'LT', explosive: true },
      { type: 'LRM-15', shots: 8, location: 'LT', explosive: true }
    ],
    hasECM: false, hasAMS: false, hasCASE: false, hasXLEngine: false,
    hasXXLEngine: false, hasCompactEngine: false, hasTSM: false, hasMASC: false,
    engineHits: 0, gyroHits: 0, sensorHits: 0, lifeSupportHits: 0,
    pilot: { name: 'MechWarrior', gunnery: 4, piloting: 5, hits: 0, conscious: true },
    alive: true, shutdown: false, prone: false, immobile: false, position: null, facing: 0
  };
}
