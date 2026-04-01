// Comprehensive Weapon Database for BattleTech Mech Lab

import { WeaponType } from '@/types/battletech';

export interface WeaponData {
  name: string;
  damage: number;
  heat: number;
  minRange: number;
  shortRange: number;
  mediumRange: number;
  longRange: number;
  type: WeaponType;
  criticalSlots: number;
  tonnage: number;
  cost: number; // C-Bills
  techBase: 'IS' | 'CLAN' | 'BOTH';
  ammoPerTon?: number;
  isCluster?: boolean;
  isStreak?: boolean;
}

export const WEAPON_DATABASE: Record<string, WeaponData> = {
  // ENERGY WEAPONS - LASERS
  'Small Laser': {
    name: 'Small Laser', damage: 3, heat: 1, minRange: 0, shortRange: 1, mediumRange: 2, longRange: 3,
    type: WeaponType.ENERGY, criticalSlots: 1, tonnage: 0.5, cost: 11250, techBase: 'BOTH'
  },
  'Medium Laser': {
    name: 'Medium Laser', damage: 5, heat: 3, minRange: 0, shortRange: 3, mediumRange: 6, longRange: 9,
    type: WeaponType.ENERGY, criticalSlots: 1, tonnage: 1, cost: 40000, techBase: 'BOTH'
  },
  'Large Laser': {
    name: 'Large Laser', damage: 8, heat: 8, minRange: 0, shortRange: 3, mediumRange: 6, longRange: 9,
    type: WeaponType.ENERGY, criticalSlots: 2, tonnage: 5, cost: 100000, techBase: 'BOTH'
  },
  'ER Small Laser': {
    name: 'ER Small Laser', damage: 3, heat: 2, minRange: 0, shortRange: 2, mediumRange: 4, longRange: 5,
    type: WeaponType.ENERGY, criticalSlots: 1, tonnage: 0.5, cost: 11250, techBase: 'IS'
  },
  'ER Medium Laser': {
    name: 'ER Medium Laser', damage: 7, heat: 5, minRange: 0, shortRange: 3, mediumRange: 8, longRange: 15,
    type: WeaponType.ENERGY, criticalSlots: 1, tonnage: 1, cost: 80000, techBase: 'CLAN'
  },
  'ER Large Laser': {
    name: 'ER Large Laser', damage: 10, heat: 12, minRange: 0, shortRange: 3, mediumRange: 7, longRange: 15,
    type: WeaponType.ENERGY, criticalSlots: 1, tonnage: 4, cost: 200000, techBase: 'CLAN'
  },
  'Small Pulse Laser': {
    name: 'Small Pulse Laser', damage: 3, heat: 2, minRange: 0, shortRange: 1, mediumRange: 2, longRange: 3,
    type: WeaponType.ENERGY, criticalSlots: 1, tonnage: 1, cost: 16000, techBase: 'BOTH'
  },
  'Medium Pulse Laser': {
    name: 'Medium Pulse Laser', damage: 6, heat: 4, minRange: 0, shortRange: 2, mediumRange: 4, longRange: 6,
    type: WeaponType.ENERGY, criticalSlots: 1, tonnage: 2, cost: 60000, techBase: 'BOTH'
  },
  'Large Pulse Laser': {
    name: 'Large Pulse Laser', damage: 9, heat: 10, minRange: 0, shortRange: 3, mediumRange: 7, longRange: 10,
    type: WeaponType.ENERGY, criticalSlots: 2, tonnage: 7, cost: 175000, techBase: 'BOTH'
  },
  
  // ENERGY WEAPONS - PPC
  'PPC': {
    name: 'PPC', damage: 10, heat: 10, minRange: 3, shortRange: 6, mediumRange: 12, longRange: 18,
    type: WeaponType.ENERGY, criticalSlots: 3, tonnage: 7, cost: 200000, techBase: 'BOTH'
  },
  'ER PPC': {
    name: 'ER PPC', damage: 15, heat: 15, minRange: 0, shortRange: 3, mediumRange: 7, longRange: 23,
    type: WeaponType.ENERGY, criticalSlots: 2, tonnage: 6, cost: 300000, techBase: 'CLAN'
  },
  'Snub-Nose PPC': {
    name: 'Snub-Nose PPC', damage: 10, heat: 10, minRange: 0, shortRange: 9, mediumRange: 13, longRange: 15,
    type: WeaponType.ENERGY, criticalSlots: 2, tonnage: 6, cost: 300000, techBase: 'IS'
  },
  
  // BALLISTIC WEAPONS - AUTOCANNONS
  'AC/2': {
    name: 'AC/2', damage: 2, heat: 1, minRange: 4, shortRange: 8, mediumRange: 16, longRange: 24,
    type: WeaponType.BALLISTIC, criticalSlots: 1, tonnage: 6, cost: 75000, techBase: 'BOTH', ammoPerTon: 45
  },
  'AC/5': {
    name: 'AC/5', damage: 5, heat: 1, minRange: 3, shortRange: 6, mediumRange: 12, longRange: 18,
    type: WeaponType.BALLISTIC, criticalSlots: 4, tonnage: 8, cost: 125000, techBase: 'BOTH', ammoPerTon: 20
  },
  'AC/10': {
    name: 'AC/10', damage: 10, heat: 3, minRange: 0, shortRange: 5, mediumRange: 10, longRange: 15,
    type: WeaponType.BALLISTIC, criticalSlots: 7, tonnage: 12, cost: 200000, techBase: 'BOTH', ammoPerTon: 10
  },
  'AC/20': {
    name: 'AC/20', damage: 20, heat: 7, minRange: 0, shortRange: 3, mediumRange: 6, longRange: 9,
    type: WeaponType.BALLISTIC, criticalSlots: 10, tonnage: 14, cost: 300000, techBase: 'BOTH', ammoPerTon: 5
  },
  'Ultra AC/5': {
    name: 'Ultra AC/5', damage: 5, heat: 1, minRange: 0, shortRange: 6, mediumRange: 13, longRange: 20,
    type: WeaponType.BALLISTIC, criticalSlots: 5, tonnage: 9, cost: 200000, techBase: 'CLAN', ammoPerTon: 20
  },
  'Ultra AC/10': {
    name: 'Ultra AC/10', damage: 10, heat: 4, minRange: 0, shortRange: 6, mediumRange: 12, longRange: 18,
    type: WeaponType.BALLISTIC, criticalSlots: 7, tonnage: 13, cost: 320000, techBase: 'IS', ammoPerTon: 10
  },
  'Ultra AC/20': {
    name: 'Ultra AC/20', damage: 20, heat: 8, minRange: 0, shortRange: 3, mediumRange: 7, longRange: 10,
    type: WeaponType.BALLISTIC, criticalSlots: 10, tonnage: 15, cost: 480000, techBase: 'IS', ammoPerTon: 5
  },
  'LB 10-X AC': {
    name: 'LB 10-X AC', damage: 10, heat: 2, minRange: 0, shortRange: 6, mediumRange: 12, longRange: 18,
    type: WeaponType.BALLISTIC, criticalSlots: 6, tonnage: 11, cost: 400000, techBase: 'BOTH', ammoPerTon: 10, isCluster: true
  },
  'LB 20-X AC': {
    name: 'LB 20-X AC', damage: 20, heat: 6, minRange: 0, shortRange: 4, mediumRange: 8, longRange: 12,
    type: WeaponType.BALLISTIC, criticalSlots: 11, tonnage: 14, cost: 600000, techBase: 'BOTH', ammoPerTon: 5, isCluster: true
  },
  'Gauss Rifle': {
    name: 'Gauss Rifle', damage: 15, heat: 1, minRange: 2, shortRange: 7, mediumRange: 15, longRange: 22,
    type: WeaponType.BALLISTIC, criticalSlots: 7, tonnage: 15, cost: 300000, techBase: 'BOTH', ammoPerTon: 8
  },
  
  // MACHINE GUNS
  'Machine Gun': {
    name: 'Machine Gun', damage: 2, heat: 0, minRange: 0, shortRange: 1, mediumRange: 2, longRange: 3,
    type: WeaponType.MACHINE_GUN, criticalSlots: 1, tonnage: 0.5, cost: 5000, techBase: 'BOTH', ammoPerTon: 200
  },
  'Light Machine Gun': {
    name: 'Light Machine Gun', damage: 1, heat: 0, minRange: 0, shortRange: 2, mediumRange: 4, longRange: 6,
    type: WeaponType.MACHINE_GUN, criticalSlots: 1, tonnage: 0.5, cost: 5000, techBase: 'IS', ammoPerTon: 200
  },
  'Heavy Machine Gun': {
    name: 'Heavy Machine Gun', damage: 3, heat: 0, minRange: 0, shortRange: 1, mediumRange: 2, longRange: 2,
    type: WeaponType.MACHINE_GUN, criticalSlots: 1, tonnage: 1, cost: 7500, techBase: 'IS', ammoPerTon: 100
  },
  
  // MISSILE WEAPONS - LRM
  'LRM-5': {
    name: 'LRM-5', damage: 5, heat: 2, minRange: 6, shortRange: 7, mediumRange: 14, longRange: 21,
    type: WeaponType.MISSILE, criticalSlots: 1, tonnage: 2, cost: 30000, techBase: 'BOTH', ammoPerTon: 24, isCluster: true
  },
  'LRM-10': {
    name: 'LRM-10', damage: 10, heat: 4, minRange: 6, shortRange: 7, mediumRange: 14, longRange: 21,
    type: WeaponType.MISSILE, criticalSlots: 2, tonnage: 5, cost: 100000, techBase: 'BOTH', ammoPerTon: 12, isCluster: true
  },
  'LRM-15': {
    name: 'LRM-15', damage: 15, heat: 5, minRange: 6, shortRange: 7, mediumRange: 14, longRange: 21,
    type: WeaponType.MISSILE, criticalSlots: 3, tonnage: 7, cost: 175000, techBase: 'BOTH', ammoPerTon: 8, isCluster: true
  },
  'LRM-20': {
    name: 'LRM-20', damage: 20, heat: 6, minRange: 6, shortRange: 7, mediumRange: 14, longRange: 21,
    type: WeaponType.MISSILE, criticalSlots: 5, tonnage: 10, cost: 250000, techBase: 'BOTH', ammoPerTon: 6, isCluster: true
  },
  
  // MISSILE WEAPONS - SRM
  'SRM-2': {
    name: 'SRM-2', damage: 4, heat: 2, minRange: 0, shortRange: 3, mediumRange: 6, longRange: 9,
    type: WeaponType.MISSILE, criticalSlots: 1, tonnage: 1, cost: 10000, techBase: 'BOTH', ammoPerTon: 50, isCluster: true
  },
  'SRM-4': {
    name: 'SRM-4', damage: 8, heat: 3, minRange: 0, shortRange: 3, mediumRange: 6, longRange: 9,
    type: WeaponType.MISSILE, criticalSlots: 1, tonnage: 2, cost: 60000, techBase: 'BOTH', ammoPerTon: 25, isCluster: true
  },
  'SRM-6': {
    name: 'SRM-6', damage: 12, heat: 4, minRange: 0, shortRange: 3, mediumRange: 6, longRange: 9,
    type: WeaponType.MISSILE, criticalSlots: 2, tonnage: 3, cost: 80000, techBase: 'BOTH', ammoPerTon: 15, isCluster: true
  },
  'Streak SRM-2': {
    name: 'Streak SRM-2', damage: 4, heat: 2, minRange: 0, shortRange: 3, mediumRange: 6, longRange: 9,
    type: WeaponType.MISSILE, criticalSlots: 1, tonnage: 1.5, cost: 15000, techBase: 'BOTH', ammoPerTon: 50, isStreak: true
  },
  'Streak SRM-4': {
    name: 'Streak SRM-4', damage: 8, heat: 3, minRange: 0, shortRange: 3, mediumRange: 6, longRange: 9,
    type: WeaponType.MISSILE, criticalSlots: 1, tonnage: 3, cost: 90000, techBase: 'CLAN', ammoPerTon: 25, isStreak: true
  },
  'Streak SRM-6': {
    name: 'Streak SRM-6', damage: 12, heat: 4, minRange: 0, shortRange: 3, mediumRange: 6, longRange: 9,
    type: WeaponType.MISSILE, criticalSlots: 2, tonnage: 4.5, cost: 120000, techBase: 'CLAN', ammoPerTon: 15, isStreak: true
  },
  
  // MISSILE WEAPONS - ATM (Clan)
  'ATM-3': {
    name: 'ATM-3', damage: 6, heat: 2, minRange: 0, shortRange: 4, mediumRange: 9, longRange: 18,
    type: WeaponType.MISSILE, criticalSlots: 2, tonnage: 1.5, cost: 50000, techBase: 'CLAN', ammoPerTon: 20, isCluster: true
  },
  'ATM-6': {
    name: 'ATM-6', damage: 12, heat: 4, minRange: 0, shortRange: 4, mediumRange: 9, longRange: 18,
    type: WeaponType.MISSILE, criticalSlots: 3, tonnage: 3.5, cost: 125000, techBase: 'CLAN', ammoPerTon: 10, isCluster: true
  },
  'ATM-9': {
    name: 'ATM-9', damage: 18, heat: 6, minRange: 0, shortRange: 4, mediumRange: 9, longRange: 18,
    type: WeaponType.MISSILE, criticalSlots: 4, tonnage: 5, cost: 225000, techBase: 'CLAN', ammoPerTon: 7, isCluster: true
  },
  
  // SPECIAL WEAPONS
  'Flamer': {
    name: 'Flamer', damage: 2, heat: 3, minRange: 0, shortRange: 1, mediumRange: 2, longRange: 3,
    type: WeaponType.ENERGY, criticalSlots: 1, tonnage: 1, cost: 7500, techBase: 'BOTH'
  },
  'TAG': {
    name: 'TAG', damage: 0, heat: 0, minRange: 0, shortRange: 5, mediumRange: 9, longRange: 15,
    type: WeaponType.ENERGY, criticalSlots: 1, tonnage: 1, cost: 50000, techBase: 'BOTH'
  },
  'Narc Missile Beacon': {
    name: 'Narc Missile Beacon', damage: 0, heat: 0, minRange: 0, shortRange: 3, mediumRange: 6, longRange: 9,
    type: WeaponType.MISSILE, criticalSlots: 2, tonnage: 3, cost: 100000, techBase: 'BOTH', ammoPerTon: 6
  },
  'Arrow IV': {
    name: 'Arrow IV', damage: 20, heat: 10, minRange: 17, shortRange: 35, mediumRange: 70, longRange: 120,
    type: WeaponType.MISSILE, criticalSlots: 15, tonnage: 15, cost: 450000, techBase: 'BOTH', ammoPerTon: 5, isCluster: true
  }
};

// Helper to get weapons by tech base
export function getWeaponsByTech(techBase: 'IS' | 'CLAN' | 'ALL'): WeaponData[] {
  return Object.values(WEAPON_DATABASE).filter(w => 
    techBase === 'ALL' || w.techBase === 'BOTH' || w.techBase === techBase
  );
}

// Helper to get weapons by type
export function getWeaponsByType(type: WeaponType): WeaponData[] {
  return Object.values(WEAPON_DATABASE).filter(w => w.type === type);
}

// Calculate total cost of a loadout
export function calculateLoadoutCost(weapons: string[]): number {
  return weapons.reduce((total, weaponName) => {
    const weapon = WEAPON_DATABASE[weaponName];
    return total + (weapon?.cost || 0);
  }, 0);
}
