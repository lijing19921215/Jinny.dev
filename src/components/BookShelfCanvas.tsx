import React, { useEffect, useRef } from 'react';
import p5 from 'p5';

interface BookShelfCanvasProps {
  /** Respect reduced-motion (kept for API parity; the shelf is a calm static scene). */
  reducedMotion: boolean;
}

interface Book {
  x: number;
  w: number;
  h: number;
  face: string;
  spine: string;
  label: string;
  lean: number;
}

// Flat-illustration books matching the reference: amber, cream, sage, blush.
const BOOKS: Book[] = [
  { x: 0.07, w: 0.115, h: 0.66, face: '#E7B24C', spine: '#C9902E', label: 'ART', lean: -1.5 },
  { x: 0.205, w: 0.095, h: 0.56, face: '#F3EFE4', spine: '#D8D2C2', label: 'UI', lean: 0 },
  { x: 0.315, w: 0.12, h: 0.74, face: '#6E8E5B', spine: '#536F42', label: 'DESIGN', lean: 0 },
  { x: 0.45, w: 0.1, h: 0.62, face: '#CE8890', spine: '#AC666F', label: 'CODE', lean: 2 }
];

/** p5.js-drawn flat bookshelf: four upright books on a wooden ledge + a small bud vase. */
const BookShelfCanvas: React.FC<BookShelfCanvasProps> = ({ reducedMotion }) => {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let ro: ResizeObserver | null = null;

    const sketch = (p: p5) => {
      const drawShelf = () => {
        const w = p.width;
        const h = p.height;
        const ctx = p.drawingContext as CanvasRenderingContext2D;
        p.clear();

        const shelfTop = h * 0.84; // top surface of the ledge where books rest

        // --- Books ---
        for (const b of BOOKS) {
          const bx = b.x * w;
          const bw = b.w * w;
          const bh = b.h * h;
          const by = shelfTop - bh;

          p.push();
          p.translate(bx + bw / 2, shelfTop);
          p.rotate((b.lean * Math.PI) / 180);
          p.translate(-(bx + bw / 2), -shelfTop);

          // soft contact shadow on the ledge
          p.noStroke();
          p.fill(74, 58, 40, 26);
          p.ellipse(bx + bw / 2, shelfTop + 1, bw * 1.25, h * 0.03);

          // spine (darker side face) + cover face
          p.fill(b.spine);
          p.rect(bx, by, bw, bh, 1.5);
          p.fill(b.face);
          p.rect(bx + bw * 0.16, by, bw * 0.84, bh, 1.5);

          // top page edge highlight
          p.fill(255, 255, 255, 90);
          p.rect(bx + bw * 0.2, by + h * 0.012, bw * 0.72, Math.max(1, h * 0.012), 1);

          // thin rule lines on the cover
          p.fill(0, 0, 0, 26);
          p.rect(bx + bw * 0.3, by + bh * 0.14, bw * 0.5, Math.max(1, h * 0.008));
          p.rect(bx + bw * 0.3, by + bh * 0.82, bw * 0.5, Math.max(1, h * 0.008));

          // vertical spine label
          ctx.save();
          ctx.translate(bx + bw * 0.6, by + bh * 0.5);
          ctx.rotate(-Math.PI / 2);
          ctx.fillStyle = 'rgba(38,30,22,0.78)';
          ctx.font = `600 ${Math.max(8, Math.round(h * 0.115))}px "Paper Mono", monospace`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(b.label, 0, 0);
          ctx.restore();

          p.pop();
        }

        // --- Small bud vase with a sprig ---
        const vx = w * 0.585;
        const vw = w * 0.075;
        const vh = h * 0.22;
        const vy = shelfTop - vh;
        p.noStroke();
        p.fill(74, 58, 40, 22);
        p.ellipse(vx + vw / 2, shelfTop + 1, vw * 1.35, h * 0.025);
        // vase body: rounded bulb narrowing at the neck
        ctx.save();
        ctx.fillStyle = '#F6F3EA';
        ctx.strokeStyle = 'rgba(110,96,78,0.35)';
        ctx.lineWidth = Math.max(1, w * 0.0015);
        ctx.beginPath();
        ctx.moveTo(vx + vw * 0.34, vy + vh * 0.28);
        ctx.quadraticCurveTo(vx + vw * 0.06, vy + vh * 0.62, vx + vw * 0.2, shelfTop);
        ctx.lineTo(vx + vw * 0.8, shelfTop);
        ctx.quadraticCurveTo(vx + vw * 0.94, vy + vh * 0.62, vx + vw * 0.66, vy + vh * 0.28);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
        // neck rim
        p.fill('#EFEADD');
        p.rect(vx + vw * 0.34, vy + vh * 0.22, vw * 0.32, vh * 0.08, 1);
        // sprig stem
        p.stroke('#8A9C6E');
        p.strokeWeight(Math.max(1.1, w * 0.0022));
        p.noFill();
        p.line(vx + vw * 0.5, vy + vh * 0.24, vx + vw * 0.5, vy - vh * 0.42);
        // two leaves
        p.noStroke();
        p.fill('#9CAD7D');
        p.ellipse(vx + vw * 0.34, vy - vh * 0.12, vw * 0.3, vh * 0.1);
        p.fill('#869A6A');
        p.ellipse(vx + vw * 0.66, vy - vh * 0.3, vw * 0.28, vh * 0.09);
        // tiny bud
        p.fill('#D9A86B');
        p.ellipse(vx + vw * 0.5, vy - vh * 0.46, vw * 0.12, vh * 0.09);

        // --- Wooden ledge ---
        p.noStroke();
        // ledge shadow
        p.fill(74, 58, 40, 30);
        p.rect(w * 0.02, shelfTop + h * 0.1, w * 0.96, h * 0.05, h * 0.02);
        // ledge body
        p.fill('#B08D68');
        p.rect(w * 0.02, shelfTop, w * 0.96, h * 0.1, h * 0.02);
        // ledge top highlight
        p.fill(255, 255, 255, 55);
        p.rect(w * 0.03, shelfTop + h * 0.008, w * 0.94, Math.max(1, h * 0.012), h * 0.01);
        // ledge lower edge
        p.fill('#9C7856');
        p.rect(w * 0.02, shelfTop + h * 0.075, w * 0.96, h * 0.025, h * 0.01);
      };

      p.setup = () => {
        const c = p.createCanvas(Math.max(1, host.clientWidth), Math.max(1, host.clientHeight));
        c.parent(host);
        p.pixelDensity(Math.min(2, window.devicePixelRatio || 1));
      };

      p.draw = () => {
        // Static scene: draw once, then stop the loop to save CPU.
        drawShelf();
        p.noLoop();
      };
    };

    const instance = new p5(sketch, host);

    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => {
        const w = Math.max(1, host.clientWidth);
        const h = Math.max(1, host.clientHeight);
        if (w !== instance.width || h !== instance.height) {
          instance.resizeCanvas(w, h);
          instance.loop(); // re-run draw() once to repaint at new size
        }
      });
      ro.observe(host);
    }

    return () => {
      ro?.disconnect();
      instance.remove();
    };
    // reducedMotion is read once; the shelf has no animation to gate.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={hostRef} aria-hidden="true" className="pointer-events-none absolute inset-0" />;
};

export default BookShelfCanvas;
