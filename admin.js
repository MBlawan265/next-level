/* ==========================================================================
   NEXT LEVEL - ADMIN DASHBOARD JAVASCRIPT
   ========================================================================== */

// ============================================================================
// STORAGE KEYS
// ============================================================================

const STORAGE_KEYS = {
    PASSWORD: 'nextlevel_admin_password',
    SESSION: 'nextlevel_admin_session',
    SCRIPT_URL: 'nextlevel_script_url',
    DOWNLOAD_URL: 'nextlevel_download_url'
};

// ============================================================================
// DOM ELEMENTS
// ============================================================================

const elements = {
    // Login
    loginScreen: document.getElementById('login-screen'),
    setupForm: document.getElementById('setup-form'),
    authForm: document.getElementById('auth-form'),
    newPassword: document.getElementById('new-password'),
    confirmPassword: document.getElementById('confirm-password'),
    password: document.getElementById('password'),
    setupBtn: document.getElementById('setup-btn'),
    loginBtn: document.getElementById('login-btn'),
    setupError: document.getElementById('setup-error'),
    loginError: document.getElementById('login-error'),

    // Dashboard
    dashboard: document.getElementById('admin-dashboard'),
    logoutBtn: document.getElementById('logout-btn'),

    // Script URL
    scriptUrl: document.getElementById('script-url'),
    saveScriptBtn: document.getElementById('save-script-btn'),
    scriptStatus: document.getElementById('script-status'),
    scriptHelpLink: document.getElementById('script-help-link'),

    // Download URL
    downloadUrl: document.getElementById('download-url'),
    saveDownloadBtn: document.getElementById('save-download-btn'),
    downloadStatus: document.getElementById('download-status'),
    downloadInfo: document.getElementById('download-info'),
    currentDownloadUrl: document.getElementById('current-download-url'),
    removeDownloadBtn: document.getElementById('remove-download-btn'),

    // Help
    helpSection: document.getElementById('help-section'),
    closeHelpBtn: document.getElementById('close-help-btn'),

    // Stats
    statScript: document.getElementById('stat-script'),
    statDownload: document.getElementById('stat-download')
};

// ============================================================================
// AUTHENTICATION
// ============================================================================

class AdminAuth {
    constructor() {
        this.init();
    }

    init() {
        this.checkExistingPassword();
        this.bindEvents();
    }

    checkExistingPassword() {
        const hasPassword = localStorage.getItem(STORAGE_KEYS.PASSWORD);
        const hasSession = sessionStorage.getItem(STORAGE_KEYS.SESSION);

        if (hasPassword) {
            // Show login form
            elements.setupForm.style.display = 'none';
            elements.authForm.style.display = 'block';

            // Check if already logged in this session
            if (hasSession) {
                this.showDashboard();
            }
        } else {
            // Show setup form
            elements.setupForm.style.display = 'block';
            elements.authForm.style.display = 'none';
        }
    }

    bindEvents() {
        // Setup
        elements.setupBtn?.addEventListener('click', () => this.handleSetup());
        elements.newPassword?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') elements.confirmPassword.focus();
        });
        elements.confirmPassword?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSetup();
        });

        // Login
        elements.loginBtn?.addEventListener('click', () => this.handleLogin());
        elements.password?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleLogin();
        });

        // Logout
        elements.logoutBtn?.addEventListener('click', () => this.handleLogout());
    }

    handleSetup() {
        const newPass = elements.newPassword.value;
        const confirmPass = elements.confirmPassword.value;

        // Validation
        if (newPass.length < 4) {
            this.showError('setup', 'Password must be at least 4 characters');
            return;
        }

        if (newPass !== confirmPass) {
            this.showError('setup', 'Passwords do not match');
            return;
        }

        // Save password (simple hash for demo - in production use proper hashing)
        const hashedPassword = this.simpleHash(newPass);
        localStorage.setItem(STORAGE_KEYS.PASSWORD, hashedPassword);

        // Clear form
        elements.newPassword.value = '';
        elements.confirmPassword.value = '';

        // Log in
        sessionStorage.setItem(STORAGE_KEYS.SESSION, 'true');
        this.showDashboard();
    }

    handleLogin() {
        const inputPass = elements.password.value;
        const storedPass = localStorage.getItem(STORAGE_KEYS.PASSWORD);
        const hashedInput = this.simpleHash(inputPass);

        if (hashedInput === storedPass) {
            sessionStorage.setItem(STORAGE_KEYS.SESSION, 'true');
            elements.password.value = '';
            this.showDashboard();
        } else {
            this.showError('login', 'Incorrect password');
        }
    }

    handleLogout() {
        sessionStorage.removeItem(STORAGE_KEYS.SESSION);
        elements.dashboard.style.display = 'none';
        elements.loginScreen.style.display = 'flex';
        elements.password.value = '';
    }

    showDashboard() {
        elements.loginScreen.style.display = 'none';
        elements.dashboard.style.display = 'block';

        // Load saved settings
        new SettingsManager();
    }

    showError(type, message) {
        const errorEl = type === 'setup' ? elements.setupError : elements.loginError;
        errorEl.textContent = message;
        setTimeout(() => { errorEl.textContent = ''; }, 3000);
    }

    // Simple hash function (for demo purposes only)
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(36);
    }
}

