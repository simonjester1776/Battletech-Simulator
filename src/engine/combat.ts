// BattleTech Combat Engine - Accurate to Classic CBT Rules

import type { Unit, Weapon, HexCoord, AttackResult, CriticalResult, Hex } from '@/types/battletech';
import { 
  BIPED_FRONT_HIT_TABLE, 
  BIPED_REAR_HIT_TABLE, 
  QUAD_FRONT_HIT_TABLE, 
  VEHICLE_HIT_TABLE,
  CRITICAL_HIT_TABLE, 
  RANGE_MODIFIERS,
  HEAT_SCALE_EFFECTS,
  Arc, 
  UnitType, 
  Config 
} from '@/types/battletech';
import { roll2d6, d6, clusterHits } from './dice';

// Calculate distance between two hex coordinates
export function hexDistance(a: HexCoord, b: HexCoord): number {
  return Math.max(
    Math.abs(a.q - b.q),
    Math.abs(a.r - b.r),
    Math.abs(a.s - b.s)
  );
}

// Determine range band
export function getRangeBand(weapon: Weapon, distance: number): string {
  if (distance < weapon.minRange) return 'minimum';
  if (distance <= weapon.shortRange) return 'short';
  if (distance <= weapon.mediumRange) return 'medium';
  if (distance <= weapon.longRange) return 'long';
  return 'out';
}

// Get range modifier
export function getRangeModifier(weapon: Weapon, distance: number): number {
  const band = getRangeBand(weapon, distance);
  if (band === 'minimum') return -1;
  if (band === 'out') return -1;
  return RANGE_MODIFIERS[band];
}

// Determine attack arc based on facing and target position
export function determineArc(attacker: Unit, target: Unit): Arc {
  if (!attacker.position || !target.position) return Arc.FRONT;
  
  const dx = target.position.q - attacker.position.q;
  const dy = target.position.r - attacker.position.r;
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  
  const relativeAngle = (angle - attacker.facing * 60 + 360) % 360;
  
  if (relativeAngle >= 300 || relativeAngle <= 60) return Arc.FRONT;
  if (relativeAngle > 60 && relativeAngle < 120) return Arc.RIGHT;
  if (relativeAngle >= 120 && relativeAngle <= 240) return Arc.REAR;
  return Arc.LEFT;
}

// Get hit location based on arc and unit type
export function getHitLocation(roll: number, unit: Unit, arc: Arc): string {
  if (unit.unitType === UnitType.VEHICLE) {
    return VEHICLE_HIT_TABLE[roll] || 'FRONT';
  }
  
  if (unit.config === Config.QUAD) {
    return QUAD_FRONT_HIT_TABLE[roll] || 'CT';
  }
  
  if (arc === Arc.REAR) {
    return BIPED_REAR_HIT_TABLE[roll] || 'CT';
  }
  
  return BIPED_FRONT_HIT_TABLE[roll] || 'CT';
}

// Calculate to-hit modifiers
export function calculateToHitModifiers(
  attacker: Unit,
  target: Unit,
  weapon: Weapon,
  distance: number,
  attackerMoved: boolean,
  targetMoved: boolean
): { targetNumber: number; modifiers: { [key: string]: number }; canFire: boolean } {
  const modifiers: { [key: string]: number } = {};
  
  modifiers['Gunnery'] = attacker.pilot.gunnery;
  
  const rangeMod = getRangeModifier(weapon, distance);
  if (rangeMod === -1) {
    return { targetNumber: 0, modifiers, canFire: false };
  }
  modifiers['Range'] = rangeMod;
  
  let targetMoveMod = 0;
  if (targetMoved) {
    switch (target.movementMode) {
      case 'walking': targetMoveMod = 1; break;
      case 'running': targetMoveMod = 2; break;
      case 'jumping': targetMoveMod = 3; break;
      case 'immobile': targetMoveMod = -4; break;
    }
  }
  modifiers['Target Movement'] = targetMoveMod;
  
  let attackerMoveMod = 0;
  if (attackerMoved) {
    switch (attacker.movementMode) {
      case 'walking': attackerMoveMod = 0; break;
      case 'running': attackerMoveMod = 2; break;
      case 'jumping': attackerMoveMod = 3; break;
    }
  }
  modifiers['Attacker Movement'] = attackerMoveMod;
  
  const heatEffect = getHeatEffect(attacker.heat);
  modifiers['Heat'] = heatEffect.toHitMod;
  
  modifiers['Sensors'] = attacker.sensorHits * 2;
  
  let damageMod = 0;
  if (weapon.location === 'RA' || weapon.location === 'RT') {
    const ra = attacker.locations.get('RA');
    if (ra) {
      const shoulder = ra.criticals.find(c => c.item?.includes('Shoulder') && c.hit);
      const uaa = ra.criticals.find(c => c.item?.includes('Upper Arm') && c.hit);
      const laa = ra.criticals.find(c => c.item?.includes('Lower Arm') && c.hit);
      if (shoulder) damageMod += 4;
      if (uaa) damageMod += 1;
      if (laa) damageMod += 1;
    }
  }
  if (weapon.location === 'LA' || weapon.location === 'LT') {
    const la = attacker.locations.get('LA');
    if (la) {
      const shoulder = la.criticals.find(c => c.item?.includes('Shoulder') && c.hit);
      const uaa = la.criticals.find(c => c.item?.includes('Upper Arm') && c.hit);
      const laa = la.criticals.find(c => c.item?.includes('Lower Arm') && c.hit);
      if (shoulder) damageMod += 4;
      if (uaa) damageMod += 1;
      if (laa) damageMod += 1;
    }
  }
  modifiers['Damage'] = damageMod;
  
  const targetNumber = Object.values(modifiers).reduce((sum, mod) => sum + mod, 0);
  
  return { 
    targetNumber: Math.max(2, Math.min(12, targetNumber)), 
    modifiers, 
    canFire: true 
  };
}

