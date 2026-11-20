import React, { useEffect, useRef } from 'react';
import p5 from 'p5';

interface LightCanvasProps {
  /** Whether the lamp is lit — animates the light in/out. */
  on: boolean;
  /** Respect reduced-motion: freeze dust/flicker, keep a static glow. */
  reducedMotion: boolean;
  /**
   * Bulb origin as a fraction of the stage size (0..1). Defaults to the
   * chandelier's base position (x44% + half of 13% width, ~78% down its box).
   */
  origin?: { x: number; y: number };
}

interface Dust {
  x: number;
  y: number;
  r: number;
  speed: number;
  drift: number;
  phase: number;
  alpha: number;
}

/**
 * A p5.js-driven volumetric lamp glow: a soft light cone, a warm pool where it
 * lands, and slowly drifting dust motes. Rendered on a transparent canvas that
 * sits BELOW the room objects (pointer-events: none) so it never blocks the
 * drag/scale/rotate editing system. Reads the bulb position every frame so the
 * light follows the chandelier when it is moved in edit mode.
 */
const LightCanvas: React.FC<LightCanvasProps> = ({
  on,
  reducedMotion,
  origin = { x: 0.505, y: 0.39 }
}) => {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const onRef = useRef(on);
  const reducedRef = useRef(reducedMotion);
  const originRef = useRef(origin);
  const p5Ref = useRef<p5 | null>(null);
  const intensityRef = useRef(on ? 1 : 0);

  onRef.current = on;
  reducedRef.current = reducedMotion;
  originRef.current = origin;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let resizeObs: ResizeObserver | null = null;
    let dust: Dust[] = [];

    const seedDust = (w: number, h: number) => {
      const count = Math.max(26, Math.min(70, Math.round((w * h) / 26000)));
      dust = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.8 + Math.random() * 1.9,
        speed: 0.12 + Math.random() * 0.42,
        drift: (Math.random() - 0.5) * 0.24,
        phase: Math.random() * Math.PI * 2,
        alpha: 0.18 + Math.random() * 0.5
      }));
    };

    const sketch = (p: p5) => {
      p.setup = () => {
        const w = Math.max(1, host.clientWidth);
        const h = Math.max(1, host.clientHeight);
        const c = p.createCanvas(w, h);
        c.parent(host);
        p.pixelDensity(Math.min(2, window.devicePixelRatio || 1));
        p.frameRate(reducedRef.current ? 24 : 40);
        seedDust(w, h);
      };

      p.windowResized = () => {
        p.resizeCanvas(Math.max(1, host.clientWidth), Math.max(1, host.clientHeight));
      };

      p.draw = () => {
        const w = p.width;
        const h = p.height;
        const ctx = p.drawingContext as CanvasRenderingContext2D;
        p.clear();

        // Ease brightness toward target so toggling is a smooth fade, not a jump.
        const target = onRef.current ? 1 : 0;
        intensityRef.current += (target - intensityRef.current) * 0.12;
        const I = intensityRef.current;
        if (I < 0.004) return; // fully dark — nothing to draw

        const t = reducedRef.current ? 0 : p.millis() / 1000;
        // Gentle candle-like flicker, subtle (±4%).
        const flicker = reducedRef.current
          ? 1
          : 0.96 + 0.03 * Math.sin(t * 2.3) + 0.012 * Math.sin(t * 5.9);
        const A = I * flicker;

        // Resolve the bulb position from the actual chandelier element so the
        // light tracks it when moved/resized in edit mode.
        let ox = originRef.current.x * w;
        let oy = originRef.current.y * h;
        const lampEl = host.parentElement?.querySelector<HTMLElement>('[data-lamp]');
        if (lampEl) {
          const lr = lampEl.getBoundingClientRect();
          const hr = host.getBoundingClientRect();
          ox = lr.left - hr.left + lr.width / 2;
          oy = lr.top - hr.top + lr.height * 0.79;
        }

        const coneBottom = Math.min(h * 0.96, oy + Math.max(h * 0.42, oy * 1.1));
        const coneLen = Math.max(1, coneBottom - oy);
        const topHalf = Math.max(10, w * 0.018);
        const botHalf = Math.max(60, Math.min(w * 0.20, coneLen * 0.72));

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        // --- Soft volumetric cone: vertical fade + feathered edges via blur.
        const blurPx = Math.max(8, w * 0.014);
        ctx.filter = `blur(${blurPx}px)`;
        const coneGrad = ctx.createLinearGradient(0, oy, 0, coneBottom);
        coneGrad.addColorStop(0, `rgba(255,236,150,${0.30 * A})`);
        coneGrad.addColorStop(0.28, `rgba(255,224,120,${0.15 * A})`);
        coneGrad.addColorStop(0.72, `rgba(255,214,100,${0.05 * A})`);
        coneGrad.addColorStop(1, 'rgba(255,210,90,0)');
        ctx.fillStyle = coneGrad;
        ctx.beginPath();
        ctx.moveTo(ox - topHalf, oy);
        ctx.lineTo(ox + topHalf, oy);
        ctx.lineTo(ox + botHalf, coneBottom);
        ctx.lineTo(ox - botHalf, coneBottom);
        ctx.closePath();
        ctx.fill();

        // Bright core shaft near the bulb.
        const coreGrad = ctx.createLinearGradient(0, oy, 0, coneBottom);
        coreGrad.addColorStop(0, `rgba(255,249,214,${0.40 * A})`);
        coreGrad.addColorStop(0.5, `rgba(255,240,175,${0.10 * A})`);
        coreGrad.addColorStop(1, 'rgba(255,235,160,0)');
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.moveTo(ox - topHalf * 0.5, oy);
        ctx.lineTo(ox + topHalf * 0.5, oy);
        ctx.lineTo(ox + botHalf * 0.42, coneBottom);
        ctx.lineTo(ox - botHalf * 0.42, coneBottom);
        ctx.closePath();
        ctx.fill();

        // --- Warm pool where the light lands.
        ctx.filter = `blur(${blurPx * 1.4}px)`;
        const poolGrad = ctx.createRadialGradient(ox, coneBottom, 0, ox, coneBottom, botHalf * 1.15);
        poolGrad.addColorStop(0, `rgba(255,231,138,${0.26 * A})`);
        poolGrad.addColorStop(0.55, `rgba(255,224,120,${0.10 * A})`);
        poolGrad.addColorStop(1, 'rgba(255,220,110,0)');
        ctx.fillStyle = poolGrad;
        ctx.beginPath();
        ctx.ellipse(ox, coneBottom, botHalf * 1.15, botHalf * 0.30, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.filter = 'none';

        // --- Bulb halo right at the source.
        const haloR = Math.max(16, w * 0.035);
        const halo = ctx.createRadialGradient(ox, oy, 0, ox, oy, haloR);
        halo.addColorStop(0, `rgba(255,246,200,${0.55 * A})`);
        halo.addColorStop(0.35, `rgba(255,228,130,${0.22 * A})`);
        halo.addColorStop(1, 'rgba(255,220,110,0)');
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(ox, oy, haloR, 0, Math.PI * 2);
        ctx.fill();

        // --- Drifting dust motes, kept inside the cone.
        const halfAt = (y: number) => {
          const d = Math.max(0, Math.min(1, (y - oy) / coneLen));
          return topHalf + (botHalf - topHalf) * d;
        };
        for (const mote of dust) {
          if (!reducedRef.current) {
            mote.y += mote.speed;
            mote.x += mote.drift + Math.sin(t * 0.6 + mote.phase) * 0.18;
            if (mote.y < oy - 4 || mote.y > coneBottom + 6 || Math.abs(mote.x - ox) > halfAt(mote.y) + 14) {
              // Respawn near the top of the cone with a fresh horizontal spot.
              mote.y = oy + 2 + Math.random() * coneLen * 0.18;
              mote.x = ox + (Math.random() - 0.5) * halfAt(mote.y) * 1.2;
            }
          }
          const twinkle = reducedRef.current
            ? 1
            : 0.55 + 0.45 * Math.sin(t * 1.8 + mote.phase);
          const a = mote.alpha * twinkle * A * 0.9;
          if (a <= 0.01) continue;
          ctx.fillStyle = `rgba(255,247,205,${a})`;
          ctx.beginPath();
          ctx.arc(mote.x, mote.y, mote.r, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      };

      const instance = p;
      p5Ref.current = instance;
    };

    const instance = new p5(sketch, host);

    // Keep the canvas sized to the stage even when layout changes without a
    // window resize (e.g. entering/exiting edit mode, container query shifts).
    if (typeof ResizeObserver !== 'undefined') {
      resizeObs = new ResizeObserver(() => {
        const w = Math.max(1, host.clientWidth);
        const h = Math.max(1, host.clientHeight);
        if (w !== instance.width || h !== instance.height) {
          instance.resizeCanvas(w, h);
          seedDust(w, h);
        }
      });
      resizeObs.observe(host);
    }

    return () => {
      resizeObs?.disconnect();
      instance.remove();
      p5Ref.current = null;
    };
    // The sketch is created once; prop changes are read through refs above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[2] overflow-hidden"
    />
  );
};

export default LightCanvas;
