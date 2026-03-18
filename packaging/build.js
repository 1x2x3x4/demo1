#!/usr/bin/env node

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const {
  DIST_DIR,
  ROOT_DIR,
  ensureDirectory,
  log,
} = require('./common');

const BUILD_SCOPE = 'build';
const BUILD_CACHE_DIR = path.join(ROOT_DIR, '.eb-cache');
const DEFAULT_BINARY_MIRROR = 'https://mirrors.huaweicloud.com/electron-builder-binaries/';
const ELECTRON_BUILDER_BIN = path.join(
  ROOT_DIR,
  'node_modules',
  'electron-builder',
  'cli.js'
);
const OVERRIDE_BINARY_MIRROR = (process.env.PACKAGING_BINARY_MIRROR || '').trim();
const NETWORK_TIMEOUT_MS = 10000;

const NSIS_BINARY = {
  releaseName: 'nsis-3.0.4.1',
  filename: 'nsis-3.0.4.1.7z',
  version: '3.0.4.1',
  checksum: 'VKMiizYdmNdJOWpRGz4trl4lD++BvYP2irAXpMilheUP0pc93iKlWAoP843Vlraj8YG19CVn0j+dCo/hURz9+Q==',
};

const NSIS_RESOURCES = {
  releaseName: 'nsis-resources-3.4.1',
  filename: 'nsis-resources-3.4.1.7z',
  version: '3.4.1',
  checksum: 'Dqd6g+2buwwvoG1Vyf6BHR1b+25QMmPcwZx40atOT57gH27rkjOei1L0JTldxZu4NFoEmW4kJgZ3DlSWVON3+Q==',
};

const MIRROR_RESOURCES = [NSIS_BINARY, NSIS_RESOURCES];

function removeIfExists(targetPath) {
  if (fs.existsSync(targetPath)) {
    fs.rmSync(targetPath, { recursive: true, force: true });
  }
}

function normalizeMirrorBaseUrl(mirrorBaseUrl) {
  if (!mirrorBaseUrl) {
    return '';
  }

  return mirrorBaseUrl.endsWith('/') ? mirrorBaseUrl : `${mirrorBaseUrl}/`;
}

function resolveMirrorBaseUrl() {
  return normalizeMirrorBaseUrl(OVERRIDE_BINARY_MIRROR || DEFAULT_BINARY_MIRROR);
}

function createMirrorResourceUrl(mirrorBaseUrl, resource) {
  return `${normalizeMirrorBaseUrl(mirrorBaseUrl)}${resource.releaseName}/${resource.filename}`;
}

function buildMirrorOverrides(mirrorBaseUrl) {
  const nsisBinaryUrl = createMirrorResourceUrl(mirrorBaseUrl, NSIS_BINARY);
  const nsisResourcesUrl = createMirrorResourceUrl(mirrorBaseUrl, NSIS_RESOURCES);

  return [
    `-c.nsis.customNsisBinary.url=${nsisBinaryUrl}`,
    `-c.nsis.customNsisBinary.version=${NSIS_BINARY.version}`,
    `-c.nsis.customNsisBinary.checksum=${NSIS_BINARY.checksum}`,
    `-c.nsis.customNsisResources.url=${nsisResourcesUrl}`,
    `-c.nsis.customNsisResources.version=${NSIS_RESOURCES.version}`,
    `-c.nsis.customNsisResources.checksum=${NSIS_RESOURCES.checksum}`,
  ];
}

async function probeUrl(url) {
  const signal = AbortSignal.timeout(NETWORK_TIMEOUT_MS);

  try {
    const headResponse = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal,
    });

    if (headResponse.ok) {
      return { ok: true, status: headResponse.status };
    }

    if (![405, 501].includes(headResponse.status)) {
      return { ok: false, status: headResponse.status };
    }
  } catch (error) {
    if (!String(error?.name).includes('Timeout')) {
      return { ok: false, error: error.message || String(error) };
    }
  }

  try {
    const getResponse = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        Range: 'bytes=0-0',
      },
      signal: AbortSignal.timeout(NETWORK_TIMEOUT_MS),
    });

    if (typeof getResponse.body?.cancel === 'function') {
      getResponse.body.cancel().catch(() => {});
    }

    if (getResponse.ok || getResponse.status === 206) {
      return { ok: true, status: getResponse.status };
    }

    return { ok: false, status: getResponse.status };
  } catch (error) {
    return { ok: false, error: error.message || String(error) };
  }
}

async function probeMirrorResources(mirrorBaseUrl = resolveMirrorBaseUrl()) {
  const normalizedBaseUrl = normalizeMirrorBaseUrl(mirrorBaseUrl);

  const results = await Promise.all(
    MIRROR_RESOURCES.map(async (resource) => {
      const url = createMirrorResourceUrl(normalizedBaseUrl, resource);
      const result = await probeUrl(url);
      return {
        ...result,
        resource,
        url,
      };
    })
  );

  const missing = results.filter((result) => !result.ok);

  return {
    ok: missing.length === 0,
    baseUrl: normalizedBaseUrl,
    missing,
    results,
  };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function removeWithRetries(targetPath, description, retries = 5, delayMs = 1200) {
  let lastError = null;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      removeIfExists(targetPath);
      return;
    } catch (error) {
      lastError = error;
      if (attempt === retries) {
        break;
      }
      await sleep(delayMs);
    }
  }

  throw new Error(
    `Failed to clear ${description}: ${targetPath}\n` +
    `Close any opened app/build output windows and try again.\n` +
    `Original error: ${lastError.message}`
  );
}

