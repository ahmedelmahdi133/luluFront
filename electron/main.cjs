const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');
const licenseManager = require('./license-manager.cjs');

// ============================================
// تسجيل الأخطاء في ملف لتسهيل تتبع المشاكل
// ============================================
const getLogPath = () => {
    try {
        return path.join(app.getPath('userData'), 'app.log');
    } catch {
        return path.join(__dirname, 'app.log');
    }
};

const log = (message) => {
    const timestamp = new Date().toISOString();
    const line = `[${timestamp}] ${message}\n`;
    console.log(message);
    try {
        fs.appendFileSync(getLogPath(), line, 'utf8');
    } catch { /* ignore log write errors */ }
};

process.on('uncaughtException', (error) => {
    log(`❌ UNCAUGHT EXCEPTION: ${error.message}\n${error.stack}`);
    try {
        dialog.showErrorBox('خطأ غير متوقع', error.message);
    } catch { /* app might not be ready */ }
});

process.on('unhandledRejection', (reason) => {
    const msg = reason instanceof Error ? reason.message : String(reason);
    const stack = reason instanceof Error ? reason.stack : '';
    log(`❌ UNHANDLED REJECTION: ${msg}\n${stack}`);
    try {
        dialog.showErrorBox('خطأ غير متوقع', msg);
    } catch { /* app might not be ready */ }
});

const PROTOCOL_NAME = 'indexpharma';
const API_PORT = 5000;
const API_URL = `http://127.0.0.1:${API_PORT}`;
const HEALTH_URL = `${API_URL}/api/health`;

const isDev = !app.isPackaged;

app.setName('Index Pharma Desktop');

const gotLock = app.requestSingleInstanceLock();

let mainWindow = null;
let setupWindow = null;
let activationWindow = null;
let backendProcess = null;

if (!gotLock) {
    log('⚠️ نسخة أخرى من التطبيق تعمل بالفعل. سيتم الإغلاق.');
    dialog.showErrorBox('التطبيق يعمل مسبقاً', 'نسخة أخرى من اندكس فارما تعمل بالفعل. أغلقها أولاً ثم أعد المحاولة.');
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

    log(`📂 Backend path: ${backendPath}`);
    log(`📂 Frontend dist: ${frontendDist}`);
    log(`📄 App script: ${appScript}`);
    log(`🔗 Database URL: ${config.databaseUrl ? config.databaseUrl.replace(/:[^:@]+@/, ':***@') : 'NOT SET'}`);

    if (!fs.existsSync(appScript)) {
        const errMsg = `ملفات النظام غير مكتملة. الملف غير موجود: ${appScript}`;
        log(`❌ ${errMsg}`);
        throw new Error(errMsg);
    }

    const env = {
        ...process.env,
        NODE_ENV: 'production',
        DESKTOP_MODE: 'true',
        PORT: String(API_PORT),
        DATABASE_URL: config.databaseUrl,
        JWT_SECRET: config.jwtSecret,
        FRONTEND_DIST_PATH: frontendDist,
        UPLOADS_DIR: path.join(app.getPath('userData'), 'uploads')
    };

    log(`🚀 Spawning backend on port ${API_PORT}...`);

    backendProcess = spawn(process.execPath, [appScript], {
        cwd: backendPath,
        env: {
            ...env,
            ELECTRON_RUN_AS_NODE: '1'
        },
        stdio: ['ignore', 'pipe', 'pipe'],
        windowsHide: true
    });

    // التقاط مخرجات الباكند وتسجيلها
    if (backendProcess.stdout) {
        backendProcess.stdout.on('data', (data) => {
            log(`[BACKEND stdout] ${data.toString().trim()}`);
        });
    }
    if (backendProcess.stderr) {
        backendProcess.stderr.on('data', (data) => {
            log(`[BACKEND stderr] ${data.toString().trim()}`);
        });
    }

    backendProcess.on('error', (error) => {
        log(`❌ Backend process error: ${error.message}`);
        dialog.showErrorBox('خطأ في تشغيل الخادم', `فشل في تشغيل الخادم المحلي:\n${error.message}`);
    });

    backendProcess.on('exit', (code, signal) => {
        log(`⚠️ Backend process exited with code: ${code}, signal: ${signal}`);
        backendProcess = null;
        if (code && code !== 0) {
            const errMsg = `توقف الخادم المحلي (كود: ${code}).\nتأكد من:\n1. تشغيل PostgreSQL\n2. صحة رابط قاعدة البيانات\n3. عدم استخدام المنفذ ${API_PORT} من برنامج آخر\n\nراجع ملف السجل: ${getLogPath()}`;
            log(`❌ ${errMsg}`);
            dialog.showErrorBox('خطأ في النظام', errMsg);
        }
    });
};

