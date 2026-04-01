// Network Multiplayer Lobby with Backend Integration

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Users, Copy, Check, Wifi, WifiOff, Play } from 'lucide-react';
import { createRoom, getRoom, checkBackendHealth, type Room } from '@/services/room-api';
import { multiplayerClient } from '@/lib/websocket-client';

interface NetworkMultiplayerLobbyProps {
  onStartGame: (roomId: string, isHost: boolean, playerId: string) => void;
  onBack: () => void;
}

export function NetworkMultiplayerLobby({ onStartGame, onBack }: NetworkMultiplayerLobbyProps) {
  const [mode, setMode] = useState<'menu' | 'host' | 'join' | 'lobby'>('menu');
  const [roomCode, setRoomCode] = useState('');
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [playerCount, setPlayerCount] = useState(0);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ player: string; message: string }>>([]);

  // Check backend health on mount
  useEffect(() => {
    checkBackendHealth().then(setBackendOnline);
  }, []);

  // WebSocket event handlers
  useEffect(() => {
    if (mode !== 'lobby') return;

    const handlePlayerJoined = (message: any) => {
      setPlayerCount(message.total_players);
      setChatMessages(prev => [...prev, {
        player: 'System',
        message: `Player joined! (${message.total_players} total)`
      }]);
    };

    const handlePlayerLeft = (message: any) => {
      setPlayerCount(message.total_players);
      setChatMessages(prev => [...prev, {
        player: 'System',
        message: `Player left. (${message.total_players} remaining)`
      }]);
    };

    const handleGameStarted = (_message: any) => {
      if (currentRoom && playerId) {
        onStartGame(currentRoom.id, isHost, playerId);
      }
    };

    const handleChat = (message: any) => {
      setChatMessages(prev => [...prev, {
        player: message.player_id,
        message: message.message
      }]);
    };

    const handleError = (message: any) => {
      setError(message.message || 'An error occurred');
    };

    multiplayerClient.on('player_joined', handlePlayerJoined);
    multiplayerClient.on('player_left', handlePlayerLeft);
    multiplayerClient.on('game_started', handleGameStarted);
    multiplayerClient.on('chat', handleChat);
    multiplayerClient.on('error', handleError);

    return () => {
      multiplayerClient.off('player_joined', handlePlayerJoined);
      multiplayerClient.off('player_left', handlePlayerLeft);
      multiplayerClient.off('game_started', handleGameStarted);
      multiplayerClient.off('chat', handleChat);
      multiplayerClient.off('error', handleError);
    };
  }, [mode, currentRoom, playerId, isHost, onStartGame]);

  const handleCreateRoom = async () => {
    try {
      setError(null);
      const { room_id } = await createRoom();
      
      // Connect to WebSocket
      const { playerId: pid, isHost: host } = await multiplayerClient.connect(room_id);
      
      // Fetch room details
      const room = await getRoom(room_id);
      
      setRoomCode(room_id);
      setCurrentRoom(room);
      setPlayerId(pid);
      setIsHost(host);
      setPlayerCount(room.players.length);
      setMode('lobby');
    } catch (err) {
      setError('Failed to create room. Is the backend server running?');
      console.error(err);
    }
  };

  const handleJoinRoom = async () => {
    if (!roomCode.trim()) {
      setError('Please enter a room code');
      return;
    }

    try {
      setError(null);
      
      // Connect to WebSocket
      const { playerId: pid, isHost: host } = await multiplayerClient.connect(roomCode);
      
      // Fetch room details
      const room = await getRoom(roomCode);
      
      setCurrentRoom(room);
      setPlayerId(pid);
      setIsHost(host);
      setPlayerCount(room.players.length);
      setMode('lobby');
    } catch (err) {
      setError('Failed to join room. Check the room code and try again.');
      console.error(err);
    }
  };

  const handleStartGame = () => {
    if (!isHost) {
      setError('Only the host can start the game');
      return;
    }

    if (playerCount < 2) {
      setError('Need at least 2 players to start');
      return;
    }

    // Send start game signal
    multiplayerClient.startGame({} as any); // Game state will be initialized on game start
  };

  const handleCopyRoomCode = () => {
    if (currentRoom) {
      navigator.clipboard.writeText(currentRoom.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLeave = () => {
    multiplayerClient.disconnect();
    setMode('menu');
    setCurrentRoom(null);
    setPlayerId(null);
    setIsHost(false);
    setPlayerCount(0);
    setRoomCode('');
    setError(null);
  };

  // Backend offline warning
  if (backendOnline === false) {
    return (
      <div className="min-h-screen bg-gray-950 text-white p-6 flex items-center justify-center">
        <Card className="max-w-md w-full p-8 bg-gray-900 border-gray-700 text-center">
          <WifiOff className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Backend Offline</h2>
          <p className="text-gray-400 mb-6">
            The multiplayer server is not running. Please start the backend or use local hotseat mode.
          </p>
          <Button onClick={onBack} variant="outline" className="w-full">
            Back to Menu
          </Button>
        </Card>
      </div>
    );
  }

  // Loading
  if (backendOnline === null) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Connecting to server...</p>
        </div>
      </div>
    );
  }

  // Main Menu
  if (mode === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950 text-white p-6">
        <div className="max-w-2xl mx-auto">
          <Button onClick={onBack} variant="outline" className="mb-6 border-gray-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="text-center mb-8">
            <Wifi className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-2">Network Multiplayer</h1>
            <p className="text-gray-400">Play online with friends</p>
          </div>

          <div className="grid gap-4">
            <Card 
              className="p-6 bg-gray-900 border-gray-700 hover:border-blue-500 cursor-pointer transition-all"
              onClick={handleCreateRoom}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-1">Host Game</h3>
                  <p className="text-sm text-gray-400">Create a new room and invite friends</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gray-900 border-gray-700">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-1">Join Game</h3>
                  <p className="text-sm text-gray-400">Enter a room code to join</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Input
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="Enter room code..."
                  className="bg-gray-800 border-gray-700 text-white uppercase"
                  maxLength={8}
                />
                <Button onClick={handleJoinRoom} className="bg-green-600 hover:bg-green-700">
                  Join
                </Button>
              </div>
            </Card>
          </div>

          {error && (
            <Alert className="mt-4 bg-red-900/20 border-red-500/20">
              <AlertDescription className="text-red-400">{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    );
  }

  // Lobby
  if (mode === 'lobby' && currentRoom) {
    return (
      <div className="min-h-screen bg-gray-950 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <Button onClick={handleLeave} variant="outline" className="mb-6 border-gray-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Leave Room
          </Button>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Room Info */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="p-6 bg-gray-900 border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold">Game Lobby</h2>
                    <p className="text-gray-400">Waiting for players...</p>
                  </div>
                  {isHost && (
                    <Badge className="bg-blue-600">Host</Badge>
                  )}
                </div>

                <div className="bg-gray-800 p-4 rounded-lg mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Room Code</p>
                      <p className="text-2xl font-mono font-bold">{currentRoom.id}</p>
                    </div>
                    <Button
                      onClick={handleCopyRoomCode}
                      variant="outline"
                      size="sm"
                      className="border-gray-700"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400">
                    {playerCount} player{playerCount !== 1 ? 's' : ''} connected
                  </span>
                </div>
              </Card>

              {/* Chat */}
              <Card className="p-6 bg-gray-900 border-gray-700">
                <h3 className="font-semibold mb-3">Activity Log</h3>
                <div className="bg-gray-800 rounded-lg p-3 h-48 overflow-y-auto space-y-2">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className="text-sm">
                      <span className="text-blue-400 font-semibold">{msg.player}:</span>{' '}
                      <span className="text-gray-300">{msg.message}</span>
                    </div>
                  ))}
                  {chatMessages.length === 0 && (
                    <p className="text-gray-500 text-center py-8">No activity yet</p>
                  )}
                </div>
              </Card>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <Card className="p-6 bg-gray-900 border-gray-700">
                <h3 className="font-semibold mb-4">Game Setup</h3>
                
                {isHost ? (
                  <>
                    <p className="text-sm text-gray-400 mb-4">
                      Share the room code with friends. Start the game when everyone is ready.
                    </p>
                    <Button
                      onClick={handleStartGame}
                      disabled={playerCount < 2}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Game
                    </Button>
                    {playerCount < 2 && (
                      <p className="text-xs text-yellow-500 mt-2 text-center">
                        Need at least 2 players
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-gray-400">
                    Waiting for the host to start the game...
                  </p>
                )}
              </Card>

              <Card className="p-6 bg-gray-900 border-gray-700">
                <h3 className="font-semibold mb-2">Your Info</h3>
                <div className="text-sm space-y-2">
                  <div>
                    <span className="text-gray-400">Player ID:</span>
                    <p className="font-mono text-xs">{playerId}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Role:</span>
                    <p>{isHost ? 'Host' : 'Guest'}</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {error && (
            <Alert className="mt-4 bg-red-900/20 border-red-500/20">
              <AlertDescription className="text-red-400">{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    );
  }

  return null;
}
