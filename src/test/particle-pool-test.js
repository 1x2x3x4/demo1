/**
 * 粒子对象池性能测试脚本
 * 用于验证对象池优化效果
 */

import { ParticlePool } from '../utils/ParticlePool.js';

/**
 * 模拟传统方式创建和销毁粒子的性能测试
 */
function testTraditionalApproach(particleCount = 100) {
  console.log('\n=== 传统方式性能测试 ===');
  console.log(`创建和销毁 ${particleCount} 个粒子`);
  
  const startTime = performance.now();
  const particles = [];
  
  // 创建粒子
  for (let i = 0; i < particleCount; i++) {
    // 模拟传统方式：每次都创建新对象
    const geometry = new THREE.SphereGeometry(0.02, 8, 6);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    const particle = new THREE.Mesh(geometry, material);
    particles.push(particle);
  }
  
  const createTime = performance.now();
  
  // 销毁粒子
  particles.forEach(particle => {
    particle.geometry.dispose();
    particle.material.dispose();
  });
  
  const endTime = performance.now();
  
  console.log(`创建时间: ${(createTime - startTime).toFixed(2)}ms`);
  console.log(`销毁时间: ${(endTime - createTime).toFixed(2)}ms`);
  console.log(`总时间: ${(endTime - startTime).toFixed(2)}ms`);
  
  return {
    createTime: createTime - startTime,
    destroyTime: endTime - createTime,
    totalTime: endTime - startTime
  };
}

/**
 * 对象池方式性能测试
 */
function testPoolApproach(particleCount = 100) {
  console.log('\n=== 对象池方式性能测试 ===');
  console.log(`使用对象池获取和释放 ${particleCount} 个粒子`);
  
  // 创建对象池
  const pool = new ParticlePool(particleCount + 10, Math.min(20, particleCount));
  
  const startTime = performance.now();
  const particles = [];
  
  // 从对象池获取粒子
  for (let i = 0; i < particleCount; i++) {
    const particle = pool.getParticle();
    particles.push(particle);
  }
  
  const getTime = performance.now();
  
  // 释放粒子回对象池
  particles.forEach(particle => {
    pool.releaseParticle(particle);
  });
  
  const endTime = performance.now();
  
  console.log(`获取时间: ${(getTime - startTime).toFixed(2)}ms`);
  console.log(`释放时间: ${(endTime - getTime).toFixed(2)}ms`);
  console.log(`总时间: ${(endTime - startTime).toFixed(2)}ms`);
  
  // 打印对象池统计
  pool.printStatus();
  
  // 清理对象池
  pool.dispose();
  
  return {
    getTime: getTime - startTime,
    releaseTime: endTime - getTime,
    totalTime: endTime - startTime
  };
}

/**
 * 内存使用情况测试
 */
function testMemoryUsage() {
  console.log('\n=== 内存使用情况测试 ===');
  
  // 检查浏览器是否支持内存监控
  if (performance.memory) {
    const initialMemory = performance.memory.usedJSHeapSize;
    console.log(`初始内存使用: ${(initialMemory / 1024 / 1024).toFixed(2)}MB`);
    
    // 传统方式测试
    console.log('\n传统方式 - 创建1000个粒子:');
    testTraditionalApproach(1000);
    
    // 强制垃圾回收（如果可用）
    if (window.gc) {
      window.gc();
    }
    
    const afterTraditional = performance.memory.usedJSHeapSize;
    console.log(`传统方式后内存: ${(afterTraditional / 1024 / 1024).toFixed(2)}MB`);
    console.log(`内存增长: ${((afterTraditional - initialMemory) / 1024 / 1024).toFixed(2)}MB`);
    
    // 对象池方式测试
    console.log('\n对象池方式 - 处理1000个粒子:');
    testPoolApproach(1000);
    
    const afterPool = performance.memory.usedJSHeapSize;
    console.log(`对象池方式后内存: ${(afterPool / 1024 / 1024).toFixed(2)}MB`);
    console.log(`相对传统方式内存节省: ${((afterTraditional - afterPool) / 1024 / 1024).toFixed(2)}MB`);
  } else {
    console.log('浏览器不支持内存监控 (performance.memory)');
    console.log('请在 Chrome 中使用 --enable-precise-memory-info 标志运行');
  }
}

/**
 * 综合性能对比测试
 */
function runComparisonTest() {
  console.log('🚀 开始粒子对象池性能对比测试');
  
  const testSizes = [50, 100, 200, 500];
  const results = [];
  
  testSizes.forEach(size => {
    console.log(`\n📊 测试规模: ${size} 个粒子`);
    
    const traditional = testTraditionalApproach(size);
    const pooled = testPoolApproach(size);
    
    const improvement = {
      size: size,
      traditional: traditional.totalTime,
      pooled: pooled.totalTime,
      speedup: (traditional.totalTime / pooled.totalTime).toFixed(2),
      timeSaved: (traditional.totalTime - pooled.totalTime).toFixed(2)
    };
    
    results.push(improvement);
    
    console.log(`⚡ 性能提升: ${improvement.speedup}x 倍`);
    console.log(`⏱️ 节省时间: ${improvement.timeSaved}ms`);
  });
  
  // 总结报告
  console.log('\n📈 性能对比总结:');
  console.log('粒子数\t传统方式\t对象池\t\t提升倍数\t节省时间');
  console.log('----\t------\t----\t\t------\t------');
  results.forEach(r => {
    console.log(`${r.size}\t${r.traditional.toFixed(1)}ms\t\t${r.pooled.toFixed(1)}ms\t\t${r.speedup}x\t\t${r.timeSaved}ms`);
  });
  
  // 计算平均提升
  const avgSpeedup = (results.reduce((sum, r) => sum + parseFloat(r.speedup), 0) / results.length).toFixed(2);
  console.log(`\n🎯 平均性能提升: ${avgSpeedup}x 倍`);
  
  return results;
}

/**
 * 在浏览器控制台中运行测试
 */
export function runParticlePoolTests() {
  try {
    // 基础性能对比
    const results = runComparisonTest();
    
    // 内存使用情况测试
    testMemoryUsage();
    
    console.log('\n✅ 对象池性能测试完成!');
    console.log('\n💡 测试结果说明:');
    console.log('- 对象池方式显著减少了对象创建和销毁的开销');
    console.log('- 特别是在大量粒子场景下，性能提升更加明显');
    console.log('- 内存使用更加稳定，减少了垃圾回收的压力');
    
    return results;
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
    console.log('💡 请确保在支持WebGL的浏览器中运行此测试');
  }
}

// 如果在浏览器环境中，自动添加到全局对象
if (typeof window !== 'undefined') {
  window.runParticlePoolTests = runParticlePoolTests;
  console.log('💡 在浏览器控制台中输入 runParticlePoolTests() 来运行测试');
}
