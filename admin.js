/* ==========================================================================
   NEXT LEVEL - ADMIN DASHBOARD JAVASCRIPT
   ========================================================================== */

// ============================================================================
// STORAGE KEYS
// ============================================================================

const STORAGE_KEYS = {
    PASSWORD: 'nextlevel_admin_password',
    SESSION: 'nextlevel_admin_session',
    SCRIPT_URL: 'nextlevel_script_url'
};

// Initialize Supabase from window (set in config.js)
const supabase = window.supabaseClient;

// ============================================================================
// DOM ELEMENTS
// ============================================================================

const elements = {
    // Login
    loginScreen: document.getElementById('login-screen'),
    authForm: document.getElementById('auth-form'),
    adminEmail: document.getElementById('admin-email'),
    password: document.getElementById('password'),
    loginBtn: document.getElementById('login-btn'),
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

    // YouTube URL
    youtubeUrl: document.getElementById('youtube-url'),
    saveYoutubeBtn: document.getElementById('save-youtube-btn'),
    youtubeStatus: document.getElementById('youtube-status'),

    // Help
    helpSection: document.getElementById('help-section'),
    closeHelpBtn: document.getElementById('close-help-btn'),

    // Stats
    statScript: document.getElementById('stat-script'),
    statDownload: document.getElementById('stat-download'),
    statDownloadCount: document.getElementById('stat-download-count')
};

// ============================================================================
// AUTHENTICATION
// ============================================================================

// Global login function expected by HTML onclick
window.loginAdmin = async function () {
    const email = elements.adminEmail.value;
    const password = elements.password.value;

    const { data, error } = await window.supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        console.error("Login failed:", error);
        alert(error.message);
        return;
    }

    // Success: store session flag and show dashboard
    sessionStorage.setItem(STORAGE_KEYS.SESSION, 'true');
    elements.adminEmail.value = '';
    elements.password.value = '';

    // Switch UI manually as it's an SPA
    elements.loginScreen.style.display = 'none';
    elements.dashboard.style.display = 'block';

    // Initialize Dashboard after login
    new SettingsManager();
};

window.logoutAdmin = async function () {
    await window.supabase.auth.signOut();
    sessionStorage.removeItem(STORAGE_KEYS.SESSION);
    elements.dashboard.style.display = 'none';
    elements.loginScreen.style.display = 'flex';
    if (elements.adminEmail) elements.adminEmail.value = '';
    if (elements.password) elements.password.value = '';
};

// Also bind logout button
if (elements.logoutBtn) {
    elements.logoutBtn.addEventListener('click', window.logoutAdmin);
}

function checkExistingSession() {
    const hasSession = sessionStorage.getItem(STORAGE_KEYS.SESSION);

    // Always show login form by default
    if (elements.authForm) {
        elements.authForm.style.display = 'block';
    }

    // Check if already logged in this session
    if (hasSession) {
        elements.loginScreen.style.display = 'none';
        elements.dashboard.style.display = 'block';
        new SettingsManager();
    }
}

// ============================================================================
// SETTINGS MANAGER
// ============================================================================

class SettingsManager {
    constructor() {
        this.loadConfig(); // Renamed from loadSettings
        this.bindEvents();
        this.updateStats();
    }

    async loadConfig() { // Renamed from loadSettings and made async
        // Load Script URL (still local for now)
        const scriptUrl = localStorage.getItem(STORAGE_KEYS.SCRIPT_URL);
        if (elements.scriptUrl && scriptUrl) {
            elements.scriptUrl.value = scriptUrl;
        }

        // Fetch settings from Supabase
        try {
            const { data, error } = await supabase
                .from('site_settings')
                .select('*')
                .eq('id', 1)
                .single();

            if (error) throw error;

            if (data) {
                // Load Download URL
                if (data.download_url) {
                    elements.downloadUrl.value = data.download_url;
                    this.showDownloadInfo(data.download_url);
                }

                // Load YouTube URL
                if (data.youtube_url) {
                    elements.youtubeUrl.value = data.youtube_url;
                }
            }
        } catch (error) {
            console.error('Error fetching config from Supabase:', error);
            this.showStatus('download', 'Database connection error', 'error');
        }

        // Fetch Total Downloads
        this.fetchDownloadCount();
    }

