const { spawn } = require('child_process');
const webpackCli = require.resolve('webpack-cli/bin/cli.js');
const { findAvailablePort } = require('./find-available-port');

async function main() {
  const port = await findAvailablePort(Number(process.env.DEV_SERVER_PORT) || 8081);
  const env = {
    ...process.env,
    NODE_ENV: 'development',
    DEV_SERVER_PORT: String(port),
  };

  console.log(`[dev] Starting webpack-dev-server on http://127.0.0.1:${port}`);

  const child = spawn(
    process.execPath,
    [webpackCli, 'serve', '--config', 'webpack.config.js', '--hot'],
    {
      stdio: 'inherit',
      env,
    }
  );

  child.on('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }

    process.exit(code ?? 0);
  });
}

main().catch((error) => {
  console.error('[dev] Failed to start development server.');
  console.error(error);
  process.exit(1);
});
