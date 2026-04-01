import { useEffect } from 'react';
import type { GameState } from '@/types/battletech';
import { exportGameAsFile } from '@/lib/save-system';

interface UseKeyboardShortcutsProps {
  gameState: GameState | null;
  gameOver: { gameOver: boolean; winner: 'player' | 'ai' | 'draw' | null } | null;
  onSave: () => void;
  onLoad: () => void;
  onEndMovement: () => void;
  onEndCombat: () => void;
  onEndHeat: () => void;
}

export function useKeyboardShortcuts({
  gameState,
  gameOver,
  onSave,
  onLoad,
  onEndMovement,
  onEndCombat,
  onEndHeat,
}: UseKeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameState || gameOver) return;
      
      // Ctrl/Cmd + S = Save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        onSave();
      }
      
      // Ctrl/Cmd + L = Load
      if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        onLoad();
      }
      
      // Ctrl/Cmd + E = Export
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        exportGameAsFile(gameState, `battletech-turn-${gameState.turn}.json`);
      }
      
      // Space = End current phase
      if (e.key === ' ' && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        e.preventDefault();
        if (gameState.phase === 'movement') onEndMovement();
        else if (gameState.phase === 'combat') onEndCombat();
        else if (gameState.phase === 'heat') onEndHeat();
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState, gameOver, onSave, onLoad, onEndMovement, onEndCombat, onEndHeat]);
}
