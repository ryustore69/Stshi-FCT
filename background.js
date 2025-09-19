// Background script for Satoshi Faucet Bot
let globalStats = {
    completedCount: 0,
    failedCount: 0,
    shortlinkCount: 0,
    challengeCount: 0,
    isRunning: false,
    lastUpdated: Date.now()
};

chrome.runtime.onInstalled.addListener(() => {
    console.log('Satoshi Faucet Bot extension installed!');
    // Load stats from storage
    chrome.storage.local.get(['completedCount', 'failedCount', 'shortlinkCount', 'challengeCount', 'isRunning'], (result) => {
        globalStats.completedCount = result.completedCount || 0;
        globalStats.failedCount = result.failedCount || 0;
        globalStats.shortlinkCount = result.shortlinkCount || 0;
        globalStats.challengeCount = result.challengeCount || 0;
        globalStats.isRunning = result.isRunning || false;
        globalStats.lastUpdated = Date.now();
    });
});

// Handle messages between popup and content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'statsUpdate') {
        // Update global stats from content script
        globalStats.completedCount = message.completedCount || globalStats.completedCount;
        globalStats.failedCount = message.failedCount || globalStats.failedCount;
        globalStats.shortlinkCount = message.shortlinkCount || globalStats.shortlinkCount;
        globalStats.challengeCount = message.challengeCount || globalStats.challengeCount;
        globalStats.isRunning = message.isRunning !== undefined ? message.isRunning : globalStats.isRunning;
        globalStats.lastUpdated = Date.now();
        
        // Save to storage
        chrome.storage.local.set({
            completedCount: globalStats.completedCount,
            failedCount: globalStats.failedCount,
            shortlinkCount: globalStats.shortlinkCount,
            challengeCount: globalStats.challengeCount,
            isRunning: globalStats.isRunning,
            lastUpdated: globalStats.lastUpdated
        });
        
        // Forward to popup if it's open
        chrome.runtime.sendMessage({
            type: 'globalStatsUpdate',
            ...globalStats
        });
        
        sendResponse({ success: true });
    } else if (message.type === 'getGlobalStats') {
        // Return current global stats
        sendResponse(globalStats);
    } else if (message.type === 'taskCompleted' || message.type === 'taskFailed') {
        // Handle task completion/failure messages
        console.log('Background received:', message);
        
        // Update global stats
        if (message.completedCount !== undefined) globalStats.completedCount = message.completedCount;
        if (message.failedCount !== undefined) globalStats.failedCount = message.failedCount;
        if (message.shortlinkCount !== undefined) globalStats.shortlinkCount = message.shortlinkCount;
        if (message.challengeCount !== undefined) globalStats.challengeCount = message.challengeCount;
        globalStats.lastUpdated = Date.now();
        
        // Save to storage
        chrome.storage.local.set({
            completedCount: globalStats.completedCount,
            failedCount: globalStats.failedCount,
            shortlinkCount: globalStats.shortlinkCount,
            challengeCount: globalStats.challengeCount,
            isRunning: globalStats.isRunning,
            lastUpdated: globalStats.lastUpdated
        });
        
        // Forward to popup
        chrome.runtime.sendMessage(message);
        
        sendResponse({ success: true });
    } else if (sender.tab) {
        // Forward other messages from content script
        chrome.runtime.sendMessage(message);
    }
});
