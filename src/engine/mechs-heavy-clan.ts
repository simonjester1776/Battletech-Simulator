// Heavy Mechs and Clan OmniMechs

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

// Thunderbolt TDR-5S (65 tons)
export function createThunderbolt(): Unit {
  const criticals: { [key: string]: string[] } = {
    'HD': ['Life Support', 'Sensors', 'Cockpit', 'None', 'None', 'None'],
    'CT': ['Engine', 'Engine', 'Engine', 'Gyro', 'Gyro', 'Gyro', 'Engine', 'Engine', 'Engine', 'None', 'None', 'None'],
    'CTR': ['None', 'None', 'None', 'None', 'None', 'None'],
    'RT': ['SRM-2', 'SRM-2', 'SRM-2', 'Ammo SRM-2', 'Medium Laser', 'Medium Laser', 'None', 'None', 'None', 'None', 'None', 'None'],
    'RTR': ['None', 'None', 'None', 'None', 'None', 'None'],
    'LT': ['LRM-15', 'LRM-15', 'LRM-15', 'Ammo LRM-15', 'Ammo LRM-15', 'Medium Laser', 'None', 'None', 'None', 'None', 'None', 'None'],
    'LTR': ['None', 'None', 'None', 'None', 'None', 'None'],
    'RA': ['Large Laser', 'Large Laser', 'None', 'None', 'None', 'None'],
    'LA': ['None', 'None', 'None', 'None', 'None', 'None'],
    'RL': ['None', 'None', 'None', 'None', 'None', 'None'],
    'LL': ['None', 'None', 'None', 'None', 'None', 'None']
  };
  
  return {
    id: `thunderbolt-${Date.now()}`, name: 'TDR-5S Thunderbolt',
    unitType: UnitType.MECH, config: Config.BIPED, tonnage: 65, bv2: 1312,
    walkingMP: 4, runningMP: 6, jumpingMP: 0, currentMP: 4,
    movementMode: MovementMode.STANDING, heat: 0, heatSinks: 15, doubleHeatSinks: false,
    locations: createBipedLocations(
      { HD: 8, CT: 20, CTR: 7, RT: 16, RTR: 5, LT: 16, LTR: 5, RA: 14, LA: 14, RL: 16, LL: 16 },
      { HD: 3, CT: 14, RT: 10, LT: 10, RA: 8, LA: 8, RL: 10, LL: 10 },
      criticals
    ),
    weapons: [
      createWeapon('ll', 'Large Laser', 8, 8, 0, 3, 6, 9, WeaponType.ENERGY, 'RA', 999, { criticalSlots: 2, tonnage: 5 }),
      createWeapon('lrm15', 'LRM-15', 15, 5, 6, 7, 14, 21, WeaponType.MISSILE, 'LT', 16, { criticalSlots: 3, tonnage: 7 }),
      createWeapon('srm2-1', 'SRM-2', 4, 2, 0, 3, 6, 9, WeaponType.MISSILE, 'RT', 50, { criticalSlots: 1, tonnage: 1 }),
      createWeapon('srm2-2', 'SRM-2', 4, 2, 0, 3, 6, 9, WeaponType.MISSILE, 'RT', 50, { criticalSlots: 1, tonnage: 1 }),
      createWeapon('srm2-3', 'SRM-2', 4, 2, 0, 3, 6, 9, WeaponType.MISSILE, 'RT', 50, { criticalSlots: 1, tonnage: 1 }),
      createWeapon('ml1', 'Medium Laser', 5, 3, 0, 3, 6, 9, WeaponType.ENERGY, 'RT', 999, { tonnage: 1 }),
      createWeapon('ml2', 'Medium Laser', 5, 3, 0, 3, 6, 9, WeaponType.ENERGY, 'RT', 999, { tonnage: 1 }),
      createWeapon('ml3', 'Medium Laser', 5, 3, 0, 3, 6, 9, WeaponType.ENERGY, 'LT', 999, { tonnage: 1 })
    ],
    ammo: [
      { type: 'LRM-15', shots: 8, location: 'LT', explosive: true },
      { type: 'LRM-15', shots: 8, location: 'LT', explosive: true },
      { type: 'SRM-2', shots: 50, location: 'RT', explosive: true }
    ],
    hasECM: false, hasAMS: false, hasCASE: false, hasXLEngine: false,
    hasXXLEngine: false, hasCompactEngine: false, hasTSM: false, hasMASC: false,
    engineHits: 0, gyroHits: 0, sensorHits: 0, lifeSupportHits: 0,
    pilot: { name: 'MechWarrior', gunnery: 4, piloting: 5, hits: 0, conscious: true },
    alive: true, shutdown: false, prone: false, immobile: false, position: null, facing: 0
  };
}

