class FaucetBotPopup {
    constructor() {
        this.isRunning = false;
        this.completedCount = 0;
        this.failedCount = 0;
        this.shortlinkCount = 0;
        this.challengeCount = 0;
        
        this.initializeElements();
        this.setupEventListeners();
        this.loadStats();
        this.loadVersion();
    }
    
    initializeElements() {
        this.currencySelect = document.getElementById('currencySelect');
        this.startBtn = document.getElementById('startBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.status = document.getElementById('status');
        this.completedCountEl = document.getElementById('completedCount');
        this.failedCountEl = document.getElementById('failedCount');
        this.shortlinkCountEl = document.getElementById('shortlinkCount');
        this.challengeCountEl = document.getElementById('challengeCount');
        this.logElement = document.getElementById('log');
        this.versionBadge = document.getElementById('versionBadge');
        this.checkUpdateBtn = document.getElementById('checkUpdateBtn');
        this.updateStatus = document.getElementById('updateStatus');
        
        // Settings elements
        this.settingsModal = document.getElementById('settingsModal');
        this.enableNotifications = document.getElementById('enableNotifications');
        this.detailedLogs = document.getElementById('detailedLogs');
        this.autoSaveLogs = document.getElementById('autoSaveLogs');
        this.enableChallenge = document.getElementById('enableChallenge');
        this.saveSettingsBtn = document.getElementById('saveSettings');
        this.exportLogsBtn = document.getElementById('exportLogs');
        this.clearLogsBtn = document.getElementById('clearLogs');
    }
    
    setupEventListeners() {
        this.startBtn.addEventListener('click', () => this.start());
        this.stopBtn.addEventListener('click', () => this.stop());
        this.settingsBtn.addEventListener('click', () => this.openSettings());
        this.checkUpdateBtn.addEventListener('click', () => this.checkForUpdate());
        
        // Save currency when changed
        this.currencySelect.addEventListener('change', () => {
            this.saveStats();
            this.log(`Currency changed to: ${this.currencySelect.value.toUpperCase()}`, 'info');
        });
        
        // Settings event listeners
        document.querySelector('.close').addEventListener('click', () => this.closeSettings());
        this.saveSettingsBtn.addEventListener('click', () => this.saveSettings());
        this.exportLogsBtn.addEventListener('click', () => this.exportLogs());
        this.clearLogsBtn.addEventListener('click', () => this.clearLogs());
        
        // Close modal when clicking outside
        window.addEventListener('click', (event) => {
            if (event.target === this.settingsModal) {
                this.closeSettings();
            }
        });
        
        // Refresh stats when popup becomes visible
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.refreshStats();
            }
        });
    }
    
    async loadStats() {
        try {
            const stats = await chrome.storage.local.get(['completedCount', 'failedCount', 'shortlinkCount', 'challengeCount', 'isRunning', 'lastSaved', 'selectedCurrency', 'settings']);
            this.completedCount = stats.completedCount || 0;
            this.failedCount = stats.failedCount || 0;
            this.shortlinkCount = stats.shortlinkCount || 0;
            this.challengeCount = stats.challengeCount || 0;
            this.isRunning = stats.isRunning || false;
            this.updateStats();
            
            // Load selected currency
            if (stats.selectedCurrency) {
                this.currencySelect.value = stats.selectedCurrency;
                this.log(`Currency restored: ${stats.selectedCurrency.toUpperCase()}`, 'info');
            }
            
            // Load settings
            if (stats.settings) {
                this.enableNotifications.checked = stats.settings.enableNotifications !== false;
                this.detailedLogs.checked = stats.settings.detailedLogs || false;
                this.autoSaveLogs.checked = stats.settings.autoSaveLogs || false;
                this.enableChallenge.checked = stats.settings.enableChallenge !== false;
            }
            
            // Sync with content script to get real-time status
            await this.syncWithContentScript();
            
            if (stats.lastSaved) {
                const lastSaved = new Date(stats.lastSaved).toLocaleTimeString();
                this.log(`Stats loaded: ${this.completedCount} completed, ${this.failedCount} failed, running: ${this.isRunning} (saved: ${lastSaved})`, 'info');
            }
        } catch (error) {
            this.log('Could not load stats', 'error');
        }
    }
    
    async loadVersion() {
        try {
            // Get version from manifest
            const manifest = chrome.runtime.getManifest();
            const version = manifest.version;
            
            if (this.versionBadge) {
                this.versionBadge.textContent = `v${version}`;
            }
            
            this.log(`Extension version: ${version}`, 'info');
        } catch (error) {
            console.error('Could not load version:', error);
            if (this.versionBadge) {
                this.versionBadge.textContent = 'v2.0.0'; // fallback
            }
        }
    }
    
    async checkForUpdate() {
        try {
            this.checkUpdateBtn.disabled = true;
            this.checkUpdateBtn.textContent = '🔄 CHECKING...';
            this.showUpdateStatus('Checking for updates...', 'info');
            
            // Get current version
            const manifest = chrome.runtime.getManifest();
            const currentVersion = manifest.version;
            
            // Check GitHub API for latest release
            const response = await fetch('https://api.github.com/repos/ryustore69/Stshi-FCT/releases/latest');
            
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('No releases found.');
                }
                throw new Error(`GitHub API error: ${response.status}`);
            }
            
            const releaseData = await response.json();
            const latestVersion = releaseData.tag_name.replace('v', ''); // Remove 'v' prefix
            
            this.log(`Current version: ${currentVersion}, Latest version: ${latestVersion}`, 'info');
            
            if (this.compareVersions(latestVersion, currentVersion) > 0) {
                // Update available
                this.showUpdateStatus(`Update available: v${latestVersion}`, 'info');
                this.checkUpdateBtn.textContent = '⬇️ DOWNLOAD UPDATE';
                this.checkUpdateBtn.onclick = () => this.downloadUpdate(releaseData.html_url);
                this.log(`Update available: v${latestVersion}`, 'info');
            } else {
                // Already up to date
                this.showUpdateStatus('You are using the latest version!', 'success');
                this.checkUpdateBtn.textContent = '✅ UP TO DATE';
                this.log('Extension is up to date', 'info');
            }
            
        } catch (error) {
            console.error('Update check failed:', error);
            
            // Handle specific error cases
            if (error.message.includes('No releases found')) {
                this.showUpdateStatus('No releases available yet. Check GitHub for updates.', 'info');
                this.checkUpdateBtn.textContent = '🌐 VISIT GITHUB';
                this.checkUpdateBtn.onclick = () => this.visitGitHub();
            } else {
                this.showUpdateStatus('Failed to check for updates', 'error');
                this.checkUpdateBtn.textContent = '🔄 CHECK FOR UPDATE';
            }
            
            this.log(`Update check failed: ${error.message}`, 'error');
        } finally {
            this.checkUpdateBtn.disabled = false;
        }
    }
    
    compareVersions(version1, version2) {
        const v1parts = version1.split('.').map(Number);
        const v2parts = version2.split('.').map(Number);
        
        for (let i = 0; i < Math.max(v1parts.length, v2parts.length); i++) {
            const v1part = v1parts[i] || 0;
            const v2part = v2parts[i] || 0;
            
            if (v1part > v2part) return 1;
            if (v1part < v2part) return -1;
        }
        
        return 0;
    }
    
    downloadUpdate(downloadUrl) {
        // Open download page in new tab
        chrome.tabs.create({ url: downloadUrl });
        this.showUpdateStatus('Download page opened in new tab', 'info');
        this.log('Download page opened', 'info');
    }
    
    visitGitHub() {
        // Open GitHub repository in new tab
        chrome.tabs.create({ url: 'https://github.com/ryustore69/Stshi-FCT' });
        this.showUpdateStatus('GitHub repository opened in new tab', 'info');
        this.log('GitHub repository opened', 'info');
    }
    
    showUpdateStatus(message, type) {
        if (this.updateStatus) {
            this.updateStatus.textContent = message;
            this.updateStatus.className = `update-status ${type}`;
            this.updateStatus.style.display = 'block';
            
            // Auto-hide after 5 seconds for success/info messages
            if (type === 'success' || type === 'info') {
                setTimeout(() => {
                    this.updateStatus.style.display = 'none';
                }, 5000);
            }
        }
    }
    
    async saveStats() {
        await chrome.storage.local.set({
            completedCount: this.completedCount,
            failedCount: this.failedCount,
            shortlinkCount: this.shortlinkCount,
            challengeCount: this.challengeCount,
            isRunning: this.isRunning,
            selectedCurrency: this.currencySelect.value,
            lastSaved: Date.now()
        });
    }
    
    async syncWithContentScript() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab.url.includes('satoshifaucet.io')) {
                const response = await chrome.tabs.sendMessage(tab.id, { action: 'getStats' });
                if (response) {
                    this.completedCount = response.completed || this.completedCount;
                    this.failedCount = response.failed || this.failedCount;
                    this.shortlinkCount = response.shortlinkCount || this.shortlinkCount;
                    this.challengeCount = response.challengeCount || this.challengeCount;
                    this.isRunning = response.isRunning || this.isRunning;
                    
                    this.updateStats();
                    this.updateStatus(this.isRunning ? 'running' : 'stopped', 
                                    this.isRunning ? 'Bot Running' : 'Bot Stopped');
                    this.startBtn.disabled = this.isRunning;
                    this.stopBtn.disabled = !this.isRunning;
                    
                    this.log(`Synced with content script: ${this.completedCount} completed, ${this.failedCount} failed, running: ${this.isRunning}`, 'info');
                }
            }
        } catch (error) {
            this.log('Could not sync with content script, using stored stats', 'warning');
        }
    }
    
    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type}`;
        logEntry.textContent = `[${timestamp}] ${message}`;
        
        this.logElement.appendChild(logEntry);
        
        // Force scroll to bottom with a small delay to ensure DOM is updated
        setTimeout(() => {
            this.logElement.scrollTop = this.logElement.scrollHeight;
        }, 10);
        
        // Keep only last 50 log entries
        while (this.logElement.children.length > 50) {
            this.logElement.removeChild(this.logElement.firstChild);
        }
    }
    
    updateStats() {
        this.completedCountEl.textContent = this.completedCount;
        this.failedCountEl.textContent = this.failedCount;
        this.shortlinkCountEl.textContent = this.shortlinkCount;
        this.challengeCountEl.textContent = this.challengeCount;
    }
    
    updateStatus(status, text) {
        this.status.className = `status ${status}`;
        this.status.textContent = text;
    }
    
    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type}`;
        logEntry.textContent = `[${timestamp}] ${message}`;
        
        this.logElement.appendChild(logEntry);
        this.logElement.scrollTop = this.logElement.scrollHeight;
        
        // Keep only last 50 log entries
        while (this.logElement.children.length > 50) {
            this.logElement.removeChild(this.logElement.firstChild);
        }
    }
    
    async start() {
        if (this.isRunning) return;
        
        // Check if we're on the right page
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (!tab.url.includes('satoshifaucet.io')) {
            this.log('Please open satoshifaucet.io first!', 'error');
            return;
        }
        
        const selectedCurrency = this.currencySelect.value;
        this.log(`Starting bot for ${selectedCurrency.toUpperCase()}...`, 'info');
        
        // Navigate to the correct currency page if needed
        if (!tab.url.includes(`/currency/${selectedCurrency}`)) {
            const newUrl = `https://satoshifaucet.io/faucet/currency/${selectedCurrency}`;
            await chrome.tabs.update(tab.id, { url: newUrl });
            this.log(`Navigating to ${selectedCurrency.toUpperCase()} faucet...`, 'info');
            
            // Wait for page to load
            setTimeout(() => {
                this.startBot();
            }, 3000);
        } else {
            this.startBot();
        }
    }
    
    async startBot() {
        this.isRunning = true;
        this.updateStatus('running', 'Bot Running');
        this.startBtn.disabled = true;
        this.stopBtn.disabled = false;
        
        this.log('Bot started successfully!', 'success');
        
        // Send message to content script to start automation
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        let retryCount = 0;
        const maxRetries = 5;
        
        const trySendMessage = async () => {
            try {
                await chrome.tabs.sendMessage(tab.id, {
                    action: 'startBot',
                    currency: this.currencySelect.value
                });
                this.log('Message sent to content script successfully!', 'success');
            } catch (error) {
                retryCount++;
                if (retryCount < maxRetries) {
                    this.log(`Content script not ready, retry ${retryCount}/${maxRetries}...`, 'warning');
                    setTimeout(trySendMessage, 2000);
                } else {
                    this.log('Failed to connect to content script after multiple retries', 'error');
                    this.isRunning = false;
                    this.updateStatus('stopped', 'Bot Stopped');
                    this.startBtn.disabled = false;
                    this.stopBtn.disabled = true;
                }
            }
        };
        
        trySendMessage();
    }
    
    async stop() {
        this.isRunning = false;
        this.updateStatus('stopped', 'Bot Stopped');
        this.startBtn.disabled = false;
        this.stopBtn.disabled = true;
        
        this.log('Bot stopped!', 'warning');
        
        // Send message to content script to stop automation
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        let retryCount = 0;
        const maxRetries = 3;
        
        const trySendStopMessage = async () => {
            try {
                await chrome.tabs.sendMessage(tab.id, { action: 'stopBot' });
                this.log('Stop message sent to content script successfully!', 'success');
            } catch (error) {
                retryCount++;
                if (retryCount < maxRetries) {
                    this.log(`Could not send stop message, retry ${retryCount}/${maxRetries}...`, 'warning');
                    setTimeout(trySendStopMessage, 1000);
                } else {
                    this.log('Could not send stop message to content script after retries', 'warning');
                }
            }
        };
        
        trySendStopMessage();
        await this.saveStats();
    }
    
    async handleMessage(message) {
        switch (message.type) {
            case 'taskCompleted':
                this.completedCount++;
                this.updateStats();
                this.saveStats();
                this.log(`Task completed! Total: ${this.completedCount}`, 'success');
                await this.showNotification('✅ Task Completed', `Successfully completed task! Total: ${this.completedCount}`, 'success');
                break;
                
            case 'taskFailed':
                this.failedCount++;
                this.updateStats();
                this.saveStats();
                this.log(`Task failed! Total failed: ${this.failedCount}`, 'error');
                await this.showNotification('❌ Task Failed', `Task failed! Total failed: ${this.failedCount}`, 'error');
                break;
                
            case 'log':
                this.log(message.message, message.level);
                break;
        }
    }
    
    async refreshStats() {
        try {
            // First try to sync with content script (most accurate)
            await this.syncWithContentScript();
            
            // Then get stats from background script as backup
            const response = await chrome.runtime.sendMessage({ type: 'getGlobalStats' });
            if (response) {
                this.completedCount = response.completedCount || this.completedCount;
                this.failedCount = response.failedCount || this.failedCount;
                this.isRunning = response.isRunning || this.isRunning;
                
                this.updateStats();
                this.updateStatus(this.isRunning ? 'running' : 'stopped', 
                                this.isRunning ? 'Bot Running' : 'Bot Stopped');
                this.startBtn.disabled = this.isRunning;
                this.stopBtn.disabled = !this.isRunning;
                
                const lastUpdated = new Date(response.lastUpdated).toLocaleTimeString();
                this.log(`Stats synced: ${this.completedCount} completed, ${this.failedCount} failed, running: ${this.isRunning} (updated: ${lastUpdated})`, 'info');
            } else {
                // Fallback to storage
                await this.loadStats();
            }
        } catch (error) {
            this.log('Could not refresh stats, using storage', 'warning');
            await this.loadStats();
        }
    }
    
    // Settings methods
    openSettings() {
        this.settingsModal.classList.add('show');
        // Add body scroll lock
        document.body.style.overflow = 'hidden';
    }
    
    closeSettings() {
        this.settingsModal.classList.remove('show');
        // Remove body scroll lock
        document.body.style.overflow = 'auto';
    }
    
    async saveSettings() {
        try {
            const settings = {
                enableNotifications: this.enableNotifications.checked,
                detailedLogs: this.detailedLogs.checked,
                autoSaveLogs: this.autoSaveLogs.checked,
                enableChallenge: this.enableChallenge.checked
            };
            
            await chrome.storage.local.set({ settings });
            this.log('Settings saved', 'info');
            
            // Send settings to content script with retry mechanism
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            let contentScriptSuccess = false;
            
            if (tab.url.includes('satoshifaucet.io')) {
                // Try to send settings with retry mechanism and timeout
                for (let attempt = 1; attempt <= 3; attempt++) {
                    try {
                        // Add timeout to prevent hanging
                        const timeoutPromise = new Promise((_, reject) => 
                            setTimeout(() => reject(new Error('Timeout')), 2000)
                        );
                        
                        const messagePromise = chrome.tabs.sendMessage(tab.id, {
                            action: 'updateSettings',
                            settings: settings
                        });
                        
                        await Promise.race([messagePromise, timeoutPromise]);
                        this.log('Settings sent to content script successfully', 'info');
                        contentScriptSuccess = true;
                        break;
                    } catch (error) {
                        this.log(`Attempt ${attempt}/3: Could not send settings to content script (${error.message})`, 'warning');
                        if (attempt < 3) {
                            // Wait 2 seconds before retry
                            await new Promise(resolve => setTimeout(resolve, 2000));
                        }
                    }
                }
            } else {
                contentScriptSuccess = true; // No content script needed if not on faucet page
                this.log('Not on faucet page, settings will sync when bot starts', 'info');
            }
            
            // Show success feedback
            if (contentScriptSuccess) {
                this.showFeedback('✅ Settings saved successfully!', 'success');
            } else {
                this.showFeedback('⚠️ Settings saved but failed to sync with bot', 'warning');
            }
            
        } catch (error) {
            this.log('Failed to save settings', 'error');
            this.showFeedback('❌ Failed to save settings', 'error');
        }
    }
    
    showFeedback(message, type = 'info') {
        // Remove existing toast if any
        const existingToast = document.querySelector('.feedback-toast');
        if (existingToast) {
            existingToast.remove();
        }
        
        // Create new toast
        const toast = document.createElement('div');
        toast.className = `feedback-toast ${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Show toast
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        // Hide toast after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
    
    async exportLogs() {
        const logs = Array.from(this.logElement.children).map(entry => entry.textContent).join('\n');
        const blob = new Blob([logs], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `faucet-bot-logs-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.log('Logs exported successfully', 'success');
    }
    
    clearLogs() {
        this.logElement.innerHTML = '<div class="log-entry info">Logs cleared</div>';
        this.log('Logs cleared', 'info');
    }
    
    // Notification methods
    async showNotification(title, message, type = 'info') {
        const settings = await chrome.storage.local.get(['settings']);
        if (settings.settings && settings.settings.enableNotifications === false) {
            return;
        }
        
        const iconUrl = type === 'success' ? 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTI0IDRDMzUuMDQ1NyA0IDQ0IDEyLjk1NDMgNDQgMjRDMzUuMDQ1NyA0NCAyNCAzNS4wNDU3IDI0IDI0QzI0IDEyLjk1NDMgMTIuOTU0MyA0IDI0IDRaIiBmaWxsPSIjMjhhNzQ1Ii8+CjxwYXRoIGQ9Ik0yMCAyOEwyNCAzMkwyOCAyOCIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+' : 
                          type === 'error' ? 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTI0IDRDMzUuMDQ1NyA0IDQ0IDEyLjk1NDMgNDQgMjRDMzUuMDQ1NyA0NCAyNCAzNS4wNDU3IDI0IDI0QzI0IDEyLjk1NDMgMTIuOTU0MyA0IDI0IDRaIiBmaWxsPSIjZGMzNTQ1Ii8+CjxwYXRoIGQ9Ik0yMCAyMEwyOCAyOCIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPHBhdGggZD0iTTI4IDIwTDIwIDI4IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4=' :
                          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTI0IDRDMzUuMDQ1NyA0IDQ0IDEyLjk1NDMgNDQgMjRDMzUuMDQ1NyA0NCAyNCAzNS4wNDU3IDI0IDI0QzI0IDEyLjk1NDMgMTIuOTU0MyA0IDI0IDRaIiBmaWxsPSIjMTdhMmI4Ii8+CjxwYXRoIGQ9Ik0yNCAzMkwyNCAxNiIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPHBhdGggZD0iTTMyIDI0SDE2IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4=';
        
        chrome.notifications.create({
            type: 'basic',
            iconUrl: iconUrl,
            title: title,
            message: message
        });
    }
}