// Get heat effect
export function getHeatEffect(heat: number): { mpMod: number; toHitMod: number; shutdownRoll: number; ammoExplosionRoll: number; description: string } {
  let effect = HEAT_SCALE_EFFECTS[0];
  let threshold = 0;
  
  for (const [h, e] of Object.entries(HEAT_SCALE_EFFECTS)) {
    const heatVal = parseInt(h);
    if (heat >= heatVal && heatVal >= threshold) {
      threshold = heatVal;
      effect = e;
    }
  }
  
  return effect;
}

// Resolve a weapon attack
export function resolveAttack(
  attacker: Unit,
  target: Unit,
  weapon: Weapon,
  distance: number
): AttackResult {
  if (weapon.shotsRemaining <= 0 && weapon.shotsRemaining !== 999) {
    return {
      hit: false,
      roll: 0,
      targetNumber: 0,
      location: '',
      damage: 0,
      criticals: [],
      ammoExplosion: false,
      message: `${weapon.name} - NO AMMO`
    };
  }

  const { targetNumber, canFire } = calculateToHitModifiers(
    attacker, target, weapon, distance, 
    attacker.movementMode !== 'standing',
    target.movementMode !== 'standing'
  );
  
  if (!canFire) {
    return {
      hit: false,
      roll: 0,
      targetNumber: 0,
      location: '',
      damage: 0,
      criticals: [],
      ammoExplosion: false,
      message: `${weapon.name} - OUT OF RANGE`
    };
  }
  
  const roll = roll2d6();
  const hit = roll >= targetNumber;
  
  if (hit && weapon.shotsRemaining !== 999) {
    weapon.shotsRemaining--;
  }
  
  if (!hit) {
    return {
      hit: false,
      roll,
      targetNumber,
      location: '',
      damage: 0,
      criticals: [],
      ammoExplosion: false,
      message: `${weapon.name} MISS (rolled ${roll}, needed ${targetNumber})`
    };
  }
  
  const arc = determineArc(attacker, target);
  const locationRoll = roll2d6();
  const location = getHitLocation(locationRoll, target, arc);
  
  let damage = weapon.damage;
  
  if (weapon.type === 'missile' && (weapon.name.includes('LRM') || weapon.name.includes('SRM'))) {
    const missileCount = parseInt(weapon.name.match(/\d+/)?.[0] || '1');
    const clusterRoll = roll2d6();
    const hits = clusterHits(missileCount, clusterRoll);
    damage = hits * (weapon.name.includes('SRM') ? 2 : 1);
  }
  
  const { damageDealt, criticals, ammoExplosion, destroyed } = applyDamage(target, location, damage, roll === 2);
  
  const isTAC = roll === 2 && location !== 'HD';
  
  return {
    hit: true,
    roll,
    targetNumber,
    location,
    damage: damageDealt,
    criticals,
    ammoExplosion,
    message: `${weapon.name} HIT ${location} for ${damageDealt} damage (rolled ${roll} vs ${targetNumber})${isTAC ? ' - THROUGH ARMOR CRITICAL!' : ''}${destroyed ? ' - UNIT DESTROYED!' : ''}`
  };
}

