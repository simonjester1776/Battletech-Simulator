# Desktop Packaging Guide - NW.js + PyInstaller + Inno Setup

**Target:** Standalone Windows executable for BattleTech Simulator  
**Approach:** Multi-runtime packaging (React frontend + Python backend)

---

## Prerequisites

1. **Node.js & Yarn** (already have)
2. **Python 3.11+** (already have)
3. **NW.js SDK** - Download from https://nwjs.io/downloads/
4. **PyInstaller** - `pip install pyinstaller`
5. **Inno Setup** - Download from https://jrsoftware.org/isdl.php

---

## Phase 1: Package Python Backend (PyInstaller)

### 1.1 Create PyInstaller Spec File

Create `/app/backend/battletech-backend.spec`:

```python
# -*- mode: python ; coding: utf-8 -*-

block_cipher = None

a = Analysis(
    ['server.py'],
    pathex=[],
    binaries=[],
    datas=[('.env', '.')],  # Include .env template
    hiddenimports=[
        'uvicorn.logging',
        'uvicorn.loops',
        'uvicorn.loops.auto',
        'uvicorn.protocols',
        'uvicorn.protocols.http',
        'uvicorn.protocols.http.auto',
        'uvicorn.protocols.websockets',
        'uvicorn.protocols.websockets.auto',
        'uvicorn.lifespan',
        'uvicorn.lifespan.on',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

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
    console=True,  # Set to False to hide console window
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon='../public/battletech-icon.ico'  # Optional: add icon
)
```

### 1.2 Build Backend Executable

```bash
cd /app/backend
pyinstaller battletech-backend.spec
# Output: dist/battletech-backend.exe
```

**Test the backend:**
```bash
./dist/battletech-backend.exe
# Should start FastAPI server on port 8001
```

---

## Phase 2: Package React Frontend (NW.js)

### 2.1 Update package.json

Add NW.js configuration to `/app/package.json`:

```json
{
  "name": "battletech-tactical-simulator",
  "version": "2.1.1",
  "main": "nw-main.html",
  "window": {
    "title": "BattleTech Tactical Simulator",
    "width": 1280,
    "height": 800,
    "min_width": 1024,
    "min_height": 600,
    "icon": "public/battletech-icon.png",
    "show": true,
    "frame": true,
    "position": "center"
  },
  "chromium-args": "--enable-logging --disable-web-security",
  "devDependencies": {
    "nw-builder": "^4.0.0"
  }
}
```

### 2.2 Create NW.js Entry Point

Create `/app/nw-main.html`:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>BattleTech Tactical Simulator</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            overflow: hidden;
            background: #0a0a0a;
        }
        #app {
            width: 100vw;
            height: 100vh;
        }
    </style>
</head>
<body>
    <div id="app">
        <iframe src="dist/index.html" style="width:100%; height:100%; border:none;"></iframe>
    </div>
    <script>
        // Start Python backend on app launch
        const nw = require('nw.gui');
        const { exec } = require('child_process');
        const path = require('path');
        
        // Path to bundled backend executable
        const backendPath = path.join(process.cwd(), 'backend', 'battletech-backend.exe');
        
        // Start backend server
        let backendProcess = exec(`"${backendPath}"`, (error, stdout, stderr) => {
            if (error) {
                console.error('Backend error:', error);
                return;
            }
        });
        
        // Cleanup on close
        nw.Window.get().on('close', function() {
            backendProcess.kill();
            this.close(true);
        });
        
        console.log('BattleTech Simulator starting...');
    </script>
</body>
</html>
```

### 2.3 Build Frontend

```bash
cd /app
yarn build
# Output: dist/ directory with compiled React app
```

### 2.4 Install NW.js Builder

```bash
yarn add -D nw-builder
```

### 2.5 Create NW.js Build Script

Create `/app/build-nw.js`:

```javascript
const nwbuild = require('nw-builder');

const nw = new nwbuild({
    files: [
        './dist/**/*',
        './backend/dist/battletech-backend.exe',
        './nw-main.html',
        './package.json'
    ],
    platforms: ['win64'],
    version: 'latest',
    flavor: 'normal',
    winIco: './public/battletech-icon.ico',
    appName: 'BattleTech Simulator',
    appVersion: '2.1.1'
});

nw.build().then(() => {
    console.log('✓ NW.js build complete!');
}).catch((error) => {
    console.error('Build failed:', error);
});
```

### 2.6 Run NW.js Build

```bash
node build-nw.js
# Output: build/ directory with NW.js app
```

---

## Phase 3: Create Windows Installer (Inno Setup)

### 3.1 Create Inno Setup Script

Create `/app/installer.iss`:

```inno
#define MyAppName "BattleTech Tactical Simulator"
#define MyAppVersion "2.1.1"
#define MyAppPublisher "Jester's Reavers"
#define MyAppURL "https://github.com/simonjester1776/Battletech-Simulator"
#define MyAppExeName "BattleTech.exe"

