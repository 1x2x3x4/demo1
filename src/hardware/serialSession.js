import { OscilloscopeConstants } from '../../scripts/constants.js';

export const SERIAL_CONFIG = {
  baudRate: 115200,
  bufferCapacity: Math.max(200, OscilloscopeConstants.CANVAS.WIDTH),
  reconnectDelays: [1000, 2000, 5000, 10000],
  smoothingAlpha: 0.24,
};

const SERIAL_STATUS_TEXT = {
  disconnected: 'Not connected',
  connecting: 'Connecting...',
  connected: 'Connected',
  reconnecting: 'Reconnecting...',
  error: 'Connection failed',
};

const SERIAL_STATUS_TONE = {
  disconnected: 'is-idle',
  connecting: 'is-pending',
  connected: 'is-connected',
  reconnecting: 'is-pending',
  error: 'is-error',
};

export function createSerialState() {
  return {
    supported: typeof navigator !== 'undefined' && 'serial' in navigator,
    status: 'disconnected',
    error: '',
    port: null,
    reader: null,
    keepReading: false,
    chunkRemainder: '',
    decoder: null,
    buffer: [],
    bufferCapacity: SERIAL_CONFIG.bufferCapacity,
    filteredValue: null,
    reconnectTimer: null,
    reconnectAttempt: 0,
    autoReconnectEnabled: false,
    resumeOnReconnect: false,
    hadSuccessfulConnection: false,
  };
}

export function getSerialStatusText(serial) {
  return SERIAL_STATUS_TEXT[serial.status] || 'Unknown';
}

export function getSerialStatusTone(serial) {
  return SERIAL_STATUS_TONE[serial.status] || 'is-idle';
}

export function getSerialConnectButtonText(serial) {
  if (['connected', 'connecting', 'reconnecting'].includes(serial.status)) {
    return 'Disconnect';
  }

  return 'Connect Arduino';
}

export function logSerialMessage(message, level = 'info') {
  const levelMap = {
    info: 'log',
    success: 'info',
    warn: 'warn',
    error: 'error',
  };
  const consoleMethod = levelMap[level] || 'log';
  console[consoleMethod](`[Serial] ${message}`);
}

