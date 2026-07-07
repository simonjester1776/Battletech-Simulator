// BattleTech Game Engine - Main Game State Manager

import type { GameState, Unit, HexCoord, Hex, LogEntry } from '@/types/battletech';
import { GamePhase, MovementMode } from '@/types/battletech';
import { createHexGrid, getHex, setHex, getValidMovementHexes, moveUnit, TERRAIN_TYPES, hasLineOfSight } from './hexgrid';
import { getValidTargetHexes, resolveAttack, resolveHeatPhase, hexDistance, getRangeModifier, getTerrainModifier } from './combat';
import { executePunch, executeKick, executeDFA } from './advanced-combat';
import { roll2d6 } from './dice';
import { cloneUnit } from './units';
import { ObjectiveType, ObjectiveStatus, type MissionObjective } from '@/lib/mission-objectives';

// Initialize a new game
export function initializeGame(playerUnits: Unit[], aiUnits: Unit[], objectives: MissionObjective[] = []): GameState {
  const grid = createHexGrid(10);
  
  // Clone units once and position them
  const clonedPlayerUnits = playerUnits.map(cloneUnit);
  const clonedAiUnits = aiUnits.map(cloneUnit);
  
  // Position player units on one side
  clonedPlayerUnits.forEach((unit, index) => {
    unit.position = { q: -5 + index * 2, r: 5, s: -(-5 + index * 2) - 5 };
    unit.facing = 0;
    unit.torsoFacing = unit.facing;
    unit.torsoTwistsThisTurn = 0;
    unit.maxTorsoTwists = unit.maxTorsoTwists ?? 1;
    unit.amsActive = unit.hasAMS ? (unit.amsActive ?? true) : false;
    unit.amsHeat = unit.amsHeat ?? 0;
    if (unit.hasAMS && unit.amsAmmo === undefined) {
      unit.amsAmmo = 10;
    }
    
    const hex = getHex(grid, unit.position);
    if (hex) {
      hex.unit = unit;
      setHex(grid, hex);
    }
  });
  
  // Position AI units on the other side
  clonedAiUnits.forEach((unit, index) => {
    unit.position = { q: 5 - index * 2, r: -5, s: -(5 - index * 2) - (-5) };
    unit.facing = 3;
    unit.torsoFacing = unit.facing;
    unit.torsoTwistsThisTurn = 0;
    unit.maxTorsoTwists = unit.maxTorsoTwists ?? 1;
    unit.amsActive = unit.hasAMS ? (unit.amsActive ?? true) : false;
    unit.amsHeat = unit.amsHeat ?? 0;
    if (unit.hasAMS && unit.amsAmmo === undefined) {
      unit.amsAmmo = 10;
    }
    
    const hex = getHex(grid, unit.position);
    if (hex) {
      hex.unit = unit;
      setHex(grid, hex);
    }
  });
  
  const allUnits = [...clonedPlayerUnits, ...clonedAiUnits];
  
  const initializedObjectives = objectives.map((objective) => {
    const clonedObjective = { ...objective };
    if (clonedObjective.type === ObjectiveType.ELIMINATE_ALL) {
      clonedObjective.progressMax = clonedObjective.progressMax > 0 ? clonedObjective.progressMax : clonedAiUnits.length;
    }
    if (clonedObjective.type === ObjectiveType.SURVIVE || clonedObjective.type === ObjectiveType.DEFEND_STRUCTURE) {
      if (clonedObjective.turnLimit !== undefined && clonedObjective.turnsRemaining === undefined) {
        clonedObjective.turnsRemaining = clonedObjective.turnLimit;
      }
    }
    return clonedObjective;
  });
  
  return {
    turn: 1,
    phase: GamePhase.INITIATIVE,
    units: allUnits,
    hexGrid: grid,
    selectedUnit: null,
    targetUnit: null,
    validMoveHexes: [],
    validTargetHexes: [],
    objectives: initializedObjectives,
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

  if (unit && state.phase === GamePhase.COMBAT && unit.alive && !unit.shutdown) {
    newState.validTargetHexes = getValidTargetHexes(unit, state.hexGrid, state.units);
  } else {
    newState.validTargetHexes = [];
  }

  newState.targetUnit = null;
  
  return newState;
}

// Move selected unit
export function moveSelectedUnit(
  state: GameState, 
  toCoord: HexCoord, 
  movementMode: MovementMode
): GameState {
  if (state.phase !== GamePhase.MOVEMENT) return state;
  if (!state.selectedUnit || !state.selectedUnit.position) return state;
  
  const newState = { ...state };
  const unit = newState.units.find(u => u.id === state.selectedUnit!.id);
  if (!unit) return state;
  
  const oldHex = getHex(newState.hexGrid, unit.position!);
  const result = moveUnit(unit, toCoord, newState.hexGrid, movementMode);
  
  if (result.success) {
    if (oldHex) {
      oldHex.unit = null;
      setHex(newState.hexGrid, oldHex);
    }
    
    const newHex = getHex(newState.hexGrid, toCoord);
    if (newHex) {
      newHex.unit = unit;
      setHex(newState.hexGrid, newHex);
    }
    
    addLogEntry(newState, `${unit.name} ${result.message}`, 'movement');
    
    newState.validMoveHexes = getValidMovementHexes(unit, newState.hexGrid, newState.units);
  } else {
    if (oldHex) {
      oldHex.unit = unit;
      setHex(newState.hexGrid, oldHex);
    }
    addLogEntry(newState, `${unit.name} failed to move: ${result.message}`, 'info');
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
  if (state.phase !== GamePhase.COMBAT) return state;
  if (!state.selectedUnit || !state.targetUnit) return state;
  
  const newState = { ...state };
  const attacker = newState.units.find(u => u.id === state.selectedUnit!.id);
  const target = newState.units.find(u => u.id === state.targetUnit!.id);
  
  if (!attacker || !target || !attacker.position || !target.position) return state;
  
  if (attacker.shutdown || attacker.heat >= 30) {
    addLogEntry(newState, `${attacker.name} is overheated/shutdown and cannot fire.`, 'info');
    return newState;
  }

  const weapon = attacker.weapons.find(w => w.id === weaponId);
  if (!weapon) return state;
  
  const distance = hexDistance(attacker.position, target.position);
  const attackerHex = getHex(newState.hexGrid, attacker.position);
  const targetHex = getHex(newState.hexGrid, target.position);
  const terrainModifier = getTerrainModifier(targetHex);
  
  if (!hasLineOfSight(attacker.position, target.position, newState.hexGrid)) {
    addLogEntry(newState, `${attacker.name} cannot fire at ${target.name}: line of sight is blocked.`, 'info');
    return newState;
  }

  const result = resolveAttack(attacker, target, weapon, distance, terrainModifier, attackerHex, targetHex);
  
  if (result.fired !== false) {
    attacker.heat += weapon.heat;
    if (attacker.heat >= 30) {
      attacker.shutdown = true;
      addLogEntry(newState, `${attacker.name} overheats to ${attacker.heat} heat and shuts down!`, 'heat');
    }
  }
  
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
  if (state.phase !== GamePhase.COMBAT) return state;
  if (!state.selectedUnit || !state.targetUnit) return state;
  
  const attacker = state.units.find(u => u.id === state.selectedUnit!.id);
  const target = state.units.find(u => u.id === state.targetUnit!.id);
  if (!attacker || !target) return state;
  
  let newState = { ...state };

  if (attacker.shutdown || attacker.heat >= 30) {
    addLogEntry(newState, `${attacker.name} cannot fire while shutdown or overheated.`, 'info');
    return newState;
  }
  
  const rangeFilteredWeapons = attacker.weapons
    .filter(weapon => weapon.damage > 0 && (weapon.shotsRemaining > 0 || weapon.shotsRemaining === 999 || weapon.shotsRemaining === Infinity))
    .filter(weapon => getRangeModifier(weapon, hexDistance(attacker.position!, target.position!)) !== -1);
  
  for (const weapon of rangeFilteredWeapons) {
    const updatedAttacker = newState.units.find(u => u.id === attacker.id);
    const updatedTarget = newState.units.find(u => u.id === target.id);
    if (!updatedAttacker || !updatedTarget || !updatedAttacker.alive || !updatedTarget.alive) break;

    const beforeHeat = updatedAttacker.heat;
    newState = fireWeapon(newState, weapon.id);

    const refAttacker = newState.units.find(u => u.id === attacker.id);
    const refTarget = newState.units.find(u => u.id === target.id);
    if (!refAttacker || !refAttacker.alive) break;
    if (!refTarget || !refTarget.alive) break;
    if (refAttacker.shutdown || refAttacker.heat >= 30) break;
    if (refAttacker.heat === beforeHeat) {
      continue;
    }
  }
  
  return newState;
}

// Execute punch attack
export function executePunchAttack(state: GameState): GameState {
  if (state.phase !== GamePhase.COMBAT) return state;
  if (!state.selectedUnit || !state.targetUnit) return state;
  
  const newState = { ...state };
  const attacker = newState.units.find(u => u.id === state.selectedUnit!.id);
  const target = newState.units.find(u => u.id === state.targetUnit!.id);
  
  if (!attacker || !target || !attacker.position || !target.position) return state;
  
  const result = executePunch(attacker, target);
  
  addLogEntry(newState, result.log, result.success ? 'combat' : 'info');
  
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

// Execute kick attack
export function executeKickAttack(state: GameState): GameState {
  if (state.phase !== GamePhase.COMBAT) return state;
  if (!state.selectedUnit || !state.targetUnit) return state;
  
  const newState = { ...state };
  const attacker = newState.units.find(u => u.id === state.selectedUnit!.id);
  const target = newState.units.find(u => u.id === state.targetUnit!.id);
  
  if (!attacker || !target || !attacker.position || !target.position) return state;
  
  const result = executeKick(attacker, target);
  
  addLogEntry(newState, result.log, result.success ? 'combat' : 'info');
  
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

// Execute DFA attack
export function executeDFAAttack(state: GameState): GameState {
  if (state.phase !== GamePhase.COMBAT) return state;
  if (!state.selectedUnit || !state.targetUnit) return state;
  
  const newState = { ...state };
  const attacker = newState.units.find(u => u.id === state.selectedUnit!.id);
  const target = newState.units.find(u => u.id === state.targetUnit!.id);
  
  if (!attacker || !target || !attacker.position || !target.position) return state;
  
  const result = executeDFA(attacker, target);
  
  addLogEntry(newState, result.log, result.success ? 'combat' : 'info');
  
  // Handle attacker damage from DFA
  if (result.attackerDamage && result.attackerDamage > 0) {
    addLogEntry(newState, `${attacker.name} takes ${result.attackerDamage} damage from DFA fall!`, 'critical');
  }
  
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
  
  if (!attacker.alive) {
    addLogEntry(newState, `${attacker.name} DESTROYED by DFA fall!`, 'critical');
    
    const attackerIndex = newState.units.indexOf(attacker);
    const isPlayerUnit = attackerIndex < newState.units.length / 2;
    
    if (isPlayerUnit) {
      newState.aiScore += attacker.bv2;
    } else {
      newState.playerScore += attacker.bv2;
    }
    
    const attackerHex = getHex(newState.hexGrid, attacker.position);
    if (attackerHex) {
      attackerHex.unit = null;
      setHex(newState.hexGrid, attackerHex);
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

      if (unit.shutdown && unit.alive && unit.heat < 15) {
        unit.shutdown = false;
        addLogEntry(newState, `${unit.name} cools down and recovers from shutdown.`, 'system');
      }
    }
  });
  
  return newState;
}

export function evaluateMissionObjective(
  state: GameState,
  mutateState: boolean = true
): { gameOver: boolean; winner: 'player' | 'ai' | 'draw' | null } {
  if (!state.objectives || state.objectives.length === 0) {
    return { gameOver: false, winner: null };
  }

  const objectives = mutateState
    ? state.objectives
    : state.objectives.map((objective) => ({ ...objective }));

  const playerUnits = state.units.filter((_, i) => i < state.units.length / 2);
  const enemyUnits = state.units.filter((_, i) => i >= state.units.length / 2);
  let allRequiredComplete = true;
  let anyRequiredFailed = false;

  objectives.forEach((objective) => {
    if (objective.status === ObjectiveStatus.FAILED && objective.required) {
      anyRequiredFailed = true;
    }
    if (objective.status !== ObjectiveStatus.COMPLETED && objective.required) {
      allRequiredComplete = false;
    }

    if (objective.status === ObjectiveStatus.PENDING || objective.status === ObjectiveStatus.IN_PROGRESS) {
      switch (objective.type) {
        case ObjectiveType.ELIMINATE_ALL: {
          const totalEnemies =
            objective.progressMax > 0 && objective.progressMax <= enemyUnits.length
              ? objective.progressMax
              : enemyUnits.length;

          if (enemyUnits.filter((u) => u.alive).length === 0) {
            objective.status = ObjectiveStatus.COMPLETED;
            objective.progress = 100;
          } else {
            objective.status = ObjectiveStatus.IN_PROGRESS;
            objective.progress = totalEnemies > 0
              ? Math.floor(((totalEnemies - enemyUnits.filter((u) => u.alive).length) / totalEnemies) * 100)
              : 0;
          }
          break;
        }

        case ObjectiveType.ASSASSINATION:
        case ObjectiveType.DESTROY_TARGET: {
          if (objective.targetUnitId) {
            const target = enemyUnits.find((u) => u.id === objective.targetUnitId);
            if (!target || !target.alive) {
              objective.status = ObjectiveStatus.COMPLETED;
              objective.progress = 100;
            } else {
              objective.status = ObjectiveStatus.IN_PROGRESS;
            }
          }
          break;
        }

        case ObjectiveType.SURVIVE: {
          if (playerUnits.filter((u) => u.alive).length === 0) {
            objective.status = ObjectiveStatus.FAILED;
            objective.progress = 0;
          } else if (objective.turnLimit !== undefined && state.turn >= objective.turnLimit) {
            objective.status = ObjectiveStatus.COMPLETED;
            objective.progress = 100;
          } else if (objective.turnLimit !== undefined) {
            objective.status = ObjectiveStatus.IN_PROGRESS;
            objective.progress = Math.min(100, Math.floor((state.turn / objective.turnLimit) * 100));
          }
          break;
        }

        case ObjectiveType.CAPTURE_ZONE: {
          const targetZone = objective.targetZone;
          const zoneRadius = objective.zoneRadius;
          if (targetZone && zoneRadius !== undefined) {
            const unitsInZone = playerUnits.filter((unit) => {
              if (!unit.position) return false;
              const pathCost = Math.max(
                Math.abs(unit.position.q - targetZone.q),
                Math.abs(unit.position.r - targetZone.r),
                Math.abs(unit.position.s - targetZone.s)
              );
              return pathCost <= zoneRadius;
            });
            if (unitsInZone.length > 0) {
              objective.status = ObjectiveStatus.COMPLETED;
              objective.progress = 100;
            } else {
              objective.status = ObjectiveStatus.IN_PROGRESS;
            }
          }
          break;
        }

        case ObjectiveType.ESCORT_UNIT: {
          if (objective.escortUnitId && objective.extractionPoint) {
            const escortUnit = playerUnits.find((u) => u.id === objective.escortUnitId);
            if (!escortUnit || !escortUnit.alive) {
              objective.status = ObjectiveStatus.FAILED;
              objective.progress = 0;
            } else if (escortUnit.position) {
              const distance = Math.max(
                Math.abs(escortUnit.position.q - objective.extractionPoint.q),
                Math.abs(escortUnit.position.r - objective.extractionPoint.r),
                Math.abs(escortUnit.position.s - objective.extractionPoint.s)
              );
              if (distance === 0) {
                objective.status = ObjectiveStatus.COMPLETED;
                objective.progress = 100;
              } else {
                objective.status = ObjectiveStatus.IN_PROGRESS;
              }
            }
          }
          break;
        }

        case ObjectiveType.DEFEND_STRUCTURE: {
          if (objective.turnLimit && objective.turnsRemaining !== undefined) {
            objective.turnsRemaining = objective.turnLimit - state.turn;
            if (objective.turnsRemaining <= 0) {
              objective.status = ObjectiveStatus.COMPLETED;
              objective.progress = 100;
              break;
            }
          }
          objective.status = ObjectiveStatus.IN_PROGRESS;
          objective.progress = objective.turnLimit
            ? Math.min(100, Math.floor((state.turn / objective.turnLimit) * 100))
            : objective.progress;
          break;
        }
      }
    }
  });

  if (anyRequiredFailed) {
    return { gameOver: true, winner: 'ai' };
  }

  if (allRequiredComplete) {
    return { gameOver: true, winner: 'player' };
  }

  return { gameOver: false, winner: null };
}

// End heat phase and start new turn
export function endHeatPhase(state: GameState): GameState {
  let newState = resolveHeatPhaseForAll(state);
  newState.turn++;
  newState.phase = GamePhase.INITIATIVE;
  
  newState.units.forEach(unit => {
    if (unit.alive) {
      unit.movementMode = MovementMode.STANDING;
      unit.currentMP = unit.walkingMP;
      // reset torso twist usage each turn
      unit.torsoTwistsThisTurn = 0;
    }
  });

  addLogEntry(newState, `Turn ${newState.turn} begins.`, 'system');
  
  const objectiveResult = evaluateMissionObjective(newState);
  if (objectiveResult.gameOver) {
    newState.phase = GamePhase.END;
    addLogEntry(newState, objectiveResult.winner === 'player' ? 'Mission objectives complete!' : 'A required mission objective failed.', objectiveResult.winner === 'player' ? 'system' : 'critical');
  }
  
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
  const objectiveResult = evaluateMissionObjective(state, false);
  if (objectiveResult.gameOver) {
    return objectiveResult;
  }

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

// AI Turn - Movement and combat AI
function getBestAIWeaponTarget(aiUnit: Unit, enemies: Unit[], grid: Map<string, Hex>): Unit | null {
  if (!aiUnit.position) return null;

  let bestTarget: Unit | null = null;
  let bestScore = -Infinity;

  for (const enemy of enemies) {
    if (!enemy.position) continue;
    if (!hasLineOfSight(aiUnit.position, enemy.position, grid)) continue;

    const distance = hexDistance(aiUnit.position, enemy.position);
    const weaponsInRange = aiUnit.weapons.filter(
      weapon => getRangeModifier(weapon, distance) !== -1 && (weapon.shotsRemaining > 0 || weapon.shotsRemaining === 999 || weapon.shotsRemaining === Infinity)
    );

    if (weaponsInRange.length === 0) continue;

    const targetHex = getHex(grid, enemy.position);
    const coverPenalty = targetHex ? TERRAIN_TYPES[targetHex.terrain].toHitModifier * 5 : 0;
    const totalArmor = Array.from(enemy.locations.values()).reduce((sum, loc) => sum + loc.armor, 0);
    const totalStructure = Array.from(enemy.locations.values()).reduce((sum, loc) => sum + loc.structure, 0);
    const totalHealth = totalArmor + totalStructure;
    const potentialDamage = weaponsInRange.reduce((sum, weapon) => sum + weapon.damage, 0);
    const hitEfficiency = weaponsInRange.reduce((sum, weapon) => sum + weapon.damage / Math.max(1, weapon.heat), 0);
    const amsPenalty = enemy.hasAMS ?  -Math.max(12, Math.floor(potentialDamage * 0.6)) : 0;
    const pilotPenalty = enemy.pilot.hits * 6;
    const distancePenalty = Math.abs(distance - 3) * 8;
    const overheatBonus = enemy.heat >= 18 ? 12 : 0;
    const valueBonus = enemy.bv2 * 0.04;
    const structureThreat = enemy.pilot.hits > 0 ? 10 : 0;

    const score =
      hitEfficiency * 2.2 +
      potentialDamage * 0.7 +
      valueBonus -
      totalHealth * 0.22 -
      coverPenalty -
      pilotPenalty -
      distancePenalty +
      overheatBonus +
      structureThreat;

    // Apply AMS penalty (deprioritize missile-heavy targets)
    const finalScore = score + amsPenalty;

    if (finalScore > bestScore) {
      bestScore = finalScore;
      bestTarget = enemy;
    }
  }

  return bestTarget;
}

function getBestMovementHex(aiUnit: Unit, enemy: Unit, validHexes: HexCoord[], grid: Map<string, Hex>): HexCoord | null {
  let bestHex: HexCoord | null = null;
  let bestScore = -Infinity;
  const preferredRange = Math.min(6, Math.max(...aiUnit.weapons.map(w => w.shortRange)));

  for (const hex of validHexes) {
    const dist = hexDistance(hex, enemy.position!);
    const canShootFromHex = aiUnit.weapons.some(weapon => getRangeModifier(weapon, dist) !== -1);
    const terrainHex = getHex(grid, hex);
    const targetHex = getHex(grid, enemy.position!);
    const coverBonus = terrainHex && TERRAIN_TYPES[terrainHex.terrain].coverProvided ? 18 : 0;
    const losBonus = hasLineOfSight(hex, enemy.position!, grid) ? 20 : -20;
    const rangeScore = canShootFromHex ? 50 - Math.abs(dist - preferredRange) * 8 : -dist * 6;
    const threatPenalty = enemy.weapons.some(weapon => getRangeModifier(weapon, dist) !== -1) ? -10 : 0;
    const heatPenalty = aiUnit.heat > 12 ? -(aiUnit.heat - 12) * 3 : 0;
    const spaceBonus = dist <= 1 ? -15 : dist <= 2 ? -6 : 0;
    const coverDefense = targetHex ? (TERRAIN_TYPES[targetHex.terrain].toHitModifier * 4) : 0;
    const score = coverBonus + losBonus + rangeScore + heatPenalty + spaceBonus - threatPenalty - coverDefense;

    if (score > bestScore) {
      bestScore = score;
      bestHex = hex;
    }
  }

  return bestHex;
}

function chooseAIMovementMode(unit: Unit, targetDistance: number): MovementMode {
  if (unit.heat >= 18 || unit.currentMP <= 1) return MovementMode.WALKING;
  if (unit.heat >= 12) return MovementMode.WALKING;
  if (unit.jumpingMP > 0 && targetDistance >= 5 && unit.currentMP >= 2) return MovementMode.JUMPING;
  if (unit.runningMP > unit.walkingMP && unit.currentMP > 2 && targetDistance > 2) return MovementMode.RUNNING;
  return MovementMode.WALKING;
}

// AI helper: consider twisting torso toward target if beneficial
function aiConsiderTorsoTwist(state: GameState, aiUnit: Unit, target: Unit): GameState {
  if (!aiUnit.position || !target.position) return state;
  const newState = { ...state };
  const unit = newState.units.find(u => u.id === aiUnit.id);
  if (!unit) return state;
  if ((unit.torsoTwistsThisTurn ?? 0) >= (unit.maxTorsoTwists ?? 1)) return newState;
  if (unit.currentMP <= 0) return newState;

  if (!unit.position) return newState;
  const dx = target.position.q - unit.position.q;
  const dy = target.position.r - unit.position.r;
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  const desiredFacing = Math.round(angle / 60) % 6;
  const currentTorso = typeof unit.torsoFacing === 'number' ? unit.torsoFacing : unit.facing;
  // compute minimal steps (clockwise positive)
  const diff = ((desiredFacing - currentTorso + 6) % 6);
  const stepsCW = diff <= 3 ? diff : diff - 6; // -3..3
  if (stepsCW === 0) return newState;

  // Simple heuristic: twist if target is not roughly in torso's facing and we have twists/MP
  const stepsToApply = Math.abs(stepsCW);
  if (stepsToApply <= 0) return newState;

  // Determine nearby enemy exposure before/after twist
  const ownIndex = newState.units.findIndex(u => u.id === unit.id);
  const isAI = ownIndex >= newState.units.length / 2;
  const enemies = newState.units.filter((u, i) => u.alive && u.position && u.id !== unit.id && (isAI ? i < newState.units.length / 2 : i >= newState.units.length / 2));

  const withinRange = (e: Unit) => {
    if (!e.position || !unit.position) return false;
    return hexDistance(unit.position, e.position) <= 8; // consider threats within 8 hexes
  };

  const isFrontFor = (facingRef: number, e: Unit) => {
    if (!e.position || !unit.position) return false;
    const dx2 = e.position.q - unit.position.q;
    const dy2 = e.position.r - unit.position.r;
    const a = Math.atan2(dy2, dx2) * (180 / Math.PI);
    const rel = (a - facingRef * 60 + 360) % 360;
    return rel >= 300 || rel <= 60;
  };

  const countFrontBefore = enemies.filter(e => withinRange(e) && isFrontFor(currentTorso, e)).length;
  const countFrontAfter = enemies.filter(e => withinRange(e) && isFrontFor(desiredFacing, e)).length;

  // Avoid twisting if it increases frontal exposure for high-value units
  const bvThreshold = 300;
  if (countFrontAfter > countFrontBefore && (unit.bv2 ?? 0) > bvThreshold) {
    return newState; // skip twist to avoid exposing valuable unit
  }

  if ((unit.torsoTwistsThisTurn ?? 0) + stepsToApply <= (unit.maxTorsoTwists ?? 1) && unit.currentMP > 0) {
    return performTorsoTwist(newState, unit.id, stepsCW);
  }

  return newState;
}

function fireBestAIWeapons(state: GameState, attacker: Unit, target: Unit): GameState {
  if (!attacker.position || !target.position) return state;

  let newState = state;
  const distance = hexDistance(attacker.position, target.position);
  const weapons = attacker.weapons
    .filter(weapon => weapon.damage > 0 && (weapon.shotsRemaining > 0 || weapon.shotsRemaining === 999 || weapon.shotsRemaining === Infinity) && getRangeModifier(weapon, distance) !== -1)
    .sort((a, b) => {
      const missilePenaltyA = (a.type === 'missile' && target.hasAMS) ? ((target.amsRating ?? 2) * 1.5) : 0;
      const missilePenaltyB = (b.type === 'missile' && target.hasAMS) ? ((target.amsRating ?? 2) * 1.5) : 0;
      const aValue = a.damage / Math.max(1, a.heat) + (a.heat <= 3 ? 2 : 0) + (a.type === 'missile' ? 1.5 : 0) - missilePenaltyA;
      const bValue = b.damage / Math.max(1, b.heat) + (b.heat <= 3 ? 2 : 0) + (b.type === 'missile' ? 1.5 : 0) - missilePenaltyB;
      return bValue - aValue || b.damage - a.damage;
    });

  for (const weapon of weapons) {
    const currentAttacker = newState.units.find(u => u.id === attacker.id);
    if (!currentAttacker || currentAttacker.shutdown || currentAttacker.heat >= 30) break;
    if (currentAttacker.heat + weapon.heat >= 30) continue;

    newState = fireWeapon(newState, weapon.id);

    const refAttacker = newState.units.find(u => u.id === attacker.id);
    const refTarget = newState.units.find(u => u.id === target.id);
    if (!refAttacker || !refAttacker.alive) break;
    if (!refTarget || !refTarget.alive) break;
    if (refAttacker.shutdown || refAttacker.heat >= 30) break;
  }

  return newState;
}

export function executeAITurn(state: GameState): GameState {
  let newState = { ...state };
  const aiUnits = newState.units.filter((_, i) => i >= newState.units.length / 2 && _.alive && !_.shutdown && !_.immobile);
  const playerUnits = newState.units.filter((_, i) => i < newState.units.length / 2 && _.alive);

  if (aiUnits.length === 0 || playerUnits.length === 0) return newState;

  if (newState.phase === GamePhase.MOVEMENT) {
    for (const aiUnit of aiUnits) {
      if (!aiUnit.position || aiUnit.currentMP <= 0) continue;

      let nearestEnemy: Unit | null = null;
      let nearestDistance = Infinity;

      for (const playerUnit of playerUnits) {
        if (playerUnit.position) {
          const dist = hexDistance(aiUnit.position, playerUnit.position);
          if (dist < nearestDistance) {
            nearestDistance = dist;
            nearestEnemy = playerUnit;
          }
        }
      }

      if (!nearestEnemy || !nearestEnemy.position) continue;

      newState = selectUnit(newState, aiUnit);
      if (newState.validMoveHexes.length === 0) continue;

      const bestTarget = getBestAIWeaponTarget(aiUnit, playerUnits, newState.hexGrid) || nearestEnemy;
      const targetDistance = bestTarget.position ? hexDistance(aiUnit.position, bestTarget.position) : nearestDistance;
      const movementMode = chooseAIMovementMode(aiUnit, targetDistance);
      const bestHex = getBestMovementHex(aiUnit, bestTarget, newState.validMoveHexes, newState.hexGrid);

      if (bestHex) {
        newState = moveSelectedUnit(newState, bestHex, movementMode);
        addLogEntry(newState, `${aiUnit.name} advances toward ${bestTarget.name}`, 'system');
      }
    }
  }

  if (newState.phase === GamePhase.MOVEMENT || newState.phase === GamePhase.COMBAT) {
    newState.phase = GamePhase.COMBAT;

    for (const aiUnit of aiUnits) {
      if (!aiUnit.position) continue;

      const target = getBestAIWeaponTarget(aiUnit, playerUnits, newState.hexGrid);
      if (!target) continue;

      newState = selectUnit(newState, aiUnit);
      newState = selectTarget(newState, target);
      // AI may consider torso-twisting to better face the target
      newState = aiConsiderTorsoTwist(newState, aiUnit, target);
      newState = fireBestAIWeapons(newState, aiUnit, target);
      addLogEntry(newState, `${aiUnit.name} engages ${target.name}`, 'system');
    }
  }

  return newState;
}

export function toggleAMSActive(state: GameState, unitId: string): GameState {
  const newState: GameState = { ...state };
  const unit = newState.units.find(u => u.id === unitId);
  if (!unit || !unit.hasAMS || !unit.alive || unit.shutdown) return state;

  unit.amsActive = !unit.amsActive;
  addLogEntry(newState, `${unit.name} ${unit.amsActive ? 'activates' : 'deactivates'} AMS.`, 'system');
  return newState;
}

// Perform a torso twist action for a unit (steps = positive clockwise steps, negative counter-clockwise)
export function performTorsoTwist(state: GameState, unitId: string, steps: number): GameState {
  const newState: GameState = { ...state };
  const unit = newState.units.find(u => u.id === unitId);
  if (!unit) return state;
  if (!unit.alive || unit.shutdown) return state;

  const maxTwists = unit.maxTorsoTwists ?? 1;
  const usedTwists = unit.torsoTwistsThisTurn ?? 0;
  const remainingTwists = Math.max(0, maxTwists - usedTwists);
  const requested = Math.abs(Math.floor(steps));
  if (requested <= 0 || remainingTwists <= 0) {
    addLogEntry(newState, `${unit.name} cannot torso-twist (no twists remaining).`, 'system');
    return newState;
  }

  const actualSteps = Math.min(requested, remainingTwists);
  const dir = steps < 0 ? -1 : 1;
  const applied = dir * actualSteps;

  // Require at least 1 MP to perform the twist
  if (unit.currentMP <= 0) {
    addLogEntry(newState, `${unit.name} lacks movement points to torso-twist.`, 'system');
    return newState;
  }

  unit.torsoFacing = ((typeof unit.torsoFacing === 'number' ? unit.torsoFacing : unit.facing) + applied + 6) % 6;
  unit.torsoTwistsThisTurn = (unit.torsoTwistsThisTurn ?? 0) + actualSteps;
  unit.currentMP = Math.max(0, unit.currentMP - 1);

  addLogEntry(newState, `${unit.name} torso-twists ${applied > 0 ? `${applied} clockwise` : `${-applied} counter-clockwise`} (now torsoFacing=${unit.torsoFacing}).`, 'movement');

  return newState;
}
