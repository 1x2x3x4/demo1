import * as THREE from 'three';
import { CONFIG } from '../config';

/**
 * 电子束类
 * 负责处理电子束的路径和显示
 */
export class ElectronBeam {
  /**
   * 构造函数
   * @param {THREE.Scene} scene - Three.js场景
   */
  constructor(scene) {
    this.scene = scene;
    this.beamLine = null;
    this.beamPoints = [];
    this.tracePoints = [];
    this.traceLines = [];
    
    // 电子束材质
    this.beamMaterial = new THREE.LineBasicMaterial({
      color: CONFIG.beam.color,
      opacity: CONFIG.beam.intensity,
      transparent: true
    });
    
    // 轨迹材质（淡一些）
    this.traceMaterial = new THREE.LineBasicMaterial({
      color: CONFIG.beam.color,
      opacity: CONFIG.electronBeam.trace.opacity,
      transparent: true
    });
    
    // 初始化电子束
    this.initBeam();
  }
  
  /**
   * 初始化电子束
   */
  initBeam() {
    // 默认电子束路径点
    this.beamPoints = CONFIG.electronBeam.pathPoints.map(point => 
      new THREE.Vector3(point.x, point.y, point.z)
    );
    
    // 创建电子束几何体和线条
    const beamGeometry = new THREE.BufferGeometry().setFromPoints(this.beamPoints);
    this.beamLine = new THREE.Line(beamGeometry, this.beamMaterial);
    this.scene.add(this.beamLine);
  }
  
  /**
   * 更新电子束路径
   * @param {Object} deflectionParams - 偏转参数对象
   * @param {Object} deflectionParams.vertical - 垂直偏转参数
   * @param {number} deflectionParams.vertical.voltage - 垂直偏转电压
   * @param {Object} deflectionParams.horizontal - 水平偏转参数
   * @param {number} deflectionParams.horizontal.voltage - 水平偏转电压
   */
  updateBeamPath(deflectionParams) {
    // 计算偏转量
    const voltageScalingFactor = CONFIG.electronBeam.voltageScalingFactor;
    const verticalDeflection = deflectionParams.vertical.voltage * (CONFIG.deflection.vertical.maxDeflection / voltageScalingFactor);
    const horizontalDeflection = deflectionParams.horizontal.voltage * (CONFIG.deflection.horizontal.maxDeflection / voltageScalingFactor);
    
    // 生成物理真实的电子束轨迹
    this.beamPoints = this.generatePhysicalBeamPath(verticalDeflection, horizontalDeflection);
    
    // 更新几何体
    const beamGeometry = new THREE.BufferGeometry().setFromPoints(this.beamPoints);
    this.beamLine.geometry.dispose();
    this.beamLine.geometry = beamGeometry;
    
    // 更新材质颜色和强度
    this.beamMaterial.color.set(CONFIG.beam.color);
    this.beamMaterial.opacity = CONFIG.beam.intensity;
    
    // 记录轨迹点（只记录打在荧光屏上的点）
    const lastBeamPoint = this.beamPoints[this.beamPoints.length - 1];
    this.addTracePoint(lastBeamPoint.clone());
  }
  
  /**
   * 生成物理真实的电子束轨迹
   * @param {number} verticalDeflection - 垂直偏转量
   * @param {number} horizontalDeflection - 水平偏转量
   * @returns {Array<THREE.Vector3>} 轨迹点数组
   */
  generatePhysicalBeamPath(verticalDeflection, horizontalDeflection) {
    const trajectoryPoints = [];
    
    // 获取极板位置信息
    const platePositions = this.getPlatePositions();
    const gunExitPoint = this.getGunExitPoint();
    
    // 添加电子枪出口点
    trajectoryPoints.push(gunExitPoint);
    
    // 电子枪到垂直偏转板的直线段
    const verticalPlateEntryPoint = new THREE.Vector3(platePositions.verticalPlateStartX, 0, 0);
    const gunToVerticalPlatePoints = this.generateLinearTrajectory(
      gunExitPoint,
      verticalPlateEntryPoint,
      CONFIG.electronBeam.linearSegments.gunToVerticalPlate
    );
    trajectoryPoints.push(...gunToVerticalPlatePoints);
    
    // 垂直偏转板内的抛物线轨迹
    const verticalPlatePoints = this.generateParabolicTrajectory(
      verticalPlateEntryPoint,
      platePositions.verticalPlateEndX,
      verticalDeflection,
      'vertical'
    );
    trajectoryPoints.push(...verticalPlatePoints);
    
    // 垂直偏转板到水平偏转板的直线段
    const horizontalPlateEntryPoint = new THREE.Vector3(platePositions.horizontalPlateStartX, verticalDeflection, 0);
    const verticalPlateExitPoint = new THREE.Vector3(platePositions.verticalPlateEndX, verticalDeflection, 0);
    const verticalToHorizontalPlatePoints = this.generateLinearTrajectory(
      verticalPlateExitPoint,
      horizontalPlateEntryPoint,
      CONFIG.electronBeam.linearSegments.betweenPlates
    );
    trajectoryPoints.push(...verticalToHorizontalPlatePoints);
    
    // 水平偏转板内的抛物线轨迹
    const horizontalPlatePoints = this.generateParabolicTrajectory(
      horizontalPlateEntryPoint,
      platePositions.horizontalPlateEndX,
      horizontalDeflection,
      'horizontal'
    );
    trajectoryPoints.push(...horizontalPlatePoints);
    
    // 水平偏转板出口到荧光屏的直线段
    const plateExitPoint = new THREE.Vector3(platePositions.horizontalPlateEndX, verticalDeflection, horizontalDeflection);
    const screenHitPoint = new THREE.Vector3(platePositions.screenX, verticalDeflection, horizontalDeflection);
    const plateToScreenPoints = this.generateLinearTrajectory(
      plateExitPoint,
      screenHitPoint,
      CONFIG.electronBeam.linearSegments.plateToScreen
    );
    trajectoryPoints.push(...plateToScreenPoints);
    
    return trajectoryPoints;
  }
  
