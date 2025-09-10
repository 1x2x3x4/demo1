// ===== 基础导入 =====
import * as THREE from 'three'; // 三维库
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'; // 轨道控制器
import * as TWEEN from '@tweenjs/tween.js'; // 动画库

// ===== 导入 switcher 模块（ES6 导入，并在 DOM 就绪后初始化） =====
import { renderSwitcher } from '../src/widgets/switcher.js';


// ===== 导入自定义模块 =====
import { CONFIG } from './config';  // 配置文件
import { GuiController } from './controllers/GuiController';  // GUI控制器
import { UIController } from './controllers/UIController';  // UI控制器
import { WaveformGenerator } from './components/WaveformGenerator';  // 波形生成器
import { ElectronBeam } from './components/ElectronBeam';  // 电子束
import { Screen } from './components/Screen';  // 荧光屏
import { LabelSystem } from './components/LabelSystem';  // 标签系统
import { ExplodedView } from './components/ExplodedView';  // 分解视图
import { DemoAnimation } from './components/DemoAnimation';  // 演示动画

// ===== 全局变量 =====
let scene, camera, renderer, controls;  // 场景、相机、渲染器、控制器
let electronBeam, waveformGenerator, screenController;  // 电子束、波形生成器、荧光屏控制器
let guiController, uiController;  // GUI控制器、UI控制器
let labelSystem, explodedView, demoAnimation;  // 标签系统、分解视图、演示动画
let dynamicGlowPoint;  // 动态光点（跟随电子束击中位置）

// ===== 场景对象引用 =====
let gun, gunHead, v1, v2, h1, h2, screen;  // 电子枪、电子枪头、垂直偏转板、水平偏转板、荧光屏    

// ===== 初始化函数 =====
function init() {
  console.log('初始化应用...');
  initScene(); // 初始化场景
  initCamera(); // 初始化相机
  initRenderer(); // 初始化渲染器
  initControls(); // 初始化控制器
  initLights(); // 初始化光源
  initGrid(); // 初始化网格
  initComponents(); // 初始化组件
  console.log('初始化标签系统...');
  initLabelSystem(); // 初始化标签系统
  console.log('初始化分解视图...');
  initExplodedView(); // 初始化分解视图
  console.log('初始化演示动画...');
  initDemoAnimation(); // 初始化演示动画
  console.log('初始化GUI...');
  initGui(); // 初始化GUI
  console.log('初始化UI控制器...');
  initUIController(); // 初始化UI控制器
  
  // 初始化波形显示
  updateScreenWaveform();
  
  // 开始动画循环
  animate(); // 开始动画循环
  
  // 窗口自适应
  window.addEventListener('resize', onWindowResize);   // 窗口大小调整事件监听
  
  console.log('应用初始化完成');
}

// ===== 场景初始化 =====
function initScene() {
  scene = new THREE.Scene(); // 创建场景
  scene.background = new THREE.Color(CONFIG.scene.background); // 设置场景背景颜色
}

// ===== 相机初始化 =====
function initCamera() {
  camera = new THREE.PerspectiveCamera( // 透视相机
    CONFIG.camera.fov, // 视角
    window.innerWidth / window.innerHeight, // 宽高比
    CONFIG.camera.near, // 近截面
    CONFIG.camera.far // 远截面
  );
  camera.position.set(CONFIG.camera.position.x, CONFIG.camera.position.y, CONFIG.camera.position.z); // 设置相机位置
}

// ===== 渲染器初始化 =====
function initRenderer() {
  renderer = new THREE.WebGLRenderer({ antialias: true }); // 创建渲染器
  renderer.setSize(window.innerWidth, window.innerHeight); // 设置渲染器大小
  document.body.appendChild(renderer.domElement); // 将渲染器添加到文档中
}

// ===== 控制器初始化 =====
function initControls() { 
  controls = new OrbitControls(camera, renderer.domElement); // 创建控制器
  controls.enableDamping = true; // 启用阻尼
}

// ===== 光源初始化 =====
function initLights() { 
  scene.add(new THREE.AmbientLight(0xffffff, 0.6)); // 添加环境光
  const pl = new THREE.PointLight(0xffffff, 0.8); // 创建点光源
  pl.position.set(10, 10, 10); // 设置光源位置
  scene.add(pl); // 将光源添加到场景中
}

