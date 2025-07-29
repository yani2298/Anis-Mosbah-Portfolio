const { app, BrowserWindow, Menu, dialog, shell, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');

// Configuration de l'auto-updater
autoUpdater.checkForUpdatesAndNotify();

// Configuration des logs pour l'updater
autoUpdater.logger = require('electron-log');
autoUpdater.logger.transports.file.level = 'info';

// Désactiver les avertissements de sécurité en développement
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

// Garde une référence globale de l'objet window
let mainWindow;
let aboutWindow;

function createWindow() {
  // Créer la fenêtre de navigateur (un peu plus grande et moderne)
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    titleBarStyle: 'hiddenInset',
    vibrancy: 'under-window',
    visualEffectState: 'active',
    transparent: false,
    frame: true,
    show: false,
    icon: path.join(__dirname, 'icone.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true,
      allowRunningInsecureContent: false,
      experimentalFeatures: false
    }
  });

  // Charger l'index.html local
  mainWindow.loadFile('index.html');

  // Masquer la barre de menu
  mainWindow.setMenuBarVisibility(false);

  // Optimisation : montrer la fenêtre quand elle est prête
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Focus sur la fenêtre
    if (process.platform === 'darwin') {
      mainWindow.focus();
    }

    // Vérifier les mises à jour au démarrage
    if (!app.isPackaged) {
      console.log('Mode développement - auto-updater désactivé');
    } else {
      autoUpdater.checkForUpdatesAndNotify();
    }
  });

  // Émis quand la fenêtre est fermée
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Optimisation : libérer la mémoire
  mainWindow.on('close', () => {
    mainWindow.webContents.session.clearCache(() => {});
  });

  // Empêcher la navigation vers des sites externes
  mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    if (parsedUrl.origin !== 'file://') {
      event.preventDefault();
      require('electron').shell.openExternal(navigationUrl);
    }
  });

  // Empêcher l'ouverture de nouvelles fenêtres
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    require('electron').shell.openExternal(url);
    return { action: 'deny' };
  });
}

