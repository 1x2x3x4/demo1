#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const os = require('os');

console.log('🚀 开始构建示波器仿真系统...');

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

// 获取命令行参数
const args = process.argv.slice(2);
const buildTarget = args[0] || 'current';

// 根据目标进行构建
function executeBuild() {
  const currentPlatform = os.platform();
  console.log(`\n🖥️  当前平台: ${currentPlatform}`);
  
  switch (buildTarget) {
    case 'win':
    case 'windows':
      console.log('\n🖥️  构建Windows版本...');
      runCommand('electron-builder --win --publish=never', '构建Windows应用');
      showBuildInfo('Windows', '.exe 便携版');
      break;
      
    case 'mac':
    case 'macos':
      console.log('\n🍎 构建macOS版本...');
      runCommand('electron-builder --mac --publish=never', '构建macOS应用');
      showBuildInfo('macOS', '.dmg 安装包');
      break;
      
    case 'linux':
      console.log('\n🐧 构建Linux版本...');
      runCommand('electron-builder --linux --publish=never', '构建Linux应用');
      showBuildInfo('Linux', '.tar.gz 压缩包');
      break;
      
    case 'all':
      console.log('\n🌍 构建所有支持的平台版本...');
      buildAllSupportedPlatforms(currentPlatform);
      break;
      
    case 'current':
    default:
      console.log(`\n🖥️  构建当前平台版本 (${currentPlatform})...`);
      runCommand('electron-builder --publish=never', '构建当前平台应用');
      showBuildInfo('当前平台', '对应格式的安装包');
      break;
  }
}

function showBuildInfo(platform, format) {
  console.log(`\n✨ ${platform}版本构建完成！`);
  console.log('📍 输出目录: dist/');
  console.log(`📦 格式: ${format}`);
}

function buildAllSupportedPlatforms(currentPlatform) {
  const supportedTargets = [];
  const platformInfo = [];
  
  switch (currentPlatform) {
    case 'win32':
      supportedTargets.push('--win', '--linux');
      platformInfo.push('Windows: .exe 便携版', 'Linux: .tar.gz 压缩包');
      console.log('ℹ️  在Windows平台上，支持构建Windows和Linux版本');
      break;
      
    case 'darwin':
      supportedTargets.push('--mac', '--win', '--linux');
      platformInfo.push('macOS: .dmg 安装包', 'Windows: .exe 便携版', 'Linux: .tar.gz 压缩包');
      console.log('ℹ️  在macOS平台上，支持构建所有平台版本');
      break;
      
    case 'linux':
      supportedTargets.push('--linux', '--win');
      platformInfo.push('Linux: .tar.gz 压缩包', 'Windows: .exe 便携版');
      console.log('ℹ️  在Linux平台上，支持构建Linux和Windows版本');
      break;
      
    default:
      supportedTargets.push('--win');
      platformInfo.push('Windows: .exe 便携版');
      console.log('ℹ️  默认仅构建Windows版本');
      break;
  }
  
  const command = `electron-builder ${supportedTargets.join(' ')} --publish=never`;
  runCommand(command, '构建所有支持的平台应用');
  
  console.log('\n✨ 所有支持平台版本构建完成！');
  console.log('📍 输出目录: dist/');
  platformInfo.forEach(info => console.log(`📦 ${info}`));
}

// 执行构建
executeBuild();

console.log('\n🎉 构建完成！');
console.log('\n📚 使用说明:');
console.log('- 直接运行可执行文件即可启动应用');
console.log('- 应用支持一键拷贝到其他电脑使用');
console.log('- 支持 Windows、macOS、Linux 跨平台运行');
console.log('\n💡 提示:');
console.log('- Windows: 运行 .exe 文件或使用安装包');
console.log('- macOS: 打开 .dmg 文件并拖拽到应用程序文件夹');
console.log('- Linux: 运行 .AppImage 文件或安装 .deb 包');
