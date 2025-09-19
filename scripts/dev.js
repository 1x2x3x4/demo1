#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 启动开发环境...');
console.log('📦 这将同时启动Web开发服务器和Electron应用');

// 启动开发环境
const devProcess = spawn('npm', ['run', 'electron:dev'], {
  stdio: 'inherit',
  cwd: path.join(__dirname, '..'),
  shell: true
});

devProcess.on('close', (code) => {
  console.log(`\n开发环境退出，退出码: ${code}`);
});

devProcess.on('error', (error) => {
  console.error('启动开发环境失败:', error);
  process.exit(1);
});

// 处理进程退出
process.on('SIGINT', () => {
  console.log('\n🛑 正在关闭开发环境...');
  devProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 正在关闭开发环境...');
  devProcess.kill('SIGTERM');
});
