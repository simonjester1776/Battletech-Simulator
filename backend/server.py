from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List, Set
import json
import uuid
import asyncio
from datetime import datetime

app = FastAPI(title="BattleTech Multiplayer Server")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Game rooms storage
rooms: Dict[str, dict] = {}
# Active WebSocket connections per room
connections: Dict[str, List[WebSocket]] = {}

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, room_id: str):
        await websocket.accept()
        if room_id not in self.active_connections:
            self.active_connections[room_id] = set()
        self.active_connections[room_id].add(websocket)

    def disconnect(self, websocket: WebSocket, room_id: str):
        if room_id in self.active_connections:
            self.active_connections[room_id].discard(websocket)
            if not self.active_connections[room_id]:
                del self.active_connections[room_id]

    async def broadcast(self, message: dict, room_id: str, exclude: WebSocket = None):
        if room_id in self.active_connections:
            disconnected = set()
            for connection in self.active_connections[room_id]:
                if connection != exclude:
                    try:
                        await connection.send_json(message)
                    except Exception:
                        disconnected.add(connection)
            
            # Clean up disconnected clients
            for connection in disconnected:
                self.disconnect(connection, room_id)

manager = ConnectionManager()

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "battletech-multiplayer", "timestamp": datetime.now().isoformat()}

@app.post("/api/rooms/create")
async def create_room():
    """Create a new game room"""
    room_id = str(uuid.uuid4())[:8]
    rooms[room_id] = {
        "id": room_id,
        "host": None,
        "players": [],
        "game_state": None,
        "created_at": datetime.now().isoformat(),
        "status": "waiting"
    }
    return {"room_id": room_id, "status": "created"}

@app.get("/api/rooms/{room_id}")
async def get_room(room_id: str):
    """Get room information"""
    if room_id not in rooms:
        raise HTTPException(status_code=404, detail="Room not found")
    return rooms[room_id]

@app.get("/api/rooms")
async def list_rooms():
    """List all active rooms"""
    return {"rooms": list(rooms.values())}

@app.websocket("/ws/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str):
    """WebSocket endpoint for real-time game synchronization"""
    
    # Create room if it doesn't exist
    if room_id not in rooms:
        rooms[room_id] = {
            "id": room_id,
            "host": None,
            "players": [],
            "game_state": None,
            "created_at": datetime.now().isoformat(),
            "status": "waiting"
        }
    
    await manager.connect(websocket, room_id)
    
    # Assign player ID
    player_id = str(uuid.uuid4())[:8]
    
    try:
        # Set host if this is the first player
        if rooms[room_id]["host"] is None:
            rooms[room_id]["host"] = player_id
        
        rooms[room_id]["players"].append(player_id)
        
        # Send welcome message
        await websocket.send_json({
            "type": "connected",
            "player_id": player_id,
            "is_host": player_id == rooms[room_id]["host"],
            "room": rooms[room_id]
        })
        
        # Notify other players
        await manager.broadcast({
            "type": "player_joined",
            "player_id": player_id,
            "total_players": len(rooms[room_id]["players"])
        }, room_id, exclude=websocket)
        
        # Main message loop
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Handle different message types
            if message["type"] == "game_state_update":
                # Update and broadcast game state
                rooms[room_id]["game_state"] = message["game_state"]
                await manager.broadcast({
                    "type": "game_state_sync",
                    "game_state": message["game_state"],
                    "from_player": player_id
                }, room_id, exclude=websocket)
            
            elif message["type"] == "chat":
                # Broadcast chat message
                await manager.broadcast({
                    "type": "chat",
                    "player_id": player_id,
                    "message": message["message"],
                    "timestamp": datetime.now().isoformat()
                }, room_id)
            
            elif message["type"] == "start_game":
                # Host starts the game
                if player_id == rooms[room_id]["host"]:
                    rooms[room_id]["status"] = "in_progress"
                    await manager.broadcast({
                        "type": "game_started",
                        "game_state": message.get("game_state")
                    }, room_id)
    
    except WebSocketDisconnect:
        manager.disconnect(websocket, room_id)
        if room_id in rooms:
            rooms[room_id]["players"].remove(player_id)
            
            # If host left, assign new host
            if rooms[room_id]["host"] == player_id and rooms[room_id]["players"]:
                rooms[room_id]["host"] = rooms[room_id]["players"][0]
            
            # Clean up empty rooms
            if not rooms[room_id]["players"]:
                del rooms[room_id]
            else:
                await manager.broadcast({
                    "type": "player_left",
                    "player_id": player_id,
                    "total_players": len(rooms[room_id]["players"])
                }, room_id)

@app.delete("/api/rooms/{room_id}")
async def delete_room(room_id: str):
    """Delete a game room"""
    if room_id in rooms:
        # Disconnect all websockets
        if room_id in manager.active_connections:
            for connection in list(manager.active_connections[room_id]):
                await connection.close()
        del rooms[room_id]
        return {"status": "deleted"}
    raise HTTPException(status_code=404, detail="Room not found")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
