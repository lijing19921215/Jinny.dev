import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  Download,
  GripVertical,
  Layers,
  Pencil,
  RotateCcw,
  ZoomIn,
  X
} from 'lucide-react';
import { PORTFOLIO_SKILLS, PortfolioSkill } from '../data/skills';
import { Topbar } from './Topbar';
import LightCanvas from './LightCanvas';
import BookShelfCanvas from './BookShelfCanvas';
import {
  EditableItem,
  ItemContext,
  ItemDef,
  ItemTransform,
  TransformMap,
  EditCtx
} from './EditableItem';

interface SkillsArchiveProps {
  open: boolean;
  onClose: () => void;
}

interface FloatingQuip {
  id: number;
  text: string;
  xPct: number;
  yPct: number;
  color: string;
}

const SPRING_SNAPPY = { type: 'spring' as const, stiffness: 320, damping: 22 };
const BRAND_COLORS = ['#EF4E5E', '#1E63D6', '#D97706'];

// Evening runs 18:00 -> 06:00 local time; used to set the initial lamp/background state.
const isNightNow = (): boolean => {
  const h = new Date().getHours();
  return h >= 18 || h < 6;
};

// v7: the hanging lamp could be dragged down until its shade/bulb fell out of
// the viewport (y reached ~50 with h=50). Lamp is now y-locked to the ceiling;
// bump so stale layouts carrying a dragged-off lamp are discarded on load.
// v6 removed the clock; v5 fixed the handle/drag conflict.
const LAYOUT_STORAGE_KEY = 'jinny-skills-layout-v7';

// Layout follows the reference composition: editorial title top-left, a 2x2
// gallery of frames beneath it, chandelier above the armchair + tea table in
// the lower-middle, and the drawn bookshelf on the right.
const ITEM_DEFS: ItemDef[] = [
  // Upper-left gallery wall — scaled down to match the reference proportions.
  { id: 'frame3', name: '植物小挂画', thumb: null, thumbBg: '#FFFFFF', base: { x: 3.5, y: 40, w: 4.8, h: 9.4, rotate: 0 }, baseZ: 15 },
  { id: 'wool-felt', name: 'SKILL 01 毛毡风', thumb: '/assets/room/frame-flowers-1.jpg', thumbBg: '#EDF4FF', base: { x: 9.3, y: 40, w: 6, h: 9.4, rotate: 0 }, baseZ: 20 },
  { id: 'frame1', name: '小挂画 1', thumb: null, thumbBg: '#E6F1FB', base: { x: 16.3, y: 40.3, w: 4.8, h: 8.2, rotate: 0 }, baseZ: 15 },
  { id: 'pastel-doll', name: 'SKILL 02 粉彩娃娃', thumb: '/assets/room/frame-flowers-2.jpg', thumbBg: '#FEF9DB', base: { x: 3.5, y: 51.5, w: 5.6, h: 8.6, rotate: 0 }, baseZ: 20 },
  // Upper-middle pendant lamp (shade centre ≈ 44% of width).
  { id: 'chandelier', name: '吊灯', thumb: null, thumbBg: '#F5F2EA', base: { x: 38.5, y: 0, w: 11, h: 50, rotate: 0 }, baseZ: 25 },
  // Lower-middle armchair + round tea table with cups.
  { id: 'armchair', name: '单人扶手沙发', thumb: '/assets/room/armchair.png', thumbBg: '#E6ECF2', base: { x: 29, y: 62, w: 14, h: 30, rotate: 0 }, baseZ: 15 },
  { id: 'table', name: '椭圆茶几', thumb: null, thumbBg: '#E3EEFB', base: { x: 43, y: 75, w: 15, h: 17, rotate: 0 }, baseZ: 22 },
  { id: 'cup1', name: '碎花茶杯', thumb: '/assets/room/teacup.png', thumbBg: '#FFFFFF', base: { x: 45, y: 78, w: 4, h: 6, rotate: 0 }, baseZ: 26 },
  { id: 'teapot', name: '碎花茶壶', thumb: '/assets/room/teapot.png', thumbBg: '#FFFFFF', base: { x: 50, y: 77, w: 7, h: 6.5, rotate: 0 }, baseZ: 26 },
  // Right-side drawn bookshelf with label + info card — scaled down.
  { id: 'design-restraint', name: 'SKILL 03 书架', thumb: null, thumbBg: '#EDF4FF', base: { x: 71, y: 60, w: 22, h: 33, rotate: 0 }, baseZ: 18 }
];

const DEF_TRANSFORMS: TransformMap = Object.fromEntries(
  ITEM_DEFS.map((d) => [
    d.id,
    { ...d.base, z: d.baseZ } as ItemTransform
  ])
);

function loadLayout(): TransformMap {
  try {
    const raw = window.localStorage.getItem(LAYOUT_STORAGE_KEY);
    if (!raw) return { ...DEF_TRANSFORMS };
    const parsed = JSON.parse(raw) as Record<string, Partial<ItemTransform>>;
    const out: TransformMap = { ...DEF_TRANSFORMS };
    for (const def of ITEM_DEFS) {
      const saved = parsed[def.id];
      if (!saved) continue;
      const isLamp = def.id === 'chandelier';
      out[def.id] = {
        x: typeof saved.x === 'number' ? saved.x : def.base.x,
        // The lamp hangs from the ceiling: never load a dragged-down y that
        // would drop its shade/bulb out of the viewport.
        y: isLamp
          ? Math.min(6, Math.max(0, typeof saved.y === 'number' ? saved.y : def.base.y))
          : (typeof saved.y === 'number' ? saved.y : def.base.y),
        w: typeof saved.w === 'number' ? saved.w : def.base.w,
        h: isLamp
          ? Math.min(60, Math.max(30, typeof saved.h === 'number' ? saved.h : def.base.h))
          : (typeof saved.h === 'number' ? saved.h : def.base.h),
        rotate: typeof saved.rotate === 'number' ? saved.rotate : def.base.rotate,
        z: typeof saved.z === 'number' ? saved.z : def.baseZ
      };
    }
    return out;
  } catch {
    return { ...DEF_TRANSFORMS };
  }
}

