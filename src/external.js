// ===== 统一工程化入口：外部（面板/示波器）页面 =====

// ===== 第三方依赖导入 =====
import Vue from 'vue';

// ===== 样式文件导入 =====
import '../public/styles.css';

// ===== 导入 switcher 模块（ES6 导入，并在 DOM 就绪后初始化） =====
import { renderSwitcher } from '../src/widgets/switcher.js';
// 导入 TourGuide 模块（ES6 模块化）
import { tourGuideManager } from './widgets/index.js';

// ===== 核心模块导入 =====
import { OscilloscopeConstants } from '../scripts/constants.js';
import * as WaveformUtilities from '../scripts/WaveformUtilities.js';
import { WaveDrawer } from '../scripts/waveDrawer.js';
import LissajousDrawer from '../scripts/lissajousDrawer.js';
import CalibrationLogic from '../scripts/calibrationLogic.js';
import { StepAdjustmentUtils } from '../scripts/StepAdjustmentUtils.js';
import {
  createNumericInputState,
  getNumericFieldConfig as getNumericFieldConfigFromController,
  formatNumericFieldValue as formatNumericFieldValueFromController,
  syncNumericDraft as syncNumericDraftFromController,
  syncAllNumericDrafts as syncAllNumericDraftsFromController,
  startNumericInput as startNumericInputFromController,
  clearNumericInputError as clearNumericInputErrorFromController,
  showNumericInputError as showNumericInputErrorFromController,
  clearAllNumericErrorTimers as clearAllNumericErrorTimersFromController,
  evaluateNumericDraft as evaluateNumericDraftFromController,
  updateNumericDraft as updateNumericDraftFromController,
  commitNumericInput as commitNumericInputFromController,
} from './controllers/externalNumericInputs.js';
import {
  createCalibrationSliderState,
  calculateSliderPosition as calculateSliderPositionFromController,
  getCalibrationSliderKey as getCalibrationSliderKeyFromController,
  getCalibrationSliderValue as getCalibrationSliderValueFromController,
  setCalibrationSliderValue as setCalibrationSliderValueFromController,
  getSliderFeedbackText as getSliderFeedbackTextFromController,
  isSliderFeedbackVisible as isSliderFeedbackVisibleFromController,
  setSliderHover as setSliderHoverFromController,
  showSliderFeedback as showSliderFeedbackFromController,
  clearAllSliderFeedbackTimers as clearAllSliderFeedbackTimersFromController,
  updateCalibrationSliderFromClientX as updateCalibrationSliderFromClientXFromController,
  startCalibrationSlider as startCalibrationSliderFromController,
  handleCalibrationSliderMove as handleCalibrationSliderMoveFromController,
  handleCalibrationSliderWheel as handleCalibrationSliderWheelFromController,
  handleCalibrationSliderEnd as handleCalibrationSliderEndFromController,
  cleanupCalibrationSlider as cleanupCalibrationSliderFromController,
} from './controllers/calibrationSliderController.js';
import {
  createSerialSession,
  createSerialState,
  getSerialConnectButtonText,
  getSerialStatusText,
  getSerialStatusTone,
  logSerialMessage,
} from './hardware/serialSession.js';
import { renderSerialWaveFrame } from './hardware/serialWaveRenderer.js';

// ===== 全局变量定义 =====
let app; // Vue 应用实例

// ===== 应用配置 =====
const APP_CONFIG = {
  canvas: {
    width: OscilloscopeConstants.CANVAS.WIDTH,
    height: OscilloscopeConstants.CANVAS.HEIGHT
  },
  defaultValues: {
    calibrationFactor: 0.85,
    timeDiv: 1,
    voltsDiv: { 1: 1, 2: 1 },
    peakValues: { 1: 1, 2: 1 },
    frequencies: { 1: 1, 2: 1 }
  },
  layout: {
    storageKey: 'externalAsideWidth',
    defaultAsideWidth: 380,
    desktopMinWidth: 320,
    desktopMaxWidth: 520,
    compactDefaultWidth: 340,
    compactMinWidth: 320,
    compactMaxWidth: 420
  }
};

const NUMERIC_INPUT_CONFIG = {
  peak1: {
    min: 0.1,
    max: 10,
    precision: 3,
    get(app) {
      return app.expStep === 'calibration' ? app.calibrationParams.peakValues[1] : app.peakValues[1];
    },
    set(app, value) {
      app.peakValues[1] = value;
    },
  },
  peak2: {
    min: 0.1,
    max: 10,
    precision: 3,
    get(app) {
      return app.expStep === 'calibration' ? app.calibrationParams.peakValues[2] : app.peakValues[2];
    },
    set(app, value) {
      app.peakValues[2] = value;
    },
  },
  freq1: {
    min: 0.1,
    max: 10,
    precision: 3,
    get(app) {
      return app.currentMode === 'lissajous'
        ? app.freqX
        : (app.expStep === 'calibration' ? app.calibrationParams.frequencies[1] : app.frequencies[1]);
    },
    set(app, value) {
      if (app.currentMode === 'lissajous') {
        app.freqX = value;
      } else {
        app.frequencies[1] = value;
      }
    },
  },
  freq2: {
    min: 0.1,
    max: 10,
    precision: 3,
    get(app) {
      return app.currentMode === 'lissajous'
        ? app.freqY
        : (app.expStep === 'calibration' ? app.calibrationParams.frequencies[2] : app.frequencies[2]);
    },
    set(app, value) {
      if (app.currentMode === 'lissajous') {
        app.freqY = value;
      } else {
        app.frequencies[2] = value;
      }
    },
  },
  phaseDiff: {
    min: 0,
    max: 360,
    precision: 2,
    get(app) {
      return app.phaseDiff;
    },
    set(app, value) {
      app.phaseDiff = value;
    },
  },
  timeDiv: {
    min: 0.1,
    max: 100,
    precision: 3,
    get(app) {
      return app.currentMode === 'lissajous' ? app.freqX : app.timeDiv;
    },
    set(app, value) {
      if (app.currentMode === 'lissajous') {
        app.freqX = value;
      } else {
        app.timeDiv = value;
      }
    },
  },
  volts1: {
    min: 0.1,
    max: 10,
    precision: 3,
    get(app) {
      return app.voltsDiv[1];
    },
    set(app, value) {
      app.voltsDiv[1] = value;
    },
  },
  volts2: {
    min: 0.1,
    max: 10,
    precision: 3,
    get(app) {
      return app.voltsDiv[2];
    },
    set(app, value) {
      app.voltsDiv[2] = value;
    },
  },
  triggerLevel: {
    min: -5,
    max: 5,
    precision: 2,
    get(app) {
      return app.triggerLevel;
    },
    set(app, value) {
      app.triggerLevel = value;
    },
  },
};

function formatNumericDraftValue(value, precision) {
  if (!Number.isFinite(value)) {
    return '';
  }

  const normalizedValue = Number(value.toFixed(precision));
  return `${normalizedValue}`;
}

// ===== 初始化函数 =====
function initApp() {
  console.log('初始化示波器应用...');
  
  try {
    // 创建 Vue 应用实例
    app = createVueApp();
    
    // 挂载应用
    
    console.log('示波器应用初始化完成');
  } catch (error) {
    console.error('应用初始化失败:', error);
  }
}

