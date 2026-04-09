// Control Panel Component - Game controls and phase management

import type { GameState } from '@/types/battletech';
import { GamePhase, MovementMode } from '@/types/battletech';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  Play, 
  SkipForward, 
  RotateCcw,
  Target,
  Move,
  Thermometer,
  Shuffle,
  Zap
} from 'lucide-react';

interface ControlPanelProps {
  gameState: GameState;
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
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  gameState,
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
  onAIturn
}) => {
  const { phase, turn, initiativeWinner, selectedUnit, targetUnit } = gameState;
  
  const getPhaseInfo = () => {
    switch (phase) {
      case GamePhase.INITIATIVE:
        return { 
          name: 'Initiative Phase', 
          icon: <Shuffle className="w-4 h-4" />,
          color: 'bg-purple-600'
        };
      case GamePhase.MOVEMENT:
        return { 
          name: 'Movement Phase', 
          icon: <Move className="w-4 h-4" />,
          color: 'bg-blue-600'
        };
      case GamePhase.COMBAT:
        return { 
          name: 'Combat Phase', 
          icon: <Target className="w-4 h-4" />,
          color: 'bg-red-600'
        };
      case GamePhase.HEAT:
        return { 
          name: 'Heat Phase', 
          icon: <Thermometer className="w-4 h-4" />,
          color: 'bg-orange-600'
        };
      case GamePhase.END:
        return { 
          name: 'End Phase', 
          icon: <SkipForward className="w-4 h-4" />,
          color: 'bg-gray-600'
        };
      default:
        return { 
          name: 'Unknown', 
          icon: <Play className="w-4 h-4" />,
          color: 'bg-gray-600'
        };
    }
  };
  
  const phaseInfo = getPhaseInfo();
  
  const playerUnits = gameState.units.filter((_, i) => i < gameState.units.length / 2);
  const playerAliveUnits = playerUnits.filter(u => u.alive);
  const aiUnits = gameState.units.filter((_, i) => i >= gameState.units.length / 2);
  const aiAliveUnits = aiUnits.filter(u => u.alive);
  
  const isGameOver = playerAliveUnits.length === 0 || aiAliveUnits.length === 0;
  const winner = playerAliveUnits.length === 0 
    ? 'AI Wins!' 
    : aiAliveUnits.length === 0 
      ? 'Player Wins!' 
      : null;
  
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white">Turn {turn}</span>
            <Badge className={cn("text-white", phaseInfo.color)}>
              <span className="flex items-center gap-1">
                {phaseInfo.icon}
                {phaseInfo.name}
              </span>
            </Badge>
          </div>
          {initiativeWinner && (
            <p className="text-sm text-gray-400 mt-1">
              Initiative: <span className={initiativeWinner === 'player' ? 'text-green-400' : 'text-red-400'}>
                {initiativeWinner === 'player' ? 'Player' : 'AI'}
              </span>
            </p>
          )}
        </div>
        
        <div className="text-right">
          <div className="flex gap-4 text-sm">
            <div>
              <span className="text-gray-400">Player:</span>
              <span className="text-green-400 font-bold ml-1">{gameState.playerScore}</span>
            </div>
            <div>
              <span className="text-gray-400">AI:</span>
              <span className="text-red-400 font-bold ml-1">{gameState.aiScore}</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {playerAliveUnits.length}/{playerUnits.length} vs {aiAliveUnits.length}/{aiUnits.length}
          </p>
        </div>
      </div>
      
      {isGameOver && winner && (
        <div className="bg-green-900/50 border border-green-500 rounded-lg p-4 text-center">
          <h2 className="text-2xl font-bold text-green-400">{winner}</h2>
          <p className="text-gray-300 mt-2">Game Over</p>
        </div>
      )}
      
      <div className="flex flex-wrap gap-2">
        {phase === GamePhase.INITIATIVE && !isGameOver && (
          <Button 
            onClick={onRollInitiative}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Shuffle className="w-4 h-4 mr-2" />
            Roll Initiative
          </Button>
        )}
        
        {phase === GamePhase.MOVEMENT && !isGameOver && (
          <>
            <div className="flex gap-1">
              <Button 
                variant="outline"
                size="sm"
                onClick={() => onMovementModeChange(MovementMode.WALKING)}
                className={cn(
                  selectedUnit?.movementMode === 'walking' && "bg-blue-600"
                )}
              >
                <Move className="w-4 h-4 mr-1" />
                Walk
              </Button>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => onMovementModeChange(MovementMode.RUNNING)}
                className={cn(
                  selectedUnit?.movementMode === 'running' && "bg-blue-600"
                )}
              >
                <Zap className="w-4 h-4 mr-1" />
                Run
              </Button>
              {selectedUnit && selectedUnit.jumpingMP > 0 && (
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => onMovementModeChange(MovementMode.JUMPING)}
                  className={cn(
                    selectedUnit?.movementMode === 'jumping' && "bg-blue-600"
                  )}
                >
                  <Move className="w-4 h-4 mr-1" />
                  Jump
                </Button>
              )}
            </div>
            <Button 
              onClick={onEndMovement}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <SkipForward className="w-4 h-4 mr-2" />
              End Movement
            </Button>
            <Button 
              variant="outline"
              onClick={onAIturn}
            >
              <Play className="w-4 h-4 mr-2" />
              AI Turn
            </Button>
          </>
        )}
        
        {phase === GamePhase.COMBAT && !isGameOver && (
          <>
            {selectedUnit && targetUnit && (
              <>
                <Button 
                  onClick={onFireAllWeapons}
                  className="bg-red-600 hover:bg-red-700"
                  data-testid="fire-all-btn"
                >
                  <Target className="w-4 h-4 mr-2" />
                  Fire All
                </Button>
                
                {/* Physical Attack Buttons */}
                <div className="flex gap-2 ml-2 border-l border-gray-700 pl-2">
                  <Button 
                    onClick={onPunchAttack}
                    variant="outline"
                    className="bg-yellow-900/30 hover:bg-yellow-800/40 border-yellow-600"
                    data-testid="punch-btn"
                    title="Punch (Adjacent only)"
                  >
                    👊 Punch
                  </Button>
                  <Button 
                    onClick={onKickAttack}
                    variant="outline"
                    className="bg-yellow-900/30 hover:bg-yellow-800/40 border-yellow-600"
                    data-testid="kick-btn"
                    title="Kick (Adjacent only)"
                  >
                    🦵 Kick
                  </Button>
                  {selectedUnit.jumpingMP > 0 && (
                    <Button 
                      onClick={onDFAAttack}
                      variant="outline"
                      className="bg-red-900/30 hover:bg-red-800/40 border-red-600"
                      data-testid="dfa-btn"
                      title="Death From Above (Jump capable only)"
                    >
                      💥 DFA
                    </Button>
                  )}
                </div>
              </>
            )}
            <Button 
              onClick={onEndCombat}
              className="bg-red-600 hover:bg-red-700 ml-auto"
              data-testid="end-combat-btn"
            >
              <SkipForward className="w-4 h-4 mr-2" />
              End Combat
            </Button>
          </>
        )}
        
        {phase === GamePhase.HEAT && !isGameOver && (
          <Button 
            onClick={onEndHeat}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <SkipForward className="w-4 h-4 mr-2" />
            End Heat Phase
          </Button>
        )}
        
        <Button 
          variant="outline"
          onClick={onRestart}
          className="ml-auto"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Restart
        </Button>
      </div>
      
      {selectedUnit && (
        <div className="bg-gray-800 rounded-lg p-3">
          <p className="text-sm text-gray-300">
            Selected: <span className="font-bold text-white">{selectedUnit.name}</span>
          </p>
          <p className="text-xs text-gray-400">
            MP: {selectedUnit.currentMP}/{selectedUnit.walkingMP} | 
            Heat: {selectedUnit.heat} | 
            Status: {selectedUnit.shutdown ? 'SHUTDOWN' : selectedUnit.movementMode.toUpperCase()}
          </p>
        </div>
      )}
      
      {targetUnit && (
        <div className="bg-gray-800 rounded-lg p-3">
          <p className="text-sm text-gray-300">
            Target: <span className="font-bold text-red-400">{targetUnit.name}</span>
          </p>
          <p className="text-xs text-gray-400">
            Distance: {selectedUnit?.position && targetUnit.position 
              ? Math.max(
                  Math.abs(selectedUnit.position.q - targetUnit.position.q),
                  Math.abs(selectedUnit.position.r - targetUnit.position.r),
                  Math.abs(selectedUnit.position.s - targetUnit.position.s)
                )
              : '-'} hexes
          </p>
        </div>
      )}
      
      <div className="text-xs text-gray-500 bg-gray-800/50 rounded p-2">
        <p className="font-semibold text-gray-400 mb-1">How to Play:</p>
        <ul className="space-y-0.5">
          <li>1. Roll for initiative</li>
          <li>2. Select a unit and click a green hex to move</li>
          <li>3. Select target unit and fire weapons</li>
          <li>4. End phases to proceed</li>
        </ul>
      </div>
    </div>
  );
};

export default ControlPanel;
