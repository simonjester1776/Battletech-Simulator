// Hex Grid Engine for BattleTech

import type { HexCoord, Hex, Unit } from '@/types/battletech';
import { TerrainType, MovementMode } from '@/types/battletech';

// Terrain definitions
export const TERRAIN_TYPES = {
  [TerrainType.CLEAR]: {
    type: TerrainType.CLEAR,
    name: 'Clear',
    movementCost: 1,
    movementModifier: 0,
    toHitModifier: 0,
    coverProvided: false
  },
  [TerrainType.LIGHT_WOODS]: {
    type: TerrainType.LIGHT_WOODS,
    name: 'Light Woods',
    movementCost: 2,
    movementModifier: 0,
    toHitModifier: 1,
    coverProvided: true
  },
  [TerrainType.HEAVY_WOODS]: {
    type: TerrainType.HEAVY_WOODS,
    name: 'Heavy Woods',
    movementCost: 3,
    movementModifier: 0,
    toHitModifier: 2,
    coverProvided: true
  },
  [TerrainType.WATER]: {
    type: TerrainType.WATER,
    name: 'Water',
    movementCost: 99,
    movementModifier: 0,
    toHitModifier: 0,
    coverProvided: false
  },
  [TerrainType.ROUGH]: {
    type: TerrainType.ROUGH,
    name: 'Rough',
    movementCost: 2,
    movementModifier: 0,
    toHitModifier: 0,
    coverProvided: true
  },
  [TerrainType.ROAD]: {
    type: TerrainType.ROAD,
    name: 'Road',
    movementCost: 0.5,
    movementModifier: 0,
    toHitModifier: 0,
    coverProvided: false
  },
  [TerrainType.BUILDING]: {
    type: TerrainType.BUILDING,
    name: 'Building',
    movementCost: 99,
    movementModifier: 0,
    toHitModifier: 3,
    coverProvided: true
  },
  [TerrainType.HILL]: {
    type: TerrainType.HILL,
    name: 'Hill',
    movementCost: 2,
    movementModifier: 0,
    toHitModifier: -1,
    coverProvided: true
  }
};

// Create a hex coordinate
export function createHex(q: number, r: number): HexCoord {
  return { q, r, s: -q - r };
}

// Get hex key for map storage
export function getHexKey(hex: HexCoord): string {
  return `${hex.q},${hex.r}`;
}

// Parse hex key back to coordinate
export function parseHexKey(key: string): HexCoord {
  const [q, r] = key.split(',').map(Number);
  return createHex(q, r);
}

// Get all 6 neighboring hexes
export function getNeighbors(hex: HexCoord): HexCoord[] {
  const directions = [
    { q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 },
    { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 }
  ];
  
  return directions.map(d => createHex(hex.q + d.q, hex.r + d.r));
}

// Calculate distance between two hexes
export function hexDistance(a: HexCoord, b: HexCoord): number {
  return Math.max(
    Math.abs(a.q - b.q),
    Math.abs(a.r - b.r),
    Math.abs(a.s - b.s)
  );
}

// Get hex at coordinate from grid
export function getHex(grid: Map<string, Hex>, coord: HexCoord): Hex | undefined {
  return grid.get(getHexKey(coord));
}

// Set hex in grid
export function setHex(grid: Map<string, Hex>, hex: Hex): void {
  grid.set(getHexKey(hex.coord), hex);
}

// Check if hex exists in grid
export function hasHex(grid: Map<string, Hex>, coord: HexCoord): boolean {
  return grid.has(getHexKey(coord));
}

// Create a hex grid of specified size
export function createHexGrid(radius: number): Map<string, Hex> {
  const grid = new Map<string, Hex>();
  
  for (let q = -radius; q <= radius; q++) {
    const r1 = Math.max(-radius, -q - radius);
    const r2 = Math.min(radius, -q + radius);
    
    for (let r = r1; r <= r2; r++) {
      const coord = createHex(q, r);
      
      // Determine terrain based on position (simple map generation)
      let terrain: TerrainType = TerrainType.CLEAR;
      
      // Add some woods
      const noise = Math.sin(q * 0.5) * Math.cos(r * 0.5);
      if (noise > 0.5) terrain = TerrainType.LIGHT_WOODS;
      if (noise > 0.8) terrain = TerrainType.HEAVY_WOODS;
      
      // Add some hills
      if (Math.abs(q) === Math.abs(r) && q % 3 === 0) {
        terrain = TerrainType.HILL;
      }
      
      // Add some rough terrain
      if ((q + r) % 7 === 0) {
        terrain = TerrainType.ROUGH;
      }
      
      // Roads through center
      if (q === 0 || r === 0 || q === -r) {
        terrain = TerrainType.ROAD;
      }
      
      const hex: Hex = {
        coord,
        terrain,
        elevation: terrain === TerrainType.HILL ? 2 : 0,
        unit: null
      };
      
      setHex(grid, hex);
    }
  }
  
  return grid;
}

