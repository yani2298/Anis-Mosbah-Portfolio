/**
 * Système d'authentification professionnel pour Anis Mosbah Portfolio Pro
 * Intégration avec le backend Tauri Rust
 */

class ProAuthSystem {
    constructor() {
        this.isAuthenticated = false;
        this.currentUser = null;
        this.analyticsEnabled = false;
        this.init();
    }

    async init() {
        console.log('🚀 Initialisation du système Pro...');
        
        // Vérifier si nous sommes dans Tauri ou Electron
        if (typeof window !== 'undefined') {
            if (window.__TAURI__) {
                console.log('📱 Environnement Tauri détecté');
                this.isTauri = true;
            } else if (window.electronAPI) {
                console.log('⚡ Environnement Electron détecté');
                this.isElectron = true;
            }
        }

        this.createAuthInterface();
        await this.getSystemInfo();
        await this.checkForUpdates();
    }

    createAuthInterface() {
        // Interface d'authentification moderne
        const authModal = document.createElement('div');
        authModal.id = 'pro-auth-modal';
        authModal.innerHTML = `
            <div class="auth-overlay">
                <div class="auth-container">
                    <div class="auth-header">
                        <h2>🚀 Portfolio Pro</h2>
                        <p>Accès aux fonctionnalités avancées</p>
                    </div>
                    
                    <form id="auth-form" class="auth-form">
                        <div class="input-group">
                            <input type="text" id="username" placeholder="Nom d'utilisateur" required>
                        </div>
                        <div class="input-group">
                            <input type="password" id="password" placeholder="Mot de passe" required>
                        </div>
                        <div class="checkbox-group">
                            <input type="checkbox" id="remember-me">
                            <label for="remember-me">Se souvenir de moi</label>
                        </div>
                        <button type="submit" class="auth-button">
                            <span class="button-text">Se connecter</span>
                            <span class="loading-spinner" style="display: none;">⏳</span>
                        </button>
                    </form>

                    <div class="pro-features">
                        <h3>✨ Fonctionnalités Pro</h3>
                        <ul>
                            <li>📊 Analytics en temps réel</li>
                            <li>🎨 Thèmes personnalisés</li>
                            <li>📁 Export de données (JSON, PDF, HTML)</li>
                            <li>🔔 Notifications système</li>
                            <li>🔄 Mises à jour automatiques</li>
                            <li>⚡ Performances optimisées</li>
                        </ul>
                    </div>

                    <div class="update-section">
                        <button id="check-updates-btn" class="update-button">
                            🔄 Vérifier les mises à jour
                        </button>
                        <div id="update-status" class="update-status"></div>
                    </div>
                </div>
            </div>
        `;

        // Styles CSS intégrés
        const styles = `
            <style>
                #pro-auth-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.9);
                    backdrop-filter: blur(10px);
                    z-index: 10000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.3s ease;
                }

                #pro-auth-modal.show {
                    opacity: 1;
                    visibility: visible;
                }

                .auth-container {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 20px;
                    padding: 40px;
                    max-width: 500px;
                    width: 90%;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                    transform: translateY(30px);
                    transition: transform 0.3s ease;
                }

                #pro-auth-modal.show .auth-container {
                    transform: translateY(0);
                }

                .auth-header {
                    text-align: center;
                    margin-bottom: 30px;
                    color: white;
                }

                .auth-header h2 {
                    font-size: 2.5rem;
                    margin: 0;
                    font-weight: 700;
                }

                .auth-header p {
                    margin: 10px 0 0 0;
                    opacity: 0.9;
                    font-size: 1.1rem;
                }

                .auth-form {
                    margin-bottom: 30px;
                }

                .input-group {
                    margin-bottom: 20px;
                }

                .input-group input {
                    width: 100%;
                    padding: 15px 20px;
                    border: none;
                    border-radius: 10px;
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
                    font-size: 1rem;
                    backdrop-filter: blur(10px);
                    transition: all 0.3s ease;
                }

                .input-group input::placeholder {
                    color: rgba(255, 255, 255, 0.7);
                }

                .input-group input:focus {
                    outline: none;
                    background: rgba(255, 255, 255, 0.2);
                    transform: translateY(-2px);
                    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
                }

                .checkbox-group {
                    display: flex;
                    align-items: center;
                    margin-bottom: 25px;
                    color: white;
                }

                .checkbox-group input {
                    margin-right: 10px;
                }

                .auth-button, .update-button {
                    width: 100%;
                    padding: 15px;
                    border: none;
                    border-radius: 10px;
                    background: linear-gradient(135deg, #ff6b6b, #ee5a24);
                    color: white;
                    font-size: 1.1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                }

                .update-button {
                    background: linear-gradient(135deg, #4CAF50, #45a049);
                    margin-top: 15px;
                }

                .auth-button:hover, .update-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
                }

                .auth-button:active, .update-button:active {
                    transform: translateY(0);
                }

                .pro-features {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 15px;
                    padding: 25px;
                    margin-bottom: 20px;
                    backdrop-filter: blur(10px);
                }

                .pro-features h3 {
                    color: white;
                    margin: 0 0 15px 0;
                    font-size: 1.3rem;
                }

                .pro-features ul {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }

                .pro-features li {
                    color: rgba(255, 255, 255, 0.9);
                    padding: 8px 0;
                    font-size: 1rem;
                    display: flex;
                    align-items: center;
                }

                .update-section {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 15px;
                    padding: 20px;
                    backdrop-filter: blur(10px);
                }

                .update-status {
                    margin-top: 10px;
                    padding: 10px;
                    border-radius: 8px;
                    color: white;
                    text-align: center;
                    min-height: 20px;
                }

                .update-status.success {
                    background: rgba(76, 175, 80, 0.3);
                }

                .update-status.error {
                    background: rgba(244, 67, 54, 0.3);
                }

                .update-status.info {
                    background: rgba(33, 150, 243, 0.3);
                }

                .loading-spinner {
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .pro-dashboard {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 15px 25px;
                    border-radius: 15px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                    z-index: 9999;
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .pro-dashboard.hidden {
                    display: none;
                }

                .dashboard-content {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }

                .user-info {
                    font-weight: 600;
                }

                .dashboard-actions {
                    display: flex;
                    gap: 10px;
                }

                .dashboard-btn {
                    background: rgba(255, 255, 255, 0.2);
                    border: none;
                    color: white;
                    padding: 8px 12px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 0.9rem;
                    transition: all 0.3s ease;
                }

                .dashboard-btn:hover {
                    background: rgba(255, 255, 255, 0.3);
                    transform: translateY(-1px);
                }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', styles);
        document.body.appendChild(authModal);

        this.setupAuthEvents();
        this.setupUpdateChecker();
    }

    setupUpdateChecker() {
        const checkUpdatesBtn = document.getElementById('check-updates-btn');
        const updateStatus = document.getElementById('update-status');

        checkUpdatesBtn.addEventListener('click', async () => {
            checkUpdatesBtn.disabled = true;
            checkUpdatesBtn.innerHTML = '🔄 Vérification...';
            updateStatus.className = 'update-status info';
            updateStatus.textContent = 'Vérification des mises à jour en cours...';

            try {
                if (this.isElectron && window.electronAPI) {
                    const result = await window.electronAPI.checkForUpdates();
                    if (result.success) {
                        updateStatus.className = 'update-status success';
                        updateStatus.textContent = '✅ Vérification terminée';
                    } else {
                        updateStatus.className = 'update-status error';
                        updateStatus.textContent = `❌ Erreur: ${result.error}`;
                    }
                } else {
                    updateStatus.className = 'update-status info';
                    updateStatus.textContent = '🌐 Mises à jour automatiques disponibles uniquement dans l\'app';
                }
            } catch (error) {
                updateStatus.className = 'update-status error';
                updateStatus.textContent = `❌ Erreur: ${error.message}`;
            }

            checkUpdatesBtn.disabled = false;
            checkUpdatesBtn.innerHTML = '🔄 Vérifier les mises à jour';
        });
    }

    setupAuthEvents() {
        const form = document.getElementById('auth-form');
        const modal = document.getElementById('pro-auth-modal');

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.authenticate();
        });

        // Fermer avec Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('show')) {
                this.hideAuthModal();
            }
        });

        // Fermer en cliquant à l'extérieur
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideAuthModal();
            }
        });
    }

    async authenticate() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const button = document.querySelector('.auth-button');
        const buttonText = button.querySelector('.button-text');
        const spinner = button.querySelector('.loading-spinner');

        // Animation de chargement
        buttonText.style.display = 'none';
        spinner.style.display = 'inline';
        button.disabled = true;

        try {
            let result;
            if (this.isTauri) {
                result = await window.__TAURI__.tauri.invoke('authenticate_user', {
                    username: username,
                    password: password
                });
            } else {
                // Simulation pour Electron/Web
                await new Promise(resolve => setTimeout(resolve, 1500));
                result = {
                    success: username === 'admin' && password === 'portfolio2024',
                    message: username === 'admin' && password === 'portfolio2024' 
                        ? `Bienvenue ${username} - Accès Pro activé` 
                        : 'Identifiants incorrects'
                };
            }

            if (result.success) {
                this.isAuthenticated = true;
                this.currentUser = username;
                
                // Animation de succès
                button.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
                buttonText.textContent = '✅ Connecté !';
                buttonText.style.display = 'inline';
                spinner.style.display = 'none';

                // Activer les fonctionnalités pro
                await this.enableProFeatures();
                
                setTimeout(() => {
                    this.hideAuthModal();
                    this.showProDashboard();
                    this.startAnalytics();
                }, 1500);

            } else {
                throw new Error(result.message || 'Échec de l\'authentification');
            }

        } catch (error) {
            // Animation d'erreur
            button.style.background = 'linear-gradient(135deg, #ff4757, #ff3838)';
            buttonText.textContent = '❌ Erreur';
            buttonText.style.display = 'inline';
            spinner.style.display = 'none';
            
            console.error('Erreur d\'authentification:', error);
            
            setTimeout(() => {
                button.style.background = 'linear-gradient(135deg, #ff6b6b, #ee5a24)';
                buttonText.textContent = 'Se connecter';
                button.disabled = false;
            }, 2000);
        }
    }

    async enableProFeatures() {
        console.log('🔓 Activation des fonctionnalités Pro...');
        
        try {
            if (this.isTauri) {
                const result = await window.__TAURI__.tauri.invoke('validate_pro_features');
                console.log('✅ Fonctionnalités Pro validées:', result);
            }

            // Activer les fonctionnalités dans l'interface
            this.enableFeature('analytics');
            this.enableFeature('themes');
            this.enableFeature('export');
            
            return true;
        } catch (error) {
            console.error('❌ Erreur lors de l\'activation des fonctionnalités Pro:', error);
            return false;
        }
    }

    enableFeature(featureName) {
        console.log(`🚀 Activation de la fonctionnalité: ${featureName}`);
        
        switch(featureName) {
            case 'analytics':
                this.analyticsEnabled = true;
                this.createAnalyticsPanel();
                break;
            case 'themes':
                this.createThemeSelector();
                break;
            case 'export':
                this.createExportTools();
                break;
        }
    }

    createAnalyticsPanel() {
        const analyticsPanel = document.createElement('div');
        analyticsPanel.id = 'analytics-panel';
        analyticsPanel.className = 'pro-panel';
        analyticsPanel.innerHTML = `
            <div class="panel-header">
                <h3>📊 Analytics Pro</h3>
                <button onclick="proAuth.toggleAnalytics()" class="toggle-btn">Actualiser</button>
            </div>
            <div class="analytics-content">
                <div class="metric-card">
                    <h4>Visites aujourd'hui</h4>
                    <span class="metric-value" id="visits-today">-</span>
                </div>
                <div class="metric-card">
                    <h4>Temps moyen</h4>
                    <span class="metric-value" id="avg-time">-</span>
                </div>
                <div class="metric-card">
                    <h4>Taux de conversion</h4>
                    <span class="metric-value" id="conversion-rate">-</span>
                </div>
                <div class="events-log" id="events-log">
                    <h4>Événements récents</h4>
                    <div class="events-list"></div>
                </div>
            </div>
        `;
        
        document.body.appendChild(analyticsPanel);
        this.loadAnalyticsData();
    }

    async loadAnalyticsData() {
        try {
            const dashboard = await this.invoke('get_analytics_dashboard');
            console.log('📊 Données analytics:', dashboard);
            
            // Mettre à jour l'interface
            document.getElementById('visits-today').textContent = dashboard.total_events || '0';
            document.getElementById('avg-time').textContent = '2m 34s';
            document.getElementById('conversion-rate').textContent = '12.5%';
            
            // Afficher les événements récents
            const eventsList = document.querySelector('.events-list');
            if (dashboard.recent_events) {
                eventsList.innerHTML = dashboard.recent_events.map(event => `
                    <div class="event-item">
                        <span class="event-type">${event.event_type}</span>
                        <span class="event-time">${new Date(event.timestamp).toLocaleTimeString()}</span>
                    </div>
                `).join('');
            }
        } catch (error) {
            console.error('❌ Erreur chargement analytics:', error);
        }
    }

    createExportTools() {
        const exportPanel = document.createElement('div');
        exportPanel.id = 'export-panel';
        exportPanel.className = 'pro-panel';
        exportPanel.innerHTML = `
            <div class="panel-header">
                <h3>📤 Export Professionnel</h3>
            </div>
            <div class="export-options">
                <button onclick="proAuth.exportData('json')" class="export-btn">
                    📄 Export JSON
                </button>
                <button onclick="proAuth.exportData('pdf')" class="export-btn">
                    📑 Export PDF
                </button>
                <button onclick="proAuth.exportData('html')" class="export-btn">
                    🌐 Export HTML
                </button>
            </div>
            <div class="export-status" id="export-status"></div>
        `;
        
        document.body.appendChild(exportPanel);
    }

    async exportData(format) {
        const statusDiv = document.getElementById('export-status');
        
        try {
            statusDiv.innerHTML = `<div class="status-loading">📤 Export ${format.toUpperCase()} en cours...</div>`;
            
            const exportData = await this.invoke('export_portfolio_data', {
                format: format
            });
            
            console.log(`✅ Export ${format} réussi:`, exportData);
            
            // Créer et télécharger le fichier
            const blob = new Blob([exportData], { 
                type: format === 'json' ? 'application/json' : 'text/html' 
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `portfolio_anis_mosbah.${format}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            statusDiv.innerHTML = `<div class="status-success">✅ Export ${format.toUpperCase()} terminé !</div>`;
            
        } catch (error) {
            console.error(`❌ Erreur export ${format}:`, error);
            statusDiv.innerHTML = `<div class="status-error">❌ ${error}</div>`;
        }
    }

    createThemeSelector() {
        const themePanel = document.createElement('div');
        themePanel.id = 'theme-panel';
        themePanel.className = 'pro-panel';
        themePanel.innerHTML = `
            <div class="panel-header">
                <h3>🎨 Thèmes Premium</h3>
            </div>
            <div class="theme-options">
                <div class="theme-card" onclick="proAuth.applyTheme('dark-pro')">
                    <div class="theme-preview dark-pro"></div>
                    <span>Dark Pro</span>
                </div>
                <div class="theme-card" onclick="proAuth.applyTheme('neon')">
                    <div class="theme-preview neon"></div>
                    <span>Neon</span>
                </div>
                <div class="theme-card" onclick="proAuth.applyTheme('minimal')">
                    <div class="theme-preview minimal"></div>
                    <span>Minimal</span>
                </div>
            </div>
        `;
        
        document.body.appendChild(themePanel);
    }

    applyTheme(themeName) {
        document.body.className = `theme-${themeName}`;
        console.log(`🎨 Thème appliqué: ${themeName}`);
    }

    showProDashboard() {
        const dashboard = document.createElement('div');
        dashboard.id = 'pro-dashboard';
        dashboard.className = 'pro-dashboard';
        dashboard.innerHTML = `
            <div class="dashboard-content">
                <div class="user-info">👤 ${this.currentUser} (Pro)</div>
                <div class="dashboard-actions">
                    <button class="dashboard-btn" onclick="proAuth.toggleAnalytics()">📊</button>
                    <button class="dashboard-btn" onclick="proAuth.logout()">🚪</button>
                </div>
            </div>
        `;
        document.body.appendChild(dashboard);
    }

    startAnalytics() {
        this.analyticsEnabled = true;
        console.log('📊 Analytics démarrées');
        
        // Tracker les événements de navigation
        this.trackPageViews();
        this.trackUserInteractions();
    }

    trackPageViews() {
        // Simuler le tracking de vues de page
        setInterval(() => {
            if (this.analyticsEnabled) {
                console.log('📊 Page view tracked');
            }
        }, 30000);
    }

    trackUserInteractions() {
        document.addEventListener('click', (e) => {
            if (this.analyticsEnabled) {
                console.log('📊 Click tracked:', e.target.tagName);
            }
        });
    }

    async getSystemInfo() {
        try {
            const systemInfo = await this.invoke('get_system_info');
            console.log('💻 Informations système:', systemInfo);
        } catch (error) {
            console.error('❌ Erreur système:', error);
        }
    }

    async checkForUpdates() {
        console.log('🔄 Vérification des mises à jour...');
        
        try {
            if (this.isElectron && window.electronAPI) {
                const result = await window.electronAPI.checkForUpdates();
                if (result.success) {
                    console.log('✅ Vérification des mises à jour terminée');
                } else {
                    console.log('ℹ️ Pas de mise à jour disponible:', result.error);
                }
            } else if (this.isTauri) {
                const result = await window.__TAURI__.tauri.invoke('check_for_updates');
                console.log('🔄 Résultat de la vérification:', result);
            }
        } catch (error) {
            console.error('❌ Erreur lors de la vérification des mises à jour:', error);
        }
    }

    showAuthModal() {
        const modal = document.getElementById('pro-auth-modal');
        modal.classList.add('show');
    }

    hideAuthModal() {
        const modal = document.getElementById('pro-auth-modal');
        modal.classList.remove('show');
    }

    async toggleAnalytics() {
        await this.loadAnalyticsData();
    }

    logout() {
        this.isAuthenticated = false;
        this.currentUser = null;
        this.analyticsEnabled = false;
        
        const dashboard = document.getElementById('pro-dashboard');
        if (dashboard) {
            dashboard.remove();
        }
        
        console.log('👋 Déconnexion réussie');
    }
}

// Initialisation globale
const proAuth = new ProAuthSystem();
window.proAuth = proAuth;

// Raccourci clavier pour ouvrir l'interface Pro
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        if (!proAuth.isAuthenticated) {
            proAuth.showAuthModal();
        }
    }
});

console.log('🎯 Système Pro initialisé - Utilisez Ctrl+Shift+P pour accéder'); 