// Fonction pour créer une fenêtre About moderne et animée
function createAboutWindow() {
  if (aboutWindow) {
    aboutWindow.focus();
    return;
  }

  aboutWindow = new BrowserWindow({
    width: 560,
    height: 520,
    resizable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    parent: mainWindow,
    modal: false,
    show: false,
    frame: false,
    transparent: true,
    backgroundColor: 'rgba(0, 0, 0, 0)',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // HTML pour la fenêtre About minimaliste et créative
  const aboutHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        @font-face {
          font-family: 'ModernSans';
          src: url('fonts/PPFraktionMono-Bold.woff2') format('woff2');
          font-weight: bold;
        }
        
        @font-face {
          font-family: 'LightSans';
          src: url('fonts/PPEditorialNew-Ultralight.woff2') format('woff2');
          font-weight: 200;
        }
        
        * { 
          margin: 0; 
          padding: 0; 
          box-sizing: border-box;
          user-select: none;
        }
        
        body {
          font-family: 'ModernSans', sans-serif;
          background: transparent;
          color: white;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          cursor: default;
        }
        
        .about-container {
          position: relative;
          width: 480px;
          height: 480px;
          background: rgba(16, 0, 0, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px;
          box-shadow: 0 20px 80px rgba(244, 12, 63, 0.25);
          animation: appear 0.8s cubic-bezier(0.16, 1, 0.3, 1);
          border: 1px solid rgba(255, 255, 255, 0.08);
          transform-style: preserve-3d;
          perspective: 1000px;
          overflow: hidden;
        }
        
        @keyframes appear {
          0% { opacity: 0; transform: scale(0.92) translateY(10px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        
        .content {
          position: relative;
          width: 100%;
          text-align: center;
          z-index: 2;
        }
        
        .title {
          font-size: 38px;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 10px;
          color: #fff;
          font-weight: bold;
          animation: fadeIn 0.6s 0.3s both;
          transform: translateZ(20px);
          text-shadow: 0 2px 10px rgba(244, 12, 63, 0.3);
        }
        
        .subtitle {
          font-family: 'LightSans', serif;
          font-size: 18px;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 30px;
          animation: fadeIn 0.6s 0.4s both;
          letter-spacing: 1px;
        }
        
        .divider {
          width: 40px;
          height: 2px;
          background: linear-gradient(to right, #F40C3F, rgba(244, 12, 63, 0.3));
          margin: 0 auto 30px;
          animation: fadeIn 0.6s 0.5s both, width 1s 0.8s forwards;
        }
        
        @keyframes width {
          0% { width: 40px; }
          100% { width: 120px; }
        }
        
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(15px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        .info {
          font-size: 16px;
          margin-bottom: 10px;
          color: rgba(255, 255, 255, 0.9);
          animation: fadeIn 0.6s 0.6s both;
        }
        
        .description {
          font-family: 'LightSans', serif;
          font-size: 14px;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.7);
          max-width: 320px;
          margin: 0 auto 30px;
          animation: fadeIn 0.6s 0.7s both;
        }
        
        .version {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.5);
          animation: fadeIn 0.6s 0.8s both;
        }
        
        .close-btn {
          position: absolute;
          top: 20px;
          right: 20px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: white;
          font-size: 18px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          animation: fadeIn 0.6s 0.9s both;
          z-index: 10;
        }
        
        .close-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: rotate(90deg);
        }
        
        .background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          overflow: hidden;
          border-radius: 24px;
          z-index: 1;
        }
        
        .circle {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(244, 12, 63, 0.4) 0%, rgba(244, 12, 63, 0) 70%);
          animation: pulse 8s infinite ease-in-out;
          opacity: 0.5;
        }
        
        .circle:nth-child(1) {
          width: 300px;
          height: 300px;
          top: -100px;
          right: -100px;
          animation-delay: 0s;
        }
        
        .circle:nth-child(2) {
          width: 200px;
          height: 200px;
          bottom: -50px;
          left: -50px;
          animation-delay: 2s;
        }
        
        .circle:nth-child(3) {
          width: 150px;
          height: 150px;
          bottom: 100px;
          right: 50px;
          animation-delay: 4s;
        }
        
        .wave {
          position: absolute;
          width: 200%;
          height: 200%;
          top: -50%;
          left: -50%;
          background: url('data:image/svg+xml;utf8,<svg viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg"><path d="M 0 500 Q 250 300 500 500 Q 750 700 1000 500 L 1000 1000 L 0 1000 Z" fill="rgba(244, 12, 63, 0.05)"/></svg>');
          background-size: 50% 50%;
          animation: wave 20s linear infinite;
          transform: rotate(0deg);
        }
        
        .wave:nth-child(4) {
          opacity: 0.7;
          animation: wave 15s linear infinite reverse;
        }
        
        .wave:nth-child(5) {
          opacity: 0.3;
          animation: wave 30s linear infinite;
          top: -60%;
        }
        
        @keyframes wave {
          0% { transform: rotate(0deg) translateY(0); }
          100% { transform: rotate(360deg) translateY(0); }
        }
        
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 0.7; }
          100% { transform: scale(1); opacity: 0.5; }
        }
      </style>
    </head>
    <body>
      <div class="about-container">
        <div class="background">
          <div class="circle"></div>
          <div class="circle"></div>
          <div class="circle"></div>
          <div class="wave"></div>
          <div class="wave"></div>
        </div>
        <button class="close-btn">×</button>
        <div class="content">
          <div class="title">ANIS MOSBAH</div>
          <div class="subtitle">Creative Developer</div>
          <div class="divider"></div>
          <div class="info">Portfolio Application</div>
          <div class="description">
            Une expérience interactive présentant les projets et réalisations
            d'un développeur créatif passionné par l'innovation digitale.
          </div>
          <div class="version">Version 1.0.0</div>
        </div>
      </div>
      
      <script>
        // Effet de parallaxe subtil
        document.addEventListener('mousemove', function(e) {
          const container = document.querySelector('.about-container');
          const logo = document.querySelector('.logo');
          const title = document.querySelector('.title');
          
          // Calculer la position relative de la souris
          const x = (e.clientX / window.innerWidth) - 0.5;
          const y = (e.clientY / window.innerHeight) - 0.5;
          
          // Appliquer une rotation subtile au conteneur
          container.style.transform = 'perspective(1000px) rotateY(' + (x * 5) + 'deg) rotateX(' + (y * -5) + 'deg)';
          
          // Déplacer légèrement le logo et le titre pour un effet de profondeur
          logo.style.transform = 'translateX(' + (x * 10) + 'px) translateY(' + (y * 10) + 'px)';
          title.style.transform = 'translateZ(20px) translateX(' + (x * 5) + 'px) translateY(' + (y * 5) + 'px)';
        });
        
        // Fermer la fenêtre quand on clique sur le bouton de fermeture
        document.querySelector('.close-btn').addEventListener('click', function() {
          window.electronAPI.closeAboutWindow();
        });
        
        // Fermer la fenêtre quand on clique à l'extérieur du conteneur
        document.addEventListener('click', function(e) {
          const container = document.querySelector('.about-container');
          if (e.target !== container && !container.contains(e.target)) {
            window.electronAPI.closeAboutWindow();
          }
        });
      </script>
    </body>
    </html>
  `;

  aboutWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(aboutHTML)}`);

  aboutWindow.once('ready-to-show', () => {
    aboutWindow.show();
    aboutWindow.focus();
  });

  aboutWindow.on('closed', () => {
    aboutWindow = null;
  });

  // Permettre de fermer la fenêtre en cliquant à l'extérieur
  aboutWindow.on('blur', () => {
    if (aboutWindow) {
      aboutWindow.close();
    }
  });
}

