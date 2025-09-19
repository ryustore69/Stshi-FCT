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
        
        // Settings elements
        this.settingsModal = document.getElementById('settingsModal');
        this.enableNotifications = document.getElementById('enableNotifications');
        this.detailedLogs = document.getElementById('detailedLogs');
        this.autoSaveLogs = document.getElementById('autoSaveLogs');
        this.exportLogsBtn = document.getElementById('exportLogs');
        this.clearLogsBtn = document.getElementById('clearLogs');
    }
    
    setupEventListeners() {
        this.startBtn.addEventListener('click', () => this.start());
        this.stopBtn.addEventListener('click', () => this.stop());
        this.settingsBtn.addEventListener('click', () => this.openSettings());
        
        // Save currency when changed
        this.currencySelect.addEventListener('change', () => {
            this.saveStats();
            this.log(`Currency changed to: ${this.currencySelect.value.toUpperCase()}`, 'info');
        });
        
        // Settings event listeners
        document.querySelector('.close').addEventListener('click', () => this.closeSettings());
        this.enableNotifications.addEventListener('change', () => this.saveSettings());
        this.detailedLogs.addEventListener('change', () => this.saveSettings());
        this.autoSaveLogs.addEventListener('change', () => this.saveSettings());
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
        this.logElement.scrollTop = this.logElement.scrollHeight;
        
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
        this.settingsModal.style.display = 'block';
    }
    
    closeSettings() {
        this.settingsModal.style.display = 'none';
    }
    
    async saveSettings() {
        const settings = {
            enableNotifications: this.enableNotifications.checked,
            detailedLogs: this.detailedLogs.checked,
            autoSaveLogs: this.autoSaveLogs.checked
        };
        
        await chrome.storage.local.set({ settings });
        this.log('Settings saved', 'info');
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
        
        const lastUpdated = new Date(message.lastUpdated).toLocaleTimeString();
        bot.log(`Real-time update: ${bot.completedCount} completed, ${bot.failedCount} failed, running: ${bot.isRunning} (${lastUpdated})`, 'info');
    } else {
        bot.handleMessage(message);
    }
});
