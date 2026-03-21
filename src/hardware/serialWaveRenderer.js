export function renderSerialWaveFrame({
  ctx,
  constants,
  serial,
  serialStatusText,
  timeDiv,
  voltsDiv,
  horizontalPosition,
  verticalPosition,
}) {
  const width = constants.CANVAS.WIDTH;
  const height = constants.CANVAS.HEIGHT;
  const { GRID } = constants;
  const horizontalDivs = GRID.HORIZONTAL_DIVS || GRID.HORIZONTAL_DIV || 10;
  const verticalDivs = GRID.VERTICAL_DIVS || GRID.VERTICAL_DIV || 8;
  const horizontalGrid = width / horizontalDivs;
  const verticalGrid = height / verticalDivs;
  const visibleSamples = Math.min(
    serial.buffer.length,
    Math.max(48, Math.round(timeDiv * 80))
  );
  const values = serial.buffer.slice(-visibleSamples);
  const padding = 32;
  const xOffset = horizontalPosition * horizontalGrid;
  const yOffset = verticalPosition * verticalGrid;
  const infoPanelScale = 0.7;
  const infoPanelTop = 16;
  const infoPanelRightMargin = 24;
  const infoPanelPadding = 14;
  const infoPanelWidth = Math.round(350 * infoPanelScale);
  const infoPanelHeight = Math.round(78 * infoPanelScale);
  const infoPanelX = width - infoPanelWidth - infoPanelRightMargin;
  const infoPanelTextX = infoPanelX + infoPanelPadding;

  ctx.save();

  if (!values.length) {
    ctx.fillStyle = 'rgba(8, 20, 32, 0.72)';
    ctx.fillRect(infoPanelX, infoPanelTop, infoPanelWidth, infoPanelHeight);
    ctx.fillStyle = '#e2f3ff';
    ctx.font = 'bold 11px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Connect Arduino to start', infoPanelTextX, infoPanelTop + 22);
    ctx.fillText('streaming waveform data.', infoPanelTextX, infoPanelTop + 36);
    ctx.font = '9px Arial';
    ctx.fillStyle = '#9ecfff';
    ctx.fillText(serialStatusText, infoPanelTextX, infoPanelTop + 50);
    ctx.restore();
    return;
  }

  const recentValues = values.slice(-Math.min(values.length, 180));
  const windowMin = Math.min(...recentValues);
  const windowMax = Math.max(...recentValues);
  const midpoint = (windowMin + windowMax) / 2;
  const rawRange = windowMax - windowMin;
  const stableRange = Math.max(rawRange * 1.1, 12, voltsDiv * 24);
  const minValue = midpoint - stableRange / 2;
  const usableHeight = height - padding * 2;
  const points = values.map((value, index) => {
    const x = values.length === 1
      ? width / 2 + xOffset
      : (index / Math.max(1, values.length - 1)) * width + xOffset;
    const normalized = stableRange === 0 ? 0.5 : (value - minValue) / stableRange;
    const y = height - padding - normalized * usableHeight + yOffset;

    return { x, y };
  });

  ctx.fillStyle = 'rgba(8, 20, 32, 0.72)';
  ctx.fillRect(infoPanelX, infoPanelTop, infoPanelWidth, infoPanelHeight);

  drawSmoothPath(ctx, points, 6, 'rgba(0, 210, 255, 0.16)');
  drawSmoothPath(ctx, points, 2.5, '#35b8ff');

  ctx.fillStyle = '#d7f0ff';
  ctx.font = 'bold 10px Arial';
  ctx.textAlign = 'left';
  ctx.fillStyle = '#a9d8ff';
  ctx.font = '10px Arial';
  ctx.fillText(`Window: ${windowMin.toFixed(2)} - ${windowMax.toFixed(2)}`, infoPanelTextX, infoPanelTop + 18);
  ctx.fillText(`Samples: ${values.length}`, infoPanelTextX, infoPanelTop + 32);
  ctx.fillText(`Time/div: ${timeDiv.toFixed(1)}  Volt/div: ${voltsDiv.toFixed(2)}`, infoPanelTextX, infoPanelTop + 46);
  ctx.restore();
}

function drawSmoothPath(ctx, points, lineWidth, strokeStyle) {
  if (!points.length) {
    return;
  }

  ctx.beginPath();
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = strokeStyle;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.moveTo(points[0].x, points[0].y);

  if (points.length === 1) {
    ctx.lineTo(points[0].x + 0.1, points[0].y);
    ctx.stroke();
    return;
  }

  for (let index = 0; index < points.length - 1; index += 1) {
    const currentPoint = points[index];
    const nextPoint = points[index + 1];
    const midX = (currentPoint.x + nextPoint.x) / 2;
    const midY = (currentPoint.y + nextPoint.y) / 2;
    ctx.quadraticCurveTo(currentPoint.x, currentPoint.y, midX, midY);
  }

  const lastPoint = points[points.length - 1];
  ctx.lineTo(lastPoint.x, lastPoint.y);
  ctx.stroke();
}
