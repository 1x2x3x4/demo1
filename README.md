# 🔬 示波器仿真系统 (Oscilloscope Simulator)

基于WebGL的智能示波器交互式虚拟仿真系统  
🖥️ **支持Web浏览器和桌面应用双模式运行**

## ✨ 项目特色

### 🎯 多重体验模式
- **📊 标准示波器界面**：完整复现真实示波器的操作面板和功能
- **🔍 3D内部结构**：深入展示阴极射线管（CRT）的工作原理和电子束轨迹
- **🖥️ 桌面应用版本**：基于Electron的独立桌面应用，无需浏览器即可运行
- **🌐 Web版本**：支持现代浏览器，随时随地访问

### 🎓 教学导向设计
- **自检校准流程**：模拟真实示波器的校准过程
- **分步实验指导**：从校准到标准测量的完整实验流程
- **可视化学习**：通过3D动画理解示波器工作原理

## 🚀 核心功能

### 📈 波形生成与显示
- **多种波形类型**：正弦波、方波、三角波、锯齿波、噪声、脉冲波
- **双通道支持**：独立的通道1和通道2，支持多种显示模式
- **实时参数调节**：频率、幅度、相位的实时调整
- **李萨如图形**：X-Y模式下生成复杂的李萨如图案

### ⚙️ 专业示波器功能
- **触发系统**：自动/手动触发，上升/下降沿检测
- **时间基准**：可调时间分度（Time/Div）
- **电压标度**：独立的通道电压分度（Volts/Div）
- **显示模式**：独立显示、同向叠加、垂直叠加

### 🔧 校准与测量
- **自检校准**：模拟真实示波器的校准流程
- **微调系统**：精密的显示调整因子
- **校准状态监控**：实时显示校准偏差和建议
- **参数保存**：校准参数的保存和恢复

### 🎮 3D可视化（内部原理）
- **电子枪模拟**：电子束发射和聚焦过程
- **偏转板系统**：垂直和水平偏转的3D展示
- **荧光屏效果**：电子束撞击后的发光轨迹和余晖
- **分解视图**：组件分解动画，便于理解内部结构
- **交互标签**：3D标签系统，详细介绍各组件功能

### 🎪 交互式教学工具
- **演示动画**：自动演示示波器各项功能
- **导览系统**：内置的功能介绍和使用指南
- **参数预设**：快速切换到典型的测量场景

## 🛠️ 技术架构

### 前端技术栈
- **Vue.js 2.7.16**：响应式用户界面框架
- **Three.js 0.177.0**：3D图形渲染和动画
- **dat.GUI 0.7.9**：参数控制面板
- **Tween.js 25.0.0**：流畅的动画过渡效果

### 桌面应用技术
- **Electron 33.0.2**：跨平台桌面应用框架
- **Electron Builder**：自动化打包和分发
- **Windows/macOS/Linux**：支持三大主流操作系统

### 构建工具
- **Webpack 5**：模块打包和构建
- **Babel**：ES6+代码转译
- **CSS Loader**：样式处理
- **热重载**：开发时的实时更新

### 代码架构
- **模块化设计**：清晰的功能模块分离
- **状态管理**：统一的示波器状态管理系统
- **组件化开发**：可复用的UI和功能组件

## 📦 快速开始

### 环境要求
- Node.js 14+ 
- npm 6+
- 现代浏览器（支持WebGL）

### 安装依赖
```bash
npm install
```

### 开发模式

#### Web开发模式
```bash
npm run dev
# 或
npm start
```
访问 http://localhost:8081 查看示波器界面

#### Electron开发模式
```bash
npm run electron:dev
```
自动启动Web服务器并打开Electron窗口

### 生产构建

#### Web版本构建
```bash
npm run build
```
构建文件将输出到 `docs/` 目录

#### 桌面应用构建
```bash
npm run electron:build         # 构建当前平台
npm run electron:build-win     # 构建Windows版本  
npm run electron:build-mac     # 构建macOS版本
npm run electron:build-linux   # 构建Linux版本
npm run electron:build-all     # 构建所有平台版本
```
打包后的应用将输出到 `dist/` 目录