// ===== 网格地面初始化 =====
function initGrid() {
  const grid = new THREE.GridHelper(
    CONFIG.scene.grid.size, 
    CONFIG.scene.grid.divisions, 
    CONFIG.scene.grid.color1, 
    CONFIG.scene.grid.color2
  ); // 创建网格
  grid.position.set(
    CONFIG.scene.grid.position.x, 
    CONFIG.scene.grid.position.y, 
    CONFIG.scene.grid.position.z
  ); // 设置网格位置
  scene.add(grid); // 将网格添加到场景中
}

// ===== 组件初始化 =====
function initComponents() {
  // 材质定义
  const metalMat = new THREE.MeshStandardMaterial({
    color: CONFIG.materials.metal.color, // 颜色
    metalness: CONFIG.materials.metal.metalness, // 金属度
    roughness: CONFIG.materials.metal.roughness, // 粗糙度
  });

  const plateMat = new THREE.MeshStandardMaterial({
    color: CONFIG.materials.plate.color, // 颜色
    metalness: CONFIG.materials.plate.metalness, // 金属度
    roughness: CONFIG.materials.plate.roughness, // 粗糙度
  });

  const screenMat = new THREE.MeshStandardMaterial({
    color: CONFIG.materials.screen.color, // 颜色
    emissive: CONFIG.screen.color, // 发射颜色
    emissiveIntensity: CONFIG.screen.intensity, // 发射强度
    roughness: CONFIG.materials.screen.roughness, // 粗糙度
    side: THREE.DoubleSide, // 双面渲染
  });
 
  // 创建屏幕中心的光点材质
  const glowPointMat = new THREE.MeshBasicMaterial({
    color: CONFIG.dotLight.color,
    transparent: true,
    opacity: CONFIG.materials.glow.opacity,
  });

  // 电子枪
  gun = new THREE.Mesh(
    new THREE.CylinderGeometry(CONFIG.components.gun.radius, 0.3, CONFIG.components.gun.height, 32),
    metalMat
  );
  gun.rotation.z = Math.PI / 2;
  gun.position.set(CONFIG.components.gun.position.x, CONFIG.components.gun.position.y, CONFIG.components.gun.position.z);
  scene.add(gun);

  gunHead = new THREE.Mesh(
    new THREE.CylinderGeometry(CONFIG.components.gunHead.radius, CONFIG.components.gunHead.radius, CONFIG.components.gunHead.height, 32),
    metalMat
  );
  gunHead.rotation.z = Math.PI / 2;
  gunHead.position.set(CONFIG.components.gunHead.position.x, CONFIG.components.gunHead.position.y, CONFIG.components.gunHead.position.z);
  scene.add(gunHead);

  // 垂直偏转板
  const vGeom = new THREE.BoxGeometry(CONFIG.components.verticalPlates.width, CONFIG.components.verticalPlates.height, CONFIG.components.verticalPlates.depth);
  v1 = new THREE.Mesh(vGeom, plateMat);
  v2 = v1.clone();

  v1.rotation.x = Math.PI / 2;
  v2.rotation.x = Math.PI / 2;
  // 再绕 Z 轴 90°
  v1.rotation.y += Math.PI / 2;
  v2.rotation.y += Math.PI / 2;

  v1.position.set(CONFIG.components.verticalPlates.positions[0].x, CONFIG.components.verticalPlates.positions[0].y, CONFIG.components.verticalPlates.positions[0].z);
  v2.position.set(CONFIG.components.verticalPlates.positions[1].x, CONFIG.components.verticalPlates.positions[1].y, CONFIG.components.verticalPlates.positions[1].z);
  scene.add(v1, v2);

  // 水平偏转板
  const hGeom = new THREE.BoxGeometry(CONFIG.components.horizontalPlates.width, CONFIG.components.horizontalPlates.height, CONFIG.components.horizontalPlates.depth);
  h1 = new THREE.Mesh(hGeom, plateMat);
  h2 = h1.clone();

  h1.rotation.x = -Math.PI / 2;
  h2.rotation.x = -Math.PI / 2;

  h1.position.set(CONFIG.components.horizontalPlates.positions[0].x, CONFIG.components.horizontalPlates.positions[0].y, CONFIG.components.horizontalPlates.positions[0].z);
  h2.position.set(CONFIG.components.horizontalPlates.positions[1].x, CONFIG.components.horizontalPlates.positions[1].y, CONFIG.components.horizontalPlates.positions[1].z);
  scene.add(h1, h2);

  // 荧光屏
  screen = new THREE.Mesh(new THREE.PlaneGeometry(CONFIG.components.screen.width, CONFIG.components.screen.height), screenMat); // 创建荧光屏
  screen.position.set(CONFIG.components.screen.position.x, CONFIG.components.screen.position.y, CONFIG.components.screen.position.z); // 设置荧光屏位置
  screen.rotation.y = -Math.PI / 2; // 设置荧光屏旋转
  scene.add(screen); // 将荧光屏添加到场景中
   
  // 创建动态光点（跟随电子束击中位置）
  const dynamicGlowGeometry = new THREE.SphereGeometry(CONFIG.components.dynamicGlow.radius, 16, 16);
  dynamicGlowPoint = new THREE.Mesh(dynamicGlowGeometry, glowPointMat);
  // 初始位置设为屏幕中心
  dynamicGlowPoint.position.set(CONFIG.components.screen.position.x, CONFIG.components.screen.position.y, CONFIG.components.screen.position.z);
  scene.add(dynamicGlowPoint);
  
  // 初始化电子束控制器
  electronBeam = new ElectronBeam(scene);
  
  // 初始化波形生成器
  waveformGenerator = new WaveformGenerator();
  
  // 初始化荧光屏控制器
  screenController = new Screen(scene, screen);
}

