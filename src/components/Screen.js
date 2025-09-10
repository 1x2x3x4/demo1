import * as THREE from 'three';
import { CONFIG } from '../configLoader';

/**
 * 荧光屏类
 * 负责处理荧光屏效果和波形显示
 * 集成了ThreeWaveformRenderer的波形渲染功能
 */
export class Screen {
  /**
   * 构造函数
   * @param {THREE.Scene} scene - Three.js场景
   * @param {THREE.Mesh} screenMesh - 荧光屏网格
   */
  constructor(scene, screenMesh) {
    this.scene = scene;
    this.screenMesh = screenMesh;
    
    // 创建荧光点集合
    this.glowPoints = [];
    this.glowMeshes = [];
    this.maxGlowPoints = CONFIG.screenEffects.maxGlowPoints;
    
    // 波形相关属性
    this.waveformGroup = new THREE.Group();
    this.isWaveformAnimating = false;
    this.animationId = null;
    
    // 波形配置
    this.waveformConfig = {
      segments: 1000,
      lineWidth: 2,
      color: 0x00ff00, // 绿色荧光
      showWaveform: true
    };
    
    // 视口参数
    this.viewport = {
      timeDiv: 1,
      voltsDiv: 1,
      horizontalPosition: 0,
      verticalPosition: 0
    };
    
    // 信号参数
    this.signalParams = {
      type: 'sine',
      frequency: 1,
      amplitude: 1,
      phase: 0
    };
    
    // 初始化荧光材质
    this.initGlowMaterial();
    
    // 创建荧光屏网格
    this.createScreenGrid();
    
    // 初始化波形功能
    this.initWaveform();
  }
  
  /**
   * 初始化荧光材质
   */
  initGlowMaterial() {
    // 更新荧光屏材质
    this.screenMesh.material.emissive.set(CONFIG.screen.color);
    this.screenMesh.material.emissiveIntensity = CONFIG.screen.intensity;
    
    // 创建荧光点材质
    this.glowMaterial = new THREE.MeshBasicMaterial({
      color: CONFIG.screen.color,
      transparent: true,
      opacity: 0.8
    });
    
    // 创建波形材质
    this.waveformMaterial = new THREE.LineBasicMaterial({
      color: this.waveformConfig.color,
      linewidth: this.waveformConfig.lineWidth,
      transparent: true,
      opacity: 0.9
    });
  }
  
  /**
   * 创建荧光屏网格
   */
  createScreenGrid() {
    // 获取荧光屏的尺寸和位置
    const screenWidth = CONFIG.components.screen.width;
    const screenHeight = CONFIG.components.screen.height;
    const screenPosition = CONFIG.components.screen.position;
    
    // 创建网格材质
    const gridMaterial = new THREE.LineBasicMaterial({
      color: CONFIG.screen.gridColor,
      transparent: true,
      opacity: CONFIG.screen.gridOpacity
    });
    
    // 创建网格几何体
    const gridGeometry = new THREE.BufferGeometry();
    const gridPoints = [];
    
    // 计算网格线间距
    const gridSpacing = CONFIG.screen.gridSpacing;
    const halfWidth = screenWidth / 2;
    const halfHeight = screenHeight / 2;
    
    // 添加垂直线
    for (let x = -halfWidth; x <= halfWidth; x += gridSpacing) {
      gridPoints.push(x, -halfHeight, 0);
      gridPoints.push(x, halfHeight, 0);
    }
    
    // 添加水平线
    for (let y = -halfHeight; y <= halfHeight; y += gridSpacing) {
      gridPoints.push(-halfWidth, y, 0);
      gridPoints.push(halfWidth, y, 0);
    }
    
    // 设置几何体属性
    gridGeometry.setAttribute('position', new THREE.Float32BufferAttribute(gridPoints, 3));
    
    // 创建网格线
    this.screenGrid = new THREE.LineSegments(gridGeometry, gridMaterial);
    
    // 设置网格位置（稍微偏移，避免z-fighting）
    this.screenGrid.position.copy(screenPosition);
    this.screenGrid.position.x += 0.01; // 在荧光屏前面一点点
    this.screenGrid.rotation.y = -Math.PI / 2; // 与荧光屏相同的旋转
    
    // 添加到场景
    this.scene.add(this.screenGrid);
  }
  