// Get all hexes within a certain range
export function getHexesInRange(center: HexCoord, range: number, grid: Map<string, Hex>): Hex[] {
  const hexes: Hex[] = [];
  
  for (let q = -range; q <= range; q++) {
    const r1 = Math.max(-range, -q - range);
    const r2 = Math.min(range, -q + range);
    
    for (let r = r1; r <= r2; r++) {
      const coord = createHex(center.q + q, center.r + r);
      const hex = getHex(grid, coord);
      if (hex) {
        hexes.push(hex);
      }
    }
  }
  
  return hexes;
}

// Calculate movement cost for a unit entering a hex
export function getMovementCost(unit: Unit, hex: Hex, fromHex: Hex): number {
  const terrain = TERRAIN_TYPES[hex.terrain];
  let cost = terrain.movementCost;
  
  // Jumping ignores terrain
  if (unit.movementMode === MovementMode.JUMPING) {
    return 1;
  }
  
  // Elevation changes
  const elevationChange = Math.abs(hex.elevation - fromHex.elevation);
  if (elevationChange > 1) {
    return 99;
  }
  cost += elevationChange;
  
  // Prone mechs pay extra
  if (unit.prone) {
    cost *= 2;
  }
  
  // Leg damage affects movement
  const rl = unit.locations.get('RL');
  const ll = unit.locations.get('LL');
  if (rl && rl.structure <= 0) cost *= 2;
  if (ll && ll.structure <= 0) cost *= 2;
  
  return cost;
}

