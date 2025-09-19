# 🔧 Scripts

This directory contains utility scripts for the Satoshi Faucet Bot project.

## 📁 **Script Files**

| File | Description |
|------|-------------|
| [update-version.js](update-version.js) | 🔄 Version update script for managing releases |
| [create-icons.html](create-icons.html) | 🎨 Icon generator for creating extension icons |

## 🚀 **Usage**

### **Version Update Script**
```bash
# Update patch version (2.0.2 → 2.0.3)
node scripts/update-version.js 2.0.3 patch

# Update minor version (2.0.2 → 2.1.0)
node scripts/update-version.js 2.1.0 minor

# Update major version (2.0.2 → 3.0.0)
node scripts/update-version.js 3.0.0 major
```

### **Icon Generator**
1. Open `create-icons.html` in your browser
2. Download the generated icons
3. Place them in `assets/icons/` folder
4. Update `manifest.json` to include icon references

## 📋 **Requirements**

- **Node.js** (for version update script)
- **Modern Browser** (for icon generator)

---

**Note**: These scripts are optional utilities. The extension works without them.
