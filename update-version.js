#!/usr/bin/env node

/**
 * Version Update Script for Satoshi Faucet Bot
 * Automatically updates version across all files
 */

const fs = require('fs');
const path = require('path');

// Get version from command line or use default
const newVersion = process.argv[2] || '2.0.0';
const versionType = process.argv[3] || 'patch'; // major, minor, patch

console.log(`🚀 Updating version to ${newVersion} (${versionType})`);

// Files that contain version information
const filesToUpdate = [
  {
    file: 'manifest.json',
    pattern: /"version":\s*"[^"]*"/g,
    replacement: `"version": "${newVersion}"`
  },
  {
    file: 'version.json',
    pattern: /"version":\s*"[^"]*"/g,
    replacement: `"version": "${newVersion}"`
  },
  {
    file: 'README.md',
    pattern: /!\[Version\]\(https:\/\/img\.shields\.io\/badge\/Version-[^-]+-orange\?style=for-the-badge\)/g,
    replacement: `![Version](https://img.shields.io/badge/Version-${newVersion}-orange?style=for-the-badge)`
  },
  {
    file: 'CHANGELOG.md',
    pattern: /## \[Unreleased\]/g,
    replacement: `## [Unreleased]\n\n## [${newVersion}] - ${new Date().toISOString().split('T')[0]}`
  }
];

// Update each file
filesToUpdate.forEach(({ file, pattern, replacement }) => {
  const filePath = path.join(__dirname, file);
  
  if (fs.existsSync(filePath)) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      content = content.replace(pattern, replacement);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated ${file}`);
    } catch (error) {
      console.error(`❌ Error updating ${file}:`, error.message);
    }
  } else {
    console.warn(`⚠️  File not found: ${file}`);
  }
});

// Update version.json with build date
try {
  const versionPath = path.join(__dirname, 'version.json');
  const versionData = JSON.parse(fs.readFileSync(versionPath, 'utf8'));
  
  versionData.build = new Date().toISOString().split('T')[0];
  versionData.changelog = {
    major: parseInt(newVersion.split('.')[0]),
    minor: parseInt(newVersion.split('.')[1]),
    patch: parseInt(newVersion.split('.')[2]),
    prerelease: null,
    buildmetadata: null
  };
  
  fs.writeFileSync(versionPath, JSON.stringify(versionData, null, 2), 'utf8');
  console.log('✅ Updated version.json with build date');
} catch (error) {
  console.error('❌ Error updating version.json:', error.message);
}

console.log(`\n🎉 Version update complete!`);
console.log(`📝 Don't forget to update CHANGELOG.md with new features and fixes`);
console.log(`🏷️  Create a git tag: git tag v${newVersion}`);
console.log(`📤 Push changes: git push origin main --tags`);
