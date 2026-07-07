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
  Config,
  MovementMode,
  WeaponType
} from '@/types/battletech';
import { roll2d6, d6, clusterHits } from './dice';
import { TERRAIN_TYPES, hasLineOfSight } from './hexgrid';

// BattleTech Combat Engine - Accurate to Classic CBT Rules

// Add terrain-based to-hit modifiers
export function getTerrainModifier(hex: Hex | undefined): number {
  if (!hex) return 0;
  const terrain = TERRAIN_TYPES[hex.terrain];
  return terrain ? terrain.toHitModifier : 0;
}

export function getElevationModifier(attackerHex?: Hex, targetHex?: Hex): number {
  if (!attackerHex || !targetHex) return 0;
  if (attackerHex.elevation > targetHex.elevation) return -1;
  if (attackerHex.elevation < targetHex.elevation) return 1;
  return 0;
}

export function getAttackerMovementModifier(movementMode: MovementMode): number {
  switch (movementMode) {
    case MovementMode.WALKING:
      return 0;
    case MovementMode.RUNNING:
      return 2;
    case MovementMode.JUMPING:
      return 3;
    default:
      return 0;
  }
}

export function getTargetMovementModifier(targetMoved: boolean, target: Unit): number {
  if (!targetMoved) return 0;
  switch (target.movementMode) {
    case MovementMode.WALKING:
      return 1;
    case MovementMode.RUNNING:
      return 2;
    case MovementMode.JUMPING:
      return 3;
    case MovementMode.IMMOBILE:
      return -4;
    default:
      return 0;
  }
}

export function getECMModifier(target: Unit): number {
  return target.hasECM ? 1 : 0;
}

export function getAMSModifier(target: Unit, weapon: Weapon): number {
  if (!target.hasAMS || !target.amsActive || weapon.type !== WeaponType.MISSILE) return 0;
  const rating = target.amsRating ?? 2;
  // Scale AMS to-hit penalty with rating (1 -> +1, 2 -> +2, up to +4)
  return Math.min(4, Math.max(1, Math.floor(rating)));
}

export function consumeAmmo(unit: Unit, weapon: Weapon): void {
  if (weapon.shotsRemaining === 999 || weapon.shotsRemaining === Infinity) return;

  weapon.shotsRemaining = Math.max(0, weapon.shotsRemaining - 1);
  const ammoEntry = unit.ammo.find(ammo => ammo.location === weapon.location || weapon.name.includes(ammo.type));

  if (ammoEntry && ammoEntry.shots > 0) {
    ammoEntry.shots = Math.max(0, ammoEntry.shots - 1);
  }
}

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
  if (band === 'out') return -1;
  return RANGE_MODIFIERS[band as keyof typeof RANGE_MODIFIERS];
}

// Determine attack arc based on facing and target position
export function determineArc(attacker: Unit, target: Unit): Arc {
  if (!attacker.position || !target.position) return Arc.FRONT;

  // Compute angle from target to attacker so we can determine the arc on the target
  const dx = attacker.position.q - target.position.q;
  const dy = attacker.position.r - target.position.r;
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  // Use torsoFacing if available, otherwise use unit facing
  const facingRef = (typeof target.torsoFacing === 'number') ? target.torsoFacing : target.facing;

  const relativeAngle = (angle - facingRef * 60 + 360) % 360;

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
  
  // Base front table result
  let base = BIPED_FRONT_HIT_TABLE[roll] || 'CT';

  // If the unit has a torso twist (torsoFacing different from facing), bias CT results
  // toward the twisted side (more exposed). This increases chance to hit side torso.
  const torsoFacing = typeof unit.torsoFacing === 'number' ? unit.torsoFacing : unit.facing;
  const diff = (torsoFacing - unit.facing + 6) % 6; // 0..5

  if (base === 'CT' && diff !== 0) {
    // diff 1-3 -> twisted clockwise (right side exposed), diff 4-5 -> counter-clockwise (left exposed)
    const favorRight = diff >= 1 && diff <= 3;
    if (Math.random() < 0.45) {
      base = favorRight ? 'RT' : 'LT';
    }
  }

  return base;
}

