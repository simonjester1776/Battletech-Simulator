// BattleTech Dice Engine

export function d6(): number {
  return Math.floor(Math.random() * 6) + 1;
}

export function roll2d6(): number {
  return d6() + d6();
}

export function rollNd6(n: number): number {
  let total = 0;
  for (let i = 0; i < n; i++) {
    total += d6();
  }
  return total;
}

export function roll1d10(): number {
  return Math.floor(Math.random() * 10) + 1;
}

// Roll with target number - returns success and the roll
export function skillRoll(targetNumber: number): { success: boolean; roll: number; margin: number } {
  const roll = roll2d6();
  return {
    success: roll >= targetNumber,
    roll,
    margin: roll - targetNumber
  };
}

// Cluster hits table for missile weapons
export function clusterHits(missileCount: number, roll: number): number {
  const table: { [key: number]: number[] } = {
    2: [1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2],
    3: [1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3],
    4: [1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4],
    5: [1, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5],
    6: [2, 2, 3, 3, 4, 4, 4, 5, 5, 6, 6],
    7: [2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7],
    8: [2, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8],
    9: [3, 3, 4, 5, 5, 6, 6, 7, 7, 8, 9],
    10: [3, 4, 4, 5, 6, 6, 7, 7, 8, 9, 10],
    12: [3, 4, 5, 6, 6, 7, 8, 8, 9, 10, 12],
    15: [4, 5, 6, 7, 8, 9, 9, 10, 11, 12, 15],
    20: [5, 7, 8, 9, 10, 11, 12, 13, 14, 16, 18]
  };
  
  if (!table[missileCount]) {
    // For non-standard missile counts, use proportional calculation
    return Math.max(1, Math.floor(missileCount * (roll + 1) / 12));
  }
  
  const rollIndex = Math.min(Math.max(roll - 2, 0), 10);
  return table[missileCount][rollIndex];
}

// Determine if a roll is a critical hit (natural 12)
export function isCriticalRoll(roll: number): boolean {
  return roll === 12;
}

// Piloting skill roll with all modifiers
export function pilotingSkillRoll(
  baseSkill: number,
  modifiers: number,
  gyroHits: number,
  legDamage: number,
  actuatorDamage: number
): { success: boolean; roll: number; target: number } {
  let target = baseSkill + modifiers;
  
  // Gyro damage adds +3 per hit
  target += gyroHits * 3;
  
  // Leg/actuator damage modifiers
  target += legDamage;
  target += actuatorDamage;
  
  // Minimum target number is 2 (always possible to fail on 2)
  target = Math.max(2, target);
  
  const roll = roll2d6();
  return {
    success: roll >= target,
    roll,
    target
  };
}
