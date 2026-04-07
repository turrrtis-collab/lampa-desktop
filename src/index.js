const { app, BrowserWindow } = require('electron');
const path = require('node:path');
const { updateElectronApp, UpdateSourceType} = require('update-electron-app');
const log = require('electron-log');

if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      sandbox: false
    },
    icon: path.join(__dirname, 'img', 'og.png'),
    show: false,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    webSecurity: false
  });

  mainWindow.setMenu(null)
  mainWindow.loadURL('https://positron.click');

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();

    if (process.platform === 'darwin') {
      mainWindow.focus();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);

    if (parsedUrl.origin !== 'https://positron.click' && parsedUrl.origin !== 'file://') {
      event.preventDefault();
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    require('electron').shell.openExternal(url);
    return { action: 'deny' };
  });
};

app.whenReady().then(async () => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  try {
    updateElectronApp({
        updateSource: {
            type: UpdateSourceType.ElectronPublicUpdateService,
            repo: 'turrrtis-collab/lampa-desktop'
        },
        updateInterval: '1 hour',
        logger: log
    });
  } catch (error) {
    console.error('Ошибка при настройке автообновлений:', error);
  }

});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.focus();
    }
  });
}

process.on('uncaughtException', (error) => {
  log.error('Необработанная ошибка:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  log.error('Необработанное отклонение промиса:', promise, 'причина:', reason);
});
