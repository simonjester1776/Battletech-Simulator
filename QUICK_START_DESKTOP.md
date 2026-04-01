# 🎮 Quick Start - Windows Desktop Build

## TL;DR

```bash
# 1. Install dependencies
yarn add -D electron electron-builder concurrently wait-on
pip install pyinstaller

# 2. Build Python backend
cd backend && pyinstaller server.spec && cd ..

# 3. Build Windows installer
yarn package:win

# Output: electron-dist/BattleTech Tactical Simulator-Setup-2.1.1.exe
```

---

## Detailed Steps

### Step 1: Install Build Tools

```bash
# Electron dependencies
yarn add -D electron electron-builder concurrently wait-on

# Python packager
pip install pyinstaller
```

### Step 2: Create PyInstaller Spec

Create `/app/backend/server.spec`:

```python
# -*- mode: python ; coding: utf-8 -*-

a = Analysis(
    ['server.py'],
    pathex=[],
    binaries=[],
    datas=[('.env', '.')],
    hiddenimports=[
        'uvicorn.logging',
        'uvicorn.loops.auto',
        'uvicorn.protocols.http.auto',
        'uvicorn.protocols.websockets.auto',
        'uvicorn.lifespan.on',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=None,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=None)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='battletech-backend',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=False,  # Hide console window
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
```

### Step 3: Build Python Backend

```bash
cd backend
pyinstaller server.spec
# Output: backend/dist/battletech-backend.exe
```

Test it:
```bash
./dist/battletech-backend.exe
# Should start FastAPI server (no window if console=False)
```

### Step 4: Build React Frontend

```bash
yarn build
# Output: dist/ folder
```

### Step 5: Package with Electron

#### Development Test (optional)
```bash
# Test in dev mode
yarn electron:dev
# Opens Electron window with Vite dev server
```

#### Production Build
```bash
yarn package:win
# Builds Windows installer
# Output: electron-dist/BattleTech Tactical Simulator-Setup-2.1.1.exe
```

---

## What Gets Packaged

```
BattleTech Tactical Simulator-Setup-2.1.1.exe
└── Installer contains:
    ├── electron-main.js (Electron launcher)
    ├── dist/ (React app)
    ├── backend/battletech-backend.exe (Python server)
    └── node_modules (Electron runtime)

    Total size: ~180 MB
```

---

## Testing the Installer

1. **Run the installer** on a clean Windows machine
2. **Install to Program Files**
3. **Launch from Start Menu**
4. **Verify:**
   - App opens in window
   - Backend starts (no console window)
   - All 34 units load
   - Multiplayer works
   - Save/load works

---

## Troubleshooting

### "Backend not starting"
**Solution:** Check Windows Firewall, add exception:
```powershell
netsh advfirewall firewall add rule name="BattleTech Backend" dir=in action=allow program="C:\Program Files\BattleTech Tactical Simulator\resources\backend\battletech-backend.exe" enable=yes
```

### "Port 8001 already in use"
**Solution:** The electron-main.js automatically finds a free port

### "Can't connect to backend"
**Check:** Open DevTools (Ctrl+Shift+I) and look for connection errors

### "Build fails with PyInstaller"
**Solution:** Make sure all hidden imports are in server.spec:
```bash
pyinstaller --onefile --hidden-import uvicorn.logging server.py
```

---

## File Size Optimization

### Current: ~180 MB
### Optimized: ~120 MB

**How to reduce:**

1. **Remove source maps** in vite.config.ts:
```typescript
build: {
  sourcemap: false
}
```

2. **Use UPX compression** for backend:
```bash
pyinstaller --upx-dir /path/to/upx server.spec
```

3. **Tree-shake dependencies**:
```bash
yarn build --mode production
```

---

## Distribution

### Option A: Direct Download
Upload `BattleTech Tactical Simulator-Setup-2.1.1.exe` to:
- GitHub Releases
- Your own server
- itch.io (for game distribution)

### Option B: Auto-Updates (Advanced)
Add electron-updater:
```bash
yarn add electron-updater
```

Update electron-main.js:
```javascript
const { autoUpdater } = require('electron-updater');

app.whenReady().then(() => {
    autoUpdater.checkForUpdatesAndNotify();
});
```

### Option C: Windows Store (Advanced)
Convert to APPX:
```bash
electron-builder --win appx
```

---

## Code Signing (Optional but Recommended)

**Why:** Prevents "Unknown Publisher" warning

**How:**
1. Get a code signing certificate (~$100/year from DigiCert, Sectigo)
2. Configure in package.json:
```json
"win": {
  "certificateFile": "cert.pfx",
  "certificatePassword": "your-password"
}
```

3. Rebuild:
```bash
yarn package:win
```

---

## Next Steps

1. **Test the build** on Windows
2. **Create icon** (replace `public/vite.svg` with 256x256 .ico file)
3. **Add splash screen** (optional)
4. **Set up auto-updates** (optional)
5. **Publish to GitHub Releases**

---

## Already Configured ✅

- ✅ `electron-main.js` - Electron entry point
- ✅ `package.json` - Build scripts and config
- ✅ Backend auto-start on launch
- ✅ Backend auto-kill on quit
- ✅ Dynamic port finding
- ✅ Dev/production environment handling

**You're ready to build!**

Just run:
```bash
yarn package:win
```