// Orion ON1-K (75 tons)
export function createOrion(): Unit {
  const criticals: { [key: string]: string[] } = {
    'HD': ['Life Support', 'Sensors', 'Cockpit', 'None', 'None', 'None'],
    'CT': ['Engine', 'Engine', 'Engine', 'Gyro', 'Gyro', 'Gyro', 'Engine', 'Engine', 'Engine', 'None', 'None', 'None'],
    'CTR': ['None', 'None', 'None', 'None', 'None', 'None'],
    'RT': ['LRM-20', 'LRM-20', 'LRM-20', 'LRM-20', 'LRM-20', 'Ammo LRM-20', 'Ammo LRM-20', 'None', 'None', 'None', 'None', 'None'],
    'RTR': ['None', 'None', 'None', 'None', 'None', 'None'],
    'LT': ['AC/10', 'AC/10', 'AC/10', 'AC/10', 'AC/10', 'AC/10', 'AC/10', 'Ammo AC/10', 'Ammo AC/10', 'None', 'None', 'None'],
    'LTR': ['None', 'None', 'None', 'None', 'None', 'None'],
    'RA': ['Medium Laser', 'Medium Laser', 'SRM-4', 'Ammo SRM-4', 'None', 'None'],
    'LA': ['None', 'None', 'None', 'None', 'None', 'None'],
    'RL': ['None', 'None', 'None', 'None', 'None', 'None'],
    'LL': ['None', 'None', 'None', 'None', 'None', 'None']
  };
  
  return {
    id: `orion-${Date.now()}`, name: 'ON1-K Orion',
    unitType: UnitType.MECH, config: Config.BIPED, tonnage: 75, bv2: 1246,
    walkingMP: 4, runningMP: 6, jumpingMP: 0, currentMP: 4,
    movementMode: MovementMode.STANDING, heat: 0, heatSinks: 13, doubleHeatSinks: false,
    locations: createBipedLocations(
      { HD: 9, CT: 22, CTR: 8, RT: 18, RTR: 6, LT: 18, LTR: 6, RA: 16, LA: 16, RL: 18, LL: 18 },
      { HD: 3, CT: 16, RT: 12, LT: 12, RA: 10, LA: 10, RL: 12, LL: 12 },
      criticals
    ),
    weapons: [
      createWeapon('ac10', 'AC/10', 10, 3, 0, 5, 10, 15, WeaponType.BALLISTIC, 'LT', 40, { criticalSlots: 7, tonnage: 12 }),
      createWeapon('lrm20', 'LRM-20', 20, 6, 6, 7, 14, 21, WeaponType.MISSILE, 'RT', 12, { criticalSlots: 5, tonnage: 10 }),
      createWeapon('srm4', 'SRM-4', 8, 3, 0, 3, 6, 9, WeaponType.MISSILE, 'RA', 25, { criticalSlots: 1, tonnage: 2 }),
      createWeapon('ml1', 'Medium Laser', 5, 3, 0, 3, 6, 9, WeaponType.ENERGY, 'RA', 999, { tonnage: 1 }),
      createWeapon('ml2', 'Medium Laser', 5, 3, 0, 3, 6, 9, WeaponType.ENERGY, 'RA', 999, { tonnage: 1 })
    ],
    ammo: [
      { type: 'AC/10', shots: 20, location: 'LT', explosive: true },
      { type: 'AC/10', shots: 20, location: 'LT', explosive: true },
      { type: 'LRM-20', shots: 6, location: 'RT', explosive: true },
      { type: 'LRM-20', shots: 6, location: 'RT', explosive: true },
      { type: 'SRM-4', shots: 25, location: 'RA', explosive: true }
    ],
    hasECM: false, hasAMS: false, hasCASE: false, hasXLEngine: false,
    hasXXLEngine: false, hasCompactEngine: false, hasTSM: false, hasMASC: false,
    engineHits: 0, gyroHits: 0, sensorHits: 0, lifeSupportHits: 0,
    pilot: { name: 'MechWarrior', gunnery: 4, piloting: 5, hits: 0, conscious: true },
    alive: true, shutdown: false, prone: false, immobile: false, position: null, facing: 0
  };
}

