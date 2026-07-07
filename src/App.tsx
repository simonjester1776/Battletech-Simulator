// BattleTech Tactical Simulator - Refactored Main App

import { useState, useCallback, useEffect } from 'react';
import type { GameState, Unit, Hex } from '@/types/battletech';
import { MovementMode } from '@/types/battletech';
import { 
  initializeGame, 
  rollInitiative, 
  selectUnit, 
  moveSelectedUnit,
  selectTarget,
  fireWeapon,
  fireAllWeapons,
  executePunchAttack,
  executeKickAttack,
  executeDFAAttack,
  endMovementPhase,
  endCombatPhase,
  endHeatPhase,
  executeAITurn,
  performTorsoTwist,
  toggleAMSActive,
  evaluateMissionObjective,
  checkGameOver
} from '@/engine/game';
import { getHexKey } from '@/engine/hexgrid';
import { getAllUnitsAndVehicles, cloneUnit } from '@/engine/units';
import { CampaignManager } from '@/lib/campaign';
import type { Contract } from '@/lib/campaign';
import type { GameMode } from '@/lib/multiplayer';
import {
  generateEliminationMission,
  generateAssassinationMission,
  generateDefenseMission,
  generateCaptureMission,
  generateEscortMission,
  generateSurvivalMission,
  type MissionObjective
} from '@/lib/mission-objectives';

import { MainMenu } from '@/screens/MainMenu';
import { toast } from 'sonner';
import { UnitSetup } from '@/screens/UnitSetup';
import { BattleScreen } from '@/screens/BattleScreen';
import { CampaignScreen } from '@/components/CampaignScreen';
import { MultiplayerLobby } from '@/components/MultiplayerLobby';
import { NetworkMultiplayerLobby } from '@/components/NetworkMultiplayerLobby';
import { MechLab } from '@/components/MechLab';
import ErrorBoundary from '@/components/ErrorBoundary';

type AppScreen = 'main-menu' | 'setup' | 'game' | 'campaign' | 'multiplayer-lobby' | 'network-lobby' | 'mech-lab';

