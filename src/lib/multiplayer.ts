// Multiplayer System for BattleTech

export type GameMode = 'singleplayer' | 'hotseat' | 'network';
export type PlayerType = 'local' | 'ai' | 'remote';

export interface MultiplayerConfig {
  mode: GameMode;
  playerOne: {
    type: PlayerType;
    name: string;
  };
  playerTwo: {
    type: PlayerType;
    name: string;
  };
}

export interface NetworkMessage {
  type: 'move' | 'attack' | 'phase_end' | 'chat' | 'sync';
  payload: any;
  timestamp: number;
  playerId: string;
}

// Hot-seat multiplayer manager
export class HotSeatManager {
  private currentPlayer: 'player' | 'ai' = 'player';
  private playerNames: { player: string; ai: string };
  
  constructor(player1Name: string, player2Name: string) {
    this.playerNames = {
      player: player1Name,
      ai: player2Name
    };
  }
  
  getCurrentPlayer(): 'player' | 'ai' {
    return this.currentPlayer;
  }
  
  getCurrentPlayerName(): string {
    return this.playerNames[this.currentPlayer];
  }
  
  switchPlayer(): void {
    this.currentPlayer = this.currentPlayer === 'player' ? 'ai' : 'player';
  }
  
  isHumanTurn(): boolean {
    return true; // In hot-seat, both are human
  }
}

// Simple peer-to-peer networking using WebRTC
export class NetworkManager {
  private peer: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private onMessage: ((message: NetworkMessage) => void) | null = null;
  
  async createRoom(): Promise<string> {
    this.peer = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });
    
    this.dataChannel = this.peer.createDataChannel('battletech');
    this.setupDataChannel(this.dataChannel);
    
    const offer = await this.peer.createOffer();
    await this.peer.setLocalDescription(offer);
    
    // Return offer as room code (in real app, would use signaling server)
    return btoa(JSON.stringify(offer));
  }
  
  async joinRoom(roomCode: string): Promise<void> {
    this.peer = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });
    
    const offer = JSON.parse(atob(roomCode));
    await this.peer.setRemoteDescription(offer);
    
    const answer = await this.peer.createAnswer();
    await this.peer.setLocalDescription(answer);
    
    this.peer.ondatachannel = (event) => {
      this.dataChannel = event.channel;
      this.setupDataChannel(this.dataChannel);
    };
  }
  
  private setupDataChannel(channel: RTCDataChannel): void {
    channel.onopen = () => console.log('Data channel opened');
    channel.onclose = () => console.log('Data channel closed');
    channel.onmessage = (event) => {
      const message: NetworkMessage = JSON.parse(event.data);
      if (this.onMessage) {
        this.onMessage(message);
      }
    };
  }
  
  sendMessage(message: NetworkMessage): void {
    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      this.dataChannel.send(JSON.stringify(message));
    }
  }
  
  setMessageHandler(handler: (message: NetworkMessage) => void): void {
    this.onMessage = handler;
  }
  
  disconnect(): void {
    if (this.dataChannel) this.dataChannel.close();
    if (this.peer) this.peer.close();
  }
}

// Spectator mode - record game for replay
export interface GameEvent {
  turn: number;
  phase: string;
  type: string;
  data: any;
  timestamp: number;
}

export class SpectatorRecorder {
  private events: GameEvent[] = [];
  private recording: boolean = false;
  
  startRecording(): void {
    this.recording = true;
    this.events = [];
  }
  
  stopRecording(): void {
    this.recording = false;
  }
  
  recordEvent(event: GameEvent): void {
    if (this.recording) {
      this.events.push(event);
    }
  }
  
  getRecording(): GameEvent[] {
    return [...this.events];
  }
  
  exportReplay(filename: string = 'battletech-replay.json'): void {
    const replay = {
      version: '2.0',
      timestamp: Date.now(),
      events: this.events
    };
    
    const blob = new Blob([JSON.stringify(replay, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }
}
