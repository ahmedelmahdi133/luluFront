const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktopApi', {
    saveConfig: (config) => ipcRenderer.invoke('save-config', config),
    getConfig: () => ipcRenderer.invoke('get-config'),
    launchApp: () => ipcRenderer.invoke('launch-app')
});
