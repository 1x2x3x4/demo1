#!/usr/bin/env node

const fs = require('fs');
const http = require('http');
const path = require('path');
const { URL } = require('url');

const archivePath = process.argv[2];
const binariesDir = path.dirname(archivePath);
const upstreamBase = 'https://github.com/electron-userland/electron-builder-binaries/releases/download';

if (!archivePath || !fs.existsSync(archivePath)) {
  console.error(`Archive not found: ${archivePath || '<missing>'}`);
  process.exit(1);
}

function resolveArchiveFromRequest(requestUrl) {
  const parsedUrl = new URL(requestUrl, 'http://127.0.0.1');
  const fileName = path.basename(parsedUrl.pathname);
  const localPath = path.join(binariesDir, fileName);

  return {
    fileName,
    localPath,
  };
}

function streamLocalFile(filePath, response) {
  response.writeHead(200, {
    'Content-Type': 'application/x-7z-compressed',
    'Content-Length': fs.statSync(filePath).size,
    'Cache-Control': 'no-store',
    'Accept-Ranges': 'bytes',
  });

  fs.createReadStream(filePath).pipe(response);
}

const server = http.createServer((request, response) => {
  if (!request.url) {
    response.statusCode = 404;
    response.end('Not found');
    return;
  }

  const { fileName, localPath } = resolveArchiveFromRequest(request.url);

  if (fs.existsSync(localPath)) {
    streamLocalFile(localPath, response);
    return;
  }

  const artifactName = fileName.replace(/\.7z$/i, '');
  const upstreamUrl = `${upstreamBase}/${artifactName}/${fileName}`;
  response.writeHead(302, { Location: upstreamUrl });
  response.end();
});

server.listen(0, '127.0.0.1', () => {
  const address = server.address();
  process.stdout.write(`http://127.0.0.1:${address.port}`);
});

function shutdown() {
  server.close(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
