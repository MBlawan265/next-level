/* ==========================================================================
   NEXT LEVEL - ADMIN DASHBOARD JAVASCRIPT
   ========================================================================== */

// ============================================================================
// STORAGE KEYS
// ============================================================================

// Storage keys mapping
const STORAGE_KEYS = {
    PASSWORD: 'nextlevel_admin_password',
    SESSION: 'nextlevel_admin_session',
    SCRIPT_URL: 'nextlevel_script_url',
    DOWNLOAD_URL: 'nextlevel_download_url',
    YOUTUBE_URL: 'nextlevel_youtube_url'
};

// Initialize Admin-Level Supabase Client
// Uses service key if available (to bypass RLS for admin), otherwise falls back to anon key
const dbClient = window.supabase.createClient(
    window.NEXTLEVEL_CONFIG.supabaseUrl,
    window.NEXTLEVEL_CONFIG.supabaseServiceKey || window.NEXTLEVEL_CONFIG.supabaseKey
);

// ============================================================================
// DOM ELEMENTS
// ============================================================================

const elements = {
    // Login
    loginScreen: document.getElementById('login-screen'),
    authForm: document.getElementById('auth-form'),
    adminId: document.getElementById('admin-id'),
    password: document.getElementById('admin-password'),
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
    const adminId = elements.adminId.value;
    const password = elements.password.value;

    const expectedId = 'PROJECT-SHARKOLLE';
    const expectedPassword = 'Amir@2015';

    if (adminId !== expectedId || password !== expectedPassword) {
        if (elements.loginError) {
            elements.loginError.textContent = "Invalid Admin ID or Password";
            setTimeout(() => { elements.loginError.textContent = ''; }, 3000);
        }
        return;
    }

    // Success: store session flag and show dashboard
    sessionStorage.setItem(STORAGE_KEYS.SESSION, 'true');
    elements.adminId.value = '';
    elements.password.value = '';

    // Switch UI manually as it's an SPA
    elements.loginScreen.style.display = 'none';
    elements.dashboard.style.display = 'block';

    // Initialize Dashboard after login
    new SettingsManager();
    new FeedbackAdminManager();
};

