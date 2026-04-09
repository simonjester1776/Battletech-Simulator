// Advanced Combat Rules - Physical Attacks, Melee, Elevation

import type { Unit } from '@/types/battletech';
import { MovementMode } from '@/types/battletech';
import { roll2d6 } from './dice';
import { hexDistance } from './hexgrid';

// Local type for hex coordinates
interface HexCoord {
  q: number;
  r: number;
  s: number;
}

export interface PhysicalAttackResult {
  success: boolean;
  damage: number;
  attackerDamage?: number; // Self-damage from failed DFA, charge, etc.
  attackType: PhysicalAttackType;
  roll: number;
  target: number;
  log: string;
}

export type PhysicalAttackType = 'punch' | 'kick' | 'charge' | 'dfa' | 'melee_weapon';

export interface MeleeWeapon {
  name: string;
  damage: number; // Multiplier or fixed damage
  location: string;
  type: 'hatchet' | 'sword' | 'club' | 'claw';
}

// Calculate physical attack to-hit
export function calculatePhysicalToHit(
  attacker: Unit,
  target: Unit,
  attackType: PhysicalAttackType,
  distance: number
): number {
  let modifier = attacker.pilot.gunnery;
  
  // Base modifiers
  if (attacker.immobile) return 999; // Cannot attack if immobile
  if (target.prone) modifier -= 2; // Easier to hit prone targets
  
  // Attack-specific modifiers
  switch (attackType) {
    case 'punch':
      if (distance > 0) return 999; // Must be adjacent
      modifier += 0;
      break;
    case 'kick':
      if (distance > 0) return 999;
      modifier += 1; // Kicks are harder
      break;
    case 'charge':
      modifier += 0; // Uses piloting skill
      break;
    case 'dfa':
      modifier += 3; // Very difficult
      if (!attacker.jumpingMP) return 999; // Must have jump jets
      break;
    case 'melee_weapon':
      if (distance > 0) return 999;
      modifier -= 1; // Weapons make it easier
      break;
  }
  
  // Attacker status
  if (attacker.prone) modifier += 2;
  if (attacker.heat >= 15) modifier += 1;
  if (attacker.heat >= 20) modifier += 2;
  
  // Movement modifiers
  switch (attacker.movementMode) {
    case MovementMode.STANDING:
      break;
    case MovementMode.WALKING:
      modifier += 1;
      break;
    case MovementMode.RUNNING:
      modifier += 2;
      break;
    case MovementMode.JUMPING:
      modifier += 3;
      break;
  }
  
  return modifier;
}

// Execute punch attack
export function executePunch(attacker: Unit, target: Unit): PhysicalAttackResult {
  const toHit = calculatePhysicalToHit(attacker, target, 'punch', 0);
  const roll = roll2d6();
  const success = roll >= toHit;
  
  // Damage = tonnage / 10, rounded down
  const damage = Math.floor(attacker.tonnage / 10);
  
  return {
    success,
    damage: success ? damage : 0,
    attackType: 'punch',
    roll: roll,
    target: toHit,
    log: `${attacker.name} punches ${target.name}: Roll ${roll} vs TN ${toHit} - ${success ? `HIT for ${damage} damage!` : 'MISS'}`
  };
}

// Execute kick attack
export function executeKick(attacker: Unit, target: Unit): PhysicalAttackResult {
  const toHit = calculatePhysicalToHit(attacker, target, 'kick', 0);
  const roll = roll2d6();
  const success = roll >= toHit;
  
  // Damage = tonnage / 5, rounded down
  const damage = Math.floor(attacker.tonnage / 5);
  
  // Kicking is risky - attacker falls on 2 or 12
  const attackerFalls = (roll === 2 || roll === 12);
  
  let log = `${attacker.name} kicks ${target.name}: Roll ${roll} vs TN ${toHit} - ${success ? `HIT for ${damage} damage!` : 'MISS'}`;
  if (attackerFalls) {
    log += ` ${attacker.name} falls!`;
  }
  
  return {
    success,
    damage: success ? damage : 0,
    attackerDamage: attackerFalls ? Math.floor(attacker.tonnage / 10) : 0,
    attackType: 'kick',
    roll: roll,
    target: toHit,
    log
  };
}

// Execute charge attack
export function executeCharge(
  attacker: Unit,
  target: Unit,
  hexesMoved: number
): PhysicalAttackResult {
  const toHit = calculatePhysicalToHit(attacker, target, 'charge', 0);
  const roll = roll2d6();
  const success = roll >= toHit;
  
  // Damage = tonnage / 10 * hexes moved, rounded down (min 1)
  const damage = Math.max(1, Math.floor((attacker.tonnage / 10) * hexesMoved));
  
  // Attacker takes damage = tonnage / 10 * hexes moved / 2
  const attackerDamage = Math.floor(damage / 2);
  
  return {
    success,
    damage: success ? damage : 0,
    attackerDamage,
    attackType: 'charge',
    roll: roll,
    target: toHit,
    log: `${attacker.name} charges ${target.name} (${hexesMoved} hexes): Roll ${roll} vs TN ${toHit} - ${success ? `HIT for ${damage} damage! Attacker takes ${attackerDamage}` : 'MISS'}`
  };
}