[Setup]
AppId={{YOUR-GUID-HERE}}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppName}
AllowNoIcons=yes
LicenseFile=LICENSE
OutputDir=installer-output
OutputBaseFilename=BattleTech-Simulator-Setup-{#MyAppVersion}
SetupIconFile=public\battletech-icon.ico
Compression=lzma2
SolidCompression=yes
WizardStyle=modern
ArchitecturesAllowed=x64
ArchitecturesInstallIn64BitMode=x64

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
Source: "build\BattleTech Simulator\win64\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{group}\{cm:UninstallProgram,{#MyAppName}}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent
```

### 3.2 Compile Installer

1. Open **Inno Setup Compiler**
2. Load `installer.iss`
3. Click **Build → Compile**
4. Output: `installer-output/BattleTech-Simulator-Setup-2.1.1.exe`

---

## Alternative: Electron (Recommended for Easier Setup)

If NW.js proves complex, **Electron** has better tooling:

### Benefits of Electron over NW.js
✅ Better child process management  
✅ `electron-builder` handles packaging automatically  
✅ Auto-update support built-in  
✅ Larger community & better docs  

### Quick Electron Setup

```bash
yarn add -D electron electron-builder
```

Create `/app/electron-main.js`:

```javascript
const { app, BrowserWindow } = require('electron');
const { spawn } = require('child_process');
const path = require('path');

let mainWindow;
let backendProcess;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        },
        icon: path.join(__dirname, 'public/battletech-icon.ico')
    });
    
    mainWindow.loadFile('dist/index.html');
}

function startBackend() {
    const backendPath = path.join(__dirname, 'backend', 'battletech-backend.exe');
    backendProcess = spawn(backendPath);
    
    backendProcess.on('error', (err) => {
        console.error('Backend failed:', err);
    });
}

app.whenReady().then(() => {
    startBackend();
    createWindow();
});

app.on('window-all-closed', () => {
    if (backendProcess) {
        backendProcess.kill();
    }
    app.quit();
});
```

Update `package.json`:

```json
{
  "main": "electron-main.js",
  "scripts": {
    "electron": "electron .",
    "build:electron": "electron-builder"
  },
  "build": {
    "appId": "com.jestersreavers.battletech",
    "productName": "BattleTech Simulator",
    "directories": {
      "output": "electron-dist"
    },
    "files": [
      "dist/**/*",
      "backend/dist/**/*",
      "electron-main.js"
    ],
    "win": {
      "target": "nsis",
      "icon": "public/battletech-icon.ico"
    }
  }
}
```

Build:
```bash
yarn build:electron
# Output: electron-dist/BattleTech Simulator Setup.exe
```

---

## Comparison: NW.js vs Electron vs Tauri

| Feature | NW.js | Electron | Tauri |
|---------|-------|----------|-------|
| **Bundle Size** | ~150 MB | ~180 MB | ~15 MB |
| **Ease of Setup** | Medium | Easy | Hard |
| **Python Support** | Via child process | Via child process | Via child process |
| **Auto-update** | Manual | Built-in | Built-in |
| **Community** | Small | Large | Growing |
| **Best For** | Chrome apps | Desktop apps | Modern apps |

**Recommendation:** Use **Electron** for this project.

---

## Challenges to Expect

### 1. Backend Port Conflicts
**Problem:** If another app uses port 8001, backend fails  
**Solution:** Dynamic port assignment + config file

```python
# backend/server.py
import socket

def find_free_port(start=8001, end=8100):
    for port in range(start, end):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            if s.connect_ex(('localhost', port)) != 0:
                return port
    raise RuntimeError("No free ports available")

port = find_free_port()
uvicorn.run(app, host="0.0.0.0", port=port)
```

### 2. CORS Issues
**Problem:** Frontend can't connect to backend  
**Solution:** Update frontend to use configurable backend URL

```typescript
// src/lib/config.ts
export const BACKEND_URL = 
    import.meta.env.VITE_BACKEND_URL || 
    'http://localhost:8001';
```

### 3. Firewall Prompts
**Problem:** Windows Firewall blocks backend  
**Solution:** Sign executables or add installer step to whitelist

---

## Testing Checklist

Before distributing:

- [ ] Backend starts without errors
- [ ] Frontend connects to backend
- [ ] WebSocket multiplayer works
- [ ] Save/load system works
- [ ] All 34 units load correctly
- [ ] Installer creates Start Menu shortcuts
- [ ] Uninstaller removes all files
- [ ] App works offline (no internet required)
- [ ] No console windows appear (if disabled)

---

## File Size Estimates

- **NW.js build:** ~200 MB
- **Electron build:** ~220 MB
- **Tauri build:** ~30 MB (if you rewrite backend to Rust)

**Final installer:** ~150-180 MB (with compression)

---

## Next Steps

1. Choose packaging approach (Electron recommended)
2. Create icon file (`battletech-icon.ico`)
3. Test backend PyInstaller build
4. Test Electron packaging
5. Create Inno Setup installer
6. Test on clean Windows machine

**Want me to implement the Electron approach for you?**
