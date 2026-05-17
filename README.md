# 示波器仿真系统

这是一个面向教学演示的示波器仿真前端项目，包含 **2D 示波器交互页** 和 **3D 内部原理页** 两套页面。

项目当前同时支持：

- Web 静态部署
- Electron Windows 桌面端打包

---

## 1. 项目简介

本项目主要用于示波器相关实验教学与原理展示。

### 2D 示波器交互页

用于完成示波器基础操作与实验演示，包括：

- 自检校准
- 标准测量
- 实际测量扩展预留

该页面主要面向学生实验操作，通过参数调节、波形显示和控制面板模拟示波器的基本使用流程。

### 3D 内部原理页

用于展示示波器内部结构、材质效果与工作原理动画。

该页面基于 Three.js 实现 3D 场景渲染，并支持标签系统、分解视图、演示动画和辅助示例等功能。

---

## 2. 技术栈

项目主要使用以下技术：

- Vue 2
- Three.js
- Electron
- Webpack 5

---

## 3. 项目结构

主要入口与关键文件如下：

```text
demo1/
├─ src/
│  ├─ external.js                         # 2D 示波器交互页入口
│  ├─ main.js                             # 3D 内部原理页入口
│  └─ hardware/
│     ├─ serialSession.js                 # 串口会话与重连逻辑
│     └─ serialWaveRenderer.js            # 硬件波形绘制逻辑
│
├─ electron-main.js                       # Electron 主进程
├─ webpack.config.js                      # Webpack 配置
├─ packaging/
│  ├─ build.js                            # 桌面打包脚本
│  └─ README.md                           # 桌面打包相关说明
│
├─ CDN/                                   # 本地 CDN 资源源目录
├─ assets/
│  └─ icons/                              # 图标资源
│
├─ docs/                                  # Web 构建输出目录
└─ dist/                                  # Electron 打包输出目录