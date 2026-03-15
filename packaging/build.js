#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const LOCAL_CACHE_DIR = path.join(ROOT_DIR, '.eb-cache-local');
const LOCAL_SERVER_SCRIPT = path.join(__dirname, 'local-binary-server.js');
const LOCAL_WIN_CODESIGN_ARCHIVE = path.join(__dirname, 'binaries', 'winCodeSign-2.6.0.7z');
const LOCAL_WIN_CODESIGN_DIR = 'winCodeSign-2.6.0';

const args = process.argv.slice(2);
const buildTarget = (args[0] || 'current').toLowerCase();
const buildMode = (args[1] || process.env.WIN_CODESIGN_SOURCE || 'remote').toLowerCase();
const validModes = new Set(['remote', 'local']);

if (!validModes.has(buildMode)) {
  console.error(`Unsupported build mode: ${buildMode}`);
  process.exit(1);
}

console.log('Starting oscilloscope simulator packaging...');
console.log(`Build target: ${buildTarget}`);
console.log(`winCodeSign source: ${buildMode}`);

function runCommand(command, description, extraEnv = {}) {
  console.log(`\n[run] ${description}`);
  execSync(command, {
    cwd: ROOT_DIR,
    stdio: 'inherit',
    env: {
      ...process.env,
      ...extraEnv,
    },
  });
}

function showBuildInfo(build) {
  console.log(`\n[done] ${build.label}`);
  console.log(`Output: dist/ (${build.artifact})`);
}

function getTargetBuilds(target, currentPlatform) {
  const allByPlatform = {
    win32: [
      { flag: '--linux', label: 'Linux build', artifact: '.tar.gz', needsWinCodeSign: false },
      { flag: '--win', label: 'Windows build', artifact: '.exe portable', needsWinCodeSign: true },
    ],
    darwin: [
      { flag: '--mac', label: 'macOS build', artifact: '.dmg', needsWinCodeSign: false },
      { flag: '--linux', label: 'Linux build', artifact: '.tar.gz', needsWinCodeSign: false },
      { flag: '--win', label: 'Windows build', artifact: '.exe portable', needsWinCodeSign: true },
    ],
    linux: [
      { flag: '--linux', label: 'Linux build', artifact: '.tar.gz', needsWinCodeSign: false },
      { flag: '--win', label: 'Windows build', artifact: '.exe portable', needsWinCodeSign: true },
    ],
  };

  switch (target) {
    case 'win':
    case 'windows':
      return [{ flag: '--win', label: 'Windows build', artifact: '.exe portable', needsWinCodeSign: true }];
    case 'mac':
    case 'macos':
      return [{ flag: '--mac', label: 'macOS build', artifact: '.dmg', needsWinCodeSign: false }];
    case 'linux':
      return [{ flag: '--linux', label: 'Linux build', artifact: '.tar.gz', needsWinCodeSign: false }];
    case 'all':
      return allByPlatform[currentPlatform] || allByPlatform.win32;
    case 'current':
    default:
      if (currentPlatform === 'darwin') {
        return [{ flag: '--mac', label: 'macOS build', artifact: '.dmg', needsWinCodeSign: false }];
      }
      if (currentPlatform === 'linux') {
        return [{ flag: '--linux', label: 'Linux build', artifact: '.tar.gz', needsWinCodeSign: false }];
      }
      return [{ flag: '--win', label: 'Windows build', artifact: '.exe portable', needsWinCodeSign: true }];
  }
}

function startLocalWinCodeSignServer() {
  if (!fs.existsSync(LOCAL_WIN_CODESIGN_ARCHIVE)) {
    throw new Error(
      `Local winCodeSign archive not found: ${LOCAL_WIN_CODESIGN_ARCHIVE}\n` +
      'Place winCodeSign-2.6.0.7z in packaging/binaries/ before using local mode.'
    );
  }

  fs.mkdirSync(LOCAL_CACHE_DIR, { recursive: true });

  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [LOCAL_SERVER_SCRIPT, LOCAL_WIN_CODESIGN_ARCHIVE], {
      cwd: ROOT_DIR,
      stdio: ['ignore', 'pipe', 'inherit'],
    });

    let settled = false;
    const timeout = setTimeout(() => {
      if (!settled) {
        settled = true;
        child.kill();
        reject(new Error('Timed out while starting local winCodeSign server.'));
      }
    }, 10000);

    child.once('exit', (code) => {
      if (!settled) {
        settled = true;
        clearTimeout(timeout);
        reject(new Error(`Local winCodeSign server exited before ready (code ${code ?? 'unknown'}).`));
      }
    });

    child.stdout.once('data', (buffer) => {
      if (settled) {
        return;
      }

      settled = true;
      clearTimeout(timeout);
      const baseUrl = buffer.toString().trim();
      resolve({
        env: {
          ELECTRON_BUILDER_BINARIES_MIRROR: `${baseUrl}/`,
          ELECTRON_BUILDER_BINARIES_CUSTOM_DIR: LOCAL_WIN_CODESIGN_DIR,
          NPM_CONFIG_ELECTRON_BUILDER_BINARIES_MIRROR: `${baseUrl}/`,
          NPM_CONFIG_ELECTRON_BUILDER_BINARIES_CUSTOM_DIR: LOCAL_WIN_CODESIGN_DIR,
          ELECTRON_BUILDER_CACHE: LOCAL_CACHE_DIR,
        },
        dispose() {
          if (!child.killed) {
            child.kill();
          }
        },
      });
    });
  });
}

async function executeBuild() {
  const currentPlatform = os.platform();
  const builds = getTargetBuilds(buildTarget, currentPlatform);
  const completed = [];
  let localServer = null;

  console.log(`Current platform: ${currentPlatform}`);
  if (buildTarget === 'all') {
    console.log('Build mode: sequential multi-platform packaging');
  }

  try {
    if (buildMode === 'local' && builds.some(build => build.needsWinCodeSign)) {
      console.log('\n[setup] Starting local winCodeSign mirror...');
      localServer = await startLocalWinCodeSignServer();
      console.log(`[setup] Local mirror ready: ${localServer.env.ELECTRON_BUILDER_BINARIES_DOWNLOAD_OVERRIDE_URL}`);
    }

    for (const build of builds) {
      const extraEnv = build.needsWinCodeSign && localServer ? localServer.env : {};
      try {
        runCommand(`electron-builder ${build.flag} --publish=never`, build.label, extraEnv);
        completed.push(build);
        showBuildInfo(build);
      } catch (error) {
        console.error(`\n[failed] ${build.label}`);
        if (build.needsWinCodeSign && buildMode === 'remote') {
          console.error('Hint: remote mode depends on downloading winCodeSign from GitHub.');
        }
        if (build.needsWinCodeSign && buildMode === 'local') {
          console.error(`Hint: local mode uses ${LOCAL_WIN_CODESIGN_ARCHIVE}.`);
        }
        if (completed.length > 0) {
          console.error(`Completed before failure: ${completed.map(item => item.label).join(', ')}`);
        }
        throw error;
      }
    }

    console.log('\nPackaging completed successfully.');
  } finally {
    if (localServer) {
      localServer.dispose();
    }
  }
}

executeBuild().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