// Get heat effect for movement
function getHeatEffectForMovement(heat: number): { mpMod: number; toHitMod: number; shutdownRoll: number; ammoExplosionRoll: number; description: string } {
  const HEAT_SCALE_EFFECTS: { [heat: number]: { mpMod: number; toHitMod: number; shutdownRoll: number; ammoExplosionRoll: number; description: string } } = {
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

// Get valid movement hexes for a unit
export function getValidMovementHexes(
  unit: Unit, 
  grid: Map<string, Hex>, 
  allUnits: Unit[]
): HexCoord[] {
  if (!unit.position || unit.immobile || unit.shutdown) return [];
  
  const validHexes: HexCoord[] = [];
  const startHex = getHex(grid, unit.position);
  if (!startHex) return [];
  
  // Determine max MP based on movement mode
  let maxMP = unit.walkingMP;
  if (unit.movementMode === MovementMode.RUNNING) {
    maxMP = unit.runningMP;
  } else if (unit.movementMode === MovementMode.JUMPING) {
    maxMP = unit.jumpingMP;
  }
  
  // Apply heat effects
  const heatEffect = getHeatEffectForMovement(unit.heat);
  maxMP = Math.max(0, maxMP + heatEffect.mpMod);
  
  // Apply leg damage
  const rl = unit.locations.get('RL');
  const ll = unit.locations.get('LL');
  if (rl && rl.structure <= 0) maxMP = Math.floor(maxMP / 2);
  if (ll && ll.structure <= 0) maxMP = Math.floor(maxMP / 2);
  
  if (maxMP <= 0) return [];
  
  // BFS to find all reachable hexes
  const visited = new Map<string, number>();
  const queue: { coord: HexCoord; mpUsed: number }[] = [{ coord: unit.position, mpUsed: 0 }];
  
  visited.set(getHexKey(unit.position), 0);
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    const currentHex = getHex(grid, current.coord);
    if (!currentHex) continue;
    
    // Check all neighbors
    const neighbors = getNeighbors(current.coord);
    
    for (const neighbor of neighbors) {
      const neighborHex = getHex(grid, neighbor);
      if (!neighborHex) continue;
      
      // Check if occupied by another unit
      const occupied = allUnits.some(u => 
        u.id !== unit.id && 
        u.alive && 
        u.position && 
        u.position.q === neighbor.q && 
        u.position.r === neighbor.r
      );
      
      if (occupied) continue;
      
      // Calculate movement cost
      const moveCost = unit.movementMode === MovementMode.JUMPING 
        ? 1 
        : getMovementCost(unit, neighborHex, currentHex);
      
      if (moveCost >= 99) continue;
      
      const newMPUsed = current.mpUsed + moveCost;
      
      if (newMPUsed <= maxMP) {
        const neighborKey = getHexKey(neighbor);
        const existingMP = visited.get(neighborKey);
        
        if (existingMP === undefined || newMPUsed < existingMP) {
          visited.set(neighborKey, newMPUsed);
          queue.push({ coord: neighbor, mpUsed: newMPUsed });
          
          // Don't add the starting position
          if (neighborKey !== getHexKey(unit.position)) {
            validHexes.push(neighbor);
          }
        }
      }
    }
  }
  
  return validHexes;
}

// Move a unit to a new hex
export function moveUnit(
  unit: Unit, 
  toCoord: HexCoord, 
  grid: Map<string, Hex>,
  movementMode: MovementMode
): { success: boolean; mpUsed: number; message: string } {
  if (!unit.position) {
    return { success: false, mpUsed: 0, message: 'Unit has no position' };
  }
  
  const fromHex = getHex(grid, unit.position);
  const toHex = getHex(grid, toCoord);
  
  if (!fromHex || !toHex) {
    return { success: false, mpUsed: 0, message: 'Invalid hex' };
  }
  
  // Calculate MP cost
  const mpCost = movementMode === MovementMode.JUMPING 
    ? hexDistance(unit.position, toCoord)
    : getMovementCost(unit, toHex, fromHex);
  
  if (mpCost >= 99) {
    return { success: false, mpUsed: 0, message: 'Cannot enter that terrain' };
  }
  
  // Update unit position and movement mode
  unit.position = toCoord;
  unit.movementMode = movementMode;
  unit.currentMP -= mpCost;
  
  // Add heat from movement
  switch (movementMode) {
    case MovementMode.WALKING: unit.heat += 1; break;
    case MovementMode.RUNNING: unit.heat += 2; break;
    case MovementMode.JUMPING: unit.heat += Math.max(3, mpCost); break;
  }
  
  return { 
    success: true, 
    mpUsed: mpCost, 
    message: `Moved to (${toCoord.q}, ${toCoord.r}) using ${mpCost} MP` 
  };
}

// Convert hex to pixel coordinates (for rendering)
export function hexToPixel(hex: HexCoord, size: number): { x: number; y: number } {
  const x = size * (Math.sqrt(3) * hex.q + Math.sqrt(3) / 2 * hex.r);
  const y = size * (3 / 2 * hex.r);
  return { x, y };
}

// Convert pixel to hex coordinates (for clicking)
export function pixelToHex(x: number, y: number, size: number): HexCoord {
  const q = (Math.sqrt(3) / 3 * x - 1 / 3 * y) / size;
  const r = (2 / 3 * y) / size;
  return hexRound(q, r);
}

// Round fractional hex coordinates to nearest hex
function hexRound(q: number, r: number): HexCoord {
  let s = -q - r;
  
  let rq = Math.round(q);
  let rr = Math.round(r);
  let rs = Math.round(s);
  
  const qDiff = Math.abs(rq - q);
  const rDiff = Math.abs(rr - r);
  const sDiff = Math.abs(rs - s);
  
  if (qDiff > rDiff && qDiff > sDiff) {
    rq = -rr - rs;
  } else if (rDiff > sDiff) {
    rr = -rq - rs;
  } else {
    rs = -rq - rr;
  }
  
  return createHex(rq, rr);
}

// Get line of sight between two hexes (simple version)
export function hasLineOfSight(
  from: HexCoord, 
  to: HexCoord, 
  grid: Map<string, Hex>
): boolean {
  return hasHex(grid, from) && hasHex(grid, to);
}

// Get facing direction as degrees
export function facingToDegrees(facing: number): number {
  return facing * 60;
}

// Rotate facing
export function rotateFacing(currentFacing: number, direction: 'left' | 'right'): number {
  if (direction === 'left') {
    return (currentFacing + 5) % 6;
  } else {
    return (currentFacing + 1) % 6;
  }
}
