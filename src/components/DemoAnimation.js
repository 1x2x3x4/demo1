import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';
import { CONFIG } from '../config';

/**
 * 演示动画类
 * 负责创建和控制阴极射线管工作原理的演示动画
 */
export class DemoAnimation {
  /**
   * 构造函数
   * @param {THREE.Scene} scene - Three.js场景
   * @param {Object} components - 组件对象集合
   * @param {Object} controllers - 控制器对象集合
   */
  constructor(scene, components, controllers) {
    console.log('DemoAnimation构造函数被调用');
    console.log('scene:', scene);
    console.log('components:', components);
    console.log('controllers:', controllers);
    
    this.scene = scene;
    this.components = components;
    this.controllers = controllers;
    
    this.isPlaying = false;
    this.currentStep = 0;
    this.animationSteps = [];
    this.particles = [];
    this.tweens = [];
    this.stepCallbacks = [];
    
    console.log('初始化动画步骤');
    // 初始化动画步骤
    this.initAnimationSteps();
    
    console.log('创建电子粒子材质');
    // 创建电子粒子材质
    this.particleMaterial = new THREE.MeshBasicMaterial({
      color: CONFIG.beam.color,
      transparent: true,
      opacity: CONFIG.demoAnimation.electronParticle.opacity
    });
    
    console.log('DemoAnimation构造函数完成');
  }
  
  /**
   * 初始化动画步骤
   */
  initAnimationSteps() {
    // 步骤1: 介绍阴极射线管
    this.animationSteps.push({
      title: '阴极射线管简介',
      description: '阴极射线管是一种真空电子管，利用电场控制电子束的偏转来显示图像。',
      duration: 3000,
      setup: () => {
        // 重置视图
        return this.resetView();
      }
    });
    
    // 步骤2: 电子枪发射电子
    this.animationSteps.push({
      title: '电子枪发射电子',
      description: '电子枪加热阴极，释放电子并加速形成电子束。',
      duration: 4000,
      setup: () => {
        // 聚焦到电子枪
        const focusPromise = this.focusOnComponent('gun');
        
        // 创建电子粒子动画
        setTimeout(() => {
          this.createElectronParticles(
            new THREE.Vector3(-4, 0, 0),
            new THREE.Vector3(-2.7, 0, 0),
            10,
            1500
          );
        }, 1000);
        
        return focusPromise;
      }
    });
    
    // 步骤3: 垂直偏转板
    this.animationSteps.push({
      title: '垂直偏转板',
      description: '垂直偏转板通过电压控制电子束在垂直方向上的偏转。',
      duration: 5000,
      setup: () => {
        // 聚焦到垂直偏转板
        const focusPromise = this.focusOnComponent('v1');
        
        // 模拟电压变化
        setTimeout(() => {
          // 设置垂直电压
          this.simulateVoltageChange('vertical', 3, 2000);
          
          // 创建电子粒子动画（从电子枪到偏转板）
          this.createElectronParticles(
            new THREE.Vector3(-2.7, 0, 0),
            new THREE.Vector3(-1.5, 0.6, 0),
            15,
            2500
          );
        }, 1000);
        
        return focusPromise;
      }
    });
    
    // 步骤4: 水平偏转板
    this.animationSteps.push({
      title: '水平偏转板',
      description: '水平偏转板通过电压控制电子束在水平方向上的偏转。',
      duration: 5000,
      setup: () => {
        // 聚焦到水平偏转板
        const focusPromise = this.focusOnComponent('h1');
        
        // 模拟电压变化
        setTimeout(() => {
          // 设置水平电压
          this.simulateVoltageChange('horizontal', 2, 2000);
          
          // 创建电子粒子动画（从垂直偏转板到水平偏转板）
          this.createElectronParticles(
            new THREE.Vector3(-1.5, 0.6, 0),
            new THREE.Vector3(-0.2, 0.6, 0.4),
            15,
            2500
          );
        }, 1000);
        
        return focusPromise;
      }
    });
    
    // 步骤5: 荧光屏显示
    this.animationSteps.push({
      title: '荧光屏显示',
      description: '电子束击中荧光屏上的荧光物质，产生可见光，形成图像。',
      duration: 5000,
      setup: () => {
        // 聚焦到荧光屏
        const focusPromise = this.focusOnComponent('screen');
        
        // 创建电子粒子动画（从水平偏转板到荧光屏）
        setTimeout(() => {
          this.createElectronParticles(
            new THREE.Vector3(-0.2, 0.6, 0.4),
            new THREE.Vector3(3, 0.6, 0.4),
            20,
            3000,
            () => {
              // 在荧光屏上创建光点
              if (this.controllers.screenController) {
                this.controllers.screenController.addGlowPoint(
                  new THREE.Vector3(3, 0.6, 0.4)
                );
              }
            }
          );
        }, 1000);
        
        return focusPromise;
      }
    });
    
    // 步骤6: 波形显示
    this.animationSteps.push({
      title: '波形显示',
      description: '通过改变偏转电压，可以在荧光屏上绘制各种波形。',
      duration: 8000,
      setup: () => {
        // 重置视图
        const resetPromise = this.resetView();
        
        // 启用波形
        setTimeout(() => {
          // 设置波形参数
          this.setWaveformParams({
            type: 'sine',
            frequency: 1,
            amplitude: 3,
            enabled: true
          });
          
          // 清除所有粒子
          this.clearAllParticles();
        }, 1000);
        
        return resetPromise;
      }
    });
    
    // 步骤7: 演示结束
    this.animationSteps.push({
      title: '演示结束',
      description: '阴极射线管是早期显示器的基础技术，为现代显示技术奠定了基础。',
      duration: 3000,
      setup: () => {
        // 重置所有参数
        this.resetAllParams();
        return Promise.resolve();
      }
    });
  }
  
