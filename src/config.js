// 配置参数
export const CONFIG = {
  // 电子束参数
  beam: {
    intensity: 0.8,  // 电子束强度
    color: 0xffff00  // 电子束颜色
  },
  
  // 偏转板参数
  deflection: {
    horizontal: {
      voltage: 0,     // 水平偏转电压 (-5V ~ 5V)
      maxDeflection: 2.0  // 最大偏转距离
    },
    vertical: {
      voltage: 0,     // 垂直偏转电压 (-5V ~ 5V)
      maxDeflection: 1.5  // 最大偏转距离
    }
  },
  
  // 波形参数
  waveform: {
    type: 'sine',    // 波形类型: sine, square, sawtooth, triangle
    frequency: 1,    // 频率 (Hz)
    amplitude: 2,    // 振幅
    phase: 0,        // 相位
    enabled: false   // 是否启用波形
  },
  
  // 荧光屏参数
  screen: {
    persistence: 0.95,  // 余辉持续时间 (0-1)
    color: 0x0,    // 荧光颜色
    intensity: 0.6,     // 发光强度
    gridColor: 0x666666,  // 网格颜色
    gridSpacing: 0.5,     // 网格间距
    gridOpacity: 0.3      // 网格透明度
  },
  
  // 中心光点参数
  dotLight: {
    color: 0xffff00,    // 荧光颜色
  },
  
  // 相机配置
  camera: {
    fov: 45,                    // 视角
    near: 0.1,                  // 近截面
    far: 1000,                  // 远截面
    position: { x: 6, y: 4, z: 10 },  // 初始位置
    target: { x: 0, y: 0, z: 0 }      // 目标点
  },
  
  // 场景配置
  scene: {
    background: 0x20232a,       // 背景颜色
    grid: {
      size: 20,                 // 网格大小
      divisions: 40,            // 网格分割数
      color1: 0x4a4a4a,        // 主网格线颜色
      color2: 0x2f2f2f,        // 次网格线颜色
      position: { x: 0, y: -1.6, z: 0 }  // 网格位置
    }
  },
  
  // 材质配置
  materials: {
    metal: {
      color: 0xb0b0b0,         // 金属颜色
      metalness: 0.9,          // 金属度
      roughness: 0.2           // 粗糙度
    },
    plate: {
      color: 0x1e88e5,         // 偏转板颜色
      metalness: 0.05,         // 金属度
      roughness: 0.7           // 粗糙度
    },
    screen: {
      color: 0x001a00,         // 荧光屏基础颜色
      roughness: 0.4,          // 粗糙度
      side: 'DoubleSide'       // 渲染面
    },
    glow: {
      opacity: 0.8,            // 发光点透明度
      size: 0.05               // 发光点尺寸
    }
  },
  
  // 组件几何配置
  components: {
    gun: {
      radius: 0.15,            // 电子枪半径
      height: 2,               // 电子枪高度
      position: { x: -4, y: 0, z: 0 }  // 位置
    },
    gunHead: {
      radius: 0.1,             // 电子枪头半径
      height: 0.4,             // 电子枪头高度
      position: { x: -2.9, y: 0, z: 0 }  // 位置
    },
    verticalPlates: {
      width: 0.05,             // 垂直偏转板宽度
      height: 1.5,             // 垂直偏转板高度
      depth: 1,                // 垂直偏转板深度
      positions: [
        { x: -1.5, y: 0.8, z: 0 },   // 上板位置
        { x: -1.5, y: -0.8, z: 0 }   // 下板位置
      ]
    },
    horizontalPlates: {
      width: 1.5,              // 水平偏转板宽度
      height: 0.05,            // 水平偏转板高度
      depth: 1,                // 水平偏转板深度
      positions: [
        { x: -0.2, y: 0, z: 0.55 },  // 左板位置
        { x: -0.2, y: 0, z: -0.55 }  // 右板位置
      ]
    },
    screen: {
      width: 4,                // 荧光屏宽度
      height: 3,               // 荧光屏高度
      position: { x: 3, y: 0, z: 0 }  // 位置
    },
    dynamicGlow: {
      radius: 0.08,            // 动态光点半径
      position: { x: 2.95, y: 0, z: 0 }  // 初始位置
    }
  },
  
  // 电子束配置
  electronBeam: {
    pathPoints: [
      { x: -2.7, y: 0, z: 0 },    // 电子枪出口
      { x: -1.5, y: 0, z: 0 },    // 垂直偏转板入口
      { x: -0.2, y: 0, z: 0 },    // 水平偏转板入口
      { x: 3, y: 0, z: 0 }        // 荧光屏
    ],
    trace: {
      maxPoints: 100,             // 最大轨迹点数
      opacity: 0.3                // 轨迹透明度
    },
    parabolicSegments: 15,        // 抛物线轨迹段数
    trajectorySmoothing: 0.8,     // 轨迹平滑度
    linearSegments: {
      gunToVerticalPlate: 3,      // 电子枪到垂直偏转板段数
      betweenPlates: 3,           // 极板之间段数
      plateToScreen: 5            // 极板到荧光屏段数
    },
    voltageScalingFactor: 5,      // 电压缩放因子
    zFightingOffset: 0.05,        // Z-fighting偏移量
    screenOffset: 0.01            // 屏幕偏移量
  },
  
  // 荧光屏效果配置
  screenEffects: {
    maxGlowPoints: 200,           // 最大荧光点数
    glowPointSize: 0.05,          // 荧光点尺寸
    fadeRate: 10,                 // 淡出速率
    minOpacity: 0.05              // 最小透明度
  },
  
  // 分解视图配置
  explodedView: {
    explodeFactor: 1.5,           // 分解因子
    animationDuration: 1000,      // 动画持续时间
    cameraOffset: { x: 3, y: 2, z: 3}  // 相机偏移量
  },
  
  // 演示动画配置
  demoAnimation: {
    electronParticle: {
      size: 0.03,                 // 电子粒子尺寸
      opacity: 0.8                // 电子粒子透明度
    },
    cameraOffset: { x: 3, y: 2, z: 3 },  // 相机偏移量
    animationDuration: 1500       // 动画持续时间
  },
  
  // UI配置
  ui: {
    controlPanel: {
      position: { bottom: '20px', right: '20px' },
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      borderRadius: '8px',
      padding: '10px',
      zIndex: 100
    },
    demoPanel: {
      position: { top: '20px', left: '20px' },
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      borderRadius: '8px',
      padding: '15px',
      maxWidth: '300px',
      zIndex: 100
    },
    button: {
      backgroundColor: '#2196F3',
      hoverColor: '#0b7dda',
      activeColor: '#4CAF50',
      warningColor: '#f44336',
      padding: '8px 12px',
      borderRadius: '4px'
    }
  },
  
  // 标签系统配置
  labelSystem: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    color: 'white',
    padding: '2px 6px',
    borderRadius: '3px',
    fontSize: '12px',
    descriptionPanel: {
      position: { bottom: '20px', left: '20px' },
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      maxWidth: '400px',
      zIndex: 1000
    }
  },
  
  // 组件描述信息
  descriptions: {
    gun: {
      name: '电子枪',
      description: '电子枪是阴极射线管的核心部件，负责产生并加速电子束。它由加热的阴极（负极）和带正电的阳极组成，电子从阴极释放后被阳极加速，形成高速电子束。'
    },
    gunHead: {
      name: '电子枪出口',
      description: '电子枪出口是电子束离开电子枪进入偏转系统的位置。在这里，电子束被聚焦成一个细小的光点，准备接受后续的偏转控制。'
    },
    v1: {
      name: '垂直偏转板（上）',
      description: '垂直偏转板是一对带电平行板，用于控制电子束在垂直方向上的偏转。当上下偏转板之间施加电压时，电子束会受到垂直方向的电场力，导致在垂直方向上偏转。'
    },
    v2: {
      name: '垂直偏转板（下）',
      description: '垂直偏转板的下板，与上板形成电场。通过调整两板之间的电压，可以控制电子束向上或向下偏转的程度。'
    },
    h1: {
      name: '水平偏转板（左）',
      description: '水平偏转板是一对带电平行板，用于控制电子束在水平方向上的偏转。当左右偏转板之间施加电压时，电子束会受到水平方向的电场力，导致在水平方向上偏转。'
    },
    h2: {
      name: '水平偏转板（右）',
      description: '水平偏转板的右板，与左板形成电场。通过调整两板之间的电压，可以控制电子束向左或向右偏转的程度。'
    },
    screen: {
      name: '荧光屏',
      description: '荧光屏是涂有荧光物质的平板，当高速电子束击中荧光屏时，荧光物质会发光，形成可见的光点。通过控制电子束的偏转，可以在荧光屏上绘制各种图形和波形。'
    }
  }
};

// 波形类型选项
export const WAVEFORM_TYPES = {
  sine: '正弦波',
  square: '方波',
  sawtooth: '锯齿波',
  triangle: '三角波'
}; 