// ===== 标签系统初始化 =====
function initLabelSystem() {
  // 创建标签系统
  labelSystem = new LabelSystem(scene, document.body);
  
  // 为各组件添加标签
  const componentLabels = [
    { id: 'gun', target: gun, text: CONFIG.descriptions.gun.name, offset: new THREE.Vector3(0, 0.5, 0), description: CONFIG.descriptions.gun.description },
    { id: 'gunHead', target: gunHead, text: CONFIG.descriptions.gunHead.name, offset: new THREE.Vector3(0, 0.3, 0), description: CONFIG.descriptions.gunHead.description },
    { id: 'v1', target: v1, text: CONFIG.descriptions.v1.name, offset: new THREE.Vector3(0, 0.3, 0), description: CONFIG.descriptions.v1.description },
    { id: 'v2', target: v2, text: CONFIG.descriptions.v2.name, offset: new THREE.Vector3(0, -0.3, 0), description: CONFIG.descriptions.v2.description },
    { id: 'h1', target: h1, text: CONFIG.descriptions.h1.name, offset: new THREE.Vector3(0, 0, 0.3), description: CONFIG.descriptions.h1.description },
    { id: 'h2', target: h2, text: CONFIG.descriptions.h2.name, offset: new THREE.Vector3(0, 0, -0.3), description: CONFIG.descriptions.h2.description },
    { id: 'screen', target: screen, text: CONFIG.descriptions.screen.name, offset: new THREE.Vector3(0.1, 0.5, 0), description: CONFIG.descriptions.screen.description }
  ];
  
  // 创建标签
  componentLabels.forEach(label => {
    labelSystem.createLabel(label.id, label.text, label.target, label.offset, label.description);
  });
}

// ===== 分解视图初始化 =====
function initExplodedView() {
  // 创建分解视图控制器
  explodedView = new ExplodedView({
    gun,
    gunHead,
    v1,
    v2,
    h1,
    h2,
    screen
  });
}

// ===== 演示动画初始化 =====
function initDemoAnimation() {
  // 创建演示动画控制器
  demoAnimation = new DemoAnimation(
    scene,
    {
      gun,
      gunHead,
      v1,
      v2,
      h1,
      h2,
      screen
    },
    {
      camera,
      controls,
      screenController,
      onDeflectionChange: (deflectionParams) => {
        updateElectronBeam();
      },
      onWaveformChange: (waveformParams) => {
        updateElectronBeam();
        updateScreenWaveform();
      }
    }
  );
}

// ===== GUI初始化 =====
function initGui() {
  guiController = new GuiController({
    onBeamChange: (beamParams) => {
      electronBeam.updateMaterial();
    },
    onDeflectionChange: (deflectionParams) => {
      updateElectronBeam();
    },
    onWaveformChange: (waveformParams) => {
      // 波形参数变化时，需要更新电子束
      updateElectronBeam();
      // 同时更新荧光屏上的波形显示
      updateScreenWaveform();
    },
    onScreenChange: (screenParams) => {
      screenController.updateMaterial();
      // 更新动态光点颜色
      if (dynamicGlowPoint) {
        dynamicGlowPoint.material.color.set(CONFIG.dotLight.color);
      }
    }
  });
}