// Calculate to-hit modifiers
export function calculateToHitModifiers(
  attacker: Unit,
  target: Unit,
  weapon: Weapon,
  distance: number,
  attackerMoved: boolean,
  targetMoved: boolean,
  terrainModifier: number = 0,
  attackerHex?: Hex,
  targetHex?: Hex
): { targetNumber: number; modifiers: { [key: string]: number }; canFire: boolean } {
  const modifiers: { [key: string]: number } = {};
  
  if (!attacker.alive || attacker.shutdown || attacker.prone) {
    return { targetNumber: 0, modifiers, canFire: false };
  }

  if (!target.alive) {
    return { targetNumber: 0, modifiers, canFire: false };
  }

  modifiers['Gunnery'] = attacker.pilot.gunnery;
  
  const rangeMod = getRangeModifier(weapon, distance);
  if (rangeMod === -1) {
    return { targetNumber: 0, modifiers, canFire: false };
  }
  modifiers['Range'] = rangeMod;
  
  modifiers['Target Movement'] = getTargetMovementModifier(targetMoved, target);
  modifiers['Attacker Movement'] = attackerMoved ? getAttackerMovementModifier(attacker.movementMode) : 0;
  modifiers['Heat'] = getHeatEffect(attacker.heat).toHitMod;
  modifiers['Sensors'] = attacker.sensorHits * 2;
  modifiers['Terrain'] = terrainModifier;
  modifiers['Elevation'] = getElevationModifier(attackerHex, targetHex);
  modifiers['ECM'] = getECMModifier(target);
  modifiers['AMS'] = getAMSModifier(target, weapon);
  modifiers['Prone'] = target.prone ? 1 : 0;
  
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
    targetNumber: Math.max(2, targetNumber), 
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
  distance: number,
  terrainModifier: number = 0,
  attackerHex?: Hex,
  targetHex?: Hex
): AttackResult {
  if (!attacker.alive || attacker.shutdown || attacker.prone || attacker.heat >= 30) {
    return {
      hit: false,
      roll: 0,
      targetNumber: 0,
      location: '',
      damage: 0,
      criticals: [],
      ammoExplosion: false,
      message: `${attacker.name} is overheated/shutdown and cannot fire.`,
      fired: false
    };
  }

  if (weapon.shotsRemaining <= 0 && weapon.shotsRemaining !== 999 && weapon.shotsRemaining !== Infinity) {
    return {
      hit: false,
      roll: 0,
      targetNumber: 0,
      location: '',
      damage: 0,
      criticals: [],
      ammoExplosion: false,
      message: `${weapon.name} - NO AMMO`,
      fired: false
    };
  }

  const attackerMoved = attacker.currentMP < (attacker.movementMode === MovementMode.RUNNING
    ? attacker.runningMP
    : attacker.movementMode === MovementMode.JUMPING
      ? attacker.jumpingMP
      : attacker.walkingMP);
  const targetMoved = target.currentMP < (target.movementMode === MovementMode.RUNNING
    ? target.runningMP
    : target.movementMode === MovementMode.JUMPING
      ? target.jumpingMP
      : target.walkingMP);

  const { targetNumber, canFire } = calculateToHitModifiers(
    attacker, target, weapon, distance,
    attackerMoved,
    targetMoved,
    terrainModifier,
    attackerHex,
    targetHex
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
      message: `${weapon.name} - OUT OF RANGE`,
      fired: false
    };
  }

  if (weapon.shotsRemaining !== 999 && weapon.shotsRemaining !== Infinity) {
    consumeAmmo(attacker, weapon);
  }
  
  const roll = roll2d6();
  const hit = roll >= targetNumber;
  
  if (!hit) {
    return {
      hit: false,
      roll,
      targetNumber,
      location: '',
      damage: 0,
      criticals: [],
      ammoExplosion: false,
      message: `${weapon.name} MISS (rolled ${roll}, needed ${targetNumber})`,
      fired: true
    };
  }
  
  const arc = determineArc(attacker, target);
  const locationRoll = roll2d6();
  const location = getHitLocation(locationRoll, target, arc);
  
  let damage = weapon.damage;
  let amsIntercepted = 0;
  
  if (weapon.type === WeaponType.MISSILE && (weapon.name.includes('LRM') || weapon.name.includes('SRM'))) {
    const missileCount = parseInt(weapon.name.match(/\d+/)?.[0] || '1');
    const clusterRoll = roll2d6();
    let hits = clusterHits(missileCount, clusterRoll);

    // AMS interception: per-missile interception rolls, consumes AMS ammo and generates heat
    let amsIntercepted = 0;
    if (target.hasAMS && target.amsActive) {
      const rating = target.amsRating ?? 2;
      const perMissileChance = Math.min(0.9, 0.12 * rating);
      // available AMS rounds (Infinity if undefined)
      let availableAMS = target.amsAmmo === undefined ? Infinity : Math.max(0, Math.floor(target.amsAmmo));

      for (let i = 0; i < hits; i++) {
        if (availableAMS <= 0) break;
        if (Math.random() < perMissileChance) {
          amsIntercepted++;
          availableAMS--;
          // AMS firing generates a small amount of heat
          target.heat = (target.heat || 0) + 1;
        }
      }

      // write back remaining AMS ammo if it was finite
      if (isFinite(availableAMS)) {
        target.amsAmmo = availableAMS;
      }

      hits = Math.max(0, hits - amsIntercepted);
    }

    damage = hits * 2;
  }
  
  const { damageDealt, criticals, ammoExplosion, destroyed } = applyDamage(target, location, damage, roll === 2);

  const isTAC = roll === 2 && location !== 'HD';

  // Add AMS note if applicable
  const amsNote = weapon.type === WeaponType.MISSILE && target.hasAMS
    ? ` AMS intercepted ${amsIntercepted} missiles (rating ${target.amsRating ?? 2}).`
    : '';

  return {
    hit: true,
    roll,
    targetNumber,
    location,
    damage: damageDealt,
    criticals,
    ammoExplosion,
    message: `${weapon.name} HIT ${location} for ${damageDealt} damage (rolled ${roll} vs ${targetNumber})${isTAC ? ' - THROUGH ARMOR CRITICAL!' : ''}${destroyed ? ' - UNIT DESTROYED!' : ''}${amsNote}`,
    fired: true
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
  
  const selectCriticalSlot = (): number => {
    const firstDie = d6();
    const secondDie = d6();
    const slotSet = firstDie <= 3 ? 0 : 6;
    return slotSet + secondDie - 1;
  };

  for (let i = 0; i < numCrits; i++) {
    let slot = selectCriticalSlot();
    let attempts = 0;

    while (attempts < loc.criticals.length && (slot >= loc.criticals.length || loc.criticals[slot].hit || !loc.criticals[slot].item || loc.criticals[slot].item === 'None')) {
      slot = (slot + 1) % loc.criticals.length;
      attempts += 1;
    }

    if (slot >= loc.criticals.length) continue;
    const crit = loc.criticals[slot];
    if (!crit || crit.hit || !crit.item || crit.item === 'None') continue;

    crit.hit = true;
    const effect = applyCriticalEffect(unit, location, crit.item);
    criticals.push({
      location,
      slot,
      item: crit.item,
      effect
    });
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
    if (distance > maxRange) continue;
    if (!hasLineOfSight(unit.position, hex.coord, hexGrid)) continue;

    const enemyUnit = allUnits.find(u => 
      u.position && 
      u.position.q === hex.coord.q && 
      u.position.r === hex.coord.r && 
      u.alive && 
      u.id !== unit.id
    );
    
    if (!enemyUnit) continue;

    const weaponInRange = unit.weapons.some(weapon => getRangeModifier(weapon, distance) !== -1);
    if (weaponInRange) {
      validHexes.push(hex.coord);
    }
  }
  
  return validHexes;
}
