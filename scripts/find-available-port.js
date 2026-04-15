const net = require('net');

function probePort(port, host) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();

    server.unref();
    server.on('error', reject);
    server.listen({ port, host }, () => {
      const address = server.address();
      const resolvedPort = typeof address === 'object' && address ? address.port : port;
      server.close(() => resolve(resolvedPort));
    });
  });
}

async function findAvailablePort(startPort = 8081, host = '127.0.0.1', maxAttempts = 50) {
  for (let offset = 0; offset < maxAttempts; offset += 1) {
    const candidatePort = startPort + offset;

    try {
      return await probePort(candidatePort, host);
    } catch (error) {
      if (!['EADDRINUSE', 'EACCES'].includes(error.code)) {
        throw error;
      }
    }
  }

  return probePort(0, host);
}

module.exports = {
  findAvailablePort,
};
