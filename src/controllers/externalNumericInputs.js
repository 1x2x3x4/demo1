export const NUMERIC_INPUT_CONFIG = {
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

export function createNumericInputState() {
  return {
    inputDrafts: {
      peak1: '',
      peak2: '',
      freq1: '',
      freq2: '',
      phaseDiff: '',
      timeDiv: '',
      volts1: '',
      volts2: '',
      triggerLevel: '',
    },
    inputErrors: {
      peak1: false,
      peak2: false,
      freq1: false,
      freq2: false,
      phaseDiff: false,
      timeDiv: false,
      volts1: false,
      volts2: false,
      triggerLevel: false,
    },
    inputErrorLeaving: {
      peak1: false,
      peak2: false,
      freq1: false,
      freq2: false,
      phaseDiff: false,
      timeDiv: false,
      volts1: false,
      volts2: false,
      triggerLevel: false,
    },
    activeDraftField: null,
  };
}

export function formatNumericDraftValue(value, precision = 3) {
  return Number.isFinite(value) ? value.toFixed(precision).replace(/\.?0+$/, '') : '';
}

export function getNumericFieldConfig(fieldKey) {
  return NUMERIC_INPUT_CONFIG[fieldKey] || null;
}

export function formatNumericFieldValue(app, fieldKey) {
  const config = getNumericFieldConfig(fieldKey);
  if (!config) return '';
  return formatNumericDraftValue(config.get(app), config.precision);
}

export function syncNumericDraft(app, fieldKey, { force = false } = {}) {
  if (!force && app.activeDraftField === fieldKey) {
    return;
  }

  app.$set(app.inputDrafts, fieldKey, formatNumericFieldValue(app, fieldKey));

  if (force) {
    app.$set(app.inputErrors, fieldKey, false);
    app.$set(app.inputErrorLeaving, fieldKey, false);
  }
}

export function syncAllNumericDrafts(app, { force = false } = {}) {
  Object.keys(NUMERIC_INPUT_CONFIG).forEach((fieldKey) => {
    syncNumericDraft(app, fieldKey, { force });
  });
}

export function clearNumericInputError(app, fieldKey) {
  if (app.inputErrorTimers[fieldKey]) {
    clearTimeout(app.inputErrorTimers[fieldKey]);
    delete app.inputErrorTimers[fieldKey];
  }

  app.$set(app.inputErrors, fieldKey, false);
  app.$set(app.inputErrorLeaving, fieldKey, false);
}

export function showNumericInputError(app, fieldKey, { autoHideMs = 0 } = {}) {
  if (app.inputErrorTimers[fieldKey]) {
    clearTimeout(app.inputErrorTimers[fieldKey]);
    delete app.inputErrorTimers[fieldKey];
  }

  app.$set(app.inputErrors, fieldKey, true);
  app.$set(app.inputErrorLeaving, fieldKey, false);

  if (autoHideMs > 0) {
    app.inputErrorTimers[fieldKey] = setTimeout(() => {
      app.$set(app.inputErrorLeaving, fieldKey, true);

      app.inputErrorTimers[fieldKey] = setTimeout(() => {
        app.$set(app.inputErrors, fieldKey, false);
        app.$set(app.inputErrorLeaving, fieldKey, false);
        delete app.inputErrorTimers[fieldKey];
      }, 180);
    }, autoHideMs);
  }
}

export function clearAllNumericErrorTimers(app) {
  Object.keys(app.inputErrorTimers || {}).forEach((fieldKey) => {
    clearTimeout(app.inputErrorTimers[fieldKey]);
  });
  app.inputErrorTimers = {};
}

export function startNumericInput(app, fieldKey) {
  app.activeDraftField = fieldKey;
  clearNumericInputError(app, fieldKey);
}

export function evaluateNumericDraft(fieldKey, rawValue) {
  const config = getNumericFieldConfig(fieldKey);
  if (!config) {
    return { status: 'invalid' };
  }

  const value = `${rawValue ?? ''}`.trim();

  if (
    value === '' ||
    /^-?$/.test(value) ||
    /^-?\.$/.test(value) ||
    /^-?\d+\.$/.test(value)
  ) {
    return { status: 'intermediate' };
  }

  const parsedValue = Number(value);
  if (!Number.isFinite(parsedValue)) {
    return { status: 'invalid' };
  }

  if (parsedValue < config.min || parsedValue > config.max) {
    return { status: 'invalid' };
  }

  return {
    status: 'valid',
    normalizedValue: Number(parsedValue.toFixed(config.precision)),
  };
}

export function updateNumericDraft(app, fieldKey, value) {
  app.activeDraftField = fieldKey;
  app.$set(app.inputDrafts, fieldKey, value);

  const result = evaluateNumericDraft(fieldKey, value);
  if (result.status === 'valid') {
    const config = getNumericFieldConfig(fieldKey);
    config.set(app, result.normalizedValue);
    clearNumericInputError(app, fieldKey);
    app.needsRedraw = true;
    app.refreshDisplay();
    return;
  }

  if (result.status === 'invalid') {
    showNumericInputError(app, fieldKey);
    return;
  }

  clearNumericInputError(app, fieldKey);
}

export function commitNumericInput(app, fieldKey) {
  const config = getNumericFieldConfig(fieldKey);
  if (!config) {
    return;
  }

  const rawValue = `${app.inputDrafts[fieldKey] ?? ''}`.trim();
  const fallbackValue = formatNumericFieldValue(app, fieldKey);
  const rejectDraft = () => {
    app.$set(app.inputDrafts, fieldKey, fallbackValue);
    app.activeDraftField = null;
    showNumericInputError(app, fieldKey, { autoHideMs: 900 });
  };

  const result = evaluateNumericDraft(fieldKey, rawValue);
  if (result.status !== 'valid') {
    rejectDraft();
    return;
  }

  config.set(app, result.normalizedValue);
  clearNumericInputError(app, fieldKey);
  app.activeDraftField = null;
  syncNumericDraft(app, fieldKey, { force: true });
  app.needsRedraw = true;
  app.refreshDisplay();
}