    bindEvents() {
        // Script URL
        elements.saveScriptBtn?.addEventListener('click', () => this.saveScriptUrl());

        // Download URL
        elements.saveDownloadBtn?.addEventListener('click', () => this.saveDownloadUrl());
        elements.removeDownloadBtn?.addEventListener('click', () => this.removeDownloadUrl());

        // YouTube URL
        elements.saveYoutubeBtn?.addEventListener('click', () => this.saveYoutubeUrl());

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

    async saveDownloadUrl() { // Made async
        const url = elements.downloadUrl.value.trim();

        if (!url) {
            this.showStatus('download', 'Please enter a URL', 'error');
            return;
        }

        if (!this.isValidUrl(url)) {
            this.showStatus('download', 'Please enter a valid URL', 'error');
            return;
        }

        elements.saveDownloadBtn.disabled = true; // Added

        try {
            const { error } = await supabase
                .from('site_settings')
                .update({ download_url: url })
                .eq('id', 1);

            if (error) throw error;

            this.showStatus('download', '✓ Saved safely to Database', 'success'); // Updated message
            this.showDownloadInfo(url);
            this.updateStats();
            console.log('Download URL saved to Supabase:', url); // Updated log
        } catch (error) {
            console.error('Error saving download URL:', error);
            this.showStatus('download', 'Error saving to Database', 'error'); // Updated message
        } finally {
            elements.saveDownloadBtn.disabled = false; // Added
        }
    }

    async removeDownloadUrl() { // Made async
        elements.removeDownloadBtn.disabled = true; // Added

        try {
            const { error } = await supabase
                .from('site_settings')
                .update({ download_url: '' })
                .eq('id', 1);

            if (error) throw error;

            elements.downloadUrl.value = '';
            elements.downloadInfo.style.display = 'none';
            this.showStatus('download', '✓ Download link removed from Database', 'success'); // Updated message
            this.updateStats();
            console.log('Download URL removed from Supabase'); // Updated log
        } catch (error) {
            console.error('Error removing download URL:', error);
            this.showStatus('download', 'Error removing from Database', 'error'); // Updated message
        } finally {
            elements.removeDownloadBtn.disabled = false; // Added
        }
    }

    async saveYoutubeUrl() { // Made async
        const url = elements.youtubeUrl.value.trim();
        elements.saveYoutubeBtn.disabled = true; // Added

        if (!url) {
            try {
                const { error } = await supabase.from('site_settings').update({ youtube_url: '' }).eq('id', 1);
                if (error) throw error;
                this.showStatus('youtube', 'Installation video disabled in Database', 'success'); // Updated message
            } catch (error) {
                this.showStatus('youtube', 'Database Error', 'error'); // Updated message
            }
            elements.saveYoutubeBtn.disabled = false; // Added
            return;
        }

        if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
            this.showStatus('youtube', 'Please enter a valid YouTube URL', 'error');
            elements.saveYoutubeBtn.disabled = false; // Added
            return;
        }

        try {
            const { error } = await supabase
                .from('site_settings')
                .update({ youtube_url: url })
                .eq('id', 1);

            if (error) throw error;

            this.showStatus('youtube', '✓ Saved successfully to Database', 'success'); // Updated message
            console.log('YouTube URL saved to Supabase:', url); // Updated log
        } catch (error) {
            console.error('Error saving youtube URL:', error);
            this.showStatus('youtube', 'Error saving to Database', 'error'); // Updated message
        } finally {
            elements.saveYoutubeBtn.disabled = false; // Added
        }
    }

    async showDownloadInfo(url) {
        elements.downloadInfo.style.display = 'block';
        elements.currentDownloadUrl.textContent = url;
    }

    // Added showScriptInfo method
    showScriptInfo(url) {
        if (!elements.scriptStatus) return;
        console.log('Script URL loaded:', url);
    }

    showStatus(type, message, status) {
        let statusEl;
        if (type === 'script') statusEl = elements.scriptStatus;
        else if (type === 'download') statusEl = elements.downloadStatus;
        else if (type === 'youtube') statusEl = elements.youtubeStatus;

        if (!statusEl) return;

        statusEl.textContent = message;
        statusEl.className = 'status-badge ' + status;

        setTimeout(() => {
            statusEl.textContent = '';
            statusEl.className = 'status-badge';
        }, 3000);
    }

    async updateStats() { // Made async
        const scriptUrl = localStorage.getItem(STORAGE_KEYS.SCRIPT_URL);

        if (elements.statScript) {
            if (scriptUrl) {
                elements.statScript.textContent = 'Configured';
                elements.statScript.classList.add('active');
            } else {
                elements.statScript.textContent = 'Not Configured';
                elements.statScript.classList.remove('active');
            }
        }

        try {
            const { data } = await supabase
                .from('site_settings')
                .select('download_url')
                .eq('id', 1)
                .single();

            if (data && data.download_url) {
                elements.statDownload.textContent = 'Active';
                elements.statDownload.classList.add('active');
            } else {
                elements.statDownload.textContent = 'Not Configured';
                elements.statDownload.classList.remove('active');
            }
        } catch (e) {
            elements.statDownload.textContent = 'Error';
            elements.statDownload.classList.remove('active');
        }
    }

    async fetchDownloadCount() {
        if (!elements.statDownloadCount) return;

        try {
            const response = await fetch('https://api.counterapi.dev/v1/nextlevelfitness/downloads');

            if (response.ok) {
                const data = await response.json();
                elements.statDownloadCount.textContent = (data && data.count) ? data.count.toLocaleString() : '0';
            } else {
                elements.statDownloadCount.textContent = '0';
            }
        } catch (error) {
            console.error('Error fetching download count:', error);
            elements.statDownloadCount.textContent = 'Unavailable';
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
    checkExistingSession();
    console.log('🔐 Next Level Admin Dashboard loaded');
}); 
