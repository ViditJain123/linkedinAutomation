import { app, BrowserWindow, session } from 'electron';
import path from 'path';
import { isDev } from './util.js';
import { getPreloadPath } from './pathResolver.js';
import { schedulePost } from './schedulePost.js';
import pie from 'puppeteer-in-electron';

(async () => {
  // Initialize puppeteer-in-electron
  await pie.initialize(app);
  // Make this callback async so 'await' can be used inside
  app.on('ready', async () => {
    const mainWindow = new BrowserWindow({
      webPreferences: {
        preload: getPreloadPath(),
      },
      width: 1920,
      height: 1080,
    });

    if (isDev()) {
      mainWindow.loadURL('http://localhost:5123');
      // Clear session data
    //   await session.defaultSession.clearStorageData({
    //     // If you omit 'origin', it will clear for all origins
    //     origin: undefined,
    //     storages: [
    //       'cookies',
    //       'filesystem',
    //       'indexdb',
    //       'localstorage',
    //       'shadercache',
    //       'websql',
    //       'serviceworkers',
    //     ],
    //     quotas: ['temporary', 'syncable'],
    //   });
    //   console.log('Session data cleared.');
    } else {
      mainWindow.loadFile(path.join(app.getAppPath(), '/dist-react/index.html'));
    }

    // Uncomment if you need to run your scheduled post task
    // schedulePost();

    app.on('window-all-closed', () => {
      app.quit();
    });
  });
})();