// Execute Death From Above (DFA)
export function executeDFA(
  attacker: Unit,
  target: Unit
): PhysicalAttackResult {
  const toHit = calculatePhysicalToHit(attacker, target, 'dfa', 0);
  const roll = roll2d6();
  const success = roll >= toHit;
  
  // Damage = tonnage / 10 * 3, rounded down
  const damage = Math.floor((attacker.tonnage / 10) * 3);
  
  // Attacker takes damage to legs = tonnage / 5
  const attackerDamage = Math.floor(attacker.tonnage / 5);
  
  // Pilot skill check (PSR) to stay standing
  const psrRoll = roll2d6();
  const psrTarget = attacker.pilot.piloting + 4; // +4 modifier for DFA
  const attackerFalls = psrRoll < psrTarget;
  
  let log = `${attacker.name} performs DFA on ${target.name}: Roll ${roll} vs TN ${toHit} - ${success ? `HIT for ${damage} damage! Attacker takes ${attackerDamage}` : 'MISS'}`;
  if (attackerFalls) {
    log += ` ${attacker.name} falls!`;
  }
  
  return {
    success,
    damage: success ? damage : 0,
    attackerDamage: attackerDamage + (attackerFalls ? Math.floor(attacker.tonnage / 10) : 0),
    attackType: 'dfa',
    roll: roll,
    target: toHit,
    log
  };
}

// Execute melee weapon attack (hatchet, sword, etc.)
export function executeMeleeWeapon(
  attacker: Unit,
  target: Unit,
  weapon: MeleeWeapon
): PhysicalAttackResult {
  const toHit = calculatePhysicalToHit(attacker, target, 'melee_weapon', 0);
  const roll = roll2d6();
  const success = roll >= toHit;
  
  // Damage varies by weapon type
  let damage = 0;
  switch (weapon.type) {
    case 'hatchet':
      // Hatchet: tonnage / 5, rounded down
      damage = Math.floor(attacker.tonnage / 5);
      break;
    case 'sword':
      // Sword: tonnage / 10 + 5, rounded down
      damage = Math.floor(attacker.tonnage / 10) + 5;
      break;
    case 'club':
      // Club: tonnage / 7, rounded down
      damage = Math.floor(attacker.tonnage / 7);
      break;
    case 'claw':
      // Claw: tonnage / 7, rounded down
      damage = Math.floor(attacker.tonnage / 7);
      break;
  }
  
  return {
    success,
    damage: success ? damage : 0,
    attackType: 'melee_weapon',
    roll: roll,
    target: toHit,
    log: `${attacker.name} attacks ${target.name} with ${weapon.name}: Roll ${roll} vs TN ${toHit} - ${success ? `HIT for ${damage} damage!` : 'MISS'}`
  };
}

// Elevation system
export interface ElevationHex extends HexCoord {
  elevation: number; // -5 to +5 (negative = underwater/depression)
  terrain: 'clear' | 'woods' | 'water' | 'rough' | 'building';
}

export function calculateElevationModifier(
  attacker: ElevationHex,
  target: ElevationHex
): number {
  const elevationDiff = attacker.elevation - target.elevation;
  
  if (elevationDiff === 0) return 0;
  
  // Height advantage
  if (elevationDiff > 0) {
    // Attacker is higher - bonus to hit
    return -1;
  } else {
    // Attacker is lower - penalty to hit
    return 1;
  }
}

// Partial cover system
export function calculatePartialCoverModifier(
  target: Unit,
  targetHex: ElevationHex
): number {
  let coverModifier = 0;
  
  // Woods provide partial cover
  if (targetHex.terrain === 'woods') {
    coverModifier += 1;
  }
  
  // Partial cover from building
  if (targetHex.terrain === 'building') {
    coverModifier += 2;
  }
  
  // Prone targets get partial cover
  if (target.prone) {
    coverModifier += 1;
  }
  
  return coverModifier;
}

// Calculate line of sight with elevation
export function hasLineOfSight(
  attackerPos: ElevationHex,
  targetPos: ElevationHex,
  _mapHexes: Map<string, ElevationHex>
): boolean {
  // Check if intervening terrain blocks LOS
  const distance = hexDistance(attackerPos, targetPos);
  
  if (distance <= 1) return true; // Adjacent hexes always have LOS
  
  const elevationDiff = Math.abs(attackerPos.elevation - targetPos.elevation);
  
  // If elevation difference is >= 2, can usually see over level 1 terrain
  if (elevationDiff >= 2) return true;
  
  // Check intervening hexes (simplified - would need full ray trace)
  // For now, assume LOS unless blocked by higher terrain
  return true;
}
