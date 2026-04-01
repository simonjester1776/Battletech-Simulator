// BattleTech Tactical Simulator - Main App

import { useState, useCallback, useEffect } from 'react';
import type { GameState, Unit, Hex } from '@/types/battletech';
import { TerrainType, MovementMode } from '@/types/battletech';
import { 
  initializeGame, 
  rollInitiative, 
  selectUnit, 
  moveSelectedUnit,
  selectTarget,
  fireWeapon,
  fireAllWeapons,
  endMovementPhase,
  endCombatPhase,
  endHeatPhase,
  executeAITurn,
  checkGameOver
} from '@/engine/game';
import { getHexKey } from '@/engine/hexgrid';
import { getAllUnits, cloneUnit } from '@/engine/units';
import { saveGame, loadGame, getSaveList, exportGameAsFile } from '@/lib/save-system';

import { HexGrid } from '@/components/HexGrid';
import { UnitPanel } from '@/components/UnitPanel';
import { GameLog } from '@/components/GameLog';
import { ControlPanel } from '@/components/ControlPanel';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Swords, Users, BookOpen, Save, FolderOpen, Download } from 'lucide-react';

function App() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [showSetup, setShowSetup] = useState(true);
  const [gameOver, setGameOver] = useState<{ gameOver: boolean; winner: 'player' | 'ai' | 'draw' | null } | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [savedGames, setSavedGames] = useState<Array<{ id: string; name: string; timestamp: number }>>([]);
  
  const [playerSelections, setPlayerSelections] = useState<string[]>(['atlas', 'warhammer', 'hunchback']);
  const [aiSelections, setAiSelections] = useState<string[]>(['timber-wolf', 'marauder']);
  
  const availableUnits = getAllUnits();
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameState || gameOver) return;
      
      // Ctrl/Cmd + S = Save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        setShowSaveDialog(true);
      }
      
      // Ctrl/Cmd + L = Load
      if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        setShowLoadDialog(true);
        setSavedGames(getSaveList());
      }
      
      // Ctrl/Cmd + E = Export
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        exportGameAsFile(gameState, `battletech-turn-${gameState.turn}.json`);
      }
      
      // Space = End current phase
      if (e.key === ' ' && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        e.preventDefault();
        if (gameState.phase === 'movement') handleEndMovement();
        else if (gameState.phase === 'combat') handleEndCombat();
        else if (gameState.phase === 'heat') handleEndHeat();
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState, gameOver]);
  
  const handleSaveGame = useCallback(() => {
    if (!gameState || !saveName.trim()) return;
    
    const success = saveGame(gameState, saveName.trim());
    if (success) {
      setShowSaveDialog(false);
      setSaveName('');
      alert('Game saved successfully!');
    } else {
      alert('Failed to save game');
    }
  }, [gameState, saveName]);
  
  const handleLoadGame = useCallback((saveId: string) => {
    const loadedState = loadGame(saveId);
    if (loadedState) {
      setGameState(loadedState);
      setShowSetup(false);
      setShowLoadDialog(false);
      setGameOver(null);
    } else {
      alert('Failed to load game');
    }
  }, []);
  
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
    setShowSetup(false);
    setGameOver(null);
  }, [playerSelections, aiSelections, availableUnits]);
  
  const restartGame = useCallback(() => {
    setGameState(null);
    setShowSetup(true);
    setGameOver(null);
  }, []);
  
  useEffect(() => {
    if (gameState) {
      const result = checkGameOver(gameState);
      if (result.gameOver) {
        setGameOver(result);
      }
    }
  }, [gameState]);
  
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
  
  const handleUnitSelect = useCallback((unit: Unit) => {
    if (!gameState) return;
    const newState = selectUnit(gameState, unit);
    setGameState(newState);
  }, [gameState]);
  
  const handleWeaponClick = useCallback((weaponId: string) => {
    if (!gameState) return;
    const newState = fireWeapon(gameState, weaponId);
    setGameState(newState);
  }, [gameState]);
  
  const handleFireAllWeapons = useCallback(() => {
    if (!gameState) return;
    const newState = fireAllWeapons(gameState);
    setGameState(newState);
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
  
  const handleAIturn = useCallback(() => {
    if (!gameState) return;
    const newState = executeAITurn(gameState);
    setGameState(newState);
  }, [gameState]);
  
  if (showSetup) {
    const lightMechs = availableUnits.filter(u => u.tonnage < 40);
    const mediumMechs = availableUnits.filter(u => u.tonnage >= 40 && u.tonnage < 60);
    const heavyMechs = availableUnits.filter(u => u.tonnage >= 60 && u.tonnage < 80);
    const assaultMechs = availableUnits.filter(u => u.tonnage >= 80);
    
    return (
      <div className="min-h-screen bg-gray-950 text-white p-8">
        <div className="max-w-6xl mx-auto">
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-red-400 bg-clip-text text-transparent">
              BattleTech Tactical Simulator
            </h1>
            <p className="text-gray-400">Classic CBT Rules - Accurate Combat Simulation</p>
            <p className="text-sm text-gray-500 mt-2">Now with 16 Mech Variants!</p>
          </header>
          
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Swords className="w-5 h-5" />
              Force Selection
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-blue-400">Your Force</h3>
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {[
                    { title: 'Light Mechs (20-35t)', mechs: lightMechs },
                    { title: 'Medium Mechs (40-55t)', mechs: mediumMechs },
                    { title: 'Heavy Mechs (60-75t)', mechs: heavyMechs },
                    { title: 'Assault Mechs (80-100t)', mechs: assaultMechs }
                  ].map(category => (
                    <div key={category.title}>
                      <p className="text-xs font-semibold text-gray-500 mb-1">{category.title}</p>
                      {category.mechs.map(unit => {
                        const key = unit.name.toLowerCase().split(' ')[0];
                        const isSelected = playerSelections.includes(key);
                        
                        return (
                          <label 
                            key={unit.id}
                            className={cn(
                              "flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-colors mb-1",
                              isSelected
                                ? "bg-blue-900/30 border-blue-500"
                                : "bg-gray-800 border-gray-700 hover:bg-gray-750"
                            )}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setPlayerSelections([...playerSelections, key]);
                                } else {
                                  setPlayerSelections(playerSelections.filter(s => s !== key));
                                }
                              }}
                              className="w-4 h-4"
                            />
                            <div className="flex-1">
                              <p className="font-medium text-sm">{unit.name}</p>
                              <p className="text-xs text-gray-400">
                                {unit.tonnage}t | BV: {unit.bv2} | {unit.walkingMP}/{unit.runningMP}{unit.jumpingMP > 0 ? `/${unit.jumpingMP}` : ''} MP
                              </p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3 text-red-400">Opposing Force</h3>
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                  {[
                    { title: 'Light Mechs (20-35t)', mechs: lightMechs },
                    { title: 'Medium Mechs (40-55t)', mechs: mediumMechs },
                    { title: 'Heavy Mechs (60-75t)', mechs: heavyMechs },
                    { title: 'Assault Mechs (80-100t)', mechs: assaultMechs }
                  ].map(category => (
                    <div key={category.title}>
                      <p className="text-xs font-semibold text-gray-500 mb-1">{category.title}</p>
                      {category.mechs.map(unit => {
                        const key = unit.name.toLowerCase().split(' ')[0];
                        const isSelected = aiSelections.includes(key);
                        
                        return (
                          <label 
                            key={unit.id}
                            className={cn(
                              "flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-colors mb-1",
                              isSelected
                                ? "bg-red-900/30 border-red-500"
                                : "bg-gray-800 border-gray-700 hover:bg-gray-750"
                            )}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setAiSelections([...aiSelections, key]);
                                } else {
                                  setAiSelections(aiSelections.filter(s => s !== key));
                                }
                              }}
                              className="w-4 h-4"
                            />
                            <div className="flex-1">
                              <p className="font-medium text-sm">{unit.name}</p>
                              <p className="text-xs text-gray-400">
                                {unit.tonnage}t | BV: {unit.bv2} | {unit.walkingMP}/{unit.runningMP}{unit.jumpingMP > 0 ? `/${unit.jumpingMP}` : ''} MP
                              </p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-center">
              <Button 
                onClick={startGame}
                disabled={playerSelections.length === 0 || aiSelections.length === 0}
                className="px-8 py-3 text-lg bg-gradient-to-r from-blue-600 to-red-600 hover:from-blue-700 hover:to-red-700"
              >
                <Swords className="w-5 h-5 mr-2" />
                Start Battle
              </Button>
            </div>
            
            <div className="mt-8 p-4 bg-gray-800/50 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Game Features
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-xs text-gray-400">
                <ul className="space-y-1">
                  <li>✓ Accurate 2d6 to-hit mechanics</li>
                  <li>✓ Range bands (Short/Medium/Long)</li>
                  <li>✓ Movement modifiers</li>
                  <li>✓ Heat generation and dissipation</li>
                  <li>✓ Critical hit system</li>
                </ul>
                <ul className="space-y-1">
                  <li>✓ Location-based damage</li>
                  <li>✓ Ammo explosion mechanics</li>
                  <li>✓ Shutdown from overheating</li>
                  <li>✓ Pilot damage</li>
                  <li>✓ Hex-grid tactical movement</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!gameState) return null;
  
  const playerUnits = gameState.units.filter((_, i) => i < gameState.units.length / 2);
  const aiUnits = gameState.units.filter((_, i) => i >= gameState.units.length / 2);
  
  return (
    <div className="min-h-screen bg-gray-950 text-white p-4">
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-red-400 bg-clip-text text-transparent">
              BattleTech Tactical Simulator
            </h1>
            <p className="text-xs text-gray-500">Turn {gameState.turn} | {gameState.phase}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSaveDialog(true)}
              data-testid="save-game-btn"
            >
              <Save className="w-4 h-4 mr-1" />
              Save
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSavedGames(getSaveList());
                setShowLoadDialog(true);
              }}
              data-testid="load-game-btn"
            >
              <FolderOpen className="w-4 h-4 mr-1" />
              Load
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportGameAsFile(gameState, `battletech-turn-${gameState.turn}.json`)}
              data-testid="export-game-btn"
            >
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
          </div>
          <div className="flex gap-4 text-sm">
            <div className="text-center">
              <span className="text-gray-400">Player</span>
              <p className="text-green-400 font-bold">{gameState.playerScore} BV</p>
            </div>
            <div className="text-center">
              <span className="text-gray-400">AI</span>
              <p className="text-red-400 font-bold">{gameState.aiScore} BV</p>
            </div>
          </div>
        </header>
        
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-blue-400 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Your Units
            </h2>
            <div className="space-y-2 max-h-[40vh] overflow-y-auto">
              {playerUnits.map(unit => (
                <UnitPanel
                  key={unit.id}
                  unit={unit}
                  isSelected={gameState.selectedUnit?.id === unit.id}
                  onSelect={() => handleUnitSelect(unit)}
                  onWeaponClick={handleWeaponClick}
                  showWeapons={gameState.selectedUnit?.id === unit.id && gameState.phase === 'combat'}
                  disabled={!unit.alive}
                />
              ))}
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <HexGrid
              hexes={gameState.hexGrid}
              selectedUnit={gameState.selectedUnit}
              validMoveHexes={gameState.validMoveHexes}
              validTargetHexes={gameState.validTargetHexes}
              onHexClick={handleHexClick}
              size={28}
            />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-red-400 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Enemy Units
            </h2>
            <div className="space-y-2 max-h-[40vh] overflow-y-auto">
              {aiUnits.map(unit => (
                <UnitPanel
                  key={unit.id}
                  unit={unit}
                  isSelected={gameState.targetUnit?.id === unit.id}
                  onSelect={() => gameState.phase === 'combat' && unit.position && handleHexClick({ 
                    coord: unit.position, 
                    terrain: TerrainType.CLEAR, 
                    elevation: 0, 
                    unit 
                  })}
                  showWeapons={false}
                  disabled={!unit.alive}
                />
              ))}
            </div>
          </div>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-4 mt-4">
          <ControlPanel
            gameState={gameState}
            onRollInitiative={handleRollInitiative}
            onEndMovement={handleEndMovement}
            onEndCombat={handleEndCombat}
            onEndHeat={handleEndHeat}
            onMovementModeChange={handleMovementModeChange}
            onFireAllWeapons={handleFireAllWeapons}
            onRestart={restartGame}
            onAIturn={handleAIturn}
          />
          
          <GameLog entries={gameState.gameLog} />
        </div>
      </div>
      
      <Dialog open={!!gameOver?.gameOver}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {gameOver?.winner === 'player' && '🎉 Victory!'}
              {gameOver?.winner === 'ai' && '💀 Defeat!'}
              {gameOver?.winner === 'draw' && '🤝 Draw!'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {gameOver?.winner === 'player' && 'You have destroyed all enemy units!'}
              {gameOver?.winner === 'ai' && 'Your forces have been eliminated!'}
              {gameOver?.winner === 'draw' && 'All units have been destroyed!'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center gap-4 mt-4">
            <Button onClick={restartGame} className="bg-blue-600 hover:bg-blue-700" data-testid="play-again-btn">
              Play Again
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Save Game</DialogTitle>
            <DialogDescription className="text-gray-400">
              Enter a name for your save
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="Save name..."
              className="bg-gray-800 border-gray-700 text-white"
              data-testid="save-name-input"
              onKeyPress={(e) => e.key === 'Enter' && handleSaveGame()}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowSaveDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveGame}
                disabled={!saveName.trim()}
                className="bg-blue-600 hover:bg-blue-700"
                data-testid="confirm-save-btn"
              >
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Load Game</DialogTitle>
            <DialogDescription className="text-gray-400">
              Select a saved game to load
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {savedGames.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No saved games found</p>
            ) : (
              savedGames.map((save) => (
                <div
                  key={save.id}
                  className="p-3 bg-gray-800 rounded border border-gray-700 hover:border-blue-500 cursor-pointer"
                  onClick={() => handleLoadGame(save.id)}
                  data-testid={`load-save-${save.id}`}
                >
                  <p className="font-medium">{save.name}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(save.timestamp).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default App;
