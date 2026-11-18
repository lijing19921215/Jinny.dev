import React, { useEffect, useRef } from 'react';
import { ArtifactKind } from '../data/creativeCodingStories';

interface LiveCanvasProps {
  kind: Exclude<ArtifactKind, 'image'>;
  paused?: boolean;
  darkMode?: boolean;
  staticPreview?: boolean;
  className?: string;
}

const ASCII_RAMP = ' .:-=+*#%@';

export const CreativeArtifactCanvas: React.FC<LiveCanvasProps> = ({
  kind,
  paused = false,
  darkMode = false,
  staticPreview = false,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerRef = useRef<{ x: number; y: number; active: boolean }>({
    x: 0.5,
    y: 0.5,
    active: false
  });
  const pausedRef = useRef(paused);
  const darkRef = useRef(darkMode);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    darkRef.current = darkMode;
  }, [darkMode]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = Math.max(160, container.clientWidth);
    let height = Math.max(120, container.clientHeight);
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const setCanvasSize = () => {
      if (!container || !canvas) return false;
      const rawW = container.clientWidth;
      const rawH = container.clientHeight;
      if (rawW <= 0 || rawH <= 0) return false;
      const minScale =
        rawW < 120 || rawH < 90 ? Math.max(120 / rawW, 90 / rawH) : 1;
      width = Math.round(rawW * minScale);
      height = Math.round(rawH * minScale);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const nextW = Math.floor(width * dpr);
      const nextH = Math.floor(height * dpr);
      if (canvas.width !== nextW || canvas.height !== nextH) {
        canvas.width = nextW;
        canvas.height = nextH;
        return true;
      }
      return false;
    };

    setCanvasSize();

    // Persistent simulation states
    let t = 0;
    let raf = 0;

    // Cloth state
    const cols = 10;
    const rows = 8;
    const clothPts = Array.from({ length: cols * rows }, (_, idx) => {
      const c = idx % cols;
      const r = Math.floor(idx / cols);
      return {
        x: 0.25 + (c / (cols - 1)) * 0.55,
        y: 0.2 + (r / (rows - 1)) * 0.45,
        ox: 0.25 + (c / (cols - 1)) * 0.55,
        oy: 0.2 + (r / (rows - 1)) * 0.45,
        pinned: c === 0 && (r === 0 || r === rows - 1)
      };
    });

    // Boids state
    const boids = Array.from({ length: 64 }, (_, i) => {
      const angle = (i / 64) * Math.PI * 2;
      return {
        x: 0.5 + Math.cos(angle) * 0.22,
        y: 0.5 + Math.sin(angle) * 0.22,
        vx: Math.cos(angle + 1.2) * 0.004,
        vy: Math.sin(angle + 1.2) * 0.004
      };
    });

    // Flow ribbons
    const flowPts = Array.from({ length: 58 }, (_, i) => ({
      x: ((i * 37) % 100) / 100,
      y: ((i * 53) % 100) / 100,
      life: (i * 17) % 120
    }));

    // Glyph spring grid
    const glyphs = 'INTERFERE*0123456789~∆Σλ'.split('');
    const glyphNodes = Array.from({ length: 35 }, (_, i) => {
      const gx = (i % 7) / 6;
      const gy = Math.floor(i / 7) / 4;
      return {
        char: glyphs[i % glyphs.length],
        hx: 0.14 + gx * 0.72,
        hy: 0.2 + gy * 0.6,
        x: 0.14 + gx * 0.72,
        y: 0.2 + gy * 0.6,
        vx: 0,
        vy: 0
      };
    });

    let flowInitialized = false;

    const renderFrame = (stepDt: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const isDark = darkRef.current;
      const ptr = pointerRef.current;

      if (kind === 'canvas-radar') {
        ctx.fillStyle = '#0B1018';
        ctx.fillRect(0, 0, width, height);

        const cx = width * 0.5;
        const cy = height * 0.5;
        const maxR = Math.min(width, height) * 0.43;

        // Concentric harmonic rings
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
        ctx.lineWidth = 1;
        for (let i = 1; i <= 4; i++) {
          ctx.beginPath();
          ctx.arc(cx, cy, (maxR * i) / 4, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.moveTo(cx - maxR, cy);
        ctx.lineTo(cx + maxR, cy);
        ctx.moveTo(cx, cy - maxR);
        ctx.lineTo(cx, cy + maxR);
        ctx.stroke();

        // Sweep wedge
        const sweep = t * 0.85;
        const grad = ctx.createRadialGradient(cx, cy, 4, cx, cy, maxR);
        grad.addColorStop(0, 'rgba(30, 99, 214, 0.35)');
        grad.addColorStop(0.65, 'rgba(239, 78, 94, 0.28)');
        grad.addColorStop(1, 'rgba(252, 224, 85, 0.04)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, maxR, sweep - 0.55, sweep);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#FCE055';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(sweep) * maxR, cy + Math.sin(sweep) * maxR);
        ctx.stroke();

        // Thermal harmonic nodes perturbed by cursor
        for (let i = 0; i < 16; i++) {
          const ang = i * 0.41 + t * 0.22;
          const rad = maxR * (0.3 + 0.55 * Math.abs(Math.sin(i * 1.7 + t * 0.3)));
          let nx = cx + Math.cos(ang) * rad;
          let ny = cy + Math.sin(ang) * rad;
          if (ptr.active) {
            const dx = nx - ptr.x * width;
            const dy = ny - ptr.y * height;
            const dist = Math.hypot(dx, dy);
            if (dist < 70 && dist > 1) {
              nx += (dx / dist) * (70 - dist) * 0.28;
              ny += (dy / dist) * (70 - dist) * 0.28;
            }
          }
          ctx.fillStyle = i % 3 === 0 ? '#EF4E5E' : i % 3 === 1 ? '#FCE055' : '#38BDF8';
          ctx.beginPath();
          ctx.arc(nx, ny, i % 4 === 0 ? 3.2 : 2.1, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (kind === 'canvas-ascii') {
        ctx.fillStyle = isDark ? '#16181D' : '#F6F3EC';
        ctx.fillRect(0, 0, width, height);

        // Classic mini window titlebar
        const barH = Math.max(18, Math.round(height * 0.1));
        ctx.fillStyle = isDark ? '#23262E' : '#E7E2D8';
        ctx.fillRect(0, 0, width, barH);
        ctx.strokeStyle = isDark ? '#323743' : '#C8C1B4';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, barH + 0.5);
        ctx.lineTo(width, barH + 0.5);
        ctx.stroke();

        // Window dots
        const dotY = barH * 0.5;
        ['#EF4E5E', '#FCE055', '#1E63D6'].forEach((col, idx) => {
          ctx.fillStyle = col;
          ctx.beginPath();
          ctx.arc(10 + idx * 10, dotY, 2.5, 0, Math.PI * 2);
          ctx.fill();
        });

        // Live ASCII wave interference grid
        const gridCols = 26;
        const gridRows = 16;
        const cellW = (width - 16) / gridCols;
        const cellH = (height - barH - 12) / gridRows;
        const fontSize = Math.max(7, Math.min(13, Math.floor(cellH * 0.85)));
        ctx.font = `600 ${fontSize}px "Paper Mono", "Commit Mono", monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const mx = ptr.active ? ptr.x : 0.5 + Math.cos(t * 0.7) * 0.2;
        const my = ptr.active ? ptr.y : 0.5 + Math.sin(t * 0.6) * 0.2;

        for (let r = 0; r < gridRows; r++) {
          for (let c = 0; c < gridCols; c++) {
            const u = c / gridCols;
            const v = r / gridRows;
            const d1 = Math.hypot(u - 0.35, v - 0.5);
            const d2 = Math.hypot(u - mx, v - my);
            const wave =
              Math.sin(d1 * 18 - t * 2.4) * 0.5 +
              Math.sin(d2 * 22 - t * 3.1) * 0.5;
            const norm = Math.max(0, Math.min(0.999, (wave + 1) * 0.5));
            const glyph = ASCII_RAMP[Math.floor(norm * ASCII_RAMP.length)];
            if (glyph !== ' ') {
              ctx.fillStyle =
                norm > 0.72
                  ? '#EF4E5E'
                  : norm > 0.45
                    ? isDark
                      ? '#E2E8F0'
                      : '#0F172A'
                    : isDark
                      ? '#64748B'
                      : '#786858';
              ctx.fillText(
                glyph,
                8 + (c + 0.5) * cellW,
                barH + 6 + (r + 0.5) * cellH
              );
            }
          }
        }
      } else if (kind === 'canvas-cloth') {
        // Sky gradient wash matching warm editorial palette
        const sky = ctx.createLinearGradient(0, 0, 0, height);
        sky.addColorStop(0, isDark ? '#1A2742' : '#DCE9FA');
        sky.addColorStop(1, isDark ? '#253554' : '#F3F7FD');
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, width, height);

        // Soft drifting clouds
        ctx.fillStyle = isDark
          ? 'rgba(255,255,255,0.08)'
          : 'rgba(255,255,255,0.75)';
        for (let i = 0; i < 3; i++) {
          const cx = (((t * 14 + i * 75) % (width + 80)) - 40);
          const cy = height * (0.24 + i * 0.18);
          ctx.beginPath();
          ctx.ellipse(cx, cy, 34, 14, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        // Update Verlet cloth points
        if (stepDt > 0) {
          const windX = 0.0008 + Math.sin(t * 2.1) * 0.0005 + Math.sin(t * 5.3) * 0.0002;
          const windY = 0.00035 + Math.cos(t * 3.1) * 0.00025;
          for (const p of clothPts) {
            if (p.pinned) continue;
            const vx = (p.x - p.ox) * 0.96;
            const vy = (p.y - p.oy) * 0.96;
            p.ox = p.x;
            p.oy = p.y;
            let px = p.x + vx + windX;
            let py = p.y + vy + windY;
            if (ptr.active) {
              const dx = px - ptr.x;
              const dy = py - ptr.y;
              const dist = Math.hypot(dx, dy);
              if (dist < 0.28 && dist > 0.001) {
                const push = (0.28 - dist) * 0.04;
                px += (dx / dist) * push;
                py += (dy / dist) * push;
              }
            }
            p.x = px;
            p.y = py;
          }

          const restX = 0.55 / (cols - 1);
          const restY = 0.45 / (rows - 1);
          for (let iter = 0; iter < 5; iter++) {
            for (let r = 0; r < rows; r++) {
              for (let c = 0; c < cols; c++) {
                const p1 = clothPts[r * cols + c];
                if (c < cols - 1) {
                  const p2 = clothPts[r * cols + c + 1];
                  const dx = p2.x - p1.x;
                  const dy = p2.y - p1.y;
                  const d = Math.hypot(dx, dy) || 0.0001;
                  const diff = (d - restX) / d;
                  if (!p1.pinned) {
                    p1.x += dx * diff * 0.5;
                    p1.y += dy * diff * 0.5;
                  }
                  if (!p2.pinned) {
                    p2.x -= dx * diff * 0.5;
                    p2.y -= dy * diff * 0.5;
                  }
                }
                if (r < rows - 1) {
                  const p2 = clothPts[(r + 1) * cols + c];
                  const dx = p2.x - p1.x;
                  const dy = p2.y - p1.y;
                  const d = Math.hypot(dx, dy) || 0.0001;
                  const diff = (d - restY) / d;
                  if (!p1.pinned) {
                    p1.x += dx * diff * 0.5;
                    p1.y += dy * diff * 0.5;
                  }
                  if (!p2.pinned) {
                    p2.x -= dx * diff * 0.5;
                    p2.y -= dy * diff * 0.5;
                  }
                }
              }
            }
          }
        }

        // Mast pole
        ctx.strokeStyle = isDark ? '#CBD5E1' : '#334155';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(width * 0.25, height * 0.16);
        ctx.lineTo(width * 0.25, height * 0.92);
        ctx.stroke();

        // Draw cloth mesh
        for (let r = 0; r < rows - 1; r++) {
          for (let c = 0; c < cols - 1; c++) {
            const p00 = clothPts[r * cols + c];
            const p10 = clothPts[r * cols + c + 1];
            const p11 = clothPts[(r + 1) * cols + c + 1];
            const p01 = clothPts[(r + 1) * cols + c];
            const shade = (p10.y - p00.y) * 18;
            ctx.fillStyle = shade > 0.7 ? '#D93B4B' : '#EF4E5E';
            ctx.beginPath();
            ctx.moveTo(p00.x * width, p00.y * height);
            ctx.lineTo(p10.x * width, p10.y * height);
            ctx.lineTo(p11.x * width, p11.y * height);
            ctx.lineTo(p01.x * width, p01.y * height);
            ctx.closePath();
            ctx.fill();
          }
        }
      } else if (kind === 'canvas-boids') {
        ctx.fillStyle = isDark ? '#141820' : '#FEFCF8';
        ctx.fillRect(0, 0, width, height);

        if (stepDt > 0) {
          for (let i = 0; i < boids.length; i++) {
            const b = boids[i];
            let sx = 0,
              sy = 0,
              ax = 0,
              ay = 0,
              cx = 0,
              cy = 0,
              cnt = 0;
            for (let j = 0; j < boids.length; j++) {
              if (i === j) continue;
              const o = boids[j];
              const dx = o.x - b.x;
              const dy = o.y - b.y;
              const d = Math.hypot(dx, dy);
              if (d < 0.16 && d > 0) {
                cx += o.x;
                cy += o.y;
                ax += o.vx;
                ay += o.vy;
                if (d < 0.06) {
                  sx -= dx / d;
                  sy -= dy / d;
                }
                cnt++;
              }
            }
            if (cnt > 0) {
              b.vx += (cx / cnt - b.x) * 0.002 + (ax / cnt - b.vx) * 0.04 + sx * 0.0007;
              b.vy += (cy / cnt - b.y) * 0.002 + (ay / cnt - b.vy) * 0.04 + sy * 0.0007;
            }
            // Center pull
            b.vx += (0.5 - b.x) * 0.0006;
            b.vy += (0.5 - b.y) * 0.0006;
            // Pointer repel
            if (ptr.active) {
              const dx = b.x - ptr.x;
              const dy = b.y - ptr.y;
              const d = Math.hypot(dx, dy);
              if (d < 0.22 && d > 0.001) {
                b.vx += (dx / d) * 0.0014;
                b.vy += (dy / d) * 0.0014;
              }
            }
            const spd = Math.hypot(b.vx, b.vy) || 0.001;
            const maxSpd = 0.0075;
            if (spd > maxSpd) {
              b.vx = (b.vx / spd) * maxSpd;
              b.vy = (b.vy / spd) * maxSpd;
            }
            b.x = (b.x + b.vx + 1) % 1;
            b.y = (b.y + b.vy + 1) % 1;
          }
        }

        // Subtle grid
        ctx.strokeStyle = isDark ? 'rgba(148,163,184,0.1)' : 'rgba(15,23,42,0.06)';
        ctx.lineWidth = 1;
        for (let g = 1; g < 6; g++) {
          ctx.beginPath();
          ctx.moveTo((width * g) / 6, 0);
          ctx.lineTo((width * g) / 6, height);
          ctx.stroke();
        }

        // Draw boid triangles
        for (let i = 0; i < boids.length; i++) {
          const b = boids[i];
          const ang = Math.atan2(b.vy, b.vx);
          ctx.save();
          ctx.translate(b.x * width, b.y * height);
          ctx.rotate(ang);
          ctx.fillStyle =
            i % 7 === 0 ? '#EF4E5E' : i % 3 === 0 ? '#1E63D6' : isDark ? '#E2E8F0' : '#0F172A';
          ctx.beginPath();
          ctx.moveTo(6, 0);
          ctx.lineTo(-4, 2.8);
          ctx.lineTo(-4, -2.8);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
      } else if (kind === 'canvas-flow') {
        if (!flowInitialized) {
          ctx.fillStyle = isDark ? '#111827' : '#EDF4FF';
          ctx.fillRect(0, 0, width, height);
          flowInitialized = true;
        }
        ctx.fillStyle = isDark
          ? 'rgba(17, 24, 39, 0.07)'
          : 'rgba(237, 244, 255, 0.08)';
        ctx.fillRect(0, 0, width, height);

        for (let i = 0; i < flowPts.length; i++) {
          const fp = flowPts[i];
          const px = fp.x * width;
          const py = fp.y * height;
          if (stepDt > 0) {
            let ang =
              Math.sin(fp.x * 5 + t * 0.4) * Math.cos(fp.y * 5 - t * 0.3) * Math.PI * 2;
            if (ptr.active) {
              const dx = fp.x - ptr.x;
              const dy = fp.y - ptr.y;
              const d = Math.hypot(dx, dy);
              if (d < 0.25 && d > 0.001) {
                ang += Math.atan2(dy, dx) * (0.25 - d) * 2.5;
              }
            }
            const nx = fp.x + Math.cos(ang) * 0.007;
            const ny = fp.y + Math.sin(ang) * 0.007;
            ctx.strokeStyle =
              i % 5 === 0
                ? '#EF4E5E'
                : i % 2 === 0
                  ? '#1E63D6'
                  : isDark
                    ? '#93C5FD'
                    : '#0F172A';
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(nx * width, ny * height);
            ctx.stroke();

            fp.x = nx;
            fp.y = ny;
            fp.life++;
            if (fp.x < 0 || fp.x > 1 || fp.y < 0 || fp.y > 1 || fp.life > 120) {
              fp.x = Math.random();
              fp.y = Math.random();
              fp.life = 0;
            }
          }
        }
      } else if (kind === 'canvas-glyph') {
        ctx.fillStyle = isDark ? '#151821' : '#FEFCF8';
        ctx.fillRect(0, 0, width, height);

        const fontSize = Math.max(11, Math.min(20, Math.round(width * 0.055)));
        ctx.font = `600 ${fontSize}px "Paper Mono", "Commit Mono", monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (let i = 0; i < glyphNodes.length; i++) {
          const g = glyphNodes[i];
          if (stepDt > 0) {
            const fx = (g.hx - g.x) * 0.14;
            const fy = (g.hy - g.y) * 0.14;
            g.vx = (g.vx + fx) * 0.8;
            g.vy = (g.vy + fy) * 0.8;
            if (ptr.active) {
              const dx = g.x - ptr.x;
              const dy = g.y - ptr.y;
              const d = Math.hypot(dx, dy);
              if (d < 0.24 && d > 0.001) {
                const force = (0.24 - d) * 0.09;
                g.vx += (dx / d) * force;
                g.vy += (dy / d) * force;
              }
            }
            g.x += g.vx;
            g.y += g.vy;
          }

          const disp = Math.hypot(g.x - g.hx, g.y - g.hy);
          if (disp > 0.006) {
            ctx.strokeStyle = 'rgba(30, 99, 214, 0.35)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(g.hx * width, g.hy * height);
            ctx.lineTo(g.x * width, g.y * height);
            ctx.stroke();
          }

          ctx.fillStyle =
            disp > 0.03
              ? '#EF4E5E'
              : disp > 0.008
                ? '#1E63D6'
                : isDark
                  ? '#E2E8F0'
                  : '#0F172A';
          ctx.fillText(g.char, g.x * width, g.y * height);
        }
      }
    };

    const renderStaticPreview = () => {
      flowInitialized = false;
      t = 2.4;
      const steps =
        kind === 'canvas-flow'
          ? 42
          : kind === 'canvas-cloth' || kind === 'canvas-boids'
            ? 20
            : 1;
      for (let s = 0; s < steps; s++) {
        t += 0.016;
        renderFrame(0.016);
      }
    };

    const handleResize = () => {
      const changed = setCanvasSize();
      if (changed && staticPreview) {
        renderStaticPreview();
      }
    };

    const ro =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(handleResize)
        : null;
    ro?.observe(container);

    const tick = () => {
      const step = pausedRef.current ? 0 : 0.016;
      t += step;
      renderFrame(step);
      raf = requestAnimationFrame(tick);
    };

    if (staticPreview) {
      renderStaticPreview();
      return () => {
        ro?.disconnect();
      };
    }

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      ro?.disconnect();
    };
  }, [kind, staticPreview]);

  return (
    <div
      ref={containerRef}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        pointerRef.current = {
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height,
          active: true
        };
      }}
      onMouseLeave={() => {
        pointerRef.current.active = false;
      }}
      className={`relative w-full h-full overflow-hidden select-none ${className}`}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};
