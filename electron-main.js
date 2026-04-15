const { app, BrowserWindow, session } = require('electron');
const fs = require('fs');
const path = require('path');

let mainWindow;
let serialHandlersInstalled = false;
const devServerPort = process.env.DEV_SERVER_PORT || '8081';
const trustedDevOrigins = new Set([
  `http://localhost:${devServerPort}`,
  `http://127.0.0.1:${devServerPort}`,
  `http://[::1]:${devServerPort}`,
]);

function isTrustedSerialOrigin(origin) {
  if (!origin || origin === 'null') {
    return true;
  }

  try {
    const parsedOrigin = new URL(origin);
    return (
      parsedOrigin.protocol === 'file:' ||
      trustedDevOrigins.has(parsedOrigin.origin)
    );
  } catch (error) {
    return false;
  }
}

function pickPreferredSerialPort(portList) {
  const preferredPort = portList.find((port) => {
    const label = `${port.displayName || ''} ${port.portName || ''} ${port.vendorId || ''} ${port.productId || ''}`;
    return /arduino|wch|ch340|cp210|usb/i.test(label);
  });

  return preferredPort || portList[0] || null;
}

function configureSerialPermissions() {
  if (serialHandlersInstalled) {
    return;
  }

  const targetSession = session.defaultSession;

  targetSession.setPermissionCheckHandler((webContents, permission, requestingOrigin) => {
    if (permission === 'serial') {
      return isTrustedSerialOrigin(requestingOrigin) || isTrustedSerialOrigin(webContents?.getURL?.());
    }

    return true;
  });

  targetSession.setDevicePermissionHandler((details) => {
    if (details.deviceType !== 'serial') {
      return false;
    }

    return isTrustedSerialOrigin(details.origin);
  });

  targetSession.on('select-serial-port', (event, portList, webContents, callback) => {
    if (!mainWindow || webContents !== mainWindow.webContents) {
      callback('');
      return;
    }

    if (!isTrustedSerialOrigin(webContents.getURL())) {
      callback('');
      return;
    }

    event.preventDefault();

    const selectedPort = pickPreferredSerialPort(portList);
    callback(selectedPort ? selectedPort.portId : '');
  });

  serialHandlersInstalled = true;
}

function resolveStartTarget() {
  if (process.env.NODE_ENV === 'development') {
    return { type: 'url', value: `http://127.0.0.1:${devServerPort}` };
  }

  if (app.isPackaged) {
    return {
      type: 'file',
      value: path.join(process.resourcesPath, 'docs', 'index.html'),
    };
  }

  return {
    type: 'file',
    value: path.join(__dirname, 'docs', 'index.html'),
  };
}

function resolveWindowIcon() {
  const candidates = app.isPackaged
    ? [
        path.join(process.resourcesPath, 'assets', 'icons', 'x64', 'icon.ico'),
        path.join(process.resourcesPath, 'assets', 'icons', 'x64', 'icon.png'),
        path.join(process.resourcesPath, 'assets', 'icons', 'icon.png'),
        path.join(process.resourcesPath, 'assets', 'icons', 'icon.ico'),
        path.join(process.resourcesPath, 'icon.png'),
        path.join(process.resourcesPath, 'icon.ico'),
      ]
    : [
        path.join(__dirname, 'assets', 'icons', 'x64', 'icon.ico'),
        path.join(__dirname, 'assets', 'icons', 'x64', 'icon.png'),
        path.join(__dirname, 'assets', 'icons', 'icon.png'),
        path.join(__dirname, 'assets', 'icons', 'icon.ico'),
        path.join(__dirname, 'icon.png'),
        path.join(__dirname, 'icon.ico'),
      ];

  return candidates.find((candidate) => fs.existsSync(candidate));
}

function createWindow() {
  console.log('Starting Oscilloscope Simulator...');

  const startTarget = resolveStartTarget();
  const iconPath = resolveWindowIcon();
  const windowOptions = {
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true,
    },
    show: false,
    title: '示波器仿真系统',
  };

  if (iconPath) {
    windowOptions.icon = iconPath;
    console.log('Using window icon:', iconPath);
  } else {
    console.log('No window icon found, continuing without a custom icon.');
  }

  mainWindow = new BrowserWindow(windowOptions);

  if (startTarget.type === 'url') {
    console.log('Loading development URL:', startTarget.value);
    mainWindow.loadURL(startTarget.value);
    mainWindow.webContents.openDevTools();
  } else {
    console.log('Loading local file:', startTarget.value);
    mainWindow.loadFile(startTarget.value);
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    console.log('Application started successfully.');
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  configureSerialPermissions();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