  /**
   * 开始演示动画
   */
  start() {
    console.log('DemoAnimation.start被调用');
    console.log('this.isPlaying:', this.isPlaying);
    
    if (this.isPlaying) {
      console.log('演示已在播放中，返回');
      return;
    }
    
    this.isPlaying = true;
    this.currentStep = 0;
    
    console.log('保存原始参数');
    // 保存原始参数
    this.saveOriginalParams();
    
    console.log('开始第一步，调用playCurrentStep');
    // 开始第一步
    this.playCurrentStep();
  }
  
  /**
   * 停止演示动画
   */
  stop() {
    this.isPlaying = false;
    
    // 停止所有动画
    this.tweens.forEach(tween => tween.stop());
    this.tweens = [];
    
    // 清除所有粒子
    this.clearAllParticles();
    
    // 重置所有参数
    this.resetAllParams();
    
    // 清除所有回调
    this.stepCallbacks.forEach(callback => clearTimeout(callback));
    this.stepCallbacks = [];
  }
  
  /**
   * 播放当前步骤
   */
  playCurrentStep() {
    console.log('playCurrentStep被调用');
    console.log('this.isPlaying:', this.isPlaying);
    console.log('this.currentStep:', this.currentStep);
    console.log('this.animationSteps.length:', this.animationSteps.length);
    
    if (!this.isPlaying || this.currentStep >= this.animationSteps.length) {
      console.log('演示结束或已停止，调用stop');
      this.stop();
      return;
    }
    
    const step = this.animationSteps[this.currentStep];
    console.log('当前步骤:', step);
    
    // 触发步骤开始事件
    if (this.onStepStart) {
      console.log('触发步骤开始事件');
      this.onStepStart(this.currentStep, step);
    } else {
      console.log('onStepStart未设置');
    }
    
    // 设置步骤
    console.log('执行步骤setup');
    const setupPromise = step.setup ? step.setup() : Promise.resolve();
    
    // 步骤完成后，继续下一步
    setupPromise.then(() => {
      console.log('步骤setup完成，设置下一步定时器，持续时间:', step.duration);
      const callback = setTimeout(() => {
        console.log('定时器触发，进入下一步');
        this.currentStep++;
        this.playCurrentStep();
      }, step.duration);
      
      this.stepCallbacks.push(callback);
      console.log('定时器已添加到stepCallbacks');
    }).catch(error => {
      console.error('步骤setup出错:', error);
    });
  }
  
  /**
   * 聚焦到组件
   * @param {string} componentKey - 组件键名
   * @returns {Promise} 动画完成的Promise
   */
  focusOnComponent(componentKey) {
    return new Promise(resolve => {
      const component = this.components[componentKey];
      if (!component) {
        resolve();
        return;
      }
      
      // 计算目标位置
      const targetPosition = component.position.clone();
      const offset = new THREE.Vector3(
        CONFIG.demoAnimation.cameraOffset.x,
        CONFIG.demoAnimation.cameraOffset.y,
        CONFIG.demoAnimation.cameraOffset.z
      );
      
      // 创建相机位置动画
      const posTween = new TWEEN.Tween(this.controllers.camera.position)
        .to({
          x: targetPosition.x + offset.x,
          y: targetPosition.y + offset.y,
          z: targetPosition.z + offset.z
        }, CONFIG.demoAnimation.animationDuration)
        .easing(TWEEN.Easing.Cubic.InOut)
        .onComplete(resolve)
        .start();
      
      // 创建控制器目标点动画
      const targetTween = new TWEEN.Tween(this.controllers.controls.target)
        .to({
          x: targetPosition.x,
          y: targetPosition.y,
          z: targetPosition.z
        }, CONFIG.demoAnimation.animationDuration)
        .easing(TWEEN.Easing.Cubic.InOut)
        .start();
      
      this.tweens.push(posTween, targetTween);
    });
  }
  