// Écouter l'événement pour fermer la fenêtre About
ipcMain.on('close-about-window', () => {
  if (aboutWindow && !aboutWindow.isDestroyed()) {
    aboutWindow.close();
  }
});

// Gestion des événements de l'auto-updater
autoUpdater.on('checking-for-update', () => {
  console.log('Vérification des mises à jour...');
});

autoUpdater.on('update-available', (info) => {
  console.log('Mise à jour disponible:', info.version);
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Mise à jour disponible',
    message: `Une nouvelle version (${info.version}) est disponible. Elle sera téléchargée en arrière-plan.`,
    buttons: ['OK']
  });
});

autoUpdater.on('update-not-available', (info) => {
  console.log('Aucune mise à jour disponible');
});

autoUpdater.on('error', (err) => {
  console.log('Erreur lors de la mise à jour:', err);
});

autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Vitesse de téléchargement: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Téléchargé ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  console.log(log_message);
});

autoUpdater.on('update-downloaded', (info) => {
  console.log('Mise à jour téléchargée');
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Mise à jour prête',
    message: 'La mise à jour a été téléchargée. L\'application va redémarrer pour appliquer la mise à jour.',
    buttons: ['Redémarrer maintenant', 'Plus tard']
  }).then((result) => {
    if (result.response === 0) {
      autoUpdater.quitAndInstall();
    }
  });
});

// IPC pour vérification manuelle des mises à jour
ipcMain.handle('check-for-updates', async () => {
  if (app.isPackaged) {
    try {
      const result = await autoUpdater.checkForUpdates();
      return { success: true, updateInfo: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  } else {
    return { success: false, error: 'Mode développement' };
  }
});

// Cette méthode sera appelée quand Electron aura fini l'initialisation
app.whenReady().then(() => {
  createWindow();

  // Menu moderne et épuré pour macOS
  if (process.platform === 'darwin') {
    const template = [
      {
        label: 'Anis Mosbah Portfolio',
        submenu: [
          { 
            label: 'À propos de Anis Mosbah Portfolio...', 
            click: createAboutWindow
          },
          { type: 'separator' },
          { role: 'hide', label: 'Masquer' },
          { role: 'hideOthers', label: 'Masquer les autres' },
          { role: 'unhide', label: 'Tout afficher' },
          { type: 'separator' },
          { role: 'quit', label: 'Quitter' }
        ]
      },
      {
        label: 'Affichage',
        submenu: [
          { role: 'reload', label: 'Actualiser' },
          { role: 'forceReload', label: 'Actualiser (forcé)' },
          { type: 'separator' },
          { role: 'resetZoom', label: 'Zoom normal' },
          { role: 'zoomIn', label: 'Zoom +' },
          { role: 'zoomOut', label: 'Zoom -' },
          { type: 'separator' },
          { role: 'togglefullscreen', label: 'Plein écran' }
        ]
      },
      {
        label: 'Fenêtre',
        submenu: [
          { role: 'minimize', label: 'Réduire' },
          { role: 'close', label: 'Fermer' }
        ]
      }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  } else {
    Menu.setApplicationMenu(null);
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quitter quand toutes les fenêtres sont fermées
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Optimisations pour réduire l'utilisation mémoire
app.on('browser-window-created', (_, window) => {
  window.webContents.on('devtools-opened', () => {
    window.webContents.closeDevTools();
  });
});

// Désactiver le cache GPU pour réduire l'utilisation mémoire
app.disableHardwareAcceleration();

// Optimisation : limiter le nombre de processus
app.commandLine.appendSwitch('--max_old_space_size', '512');
app.commandLine.appendSwitch('--js-flags', '--max-old-space-size=512'); 
app.commandLine.appendSwitch('--js-flags', '--max-old-space-size=512'); 

// Sécurité : empêcher la navigation vers des URLs externes
app.on('web-contents-created', (event, contents) => {
  contents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    
    if (parsedUrl.origin !== 'null') {
      event.preventDefault();
    }
  });
});

// Menu personnalisé minimaliste
const template = [
  {
    label: 'Application',
    submenu: [
      {
        label: 'Vérifier les mises à jour',
        accelerator: 'CmdOrCtrl+U',
        click: async () => {
          if (app.isPackaged) {
            autoUpdater.checkForUpdatesAndNotify();
          } else {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Mode développement',
              message: 'La vérification des mises à jour n\'est disponible qu\'en mode production.',
              buttons: ['OK']
            });
          }
        }
      },
      { type: 'separator' },
      {
        label: 'Quitter',
        accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
        click: () => {
          app.quit();
        }
      }
    ]
  }
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu); 