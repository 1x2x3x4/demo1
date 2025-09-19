#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 初始化示波器仿真系统项目...');

function runCommand(command, description) {
  console.log(`\n📦 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    console.log(`✅ ${description} 完成`);
  } catch (error) {
    console.error(`❌ ${description} 失败:`, error.message);
    process.exit(1);
  }
}

// 检查Node.js版本
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion < 16) {
  console.error('❌ 需要 Node.js 16 或更高版本');
  console.log('当前版本:', nodeVersion);
  console.log('请访问 https://nodejs.org 下载最新版本');
  process.exit(1);
}

console.log('✅ Node.js版本检查通过:', nodeVersion);

// 安装依赖
runCommand('npm install', '安装项目依赖');

// 创建必要的目录
const directories = ['dist', 'assets'];
directories.forEach(dir => {
  const dirPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ 创建目录: ${dir}/`);
  }
});

// 检查是否存在图标文件，如果不存在则创建占位符
const iconFiles = [
  { name: 'icon.ico', desc: 'Windows图标' },
  { name: 'icon.icns', desc: 'macOS图标' },
  { name: 'icon.png', desc: 'Linux图标' }
];

iconFiles.forEach(icon => {
  const iconPath = path.join(__dirname, '..', 'assets', icon.name);
  if (!fs.existsSync(iconPath)) {
    console.log(`⚠️  缺少${icon.desc}: assets/${icon.name}`);
    console.log(`   请添加对应的图标文件以获得更好的用户体验`);
  }
});

console.log('\n🎉 项目初始化完成！');
console.log('\n📚 可用命令:');
console.log('  npm run dev              - 启动Web开发服务器');
console.log('  npm run electron:dev     - 启动Electron开发环境');
console.log('  npm run build            - 构建Web应用');
console.log('  npm run electron:build   - 构建当前平台的桌面应用');
console.log('  npm run electron:build-win    - 构建Windows版本');
console.log('  npm run electron:build-mac    - 构建macOS版本');
console.log('  npm run electron:build-linux  - 构建Linux版本');
console.log('  npm run electron:build-all    - 构建所有平台版本');
console.log('  node scripts/build.js [platform] - 使用构建脚本');
console.log('\n💡 快速开始:');
console.log('  npm run electron:dev     - 立即体验桌面应用');
console.log('  node scripts/build.js    - 构建当前平台的可执行文件');