// Apply damage to a location
export function applyDamage(
  unit: Unit,
  location: string,
  damage: number,
  isTAC: boolean = false
): { damageDealt: number; criticals: CriticalResult[]; ammoExplosion: boolean; destroyed: boolean } {
  const loc = unit.locations.get(location);
  if (!loc) return { damageDealt: 0, criticals: [], ammoExplosion: false, destroyed: false };
  
  let remainingDamage = damage;
  let damageDealt = 0;
  const criticals: CriticalResult[] = [];
  let ammoExplosion = false;
  let destroyed = false;
  
  if (loc.armor > 0) {
    const armorDamage = Math.min(remainingDamage, loc.armor);
    loc.armor -= armorDamage;
    remainingDamage -= armorDamage;
    damageDealt += armorDamage;
    
    if (isTAC && loc.armor > 0) {
      const crits = resolveCriticalHits(unit, location, 1);
      criticals.push(...crits);
    }
  }
  
  if (remainingDamage > 0 && loc.structure > 0) {
    const structDamage = Math.min(remainingDamage, loc.structure);
    loc.structure -= structDamage;
    remainingDamage -= structDamage;
    damageDealt += structDamage;
    
    if (loc.structure < loc.maxStructure) {
      const critRoll = roll2d6();
      const numCrits = CRITICAL_HIT_TABLE[critRoll] || 0;
      
      if (numCrits > 0) {
        const crits = resolveCriticalHits(unit, location, numCrits);
        criticals.push(...crits);
      }
      
      if (critRoll === 12 && (location === 'RA' || location === 'LA' || location === 'RL' || location === 'LL')) {
        loc.structure = 0;
        criticals.push({
          location,
          slot: -1,
          item: 'LIMB',
          effect: `${location} BLOWN OFF!`
        });
      }
    }
  }
  
  if (loc.structure <= 0) {
    if (location === 'HD') {
      unit.pilot.hits = 6;
      unit.pilot.conscious = false;
      unit.alive = false;
      destroyed = true;
    }
    
    if (location === 'CT') {
      unit.alive = false;
      destroyed = true;
    }
    
    if ((location === 'RT' || location === 'LT') && unit.hasXLEngine) {
      unit.alive = false;
      destroyed = true;
    }
    
    if (location === 'RL' || location === 'LL') {
      unit.immobile = true;
      unit.prone = true;
    }
  }
  
  const ammoCrit = criticals.find(c => c.item?.includes('Ammo') || c.effect?.includes('AMMO'));
  if (ammoCrit) {
    ammoExplosion = true;
  }
  
  return { damageDealt, criticals, ammoExplosion, destroyed };
}

// Resolve critical hits
export function resolveCriticalHits(unit: Unit, location: string, numCrits: number): CriticalResult[] {
  const criticals: CriticalResult[] = [];
  const loc = unit.locations.get(location);
  if (!loc) return criticals;
  
  for (let i = 0; i < numCrits; i++) {
    const firstDie = d6();
    const secondDie = d6();
    
    const slotSet = firstDie <= 3 ? 0 : 6;
    const slot = slotSet + secondDie - 1;
    
    if (slot < loc.criticals.length) {
      const crit = loc.criticals[slot];
      
      if (crit.item && !crit.hit) {
        crit.hit = true;
        
        const effect = applyCriticalEffect(unit, location, crit.item);
        
        criticals.push({
          location,
          slot,
          item: crit.item,
          effect
        });
      }
    }
  }
  
  return criticals;
}

