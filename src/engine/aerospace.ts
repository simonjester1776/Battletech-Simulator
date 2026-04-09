import type { Unit } from '@/types/battletech';
import { UnitType } from '@/types/battletech';

// Aerospace-specific altitude levels
export const AltitudeLevel = {
  GROUND: 0,
  NOE: 1,        // Nap-of-the-Earth
  LOW: 2,
  MEDIUM: 3,
  HIGH: 4,
  VERY_HIGH: 5,
} as const;

export type AltitudeLevel = typeof AltitudeLevel[keyof typeof AltitudeLevel];

export interface AerospaceFighter extends Unit {
  altitude: AltitudeLevel;
  thrust: number;
  maxThrust: number;
  fuelPoints: number;
  maxFuelPoints: number;
  bombLoad: number;
  missiles: number;
}

// Light Aerospace Fighters (20-35 tons)
export const lightAerospaceFighters: Partial<AerospaceFighter>[] = [
  {
    id: 'sparrowhawk',
    name: 'Sparrowhawk',
    unitType: UnitType.AEROSPACE,
    tonnage: 30,
    bv2: 563,
    walkingMP: 0,
    runningMP: 0,
    jumpingMP: 0,
    thrust: 7,
    maxThrust: 11,
    altitude: AltitudeLevel.MEDIUM,
    fuelPoints: 400,
    maxFuelPoints: 400,
    heat: 0,
    heatSinks: 10,
    doubleHeatSinks: false,
    weapons: [
      {
        id: 'sparrow-ml',
        name: 'Medium Laser',
        damage: 5,
        heat: 3,
        minRange: 0,
        shortRange: 3,
        mediumRange: 6,
        longRange: 9,
        type: 'energy',
        shotsRemaining: Infinity,
        location: 'Nose',
        criticalSlots: 1,
        tonnage: 1,
      },
      {
        id: 'sparrow-srm',
        name: 'SRM 2',
        damage: 2,
        heat: 2,
        minRange: 0,
        shortRange: 3,
        mediumRange: 6,
        longRange: 9,
        type: 'missile',
        shotsRemaining: 50,
        location: 'Nose',
        criticalSlots: 1,
        tonnage: 1,
      },
    ],
  },
  {
    id: 'vulture',
    name: 'Vulture',
    unitType: UnitType.AEROSPACE,
    tonnage: 30,
    bv2: 587,
    walkingMP: 0,
    runningMP: 0,
    jumpingMP: 0,
    thrust: 8,
    maxThrust: 12,
    altitude: AltitudeLevel.MEDIUM,
    fuelPoints: 400,
    maxFuelPoints: 400,
    heat: 0,
    heatSinks: 10,
    doubleHeatSinks: false,
    weapons: [
      {
        id: 'vulture-ml',
        name: 'Medium Laser',
        damage: 5,
        heat: 3,
        minRange: 0,
        shortRange: 3,
        mediumRange: 6,
        longRange: 9,
        type: 'energy',
        shotsRemaining: Infinity,
        location: 'Nose',
        criticalSlots: 1,
        tonnage: 1,
      },
      {
        id: 'vulture-srm',
        name: 'SRM 4',
        damage: 2,
        heat: 3,
        minRange: 0,
        shortRange: 3,
        mediumRange: 6,
        longRange: 9,
        type: 'missile',
        shotsRemaining: 25,
        location: 'Nose',
        criticalSlots: 1,
        tonnage: 2,
      },
    ],
  },
];

