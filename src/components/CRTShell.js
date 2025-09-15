import * as THREE from 'three';
import { CONFIG } from '../configLoader';

/**
 * CRT正方形透明外壳组件
 * 用于包裹整个CRT模型的透明保护壳
 */
export class CRTShell {
  constructor() {
    this.shellGroup = new THREE.Group();
    this.shellGroup.name = 'CRTShell';
    
    this.createShell();
  }

  /**
   * 创建正方形透明外壳（删除靠近荧光屏的右侧面）
   */
  createShell() {
    // 创建透明材质
    this.shellMaterial = new THREE.MeshPhongMaterial({
      color: parseInt(CONFIG.shell.color),
      transparent: true,
      opacity: CONFIG.shell.opacity,
      side: THREE.DoubleSide,
      depthWrite: false
    });

    // 创建自定义几何体 - 5个面的盒子（去掉右侧面）
    const shellGeometry = this.createOpenBoxGeometry(
      CONFIG.shell.size.width,
      CONFIG.shell.size.height,
      CONFIG.shell.size.depth
    );
    const shell = new THREE.Mesh(shellGeometry, this.shellMaterial);
    
    // 设置位置居中
    shell.position.set(0.5, 0, 0); // 稍微向前偏移以居中包裹CRT
    
    this.shellGroup.add(shell);
    
    // 设置初始可见性
    this.shellGroup.visible = CONFIG.shell.visible;
  }

  /**
   * 创建开放式盒子几何体（去掉右侧面，即X正方向的面）
   * @param {number} width - 宽度
   * @param {number} height - 高度 
   * @param {number} depth - 深度
   * @returns {THREE.BufferGeometry} 几何体
   */
  createOpenBoxGeometry(width, height, depth) {
    const geometry = new THREE.BufferGeometry();
    
    const w = width / 2;
    const h = height / 2;
    const d = depth / 2;
    
    // 定义顶点位置 - 立方体的8个顶点
    const vertices = [
      // 左侧面 (X = -w)
      -w, -h, -d,  -w, -h,  d,  -w,  h,  d,
      -w, -h, -d,  -w,  h,  d,  -w,  h, -d,
      
      // 右侧面被删除 - 不添加这个面
      
      // 顶面 (Y = h)
      -w,  h, -d,  -w,  h,  d,   w,  h,  d,
      -w,  h, -d,   w,  h,  d,   w,  h, -d,
      
      // 底面 (Y = -h)
      -w, -h, -d,   w, -h, -d,   w, -h,  d,
      -w, -h, -d,   w, -h,  d,  -w, -h,  d,
      
      // 前面 (Z = d)
      -w, -h,  d,   w, -h,  d,   w,  h,  d,
      -w, -h,  d,   w,  h,  d,  -w,  h,  d,
      
      // 后面 (Z = -d)
      -w, -h, -d,  -w,  h, -d,   w,  h, -d,
      -w, -h, -d,   w,  h, -d,   w, -h, -d
    ];
    
    // 定义法向量
    const normals = [
      // 左侧面
      -1, 0, 0,  -1, 0, 0,  -1, 0, 0,
      -1, 0, 0,  -1, 0, 0,  -1, 0, 0,
      
      // 顶面
      0, 1, 0,  0, 1, 0,  0, 1, 0,
      0, 1, 0,  0, 1, 0,  0, 1, 0,
      
      // 底面
      0, -1, 0,  0, -1, 0,  0, -1, 0,
      0, -1, 0,  0, -1, 0,  0, -1, 0,
      
      // 前面
      0, 0, 1,  0, 0, 1,  0, 0, 1,
      0, 0, 1,  0, 0, 1,  0, 0, 1,
      
      // 后面
      0, 0, -1,  0, 0, -1,  0, 0, -1,
      0, 0, -1,  0, 0, -1,  0, 0, -1
    ];
    
    // 定义UV坐标
    const uvs = [
      // 左侧面
      0, 0,  1, 0,  1, 1,
      0, 0,  1, 1,  0, 1,
      
      // 顶面
      0, 0,  1, 0,  1, 1,
      0, 0,  1, 1,  0, 1,
      
      // 底面
      0, 0,  1, 0,  1, 1,
      0, 0,  1, 1,  0, 1,
      
      // 前面
      0, 0,  1, 0,  1, 1,
      0, 0,  1, 1,  0, 1,
      
      // 后面
      0, 0,  1, 0,  1, 1,
      0, 0,  1, 1,  0, 1
    ];
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    
    return geometry;
  }

  /**
   * 获取外壳组
   */
  getShell() {
    return this.shellGroup;
  }

  /**
   * 设置外壳可见性
   */
  setVisible(visible) {
    this.shellGroup.visible = visible;
  }

  /**
   * 设置外壳透明度
   */
  setOpacity(opacity) {
    this.shellMaterial.opacity = Math.max(0, Math.min(1, opacity));
  }

  /**
   * 设置外壳颜色
   */
  setColor(color) {
    this.shellMaterial.color.setHex(color);
  }

  /**
   * 设置外壳位置
   */
  setPosition(x, y, z) {
    this.shellGroup.position.set(x, y, z);
  }

  /**
   * 获取外壳当前位置
   */
  getPosition() {
    return this.shellGroup.position.clone();
  }

  /**
   * 更新动画 - 外壳设置为静态，无动画效果
   */
  update(deltaTime) {
    // 外壳保持静态，不进行任何动画更新
    // 如果需要动画效果，可以在这里添加
  }

  /**
   * 销毁资源
   */
  dispose() {
    if (this.shellMaterial) {
      this.shellMaterial.dispose();
    }
    
    this.shellGroup.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    });
  }
}
