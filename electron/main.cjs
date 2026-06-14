const { app, BrowserWindow, ipcMain } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');

const PROTOCOL_NAME = 'lulupharma';
const API_PORT = 5000;
const API_URL = `http://127.0.0.1:${API_PORT}`;
const HEALTH_URL = `${API_URL}/api/health`;

const isDev = !app.isPackaged;

app.setName('Lulu Pharma Desktop');

const gotLock = app.requestSingleInstanceLock();

let mainWindow = null;
let setupWindow = null;
let backendProcess = null;

if (!gotLock) {
    app.quit();
}

const getConfigPath = () => path.join(app.getPath('userData'), 'config.json');

const loadConfig = () => {
    const configPath = getConfigPath();
    if (!fs.existsSync(configPath)) return null;
    try {
        return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch {
        return null;
    }
};

const saveConfig = (config) => {
    fs.mkdirSync(app.getPath('userData'), { recursive: true });
    fs.writeFileSync(getConfigPath(), JSON.stringify(config, null, 2), 'utf8');
};

const getBackendPath = () => {
    if (isDev) {
        const bundleBackendPath = path.join(__dirname, '../desktop-bundle/backend');
        if (fs.existsSync(bundleBackendPath)) {
            return bundleBackendPath;
        }
        return path.join(__dirname, '../../backend');
    }
    return path.join(process.resourcesPath, 'backend');
};

const getFrontendDistPath = () => {
    if (isDev) {
        return path.join(__dirname, '../dist');
    }
    return path.join(process.resourcesPath, 'app');
};

const waitForBackend = (timeoutMs = 60000) => new Promise((resolve, reject) => {
    const startedAt = Date.now();

    const check = () => {
        const req = http.get(HEALTH_URL, (res) => {
            res.resume();
            if (res.statusCode === 200) {
                resolve();
                return;
            }
            retry();
        });

        req.on('error', retry);
        req.setTimeout(3000, () => {
            req.destroy();
            retry();
        });
    };

    const retry = () => {
        if (Date.now() - startedAt > timeoutMs) {
            reject(new Error('تعذر تشغيل الخادم المحلي. تأكد من تشغيل PostgreSQL وصحة رابط قاعدة البيانات.'));
            return;
        }
        setTimeout(check, 1000);
    };

    check();
});

const stopBackend = () => {
    if (!backendProcess) return;
    backendProcess.kill('SIGTERM');
    backendProcess = null;
};

const startBackend = (config) => {
    const backendPath = getBackendPath();
    const frontendDist = getFrontendDistPath();
    const appScript = path.join(backendPath, 'src', 'app.js');

    if (!fs.existsSync(appScript)) {
        throw new Error('ملفات النظام غير مكتملة. أعد تثبيت البرنامج.');
    }

    const env = {
        ...process.env,
        NODE_ENV: 'production',
        DESKTOP_MODE: 'true',
        PORT: String(API_PORT),
        DATABASE_URL: config.databaseUrl,
        JWT_SECRET: config.jwtSecret,
        FRONTEND_DIST_PATH: frontendDist
    };
    
    console.log('SPAWNING BACKEND WITH DB URL:', config.databaseUrl, env.DATABASE_URL);

    backendProcess = spawn(process.execPath, [appScript], {
        cwd: backendPath,
        env: {
            ...env,
            ELECTRON_RUN_AS_NODE: '1'
        },
        stdio: isDev ? 'inherit' : 'ignore',
        windowsHide: true
    });

    backendProcess.on('exit', (code) => {
        backendProcess = null;
        if (code && code !== 0 && mainWindow) {
            const { dialog } = require('electron');
            dialog.showErrorBox(
                'خطأ في النظام',
                'توقف الخادم المحلي. تأكد من تشغيل PostgreSQL وصحة إعدادات قاعدة البيانات.'
            );
        }
    });
};

const createMainWindow = () => {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1024,
        minHeight: 700,
        title: 'لولو فارما - نظام الكاشير',
        icon: path.join(__dirname, '../public/favicon.svg'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    mainWindow.setMenuBarVisibility(false);
    mainWindow.loadURL(API_URL);

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
};

const createSetupWindow = () => {
    setupWindow = new BrowserWindow({
        width: 520,
        height: 480,
        resizable: false,
        title: 'إعداد لولو فارما',
        icon: path.join(__dirname, '../public/favicon.svg'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    setupWindow.setMenuBarVisibility(false);
    setupWindow.loadFile(path.join(__dirname, 'setup.html'));

    setupWindow.on('closed', () => {
        setupWindow = null;
    });
};

const launchDesktopApp = async () => {
    const backendPath = getBackendPath();
    const sourceDbPath = path.join(backendPath, 'dev.db');
    const userDataDbPath = path.join(app.getPath('userData'), 'dev.db');
    
    // Copy DB to writable location if it doesn't exist (important for production packaged app)
    if (!fs.existsSync(userDataDbPath)) {
        if (fs.existsSync(sourceDbPath)) {
            fs.copyFileSync(sourceDbPath, userDataDbPath);
        } else {
            console.error('Source dev.db not found at', sourceDbPath);
        }
    }

    const config = {
        databaseUrl: `file:${userDataDbPath}`,
        jwtSecret: 'lulu_offline_secret_key' 
    };

    try {
        stopBackend();
        startBackend(config);
        await waitForBackend();
        if (setupWindow) {
            setupWindow.close();
            setupWindow = null;
        }
        if (!mainWindow) {
            createMainWindow();
        } else {
            mainWindow.loadURL(API_URL);
            focusMainWindow();
        }
    } catch (error) {
        const { dialog } = require('electron');
        dialog.showErrorBox('تعذر التشغيل', error.message);
    }
};

const focusMainWindow = () => {
    if (!mainWindow) return;
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
};

ipcMain.handle('save-config', (_event, config) => {
    saveConfig(config);
    return true;
});

ipcMain.handle('get-config', () => loadConfig());

ipcMain.handle('launch-app', async () => {
    await launchDesktopApp();
    return true;
});

app.whenReady().then(async () => {
    app.setAsDefaultProtocolClient(PROTOCOL_NAME);

    if (isDev) {
        const distIndex = path.join(__dirname, '../dist/index.html');
        if (fs.existsSync(distIndex)) {
            await launchDesktopApp();
        } else {
            mainWindow = new BrowserWindow({
                width: 1400,
                height: 900,
                title: 'لولو فارما - وضع التطوير'
            });
            mainWindow.loadURL('http://localhost:5173');
        }
    } else {
        await launchDesktopApp();
    }

    app.on('second-instance', () => {
        focusMainWindow();
    });

    app.on('open-url', (event) => {
        event.preventDefault();
        focusMainWindow();
    });

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            launchDesktopApp();
        }
    });
});

app.on('before-quit', () => {
    stopBackend();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