### 直接使用

#### Web版本
无需服务器环境，可直接打开构建后的HTML文件：
- `docs/index.html` - 主要示波器界面
- `docs/internal.html` - 3D内部结构展示

#### 桌面应用版本
运行打包后的可执行文件：
- **Windows**: `dist/示波器仿真系统 Setup 1.0.0.exe`
- **macOS**: `dist/示波器仿真系统-1.0.0.dmg`
- **Linux**: `dist/示波器仿真系统-1.0.0.AppImage`

## 🎯 使用指南

### 1. 自检校准模式
1. **启动应用**：首次进入自动进入校准模式
2. **观察波形**：系统显示固定的1Hz方波信号（4Vpp）
3. **调整参数**：使用时间和电压微调控制
4. **达成校准**：调整至校准因子接近1.0

### 2. 标准测量模式
1. **切换模式**：点击"标准测量"按钮
2. **选择波形**：从6种波形类型中选择
3. **激活通道**：开启需要的测量通道
4. **参数设置**：调整频率、幅度等参数
5. **观察结果**：实时查看波形变化

### 3. 李萨如图形
1. **选择模式**：切换到X-Y显示模式
2. **设置频率**：为X、Y轴设置不同频率
3. **调整相位**：通过相位差产生不同图案
4. **观察图形**：欣赏复杂的李萨如图案

### 4. 3D内部原理
1. **打开内部视图**：访问 `internal.html`
2. **控制视角**：使用鼠标旋转、缩放视图
3. **组件标签**：悬停查看各组件详细信息
4. **分解动画**：观看示波器内部结构分解过程

## 📁 项目结构

```
demo1/
├── 📁 assets/                 # 应用资源
│   └── 📁 icons/              # 应用图标文件
│       ├── icon.ico           # Windows图标
│       ├── icon.png           # 通用图标
│       └── icon-*.png         # 多尺寸图标
├── 📁 CDN/                    # 第三方库CDN版本
│   └── vue.min.js
├── 📁 dist/                   # 桌面应用打包输出
│   ├── win-unpacked/          # Windows解包版本
│   ├── *.exe                  # Windows安装包
│   ├── *.dmg                  # macOS安装包
│   └── *.AppImage             # Linux应用包
├── 📁 docs/                   # Web版本构建输出
│   ├── 📁 js/                 # JavaScript bundles
│   ├── 📁 css/                # 样式文件
│   ├── 📁 assets/             # 静态资源
│   ├── index.html             # 主界面
│   └── internal.html          # 3D内部视图
├── 📁 packaging/              # Electron打包配置
│   ├── electron-main.js       # Electron主进程
│   ├── electron-builder.yml   # 打包配置
│   ├── build.js               # 构建脚本
│   ├── optimize-build.js      # 构建优化
│   ├── install-electron.js    # Electron安装
│   ├── setup.js               # 项目设置
│   └── README.md              # 打包说明
├── 📁 public/                 # 静态资源
│   ├── styles.css             # 主样式文件
│   └── *.html                 # HTML模板
├── 📁 scripts/                # 核心逻辑模块
│   ├── constants.js           # 常量定义
│   ├── OscilloscopeState.js   # 状态管理
│   ├── calibrationLogic.js    # 校准逻辑
│   ├── WaveformRenderer.js    # 波形渲染器
│   ├── waveDrawer.js          # 波形绘制
│   ├── lissajousDrawer.js     # 李萨如图绘制
│   └── WaveformUtilities.js   # 工具函数
├── 📁 src/                    # 源代码目录
│   ├── 📁 components/         # Three.js组件
│   │   ├── ElectronBeam.js    # 电子束模拟
│   │   ├── WaveformGenerator.js # 波形生成器
│   │   ├── Screen.js          # 荧光屏效果
│   │   ├── LabelSystem.js     # 3D标签系统
│   │   ├── ExplodedView.js    # 分解视图
│   │   └── DemoAnimation.js   # 演示动画
│   ├── 📁 controllers/        # 控制器
│   │   ├── GuiController.js   # GUI控制
│   │   └── UIController.js    # UI控制
│   ├── 📁 widgets/            # UI组件
│   │   ├── switcher.js        # 切换器组件
│   │   └── tour-guide/        # 导览系统
│   ├── main.js                # 3D视图入口
│   ├── external.js            # 主界面入口
│   └── configLoader.js        # 配置加载器
├── electron-main.js           # Electron主进程入口
├── package.json               # 项目配置
├── webpack.config.js          # 构建配置
└── README.md                  # 项目文档
```

