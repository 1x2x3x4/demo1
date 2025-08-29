/**
 * 波形生成器类
 * 负责生成各种波形并计算偏转电压
 */
export class WaveformGenerator {
  constructor() {
    this.time = 0;
    this.lastTimestamp = 0;
  }

  /**
   * 更新时间
   * @param {number} timestamp - 当前时间戳
   */
  update(timestamp) {
    // 计算时间增量（秒）
    if (this.lastTimestamp === 0) {
      this.lastTimestamp = timestamp;
      return;
    }
    
    const deltaTime = (timestamp - this.lastTimestamp) / 1000;
    this.lastTimestamp = timestamp;
    
    // 更新内部时间
    this.time += deltaTime;
  }

  /**
   * 生成波形值
   * @param {Object} params - 波形参数
   * @returns {number} - 波形值 (-1 到 1 之间)
   */
  generateWaveform(params) {
    if (!params.enabled) {
      return 0;
    }
    
    const { type, frequency, amplitude, phase } = params;
    const t = this.time * frequency * Math.PI * 2 + phase;
    
    switch (type) {
      case 'sine':
        return Math.sin(t) * amplitude;
      case 'square':
        return Math.sign(Math.sin(t)) * amplitude;
      case 'sawtooth':
        return (((t / (Math.PI * 2)) % 1) * 2 - 1) * amplitude;
      case 'triangle':
        return (Math.abs(((t / Math.PI) % 2) - 1) * 2 - 1) * amplitude;
      default:
        return 0;
    }
  }
  
  /**
   * 计算当前的偏转电压
   * @param {Object} waveformParams - 波形参数
   * @param {Object} deflectionParams - 偏转参数
   * @returns {Object} - 包含水平和垂直偏转电压的对象
   */
  calculateDeflectionVoltage(waveformParams, deflectionParams) {
    // 获取基础电压值
    const baseHorizontal = deflectionParams.horizontal.voltage;
    const baseVertical = deflectionParams.vertical.voltage;
    
    // 如果波形未启用，直接返回基础电压
    if (!waveformParams.enabled) {
      return {
        horizontal: baseHorizontal,
        vertical: baseVertical
      };
    }
    
    // 生成波形值
    const waveValue = this.generateWaveform(waveformParams);
    
    // 计算最终电压 (基础电压 + 波形值)
    return {
      horizontal: baseHorizontal + waveValue,
      vertical: baseVertical
    };
  }
} 