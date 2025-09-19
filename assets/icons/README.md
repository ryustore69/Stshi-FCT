# 🎨 Extension Icons

This directory should contain the following icon files for the Chrome extension:

## Required Icons

| File | Size | Purpose | Usage |
|------|------|---------|-------|
| `icon16.png` | 16x16 pixels | Toolbar icon (small) | Browser toolbar |
| `icon32.png` | 32x32 pixels | Extension management | `chrome://extensions/` |
| `icon48.png` | 48x48 pixels | Extension details | Extension details view |
| `icon128.png` | 128x128 pixels | Chrome Web Store | Store listing |

## Icon Requirements

### **Design Guidelines**
- **Format**: PNG with transparent background
- **Style**: Simple, recognizable design
- **Colors**: Should work on both light and dark themes
- **Branding**: Should represent "Satoshi Faucet Bot" concept

### **Suggested Design Elements**
- 🤖 Robot/Bot icon
- 💰 Cryptocurrency symbol (₿, 💎)
- 🚀 Rocket (for automation)
- ⚡ Lightning bolt (for speed)

## Creating Icons

### **Online Tools**
- [Favicon Generator](https://favicon.io/)
- [Canva](https://canva.com/)
- [Figma](https://figma.com/)

### **Design Software**
- Adobe Illustrator
- GIMP (free)
- Inkscape (free)

## Adding Icons to Extension

Once you have the icon files:

1. Place them in this directory (`assets/icons/`)
2. Update `manifest.json` to include icon references:

```json
{
  "action": {
    "default_icon": {
      "16": "assets/icons/icon16.png",
      "32": "assets/icons/icon32.png",
      "48": "assets/icons/icon48.png",
      "128": "assets/icons/icon128.png"
    }
  },
  "icons": {
    "16": "assets/icons/icon16.png",
    "32": "assets/icons/icon32.png",
    "48": "assets/icons/icon48.png",
    "128": "assets/icons/icon128.png"
  }
}
```

## Temporary Solution

For now, the extension works without custom icons. Chrome will use default extension icons.

---

**Note**: Icons are optional but recommended for a professional appearance.
