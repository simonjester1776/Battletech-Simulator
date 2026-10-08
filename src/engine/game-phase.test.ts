import { describe, expect, it } from 'vitest';
import { GamePhase } from '@/types/battletech';
import { checkGameOver, getAIHitProbability, initializeGame, rollInitiative, selectUnit } from './game';
import { getAllUnitsAndVehicles } from './units';
import { generateAssassinationMission, generateEscortMission } from '@/lib/mission-objectives';

describe('battle turn flow', () => {
  it('blocks unit selection until initiative is rolled', () => {
    const units = getAllUnitsAndVehicles();
    const playerUnit = units[0];
    const enemyUnit = units[1];

    const state = initializeGame([playerUnit], [enemyUnit]);

    expect(state.phase).toBe(GamePhase.INITIATIVE);
    expect(selectUnit(state, playerUnit).selectedUnit).toBeNull();
  });

  it('starts movement with walking mode after initiative is rolled', () => {
    const units = getAllUnitsAndVehicles();
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
    const units = getAllUnitsAndVehicles();
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
});