// Initialize popup
const bot = new FaucetBotPopup();

// Refresh stats when popup opens
bot.refreshStats();

// Also sync immediately when popup becomes visible
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        bot.syncWithContentScript();
    }
});

// Throttle real-time updates to reduce spam
let lastUpdateTime = 0;
const UPDATE_THROTTLE = 5000; // 5 seconds

// Listen for messages from content script and background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'globalStatsUpdate') {
        // Update stats from background script
        bot.completedCount = message.completedCount || 0;
        bot.failedCount = message.failedCount || 0;
        bot.isRunning = message.isRunning || false;
        
        bot.updateStats();
        bot.updateStatus(bot.isRunning ? 'running' : 'stopped', 
                        bot.isRunning ? 'Bot Running' : 'Bot Stopped');
        bot.startBtn.disabled = bot.isRunning;
        bot.stopBtn.disabled = !bot.isRunning;
        
        // Only log real-time updates occasionally to reduce spam
        const now = Date.now();
        if (now - lastUpdateTime > UPDATE_THROTTLE) {
            const lastUpdated = new Date(message.lastUpdated).toLocaleTimeString();
            bot.log(`Real-time update: ${bot.completedCount} completed, ${bot.failedCount} failed, running: ${bot.isRunning} (${lastUpdated})`, 'info');
            lastUpdateTime = now;
        }
    } else {
        bot.handleMessage(message);
    }
});
