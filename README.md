# Satoshi Faucet Bot - Chrome Extension

Automated bot for Satoshi Faucet with full automation including faucet claims, shortlinks, and daily challenges.

## Features

- ✅ **Auto Faucet Claims** - Automated emoji captcha solving
- ✅ **Auto Shortlinks** - Handles shortlink requirements every 30 claims
- ✅ **Auto Daily Challenges** - Checks and completes daily challenges every 5 minutes
- ✅ **Multi-Currency Support** - BTC, LTC, DOGE, ETH, and more
- ✅ **Desktop Notifications** - Get notified of successful completions
- ✅ **Settings Panel** - Detailed logs, auto-save, export/clear logs
- ✅ **Stats Tracking** - Real-time tracking of completed, failed, shortlinks, and challenges
- ✅ **State Persistence** - Stats and settings persist across sessions

## Installation

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the folder containing the extension files
5. The extension icon should appear in your Chrome toolbar

## Usage

1. Go to [Satoshi Faucet](https://satoshifaucet.io) and log in
2. Click the extension icon in your Chrome toolbar
3. Select your preferred currency
4. Click "Start Bot" to begin automation
5. The bot will automatically:
   - Complete faucet claims with emoji captcha
   - Handle shortlink requirements every 30 claims
   - Check and complete daily challenges every 5 minutes
   - Show desktop notifications for completions

## Files

- `manifest.json` - Extension configuration
- `popup.html` - Extension popup interface
- `popup.js` - Popup logic and UI handling
- `content.js` - Main automation script
- `background.js` - Background service worker

## Settings

Click the ⚙️ button in the popup to access:
- Enable/disable desktop notifications
- Detailed logs (Developer Mode)
- Auto-save logs to file
- Export logs
- Clear logs

## Stats

The extension tracks:
- **Completed** - Successful faucet claims
- **Failed** - Failed attempts
- **Shortlinks** - Completed shortlinks
- **Challenges** - Completed daily challenges

## Requirements

- Chrome browser
- Active internet connection
- Satoshi Faucet account

## Disclaimer

This extension is for educational purposes only. Use at your own risk and in accordance with Satoshi Faucet's terms of service.

## License

MIT License - Feel free to modify and distribute.