  /**
   * 生成抛物线轨迹
   * @param {THREE.Vector3} startPoint - 起始点
   * @param {number} endX - 结束X坐标
   * @param {number} maxDeflection - 最大偏转量
   * @param {string} direction - 偏转方向 ('vertical' 或 'horizontal')
   * @returns {Array<THREE.Vector3>} 抛物线轨迹点
   */
  generateParabolicTrajectory(startPoint, endX, maxDeflection, direction) {
    const parabolicPoints = [];
    const segmentCount = CONFIG.electronBeam.parabolicSegments || 10;
    const plateLength = endX - startPoint.x;
    
    for (let i = 1; i <= segmentCount; i++) {
      const progress = i / segmentCount;
      const x = startPoint.x + plateLength * progress;
      
      // 物理真实的抛物线方程
      // 在恒定电场中，电子轨迹为抛物线：y = (eE/2mv²) * x²
      // 这里简化为：deflection = maxDeflection * (x/plateLength)²
      const normalizedX = progress; // 0到1的归一化坐标
      const parabolicDeflection = maxDeflection * normalizedX * normalizedX;
      
      let y, z;
      if (direction === 'vertical') {
        y = startPoint.y + parabolicDeflection;
        z = startPoint.z;
      } else {
        y = startPoint.y;
        z = startPoint.z + parabolicDeflection;
      }
      
      parabolicPoints.push(new THREE.Vector3(x, y, z));
    }
    
    return parabolicPoints;
  }
  
  /**
   * 生成直线轨迹
   * @param {THREE.Vector3} startPoint - 起始点
   * @param {THREE.Vector3} endPoint - 结束点
   * @param {number} segmentCount - 段数
   * @returns {Array<THREE.Vector3>} 直线轨迹点
   */
  generateLinearTrajectory(startPoint, endPoint, segmentCount = 5) {
    const linearPoints = [];
    
    for (let i = 1; i <= segmentCount; i++) {
      const progress = i / segmentCount;
      const x = startPoint.x + (endPoint.x - startPoint.x) * progress;
      const y = startPoint.y + (endPoint.y - startPoint.y) * progress;
      const z = startPoint.z + (endPoint.z - startPoint.z) * progress;
      
      linearPoints.push(new THREE.Vector3(x, y, z));
    }
    
    return linearPoints;
  }
  
  /**
   * 获取极板位置信息
   * @returns {Object} 极板位置对象
   */
  getPlatePositions() {
    const verticalPlateStartX = CONFIG.components.verticalPlates.positions[0].x;
    const verticalPlateEndX = verticalPlateStartX + CONFIG.components.verticalPlates.depth;
    const horizontalPlateStartX = CONFIG.components.horizontalPlates.positions[0].x;
    const horizontalPlateEndX = horizontalPlateStartX + CONFIG.components.horizontalPlates.depth;
    const screenX = CONFIG.components.screen.position.x;
    
    return {
      verticalPlateStartX,
      verticalPlateEndX,
      horizontalPlateStartX,
      horizontalPlateEndX,
      screenX
    };
  }
  
  /**
   * 获取电子枪出口点
   * @returns {THREE.Vector3} 电子枪出口点
   */
  getGunExitPoint() {
    return new THREE.Vector3(-2.7, 0, 0);
  }
  
  /**
   * 添加轨迹点
   * @param {THREE.Vector3} point - 轨迹点
   */
  addTracePoint(point) {
    // 添加新的轨迹点
    this.tracePoints.push(point);
    
    // 如果轨迹点过多，移除最早的点
    if (this.tracePoints.length > CONFIG.electronBeam.trace.maxPoints) {
      this.tracePoints.shift();
    }
    
    // 清除旧的轨迹线
    this.clearTraceLines();
    
    // 如果有足够的点，创建轨迹线
    if (this.tracePoints.length > 1) {
      const traceGeometry = new THREE.BufferGeometry().setFromPoints(this.tracePoints);
      const traceLine = new THREE.Line(traceGeometry, this.traceMaterial);
      this.traceLines.push(traceLine);
      this.scene.add(traceLine);
    }
  }
  
  /**
   * 清除轨迹线
   */
  clearTraceLines() {
    this.traceLines.forEach(line => {
      this.scene.remove(line);
      line.geometry.dispose();
    });
    this.traceLines = [];
  }
  
  /**
   * 更新材质
   */
  updateMaterial() {
    this.beamMaterial.color.set(CONFIG.beam.color);
    this.beamMaterial.opacity = CONFIG.beam.intensity;
    this.traceMaterial.color.set(CONFIG.beam.color);
  }
  
  /**
   * 清除所有轨迹
   */
  clearAllTraces() {
    this.clearTraceLines();
    this.tracePoints = [];
  }
} 