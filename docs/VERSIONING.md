# 📝 Version Management Guide

This guide explains how to manage versions for the Satoshi Faucet Bot Chrome Extension.

## 🎯 Overview

The project uses **Semantic Versioning** (SemVer) with the format `MAJOR.MINOR.PATCH`:
- **MAJOR**: Incompatible API changes
- **MINOR**: Backwards-compatible functionality additions
- **PATCH**: Backwards-compatible bug fixes

## 📁 Version Files

The following files contain version information:

| File | Purpose | Auto-Updated |
|------|---------|--------------|
| `manifest.json` | Chrome extension manifest | ✅ Yes |
| `package.json` | Node.js package configuration | ✅ Yes |
| `version.json` | Version metadata and build info | ✅ Yes |
| `README.md` | Documentation badges | ✅ Yes |
| `CHANGELOG.md` | Version history | ✅ Yes |
| `popup.html` | UI version display | ✅ Yes |

## 🚀 Quick Start

### Method 1: Using Scripts (Recommended)

#### Node.js (Cross-platform)
```bash
# Update patch version
node update-version.js 2.0.1 patch

# Update minor version
node update-version.js 2.1.0 minor

# Update major version
node update-version.js 3.0.0 major
```

### Method 2: Using NPM Scripts

```bash
# Update patch version
npm run version:patch

# Update minor version
npm run version:minor

# Update major version
npm run version:major

# Set specific version
npm run version:set 2.1.0
```

## 🔧 Manual Update Process

If you prefer to update versions manually:

### 1. Update manifest.json
```json
{
  "version": "2.1.0"
}
```

### 2. Update package.json
```json
{
  "version": "2.1.0"
}
```

### 3. Update version.json
```json
{
  "version": "2.1.0",
  "build": "2024-12-21",
  "changelog": {
    "major": 2,
    "minor": 1,
    "patch": 0
  }
}
```

### 4. Update README.md
```markdown
![Version](https://img.shields.io/badge/Version-2.1.0-orange?style=for-the-badge)
```

### 5. Update CHANGELOG.md
```markdown
## [2.1.0] - 2024-12-21

### Added
- New feature description

### Changed
- Improvement description

### Fixed
- Bug fix description
```

### 6. Update popup.html
```html
<div class="version-badge" id="versionBadge">v2.1.0</div>
```

## 📊 Version Display

The version is displayed in multiple places:

### 1. Extension Popup
- **Location**: Header badge
- **Format**: `v2.0.0`
- **Auto-updated**: ✅ Yes (from manifest)

### 2. Chrome Extensions Page
- **Location**: Extension details
- **Format**: `2.0.0`
- **Source**: `manifest.json`

### 3. Documentation
- **Location**: README badges
- **Format**: `Version-2.0.0-orange`
- **Auto-updated**: ✅ Yes

## 🏷️ Git Tagging

After updating the version, create a git tag:

```bash
# Create tag
git tag v2.1.0

# Push tag
git push origin v2.1.0

# Push all tags
git push origin --tags
```

## 📋 Release Checklist

Before releasing a new version:

- [ ] **Update Version**: Use version update script
- [ ] **Update CHANGELOG**: Add new features/fixes
- [ ] **Test Extension**: Verify all functionality works
- [ ] **Update Documentation**: Update README if needed
- [ ] **Commit Changes**: Commit all version updates
- [ ] **Create Tag**: Create git tag for the version
- [ ] **Push Changes**: Push commits and tags
- [ ] **Test Installation**: Test extension installation
- [ ] **Update Web Store**: Update Chrome Web Store listing (when available)

## 🔄 Automated Workflow

### GitHub Actions (Future)

We plan to add GitHub Actions for automated versioning:

```yaml
name: Version Update
on:
  push:
    tags:
      - 'v*'
jobs:
  update-version:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Update version
        run: node update-version.js ${{ github.ref_name }}
      - name: Commit changes
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add .
          git commit -m "Bump version to ${{ github.ref_name }}"
          git push
```

## 🐛 Troubleshooting

### Common Issues

#### Version Not Updating in Popup
- **Problem**: Version badge shows old version
- **Solution**: Reload the extension in Chrome
- **Steps**: 
  1. Go to `chrome://extensions/`
  2. Find "Satoshi Faucet Bot"
  3. Click the reload button

#### Script Permission Error
- **Problem**: "Execution of scripts is disabled"
- **Solution**: Enable script execution in PowerShell
- **Command**: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

#### Node.js Not Found
- **Problem**: "Node.js is not installed"
- **Solution**: Install Node.js from [nodejs.org](https://nodejs.org/)

### Manual Fallback

If scripts don't work, manually update these files:
1. `manifest.json` - Change version field
2. `popup.html` - Update version badge text
3. `README.md` - Update version badge URL
4. `CHANGELOG.md` - Add new version entry

## 📚 Best Practices

### Version Naming
- Use semantic versioning (MAJOR.MINOR.PATCH)
- Don't use leading zeros (use `2.1.0`, not `2.01.0`)
- Use descriptive commit messages

### Release Notes
- Document all changes in CHANGELOG.md
- Include breaking changes prominently
- Mention new features and improvements
- List bug fixes

### Testing
- Test extension after version update
- Verify version displays correctly
- Check all functionality works
- Test installation process

## 🎯 Future Improvements

Planned enhancements for version management:

- **Automated Testing**: Run tests after version update
- **Release Notes**: Auto-generate release notes
- **Web Store Integration**: Auto-update Chrome Web Store
- **Version History**: Track version changes in database
- **Rollback Support**: Easy rollback to previous versions

---

## 📞 Support

If you encounter issues with version management:

- 📖 Check this guide first
- 🐛 Report bugs on [GitHub Issues](https://github.com/YOUR_USERNAME/satoshi-faucet-bot/issues)
- 💬 Ask questions on [GitHub Discussions](https://github.com/YOUR_USERNAME/satoshi-faucet-bot/discussions)

---

**Happy Versioning! 🚀**

[⬆ Back to Top](#-version-management-guide)
