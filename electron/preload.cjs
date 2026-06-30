const { contextBridge, ipcRenderer } = require('electron');

// APIs لشاشة الإعداد
contextBridge.exposeInMainWorld('desktopApi', {
    saveConfig: (config) => ipcRenderer.invoke('save-config', config),
    getConfig: () => ipcRenderer.invoke('get-config'),
    launchApp: () => ipcRenderer.invoke('launch-app')
});

// APIs لشاشة التفعيل
contextBridge.exposeInMainWorld('activationApi', {
    getHardwareId: () => ipcRenderer.invoke('get-hardware-id'),
    activateLicense: (key) => ipcRenderer.invoke('activate-license', key),
    launchAfterActivation: () => ipcRenderer.invoke('launch-after-activation')
});