export function createSerialSession(app) {
  const getSerial = () => app.serial;

  const refreshDisplay = () => {
    app.needsRedraw = true;
    app.refreshDisplay();
  };

  const activateSerialMode = () => {
    app.inputMode = 'serial';
    app.currentMode = 'wave';
    app.displayMode = 'independent';
  };

  const getFilteredSerialSample = (value) => {
    const serial = getSerial();

    if (!Number.isFinite(serial.filteredValue)) {
      serial.filteredValue = value;
      return value;
    }

    serial.filteredValue += (value - serial.filteredValue) * SERIAL_CONFIG.smoothingAlpha;
    return serial.filteredValue;
  };

  const pushSample = (value) => {
    if (!app.isRunning) {
      return;
    }

    const serial = getSerial();
    serial.buffer.push(value);

    if (serial.buffer.length > serial.bufferCapacity) {
      serial.buffer.splice(0, serial.buffer.length - serial.bufferCapacity);
    }

    app.needsRedraw = true;
  };

  const processLine = (line) => {
    const trimmedLine = line.trim();

    if (!trimmedLine) {
      return;
    }

    const value = Number(trimmedLine);

    if (!Number.isFinite(value)) {
      const serial = getSerial();
      serial.error = `Ignored invalid serial line: ${trimmedLine}`;
      logSerialMessage(`Ignored invalid serial line: ${trimmedLine}`, 'warn');
      return;
    }

    pushSample(getFilteredSerialSample(value));
  };

  const processChunk = (chunk) => {
    if (!chunk) {
      return;
    }

    const serial = getSerial();
    const normalizedText = `${serial.chunkRemainder}${chunk}`.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const parts = normalizedText.split('\n');
    serial.chunkRemainder = parts.pop() || '';
    parts.forEach(processLine);
  };

  const formatError = (error, fallbackMessage) => {
    if (!error) {
      return fallbackMessage;
    }

    if (typeof error === 'string') {
      return error;
    }

    return error.message || fallbackMessage;
  };

  const clearReconnectTimer = () => {
    const serial = getSerial();

    if (!serial.reconnectTimer) {
      return;
    }

    window.clearTimeout(serial.reconnectTimer);
    serial.reconnectTimer = null;
  };

  const releaseResources = async ({ closePort } = { closePort: false }) => {
    const serial = getSerial();
    serial.keepReading = false;
    serial.chunkRemainder = '';
    serial.filteredValue = null;

    if (serial.reader) {
      try {
        await serial.reader.cancel();
      } catch (error) {
        // Ignore cancellation failures.
      }

      try {
        serial.reader.releaseLock();
      } catch (error) {
        // Ignore release errors.
      }

      serial.reader = null;
    }

    if (closePort && serial.port && serial.port.readable) {
      try {
        await serial.port.close();
      } catch (error) {
        // Ignore close errors during teardown.
      }
    }
  };

  const scheduleReconnect = (reason) => {
    const serial = getSerial();
    clearReconnectTimer();
    serial.status = 'reconnecting';
    serial.error = reason;

    const reconnectIndex = Math.min(serial.reconnectAttempt, SERIAL_CONFIG.reconnectDelays.length - 1);
    const reconnectDelay = SERIAL_CONFIG.reconnectDelays[reconnectIndex];
    serial.reconnectAttempt += 1;
    logSerialMessage(`Reconnecting in ${reconnectDelay / 1000}s.`, 'warn');

    serial.reconnectTimer = window.setTimeout(() => {
      reconnect();
    }, reconnectDelay);
  };

  const handleFailure = (message) => {
    const serial = getSerial();
    serial.error = message;
    serial.status = 'error';
    logSerialMessage(message, 'error');

    if (app.inputMode === 'serial' && app.expStep !== 'actual') {
      serial.resumeOnReconnect = true;
      app.inputMode = 'simulation';
    } else if (app.expStep === 'actual') {
      serial.resumeOnReconnect = true;
    }

    if (serial.autoReconnectEnabled && serial.port && serial.hadSuccessfulConnection) {
      scheduleReconnect(message);
    }

    refreshDisplay();
  };

  const readLoop = async () => {
    const serial = getSerial();

    try {
      while (serial.keepReading && serial.reader) {
        const { value, done } = await serial.reader.read();

        if (done) {
          break;
        }

        if (!value) {
          continue;
        }

        const chunk = serial.decoder.decode(value, { stream: true });
        processChunk(chunk);
      }

      if (serial.keepReading) {
        const tail = serial.decoder ? serial.decoder.decode() : '';
        if (tail) {
          processChunk(tail);
        }
        handleFailure('Serial stream closed.');
      }
    } catch (error) {
      if (serial.keepReading) {
        handleFailure(formatError(error, 'Serial read failed.'));
      }
    } finally {
      if (serial.reader) {
        try {
          serial.reader.releaseLock();
        } catch (error) {
          // Ignore release errors on disconnect.
        }
        serial.reader = null;
      }
    }
  };

  const openPort = async ({ isReconnect }) => {
    const serial = getSerial();

    if (!serial.port) {
      serial.status = 'error';
      serial.error = 'No serial port is available.';
      logSerialMessage('No serial port is available.', 'error');
      return;
    }

    try {
      if (!serial.port.readable) {
        await serial.port.open({ baudRate: SERIAL_CONFIG.baudRate });
      }

      serial.reader = serial.port.readable.getReader();
      serial.decoder = new TextDecoder();
      serial.chunkRemainder = '';
      serial.filteredValue = null;
      serial.keepReading = true;
      serial.reconnectAttempt = 0;
      serial.status = 'connected';
      serial.error = '';
      serial.buffer = [];
      serial.hadSuccessfulConnection = true;
      logSerialMessage(isReconnect ? 'Serial port reconnected.' : 'Serial port connected.', 'success');

      if (app.inputMode === 'serial' || serial.resumeOnReconnect) {
        activateSerialMode();
        serial.resumeOnReconnect = false;
      }

      readLoop();
    } catch (error) {
      const message = formatError(error, 'Failed to open the serial port.');

      if (!isReconnect && !serial.hadSuccessfulConnection) {
        serial.status = 'error';
        serial.autoReconnectEnabled = false;
        serial.error = message;
        logSerialMessage(message, 'error');
        return;
      }

      handleFailure(message);
    }
  };

  const connect = async () => {
    const serial = getSerial();

    if (!serial.supported) {
      serial.status = 'error';
      serial.error = 'Web Serial API is not supported in this browser.';
      logSerialMessage('Web Serial API is not supported in this browser.', 'error');
      return;
    }

    clearReconnectTimer();
    serial.error = '';
    serial.status = 'connecting';
    serial.autoReconnectEnabled = true;
    logSerialMessage(`Requesting serial port @ ${SERIAL_CONFIG.baudRate} baud.`, 'info');

    if (!serial.port) {
      try {
        serial.port = await navigator.serial.requestPort();
      } catch (error) {
        serial.autoReconnectEnabled = false;
        serial.status = 'disconnected';
        serial.error = 'Serial port selection was cancelled.';
        logSerialMessage('Serial port selection was cancelled.', 'warn');
        return;
      }
    }

    await openPort({ isReconnect: false });
  };

  const reconnect = async () => {
    const serial = getSerial();
    clearReconnectTimer();

    if (!serial.autoReconnectEnabled || !serial.port) {
      return;
    }

    await releaseResources({ closePort: true });
    await openPort({ isReconnect: true });
  };

  const disconnect = async ({ manual } = { manual: false }) => {
    const serial = getSerial();
    clearReconnectTimer();
    serial.autoReconnectEnabled = false;
    serial.resumeOnReconnect = false;

    await releaseResources({ closePort: true });

    if (manual) {
      serial.status = 'disconnected';
      serial.error = '';
      app.inputMode = app.expStep === 'actual' ? 'serial' : 'simulation';
      logSerialMessage('Serial port disconnected.', 'info');
    }

    refreshDisplay();
  };

  const toggleConnection = async () => {
    if (['connected', 'connecting', 'reconnecting'].includes(getSerial().status)) {
      await disconnect({ manual: true });
      return;
    }

    await connect();
  };

  const cleanup = () => {
    const serial = getSerial();
    serial.autoReconnectEnabled = false;
    clearReconnectTimer();
    releaseResources({ closePort: true });
  };

  return {
    toggleConnection,
    connect,
    disconnect,
    cleanup,
    processChunk,
    processLine,
    pushSample,
    handleFailure,
    scheduleReconnect,
    reconnect,
    clearReconnectTimer,
    releaseResources,
    formatError,
  };
}
