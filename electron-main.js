const { app, BrowserWindow } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

let mainWindow;
let backendProcess;

// Find free port for backend
function findFreePort(startPort = 8001) {
    return new Promise((resolve) => {
        const net = require('net');
        const server = net.createServer();
        
        server.listen(startPort, () => {
            const { port } = server.address();
            server.close(() => resolve(port));
        });
        
        server.on('error', () => {
            resolve(findFreePort(startPort + 1));
        });
    });
}

async function startBackend() {
    console.log('🐍 Starting Python backend...');
    
    // Determine backend executable path
    const isDev = !app.isPackaged;
    const backendPath = isDev
        ? path.join(__dirname, 'backend', 'server.py')
        : path.join(process.resourcesPath, 'backend', 'battletech-backend.exe');
    
    const port = await findFreePort(8001);
    
    // Start backend
    if (isDev) {
        // Development: run Python script directly
        backendProcess = spawn('python', [backendPath, '--port', port], {
            env: { ...process.env, PORT: port }
        });
    } else {
        // Production: run compiled executable
        backendProcess = spawn(backendPath, ['--port', port]);
    }
    
    backendProcess.stdout.on('data', (data) => {
        console.log(`[Backend] ${data}`);
    });
    
    backendProcess.stderr.on('data', (data) => {
        console.error(`[Backend Error] ${data}`);
    });
    
    backendProcess.on('error', (err) => {
        console.error('❌ Failed to start backend:', err);
    });
    
    // Wait for backend to be ready
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log(`✅ Backend running on port ${port}`);
    return port;
}

async function createWindow(backendPort) {
    console.log('🪟 Creating main window...');
    
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 1024,
        minHeight: 600,
        backgroundColor: '#0a0a0a',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            devTools: true
        },
        icon: path.join(__dirname, 'public', 'vite.svg'),
        show: false,
        frame: true,
        title: 'BattleTech Tactical Simulator'
    });
    
    // Load app
    const isDev = !app.isPackaged;
    if (isDev) {
        // Development: load from Vite dev server
        mainWindow.loadURL('http://localhost:3000');
        mainWindow.webContents.openDevTools();
    } else {
        // Production: load from dist
        mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
    }
    
    // Show window when ready
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        console.log('✅ Window ready');
    });
    
    // Handle window close
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// App lifecycle
app.whenReady().then(async () => {
    console.log('🎮 BattleTech Tactical Simulator starting...');
    
    try {
        const backendPort = await startBackend();
        await createWindow(backendPort);
    } catch (error) {
        console.error('❌ Startup failed:', error);
        app.quit();
    }
});

app.on('window-all-closed', () => {
    console.log('🛑 All windows closed, shutting down...');
    
    if (backendProcess) {
        console.log('🐍 Killing backend process...');
        backendProcess.kill('SIGTERM');
        
        // Force kill after 2 seconds if still running
        setTimeout(() => {
            if (backendProcess && !backendProcess.killed) {
                backendProcess.kill('SIGKILL');
            }
        }, 2000);
    }
    
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// Handle uncaught errors
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught exception:', error);
});

console.log('⚡ Electron main process loaded');
