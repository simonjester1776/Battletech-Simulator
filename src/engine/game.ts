// BattleTech Game Engine - Main Game State Manager

import type { GameState, Unit, HexCoord, LogEntry } from '@/types/battletech';
import { GamePhase, MovementMode } from '@/types/battletech';
import { createHexGrid, getHex, setHex, getValidMovementHexes, moveUnit } from './hexgrid';
import { resolveAttack, resolveHeatPhase, hexDistance } from './combat';
import { roll2d6 } from './dice';
import { cloneUnit } from './units';

// Initialize a new game
export function initializeGame(playerUnits: Unit[], aiUnits: Unit[]): GameState {
  const grid = createHexGrid(10);
  
  // Position player units on one side
  playerUnits.forEach((unit, index) => {
    const unitCopy = cloneUnit(unit);
    unitCopy.position = { q: -5 + index * 2, r: 5, s: -(-5 + index * 2) - 5 };
    unitCopy.facing = 0;
    
    const hex = getHex(grid, unitCopy.position);
    if (hex) {
      hex.unit = unitCopy;
      setHex(grid, hex);
    }
  });
  
  // Position AI units on the other side
  aiUnits.forEach((unit, index) => {
    const unitCopy = cloneUnit(unit);
    unitCopy.position = { q: 5 - index * 2, r: -5, s: -(5 - index * 2) - (-5) };
    unitCopy.facing = 3;
    
    const hex = getHex(grid, unitCopy.position);
    if (hex) {
      hex.unit = unitCopy;
      setHex(grid, hex);
    }
  });
  
  const allUnits = [...playerUnits.map(cloneUnit), ...aiUnits.map(cloneUnit)];
  
  return {
    turn: 1,
    phase: GamePhase.INITIATIVE,
    units: allUnits,
    hexGrid: grid,
    selectedUnit: null,
    targetUnit: null,
    validMoveHexes: [],
    validTargetHexes: [],
    gameLog: [{
      turn: 1,
      phase: GamePhase.INITIATIVE,
      message: 'Battle begins! Roll for initiative.',
      type: 'system',
      timestamp: Date.now()
    }],
    initiativeWinner: null,
    playerScore: 0,
    aiScore: 0
  };
}

// Roll for initiative
export function rollInitiative(state: GameState): { state: GameState; winner: 'player' | 'ai' } {
  const playerRoll = roll2d6();
  const aiRoll = roll2d6();
  
  const winner: 'player' | 'ai' = playerRoll >= aiRoll ? 'player' : 'ai';
  
  const newState = { ...state };
  newState.initiativeWinner = winner;
  newState.phase = GamePhase.MOVEMENT;
  
  addLogEntry(newState, `Initiative: Player rolled ${playerRoll}, AI rolled ${aiRoll}. ${winner === 'player' ? 'Player' : 'AI'} wins!`, 'system');
  
  return { state: newState, winner };
}

// Select a unit
export function selectUnit(state: GameState, unit: Unit | null): GameState {
  const newState = { ...state };
  newState.selectedUnit = unit;
  
  if (unit && unit.alive && !unit.shutdown) {
    newState.validMoveHexes = getValidMovementHexes(unit, state.hexGrid, state.units);
  } else {
    newState.validMoveHexes = [];
  }
  
  newState.validTargetHexes = [];
  newState.targetUnit = null;
  
  return newState;
}

// Move selected unit
export function moveSelectedUnit(
  state: GameState, 
  toCoord: HexCoord, 
  movementMode: MovementMode
): GameState {
  if (!state.selectedUnit || !state.selectedUnit.position) return state;
  
  const newState = { ...state };
  const unit = newState.units.find(u => u.id === state.selectedUnit!.id);
  if (!unit) return state;
  
  // Remove unit from old hex
  const oldHex = getHex(newState.hexGrid, unit.position!);
  if (oldHex) {
    oldHex.unit = null;
    setHex(newState.hexGrid, oldHex);
  }
  
  const result = moveUnit(unit, toCoord, newState.hexGrid, movementMode);
  
  if (result.success) {
    const newHex = getHex(newState.hexGrid, toCoord);
    if (newHex) {
      newHex.unit = unit;
      setHex(newState.hexGrid, newHex);
    }
    
    addLogEntry(newState, `${unit.name} ${result.message}`, 'movement');
    
    newState.validMoveHexes = getValidMovementHexes(unit, newState.hexGrid, newState.units);
  }
  
  return newState;
}

// Select target for attack
export function selectTarget(state: GameState, targetUnit: Unit): GameState {
  const newState = { ...state };
  newState.targetUnit = targetUnit;
  return newState;
}

// Fire weapon at target
export function fireWeapon(
  state: GameState,
  weaponId: string
): GameState {
  if (!state.selectedUnit || !state.targetUnit) return state;
  
  const newState = { ...state };
  const attacker = newState.units.find(u => u.id === state.selectedUnit!.id);
  const target = newState.units.find(u => u.id === state.targetUnit!.id);
  
  if (!attacker || !target || !attacker.position || !target.position) return state;
  
  const weapon = attacker.weapons.find(w => w.id === weaponId);
  if (!weapon) return state;
  
  const distance = hexDistance(attacker.position, target.position);
  const result = resolveAttack(attacker, target, weapon, distance);
  
  attacker.heat += weapon.heat;
  
  addLogEntry(newState, result.message, result.hit ? 'combat' : 'info');
  
  result.criticals.forEach(crit => {
    addLogEntry(newState, `CRITICAL: ${crit.effect}`, 'critical');
  });
  
  if (!target.alive) {
    addLogEntry(newState, `${target.name} DESTROYED!`, 'critical');
    
    const targetIndex = newState.units.indexOf(target);
    const isPlayerUnit = targetIndex < newState.units.length / 2;
    
    if (isPlayerUnit) {
      newState.aiScore += target.bv2;
    } else {
      newState.playerScore += target.bv2;
    }
    
    const targetHex = getHex(newState.hexGrid, target.position);
    if (targetHex) {
      targetHex.unit = null;
      setHex(newState.hexGrid, targetHex);
    }
  }
  
  return newState;
}