async function prepareBuildArtifacts() {
  ensureDirectory(BUILD_CACHE_DIR);
  await removeWithRetries(path.join(DIST_DIR, 'builder-debug.yml'), 'builder-debug.yml');
  await removeWithRetries(path.join(DIST_DIR, 'builder-effective-config.yaml'), 'builder-effective-config.yaml');
  await removeWithRetries(path.join(DIST_DIR, 'win-unpacked'), 'Windows x64 build output directory');
}

function cleanupTransientArtifacts() {
  removeIfExists(path.join(DIST_DIR, 'builder-debug.yml'));
  removeIfExists(path.join(DIST_DIR, 'builder-effective-config.yaml'));
  removeIfExists(path.join(DIST_DIR, 'win-unpacked'));
}

function findLatestExe() {
  if (!fs.existsSync(DIST_DIR)) {
    return null;
  }

  const exeFiles = fs.readdirSync(DIST_DIR, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.exe'))
    .map((entry) => {
      const fullPath = path.join(DIST_DIR, entry.name);
      return {
        fullPath,
        mtime: fs.statSync(fullPath).mtimeMs,
      };
    })
    .sort((a, b) => b.mtime - a.mtime);

  return exeFiles[0]?.fullPath || null;
}

function keepOnlyGeneratedExe(exePath) {
  if (!exePath || !fs.existsSync(exePath) || !fs.existsSync(DIST_DIR)) {
    return;
  }

  const normalizedExePath = path.resolve(exePath);

  for (const entry of fs.readdirSync(DIST_DIR, { withFileTypes: true })) {
    const fullPath = path.join(DIST_DIR, entry.name);
    if (path.resolve(fullPath) === normalizedExePath) {
      continue;
    }
    removeIfExists(fullPath);
  }
}

function createBuilderEnv() {
  return {
    ELECTRON_BUILDER_CACHE: BUILD_CACHE_DIR,
  };
}

function formatMirrorFailure(mirrorProbe) {
  if (!mirrorProbe.missing.length) {
    return 'Configured mirror is not usable.';
  }

  const lines = mirrorProbe.missing.map((entry) => {
    const detail = entry.status ? `HTTP ${entry.status}` : entry.error || 'network error';
    return `- ${entry.url} (${detail})`;
  });

  return [
    'Configured packaging mirror is incomplete or unreachable.',
    'Required resources:',
    ...lines,
  ].join('\n');
}

function runElectronBuilder(args, extraEnv) {
  log(BUILD_SCOPE, 'Windows x64 build...');

  const result = spawnSync(process.execPath, [ELECTRON_BUILDER_BIN, ...args], {
    cwd: ROOT_DIR,
    stdio: 'inherit',
    env: {
      ...process.env,
      ...extraEnv,
    },
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(`electron-builder exited with code ${result.status}.`);
  }

  log(BUILD_SCOPE, 'Windows x64 build completed.');
}

async function executeBuild() {
  if (process.argv.length > 2) {
    log(BUILD_SCOPE, 'Ignoring legacy build arguments. This script only builds a Windows x64 executable.');
  }

  let builderArgs = ['--win', '--x64', '--publish=never'];
  const resolvedMirrorBaseUrl = resolveMirrorBaseUrl();
  const mirrorProbe = await probeMirrorResources(resolvedMirrorBaseUrl);

  if (!mirrorProbe.ok) {
    throw new Error(formatMirrorFailure(mirrorProbe));
  }

  if (OVERRIDE_BINARY_MIRROR) {
    log(BUILD_SCOPE, `Using user-configured binary mirror: ${mirrorProbe.baseUrl}`);
  } else {
    log(BUILD_SCOPE, `Using default Huawei Cloud binary mirror: ${mirrorProbe.baseUrl}`);
  }

  log(BUILD_SCOPE, 'Mirror precheck passed for NSIS binary and NSIS resources.');
  builderArgs = builderArgs.concat(buildMirrorOverrides(mirrorProbe.baseUrl));

  await prepareBuildArtifacts();

  try {
    runElectronBuilder(builderArgs, createBuilderEnv());
  } catch (error) {
    cleanupTransientArtifacts();
    throw new Error(
      OVERRIDE_BINARY_MIRROR
        ? `User-configured mirror packaging failed.\n${error.message}`
        : `Default Huawei Cloud mirror packaging failed.\nSet PACKAGING_BINARY_MIRROR to another compatible mirror if needed.\n${error.message}`
    );
  }

  const exePath = findLatestExe();
  cleanupTransientArtifacts();

  if (!exePath) {
    throw new Error('Build completed, but no .exe file was found in dist/.');
  }

  keepOnlyGeneratedExe(exePath);
  log(BUILD_SCOPE, `Generated executable: ${exePath}`);
  log(BUILD_SCOPE, `Kept only the final executable in dist/: ${exePath}`);

  return exePath;
}

if (require.main === module) {
  executeBuild().catch((error) => {
    console.error(`[${BUILD_SCOPE}] ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  buildMirrorOverrides,
  createMirrorResourceUrl,
  executeBuild,
  probeMirrorResources,
};
