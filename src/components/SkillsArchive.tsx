import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity
} from 'motion/react';
import {
  Check,
  Copy,
  Download,
  FileCode2,
  ImagePlus,
  RotateCcw,
  Sparkles,
  Stamp,
  Trash2,
  Wand2,
  X
} from 'lucide-react';
import { PORTFOLIO_SKILLS, PortfolioSkill, SkillCategory } from '../data/skills';
import {
  createSampleCanvas,
  renderImageFitCanvas,
  renderPastelDollStyle,
  renderWoolFeltStyle,
  SampleSubjectId
} from './SkillCanvases';
import { Topbar } from './Topbar';
import ipImgSrc from '../assets/images/ip.png';
import arcMotionImgSrc from '../assets/images/arc-motion.jpg';

interface SkillsArchiveProps {
  open: boolean;
  onClose: () => void;
}

interface GalleryStamp {
  uid: string;
  skillId: string;
  kind: 'visual' | 'workflow';
  label: string;
  tag: string;
  accent: string;
  dataUrl?: string;
  receiptLines?: { key: string; val: string }[];
  initX: number;
  initY: number;
  rotate: number;
  zIndex: number;
}

interface SparkleParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  shape: 'star' | 'circle' | 'spark';
}

const SPRING_SNAPPY = { type: 'spring' as const, stiffness: 340, damping: 24 };
const SPRING_TACTILE = { type: 'spring' as const, stiffness: 240, damping: 20 };

const SAMPLE_MODELS: {
  id: SampleSubjectId;
  label: string;
  icon: string;
  swatch: string;
}[] = [
  { id: 'berry', label: '草莓女孩', icon: '🍓', swatch: '#EF4E5E' },
  { id: 'portrait', label: '娃娃人像', icon: '🎀', swatch: '#FCE055' },
  { id: 'vase', label: '极简静物', icon: '🏺', swatch: '#1E63D6' }
];

const SKILL_STYLE_META: Record<
  string,
  {
    themeColor: string;
    noteBg: string;
    tagBg: string;
    tagText: string;
    badgeEmoji: string;
  }
> = {
  'wool-felt': {
    themeColor: '#EF4E5E',
    noteBg: '#FFF8E7',
    tagBg: '#EF4E5E',
    tagText: '#FFFFFF',
    badgeEmoji: '🧶'
  },
  'pastel-doll': {
    themeColor: '#FCE055',
    noteBg: '#EDF5FF',
    tagBg: '#FCE055',
    tagText: '#0F172A',
    badgeEmoji: '🎀'
  },
  'design-restraint': {
    themeColor: '#1E63D6',
    noteBg: '#F6F5F0',
    tagBg: '#1E63D6',
    tagText: '#FFFFFF',
    badgeEmoji: '📐'
  }
};