function parseInitialSkillSlug(): string | null {
  if (typeof window === 'undefined') return null;
  const raw = window.location.hash.replace(/^#/, '');
  if (!raw || raw === 'skills') return null;
  const params = new URLSearchParams(raw);
  const slug = params.get('skill');
  if (!slug) return null;
  return PORTFOLIO_SKILLS.some((s) => s.slug === slug) ? slug : null;
}

function playSoftDeskChime(kind: 'music' | 'click') {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const notes =
      kind === 'music' ? [523.25, 659.25, 783.99, 987.77] : [440, 587.33];

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(0.0001, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.035, now + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.36);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.4);
    });

    window.setTimeout(() => {
      ctx.close().catch(() => undefined);
    }, 800);
  } catch {
    // Ignore audio context restrictions
  }
}

const ObjectTooltip: React.FC<{
  visible: boolean;
  label: string;
  sublabel?: string;
  align?: 'center' | 'left' | 'right';
  placement?: 'top' | 'bottom';
}> = ({ visible, label, sublabel, align = 'center', placement = 'top' }) => {
  const prefersReduced = useReducedMotion();
  const alignClass =
    align === 'left'
      ? 'left-0'
      : align === 'right'
        ? 'right-0'
        : 'left-1/2 -translate-x-1/2';
  const posClass =
    placement === 'bottom' ? 'top-[calc(100%+8px)]' : '-top-11';

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={
            prefersReduced
              ? { opacity: 0 }
              : { opacity: 0, y: placement === 'bottom' ? -6 : 6, scale: 0.94 }
          }
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={
            prefersReduced
              ? { opacity: 0 }
              : { opacity: 0, y: placement === 'bottom' ? -4 : 4, scale: 0.96 }
          }
          transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
          className={`pointer-events-none absolute ${posClass} ${alignClass} z-40 whitespace-nowrap rounded-[6px] bg-[#FCE055] px-2.5 py-1 text-left shadow-[0_6px_16px_rgba(15,23,42,0.16)] border border-[#0F172A]/12`}
        >
          <span className="block font-paper-mono text-[11px] font-semibold leading-tight text-[#0F172A]">
            {label}
          </span>
          {sublabel && (
            <span className="block font-paper-mono text-[9.5px] leading-tight text-[#0F172A]/75 mt-0.5">
              {sublabel}
            </span>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const SkillsArchive: React.FC<SkillsArchiveProps> = ({
  open,
  onClose
}) => {
  const prefersReduced = useReducedMotion();

  // Active skill modal (null = exploring the cozy bedroom & desk)
  const [activeSkillId, setActiveSkillId] = useState<string | null>(() =>
    parseInitialSkillSlug()
  );
  const [hoveredObj, setHoveredObj] = useState<string | null>(null);

  // Layout editing (Photoshop-style: move / scale / rotate / reorder layers)
  const [editing, setEditing] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [transforms, setTransforms] = useState<TransformMap>(() => loadLayout());
  const [layerOrder, setLayerOrder] = useState<string[]>(() =>
    [...ITEM_DEFS].sort((a, b) => a.baseZ - b.baseZ).map((d) => d.id)
  );
  const stageRef = useRef<HTMLDivElement | null>(null);
  const dragLayerIdRef = useRef<string | null>(null);

  const persistLayout = useCallback((next: TransformMap) => {
    try {
      window.localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable — layout stays in memory */
    }
  }, []);

  const updateTransform = useCallback(
    (id: string, patch: Partial<ItemTransform>) => {
      setTransforms((prev) => {
        const next = { ...prev, [id]: { ...prev[id], ...patch } };
        persistLayout(next);
        return next;
      });
    },
    [persistLayout]
  );

  const resetLayout = useCallback(() => {
    const fresh: TransformMap = Object.fromEntries(
      ITEM_DEFS.map((d) => [d.id, { ...d.base, z: d.baseZ } as ItemTransform])
    );
    setTransforms(fresh);
    setLayerOrder([...ITEM_DEFS].sort((a, b) => a.baseZ - b.baseZ).map((d) => d.id));
    setSelectedId(null);
    persistLayout(fresh);
  }, [persistLayout]);

  const reorderLayer = useCallback((dragId: string, targetId: string) => {
    if (dragId === targetId) return;
    setLayerOrder((prev) => {
      const from = prev.indexOf(dragId);
      const to = prev.indexOf(targetId);
      if (from < 0 || to < 0) return prev;
      const next = [...prev];
      next.splice(from, 1);
      next.splice(to, 0, dragId);
      // 立即同步 z 到画布，实现实时前后层级变化
      setTransforms((cur) => {
        const updated = { ...cur };
        next.forEach((id, idx) => {
          if (updated[id]) updated[id] = { ...updated[id], z: idx + 1 };
        });
        persistLayout(updated);
        return updated;
      });
      return next;
    });
  }, [persistLayout]);

  const editCtx: EditCtx = {
    editing,
    selectedId,
    setSelectedId,
    transforms,
    updateTransform,
    stageRef
  };

  // Backdrop follows the clock only — toggling the lamp no longer changes it.
  const [isNight, setIsNight] = useState<boolean>(isNightNow);
  // The lamp switch still follows the clock initially and can be clicked.
  const [lampOn, setLampOn] = useState<boolean>(isNightNow);
  const lastHourRef = useRef(new Date().getHours());
  useEffect(() => {
    const sync = () => {
      const h = new Date().getHours();
      if (h !== lastHourRef.current) {
        lastHourRef.current = h;
        const night = isNightNow();
        setIsNight(night);
        setLampOn(night);
      }
    };
    const timer = window.setInterval(sync, 30_000);
    return () => window.clearInterval(timer);
  }, []);
  const toggleLamp = () => setLampOn((v) => !v);
  const eveningMode = isNight;

  // Tactile easter-egg animation counters
  const [tapCounts, setTapCounts] = useState<Record<string, number>>({});
  const [quips, setQuips] = useState<FloatingQuip[]>([]);
  const quipIdRef = useRef(0);

  // Specimen modal controls
  const [recipeTab, setRecipeTab] = useState<'rules' | 'prompt'>('rules');
  const [copiedCode, setCopiedCode] = useState(false);
  const [loupePos, setLoupePos] = useState<{
    active: boolean;
    xPct: number;
    yPct: number;
  }>({ active: false, xPct: 50, yPct: 50 });

  const activeSkillIndex = activeSkillId
    ? PORTFOLIO_SKILLS.findIndex((s) => s.id === activeSkillId)
    : -1;
  const activeSkill: PortfolioSkill | null =
    activeSkillIndex >= 0 ? PORTFOLIO_SKILLS[activeSkillIndex] : null;

  // Body scroll lock
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  // URL hash sync
  useEffect(() => {
    if (!open || typeof window === 'undefined') return;
    const targetHash = activeSkill ? `#skill=${activeSkill.slug}` : '#skills';
    if (window.location.hash !== targetHash) {
      window.history.replaceState(null, '', targetHash);
    }
  }, [open, activeSkill]);

  const spawnQuip = useCallback(
    (text: string, xPct: number, yPct: number) => {
      quipIdRef.current += 1;
      const id = quipIdRef.current;
      const color = BRAND_COLORS[id % BRAND_COLORS.length];
      setQuips((prev) => [...prev.slice(-4), { id, text, xPct, yPct, color }]);
      window.setTimeout(() => {
        setQuips((prev) => prev.filter((q) => q.id !== id));
      }, 1500);
    },
    []
  );

  const handleCloseWorkspace = useCallback(() => {
    setActiveSkillId(null);
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

  const navigateSkill = useCallback((dir: -1 | 1) => {
    if (activeSkillIndex < 0) return;
    const nextIdx =
      (activeSkillIndex + dir + PORTFOLIO_SKILLS.length) %
      PORTFOLIO_SKILLS.length;
    setActiveSkillId(PORTFOLIO_SKILLS[nextIdx].id);
    setCopiedCode(false);
    setLoupePos({ active: false, xPct: 50, yPct: 50 });
  }, [activeSkillIndex]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (activeSkillId) {
          setActiveSkillId(null);
        } else {
          handleCloseWorkspace();
        }
      } else if (activeSkillId && e.key === 'ArrowLeft') {
        navigateSkill(-1);
      } else if (activeSkillId && e.key === 'ArrowRight') {
        navigateSkill(1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, activeSkillId, navigateSkill, handleCloseWorkspace]);

  const handleCopyRecipe = async () => {
    if (!activeSkill) return;
    const txt =
      recipeTab === 'rules'
        ? activeSkill.recipeMarkdown
        : activeSkill.promptTemplate;
    try {
      await navigator.clipboard.writeText(txt);
      setCopiedCode(true);
      window.setTimeout(() => setCopiedCode(false), 1600);
    } catch {
      // Ignore clipboard failures
    }
  };

  const handleDownloadSkillMd = () => {
    if (!activeSkill) return;
    const blob = new Blob([activeSkill.recipeMarkdown], {
      type: 'text/markdown;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeSkill.slug}-SKILL.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleOpenSkill = (skillId: string) => {
    setCopiedCode(false);
    setLoupePos({ active: false, xPct: 50, yPct: 50 });
    setActiveSkillId(skillId);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Cozy Bedroom & Skills Desk"
          initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
          transition={
            prefersReduced
              ? { duration: 0.12 }
              : { duration: 0.28, ease: [0.22, 1, 0.36, 1] }
          }
          className={`fixed inset-0 z-50 flex flex-col overflow-hidden transition-colors duration-700 ${
            eveningMode ? 'bg-[#E8D9BC]' : 'bg-[#FEFCF8]'
          } text-[#0F172A]`}
        >
          {/* Subtle paper grain overlay */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 paper-grain opacity-80"
          />

          {/* Shared Topbar */}
          <Topbar
            onBrandClick={handleCloseWorkspace}
            breadcrumb="skills"
            className="relative z-40 w-full pt-6 pb-2 sm:pt-8 sm:pb-2 pointer-events-none no-print shrink-0"
          />

          {/* Layout edit controls (Photoshop-style) */}
          <div className="pointer-events-none absolute right-5 top-5 z-40 flex items-center gap-2 sm:right-8 sm:top-8">
            {editing && (
              <button
                type="button"
                onClick={resetLayout}
                className="pointer-events-auto inline-flex items-center gap-1.5 h-9 px-3 rounded-[11px] border border-[#E5E7EB] bg-white/95 text-[#374151] font-paper-mono text-[11px] shadow-sm hover:border-[#1E63D6] hover:text-[#1E63D6] active:scale-[0.95] transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> 重置布局
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setEditing((v) => !v);
                if (editing) setSelectedId(null);
              }}
              className={`pointer-events-auto inline-flex items-center gap-1.5 h-9 px-3.5 rounded-[11px] font-paper-mono text-[11px] font-semibold shadow-sm active:scale-[0.95] transition-all cursor-pointer ${
                editing
                  ? 'bg-[#1E63D6] text-white hover:bg-[#185FA5]'
                  : 'border border-[#E5E7EB] bg-white/95 text-[#374151] hover:border-[#1E63D6] hover:text-[#1E63D6]'
              }`}
            >
              {editing ? <Check className="w-3.5 h-3.5" /> : <Pencil className="w-3.5 h-3.5" />}
              {editing ? '完成布局' : '编辑布局'}
            </button>
          </div>

          {/* Photoshop-style Layers panel */}
          <AnimatePresence>
            {editing && (
              <motion.aside
                initial={prefersReduced ? { opacity: 0 } : { opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={prefersReduced ? { opacity: 0 } : { opacity: 0, x: 16 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="absolute right-4 top-20 bottom-4 z-40 w-[190px] sm:w-[210px] flex flex-col rounded-[14px] border border-[#0F172A]/10 bg-white/95 shadow-[0_10px_30px_rgba(15,23,42,0.14)] backdrop-blur-sm overflow-hidden"
              >
                <div className="flex items-center gap-2 px-3 py-2.5 border-b border-[#E5E7EB] shrink-0">
                  <Layers className="w-4 h-4 text-[#1E63D6]" />
                  <span className="font-paper-mono text-[12px] font-semibold text-[#0F172A]">图层</span>
                  <span className="ml-auto font-paper-mono text-[9px] text-[#9a8b7a]">上=前层</span>
                </div>
                <div className="flex-1 overflow-y-auto py-1 px-1.5">
                  {[...layerOrder].reverse().map((id) => {
                    const def = ITEM_DEFS.find((d) => d.id === id);
                    if (!def) return null;
                    const isSel = selectedId === id;
                    return (
                      <div
                        key={id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', id);
                          e.dataTransfer.effectAllowed = 'move';
                          dragLayerIdRef.current = id;
                        }}
                        onDragEnd={() => { dragLayerIdRef.current = null; }}
                        onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                        onDrop={(e) => {
                          e.preventDefault();
                          const dragId = e.dataTransfer.getData('text/plain') || dragLayerIdRef.current;
                          if (dragId && dragId !== id) reorderLayer(dragId, id);
                          dragLayerIdRef.current = null;
                        }}
                        onPointerDown={(e) => { e.stopPropagation(); setSelectedId(id); }}
                        className={`group flex items-center gap-1.5 rounded-[8px] px-1.5 py-1.5 cursor-grab active:cursor-grabbing select-none ${
                          isSel ? 'bg-[#E6F1FB] ring-1 ring-[#1E63D6]' : 'hover:bg-[#F4F6F9]'
                        }`}
                      >
                        <GripVertical className="w-3.5 h-3.5 text-[#B4B2A9] shrink-0" />
                        <span
                          className="w-6 h-6 rounded-[5px] border border-[#E5E7EB] shrink-0 overflow-hidden flex items-center justify-center"
                          style={{ backgroundColor: def.thumbBg }}
                        >
                          {def.thumb ? (
                            <img src={def.thumb} alt="" className="w-full h-full object-contain" draggable={false} />
                          ) : null}
                        </span>
                        <span className={`font-paper-mono text-[10.5px] leading-tight truncate ${isSel ? 'text-[#1E63D6] font-semibold' : 'text-[#374151]'}`}>
                          {def.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="px-3 py-2 border-t border-[#E5E7EB] shrink-0">
                  <p className="font-paper-mono text-[9px] text-[#9a8b7a] leading-snug">
                    选中物件后拖四角缩放、拖顶部圆点旋转
                  </p>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* FULL-BLEED COZY STUDIO ROOM PLACEHOLDER LAYOUT (100% BELOW TOPBAR) */}
          <main
            style={{
              containerType: 'size',
              paddingTop: '2cqh',
              paddingBottom: '2cqh'
            }}
            className="relative z-10 flex-1 w-full flex flex-col items-center justify-start overflow-hidden"
          >
            {/* Full-width room stage: fills the workspace; editorial title lives top-left */}
            <div
              style={{
                containerType: 'inline-size',
                width: '100cqw',
                height: '100cqh'
              }}
              className="relative select-none shrink-0"
            >
              <div ref={stageRef} className="relative w-full h-full">
                {/* 1. Seamless Solid Backdrop — matches topbar color */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 transition-colors duration-700"
                  style={{
                    backgroundColor: eveningMode ? '#E8D9BC' : '#FEFCF8'
                  }}
                />

                {/* 1b. p5.js volumetric lamp light (dust + soft cone + pool).
                    Sits below the object layer and never intercepts pointer input. */}
                <LightCanvas on={lampOn} reducedMotion={Boolean(prefersReduced)} />

                {/* Editorial title block — top-left, matching the reference. */}
                <div
                  className="pointer-events-none absolute z-[12]"
                  style={{ left: '3cqw', top: '4.5cqh', width: '38cqw' }}
                >
                  <h2
                    className="font-display font-light text-[#2C2A27] leading-[1.16] tracking-tight whitespace-nowrap"
                    style={{ fontSize: '2.4cqw' }}
                  >
                    Chance Brings Them
                    <br />
                    Together Here And
                    <br />
                    <span className="italic text-[#5E7A4E]">Imagination</span> Endows Them
                    <br />
                    With Souls
                  </h2>
                </div>

                {/* ============================================================
                    2. PLACEHOLDER LAYOUT LAYER (MATCHING REFERENCE COMPOSITION)
                   ============================================================ */}

                <ItemContext.Provider value={editCtx}>
                {/* --- UPPER-LEFT GALLERY WALL CLUSTER --- */}

                {/* P1. Small Square Still-Life Frame (Far Top-Left) */}
                <EditableItem id="frame1" base={DEF_TRANSFORMS.frame1}>
                <motion.button
                  type="button"
                  onClick={() => {
                    const count = (tapCounts.frame1 ?? 0) + 1;
                    setTapCounts((p) => ({ ...p, frame1: count }));
                    spawnQuip('still life · sketch', 6, 4);
                  }}
                  onMouseEnter={() => setHoveredObj('frame1')}
                  onMouseLeave={() => setHoveredObj(null)}
                  whileHover={prefersReduced ? undefined : { y: -2, scale: 1.03 }}
                  whileTap={prefersReduced ? undefined : { scale: 0.96 }}
                  aria-label="小挂画 1"
                  style={{ left: '2.8%', top: '4.5%', width: '6.2%', height: '10.2%' }}
                  className={`absolute ${hoveredObj === 'frame1' ? 'z-40' : 'z-15'} cursor-pointer flex items-center justify-center focus-visible:outline-2 focus-visible:outline-[#1E63D6]`}
                >
                  <ObjectTooltip visible={hoveredObj === 'frame1'} label="静物小挂画" sublabel="点击互动" align="left" placement="bottom" />
                  <img
                    src="/assets/room/photo.png"
                    alt="小挂画：花朵静物"
                    draggable={false}
                    className="w-full h-full object-contain pointer-events-none select-none drop-shadow-[0_0.6cqw_0.5cqw_rgba(60,45,30,0.18)]"
                  />
                </motion.button>
                </EditableItem>

                {/* S1. CORE SKILL 01 — Gallery Portrait Frame (Top-Left Hero) */}
                <EditableItem id="wool-felt" base={DEF_TRANSFORMS['wool-felt']}>
                <motion.button
                  type="button"
                  onClick={() => handleOpenSkill('wool-felt')}
                  onMouseEnter={() => setHoveredObj('wool-felt')}
                  onMouseLeave={() => setHoveredObj(null)}
                  whileHover={prefersReduced ? undefined : { y: -4, scale: 1.04 }}
                  whileTap={prefersReduced ? undefined : { scale: 0.96 }}
                  transition={SPRING_SNAPPY}
                  aria-label="探索 01 Wool Felt 毛毡风 Skill"
                  style={{ left: '10.8%', top: '5.5%', width: '8.2%', height: '13.5%' }}
                  className={`absolute ${hoveredObj === 'wool-felt' ? 'z-40' : 'z-20'} cursor-pointer flex items-center justify-center focus-visible:outline-2 focus-visible:outline-[#1E63D6]`}
                >
                  <ObjectTooltip
                    visible={hoveredObj === 'wool-felt'}
                    label="01 · Wool Felt 毛毡风"
                    sublabel="点击查看成品与配方"
                    placement="bottom"
                  />
                  <img
                    src="/assets/room/frame-flowers-1.jpg"
                    alt="水彩花卉相框 1"
                    draggable={false}
                    className="w-full h-full object-contain pointer-events-none select-none drop-shadow-[0_0.6cqw_0.5cqw_rgba(60,45,30,0.16)]"
                  />
                </motion.button>
                </EditableItem>

                {/* S2. CORE SKILL 02 — Gallery Frame 02 (Lower-Right of Cluster) */}
                <EditableItem id="pastel-doll" base={DEF_TRANSFORMS['pastel-doll']}>
                <motion.button
                  type="button"
                  onClick={() => handleOpenSkill('pastel-doll')}
                  onMouseEnter={() => setHoveredObj('pastel-doll')}
                  onMouseLeave={() => setHoveredObj(null)}
                  whileHover={prefersReduced ? undefined : { y: -4, scale: 1.04 }}
                  whileTap={prefersReduced ? undefined : { scale: 0.96 }}
                  transition={SPRING_SNAPPY}
                  aria-label="探索 02 Pastel Doll 粉彩娃娃风 Skill"
                  style={{ left: '12.5%', top: '21.8%', width: '8.5%', height: '13%' }}
                  className={`absolute ${hoveredObj === 'pastel-doll' ? 'z-40' : 'z-20'} cursor-pointer flex items-center justify-center focus-visible:outline-2 focus-visible:outline-[#1E63D6]`}
                >
                  <ObjectTooltip
                    visible={hoveredObj === 'pastel-doll'}
                    label="02 · Pastel Doll 粉彩娃娃"
                    sublabel="点击查看成品与配方"
                  />
                  <img
                    src="/assets/room/frame-flowers-2.jpg"
                    alt="水彩花卉相框 2"
                    draggable={false}
                    className="w-full h-full object-contain pointer-events-none select-none drop-shadow-[0_0.6cqw_0.5cqw_rgba(60,45,30,0.16)]"
                  />
                </motion.button>
                </EditableItem>

                {/* P3. Botanical Sketch Frame (Upper-Right of Cluster) */}
                <EditableItem id="frame3" base={DEF_TRANSFORMS['frame3']}>
                <motion.button
                  type="button"
                  onClick={() => {
                    const count = (tapCounts.frame3 ?? 0) + 1;
                    setTapCounts((p) => ({ ...p, frame3: count }));
                    spawnQuip('botanical study ✿', 24, 7);
                  }}
                  onMouseEnter={() => setHoveredObj('frame3')}
                  onMouseLeave={() => setHoveredObj(null)}
                  whileHover={prefersReduced ? undefined : { y: -2, scale: 1.03 }}
                  whileTap={prefersReduced ? undefined : { scale: 0.96 }}
                  aria-label="小挂画 2"
                  style={{ left: '21.5%', top: '7.5%', width: '7.4%', height: '11.2%' }}
                  className={`absolute ${hoveredObj === 'frame3' ? 'z-40' : 'z-15'} cursor-pointer flex items-center justify-center focus-visible:outline-2 focus-visible:outline-[#1E63D6]`}
                >
                  <ObjectTooltip visible={hoveredObj === 'frame3'} label="装饰壁画" sublabel="点击互动" placement="bottom" />
                  <img
                    src="/assets/room/mural.png"
                    alt="装饰壁画：花卉图案"
                    draggable={false}
                    className="w-full h-full object-contain pointer-events-none select-none drop-shadow-[0_0.6cqw_0.5cqw_rgba(30,60,80,0.16)]"
                  />
                </motion.button>
                </EditableItem>

                {/* --- HANGING CHANDELIER (TOP CENTER) --- */}
                <EditableItem
                  id="chandelier"
                  base={DEF_TRANSFORMS['chandelier']}
                  bounds={{ yMin: 0, yMax: 6, hMin: 30, hMax: 60 }}
                >
                <motion.button
                  type="button"
                  onClick={() => {
                    toggleLamp();
                    setTapCounts((p) => ({
                      ...p,
                      chandelier: (p.chandelier ?? 0) + 1
                    }));
                    spawnQuip(lampOn ? 'lights out 🌙' : 'let there be light ✨', 50, 6);
                  }}
                  onMouseEnter={() => setHoveredObj('chandelier')}
                  onMouseLeave={() => setHoveredObj(null)}
                  whileHover={prefersReduced ? undefined : { rotate: 3 }}
                  whileTap={prefersReduced ? undefined : { scale: 0.98 }}
                  aria-label={lampOn ? '关灯' : '开灯'}
                  data-lamp
                  style={{ left: '44%', top: '0%', width: '13%', height: '50%' }}
                  className={`absolute origin-top ${hoveredObj === 'chandelier' ? 'z-40' : 'z-25'} cursor-pointer flex items-start justify-center focus-visible:outline-2 focus-visible:outline-[#1E63D6]`}
                >
                  <ObjectTooltip visible={hoveredObj === 'chandelier'} label="极简吊灯" sublabel={lampOn ? '点击关灯' : '点击开灯'} align="center" />
                  <svg viewBox="0 0 100 100" className="w-full h-full block overflow-visible" aria-hidden="true">
                    <defs>
                      {/* Lit bulb: warm-white core fading softly to amber, no hard edge */}
                      <radialGradient id="bulb-on-grad" cx="50%" cy="42%" r="72%">
                        <stop offset="0%" stopColor="var(--surface-card)" />
                        <stop offset="40%" stopColor="var(--highlight-yellow)" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="var(--highlight-yellow)" stopOpacity="0.5" />
                      </radialGradient>
                      {/* Unlit bulb: soft off-white glass */}
                      <radialGradient id="bulb-off-grad" cx="50%" cy="38%" r="72%">
                        <stop offset="0%" stopColor="#FFFFFF" />
                        <stop offset="100%" stopColor="#E8E2D6" />
                      </radialGradient>
                      {/* Feathered spill so the glow bleeds past the bulb rim */}
                      <filter id="bulb-soft" x="-160%" y="-160%" width="420%" height="420%">
                        <feGaussianBlur stdDeviation="2.4" />
                      </filter>
                    </defs>
                    <g fill="var(--ink-primary)">
                      {/* Ceiling mount cap */}
                      <path d="M 44 6 L 56 6 C 57 6 58 8 58 9 L 58 10 L 42 10 L 42 9 C 42 8 43 6 44 6 Z" />
                      <rect x="47.5" y="10" width="5" height="2" rx="0.6" />
                      {/* Thin suspension rod */}
                      <rect x="49.3" y="12" width="1.4" height="60" />
                      {/* Socket connector above shade */}
                      <rect x="47.5" y="71" width="5" height="3" rx="0.5" />
                      <rect x="49.2" y="74" width="1.6" height="2" />
                      {/* Wide curved bell shade */}
                      <path d="M 49 76 C 47.5 78, 42 80, 34 83 C 27 85.5, 24 87, 23 90 C 23 91, 30 91.5, 50 91.5 C 70 91.5, 77 91, 77 90 C 76 87, 73 85.5, 66 83 C 58 80, 52.5 78, 51 76 Z" />
                    </g>
                    {/* Soft feathered glow bleeding from the lit bulb (no hard shape) */}
                    {lampOn && (
                      <ellipse
                        cx="50"
                        cy="95"
                        rx="9.5"
                        ry="6.5"
                        fill="var(--highlight-yellow)"
                        opacity="0.32"
                        filter="url(#bulb-soft)"
                        pointerEvents="none"
                      />
                    )}
                    {/* Bulb body: soft gradient when lit, off-white glass when off.
                        No hard highlight dot — removed for a cleaner glow. */}
                    <path
                      d="M 43.5 91.5 A 6.5 6.5 0 0 0 56.5 91.5 Z"
                      fill={lampOn ? 'url(#bulb-on-grad)' : 'url(#bulb-off-grad)'}
                      stroke={lampOn ? 'none' : 'var(--hairline)'}
                      strokeWidth="0.7"
                      pointerEvents="none"
                    />
                  </svg>
                </motion.button>
                </EditableItem>

                {/* --- LOWER-LEFT ARMCHAIR + PLUSHIE + DRAPED THROW --- */}

                {/* P4. Cozy Armchair */}
                <EditableItem id="armchair" base={DEF_TRANSFORMS['armchair']}>
                <motion.button
                  type="button"
                  onClick={() => {
                    const count = (tapCounts.armchair ?? 0) + 1;
                    setTapCounts((p) => ({ ...p, armchair: count }));
                    spawnQuip('comfy reading spot ~', 14, 38);
                  }}
                  onMouseEnter={() => setHoveredObj('armchair')}
                  onMouseLeave={() => setHoveredObj(null)}
                  whileHover={prefersReduced ? undefined : { y: -3 }}
                  whileTap={prefersReduced ? undefined : { scale: 0.98 }}
                  aria-label="单人扶手沙发"
                  style={{ left: '2.6%', top: '39.5%', width: '21.5%', height: '38%' }}
                  className={`absolute ${hoveredObj === 'armchair' ? 'z-40' : 'z-15'} cursor-pointer rounded-[1.8cqw] flex items-center justify-center focus-visible:outline-2 focus-visible:outline-[#1E63D6]`}
                >
                  <ObjectTooltip visible={hoveredObj === 'armchair'} label="单人扶手沙发" sublabel="点击互动" align="left" />
                  <img
                    src="/assets/room/armchair.png"
                    alt="单人扶手沙发"
                    draggable={false}
                    className="w-full h-full object-contain pointer-events-none select-none drop-shadow-[0_1.2cqw_1cqw_rgba(60,45,30,0.18)]"
                  />
                </motion.button>
                </EditableItem>





                {/* --- LOWER-CENTER OVAL COFFEE TABLE + 5 TABLETOP ITEMS --- */}

                {/* P10. Pale Blue Oval Coffee Table */}
                <EditableItem id="table" base={DEF_TRANSFORMS['table']}>
                <div
                  style={{ left: '28.5%', top: '67%', width: '32%', height: '24.5%' }}
                  className="pointer-events-none absolute z-22 flex items-center justify-center"
                >
                  <img
                    src="/assets/room/table.png"
                    alt="椭圆木桌"
                    draggable={false}
                    className="w-full h-full object-contain pointer-events-none select-none drop-shadow-[0_1cqw_0.9cqw_rgba(60,45,30,0.2)]"
                  />
                </div>
                </EditableItem>

                {/* Tabletop Item 1: Polka-Dot Teacup */}
                <EditableItem id="cup1" base={DEF_TRANSFORMS['cup1']}>
                <motion.button
                  type="button"
                  onClick={() => {
                    const count = (tapCounts.cup1 ?? 0) + 1;
                    setTapCounts((p) => ({ ...p, cup1: count }));
                    spawnQuip('chamomile tea ☕', 32.5, 57);
                  }}
                  onMouseEnter={() => setHoveredObj('cup1')}
                  onMouseLeave={() => setHoveredObj(null)}
                  whileHover={prefersReduced ? undefined : { y: -3 }}
                  whileTap={prefersReduced ? undefined : { scale: 0.94 }}
                  aria-label="茶杯"
                  style={{ left: '30.2%', top: '61.5%', width: '4.6%', height: '7.5%' }}
                  className={`absolute ${hoveredObj === 'cup1' ? 'z-40' : 'z-26'} cursor-pointer flex items-center justify-center focus-visible:outline-2 focus-visible:outline-[#1E63D6]`}
                >
                  <ObjectTooltip visible={hoveredObj === 'cup1'} label="碎花茶杯" sublabel="点击互动" />
                  <img
                    src="/assets/room/teacup.png"
                    alt="碎花茶杯"
                    draggable={false}
                    className="w-full h-full object-contain pointer-events-none select-none drop-shadow-[0_0.4cqw_0.4cqw_rgba(60,45,30,0.16)]"
                  />
                </motion.button>
                </EditableItem>

                {/* Tabletop Item: Floral Teapot */}
                <EditableItem id="teapot" base={DEF_TRANSFORMS['teapot']}>
                <motion.button
                  type="button"
                  onClick={() => {
                    const count = (tapCounts.teapot ?? 0) + 1;
                    setTapCounts((p) => ({ ...p, teapot: count }));
                    spawnQuip('a warm pot of tea ☕', 40, 57);
                  }}
                  onMouseEnter={() => setHoveredObj('teapot')}
                  onMouseLeave={() => setHoveredObj(null)}
                  whileHover={prefersReduced ? undefined : { y: -3 }}
                  whileTap={prefersReduced ? undefined : { scale: 0.94 }}
                  aria-label="碎花茶壶"
                  style={{ left: '36%', top: '60%', width: '8.5%', height: '8%' }}
                  className={`absolute ${hoveredObj === 'teapot' ? 'z-40' : 'z-26'} cursor-pointer flex items-center justify-center focus-visible:outline-2 focus-visible:outline-[#1E63D6]`}
                >
                  <ObjectTooltip visible={hoveredObj === 'teapot'} label="碎花茶壶" sublabel="点击互动" />
                  <img
                    src="/assets/room/teapot.png"
                    alt="碎花茶壶"
                    draggable={false}
                    className="w-full h-full object-contain pointer-events-none select-none drop-shadow-[0_0.5cqw_0.4cqw_rgba(60,45,30,0.16)]"
                  />
                </motion.button>
                </EditableItem>

                {/* --- UPPER-RIGHT FLOATING BOOKSHELF (SKILL 03 WORKFLOW) --- */}

                {/* S3. CORE SKILL 03 — p5.js-drawn bookshelf */}
                <EditableItem id="design-restraint" base={DEF_TRANSFORMS['design-restraint']}>
                <motion.button
                  type="button"
                  onClick={() => handleOpenSkill('design-restraint')}
                  onMouseEnter={() => setHoveredObj('design-restraint')}
                  onMouseLeave={() => setHoveredObj(null)}
                  whileHover={prefersReduced ? undefined : { y: -4 }}
                  whileTap={prefersReduced ? undefined : { scale: 0.98 }}
                  transition={SPRING_SNAPPY}
                  aria-label="探索 03 Design Restraint 工作流 Skill"
                  style={{ left: '66%', top: '54%', width: '31%', height: '34%' }}
                  className={`absolute ${hoveredObj === 'design-restraint' ? 'z-40' : 'z-18'} cursor-pointer flex flex-col justify-center focus-visible:outline-2 focus-visible:outline-[#1E63D6]`}
                >
                  <ObjectTooltip
                    visible={hoveredObj === 'design-restraint'}
                    label="03 · Design Restraint Audit"
                    sublabel="点击查看工作流规范"
                    align="right"
                  />
                  {/* p5-drawn books + wooden ledge. Label + info card removed;
                      height locked to the previous canvas share so the shelf
                      does not grow when its siblings are gone. */}
                  <div style={{ height: '80%' }} className="relative w-full self-center">
                    <BookShelfCanvas reducedMotion={Boolean(prefersReduced)} />
                  </div>
                </motion.button>
                </EditableItem>

                </ItemContext.Provider>

                {/* Floating Script Easter-Egg Bubbles */}
                <div className="pointer-events-none absolute inset-0 z-35 overflow-hidden">
                  <AnimatePresence>
                    {quips.map((q) => (
                      <motion.span
                        key={q.id}
                        initial={
                          prefersReduced
                            ? { opacity: 0 }
                            : { opacity: 0, y: 8, scale: 0.9 }
                        }
                        animate={{ opacity: 1, y: -22, scale: 1 }}
                        exit={{ opacity: 0, y: -36 }}
                        transition={{ duration: 1.25, ease: [0.22, 1, 0.36, 1] }}
                        style={{
                          left: `${q.xPct}%`,
                          top: `${q.yPct}%`,
                          color: q.color
                        }}
                        className="absolute -translate-x-1/2 font-script text-[22px] sm:text-[26px] font-bold whitespace-nowrap drop-shadow-[0_2px_4px_rgba(255,255,255,0.95)]"
                      >
                        {q.text}
                      </motion.span>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>

          </main>

          {/* ================================================================
              SKILL SPECIMEN INSPECTOR MODAL (Opens when clicking a Skill object)
             ================================================================ */}
          <AnimatePresence>
            {activeSkill && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => {
                  if (e.target === e.currentTarget) setActiveSkillId(null);
                }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 backdrop-blur-md bg-[#FEFCF8]/80 overflow-y-auto"
              >
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
                      : { opacity: 0, y: 8, scale: 0.97 }
                  }
                  transition={SPRING_SNAPPY}
                  className="relative w-full max-w-[880px] rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] shadow-[0_20px_54px_rgba(15,23,42,0.12)] overflow-hidden my-auto"
                >
                  {/* Modal Header */}
                  <div className="flex items-center justify-between gap-4 px-5 sm:px-7 py-4 border-b border-[#E5E7EB]">
                    <div className="flex items-center gap-2 font-paper-mono text-[12px] text-[#786858]">
                      <span className="font-semibold text-[#1E63D6]">
                        {activeSkill.indexLabel}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{activeSkill.kindLabel}</span>
                      <span aria-hidden="true" className="hidden sm:inline">
                        ·
                      </span>
                      <span className="hidden sm:inline">
                        {activeSkill.deskObjectLabel}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => navigateSkill(-1)}
                        aria-label="上一个 Skill"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#374151] hover:bg-[#EDF4FF] hover:text-[#1E63D6] transition-colors cursor-pointer"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => navigateSkill(1)}
                        aria-label="下一个 Skill"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#374151] hover:bg-[#EDF4FF] hover:text-[#1E63D6] transition-colors cursor-pointer"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveSkillId(null)}
                        aria-label="放回桌面"
                        className="ml-1 flex h-8 w-8 items-center justify-center rounded-lg text-[#374151] hover:bg-[#F6F5F0] transition-colors cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Modal Body: 2 Columns */}
                  <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)] gap-6 p-5 sm:p-7 items-start">
                    {/* Left: Authentic Showcase Output + Interactive 2.2x Macro Loupe */}
                    <div className="space-y-3">
                      {activeSkill.kind === 'visual' &&
                      activeSkill.previewImage ? (
                        <div
                          onMouseMove={(e) => {
                            const rect =
                              e.currentTarget.getBoundingClientRect();
                            if (!rect.width || !rect.height) return;
                            setLoupePos({
                              active: true,
                              xPct:
                                ((e.clientX - rect.left) / rect.width) * 100,
                              yPct:
                                ((e.clientY - rect.top) / rect.height) * 100
                            });
                          }}
                          onMouseLeave={() =>
                            setLoupePos((p) => ({ ...p, active: false }))
                          }
                          className="relative aspect-square w-full rounded-xl bg-[#F6F5F0] border border-[#E5E7EB] overflow-hidden cursor-zoom-in"
                        >
                          <img
                            src={activeSkill.previewImage}
                            alt={activeSkill.previewAlt || activeSkill.title}
                            referrerPolicy="no-referrer"
                            draggable={false}
                            className="w-full h-full object-cover"
                          />

                          {/* 2.2x Macro Fiber & Texture Loupe on Hover */}
                          {loupePos.active && !prefersReduced && (
                            <div
                              aria-hidden="true"
                              className="pointer-events-none absolute w-28 h-28 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#FCE055] shadow-[0_10px_24px_rgba(15,23,42,0.28)]"
                              style={{
                                left: `${loupePos.xPct}%`,
                                top: `${loupePos.yPct}%`,
                                backgroundImage: `url(${activeSkill.previewImage})`,
                                backgroundSize: '220% 220%',
                                backgroundPosition: `${loupePos.xPct}% ${loupePos.yPct}%`
                              }}
                            />
                          )}

                          <span className="pointer-events-none absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-md bg-[#FEFCF8]/92 px-2 py-1 font-paper-mono text-[10.5px] text-[#0F172A] border border-[#E5E7EB]">
                            <ZoomIn className="w-3 h-3 text-[#1E63D6]" />
                            <span>2.2x detail</span>
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="rounded-xl bg-[#F6F5F0] border border-[#E5E7EB] p-4 space-y-1.5">
                            <span className="block font-paper-mono text-[11px] font-semibold text-[#786858]">
                              {activeSkill.workflowDiff?.inputLabel}
                            </span>
                            <p className="font-paper-mono text-[12px] leading-relaxed text-[#374151]">
                              {activeSkill.workflowDiff?.inputText}
                            </p>
                          </div>

                          <div className="rounded-xl bg-[#FEFCF8] border border-[#1E63D6]/30 p-4 space-y-2">
                            <span className="block font-paper-mono text-[11px] font-semibold text-[#1E63D6]">
                              {activeSkill.workflowDiff?.outputLabel}
                            </span>
                            <div className="space-y-1.5 font-paper-mono text-[12px] leading-relaxed text-[#0F172A]">
                              {activeSkill.workflowDiff?.outputLines.map(
                                (line, i) => (
                                  <p key={i}>
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
                          </div>
                        </div>
                      )}

                      <p className="font-paper-mono text-[11.5px] text-[#786858] leading-snug">
                        {activeSkill.mediumNote}
                      </p>
                    </div>

                    {/* Right: Editorial Details & Copyable Recipe */}
                    <div className="space-y-5">
                      <div>
                        <h2 className="font-display text-[26px] sm:text-[30px] font-bold tracking-[-0.03em] leading-[1.12] text-[#0F172A]">
                          {activeSkill.title}
                        </h2>
                        <p className="font-display text-[14.5px] leading-[1.7] text-[#374151] mt-2">
                          {activeSkill.subtitle}
                        </p>
                      </div>

                      {/* Craft Principles (Clean hairline list, zero thick left accent borders) */}
                      <div className="space-y-2.5 pt-1 border-t border-[#E5E7EB]">
                        {activeSkill.constraints.map((c, idx) => (
                          <div
                            key={idx}
                            className="flex items-baseline gap-2.5 text-[13px] leading-relaxed"
                          >
                            <span className="font-paper-mono text-[11px] font-semibold text-[#1E63D6] tabular-nums shrink-0">
                              0{idx + 1}
                            </span>
                            <p className="font-display text-[#374151]">
                              <strong className="font-semibold text-[#0F172A]">
                                {c.label}：
                              </strong>
                              {c.detail}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Copyable SKILL.md / Prompt Recipe */}
                      <div className="rounded-xl bg-[#F6F5F0] border border-[#E5E7EB] p-3.5 space-y-2.5">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="inline-flex items-center gap-1 p-0.5 rounded-md bg-[#FEFCF8] border border-[#E5E7EB]">
                            <button
                              type="button"
                              onClick={() => setRecipeTab('rules')}
                              className={`px-2.5 py-1 rounded-[4px] font-paper-mono text-[11px] transition-colors cursor-pointer ${
                                recipeTab === 'rules'
                                  ? 'bg-[#EDF4FF] text-[#1E63D6] font-semibold'
                                  : 'text-[#786858] hover:text-[#0F172A]'
                              }`}
                            >
                              SKILL.md
                            </button>
                            <button
                              type="button"
                              onClick={() => setRecipeTab('prompt')}
                              className={`px-2.5 py-1 rounded-[4px] font-paper-mono text-[11px] transition-colors cursor-pointer ${
                                recipeTab === 'prompt'
                                  ? 'bg-[#EDF4FF] text-[#1E63D6] font-semibold'
                                  : 'text-[#786858] hover:text-[#0F172A]'
                              }`}
                            >
                              Prompt
                            </button>
                          </div>

                          <div className="flex items-center gap-3 font-paper-mono text-[11px] text-[#786858]">
                            <button
                              type="button"
                              onClick={handleDownloadSkillMd}
                              className="inline-flex items-center gap-1 hover:text-[#1E63D6] transition-colors cursor-pointer"
                            >
                              <Download className="w-3 h-3" />
                              <span>.md</span>
                            </button>
                            <button
                              type="button"
                              onClick={handleCopyRecipe}
                              className="inline-flex items-center gap-1 hover:text-[#1E63D6] transition-colors cursor-pointer"
                            >
                              {copiedCode ? (
                                <>
                                  <Check className="w-3 h-3 text-[#1E63D6]" />
                                  <span className="text-[#1E63D6]">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        <pre className="font-paper-mono code-features text-[11.5px] leading-[1.6] max-h-[192px] pb-1 overflow-auto text-[#0F172A]/90 whitespace-pre-wrap">
                          <code>
                            {recipeTab === 'rules'
                              ? activeSkill.recipeMarkdown
                              : activeSkill.promptTemplate}
                          </code>
                        </pre>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
