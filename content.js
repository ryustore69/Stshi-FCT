class FaucetBotContent {
    constructor() {
        this.isRunning = false;
        this.isProcessing = false;
        this.intervalId = null;
        this.completedCount = 0;
        this.failedCount = 0;
        this.retryCount = 0;
        this.maxRetries = 3;
        this.lastPageUrl = window.location.href;
        this.shortlinkCount = 0;
        this.maxFaucetBeforeShortlink = 30;
        this.challengeCount = 0;
        this.lastChallengeCheck = 0;
        this.challengeCheckInterval = 5 * 60 * 1000; // Check every 5 minutes
        
        // Enhanced emoji mapping from your 6.0.js
        this.emojiMap = {
            "sad": "😢",
            "love": "❤",
            "haha": "😂",
            "like": "👍",
            "flame": "🔥",
            "angry": "😡",
            "happy": "😊",
            "wow": "😮",
            "cry": "😭",
            "heart": "❤️"
        };
        
        this.setupMessageListener();
        this.loadStats();
        this.setupPageChangeListener();
    }
    
    setupMessageListener() {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            switch (message.action) {
                case 'startBot':
                    this.start(message.currency);
                    break;
                case 'stopBot':
                    this.stop();
                    break;
                case 'getStats':
                    sendResponse({
                        completed: this.completedCount,
                        failed: this.failedCount,
                        shortlinkCount: this.shortlinkCount,
                        challengeCount: this.challengeCount,
                        isRunning: this.isRunning
                    });
                    break;
            }
        });
    }
    
    setupPageChangeListener() {
        // Monitor for page changes (refresh, navigation)
        const observer = new MutationObserver(() => {
            if (window.location.href !== this.lastPageUrl) {
                this.log(`Page changed from ${this.lastPageUrl} to ${window.location.href}`, 'info');
                this.lastPageUrl = window.location.href;
                
                // If bot is running, wait for page to load then continue
                if (this.isRunning) {
                    this.log('Page refreshed, waiting for new content...', 'warning');
                    setTimeout(() => {
                        this.log('Resuming automation after page load...', 'info');
                        this.runTask();
                    }, 3000);
                }
            }
        });
        
        observer.observe(document.body, { childList: true, subtree: true });
        
        // Also listen for DOMContentLoaded (page refresh)
        document.addEventListener('DOMContentLoaded', () => {
            if (this.isRunning) {
                this.log('DOMContentLoaded - page refreshed, resuming...', 'info');
                setTimeout(() => {
                    this.runTask();
                }, 2000);
            }
        });
        
        // Monitor for content changes every 3 seconds
        this.contentCheckInterval = setInterval(() => {
            // Always check if bot should be running from storage
            this.loadStats().then(() => {
                if (this.isRunning && !this.isProcessing) {
                    this.log('Checking for new content...', 'info');
                    this.runTask();
                } else if (this.isRunning && this.isProcessing) {
                    this.log('Bot is processing, waiting...', 'info');
                } else if (!this.isRunning) {
                    this.log('Bot not running, skipping check', 'info');
                }
            });
        }, 3000);
        
        // Also check for page refresh every 5 seconds
        this.pageRefreshInterval = setInterval(() => {
            // Always check if bot should be running from storage
            this.loadStats().then(() => {
                if (this.isRunning && !this.isProcessing) {
                    // Check if page content has changed (new task available)
                    const currentTask = this.findTask();
                    if (currentTask && currentTask !== 'cooldown') {
                        this.log('New task detected, starting automation...', 'info');
                        this.runTask();
                    }
                }
            });
        }, 5000);
        
        // Emergency continuation check every 10 seconds
        this.emergencyInterval = setInterval(() => {
            // Always check if bot should be running from storage
            this.loadStats().then(() => {
                if (this.isRunning) {
                    this.log('Emergency check: Bot status', 'info');
                    this.log(`isRunning: ${this.isRunning}, isProcessing: ${this.isProcessing}`, 'info');
                    
                    // If bot is stuck in processing state for too long, force reset
                    if (this.isProcessing) {
                        this.log('Bot stuck in processing state, force resetting...', 'warning');
                        this.isProcessing = false;
                        setTimeout(() => this.runTask(), 2000);
                    }
                } else {
                    this.log('Emergency check: Bot not running in storage', 'warning');
                }
            });
        }, 10000);
    }
    
    async loadStats() {
        try {
            const stats = await chrome.storage.local.get(['completedCount', 'failedCount', 'isRunning', 'shortlinkCount', 'challengeCount']);
            this.completedCount = stats.completedCount || 0;
            this.failedCount = stats.failedCount || 0;
            this.isRunning = stats.isRunning || false;
            this.shortlinkCount = stats.shortlinkCount || 0;
            this.challengeCount = stats.challengeCount || 0;
            console.log(`Stats loaded: ${this.completedCount} completed, ${this.failedCount} failed, ${this.shortlinkCount} shortlinks, ${this.challengeCount} challenges, running: ${this.isRunning}`);
            
            // If bot should be running but intervals are not set, restart them
            if (this.isRunning && !this.intervalId) {
                this.log('Bot should be running but intervals not set, restarting...', 'warning');
                this.start(this.currentCurrency || 'btc');
            }
        } catch (error) {
            console.log('Could not load stats:', error);
        }
    }
    
    async saveStats() {
        try {
            await chrome.storage.local.set({
                completedCount: this.completedCount,
                failedCount: this.failedCount,
                shortlinkCount: this.shortlinkCount,
                challengeCount: this.challengeCount,
                isRunning: this.isRunning,
                lastSaved: Date.now()
            });
            
            // Send stats update to background script
            chrome.runtime.sendMessage({
                type: 'statsUpdate',
                completedCount: this.completedCount,
                failedCount: this.failedCount,
                shortlinkCount: this.shortlinkCount,
                challengeCount: this.challengeCount,
                isRunning: this.isRunning
            });
            
            console.log(`Stats saved: ${this.completedCount} completed, ${this.failedCount} failed, ${this.shortlinkCount} shortlinks, running: ${this.isRunning}`);
        } catch (error) {
            console.log('Could not save stats:', error);
        }
    }
    
    log(message, level = 'info') {
        console.log(`[FaucetBot] ${message}`);
        chrome.runtime.sendMessage({
            type: 'log',
            message: message,
            level: level
        });
        
        // Send to background script for global stats update
        chrome.runtime.sendMessage({
            type: 'statsUpdate',
            completedCount: this.completedCount,
            failedCount: this.failedCount,
            shortlinkCount: this.shortlinkCount,
            challengeCount: this.challengeCount,
            isRunning: this.isRunning
        });
    }
    
    // IMPROVEMENT 1: Enhanced random delay function from your 6.0.js
    randomDelay(min = 3000, max = 5000) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    // Check if shortlink is required
    needsShortlink() {
        return this.completedCount > 0 && this.completedCount % this.maxFaucetBeforeShortlink === 0;
    }
    
    // Navigate to shortlink page
    async navigateToShortlink() {
        const currentUrl = window.location.href;
        const currency = this.currentCurrency || 'btc';
        const shortlinkUrl = `https://satoshifaucet.io/links/currency/${currency}`;
        
        this.log(`Shortlink required! Navigating to shortlink page...`, 'warning');
        window.location.href = shortlinkUrl;
        
        // Wait for page to load
        setTimeout(() => {
            this.handleShortlinkPage();
        }, 3000);
    }
    
    // Handle shortlink page
    async handleShortlinkPage() {
        this.log('Handling shortlink page...', 'info');
        
        // Find the first available shortlink button
        const shortlinkBtn = document.querySelector('.btn_sl.link_bt');
        
        if (shortlinkBtn) {
            this.log('Found shortlink button, clicking...', 'info');
            shortlinkBtn.style.border = "3px solid orange";
            shortlinkBtn.style.borderRadius = "6px";
            
            const delay = this.randomDelay(3000, 7000);
            this.log(`Clicking shortlink in ${delay}ms...`, 'info');
            
            setTimeout(() => {
                shortlinkBtn.click();
                this.log('Shortlink clicked ✅', 'success');
                
                // Wait for shortlink to complete
                setTimeout(() => {
                    this.shortlinkCount++;
                    this.saveStats();
                    this.log(`Shortlink completed! Total shortlinks: ${this.shortlinkCount}`, 'success');
                    
                    // Navigate back to faucet
                    const faucetUrl = `https://satoshifaucet.io/faucet/currency/${this.currentCurrency || 'btc'}`;
                    window.location.href = faucetUrl;
                    
                    setTimeout(() => {
                        this.log('Returned to faucet page, continuing automation...', 'info');
                        this.runTask();
                    }, 3000);
                }, 10000); // Wait 10 seconds for shortlink to complete
            }, delay);
        } else {
            this.log('No shortlink button found, retrying...', 'warning');
            setTimeout(() => this.handleShortlinkPage(), 5000);
        }
    }
    
    // Check if daily challenge is available
    shouldCheckChallenge() {
        const now = Date.now();
        return (now - this.lastChallengeCheck) > this.challengeCheckInterval;
    }
    
    // Navigate to daily challenge page
    async navigateToChallenge() {
        const challengeUrl = 'https://satoshifaucet.io/challenge';
        
        this.log('Checking daily challenge...', 'info');
        this.lastChallengeCheck = Date.now();
        window.location.href = challengeUrl;
        
        // Wait for page to load
        setTimeout(() => {
            this.handleChallengePage();
        }, 3000);
    }
    
    // Handle daily challenge page
    async handleChallengePage() {
        this.log('Handling daily challenge page...', 'info');
        
        // Check if challenge is available (not completed)
        const completedChallenge = document.querySelector('.challenge_c');
        const incompleteChallenge = document.querySelector('.challenge_uc');
        
        if (completedChallenge && !incompleteChallenge) {
            this.log('All challenges completed, returning to faucet...', 'info');
            const faucetUrl = `https://satoshifaucet.io/faucet/currency/${this.currentCurrency || 'btc'}`;
            window.location.href = faucetUrl;
            return;
        }
        
        // Find claim button
        const claimBtn = document.querySelector('button[type="submit"].btn_sl');
        
        if (claimBtn) {
            this.log('Found challenge claim button, handling emoji captcha...', 'info');
            
            // Handle emoji captcha first
            const taskEl = this.findTask();
            if (taskEl && typeof taskEl === 'string') {
                this.log(`Found challenge task: ${taskEl}`, 'info');
                
                const emojiBtn = this.findEmojiButton(taskEl);
                if (emojiBtn) {
                    this.log(`Found emoji button for: ${taskEl}`, 'info');
                    emojiBtn.style.border = "3px solid orange";
                    emojiBtn.style.borderRadius = "6px";
                    
                    const delay = this.randomDelay(3000, 7000);
                    this.log(`Clicking challenge emoji in ${delay}ms...`, 'info');
                    
                    setTimeout(() => {
                        emojiBtn.click();
                        this.log('Challenge emoji clicked ✅', 'success');
                        
                        // Wait a bit then click claim button
                        setTimeout(() => {
                            this.log('Clicking challenge claim button...', 'info');
                            claimBtn.style.border = "3px solid green";
                            claimBtn.style.borderRadius = "6px";
                            claimBtn.click();
                            this.log('Challenge claim button clicked ✅', 'success');
                            
                            // Wait for challenge completion
                            setTimeout(() => {
                                this.challengeCount++;
                                this.saveStats();
                                this.log(`Daily challenge completed! Total challenges: ${this.challengeCount}`, 'success');
                                
                                // Navigate back to faucet
                                const faucetUrl = `https://satoshifaucet.io/faucet/currency/${this.currentCurrency || 'btc'}`;
                                window.location.href = faucetUrl;
                                
                                setTimeout(() => {
                                    this.log('Returned to faucet page, continuing automation...', 'info');
                                    this.runTask();
                                }, 3000);
                            }, 5000); // Wait 5 seconds for challenge completion
                        }, 2000);
                    }, delay);
                } else {
                    this.log('No emoji button found for challenge, retrying...', 'warning');
                    setTimeout(() => this.handleChallengePage(), 5000);
                }
            } else {
                this.log('No challenge task found, retrying...', 'warning');
                setTimeout(() => this.handleChallengePage(), 5000);
            }
        } else {
            this.log('No challenge claim button found, returning to faucet...', 'warning');
            const faucetUrl = `https://satoshifaucet.io/faucet/currency/${this.currentCurrency || 'btc'}`;
            window.location.href = faucetUrl;
        }
    }
    
    start(currency) {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.currentCurrency = currency; // Store current currency
        this.saveStats(); // Save running state
        this.log(`Starting automation for ${currency.toUpperCase()}...`, 'info');
        
        // Start the automation loop with interval like your 6.0.js
        this.intervalId = setInterval(() => {
            this.runTask();
        }, 2000);
        
        // Start periodic stats update to background script
        this.statsUpdateInterval = setInterval(() => {
            this.saveStats();
        }, 5000); // Update every 5 seconds
    }
    
    stop() {
        this.isRunning = false;
        this.isProcessing = false;
        
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        
        if (this.statsUpdateInterval) {
            clearInterval(this.statsUpdateInterval);
            this.statsUpdateInterval = null;
        }
        
        if (this.contentCheckInterval) {
            clearInterval(this.contentCheckInterval);
            this.contentCheckInterval = null;
        }
        
        if (this.pageRefreshInterval) {
            clearInterval(this.pageRefreshInterval);
            this.pageRefreshInterval = null;
        }
        
        if (this.emergencyInterval) {
            clearInterval(this.emergencyInterval);
            this.emergencyInterval = null;
        }
        
        this.saveStats(); // Save stopped state
        this.log('Automation stopped!', 'warning');
    }
    
    // IMPROVEMENT 2: Enhanced task detection with new HTML structure
    findTask() {
        // Check for cooldown/wait page first
        const cooldownText = Array.from(document.querySelectorAll("div, span, p"))
            .find(el => el.innerText && (
                el.innerText.includes("Please wait") ||
                el.innerText.includes("cooldown") ||
                el.innerText.includes("seconds") ||
                el.innerText.includes("waiting") ||
                el.innerText.includes("countdown")
            ));
        
        if (cooldownText) {
            this.log(`Found cooldown page: ${cooldownText.innerText}`, 'warning');
            
            // Try to extract countdown number
            const countdownMatch = cooldownText.innerText.match(/(\d+)\s*seconds?/i);
            if (countdownMatch) {
                const seconds = parseInt(countdownMatch[1]);
                this.log(`Countdown detected: ${seconds} seconds`, 'info');
                return { type: 'cooldown', seconds: seconds };
            }
            
            return { type: 'cooldown', seconds: 10 }; // Default 10 seconds
        }
        
        // Check for new captcha structure
        const captchaPrompt = document.querySelector('.captcha-prompt[data-id="question-text"]');
        if (captchaPrompt) {
            return captchaPrompt;
        }
        
        // Fallback to old patterns
        const taskPatterns = [
            "Please click on the",
            "Click on the", 
            "Select the",
            "Choose the",
            "Find the"
        ];
        
        for (const pattern of taskPatterns) {
            const taskEl = Array.from(document.querySelectorAll("div, span, p"))
                .find(el => el.innerText && el.innerText.includes(pattern));
            if (taskEl) {
                return taskEl;
            }
        }
        return null;
    }
    
    // IMPROVEMENT 3: Enhanced emoji detection with new HTML structure
    findEmojiButton(target) {
        // Check for new captcha structure first
        const captchaItems = document.querySelectorAll('.captcha-item[data-icon]');
        if (captchaItems.length > 0) {
            for (const item of captchaItems) {
                const dataIcon = item.getAttribute('data-icon') || '';
                const alt = item.querySelector('img')?.getAttribute('alt') || '';
                
                // Check if data-icon or alt matches target
                if (dataIcon.includes(target) || alt.includes(target)) {
                    this.log(`Found emoji by data-icon: ${dataIcon}`, 'info');
                    return item;
                }
            }
        }
        
        // Fallback to old selectors
        const selectors = [
            "button", 
            "img", 
            "span", 
            "div", 
            "[role='button']",
            ".emoji",
            "[data-emoji]"
        ];
        
        const elements = document.querySelectorAll(selectors.join(", "));
        
        for (const element of elements) {
            const text = (element.innerText || "").toLowerCase();
            const alt = (element.getAttribute("alt") || "").toLowerCase();
            const title = (element.getAttribute("title") || "").toLowerCase();
            const dataEmoji = (element.getAttribute("data-emoji") || "").toLowerCase();
            
            if (text.includes(target) || alt.includes(target) || 
                title.includes(target) || dataEmoji.includes(target)) {
                return element;
            }
        }
        return null;
    }
    
    // IMPROVEMENT 4: Enhanced verification with timeout (like your 6.0.js)
    waitForVerification(timeout = 60000) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            
            const check = setInterval(() => {
                const verify = Array.from(document.querySelectorAll("div, span, p"))
                    .find(el => el.innerText && el.innerText.includes("Verification successful"));
                
                if (verify) {
                    clearInterval(check);
                    resolve(true);
                } else if (Date.now() - startTime > timeout) {
                    clearInterval(check);
                    reject(new Error('Verification timeout'));
                }
            }, 1000);
        });
    }
    
    // IMPROVEMENT 5: Enhanced error handling with retry mechanism
    async runTask() {
        if (!this.isRunning) {
            this.log('Bot not running, skipping task', 'info');
            return;
        }
        
        // Anti-loop protection from your 6.0.js
        if (this.isProcessing) {
            this.log('Task already processing, skipping', 'info');
            return;
        }
        
        this.log('Starting task detection...', 'info');
        this.log(`Bot status: isRunning=${this.isRunning}, isProcessing=${this.isProcessing}`, 'info');
        this.log(`Completed: ${this.completedCount}, Shortlinks: ${this.shortlinkCount}, Challenges: ${this.challengeCount}`, 'info');
        
        // Check if daily challenge should be checked
        if (this.shouldCheckChallenge()) {
            this.log('Checking daily challenge...', 'info');
            this.isProcessing = false;
            await this.navigateToChallenge();
            return;
        }
        
        // Check if shortlink is required
        if (this.needsShortlink()) {
            this.log(`Shortlink required after ${this.completedCount} faucet claims!`, 'warning');
            this.isProcessing = false;
            await this.navigateToShortlink();
            return;
        }
        
        try {
            const taskEl = this.findTask();
            this.log(`Task element found: ${taskEl ? 'YES' : 'NO'}`, 'info');
            if (taskEl) {
                this.log(`Task type: ${typeof taskEl}`, 'info');
                if (typeof taskEl === 'object' && taskEl.type) {
                    this.log(`Task object type: ${taskEl.type}`, 'info');
                }
            }
            
            // Handle cooldown page
            if (taskEl && typeof taskEl === 'object' && taskEl.type === 'cooldown') {
                const waitTime = (taskEl.seconds + 2) * 1000; // Add 2 seconds buffer
                this.log(`Cooldown page detected, waiting ${taskEl.seconds} seconds...`, 'warning');
                this.isProcessing = false;
                setTimeout(() => {
                    this.log('Cooldown finished, checking for new content...', 'info');
                    this.runTask();
                }, waitTime);
                return;
            }
            
            if (!taskEl) {
                // Look for reward button with new structure
                const rewardBtn = document.querySelector('button[type="submit"].sl_btn') ||
                    Array.from(document.querySelectorAll("button, a"))
                        .find(el => el.innerText && (
                            el.innerText.includes("Get Reward") ||
                            el.innerText.includes("Claim") ||
                            el.innerText.includes("Claim Reward")
                        ));
                
                this.log(`Reward button found: ${rewardBtn ? 'YES' : 'NO'}`, 'info');
                
                if (rewardBtn && rewardBtn.offsetParent !== null) {
                    this.log('Found reward button, clicking...', 'info');
                    rewardBtn.style.border = "3px solid lime";
                    rewardBtn.style.borderRadius = "6px";
                    
                    const delayReward = this.randomDelay(2000, 5000);
                    this.log(`Clicking reward in ${delayReward}ms...`, 'info');
                    
                    setTimeout(() => {
                        rewardBtn.click();
                        this.log('Reward clicked ✅', 'success');
                        
                        // Wait for verification like your 6.0.js
                        this.waitForVerification(60000).then(() => {
                            this.completedCount++;
                            this.saveStats();
                            this.log(`Task completed! Total: ${this.completedCount}`, 'success');
                            chrome.runtime.sendMessage({ type: 'taskCompleted' });
                            this.isProcessing = false;
                            
                            // Continue automation after verification
                            setTimeout(() => {
                                this.log('Continuing to next task...', 'info');
                                this.isProcessing = false; // Force reset processing flag
                                this.isRunning = true; // Force ensure running state
                                this.saveStats(); // Save state
                                this.runTask();
                            }, this.randomDelay(5000, 10000));
                        }).catch((error) => {
                            this.log(`Verification failed: ${error.message}`, 'error');
                            this.handleTaskFailure();
                        });
                    }, delayReward);
                } else {
                    this.log('No task or reward found, waiting...', 'info');
                    this.isProcessing = false;
                    // Don't set timeout here, let contentCheckInterval handle it
                }
                return;
            }
            
            this.isProcessing = true;
            const text = taskEl.innerText.trim();
            this.log(`Found task: ${text}`, 'info');
            
            // Debug: Log captcha structure
            const captchaContainer = document.querySelector('.secure-captcha[data-id="captcha-container"]');
            if (captchaContainer) {
                this.log('Found new captcha structure!', 'info');
                const captchaItems = document.querySelectorAll('.captcha-item[data-icon]');
                this.log(`Found ${captchaItems.length} captcha items`, 'info');
                captchaItems.forEach((item, index) => {
                    const dataIcon = item.getAttribute('data-icon');
                    const alt = item.querySelector('img')?.getAttribute('alt');
                    this.log(`Item ${index}: data-icon="${dataIcon}", alt="${alt}"`, 'info');
                });
            }
            
            // Parse target emoji from your 6.0.js
            const match = text.match(/:\s*(\w+)/i);
            if (!match) {
                this.log('Could not parse emoji task', 'error');
                this.handleTaskFailure();
                return;
            }
            
            const target = match[1].toLowerCase();
            this.log(`Looking for emoji: ${target}`, 'info');
            
            const targetBtn = this.findEmojiButton(target);
            if (!targetBtn) {
                this.log(`Emoji button not found for: ${target}`, 'error');
                this.handleTaskFailure();
                return;
            }
            
            // Visual feedback from your 6.0.js
            targetBtn.style.border = "3px solid red";
            targetBtn.style.borderRadius = "6px";
            
            const delayEmoji = this.randomDelay(3000, 7000);
            this.log(`Clicking emoji in ${delayEmoji}ms...`, 'info');
            
            setTimeout(() => {
                targetBtn.click();
                this.log('Emoji clicked ✅', 'success');
                
                // Verification check like your 6.0.js
                const check = setInterval(() => {
                    const verify = Array.from(document.querySelectorAll("div, span, p"))
                        .find(el => el.innerText && el.innerText.includes("Verification successful"));
                    
                    if (verify) {
                        clearInterval(check);
                        this.log('Verification OK', 'success');
                        
                        const rewardBtn = document.querySelector('button[type="submit"].sl_btn') ||
                            Array.from(document.querySelectorAll("button, a"))
                                .find(el => el.innerText && el.innerText.includes("Get Reward"));
                        
                        if (rewardBtn) {
                            rewardBtn.style.border = "3px solid lime";
                            rewardBtn.style.borderRadius = "6px";
                            
                            const delayReward = this.randomDelay(2000, 5000);
                            this.log(`Clicking reward in ${delayReward}ms...`, 'info');
                            
                            setTimeout(() => {
                                rewardBtn.click();
                                this.log('Reward clicked ✅', 'success');
                                
                                setTimeout(() => {
                                    this.completedCount++;
                                    this.saveStats();
                                    this.log(`Task completed! Total: ${this.completedCount}`, 'success');
                                    chrome.runtime.sendMessage({ type: 'taskCompleted' });
                                    this.isProcessing = false;
                                    
                                    // Auto-save stats every completion
                                    setTimeout(() => this.saveStats(), 1000);
                                    
                                    // Continue automation after task completion
                                    setTimeout(() => {
                                        this.log('Continuing to next task...', 'info');
                                        this.isProcessing = false; // Force reset processing flag
                                        this.isRunning = true; // Force ensure running state
                                        this.saveStats(); // Save state
                                        this.runTask();
                                    }, this.randomDelay(5000, 10000));
                                }, 2000);
                            }, delayReward);
                        } else {
                            this.log('Reward button not found after verification', 'warning');
                            this.isProcessing = false;
                            
                            // Continue automation even if reward button not found
                            setTimeout(() => {
                                this.log('Continuing to next task...', 'info');
                                this.runTask();
                            }, this.randomDelay(3000, 5000));
                        }
                    }
                }, 1000);
                
                // Timeout after 60 seconds like your 6.0.js
                setTimeout(() => {
                    clearInterval(check);
                    if (this.isProcessing) {
                        this.log('Verification timeout', 'error');
                        this.handleTaskFailure();
                    }
                }, 60000);
            }, delayEmoji);
            
        } catch (error) {
            this.log(`Error in automation: ${error.message}`, 'error');
            this.handleTaskFailure();
        }
    }
    
    handleTaskFailure() {
        this.retryCount++;
        this.failedCount++;
        this.saveStats();
        
        this.log(`Task failed! Retry ${this.retryCount}/${this.maxRetries}`, 'error');
        chrome.runtime.sendMessage({ type: 'taskFailed' });
        
        if (this.retryCount >= this.maxRetries) {
            this.log('Max retries reached, stopping bot', 'error');
            this.stop();
            return;
        }
        
        this.isProcessing = false;
        
        // Continue automation after delay
        setTimeout(() => this.runTask(), this.randomDelay(3000, 6000));
    }
}

// Initialize content script
const bot = new FaucetBotContent();