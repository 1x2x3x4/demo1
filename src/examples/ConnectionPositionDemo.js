/**
 * 旋转曲线连接位置控制演示
 * 展示如何在代码中动态移动和旋转连接
 */

export class ConnectionPositionDemo {
  constructor(crtShell) {
    this.crtShell = crtShell;
    this.animationId = null;
    this.isAnimating = false;
    
    // 原始偏移量
    this.originalPositionOffset = { x: 0, y: 0, z: 0 };
    this.originalRotationOffset = { x: 0, y: 0, z: 0 };
    
    // 动画参数
    this.time = 0;
    this.animationSpeed = 0.01;
  }

  /**
   * 开始位置动画演示
   */
  startPositionAnimation() {
    if (this.isAnimating) return;
    
    this.isAnimating = true;
    this.time = 0;
    
    // 保存原始偏移量
    this.originalPositionOffset = this.crtShell.getConnectionPositionOffset();
    this.originalRotationOffset = this.crtShell.getConnectionRotationOffset();
    
    console.log('🎬 开始旋转曲线连接位置动画演示');
    this.animate();
  }

  /**
   * 停止位置动画演示
   */
  stopPositionAnimation() {
    if (!this.isAnimating) return;
    
    this.isAnimating = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    
    // 恢复原始偏移量
    this.crtShell.setConnectionPositionOffset(
      this.originalPositionOffset.x,
      this.originalPositionOffset.y,
      this.originalPositionOffset.z
    );
    this.crtShell.setConnectionRotationOffset(
      this.originalRotationOffset.x,
      this.originalRotationOffset.y,
      this.originalRotationOffset.z
    );
    
    console.log('⏹️ 停止旋转曲线连接位置动画演示');
  }

  /**
   * 动画循环
   */
  animate() {
    if (!this.isAnimating) return;
    
    this.time += this.animationSpeed;
    
    // 计算动态位置偏移
    const positionOffset = {
      x: this.originalPositionOffset.x + Math.sin(this.time) * 0.5,
      y: this.originalPositionOffset.y + Math.cos(this.time * 0.8) * 0.3,
      z: this.originalPositionOffset.z + Math.sin(this.time * 1.2) * 0.2
    };
    
    // 计算动态旋转偏移
    const rotationOffset = {
      x: this.originalRotationOffset.x + Math.sin(this.time * 0.7) * 0.2,
      y: this.originalRotationOffset.y + Math.cos(this.time * 0.9) * 0.15,
      z: this.originalRotationOffset.z + Math.sin(this.time * 1.1) * 0.1
    };
    
    // 应用偏移
    this.crtShell.setConnectionPositionOffset(
      positionOffset.x,
      positionOffset.y,
      positionOffset.z
    );
    this.crtShell.setConnectionRotationOffset(
      rotationOffset.x,
      rotationOffset.y,
      rotationOffset.z
    );
    
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  /**
   * 演示不同的位置预设
   */
  demonstratePositionPresets() {
    console.log('🎯 演示旋转曲线连接位置预设');
    
    const presets = [
      {
        name: '默认位置',
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 }
      },
      {
        name: '向上偏移',
        position: { x: 0, y: 0.5, z: 0 },
        rotation: { x: 0, y: 0, z: 0 }
      },
      {
        name: '向右偏移',
        position: { x: 0.5, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 }
      },
      {
        name: '向前偏移',
        position: { x: 0, y: 0, z: 0.5 },
        rotation: { x: 0, y: 0, z: 0 }
      },
      {
        name: '旋转倾斜',
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0.3, y: 0.2, z: 0.1 }
      },
      {
        name: '复合变换',
        position: { x: 0.3, y: 0.2, z: 0.1 },
        rotation: { x: 0.2, y: 0.3, z: 0.1 }
      }
    ];
    
    let currentIndex = 0;
    
    const switchPreset = () => {
      if (currentIndex >= presets.length) {
        console.log('✅ 位置预设演示完成');
        return;
      }
      
      const preset = presets[currentIndex];
      console.log(`📍 切换到预设: ${preset.name}`);
      
      this.crtShell.setConnectionPositionOffset(
        preset.position.x,
        preset.position.y,
        preset.position.z
      );
      this.crtShell.setConnectionRotationOffset(
        preset.rotation.x,
        preset.rotation.y,
        preset.rotation.z
      );
      
      currentIndex++;
      setTimeout(switchPreset, 2000); // 每2秒切换一个预设
    };
    
    switchPreset();
  }

  /**
   * 手动设置连接位置
   */
  setConnectionPosition(x, y, z) {
    console.log(`🎯 手动设置连接位置: (${x}, ${y}, ${z})`);
    this.crtShell.setConnectionPositionOffset(x, y, z);
  }

  /**
   * 手动设置连接旋转
   */
  setConnectionRotation(x, y, z) {
    console.log(`🔄 手动设置连接旋转: (${x}, ${y}, ${z}) 弧度`);
    this.crtShell.setConnectionRotationOffset(x, y, z);
  }

  /**
   * 获取当前连接变换信息
   */
  getConnectionTransform() {
    const position = this.crtShell.getConnectionPositionOffset();
    const rotation = this.crtShell.getConnectionRotationOffset();
    const actualPosition = this.crtShell.getConnectionPosition();
    const actualRotation = this.crtShell.getConnectionRotation();
    
    const info = {
      positionOffset: position,
      rotationOffset: rotation,
      actualPosition: {
        x: actualPosition.x,
        y: actualPosition.y,
        z: actualPosition.z
      },
      actualRotation: {
        x: actualRotation.x,
        y: actualRotation.y,
        z: actualRotation.z
      }
    };
    
    console.log('📊 当前连接变换信息:', info);
    return info;
  }

  /**
   * 重置连接到默认位置
   */
  resetConnectionTransform() {
    console.log('🔄 重置连接到默认位置');
    this.crtShell.setConnectionPositionOffset(0, 0, 0);
    this.crtShell.setConnectionRotationOffset(0, 0, 0);
  }
}

// 使用示例（在浏览器控制台中）：
/*
// 假设你已经有了 crtShell 实例
const demo = new ConnectionPositionDemo(crtShell);

// 开始动画演示
demo.startPositionAnimation();

// 停止动画
demo.stopPositionAnimation();

// 演示位置预设
demo.demonstratePositionPresets();

// 手动设置位置
demo.setConnectionPosition(0.5, 0.3, 0.2);

// 手动设置旋转
demo.setConnectionRotation(0.1, 0.2, 0.1);

// 获取当前变换信息
demo.getConnectionTransform();

// 重置到默认位置
demo.resetConnectionTransform();
*/
