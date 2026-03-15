# 示波器仿真系统

一个面向教学和演示的示波器仿真项目，提供两条主体验链路：

- Web 版 2D 示波器界面
- Web/Electron 版 3D 内部原理展示

项目当前以“可运行、可验证、可逐步整理”为目标，已经完成主进程路径收口、最小 smoke 验证、基础文档同步和一轮低风险冗余清理。

## 当前状态

- Web 开发链路可用
- Electron 开发链路可用
- Electron 源码目录本地文件模式可用
- 已提供最小项目检查命令和主链路 smoke 验证命令
- 打包相关说明已合并到本 README，`packaging/README.md` 不再维护完整副本

## 技术栈

### 前端

- Vue 2.7
- Three.js
- dat.GUI
- Tween.js

### 桌面端

- Electron
- electron-builder

### 构建

- Webpack 5
- webpack-dev-server
- CSS Loader / style-loader / MiniCssExtractPlugin

## 运行入口

### Web 入口

- 2D 示波器主界面: [src/external.js](C:/Users/ASUS/Desktop/demo1/src/external.js)
- 3D 内部原理视图: [src/main.js](C:/Users/ASUS/Desktop/demo1/src/main.js)

### HTML 模板

- 2D 页面模板: [public/external.html](C:/Users/ASUS/Desktop/demo1/public/external.html)
- 3D 页面模板: [public/internal.html](C:/Users/ASUS/Desktop/demo1/public/internal.html)

### Electron 入口

- 实际主进程入口: [electron-main.js](C:/Users/ASUS/Desktop/demo1/electron-main.js)
- 代理入口: [packaging/electron-main.js](C:/Users/ASUS/Desktop/demo1/packaging/electron-main.js)

说明：

- 根目录 `electron-main.js` 是真实生效入口
- `packaging/electron-main.js` 仅用于转发，避免历史路径漂移

## 快速开始

### 环境要求

- Node.js 22.x
- npm 10.x
- Windows 环境优先

说明：

- 当前 npm 脚本使用 `set NODE_ENV=...`，默认按 Windows shell 设计

### 安装依赖

```bash
npm install
```

## 开发模式

### Web 开发

```bash
npm run dev
```

访问：

