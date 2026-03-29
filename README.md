# 示波器仿真系统

这是一个面向教学演示的前端项目，包含两套页面：

- 2D 示波器交互页：用于自检校准、标准测量，以及可选的实际测量扩展
- 3D 内部原理页：用于展示示波器内部结构、材质与演示动画

项目当前同时支持 Web 部署和 Electron Windows 桌面打包。

## 技术栈

- Vue 2
- Three.js
- Electron
- Webpack 5

## 项目结构

主要入口与关键文件：

- 2D 页面入口：[C:\Users\ASUS\Desktop\demo1\src\external.js](C:\Users\ASUS\Desktop\demo1\src\external.js)
- 3D 页面入口：[C:\Users\ASUS\Desktop\demo1\src\main.js](C:\Users\ASUS\Desktop\demo1\src\main.js)
- Electron 主进程：[C:\Users\ASUS\Desktop\demo1\electron-main.js](C:\Users\ASUS\Desktop\demo1\electron-main.js)
- Webpack 配置：[C:\Users\ASUS\Desktop\demo1\webpack.config.js](C:\Users\ASUS\Desktop\demo1\webpack.config.js)
- 桌面打包脚本：[C:\Users\ASUS\Desktop\demo1\packaging\build.js](C:\Users\ASUS\Desktop\demo1\packaging\build.js)

硬件输入相关模块：

- 串口会话与重连逻辑：[C:\Users\ASUS\Desktop\demo1\src\hardware\serialSession.js](C:\Users\ASUS\Desktop\demo1\src\hardware\serialSession.js)
- 硬件波形绘制逻辑：[C:\Users\ASUS\Desktop\demo1\src\hardware\serialWaveRenderer.js](C:\Users\ASUS\Desktop\demo1\src\hardware\serialWaveRenderer.js)

## 页面说明

### `index.html`

构建后对应 2D 交互页，默认部署在：

- `/index.html`

当前页面包含以下实验步骤：

1. 自检校准
2. 标准测量
3. 实际测量（当前通过功能开关控制，可隐藏）

其中：

- 自检校准页包含通道固定参数、波形显示微调、时间/电压/位置与触发控制
- 标准测量页用于 2D 示波器参数调节与波形显示
- 实际测量页预留 Arduino / Web Serial 硬件输入能力

### `internal.html`

构建后对应 3D 内部原理页，默认部署在：

- `/internal.html`

该页使用 Three.js 渲染示波器内部结构，并在首屏后按需加载 GUI、标签系统、分解视图、演示动画和辅助示例。

## 开发环境

建议环境：

- Node.js 22.x
- npm 10.x
- Windows PowerShell

如果当前终端中 `npm` 无法识别，请先把 Node 安装目录加入 `PATH`，或直接使用 `npm.cmd` 的完整路径执行命令。

## 开发命令

启动 Web 开发服务：

```bash
npm run dev
```

启动 Electron 桌面开发：

```bash
npm run desktop:dev
```

默认本地地址：

- [http://localhost:8081/index.html](http://localhost:8081/index.html)
- [http://localhost:8081/internal.html](http://localhost:8081/internal.html)

## 构建说明

执行前端构建：

```bash
npm run build
```

构建输出目录：

- [C:\Users\ASUS\Desktop\demo1\docs](C:\Users\ASUS\Desktop\demo1\docs)

当前构建特性：

- Webpack 输出使用 content hash 文件名
- `internal` 页的非首屏模块已改为动态导入
- 构建产物会自动注入新的 hashed 资源名

这意味着：

- 线上可安全配合 Nginx 的 gzip 与长期缓存策略
- 新版本发布时会因为文件名变化而自动拉取新资源

## 3D 首屏加载优化

当前 3D 页面已经做了首屏拆分，以下模块不再阻塞首屏：

- `GuiController`
- `UIController`
- `LabelSystem`
- `ExplodedView`
- `DemoAnimation`
- `ConnectionPositionDemo`
- `SuperellipseTransitionDemo`

加载顺序为：

1. 标签系统
2. 分解视图
3. GUI
4. 演示动画
5. UI 控制器
6. 辅助示例

这样可以让 `internal` 页先完成基础场景渲染，再逐步补齐交互与演示能力。

## Vue 与本地 CDN

2D 页面当前不再把 Vue 打进 `external` 首包，而是显式加载本地 CDN 资源：

- `./assets/CDN/vue.min.js`

资源源目录：

- [C:\Users\ASUS\Desktop\demo1\CDN](C:\Users\ASUS\Desktop\demo1\CDN)

构建后复制到：

- [C:\Users\ASUS\Desktop\demo1\docs\assets\CDN](C:\Users\ASUS\Desktop\demo1\docs\assets\CDN)

## Electron 桌面打包

执行桌面打包：

```bash
npm run desktop:build
```

该命令固定执行两步：

1. 构建 `docs/`
2. 打包 Windows x64 portable `.exe`

当前桌面打包特性：

- 使用 `electron-builder 26.8.2`
- 只生成 Windows x64 portable `.exe`
- 默认在线镜像为华为云
- 可通过 `PACKAGING_BINARY_MIRROR` 覆盖默认镜像
- 成功后 `dist/` 中只保留最终一个 `.exe`

默认镜像：

- [https://mirrors.huaweicloud.com/electron-builder-binaries/](https://mirrors.huaweicloud.com/electron-builder-binaries/)

自定义镜像示例：

```powershell
$env:PACKAGING_BINARY_MIRROR='https://your-mirror.example.com/'
npm run desktop:build
```

## 图标资源

- SVG 源文件：[C:\Users\ASUS\Desktop\demo1\assets\icons\source\oscilloscope-badge.svg](C:\Users\ASUS\Desktop\demo1\assets\icons\source\oscilloscope-badge.svg)
- EXE 图标：[C:\Users\ASUS\Desktop\demo1\assets\icons\x64\icon.ico](C:\Users\ASUS\Desktop\demo1\assets\icons\x64\icon.ico)
- PNG 图标：[C:\Users\ASUS\Desktop\demo1\assets\icons\x64\icon.png](C:\Users\ASUS\Desktop\demo1\assets\icons\x64\icon.png)

## 部署建议

Web 产物目录为 `docs/`，适合直接部署到静态站点或 Nginx 根目录。

推荐线上配置：

- 开启 gzip 或 brotli
- 对 hashed JS/CSS 使用长期缓存
- 对 `index.html` / `internal.html` 使用较短缓存或 `no-cache`

## 补充文档

桌面打包相关说明可参考：

- [C:\Users\ASUS\Desktop\demo1\packaging\README.md](C:\Users\ASUS\Desktop\demo1\packaging\README.md)
