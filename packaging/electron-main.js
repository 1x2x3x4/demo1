const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  console.log('🚀 启动示波器仿真系统...');
  
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true
    },
    show: false,
    title: '示波器仿真系统',
    icon: path.join(__dirname, '../assets/icons/icon.png')
  });

  // 加载应用
  if (process.env.NODE_ENV === 'development') {
    const startUrl = 'http://localhost:8081';
    console.log('🌐 开发模式，加载:', startUrl);
    mainWindow.loadURL(startUrl);
    mainWindow.webContents.openDevTools();
  } else {
    const startUrl = path.join(__dirname, '../docs/index.html');
    console.log('📂 生产模式，加载:', startUrl);
    mainWindow.loadFile(startUrl);
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    console.log('✅ 应用启动成功！');
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

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
