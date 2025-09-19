#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const platform = process.argv[2] || 'current';

console.log('🚀 开始构建示波器仿真系统...');

// 确保构建目录存在
const buildDir = path.join(__dirname, '..', 'dist');
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

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

// 构建Web应用
runCommand('npm run build', '构建Web应用');

// 根据平台构建
switch (platform) {
  case 'win':
  case 'windows':
    console.log('\n🖥️  构建Windows版本...');
    runCommand('npm run electron:build-win', '构建Windows应用');
    console.log('\n✨ Windows版本构建完成！');
    console.log('📍 输出目录: dist/');
    console.log('📦 安装包: .exe 文件');
    console.log('📦 便携版: .exe 文件');
    break;

  case 'mac':
  case 'macos':
    console.log('\n🍎 构建macOS版本...');
    runCommand('npm run electron:build-mac', '构建macOS应用');
    console.log('\n✨ macOS版本构建完成！');
    console.log('📍 输出目录: dist/');
    console.log('📦 安装包: .dmg 文件');
    break;

  case 'linux':
    console.log('\n🐧 构建Linux版本...');
    runCommand('npm run electron:build-linux', '构建Linux应用');
    console.log('\n✨ Linux版本构建完成！');
    console.log('📍 输出目录: dist/');
    console.log('📦 安装包: .AppImage 和 .deb 文件');
    break;

  case 'all':
    console.log('\n🌍 构建所有平台版本...');
    runCommand('npm run electron:build-all', '构建所有平台应用');
    console.log('\n✨ 所有平台版本构建完成！');
    console.log('📍 输出目录: dist/');
    console.log('📦 Windows: .exe 文件');
    console.log('📦 macOS: .dmg 文件');
    console.log('📦 Linux: .AppImage 和 .deb 文件');
    break;

  case 'current':
  default:
    console.log('\n🖥️  构建当前平台版本...');
    runCommand('npm run electron:build', '构建当前平台应用');
    console.log('\n✨ 当前平台版本构建完成！');
    console.log('📍 输出目录: dist/');
    break;
}

console.log('\n🎉 构建完成！');
console.log('\n📚 使用说明:');
console.log('- 直接运行可执行文件即可启动应用');
console.log('- 应用支持一键拷贝到其他电脑使用');
console.log('- 支持 Windows、macOS、Linux 跨平台运行');
console.log('\n💡 提示:');
console.log('- Windows: 运行 .exe 文件或使用安装包');
console.log('- macOS: 打开 .dmg 文件并拖拽到应用程序文件夹');
console.log('- Linux: 运行 .AppImage 文件或安装 .deb 包');