  /**
   * 初始化波形功能
   */
  initWaveform() {
    // 将波形组添加到场景
    this.scene.add(this.waveformGroup);
    
    // 创建初始波形
    this.createWaveform();
  }
  
  /**
   * 创建波形
   */
  createWaveform() {
    if (!this.waveformConfig.showWaveform) return;
    
    // 清除现有波形
    this.waveformGroup.clear();
    
    // 创建单一波形
    this.createSingleWaveform();
  }
  
  /**
   * 创建单一波形
   */
  createSingleWaveform() {
    const points = [];
    const segments = this.waveformConfig.segments;
    
    // 获取荧光屏尺寸
    const screenWidth = CONFIG.components.screen.width;
    const screenHeight = CONFIG.components.screen.height;
    
    // 获取波形参数
    const waveType = this.signalParams.type;
    const frequency = this.signalParams.frequency;
    const amplitude = this.signalParams.amplitude;
    const timeDiv = this.viewport.timeDiv;
    const voltsDiv = this.viewport.voltsDiv;
    
    // 计算时间和电压范围
    const totalTime = timeDiv * 10; // 10个时间分度
    const maxVolts = 4 * voltsDiv; // 4个电压分度
    
    // 计算位置偏移
    const horizontalOffset = this.viewport.horizontalPosition * timeDiv;
    const verticalOffset = this.viewport.verticalPosition * (screenHeight / 8);
    
    // 生成波形点
    for (let i = 0; i <= segments; i++) {
      const t = (i / segments - 0.5) * totalTime - horizontalOffset;
      const phaseVal = 2 * Math.PI * frequency * t + this.signalParams.phase;
      const voltage = this.calculateVoltage(waveType, phaseVal, amplitude);
      
      const x = (i / segments - 0.5) * screenWidth;
      const y = (voltage / maxVolts) * (screenHeight / 2) + verticalOffset;
      const z = 0.02; // 稍微在荧光屏前面
      
      points.push(new THREE.Vector3(x, y, z));
    }
    
    // 创建几何体和线条
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, this.waveformMaterial);
    
    // 设置位置和旋转，与荧光屏对齐
    line.position.copy(CONFIG.components.screen.position);
    line.position.x += 0.02; // 在荧光屏前面一点点
    line.rotation.y = -Math.PI / 2; // 与荧光屏相同的旋转
    