## 🔧 配置说明

### 主要配置文件
- `webpack.config.js`：构建配置，支持开发和生产环境
- `src/config.json`：应用配置，包含默认参数和UI设置
- `scripts/constants.js`：系统常量，定义画布尺寸、网格参数等
- `packaging/electron-builder.yml`：Electron打包配置
- `package.json`：项目依赖和构建脚本配置

### 桌面应用配置
- **应用信息**：名称、版本、描述等在 `package.json` 中配置
- **图标文件**：位于 `assets/icons/` 目录，支持多种格式和尺寸
- **打包选项**：在 `packaging/electron-builder.yml` 中自定义打包行为
- **主进程配置**：`packaging/electron-main.js` 控制窗口行为和应用生命周期

### 自定义配置
可以通过修改配置文件来自定义：
- 默认波形参数
- 网格和画布尺寸
- 颜色主题
- 动画参数
- 桌面应用窗口大小和行为
- 应用图标和元数据

## 🎨 界面特性

### 响应式设计
- 适配不同屏幕尺寸
- 触摸设备支持
- 高DPI屏幕优化

### 视觉效果
- 专业的示波器界面风格
- 平滑的动画过渡
- 真实的荧光屏效果
- 直观的参数调节界面

### 交互体验
- 实时参数反馈
- 拖拽式参数调节
- 键盘快捷键支持
- 上下文帮助信息

## 🎓 教育价值

### 学习目标
- **理解示波器原理**：通过3D可视化深入理解CRT工作机制
- **掌握操作技能**：熟练使用示波器的各项功能
- **波形分析能力**：学会观察和分析各种电信号波形
- **实验技能训练**：模拟真实的实验操作流程

### 适用场景
- **高等教育**：电子工程、物理学课程
- **职业培训**：电子技术培训
- **自主学习**：电子爱好者和学习者
- **演示教学**：课堂演示和实验教学

## 🌟 技术亮点

### 性能优化
- **高效渲染**：优化的Canvas绘制和WebGL渲染
- **内存管理**：合理的对象生命周期管理
- **动画优化**：使用requestAnimationFrame确保流畅性
- **模块懒加载**：按需加载功能模块

### 兼容性
- **跨浏览器**：支持主流现代浏览器
- **移动设备**：触摸操作适配
- **跨平台桌面**：支持Windows、macOS、Linux系统
- **无服务器部署**：Web版本可直接部署到静态服务器或CDN
- **离线运行**：桌面应用无需网络连接即可使用

## 🤝 贡献指南

欢迎提交问题报告、功能请求或代码贡献！

### 开发环境设置
1. Fork 本仓库
2. 克隆到本地：`git clone [your-fork-url]`
3. 安装依赖：`npm install`
4. 启动开发服务器：`npm run dev`

### 代码规范
- 使用ES6+语法
- 保持代码注释的完整性
- 遵循模块化设计原则
- 确保跨浏览器兼容性

## 🙏 致谢

感谢以下开源项目的支持：
- [Three.js](https://threejs.org/) - 3D图形库
- [Vue.js](https://vuejs.org/) - 前端框架
- [dat.GUI](https://github.com/dataarts/dat.gui) - 参数控制界面
- [Tween.js](https://github.com/tweenjs/tween.js/) - 动画库
- [Webpack](https://webpack.js.org/) - 构建工具

---

🔬 **探索电子世界的奥秘，从这个虚拟示波器开始！**