  /**
   * 重置视图
   * @returns {Promise} 动画完成的Promise
   */
  resetView() {
    return new Promise(resolve => {
          // 重置相机位置
    const posTween = new TWEEN.Tween(this.controllers.camera.position)
      .to({ 
        x: CONFIG.camera.position.x, 
        y: CONFIG.camera.position.y, 
        z: CONFIG.camera.position.z 
      }, CONFIG.demoAnimation.animationDuration)
      .easing(TWEEN.Easing.Cubic.InOut)
      .onComplete(resolve)
      .start();
      
          // 重置控制器目标点
    const targetTween = new TWEEN.Tween(this.controllers.controls.target)
      .to({ 
        x: CONFIG.camera.target.x, 
        y: CONFIG.camera.target.y, 
        z: CONFIG.camera.target.z 
      }, CONFIG.demoAnimation.animationDuration)
      .easing(TWEEN.Easing.Cubic.InOut)
      .start();
      
      this.tweens.push(posTween, targetTween);
    });
  }
  
  /**
   * 创建电子粒子
   * @param {THREE.Vector3} startPos - 起始位置
   * @param {THREE.Vector3} endPos - 结束位置
   * @param {number} count - 粒子数量
   * @param {number} duration - 动画持续时间
   * @param {Function} onComplete - 完成回调
   */
  createElectronParticles(startPos, endPos, count = 10, duration = 2000, onComplete = null) {
    for (let i = 0; i < count; i++) {
      // 创建电子粒子
      const geometry = new THREE.SphereGeometry(CONFIG.demoAnimation.electronParticle.size, 8, 8);
      const particle = new THREE.Mesh(geometry, this.particleMaterial.clone());
      
      // 设置初始位置
      particle.position.copy(startPos);
      
      // 添加到场景
      this.scene.add(particle);
      this.particles.push(particle);
      
      // 创建动画
      const delay = (i / count) * duration;
      const tween = new TWEEN.Tween(particle.position)
        .to({
          x: endPos.x,
          y: endPos.y,
          z: endPos.z
        }, duration)
        .delay(delay)
        .easing(TWEEN.Easing.Linear.None)
        .onComplete(() => {
          // 最后一个粒子完成时触发回调
          if (i === count - 1 && onComplete) {
            onComplete();
          }
          
          // 从场景中移除粒子
          setTimeout(() => {
            this.scene.remove(particle);
            const index = this.particles.indexOf(particle);
            if (index !== -1) {
              this.particles.splice(index, 1);
            }
            geometry.dispose();
            particle.material.dispose();
          }, 100);
        })
        .start();
      
      this.tweens.push(tween);
    }
  }
  
  /**
   * 模拟电压变化
   * @param {string} direction - 方向（'horizontal' 或 'vertical'）
   * @param {number} targetVoltage - 目标电压
   * @param {number} duration - 动画持续时间
   */
  simulateVoltageChange(direction, targetVoltage, duration = 1000) {
    const deflection = CONFIG.deflection[direction];
    if (!deflection) return;
    
    // 创建电压变化动画
    const tween = new TWEEN.Tween({ voltage: deflection.voltage })
      .to({ voltage: targetVoltage }, duration)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate(obj => {
        // 更新电压值
        deflection.voltage = obj.voltage;
        
        // 更新电子束
        if (this.controllers.onDeflectionChange) {
          this.controllers.onDeflectionChange(CONFIG.deflection);
        }
      })
      .start();
    
    this.tweens.push(tween);
  }
  
  /**
   * 设置波形参数
   * @param {Object} params - 波形参数
   */
  setWaveformParams(params) {
    Object.assign(CONFIG.waveform, params);
    
    // 更新波形
    if (this.controllers.onWaveformChange) {
      this.controllers.onWaveformChange(CONFIG.waveform);
    }
  }
  
  /**
   * 保存原始参数
   */
  saveOriginalParams() {
    this.originalParams = {
      deflection: {
        horizontal: { voltage: CONFIG.deflection.horizontal.voltage },
        vertical: { voltage: CONFIG.deflection.vertical.voltage }
      },
      waveform: { ...CONFIG.waveform }
    };
  }
  
  /**
   * 重置所有参数
   */
  resetAllParams() {
    if (!this.originalParams) return;
    
    // 恢复偏转参数
    CONFIG.deflection.horizontal.voltage = this.originalParams.deflection.horizontal.voltage;
    CONFIG.deflection.vertical.voltage = this.originalParams.deflection.vertical.voltage;
    
    // 恢复波形参数
    Object.assign(CONFIG.waveform, this.originalParams.waveform);
    
    // 更新控制器
    if (this.controllers.onDeflectionChange) {
      this.controllers.onDeflectionChange(CONFIG.deflection);
    }
    
    if (this.controllers.onWaveformChange) {
      this.controllers.onWaveformChange(CONFIG.waveform);
    }
  }
  
  /**
   * 清除所有粒子
   */
  clearAllParticles() {
    this.particles.forEach(particle => {
      this.scene.remove(particle);
      particle.geometry.dispose();
      particle.material.dispose();
    });
    this.particles = [];
  }
  
  /**
   * 更新动画
   */
  update() {
    // 更新所有tweens
    this.tweens.forEach(tween => {
      if (tween && tween.isPlaying) {
        tween.update();
      }
    });
    
    // 清理已完成的tweens
    this.tweens = this.tweens.filter(tween => tween && tween.isPlaying);
    
    // 更新TWEEN
    TWEEN.update();
  }
} 