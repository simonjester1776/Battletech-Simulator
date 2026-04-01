// Mission Objectives System for Campaign Mode

import type { Unit, HexCoord } from '@/types/battletech';

export enum ObjectiveType {
  ELIMINATE_ALL = 'eliminate_all',
  DEFEND_STRUCTURE = 'defend_structure',
  CAPTURE_ZONE = 'capture_zone',
  ESCORT_UNIT = 'escort_unit',
  ASSASSINATION = 'assassination',
  SURVIVE = 'survive',
  DESTROY_TARGET = 'destroy_target',
}

export enum ObjectiveStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface MissionObjective {
  id: string;
  type: ObjectiveType;
  title: string;
  description: string;
  status: ObjectiveStatus;
  required: boolean; // If true, mission fails if objective fails
  progress: number; // 0-100
  progressMax: number;
  reward: {
    cbills: number;
    salvage: number;
    reputation: number;
  };
  // Type-specific data
  targetUnitId?: string;
  targetZone?: HexCoord;
  zoneRadius?: number;
  turnLimit?: number;
  turnsRemaining?: number;
  structureId?: string;
  escortUnitId?: string;
  extractionPoint?: HexCoord;
}

export class MissionObjectiveManager {
  private objectives: MissionObjective[] = [];
  private currentTurn = 0;

  addObjective(objective: MissionObjective) {
    this.objectives.push(objective);
  }

  getObjectives(): MissionObjective[] {
    return this.objectives;
  }

  getActiveObjectives(): MissionObjective[] {
    return this.objectives.filter(
      (obj) => obj.status === ObjectiveStatus.PENDING || obj.status === ObjectiveStatus.IN_PROGRESS
    );
  }

  getCompletedObjectives(): MissionObjective[] {
    return this.objectives.filter((obj) => obj.status === ObjectiveStatus.COMPLETED);
  }

  getFailedObjectives(): MissionObjective[] {
    return this.objectives.filter((obj) => obj.status === ObjectiveStatus.FAILED);
  }

  updateObjective(objectiveId: string, updates: Partial<MissionObjective>) {
    const objective = this.objectives.find((obj) => obj.id === objectiveId);
    if (objective) {
      Object.assign(objective, updates);
    }
  }

  checkObjectives(
    playerUnits: Unit[],
    enemyUnits: Unit[],
    turn: number
  ): { completed: string[]; failed: string[] } {
    this.currentTurn = turn;
    const completed: string[] = [];
    const failed: string[] = [];

    this.objectives.forEach((objective) => {
      if (
        objective.status === ObjectiveStatus.COMPLETED ||
        objective.status === ObjectiveStatus.FAILED
      ) {
        return;
      }

      // Update turn-based objectives
      if (objective.turnLimit && objective.turnsRemaining !== undefined) {
        objective.turnsRemaining = objective.turnLimit - turn;
        if (objective.turnsRemaining <= 0) {
          objective.status = ObjectiveStatus.FAILED;
          failed.push(objective.id);
          return;
        }
      }

      // Check objective completion
      switch (objective.type) {
        case ObjectiveType.ELIMINATE_ALL:
          if (enemyUnits.filter((u) => u.alive).length === 0) {
            objective.status = ObjectiveStatus.COMPLETED;
            objective.progress = 100;
            completed.push(objective.id);
          } else {
            const totalEnemies = objective.progressMax;
            const remaining = enemyUnits.filter((u) => u.alive).length;
            objective.progress = Math.floor(((totalEnemies - remaining) / totalEnemies) * 100);
            objective.status = ObjectiveStatus.IN_PROGRESS;
          }
          break;

        case ObjectiveType.ASSASSINATION:
          if (objective.targetUnitId) {
            const target = enemyUnits.find((u) => u.id === objective.targetUnitId);
            if (!target || !target.alive) {
              objective.status = ObjectiveStatus.COMPLETED;
              objective.progress = 100;
              completed.push(objective.id);
            } else {
              objective.status = ObjectiveStatus.IN_PROGRESS;
            }
          }
          break;

        case ObjectiveType.SURVIVE:
          if (playerUnits.filter((u) => u.alive).length === 0) {
            objective.status = ObjectiveStatus.FAILED;
            failed.push(objective.id);
          } else if (objective.turnLimit && turn >= objective.turnLimit) {
            objective.status = ObjectiveStatus.COMPLETED;
            objective.progress = 100;
            completed.push(objective.id);
          } else if (objective.turnLimit) {
            objective.progress = Math.floor((turn / objective.turnLimit) * 100);
            objective.status = ObjectiveStatus.IN_PROGRESS;
          }
          break;

        case ObjectiveType.CAPTURE_ZONE:
          if (objective.targetZone && objective.zoneRadius) {
            const unitsInZone = playerUnits.filter((unit) => {
              if (!unit.position) return false;
              const distance = this.getDistance(unit.position, objective.targetZone!);
              return distance <= (objective.zoneRadius || 0);
            });

            if (unitsInZone.length > 0) {
              objective.progress += 10;
              if (objective.progress >= 100) {
                objective.status = ObjectiveStatus.COMPLETED;
                completed.push(objective.id);
              } else {
                objective.status = ObjectiveStatus.IN_PROGRESS;
              }
            }
          }
          break;

        case ObjectiveType.ESCORT_UNIT:
          if (objective.escortUnitId && objective.extractionPoint) {
            const escortUnit = playerUnits.find((u) => u.id === objective.escortUnitId);
            if (!escortUnit || !escortUnit.alive) {
              objective.status = ObjectiveStatus.FAILED;
              failed.push(objective.id);
            } else if (escortUnit.position) {
              const distance = this.getDistance(escortUnit.position, objective.extractionPoint);
              if (distance === 0) {
                objective.status = ObjectiveStatus.COMPLETED;
                objective.progress = 100;
                completed.push(objective.id);
              } else {
                const maxDistance = 50; // Assume max map size
                objective.progress = Math.floor(((maxDistance - distance) / maxDistance) * 100);
                objective.status = ObjectiveStatus.IN_PROGRESS;
              }
            }
          }
          break;

        case ObjectiveType.DEFEND_STRUCTURE:
          // Check if structure is still standing (simplified - would need structure health)
          if (objective.turnLimit && turn >= objective.turnLimit) {
            objective.status = ObjectiveStatus.COMPLETED;
            objective.progress = 100;
            completed.push(objective.id);
          } else if (objective.turnLimit) {
            objective.progress = Math.floor((turn / objective.turnLimit) * 100);
            objective.status = ObjectiveStatus.IN_PROGRESS;
          }
          break;
      }
    });

    return { completed, failed };
  }