// Medium Aerospace Fighters (40-55 tons)
export const mediumAerospaceFighters: Partial<AerospaceFighter>[] = [
  {
    id: 'shilone',
    name: 'Shilone',
    unitType: UnitType.AEROSPACE,
    tonnage: 50,
    bv2: 1136,
    walkingMP: 0,
    runningMP: 0,
    jumpingMP: 0,
    thrust: 6,
    maxThrust: 9,
    altitude: AltitudeLevel.MEDIUM,
    fuelPoints: 480,
    maxFuelPoints: 480,
    heat: 0,
    heatSinks: 20,
    doubleHeatSinks: false,
    weapons: [
      {
        id: 'shil-ppc',
        name: 'PPC',
        damage: 10,
        heat: 10,
        minRange: 3,
        shortRange: 6,
        mediumRange: 12,
        longRange: 18,
        type: 'energy',
        shotsRemaining: Infinity,
        location: 'Nose',
        criticalSlots: 3,
        tonnage: 7,
      },
      {
        id: 'shil-lrm',
        name: 'LRM 15',
        damage: 15,
        heat: 5,
        minRange: 6,
        shortRange: 7,
        mediumRange: 14,
        longRange: 21,
        type: 'missile',
        isCluster: true,
        shotsRemaining: 64,
        location: 'Nose',
        criticalSlots: 3,
        tonnage: 7,
      },
    ],
  },
  {
    id: 'lucifer',
    name: 'Lucifer',
    unitType: UnitType.AEROSPACE,
    tonnage: 45,
    bv2: 982,
    walkingMP: 0,
    runningMP: 0,
    jumpingMP: 0,
    thrust: 7,
    maxThrust: 11,
    altitude: AltitudeLevel.MEDIUM,
    fuelPoints: 400,
    maxFuelPoints: 400,
    heat: 0,
    heatSinks: 18,
    doubleHeatSinks: false,
    weapons: [
      {
        id: 'luci-ll',
        name: 'Large Laser',
        damage: 8,
        heat: 8,
        minRange: 0,
        shortRange: 5,
        mediumRange: 10,
        longRange: 15,
        type: 'energy',
        shotsRemaining: Infinity,
        location: 'Nose',
        criticalSlots: 2,
        tonnage: 5,
      },
      {
        id: 'luci-ml-1',
        name: 'Medium Laser',
        damage: 5,
        heat: 3,
        minRange: 0,
        shortRange: 3,
        mediumRange: 6,
        longRange: 9,
        type: 'energy',
        shotsRemaining: Infinity,
        location: 'Right Wing',
        criticalSlots: 1,
        tonnage: 1,
      },
      {
        id: 'luci-ml-2',
        name: 'Medium Laser',
        damage: 5,
        heat: 3,
        minRange: 0,
        shortRange: 3,
        mediumRange: 6,
        longRange: 9,
        type: 'energy',
        shotsRemaining: Infinity,
        location: 'Left Wing',
        criticalSlots: 1,
        tonnage: 1,
      },
    ],
  },
];

// Heavy Aerospace Fighters (60-75 tons)
export const heavyAerospaceFighters: Partial<AerospaceFighter>[] = [
  {
    id: 'thunderbird',
    name: 'Thunderbird',
    unitType: UnitType.AEROSPACE,
    tonnage: 60,
    bv2: 1342,
    walkingMP: 0,
    runningMP: 0,
    jumpingMP: 0,
    thrust: 5,
    maxThrust: 8,
    altitude: AltitudeLevel.MEDIUM,
    fuelPoints: 480,
    maxFuelPoints: 480,
    heat: 0,
    heatSinks: 24,
    doubleHeatSinks: false,
    weapons: [
      {
        id: 'thun-ac10',
        name: 'Autocannon/10',
        damage: 10,
        heat: 3,
        minRange: 0,
        shortRange: 5,
        mediumRange: 10,
        longRange: 15,
        type: 'ballistic',
        shotsRemaining: 30,
        location: 'Nose',
        criticalSlots: 7,
        tonnage: 12,
      },
      {
        id: 'thun-srm-1',
        name: 'SRM 6',
        damage: 6,
        heat: 4,
        minRange: 0,
        shortRange: 3,
        mediumRange: 6,
        longRange: 9,
        type: 'missile',
        isCluster: true,
        shotsRemaining: 45,
        location: 'Right Wing',
        criticalSlots: 2,
        tonnage: 3,
      },
      {
        id: 'thun-srm-2',
        name: 'SRM 6',
        damage: 6,
        heat: 4,
        minRange: 0,
        shortRange: 3,
        mediumRange: 6,
        longRange: 9,
        type: 'missile',
        isCluster: true,
        shotsRemaining: 45,
        location: 'Left Wing',
        criticalSlots: 2,
        tonnage: 3,
      },
    ],
  },
  {
    id: 'corsair',
    name: 'Corsair',
    unitType: UnitType.AEROSPACE,
    tonnage: 50,
    bv2: 1245,
    walkingMP: 0,
    runningMP: 0,
    jumpingMP: 0,
    thrust: 6,
    maxThrust: 9,
    altitude: AltitudeLevel.MEDIUM,
    fuelPoints: 400,
    maxFuelPoints: 400,
    heat: 0,
    heatSinks: 22,
    doubleHeatSinks: false,
    weapons: [
      {
        id: 'cors-ppc-1',
        name: 'PPC',
        damage: 10,
        heat: 10,
        minRange: 3,
        shortRange: 6,
        mediumRange: 12,
        longRange: 18,
        type: 'energy',
        shotsRemaining: Infinity,
        location: 'Right Wing',
        criticalSlots: 3,
        tonnage: 7,
      },
      {
        id: 'cors-ppc-2',
        name: 'PPC',
        damage: 10,
        heat: 10,
        minRange: 3,
        shortRange: 6,
        mediumRange: 12,
        longRange: 18,
        type: 'energy',
        shotsRemaining: Infinity,
        location: 'Left Wing',
        criticalSlots: 3,
        tonnage: 7,
      },
    ],
  },
  {
    id: 'chippewa',
    name: 'Chippewa CHP-W5',
    unitType: UnitType.AEROSPACE,
    tonnage: 90,
    bv2: 1321,
    walkingMP: 0,
    runningMP: 0,
    jumpingMP: 0,
    thrust: 5,
    maxThrust: 8,
    altitude: AltitudeLevel.MEDIUM,
    fuelPoints: 400,
    maxFuelPoints: 400,
    heat: 0,
    heatSinks: 16,
    doubleHeatSinks: false,
    weapons: [
      {
        id: 'chip-ll-1',
        name: 'Large Laser',
        damage: 8,
        heat: 8,
        minRange: 0,
        shortRange: 5,
        mediumRange: 10,
        longRange: 15,
        type: 'energy',
        shotsRemaining: Infinity,
        location: 'Nose',
        criticalSlots: 2,
        tonnage: 5,
      },
      {
        id: 'chip-ll-2',
        name: 'Large Laser',
        damage: 8,
        heat: 8,
        minRange: 0,
        shortRange: 5,
        mediumRange: 10,
        longRange: 15,
        type: 'energy',
        shotsRemaining: Infinity,
        location: 'Aft',
        criticalSlots: 2,
        tonnage: 5,
      },
      {
        id: 'chip-ml-1',
        name: 'Medium Laser',
        damage: 5,
        heat: 3,
        minRange: 0,
        shortRange: 3,
        mediumRange: 6,
        longRange: 9,
        type: 'energy',
        shotsRemaining: Infinity,
        location: 'Right Wing',
        criticalSlots: 1,
        tonnage: 1,
      },
      {
        id: 'chip-ml-2',
        name: 'Medium Laser',
        damage: 5,
        heat: 3,
        minRange: 0,
        shortRange: 3,
        mediumRange: 6,
        longRange: 9,
        type: 'energy',
        shotsRemaining: Infinity,
        location: 'Left Wing',
        criticalSlots: 1,
        tonnage: 1,
      },
    ],
  },
];