// Fire all weapons at target
export function fireAllWeapons(state: GameState): GameState {
  if (!state.selectedUnit || !state.targetUnit) return state;
  
  const attacker = state.units.find(u => u.id === state.selectedUnit!.id);
  if (!attacker) return state;
  
  let newState = { ...state };
  
  for (const weapon of attacker.weapons) {
    if (weapon.damage > 0) {
      newState = fireWeapon(newState, weapon.id);
    }
  }
  
  return newState;
}

// End movement phase
export function endMovementPhase(state: GameState): GameState {
  const newState = { ...state };
  newState.phase = GamePhase.COMBAT;
  newState.selectedUnit = null;
  newState.targetUnit = null;
  newState.validMoveHexes = [];
  newState.validTargetHexes = [];
  
  addLogEntry(newState, 'Movement phase complete. Combat phase begins.', 'system');
  
  return newState;
}

// End combat phase
export function endCombatPhase(state: GameState): GameState {
  const newState = { ...state };
  newState.phase = GamePhase.HEAT;
  newState.selectedUnit = null;
  newState.targetUnit = null;
  
  addLogEntry(newState, 'Combat phase complete. Heat phase begins.', 'system');
  
  return newState;
}

// Resolve heat phase for all units
export function resolveHeatPhaseForAll(state: GameState): GameState {
  const newState = { ...state };
  
  newState.units.forEach(unit => {
    if (unit.alive) {
      const result = resolveHeatPhase(unit);
      
      result.messages.forEach(msg => {
        addLogEntry(newState, `${unit.name}: ${msg}`, 'heat');
      });
      
      if (!unit.pilot.conscious) {
        addLogEntry(newState, `${unit.name}: Pilot unconscious!`, 'critical');
      }
    }
  });
  
  return newState;
}

// End heat phase and start new turn
export function endHeatPhase(state: GameState): GameState {
  const newState = resolveHeatPhaseForAll(state);
  newState.turn++;
  newState.phase = GamePhase.INITIATIVE;
  
  newState.units.forEach(unit => {
    if (unit.alive) {
      unit.movementMode = MovementMode.STANDING;
      unit.currentMP = unit.walkingMP;
    }
  });
  
  addLogEntry(newState, `Turn ${newState.turn} begins.`, 'system');
  
  return newState;
}

// Add log entry
function addLogEntry(state: GameState, message: string, type: LogEntry['type']): void {
  state.gameLog.push({
    turn: state.turn,
    phase: state.phase,
    message,
    type,
    timestamp: Date.now()
  });
}

// Check if game is over
export function checkGameOver(state: GameState): { gameOver: boolean; winner: 'player' | 'ai' | 'draw' | null } {
  const playerUnits = state.units.filter((_, i) => i < state.units.length / 2);
  const aiUnits = state.units.filter((_, i) => i >= state.units.length / 2);
  
  const playerAlive = playerUnits.some(u => u.alive);
  const aiAlive = aiUnits.some(u => u.alive);
  
  if (!playerAlive && !aiAlive) {
    return { gameOver: true, winner: 'draw' };
  }
  
  if (!playerAlive) {
    return { gameOver: true, winner: 'ai' };
  }
  
  if (!aiAlive) {
    return { gameOver: true, winner: 'player' };
  }
  
  return { gameOver: false, winner: null };
}

// AI Turn - Simple AI
export function executeAITurn(state: GameState): GameState {
  let newState = { ...state };
  const aiUnits = newState.units.filter((_, i) => i >= newState.units.length / 2 && _.alive);
  const playerUnits = newState.units.filter((_, i) => i < newState.units.length / 2 && _.alive);
  
  if (aiUnits.length === 0 || playerUnits.length === 0) return newState;
  
  for (const aiUnit of aiUnits) {
    let nearestEnemy: Unit | null = null;
    let nearestDistance = Infinity;
    
    for (const playerUnit of playerUnits) {
      if (playerUnit.position && aiUnit.position) {
        const dist = hexDistance(aiUnit.position, playerUnit.position);
        if (dist < nearestDistance) {
          nearestDistance = dist;
          nearestEnemy = playerUnit;
        }
      }
    }
    
    if (nearestEnemy && nearestEnemy.position) {
      newState = selectUnit(newState, aiUnit);
      
      let bestHex: HexCoord | null = null;
      let bestDistance = nearestDistance;
      
      for (const hex of newState.validMoveHexes) {
        const dist = hexDistance(hex, nearestEnemy.position!);
        if (dist < bestDistance) {
          bestDistance = dist;
          bestHex = hex;
        }
      }
      
      if (bestHex) {
        const mode = aiUnit.runningMP > aiUnit.walkingMP ? MovementMode.RUNNING : MovementMode.WALKING;
        newState = moveSelectedUnit(newState, bestHex, mode);
      }
      
      const updatedAIUnit = newState.units.find(u => u.id === aiUnit.id);
      if (updatedAIUnit && nearestEnemy.alive) {
        newState = selectUnit(newState, updatedAIUnit);
        newState = selectTarget(newState, nearestEnemy);
        newState = fireAllWeapons(newState);
      }
    }
  }
  
  return newState;
}
