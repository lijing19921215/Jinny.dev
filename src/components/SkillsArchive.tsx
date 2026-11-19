import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  Download,
  ZoomIn,
  X
} from 'lucide-react';
import { PORTFOLIO_SKILLS, PortfolioSkill } from '../data/skills';
import { Topbar } from './Topbar';

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

  // Room atmosphere toggles
  const [lampOn, setLampOn] = useState(true);
  const [eveningMode, setEveningMode] = useState(false);

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
            eveningMode ? 'bg-[#FAF4E8]' : 'bg-[#FEFCF8]'
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

          {/* FULL-BLEED COZY STUDIO ROOM PLACEHOLDER LAYOUT (100% BELOW TOPBAR) */}
          <main
            style={{ containerType: 'size' }}
            className="relative z-10 flex-1 w-full flex items-center justify-center overflow-hidden"
          >
            {/* Proportional 960x580 Room Stage with Seamless Wall & Wood Floor Extension */}
            <div
              style={{
                containerType: 'inline-size',
                width: 'min(100cqw, 1260px, calc(100cqh * 960 / 580))',
                aspectRatio: '960 / 580'
              }}
              className="relative select-none"
            >
              <div className="relative w-full h-full">
                {/* 1. Seamless Full-Bleed Wall & Warm Hardwood Floor Backdrop */}
                <svg
                  viewBox="0 0 960 580"
                  className="w-full h-full block overflow-visible"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient id="wallBgGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor={eveningMode ? '#F9EFDC' : '#FEFCF8'}
                      />
                      <stop
                        offset="100%"
                        stopColor={eveningMode ? '#F3E5CA' : '#F8F4EB'}
                      />
                    </linearGradient>
                    <radialGradient id="floorLampGlow" cx="50%" cy="22%" r="68%">
                      <stop offset="0%" stopColor="#FCE055" stopOpacity="0.45" />
                      <stop offset="55%" stopColor="#FCE055" stopOpacity="0.14" />
                      <stop offset="100%" stopColor="#FCE055" stopOpacity="0" />
                    </radialGradient>
                  </defs>

                  {/* Wall Plane (Top ~73%) */}
                  <rect
                    x="-1200"
                    y="-1200"
                    width="3360"
                    height="1624"
                    fill="url(#wallBgGrad)"
                  />
                  {/* Horizon Baseboard Line */}
                  <line
                    x1="-1200"
                    y1="424"
                    x2="2160"
                    y2="424"
                    stroke="#D6C7B4"
                    strokeWidth="2"
                  />
                  {/* Warm Hardwood Floor Plane (Bottom ~27%) */}
                  <rect
                    x="-1200"
                    y="424"
                    width="3360"
                    height="1600"
                    fill={eveningMode ? '#DFCBB2' : '#EADBC8'}
                  />
                  {/* Subtle Wood Plank Lines */}
                  <line x1="-1200" y1="458" x2="2160" y2="458" stroke="#D9C6AF" strokeWidth="1" />
                  <line x1="-1200" y1="496" x2="2160" y2="496" stroke="#D9C6AF" strokeWidth="1" />
                  <line x1="-1200" y1="538" x2="2160" y2="538" stroke="#D9C6AF" strokeWidth="1" />

                  {/* Floor Lamp Warm Light Pool */}
                  {lampOn && (
                    <ellipse
                      cx="285"
                      cy="290"
                      rx="165"
                      ry="175"
                      fill="url(#floorLampGlow)"
                    />
                  )}
                </svg>

                {/* ============================================================
                    2. PLACEHOLDER LAYOUT LAYER (MATCHING REFERENCE COMPOSITION)
                   ============================================================ */}

                {/* --- UPPER-LEFT GALLERY WALL CLUSTER --- */}

                {/* P1. Small Square Still-Life Frame (Far Top-Left) */}
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
                  aria-label="小挂画占位 1"
                  style={{ left: '2.8%', top: '4.5%', width: '6.2%', height: '10.2%' }}
                  className={`absolute ${hoveredObj === 'frame1' ? 'z-40' : 'z-15'} cursor-pointer rounded-[0.6cqw] border-[0.16cqw] border-dashed border-[#6E5644]/55 bg-[#FFFFFF]/80 flex items-center justify-center p-[0.4cqw] focus-visible:outline-2 focus-visible:outline-[#1E63D6]`}
                >
                  <ObjectTooltip visible={hoveredObj === 'frame1'} label="静物小挂画" sublabel="画框占位块" align="left" placement="bottom" />
                  <span className="font-paper-mono text-[0.95cqw] leading-tight text-[#786858] text-center">
                    小挂画 1
                  </span>
                </motion.button>

                {/* S1. CORE SKILL 01 — Gallery Portrait Frame (Top-Left Hero) */}
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
                  className={`absolute ${hoveredObj === 'wool-felt' ? 'z-40' : 'z-20'} cursor-pointer rounded-[0.7cqw] border-[0.2cqw] border-[#1E63D6] bg-[#EDF4FF] shadow-[0_6px_14px_rgba(30,99,214,0.12)] flex flex-col items-center justify-center gap-[0.3cqw] p-[0.5cqw] focus-visible:outline-2 focus-visible:outline-[#1E63D6]`}
                >
                  <ObjectTooltip
                    visible={hoveredObj === 'wool-felt'}
                    label="01 · Wool Felt 毛毡风"
                    sublabel="点击查看成品与配方"
                    placement="bottom"
                  />
                  <span className="font-paper-mono text-[0.95cqw] font-semibold text-[#1E63D6] leading-none">
                    SKILL 01
                  </span>
                  <span className="font-paper-mono text-[1.05cqw] font-medium text-[#0F172A] leading-tight text-center">
                    毛毡挂画
                  </span>
                </motion.button>

                {/* P2. Round Floral Wall Clock */}
                <motion.button
                  type="button"
                  onClick={() => {
                    const count = (tapCounts.clock ?? 0) + 1;
                    setTapCounts((p) => ({ ...p, clock: count }));
                    playSoftDeskChime('click');
                    spawnQuip('tick tock ♪', 7, 17);
                  }}
                  onMouseEnter={() => setHoveredObj('clock')}
                  onMouseLeave={() => setHoveredObj(null)}
                  whileHover={prefersReduced ? undefined : { rotate: 6, scale: 1.04 }}
                  whileTap={prefersReduced ? undefined : { scale: 0.95 }}
                  aria-label="圆形挂钟占位"
                  style={{ left: '3.2%', top: '19.5%', width: '7.2%', height: '12%' }}
                  className={`absolute ${hoveredObj === 'clock' ? 'z-40' : 'z-15'} cursor-pointer rounded-full border-[0.16cqw] border-dashed border-[#6E5644]/60 bg-[#FFFFFF]/85 flex items-center justify-center p-[0.4cqw] focus-visible:outline-2 focus-visible:outline-[#1E63D6]`}
                >
                  <ObjectTooltip visible={hoveredObj === 'clock'} label="圆形墙挂钟" sublabel="钟表占位块" align="left" />
                  <span className="font-paper-mono text-[0.95cqw] text-[#786858] text-center leading-tight">
                    挂钟
                  </span>
                </motion.button>

                {/* S2. CORE SKILL 02 — Gallery Frame 02 (Lower-Right of Cluster) */}
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
                  className={`absolute ${hoveredObj === 'pastel-doll' ? 'z-40' : 'z-20'} cursor-pointer rounded-[0.7cqw] border-[0.2cqw] border-[#1E63D6] bg-[#FEF9DB] shadow-[0_6px_14px_rgba(30,99,214,0.12)] flex flex-col items-center justify-center gap-[0.3cqw] p-[0.5cqw] focus-visible:outline-2 focus-visible:outline-[#1E63D6]`}
                >
                  <ObjectTooltip
                    visible={hoveredObj === 'pastel-doll'}
                    label="02 · Pastel Doll 粉彩娃娃"
                    sublabel="点击查看成品与配方"
                  />
                  <span className="font-paper-mono text-[0.95cqw] font-semibold text-[#1E63D6] leading-none">
                    SKILL 02
                  </span>
                  <span className="font-paper-mono text-[1.05cqw] font-medium text-[#0F172A] leading-tight text-center">
                    粉彩挂画
                  </span>
                </motion.button>

                {/* P3. Botanical Sketch Frame (Upper-Right of Cluster) */}
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
                  aria-label="植物挂画占位"
                  style={{ left: '21.5%', top: '7.5%', width: '7.4%', height: '11.2%' }}
                  className={`absolute ${hoveredObj === 'frame3' ? 'z-40' : 'z-15'} cursor-pointer rounded-[0.6cqw] border-[0.16cqw] border-dashed border-[#6E5644]/55 bg-[#FFFFFF]/80 flex items-center justify-center p-[0.4cqw] focus-visible:outline-2 focus-visible:outline-[#1E63D6]`}
                >
                  <ObjectTooltip visible={hoveredObj === 'frame3'} label="植物小挂画" sublabel="画框占位块" placement="bottom" />
                  <span className="font-paper-mono text-[0.95cqw] leading-tight text-[#786858] text-center">
                    小挂画 2
                  </span>
                </motion.button>

                {/* --- LOWER-LEFT ARMCHAIR + PLUSHIE + DRAPED THROW --- */}

                {/* P4. Cozy Armchair */}
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
                  aria-label="单人沙发占位"
                  style={{ left: '2.6%', top: '39.5%', width: '21.5%', height: '38%' }}
                  className={`absolute ${hoveredObj === 'armchair' ? 'z-40' : 'z-15'} cursor-pointer rounded-[1.8cqw] border-[0.18cqw] border-dashed border-[#6E5644]/60 bg-[#E6ECF2]/80 flex flex-col items-center justify-end pb-[2.2cqw] focus-visible:outline-2 focus-visible:outline-[#1E63D6]`}
                >
                  <ObjectTooltip visible={hoveredObj === 'armchair'} label="单人扶手沙发" sublabel="家具占位块" align="left" />
                  <span className="font-paper-mono text-[1.15cqw] text-[#6E5644] font-medium">
                    单人沙发
                  </span>
                  {/* Placeholder seat legs */}
                  <span className="absolute -bottom-[1.2cqw] left-[18%] w-[1cqw] h-[1.4cqw] rounded-b bg-[#C4B299] border border-[#6E5644]/50" />
                  <span className="absolute -bottom-[1.2cqw] right-[18%] w-[1cqw] h-[1.4cqw] rounded-b bg-[#C4B299] border border-[#6E5644]/50" />
                </motion.button>

                {/* P5. Plush Bunny sitting on Armchair */}
                <motion.button
                  type="button"
                  onClick={() => {
                    const count = (tapCounts.plushie ?? 0) + 1;
                    setTapCounts((p) => ({ ...p, plushie: count }));
                    spawnQuip('soft bunny 🐇', 11, 50);
                  }}
                  onMouseEnter={() => setHoveredObj('plushie')}
                  onMouseLeave={() => setHoveredObj(null)}
                  whileHover={prefersReduced ? undefined : { y: -3, rotate: -4 }}
                  whileTap={prefersReduced ? undefined : { scale: 0.94 }}
                  aria-label="玩偶占位"
                  style={{ left: '7.2%', top: '53%', width: '7.5%', height: '12%' }}
                  className={`absolute ${hoveredObj === 'plushie' ? 'z-40' : 'z-20'} cursor-pointer rounded-[1cqw] border-[0.16cqw] border-dashed border-[#6E5644]/65 bg-[#F4E7D4]/90 flex items-center justify-center p-[0.3cqw] focus-visible:outline-2 focus-visible:outline-[#1E63D6]`}
                >
                  <ObjectTooltip visible={hoveredObj === 'plushie'} label="小兔玩偶" sublabel="点击互动" align="left" />
                  <span className="font-paper-mono text-[0.95cqw] text-[#6E5644] text-center">
                    小玩偶
                  </span>
                </motion.button>

                {/* P6. Draped Throw on Armchair Right Arm */}
                <div
                  aria-hidden="true"
                  style={{ left: '17.8%', top: '44%', width: '6.8%', height: '16%' }}
                  className="pointer-events-none absolute z-18 rounded-[0.9cqw] border-[0.14cqw] border-dashed border-[#EF4E5E]/55 bg-[#FAD4D8]/65 flex items-center justify-center"
                >
                  <span className="font-paper-mono text-[0.85cqw] text-[#9D3A46] text-center leading-tight">
                    搭毯
                  </span>
                </div>

                {/* --- CENTER-LEFT FLOOR LAMP --- */}

                {/* P7. Tall Pleated Floor Lamp (Toggles Room Warm Glow) */}
                <motion.button
                  type="button"
                  onClick={() => {
                    setLampOn((v) => !v);
                    playSoftDeskChime('click');
                    spawnQuip(lampOn ? 'lamp off' : 'warm light ✦', 28.5, 16);
                  }}
                  onMouseEnter={() => setHoveredObj('lamp')}
                  onMouseLeave={() => setHoveredObj(null)}
                  whileHover={prefersReduced ? undefined : { y: -2 }}
                  whileTap={prefersReduced ? undefined : { scale: 0.97 }}
                  aria-label="落地灯开关"
                  style={{ left: '24.6%', top: '18.5%', width: '8.2%', height: '54%' }}
                  className={`absolute ${hoveredObj === 'lamp' ? 'z-40' : 'z-18'} cursor-pointer flex flex-col items-center justify-between focus-visible:outline-2 focus-visible:outline-[#1E63D6] rounded-xl`}
                >
                  <ObjectTooltip
                    visible={hoveredObj === 'lamp'}
                    label={lampOn ? '关掉落地灯' : '打开暖光落地灯'}
                    sublabel="点击切换灯光"
                  />
                  {/* Lampshade placeholder */}
                  <div
                    className={`w-full h-[27%] rounded-t-[2.4cqw] rounded-b-[0.7cqw] border-[0.16cqw] border-dashed flex items-center justify-center transition-colors ${
                      lampOn
                        ? 'border-[#EF4E5E]/75 bg-[#FCE055]/65'
                        : 'border-[#6E5644]/55 bg-[#EFECE6]/85'
                    }`}
                  >
                    <span className="font-paper-mono text-[0.95cqw] text-[#6E5644]">
                      落地灯罩
                    </span>
                  </div>
                  {/* Lamp stem */}
                  <div className="w-[0.55cqw] flex-1 bg-[#D6BA73]/80 border-x border-[#6E5644]/40" />
                  {/* Lamp base */}
                  <div className="w-[58%] h-[5.5%] rounded-full border-[0.15cqw] border-dashed border-[#6E5644]/60 bg-[#E6D5A7]" />
                </motion.button>

                {/* --- CENTER WALL: HANGING PLANT + DOUBLE FRENCH WINDOW --- */}

                {/* P8. Hanging Trailing Plant */}
                <motion.button
                  type="button"
                  onClick={() => {
                    const count = (tapCounts.hanging ?? 0) + 1;
                    setTapCounts((p) => ({ ...p, hanging: count }));
                    spawnQuip('leafy breeze 🌿', 35, 3);
                  }}
                  onMouseEnter={() => setHoveredObj('hanging')}
                  onMouseLeave={() => setHoveredObj(null)}
                  whileHover={prefersReduced ? undefined : { rotate: 3 }}
                  whileTap={prefersReduced ? undefined : { scale: 0.96 }}
                  aria-label="垂吊绿植占位"
                  style={{ left: '31.5%', top: '3.5%', width: '7.5%', height: '27%' }}
                  className={`absolute ${hoveredObj === 'hanging' ? 'z-40' : 'z-22'} cursor-pointer rounded-[1cqw] border-[0.16cqw] border-dashed border-[#4B7A54]/60 bg-[#E4F0E5]/85 flex flex-col items-center justify-center p-[0.4cqw] focus-visible:outline-2 focus-visible:outline-[#1E63D6]`}
                >
                  <ObjectTooltip visible={hoveredObj === 'hanging'} label="垂吊绿植" sublabel="植物占位块" placement="bottom" />
                  <span className="font-paper-mono text-[0.95cqw] text-[#3F6647] text-center leading-tight">
                    垂吊绿植
                  </span>
                </motion.button>

                {/* P9. Large Double French Window (Toggles Morning <-> Golden Hour) */}
                <motion.button
                  type="button"
                  onClick={() => {
                    setEveningMode((v) => !v);
                    spawnQuip(eveningMode ? 'morning sun ☀' : 'golden hour ✨', 50, 9);
                  }}
                  onMouseEnter={() => setHoveredObj('window')}
                  onMouseLeave={() => setHoveredObj(null)}
                  whileHover={prefersReduced ? undefined : { scale: 1.01 }}
                  aria-label="双扇大窗景开关"
                  style={{ left: '39.5%', top: '12.5%', width: '21.8%', height: '43.5%' }}
                  className={`absolute ${hoveredObj === 'window' ? 'z-40' : 'z-12'} cursor-pointer rounded-[0.8cqw] border-[0.18cqw] border-dashed border-[#6E5644]/65 bg-[#FFFFFF]/85 p-[0.9cqw] flex flex-col gap-[0.6cqw] focus-visible:outline-2 focus-visible:outline-[#1E63D6]`}
                >
                  <ObjectTooltip
                    visible={hoveredObj === 'window'}
                    label={eveningMode ? '切换晨光窗景' : '切换黄昏柔光'}
                    sublabel="点击改变房间光线"
                  />
                  {/* Upper transom panes */}
                  <div className="w-full h-[22%] grid grid-cols-2 gap-[0.6cqw]">
                    <div
                      className={`rounded-[0.3cqw] border border-[#6E5644]/35 transition-colors duration-500 ${
                        eveningMode ? 'bg-[#FDE4BA]' : 'bg-[#DCEBFF]'
                      }`}
                    />
                    <div
                      className={`rounded-[0.3cqw] border border-[#6E5644]/35 transition-colors duration-500 ${
                        eveningMode ? 'bg-[#FDE4BA]' : 'bg-[#DCEBFF]'
                      }`}
                    />
                  </div>
                  {/* Main double window casements */}
                  <div className="w-full flex-1 grid grid-cols-2 gap-[0.6cqw]">
                    <div
                      className={`rounded-[0.3cqw] border border-[#6E5644]/35 flex items-center justify-center transition-colors duration-500 ${
                        eveningMode ? 'bg-[#F8C697]/65' : 'bg-[#E5F0FF]'
                      }`}
                    >
                      <span className="font-paper-mono text-[1cqw] text-[#786858]">
                        左窗景
                      </span>
                    </div>
                    <div
                      className={`rounded-[0.3cqw] border border-[#6E5644]/35 flex items-center justify-center transition-colors duration-500 ${
                        eveningMode ? 'bg-[#F8C697]/65' : 'bg-[#E5F0FF]'
                      }`}
                    >
                      <span className="font-paper-mono text-[1cqw] text-[#786858]">
                        右窗景
                      </span>
                    </div>
                  </div>
                </motion.button>

                {/* --- LOWER-CENTER OVAL COFFEE TABLE + 5 TABLETOP ITEMS --- */}

                {/* P10. Pale Blue Oval Coffee Table */}
                <div
                  style={{ left: '28.5%', top: '67%', width: '32%', height: '24.5%' }}
                  className="pointer-events-none absolute z-22 flex flex-col items-center"
                >
                  {/* Oval tabletop */}
                  <div className="w-full h-[54%] rounded-[999px] border-[0.18cqw] border-dashed border-[#1E63D6]/50 bg-[#E3EEFB]/90 shadow-[0_8px_18px_rgba(15,23,42,0.06)] flex items-end justify-center pb-[0.8cqw]">
                    <span className="font-paper-mono text-[1cqw] text-[#5B7596]">
                      浅蓝椭圆茶几
                    </span>
                  </div>
                  {/* 4 slim white legs */}
                  <div className="w-[82%] flex-1 flex justify-between px-[6%]">
                    <span className="w-[0.65cqw] h-full rounded-b bg-[#FFFFFF] border border-[#6E5644]/40" />
                    <span className="w-[0.65cqw] h-[82%] rounded-b bg-[#FFFFFF] border border-[#6E5644]/40" />
                    <span className="w-[0.65cqw] h-[82%] rounded-b bg-[#FFFFFF] border border-[#6E5644]/40" />
                    <span className="w-[0.65cqw] h-full rounded-b bg-[#FFFFFF] border border-[#6E5644]/40" />
                  </div>
                </div>

                {/* Tabletop Item 1: Polka-Dot Teacup */}
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
                  aria-label="茶几左茶杯占位"
                  style={{ left: '30.2%', top: '61.5%', width: '4.6%', height: '7.5%' }}
                  className={`absolute ${hoveredObj === 'cup1' ? 'z-40' : 'z-26'} cursor-pointer rounded-[0.6cqw] border-[0.15cqw] border-dashed border-[#6E5644]/60 bg-[#FFFFFF]/90 flex items-center justify-center focus-visible:outline-2 focus-visible:outline-[#1E63D6]`}
                >
                  <ObjectTooltip visible={hoveredObj === 'cup1'} label="波点茶杯" sublabel="桌面占位" />
                  <span className="font-paper-mono text-[0.8cqw] text-[#786858]">茶杯</span>
                </motion.button>

                {/* Tabletop Item 2: Strawberry Basket */}
                <motion.button
                  type="button"
                  onClick={() => {
                    const count = (tapCounts.berry ?? 0) + 1;
                    setTapCounts((p) => ({ ...p, berry: count }));
                    spawnQuip('fresh strawberries 🍓', 38.5, 56);
                  }}
                  onMouseEnter={() => setHoveredObj('berry')}
                  onMouseLeave={() => setHoveredObj(null)}
                  whileHover={prefersReduced ? undefined : { y: -3, scale: 1.05 }}
                  whileTap={prefersReduced ? undefined : { scale: 0.94 }}
                  aria-label="草莓篮占位"
                  style={{ left: '35.8%', top: '59.8%', width: '5.5%', height: '8.8%' }}
                  className={`absolute ${hoveredObj === 'berry' ? 'z-40' : 'z-26'} cursor-pointer rounded-[0.6cqw] border-[0.15cqw] border-dashed border-[#EF4E5E]/65 bg-[#FAD4D8]/80 flex items-center justify-center focus-visible:outline-2 focus-visible:outline-[#1E63D6]`}
                >
                  <ObjectTooltip visible={hoveredObj === 'berry'} label="一篮草莓" sublabel="桌面占位" />
                  <span className="font-paper-mono text-[0.8cqw] text-[#9D3A46]">草莓篮</span>
                </motion.button>

                {/* Tabletop Item 3: Cookies Plate */}
                <motion.button
                  type="button"
                  onClick={() => {
                    const count = (tapCounts.cookies ?? 0) + 1;
                    setTapCounts((p) => ({ ...p, cookies: count }));
                    spawnQuip('warm cookies 🍪', 45, 59);
                  }}
                  onMouseEnter={() => setHoveredObj('cookies')}
                  onMouseLeave={() => setHoveredObj(null)}
                  whileHover={prefersReduced ? undefined : { y: -3, scale: 1.05 }}
                  whileTap={prefersReduced ? undefined : { scale: 0.94 }}
                  aria-label="曲奇盘占位"
                  style={{ left: '42.2%', top: '62.2%', width: '5.8%', height: '6.6%' }}
                  className={`absolute ${hoveredObj === 'cookies' ? 'z-40' : 'z-26'} cursor-pointer rounded-full border-[0.15cqw] border-dashed border-[#6E5644]/60 bg-[#FAF2E3]/90 flex items-center justify-center focus-visible:outline-2 focus-visible:outline-[#1E63D6]`}
                >
                  <ObjectTooltip visible={hoveredObj === 'cookies'} label="一盘曲奇" sublabel="桌面占位" />
                  <span className="font-paper-mono text-[0.8cqw] text-[#786858]">曲奇盘</span>
                </motion.button>

                {/* Tabletop Item 4: Tall Glass Flower Vase (Overlaps window bottom) */}
                <motion.button
                  type="button"
                  onClick={() => {
                    const count = (tapCounts.vase ?? 0) + 1;
                    setTapCounts((p) => ({ ...p, vase: count }));
                    spawnQuip('fresh bouquet 💐', 52.5, 45);
                  }}
                  onMouseEnter={() => setHoveredObj('vase')}
                  onMouseLeave={() => setHoveredObj(null)}
                  whileHover={prefersReduced ? undefined : { y: -4, scale: 1.03 }}
                  whileTap={prefersReduced ? undefined : { scale: 0.96 }}
                  aria-label="花瓶花束占位"
                  style={{ left: '48.8%', top: '48.5%', width: '7.4%', height: '20.5%' }}
                  className={`absolute ${hoveredObj === 'vase' ? 'z-40' : 'z-27'} cursor-pointer flex flex-col items-center justify-between focus-visible:outline-2 focus-visible:outline-[#1E63D6]`}
                >
                  <ObjectTooltip visible={hoveredObj === 'vase'} label="鲜花花瓶" sublabel="向上遮挡窗台" />
                  <div className="w-full h-[54%] rounded-full border-[0.16cqw] border-dashed border-[#EF4E5E]/65 bg-[#FFE8EC]/88 flex items-center justify-center">
                    <span className="font-paper-mono text-[0.85cqw] text-[#9D3A46]">花束</span>
                  </div>
                  <div className="w-[54%] h-[44%] rounded-[0.5cqw] border-[0.15cqw] border-dashed border-[#1E63D6]/55 bg-[#EDF4FF]/88 flex items-center justify-center">
                    <span className="font-paper-mono text-[0.8cqw] text-[#1E63D6]">花瓶</span>
                  </div>
                </motion.button>

                {/* Tabletop Item 5: Right Floral Mug */}
                <motion.button
                  type="button"
                  onClick={() => {
                    const count = (tapCounts.mug ?? 0) + 1;
                    setTapCounts((p) => ({ ...p, mug: count }));
                    spawnQuip('oat latte · 64°C ☕', 58, 57);
                  }}
                  onMouseEnter={() => setHoveredObj('mug')}
                  onMouseLeave={() => setHoveredObj(null)}
                  whileHover={prefersReduced ? undefined : { y: -3 }}
                  whileTap={prefersReduced ? undefined : { scale: 0.94 }}
                  aria-label="茶几右咖啡杯占位"
                  style={{ left: '56.6%', top: '60.8%', width: '4.4%', height: '7.8%' }}
                  className={`absolute ${hoveredObj === 'mug' ? 'z-40' : 'z-26'} cursor-pointer rounded-[0.6cqw] border-[0.15cqw] border-dashed border-[#6E5644]/60 bg-[#FFFFFF]/90 flex items-center justify-center focus-visible:outline-2 focus-visible:outline-[#1E63D6]`}
                >
                  <ObjectTooltip visible={hoveredObj === 'mug'} label="小花马克杯" sublabel="桌面占位" />
                  <span className="font-paper-mono text-[0.8cqw] text-[#786858]">热饮</span>
                </motion.button>

                {/* --- UPPER-RIGHT FLOATING BOOKSHELF (SKILL 03 WORKFLOW) --- */}

                {/* S3. CORE SKILL 03 — Floating Bookshelf */}
                <motion.button
                  type="button"
                  onClick={() => handleOpenSkill('design-restraint')}
                  onMouseEnter={() => setHoveredObj('design-restraint')}
                  onMouseLeave={() => setHoveredObj(null)}
                  whileHover={prefersReduced ? undefined : { y: -4, scale: 1.02 }}
                  whileTap={prefersReduced ? undefined : { scale: 0.97 }}
                  transition={SPRING_SNAPPY}
                  aria-label="探索 03 Design Restraint 工作流 Skill"
                  style={{ left: '64.2%', top: '13.5%', width: '27.8%', height: '21.5%' }}
                  className={`absolute ${hoveredObj === 'design-restraint' ? 'z-40' : 'z-18'} cursor-pointer flex flex-col justify-end p-[0.6cqw] rounded-[0.8cqw] border-[0.2cqw] border-[#1E63D6] bg-[#EDF4FF]/85 shadow-[0_6px_16px_rgba(30,99,214,0.10)] focus-visible:outline-2 focus-visible:outline-[#1E63D6]`}
                >
                  <ObjectTooltip
                    visible={hoveredObj === 'design-restraint'}
                    label="03 · UI Restraint 工作流"
                    sublabel="点击查看规范转换"
                    align="right"
                  />
                  {/* Placeholder book & vase blocks sitting on shelf */}
                  <div className="w-full flex-1 flex items-end justify-between gap-[0.6cqw] px-[0.4cqw] pb-[0.4cqw]">
                    <div className="w-[18%] h-[78%] rounded-[0.3cqw] bg-[#FCE055]/65 border border-[#6E5644]/40" />
                    <div className="w-[10%] h-[58%] rounded-[0.3cqw] bg-[#FFFFFF]/90 border border-[#6E5644]/40" />
                    <div className="w-[24%] h-[88%] rounded-[0.3cqw] bg-[#D9E7FF] border border-[#1E63D6]/45 flex items-center justify-center">
                      <span className="font-paper-mono text-[0.95cqw] font-semibold text-[#1E63D6]">
                        SKILL 03
                      </span>
                    </div>
                    <div className="w-[16%] h-[72%] rounded-[0.3cqw] bg-[#FAD4D8]/75 border border-[#EF4E5E]/40" />
                    <div className="w-[14%] h-[64%] rounded-[0.4cqw] bg-[#F5F2EA] border border-[#6E5644]/40" />
                  </div>
                  {/* Shelf plank */}
                  <div className="w-full h-[1cqw] rounded-full bg-[#B99878] border border-[#6E5644]/50 flex items-center justify-center" />
                  <span className="font-paper-mono text-[0.9cqw] text-[#0F172A] mt-[0.35cqw] text-center">
                    长条书架 · UI 工作流规范
                  </span>
                </motion.button>

                {/* --- LOWER-RIGHT 2-SEATER SOFA + PATCHWORK QUILT --- */}

                {/* P11. Sage 2-Seater Sofa */}
                <motion.button
                  type="button"
                  onClick={() => {
                    const count = (tapCounts.sofa ?? 0) + 1;
                    setTapCounts((p) => ({ ...p, sofa: count }));
                    spawnQuip('afternoon nap sofa ~', 75, 41);
                  }}
                  onMouseEnter={() => setHoveredObj('sofa')}
                  onMouseLeave={() => setHoveredObj(null)}
                  whileHover={prefersReduced ? undefined : { y: -3 }}
                  whileTap={prefersReduced ? undefined : { scale: 0.98 }}
                  aria-label="双人沙发占位"
                  style={{ left: '61.5%', top: '43.5%', width: '27.2%', height: '39%' }}
                  className={`absolute ${hoveredObj === 'sofa' ? 'z-40' : 'z-16'} cursor-pointer rounded-[1.8cqw] border-[0.18cqw] border-dashed border-[#5E7466]/65 bg-[#DCE5DC]/85 flex flex-col items-center justify-end pb-[2.5cqw] focus-visible:outline-2 focus-visible:outline-[#1E63D6]`}
                >
                  <ObjectTooltip visible={hoveredObj === 'sofa'} label="双人沙发" sublabel="家具占位块" />
                  <span className="font-paper-mono text-[1.15cqw] text-[#4B5F52] font-medium">
                    双人沙发
                  </span>
                  <span className="absolute -bottom-[1.2cqw] left-[12%] w-[1cqw] h-[1.5cqw] rounded-b bg-[#C4B299] border border-[#6E5644]/50" />
                  <span className="absolute -bottom-[1.2cqw] right-[12%] w-[1cqw] h-[1.5cqw] rounded-b bg-[#C4B299] border border-[#6E5644]/50" />
                </motion.button>

                {/* P12. Patchwork Quilt Draped on Sofa Left */}
                <motion.button
                  type="button"
                  onClick={() => {
                    const count = (tapCounts.quilt ?? 0) + 1;
                    setTapCounts((p) => ({ ...p, quilt: count }));
                    spawnQuip('handmade patchwork ✦', 64, 49);
                  }}
                  onMouseEnter={() => setHoveredObj('quilt')}
                  onMouseLeave={() => setHoveredObj(null)}
                  whileHover={prefersReduced ? undefined : { rotate: -2, scale: 1.04 }}
                  whileTap={prefersReduced ? undefined : { scale: 0.95 }}
                  aria-label="拼布盖毯占位"
                  style={{ left: '59.2%', top: '51%', width: '9.6%', height: '19.5%' }}
                  className={`absolute ${hoveredObj === 'quilt' ? 'z-40' : 'z-24'} cursor-pointer rounded-[1.1cqw] border-[0.16cqw] border-dashed border-[#EF4E5E]/60 bg-[#FCE055]/55 flex items-center justify-center p-[0.4cqw] focus-visible:outline-2 focus-visible:outline-[#1E63D6]`}
                >
                  <ObjectTooltip visible={hoveredObj === 'quilt'} label="拼布盖毯" sublabel="装饰占位块" />
                  <span className="font-paper-mono text-[0.95cqw] text-[#6E5644] text-center leading-tight">
                    拼布盖毯
                  </span>
                </motion.button>

                {/* --- FAR-RIGHT WOVEN BASKET FLOOR PLANT --- */}

                {/* P13. Tall Woven-Basket Alocasia Plant */}
                <motion.button
                  type="button"
                  onClick={() => {
                    const count = (tapCounts.floorPlant ?? 0) + 1;
                    setTapCounts((p) => ({ ...p, floorPlant: count }));
                    spawnQuip('photosynthesis +1 🌿', 90, 34);
                  }}
                  onMouseEnter={() => setHoveredObj('floorPlant')}
                  onMouseLeave={() => setHoveredObj(null)}
                  whileHover={prefersReduced ? undefined : { rotate: 2, y: -3 }}
                  whileTap={prefersReduced ? undefined : { scale: 0.96 }}
                  aria-label="落地大绿植占位"
                  style={{ left: '84.8%', top: '36.5%', width: '12.6%', height: '51%' }}
                  className={`absolute ${hoveredObj === 'floorPlant' ? 'z-40' : 'z-24'} cursor-pointer flex flex-col items-center justify-between focus-visible:outline-2 focus-visible:outline-[#1E63D6]`}
                >
                  <ObjectTooltip
                    visible={hoveredObj === 'floorPlant'}
                    label="大叶盆栽"
                    sublabel="落地绿植占位块"
                    align="right"
                  />
                  {/* Foliage crown placeholder */}
                  <div className="w-full h-[64%] rounded-[2cqw] border-[0.16cqw] border-dashed border-[#4B7A54]/60 bg-[#DDECE0]/85 flex items-center justify-center p-[0.4cqw]">
                    <span className="font-paper-mono text-[1cqw] text-[#3F6647] text-center">
                      大叶绿植
                    </span>
                  </div>
                  {/* Woven basket pot placeholder */}
                  <div className="w-[66%] h-[32%] rounded-[1cqw] border-[0.16cqw] border-dashed border-[#8C6D4F]/65 bg-[#E6D1B3]/90 flex items-center justify-center p-[0.3cqw]">
                    <span className="font-paper-mono text-[0.9cqw] text-[#6E5644]">
                      编织花盆
                    </span>
                  </div>
                </motion.button>

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
