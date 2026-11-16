import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef
} from 'react';
import { useReducedMotion } from 'motion/react';

export interface FishToBirdsHandle {
  triggerSwim: () => void;
}

interface FishToBirdsBioProps {
  text: string;
  onSwimStateChange?: (isSwimming: boolean) => void;
}

interface GlyphTarget {
  span: HTMLSpanElement;
  char: string;
  x: number; // relative to canvas
  y: number;
  triggered: boolean;
  restored: boolean;
}

interface BirdParticle {
  glyphIndex: number;
  originX: number;
  originY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  flightDuration: number;
  returnDuration: number;
  wingPhase: number;
  wingSpeed: number;
  scale: number;
  color: string;
  phase: 'flying' | 'returning' | 'done';
  returnStartX: number;
  returnStartY: number;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
}

const CANVAS_PAD_X = 40;
const CANVAS_PAD_TOP = 64;
const CANVAS_PAD_BOTTOM = 28;

export const FishToBirdsBio = forwardRef<FishToBirdsHandle, FishToBirdsBioProps>(
  ({ text, onSwimStateChange }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const spanRefs = useRef<(HTMLSpanElement | null)[]>([]);
    const rafRef = useRef<number | null>(null);
    const isSwimmingRef = useRef(false);
    const prefersReduced = useReducedMotion();

    // Tokenize into words + whitespace so line wrapping stays 100% identical to natural prose
    const wordTokens = useMemo(() => {
      const tokens: { word: string; startIdx: number; isSpace: boolean }[] = [];
      let cursor = 0;
      const parts = text.split(/(\s+)/);
      for (const part of parts) {
        if (!part) continue;
        tokens.push({
          word: part,
          startIdx: cursor,
          isSpace: /^\s+$/.test(part)
        });
        cursor += part.length;
      }
      return tokens;
    }, [text]);

    const restoreAllSpans = useCallback(() => {
      for (const span of spanRefs.current) {
        if (span) {
          span.style.opacity = '1';
        }
      }
    }, []);

    const stopAnimation = useCallback(() => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      isSwimmingRef.current = false;
      onSwimStateChange?.(false);
      restoreAllSpans();

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
    }, [onSwimStateChange, restoreAllSpans]);

    const triggerSwim = useCallback(() => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;

      // Reduced motion fallback: gentle warm highlight wave without canvas flight
      if (prefersReduced) {
        if (isSwimmingRef.current) return;
        isSwimmingRef.current = true;
        onSwimStateChange?.(true);
        const spans = spanRefs.current.filter(Boolean) as HTMLSpanElement[];
        spans.forEach((s, idx) => {
          s.style.transition = 'color 260ms ease';
          window.setTimeout(() => {
            s.style.color = '#1E63D6';
          }, idx * 7);
          window.setTimeout(() => {
            s.style.color = '';
          }, 450 + idx * 7);
        });
        window.setTimeout(() => {
          isSwimmingRef.current = false;
          onSwimStateChange?.(false);
        }, 500 + spans.length * 7);
        return;
      }

      // Reset any active swim cleanly before starting a fresh one
      stopAnimation();

      const containerRect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const canvasW = containerRect.width + CANVAS_PAD_X * 2;
      const canvasH = containerRect.height + CANVAS_PAD_TOP + CANVAS_PAD_BOTTOM;

      canvas.width = Math.round(canvasW * dpr);
      canvas.height = Math.round(canvasH * dpr);
      canvas.style.width = `${canvasW}px`;
      canvas.style.height = `${canvasH}px`;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Measure all non-space glyph spans once (zero layout thrashing during rAF)
      const glyphs: GlyphTarget[] = [];
      let minY = Infinity;
      let maxY = -Infinity;

      for (const span of spanRefs.current) {
        if (!span) continue;
        const char = span.textContent || '';
        if (!char.trim()) continue;
        const r = span.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) continue;

        const gx = r.left - containerRect.left + CANVAS_PAD_X + r.width * 0.5;
        const gy = r.top - containerRect.top + CANVAS_PAD_TOP + r.height * 0.52;
        minY = Math.min(minY, gy);
        maxY = Math.max(maxY, gy);

        glyphs.push({
          span,
          char,
          x: gx,
          y: gy,
          triggered: false,
          restored: false
        });
      }

      if (glyphs.length === 0) return;

      isSwimmingRef.current = true;
      onSwimStateChange?.(true);

      const birds: BirdParticle[] = [];
      const ripples: Ripple[] = [];
      const swimDuration = 1.85; // seconds for the koi to cross the paragraph
      const midY = (minY + maxY) * 0.5;
      const waveAmp = Math.max(16, (maxY - minY) * 0.48);
      const startX = CANVAS_PAD_X - 36;
      const endX = containerRect.width + CANVAS_PAD_X + 44;

      let startTime: number | null = null;
      let lastRippleTime = 0;

      const drawKoi = (
        c: CanvasRenderingContext2D,
        x: number,
        y: number,
        angle: number,
        t: number
      ) => {
        c.save();
        c.translate(x, y);
        c.rotate(angle);

        const tailSwing = Math.sin(t * 15) * 4.2;

        // Subtle watercolor shadow beneath koi
        c.fillStyle = 'rgba(239, 78, 94, 0.14)';
        c.beginPath();
        c.ellipse(-2, 4, 15, 5.5, 0, 0, Math.PI * 2);
        c.fill();

        // Pectoral fins
        c.fillStyle = 'rgba(239, 78, 94, 0.8)';
        c.beginPath();
        c.ellipse(3, -5.5, 4.5, 2.2, -0.55, 0, Math.PI * 2);
        c.ellipse(3, 5.5, 4.5, 2.2, 0.55, 0, Math.PI * 2);
        c.fill();

        // Flowing tail fin
        c.fillStyle = '#EF4E5E';
        c.beginPath();
        c.moveTo(-12, 0);
        c.quadraticCurveTo(-20, -6 + tailSwing * 0.6, -24, -7 + tailSwing);
        c.quadraticCurveTo(-19, 0 + tailSwing * 0.35, -24, 7 + tailSwing);
        c.quadraticCurveTo(-20, 6 + tailSwing * 0.6, -12, 0);
        c.closePath();
        c.fill();

        // Sleek koi body
        c.fillStyle = '#EF4E5E';
        c.beginPath();
        c.moveTo(15, 0);
        c.bezierCurveTo(10, -6.2, -2, -5.2, -13, 0);
        c.bezierCurveTo(-2, 5.2, 10, 6.2, 15, 0);
        c.closePath();
        c.fill();

        // Crisp paper-white & ink dorsal spot (Tancho-inspired editorial detail)
        c.fillStyle = '#FEFCF8';
        c.beginPath();
        c.ellipse(1, -0.5, 4.2, 2.2, 0.15, 0, Math.PI * 2);
        c.fill();

        // Delicate eye dot
        c.fillStyle = '#0F172A';
        c.beginPath();
        c.arc(9.5, -1.6, 1.05, 0, Math.PI * 2);
        c.arc(9.5, 1.6, 1.05, 0, Math.PI * 2);
        c.fill();

        c.restore();
      };

      const drawBird = (c: CanvasRenderingContext2D, b: BirdParticle) => {
        const flap = Math.sin(b.wingPhase) * 5.2 * b.scale;
        const span = 6.5 * b.scale;
        const heading =
          b.phase === 'returning'
            ? Math.atan2(b.originY - b.y, b.originX - b.x) * 0.22
            : Math.atan2(b.vy, b.vx) * 0.18;

        c.save();
        c.translate(b.x, b.y);
        c.rotate(heading);
        c.strokeStyle = b.color;
        c.lineWidth = 1.35;
        c.lineCap = 'round';
        c.lineJoin = 'round';

        // Calligraphic two-stroke ink bird wing silhouette
        c.beginPath();
        c.moveTo(-span, -flap * 0.75);
        c.quadraticCurveTo(-span * 0.45, -flap - 2.2, 0, 0);
        c.quadraticCurveTo(span * 0.45, -flap - 2.2, span, -flap * 0.75);
        c.stroke();

        // Subtle inner keel accent
        c.fillStyle = b.color;
        c.beginPath();
        c.arc(0, 0.3, 1.05, 0, Math.PI * 2);
        c.fill();

        c.restore();
      };

      const step = (now: number) => {
        if (startTime === null) startTime = now;
        const elapsed = (now - startTime) / 1000;

        ctx.save();
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, canvasW, canvasH);

        // 1. Koi trajectory & glyph awakening
        const koiProgress = Math.min(elapsed / swimDuration, 1);
        const koiActive = elapsed <= swimDuration + 0.08;

        if (koiActive) {
          // Ease in-out sine progression across X
          const easedX =
            koiProgress < 0.5
              ? 2 * koiProgress * koiProgress
              : 1 - Math.pow(-2 * koiProgress + 2, 2) / 2;

          const koiX = startX + (endX - startX) * easedX;
          const koiY =
            midY +
            Math.sin(koiProgress * Math.PI * 2.6 - 0.4) * waveAmp * 0.85;

          const nextProgress = Math.min(koiProgress + 0.012, 1);
          const nextEasedX =
            nextProgress < 0.5
              ? 2 * nextProgress * nextProgress
              : 1 - Math.pow(-2 * nextProgress + 2, 2) / 2;
          const nextX = startX + (endX - startX) * nextEasedX;
          const nextY =
            midY +
            Math.sin(nextProgress * Math.PI * 2.6 - 0.4) * waveAmp * 0.85;

          const angle = Math.atan2(nextY - koiY, nextX - koiX);

          if (elapsed - lastRippleTime > 0.14 && koiProgress > 0.04 && koiProgress < 0.96) {
            lastRippleTime = elapsed;
            ripples.push({
              x: koiX,
              y: koiY,
              radius: 4,
              maxRadius: 24,
              alpha: 0.38
            });
          }

          // Trigger glyphs as the koi sweeps past their x coordinate
          for (let i = 0; i < glyphs.length; i++) {
            const g = glyphs[i];
            if (g.triggered) continue;

            const dx = koiX - g.x;
            const dy = koiY - g.y;
            const dist = Math.hypot(dx, dy);

            if (dx >= -10 && (dist < 68 || koiX > g.x + 14)) {
              g.triggered = true;
              g.span.style.opacity = '0';

              const seed = (i * 1.6180339) % 1;
              const colorPalette =
                i % 7 === 0 ? '#1E63D6' : i % 11 === 0 ? '#EF4E5E' : '#0F172A';

              birds.push({
                glyphIndex: i,
                originX: g.x,
                originY: g.y,
                x: g.x,
                y: g.y,
                vx: (seed - 0.42) * 34 + 14,
                vy: -42 - seed * 48,
                age: 0,
                flightDuration: 0.85 + seed * 0.45,
                returnDuration: 0.55 + (1 - seed) * 0.25,
                wingPhase: seed * Math.PI * 2,
                wingSpeed: 15 + seed * 7,
                scale: 0.75 + seed * 0.35,
                color: colorPalette,
                phase: 'flying',
                returnStartX: g.x,
                returnStartY: g.y
              });
            }
          }

          // Draw subtle water ripples
          for (let rIdx = ripples.length - 1; rIdx >= 0; rIdx--) {
            const r = ripples[rIdx];
            r.radius += 0.42;
            r.alpha *= 0.955;
            if (r.alpha < 0.02 || r.radius >= r.maxRadius) {
              ripples.splice(rIdx, 1);
              continue;
            }
            ctx.strokeStyle = `rgba(239, 78, 94, ${r.alpha.toFixed(3)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
            ctx.stroke();
          }

          drawKoi(ctx, koiX, koiY, angle, elapsed);
        } else {
          // Fade remaining ripples after koi exits
          for (let rIdx = ripples.length - 1; rIdx >= 0; rIdx--) {
            const r = ripples[rIdx];
            r.radius += 0.42;
            r.alpha *= 0.92;
            if (r.alpha < 0.02) {
              ripples.splice(rIdx, 1);
              continue;
            }
            ctx.strokeStyle = `rgba(239, 78, 94, ${r.alpha.toFixed(3)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
            ctx.stroke();
          }
        }

        // 2. Update & render origami/ink birds
        const dt = 1 / 60;
        let activeBirds = 0;

        for (let i = 0; i < birds.length; i++) {
          const b = birds[i];
          if (b.phase === 'done') continue;

          activeBirds++;
          b.age += dt;
          b.wingPhase += b.wingSpeed * dt;

          if (b.phase === 'flying') {
            // Smooth aerodynamic lift with gentle curl-like sway
            b.vx += Math.sin(b.age * 4.5 + b.glyphIndex) * 18 * dt;
            b.vy += 18 * dt; // soft deceleration of upward surge
            b.x += b.vx * dt;
            b.y += b.vy * dt;

            if (b.age >= b.flightDuration) {
              b.phase = 'returning';
              b.age = 0;
              b.returnStartX = b.x;
              b.returnStartY = b.y;
            }
          } else if (b.phase === 'returning') {
            const p = Math.min(b.age / b.returnDuration, 1);
            // Smooth quintic ease-out homeward arc
            const ease = 1 - Math.pow(1 - p, 4);
            const arcLift = Math.sin(p * Math.PI) * -14;

            b.x = b.returnStartX + (b.originX - b.returnStartX) * ease;
            b.y =
              b.returnStartY + (b.originY - b.returnStartY) * ease + arcLift;

            if (p >= 1) {
              b.phase = 'done';
              const targetGlyph = glyphs[b.glyphIndex];
              if (targetGlyph && !targetGlyph.restored) {
                targetGlyph.restored = true;
                targetGlyph.span.style.opacity = '1';
              }
              continue;
            }
          }

          drawBird(ctx, b);
        }

        ctx.restore();

        const allTriggered = glyphs.every((g) => g.triggered);
        if (koiActive || activeBirds > 0 || ripples.length > 0 || !allTriggered) {
          rafRef.current = requestAnimationFrame(step);
        } else {
          restoreAllSpans();
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          rafRef.current = null;
          isSwimmingRef.current = false;
          onSwimStateChange?.(false);
        }
      };

      rafRef.current = requestAnimationFrame(step);
    }, [onSwimStateChange, prefersReduced, restoreAllSpans, stopAnimation]);

    useImperativeHandle(
      ref,
      () => ({
        triggerSwim
      }),
      [triggerSwim]
    );

    // Subtle initial showcase swim after first paint (respects reduced motion)
    useEffect(() => {
      if (prefersReduced) return;
      const timer = window.setTimeout(() => {
        triggerSwim();
      }, 950);
      return () => {
        window.clearTimeout(timer);
        stopAnimation();
      };
    }, [prefersReduced, stopAnimation, triggerSwim]);

    return (
      <div
        ref={containerRef}
        onClick={triggerSwim}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            triggerSwim();
          }
        }}
        aria-label={`${text} — Click to stir the words`}
        className="relative cursor-pointer select-none rounded-md focus-visible:outline-2 focus-visible:outline-offset-6 focus-visible:outline-[#1E63D6]"
      >
        <p className="font-paper-mono bio-features text-[15px] sm:text-[15.5px] leading-[1.78] text-[#374151] tracking-[-0.01em] max-w-[46ch]">
          {wordTokens.map((token, tIdx) => {
            if (token.isSpace) {
              return <React.Fragment key={`sp-${tIdx}`}>{token.word}</React.Fragment>;
            }
            return (
              <span key={`wd-${tIdx}`} className="inline-block whitespace-nowrap">
                {Array.from(token.word).map((char, cIdx) => {
                  const globalIdx = token.startIdx + cIdx;
                  return (
                    <span
                      key={`ch-${globalIdx}`}
                      ref={(el) => {
                        spanRefs.current[globalIdx] = el;
                      }}
                      className="inline-block transition-opacity duration-100"
                    >
                      {char}
                    </span>
                  );
                })}
              </span>
            );
          })}
        </p>

        {/* Single overlay canvas extending above/around text so birds fly unobstructed */}
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="pointer-events-none absolute z-20"
          style={{
            left: `-${CANVAS_PAD_X}px`,
            top: `-${CANVAS_PAD_TOP}px`
          }}
        />
      </div>
    );
  }
);

FishToBirdsBio.displayName = 'FishToBirdsBio';
