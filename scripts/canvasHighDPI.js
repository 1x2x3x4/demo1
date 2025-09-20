/**
 * Canvas高DPI适配工具类
 * 解决不同分辨率和缩放比例下的显示一致性问题
 */
export class CanvasHighDPI {
  /**
   * 设置Canvas为高DPI适配
   * @param {HTMLCanvasElement} canvas - Canvas元素
   * @param {number} width - 显示宽度
   * @param {number} height - 显示高度
   * @returns {Object} 返回适配信息
   */
  static setupCanvas(canvas, width = 800, height = 400) {
    const ctx = canvas.getContext('2d');
    const devicePixelRatio = window.devicePixelRatio || 1;
    const backingStoreRatio = ctx.webkitBackingStorePixelRatio ||
                              ctx.mozBackingStorePixelRatio ||
                              ctx.msBackingStorePixelRatio ||
                              ctx.oBackingStorePixelRatio ||
                              ctx.backingStorePixelRatio || 1;
    
    const ratio = devicePixelRatio / backingStoreRatio;
    
    // 获取容器的实际显示尺寸
    const rect = canvas.getBoundingClientRect();
    const displayWidth = rect.width || width;
    const displayHeight = rect.height || height;
    
    // 设置Canvas的实际像素尺寸
    canvas.width = displayWidth * ratio;
    canvas.height = displayHeight * ratio;
    
    // 设置Canvas的CSS显示尺寸
    canvas.style.width = displayWidth + 'px';
    canvas.style.height = displayHeight + 'px';
    
    // 缩放context以确保正确绘制
    ctx.scale(ratio, ratio);
    
    // 优化渲染质量
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    return {
      ratio: ratio,
      displayWidth: displayWidth,
      displayHeight: displayHeight,
      actualWidth: canvas.width,
      actualHeight: canvas.height
    };
  }
  
  /**
   * 根据窗口大小调整Canvas
   * @param {HTMLCanvasElement} canvas - Canvas元素
   */
  static resizeCanvas(canvas) {
    if (!canvas) return;
    
    const container = canvas.parentElement;
    if (!container) return;
    
    // 获取容器尺寸
    const containerRect = container.getBoundingClientRect();
    
    // 重新设置Canvas适配
    return this.setupCanvas(canvas, containerRect.width, containerRect.height);
  }
  
  /**
   * 创建响应式Canvas监听器
   * @param {HTMLCanvasElement} canvas - Canvas元素
   * @param {Function} redrawCallback - 重绘回调函数
   */
  static createResizeObserver(canvas, redrawCallback) {
    // 使用ResizeObserver监听容器大小变化
    if (window.ResizeObserver) {
      const resizeObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
          // 延迟执行以确保DOM更新完成
          setTimeout(() => {
            this.resizeCanvas(canvas);
            if (redrawCallback) redrawCallback();
          }, 10);
        }
      });
      
      const container = canvas.parentElement;
      if (container) {
        resizeObserver.observe(container);
      }
      
      return resizeObserver;
    } else {
      // 降级到window resize事件
      const handleResize = () => {
        setTimeout(() => {
          this.resizeCanvas(canvas);
          if (redrawCallback) redrawCallback();
        }, 100);
      };
      
      window.addEventListener('resize', handleResize);
      return { disconnect: () => window.removeEventListener('resize', handleResize) };
    }
  }
}
