import React, { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';

export type CursorGridFalloff = 'linear' | 'smooth' | 'sharp';
export type CursorGridHighlight = 'area' | 'cell';
export type CursorGridStyle = 'lines' | 'dashed' | 'dots' | 'crosses';

export interface CursorGridProps {
  cellSize?: number;
  color?: string;
  gridColor?: string;
  radius?: number;
  falloff?: CursorGridFalloff;
  highlight?: CursorGridHighlight;
  holdTime?: number;
  fadeDuration?: number;
  lineWidth?: number;
  maxOpacity?: number;
  fillOpacity?: number;
  gridOpacity?: number;
  gridStyle?: CursorGridStyle;
  cellRadius?: number;
  cellGap?: number;
  spotlight?: number;
  clickPulse?: boolean;
  hoverDrops?: boolean;
  pulseSpeed?: number;
  ambient?: number;
  edgeFade?: number;
  intro?: boolean;
  lightMode?: boolean;
  dpr?: number;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

interface Pulse {
  x: number;
  y: number;
  startTime: number;
  maxRadius: number;
  intensity?: number;
}

const parseHex = (hex: string): [number, number, number] => {
  let h = String(hex || '#ffffff').replace('#', '').trim();
  if (h.length === 3 || h.length === 4) {
    h = h
      .slice(0, 3)
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const num = parseInt(h.slice(0, 6), 16);
  if (Number.isNaN(num)) return [255, 255, 255];
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
};

const hexToRgba = (hex: string, alpha: number): string => {
  const [r, g, b] = parseHex(hex);
  const a = Math.max(0, Math.min(1, alpha));
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

const FALLOFF_CURVES: Record<CursorGridFalloff, (t: number) => number> = {
  linear: (t) => t,
  smooth: (t) => t * t * (3 - 2 * t),
  sharp: (t) => t * t * t,
};

export const CursorGrid: React.FC<CursorGridProps> = ({
  cellSize = 60,
  color = '#ffffff',
  gridColor,
  radius = 140,
  falloff = 'smooth',
  highlight = 'area',
  holdTime = 400,
  fadeDuration = 800,
  lineWidth = 1,
  maxOpacity = 1,
  fillOpacity = 0.06,
  gridOpacity = 0.08,
  gridStyle = 'lines',
  cellRadius = 0,
  cellGap = 0,
  spotlight = 0.6,
  clickPulse = true,
  hoverDrops = true,
  pulseSpeed = 1.5,
  ambient = 0,
  edgeFade = 0,
  intro = true,
  lightMode = false,
  dpr,
  children,
  className = '',
  style,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const ink = lightMode ? '#18181b' : '#ffffff';
  const effectiveColor = color || ink;
  const effectiveGridColor = gridColor || effectiveColor;

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let rafId = 0;
    let isVisible = true;
    let lastTime = performance.now();

    const view = { width: 0, height: 0, ratio: 1 };
    const grid = { cols: 0, rows: 0, offX: 0, offY: 0 };
    const pointer = { x: -9999, y: -9999, inside: false };
    const pulses: Pulse[] = [];

    let levels = new Float32Array(0);
    let targets = new Float32Array(0);
    let touched = new Float64Array(0);

    let lastDropX = -9999;
    let lastDropY = -9999;
    let lastDropTime = 0;

    const spawnRipple = (x: number, y: number, now: number, maxRadius?: number, intensity: number = 0.85) => {
      if (reduceMotion) return;
      pulses.push({
        x,
        y,
        startTime: now,
        maxRadius: maxRadius || Math.min(view.width, view.height) * 0.65,
        intensity,
      });
      if (pulses.length > 18) pulses.shift();
      wake();
    };

    const resize = () => {
      view.width = Math.max(1, container.clientWidth);
      view.height = Math.max(1, container.clientHeight);
      view.ratio = Math.min(dpr || window.devicePixelRatio || 1, 2);

      canvas.width = Math.round(view.width * view.ratio);
      canvas.height = Math.round(view.height * view.ratio);
      canvas.style.width = `${view.width}px`;
      canvas.style.height = `${view.height}px`;

      const cols = Math.ceil(view.width / cellSize) + 1;
      const rows = Math.ceil(view.height / cellSize) + 1;
      const totalCells = cols * rows;

      if (cols !== grid.cols || rows !== grid.rows) {
        levels = new Float32Array(totalCells);
        targets = new Float32Array(totalCells);
        touched = new Float64Array(totalCells).fill(-1e9);
      }

      grid.cols = cols;
      grid.rows = rows;
      grid.offX = (view.width - cols * cellSize) / 2;
      grid.offY = (view.height - rows * cellSize) / 2;
    };

    const wake = () => {
      if (!rafId && isVisible && !document.hidden) {
        lastTime = performance.now();
        rafId = requestAnimationFrame(render);
      }
    };

    const lightCell = (index: number, val: number, now: number) => {
      if (index >= 0 && index < targets.length) {
        if (val > targets[index]) targets[index] = val;
        touched[index] = now;
      }
    };

    const energize = (px: number, py: number, now: number) => {
      if (reduceMotion) return;
      if (highlight === 'cell') {
        const c = Math.floor((px - grid.offX) / cellSize);
        const r = Math.floor((py - grid.offY) / cellSize);
        if (c >= 0 && c < grid.cols && r >= 0 && r < grid.rows) {
          lightCell(r * grid.cols + c, 1, now);
        }
        return;
      }

      const r = radius;
      const curve = FALLOFF_CURVES[falloff] || FALLOFF_CURVES.smooth;
      const minCol = Math.max(0, Math.floor((px - r - grid.offX) / cellSize));
      const maxCol = Math.min(grid.cols - 1, Math.floor((px + r - grid.offX) / cellSize));
      const minRow = Math.max(0, Math.floor((py - r - grid.offY) / cellSize));
      const maxRow = Math.min(grid.rows - 1, Math.floor((py + r - grid.offY) / cellSize));

      for (let row = minRow; row <= maxRow; row++) {
        for (let col = minCol; col <= maxCol; col++) {
          const cx = grid.offX + col * cellSize + cellSize / 2;
          const cy = grid.offY + row * cellSize + cellSize / 2;
          const dist = Math.hypot(px - cx, py - cy);
          if (dist <= r) {
            const normalized = 1 - dist / r;
            const strength = curve(normalized);
            lightCell(row * grid.cols + col, strength, now);
          }
        }
      }
    };

    const render = (now: number) => {
      rafId = 0;
      if (!isVisible || document.hidden) return;

      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Reset and scale
      ctx.setTransform(view.ratio, 0, 0, view.ratio, 0, 0);
      ctx.clearRect(0, 0, view.width, view.height);

      let hasActiveAnimation = false;

      // Idle water droplet when mouse rests inside on laptop/desktop
      if (pointer.inside && hoverDrops && !reduceMotion && (now - lastDropTime > 900)) {
        lastDropTime = now;
        spawnRipple(pointer.x, pointer.y, now, Math.min(view.width, view.height) * 0.45, 0.6);
      }

      // 1. Update Pulses (Water Drop Ripples)
      if (pulses.length > 0) {
        hasActiveAnimation = true;
        for (let i = pulses.length - 1; i >= 0; i--) {
          const p = pulses[i];
          const elapsed = (now - p.startTime) / 1000;
          const currentRadius = elapsed * pulseSpeed * 340;
          const alpha = Math.max(0, 1 - currentRadius / p.maxRadius);

          if (alpha <= 0.01 || currentRadius >= p.maxRadius) {
            pulses.splice(i, 1);
            continue;
          }

          // Light up intersecting cells with a smooth sinusoidal ripple wave
          const waveWidth = cellSize * 2.2;
          const minCol = Math.max(0, Math.floor((p.x - currentRadius - waveWidth - grid.offX) / cellSize));
          const maxCol = Math.min(grid.cols - 1, Math.floor((p.x + currentRadius + waveWidth - grid.offX) / cellSize));
          const minRow = Math.max(0, Math.floor((p.y - currentRadius - waveWidth - grid.offY) / cellSize));
          const maxRow = Math.min(grid.rows - 1, Math.floor((p.y + currentRadius + waveWidth - grid.offY) / cellSize));

          for (let row = minRow; row <= maxRow; row++) {
            for (let col = minCol; col <= maxCol; col++) {
              const cx = grid.offX + col * cellSize + cellSize / 2;
              const cy = grid.offY + row * cellSize + cellSize / 2;
              const dist = Math.hypot(p.x - cx, p.y - cy);
              const diff = Math.abs(dist - currentRadius);
              if (diff < waveWidth) {
                // Smooth sinusoidal water droplet ripple wave
                const waveIntensity = Math.sin((1 - diff / waveWidth) * Math.PI) * alpha * (p.intensity || 0.85);
                lightCell(row * grid.cols + col, waveIntensity, now);
              }
            }
          }
        }
      }

      // 2. Draw Cell Highlights
      const holdSec = holdTime / 1000;
      const fadeStep = dt / Math.max(0.016, fadeDuration / 1000);
      const attack = 1 - Math.exp(-dt / 0.045);

      for (let i = 0; i < levels.length; i++) {
        let target = targets[i];
        if (target <= 0 && levels[i] <= 0) continue;

        if ((now - touched[i]) / 1000 > holdSec) {
          target = Math.max(0, target - fadeStep);
          targets[i] = target;
        }

        const before = levels[i];
        const next = target > before ? before + (target - before) * attack : target;
        levels[i] = next < 0.002 ? 0 : next;

        if (levels[i] > 0 || targets[i] > 0) hasActiveAnimation = true;

        if (levels[i] > 0.002) {
          const col = i % grid.cols;
          const row = Math.floor(i / grid.cols);
          const cellX = grid.offX + col * cellSize + cellGap;
          const cellY = grid.offY + row * cellSize + cellGap;
          const cellW = cellSize - cellGap * 2;
          const cellH = cellSize - cellGap * 2;

          const alpha = levels[i] * fillOpacity;
          ctx.fillStyle = hexToRgba(effectiveColor, alpha);

          if (cellRadius > 0 && typeof ctx.roundRect === 'function') {
            ctx.beginPath();
            ctx.roundRect(cellX, cellY, cellW, cellH, cellRadius);
            ctx.fill();
          } else {
            ctx.fillRect(cellX, cellY, cellW, cellH);
          }
        }
      }

      // 3. Draw Cursor Spotlight Glow
      if (pointer.inside && spotlight > 0 && !reduceMotion) {
        hasActiveAnimation = true;
        const glowRadius = Math.max(radius * 1.2, 80);
        const grad = ctx.createRadialGradient(
          pointer.x,
          pointer.y,
          0,
          pointer.x,
          pointer.y,
          glowRadius
        );
        grad.addColorStop(0, hexToRgba(effectiveColor, spotlight * 0.12));
        grad.addColorStop(0.5, hexToRgba(effectiveColor, spotlight * 0.04));
        grad.addColorStop(1, hexToRgba(effectiveColor, 0));
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, view.width, view.height);
      }

      // 4. Draw Grid Lines
      if (gridOpacity > 0) {
        ctx.save();
        ctx.strokeStyle = hexToRgba(effectiveGridColor, gridOpacity);
        ctx.lineWidth = lineWidth;

        if (gridStyle === 'dashed') {
          const dash = Math.max(4, cellSize / 6);
          ctx.setLineDash([dash, dash]);
        }

        ctx.beginPath();

        if (gridStyle === 'dots') {
          const dotRadius = Math.max(1, lineWidth * 1.5);
          for (let col = 0; col <= grid.cols; col++) {
            const x = Math.round(grid.offX + col * cellSize);
            for (let row = 0; row <= grid.rows; row++) {
              const y = Math.round(grid.offY + row * cellSize);
              ctx.moveTo(x + dotRadius, y);
              ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
            }
          }
          ctx.fillStyle = hexToRgba(effectiveGridColor, gridOpacity * 1.5);
          ctx.fill();
        } else if (gridStyle === 'crosses') {
          const arm = Math.max(3, cellSize * 0.1);
          for (let col = 0; col <= grid.cols; col++) {
            const x = Math.round(grid.offX + col * cellSize);
            for (let row = 0; row <= grid.rows; row++) {
              const y = Math.round(grid.offY + row * cellSize);
              ctx.moveTo(x - arm, y);
              ctx.lineTo(x + arm, y);
              ctx.moveTo(x, y - arm);
              ctx.lineTo(x, y + arm);
            }
          }
          ctx.stroke();
        } else {
          // Lines or Dashed
          for (let col = 0; col <= grid.cols; col++) {
            const x = Math.round(grid.offX + col * cellSize) + 0.5;
            ctx.moveTo(x, 0);
            ctx.lineTo(x, view.height);
          }
          for (let row = 0; row <= grid.rows; row++) {
            const y = Math.round(grid.offY + row * cellSize) + 0.5;
            ctx.moveTo(0, y);
            ctx.lineTo(view.width, y);
          }
          ctx.stroke();
        }

        ctx.restore();
      }

      if (hasActiveAnimation) {
        rafId = requestAnimationFrame(render);
      }
    };

    const getLocalPos = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;
      return { x, y, inside };
    };

    const onPointerMove = (e: PointerEvent) => {
      const { x, y, inside } = getLocalPos(e);
      pointer.inside = inside;
      if (!inside) {
        wake();
        return;
      }
      pointer.x = x;
      pointer.y = y;
      const now = performance.now();
      energize(x, y, now);

      // Laptop / desktop view: mouse hover creates flowing water droplet ripple waves
      if (hoverDrops && e.pointerType !== 'touch' && !reduceMotion) {
        const dist = Math.hypot(x - lastDropX, y - lastDropY);
        const timeDiff = now - lastDropTime;
        if (dist > 36 || (timeDiff > 160 && dist > 10)) {
          lastDropX = x;
          lastDropY = y;
          lastDropTime = now;
          spawnRipple(x, y, now, Math.min(view.width, view.height) * 0.55, 0.75);
        }
      }

      wake();
    };

    const onPointerDown = (e: PointerEvent) => {
      const { x, y, inside } = getLocalPos(e);
      if (!inside || !clickPulse || reduceMotion) return;
      spawnRipple(x, y, performance.now(), Math.max(view.width, view.height) * 0.95, 1.0);
    };

    const onPointerLeave = () => {
      pointer.inside = false;
      wake();
    };

    const resizeObserver = new ResizeObserver(() => {
      resize();
      wake();
    });
    resizeObserver.observe(container);

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible) wake();
    });
    intersectionObserver.observe(container);

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    document.documentElement.addEventListener('pointerleave', onPointerLeave);

    resize();
    wake();

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);
    };
  }, [
    cellSize,
    effectiveColor,
    effectiveGridColor,
    radius,
    falloff,
    highlight,
    holdTime,
    fadeDuration,
    lineWidth,
    fillOpacity,
    gridOpacity,
    gridStyle,
    cellRadius,
    cellGap,
    spotlight,
    clickPulse,
    hoverDrops,
    pulseSpeed,
    dpr,
  ]);

  return (
    <div
      ref={containerRef}
      className={['relative w-full overflow-hidden', className].filter(Boolean).join(' ')}
      style={style}
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 block h-full w-full"
        aria-hidden="true"
        style={{ background: 'transparent' }}
      />
      {children ? <div className="relative z-10 w-full">{children}</div> : null}
    </div>
  );
};

export default CursorGrid;
