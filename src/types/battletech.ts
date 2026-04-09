// BattleTech Types - Accurate to Classic CBT Rules

export const UnitType = {
  MECH: 'mech',
  VEHICLE: 'vehicle',
  BATTLE_ARMOR: 'battle_armor',
  ELEMENTAL: 'elemental',
  INFANTRY: 'infantry',
  AEROSPACE: 'aerospace'
} as const;
export type UnitType = typeof UnitType[keyof typeof UnitType];

export const Config = {
  BIPED: 'biped',
  QUAD: 'quad',
  TRIPOD: 'tripod'
} as const;
export type Config = typeof Config[keyof typeof Config];

export const Arc = {
  FRONT: 'front',
  LEFT: 'left',
  RIGHT: 'right',
  REAR: 'rear'
} as const;
export type Arc = typeof Arc[keyof typeof Arc];

export const MovementMode = {
  STANDING: 'standing',
  WALKING: 'walking',
  RUNNING: 'running',
  JUMPING: 'jumping',
  IMMOBILE: 'immobile',
  PRONE: 'prone'
} as const;
export type MovementMode = typeof MovementMode[keyof typeof MovementMode];

export const WeaponType = {
  ENERGY: 'energy',
  BALLISTIC: 'ballistic',
  MISSILE: 'missile',
  FLAMER: 'flamer',
  MACHINE_GUN: 'machine_gun',
  GAUSS: 'gauss'
} as const;
export type WeaponType = typeof WeaponType[keyof typeof WeaponType];

export interface Weapon {
  id: string;
  name: string;
  damage: number;
  heat: number;
  minRange: number;
  shortRange: number;
  mediumRange: number;
  longRange: number;
  type: WeaponType;
  isCluster?: boolean;
  isStreak?: boolean;
  ammoPerTon?: number;
  shotsRemaining: number;
  location: string;
  criticalSlots: number;
  tonnage: number;
}

export interface Ammo {
  type: string;
  shots: number;
  location: string;
  explosive: boolean;
}

export interface CriticalSlot {
  item: string | null;
  hit: boolean;
}

export interface Location {
  name: string;
  armor: number;
  maxArmor: number;
  structure: number;
  maxStructure: number;
  criticals: CriticalSlot[];
}

export interface Pilot {
  name: string;
  gunnery: number;
  piloting: number;
  hits: number;
  conscious: boolean;
}

export interface Unit {
  id: string;
  name: string;
  unitType: UnitType;
  config: Config;
  tonnage: number;
  bv2: number;
  
  // Movement
  walkingMP: number;
  runningMP: number;
  jumpingMP: number;
  currentMP: number;
  movementMode: MovementMode;
  
  // Heat
  heat: number;
  heatSinks: number;
  doubleHeatSinks: boolean;
  
  // Locations
  locations: Map<string, Location>;
  
  // Weapons
  weapons: Weapon[];
  ammo: Ammo[];
  
  // Special systems
  hasECM: boolean;
  hasAMS: boolean;
  hasCASE: boolean;
  hasXLEngine: boolean;
  hasXXLEngine: boolean;
  hasCompactEngine: boolean;
  hasTSM: boolean;
  hasMASC: boolean;
  
  // Critical system status
  engineHits: number;
  gyroHits: number;
  sensorHits: number;
  lifeSupportHits: number;
  
  // Pilot
  pilot: Pilot;
  
  // State
  alive: boolean;
  shutdown: boolean;
  prone: boolean;
  immobile: boolean;
  
  // Position
  position: HexCoord | null;
  facing: number;
}

export interface HexCoord {
  q: number;
  r: number;
  s: number;
}

export interface Hex {
  coord: HexCoord;
  terrain: TerrainType;
  elevation: number;
  unit: Unit | null;
}

export const TerrainType = {
  CLEAR: 'clear',
  LIGHT_WOODS: 'light_woods',
  HEAVY_WOODS: 'heavy_woods',
  WATER: 'water',
  ROUGH: 'rough',
  ROAD: 'road',
  BUILDING: 'building',
  HILL: 'hill'
} as const;
export type TerrainType = typeof TerrainType[keyof typeof TerrainType];

export interface Terrain {
  type: TerrainType;
  name: string;
  movementCost: number;
  movementModifier: number;
  toHitModifier: number;
  coverProvided: boolean;
}

export const GamePhase = {
  INITIATIVE: 'initiative',
  MOVEMENT: 'movement',
  COMBAT: 'combat',
  HEAT: 'heat',
  END: 'end'
} as const;
export type GamePhase = typeof GamePhase[keyof typeof GamePhase];

export interface GameState {
  turn: number;
  phase: GamePhase;
  units: Unit[];
  hexGrid: Map<string, Hex>;
  selectedUnit: Unit | null;
  targetUnit: Unit | null;
  validMoveHexes: HexCoord[];
  validTargetHexes: HexCoord[];
  gameLog: LogEntry[];
  initiativeWinner: 'player' | 'ai' | null;
  playerScore: number;
  aiScore: number;
}

export interface LogEntry {
  turn: number;
  phase: GamePhase;
  message: string;
  type: 'info' | 'combat' | 'critical' | 'heat' | 'movement' | 'system';
  timestamp: number;
}

export interface ToHitModifiers {
  gunnerySkill: number;
  range: number;
  targetMovement: number;
  attackerMovement: number;
  terrain: number;
  heat: number;
  damage: number;
  other: number;
}

export interface AttackResult {
  hit: boolean;
  roll: number;
  targetNumber: number;
  location: string;
  damage: number;
  criticals: CriticalResult[];
  ammoExplosion: boolean;
  message: string;
}

