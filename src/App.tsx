// BattleTech Tactical Simulator - Refactored Main App

import { useState, useCallback, useRef, useEffect } from 'react';
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
  executeChargeAttack,
  endMovementPhase,
  endCombatPhase,
  endHeatPhase,
  executeAITurn,
  performTorsoTwist,
  toggleAMSActive,
  evaluateMissionObjective,
  checkGameOver
} from '@/engine/game';
import type { AIDifficulty } from '@/engine/game';
import { getHexKey } from '@/engine/hexgrid';
import { getAllUnits, cloneUnit } from '@/engine/units';
import { CampaignManager } from '@/lib/campaign';
import type { Contract } from '@/lib/campaign';
import type { GameMode } from '@/lib/multiplayer';
import { deserializeGameState, multiplayerClient, serializeGameState, type SerializedGameState } from '@/lib/websocket-client';
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
interface NetworkSession {
  roomId: string;
  isHost: boolean;
  playerId: string;
}

interface NetworkStateSyncMessage {
  revision: number;
  game_state: SerializedGameState;
}

function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('main-menu');
  const [gameMode, setGameMode] = useState<GameMode>('hotseat');
  const [aiDifficulty, setAIDifficulty] = useState<AIDifficulty>('normal');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [networkSession, setNetworkSession] = useState<NetworkSession | null>(null);
  const [gameOver, setGameOver] = useState<{ gameOver: boolean; winner: 'player' | 'ai' | 'draw' | null } | null>(null);
  
  const [campaignManager, setCampaignManager] = useState<CampaignManager | null>(null);
  const [currentContract, setCurrentContract] = useState<Contract | null>(null);
  const battleResultsProcessedRef = useRef(false);
  const lastGameOverRef = useRef<{ gameOver: boolean; winner: 'player' | 'ai' | 'draw' | null } | null>(null);
  const networkRevisionRef = useRef(0);
  const applyingNetworkStateRef = useRef(false);
  
  const initialUnits = getAllUnits();
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
  
  // Game initialization and management
  const syncGameState = useCallback((state: GameState): GameState => {
    evaluateMissionObjective(state);
    const result = checkGameOver(state);
    const nextGameOver = result.gameOver ? result : null;

    if (nextGameOver && !lastGameOverRef.current?.gameOver && currentContract && campaignManager && !battleResultsProcessedRef.current) {
      let enemyUnits = state.units.slice(Math.min(playerSelections.length, state.units.length));
      if (enemyUnits.length === 0) {
        enemyUnits = state.units.slice(Math.floor(state.units.length / 2));
      }
      const destroyedEnemyUnits = enemyUnits.filter(unit => !unit.alive);
      campaignManager.processBattleResults(destroyedEnemyUnits, []);

      const objectiveResult = evaluateMissionObjective(state, false);
      const contractSuccess = objectiveResult.gameOver && objectiveResult.winner === 'player';
      campaignManager.completeContract(currentContract.id, contractSuccess);
      battleResultsProcessedRef.current = true;
      setCampaignManager(Object.assign(Object.create(Object.getPrototypeOf(campaignManager)), campaignManager));
      setCurrentContract(null);
    }

    lastGameOverRef.current = nextGameOver;
    setGameOver(current => {
      const currentWinner = current?.winner ?? null;
      const nextWinner = nextGameOver?.winner ?? null;
      const currentGameOver = current?.gameOver ?? false;
      const nextGameOverValue = nextGameOver?.gameOver ?? false;

      if (currentGameOver === nextGameOverValue && currentWinner === nextWinner) {
        return current;
      }

      return nextGameOver;
    });

    return state;
  }, [campaignManager, currentContract, playerSelections]);

  useEffect(() => {
    if (!networkSession) return;

    const handleStateSync = (message: NetworkStateSyncMessage) => {
      if (!message?.game_state || message.revision <= networkRevisionRef.current) return;
      try {
        networkRevisionRef.current = message.revision;
        applyingNetworkStateRef.current = true;
        setGameState(syncGameState(deserializeGameState(message.game_state)));
        setCurrentScreen('game');
      } catch (error) {
        console.error('Failed to apply network game state:', error);
        toast.error('Received an invalid game-state update.');
      }
    };

    multiplayerClient.on('state_sync', handleStateSync);
    return () => multiplayerClient.off('state_sync');
  }, [networkSession, syncGameState]);

  useEffect(() => {
    if (!gameState || gameMode !== 'network' || !networkSession) return;
    if (applyingNetworkStateRef.current) {
      applyingNetworkStateRef.current = false;
      return;
    }

    multiplayerClient.sendGameState({
      revision: networkRevisionRef.current,
      game_state: serializeGameState(gameState),
    });
  }, [gameMode, gameState, networkSession]);

  const startGame = useCallback(() => {
    if (gameMode === 'network' && !networkSession?.isHost) return;

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
    battleResultsProcessedRef.current = false;
    lastGameOverRef.current = null;
    setGameState(syncGameState(newGame));
    setCurrentScreen('game');
  }, [playerSelections, aiSelections, availableUnits, currentContract, generateMissionObjectives, syncGameState, gameMode, networkSession]);
  
  const restartGame = useCallback(() => {
    battleResultsProcessedRef.current = false;
    lastGameOverRef.current = null;
    setGameState(null);
    setCurrentScreen('main-menu');
    setGameOver(null);
    setCurrentContract(null);
    setNetworkSession(null);
    networkRevisionRef.current = 0;
    multiplayerClient.disconnect();
  }, []);
  
  const startCampaign = useCallback(() => {
    setGameMode('ai');
    const manager = new CampaignManager('My Company');

    const startingMechs = availableUnits.length > 0
      ? availableUnits.slice(0, 3)
      : [
          cloneUnit({
            id: 'fallback-centurion',
            name: 'CN9-A Centurion',
            unitType: 'mech',
            config: 'biped',
            tonnage: 50,
            bv2: 1200,
            walkingMP: 5,
            runningMP: 8,
            jumpingMP: 0,
            currentMP: 5,
            movementMode: 'walking',
            heat: 0,
            heatSinks: 10,
            doubleHeatSinks: false,
            locations: new Map(),
            weapons: [],
            ammo: [],
            hasECM: false,
            hasAMS: false,
            hasCASE: false,
            hasXLEngine: false,
            hasXXLEngine: false,
            hasCompactEngine: false,
            hasTSM: false,
            hasMASC: false,
            engineHits: 0,
            gyroHits: 0,
            sensorHits: 0,
            lifeSupportHits: 0,
            pilot: { name: 'Fallback Pilot', gunnery: 4, piloting: 5, hits: 0, conscious: true },
            alive: true,
            shutdown: false,
            prone: false,
            immobile: false,
            position: null,
            facing: 0,
          } as Unit)]
    
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

  const handleStartNetworkGame = useCallback((roomId: string, isHost: boolean, playerId: string) => {
    setNetworkSession({ roomId, isHost, playerId });
    networkRevisionRef.current = 0;
    setGameState(null);
    setGameMode('network');
    setCurrentScreen('setup');
  }, []);
  
  // Game action handlers
  const handleRollInitiative = useCallback(() => {
    if (!gameState) return;
    const { state } = rollInitiative(gameState);
    setGameState(syncGameState(state));
  }, [gameState, syncGameState]);

  const canControlUnit = useCallback((unit: Unit, state: GameState): boolean => {
    const unitIndex = state.units.findIndex(candidate => candidate.id === unit.id);
    const isPlayerUnit = unitIndex >= 0 && unitIndex < state.units.length / 2;
    if (gameMode === 'hotseat') return unitIndex >= 0;
    if (gameMode === 'network') return unitIndex >= 0 && isPlayerUnit === (networkSession?.isHost ?? false);
    return isPlayerUnit;
  }, [gameMode, networkSession]);
  
  const handleHexClick = useCallback((hex: Hex) => {
    if (!gameState || gameState.phase === 'initiative') return;

    const isPlayerUnit = (unit: Unit) => gameState.units.indexOf(unit) < gameState.units.length / 2;

    if (gameState.phase === 'movement' && gameState.selectedUnit) {
      if (!canControlUnit(gameState.selectedUnit, gameState)) {
        if (hex.unit && canControlUnit(hex.unit, gameState)) {
          setGameState(selectUnit(gameState, hex.unit));
        }
        return;
      }

      const hexKey = getHexKey(hex.coord);
      const isValidMove = gameState.validMoveHexes.some(h => getHexKey(h) === hexKey);
      
      if (isValidMove) {
        const newState = moveSelectedUnit(gameState, hex.coord, gameState.selectedUnit.movementMode);
        setGameState(syncGameState(newState));
      } else if (hex.unit && canControlUnit(hex.unit, gameState)) {
        const newState = selectUnit(gameState, hex.unit);
        setGameState(newState);
      }
    } else if (gameState.phase === 'combat') {
      if (hex.unit) {
        if (gameState.selectedUnit && !canControlUnit(gameState.selectedUnit, gameState)) {
          if (canControlUnit(hex.unit, gameState)) {
            setGameState(selectUnit(gameState, hex.unit));
          }
          return;
        }

        const selectedIsSameSide = gameState.selectedUnit
          ? isPlayerUnit(gameState.selectedUnit) === isPlayerUnit(hex.unit)
          : false;

        const isNewHotseatAttacker = gameMode === 'hotseat' && (
          !gameState.selectedUnit ||
          !!gameState.targetUnit ||
          selectedIsSameSide
        );

        if (canControlUnit(hex.unit, gameState) && (gameMode !== 'hotseat' || isNewHotseatAttacker)) {
          const newState = selectUnit(gameState, hex.unit);
          setGameState(newState);
          return;
        }

        if (gameState.selectedUnit && selectedIsSameSide === false) {
          const newState = selectTarget(gameState, hex.unit);
          setGameState(newState);
        }
      }
    } else if (hex.unit) {
      if (canControlUnit(hex.unit, gameState)) {
        const newState = selectUnit(gameState, hex.unit);
        setGameState(newState);
      }
    }
  }, [canControlUnit, gameMode, gameState, syncGameState]);
  
  const handleEndMovement = useCallback(() => {
    if (!gameState) return;
    const newState = gameMode === 'ai'
      ? executeAITurn(gameState, aiDifficulty)
      : endMovementPhase(gameState);
    setGameState(syncGameState(newState));
  }, [aiDifficulty, gameMode, gameState, syncGameState]);
  
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
    if (!gameState || !gameState.selectedUnit || !canControlUnit(gameState.selectedUnit, gameState)) return;

    setGameState(prev => {
      if (!prev || !prev.selectedUnit) return prev;
      const unit = prev.units.find(u => u.id === prev.selectedUnit!.id);
      if (!unit) return prev;

      const updatedUnits = prev.units.map(u =>
        u.id === unit.id
          ? {
              ...u,
              movementMode: mode,
              currentMP: mode === 'running' ? u.runningMP : mode === 'jumping' ? u.jumpingMP : u.walkingMP,
            }
          : u
      );

      return {
        ...prev,
        units: updatedUnits,
        selectedUnit: { ...prev.selectedUnit, movementMode: mode, currentMP: mode === 'running' ? prev.selectedUnit.runningMP : mode === 'jumping' ? prev.selectedUnit.jumpingMP : prev.selectedUnit.walkingMP },
      };
    });
  }, [canControlUnit, gameState]);
  
  const handleFireWeapon = useCallback((weaponId: string) => {
    if (!gameState || (gameState.selectedUnit && !canControlUnit(gameState.selectedUnit, gameState))) return;
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
  }, [canControlUnit, gameState, syncGameState]);

  const handleFireAllWeapons = useCallback(() => {
    if (!gameState || (gameState.selectedUnit && !canControlUnit(gameState.selectedUnit, gameState))) return;
    const newState = fireAllWeapons(gameState);
    setGameState(syncGameState(newState));
  }, [canControlUnit, gameState, syncGameState]);
  
  const handleToggleAMS = useCallback(() => {
    if (!gameState || !gameState.selectedUnit || !canControlUnit(gameState.selectedUnit, gameState)) return;
    const newState = toggleAMSActive(gameState, gameState.selectedUnit.id);
    setGameState(syncGameState(newState));
  }, [canControlUnit, gameState, syncGameState]);
  
  const handlePunchAttack = useCallback(() => {
    if (!gameState || (gameState.selectedUnit && !canControlUnit(gameState.selectedUnit, gameState))) return;
    const newState = executePunchAttack(gameState);
    setGameState(syncGameState(newState));
  }, [canControlUnit, gameState, syncGameState]);
  
  const handleKickAttack = useCallback(() => {
    if (!gameState || (gameState.selectedUnit && !canControlUnit(gameState.selectedUnit, gameState))) return;
    const newState = executeKickAttack(gameState);
    setGameState(syncGameState(newState));
  }, [canControlUnit, gameState, syncGameState]);
  
  const handleDFAAttack = useCallback(() => {
    if (!gameState || (gameState.selectedUnit && !canControlUnit(gameState.selectedUnit, gameState))) return;
    const newState = executeDFAAttack(gameState);
    setGameState(syncGameState(newState));
  }, [canControlUnit, gameState, syncGameState]);

  const handleChargeAttack = useCallback(() => {
    if (!gameState || (gameState.selectedUnit && !canControlUnit(gameState.selectedUnit, gameState))) return;
    const newState = executeChargeAttack(gameState);
    setGameState(syncGameState(newState));
  }, [canControlUnit, gameState, syncGameState]);
  
  const handleTorsoTwist = useCallback((direction: 'left' | 'right') => {
    if (!gameState || !gameState.selectedUnit || !canControlUnit(gameState.selectedUnit, gameState)) return;
    const steps = direction === 'left' ? -1 : 1;
    const newState = performTorsoTwist(gameState, gameState.selectedUnit.id, steps);
    setGameState(syncGameState(newState));
  }, [canControlUnit, gameState, syncGameState]);

  // Screen rendering
  if (currentScreen === 'main-menu') {
    return (
      <MainMenu
        onSinglePlayer={() => {
          setNetworkSession(null);
          setGameMode('ai');
          setCurrentScreen('setup');
        }}
        onCampaign={startCampaign}
        onHotseat={() => {
          setNetworkSession(null);
          setGameMode('hotseat');
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
        onStartGame={(mode: GameMode, config: unknown) => {
          void config;
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
        networkWaiting={gameMode === 'network' && !networkSession?.isHost}
        showAIDifficulty={gameMode === 'ai'}
        aiDifficulty={aiDifficulty}
        onAIDifficultyChange={setAIDifficulty}
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
        onChargeAttack={handleChargeAttack}
        onTorsoTwist={handleTorsoTwist}
        onToggleAMS={handleToggleAMS}
        onFireWeapon={handleFireWeapon}
        onRestart={restartGame}
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