// ===== UI控制器初始化 =====
function initUIController() {
  // 创建UI控制器
  uiController = new UIController({
    components: {
      gun,
      gunHead,
      v1,
      v2,
      h1,
      h2,
      screen
    },
    controllers: {
      camera,
      controls,
      labelSystem,
      explodedView,
      demoAnimation,
      screenController,
      onDeflectionChange: (deflectionParams) => {
        updateElectronBeam();
      },
      onWaveformChange: (waveformParams) => {
        updateElectronBeam();
        updateScreenWaveform();
      }
    }
  });
}

// ===== 更新电子束 =====
function updateElectronBeam() {
  let deflectionParams;
  
  // 如果波形启用，计算波形产生的偏转电压
  if (CONFIG.waveform.enabled) {
    const deflectionVoltage = waveformGenerator.calculateDeflectionVoltage(
      CONFIG.waveform,
      CONFIG.deflection
    );
    deflectionParams = {
      horizontal: { voltage: deflectionVoltage.horizontal },
      vertical: { voltage: deflectionVoltage.vertical }
    };
  } else {
    // 直接使用控制面板上的电压值
    deflectionParams = CONFIG.deflection;
  }
  
  // 更新电子束路径
  electronBeam.updateBeamPath(deflectionParams);
  
  // 更新荧光屏和动态光点
  updateScreenAndGlowPoint();
}

/**
 * 更新荧光屏波形显示
 */
function updateScreenWaveform() {
  if (screenController && CONFIG.waveform.enabled) {
    // 将GUI参数同步到Screen.js
    screenController.setWaveformType(CONFIG.waveform.type);
    screenController.setFrequency(CONFIG.waveform.frequency);
    screenController.setAmplitude(CONFIG.waveform.amplitude);
    screenController.setPhase(CONFIG.waveform.phase);
    
    // 显示波形
    screenController.showWaveform(true);
    
    // 如果启用了动画，开始波形动画
    if (!screenController.isWaveformAnimating) {
      screenController.startWaveformAnimation();
    }
  } else if (screenController) {
    // 隐藏波形
    screenController.showWaveform(false);
    screenController.stopWaveformAnimation();
  }
}

/**
 * 更新荧光屏和动态光点
 */
function updateScreenAndGlowPoint() {
  const lastBeamPoint = electronBeam.beamPoints[electronBeam.beamPoints.length - 1];
  
  // 更新荧光屏上的点
  screenController.addGlowPoint(lastBeamPoint);
  
  // 更新动态光点位置到电子束击中位置
  if (dynamicGlowPoint) {
    dynamicGlowPoint.position.copy(lastBeamPoint);
    // 确保光点在屏幕前面一点点，避免z-fighting
    const zFightingOffset = CONFIG.electronBeam.zFightingOffset;
    dynamicGlowPoint.position.x = CONFIG.components.screen.position.x - zFightingOffset;
  }
}

// ===== 窗口大小调整 =====
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  
  // 更新标签系统
  if (labelSystem) {
    labelSystem.resize(window.innerWidth, window.innerHeight);
  }
  
  // 更新UI控制器
  if (uiController) {
    uiController.resize(window.innerWidth, window.innerHeight);
  }
}

// ===== 动画循环 =====
function animate(timestamp) {
  requestAnimationFrame(animate);
  
  // 更新控制器
  controls.update();
  
  // 更新波形生成器
  waveformGenerator.update(timestamp);
  
  // 如果波形启用，更新电子束
  if (CONFIG.waveform.enabled) {
    updateElectronBeam();
  }
  
  // 更新荧光屏效果
  screenController.update();
  
  // 更新动态光点的脉冲效果
  if (dynamicGlowPoint) {
    // 创建脉冲效果 - 使用正弦波使光点大小和亮度呼吸
    const pulse = Math.sin(timestamp * 0.003) * 0.2 + 0.8;
    dynamicGlowPoint.scale.set(pulse, pulse, pulse);
    dynamicGlowPoint.material.opacity = pulse * 0.8;
  }
  
  // 更新分解视图
  if (explodedView) {
    explodedView.update();
  }
  
  // 更新演示动画
  if (demoAnimation) {
    demoAnimation.update();
  }
  
  // 更新标签系统
  if (labelSystem) {
    labelSystem.update(camera);
  }
  
  // 更新TWEEN
  TWEEN.update();
  
  // 渲染场景
  renderer.render(scene, camera);
}

// ===== 启动应用 =====
init();

// ===== 初始化右上角切换控件（内部页） =====
const bootInternalSwitcher = () => {
  if (typeof document !== 'undefined') {
    renderSwitcher('internal');
  }
};
if (typeof document !== 'undefined' && document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootInternalSwitcher);
} else {
  bootInternalSwitcher();
}

