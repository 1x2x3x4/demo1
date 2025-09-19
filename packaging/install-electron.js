#!/usr/bin/env node

/**
 * Electron 安装脚本
 * 解决网络连接问题，提供多种下载源
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 开始安装Electron依赖...');

// 检查是否已经安装了基本依赖
const packageJsonPath = path.join(__dirname, 'package.json');
const nodeModulesPath = path.join(__dirname, 'node_modules');

// 读取package.json
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

function runCommand(command, description) {
  console.log(`\n📦 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit', cwd: __dirname });
    console.log(`✅ ${description} 完成`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} 失败:`, error.message);
    return false;
  }
}

// 首先安装非Electron依赖
console.log('\n🔧 安装项目基础依赖...');

// 创建临时package.json，排除electron相关依赖
const tempPackageJson = {
  ...packageJson,
  devDependencies: {
    ...packageJson.devDependencies
  }
};

// 移除Electron相关依赖，稍后单独安装
delete tempPackageJson.devDependencies.electron;
delete tempPackageJson.devDependencies['electron-builder'];

// 保存临时package.json
const tempPackageJsonPath = path.join(__dirname, 'package.temp.json');
fs.writeFileSync(tempPackageJsonPath, JSON.stringify(tempPackageJson, null, 2));

// 安装基础依赖
if (runCommand('npm install --package-lock-only --package-lock-json=package.temp.json', '安装基础依赖')) {
  
  // 清理临时文件
  if (fs.existsSync(tempPackageJsonPath)) {
    fs.unlinkSync(tempPackageJsonPath);
  }
  
  console.log('\n⚡ 安装Electron和构建工具...');
  
  // 尝试不同的安装方式
  const electronCommands = [
    'npm install electron@28.0.0 --save-dev --registry=https://registry.npmmirror.com/',
    'npm install electron@28.0.0 --save-dev',
    'yarn add electron@28.0.0 --dev',
  ];
  
  let electronInstalled = false;
  for (const cmd of electronCommands) {
    if (runCommand(cmd, `尝试安装Electron (${cmd.split(' ')[0]})`)) {
      electronInstalled = true;
      break;
    }
  }
  
  if (electronInstalled) {
    console.log('\n📦 安装electron-builder...');
    const builderCommands = [
      'npm install electron-builder@24.9.1 concurrently@8.2.2 wait-on@7.2.0 --save-dev --registry=https://registry.npmmirror.com/',
      'npm install electron-builder@24.9.1 concurrently@8.2.2 wait-on@7.2.0 --save-dev',
    ];
    
    for (const cmd of builderCommands) {
      if (runCommand(cmd, `安装构建工具`)) {
        break;
      }
    }
    
    console.log('\n🎉 安装完成！');
    console.log('\n📚 接下来可以运行：');
    console.log('  npm run electron:dev     - 启动开发环境');
    console.log('  npm run electron:build   - 构建桌面应用');
    console.log('  快速启动.bat             - 使用可视化启动工具');
    
  } else {
    console.log('\n⚠️  Electron安装失败，但不影响Web版本使用');
    console.log('\n💡 解决方案：');
    console.log('1. 检查网络连接');
    console.log('2. 尝试使用VPN或更换网络');
    console.log('3. 手动设置npm镜像：npm config set registry https://registry.npmmirror.com/');
    console.log('4. 或者只使用Web版本：npm run dev');
  }
  
} else {
  console.log('\n❌ 基础依赖安装失败');
  console.log('请检查网络连接或尝试：npm install --registry=https://registry.npmmirror.com/');
}
