// Room Management API

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001';

export interface Room {
  id: string;
  host: string | null;
  players: string[];
  game_state: any;
  created_at: string;
  status: 'waiting' | 'in_progress' | 'completed';
}

export async function createRoom(): Promise<{ room_id: string; status: string }> {
  const response = await fetch(`${API_URL}/api/rooms/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to create room');
  }
  
  return response.json();
}

export async function getRoom(roomId: string): Promise<Room> {
  const response = await fetch(`${API_URL}/api/rooms/${roomId}`);
  
  if (!response.ok) {
    throw new Error('Room not found');
  }
  
  return response.json();
}

export async function listRooms(): Promise<{ rooms: Room[] }> {
  const response = await fetch(`${API_URL}/api/rooms`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch rooms');
  }
  
  return response.json();
}

export async function deleteRoom(roomId: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/rooms/${roomId}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete room');
  }
}

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/api/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch {
    return false;
  }
}
