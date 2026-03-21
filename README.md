# 示波器仿真系统

这是一个用于教学和演示的学生项目，包含两个前端页面：

- 2D 示波器操作界面
- 3D 示波器内部结构演示

核心技术栈：

- Vue 2
- Three.js
- Electron
- Webpack 5

## 主要入口

- 2D 页面入口：[C:/Users/ASUS/Desktop/demo1/src/external.js](C:/Users/ASUS/Desktop/demo1/src/external.js)
- 3D 页面入口：[C:/Users/ASUS/Desktop/demo1/src/main.js](C:/Users/ASUS/Desktop/demo1/src/main.js)
- Electron 主进程：[C:/Users/ASUS/Desktop/demo1/electron-main.js](C:/Users/ASUS/Desktop/demo1/electron-main.js)
- 打包脚本：[C:/Users/ASUS/Desktop/demo1/packaging/build.js](C:/Users/ASUS/Desktop/demo1/packaging/build.js)

## 环境要求

- Node.js 22.x
- npm 10.x
- 当前脚本默认按 Windows 命令行环境编写

## 开发启动

启动 Web 开发服务：

```bash
npm run dev
```

启动 Electron 桌面开发：

```bash
npm run desktop:dev
```

本地页面地址：

- [http://localhost:8081/index.html](http://localhost:8081/index.html)
- [http://localhost:8081/internal.html](http://localhost:8081/internal.html)

## 页面说明

### `index.html` / 外部示波器页面

该页面对应 2D 示波器交互界面，包含三种实验步骤：

1. 自检校准
2. 标准测量
3. 实际测量

其中“实际测量”支持通过 Web Serial API 连接 Arduino，按 `115200` 波特率读取串口数据，并实时绘制硬件输入波形。

硬件输入链路当前已经模块化拆分为：

- 串口会话与重连逻辑：[C:/Users/ASUS/Desktop/demo1/src/hardware/serialSession.js](C:/Users/ASUS/Desktop/demo1/src/hardware/serialSession.js)
- 硬件波形绘制逻辑：[C:/Users/ASUS/Desktop/demo1/src/hardware/serialWaveRenderer.js](C:/Users/ASUS/Desktop/demo1/src/hardware/serialWaveRenderer.js)

### `internal.html` / 内部原理页面

该页面用于展示示波器内部三维结构，主要依赖 Three.js。

## Vue 与 CDN

当前 2D 页面不再把 Vue 打进 `external.bundle.js`，而是改为显式加载本地 CDN 文件：

- `./assets/CDN/vue.min.js`

对应资源来源目录：

- [C:/Users/ASUS/Desktop/demo1/CDN](C:/Users/ASUS/Desktop/demo1/CDN)

Webpack 会将该目录复制到构建输出中的：

- [C:/Users/ASUS/Desktop/demo1/docs/assets/CDN](C:/Users/ASUS/Desktop/demo1/docs/assets/CDN)

## 构建

执行前端构建：

```bash
npm run build
```

执行桌面打包：

```bash
npm run desktop:build
```

`desktop:build` 固定执行两步：

1. 构建 `docs/`
2. 打包 Windows x64 可执行文件

## 桌面打包说明

当前桌面打包范围：

- 仅生成 Windows x64 portable `.exe`

当前打包行为：

- 使用 `electron-builder 26.8.2`
- 默认在线镜像为华为云
- 可通过 `PACKAGING_BINARY_MIRROR` 覆盖默认镜像
- 成功后 `dist/` 中只保留最终一个 `.exe`
- EXE 图标来源：`assets/icons/x64/icon.ico`
- Electron 窗口图标来源：`assets/icons/x64/icon.ico` / `icon.png`

默认镜像地址：

- [https://mirrors.huaweicloud.com/electron-builder-binaries/](https://mirrors.huaweicloud.com/electron-builder-binaries/)

如需自定义镜像：

```powershell
$env:PACKAGING_BINARY_MIRROR='https://your-mirror.example.com/'
```

当前 Windows portable 打包要求镜像中至少存在：

- `{mirror}/nsis-3.0.4.1/nsis-3.0.4.1.7z`
- `{mirror}/nsis-resources-3.4.1/nsis-resources-3.4.1.7z`

如果设置了 `PACKAGING_BINARY_MIRROR`，打包脚本会在正式执行前先预检查这些资源。

## 输出目录

- Web 构建输出：[C:/Users/ASUS/Desktop/demo1/docs](C:/Users/ASUS/Desktop/demo1/docs)
- 桌面打包输出：[C:/Users/ASUS/Desktop/demo1/dist](C:/Users/ASUS/Desktop/demo1/dist)

预期桌面打包结果：

- `dist/` 下仅保留一个 `.exe`

## 图标资源

- SVG 源图：[C:/Users/ASUS/Desktop/demo1/assets/icons/source/oscilloscope-badge.svg](C:/Users/ASUS/Desktop/demo1/assets/icons/source/oscilloscope-badge.svg)
- EXE 图标：[C:/Users/ASUS/Desktop/demo1/assets/icons/x64/icon.ico](C:/Users/ASUS/Desktop/demo1/assets/icons/x64/icon.ico)
- PNG 图标：[C:/Users/ASUS/Desktop/demo1/assets/icons/x64/icon.png](C:/Users/ASUS/Desktop/demo1/assets/icons/x64/icon.png)

## 主要配置来源

优先查看这些文件：

- [C:/Users/ASUS/Desktop/demo1/package.json](C:/Users/ASUS/Desktop/demo1/package.json)
- [C:/Users/ASUS/Desktop/demo1/webpack.config.js](C:/Users/ASUS/Desktop/demo1/webpack.config.js)
- [C:/Users/ASUS/Desktop/demo1/packaging/build.js](C:/Users/ASUS/Desktop/demo1/packaging/build.js)
- [C:/Users/ASUS/Desktop/demo1/electron-main.js](C:/Users/ASUS/Desktop/demo1/electron-main.js)

补充说明可参考：

- [C:/Users/ASUS/Desktop/demo1/packaging/README.md](C:/Users/ASUS/Desktop/demo1/packaging/README.md)
