#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const packageJsonPath = path.join(projectRoot, 'package.json');

function runCommand(command, description) {
  console.log(`\n[install-electron] ${description}...`);
  try {
    execSync(command, { stdio: 'inherit', cwd: projectRoot });
    console.log(`[install-electron] ${description} completed.`);
    return true;
  } catch (error) {
    console.error(`[install-electron] ${description} failed:`, error.message);
    return false;
  }
}

function ensureProjectFiles() {
  if (!fs.existsSync(packageJsonPath)) {
    console.error(`[install-electron] package.json not found: ${packageJsonPath}`);
    process.exit(1);
  }
}

function readPackageJson() {
  return JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
}

function printNextSteps() {
  console.log('\n[install-electron] Next steps:');
  console.log('  npm run electron:dev');
  console.log('  npm run smoke:electron');
  console.log('  npm run dist:win');
}

console.log('[install-electron] Installing Electron dependencies...');
ensureProjectFiles();

const packageJson = readPackageJson();
const electronVersion = packageJson.devDependencies?.electron;
const builderVersion = packageJson.devDependencies?.['electron-builder'];

if (!electronVersion || !builderVersion) {
  console.error('[install-electron] electron or electron-builder is missing from devDependencies.');
  process.exit(1);
}

const installCommands = [
  {
    command: 'npm install',
    description: 'Installing project dependencies with the current npm configuration',
  },
  {
    command: 'npm install --registry=https://registry.npmmirror.com/',
    description: 'Retrying dependency install with the npmmirror registry',
  },
];

let installed = false;
for (const attempt of installCommands) {
  if (runCommand(attempt.command, attempt.description)) {
    installed = true;
    break;
  }
}

if (!installed) {
  console.error('[install-electron] Unable to install project dependencies.');
  process.exit(1);
}

console.log(`[install-electron] electron version target: ${electronVersion}`);
console.log(`[install-electron] electron-builder version target: ${builderVersion}`);
printNextSteps();
