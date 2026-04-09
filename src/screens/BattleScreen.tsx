import { useState } from 'react';
import type { GameState, Hex } from '@/types/battletech';
import { MovementMode } from '@/types/battletech';
import { HexGrid } from '@/components/HexGrid';
import { UnitPanel } from '@/components/UnitPanel';
import { GameLog } from '@/components/GameLog';
import { ControlPanel } from '@/components/ControlPanel';
import { ObjectivesOverlay } from '@/components/ObjectivesOverlay';
import { Button } from '@/components/ui/button';
import { MidiPlayer } from '@/components/MidiPlayer';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Save, FolderOpen, Download, Trash2, AlertTriangle, Settings } from 'lucide-react';
import { saveGame, loadGame, getSaveList, exportGameAsFile, deleteSave, deleteAllSaves, getSaveStats } from '@/lib/save-system';
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
  onPunchAttack: () => void;
  onKickAttack: () => void;
  onDFAAttack: () => void;
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
  onPunchAttack,
  onKickAttack,
  onDFAAttack,
  onRestart,
  onAIturn,
  onBack,
  gameOver,
  objectives,
}: BattleScreenProps) {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showWipeConfirm, setShowWipeConfirm] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [savedGames, setSavedGames] = useState<Array<{ id: string; name: string; timestamp: number }>>([]);
  const [saveStats, setSaveStats] = useState({ totalSaves: 0, totalSize: 0 });

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

  const handleDeleteSave = (saveId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (confirm('Delete this save?')) {
      deleteSave(saveId);
      setSavedGames(getSaveList());
      setSaveStats(getSaveStats());
    }
  };

  const handleWipeAllSaves = () => {
    if (deleteAllSaves()) {
      setSavedGames([]);
      setSaveStats({ totalSaves: 0, totalSize: 0 });
      setShowWipeConfirm(false);
      setShowSettingsDialog(false);
      alert('All saves have been deleted');
    } else {
      alert('Failed to delete saves');
    }
  };

  const handleResetGame = () => {
    if (confirm('Reset current game? This will return to the main menu.')) {
      onRestart();
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
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
    <div className="min-h-screen bg-gray-950 text-white hvymtl1">
      <div className="p-4">
        {/* MIDI Player */}
        <div className="mb-4">
          <MidiPlayer category="battle" autoPlay={true} />
        </div>
        
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
                setSaveStats(getSaveStats());
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
            <Button
              onClick={() => {
                setSaveStats(getSaveStats());
                setShowSettingsDialog(true);
              }}
              variant="outline"
              className="border-gray-700"
              size="sm"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
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
            onPunchAttack={onPunchAttack}
            onKickAttack={onKickAttack}
            onDFAAttack={onDFAAttack}
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
                  className="p-3 bg-gray-800 rounded border border-gray-700 hover:border-blue-500 cursor-pointer flex justify-between items-center group"
                  data-testid={`load-save-${save.id}`}
                >
                  <div onClick={() => handleLoadGame(save.id)} className="flex-1">
                    <p className="font-medium">{save.name}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(save.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 hover:bg-red-950"
                    onClick={(e) => handleDeleteSave(save.id, e)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Game Settings</DialogTitle>
            <DialogDescription className="text-gray-400">
              Manage your game data
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Save Statistics */}
            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
              <h3 className="font-semibold mb-2">Save Data Statistics</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Saves:</span>
                  <span className="font-medium">{saveStats.totalSaves}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Storage Used:</span>
                  <span className="font-medium">{formatBytes(saveStats.totalSize)}</span>
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="space-y-2">
              <Button
                onClick={handleResetGame}
                variant="outline"
                className="w-full border-yellow-600 text-yellow-500 hover:bg-yellow-950"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Reset Current Game
              </Button>
              
              <Button
                onClick={() => setShowWipeConfirm(true)}
                variant="outline"
                className="w-full border-red-600 text-red-500 hover:bg-red-950"
                disabled={saveStats.totalSaves === 0}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete All Saves ({saveStats.totalSaves})
              </Button>
            </div>
            
            {saveStats.totalSaves === 0 && (
              <Alert className="bg-blue-900/20 border-blue-500/20">
                <AlertDescription className="text-blue-400 text-sm">
                  No saved games to delete
                </AlertDescription>
              </Alert>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Wipe Confirmation Dialog */}
      <Dialog open={showWipeConfirm} onOpenChange={setShowWipeConfirm}>
        <DialogContent className="bg-gray-900 border-red-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-500 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Delete All Saves?
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              This action cannot be undone!
            </DialogDescription>
          </DialogHeader>
          
          <Alert className="bg-red-900/20 border-red-500/20">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <AlertDescription className="text-red-400">
              You are about to permanently delete {saveStats.totalSaves} saved game{saveStats.totalSaves !== 1 ? 's' : ''}.
              This will free up {formatBytes(saveStats.totalSize)} of storage.
            </AlertDescription>
          </Alert>
          
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowWipeConfirm(false)}
              className="border-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleWipeAllSaves}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete All Saves
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
