# Oscilloscope Simulator

Teaching/demo project with two frontends:

- 2D oscilloscope UI
- 3D CRT internal model

Core stack:

- Vue 2
- Three.js
- Electron
- Webpack 5

## Entry Points

- 2D entry: [C:/Users/ASUS/Desktop/demo1/src/external.js](C:/Users/ASUS/Desktop/demo1/src/external.js)
- 3D entry: [C:/Users/ASUS/Desktop/demo1/src/main.js](C:/Users/ASUS/Desktop/demo1/src/main.js)
- Electron main process: [C:/Users/ASUS/Desktop/demo1/electron-main.js](C:/Users/ASUS/Desktop/demo1/electron-main.js)
- Packaging script: [C:/Users/ASUS/Desktop/demo1/packaging/build.js](C:/Users/ASUS/Desktop/demo1/packaging/build.js)

## Environment

- Node.js 22.x
- npm 10.x
- Current scripts are written for Windows shell usage

## Development

Web development:

```bash
npm run dev
```

Desktop development:

```bash
npm run desktop:dev
```

Local pages:

- [http://localhost:8081/index.html](http://localhost:8081/index.html)
- [http://localhost:8081/internal.html](http://localhost:8081/internal.html)

## Build

Web build:

```bash
npm run build
```

Desktop build:

```bash
npm run desktop:build
```

Current desktop packaging scope:

- Windows x64 portable `.exe` only

`desktop:build` always does two steps:

1. Build `docs/`
2. Package the Windows x64 executable

Default packaging behavior:

- Uses `electron-builder 26.8.2`
- Uses Huawei Cloud as the default online binary mirror
- Uses `PACKAGING_BINARY_MIRROR` only if you explicitly want to override the default mirror
- Keeps only one final `.exe` in `dist/` after a successful build
- Uses `assets/icons/x64/icon.ico` as the packaged EXE icon
- Uses `assets/icons/x64/icon.ico` / `icon.png` as the Electron window icon source

Optional mirror override:

```powershell
$env:PACKAGING_BINARY_MIRROR='https://your-mirror.example.com/'
```

If the mirror is not set, the build uses the default Huawei Cloud mirror:

- [https://mirrors.huaweicloud.com/electron-builder-binaries/](https://mirrors.huaweicloud.com/electron-builder-binaries/)

Mirror requirements for the current Windows portable build:

- `{mirror}/nsis-3.0.4.1/nsis-3.0.4.1.7z`
- `{mirror}/nsis-resources-3.4.1/nsis-resources-3.4.1.7z`

If `PACKAGING_BINARY_MIRROR` is set, `desktop:build` prechecks these two URLs before starting the actual Electron packaging step.

## Output

- Web output: [C:/Users/ASUS/Desktop/demo1/docs](C:/Users/ASUS/Desktop/demo1/docs)
- Desktop output: [C:/Users/ASUS/Desktop/demo1/dist](C:/Users/ASUS/Desktop/demo1/dist)

Expected Windows result:

- exactly one `dist/*.exe`

## Version Note

Current project version:

- `electron-builder`: `26.8.2`

Latest official release checked on 2026-03-18:

- `electron-builder`: `26.8.2`
- Source: [electron-builder releases](https://github.com/electron-userland/electron-builder/releases)

Relevant improvements compared with the old `24.9.1` setup:

- updated `win-codesign` resources
- NSIS-related fixes
- Windows `spawn EINVAL` fixes after Node.js security changes
- improved npm optional dependency and cache handling

## Packaging Sources of Truth

Prefer these files:

- [C:/Users/ASUS/Desktop/demo1/package.json](C:/Users/ASUS/Desktop/demo1/package.json)
- [C:/Users/ASUS/Desktop/demo1/packaging/build.js](C:/Users/ASUS/Desktop/demo1/packaging/build.js)
- [C:/Users/ASUS/Desktop/demo1/electron-main.js](C:/Users/ASUS/Desktop/demo1/electron-main.js)

Icon assets:

- [C:/Users/ASUS/Desktop/demo1/assets/icons/source/oscilloscope-badge.svg](C:/Users/ASUS/Desktop/demo1/assets/icons/source/oscilloscope-badge.svg)
- [C:/Users/ASUS/Desktop/demo1/assets/icons/x64/icon.ico](C:/Users/ASUS/Desktop/demo1/assets/icons/x64/icon.ico)
- [C:/Users/ASUS/Desktop/demo1/assets/icons/x64/icon.png](C:/Users/ASUS/Desktop/demo1/assets/icons/x64/icon.png)

Secondary references:

- [C:/Users/ASUS/Desktop/demo1/packaging/README.md](C:/Users/ASUS/Desktop/demo1/packaging/README.md)
- [C:/Users/ASUS/Desktop/demo1/packaging/electron-builder.yml](C:/Users/ASUS/Desktop/demo1/packaging/electron-builder.yml)
