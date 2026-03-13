#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');

function runCommand(command, description) {
  console.log(`\n[setup] ${description}...`);
  try {
    execSync(command, { stdio: 'inherit', cwd: projectRoot });
    console.log(`[setup] ${description} completed.`);
  } catch (error) {
    console.error(`[setup] ${description} failed:`, error.message);
    process.exit(1);
  }
}

function ensureNodeVersion() {
  const majorVersion = Number(process.versions.node.split('.')[0]);
  if (majorVersion < 16) {
    console.error('[setup] Node.js 16 or newer is required.');
    console.error(`[setup] Current version: ${process.version}`);
    process.exit(1);
  }

  console.log(`[setup] Node.js version check passed: ${process.version}`);
}

function ensureDirectories() {
  const directories = ['dist', path.join('assets', 'icons')];

  for (const directory of directories) {
    const fullPath = path.join(projectRoot, directory);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`[setup] Created directory: ${directory}`);
    }
  }
}

function reportOptionalIcons() {
  const iconFiles = [
    { name: 'icon.ico', desc: 'Windows icon' },
    { name: 'icon.icns', desc: 'macOS icon' },
    { name: 'icon.png', desc: 'Linux icon' },
  ];

  for (const icon of iconFiles) {
    const iconPath = path.join(projectRoot, 'assets', 'icons', icon.name);
    if (!fs.existsSync(iconPath)) {
      console.log(`[setup] Optional custom ${icon.desc}: assets/icons/${icon.name}`);
    }
  }
}

function printNextSteps() {
  console.log('\n[setup] Available commands:');
  console.log('  npm run dev');
  console.log('  npm run electron:dev');
  console.log('  npm run build');
  console.log('  npm run smoke:electron');
  console.log('  npm run dist:win');
}

console.log('[setup] Initializing project...');
ensureNodeVersion();
runCommand('npm install', 'Installing project dependencies');
ensureDirectories();
reportOptionalIcons();
printNextSteps();
