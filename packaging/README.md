# Packaging README

This folder is intentionally narrow in scope.

Current packaging flow:

1. `npm run build`
2. `npm run desktop:build`

`desktop:build` only produces one target:

- Windows x64 portable `.exe`

Packaging behavior:

- online by default through `electron-builder 26.8.2`
- default binary mirror: [Huawei Cloud](https://mirrors.huaweicloud.com/electron-builder-binaries/)
- optional mirror override using `PACKAGING_BINARY_MIRROR`
- no local `.7z` archive fallback
- after success, `dist/` keeps only the final `.exe`
- packaged EXE icon comes from `assets/icons/x64/icon.ico`
- Electron window icon falls back to `assets/icons/x64/icon.ico` / `icon.png`

Mirror layout required by the current Windows portable build:

- `{mirror}/nsis-3.0.4.1/nsis-3.0.4.1.7z`
- `{mirror}/nsis-resources-3.4.1/nsis-resources-3.4.1.7z`

If `PACKAGING_BINARY_MIRROR` is set, `packaging/build.js` prechecks these URLs before running Electron Builder.
If either resource is missing, the script fails early with the exact missing URL list instead of passing through the long `app-builder` stack trace.

Optional mirror example:

```powershell
$env:PACKAGING_BINARY_MIRROR='https://your-mirror.example.com/'
```

If the variable is not set, the build uses the default Huawei Cloud mirror.

Key files:

- [C:/Users/ASUS/Desktop/demo1/packaging/build.js](C:/Users/ASUS/Desktop/demo1/packaging/build.js)
- [C:/Users/ASUS/Desktop/demo1/packaging/common.js](C:/Users/ASUS/Desktop/demo1/packaging/common.js)
- [C:/Users/ASUS/Desktop/demo1/packaging/optimize-build.js](C:/Users/ASUS/Desktop/demo1/packaging/optimize-build.js)
