// Campaign System for BattleTech

import type { Unit } from '@/types/battletech';

export interface Pilot {
  id: string;
  name: string;
  callsign: string;
  gunnery: number;
  piloting: number;
  experience: number;
  kills: number;
  missionsCompleted: number;
  injuries: number;
  specialAbilities: PilotAbility[];
  salary: number;
}

export type PilotAbility = 
  | 'sharpshooter'   // +1 to-hit at long range
  | 'brawler'        // +1 to-hit in close combat
  | 'scout'          // +1 initiative
  | 'technician'     // Faster repairs
  | 'survivalist'    // Ejects more successfully
  | 'melee_specialist' // Bonus to physical attacks
  | 'gunnery_ace';   // -1 to all attack rolls

export interface MechBay {
  mech: Unit;
  condition: number; // 0-100%
  repairCost: number;
  repairTime: number; // in days
  assigned Pilot: string | null;
}

export interface MercenaryCompany {
  id: string;
  name: string;
  funds: number; // C-Bills
  reputation: number; // 0-100
  pilots: Pilot[];
  mechBays: MechBay[];
  salvage: SalvageItem[];
  currentContract: Contract | null;
  completedMissions: number;
  dateEstablished: number;
}

export interface SalvageItem {
  id: string;
  type: 'mech' | 'weapon' | 'equipment' | 'parts';
  name: string;
  condition: number;
  value: number;
  description: string;
}

export interface Contract {
  id: string;
  title: string;
  employer: string;
  type: MissionType;
  difficulty: number; // 1-10
  payment: number;
  salvageRights: number; // 0-100%
  repairCoverage: number; // 0-100%
  duration: number; // days
  description: string;
  objectives: MissionObjective[];
}

export type MissionType = 
  | 'assassination'
  | 'escort'
  | 'base_defense'
  | 'recon'
  | 'capture'
  | 'pirate_hunt'
  | 'planetary_assault'
  | 'raid'
  | 'gladiator';

export interface MissionObjective {
  id: string;
  description: string;
  type: 'destroy' | 'capture' | 'defend' | 'escort' | 'survive';
  required: boolean;
  completed: boolean;
  reward: number;
}

export interface MissionResult {
  success: boolean;
  objectivesCompleted: number;
  objectivesTotal: number;
  payment: number;
  bonus: number;
  salvage: SalvageItem[];
  casualties: string[]; // Pilot IDs
  mechsDestroyed: string[];
  mechsDamaged: { mechId: string; damage: number }[];
  experienceGained: { pilotId: string; xp: number }[];
}

// Campaign Manager
export class CampaignManager {
  private company: MercenaryCompany;
  private currentDate: number; // days since campaign start
  
  constructor(companyName: string) {
    this.company = this.createNewCompany(companyName);
    this.currentDate = 0;
  }
  
  private createNewCompany(name: string): MercenaryCompany {
    return {
      id: `company-${Date.now()}`,
      name,
      funds: 1000000, // Starting C-Bills
      reputation: 50,
      pilots: this.generateStartingPilots(),
      mechBays: [],
      salvage: [],
      currentContract: null,
      completedMissions: 0,
      dateEstablished: Date.now()
    };
  }
  
  private generateStartingPilots(): Pilot[] {
    const names = [
      { name: 'Marcus Steele', callsign: 'Hammer' },
      { name: 'Sarah Chen', callsign: 'Phoenix' },
      { name: 'Viktor Romanov', callsign: 'Bear' },
      { name: 'Keiko Tanaka', callsign: 'Ronin' }
    ];
    
    return names.map((n, i) => ({
      id: `pilot-${i}`,
      name: n.name,
      callsign: n.callsign,
      gunnery: 4,
      piloting: 5,
      experience: 0,
      kills: 0,
      missionsCompleted: 0,
      injuries: 0,
      specialAbilities: [],
      salary: 5000
    }));
  }
  
  getCompany(): MercenaryCompany {
    return this.company;
  }
  
  addMech(mech: Unit, condition: number = 100): void {
    this.company.mechBays.push({
      mech,
      condition,
      repairCost: 0,
      repairTime: 0,
      assignedPilot: null
    });
  }
  
  assignPilotToMech(pilotId: string, mechIndex: number): boolean {
    if (mechIndex >= this.company.mechBays.length) return false;
    
    // Unassign pilot from any other mech
    this.company.mechBays.forEach(bay => {
      if (bay.assignedPilot === pilotId) {
        bay.assignedPilot = null;
      }
    });
    
    this.company.mechBays[mechIndex].assignedPilot = pilotId;
    return true;
  }
  