- [http://localhost:8081/index.html](http://localhost:8081/index.html)
- [http://localhost:8081/internal.html](http://localhost:8081/internal.html)

### Electron 开发

```bash
npm run electron:dev
```

行为：

- 启动 Web dev server
- 等待 `http://localhost:8081`
- 拉起 Electron 窗口

## 构建与打包

### Web 构建

```bash
npm run build
```

输出目录：

- [docs](C:/Users/ASUS/Desktop/demo1/docs)

### 桌面端构建

```bash
npm run electron:build
npm run electron:build-win
npm run electron:build-win:local
npm run electron:build-mac
npm run electron:build-linux
npm run electron:build-all
npm run electron:build-all:local
```

两套打包方案：

- 在线方案：默认使用 GitHub 下载 `winCodeSign`
- 本地方案：将 `winCodeSign-2.6.0.7z` 放到 [packaging/binaries](C:/Users/ASUS/Desktop/demo1/packaging/binaries)，再使用 `*:local` 命令
- 本地方案默认“本地优先、官方回退”：本地缺少的二进制包会继续尝试走官方 GitHub 地址

这些脚本是 `dist*` 脚本的兼容别名，当前实际仍会走：

- `npm run dist`
- `npm run dist:win`
- `npm run dist:win:local`
- `npm run dist:mac`
- `npm run dist:linux`
- `npm run dist:all`
- `npm run dist:all:local`

### 桌面端输出目录

- [dist](C:/Users/ASUS/Desktop/demo1/dist)

当前产物约定：

- Windows: `示波器仿真系统-<version>-portable.exe`
- macOS: `示波器仿真系统-<version>.dmg`
- Linux: `*.tar.gz` 或目录产物，取决于目标平台和 builder 配置

说明：

- `win-unpacked` 主要用于 `--dir` 验证或临时检查，不是当前默认发布物

## 项目结构

```text
demo1/
├── CDN/                         第三方静态资源
├── docs/                        Web 构建输出
├── packaging/                   打包辅助脚本和代理入口
├── public/                      HTML 模板与静态资源
├── scripts/                     2D 逻辑与工程化检查脚本
├── src/                         3D 逻辑、控制器和组件
├── archive/                     已归档的历史脚本与实验页面
├── electron-main.js             Electron 主进程真实入口
├── package.json                 npm 脚本与打包配置
└── webpack.config.js            Webpack 配置
```

### `scripts/`

当前主目录下保留的脚本以“正在接入或正在使用”为准：

- [scripts/constants.js](C:/Users/ASUS/Desktop/demo1/scripts/constants.js)
- [scripts/calibrationLogic.js](C:/Users/ASUS/Desktop/demo1/scripts/calibrationLogic.js)
- [scripts/waveDrawer.js](C:/Users/ASUS/Desktop/demo1/scripts/waveDrawer.js)
- [scripts/lissajousDrawer.js](C:/Users/ASUS/Desktop/demo1/scripts/lissajousDrawer.js)
- [scripts/WaveformUtilities.js](C:/Users/ASUS/Desktop/demo1/scripts/WaveformUtilities.js)

### `archive/`

这里存放已确认不在主链路上、但暂不永久删除的归档内容：

- [archive/README.md](C:/Users/ASUS/Desktop/demo1/archive/README.md)
- [archive/GLWaveformRenderer.archived.js](C:/Users/ASUS/Desktop/demo1/archive/GLWaveformRenderer.archived.js)
- [archive/OscilloscopeState.archived.js](C:/Users/ASUS/Desktop/demo1/archive/OscilloscopeState.archived.js)
- [archive/WaveformRenderer.archived.js](C:/Users/ASUS/Desktop/demo1/archive/WaveformRenderer.archived.js)

归档原则：

- 未接入主链路
- 仍有历史参考价值
- 暂不做高风险永久删除

## 关键配置

### Electron

- 打包配置主来源: [package.json](C:/Users/ASUS/Desktop/demo1/package.json)
- 参考配置文件: [packaging/electron-builder.yml](C:/Users/ASUS/Desktop/demo1/packaging/electron-builder.yml)

说明：

- `package.json` 中的 `build` 配置是当前实际生效配置
- `packaging/electron-builder.yml` 保留为参考/辅助配置，不作为唯一事实来源

### 图标资源

- 可选目录: `assets/icons/`

说明：

- 当前图标资源是可选的
- 未提供自定义图标时，Electron 仍可正常启动和打包

## 工程化约定

### 已具备

- `.gitignore` 已忽略 `.tmp-dist*/`

### 当前仍缺少

- 正式 lint
- type-check
- 单元测试
- 更细粒度的集成测试

## 已完成的低风险整理

- 收口 Electron 主进程路径解析
- 收口 `packaging/electron-main.js` 为代理入口
- 修正图标路径处理为可选资源
- 删除未使用导入
- 清理未接入脚本
- 移除未使用依赖和未接入 Babel 配置依赖
- 将历史残留脚本移入 `archive/`，并统一标记为 `.archived.js`
- 合并 README，避免双文档漂移

## 当前不建议直接做的事

- 直接重构 [src/external.js](C:/Users/ASUS/Desktop/demo1/src/external.js)
- 直接重构 [src/main.js](C:/Users/ASUS/Desktop/demo1/src/main.js)
- 直接拆分 [src/components/DemoAnimation.js](C:/Users/ASUS/Desktop/demo1/src/components/DemoAnimation.js)
- 在没有更多证据的情况下永久删除归档内容

## 常见命令

```bash
npm run dev
npm run electron:dev
npm run build
npm run electron:build
```

## 故障排查

### Electron 启动失败

优先检查：

- [electron-main.js](C:/Users/ASUS/Desktop/demo1/electron-main.js)
- [package.json](C:/Users/ASUS/Desktop/demo1/package.json)

### 打包行为和文档不一致

优先以以下文件为准：

- [package.json](C:/Users/ASUS/Desktop/demo1/package.json)
- [packaging/build.js](C:/Users/ASUS/Desktop/demo1/packaging/build.js)
- [packaging/electron-builder.yml](C:/Users/ASUS/Desktop/demo1/packaging/electron-builder.yml)

### 临时产物影响工作区

已忽略：

- `.tmp-dist*/`

如果需要清理磁盘文件，请手动删除对应目录。

## 说明

- 本 README 是当前唯一维护的主说明文档
- [packaging/README.md](C:/Users/ASUS/Desktop/demo1/packaging/README.md) 仅保留简短指引，避免重复维护
