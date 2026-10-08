import { describe, expect, it } from 'vitest';
import { GamePhase, MovementMode, TerrainType } from '@/types/battletech';
import { checkGameOver, evaluateMissionObjective, executeAITurn, executePunchAttack, getAIHitProbability, initializeGame, rollInitiative, selectUnit } from './game';
import { cloneUnit, getAllUnits } from './units';
import { createHexGrid, getHex, moveUnit } from './hexgrid';
import { generateAssassinationMission, generateCaptureMission, generateEscortMission, ObjectiveStatus } from '@/lib/mission-objectives';

describe('battle turn flow', () => {
  it('blocks unit selection until initiative is rolled', () => {
    const units = getAllUnits();
    const playerUnit = units[0];
    const enemyUnit = units[1];

    const state = initializeGame([playerUnit], [enemyUnit]);

    expect(state.phase).toBe(GamePhase.INITIATIVE);
    expect(selectUnit(state, playerUnit).selectedUnit).toBeNull();
  });

  it('starts movement with walking mode after initiative is rolled', () => {
    const units = getAllUnits();
    const playerUnit = units[0];
    const enemyUnit = units[1];

    const initialState = initializeGame([playerUnit], [enemyUnit]);
    const { state } = rollInitiative(initialState);
    const player = state.units[0];

    expect(state.phase).toBe(GamePhase.MOVEMENT);
    expect(player.movementMode).toBe('walking');
    expect(player.currentMP).toBe(player.walkingMP);
    expect(selectUnit(state, player).validMoveHexes.length).toBeGreaterThan(0);
  });

  it('remaps mission unit references when initializing cloned units', () => {
    const units = getAllUnits();
    const playerUnit = units[0];
    const enemyUnit = units[1];
    const objectives = [
      generateEscortMission(playerUnit.id, playerUnit.name, { q: 0, r: 0, s: 0 }),
      generateAssassinationMission(enemyUnit.name, enemyUnit.id),
    ];

    const state = initializeGame([playerUnit], [enemyUnit], objectives);
    const initializedObjectives = state.objectives ?? [];

    expect(initializedObjectives[0].escortUnitId).toBe(state.units[0].id);
    expect(initializedObjectives[1].targetUnitId).toBe(state.units[1].id);
    expect(checkGameOver(state).gameOver).toBe(false);
  });

  it('scores AI shots using the exact 2d6 hit probability curve', () => {
    expect(getAIHitProbability(2)).toBe(1);
    expect(getAIHitProbability(7)).toBe(21 / 36);
    expect(getAIHitProbability(12)).toBe(1 / 36);
    expect(getAIHitProbability(13)).toBe(0);
  });

  it('runs the enemy turn at every supported difficulty', () => {
    const units = getAllUnits();

    for (const difficulty of ['easy', 'normal', 'hard'] as const) {
      const initialState = initializeGame([units[0]], [units[1]]);
      const { state: movementState } = rollInitiative(initialState);

      expect(executeAITurn(movementState, difficulty).phase).toBe(GamePhase.COMBAT);
    }
  });

  it('tracks Capture progress once per turn and fails when its deadline expires', () => {
    const units = getAllUnits();
    const captureZone = { q: -5, r: 5, s: 0 };
    const holdingState = initializeGame(
      [units[0]],
      [units[1]],
      [generateCaptureMission(captureZone, 0)]
    );
    holdingState.phase = GamePhase.COMBAT;

    evaluateMissionObjective(holdingState);
    evaluateMissionObjective(holdingState);
    expect(holdingState.objectives?.[0].progress).toBe(33);

    holdingState.turn = 2;
    evaluateMissionObjective(holdingState);
    expect(holdingState.objectives?.[0].progress).toBe(66);
    holdingState.turn = 3;
    expect(evaluateMissionObjective(holdingState)).toEqual({ gameOver: true, winner: 'player' });
    expect(holdingState.objectives?.[0].status).toBe(ObjectiveStatus.COMPLETED);

    const failingState = initializeGame(
      [units[0]],
      [units[1]],
      [generateCaptureMission({ q: 0, r: 0, s: 0 }, 0)]
    );
    failingState.phase = GamePhase.COMBAT;
    failingState.turn = 8;
    expect(evaluateMissionObjective(failingState)).toEqual({ gameOver: true, winner: 'ai' });
    expect(failingState.objectives?.[0].status).toBe(ObjectiveStatus.FAILED);
  });

  it('updates Escort distance and Assassination damage progress live', () => {
    const units = getAllUnits();
    const objectives = [
      generateEscortMission(units[0].id, units[0].name, { q: 0, r: 0, s: 0 }),
      generateAssassinationMission(units[1].name, units[1].id),
    ];
    const state = initializeGame([units[0]], [units[1]], objectives);

    evaluateMissionObjective(state);
    const initialEscortProgress = state.objectives?.[0].progress ?? 0;
    const enemy = state.units[1];
    const location = enemy.locations.values().next().value;
    if (location) location.armor = Math.max(0, location.armor - 10);
    evaluateMissionObjective(state);
    const damagedTargetProgress = state.objectives?.[1].progress ?? 0;

    state.units[0].position = { q: -2, r: 2, s: 0 };
    evaluateMissionObjective(state);

    expect(damagedTargetProgress).toBeGreaterThan(0);
    expect(state.objectives?.[0].progress).toBeGreaterThan(initialEscortProgress);
  });

  it('charges the full path cost for a multi-hex movement', () => {
    const unit = cloneUnit(getAllUnits()[0]);
    const grid = createHexGrid(4);
    grid.forEach(hex => {
      hex.terrain = TerrainType.CLEAR;
      hex.elevation = 0;
      hex.unit = null;
    });
    unit.position = { q: 0, r: 0, s: 0 };
    unit.movementMode = MovementMode.WALKING;
    unit.currentMP = 5;
    getHex(grid, unit.position)!.unit = unit;

    const result = moveUnit(unit, { q: 2, r: 0, s: -2 }, grid, MovementMode.WALKING, [unit]);

    expect(result.success).toBe(true);
    expect(result.mpUsed).toBe(2);
    expect(unit.currentMP).toBe(3);
  });

  it('applies punch damage only when the target is adjacent', () => {
    const units = getAllUnits();
    const state = initializeGame([units[0]], [units[1]]);
    const attacker = state.units[0];
    const target = state.units[1];
    state.hexGrid.forEach(hex => { hex.unit = null; });
    attacker.position = { q: 0, r: 0, s: 0 };
    target.position = { q: 1, r: 0, s: -1 };
    getHex(state.hexGrid, attacker.position)!.unit = attacker;
    getHex(state.hexGrid, target.position)!.unit = target;
    attacker.pilot.gunnery = 2;
    attacker.movementMode = MovementMode.STANDING;
    state.phase = GamePhase.COMBAT;
    state.selectedUnit = attacker;
    state.targetUnit = target;
    const targetHealth = Array.from(target.locations.values())
      .reduce((sum, location) => sum + location.armor + location.structure, 0);

    const hitState = executePunchAttack(state);
    const healthAfterHit = Array.from(target.locations.values())
      .reduce((sum, location) => sum + location.armor + location.structure, 0);
    expect(healthAfterHit).toBeLessThan(targetHealth);

    target.position = { q: 2, r: 0, s: -2 };
    const healthBeforeOutOfRangeAttack = healthAfterHit;
    const missState = executePunchAttack(hitState);
    const healthAfterOutOfRangeAttack = Array.from(target.locations.values())
      .reduce((sum, location) => sum + location.armor + location.structure, 0);
    expect(healthAfterOutOfRangeAttack).toBe(healthBeforeOutOfRangeAttack);
    expect(missState.gameLog.at(-1)?.message).toContain('must be adjacent');
  });
});
