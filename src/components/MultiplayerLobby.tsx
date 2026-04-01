// Multiplayer Lobby UI

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { GameMode } from '@/lib/multiplayer';
import { HotSeatManager, NetworkManager } from '@/lib/multiplayer';
import { cn } from '@/lib/utils';
import { Users, Wifi, Monitor } from 'lucide-react';

interface MultiplayerLobbyProps {
  onStartGame: (mode: GameMode, config: any) => void;
  onBack: () => void;
}

export function MultiplayerLobby({ onStartGame, onBack }: MultiplayerLobbyProps) {
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [player1Name, setPlayer1Name] = useState('Player 1');
  const [player2Name, setPlayer2Name] = useState('Player 2');
  const [roomCode, setRoomCode] = useState('');
  const [generatedRoomCode, setGeneratedRoomCode] = useState('');
  const [isHost, setIsHost] = useState(false);
  
  const modes = [
    {
      id: 'hotseat' as GameMode,
      name: 'Hot-Seat',
      description: 'Two players on the same device',
      icon: Monitor,
      color: 'blue'
    },
    {
      id: 'network' as GameMode,
      name: 'Network Play',
      description: 'Play over the internet',
      icon: Wifi,
      color: 'green'
    }
  ];
  
  const handleCreateRoom = async () => {
    const manager = new NetworkManager();
    const code = await manager.createRoom();
    setGeneratedRoomCode(code);
    setIsHost(true);
  };
  
  const handleJoinRoom = () => {
    const manager = new NetworkManager();
    manager.joinRoom(roomCode);
    onStartGame('network', {
      isHost: false,
      roomCode,
      playerName: player1Name
    });
  };
  
  const handleStartHotSeat = () => {
    const hotSeatManager = new HotSeatManager(player1Name, player2Name);
    onStartGame('hotseat', {
      hotSeatManager,
      player1Name,
      player2Name
    });
  };
  
  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
                Multiplayer Lobby
              </h1>
              <p className="text-gray-400">Choose your game mode</p>
            </div>
            <Button onClick={onBack} variant="outline" data-testid="lobby-back-btn">
              Back
            </Button>
          </div>
        </header>
        
        {!selectedMode ? (
          // Mode Selection
          <div className="grid md:grid-cols-2 gap-6">
            {modes.map(mode => {
              const Icon = mode.icon;
              return (
                <button
                  key={mode.id}
                  onClick={() => setSelectedMode(mode.id)}
                  className={cn(
                    "bg-gray-900 border-2 rounded-lg p-8 text-left transition-all hover:scale-105",
                    `border-${mode.color}-500/50 hover:border-${mode.color}-500`
                  )}
                  data-testid={`mode-${mode.id}`}
                >
                  <Icon className={`w-12 h-12 mb-4 text-${mode.color}-400`} />
                  <h2 className="text-2xl font-bold mb-2">{mode.name}</h2>
                  <p className="text-gray-400">{mode.description}</p>
                </button>
              );
            })}
          </div>
        ) : selectedMode === 'hotseat' ? (
          // Hot-Seat Setup
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Hot-Seat Setup</h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Player 1 Name</label>
                <Input
                  value={player1Name}
                  onChange={(e) => setPlayer1Name(e.target.value)}
                  placeholder="Enter player 1 name..."
                  className="bg-gray-800 border-gray-700 text-white"
                  data-testid="player1-name-input"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">Player 2 Name</label>
                <Input
                  value={player2Name}
                  onChange={(e) => setPlayer2Name(e.target.value)}
                  placeholder="Enter player 2 name..."
                  className="bg-gray-800 border-gray-700 text-white"
                  data-testid="player2-name-input"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <Button 
                onClick={() => setSelectedMode(null)}
                variant="outline"
              >
                Back
              </Button>
              <Button 
                onClick={handleStartHotSeat}
                className="bg-blue-600 hover:bg-blue-700"
                data-testid="start-hotseat-btn"
              >
                Start Game
              </Button>
            </div>
          </div>
        ) : (
          // Network Play Setup
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Network Play</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Host Game */}
              <div className="border border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-bold mb-4 text-green-400">Host a Game</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Your Name</label>
                    <Input
                      value={player1Name}
                      onChange={(e) => setPlayer1Name(e.target.value)}
                      placeholder="Enter your name..."
                      className="bg-gray-800 border-gray-700 text-white"
                      data-testid="host-name-input"
                    />
                  </div>
                  
                  {generatedRoomCode ? (
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Room Code</label>
                      <div className="bg-gray-800 border border-green-500 rounded p-3">
                        <code className="text-green-400 font-mono text-sm break-all">
                          {generatedRoomCode}
                        </code>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Share this code with your opponent</p>
                    </div>
                  ) : (
                    <Button 
                      onClick={handleCreateRoom}
                      className="w-full bg-green-600 hover:bg-green-700"
                      data-testid="create-room-btn"
                    >
                      Create Room
                    </Button>
                  )}
                  
                  {generatedRoomCode && (
                    <Button 
                      onClick={() => onStartGame('network', {
                        isHost: true,
                        roomCode: generatedRoomCode,
                        playerName: player1Name
                      })}
                      className="w-full bg-green-600 hover:bg-green-700"
                      data-testid="start-as-host-btn"
                    >
                      Start Game (Waiting for Opponent...)
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Join Game */}
              <div className="border border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-bold mb-4 text-blue-400">Join a Game</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Your Name</label>
                    <Input
                      value={player1Name}
                      onChange={(e) => setPlayer1Name(e.target.value)}
                      placeholder="Enter your name..."
                      className="bg-gray-800 border-gray-700 text-white"
                      data-testid="join-name-input"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Room Code</label>
                    <Input
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value)}
                      placeholder="Enter room code..."
                      className="bg-gray-800 border-gray-700 text-white font-mono"
                      data-testid="room-code-input"
                    />
                  </div>
                  
                  <Button 
                    onClick={handleJoinRoom}
                    disabled={!roomCode}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    data-testid="join-room-btn"
                  >
                    Join Game
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <Button 
                onClick={() => setSelectedMode(null)}
                variant="outline"
              >
                Back
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