// ===== Vue 应用创建函数 =====
function createVueApp() {
  return new Vue({
    el: '#app',
    data: {
      // 当前模式，'wave'表示波形模式
      currentMode: 'wave',

      // 可选波形类型列表
      waveTypes: [
        { type: 'sine', name: '正弦波' },
        { type: 'square', name: '方波' },
        { type: 'triangle', name: '三角波' },
        { type: 'sawtooth', name: '锯齿波' },
        { type: 'noise', name: '噪声' },
        { type: 'pulse', name: '脉冲波' }
      ],

      // 当前波形类型，默认为正弦波
      signalType: 'sine',
      // 1号和2号输入通道激活状态
      inputActive: { 1: false, 2: false },
      // 显示模式: 'independent'（独立显示）, 'overlay'（同向叠加）, 'vertical'（垂直叠加）
      displayMode: 'independent',
      // 时间分度值（例如，1表示1个单位时间，每单位时间在显示上按8格计算）
      timeDiv: APP_CONFIG.defaultValues.timeDiv,
      // 电压分度值（单位：伏），分别对应1号和2号通道
      voltsDiv: { ...APP_CONFIG.defaultValues.voltsDiv },
      // X轴和Y轴频率（单位：Hz），用于李萨如图
      freqX: 1,
      freqY: 1,
      // 相位差（单位：度），用于李萨如图
      phaseDiff: 90,
      // Canvas上下文，绘制波形使用
      ctx: null,
      // 动画帧ID，用于控制动画循环
      animationId: null,
      // 当前相位，随时间变化（单位：弧度）
      phase: 0,
      // 存储点历史记录，用于绘制波形
      pointsHistory: [],
      // 精细时间分度值
      timeDivFine: APP_CONFIG.defaultValues.timeDiv,
      // 精细电压分度值，分别对应1号和2号通道
      voltsDivFine: { ...APP_CONFIG.defaultValues.voltsDiv },
      // 滑块是否被拖动
      isDragging: false,
      // 上一次有效值，用于验证输入
      lastValidValue: {
        time: APP_CONFIG.defaultValues.timeDiv,
        volts: { ...APP_CONFIG.defaultValues.voltsDiv }
      },
      // 滑块值，用于调整时间和电压分度
      sliderValues: {
        time: APP_CONFIG.defaultValues.timeDiv,
        volts: { 1: 0, 2: 0 }
      },
      // 峰值电压，分别对应1号和2号通道（单位：伏）
      peakValues: { ...APP_CONFIG.defaultValues.peakValues },
      // 频率值，分别对应1号和2号通道（单位：Hz）
      frequencies: { ...APP_CONFIG.defaultValues.frequencies },
      // 当前峰值电压
      peakValue: 1,
      // 当前频率
      frequency: 1,
      // 当前激活的滑块
      sliderActive: null,
      sliderHover: null,
      sliderFeedback: null,
      // 滑块偏移值
      sliderOffset: 0,
      // 是否需要重绘
      needsRedraw: false,
      // 是否正在运行（运行状态）
      isRunning: true,
      // 触发电平，范围-5到5伏（1伏=40像素，中心点200px）
      triggerLevel: 0,
      // 触发模式：auto, normal, single
      triggerMode: 'auto',
      // 暂停时显示的帧
      lastCapturedFrame: null,
      // 实验步骤控制
      expStep: 'calibration', // 'calibration', 'normal', 'actual'
      showActualMeasurement: true, //是否放开第三个界面
      calibrationFactor: APP_CONFIG.defaultValues.calibrationFactor, // 校准系数，1.0为标准校准

      // 自检模式专用数据 - 调整频率单位表示
      calibrationParams: {
        frequencies: { 1: 1, 2: 1 },  // 修改为1赫兹以匹配界面显示
        peakValues: { 1: 4, 2: 4 },    // 保持5V峰值
        waveTypes: { 1: 'square', 2: 'square' } // 两个通道都使用方波信号
      },

      // 添加校准状态
      calibrationComplete: false,

      // 添加显示微调系数
      displayAdjustFactors: {
        time: 1.0,
        volts: { 1: 1.0, 2: 1.0 }
      },

      // 保存自检页面的校准参数（新增）
      savedCalibrationSettings: {
        displayAdjustFactors: {
          time: 1.0,
          volts: { 1: 1.0, 2: 1.0 }
        },
        calibrationFactor: APP_CONFIG.defaultValues.calibrationFactor
      },

      // 添加水平和垂直位置控制
      horizontalPosition: 0, // 水平位置偏移，单位：格
      verticalPosition: { 1: 0, 2: 0 }, // 垂直位置偏移，单位：格，分别对应1号和2号通道

      triggerActive: true,      // 触发系统是否激活
      triggerSource: 1,         // 触发源通道（1或2）
      triggerSlope: 'rising',   // 触发斜率：rising（上升）或falling（下降）

      // 添加李萨如图优化相关属性
      lissajousOptimization: {
        maxPoints: 5000,      // 最大渲染点数
        highFrequencyThreshold: 20, // 高频率阈值
        autoSimplifyRatio: true     // 自动简化频率比例
      },
      ...createNumericInputState(),
      ...createCalibrationSliderState(),
      inputMode: 'simulation',
      serial: createSerialState(),
      asideWidth: APP_CONFIG.layout.defaultAsideWidth,
      layoutResizeActive: false,
      layoutResizePendingWidth: null,
      layoutResizeFrameId: null,
      layoutResizePointerId: null,
      layoutResizeResizer: null,
    },
    created() {
      this.serialSession = createSerialSession(this);
      this.inputErrorTimers = {};
      this.sliderFeedbackTimers = {};
      this.syncAllNumericDrafts({ force: true });
    },
    mounted() {
      try {
        this.initCanvas();
        this.initLayoutResizer();
        this.syncAllNumericDrafts({ force: true });
        this.initEventListeners();
        this.startDrawLoop();
        console.log('Vue 组件挂载完成');
      } catch (error) {
        console.error('Vue 组件挂载失败:', error);
      }
    },
    beforeDestroy() {
      this.clearAllNumericErrorTimers();
      this.clearAllSliderFeedbackTimers();
      this.cleanupLayoutResizer();
      this.cleanup();
    },
    computed: {
      serialStatusText() {
        return getSerialStatusText(this.serial);
      },
      serialStatusTone() {
        return getSerialStatusTone(this.serial);
      },
      serialConnectButtonText() {
        return getSerialConnectButtonText(this.serial);
      },
      // 计算滑块的最小值，最大值和步进值
      sliderRanges() {
        return {
          time: {
            min: StepAdjustmentUtils.adjustTimeDiv(this.timeDiv, -1),
            max: StepAdjustmentUtils.adjustTimeDiv(this.timeDiv, 1),
            step: 0.01 // 滑块步长保持精细调节
          },
          volts1: {
            min: StepAdjustmentUtils.adjustVoltsDiv(this.voltsDiv[1], -1),
            max: StepAdjustmentUtils.adjustVoltsDiv(this.voltsDiv[1], 1),
            step: 0.01 // 滑块步长保持精细调节
          },
          volts2: {
            min: StepAdjustmentUtils.adjustVoltsDiv(this.voltsDiv[2], -1),
            max: StepAdjustmentUtils.adjustVoltsDiv(this.voltsDiv[2], 1),
            step: 0.01 // 滑块步长保持精细调节
          }
        }
      },
      // 计算触发电平在屏幕上的位置（中心200像素，1伏=40像素）
      triggerLevelPosition() {
        return 200 - (this.triggerLevel * 40);
      },
      // 当前模式下的有效参数
      effectiveParams() {
        if (this.expStep === 'calibration') {
          return {
            frequencies: this.calibrationParams.frequencies,
            peakValues: this.calibrationParams.peakValues,
            waveTypes: this.calibrationParams.waveTypes
          };
        } else {
          return {
            frequencies: this.frequencies,
            peakValues: this.peakValues,
            waveType: this.signalType
          };
        }
      },
      // 校准状态指示（使用CalibrationLogic模块）
      calibrationStatus() {
        return CalibrationLogic.checkCalibrationStatus(this.calibrationFactor);
      },
      // 计算简化后的频率比例（使用LissajousDrawer模块）
      simplifiedRatio() {
        const gcd = LissajousDrawer.gcdPrecise(this.freqX, this.freqY);
        if (gcd < 0.001) return { x: this.freqX, y: this.freqY };

        let simplifiedX = this.freqX / gcd;
        let simplifiedY = this.freqY / gcd;

        if (Math.abs(Math.round(simplifiedX) - simplifiedX) < 0.01) {
          simplifiedX = Math.round(simplifiedX);
        } else {
          simplifiedX = parseFloat(simplifiedX.toFixed(2));
        }
        
        if (Math.abs(Math.round(simplifiedY) - simplifiedY) < 0.01) {
          simplifiedY = Math.round(simplifiedY);
        } else {
          simplifiedY = parseFloat(simplifiedY.toFixed(2));
        }
        
        return { x: simplifiedX, y: simplifiedY };
      },
      // 判断是否需要显示简化比例（如果原始比例和简化比例不同）
      needsSimplification() {
        return this.freqX !== this.simplifiedRatio.x || this.freqY !== this.simplifiedRatio.y;
      }
    },
    watch: {
      // 同步时间分度和滑块状态
      timeDiv(val) {
        this.timeDivFine = val;
        this.lastValidValue.time = val;
        this.sliderValues.time = 0;
        this.syncNumericDraft('timeDiv');
      },
      'voltsDiv.1'(val) {
        this.voltsDivFine[1] = val;
        this.lastValidValue.volts[1] = val;
        this.sliderValues.volts[1] = 0;
        this.syncNumericDraft('volts1');
      },
      'voltsDiv.2'(val) {
        this.voltsDivFine[2] = val;
        this.lastValidValue.volts[2] = val;
        this.sliderValues.volts[2] = 0;
        this.syncNumericDraft('volts2');
      },
      // 监听校准系数变化
      'peakValues.1'() {
        this.syncNumericDraft('peak1');
      },
      'peakValues.2'() {
        this.syncNumericDraft('peak2');
      },
      'frequencies.1'() {
        this.syncNumericDraft('freq1');
      },
      'frequencies.2'() {
        this.syncNumericDraft('freq2');
      },
      freqX() {
        this.syncNumericDraft('freq1');
        this.syncNumericDraft('timeDiv');
      },
      freqY() {
        this.syncNumericDraft('freq2');
      },
      phaseDiff() {
        this.syncNumericDraft('phaseDiff');
      },
      triggerLevel() {
        this.syncNumericDraft('triggerLevel');
      },
      expStep() {
        this.syncAllNumericDrafts({ force: true });
      },
      currentMode() {
        this.syncAllNumericDrafts({ force: true });
      },
      calibrationFactor(newVal) {
        this.needsRedraw = true;
        this.calibrationComplete = Math.abs(newVal - 1.0) < 0.02;
        
        // 同步保存到savedCalibrationSettings
        this.savedCalibrationSettings.calibrationFactor = newVal;
      }
    },
    methods: {
      // ===== Canvas 初始化 =====
      getNumericFieldConfig(fieldKey) {
        return getNumericFieldConfigFromController(fieldKey);
      },
      formatNumericFieldValue(fieldKey) {
        return formatNumericFieldValueFromController(this, fieldKey);
      },
      syncNumericDraft(fieldKey, options) {
        return syncNumericDraftFromController(this, fieldKey, options);
      },
      syncAllNumericDrafts(options) {
        return syncAllNumericDraftsFromController(this, options);
      },
      startNumericInput(fieldKey) {
        return startNumericInputFromController(this, fieldKey);
      },
      clearNumericInputError(fieldKey) {
        return clearNumericInputErrorFromController(this, fieldKey);
      },
      showNumericInputError(fieldKey, options) {
        return showNumericInputErrorFromController(this, fieldKey, options);
      },
      clearAllNumericErrorTimers() {
        return clearAllNumericErrorTimersFromController(this);
      },
      evaluateNumericDraft(fieldKey, rawValue) {
        return evaluateNumericDraftFromController(this, fieldKey, rawValue);
      },
      updateNumericDraft(fieldKey, value) {
        return updateNumericDraftFromController(this, fieldKey, value);
      },
      commitNumericInput(fieldKey) {
        return commitNumericInputFromController(this, fieldKey);
      },
      async toggleSerialConnection() {
        await this.serialSession.toggleConnection();
      },
      async disconnectSerialPort({ manual } = { manual: false }) {
        await this.serialSession.disconnect({ manual });
      },
      renderSerialWave() {
        renderSerialWaveFrame({
          ctx: this.ctx,
          constants: WaveformUtilities.CONSTANTS,
          serial: this.serial,
          serialStatusText: this.serialStatusText,
          timeDiv: this.timeDiv,
          voltsDiv: this.voltsDiv[1],
          horizontalPosition: this.horizontalPosition,
          verticalPosition: this.verticalPosition[1],
        });
      },
      initCanvas() {
        const canvas = this.$refs.oscilloscope;
        if (!canvas) {
          throw new Error('Canvas element not found');
        }
        
        // 动态设置Canvas像素尺寸（避免CSS缩放失真）
        canvas.width = APP_CONFIG.canvas.width;
        canvas.height = APP_CONFIG.canvas.height;
        this.ctx = canvas.getContext('2d');
        
        if (!this.ctx) {
          throw new Error('Failed to get canvas context');
        }
        
        // 初始化值
        this.peakValues = { 1: this.peakValue, 2: this.peakValue };
        this.frequencies = { 1: this.frequency, 2: this.frequency };

        // 默认将校准系数设置为0.85，模拟需要校准的初始状态
        this.calibrationFactor = APP_CONFIG.defaultValues.calibrationFactor;

        // 默认开启通道1，这样画面上就会有波形显示
        this.$set(this.inputActive, 1, false);
        this.$set(this.inputActive, 2, false);
      },

      // ===== 事件监听器初始化 =====
      initEventListeners() {
        document.addEventListener('mousemove', this.handleMouseMove);
        document.addEventListener('mouseup', this.handleMouseUp);
        window.addEventListener('resize', this.handleLayoutViewportChange);
      },

      // ===== 清理函数 =====
      getLayoutResizeRange() {
        if (typeof window === 'undefined') {
          return null;
        }

        if (window.innerWidth <= 768) {
          return null;
        }

        if (window.innerWidth <= 959) {
          return {
            min: APP_CONFIG.layout.compactMinWidth,
            max: APP_CONFIG.layout.compactMaxWidth,
            defaultWidth: APP_CONFIG.layout.compactDefaultWidth
          };
        }

        return {
          min: APP_CONFIG.layout.desktopMinWidth,
          max: APP_CONFIG.layout.desktopMaxWidth,
          defaultWidth: this.getDefaultDesktopAsideWidth()
        };
      },

      getDefaultDesktopAsideWidth() {
        if (typeof window === 'undefined') {
          return APP_CONFIG.layout.defaultAsideWidth;
        }

        if (window.innerWidth >= 2560 && window.innerHeight >= 1440) {
          return 400;
        }

        if (window.innerWidth >= 1920 || window.innerHeight >= 1080) {
          return 390;
        }

        return APP_CONFIG.layout.defaultAsideWidth;
      },

      getStoredAsideWidth() {
        try {
          const rawValue = window.localStorage.getItem(APP_CONFIG.layout.storageKey);
          if (!rawValue) {
            return null;
          }

          const parsedValue = Number(rawValue);
          return Number.isFinite(parsedValue) ? parsedValue : null;
        } catch (error) {
          console.warn('Failed to read saved aside width:', error);
          return null;
        }
      },

      persistAsideWidth(width) {
        try {
          window.localStorage.setItem(APP_CONFIG.layout.storageKey, `${width}`);
        } catch (error) {
          console.warn('Failed to persist aside width:', error);
        }
      },

      applyAsideWidth(width, { persist = false } = {}) {
        const range = this.getLayoutResizeRange();
        const layoutMain = this.$refs.layoutMain;

        if (!layoutMain || !range) {
          return;
        }

        const clampedWidth = WaveformUtilities.clamp(width, range.min, range.max);
        this.asideWidth = clampedWidth;
        layoutMain.style.setProperty('--aside-width', `${clampedWidth}px`);

        if (persist) {
          this.persistAsideWidth(clampedWidth);
        }
      },

      initLayoutResizer() {
        const layoutMain = this.$refs.layoutMain;

        if (!layoutMain) {
          return;
        }

        const range = this.getLayoutResizeRange();
        if (!range) {
          layoutMain.style.removeProperty('--aside-width');
          return;
        }

        const savedWidth = this.getStoredAsideWidth();
        const nextWidth = Number.isFinite(savedWidth) ? savedWidth : range.defaultWidth;
        this.applyAsideWidth(nextWidth);
      },

      handleLayoutViewportChange() {
        const layoutMain = this.$refs.layoutMain;
        const range = this.getLayoutResizeRange();

        if (!layoutMain) {
          return;
        }

        if (!range) {
          this.cleanupLayoutResize();
          layoutMain.style.removeProperty('--aside-width');
          return;
        }

        const sourceWidth = Number.isFinite(this.asideWidth)
          ? this.asideWidth
          : (this.getStoredAsideWidth() ?? range.defaultWidth);

        this.applyAsideWidth(sourceWidth);
      },

      handleLayoutResizeStart(event) {
        if (!this.getLayoutResizeRange() || event.button !== 0) {
          return;
        }

        const resizerElement = event.currentTarget || this.$refs.layoutResizer;
        if (!resizerElement) {
          return;
        }

        event.preventDefault();
        this.cleanupLayoutResize();
        this.layoutResizeActive = true;
        this.layoutResizePointerId = event.pointerId;
        this.layoutResizeResizer = resizerElement;
        document.body.classList.add('aside-resizing');

        if (typeof resizerElement.setPointerCapture === 'function') {
          try {
            resizerElement.setPointerCapture(event.pointerId);
          } catch (error) {
            console.warn('Failed to capture pointer for layout resize:', error);
          }
        }

        resizerElement.addEventListener('pointermove', this.handleLayoutResizeMove);
        resizerElement.addEventListener('pointerup', this.handleLayoutResizeEnd);
        resizerElement.addEventListener('pointercancel', this.handleLayoutResizeEnd);
        resizerElement.addEventListener('lostpointercapture', this.handleLayoutResizeEnd);

        this.queueLayoutResize(event.clientX, { flush: true });
      },

      queueLayoutResize(clientX, { flush = false } = {}) {
        if (!this.layoutResizeActive) {
          return;
        }

        const layoutMain = this.$refs.layoutMain;
        if (!layoutMain) {
          return;
        }

        const rect = layoutMain.getBoundingClientRect();
        this.layoutResizePendingWidth = clientX - rect.left;

        if (flush) {
          this.flushLayoutResize();
          return;
        }

        if (this.layoutResizeFrameId !== null) {
          return;
        }

        this.layoutResizeFrameId = requestAnimationFrame(() => {
          this.layoutResizeFrameId = null;
          this.flushLayoutResize();
        });
      },

      flushLayoutResize() {
        if (!this.layoutResizeActive || !Number.isFinite(this.layoutResizePendingWidth)) {
          return;
        }

        this.applyAsideWidth(this.layoutResizePendingWidth);
        this.layoutResizePendingWidth = null;
      },

      handleLayoutResizeMove(event) {
        if (!this.layoutResizeActive || event.pointerId !== this.layoutResizePointerId) {
          return;
        }

        this.queueLayoutResize(event.clientX);
      },

      handleLayoutResizeEnd(event) {
        if (!this.layoutResizeActive) {
          return;
        }

        if (event && event.pointerId != null && event.pointerId !== this.layoutResizePointerId) {
          return;
        }

        this.flushLayoutResize();

        const resizerElement = this.layoutResizeResizer;
        const pointerId = this.layoutResizePointerId;

        if (this.layoutResizeFrameId !== null) {
          cancelAnimationFrame(this.layoutResizeFrameId);
          this.layoutResizeFrameId = null;
        }

        this.layoutResizeActive = false;
        this.layoutResizePendingWidth = null;
        this.layoutResizePointerId = null;
        this.layoutResizeResizer = null;
        document.body.classList.remove('aside-resizing');

        if (resizerElement) {
          resizerElement.removeEventListener('pointermove', this.handleLayoutResizeMove);
          resizerElement.removeEventListener('pointerup', this.handleLayoutResizeEnd);
          resizerElement.removeEventListener('pointercancel', this.handleLayoutResizeEnd);
          resizerElement.removeEventListener('lostpointercapture', this.handleLayoutResizeEnd);

          if (pointerId != null && typeof resizerElement.hasPointerCapture === 'function' && resizerElement.hasPointerCapture(pointerId)) {
            try {
              resizerElement.releasePointerCapture(pointerId);
            } catch (error) {
              console.warn('Failed to release pointer capture for layout resize:', error);
            }
          }
        }

        if (Number.isFinite(this.asideWidth)) {
          this.persistAsideWidth(this.asideWidth);
        }
      },

      cleanupLayoutResize() {
        if (this.layoutResizeFrameId !== null) {
          cancelAnimationFrame(this.layoutResizeFrameId);
          this.layoutResizeFrameId = null;
        }

        const resizerElement = this.layoutResizeResizer;
        const pointerId = this.layoutResizePointerId;

        this.layoutResizeActive = false;
        this.layoutResizePendingWidth = null;
        this.layoutResizePointerId = null;
        this.layoutResizeResizer = null;
        document.body.classList.remove('aside-resizing');

        if (resizerElement) {
          resizerElement.removeEventListener('pointermove', this.handleLayoutResizeMove);
          resizerElement.removeEventListener('pointerup', this.handleLayoutResizeEnd);
          resizerElement.removeEventListener('pointercancel', this.handleLayoutResizeEnd);
          resizerElement.removeEventListener('lostpointercapture', this.handleLayoutResizeEnd);

          if (pointerId != null && typeof resizerElement.hasPointerCapture === 'function' && resizerElement.hasPointerCapture(pointerId)) {
            try {
              resizerElement.releasePointerCapture(pointerId);
            } catch (error) {
              console.warn('Failed to release pointer capture during layout cleanup:', error);
            }
          }
        }
      },

      cleanup() {
        // 取消动画帧
        if (this.animationId) {
          cancelAnimationFrame(this.animationId);
          this.animationId = null;
        }
        if (this.serialSession) {
          this.serialSession.cleanup();
        }
        
        // 移除所有事件监听器
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mouseup', this.handleMouseUp);
        window.removeEventListener('resize', this.handleLayoutViewportChange);
        this.cleanupLayoutResize();
        cleanupCalibrationSliderFromController(this);
      },

      // ===== 绘图循环启动 =====
      startDrawLoop() {
        this.drawLoop();
      },

      // ===== 计算滑块位置的辅助函数 =====
      calculateSliderPosition(type, line) {
        if (type === 'time') {
          // 将0.1-2.0范围映射到0-1范围
          return (this.displayAdjustFactors.time - 0.1) / 1.9;
        } else if (type === 'volts' && line) {
          // 将0.1-2.0范围映射到0-1范围
          return (this.displayAdjustFactors.volts[line] - 0.1) / 1.9;
        }
        return 0;
      },
      getCalibrationSliderKey(type, line) {
        return type === 'time' ? 'time' : `volts-${line}`;
      },
      getCalibrationSliderValue(type, line) {
        return type === 'time'
          ? this.displayAdjustFactors.time
          : this.displayAdjustFactors.volts[line];
      },
      setCalibrationSliderValue(type, line, nextValue) {
        const clampedValue = WaveformUtilities.clamp(nextValue, 0.1, 2.0);

        if (type === 'time') {
          this.displayAdjustFactors.time = clampedValue;
        } else {
          this.displayAdjustFactors.volts[line] = clampedValue;
        }

        this.needsRedraw = true;
        this.refreshDisplay();
      },
      getSliderFeedbackText(type, line) {
        return this.getCalibrationSliderValue(type, line).toFixed(2);
      },
      isSliderFeedbackVisible(type, line) {
        const sliderKey = this.getCalibrationSliderKey(type, line);
        const activeKey = this.sliderActive
          ? this.getCalibrationSliderKey(this.sliderActive.type, this.sliderActive.line)
          : null;

        return this.sliderHover === sliderKey || this.sliderFeedback === sliderKey || activeKey === sliderKey;
      },
      setSliderHover(type, line, hovering) {
        this.sliderHover = hovering ? this.getCalibrationSliderKey(type, line) : null;
      },
      showSliderFeedback(type, line, duration = 900) {
        const sliderKey = this.getCalibrationSliderKey(type, line);

        if (this.sliderFeedbackTimers[sliderKey]) {
          clearTimeout(this.sliderFeedbackTimers[sliderKey]);
          delete this.sliderFeedbackTimers[sliderKey];
        }

        this.sliderFeedback = sliderKey;

        if (duration > 0) {
          this.sliderFeedbackTimers[sliderKey] = setTimeout(() => {
            if (this.sliderFeedback === sliderKey) {
              this.sliderFeedback = null;
            }
            delete this.sliderFeedbackTimers[sliderKey];
          }, duration);
        }
      },
      clearAllSliderFeedbackTimers() {
        Object.keys(this.sliderFeedbackTimers || {}).forEach((sliderKey) => {
          clearTimeout(this.sliderFeedbackTimers[sliderKey]);
        });
        this.sliderFeedbackTimers = {};
        this.sliderFeedback = null;
      },
      updateCalibrationSliderFromClientX(type, line, clientX) {
        if (!this.sliderTrackElement || typeof this.sliderTrackElement.getBoundingClientRect !== 'function') {
          return;
        }

        const rect = this.sliderTrackElement.getBoundingClientRect();

        if (!rect.width) {
          return;
        }

        const normalized = WaveformUtilities.clamp((clientX - rect.left) / rect.width, 0, 1);
        const nextValue = 0.1 + normalized * 1.9;

        this.setCalibrationSliderValue(type, line, nextValue);
      },

      // ===== 模式控制 =====
      switchMode(mode) {
        if (mode === 'lissajous') {
          // 使用LissajousDrawer模块化函数切换到李萨如图模式
          Object.assign(this, LissajousDrawer.switchToLissajousMode(this));
        } else {
          // 使用LissajousDrawer模块化函数切换回波形模式
          Object.assign(this, LissajousDrawer.switchToWaveMode(this));
        }
      },

      // ===== 实验步骤控制 =====
      async setExpStep(step) {
        // 使用CalibrationLogic模块化函数设置实验步骤
        if (!['calibration', 'normal', 'actual'].includes(step)) {
          return;
        }

        if (step === 'actual' && !this.showActualMeasurement) {
          if (this.expStep !== 'normal') {
            step = 'normal';
          } else {
            return;
          }
        }

        if (this.expStep === 'actual' && step !== 'actual' && this.serial.port) {
          await this.disconnectSerialPort({ manual: true });
        }

        const internalStep = step === 'actual' ? 'normal' : step;

        Object.assign(this, CalibrationLogic.setExperimentStep(this, internalStep));
        this.expStep = step;

        if (step === 'actual') {
          this.inputMode = 'serial';
          this.currentMode = 'wave';
          this.displayMode = 'independent';
          this.serial.resumeOnReconnect = true;
        } else {
          this.inputMode = 'simulation';
          this.serial.resumeOnReconnect = false;
        }
        
        // 如果切换到标准测量模式，输出当前校准参数到控制台
        if (internalStep === 'normal') {
          console.log('当前校准参数 (仅控制台显示)', 
            'background:#42b983; color:white; padding:4px 6px; border-radius:3px; font-weight:bold', 
            'font-weight:normal');
          console.log('校准系数: ' + this.savedCalibrationSettings.calibrationFactor.toFixed(2));
          console.log('时间微调: ' + this.savedCalibrationSettings.displayAdjustFactors.time.toFixed(2));
          console.log('通道1电压微调: ' + this.savedCalibrationSettings.displayAdjustFactors.volts[1].toFixed(2));
          console.log('通道2电压微调: ' + this.savedCalibrationSettings.displayAdjustFactors.volts[2].toFixed(2));
        }

        this.needsRedraw = true;
        this.refreshDisplay();
      },

      // ===== 波形控制 =====
      setSignalType(type) {
        // 使用WaveDrawer模块化函数更新波形类型
        Object.assign(this, WaveDrawer.updateWaveformType(this, type));
        this.refreshDisplay();
      },

      // ===== 控制运行状态 =====
      toggleRunning() {
        this.isRunning = !this.isRunning;
        if (this.isRunning) {
          if (this.inputMode === 'serial') {
            logSerialMessage('Actual measurement resumed.', 'info');
          }
          this.drawLoop();
        } else {
          cancelAnimationFrame(this.animationId);
          this.lastCapturedFrame = this.ctx.getImageData(0, 0, 800, 400);
          if (this.inputMode === 'serial') {
            logSerialMessage('Actual measurement paused. Display frozen and serial samples ignored.', 'warn');
          }
        }
      },

      // ===== 绘图工具方法：获取有效校准参数 =====
      getEffectiveCalibrationParams() {
        const useCalibrationParams = this.expStep === 'calibration';
        
        return {
          useCalibrationParams,
          effectiveCalibrationFactor: useCalibrationParams ? 
                                      this.calibrationFactor : 
                                      this.savedCalibrationSettings.calibrationFactor,
          effectiveDisplayFactors: useCalibrationParams ? 
                                  this.displayAdjustFactors : 
                                  this.savedCalibrationSettings.displayAdjustFactors
        };
      },
      
      // ===== 绘图工具方法：调整触发相位 =====
      adjustTriggerPhase() {
        if (!this.inputActive[1] && !this.inputActive[2]) return this.phase;
        
        const { useCalibrationParams, effectiveCalibrationFactor, effectiveDisplayFactors } = 
          this.getEffectiveCalibrationParams();
        
        // 使用WaveDrawer模块处理触发器相位调整
        return WaveDrawer.adjustPhaseForTrigger({
          triggerActive: this.triggerActive,
          triggerSource: this.triggerSource,
          inputActive: this.inputActive,
          voltsDiv: this.voltsDiv,
          peakValues: this.peakValues,
          frequencies: this.frequencies,
          timeDiv: this.timeDiv,
          expStep: this.expStep,
          calibrationParams: this.calibrationParams,
          signalType: this.signalType,
          phase: this.phase,
          triggerLevel: this.triggerLevel,
          triggerSlope: this.triggerSlope,
          displayAdjustFactors: effectiveDisplayFactors,
          calibrationFactor: effectiveCalibrationFactor
        });
      },
      
      // ===== 绘图工具方法：绘制波形 =====
      renderWaveforms() {
        const { CONSTANTS, CHANNEL_COLORS } = WaveformUtilities;
        
        // 判断是否使用同向叠加模式且两个通道都激活
        if (this.displayMode === 'overlay' && this.inputActive[1] && this.inputActive[2]) {
          // 获取有效校准参数
          const { effectiveCalibrationFactor, effectiveDisplayFactors } = 
            this.getEffectiveCalibrationParams();
          
          // 绘制叠加波形
          WaveDrawer.drawOverlayWave(this.ctx, {
            expStep: this.expStep, 
            signalType: this.signalType,
            calibrationParams: this.calibrationParams,
            timeDiv: this.timeDiv,
            frequencies: this.frequencies,
            peakValues: this.peakValues,
            voltsDiv: this.voltsDiv,
            phase: this.phase,
            displayAdjustFactors: effectiveDisplayFactors,
            calibrationFactor: effectiveCalibrationFactor,
            horizontalPosition: this.horizontalPosition,
            verticalPosition: {
              1: this.verticalPosition[1],
              2: this.verticalPosition[2]
            },
            inputActive: this.inputActive,
            phaseDiff: this.phaseDiff
          });
        } else {
          // 非叠加模式或只有一个通道激活时，正常绘制各通道波形
          if (this.inputActive[1]) this.drawWave(1, CHANNEL_COLORS[1]);
          if (this.inputActive[2]) this.drawWave(2, CHANNEL_COLORS[2]);
        }
      },
      
      // ===== 绘图工具方法：渲染李萨如图模式 =====
      renderLissajousMode() {
        // 检查是否两个通道都开启
        if (this.inputActive[1] && this.inputActive[2]) {
          this.drawLissajous();
        } else {
          // 如有通道未开启，显示提示信息
          const { CONSTANTS } = WaveformUtilities;
          const ctx = this.ctx;
          
          ctx.font = '18px Arial';
          ctx.fillStyle = '#666';
          ctx.textAlign = 'center';
          ctx.fillText('请开启两个通道以显示李萨如图', 
                      CONSTANTS.CANVAS.WIDTH / 2, 
                      CONSTANTS.CANVAS.HEIGHT / 2);
        }
      },
      
      // ===== 绘图工具方法：初始化画布 =====
      setupCanvas() {
        const { CONSTANTS } = WaveformUtilities;
        const ctx = this.ctx;
        
        // 清除画布
        ctx.clearRect(0, 0, CONSTANTS.CANVAS.WIDTH, CONSTANTS.CANVAS.HEIGHT);
        
        // 绘制网格
        WaveformUtilities.drawGrid(ctx);
        
        // 波形模式下绘制触发电平线
        if ((this.currentMode === 'wave' || this.expStep === 'calibration' || this.expStep === 'actual') &&
            (this.inputMode !== 'serial' || this.expStep === 'actual')) {
          WaveDrawer.drawTriggerLevel(ctx, this.triggerLevelPosition);
        }
      },
      
      // ===== 暂停状态下刷新显示 =====
      refreshDisplay() {
        // 设置画布
        this.setupCanvas();
        
        if (this.inputMode === 'serial') {
          this.renderSerialWave();
          if (!this.isRunning) {
            const { CONSTANTS } = WaveformUtilities;
            this.lastCapturedFrame = this.ctx.getImageData(
              0, 0, CONSTANTS.CANVAS.WIDTH, CONSTANTS.CANVAS.HEIGHT
            );
          }
          return;
        }
        
        if (this.currentMode === 'wave' || this.expStep === 'calibration') {
          // 调整相位
          if (this.inputActive[1] || this.inputActive[2]) {
            this.phase = this.adjustTriggerPhase();
          }
          
          // 绘制波形
          this.renderWaveforms();
        } else {
          // 李萨如图模式
          this.renderLissajousMode();
        }
        
        // 保存当前画布状态
        if (!this.isRunning) {
          const { CONSTANTS } = WaveformUtilities;
          this.lastCapturedFrame = this.ctx.getImageData(
            0, 0, CONSTANTS.CANVAS.WIDTH, CONSTANTS.CANVAS.HEIGHT
          );
        }
      },

      // ===== 调整触发电平 =====
      adjustLevel(delta) {
        this.triggerLevel = WaveformUtilities.clamp(this.triggerLevel + delta, -5, 5);
        this.needsRedraw = true;
        this.refreshDisplay();
      },

      // ===== 绘图主循环 =====
      drawLoop() {
        try {
          if (!this.isRunning) return;

          // 设置画布
          this.setupCanvas();

          if (this.inputMode === 'serial') {
            this.renderSerialWave();
            if (this.isRunning) {
              this.animationId = requestAnimationFrame(this.drawLoop);
            }
            return;
          }

          if (this.currentMode === 'wave' || this.expStep === 'calibration') {
            // 调整相位
            if (this.inputActive[1] || this.inputActive[2]) {
              this.phase = this.adjustTriggerPhase();
            }
            
            // 绘制波形
            this.renderWaveforms();
          } else {
            // 李萨如图模式
            this.renderLissajousMode();
          }

          if (this.isRunning) {
            // 在演示动画期间减慢50%
            const phaseIncrement = (window.demoAnimation && window.demoAnimation.isPlaying) ? 0.01 : 0.02;
            this.phase += phaseIncrement;
            this.animationId = requestAnimationFrame(this.drawLoop);
          }
        } catch (error) {
          console.error('Draw loop error:', error);
        }
      },

      // ===== 绘制波形（包装WaveDrawer模块的函数） =====
      drawWave(line, color) {
        try {
          // 获取有效校准参数
          const { effectiveCalibrationFactor, effectiveDisplayFactors } = 
            this.getEffectiveCalibrationParams();
          
          // 使用WaveDrawer模块绘制波形
          WaveDrawer.drawWave(this.ctx, {
            line, 
            color, 
            expStep: this.expStep, 
            signalType: this.signalType,
            calibrationParams: this.calibrationParams,
            timeDiv: this.timeDiv,
            frequencies: this.frequencies,
            peakValues: this.peakValues,
            voltsDiv: this.voltsDiv,
            phase: this.phase,
            displayAdjustFactors: effectiveDisplayFactors,
            calibrationFactor: effectiveCalibrationFactor,
            horizontalPosition: this.horizontalPosition,
            verticalPosition: this.verticalPosition[line],
            displayMode: this.displayMode,
            phaseDiff: this.phaseDiff
          });
        } catch (error) {
          console.error('Wave drawing failed:', error);
        }
      },

      // ===== 绘制李萨如图（包装LissajousDrawer模块的函数） =====
      drawLissajous() {
        try {
          // 通道检查已在renderLissajousMode方法中处理，这里可直接绘制
          LissajousDrawer.drawLissajous(this.ctx, {
            freqX: this.freqX,
            freqY: this.freqY,
            phaseDiff: this.phaseDiff,
            phase: this.phase,
            lissajousOptimization: this.lissajousOptimization,
            peakValues: this.peakValues,
            horizontalPosition: this.horizontalPosition,
            verticalPosition: this.verticalPosition,
            voltsDiv: this.voltsDiv
          });
        } catch (error) {
          console.error('Lissajous drawing failed:', error);
        }
      },

      // ===== 输入控制 =====
      handleInput(type, value, line) {
        try {
          let parsedValue = Number(value);
          if (isNaN(parsedValue)) {
            throw new Error('Invalid input: Not a number');
          }

          if (type === 'time') {
            // 使用1:2:5步长比例获取最接近的有效值
            const closestValue = StepAdjustmentUtils.getClosestTimeDiv(parsedValue);
            this.timeDiv = WaveformUtilities.clamp(closestValue, 0.1, 100);
            this.sliderValues.time = 0;
          } else if (type === 'volts') {
            // 使用1:2:5步长比例获取最接近的有效值
            const closestValue = StepAdjustmentUtils.getClosestVoltsDiv(parsedValue);
            this.voltsDiv[line] = WaveformUtilities.clamp(closestValue, 0.01, 10);
            this.sliderValues.volts[line] = 0;
          }
          this.needsRedraw = true;
        } catch (error) {
          console.error('Input handling failed:', error);
        }
      },

      // ===== 滑块控制 =====
      onSliderStart() {
        this.isDragging = true;
      },
      onSliderEnd() {
        this.isDragging = false;
      },
      handleSliderInput(type, line, event) {
        try {
          const percent = parseFloat(event.target.value);
          if (type === 'time') {
            this.displayAdjustFactors.time = 1.0 + percent * 0.2;
          } else if (type === 'volts') {
            this.displayAdjustFactors.volts[line] = 1.0 + percent * 0.2;
          }
          this.needsRedraw = true;
        } catch (error) {
          console.error('Slider input handling failed:', error);
        }
      },
      startSlider(type, line) {
        this.sliderActive = { type, line };
        this.sliderStartValue = type === 'time' 
          ? this.displayAdjustFactors.time 
          : this.displayAdjustFactors.volts[line];
        
        // 记录起始鼠标位置
        this.sliderStartMouseX = null;
        
        document.addEventListener('mousemove', this.handleSliderMove);
        document.addEventListener('mouseup', this.handleSliderEnd);
      },
      handleSliderMove(event) {
        if (!this.sliderActive) return;
        
        const { type, line } = this.sliderActive;
      
        // 获取滑块的 min/max 范围，动态计算灵敏度
        const range = type === 'time' 
          ? { min: 0.1, max: 2.0 } 
          : { min: 0.1, max: 2.0 };
        const valueRange = range.max - range.min;
        const sensitivity = valueRange / 300; // 鼠标移动1px，变动1/300的范围，适应新的300px宽度
      
        const adjustAmount = event.movementX * sensitivity;
      
        Object.assign(this, CalibrationLogic.updateAdjustFactor(this, type, line, adjustAmount));
        
        if (type === 'time'){
          console.log(`时间微调: ${this.displayAdjustFactors.time.toFixed(2)}`);
        } else if (type === 'volts') {
          console.log(`通道${line}电压微调: ${this.displayAdjustFactors.volts[line].toFixed(2)}`);
        }
        
        this.refreshDisplay();
      },
      handleSliderEnd() {
        this.sliderActive = null;
        document.removeEventListener('mousemove', this.handleSliderMove);
        document.removeEventListener('mouseup', this.handleSliderEnd);
      },
      startSlider(type, line, event) {
        if (event && typeof event.preventDefault === 'function') {
          event.preventDefault();
        }

        this.sliderActive = { type, line };
        this.sliderTrackElement = event?.currentTarget || null;
        this.showSliderFeedback(type, line, 0);
        this.updateCalibrationSliderFromClientX(type, line, event?.clientX ?? 0);

        document.addEventListener('mousemove', this.handleSliderMove);
        document.addEventListener('mouseup', this.handleSliderEnd);
      },
      handleSliderMove(event) {
        if (!this.sliderActive) return;

        const { type, line } = this.sliderActive;
        this.updateCalibrationSliderFromClientX(type, line, event.clientX);
      },
      handleSliderWheel(type, line, event) {
        event.preventDefault();

        const currentValue = this.getCalibrationSliderValue(type, line);
        const delta = event.deltaY < 0 ? 0.02 : -0.02;

        this.setCalibrationSliderValue(type, line, currentValue + delta);
        this.showSliderFeedback(type, line, 900);
      },
      handleSliderEnd() {
        if (this.sliderActive) {
          this.showSliderFeedback(this.sliderActive.type, this.sliderActive.line, 900);
        }

        this.sliderActive = null;
        this.sliderTrackElement = null;
        document.removeEventListener('mousemove', this.handleSliderMove);
        document.removeEventListener('mouseup', this.handleSliderEnd);
      },
      handleMouseMove(event) {
        // 当前仅处理非滑块相关的鼠标移动
        if (this.someOtherDragOperation) {
          // 可扩展其他拖动操作
        }
      },
      toggleInput(line) {
        try {
          this.$set(this.inputActive, line, !this.inputActive[line]);
          this.needsRedraw = true;
          if (this.expStep === 'calibration' || !this.isRunning) {
            this.refreshDisplay();
          }
        } catch (error) {
          console.error('Toggle input failed:', error);
        }
      },
      calculateRange(type, line) {
        return {
          min: -1,
          max: 1,
          step: 0.01
        };
      },
      adjustParam(param, step, line) {
        try {
          const direction = step > 0 ? 1 : -1;
          
          if (['freqX', 'freqY', 'phaseDiff'].includes(param)) {
            // 使用1:2:5步长比例调整李萨如参数
            if (param === 'freqX') {
              this.freqX = StepAdjustmentUtils.adjustFrequency(this.freqX, direction);
            } else if (param === 'freqY') {
              this.freqY = StepAdjustmentUtils.adjustFrequency(this.freqY, direction);
            } else if (param === 'phaseDiff') {
              this.phaseDiff = StepAdjustmentUtils.adjustPhase(this.phaseDiff, direction);
            }
          } else {
            // 使用1:2:5步长比例调整示波器参数
            if (param === 'timeDiv') {
              this.timeDiv = StepAdjustmentUtils.adjustTimeDiv(this.timeDiv, direction);
            } else if (param === 'voltsDiv' && line) {
              this.voltsDiv[line] = StepAdjustmentUtils.adjustVoltsDiv(this.voltsDiv[line], direction);
            }
          }
          this.refreshDisplay();
        } catch (error) {
          console.error('Parameter adjustment failed:', error);
        }
      },
      validateInput(type, line) {
        try {
          if (type === 'time') {
            // 使用1:2:5步长比例验证时间分度
            const closestValue = StepAdjustmentUtils.getClosestTimeDiv(this.timeDiv);
            this.timeDiv = WaveformUtilities.clamp(closestValue, 0.1, 100);
          } else if (type === 'volts' && line) {
            // 使用1:2:5步长比例验证电压分度
            const closestValue = StepAdjustmentUtils.getClosestVoltsDiv(this.voltsDiv[line]);
            this.voltsDiv[line] = WaveformUtilities.clamp(closestValue, 0.01, 10);
          }
          this.refreshDisplay();
        } catch (error) {
          console.error('Input validation failed:', error);
        }
      },
      resetTrigger() {
        if (!this.isRunning) {
          console.log('暂停状态下无法重置触发电平，请先恢复运行');
          alert('暂停状态下无法重置触发电平，请先恢复运行');
          return;
        }
        
        // 使用WaveDrawer模块化函数重置触发系统
        Object.assign(this, WaveDrawer.resetTriggerSystem(this));
        console.log('触发电平已重置为0');
        this.needsRedraw = true;
      },
      toggleTriggerSlope() {
        // 使用WaveDrawer模块化函数切换触发斜率
        this.triggerSlope = WaveDrawer.toggleTriggerSlope(this.triggerSlope);
        this.needsRedraw = true;
        this.refreshDisplay();
      },
      setTriggerSource(channel) {
        if (channel === 1 || channel === 2) {
          this.triggerSource = channel;
          this.needsRedraw = true;
          this.refreshDisplay();
        }
      },
      // ===== 调整位置参数（水平位置和垂直位置） =====
      adjustPosition(type, step, line) {
        try {
          // 位置采用“对齐网格”的固定步长（0.1格），保证与方格对齐
          const unit = 0.1;
          const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
          const snap = (v) => Math.round(v / unit) * unit; // 对齐到 0.1 的倍数

          // 若模板传入 step（如 ±0.1），直接作为增量使用；否则回退到 ±unit
          const delta = (typeof step === 'number' && !Number.isNaN(step) && step !== 0)
            ? step
            : unit;

          if (type === 'horizontal') {
            // 为符合直觉：点按“左”应使波形向左移动，这里反向应用增量
            const updated = this.horizontalPosition - delta;
            this.horizontalPosition = clamp(snap(updated), -8, 8);
          } else if (type === 'vertical' && line) {
            const updated = this.verticalPosition[line] + delta;
            this.verticalPosition[line] = clamp(snap(updated), -4, 4);
          }
          this.needsRedraw = true;
          this.refreshDisplay();
        } catch (error) {
          console.error('Position adjustment failed:', error);
        }
      },
      // ===== 设置显示模式 =====
      calculateSliderPosition(type, line) {
        return calculateSliderPositionFromController(this, type, line);
      },
      getCalibrationSliderKey(type, line) {
        return getCalibrationSliderKeyFromController(type, line);
      },
      getCalibrationSliderValue(type, line) {
        return getCalibrationSliderValueFromController(this, type, line);
      },
      setCalibrationSliderValue(type, line, nextValue) {
        return setCalibrationSliderValueFromController(this, type, line, nextValue);
      },
      getSliderFeedbackText(type, line) {
        return getSliderFeedbackTextFromController(this, type, line);
      },
      isSliderFeedbackVisible(type, line) {
        return isSliderFeedbackVisibleFromController(this, type, line);
      },
      setSliderHover(type, line, hovering) {
        return setSliderHoverFromController(this, type, line, hovering);
      },
      showSliderFeedback(type, line, duration = 900) {
        return showSliderFeedbackFromController(this, type, line, duration);
      },
      clearAllSliderFeedbackTimers() {
        return clearAllSliderFeedbackTimersFromController(this);
      },
      updateCalibrationSliderFromClientX(type, line, clientX) {
        return updateCalibrationSliderFromClientXFromController(this, type, line, clientX);
      },
      startSlider(type, line, event) {
        return startCalibrationSliderFromController(this, type, line, event);
      },
      handleSliderMove(event) {
        return handleCalibrationSliderMoveFromController(this, event);
      },
      handleSliderWheel(type, line, event) {
        return handleCalibrationSliderWheelFromController(this, type, line, event);
      },
      handleSliderEnd() {
        return handleCalibrationSliderEndFromController(this);
      },
      setDisplayMode(mode) {
        if (['independent', 'overlay', 'vertical'].includes(mode)) {
          if (this.expStep === 'actual' && mode !== 'independent') {
            return;
          }
          // 如果是overlay或vertical模式，需要检查两个通道是否都已激活
          if (mode === 'overlay' || mode === 'vertical') {
            // 如果两个通道都激活，才设置为该模式
            if (this.inputActive[1] && this.inputActive[2]) {
              this.displayMode = mode;
            } else {
              // 如果有通道未激活，提示用户并保持原来的显示模式
              const modeName = mode === 'overlay' ? '同向叠加' : '垂直叠加';
              console.log(`请先激活两个通道后再使用${modeName}模式`);
              alert(`${modeName}模式需要两个通道都激活！请先开启通道1和通道2。`);
              return;
            }
          } else {
            // 非overlay和vertical模式，直接设置
            this.displayMode = mode;
          }
          
          // 当选择垂直叠加时，自动切换到李萨如图模式
          if (mode === 'vertical') {
            this.switchMode('lissajous');
          } else if (this.currentMode === 'lissajous' && mode !== 'vertical') {
            // 从垂直叠加切换回其他模式时，自动切换回波形模式
            this.switchMode('wave');
          }
          
          this.needsRedraw = true;
          this.refreshDisplay();
        }
      }
    }
  });
}

// ===== 启动应用 =====
initApp();

// ===== 初始化右上角切换控件（外部页） =====
const bootExternalSwitcher = () => {
  if (typeof document !== 'undefined') {
    renderSwitcher('external');
  }
};
if (typeof document !== 'undefined' && document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootExternalSwitcher);
} else {
  bootExternalSwitcher();
}

//启动引导框
tourGuideManager.start();
