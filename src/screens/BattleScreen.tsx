import { useState } from 'react';
import type { GameState, Hex } from '@/types/battletech';
import { MovementMode } from '@/types/battletech';
import { HexGrid } from '@/components/HexGrid';
import { UnitPanel } from '@/components/UnitPanel';
import { GameLog } from '@/components/GameLog';
import { ControlPanel } from '@/components/ControlPanel';
import { ObjectivesOverlay } from '@/components/ObjectivesOverlay';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Save, FolderOpen, Download } from 'lucide-react';
import { saveGame, loadGame, getSaveList, exportGameAsFile } from '@/lib/save-system';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import type { MissionObjective } from '@/lib/mission-objectives';

interface BattleScreenProps {
  gameState: GameState;
  onGameStateChange: (state: GameState) => void;
  onHexClick: (hex: Hex) => void;
  onRollInitiative: () => void;
  onEndMovement: () => void;
  onEndCombat: () => void;
  onEndHeat: () => void;
  onMovementModeChange: (mode: MovementMode) => void;
  onFireAllWeapons: () => void;
  onRestart: () => void;
  onAIturn: () => void;
  onBack: () => void;
  gameOver: { gameOver: boolean; winner: 'player' | 'ai' | 'draw' | null } | null;
  objectives?: MissionObjective[];
}

export function BattleScreen({
  gameState,
  onGameStateChange,
  onHexClick,
  onRollInitiative,
  onEndMovement,
  onEndCombat,
  onEndHeat,
  onMovementModeChange,
  onFireAllWeapons,
  onRestart,
  onAIturn,
  onBack,
  gameOver,
  objectives,
}: BattleScreenProps) {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [savedGames, setSavedGames] = useState<Array<{ id: string; name: string; timestamp: number }>>([]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    gameState,
    gameOver,
    onSave: () => setShowSaveDialog(true),
    onLoad: () => {
      setShowLoadDialog(true);
      setSavedGames(getSaveList());
    },
    onEndMovement,
    onEndCombat,
    onEndHeat,
  });

  const handleSaveGame = () => {
    if (!gameState || !saveName.trim()) return;
    saveGame(gameState, saveName.trim());
    setShowSaveDialog(false);
    setSaveName('');
  };

  const handleLoadGame = (saveId: string) => {
    const loaded = loadGame(saveId);
    if (loaded) {
      onGameStateChange(loaded);
      setShowLoadDialog(false);
    }
  };

  const playerUnits = gameState.units.filter((_, i) => i < gameState.units.length / 2);
  const aiUnits = gameState.units.filter((_, i) => i >= gameState.units.length / 2);

  const selectedUnit = gameState.selectedUnit 
    ? [...playerUnits, ...aiUnits].find(u => u.id === gameState.selectedUnit?.id)
    : null;
    
  const targetUnit = gameState.targetUnit
    ? [...playerUnits, ...aiUnits].find(u => u.id === gameState.targetUnit?.id)
    : null;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={onBack}
              variant="outline"
              className="border-gray-700"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Menu
            </Button>
            
            <h1 className="text-2xl font-bold">
              Turn {gameState.turn} - {gameState.phase.charAt(0).toUpperCase() + gameState.phase.slice(1)} Phase
            </h1>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={() => setShowSaveDialog(true)}
              variant="outline"
              className="border-gray-700"
              size="sm"
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button
              onClick={() => {
                setShowLoadDialog(true);
                setSavedGames(getSaveList());
              }}
              variant="outline"
              className="border-gray-700"
              size="sm"
            >
              <FolderOpen className="w-4 h-4 mr-2" />
              Load
            </Button>
            <Button
              onClick={() => exportGameAsFile(gameState, `battletech-turn-${gameState.turn}.json`)}
              variant="outline"
              className="border-gray-700"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
        
        {/* Main Game Area */}
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <HexGrid
              hexes={gameState.hexGrid}
              selectedUnit={gameState.selectedUnit}
              validMoveHexes={gameState.validMoveHexes}
              validTargetHexes={gameState.validTargetHexes}
              onHexClick={onHexClick}
            />
            
            {objectives && objectives.length > 0 && (
              <ObjectivesOverlay objectives={objectives} />
            )}
          </div>
          
          <div className="space-y-4">
            {selectedUnit && (
              <UnitPanel
                unit={selectedUnit}
                isSelected={true}
                showWeapons={true}
              />
            )}
            
            {targetUnit && (
              <UnitPanel
                unit={targetUnit}
                isSelected={false}
                showWeapons={false}
              />
            )}
          </div>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-4 mt-4">
          <ControlPanel
            gameState={gameState}
            onRollInitiative={onRollInitiative}
            onEndMovement={onEndMovement}
            onEndCombat={onEndCombat}
            onEndHeat={onEndHeat}
            onMovementModeChange={onMovementModeChange}
            onFireAllWeapons={onFireAllWeapons}
            onRestart={onRestart}
            onAIturn={onAIturn}
          />
          
          <GameLog entries={gameState.gameLog} />
        </div>
      </div>
      
      {/* Game Over Dialog */}
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
            <Button onClick={onRestart} className="bg-blue-600 hover:bg-blue-700" data-testid="play-again-btn">
              Play Again
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Save Dialog */}
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
      
      {/* Load Dialog */}
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