    this.waveformGroup.add(line);
  }
  
  /**
   * 根据波形类型计算电压值
   * @param {string} waveType - 波形类型
   * @param {number} phaseVal - 相位值(弧度)
   * @param {number} amplitude - 振幅
   * @returns {number} 电压值
   */
  calculateVoltage(waveType, phaseVal, amplitude) {
    switch (waveType) {
      case 'sine':
        return amplitude * Math.sin(phaseVal);
      case 'square':
        return amplitude * Math.sign(Math.sin(phaseVal));
      case 'triangle':
        return amplitude * (2 * Math.abs((phaseVal % (2 * Math.PI)) / (2 * Math.PI) - 0.5) - 1);
      case 'sawtooth':
        return amplitude * (((phaseVal % (2 * Math.PI)) / (2 * Math.PI)) * 2 - 1);
      case 'pulse':
        return amplitude * (Math.sin(phaseVal) > 0.7 ? 1 : -1);
      case 'noise':
        return amplitude * (Math.random() * 2 - 1);
      default:
        return 0;
    }
  }
  
  /**
   * 添加荧光点
   * @param {THREE.Vector3} position - 电子束击中荧光屏的位置
   */
  addGlowPoint(position) {
    // 创建一个小球体代表荧光点
    const glowGeometry = new THREE.SphereGeometry(CONFIG.screenEffects.glowPointSize, 8, 8);
    const glowMesh = new THREE.Mesh(glowGeometry, this.glowMaterial.clone());
    
    // 设置位置（稍微偏移，避免z-fighting）
    glowMesh.position.copy(position);
    const screenOffset = CONFIG.electronBeam.screenOffset;
    glowMesh.position.x = CONFIG.components.screen.position.x - screenOffset; // 确保在荧光屏前面一点点
    
    // 添加到场景
    this.scene.add(glowMesh);
    
    // 记录荧光点信息
    this.glowPoints.push({
      mesh: glowMesh,
      createdAt: Date.now(),
      initialOpacity: 0.8
    });
    
    // 如果荧光点过多，移除最早的点
    if (this.glowPoints.length > this.maxGlowPoints) {
      const oldestPoint = this.glowPoints.shift();
      this.scene.remove(oldestPoint.mesh);
      oldestPoint.mesh.geometry.dispose();
      oldestPoint.mesh.material.dispose();
    }
  }
  
  /**
   * 更新荧光点效果和波形动画
   */
  update() {
    const now = Date.now();
    const persistence = CONFIG.screen.persistence;
    
    // 更新荧光屏材质
    this.screenMesh.material.emissive.set(CONFIG.screen.color);
    this.screenMesh.material.emissiveIntensity = CONFIG.screen.intensity;
    
    // 更新每个荧光点的透明度（模拟余辉效果）
    this.glowPoints.forEach((point, index) => {
      const age = (now - point.createdAt) / 1000; // 年龄（秒）
      const fadeRate = 1 - persistence; // 淡出速率
      const opacity = point.initialOpacity * Math.pow(persistence, age * CONFIG.screenEffects.fadeRate);
      
      // 更新透明度
      point.mesh.material.opacity = opacity;
      
      // 如果完全透明，移除这个点
      if (opacity < CONFIG.screenEffects.minOpacity) {
        this.scene.remove(point.mesh);
        point.mesh.geometry.dispose();
        point.mesh.material.dispose();
        this.glowPoints.splice(index, 1);
      }
    });
    
    // 如果波形动画正在运行，更新波形
    if (this.isWaveformAnimating) {
      // 更新相位以实现动画效果
      this.signalParams.phase += 0.02;
      
      // 更新波形显示
      this.updateWaveform();
    }
  }
  
  /**
   * 清除所有荧光点
   */
  clearAllGlowPoints() {
    this.glowPoints.forEach(point => {
      this.scene.remove(point.mesh);
      point.mesh.geometry.dispose();
      point.mesh.material.dispose();
    });
    this.glowPoints = [];
  }
  
  /**
   * 更新材质颜色
   */
  updateMaterial() {
    // 更新荧光屏材质
    this.screenMesh.material.emissive.set(CONFIG.screen.color);
    this.screenMesh.material.emissiveIntensity = CONFIG.screen.intensity;
    
    // 更新所有荧光点的颜色
    this.glowPoints.forEach(point => {
      point.mesh.material.color.set(CONFIG.screen.color);
    });
  }
  
  // ========== 波形控制方法 ==========
  
  /**
   * 更新波形
   */
  updateWaveform() {
    this.createWaveform();
  }
  
  /**
   * 设置波形类型
   * @param {string} type - 波形类型 ('sine', 'square', 'triangle', 'sawtooth', 'pulse', 'noise')
   */
  setWaveformType(type) {
    const validTypes = ['sine', 'square', 'triangle', 'sawtooth', 'pulse', 'noise'];
    if (validTypes.includes(type)) {
      this.signalParams.type = type;
      this.updateWaveform();
    }
    return this;
  }
  
  /**
   * 调整时间分度值
   * @param {number} step - 调整步长
   */
  adjustTimeDiv(step) {
    this.viewport.timeDiv = Math.min(100, Math.max(0.1, this.viewport.timeDiv + step));
    this.viewport.timeDiv = Number(this.viewport.timeDiv.toFixed(1));
    this.updateWaveform();
    return this;
  }
  
  /**
   * 调整电压分度值
   * @param {number} step - 调整步长
   */
  adjustVoltsDiv(step) {
    this.viewport.voltsDiv = Math.min(10, Math.max(0.1, this.viewport.voltsDiv + step));
    this.viewport.voltsDiv = Number(this.viewport.voltsDiv.toFixed(2));
    this.updateWaveform();
    return this;
  }
  
  /**
   * 调整频率
   * @param {number} step - 调整步长
   */
  adjustFrequency(step) {
    this.signalParams.frequency = Math.max(0.1, this.signalParams.frequency + step);
    this.updateWaveform();
    return this;
  }
  
  /**
   * 设置频率
   * @param {number} frequency - 频率值
   */
  setFrequency(frequency) {
    this.signalParams.frequency = Math.max(0.1, frequency);
    this.updateWaveform();
    return this;
  }
  
  /**
   * 调整振幅
   * @param {number} step - 调整步长
   */
  adjustAmplitude(step) {
    this.signalParams.amplitude = Math.max(0.1, this.signalParams.amplitude + step);
    this.updateWaveform();
    return this;
  }
  
  /**
   * 设置振幅
   * @param {number} amplitude - 振幅值
   */
  setAmplitude(amplitude) {
    this.signalParams.amplitude = Math.max(0.1, amplitude);
    this.updateWaveform();
    return this;
  }
  
  /**
   * 调整显示位置
   * @param {string} axis - 轴('horizontal' 或 'vertical')
   * @param {number} step - 调整步长
   */
  adjustPosition(axis, step) {
    if (axis === 'horizontal') {
      this.viewport.horizontalPosition = Math.min(8, Math.max(-8, this.viewport.horizontalPosition + step));
    } else if (axis === 'vertical') {
      this.viewport.verticalPosition = Math.min(4, Math.max(-4, this.viewport.verticalPosition + step));
    }
    this.updateWaveform();
    return this;
  }
  
  /**
   * 开始波形动画
   */
  startWaveformAnimation() {
    if (this.isWaveformAnimating) return this;
    
    this.isWaveformAnimating = true;
    
    const animate = () => {
      if (!this.isWaveformAnimating) return;
      
      // 更新相位
      this.signalParams.phase += 0.02;
      
      // 更新波形
      this.updateWaveform();
      
      // 请求下一帧
      this.animationId = requestAnimationFrame(animate);
    };
    
    animate();
    return this;
  }
  
  /**
   * 停止波形动画
   */
  stopWaveformAnimation() {
    this.isWaveformAnimating = false;
    
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    
    return this;
  }
  
  /**
   * 设置相位
   * @param {number} phase - 相位值（弧度）
   */
  setPhase(phase) {
    this.signalParams.phase = phase;
    this.updateWaveform();
    return this;
  }

  /**
   * 重置波形参数
   */
  resetWaveform() {
    this.signalParams.phase = 0;
    this.viewport.horizontalPosition = 0;
    this.viewport.verticalPosition = 0;
    this.updateWaveform();
    return this;
  }
  
  /**
   * 显示/隐藏波形
   * @param {boolean} show - 是否显示波形
   */
  showWaveform(show) {
    this.waveformConfig.showWaveform = show;
    if (show) {
      this.updateWaveform();
    } else {
      this.waveformGroup.clear();
    }
    return this;
  }
  
  /**
   * 设置波形颜色
   * @param {number} color - 颜色值 (十六进制)
   */
  setWaveformColor(color) {
    this.waveformConfig.color = color;
    this.waveformMaterial.color.setHex(color);
    this.updateWaveform();
    return this;
  }
} 