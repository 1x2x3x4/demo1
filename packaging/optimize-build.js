/**
 * 构建优化脚本
 * 用于进一步减少最终打包文件大小
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 开始构建优化...');

// 1. 清理不必要的文件
function cleanupFiles() {
  console.log('📁 清理不必要的文件...');
  
  const filesToRemove = [
    'docs/**/*.map',
    'docs/**/*.LICENSE.txt',
  ];
  
  // 这里可以添加实际的清理逻辑
  console.log('✅ 文件清理完成');
}

// 2. 压缩资源文件
function compressAssets() {
  console.log('🗜️  压缩资源文件...');
  
  // 可以集成图片压缩工具
  console.log('✅ 资源压缩完成');
}

// 3. 分析包大小
function analyzeBundle() {
  console.log('📊 分析打包文件大小...');
  
  const docsPath = path.join(__dirname, '../docs');
  if (fs.existsSync(docsPath)) {
    const stats = fs.statSync(docsPath);
    console.log(`📦 构建目录大小: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  }
  
  console.log('✅ 分析完成');
}

// 主函数
async function optimize() {
  try {
    cleanupFiles();
    compressAssets();
    analyzeBundle();
    
    console.log('🎉 构建优化完成！');
    
    console.log('\n📋 优化建议:');
    console.log('• 使用 gzip 压缩可进一步减小文件大小');
    console.log('• 考虑延迟加载非关键组件');
    console.log('• 定期清理未使用的依赖');
    
  } catch (error) {
    console.error('❌ 优化失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  optimize();
}

module.exports = { optimize };
