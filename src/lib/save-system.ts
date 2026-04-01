// Game Save/Load System

import type { GameState } from '@/types/battletech';

export interface SavedGame {
  version: string;
  timestamp: number;
  name: string;
  gameState: any; // Serialized game state
}

const SAVE_KEY_PREFIX = 'battletech_save_';
const SAVE_LIST_KEY = 'battletech_save_list';

// Serialize a GameState for saving
export function serializeGameState(state: GameState): string {
  const serializable = {
    ...state,
    hexGrid: Array.from(state.hexGrid.entries()),
    units: state.units.map(unit => ({
      ...unit,
      locations: Array.from(unit.locations.entries())
    }))
  };
  
  return JSON.stringify(serializable);
}

// Deserialize a saved GameState
export function deserializeGameState(data: string): GameState {
  const parsed = JSON.parse(data);
  
  return {
    ...parsed,
    hexGrid: new Map(parsed.hexGrid),
    units: parsed.units.map((unit: any) => ({
      ...unit,
      locations: new Map(unit.locations)
    }))
  };
}

// Save game to localStorage
export function saveGame(state: GameState, name: string): boolean {
  try {
    const savedGame: SavedGame = {
      version: '1.0',
      timestamp: Date.now(),
      name,
      gameState: serializeGameState(state)
    };
    
    const saveId = `${SAVE_KEY_PREFIX}${Date.now()}`;
    localStorage.setItem(saveId, JSON.stringify(savedGame));
    
    // Update save list
    const saveList = getSaveList();
    saveList.push({ id: saveId, name, timestamp: savedGame.timestamp });
    localStorage.setItem(SAVE_LIST_KEY, JSON.stringify(saveList));
    
    return true;
  } catch (error) {
    console.error('Failed to save game:', error);
    return false;
  }
}

// Load game from localStorage
export function loadGame(saveId: string): GameState | null {
  try {
    const data = localStorage.getItem(saveId);
    if (!data) return null;
    
    const savedGame: SavedGame = JSON.parse(data);
    return deserializeGameState(savedGame.gameState);
  } catch (error) {
    console.error('Failed to load game:', error);
    return null;
  }
}

// Get list of saved games
export function getSaveList(): Array<{ id: string; name: string; timestamp: number }> {
  try {
    const data = localStorage.getItem(SAVE_LIST_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to get save list:', error);
    return [];
  }
}

// Delete a saved game
export function deleteSave(saveId: string): boolean {
  try {
    localStorage.removeItem(saveId);
    
    const saveList = getSaveList();
    const updatedList = saveList.filter(save => save.id !== saveId);
    localStorage.setItem(SAVE_LIST_KEY, JSON.stringify(updatedList));
    
    return true;
  } catch (error) {
    console.error('Failed to delete save:', error);
    return false;
  }
}

// Export game as JSON file
export function exportGameAsFile(state: GameState, filename: string = 'battletech-save.json'): void {
  const savedGame: SavedGame = {
    version: '1.0',
    timestamp: Date.now(),
    name: filename,
    gameState: serializeGameState(state)
  };
  
  const blob = new Blob([JSON.stringify(savedGame, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

// Import game from JSON file
export function importGameFromFile(file: File): Promise<GameState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const data = event.target?.result as string;
        const savedGame: SavedGame = JSON.parse(data);
        const gameState = deserializeGameState(savedGame.gameState);
        resolve(gameState);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

// Delete all saved games
export function deleteAllSaves(): boolean {
  try {
    const saveList = getSaveList();
    
    // Remove each save from localStorage
    saveList.forEach(save => {
      localStorage.removeItem(save.id);
    });
    
    // Clear the save list
    localStorage.removeItem(SAVE_LIST_KEY);
    
    return true;
  } catch (error) {
    console.error('Failed to delete all saves:', error);
    return false;
  }
}

// Get save statistics
export function getSaveStats(): { totalSaves: number; totalSize: number } {
  try {
    const saveList = getSaveList();
    let totalSize = 0;
    
    saveList.forEach(save => {
      const data = localStorage.getItem(save.id);
      if (data) {
        totalSize += new Blob([data]).size;
      }
    });
    
    return {
      totalSaves: saveList.length,
      totalSize, // Size in bytes
    };
  } catch (error) {
    console.error('Failed to get save stats:', error);
    return { totalSaves: 0, totalSize: 0 };
  }
}
