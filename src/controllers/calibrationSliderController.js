import * as WaveformUtilities from '../../scripts/WaveformUtilities.js';

export function createCalibrationSliderState() {
  return {
    sliderActive: null,
    sliderHover: null,
    sliderFeedback: null,
    sliderOffset: 0,
  };
}

export function calculateSliderPosition(app, type, line) {
  if (type === 'time') {
    return (app.displayAdjustFactors.time - 0.1) / 1.9;
  }
  if (type === 'volts' && line) {
    return (app.displayAdjustFactors.volts[line] - 0.1) / 1.9;
  }
  return 0;
}

export function getCalibrationSliderKey(type, line) {
  return type === 'time' ? 'time' : `volts-${line}`;
}

export function getCalibrationSliderValue(app, type, line) {
  return type === 'time'
    ? app.displayAdjustFactors.time
    : app.displayAdjustFactors.volts[line];
}

export function setCalibrationSliderValue(app, type, line, nextValue) {
  const clampedValue = WaveformUtilities.clamp(nextValue, 0.1, 2.0);

  if (type === 'time') {
    app.displayAdjustFactors.time = clampedValue;
  } else {
    app.displayAdjustFactors.volts[line] = clampedValue;
  }

  app.needsRedraw = true;
  app.refreshDisplay();
}

export function getSliderFeedbackText(app, type, line) {
  return getCalibrationSliderValue(app, type, line).toFixed(2);
}

export function isSliderFeedbackVisible(app, type, line) {
  const sliderKey = getCalibrationSliderKey(type, line);
  const activeKey = app.sliderActive
    ? getCalibrationSliderKey(app.sliderActive.type, app.sliderActive.line)
    : null;

  return app.sliderHover === sliderKey || app.sliderFeedback === sliderKey || activeKey === sliderKey;
}

export function setSliderHover(app, type, line, hovering) {
  app.sliderHover = hovering ? getCalibrationSliderKey(type, line) : null;
}

export function showSliderFeedback(app, type, line, duration = 900) {
  const sliderKey = getCalibrationSliderKey(type, line);

  if (app.sliderFeedbackTimers[sliderKey]) {
    clearTimeout(app.sliderFeedbackTimers[sliderKey]);
    delete app.sliderFeedbackTimers[sliderKey];
  }

  app.sliderFeedback = sliderKey;

  if (duration > 0) {
    app.sliderFeedbackTimers[sliderKey] = setTimeout(() => {
      if (app.sliderFeedback === sliderKey) {
        app.sliderFeedback = null;
      }
      delete app.sliderFeedbackTimers[sliderKey];
    }, duration);
  }
}

export function clearAllSliderFeedbackTimers(app) {
  Object.keys(app.sliderFeedbackTimers || {}).forEach((sliderKey) => {
    clearTimeout(app.sliderFeedbackTimers[sliderKey]);
  });
  app.sliderFeedbackTimers = {};
  app.sliderFeedback = null;
}

export function updateCalibrationSliderFromClientX(app, type, line, clientX) {
  if (!app.sliderTrackElement || typeof app.sliderTrackElement.getBoundingClientRect !== 'function') {
    return;
  }

  const rect = app.sliderTrackElement.getBoundingClientRect();
  if (!rect.width) {
    return;
  }

  const normalized = WaveformUtilities.clamp((clientX - rect.left) / rect.width, 0, 1);
  const nextValue = 0.1 + normalized * 1.9;

  setCalibrationSliderValue(app, type, line, nextValue);
}

export function startCalibrationSlider(app, type, line, event) {
  if (event && typeof event.preventDefault === 'function') {
    event.preventDefault();
  }

  app.sliderActive = { type, line };
  app.sliderTrackElement = event?.currentTarget || null;
  showSliderFeedback(app, type, line, 0);
  updateCalibrationSliderFromClientX(app, type, line, event?.clientX ?? 0);

  document.addEventListener('mousemove', app.handleSliderMove);
  document.addEventListener('mouseup', app.handleSliderEnd);
}

export function handleCalibrationSliderMove(app, event) {
  if (!app.sliderActive) return;

  const { type, line } = app.sliderActive;
  updateCalibrationSliderFromClientX(app, type, line, event.clientX);
}

export function handleCalibrationSliderWheel(app, type, line, event) {
  event.preventDefault();

  const currentValue = getCalibrationSliderValue(app, type, line);
  const delta = event.deltaY < 0 ? 0.02 : -0.02;

  setCalibrationSliderValue(app, type, line, currentValue + delta);
  showSliderFeedback(app, type, line, 900);
}

export function handleCalibrationSliderEnd(app) {
  if (app.sliderActive) {
    showSliderFeedback(app, app.sliderActive.type, app.sliderActive.line, 900);
  }

  app.sliderActive = null;
  app.sliderTrackElement = null;
  document.removeEventListener('mousemove', app.handleSliderMove);
  document.removeEventListener('mouseup', app.handleSliderEnd);
}

export function cleanupCalibrationSlider(app) {
  document.removeEventListener('mousemove', app.handleSliderMove);
  document.removeEventListener('mouseup', app.handleSliderEnd);
  app.sliderTrackElement = null;
}
