const { spawn } = require('child_process');
const electronBinary = require('electron');
const waitOn = require('wait-on');
const { findAvailablePort } = require('./find-available-port');

async function main() {
  const port = await findAvailablePort(Number(process.env.DEV_SERVER_PORT) || 8081);
  const env = {
    ...process.env,
    NODE_ENV: 'development',
    DEV_SERVER_PORT: String(port),
  };
  const resource = `http://127.0.0.1:${port}`;

  console.log(`[desktop:dev] Using dev server ${resource}`);

  const webpackProcess = spawn(
    process.execPath,
    ['scripts/dev.js'],
    {
      stdio: 'inherit',
      env,
    }
  );

  const stopWebpack = () => {
    if (!webpackProcess.killed) {
      webpackProcess.kill();
    }
  };

  webpackProcess.on('exit', (code) => {
    if (code && code !== 0) {
      process.exitCode = code;
    }
  });

  try {
    await waitOn({ resources: [resource], timeout: 60000 });
  } catch (error) {
    stopWebpack();
    throw error;
  }

  const electronProcess = spawn(
    electronBinary,
    ['.'],
    {
      stdio: 'inherit',
      env,
    }
  );

  const shutdown = () => {
    if (!electronProcess.killed) {
      electronProcess.kill();
    }

    stopWebpack();
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  electronProcess.on('exit', (code, signal) => {
    stopWebpack();

    if (signal) {
      process.kill(process.pid, signal);
      return;
    }

    process.exit(code ?? process.exitCode ?? 0);
  });
}

main().catch((error) => {
  console.error('[desktop:dev] Failed to start desktop development mode.');
  console.error(error);
  process.exit(1);
});