function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('main-menu');
  const [gameMode, setGameMode] = useState<GameMode>('hotseat');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [gameOver, setGameOver] = useState<{ gameOver: boolean; winner: 'player' | 'ai' | 'draw' | null } | null>(null);
  
  const [campaignManager, setCampaignManager] = useState<CampaignManager | null>(null);
  const [currentContract, setCurrentContract] = useState<Contract | null>(null);
  const [battleResultsProcessed, setBattleResultsProcessed] = useState(false);
  
  const initialUnits = getAllUnitsAndVehicles();
  const [availableUnits, setAvailableUnits] = useState<Unit[]>(initialUnits);
  const [playerSelections, setPlayerSelections] = useState<string[]>(() => [
    initialUnits.find(u => u.name.toLowerCase().includes('atlas'))?.id,
    initialUnits.find(u => u.name.toLowerCase().includes('warhammer'))?.id,
    initialUnits.find(u => u.name.toLowerCase().includes('hunchback'))?.id
  ].filter(Boolean) as string[]);
  const [aiSelections, setAiSelections] = useState<string[]>(() => [
    initialUnits.find(u => u.name.toLowerCase().includes('timber wolf'))?.id,
    initialUnits.find(u => u.name.toLowerCase().includes('marauder'))?.id
  ].filter(Boolean) as string[]);
  

  const generateMissionObjectives = useCallback(
    (playerUnits: Unit[], aiUnits: Unit[], contract?: Contract): MissionObjective[] => {
      const extractionPoint = { q: 0, r: 0, s: 0 };
      const captureZone = { q: 0, r: 0, s: 0 };
      const primaryTarget = aiUnits[0];

      if (contract) {
        switch (contract.missionType) {
          case 'elimination':
            return [generateEliminationMission()];
          case 'assassination':
            return primaryTarget
              ? [generateAssassinationMission(primaryTarget.name, primaryTarget.id)]
              : [generateEliminationMission()];
          case 'defense':
            return [generateDefenseMission(4 + contract.difficulty * 2)];
          case 'capture':
            return [generateCaptureMission(captureZone, 2 + Math.ceil(contract.difficulty / 2))];
          case 'escort':
            return playerUnits.length > 0
              ? [generateEscortMission(playerUnits[0].id, playerUnits[0].name, extractionPoint)]
              : [generateDefenseMission(6)];
          case 'survival':
            return [generateSurvivalMission(6 + contract.difficulty * 2)];
          default:
            return [generateEliminationMission()];
        }
      }

      const random = Math.random();
      if (random < 0.15 || aiUnits.length === 0) {
        return [generateEliminationMission()];
      }

      if (random < 0.35 && primaryTarget) {
        return [generateAssassinationMission(primaryTarget.name, primaryTarget.id)];
      }

      if (random < 0.55) {
        return [generateDefenseMission(6)];
      }

      if (random < 0.75) {
        return [generateCaptureMission(captureZone, 2)];
      }

      if (random < 0.9 && playerUnits.length > 0) {
        return [generateEscortMission(playerUnits[0].id, playerUnits[0].name, extractionPoint)];
      }

      return [generateSurvivalMission(8)];
    },
    []
  );
  
  // Check game over condition
  useEffect(() => {
    if (gameState) {
      const result = checkGameOver(gameState);
      setGameOver(result.gameOver ? result : null);
    }
  }, [gameState]);
  
  useEffect(() => {
    if (!gameOver?.gameOver || !currentContract || !campaignManager || !gameState) return;

    if (!battleResultsProcessed) {
      let enemyUnits = gameState.units.slice(Math.min(playerSelections.length, gameState.units.length));
      if (enemyUnits.length === 0) {
        enemyUnits = gameState.units.slice(Math.floor(gameState.units.length / 2));
      }
      const destroyedEnemyUnits = enemyUnits.filter(unit => !unit.alive);
      campaignManager.processBattleResults(destroyedEnemyUnits, []);
      setBattleResultsProcessed(true);
    }

    const objectiveResult = evaluateMissionObjective(gameState, false);
    const contractSuccess = objectiveResult.gameOver && objectiveResult.winner === 'player';
    campaignManager.completeContract(currentContract.id, contractSuccess);
    setCampaignManager(Object.assign(Object.create(Object.getPrototypeOf(campaignManager)), campaignManager));
    setCurrentContract(null);
  }, [gameOver, currentContract, campaignManager, gameState, battleResultsProcessed, playerSelections]);
  
  // Game initialization and management
  const syncGameState = useCallback((state: GameState): GameState => {
    evaluateMissionObjective(state);
    const result = checkGameOver(state);
    setGameOver(result.gameOver ? result : null);
    return state;
  }, []);

  const startGame = useCallback(() => {
    const playerUnits = playerSelections.map(id => {
      const template = availableUnits.find(u => u.id === id);
      return template ? cloneUnit(template) : cloneUnit(availableUnits[0]);
    });
    
    const aiUnits = aiSelections.map(id => {
      const template = availableUnits.find(u => u.id === id);
      return template ? cloneUnit(template) : cloneUnit(availableUnits[1] || availableUnits[0]);
    });
    
    const newObjectives = generateMissionObjectives(playerUnits, aiUnits, currentContract ?? undefined).map(objective => ({ ...objective }));
    const newGame = initializeGame(playerUnits, aiUnits, newObjectives);
    setGameState(syncGameState(newGame));
    setCurrentScreen('game');
    setBattleResultsProcessed(false);
  }, [playerSelections, aiSelections, availableUnits, gameMode, currentContract, syncGameState]);
  
  const restartGame = useCallback(() => {
    setGameState(null);
    setCurrentScreen('main-menu');
    setGameOver(null);
    setCurrentContract(null);
    setBattleResultsProcessed(false);
  }, []);
  
  const startCampaign = useCallback(() => {
    const manager = new CampaignManager('My Company');
    
    // Give starting mechs
    const startingMechs = [
      availableUnits.find(u => u.name.includes('Centurion')),
      availableUnits.find(u => u.name.includes('Hunchback')),
      availableUnits.find(u => u.name.includes('Locust'))
    ].filter(Boolean) as Unit[];
    
    startingMechs.forEach(mech => {
      manager.addMech(cloneUnit(mech), 100);
    });

    manager.generateContractOffers(5);
    
    setCampaignManager(manager);
    setCurrentScreen('campaign');
  }, [availableUnits]);
  
  const startMission = useCallback((contract: Contract) => {
    setCurrentContract(contract);
    setCurrentScreen('setup');
  }, []);

  const handleStartNetworkGame = useCallback((_roomId: string, _isHost: boolean, _playerId: string) => {
    setGameMode('network');
    setCurrentScreen('setup');
  }, []);
  
  // Game action handlers
  const handleRollInitiative = useCallback(() => {
    if (!gameState) return;
    const { state } = rollInitiative(gameState);
    setGameState(syncGameState(state));
  }, [gameState, syncGameState]);
  
  const handleHexClick = useCallback((hex: Hex) => {
    if (!gameState) return;
    
    if (gameState.phase === 'movement' && gameState.selectedUnit) {
      const hexKey = getHexKey(hex.coord);
      const isValidMove = gameState.validMoveHexes.some(h => getHexKey(h) === hexKey);
      
      if (isValidMove) {
        const newState = moveSelectedUnit(gameState, hex.coord, gameState.selectedUnit.movementMode);
        setGameState(newState);
      } else if (hex.unit) {
        const unitIndex = gameState.units.indexOf(hex.unit);
        const isPlayerUnit = unitIndex < gameState.units.length / 2;
        if (isPlayerUnit) {
          const newState = selectUnit(gameState, hex.unit);
          setGameState(newState);
        }
      }
    } else if (gameState.phase === 'combat') {
      if (hex.unit) {
        const unitIndex = gameState.units.indexOf(hex.unit);
        const isPlayerUnit = unitIndex < gameState.units.length / 2;
        
        if (isPlayerUnit) {
          const newState = selectUnit(gameState, hex.unit);
          setGameState(newState);
        } else if (gameState.selectedUnit) {
          const newState = selectTarget(gameState, hex.unit);
          setGameState(newState);
        }
      }
    } else if (hex.unit) {
      const unitIndex = gameState.units.indexOf(hex.unit);
      const isPlayerUnit = unitIndex < gameState.units.length / 2;
      if (isPlayerUnit) {
        const newState = selectUnit(gameState, hex.unit);
        setGameState(newState);
      }
    }
  }, [gameState]);
  
  const handleEndMovement = useCallback(() => {
    if (!gameState) return;
    const newState = endMovementPhase(gameState);
    setGameState(syncGameState(newState));
  }, [gameState, syncGameState]);
  
  const handleEndCombat = useCallback(() => {
    if (!gameState) return;
    const newState = endCombatPhase(gameState);
    setGameState(syncGameState(newState));
  }, [gameState, syncGameState]);
  
  const handleEndHeat = useCallback(() => {
    if (!gameState) return;
    const newState = endHeatPhase(gameState);
    setGameState(syncGameState(newState));
  }, [gameState, syncGameState]);
  
  const handleMovementModeChange = useCallback((mode: MovementMode) => {
    if (!gameState || !gameState.selectedUnit) return;
    const unit = gameState.selectedUnit;
    unit.movementMode = mode;
    unit.currentMP = mode === 'running' ? unit.runningMP : 
                     mode === 'jumping' ? unit.jumpingMP : 
                     unit.walkingMP;
    setGameState({ ...gameState });
  }, [gameState]);
  
  const handleFireWeapon = useCallback((weaponId: string) => {
    if (!gameState) return;
    const newState = fireWeapon(gameState, weaponId);
    setGameState(syncGameState(newState));

    // show immediate toast with latest log entry
    const last = newState.gameLog && newState.gameLog.length > 0 ? newState.gameLog[newState.gameLog.length - 1] : null;
    if (last) {
      switch (last.type) {
        case 'combat':
          toast.success(last.message);
          break;
        case 'critical':
          toast.error(last.message);
          break;
        case 'heat':
          toast.warning(last.message);
          break;
        case 'movement':
          toast(last.message);
          break;
        case 'system':
        default:
          toast.info(last.message);
          break;
      }
    }
  }, [gameState, syncGameState]);

  const handleFireAllWeapons = useCallback(() => {
    if (!gameState) return;
    const newState = fireAllWeapons(gameState);
    setGameState(syncGameState(newState));
  }, [gameState, syncGameState]);
  
  const handleToggleAMS = useCallback(() => {
    if (!gameState || !gameState.selectedUnit) return;
    const newState = toggleAMSActive(gameState, gameState.selectedUnit.id);
    setGameState(syncGameState(newState));
  }, [gameState, syncGameState]);
  
  const handlePunchAttack = useCallback(() => {
    if (!gameState) return;
    const newState = executePunchAttack(gameState);
    setGameState(syncGameState(newState));
  }, [gameState, syncGameState]);
  
  const handleKickAttack = useCallback(() => {
    if (!gameState) return;
    const newState = executeKickAttack(gameState);
    setGameState(syncGameState(newState));
  }, [gameState, syncGameState]);
  
  const handleDFAAttack = useCallback(() => {
    if (!gameState) return;
    const newState = executeDFAAttack(gameState);
    setGameState(syncGameState(newState));
  }, [gameState, syncGameState]);
  
  const handleTorsoTwist = useCallback((direction: 'left' | 'right') => {
    if (!gameState || !gameState.selectedUnit) return;
    const steps = direction === 'left' ? -1 : 1;
    const newState = performTorsoTwist(gameState, gameState.selectedUnit.id, steps);
    setGameState(syncGameState(newState));
  }, [gameState, syncGameState]);

  const handleAIturn = useCallback(() => {
    if (!gameState) return;
    const newState = executeAITurn(gameState);
    setGameState(syncGameState(newState));
  }, [gameState, syncGameState]);
  
  // Screen rendering
  if (currentScreen === 'main-menu') {
    return (
      <MainMenu
        onSinglePlayer={() => {
          setCurrentScreen('setup');
        }}
        onCampaign={startCampaign}
        onHotseat={() => {
          setCurrentScreen('setup');
        }}
        onNetworkPlay={() => {
          setCurrentScreen('network-lobby');
        }}
        onMechLab={() => {
          setCurrentScreen('mech-lab');
        }}
      />
    );
  }
  
  if (currentScreen === 'campaign' && campaignManager) {
    return (
      <CampaignScreen
        campaignManager={campaignManager}
        onStartMission={startMission}
        onBack={() => setCurrentScreen('main-menu')}
      />
    );
  }
  
  if (currentScreen === 'multiplayer-lobby') {
    return (
      <MultiplayerLobby
        onStartGame={(mode: GameMode, _config: unknown) => {
          setGameMode(mode);
          setCurrentScreen('setup');
        }}
        onBack={() => setCurrentScreen('main-menu')}
      />
    );
  }
  
  if (currentScreen === 'network-lobby') {
    return (
      <NetworkMultiplayerLobby
        onStartGame={handleStartNetworkGame}
        onBack={() => setCurrentScreen('main-menu')}
      />
    );
  }
  
  if (currentScreen === 'mech-lab') {
    return (
      <MechLab
        onSave={(customMech) => {
          setAvailableUnits(prev => [...prev, customMech]);
          setPlayerSelections(prev => [...prev, customMech.id]);
          setCurrentScreen('setup');
        }}
        onCancel={() => setCurrentScreen('main-menu')}
      />
    );
  }
  
  if (currentScreen === 'setup') {
    return (
      <UnitSetup
        availableUnits={availableUnits}
        playerSelections={playerSelections}
        aiSelections={aiSelections}
        contract={currentContract}
        onPlayerSelectionChange={setPlayerSelections}
        onAiSelectionChange={setAiSelections}
        onStartGame={startGame}
        onBack={() => setCurrentScreen('main-menu')}
      />
    );
  }
  
  if (currentScreen === 'game' && gameState) {
    return (
      <BattleScreen
        gameState={gameState}
        onGameStateChange={setGameState}
        onHexClick={handleHexClick}
        onRollInitiative={handleRollInitiative}
        onEndMovement={handleEndMovement}
        onEndCombat={handleEndCombat}
        onEndHeat={handleEndHeat}
        onMovementModeChange={handleMovementModeChange}
        onFireAllWeapons={handleFireAllWeapons}
        onPunchAttack={handlePunchAttack}
        onKickAttack={handleKickAttack}
        onDFAAttack={handleDFAAttack}
        onTorsoTwist={handleTorsoTwist}
        onToggleAMS={handleToggleAMS}
        onFireWeapon={handleFireWeapon}
        onRestart={restartGame}
        onAIturn={handleAIturn}
        onBack={() => {
          setCurrentScreen('main-menu');
          setCurrentContract(null);
        }}
        gameOver={gameOver}
        objectives={gameState?.objectives ?? []}
        contract={currentContract}
      />
    );
  }

  // Fallback
  return null;
}

function AppWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}

export default AppWithErrorBoundary;
