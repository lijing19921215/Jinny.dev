export type SampleSubjectId = 'berry' | 'portrait' | 'vase';

function drawImageContain(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  w: number,
  h: number
) {
  const pad = Math.min(w, h) * 0.06;
  const maxW = w - pad * 2;
  const maxH = h - pad * 2;
  const scale = Math.min(maxW / img.width, maxH / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
}

export function createSampleCanvas(
  subject: SampleSubjectId,
  w: number,
  h: number,
  loadedImages: { berry?: HTMLImageElement | null; portrait?: HTMLImageElement | null }
): HTMLCanvasElement {
  const off = document.createElement('canvas');
  off.width = w;
  off.height = h;
  const ctx = off.getContext('2d');
  if (!ctx) return off;

  // Warm studio gradient backdrop
  const bg = ctx.createLinearGradient(0, 0, w, h);
  if (subject === 'berry') {
    bg.addColorStop(0, '#FDF8EE');
    bg.addColorStop(1, '#ECE7DC');
  } else if (subject === 'portrait') {
    bg.addColorStop(0, '#EDF4FF');
    bg.addColorStop(1, '#DCE6F7');
  } else {
    bg.addColorStop(0, '#F6F5F0');
    bg.addColorStop(1, '#E5DFD3');
  }
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Subtle drafting studio grid
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.04)';
  ctx.lineWidth = 1;
  for (let x = 40; x < w; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 40; y < h; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  if (subject === 'berry' && loadedImages.berry) {
    drawImageContain(ctx, loadedImages.berry, w, h);
    return off;
  }

  if (subject === 'portrait' && loadedImages.portrait) {
    drawImageContain(ctx, loadedImages.portrait, w, h);
    return off;
  }

  // Fallback / Cobalt Vase Still Life procedural artwork
  const cx = w * 0.5;
  const cy = h * 0.54;

  ctx.fillStyle = 'rgba(15, 23, 42, 0.12)';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 108, 76, 15, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#4B6B4C';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(cx - 10, cy + 10);
  ctx.quadraticCurveTo(cx - 45, cy - 60, cx - 52, cy - 92);
  ctx.moveTo(cx, cy + 10);
  ctx.quadraticCurveTo(cx + 5, cy - 70, cx + 10, cy - 116);
  ctx.moveTo(cx + 12, cy + 10);
  ctx.quadraticCurveTo(cx + 52, cy - 50, cx + 62, cy - 78);
  ctx.stroke();

  const blooms: [number, number, number, string][] = [
    [-52, -92, 23, '#EF4E5E'],
    [10, -116, 27, '#FCE055'],
    [62, -78, 21, '#EF4E5E']
  ];
  blooms.forEach(([dx, dy, r, color]) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx + dx, cy + dy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 2.5;
    ctx.stroke();
  });

  ctx.fillStyle = '#1E63D6';
  ctx.strokeStyle = '#0F172A';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(cx - 45, cy + 6, 90, 102, [16, 16, 36, 36]);
  ctx.fill();
  ctx.stroke();

  return off;
}

export function renderImageFitCanvas(
  img: HTMLImageElement,
  w: number,
  h: number
): HTMLCanvasElement {
  const off = document.createElement('canvas');
  off.width = w;
  off.height = h;
  const ctx = off.getContext('2d');
  if (!ctx) return off;

  ctx.fillStyle = '#F6F5F0';
  ctx.fillRect(0, 0, w, h);

  const scale = Math.min(w / img.width, h / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
  return off;
}

export function renderWoolFeltStyle(
  srcCanvas: HTMLCanvasElement,
  dstCanvas: HTMLCanvasElement
) {
  const w = dstCanvas.width;
  const h = dstCanvas.height;
  const ctx = dstCanvas.getContext('2d');
  if (!ctx) return;

  ctx.save();
  ctx.filter = 'blur(0.95px) saturate(1.22) contrast(1.04) brightness(1.03)';
  ctx.drawImage(srcCanvas, 0, 0, w, h);
  ctx.restore();

  ctx.fillStyle = 'rgba(252, 224, 85, 0.08)';
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  let seed = 42;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  for (let i = 0; i < 2400; i++) {
    const x = rand() * w;
    const y = rand() * h;
    const len = 4 + rand() * 8;
    const ang = rand() * Math.PI * 2;
    ctx.strokeStyle =
      i % 3 === 0 ? 'rgba(255, 251, 240, 0.24)' : 'rgba(92, 68, 48, 0.09)';
    ctx.lineWidth = 0.8 + rand() * 0.9;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(
      x + Math.cos(ang + 0.4) * (len * 0.5),
      y + Math.sin(ang + 0.4) * (len * 0.5),
      x + Math.cos(ang) * len,
      y + Math.sin(ang) * len
    );
    ctx.stroke();
  }
  ctx.restore();

  const vig = ctx.createRadialGradient(
    w * 0.5,
    h * 0.48,
    w * 0.25,
    w * 0.5,
    h * 0.5,
    w * 0.72
  );
  vig.addColorStop(0, 'rgba(255, 255, 255, 0)');
  vig.addColorStop(1, 'rgba(62, 48, 34, 0.14)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);
}

export function renderPastelDollStyle(
  srcCanvas: HTMLCanvasElement,
  dstCanvas: HTMLCanvasElement
) {
  const w = dstCanvas.width;
  const h = dstCanvas.height;
  const ctx = dstCanvas.getContext('2d');
  if (!ctx) return;

  ctx.save();
  ctx.filter = 'blur(0.6px) saturate(0.84) brightness(1.12) contrast(0.92)';
  ctx.drawImage(srcCanvas, 0, 0, w, h);
  ctx.restore();

  ctx.fillStyle = 'rgba(255, 232, 236, 0.26)';
  ctx.fillRect(0, 0, w, h);

  const bloom = ctx.createRadialGradient(
    w * 0.5,
    h * 0.44,
    10,
    w * 0.5,
    h * 0.48,
    w * 0.48
  );
  bloom.addColorStop(0, 'rgba(255, 248, 242, 0.28)');
  bloom.addColorStop(0.55, 'rgba(239, 78, 94, 0.08)');
  bloom.addColorStop(1, 'rgba(237, 244, 255, 0.22)');
  ctx.fillStyle = bloom;
  ctx.fillRect(0, 0, w, h);

  let seed = 99;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  for (let i = 0; i < 1800; i++) {
    const x = rand() * w;
    const y = rand() * h;
    ctx.fillStyle =
      i % 2 === 0 ? 'rgba(255, 255, 255, 0.28)' : 'rgba(239, 160, 172, 0.14)';
    ctx.fillRect(x, y, 1.5, 1.5);
  }
}
