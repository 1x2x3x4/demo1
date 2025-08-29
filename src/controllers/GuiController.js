import * as dat from 'dat.gui';
import { CONFIG, WAVEFORM_TYPES } from '../config';

export class GuiController {
  constructor(callbacks = {}) {
    this.gui = new dat.GUI({ width: 300 });
    this.callbacks = callbacks;
    
    // 保存回调函数
    this.onBeamChange = callbacks.onBeamChange || (() => {});
    this.onDeflectionChange = callbacks.onDeflectionChange || (() => {});
    this.onWaveformChange = callbacks.onWaveformChange || (() => {});
    this.onScreenChange = callbacks.onScreenChange || (() => {});
    
    this.initGui();
  }
  
  initGui() {
    // 创建各个控制面板
    this.initBeamControls();
    this.initDeflectionControls();
    this.initWaveformControls();
    this.initScreenControls();
  }
  
  initBeamControls() {
    const beamFolder = this.gui.addFolder('电子束参数');
    
    beamFolder.add(CONFIG.beam, 'intensity', 0, 1)
      .name('强度')
      .onChange(() => this.onBeamChange(CONFIG.beam));
      
    beamFolder.addColor({ color: CONFIG.beam.color }, 'color')
      .name('颜色')
      .onChange((value) => {
        CONFIG.beam.color = value;
        this.onBeamChange(CONFIG.beam);
      });
      
    beamFolder.open();
  }
  
  initDeflectionControls() {
    const deflectionFolder = this.gui.addFolder('偏转板参数');
    
    deflectionFolder.add(CONFIG.deflection.horizontal, 'voltage', -5, 5, 0.1)
      .name('水平电压 (V)')
      .onChange(() => this.onDeflectionChange(CONFIG.deflection));
      
    deflectionFolder.add(CONFIG.deflection.vertical, 'voltage', -5, 5, 0.1)
      .name('垂直电压 (V)')
      .onChange(() => this.onDeflectionChange(CONFIG.deflection));
      
    deflectionFolder.open();
  }
  
  initWaveformControls() {
    const waveformFolder = this.gui.addFolder('波形参数');
    
    // 创建波形类型下拉菜单
    const waveformOptions = {};
    Object.entries(WAVEFORM_TYPES).forEach(([key, value]) => {
      waveformOptions[value] = key;
    });
    
    waveformFolder.add(CONFIG.waveform, 'enabled')
      .name('启用波形')
      .onChange(() => this.onWaveformChange(CONFIG.waveform));
      
    waveformFolder.add(CONFIG.waveform, 'type', Object.keys(WAVEFORM_TYPES))
      .name('波形类型')
      .onChange(() => this.onWaveformChange(CONFIG.waveform));
      
    waveformFolder.add(CONFIG.waveform, 'frequency', 0.1, 5, 0.1)
      .name('频率 (Hz)')
      .onChange(() => this.onWaveformChange(CONFIG.waveform));
      
    waveformFolder.add(CONFIG.waveform, 'amplitude', 0, 5, 0.1)
      .name('振幅')
      .onChange(() => this.onWaveformChange(CONFIG.waveform));
      
    waveformFolder.add(CONFIG.waveform, 'phase', 0, Math.PI * 2, 0.1)
      .name('相位')
      .onChange(() => this.onWaveformChange(CONFIG.waveform));
      
    waveformFolder.open();
  }
  
  initScreenControls() {
    const screenFolder = this.gui.addFolder('荧光屏参数');
    
    screenFolder.add(CONFIG.screen, 'persistence', 0, 1, 0.01)
      .name('余辉持续')
      .onChange(() => this.onScreenChange(CONFIG.screen));
      
    screenFolder.addColor({ color: CONFIG.screen.color }, 'color')
      .name('荧光颜色')
      .onChange((value) => {
        CONFIG.screen.color = value;
        this.onScreenChange(CONFIG.screen);
      });
      
    screenFolder.add(CONFIG.screen, 'intensity', 0, 1, 0.1)
      .name('发光强度')
      .onChange(() => this.onScreenChange(CONFIG.screen));
      
    screenFolder.open();
  }
} 