window.logoutAdmin = async function () {
    sessionStorage.removeItem(STORAGE_KEYS.SESSION);
    elements.dashboard.style.display = 'none';
    elements.loginScreen.style.display = 'flex';
    if (elements.adminId) elements.adminId.value = '';
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
        new FeedbackAdminManager();
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

    loadConfig() {
        // Load Script URL (still local for now)
        const scriptUrl = localStorage.getItem(STORAGE_KEYS.SCRIPT_URL);
        if (elements.scriptUrl && scriptUrl) {
            elements.scriptUrl.value = scriptUrl;
        }

        // Fetch settings from LocalStorage
        const downloadUrl = localStorage.getItem(STORAGE_KEYS.DOWNLOAD_URL);
        if (downloadUrl) {
            elements.downloadUrl.value = downloadUrl;
            this.showDownloadInfo(downloadUrl);
        }

        const youtubeUrl = localStorage.getItem(STORAGE_KEYS.YOUTUBE_URL);
        if (youtubeUrl) {
            elements.youtubeUrl.value = youtubeUrl;
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

    saveYoutubeUrl() {
        const url = elements.youtubeUrl.value.trim();

        if (!url) {
            localStorage.removeItem(STORAGE_KEYS.YOUTUBE_URL);
            this.showStatus('youtube', 'Installation video disabled', 'success');
            return;
        }

        if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
            this.showStatus('youtube', 'Please enter a valid YouTube URL', 'error');
            return;
        }

        localStorage.setItem(STORAGE_KEYS.YOUTUBE_URL, url);
        this.showStatus('youtube', '✓ Saved successfully', 'success');
        console.log('YouTube URL saved:', url);
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

    updateStats() {
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

        const downloadUrl = localStorage.getItem(STORAGE_KEYS.DOWNLOAD_URL);
        if (elements.statDownload) {
            if (downloadUrl) {
                elements.statDownload.textContent = 'Active';
                elements.statDownload.classList.add('active');
            } else {
                elements.statDownload.textContent = 'Not Configured';
                elements.statDownload.classList.remove('active');
            }
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
// FEEDBACK ADMIN MANAGER
// ============================================================================

class FeedbackAdminManager {
    constructor() {
        this.listArea = document.getElementById('admin-feedback-list');
        this.refreshBtn = document.getElementById('refresh-feedback-btn');

        if (this.listArea) {
            this.init();
        }
    }

    init() {
        if (this.refreshBtn) {
            this.refreshBtn.addEventListener('click', () => this.fetchFeedbacks());
        }
        this.fetchFeedbacks();
    }

    async fetchFeedbacks() {
        this.listArea.innerHTML = '<div class="status-badge">Loading incoming signals...</div>';

        try {
            if (!dbClient) {
                this.listArea.innerHTML = '<div class="status-badge error">Supabase client error.</div>';
                return;
            }

            const { data, error } = await dbClient
                .from('feedbacks')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data && data.length > 0) {
                this.renderFeedbacks(data);
            } else {
                this.listArea.innerHTML = '<div class="status-badge">No signals received yet.</div>';
            }
        } catch (err) {
            console.error('Error fetching feedbacks:', err);
            this.listArea.innerHTML = '<div class="status-badge error">Failed to load signals.</div>';
        }
    }

    renderFeedbacks(feedbacks) {
        this.listArea.innerHTML = '';
        feedbacks.forEach(item => {
            const date = new Date(item.created_at).toLocaleDateString();
            const safeName = this.escapeHTML(item.name);
            const safeEmail = this.escapeHTML(item.email);
            const safeMessage = this.escapeHTML(item.message);
            const safeReply = this.escapeHTML(item.reply || '');
            const hasReply = !!item.reply;

            const card = document.createElement('div');
            card.className = 'admin-feedback-card';

            card.innerHTML = `
                <div class="admin-feedback-header">
                    <div>
                        <span class="af-user">${safeName}</span>
                        <span class="af-email">${safeEmail}</span>
                    </div>
                    <div>
                        <span class="af-type ${item.type}">${item.type}</span>
                        <span class="feedback-date" style="margin-left: 10px;">${date}</span>
                    </div>
                </div>
                <div class="admin-feedback-msg">${safeMessage}</div>
                <div class="admin-feedback-reply-area">
                    <textarea class="admin-input af-reply-input" id="reply-input-${item.id}" placeholder="Type your response...">${safeReply}</textarea>
                    <button class="btn btn-primary btn-sm" onclick="window.submitAdminReply('${item.id}')" style="margin-top: 5px;">
                        ${hasReply ? 'Update Reply' : 'Send Reply'}
                    </button>
                    <div class="form-error" id="reply-error-${item.id}" style="text-align: left; margin: 0;"></div>
                </div>
            `;
            this.listArea.appendChild(card);
        });
    }

    escapeHTML(str) {
        if (!str) return '';
        return str.replace(/[&<>'"]/g, tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag]));
    }
}

// Global function to handle replies
window.submitAdminReply = async function (id) {
    const input = document.getElementById(`reply-input-${id}`);
    const errObj = document.getElementById(`reply-error-${id}`);
    const replyText = input.value.trim();

    if (!replyText) {
        errObj.textContent = "Reply cannot be empty.";
        errObj.style.color = "#ef5350";
        return;
    }

    try {
        errObj.textContent = "Sending...";
        errObj.style.color = "var(--color-neon-blue)";

        const { error } = await dbClient
            .from('feedbacks')
            .update({
                reply: replyText,
                replied_at: new Date().toISOString()
            })
            .eq('id', id);

        if (error) throw error;

        errObj.textContent = "Reply sent successfully.";
        errObj.style.color = "#66bb6a";

        setTimeout(() => { errObj.textContent = ''; }, 3000);

    } catch (err) {
        console.error("Error replying to feedback", err);
        errObj.textContent = "Failed to send reply.";
        errObj.style.color = "#ef5350";
    }
};

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    checkExistingSession();
    console.log('🔐 Next Level Admin Dashboard loaded');
});
