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
  fireAllWeapons,
  endMovementPhase,
  endCombatPhase,
  endHeatPhase,
  executeAITurn,
  checkGameOver
} from '@/engine/game';
import { getHexKey } from '@/engine/hexgrid';
import { getAllUnitsAndVehicles, cloneUnit } from '@/engine/units';
import { CampaignManager } from '@/lib/campaign';
import type { Contract } from '@/lib/campaign';
import type { GameMode } from '@/lib/multiplayer';
import { generateEliminationMission, type MissionObjective } from '@/lib/mission-objectives';

import { MainMenu } from '@/screens/MainMenu';
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
  const [gameMode] = useState<GameMode>('hotseat');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [gameOver, setGameOver] = useState<{ gameOver: boolean; winner: 'player' | 'ai' | 'draw' | null } | null>(null);
  
  const [campaignManager, setCampaignManager] = useState<CampaignManager | null>(null);
  const [currentContract] = useState<Contract | null>(null);
  const [mechLabMech, setMechLabMech] = useState<Unit | null>(null);
  
  const [playerSelections, setPlayerSelections] = useState<string[]>(['atlas', 'warhammer', 'hunchback']);
  const [aiSelections, setAiSelections] = useState<string[]>(['timber-wolf', 'marauder']);
  
  const [missionObjectives] = useState<MissionObjective[]>([
    generateEliminationMission()
  ]);
  
  const availableUnits = getAllUnitsAndVehicles();
  
  // Check game over condition
  useEffect(() => {
    if (gameState) {
      const result = checkGameOver(gameState);
      if (result.gameOver) {
        setGameOver(result);
      }
    }
  }, [gameState]);
  
  // Game initialization and management
  const startGame = useCallback(() => {
    const playerUnits = playerSelections.map(name => {
      const template = availableUnits.find(u => 
        u.name.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(u.name.split(' ')[0].toLowerCase())
      );
      return template ? cloneUnit(template) : cloneUnit(availableUnits[0]);
    });
    
    const aiUnits = aiSelections.map(name => {
      const template = availableUnits.find(u => 
        u.name.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(u.name.split(' ')[0].toLowerCase())
      );
      return template ? cloneUnit(template) : cloneUnit(availableUnits[1]);
    });
    
    const newGame = initializeGame(playerUnits, aiUnits);
    setGameState(newGame);
    setCurrentScreen('game');
    setGameOver(null);
    
    // Log for debugging
    console.log('Game mode:', gameMode, 'Contract:', currentContract);
  }, [playerSelections, aiSelections, availableUnits, gameMode, currentContract]);
  
  const restartGame = useCallback(() => {
    setGameState(null);
    setCurrentScreen('main-menu');
    setGameOver(null);
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
    
    setCampaignManager(manager);
    setCurrentScreen('campaign');
  }, [availableUnits]);
  
  const startMission = useCallback((_contract: Contract) => {
    // In future, set currentContract state when we need it
    setCurrentScreen('setup');
  }, []);
  
  // Game action handlers
  const handleRollInitiative = useCallback(() => {
    if (!gameState) return;
    const { state } = rollInitiative(gameState);
    setGameState(state);
  }, [gameState]);
  
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
    setGameState(newState);
  }, [gameState]);
  
  const handleEndCombat = useCallback(() => {
    if (!gameState) return;
    const newState = endCombatPhase(gameState);
    setGameState(newState);
  }, [gameState]);
  
  const handleEndHeat = useCallback(() => {
    if (!gameState) return;
    const newState = endHeatPhase(gameState);
    setGameState(newState);
  }, [gameState]);
  
  const handleMovementModeChange = useCallback((mode: MovementMode) => {
    if (!gameState || !gameState.selectedUnit) return;
    const unit = gameState.selectedUnit;
    unit.movementMode = mode;
    unit.currentMP = mode === 'running' ? unit.runningMP : 
                     mode === 'jumping' ? unit.jumpingMP : 
                     unit.walkingMP;
    setGameState({ ...gameState });
  }, [gameState]);
  
  const handleFireAllWeapons = useCallback(() => {
    if (!gameState) return;
    const newState = fireAllWeapons(gameState);
    setGameState(newState);
  }, [gameState]);
  
  const handleAIturn = useCallback(() => {
    if (!gameState) return;
    const newState = executeAITurn(gameState);
    setGameState(newState);
  }, [gameState]);
  
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
          setMechLabMech(availableUnits[0]);
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
        onStartGame={(_mode: GameMode, _config: any) => {
          setCurrentScreen('setup');
        }}
        onBack={() => setCurrentScreen('main-menu')}
      />
    );
  }
  
  if (currentScreen === 'network-lobby') {
    return (
      <NetworkMultiplayerLobby
        onStartGame={(roomId: string, isHost: boolean, playerId: string) => {
          console.log('Network game starting:', { roomId, isHost, playerId });
          // TODO: Pass network info to game state
          setCurrentScreen('setup');
        }}
        onBack={() => setCurrentScreen('main-menu')}
      />
    );
  }
  
  if (currentScreen === 'mech-lab' && mechLabMech) {
    return (
      <MechLab
        baseMech={mechLabMech}
        onSave={(customMech) => {
          console.log('Saved custom mech:', customMech);
          setCurrentScreen('main-menu');
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
        onRestart={restartGame}
        onAIturn={handleAIturn}
        onBack={() => setCurrentScreen('main-menu')}
        gameOver={gameOver}
        objectives={missionObjectives}
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