function parseSkillHash(): number {
  if (typeof window === 'undefined') return 0;
  const raw = window.location.hash.replace(/^#/, '');
  if (!raw || raw === 'skills') return 0;
  const params = new URLSearchParams(raw);
  const slug = params.get('skill');
  if (!slug) return 0;
  const idx = PORTFOLIO_SKILLS.findIndex((s) => s.slug === slug);
  return idx >= 0 ? idx : 0;
}

/**
 * Computes exact 45-degree corner peel geometry from top-right (W, 0)
 */
function computeCornerPeelGeometry(w: number, h: number, peelRatio: number) {
  const s = Math.max(0, Math.min(1, peelRatio)) * (w + h);

  const remainPts: [number, number][] = [];
  if (s <= 0.5) {
    remainPts.push([0, 0], [w, 0], [w, h], [0, h]);
  } else if (s >= w + h - 0.5) {
    remainPts.push([0, h]);
  } else {
    if (s < w) {
      remainPts.push([0, 0]);
      remainPts.push([w - s, 0]);
    } else {
      remainPts.push([0, Math.min(h, s - w)]);
    }

    if (s <= h) {
      remainPts.push([w, s]);
      remainPts.push([w, h]);
    } else {
      remainPts.push([Math.max(0, w - (s - h)), h]);
    }
    remainPts.push([0, h]);
  }

  const foldA: [number, number] =
    s <= w ? [w - s, 0] : [0, Math.min(h, s - w)];
  const foldB: [number, number] =
    s <= h ? [w, s] : [Math.max(0, w - (s - h)), h];

  const hasCurl = s > 4 && s < w + h - 4;
  const foldMidX = (foldA[0] + foldB[0]) / 2;
  const foldMidY = (foldA[1] + foldB[1]) / 2;

  const lipWidth = Math.min(32, Math.max(14, s * 0.26));
  const dx = foldB[0] - foldA[0];
  const dy = foldB[1] - foldA[1];
  const len = Math.hypot(dx, dy) || 1;
  const nx = dy / len;
  const ny = -dx / len;

  const ctrlX = foldMidX + nx * lipWidth;
  const ctrlY = foldMidY + ny * lipWidth;

  const curlPath = hasCurl
    ? `M ${foldA[0].toFixed(1)} ${foldA[1].toFixed(1)} Q ${ctrlX.toFixed(
        1
      )} ${ctrlY.toFixed(1)} ${foldB[0].toFixed(1)} ${foldB[1].toFixed(1)} Z`
    : '';

  const foldPath = hasCurl
    ? `M ${foldA[0].toFixed(1)} ${foldA[1].toFixed(1)} L ${foldB[0].toFixed(
        1
      )} ${foldB[1].toFixed(1)}`
    : '';

  const handleX = Math.max(26, Math.min(w - 26, foldMidX + nx * (lipWidth * 0.35)));
  const handleY = Math.max(18, Math.min(h - 18, foldMidY + ny * (lipWidth * 0.35)));

  const toClipPoly = (pts: [number, number][]) =>
    pts.length >= 3
      ? `polygon(${pts
          .map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`)
          .join(', ')})`
      : 'polygon(0px 0px, 0px 0px, 0px 0px)';

  return {
    remainClipPath: toClipPoly(remainPts),
    curlPath,
    foldPath,
    handlePos: { x: handleX, y: handleY }
  };
}

/**
 * Draggable collectible stamp deposited on the desk
 */
const DraggableDeskExhibit: React.FC<{
  stamp: GalleryStamp;
  constraintsRef: React.RefObject<HTMLDivElement | null>;
  onFocus: (uid: string) => void;
  onRemove: (uid: string) => void;
}> = ({ stamp, constraintsRef, onFocus, onRemove }) => {
  const prefersReduced = useReducedMotion();
  const x = useMotionValue(stamp.initX);
  const y = useMotionValue(stamp.initY);
  const xVel = useVelocity(x);
  const tilt = useTransform(xVel, [-1000, 0, 1000], [-10, 0, 10]);
  const smoothTilt = useSpring(tilt, { stiffness: 300, damping: 24 });

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!stamp.dataUrl) return;
    const a = document.createElement('a');
    a.href = stamp.dataUrl;
    a.download = `${stamp.skillId}-gallery.png`;
    a.click();
  };

  return (
    <motion.div
      drag
      dragConstraints={constraintsRef}
      dragElastic={0.14}
      dragMomentum={false}
      style={{
        x,
        y,
        rotate: prefersReduced ? stamp.rotate : smoothTilt,
        zIndex: stamp.zIndex
      }}
      initial={
        prefersReduced
          ? { opacity: 0 }
          : {
              opacity: 0,
              scale: 0.65,
              y: stamp.initY - 40,
              rotate: stamp.rotate * 1.8
            }
      }
      animate={{
        opacity: 1,
        scale: 1,
        y: stamp.initY,
        rotate: stamp.rotate
      }}
      exit={prefersReduced ? { opacity: 0 } : { opacity: 0, scale: 0.78 }}
      transition={SPRING_TACTILE}
      whileHover={prefersReduced ? undefined : { scale: 1.05, y: stamp.initY - 4 }}
      whileDrag={prefersReduced ? undefined : { scale: 1.08 }}
      onPointerDown={() => onFocus(stamp.uid)}
      className="group pointer-events-auto absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing select-none"
    >
      {stamp.kind === 'visual' ? (
        <div style={{ filter: 'drop-shadow(0 14px 26px rgba(15,23,42,0.18))' }}>
          <div className="stamp-card-mask relative w-[148px] sm:w-[168px] bg-[#FFFFFF] p-3">
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[2px] border border-[#0F172A]/10 bg-[#F6F5F0]">
              {stamp.dataUrl && (
                <img
                  src={stamp.dataUrl}
                  alt={stamp.label}
                  draggable={false}
                  className="w-full h-full object-cover pointer-events-none"
                />
              )}
            </div>
            <div className="mt-2 flex items-center justify-between gap-1 px-0.5">
              <span className="inline-flex items-center gap-1.5 font-paper-mono text-[9.5px] font-semibold text-[#0F172A] truncate">
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: stamp.accent }}
                />
                {stamp.tag}
              </span>
              <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={handleDownload}
                  title="下载展品"
                  aria-label="下载展品"
                  className="p-0.5 rounded hover:bg-[#EDF4FF] text-[#374151] hover:text-[#1E63D6] cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(stamp.uid);
                  }}
                  title="取下展品"
                  aria-label="取下展品"
                  className="p-0.5 rounded hover:bg-[#FFF2F3] text-[#786858] hover:text-[#EF4E5E] cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative w-[172px] bg-[#FEFCF8] border border-[#0F172A]/14 px-3 py-2.5 shadow-[0_14px_26px_rgba(15,23,42,0.18)]">
          <div
            aria-hidden="true"
            className="absolute -top-[4px] left-0 right-0 h-[4px]"
            style={{
              backgroundImage:
                'radial-gradient(circle at 4px 0, transparent 3px, #FEFCF8 3.2px)',
              backgroundSize: '8px 4px'
            }}
          />
          <div className="flex items-center justify-between pb-1 mb-1 border-b border-dashed border-[#0F172A]/18">
            <span className="font-paper-mono text-[9.5px] font-semibold text-[#1E63D6]">
              {stamp.tag}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(stamp.uid);
              }}
              aria-label="移除便签"
              className="p-0.5 text-[#786858] hover:text-[#EF4E5E] cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-1 font-paper-mono text-[9.5px] text-[#374151]">
            {stamp.receiptLines?.map((l, i) => (
              <div key={i} className="flex items-center justify-between gap-2">
                <span className="text-[#786858]">{l.key}</span>
                <span className="bg-[#FCE055]/70 px-1 rounded-[2px] font-semibold text-[#0F172A]">
                  {l.val}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-2 pt-1 border-t border-dashed border-[#0F172A]/20 font-paper-mono text-[8.5px] tracking-widest text-[#786858] text-center">
            SPEC AUDITED · 60FPS
          </div>
        </div>
      )}
    </motion.div>
  );
};

export const SkillsArchive: React.FC<SkillsArchiveProps> = ({
  open,
  onClose
}) => {
  const prefersReduced = useReducedMotion();

  const [activeSkillIndex, setActiveSkillIndex] = useState<number>(() =>
    parseSkillHash()
  );
  const [activeCategory, setActiveCategory] = useState<SkillCategory>('portrait');
  const [activeSample, setActiveSample] = useState<SampleSubjectId>('berry');
  const [uploadedImage, setUploadedImage] = useState<{
    img: HTMLImageElement;
    name: string;
  } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Peel state: 0.16 = resting teaser curl, 0.52 = half comparison, 1 = fully revealed
  const [peelRatio, setPeelRatio] = useState<number>(0.16);
  const [isPeelDragging, setIsPeelDragging] = useState(false);
  const [cornerHovered, setCornerHovered] = useState(false);

  // Stamped exhibits on desk
  const [stamps, setStamps] = useState<GalleryStamp[]>([]);
  const topZRef = useRef(28);

  // Sparkle burst particles
  const [particles, setParticles] = useState<SparkleParticle[]>([]);
  const particleIdRef = useRef(0);

  // Note popover (SKILL.md & prompt)
  const [noteOpen, setNoteOpen] = useState(false);
  const [recipeTab, setRecipeTab] = useState<'rules' | 'prompt'>('rules');
  const [copiedCode, setCopiedCode] = useState(false);

  // Preloaded sample images
  const [loadedSamples, setLoadedSamples] = useState<{
    berry: HTMLImageElement | null;
    portrait: HTMLImageElement | null;
  }>({ berry: null, portrait: null });

  const stageRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const beforeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const afterCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const peelDraggingRef = useRef(false);
  const peelMovedRef = useRef(false);

  const [cardSize, setCardSize] = useState<{ w: number; h: number }>({
    w: 480,
    h: 300
  });

  const currentSkill: PortfolioSkill =
    PORTFOLIO_SKILLS[activeSkillIndex] ?? PORTFOLIO_SKILLS[0];
  const isVisualSkill = currentSkill.kind === 'visual';
  const currentMeta =
    SKILL_STYLE_META[currentSkill.id] ?? SKILL_STYLE_META['wool-felt'];

  // Keep active category in sync with current skill
  useEffect(() => {
    setActiveCategory(currentSkill.category);
  }, [currentSkill.category]);

  // Preload sample image elements
  useEffect(() => {
    let active = true;
    const berryImg = new Image();
    berryImg.onload = () => {
      if (active) setLoadedSamples((prev) => ({ ...prev, berry: berryImg }));
    };
    berryImg.src = ipImgSrc;

    const portraitImg = new Image();
    portraitImg.onload = () => {
      if (active)
        setLoadedSamples((prev) => ({ ...prev, portrait: portraitImg }));
    };
    portraitImg.src = arcMotionImgSrc;

    return () => {
      active = false;
    };
  }, []);

  // Measure centerpiece card accurately
  useEffect(() => {
    if (!open) return;
    const el = cardRef.current;
    if (!el) return;
    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setCardSize((prev) =>
          Math.abs(prev.w - rect.width) < 1 &&
          Math.abs(prev.h - rect.height) < 1
            ? prev
            : { w: rect.width, h: rect.height }
        );
      }
    };
    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(el);
    return () => ro.disconnect();
  }, [open]);

  // Render raw & styled canvases
  useEffect(() => {
    if (!open || !isVisualSkill) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cw = Math.max(360, Math.round(cardSize.w * dpr));
    const ch = Math.max(220, Math.round(cardSize.h * dpr));

    const srcCanvas = uploadedImage
      ? renderImageFitCanvas(uploadedImage.img, cw, ch)
      : createSampleCanvas(activeSample, cw, ch, loadedSamples);

    const beforeEl = beforeCanvasRef.current;
    const afterEl = afterCanvasRef.current;
    if (!beforeEl || !afterEl) return;

    beforeEl.width = cw;
    beforeEl.height = ch;
    afterEl.width = cw;
    afterEl.height = ch;

    const bCtx = beforeEl.getContext('2d');
    if (bCtx) {
      bCtx.clearRect(0, 0, cw, ch);
      bCtx.drawImage(srcCanvas, 0, 0, cw, ch);
    }

    if (currentSkill.id === 'pastel-doll') {
      renderPastelDollStyle(srcCanvas, afterEl);
    } else {
      renderWoolFeltStyle(srcCanvas, afterEl);
    }
  }, [
    open,
    isVisualSkill,
    currentSkill.id,
    activeSample,
    uploadedImage,
    loadedSamples,
    cardSize
  ]);

  // Body scroll lock & URL hash sync
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open || typeof window === 'undefined') return;
    const targetHash = `#skill=${currentSkill.slug}`;
    if (window.location.hash !== targetHash) {
      window.history.replaceState(null, '', targetHash);
    }
  }, [open, currentSkill.slug]);

  // Particle burst generator for transformation delight
  const triggerSparkleBurst = useCallback((originX?: number, originY?: number) => {
    if (prefersReduced) return;
    const rect = cardRef.current?.getBoundingClientRect();
    const cx = originX ?? (rect ? rect.left + rect.width / 2 : window.innerWidth / 2);
    const cy = originY ?? (rect ? rect.top + rect.height / 2 : window.innerHeight / 2);

    const colors = ['#EF4E5E', '#1E63D6', '#FCE055', '#4B6B4C'];
    const shapes: ('star' | 'circle' | 'spark')[] = ['star', 'circle', 'spark'];
    const count = 14;

    const newParticles: SparkleParticle[] = Array.from({ length: count }, () => {
      particleIdRef.current += 1;
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 85;
      return {
        id: particleIdRef.current,
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 7 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: shapes[Math.floor(Math.random() * shapes.length)]
      };
    });

    setParticles((prev) => [...prev, ...newParticles]);
    window.setTimeout(() => {
      setParticles((prev) =>
        prev.filter((p) => !newParticles.some((np) => np.id === p.id))
      );
    }, 850);
  }, [prefersReduced]);

  const handleCloseWorkspace = useCallback(() => {
    setNoteOpen(false);
    if (
      typeof window !== 'undefined' &&
      (window.location.hash.startsWith('#skills') ||
        window.location.hash.startsWith('#skill='))
    ) {
      window.history.replaceState(
        null,
        '',
        window.location.pathname + window.location.search
      );
    }
    onClose();
  }, [onClose]);

  const selectSkill = useCallback((idx: number) => {
    const wrapped = (idx + PORTFOLIO_SKILLS.length) % PORTFOLIO_SKILLS.length;
    setActiveSkillIndex(wrapped);
    setPeelRatio((prev) => (prev < 0.35 ? 0.45 : prev));
    setCopiedCode(false);
    triggerSparkleBurst();
  }, [triggerSparkleBurst]);

  const switchCategory = (cat: SkillCategory) => {
    setActiveCategory(cat);
    const firstInCat = PORTFOLIO_SKILLS.findIndex((s) => s.category === cat);
    if (firstInCat >= 0) {
      selectSkill(firstInCat);
    }
  };

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (noteOpen) {
          setNoteOpen(false);
        } else {
          handleCloseWorkspace();
        }
      } else if (e.key === 'ArrowLeft') {
        selectSkill(activeSkillIndex - 1);
      } else if (e.key === 'ArrowRight') {
        selectSkill(activeSkillIndex + 1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, noteOpen, activeSkillIndex, selectSkill, handleCloseWorkspace]);

  // Peel drag interaction
  const updatePeelFromPointer = useCallback((clientX: number, clientY: number) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect || !rect.width || !rect.height) return;
    const dx = Math.max(0, rect.right - clientX);
    const dy = Math.max(0, clientY - rect.top);
    const ratio = (dx + dy) / (rect.width + rect.height);
    setPeelRatio(Math.max(0.09, Math.min(1, ratio * 1.15)));
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPointerMove = (e: PointerEvent) => {
      if (!peelDraggingRef.current) return;
      peelMovedRef.current = true;
      updatePeelFromPointer(e.clientX, e.clientY);
    };
    const onPointerUp = () => {
      if (!peelDraggingRef.current) return;
      peelDraggingRef.current = false;
      setIsPeelDragging(false);

      if (!peelMovedRef.current) {
        setPeelRatio((prev) => (prev < 0.36 ? 0.58 : prev < 0.85 ? 1 : 0.16));
      } else {
        setPeelRatio((prev) =>
          prev > 0.78 ? 1 : prev < 0.14 ? 0.14 : prev
        );
      }
    };
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [open, updatePeelFromPointer]);

  const handleLoadUploadedFile = useCallback((file: File | undefined | null) => {
    if (!file || !file.type.startsWith('image/')) return;
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setUploadedImage({ img, name: file.name });
      setPeelRatio(0.58);
      triggerSparkleBurst();
      URL.revokeObjectURL(objectUrl);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
    };
    img.src = objectUrl;
  }, [triggerSparkleBurst]);

  // Stamp current masterpiece onto desk collection
  const handleStampExhibit = useCallback(() => {
    triggerSparkleBurst();

    const count = stamps.length;
    const isMobile =
      typeof window !== 'undefined' ? window.innerWidth < 768 : false;
    const desktopSpots: [number, number, number][] = [
      [360, -90, 6],
      [380, 70, -4],
      [-360, 20, -5],
      [340, -10, 3],
      [-350, -110, 5],
      [-345, 130, -3]
    ];
    const [dx, dy, drot] = desktopSpots[count % desktopSpots.length];
    const initX = isMobile ? (count % 2 === 0 ? 82 : -82) : dx;
    const initY = isMobile ? -130 + count * 40 : dy;
    const rotate = isMobile ? (count % 2 === 0 ? 5 : -5) : drot;

    topZRef.current += 1;
    const uid = `${currentSkill.id}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 6)}`;

    if (isVisualSkill) {
      const w = 420;
      const h = 262;
      const src = uploadedImage
        ? renderImageFitCanvas(uploadedImage.img, w, h)
        : createSampleCanvas(activeSample, w, h, loadedSamples);
      const dst = document.createElement('canvas');
      dst.width = w;
      dst.height = h;
      if (currentSkill.id === 'pastel-doll') {
        renderPastelDollStyle(src, dst);
      } else {
        renderWoolFeltStyle(src, dst);
      }
      const dataUrl = dst.toDataURL('image/png');

      setStamps((prev) => [
        ...prev.slice(-5),
        {
          uid,
          skillId: currentSkill.id,
          kind: 'visual',
          label: currentSkill.title,
          tag: currentSkill.shortCn,
          accent: currentMeta.themeColor,
          dataUrl,
          initX,
          initY,
          rotate,
          zIndex: topZRef.current
        }
      ]);
      setPeelRatio((prev) => (prev < 0.42 ? 0.6 : prev));
    } else {
      setStamps((prev) => [
        ...prev.slice(-5),
        {
          uid,
          skillId: currentSkill.id,
          kind: 'workflow',
          label: currentSkill.title,
          tag: 'SPEC RECEIPT',
          accent: currentMeta.themeColor,
          receiptLines: [
            { key: 'CANVAS', val: '#FEFCF8' },
            { key: 'TYPE', val: 'Space Grotesk' },
            { key: 'SPRING', val: '320 / 22' }
          ],
          initX,
          initY,
          rotate,
          zIndex: topZRef.current
        }
      ]);
      setPeelRatio(1);
    }
  }, [
    triggerSparkleBurst,
    stamps.length,
    currentSkill.id,
    currentSkill.title,
    currentSkill.shortCn,
    isVisualSkill,
    uploadedImage,
    activeSample,
    loadedSamples,
    currentMeta.themeColor
  ]);

  const handleDownloadArtwork = () => {
    const el = afterCanvasRef.current;
    if (!el) return;
    const a = document.createElement('a');
    a.href = el.toDataURL('image/png');
    a.download = `${currentSkill.slug}-${uploadedImage ? 'custom' : activeSample}.png`;
    a.click();
  };

  const handleCopyRecipe = async () => {
    const txt =
      recipeTab === 'rules'
        ? currentSkill.recipeMarkdown
        : currentSkill.promptTemplate;
    try {
      await navigator.clipboard.writeText(txt);
      setCopiedCode(true);
      window.setTimeout(() => setCopiedCode(false), 1600);
    } catch {
      // Ignore clipboard failures
    }
  };

  const handleDownloadSkillMd = () => {
    const blob = new Blob([currentSkill.recipeMarkdown], {
      type: 'text/markdown;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentSkill.slug}-SKILL.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const effectivePeel = cornerHovered && peelRatio < 0.22 ? 0.26 : peelRatio;
  const peelGeom = useMemo(
    () => computeCornerPeelGeometry(cardSize.w, cardSize.h, effectivePeel),
    [cardSize.w, cardSize.h, effectivePeel]
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Skills Interactive Studio"
          initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
          transition={
            prefersReduced
              ? { duration: 0.12 }
              : { duration: 0.28, ease: [0.22, 1, 0.36, 1] }
          }
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={(e) => {
            if (e.currentTarget === e.target) setIsDragOver(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            handleLoadUploadedFile(e.dataTransfer.files?.[0]);
          }}
          className="fixed inset-0 z-50 flex flex-col overflow-hidden dot-grid-paper text-[#0F172A]"
        >
          {/* Topbar */}
          <Topbar
            onBrandClick={handleCloseWorkspace}
            breadcrumb="skills"
            className="relative z-40 w-full pt-6 pb-2 sm:pt-8 sm:pb-2.5 pointer-events-none no-print shrink-0"
          />

          {/* SPARKLE BURST PARTICLES */}
          <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden">
            <AnimatePresence>
              {particles.map((p) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 1, x: p.x, y: p.y, scale: 0.2 }}
                  animate={{
                    opacity: 0,
                    x: p.x + p.vx,
                    y: p.y + p.vy + 20,
                    scale: 1,
                    rotate: p.vx * 2
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    position: 'absolute',
                    width: p.size,
                    height: p.size,
                    color: p.color
                  }}
                >
                  {p.shape === 'star' ? (
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                      <path d="M12 0L14.8 9.2L24 12L14.8 14.8L12 24L9.2 14.8L0 12L9.2 9.2Z" />
                    </svg>
                  ) : p.shape === 'spark' ? (
                    <div className="w-full h-full rotate-45 border border-current rounded-sm" />
                  ) : (
                    <div className="w-full h-full rounded-full bg-current opacity-85" />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* AIRY STUDIO BENCH */}
          <div
            ref={stageRef}
            className="relative flex-1 w-full flex flex-col items-center justify-center px-4 pb-28 pt-1 overflow-hidden"
          >
            {/* AMBIENT WHIMSICAL DOODLES (Inspired by user's references) */}
            <motion.div
              aria-hidden="true"
              animate={prefersReduced ? undefined : { y: [-3, 3, -3], rotate: [-2, 3, -2] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="pointer-events-none hidden md:block absolute left-[15%] top-[14%] text-[#1E63D6]/45 select-none"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L14.6 9.4L23 12L14.6 14.6L12 23L9.4 14.6L1 12L9.4 9.4Z" />
              </svg>
            </motion.div>
            <motion.div
              aria-hidden="true"
              animate={prefersReduced ? undefined : { y: [4, -4, 4], rotate: [3, -3, 3] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
              className="pointer-events-none hidden md:block absolute right-[13%] bottom-[22%] text-[#EF4E5E]/45 select-none"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </motion.div>

            {/* FLOATING ARTISAN'S MEMO (Skill Identity & Recipe Teaser) */}
            <motion.div
              drag
              dragConstraints={stageRef}
              dragElastic={0.12}
              dragMomentum={false}
              initial={prefersReduced ? false : { opacity: 0, x: -20, rotate: -4 }}
              animate={{ opacity: 1, x: 0, rotate: -2 }}
              transition={SPRING_SNAPPY}
              whileHover={prefersReduced ? undefined : { scale: 1.03, rotate: 0 }}
              style={{ backgroundColor: currentMeta.noteBg }}
              className="hidden lg:flex flex-col justify-between absolute left-[6%] xl:left-[8%] top-[14%] z-20 w-[184px] p-4 border border-[#0F172A]/10 shadow-[0_14px_28px_rgba(15,23,42,0.10)] cursor-grab active:cursor-grabbing select-none"
            >
              <div className="flex items-center justify-between">
                <span className="font-paper-mono text-[10px] font-semibold text-[#786858]">
                  {currentSkill.indexLabel} // {currentSkill.categoryEn}
                </span>
                <span className="text-[13px]">{currentMeta.badgeEmoji}</span>
              </div>
              <div className="my-2.5">
                <h3 className="font-display text-[17px] font-bold tracking-tight text-[#0F172A] leading-snug">
                  {currentSkill.title}
                </h3>
                <p className="font-paper-mono text-[10px] leading-relaxed text-[#374151]/90 mt-1.5">
                  {currentSkill.taglineCn}
                </p>
                <div className="mt-2 pt-2 border-t border-dashed border-[#0F172A]/12">
                  <span className="font-paper-mono text-[9px] text-[#786858]">
                    核心原则：{currentSkill.constraints[0]?.label}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between font-paper-mono text-[9px] text-[#786858]">
                <span>可拖拽便签</span>
                <button
                  type="button"
                  onClick={() => setNoteOpen(true)}
                  className="text-[#1E63D6] hover:underline cursor-pointer"
                >
                  看咒语 ↗
                </button>
              </div>
            </motion.div>

            {/* COLLECTIBLE EXHIBITS EJECTED TO DESK */}
            <div className="pointer-events-none absolute inset-0 z-25">
              <AnimatePresence>
                {stamps.map((stamp) => (
                  <DraggableDeskExhibit
                    key={stamp.uid}
                    stamp={stamp}
                    constraintsRef={stageRef}
                    onFocus={(uid) => {
                      topZRef.current += 1;
                      setStamps((prev) =>
                        prev.map((s) =>
                          s.uid === uid ? { ...s, zIndex: topZRef.current } : s
                        )
                      );
                    }}
                    onRemove={(uid) =>
                      setStamps((prev) => prev.filter((s) => s.uid !== uid))
                    }
                  />
                ))}
              </AnimatePresence>
            </div>

            {/* CENTERPIECE: TYPOGRAPHY + SCALLOPED CANVASES + INPUT TRAY */}
            <div className="relative z-10 flex flex-col items-center w-full max-w-[500px]">
              {/* CLEAR HEADER & CATEGORY SEGMENT */}
              <div className="text-center mb-3 sm:mb-4 select-none flex flex-col items-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFFFFF] border border-[#0F172A]/8 shadow-sm font-paper-mono text-[11px] mb-2">
                  <button
                    type="button"
                    onClick={() => switchCategory('portrait')}
                    className={`px-2.5 py-0.5 rounded-full transition-colors cursor-pointer ${
                      activeCategory === 'portrait'
                        ? 'bg-[#1E63D6] text-white font-semibold'
                        : 'text-[#786858] hover:text-[#0F172A]'
                    }`}
                  >
                    🎨 人像转绘 (2)
                  </button>
                  <span className="text-[#E5E7EB]">|</span>
                  <button
                    type="button"
                    onClick={() => switchCategory('workflow')}
                    className={`px-2.5 py-0.5 rounded-full transition-colors cursor-pointer ${
                      activeCategory === 'workflow'
                        ? 'bg-[#1E63D6] text-white font-semibold'
                        : 'text-[#786858] hover:text-[#0F172A]'
                    }`}
                  >
                    ⚡ 工作流提效 (1)
                  </button>
                </div>

                <h1 className="font-display text-[26px] sm:text-[32px] font-bold tracking-[-0.03em] leading-tight text-[#0F172A]">
                  {currentSkill.shortCn} ·{' '}
                  <span className="text-[#1E63D6] font-normal text-[22px] sm:text-[26px]">
                    {currentSkill.tabLabel}
                  </span>
                </h1>
                <p className="font-paper-mono text-[11px] sm:text-[11.5px] text-[#786858] mt-0.5">
                  {currentSkill.taglineCn}
                </p>
              </div>

              {/* SCALLOPED STAMP CANVASES (Main Transformer) */}
              <motion.div
                key={`${currentSkill.id}-${uploadedImage?.name ?? activeSample}`}
                initial={
                  prefersReduced
                    ? { opacity: 0 }
                    : { opacity: 0, y: 10, scale: 0.97 }
                }
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={SPRING_SNAPPY}
                style={{
                  filter: 'drop-shadow(0 20px 36px rgba(15,23,42,0.16))'
                }}
                className="w-full"
              >
                <div className="stamp-card-mask bg-[#FFFFFF] p-4 sm:p-5">
                  <div
                    ref={cardRef}
                    className="relative w-full aspect-[16/10] rounded-[4px] overflow-hidden border border-[#0F172A]/10 bg-[#F6F5F0] select-none"
                  >
                    {/* UNDERNEATH LAYER: STYLED OUTPUT */}
                    {isVisualSkill ? (
                      <div className="absolute inset-0">
                        <canvas
                          ref={afterCanvasRef}
                          className="w-full h-full block"
                        />
                        <span
                          className="pointer-events-none absolute bottom-2.5 right-2.5 z-10 rounded-[4px] px-2 py-0.5 font-paper-mono text-[9.5px] font-semibold tracking-wide shadow-sm"
                          style={{
                            backgroundColor: currentMeta.tagBg,
                            color: currentMeta.tagText
                          }}
                        >
                          {currentSkill.outputTag}
                        </span>
                      </div>
                    ) : (
                      /* Workflow Engineering Preview */
                      <div className="absolute inset-0 bg-[#FFFFFF] p-5 sm:p-6 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <span className="font-paper-mono text-[10px] font-semibold text-[#1E63D6] bg-[#EDF4FF] px-2 py-0.5 rounded-[4px]">
                            DETERMINISTIC SPEC
                          </span>
                          <Sparkles className="w-4 h-4 text-[#1E63D6]" />
                        </div>
                        <div className="space-y-1.5 font-paper-mono text-[12px] sm:text-[13px] leading-relaxed text-[#0F172A]">
                          {currentSkill.workflowDiff?.outputLines.map(
                            (line, idx) => (
                              <p key={idx}>
                                <span className="text-[#786858]">
                                  {line.text}
                                </span>
                                {line.highlight && (
                                  <span className="bg-[#FCE055] px-1 py-0.5 rounded-[3px] font-semibold text-[#0F172A]">
                                    {line.highlight}
                                  </span>
                                )}
                                {line.after && <span>{line.after}</span>}
                              </p>
                            )
                          )}
                        </div>
                        <span className="font-paper-mono text-[9.5px] text-[#786858]">
                          03 // {currentSkill.title}
                        </span>
                      </div>
                    )}

                    {/* TOP LAYER: RAW INPUT (Clipped along 45deg peel) */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{ clipPath: peelGeom.remainClipPath }}
                    >
                      {isVisualSkill ? (
                        <div className="relative w-full h-full">
                          <canvas
                            ref={beforeCanvasRef}
                            className="w-full h-full block"
                          />
                          <span className="absolute top-2.5 left-2.5 rounded-[4px] bg-[#FEFCF8]/90 border border-[#0F172A]/10 px-2 py-0.5 font-paper-mono text-[9.5px] font-semibold text-[#786858]">
                            {uploadedImage
                              ? `原图 · ${uploadedImage.name.slice(0, 16)}`
                              : 'RAW 原图'}
                          </span>
                        </div>
                      ) : (
                        <div className="w-full h-full bg-[#F6F5F0] p-5 sm:p-6 flex flex-col justify-between">
                          <span className="font-paper-mono text-[10px] font-semibold text-[#786858]">
                            RAW PROMPT (BEFORE)
                          </span>
                          <p className="font-paper-mono text-[12.5px] sm:text-[13.5px] leading-relaxed text-[#374151]">
                            {currentSkill.workflowDiff?.inputText}
                          </p>
                          <span className="font-paper-mono text-[9.5px] text-[#786858]/75">
                            掀开黄角查看审查结果 ↗
                          </span>
                        </div>
                      )}
                    </div>

                    {/* TAPERED SLEEK PEEL FLAP */}
                    {peelGeom.curlPath && (
                      <svg
                        width={cardSize.w}
                        height={cardSize.h}
                        viewBox={`0 0 ${cardSize.w} ${cardSize.h}`}
                        className="pointer-events-none absolute inset-0 w-full h-full overflow-visible"
                      >
                        <defs>
                          <linearGradient
                            id="galleryPeelFlap"
                            x1="0"
                            y1="1"
                            x2="1"
                            y2="0"
                          >
                            <stop offset="0%" stopColor="#E6C330" />
                            <stop offset="55%" stopColor="#FCE055" />
                            <stop offset="100%" stopColor="#FFF4B8" />
                          </linearGradient>
                          <filter
                            id="galleryPeelShadow"
                            x="-30%"
                            y="-30%"
                            width="160%"
                            height="160%"
                          >
                            <feDropShadow
                              dx="3"
                              dy="-3"
                              stdDeviation="4"
                              floodColor="#0F172A"
                              floodOpacity="0.22"
                            />
                          </filter>
                        </defs>
                        <path
                          d={peelGeom.curlPath}
                          fill="url(#galleryPeelFlap)"
                          stroke="rgba(15,23,42,0.14)"
                          strokeWidth="1"
                          filter="url(#galleryPeelShadow)"
                        />
                        {peelGeom.foldPath && (
                          <path
                            d={peelGeom.foldPath}
                            fill="none"
                            stroke="rgba(15,23,42,0.18)"
                            strokeWidth="1"
                          />
                        )}
                      </svg>
                    )}

                    {/* INTERACTIVE PEEL HANDLE WITH HOVER FLUTTER */}
                    <div
                      role="slider"
                      tabIndex={0}
                      aria-label="拖拽右上角对比原图与效果"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round(peelRatio * 100)}
                      onMouseEnter={() => setCornerHovered(true)}
                      onMouseLeave={() => setCornerHovered(false)}
                      onKeyDown={(e) => {
                        if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
                          e.preventDefault();
                          setPeelRatio((p) => Math.min(1, p + 0.12));
                        } else if (
                          e.key === 'ArrowRight' ||
                          e.key === 'ArrowUp'
                        ) {
                          e.preventDefault();
                          setPeelRatio((p) => Math.max(0.14, p - 0.12));
                        }
                      }}
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        peelDraggingRef.current = true;
                        peelMovedRef.current = false;
                        setIsPeelDragging(true);
                      }}
                      style={{
                        left: peelGeom.handlePos.x,
                        top: peelGeom.handlePos.y
                      }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 z-30 cursor-grab active:cursor-grabbing focus-visible:outline-2 focus-visible:outline-[#1E63D6] transition-transform ${
                        isPeelDragging
                          ? 'scale-110'
                          : cornerHovered
                            ? 'scale-110 -rotate-3'
                            : 'hover:scale-105'
                      }`}
                    >
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#FCE055] border border-[#0F172A]/20 font-paper-mono text-[9.5px] font-semibold text-[#0F172A] shadow-[0_4px_10px_rgba(15,23,42,0.18)] whitespace-nowrap">
                        {peelRatio >= 0.92
                          ? '↺ 合上'
                          : peelRatio <= 0.24
                            ? '↙ 掀开'
                            : `${Math.round(peelRatio * 100)}%`}
                      </span>
                    </div>

                    {/* Drag & drop highlight */}
                    {isDragOver && (
                      <div className="pointer-events-none absolute inset-1.5 z-40 rounded border-2 border-dashed border-[#1E63D6] bg-[#EDF4FF]/92 flex flex-col items-center justify-center gap-1 font-paper-mono text-[#1E63D6]">
                        <span className="text-[13px] font-semibold">
                          松手喂入你的照片
                        </span>
                        <span className="text-[10.5px] opacity-80">
                          即刻施展 {currentSkill.shortCn}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* CRYSTAL CLEAR INPUT TRAY (理顺输入源：传图/模特 vs 需求输入) */}
              <div className="w-full mt-3 flex items-center justify-between gap-2 px-1 flex-wrap">
                {isVisualSkill ? (
                  <>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-paper-mono text-[10.5px] text-[#786858]">
                        试玩模特:
                      </span>
                      {SAMPLE_MODELS.map((model) => {
                        const active =
                          uploadedImage === null && activeSample === model.id;
                        return (
                          <button
                            key={model.id}
                            type="button"
                            onClick={() => {
                              setUploadedImage(null);
                              setActiveSample(model.id);
                              triggerSparkleBurst();
                            }}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-[8px] font-paper-mono text-[10.5px] border transition-all cursor-pointer ${
                              active
                                ? 'bg-[#FFFFFF] border-[#1E63D6] text-[#1E63D6] font-semibold shadow-[0_2px_6px_rgba(30,99,214,0.12)]'
                                : 'bg-[#FEFCF8] border-[#E5E7EB] text-[#374151] hover:bg-[#FFFFFF] hover:border-[#1E63D6]/40'
                            }`}
                          >
                            <span>{model.icon}</span>
                            <span>{model.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          handleLoadUploadedFile(e.target.files?.[0]);
                          e.currentTarget.value = '';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[8px] bg-[#FFFFFF] border border-[#1E63D6]/35 font-paper-mono text-[10.5px] font-semibold text-[#1E63D6] hover:bg-[#1E63D6] hover:text-white active:scale-95 transition-all cursor-pointer shadow-sm"
                      >
                        <ImagePlus className="w-3.5 h-3.5" />
                        <span>{uploadedImage ? '更换照片' : '上传我的照片'}</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="w-full flex items-center justify-between gap-2 flex-wrap font-paper-mono text-[11px]">
                    <span className="text-[#786858]">
                      工作流说明：自动审查需求违规并映射为确定性 Token
                    </span>
                    <span className="text-[#1E63D6] bg-[#EDF4FF] px-2 py-0.5 rounded-[4px] font-medium">
                      + 更多工作流 Skill 建设中
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* PURPOSEFUL, STRUCTURED BOTTOM DOCK (解决所有按钮困惑) */}
            <div className="fixed bottom-5 sm:bottom-7 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-3 max-w-[96vw]">
              {/* SKILL.md popover note card */}
              <AnimatePresence>
                {noteOpen && (
                  <motion.div
                    initial={
                      prefersReduced
                        ? { opacity: 0 }
                        : { opacity: 0, y: 12, scale: 0.96 }
                    }
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={
                      prefersReduced
                        ? { opacity: 0 }
                        : { opacity: 0, y: 8, scale: 0.96 }
                    }
                    transition={SPRING_SNAPPY}
                    className="w-[310px] sm:w-[370px] rounded-2xl bg-[#FFFFFF]/98 backdrop-blur-md border border-[#0F172A]/10 p-4 shadow-[0_20px_45px_rgba(15,23,42,0.16)] space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-paper-mono text-[10px] font-semibold text-[#1E63D6]">
                          {currentSkill.kindLabel}
                        </span>
                        <h3 className="font-display text-[17px] font-bold text-[#0F172A] leading-tight">
                          {currentSkill.title}
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setNoteOpen(false)}
                        aria-label="关闭便签"
                        className="p-1 rounded-md hover:bg-[#F6F5F0] text-[#786858] cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="font-display text-[12.5px] leading-relaxed text-[#374151]">
                      {currentSkill.subtitle}
                    </p>

                    <div className="rounded-xl bg-[#F6F5F0] border border-[#E5E7EB] p-2.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="inline-flex gap-1">
                          <button
                            type="button"
                            onClick={() => setRecipeTab('rules')}
                            className={`px-2 py-0.5 rounded font-paper-mono text-[10.5px] cursor-pointer ${
                              recipeTab === 'rules'
                                ? 'bg-[#EDF4FF] text-[#1E63D6] font-semibold'
                                : 'text-[#786858]'
                            }`}
                          >
                            SKILL.md
                          </button>
                          <button
                            type="button"
                            onClick={() => setRecipeTab('prompt')}
                            className={`px-2 py-0.5 rounded font-paper-mono text-[10.5px] cursor-pointer ${
                              recipeTab === 'prompt'
                                ? 'bg-[#EDF4FF] text-[#1E63D6] font-semibold'
                                : 'text-[#786858]'
                            }`}
                          >
                            Prompt 咒语
                          </button>
                        </div>

                        <div className="flex items-center gap-2 font-paper-mono text-[10.5px] text-[#786858]">
                          <button
                            type="button"
                            onClick={handleDownloadSkillMd}
                            className="hover:text-[#1E63D6] cursor-pointer"
                          >
                            .md
                          </button>
                          <button
                            type="button"
                            onClick={handleCopyRecipe}
                            className="inline-flex items-center gap-1 hover:text-[#1E63D6] cursor-pointer"
                          >
                            {copiedCode ? (
                              <Check className="w-3 h-3 text-[#1E63D6]" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                            <span>{copiedCode ? '已复制' : '复制'}</span>
                          </button>
                        </div>
                      </div>

                      <pre className="font-paper-mono text-[10.5px] leading-[1.55] max-h-[140px] overflow-auto text-[#0F172A]/85 whitespace-pre-wrap">
                        <code>
                          {recipeTab === 'rules'
                            ? currentSkill.recipeMarkdown
                            : currentSkill.promptTemplate}
                        </code>
                      </pre>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Main Floating Glass Dock */}
              <div className="flex items-center gap-1.5 rounded-[20px] bg-[#FFFFFF]/92 backdrop-blur-md border border-[#0F172A]/10 p-1.5 shadow-[0_12px_32px_rgba(15,23,42,0.10)]">
                {/* 1. Skill Selector in current category */}
                <div
                  className="flex items-center gap-1"
                  role="tablist"
                  aria-label="选择技能"
                >
                  {PORTFOLIO_SKILLS.filter(
                    (s) => s.category === activeCategory
                  ).map((skill) => {
                    const idx = PORTFOLIO_SKILLS.findIndex(
                      (p) => p.id === skill.id
                    );
                    const active = idx === activeSkillIndex;
                    const meta =
                      SKILL_STYLE_META[skill.id] ?? SKILL_STYLE_META['wool-felt'];
                    return (
                      <button
                        key={skill.id}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => selectSkill(idx)}
                        className={`inline-flex items-center gap-1.5 h-9 px-3 rounded-[12px] font-paper-mono text-[11px] transition-all cursor-pointer whitespace-nowrap ${
                          active
                            ? 'bg-[#0F172A] text-[#FEFCF8] font-semibold shadow-sm'
                            : 'text-[#786858] hover:bg-[#F6F5F0] hover:text-[#0F172A]'
                        }`}
                      >
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: meta.themeColor }}
                        />
                        <span>{skill.shortCn}</span>
                      </button>
                    );
                  })}
                </div>

                <div
                  aria-hidden="true"
                  className="h-5 w-px bg-[#E5E7EB] mx-1 shrink-0"
                />

                {/* 2. Primary Actions with clear labels */}
                <div className="flex items-center gap-1">
                  {/* Stamp to desk with particle burst */}
                  <button
                    type="button"
                    onClick={handleStampExhibit}
                    title="将当前成果作为一张新邮票盖印到桌面上"
                    className="inline-flex items-center gap-1.5 h-9 px-3 rounded-[12px] bg-[#FCE055] text-[#0F172A] font-paper-mono text-[11px] font-semibold shadow-[0_2px_6px_rgba(15,23,42,0.12)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    <Stamp className="w-3.5 h-3.5" />
                    <span>盖印收藏</span>
                  </button>

                  {/* Save final PNG */}
                  {isVisualSkill && (
                    <button
                      type="button"
                      onClick={handleDownloadArtwork}
                      title="保存当前转绘作品 PNG"
                      className="inline-flex items-center gap-1.5 h-9 px-2.5 rounded-[12px] text-[#374151] hover:bg-[#EDF4FF] hover:text-[#1E63D6] font-paper-mono text-[11px] transition-all cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">保存</span>
                    </button>
                  )}

                  {/* Open recipe note */}
                  <button
                    type="button"
                    onClick={() => setNoteOpen((v) => !v)}
                    title="查看该 Skill 的 SKILL.md 技术配方与 Prompt"
                    className={`inline-flex items-center gap-1.5 h-9 px-2.5 rounded-[12px] font-paper-mono text-[11px] transition-all cursor-pointer ${
                      noteOpen
                        ? 'bg-[#1E63D6] text-white font-semibold'
                        : 'text-[#374151] hover:bg-[#F6F5F0]'
                    }`}
                  >
                    <FileCode2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">配方</span>
                  </button>

                  {/* Clear desk */}
                  {stamps.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setStamps([])}
                      title={`清理桌面上已盖印的 ${stamps.length} 张邮票`}
                      className="h-9 px-2 rounded-[12px] text-[#EF4E5E] hover:bg-[#FFF2F3] font-paper-mono text-[11px] transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