  generateContracts(count: number = 3): Contract[] {
    const contracts: Contract[] = [];
    const missionTypes: MissionType[] = [
      'assassination', 'escort', 'base_defense', 'recon', 
      'capture', 'pirate_hunt', 'raid'
    ];
    
    for (let i = 0; i < count; i++) {
      const type = missionTypes[Math.floor(Math.random() * missionTypes.length)];
      const difficulty = Math.floor(Math.random() * 5) + Math.ceil(this.company.reputation / 20);
      
      contracts.push({
        id: `contract-${Date.now()}-${i}`,
        title: this.generateMissionTitle(type),
        employer: this.generateEmployer(),
        type,
        difficulty: Math.min(difficulty, 10),
        payment: this.calculatePayment(difficulty),
        salvageRights: Math.floor(Math.random() * 50) + 25,
        repairCoverage: Math.floor(Math.random() * 40) + 10,
        duration: Math.floor(Math.random() * 20) + 10,
        description: this.generateMissionDescription(type),
        objectives: this.generateObjectives(type)
      });
    }
    
    return contracts;
  }
  
  private generateMissionTitle(type: MissionType): string {
    const titles = {
      assassination: ['Silent Strike', 'Executive Action', 'Decapitation'],
      escort: ['Safe Passage', 'Guardian Angel', 'Convoy Duty'],
      base_defense: ['Hold the Line', 'Fortress Defense', 'Last Stand'],
      recon: ['Eyes Forward', 'Pathfinder', 'Intelligence Gathering'],
      capture: ['Hostile Takeover', 'Seizure Operation', 'Asset Acquisition'],
      pirate_hunt: ['Pirate Purge', 'Bandit Hunt', 'Scourge Elimination'],
      planetary_assault: ['Planetary Liberation', 'Invasion Force', 'Orbital Drop'],
      raid: ['Hit and Run', 'Lightning Strike', 'Quick Raid'],
      gladiator: ['Arena Champion', 'Death Match', 'Blood Sport']
    };
    
    const options = titles[type] || ['Operation', 'Mission', 'Assignment'];
    return options[Math.floor(Math.random() * options.length)];
  }
  
  private generateEmployer(): string {
    const employers = [
      'House Davion', 'House Steiner', 'House Liao', 'House Marik', 'House Kurita',
      'ComStar', 'Mercenary Review Board', 'Local Militia', 'Corporate Interests'
    ];
    return employers[Math.floor(Math.random() * employers.length)];
  }
  
  private generateMissionDescription(type: MissionType): string {
    const descriptions = {
      assassination: 'Eliminate a high-value enemy commander.',
      escort: 'Protect convoy through hostile territory.',
      base_defense: 'Defend strategic installation from enemy attack.',
      recon: 'Gather intelligence on enemy positions.',
      capture: 'Capture and secure enemy facility.',
      pirate_hunt: 'Eliminate pirate forces in the sector.',
      planetary_assault: 'Support invasion of enemy-held world.',
      raid: 'Strike enemy supply depot and withdraw.',
      gladiator: 'Compete in arena combat for prizes.'
    };
    
    return descriptions[type] || 'Complete assigned objectives.';
  }
  
  private generateObjectives(type: MissionType): MissionObjective[] {
    const baseObjective: MissionObjective = {
      id: `obj-1`,
      description: this.generateMissionDescription(type),
      type: this.getObjectiveType(type),
      required: true,
      completed: false,
      reward: 50000
    };
    
    return [baseObjective];
  }
  
  private getObjectiveType(missionType: MissionType): MissionObjective['type'] {
    const map: Record<MissionType, MissionObjective['type']> = {
      assassination: 'destroy',
      escort: 'escort',
      base_defense: 'defend',
      recon: 'survive',
      capture: 'capture',
      pirate_hunt: 'destroy',
      planetary_assault: 'capture',
      raid: 'destroy',
      gladiator: 'survive'
    };
    
    return map[missionType];
  }
  
  private calculatePayment(difficulty: number): number {
    return difficulty * 100000 + Math.floor(Math.random() * 50000);
  }
  
  acceptContract(contract: Contract): void {
    this.company.currentContract = contract;
  }
  