const createMainWindow = () => {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1024,
        minHeight: 700,
        title: 'اندكس فارما - نظام الكاشير',
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
        title: 'إعداد اندكس فارما',
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

// ============================================
// شاشة التفعيل
// ============================================

const createActivationWindow = () => {
    activationWindow = new BrowserWindow({
        width: 560,
        height: 640,
        resizable: false,
        title: 'تفعيل اندكس فارما',
        icon: path.join(__dirname, '../public/favicon.svg'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    activationWindow.setMenuBarVisibility(false);
    activationWindow.loadFile(path.join(__dirname, 'activation.html'));

    activationWindow.on('closed', () => {
        activationWindow = null;
    });
};

// ============================================
// فحص الترخيص
// ============================================

const checkLicenseAndProceed = async () => {
    try {
        const userDataPath = app.getPath('userData');
        log(`📁 User data path: ${userDataPath}`);
        
        const activated = licenseManager.isActivated(userDataPath);
        log(`🔑 License status: ${activated ? 'مفعّل' : 'غير مفعّل'}`);

        if (activated) {
            // الترخيص صالح → تشغيل التطبيق
            await launchDesktopApp();
        } else {
            // الترخيص غير صالح → عرض شاشة التفعيل
            log('🔒 عرض شاشة التفعيل...');
            createActivationWindow();
        }
    } catch (error) {
        log(`❌ Error in checkLicenseAndProceed: ${error.message}\n${error.stack}`);
        dialog.showErrorBox('خطأ في فحص الترخيص', `${error.message}\n\nراجع ملف السجل: ${getLogPath()}`);
    }
};

const launchDesktopApp = async () => {
    // تحميل الإعدادات المحفوظة (رابط PostgreSQL)
    const config = loadConfig();
    log(`⚙️ Config loaded: ${config ? 'نعم' : 'لا'}`);

    if (!config || !config.databaseUrl) {
        // لا يوجد إعداد محفوظ — عرض شاشة الإعداد
        log('📝 لا يوجد إعداد محفوظ - عرض شاشة الإعداد...');
        createSetupWindow();
        return;
    }

    try {
        log('🔄 إيقاف الباكند القديم (إن وجد)...');
        stopBackend();
        log('🚀 تشغيل الباكند...');
        startBackend(config);
        log('⏳ انتظار جاهزية الباكند...');
        await waitForBackend();
        log('✅ الباكند جاهز!');
        if (setupWindow) {
            setupWindow.close();
            setupWindow = null;
        }
        if (activationWindow) {
            activationWindow.close();
            activationWindow = null;
        }
        if (!mainWindow) {
            log('🖥️ إنشاء النافذة الرئيسية...');
            createMainWindow();
        } else {
            mainWindow.loadURL(API_URL);
            focusMainWindow();
        }
    } catch (error) {
        log(`❌ Launch error: ${error.message}\n${error.stack}`);
        dialog.showErrorBox('تعذر التشغيل', `${error.message}\n\nراجع ملف السجل: ${getLogPath()}`);
    }
};

const focusMainWindow = () => {
    if (!mainWindow) return;
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
};

// ============================================
// IPC Handlers — الإعداد
// ============================================

ipcMain.handle('save-config', (_event, config) => {
    saveConfig(config);
    return true;
});

ipcMain.handle('get-config', () => loadConfig());

ipcMain.handle('launch-app', async () => {
    await launchDesktopApp();
    return true;
});

// ============================================
// IPC Handlers — التفعيل
// ============================================

ipcMain.handle('get-hardware-id', () => {
    return licenseManager.getHardwareFingerprint();
});

ipcMain.handle('activate-license', (_event, licenseKey) => {
    const hardwareId = licenseManager.getHardwareFingerprint();
    const isValid = licenseManager.validateLicenseKey(hardwareId, licenseKey);

    if (isValid) {
        const userDataPath = app.getPath('userData');
        licenseManager.saveLicense(userDataPath, hardwareId, licenseKey);
        return { success: true, message: 'تم التفعيل بنجاح' };
    } else {
        return { success: false, message: 'كود التفعيل غير صحيح. تأكد من إدخال الكود بشكل صحيح.' };
    }
});

ipcMain.handle('launch-after-activation', async () => {
    if (activationWindow) {
        activationWindow.close();
        activationWindow = null;
    }
    await launchDesktopApp();
    return true;
});

// ============================================
// تشغيل التطبيق
// ============================================

app.whenReady().then(async () => {
    log('='.repeat(50));
    log('🟢 التطبيق جاهز - بدء التشغيل...');
    log(`📌 isDev: ${isDev}`);
    log(`📌 Log file: ${getLogPath()}`);
    
    app.setAsDefaultProtocolClient(PROTOCOL_NAME);

    if (isDev) {
        const distIndex = path.join(__dirname, '../dist/index.html');
        const hasDistBuild = fs.existsSync(distIndex);
        log(`📌 dist/index.html exists: ${hasDistBuild}`);
        
        if (hasDistBuild) {
            // في وضع التطوير مع وجود build — فحص الترخيص أولاً
            log('📌 وضع التطوير + build → فحص الترخيص...');
            await checkLicenseAndProceed();
        } else {
            // وضع التطوير بدون build — فحص الترخيص ثم dev server
            log('📌 وضع التطوير بدون build → فحص الترخيص ثم dev server...');
            const userDataPath = app.getPath('userData');
            const activated = licenseManager.isActivated(userDataPath);

            if (activated) {
                log('✅ مفعّل - تحميل dev server على http://localhost:5173');
                mainWindow = new BrowserWindow({
                    width: 1400,
                    height: 900,
                    title: 'اندكس فارما - وضع التطوير'
                });
                mainWindow.loadURL('http://localhost:5173');
            } else {
                log('🔒 غير مفعّل - عرض شاشة التفعيل');
                createActivationWindow();
            }
        }
    } else {
        // وضع الإنتاج — فحص الترخيص أولاً دائماً
        log('📌 وضع الإنتاج → فحص الترخيص...');
        await checkLicenseAndProceed();
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
            checkLicenseAndProceed();
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