// Apply critical hit effect
export function applyCriticalEffect(unit: Unit, location: string, item: string): string {
  if (item.includes('Engine')) {
    unit.engineHits++;
    if (unit.engineHits >= 3) {
      unit.alive = false;
      return 'ENGINE DESTROYED - MECH DESTROYED!';
    }
    if (unit.hasXLEngine && unit.engineHits >= 2) {
      unit.alive = false;
      return 'XL ENGINE DESTROYED - MECH DESTROYED!';
    }
    return `Engine Hit #${unit.engineHits} - +5 Heat per turn`;
  }
  
  if (item.includes('Gyro')) {
    unit.gyroHits++;
    if (unit.gyroHits >= 2) {
      unit.immobile = true;
      unit.prone = true;
      return 'GYRO DESTROYED - MECH FALLS AND CANNOT STAND!';
    }
    return `Gyro Hit #${unit.gyroHits} - +3 to all Piloting Rolls`;
  }
  
  if (item.includes('Sensor')) {
    unit.sensorHits++;
    if (unit.sensorHits >= 2) {
      return 'SENSORS DESTROYED - CANNOT FIRE WEAPONS!';
    }
    return `Sensor Hit #${unit.sensorHits} - +2 to Hit`;
  }
  
  if (item.includes('Life Support')) {
    unit.lifeSupportHits++;
    return 'Life Support Hit - Pilot takes heat damage!';
  }
  
  if (item.includes('Cockpit')) {
    unit.pilot.hits = 6;
    unit.pilot.conscious = false;
    unit.alive = false;
    return 'COCKPIT DESTROYED - PILOT KILLED!';
  }
  
  if (item.includes('Ammo')) {
    const ammo = unit.ammo.find(a => a.location === location);
    if (ammo && ammo.shots > 0) {
      const explosionDamage = ammo.shots * 2;
      
      if (unit.hasCASE && (location === 'RT' || location === 'LT')) {
        return `AMMO EXPLOSION! CASE contains damage. ${explosionDamage} damage vented.`;
      } else {
        const locData = unit.locations.get(location);
        if (locData) {
          locData.structure = 0;
        }
        unit.pilot.hits += 2;
        return `AMMO EXPLOSION! ${explosionDamage} damage to ${location}. Pilot takes 2 hits!`;
      }
    }
    return 'Empty ammo slot hit';
  }
  
  if (item.includes('Laser') || item.includes('PPC') || item.includes('AC') || 
      item.includes('Gauss') || item.includes('LRM') || item.includes('SRM') ||
      item.includes('MG') || item.includes('Flamer')) {
    const weapon = unit.weapons.find(w => w.location === location && w.name === item);
    if (weapon) {
      weapon.damage = 0;
      return `${item} DESTROYED!`;
    }
  }
  
  if (item.includes('Heat Sink')) {
    unit.heatSinks--;
    return 'Heat Sink destroyed - Heat dissipation reduced';
  }
  
  if (item.includes('Jump Jet')) {
    unit.jumpingMP = Math.max(0, unit.jumpingMP - 1);
    return 'Jump Jet destroyed - Jump MP reduced';
  }
  
  return `${item} destroyed`;
}

// Check for heat effects at end of turn
export function resolveHeatPhase(unit: Unit): { shutdown: boolean; ammoExplosion: boolean; pilotDamage: number; messages: string[] } {
  const messages: string[] = [];
  const effect = getHeatEffect(unit.heat);
  
  const dissipation = unit.doubleHeatSinks ? unit.heatSinks * 2 : unit.heatSinks;
  const engineHeat = unit.engineHits * 5;
  unit.heat = Math.max(0, unit.heat - dissipation + engineHeat);
  
  let shutdown = false;
  if (effect.shutdownRoll > 0) {
    const roll = roll2d6();
    if (roll <= effect.shutdownRoll) {
      shutdown = true;
      unit.shutdown = true;
      messages.push(`SHUTDOWN! (rolled ${roll}, needed >${effect.shutdownRoll})`);
    }
  }
  
  if (unit.heat >= 30) {
    shutdown = true;
    unit.shutdown = true;
    messages.push('AUTO-SHUTDOWN at 30 Heat!');
  }
  
  let ammoExplosion = false;
  if (effect.ammoExplosionRoll > 0) {
    const roll = roll2d6();
    if (roll <= effect.ammoExplosionRoll) {
      ammoExplosion = true;
      messages.push(`AMMO EXPLOSION from heat! (rolled ${roll})`);
      
      const liveAmmo = unit.ammo.find(a => a.shots > 0);
      if (liveAmmo) {
        const loc = unit.locations.get(liveAmmo.location);
        if (loc) {
          loc.structure = 0;
          unit.pilot.hits += 2;
        }
      }
    }
  }
  
  let pilotDamage = 0;
  if (unit.lifeSupportHits > 0) {
    if (unit.heat >= 15 && unit.heat <= 25) {
      pilotDamage = 1;
      unit.pilot.hits += 1;
    } else if (unit.heat > 25) {
      pilotDamage = 2;
      unit.pilot.hits += 2;
    }
  }
  
  if (unit.pilot.hits >= 6) {
    unit.pilot.conscious = false;
    unit.alive = false;
    messages.push('PILOT KILLED!');
  }
  
  return { shutdown, ammoExplosion, pilotDamage, messages };
}

// Get all valid target hexes for a unit's weapons
export function getValidTargetHexes(unit: Unit, hexGrid: Map<string, Hex>, allUnits: Unit[]): HexCoord[] {
  if (!unit.position) return [];
  
  const validHexes: HexCoord[] = [];
  const maxRange = Math.max(...unit.weapons.map(w => w.longRange));
  
  for (const [, hex] of hexGrid) {
    const distance = hexDistance(unit.position, hex.coord);
    if (distance <= maxRange) {
      const enemyUnit = allUnits.find(u => 
        u.position && 
        u.position.q === hex.coord.q && 
        u.position.r === hex.coord.r && 
        u.alive && 
        u.id !== unit.id
      );
      
      if (enemyUnit) {
        validHexes.push(hex.coord);
      }
    }
  }
  
  return validHexes;
}
