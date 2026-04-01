// WebSocket Client for Multiplayer

import type { GameState } from '@/types/battletech';

export type WSMessageType = 
  | 'connected'
  | 'player_joined'
  | 'player_left'
  | 'game_state_sync'
  | 'game_started'
  | 'chat'
  | 'error';

export interface WSMessage {
  type: WSMessageType;
  [key: string]: any;
}

export type WSEventCallback = (message: WSMessage) => void;

export class MultiplayerClient {
  private ws: WebSocket | null = null;
  private roomId: string | null = null;
  private playerId: string | null = null;
  private isHost = false;
  private callbacks: Map<WSMessageType, Set<WSEventCallback>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000;
  private reconnectTimeout: number | null = null;
  private wsUrl: string;

  constructor(wsUrl: string) {
    this.wsUrl = wsUrl;
  }

  connect(roomId: string): Promise<{ playerId: string; isHost: boolean }> {
    return new Promise((resolve, reject) => {
      try {
        this.roomId = roomId;
        const url = `${this.wsUrl}/ws/${roomId}`;
        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
          console.log('✅ WebSocket connected to room:', roomId);
          this.reconnectAttempts = 0;
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WSMessage = JSON.parse(event.data);
            
            // Handle connection confirmation
            if (message.type === 'connected') {
              this.playerId = message.player_id as string;
              this.isHost = message.is_host as boolean;
              console.log('🎮 Connected as', this.isHost ? 'HOST' : 'PLAYER', this.playerId);
              resolve({ playerId: this.playerId, isHost: this.isHost });
            }

            // Trigger callbacks
            this.triggerCallbacks(message.type, message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('🔌 WebSocket disconnected');
          this.handleDisconnect();
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private handleDisconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts && this.roomId) {
      this.reconnectAttempts++;
      console.log(`🔄 Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      this.reconnectTimeout = window.setTimeout(() => {
        if (this.roomId) {
          this.connect(this.roomId).catch(() => {
            console.error('Reconnection failed');
          });
        }
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      this.triggerCallbacks('error', { 
        type: 'error', 
        message: 'Connection lost. Please refresh and rejoin.' 
      });
    }
  }

  on(event: WSMessageType, callback: WSEventCallback) {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, new Set());
    }
    this.callbacks.get(event)?.add(callback);
  }

  off(event: WSMessageType, callback: WSEventCallback) {
    this.callbacks.get(event)?.delete(callback);
  }

  private triggerCallbacks(event: WSMessageType, message: WSMessage) {
    this.callbacks.get(event)?.forEach(callback => {
      try {
        callback(message);
      } catch (error) {
        console.error('Error in callback:', error);
      }
    });
  }

  sendGameState(gameState: GameState) {
    this.send({
      type: 'game_state_update',
      game_state: gameState,
    });
  }

  sendChat(message: string) {
    this.send({
      type: 'chat',
      message,
    });
  }

  startGame(gameState: GameState) {
    if (!this.isHost) {
      console.warn('Only the host can start the game');
      return;
    }
    this.send({
      type: 'start_game',
      game_state: gameState,
    });
  }

  private send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket not connected. Cannot send:', data);
    }
  }

  disconnect() {
    if (this.reconnectTimeout) {
      window.clearTimeout(this.reconnectTimeout);
    }
    this.ws?.close();
    this.ws = null;
    this.roomId = null;
    this.playerId = null;
    this.isHost = false;
    this.callbacks.clear();
  }

  getPlayerId(): string | null {
    return this.playerId;
  }

  getIsHost(): boolean {
    return this.isHost;
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Singleton instance
const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8001';
export const multiplayerClient = new MultiplayerClient(wsUrl);