// ============================================================================
// SETTINGS MANAGER
// ============================================================================

class SettingsManager {
    constructor() {
        this.loadSettings();
        this.bindEvents();
        this.updateStats();
    }

    loadSettings() {
        // Load Script URL
        const scriptUrl = localStorage.getItem(STORAGE_KEYS.SCRIPT_URL);
        if (scriptUrl) {
            elements.scriptUrl.value = scriptUrl;
        }

        // Load Download URL
        const downloadUrl = localStorage.getItem(STORAGE_KEYS.DOWNLOAD_URL);
        if (downloadUrl) {
            elements.downloadUrl.value = downloadUrl;
            this.showDownloadInfo(downloadUrl);
        }
    }

    bindEvents() {
        // Script URL
        elements.saveScriptBtn?.addEventListener('click', () => this.saveScriptUrl());

        // Download URL
        elements.saveDownloadBtn?.addEventListener('click', () => this.saveDownloadUrl());
        elements.removeDownloadBtn?.addEventListener('click', () => this.removeDownloadUrl());

        // Help
        elements.scriptHelpLink?.addEventListener('click', (e) => {
            e.preventDefault();
            elements.helpSection.style.display = 'block';
            elements.helpSection.scrollIntoView({ behavior: 'smooth' });
        });

        elements.closeHelpBtn?.addEventListener('click', () => {
            elements.helpSection.style.display = 'none';
        });
    }

    saveScriptUrl() {
        const url = elements.scriptUrl.value.trim();

        if (!url) {
            this.showStatus('script', 'Please enter a URL', 'error');
            return;
        }

        if (!this.isValidUrl(url)) {
            this.showStatus('script', 'Please enter a valid URL', 'error');
            return;
        }

        localStorage.setItem(STORAGE_KEYS.SCRIPT_URL, url);
        this.showStatus('script', '✓ Saved successfully', 'success');
        this.updateStats();

        console.log('Google Script URL saved:', url);
    }

    saveDownloadUrl() {
        const url = elements.downloadUrl.value.trim();

        if (!url) {
            this.showStatus('download', 'Please enter a URL', 'error');
            return;
        }

        if (!this.isValidUrl(url)) {
            this.showStatus('download', 'Please enter a valid URL', 'error');
            return;
        }

        localStorage.setItem(STORAGE_KEYS.DOWNLOAD_URL, url);
        this.showStatus('download', '✓ Saved successfully', 'success');
        this.showDownloadInfo(url);
        this.updateStats();

        console.log('Download URL saved:', url);
    }

    removeDownloadUrl() {
        localStorage.removeItem(STORAGE_KEYS.DOWNLOAD_URL);
        elements.downloadUrl.value = '';
        elements.downloadInfo.style.display = 'none';
        this.showStatus('download', '✓ Download link removed', 'success');
        this.updateStats();

        console.log('Download URL removed');
    }

    showDownloadInfo(url) {
        elements.downloadInfo.style.display = 'block';
        elements.currentDownloadUrl.textContent = url;
    }

    showStatus(type, message, status) {
        const statusEl = type === 'script' ? elements.scriptStatus : elements.downloadStatus;
        statusEl.textContent = message;
        statusEl.className = 'status-badge ' + status;

        setTimeout(() => {
            statusEl.textContent = '';
            statusEl.className = 'status-badge';
        }, 3000);
    }

    updateStats() {
        const scriptUrl = localStorage.getItem(STORAGE_KEYS.SCRIPT_URL);
        const downloadUrl = localStorage.getItem(STORAGE_KEYS.DOWNLOAD_URL);

        if (scriptUrl) {
            elements.statScript.textContent = 'Configured';
            elements.statScript.classList.add('active');
        } else {
            elements.statScript.textContent = 'Not Configured';
            elements.statScript.classList.remove('active');
        }

        if (downloadUrl) {
            elements.statDownload.textContent = 'Active';
            elements.statDownload.classList.add('active');
        } else {
            elements.statDownload.textContent = 'Not Configured';
            elements.statDownload.classList.remove('active');
        }
    }

    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    new AdminAuth();
    console.log('🔐 Next Level Admin Dashboard loaded');
});
