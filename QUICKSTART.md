# 🚀 Quick Start Guide

Get up and running with BattleTech Tactical Simulator in 5 minutes!

## Prerequisites

- Node.js 18+ and Yarn installed
- Python 3.11+ installed (for multiplayer)
- Modern web browser

---

## Installation (1 minute)

```bash
# Frontend dependencies are already installed
# Backend dependencies are already installed

# Verify installation
yarn --version
python --version
```

---

## Starting the Application (1 minute)

### Both Services (Recommended)

```bash
# Check status
sudo supervisorctl status

# Both should show RUNNING
# frontend  RUNNING  pid XXXX
# backend   RUNNING  pid XXXX
```

If not running:
```bash
sudo supervisorctl start frontend
sudo supervisorctl start backend
```

### Manual Start (Alternative)

**Terminal 1 - Frontend:**
```bash
yarn start
# Opens on http://localhost:3000
```

**Terminal 2 - Backend:**
```bash
cd backend
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
# Runs on http://localhost:8001
```

---

## First Game (3 minutes)

### Single Player

1. **Open** http://localhost:3000
2. **Click** "Single Player"
3. **Select Units:**
   - Player: Click 3 mechs (e.g., Atlas, Warhammer, Hunchback)
   - Enemy: Click 2 mechs (e.g., Timber Wolf, Marauder)
4. **Click** "Start Battle"
5. **Play:**
   - Click your unit → Click hex to move
   - Click enemy → Click weapon → Fire!
   - Click "End Movement" → "End Combat" → "End Heat"

### Online Multiplayer

**Player 1 (Host):**
1. Click "Online Multiplayer"
2. Click "Host Game"
3. Copy room code (e.g., "abc12345")
4. Share code with friend
5. Wait for them to join
6. Click "Start Game"

**Player 2 (Guest):**
1. Click "Online Multiplayer"
2. Enter room code
3. Click "Join"
4. Wait for host to start

---

## Keyboard Shortcuts

- `Ctrl/Cmd + S` - Save game
- `Ctrl/Cmd + L` - Load game
- `Ctrl/Cmd + E` - Export game
- `Space` - End current phase

---

## Verify Everything Works

### Health Checks
```bash
# Frontend
curl http://localhost:3000
# Should return HTML

# Backend
curl http://localhost:8001/api/health
# Should return: {"status":"healthy",...}

# Create test room
curl -X POST http://localhost:8001/api/rooms/create
# Should return: {"room_id":"...","status":"created"}
```

### Browser Test
1. Open http://localhost:3000
2. Should see main menu with 5 buttons
3. All buttons should be clickable

---

## Troubleshooting

### Frontend not loading?
```bash
# Restart frontend
sudo supervisorctl restart frontend

# Check logs
tail -20 /var/log/frontend.out.log
```

### Backend not responding?
```bash
# Restart backend
sudo supervisorctl restart backend

# Check logs
tail -20 /var/log/backend.out.log
```

### Port already in use?
```bash
# Check what's using port 3000
lsof -i :3000

# Check what's using port 8001
lsof -i :8001

# Kill process if needed
kill -9 <PID>
```

### Clear cache and restart
```bash
# Frontend
rm -rf node_modules .vite
yarn install
yarn start

# Backend
pip install --force-reinstall -r backend/requirements.txt
```

---

## Next Steps

- **Read full README:** `/app/README.md`
- **Try Campaign Mode:** Build your mercenary company
- **Use Mech Lab:** Customize your units
- **Check Mission Objectives:** Complete objectives for rewards
- **Test Multiplayer:** Play with a friend online

---

## Quick Reference

### Services
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:8001
- **API Docs:** http://localhost:8001/docs (FastAPI auto-generated)

### Logs
- Frontend: `/var/log/frontend.out.log`
- Backend: `/var/log/backend.out.log`
- Supervisor: `sudo supervisorctl tail -f frontend`

### Commands
```bash
# Status
sudo supervisorctl status

# Restart
sudo supervisorctl restart frontend backend

# Stop
sudo supervisorctl stop frontend backend

# Start
sudo supervisorctl start frontend backend

# View logs
sudo supervisorctl tail -f frontend
sudo supervisorctl tail -f backend
```

---

## Need Help?

1. Check [README.md](README.md) for detailed documentation
2. Check [INTEGRATION_TEST.md](INTEGRATION_TEST.md) for testing guide
3. Review logs for error messages
4. Check browser console (F12) for frontend errors

---

**You're ready to play! 🎮**

Select your lance and drop into combat! ⚔️
