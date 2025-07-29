// Script de preload pour la sécurité
// Ce script s'exécute dans le contexte du rendu avant que la page web ne se charge

const { contextBridge, ipcRenderer } = require('electron');

// Exposer les APIs Electron de manière sécurisée
contextBridge.exposeInMainWorld('electronAPI', {
    // API pour les mises à jour
    checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
    
    // API pour les informations système
    getSystemInfo: () => {
        return {
            platform: process.platform,
            arch: process.arch,
            version: process.versions.electron,
            node: process.versions.node,
            chrome: process.versions.chrome
        };
    },
    
    // API pour les logs
    log: (message) => {
        console.log('[Renderer]:', message);
    },
    
    // API pour ouvrir des liens externes
    openExternal: (url) => {
        // Cette fonction sera gérée côté main process
        return ipcRenderer.invoke('open-external', url);
    }
});

// Sécurité : empêcher l'accès direct à Node.js
delete window.require;
delete window.exports;
delete window.module;

console.log('🔒 Preload script chargé - APIs Electron exposées de manière sécurisée');

// Optimisation : désactiver certaines fonctionnalités non nécessaires
window.addEventListener('DOMContentLoaded', () => {
  // Désactiver la sélection de texte pour une expérience plus native
  document.body.style.webkitUserSelect = 'none';
  document.body.style.userSelect = 'none';
  
  // Désactiver le menu contextuel
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });
  
  // Optimisation : nettoyer les console.log en production
  if (process.env.NODE_ENV === 'production') {
    console.log = () => {};
    console.warn = () => {};
    console.error = () => {};
  }
}); 