// Clan Aerospace Fighters
export const clanAerospaceFighters: Partial<AerospaceFighter>[] = [
  {
    id: 'visigoth',
    name: 'Visigoth (Clan)',
    unitType: UnitType.AEROSPACE,
    tonnage: 60,
    bv2: 1683,
    walkingMP: 0,
    runningMP: 0,
    jumpingMP: 0,
    thrust: 6,
    maxThrust: 9,
    altitude: AltitudeLevel.MEDIUM,
    fuelPoints: 480,
    maxFuelPoints: 480,
    heat: 0,
    heatSinks: 20,
    doubleHeatSinks: true,
    weapons: [
      {
        id: 'visi-gauss',
        name: 'Gauss Rifle',
        damage: 15,
        heat: 1,
        minRange: 2,
        shortRange: 7,
        mediumRange: 15,
        longRange: 22,
        type: 'gauss',
        shotsRemaining: 16,
        location: 'Nose',
        criticalSlots: 7,
        tonnage: 15,
      },
      {
        id: 'visi-erml-1',
        name: 'ER Medium Laser',
        damage: 7,
        heat: 5,
        minRange: 0,
        shortRange: 4,
        mediumRange: 8,
        longRange: 12,
        type: 'energy',
        shotsRemaining: Infinity,
        location: 'Right Wing',
        criticalSlots: 1,
        tonnage: 1,
      },
      {
        id: 'visi-erml-2',
        name: 'ER Medium Laser',
        damage: 7,
        heat: 5,
        minRange: 0,
        shortRange: 4,
        mediumRange: 8,
        longRange: 12,
        type: 'energy',
        shotsRemaining: Infinity,
        location: 'Left Wing',
        criticalSlots: 1,
        tonnage: 1,
      },
    ],
  },
];

// Export all aerospace fighters
export const allAerospaceFighters = [
  ...lightAerospaceFighters,
  ...mediumAerospaceFighters,
  ...heavyAerospaceFighters,
  ...clanAerospaceFighters,
];

// Aerospace combat mechanics
export function calculateAirToGroundModifier(altitude: AltitudeLevel): number {
  switch (altitude) {
    case AltitudeLevel.GROUND:
      return 0;
    case AltitudeLevel.NOE:
      return +1;
    case AltitudeLevel.LOW:
      return +2;
    case AltitudeLevel.MEDIUM:
      return +3;
    case AltitudeLevel.HIGH:
      return +4;
    case AltitudeLevel.VERY_HIGH:
      return +5;
    default:
      return 0;
  }
}

export function calculateAirToAirModifier(
  attackerAltitude: AltitudeLevel,
  targetAltitude: AltitudeLevel
): number {
  const diff = Math.abs(attackerAltitude - targetAltitude);
  if (diff === 0) return 0;
  if (diff === 1) return +1;
  if (diff === 2) return +2;
  return +3; // 3+ altitude difference
}

export function canBombTarget(altitude: AltitudeLevel): boolean {
  return altitude <= AltitudeLevel.LOW;
}

export function canDogfight(altitude: AltitudeLevel): boolean {
  return altitude >= AltitudeLevel.NOE;
}