  completeMission(result: MissionResult): void {
    // Apply rewards
    this.company.funds += result.payment + result.bonus;
    this.company.salvage.push(...result.salvage);
    this.company.completedMissions++;
    
    // Update pilot experience
    result.experienceGained.forEach(exp => {
      const pilot = this.company.pilots.find(p => p.id === exp.pilotId);
      if (pilot) {
        pilot.experience += exp.xp;
        pilot.missionsCompleted++;
        this.checkPilotAdvancement(pilot);
      }
    });
    
    // Apply mech damage
    result.mechsDamaged.forEach(dmg => {
      const bay = this.company.mechBays.find(b => b.mech.id === dmg.mechId);
      if (bay) {
        bay.condition = Math.max(0, bay.condition - dmg.damage);
        bay.repairCost = this.calculateRepairCost(bay.mech, dmg.damage);
        bay.repairTime = Math.ceil(dmg.damage / 10);
      }
    });
    
    // Handle destroyed mechs
    result.mechsDestroyed.forEach(mechId => {
      const index = this.company.mechBays.findIndex(b => b.mech.id === mechId);
      if (index !== -1) {
        this.company.mechBays.splice(index, 1);
      }
    });
    
    // Update reputation
    if (result.success) {
      this.company.reputation = Math.min(100, this.company.reputation + 5);
    } else {
      this.company.reputation = Math.max(0, this.company.reputation - 3);
    }
    
    this.company.currentContract = null;
  }
  
  private checkPilotAdvancement(pilot: Pilot): void {
    const xpThresholds = [1000, 2500, 5000, 10000, 20000];
    const level = xpThresholds.findIndex(threshold => pilot.experience < threshold);
    
    // Improve skills based on experience
    if (level >= 1 && pilot.gunnery > 1) {
      pilot.gunnery = Math.max(1, 4 - Math.floor(level / 2));
    }
    if (level >= 1 && pilot.piloting > 1) {
      pilot.piloting = Math.max(1, 5 - Math.floor(level / 2));
    }
    
    // Grant special abilities
    if (pilot.experience >= 2500 && pilot.specialAbilities.length === 0) {
      pilot.specialAbilities.push('sharpshooter');
    }
    if (pilot.experience >= 5000 && pilot.specialAbilities.length === 1) {
      pilot.specialAbilities.push('scout');
    }
  }
  
  private calculateRepairCost(mech: Unit, damagePercent: number): number {
    return Math.floor(mech.bv2 * 100 * (damagePercent / 100));
  }
  
  repairMech(bayIndex: number): boolean {
    const bay = this.company.mechBays[bayIndex];
    if (!bay || bay.condition >= 100) return false;
    
    if (this.company.funds >= bay.repairCost) {
      this.company.funds -= bay.repairCost;
      bay.condition = 100;
      bay.repairCost = 0;
      bay.repairTime = 0;
      return true;
    }
    
    return false;
  }
  
  hirePilot(pilot: Pilot): boolean {
    if (this.company.funds >= pilot.salary * 3) { // 3 months advance
      this.company.funds -= pilot.salary * 3;
      this.company.pilots.push(pilot);
      return true;
    }
    return false;
  }
  
  firePilot(pilotId: string): void {
    const index = this.company.pilots.findIndex(p => p.id === pilotId);
    if (index !== -1) {
      // Unassign from mech
      this.company.mechBays.forEach(bay => {
        if (bay.assignedPilot === pilotId) {
          bay.assignedPilot = null;
        }
      });
      this.company.pilots.splice(index, 1);
    }
  }
  
  sellSalvage(itemId: string): boolean {
    const index = this.company.salvage.findIndex(s => s.id === itemId);
    if (index !== -1) {
      const item = this.company.salvage[index];
      this.company.funds += item.value;
      this.company.salvage.splice(index, 1);
      return true;
    }
    return false;
  }
  
  advanceTime(days: number): void {
    this.currentDate += days;
    
    // Pay pilot salaries (monthly)
    if (this.currentDate % 30 === 0) {
      const totalSalaries = this.company.pilots.reduce((sum, p) => sum + p.salary, 0);
      this.company.funds -= totalSalaries;
    }
    
    // Repair progress
    this.company.mechBays.forEach(bay => {
      if (bay.repairTime > 0) {
        bay.repairTime = Math.max(0, bay.repairTime - days);
      }
    });
  }
  
  save(): string {
    return JSON.stringify({
      company: this.company,
      currentDate: this.currentDate
    });
  }
  
  load(data: string): void {
    const saved = JSON.parse(data);
    this.company = saved.company;
    this.currentDate = saved.currentDate;
  }
}