  private getDistance(pos1: HexCoord, pos2: HexCoord): number {
    // Simple hex distance calculation
    const dq = Math.abs(pos1.q - pos2.q);
    const dr = Math.abs(pos1.r - pos2.r);
    const ds = Math.abs(pos1.s - pos2.s);
    return Math.max(dq, dr, ds);
  }

  getMissionStatus(): {
    allCompleted: boolean;
    anyFailed: boolean;
    totalRewards: { cbills: number; salvage: number; reputation: number };
  } {
    const completed = this.getCompletedObjectives();
    const failed = this.getFailedObjectives();
    const requiredFailed = failed.some((obj) => obj.required);

    const totalRewards = completed.reduce(
      (acc, obj) => ({
        cbills: acc.cbills + obj.reward.cbills,
        salvage: acc.salvage + obj.reward.salvage,
        reputation: acc.reputation + obj.reward.reputation,
      }),
      { cbills: 0, salvage: 0, reputation: 0 }
    );

    return {
      allCompleted: this.objectives.every(
        (obj) => obj.status === ObjectiveStatus.COMPLETED || !obj.required
      ),
      anyFailed: requiredFailed,
      totalRewards,
    };
  }
}

// Preset mission generators
export function generateEliminationMission(): MissionObjective {
  return {
    id: 'elim-primary',
    type: ObjectiveType.ELIMINATE_ALL,
    title: 'Eliminate All Hostiles',
    description: 'Destroy all enemy units in the area of operations',
    status: ObjectiveStatus.PENDING,
    required: true,
    progress: 0,
    progressMax: 100,
    reward: {
      cbills: 150000,
      salvage: 3,
      reputation: 10,
    },
  };
}

export function generateAssassinationMission(targetName: string, targetId: string): MissionObjective {
  return {
    id: 'assassin-primary',
    type: ObjectiveType.ASSASSINATION,
    title: `Eliminate ${targetName}`,
    description: `Your primary target is ${targetName}. Neutralize this threat at all costs.`,
    status: ObjectiveStatus.PENDING,
    required: true,
    progress: 0,
    progressMax: 100,
    targetUnitId: targetId,
    reward: {
      cbills: 200000,
      salvage: 5,
      reputation: 15,
    },
  };
}

export function generateDefenseMission(turns: number): MissionObjective {
  return {
    id: 'defend-primary',
    type: ObjectiveType.DEFEND_STRUCTURE,
    title: 'Defend Installation',
    description: `Hold the facility for ${turns} turns against enemy assault`,
    status: ObjectiveStatus.PENDING,
    required: true,
    progress: 0,
    progressMax: 100,
    turnLimit: turns,
    turnsRemaining: turns,
    reward: {
      cbills: 175000,
      salvage: 2,
      reputation: 12,
    },
  };
}

export function generateCaptureMission(zone: HexCoord, radius: number): MissionObjective {
  return {
    id: 'capture-primary',
    type: ObjectiveType.CAPTURE_ZONE,
    title: 'Capture Strategic Point',
    description: `Secure and hold the designated zone for mission success`,
    status: ObjectiveStatus.PENDING,
    required: true,
    progress: 0,
    progressMax: 100,
    targetZone: zone,
    zoneRadius: radius,
    reward: {
      cbills: 160000,
      salvage: 3,
      reputation: 11,
    },
  };
}

export function generateEscortMission(
  unitId: string,
  unitName: string,
  extraction: HexCoord
): MissionObjective {
  return {
    id: 'escort-primary',
    type: ObjectiveType.ESCORT_UNIT,
    title: `Escort ${unitName}`,
    description: `Safely escort ${unitName} to the extraction point`,
    status: ObjectiveStatus.PENDING,
    required: true,
    progress: 0,
    progressMax: 100,
    escortUnitId: unitId,
    extractionPoint: extraction,
    reward: {
      cbills: 140000,
      salvage: 2,
      reputation: 9,
    },
  };
}

export function generateSurvivalMission(turns: number): MissionObjective {
  return {
    id: 'survive-primary',
    type: ObjectiveType.SURVIVE,
    title: 'Survive the Assault',
    description: `Keep your forces alive for ${turns} turns`,
    status: ObjectiveStatus.PENDING,
    required: true,
    progress: 0,
    progressMax: 100,
    turnLimit: turns,
    turnsRemaining: turns,
    reward: {
      cbills: 130000,
      salvage: 1,
      reputation: 8,
    },
  };
}