// Stormcrow (Ryoken) Prime - 55 tons CLAN
export function createStormcrow(): Unit {
  const criticals: { [key: string]: string[] } = {
    'HD': ['Life Support', 'Sensors', 'Cockpit', 'None', 'None', 'None'],
    'CT': ['Engine', 'Engine', 'Engine', 'Gyro', 'Gyro', 'Gyro', 'XL Engine', 'XL Engine', 'XL Engine', 'None', 'None', 'None'],
    'CTR': ['XL Engine', 'XL Engine', 'XL Engine', 'None', 'None', 'None'],
    'RT': ['ER Large Laser', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None'],
    'RTR': ['XL Engine', 'XL Engine', 'XL Engine', 'None', 'None', 'None'],
    'LT': ['ER Large Laser', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None'],
    'LTR': ['XL Engine', 'XL Engine', 'XL Engine', 'None', 'None', 'None'],
    'RA': ['ER Medium Laser', 'ER Medium Laser', 'ER Medium Laser', 'ER Medium Laser', 'None', 'None'],
    'LA': ['LRM-20', 'LRM-20', 'LRM-20', 'LRM-20', 'Ammo LRM-20', 'Ammo LRM-20'],
    'RL': ['None', 'None', 'None', 'None', 'None', 'None'],
    'LL': ['None', 'None', 'None', 'None', 'None', 'None']
  };
  
  return {
    id: `stormcrow-${Date.now()}`, name: 'Stormcrow Prime',
    unitType: UnitType.MECH, config: Config.BIPED, tonnage: 55, bv2: 1991,
    walkingMP: 6, runningMP: 9, jumpingMP: 0, currentMP: 6,
    movementMode: MovementMode.STANDING, heat: 0, heatSinks: 16, doubleHeatSinks: true,
    locations: createBipedLocations(
      { HD: 7, CT: 16, CTR: 6, RT: 14, RTR: 5, LT: 14, LTR: 5, RA: 12, LA: 12, RL: 14, LL: 14 },
      { HD: 3, CT: 12, RT: 9, LT: 9, RA: 7, LA: 7, RL: 9, LL: 9 },
      criticals
    ),
    weapons: [
      createWeapon('erll1', 'ER Large Laser', 10, 12, 0, 3, 7, 15, WeaponType.ENERGY, 'RT', 999, { criticalSlots: 1, tonnage: 4 }),
      createWeapon('erll2', 'ER Large Laser', 10, 12, 0, 3, 7, 15, WeaponType.ENERGY, 'LT', 999, { criticalSlots: 1, tonnage: 4 }),
      createWeapon('lrm20', 'LRM-20 (Clan)', 20, 6, 0, 7, 14, 21, WeaponType.MISSILE, 'LA', 12, { criticalSlots: 4, tonnage: 5 }),
      createWeapon('erml1', 'ER Medium Laser', 7, 5, 0, 3, 8, 15, WeaponType.ENERGY, 'RA', 999, { tonnage: 1 }),
      createWeapon('erml2', 'ER Medium Laser', 7, 5, 0, 3, 8, 15, WeaponType.ENERGY, 'RA', 999, { tonnage: 1 }),
      createWeapon('erml3', 'ER Medium Laser', 7, 5, 0, 3, 8, 15, WeaponType.ENERGY, 'RA', 999, { tonnage: 1 }),
      createWeapon('erml4', 'ER Medium Laser', 7, 5, 0, 3, 8, 15, WeaponType.ENERGY, 'RA', 999, { tonnage: 1 })
    ],
    ammo: [
      { type: 'LRM-20', shots: 6, location: 'LA', explosive: true },
      { type: 'LRM-20', shots: 6, location: 'LA', explosive: true }
    ],
    hasECM: false, hasAMS: false, hasCASE: false, hasXLEngine: true,
    hasXXLEngine: false, hasCompactEngine: false, hasTSM: false, hasMASC: false,
    engineHits: 0, gyroHits: 0, sensorHits: 0, lifeSupportHits: 0,
    pilot: { name: 'MechWarrior', gunnery: 4, piloting: 5, hits: 0, conscious: true },
    alive: true, shutdown: false, prone: false, immobile: false, position: null, facing: 0
  };
}

// Mad Dog (Vulture) Prime - 60 tons CLAN
export function createMadDog(): Unit {
  const criticals: { [key: string]: string[] } = {
    'HD': ['Life Support', 'Sensors', 'Cockpit', 'None', 'None', 'None'],
    'CT': ['Engine', 'Engine', 'Engine', 'Gyro', 'Gyro', 'Gyro', 'XL Engine', 'XL Engine', 'XL Engine', 'None', 'None', 'None'],
    'CTR': ['XL Engine', 'XL Engine', 'XL Engine', 'None', 'None', 'None'],
    'RT': ['LRM-20', 'LRM-20', 'LRM-20', 'LRM-20', 'Ammo LRM-20', 'Ammo LRM-20', 'None', 'None', 'None', 'None', 'None', 'None'],
    'RTR': ['XL Engine', 'XL Engine', 'XL Engine', 'None', 'None', 'None'],
    'LT': ['LRM-20', 'LRM-20', 'LRM-20', 'LRM-20', 'Ammo LRM-20', 'Ammo LRM-20', 'None', 'None', 'None', 'None', 'None', 'None'],
    'LTR': ['XL Engine', 'XL Engine', 'XL Engine', 'None', 'None', 'None'],
    'RA': ['ER Medium Laser', 'ER Medium Laser', 'None', 'None', 'None', 'None'],
    'LA': ['ER Medium Laser', 'ER Medium Laser', 'None', 'None', 'None', 'None'],
    'RL': ['None', 'None', 'None', 'None', 'None', 'None'],
    'LL': ['None', 'None', 'None', 'None', 'None', 'None']
  };
  
  return {
    id: `maddog-${Date.now()}`, name: 'Mad Dog Prime',
    unitType: UnitType.MECH, config: Config.BIPED, tonnage: 60, bv2: 2060,
    walkingMP: 5, runningMP: 8, jumpingMP: 0, currentMP: 5,
    movementMode: MovementMode.STANDING, heat: 0, heatSinks: 16, doubleHeatSinks: true,
    locations: createBipedLocations(
      { HD: 7, CT: 18, CTR: 6, RT: 15, RTR: 6, LT: 15, LTR: 6, RA: 13, LA: 13, RL: 15, LL: 15 },
      { HD: 3, CT: 13, RT: 10, LT: 10, RA: 8, LA: 8, RL: 10, LL: 10 },
      criticals
    ),
    weapons: [
      createWeapon('lrm20-1', 'LRM-20 (Clan)', 20, 6, 0, 7, 14, 21, WeaponType.MISSILE, 'RT', 12, { criticalSlots: 4, tonnage: 5 }),
      createWeapon('lrm20-2', 'LRM-20 (Clan)', 20, 6, 0, 7, 14, 21, WeaponType.MISSILE, 'LT', 12, { criticalSlots: 4, tonnage: 5 }),
      createWeapon('erml1', 'ER Medium Laser', 7, 5, 0, 3, 8, 15, WeaponType.ENERGY, 'RA', 999, { tonnage: 1 }),
      createWeapon('erml2', 'ER Medium Laser', 7, 5, 0, 3, 8, 15, WeaponType.ENERGY, 'RA', 999, { tonnage: 1 }),
      createWeapon('erml3', 'ER Medium Laser', 7, 5, 0, 3, 8, 15, WeaponType.ENERGY, 'LA', 999, { tonnage: 1 }),
      createWeapon('erml4', 'ER Medium Laser', 7, 5, 0, 3, 8, 15, WeaponType.ENERGY, 'LA', 999, { tonnage: 1 })
    ],
    ammo: [
      { type: 'LRM-20', shots: 6, location: 'RT', explosive: true },
      { type: 'LRM-20', shots: 6, location: 'RT', explosive: true },
      { type: 'LRM-20', shots: 6, location: 'LT', explosive: true },
      { type: 'LRM-20', shots: 6, location: 'LT', explosive: true }
    ],
    hasECM: false, hasAMS: false, hasCASE: false, hasXLEngine: true,
    hasXXLEngine: false, hasCompactEngine: false, hasTSM: false, hasMASC: false,
    engineHits: 0, gyroHits: 0, sensorHits: 0, lifeSupportHits: 0,
    pilot: { name: 'MechWarrior', gunnery: 4, piloting: 5, hits: 0, conscious: true },
    alive: true, shutdown: false, prone: false, immobile: false, position: null, facing: 0
  };
}

// Warhawk (Masakari) Prime - 85 tons CLAN
export function createWarhawk(): Unit {
  const criticals: { [key: string]: string[] } = {
    'HD': ['Life Support', 'Sensors', 'Cockpit', 'None', 'None', 'None'],
    'CT': ['Engine', 'Engine', 'Engine', 'Gyro', 'Gyro', 'Gyro', 'XL Engine', 'XL Engine', 'XL Engine', 'None', 'None', 'None'],
    'CTR': ['XL Engine', 'XL Engine', 'XL Engine', 'None', 'None', 'None'],
    'RT': ['ER PPC', 'ER PPC', 'ER PPC', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None'],
    'RTR': ['XL Engine', 'XL Engine', 'XL Engine', 'None', 'None', 'None'],
    'LT': ['ER PPC', 'ER PPC', 'ER PPC', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None', 'None'],
    'LTR': ['XL Engine', 'XL Engine', 'XL Engine', 'None', 'None', 'None'],
    'RA': ['ER PPC', 'ER PPC', 'ER PPC', 'Ultra AC/5', 'Ultra AC/5', 'Ammo UAC/5'],
    'LA': ['ER PPC', 'ER PPC', 'ER PPC', 'Ultra AC/5', 'Ultra AC/5', 'Ammo UAC/5'],
    'RL': ['None', 'None', 'None', 'None', 'None', 'None'],
    'LL': ['None', 'None', 'None', 'None', 'None', 'None']
  };
  
  return {
    id: `warhawk-${Date.now()}`, name: 'Warhawk Prime',
    unitType: UnitType.MECH, config: Config.BIPED, tonnage: 85, bv2: 2859,
    walkingMP: 4, runningMP: 6, jumpingMP: 0, currentMP: 4,
    movementMode: MovementMode.STANDING, heat: 0, heatSinks: 20, doubleHeatSinks: true,
    locations: createBipedLocations(
      { HD: 9, CT: 26, CTR: 10, RT: 22, RTR: 7, LT: 22, LTR: 7, RA: 20, LA: 20, RL: 22, LL: 22 },
      { HD: 3, CT: 19, RT: 14, LT: 14, RA: 11, LA: 11, RL: 14, LL: 14 },
      criticals
    ),
    weapons: [
      createWeapon('erppc1', 'ER PPC', 15, 15, 0, 3, 7, 23, WeaponType.ENERGY, 'RT', 999, { criticalSlots: 2, tonnage: 6 }),
      createWeapon('erppc2', 'ER PPC', 15, 15, 0, 3, 7, 23, WeaponType.ENERGY, 'LT', 999, { criticalSlots: 2, tonnage: 6 }),
      createWeapon('erppc3', 'ER PPC', 15, 15, 0, 3, 7, 23, WeaponType.ENERGY, 'RA', 999, { criticalSlots: 2, tonnage: 6 }),
      createWeapon('erppc4', 'ER PPC', 15, 15, 0, 3, 7, 23, WeaponType.ENERGY, 'LA', 999, { criticalSlots: 2, tonnage: 6 }),
      createWeapon('uac5-1', 'Ultra AC/5', 5, 1, 0, 6, 13, 20, WeaponType.BALLISTIC, 'RA', 40, { criticalSlots: 3, tonnage: 7 }),
      createWeapon('uac5-2', 'Ultra AC/5', 5, 1, 0, 6, 13, 20, WeaponType.BALLISTIC, 'LA', 40, { criticalSlots: 3, tonnage: 7 })
    ],
    ammo: [
      { type: 'Ultra AC/5', shots: 20, location: 'RA', explosive: true },
      { type: 'Ultra AC/5', shots: 20, location: 'LA', explosive: true }
    ],
    hasECM: false, hasAMS: false, hasCASE: false, hasXLEngine: true,
    hasXXLEngine: false, hasCompactEngine: false, hasTSM: false, hasMASC: false,
    engineHits: 0, gyroHits: 0, sensorHits: 0, lifeSupportHits: 0,
    pilot: { name: 'MechWarrior', gunnery: 4, piloting: 5, hits: 0, conscious: true },
    alive: true, shutdown: false, prone: false, immobile: false, position: null, facing: 0
  };
}