export interface CriticalResult {
  location: string;
  slot: number;
  item: string;
  effect: string;
}

// Heat Scale Effects (Classic CBT)
export const HEAT_SCALE_EFFECTS: { [heat: number]: { mpMod: number; toHitMod: number; shutdownRoll: number; ammoExplosionRoll: number; description: string } } = {
  0: { mpMod: 0, toHitMod: 0, shutdownRoll: 0, ammoExplosionRoll: 0, description: 'Normal' },
  5: { mpMod: -1, toHitMod: 0, shutdownRoll: 0, ammoExplosionRoll: 0, description: '-1 Walking MP' },
  8: { mpMod: -1, toHitMod: 1, shutdownRoll: 0, ammoExplosionRoll: 0, description: '+1 To-Hit' },
  10: { mpMod: -2, toHitMod: 1, shutdownRoll: 0, ammoExplosionRoll: 0, description: '-2 Walking MP' },
  13: { mpMod: -2, toHitMod: 2, shutdownRoll: 0, ammoExplosionRoll: 0, description: '+2 To-Hit' },
  14: { mpMod: -2, toHitMod: 2, shutdownRoll: 4, ammoExplosionRoll: 0, description: 'Shutdown on 4+' },
  15: { mpMod: -3, toHitMod: 2, shutdownRoll: 4, ammoExplosionRoll: 0, description: '-3 Walking MP' },
  17: { mpMod: -3, toHitMod: 3, shutdownRoll: 6, ammoExplosionRoll: 0, description: '+3 To-Hit' },
  18: { mpMod: -3, toHitMod: 3, shutdownRoll: 6, ammoExplosionRoll: 0, description: 'Shutdown on 6+' },
  19: { mpMod: -4, toHitMod: 3, shutdownRoll: 8, ammoExplosionRoll: 4, description: '-4 MP, Ammo Explosion on 4+' },
  20: { mpMod: -4, toHitMod: 3, shutdownRoll: 8, ammoExplosionRoll: 4, description: 'Shutdown on 8+' },
  23: { mpMod: -4, toHitMod: 4, shutdownRoll: 10, ammoExplosionRoll: 6, description: '+4 To-Hit' },
  24: { mpMod: -4, toHitMod: 4, shutdownRoll: 10, ammoExplosionRoll: 6, description: 'Shutdown on 10+' },
  25: { mpMod: -5, toHitMod: 4, shutdownRoll: 10, ammoExplosionRoll: 6, description: '-5 MP' },
  26: { mpMod: -5, toHitMod: 4, shutdownRoll: 10, ammoExplosionRoll: 8, description: 'Shutdown on 10+' },
  28: { mpMod: -5, toHitMod: 5, shutdownRoll: 10, ammoExplosionRoll: 8, description: '+5 To-Hit, Ammo Explosion on 8+' },
  30: { mpMod: -5, toHitMod: 5, shutdownRoll: 0, ammoExplosionRoll: 0, description: 'AUTO SHUTDOWN' }
};

// Hit Location Tables
export const BIPED_FRONT_HIT_TABLE: { [roll: number]: string } = {
  2: 'CT',  // Center Torso (possible through-armor crit)
  3: 'RT',  // Right Torso
  4: 'RA',  // Right Arm
  5: 'RL',  // Right Leg
  6: 'CT',  // Center Torso
  7: 'CT',  // Center Torso
  8: 'CT',  // Center Torso
  9: 'LT',  // Left Torso
  10: 'LA', // Left Arm
  11: 'LL', // Left Leg
  12: 'HD'  // Head
};

export const BIPED_REAR_HIT_TABLE: { [roll: number]: string } = {
  2: 'CT',
  3: 'RT',
  4: 'RA',
  5: 'RL',
  6: 'CT',
  7: 'CT',
  8: 'CT',
  9: 'LT',
  10: 'LA',
  11: 'LL',
  12: 'HD'
};

export const QUAD_FRONT_HIT_TABLE: { [roll: number]: string } = {
  2: 'CT',
  3: 'RT',
  4: 'RFL', // Right Front Leg
  5: 'RRL', // Right Rear Leg
  6: 'CT',
  7: 'CT',
  8: 'CT',
  9: 'LT',
  10: 'LFL', // Left Front Leg
  11: 'LRL', // Left Rear Leg
  12: 'HD'
};

export const VEHICLE_HIT_TABLE: { [roll: number]: string } = {
  2: 'TURRET',
  3: 'FRONT',
  4: 'FRONT',
  5: 'SIDE',
  6: 'SIDE',
  7: 'FRONT',
  8: 'FRONT',
  9: 'SIDE',
  10: 'SIDE',
  11: 'REAR',
  12: 'TURRET'
};

// Critical Hit Determination Table
export const CRITICAL_HIT_TABLE: { [roll: number]: number } = {
  2: 0,   // No critical hit
  3: 0,
  4: 0,
  5: 0,
  6: 0,
  7: 0,
  8: 1,   // 1 critical hit
  9: 1,
  10: 2,  // 2 critical hits
  11: 2,
  12: 3   // 3 critical hits (or limb blown off)
};

// Movement Modifiers Table
export const MOVEMENT_MODIFIERS: { [mode: string]: number } = {
  'standing': 0,
  'walking': 1,
  'running': 2,
  'jumping': 3,
  'immobile': -4
};

// Range Modifiers
export const RANGE_MODIFIERS: { [band: string]: number } = {
  'short': 0,
  'medium': 2,
  'long': 4,
  'out': -1
};
