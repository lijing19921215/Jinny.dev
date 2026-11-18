import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  MotionValue,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity
} from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  Copy,
  Link2,
  Pause,
  Play,
  RotateCcw,
  X
} from 'lucide-react';
import {
  CREATIVE_STORIES,
  CreativeArtifact,
  CreativeStory
} from '../data/creativeCodingStories';
import { CreativeArtifactCanvas } from './CreativeCodingCanvases';
import { Topbar } from './Topbar';

interface CreativeCodingArchiveProps {
  open: boolean;
  onClose: () => void;
}

const SPRING_SNAPPY = { type: 'spring' as const, stiffness: 320, damping: 22 };
const SPRING_GENTLE = { type: 'spring' as const, stiffness: 260, damping: 24 };

function parseCreativeHash(): {
  storyIndex: number;
  artifactNum: number | null;
} {
  if (typeof window === 'undefined') {
    return { storyIndex: 0, artifactNum: null };
  }
  const raw = window.location.hash.replace(/^#/, '');
  const params = new URLSearchParams(raw);
  const slug = params.get('story');
  const artStr = params.get('artifact');
  const storyIndex = slug
    ? Math.max(
        0,
        CREATIVE_STORIES.findIndex((s) => s.slug === slug)
      )
    : 0;
  const parsedArt = artStr ? parseInt(artStr, 10) : NaN;
  return {
    storyIndex,
    artifactNum: Number.isFinite(parsedArt) ? parsedArt : null
  };
}

const ArtifactMedia: React.FC<{
  artifact: CreativeArtifact;
  paused: boolean;
  staticPreview?: boolean;
  className?: string;
}> = ({ artifact, paused, staticPreview = false, className = '' }) => {
  const [imgError, setImgError] = useState(false);

  if (artifact.kind === 'image') {
    if (!artifact.imageSrc || imgError) {
      return (
        <div
          className={`w-full h-full flex flex-col items-center justify-center p-3 text-center bg-[#ECEAE3] text-[#374151] ${className}`}
        >
          <span className="font-paper-mono text-[10px] opacity-70">
            [{artifact.indexNum}]
          </span>
          <span className="font-display text-[12px] font-medium mt-1">
            {artifact.title}
          </span>
        </div>
      );
    }
    return (
      <img
        src={artifact.imageSrc}
        alt={artifact.imageAlt || artifact.title}
        referrerPolicy="no-referrer"
        draggable={false}
        onError={() => setImgError(true)}
        className={`w-full h-full object-cover select-none ${className}`}
      />
    );
  }

  return (
    <CreativeArtifactCanvas
      kind={artifact.kind}
      paused={paused}
      darkMode={false}
      staticPreview={staticPreview}
      className={className}
    />
  );
};

interface StoryClusterCardProps {
  story: CreativeStory;
  active: boolean;
  onSelect: () => void;
}

const StoryClusterCard: React.FC<StoryClusterCardProps> = ({
  story,
  active,
  onSelect
}) => {
  const [hovered, setHovered] = useState(false);
  const prefersReduced = useReducedMotion();

  return (
    <button
      type="button"
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      className="group flex flex-col items-center text-center focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-[#1E63D6] rounded-lg cursor-pointer"
    >
      <div className="relative w-full max-w-[270px] aspect-[10/7]">
        {story.artifacts.map((art, idx) => {
          const cx = art.layout.xPct + art.layout.wPct * 0.5 - 50;
          const cy = art.layout.yPct + 12 - 50;
          const spreadX = hovered && !prefersReduced ? cx * 0.16 : 0;
          const spreadY = hovered && !prefersReduced ? cy * 0.16 - 3 : 0;
          const tilt =
            hovered && !prefersReduced ? (idx % 2 === 0 ? -1.4 : 1.4) : 0;

          return (
            <motion.div
              key={art.id}
              style={{
                left: `${art.layout.xPct}%`,
                top: `${art.layout.yPct}%`,
                width: `${art.layout.wPct}%`,
                aspectRatio: art.layout.aspect,
                zIndex: art.layout.z
              }}
              animate={{
                x: spreadX,
                y: spreadY,
                rotate: tilt,
                scale: hovered && !prefersReduced ? 1.02 : 1
              }}
              transition={
                prefersReduced ? { duration: 0 } : SPRING_SNAPPY
              }
              className={`absolute p-[3px] rounded-[2px] backdrop-blur-[1px] bg-[#F6F5F0]/88 ring-1 transition-shadow duration-200 ${
                active
                  ? 'ring-[#1E63D6]/65 bg-[#EDF4FF]/85'
                  : 'ring-[#0F172A]/[0.06]'
              } ${
                hovered
                  ? 'shadow-[0_8px_22px_rgba(30,99,214,0.12)] ring-[#1E63D6]/45'
                  : 'shadow-[0_3px_10px_rgba(15,23,42,0.05)]'
              }`}
            >
              <div className="w-full h-full overflow-hidden rounded-[1px]">
                <ArtifactMedia
                  artifact={art}
                  paused={true}
                  staticPreview={true}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-3.5 inline-flex items-center gap-1.5">
        <span
          className={`font-display text-[17px] sm:text-[18px] font-semibold tracking-[-0.015em] leading-snug transition-colors duration-200 ${
            hovered || active ? 'text-[#1E63D6]' : 'text-[#0F172A]'
          }`}
        >
          {story.title}
        </span>
        <ArrowUpRight
          className={`w-4 h-4 transition-all duration-200 ${
            hovered
              ? 'opacity-100 translate-x-0 text-[#1E63D6]'
              : 'opacity-0 -translate-x-1'
          }`}
          aria-hidden="true"
        />
      </div>
    </button>
  );
};

interface LiveCollageThumbnailProps {
  story: CreativeStory;
  stackOrder: string[];
  dragOffsetsPct: Record<string, { dxPct: number; dyPct: number }>;
  activeArtifactId?: string;
  onSelectArtifact?: (id: string) => void;
  className?: string;
}

function parseAspectRatio(aspect: string | number): number {
  if (typeof aspect === 'number') return aspect > 0 ? aspect : 1;
  const parts = aspect.split('/').map((n) => parseFloat(n.trim()));
  if (parts.length === 2 && parts[0] > 0 && parts[1] > 0) {
    return parts[0] / parts[1];
  }
  const parsed = parseFloat(aspect);
  return parsed > 0 ? parsed : 1;
}

const LiveCollageThumbnail: React.FC<LiveCollageThumbnailProps> = ({
  story,
  stackOrder,
  dragOffsetsPct,
  activeArtifactId,
  onSelectArtifact,
  className = 'w-[104px] h-[73px]'
}) => {
  // Compute normalized coordinates so even widely dragged cards remain visible
  // while preserving 1:1 proportions when kept within the default stage frame.
  let minX = 0;
  let maxX = 100;
  let minY = 0;
  let maxY = 100;

  const rects = story.artifacts.map((art) => {
    const delta = dragOffsetsPct[art.id];
    const left = art.layout.xPct + (delta?.dxPct ?? 0);
    const top = art.layout.yPct + (delta?.dyPct ?? 0);
    const width = art.layout.wPct;
    const height =
      (art.layout.wPct * (10 / 7)) / parseAspectRatio(art.layout.aspect);

    if (left < minX) minX = left;
    if (left + width > maxX) maxX = left + width;
    if (top < minY) minY = top;
    if (top + height > maxY) maxY = top + height;

    return { art, left, top, width };
  });

  const spanX = Math.max(100, maxX - minX);
  const spanY = Math.max(100, maxY - minY);
  const scale = Math.min(100 / spanX, 100 / spanY);
  const offsetX = (100 - spanX * scale) / 2 - minX * scale;
  const offsetY = (100 - spanY * scale) / 2 - minY * scale;

  return (
    <div className={`relative shrink-0 select-none ${className}`}>
      {rects.map(({ art, left, top, width }, idx) => {
        const isActive = art.id === activeArtifactId;
        const rank = stackOrder.indexOf(art.id);
        const zIndex = 10 + (rank >= 0 ? rank : idx);

        const baseStyle: React.CSSProperties = {
          left: `${left * scale + offsetX}%`,
          top: `${top * scale + offsetY}%`,
          width: `${width * scale}%`,
          aspectRatio: art.layout.aspect,
          zIndex
        };

        const innerContent = (
          <>
            <div
              className={`w-full h-full overflow-hidden rounded-[1px] transition-all duration-150 ${
                isActive
                  ? 'ring-[1.5px] ring-[#1E63D6] shadow-[0_2px_8px_rgba(30,99,214,0.22)]'
                  : 'shadow-[0_1px_4px_rgba(15,23,42,0.12)]'
              }`}
            >
              <ArtifactMedia
                artifact={art}
                paused={true}
                staticPreview={true}
              />
            </div>
            {isActive && (
              <span
                aria-hidden="true"
                className="absolute -right-[3px] bottom-[18%] z-20 h-[6px] w-[6px] rounded-full bg-[#FCE055] ring-[1.5px] ring-[#1E63D6]"
              />
            )}
          </>
        );

        if (onSelectArtifact) {
          return (
            <button
              key={art.id}
              type="button"
              onClick={() => onSelectArtifact(art.id)}
              aria-label={`View artifact ${art.indexNum}: ${art.title}`}
              style={baseStyle}
              className={`absolute rounded-[1px] transition-all duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#1E63D6] ${
                isActive
                  ? 'opacity-100 brightness-100'
                  : 'opacity-45 brightness-90 hover:opacity-100 hover:brightness-105 hover:scale-[1.06] hover:!z-40 focus-visible:opacity-100'
              }`}
            >
              {innerContent}
            </button>
          );
        }

        return (
          <div
            key={art.id}
            style={baseStyle}
            className={`absolute rounded-[1px] transition-opacity duration-200 ${
              activeArtifactId
                ? isActive
                  ? 'opacity-100'
                  : 'opacity-45'
                : 'opacity-90'
            }`}
          >
            {innerContent}
          </div>
        );
      })}
    </div>
  );
};

interface DraggableCollageCardProps {
  artifact: CreativeArtifact;
  zIndex: number;
  depthRatio: number;
  paused: boolean;
  resetNonce: number;
  dragConstraintsRef: React.RefObject<HTMLDivElement | null>;
  parallaxX: MotionValue<number>;
  parallaxY: MotionValue<number>;
  isAnyHovered: boolean;
  isHovered: boolean;
  onBringToFront: (id: string) => void;
  onDragMoved: () => void;
  onDragCommit: (id: string, xPx: number, yPx: number) => void;
  onHoverChange: (id: string | null, clientX?: number, clientY?: number) => void;
  onSelect: (artifact: CreativeArtifact) => void;
}

const DraggableCollageCard: React.FC<DraggableCollageCardProps> = ({
  artifact,
  zIndex,
  depthRatio,
  paused,
  resetNonce,
  dragConstraintsRef,
  parallaxX,
  parallaxY,
  isAnyHovered,
  isHovered,
  onBringToFront,
  onDragMoved,
  onDragCommit,
  onHoverChange,
  onSelect
}) => {
  const prefersReduced = useReducedMotion();
  const dragDistanceRef = useRef(0);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);
  const dragVx = useVelocity(dragX);
  const rawVelTilt = useTransform(dragVx, [-1400, 0, 1400], [-3.2, 0, 3.2]);
  const dragTilt = useSpring(rawVelTilt, { stiffness: 260, damping: 24 });

  useEffect(() => {
    dragX.set(0);
    dragY.set(0);
  }, [resetNonce, dragX, dragY]);

  const depthFactor = (0.4 + depthRatio * 1.4) * 4.5;
  const px = useTransform(parallaxX, (v: number) =>
    prefersReduced ? 0 : v * depthFactor
  );
  const py = useTransform(parallaxY, (v: number) =>
    prefersReduced ? 0 : v * depthFactor
  );

  // Z-depth luminance & vellum translucency:
  // Lower stacked cards gently darken/recede while all overlapping layers
  // retain subtle film translucency so underlying geometry bleeds through.
  const targetOpacity = isDragging
    ? 0.98
    : isHovered
      ? 0.96
      : isAnyHovered
        ? 0.68 + depthRatio * 0.14
        : 0.78 + depthRatio * 0.14;

  const targetBrightness = isDragging || isHovered
    ? 1.02
    : isAnyHovered
      ? 0.82 + depthRatio * 0.14
      : 0.85 + depthRatio * 0.15;

  return (
    <motion.div
      key={`${artifact.id}-${resetNonce}`}
      style={{
        left: `${artifact.layout.xPct}%`,
        top: `${artifact.layout.yPct}%`,
        width: `${artifact.layout.wPct}%`,
        aspectRatio: artifact.layout.aspect,
        zIndex: isDragging ? 90 : isHovered ? 80 : zIndex,
        x: dragX,
        y: dragY,
        rotate: prefersReduced ? 0 : dragTilt
      }}
      drag
      dragConstraints={dragConstraintsRef}
      dragMomentum={false}
      dragElastic={0.12}
      onPointerDown={(e) => {
        pointerStartRef.current = { x: e.clientX, y: e.clientY };
        dragDistanceRef.current = 0;
        onBringToFront(artifact.id);
      }}
      onDragStart={() => {
        setIsDragging(true);
        onDragMoved();
      }}
      onDrag={(_, info) => {
        dragDistanceRef.current = Math.hypot(info.offset.x, info.offset.y);
      }}
      onDragEnd={() => {
        setIsDragging(false);
        onDragCommit(artifact.id, dragX.get(), dragY.get());
      }}
      onMouseEnter={(e) => onHoverChange(artifact.id, e.clientX, e.clientY)}
      onMouseMove={(e) => onHoverChange(artifact.id, e.clientX, e.clientY)}
      onMouseLeave={() => onHoverChange(null)}
      onClick={(e) => {
        const start = pointerStartRef.current;
        const clickTravel = start
          ? Math.hypot(e.clientX - start.x, e.clientY - start.y)
          : 0;
        if (dragDistanceRef.current < 6 && clickTravel < 6) {
          onSelect(artifact);
        }
      }}
      className="absolute cursor-grab active:cursor-grabbing select-none"
    >
      <motion.div
        style={{ x: px, y: py }}
        initial={
          prefersReduced
            ? { opacity: 0 }
            : {
                opacity: 0,
                scale: 0.94,
                filter: 'brightness(0.95)'
              }
        }
        animate={{
          opacity: targetOpacity,
          scale: isDragging ? 1.03 : isHovered ? 1.02 : 1,
          y: isHovered && !isDragging && !prefersReduced ? -2 : 0,
          filter: `brightness(${targetBrightness.toFixed(3)})`
        }}
        transition={prefersReduced ? { duration: 0 } : SPRING_SNAPPY}
        className={`relative w-full h-full p-[7px] sm:p-2 rounded-[3px] backdrop-blur-[1.5px] ring-1 transition-all duration-200 ${
          isDragging
            ? 'bg-[#EDF4FF]/82 ring-[#1E63D6]/75 shadow-[0_14px_30px_rgba(30,99,214,0.16)]'
            : isHovered
              ? 'bg-[#EDF4FF]/70 ring-[#1E63D6]/50 shadow-[0_10px_24px_rgba(30,99,214,0.12)]'
              : 'bg-[#F6F5F0]/72 ring-[#0F172A]/[0.06] shadow-[0_2px_6px_rgba(15,23,42,0.04),0_8px_20px_rgba(15,23,42,0.06)]'
        }`}
      >
        <span
          className={`absolute top-[3px] left-[7px] z-10 font-paper-mono text-[9.5px] leading-none pointer-events-none tabular-nums transition-colors duration-150 rounded-[2px] ${
            isDragging || isHovered
              ? 'bg-[#FCE055] text-[#0F172A] px-1 py-[1px] font-semibold'
              : 'text-[#786858]'
          }`}
        >
          [{artifact.indexNum}]
        </span>
        <div className="w-full h-full overflow-hidden rounded-[2px] relative">
          <ArtifactMedia artifact={artifact} paused={paused} />
        </div>
      </motion.div>
    </motion.div>
  );
};

export const CreativeCodingArchive: React.FC<CreativeCodingArchiveProps> = ({
  open,
  onClose
}) => {
  const prefersReduced = useReducedMotion();

  const [activeStoryIndex, setActiveStoryIndex] = useState(
    () => parseCreativeHash().storyIndex
  );
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [selectedArtifactId, setSelectedArtifactId] = useState<string | null>(
    () => {
      const { storyIndex, artifactNum } = parseCreativeHash();
      if (artifactNum === null) return null;
      const match = CREATIVE_STORIES[storyIndex]?.artifacts.find(
        (a) => a.indexNum === artifactNum
      );
      return match ? match.id : null;
    }
  );

  const [paused, setPaused] = useState(false);
  const [codeTab, setCodeTab] = useState<'input' | 'output'>('input');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [totalHovered, setTotalHovered] = useState(false);

  const [hasDraggedLayout, setHasDraggedLayout] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);
  const [stackOrder, setStackOrder] = useState<string[]>([]);
  const [dragOffsetsPct, setDragOffsetsPct] = useState<
    Record<string, { dxPct: number; dyPct: number }>
  >({});
  const [hoveredInfo, setHoveredInfo] = useState<{
    id: string;
    x: number;
    y: number;
  } | null>(null);

  const stageRef = useRef<HTMLDivElement>(null);
  const collageRef = useRef<HTMLDivElement>(null);
  const rawMouseX = useMotionValue(0);
  const rawMouseY = useMotionValue(0);
  const parallaxX = useSpring(rawMouseX, { stiffness: 120, damping: 24 });
  const parallaxY = useSpring(rawMouseY, { stiffness: 120, damping: 24 });

  const currentStory: CreativeStory = CREATIVE_STORIES[activeStoryIndex];

  const selectedArtifactIndex = useMemo(() => {
    if (!selectedArtifactId) return -1;
    return currentStory.artifacts.findIndex((a) => a.id === selectedArtifactId);
  }, [currentStory, selectedArtifactId]);

  const selectedArtifact =
    selectedArtifactIndex >= 0
      ? currentStory.artifacts[selectedArtifactIndex]
      : null;

  const handleCloseWorkspace = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.history.replaceState(
        null,
        '',
        window.location.pathname + window.location.search
      );
    }
    onClose();
  }, [onClose]);

  useEffect(() => {
    setHasDraggedLayout(false);
    setHoveredInfo(null);
    setDragOffsetsPct({});
    const ordered = [...currentStory.artifacts]
      .sort((a, b) => a.layout.z - b.layout.z)
      .map((a) => a.id);
    setStackOrder(ordered);
  }, [activeStoryIndex, currentStory]);

  // Restore deep-linked story & artifact whenever workspace opens
  useEffect(() => {
    if (!open) return;
    setSwitcherOpen(false);
    const { storyIndex, artifactNum } = parseCreativeHash();
    setActiveStoryIndex(storyIndex);
    const targetStory = CREATIVE_STORIES[storyIndex];
    if (artifactNum !== null && targetStory) {
      const match = targetStory.artifacts.find(
        (a) => a.indexNum === artifactNum
      );
      setSelectedArtifactId(match ? match.id : null);
    } else {
      setSelectedArtifactId(null);
    }
  }, [open]);

  // Keep URL hash synced with current story & artifact for direct sharing
  useEffect(() => {
    if (!open || typeof window === 'undefined') return;
    const baseHash = `#story=${currentStory.slug}`;
    const nextHash = selectedArtifact
      ? `${baseHash}&artifact=${selectedArtifact.indexNum}`
      : baseHash;
    if (window.location.hash !== nextHash) {
      window.history.replaceState(null, '', nextHash);
    }
  }, [open, currentStory.slug, selectedArtifact]);

  const goStory = useCallback((nextIdx: number) => {
    const wrapped =
      (nextIdx + CREATIVE_STORIES.length) % CREATIVE_STORIES.length;
    setActiveStoryIndex(wrapped);
    setSelectedArtifactId(null);
    setSwitcherOpen(false);
    setCodeTab('input');
  }, []);

  const goArtifact = useCallback(
    (delta: number) => {
      if (selectedArtifactIndex < 0) return;
      const total = currentStory.artifacts.length;
      const next = (selectedArtifactIndex + delta + total) % total;
      setSelectedArtifactId(currentStory.artifacts[next].id);
    },
    [currentStory.artifacts, selectedArtifactIndex]
  );

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === 'Escape') {
        if (switcherOpen) {
          setSwitcherOpen(false);
        } else if (selectedArtifactId) {
          setSelectedArtifactId(null);
        } else {
          handleCloseWorkspace();
        }
      } else if (e.key === 'ArrowLeft' && !switcherOpen) {
        e.preventDefault();
        if (selectedArtifactId) {
          goArtifact(-1);
        } else {
          goStory(activeStoryIndex - 1);
        }
      } else if (e.key === 'ArrowRight' && !switcherOpen) {
        e.preventDefault();
        if (selectedArtifactId) {
          goArtifact(1);
        } else {
          goStory(activeStoryIndex + 1);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [
    open,
    switcherOpen,
    selectedArtifactId,
    activeStoryIndex,
    goArtifact,
    goStory,
    handleCloseWorkspace
  ]);

  const bringToFront = (id: string) => {
    setStackOrder((prev) => {
      const base =
        prev.length > 0
          ? prev
          : [...currentStory.artifacts]
              .sort((a, b) => a.layout.z - b.layout.z)
              .map((a) => a.id);
      if (base[base.length - 1] === id) return base;
      return [...base.filter((item) => item !== id), id];
    });
  };

  const handleDragCommit = (id: string, xPx: number, yPx: number) => {
    const box = collageRef.current?.getBoundingClientRect();
    if (!box || !box.width || !box.height) return;
    setDragOffsetsPct((prev) => ({
      ...prev,
      [id]: {
        dxPct: (xPx / box.width) * 100,
        dyPct: (yPx / box.height) * 100
      }
    }));
  };

  const handleResetLayout = () => {
    setHasDraggedLayout(false);
    setDragOffsetsPct({});
    setResetNonce((n) => n + 1);
    const ordered = [...currentStory.artifacts]
      .sort((a, b) => a.layout.z - b.layout.z)
      .map((a) => a.id);
    setStackOrder(ordered);
  };

  const handleCopySnippet = async () => {
    const txt =
      codeTab === 'input' ? currentStory.codeInput : currentStory.codeOutput;
    try {
      await navigator.clipboard.writeText(txt);
      setCopiedCode(true);
      window.setTimeout(() => setCopiedCode(false), 1600);
    } catch {
      // Ignore clipboard failures
    }
  };

  const handleShareLink = async () => {
    if (typeof window === 'undefined') return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      window.setTimeout(() => setCopiedLink(false), 1600);
    } catch {
      // Ignore clipboard failures
    }
  };

  const hoveredArtifact = hoveredInfo
    ? currentStory.artifacts.find((a) => a.id === hoveredInfo.id) ?? null
    : null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Creative Coding Workspace"
          initial={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={prefersReduced ? { opacity: 0 } : { opacity: 0, y: 8 }}
          transition={
            prefersReduced
              ? { duration: 0.12 }
              : { duration: 0.28, ease: [0.22, 1, 0.36, 1] }
          }
          className="fixed inset-0 z-50 flex flex-col lg:block overflow-hidden bg-[#FEFCF8] text-[#0F172A]"
        >
          {/* Paper grain overlay across entire viewport */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 paper-grain opacity-80"
          />

          {/* Shared Topbar — zero border, identical across all views */}
          <Topbar
            onBrandClick={handleCloseWorkspace}
            breadcrumb="creative coding"
            className="relative lg:fixed lg:top-0 lg:left-0 lg:right-0 z-40 w-full pt-8 pb-4 sm:pt-10 sm:pb-6 lg:pb-0 pointer-events-none no-print shrink-0"
          />

          {/* FULL-HEIGHT 2-COLUMN WORKSPACE (unified #FEFCF8 paper color on both sides) */}
          <div className="relative z-10 flex-1 lg:h-full flex flex-col lg:flex-row min-h-0 overflow-y-auto lg:overflow-hidden">
            {/* LEFT PURE CANVAS STAGE */}
            <div
              ref={stageRef}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                if (!rect.width || !rect.height) return;
                const nx = (e.clientX - rect.left) / rect.width - 0.5;
                const ny = (e.clientY - rect.top) / rect.height - 0.5;
                rawMouseX.set(nx * -1.4);
                rawMouseY.set(ny * -1.4);
              }}
              onMouseLeave={() => {
                rawMouseX.set(0);
                rawMouseY.set(0);
              }}
              className="relative flex-1 min-h-[520px] lg:h-full flex flex-col justify-between px-6 sm:px-10 pt-4 pb-5 lg:pt-20 lg:pb-6 overflow-hidden"
            >
              {/* Centered Interactive Collage Stage */}
              <div className="relative flex-1 flex items-center justify-center">
                {/* Desktop Layered Draggable Collage */}
                <div
                  ref={collageRef}
                  className={`hidden md:block relative w-full max-w-[780px] aspect-[10/7] transition-all duration-300 ${
                    selectedArtifact
                      ? 'opacity-15 scale-[0.97] pointer-events-none blur-[1px]'
                      : 'opacity-100 scale-100'
                  }`}
                >
                  {currentStory.artifacts.map((artifact, idx) => {
                    const rank =
                      stackOrder.length > 0
                        ? stackOrder.indexOf(artifact.id)
                        : idx;
                    const resolvedRank = rank >= 0 ? rank : idx;
                    const maxRank = Math.max(
                      1,
                      currentStory.artifacts.length - 1
                    );
                    const depthRatio = resolvedRank / maxRank;

                    return (
                      <DraggableCollageCard
                        key={artifact.id}
                        artifact={artifact}
                        zIndex={10 + resolvedRank}
                        depthRatio={depthRatio}
                        paused={paused}
                        resetNonce={resetNonce}
                        dragConstraintsRef={stageRef}
                        parallaxX={parallaxX}
                        parallaxY={parallaxY}
                        isAnyHovered={hoveredInfo !== null}
                        isHovered={hoveredInfo?.id === artifact.id}
                        onBringToFront={bringToFront}
                        onDragMoved={() => setHasDraggedLayout(true)}
                        onDragCommit={handleDragCommit}
                        onHoverChange={(id, x, y) => {
                          if (!id) {
                            setHoveredInfo(null);
                          } else {
                            setHoveredInfo({
                              id,
                              x: x ?? 0,
                              y: y ?? 0
                            });
                          }
                        }}
                        onSelect={(art) => {
                          setHoveredInfo(null);
                          setSelectedArtifactId(art.id);
                        }}
                      />
                    );
                  })}
                </div>

                {/* Mobile Grid Fallback */}
                {!selectedArtifact && (
                  <div className="md:hidden grid grid-cols-2 gap-3 w-full max-w-lg py-2">
                    {currentStory.artifacts.map((art) => (
                      <button
                        key={art.id}
                        type="button"
                        onClick={() => setSelectedArtifactId(art.id)}
                        className="text-left p-2 rounded-[3px] cursor-pointer bg-[#EAE8E2]/85"
                      >
                        <span className="block font-paper-mono text-[10px] mb-1 opacity-70">
                          [{art.indexNum}] {art.title}
                        </span>
                        <div className="w-full aspect-[4/3] overflow-hidden rounded-[2px]">
                          <ArtifactMedia artifact={art} paused={paused} />
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* IN-PLACE ARTIFACT LIGHTBOX — clean card with NO magnifying glass */}
                <AnimatePresence>
                  {selectedArtifact && (
                    <motion.div
                      key={`lightbox-${selectedArtifact.id}`}
                      initial={
                        prefersReduced
                          ? { opacity: 0 }
                          : { opacity: 0, y: 12, scale: 0.96 }
                      }
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={
                        prefersReduced
                          ? { opacity: 0 }
                          : { opacity: 0, y: 6, scale: 0.97 }
                      }
                      transition={
                        prefersReduced ? { duration: 0.1 } : SPRING_GENTLE
                      }
                      onClick={(e) => {
                        if (e.target === e.currentTarget) {
                          setSelectedArtifactId(null);
                        }
                      }}
                      className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-5 px-2"
                    >
                      <div
                        className="relative p-3 sm:p-4 rounded-[4px] bg-[#F6F5F0]/95 ring-1 ring-[#1E63D6]/25 shadow-[0_10px_28px_rgba(15,23,42,0.08)]"
                        style={{
                          width: 'min(480px, 76vw)',
                          aspectRatio: selectedArtifact.layout.aspect,
                          maxHeight: '58vh'
                        }}
                      >
                        <span className="absolute top-2 left-3 z-10 rounded-[3px] bg-[#FCE055] px-1.5 py-[1px] font-paper-mono text-[11px] font-semibold tabular-nums text-[#0F172A]">
                          [{selectedArtifact.indexNum}]
                        </span>
                        <div className="w-full h-full overflow-hidden rounded-[2px]">
                          <ArtifactMedia
                            artifact={selectedArtifact}
                            paused={paused}
                          />
                        </div>
                      </div>

                      <div className="inline-flex items-center gap-4 px-2 py-1">
                        <LiveCollageThumbnail
                          story={currentStory}
                          stackOrder={stackOrder}
                          dragOffsetsPct={dragOffsetsPct}
                          activeArtifactId={selectedArtifact.id}
                          onSelectArtifact={(id) => setSelectedArtifactId(id)}
                          className="w-[104px] h-[73px]"
                        />
                        <button
                          type="button"
                          onClick={() => setSelectedArtifactId(null)}
                          className="group inline-flex items-center gap-1.5 font-paper-mono text-[12px] whitespace-nowrap text-[#786858] hover:text-[#1E63D6] active:scale-[0.94] transition-all duration-200 cursor-pointer"
                        >
                          <span>Whole story</span>
                          <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Cursor-Anchored Floating Monospace Tooltip */}
                <AnimatePresence>
                  {!selectedArtifact &&
                    !switcherOpen &&
                    hoveredArtifact &&
                    hoveredInfo && (
                      <motion.div
                        key={hoveredArtifact.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={
                          prefersReduced
                            ? { duration: 0 }
                            : { duration: 0.16, ease: [0.22, 1, 0.36, 1] }
                        }
                        style={{
                          left: Math.min(
                            (typeof window !== 'undefined'
                              ? window.innerWidth
                              : 1200) - 280,
                            Math.max(16, hoveredInfo.x + 14)
                          ),
                          top: Math.min(
                            (typeof window !== 'undefined'
                              ? window.innerHeight
                              : 800) - 56,
                            Math.max(88, hoveredInfo.y + 18)
                          )
                        }}
                        className="pointer-events-none fixed z-[100] max-w-[270px] rounded-[6px] px-2.5 py-1.5 font-paper-mono text-[11px] leading-snug ring-1 ring-[#1E63D6]/25 shadow-[0_6px_18px_rgba(15,23,42,0.08)] backdrop-blur-md bg-[#FEFCF8]/95 text-[#0F172A]"
                      >
                        <span className="inline-block rounded-[3px] bg-[#FCE055] px-1 py-[0.5px] font-semibold text-[#0F172A] mr-1">
                          [{hoveredArtifact.indexNum}]
                        </span>
                        {hoveredArtifact.tooltipCaption}
                      </motion.div>
                    )}
                </AnimatePresence>
              </div>

              {/* Minimal Bottom Controls: Reset + Pause */}
              <div className="relative z-20 flex items-center justify-between gap-3 min-h-[28px]">
                <div>
                  <AnimatePresence>
                    {!selectedArtifact && hasDraggedLayout && (
                      <motion.button
                        type="button"
                        onClick={handleResetLayout}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={
                          prefersReduced ? { duration: 0 } : SPRING_SNAPPY
                        }
                        className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 font-paper-mono text-[11.5px] cursor-pointer transition-all bg-[#F6F5F0] border border-[#E5E7EB] text-[#0F172A] hover:bg-[#EDF4FF] hover:border-[#1E63D6]/30 hover:text-[#1E63D6] active:scale-[0.94]"
                      >
                        <span>Reset</span>
                        <RotateCcw className="w-3 h-3" />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>

                <button
                  type="button"
                  onClick={() => setPaused((p) => !p)}
                  aria-label={
                    paused ? 'Resume simulations' : 'Pause simulations'
                  }
                  title={paused ? 'Resume animations' : 'Pause animations'}
                  className="flex h-7 w-7 items-center justify-center rounded-md transition-all cursor-pointer text-[#786858] hover:bg-[#EDF4FF] hover:text-[#1E63D6] active:scale-[0.92]"
                >
                  {paused ? (
                    <Play className="w-3.5 h-3.5" />
                  ) : (
                    <Pause className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* RIGHT EDITORIAL SIDEBAR — Identical #FEFCF8 paper color, borderless */}
            <aside className="w-full lg:w-[400px] xl:w-[430px] lg:h-full shrink-0 flex flex-col justify-between lg:overflow-y-auto lg:pt-[84px] bg-[#FEFCF8]">
              {!selectedArtifact ? (
                /* STORY SIDEBAR */
                <div className="px-6 sm:px-8 py-5 space-y-6 flex-1">
                  {/* Top Control Row: Story N of [6] where 6 opens All Stories switcher */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="relative inline-flex items-center gap-1.5 font-paper-mono text-[12px] tabular-nums text-[#786858]">
                      <span>Story {activeStoryIndex + 1} of</span>
                      <button
                        type="button"
                        onClick={() => setSwitcherOpen(true)}
                        onMouseEnter={() => setTotalHovered(true)}
                        onMouseLeave={() => setTotalHovered(false)}
                        onFocus={() => setTotalHovered(true)}
                        onBlur={() => setTotalHovered(false)}
                        aria-label={`View all ${CREATIVE_STORIES.length} stories`}
                        className="relative inline-flex items-center justify-center px-1.5 py-0.5 rounded-[4px] font-semibold text-[#EF4E5E] bg-[#EF4E5E]/10 hover:bg-[#EF4E5E] hover:text-white active:scale-[0.92] transition-all duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EF4E5E]"
                      >
                        {CREATIVE_STORIES.length}
                      </button>
                      <AnimatePresence>
                        {totalHovered && (
                          <motion.span
                            initial={{ opacity: 0, y: 3 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 2 }}
                            transition={
                              prefersReduced
                                ? { duration: 0 }
                                : { duration: 0.16, ease: [0.22, 1, 0.36, 1] }
                            }
                            className="pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded-[5px] bg-[#FCE055] px-2 py-0.5 font-paper-mono text-[10.5px] font-semibold text-[#0F172A] shadow-[0_4px_12px_rgba(15,23,42,0.1)]"
                          >
                            All stories
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => goStory(activeStoryIndex - 1)}
                        aria-label="Previous story"
                        className="flex h-7 w-7 items-center justify-center rounded-md transition-all cursor-pointer text-[#374151] hover:bg-[#EDF4FF] hover:text-[#1E63D6] active:scale-[0.92]"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => goStory(activeStoryIndex + 1)}
                        aria-label="Next story"
                        className="flex h-7 w-7 items-center justify-center rounded-md transition-all cursor-pointer text-[#374151] hover:bg-[#EDF4FF] hover:text-[#1E63D6] active:scale-[0.92]"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Unified Space Grotesk Editorial Story Heading */}
                  <div>
                    <h2 className="font-display text-[28px] sm:text-[32px] font-bold leading-[1.12] tracking-[-0.03em] text-[#0F172A]">
                      {currentStory.title}
                    </h2>
                    <p className="font-display text-[14.5px] mt-2 leading-relaxed text-[#786858]">
                      {currentStory.subtitle}
                    </p>
                  </div>

                  {/* Warm Paper-Stone Input / Output Code & Metrics Card */}
                  <div className="rounded-xl bg-[#F6F5F0] border border-[#E5E7EB] p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="inline-flex items-center gap-1 p-0.5 rounded-md bg-[#FEFCF8] border border-[#E5E7EB]/80">
                        <button
                          type="button"
                          onClick={() => setCodeTab('input')}
                          className={`px-2.5 py-1 rounded-[4px] font-paper-mono text-[11px] transition-all cursor-pointer ${
                            codeTab === 'input'
                              ? 'bg-[#EDF4FF] text-[#1E63D6] font-semibold'
                              : 'text-[#786858] hover:text-[#0F172A]'
                          }`}
                        >
                          Input
                        </button>
                        <button
                          type="button"
                          onClick={() => setCodeTab('output')}
                          className={`px-2.5 py-1 rounded-[4px] font-paper-mono text-[11px] transition-all cursor-pointer ${
                            codeTab === 'output'
                              ? 'bg-[#EDF4FF] text-[#1E63D6] font-semibold'
                              : 'text-[#786858] hover:text-[#0F172A]'
                          }`}
                        >
                          Output
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={handleCopySnippet}
                        className="inline-flex items-center gap-1 font-paper-mono text-[11px] text-[#786858] hover:text-[#1E63D6] active:scale-[0.94] transition-all cursor-pointer"
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

                    <pre className="font-paper-mono code-features text-[12px] leading-[1.6] overflow-x-auto text-[#0F172A]/90 whitespace-pre-wrap">
                      <code>
                        {codeTab === 'input'
                          ? currentStory.codeInput
                          : currentStory.codeOutput}
                      </code>
                    </pre>
                  </div>

                  {/* Narrative Prose */}
                  <div className="space-y-3.5 pt-1 max-w-[54ch]">
                    {currentStory.narrative.map((para, idx) => (
                      <p
                        key={idx}
                        className="font-display text-[14.5px] leading-[1.75] text-[#374151]"
                      >
                        {para}
                      </p>
                    ))}
                  </div>
                </div>
              ) : (
                /* ARTIFACT INSPECTOR SIDEBAR */
                <div className="px-6 sm:px-8 py-5 space-y-6 flex-1">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-paper-mono text-[12px] tabular-nums text-[#786858]">
                      Artifact {selectedArtifactIndex + 1} of{' '}
                      {currentStory.artifacts.length}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => goArtifact(-1)}
                        aria-label="Previous artifact"
                        className="flex h-7 w-7 items-center justify-center rounded-md transition-all cursor-pointer text-[#374151] hover:bg-[#EDF4FF] hover:text-[#1E63D6] active:scale-[0.92]"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => goArtifact(1)}
                        aria-label="Next artifact"
                        className="flex h-7 w-7 items-center justify-center rounded-md transition-all cursor-pointer text-[#374151] hover:bg-[#EDF4FF] hover:text-[#1E63D6] active:scale-[0.92]"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Cobalt blue Space Grotesk artifact heading */}
                  <h2 className="font-display text-[26px] sm:text-[30px] font-bold leading-[1.14] tracking-[-0.025em] text-[#1E63D6]">
                    {selectedArtifact.title}
                  </h2>

                  <div className="space-y-1.5 max-w-[54ch]">
                    <h3 className="font-display text-[15px] font-semibold text-[#0F172A] tracking-tight">
                      About this artifact
                    </h3>
                    <p className="font-display text-[14.5px] leading-[1.75] text-[#374151]">
                      {selectedArtifact.aboutText}
                    </p>
                  </div>

                  <div className="space-y-1.5 max-w-[54ch]">
                    <h3 className="font-display text-[15px] font-semibold text-[#0F172A] tracking-tight">
                      Connection to “{currentStory.title}”
                    </h3>
                    <p className="font-display text-[14.5px] leading-[1.75] text-[#374151]">
                      {selectedArtifact.connectionText}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 font-paper-mono text-[12px] text-[#786858] pt-1">
                    <span>Medium:</span>
                    <span className="rounded-[4px] bg-[#EDF4FF] px-2 py-0.5 font-medium text-[#1E63D6]">
                      {selectedArtifact.mediumLabel}
                    </span>
                  </div>

                  {/* "Part of [Story Title] ↗" footer link */}
                  <button
                    type="button"
                    onClick={() => setSelectedArtifactId(null)}
                    className="w-full flex items-center justify-between gap-3 rounded-lg py-3 px-2 -mx-2 hover:bg-[#EDF4FF]/70 active:scale-[0.99] text-left transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <LiveCollageThumbnail
                        story={currentStory}
                        stackOrder={stackOrder}
                        dragOffsetsPct={dragOffsetsPct}
                        activeArtifactId={selectedArtifact.id}
                        className="w-16 h-11"
                      />
                      <div className="min-w-0">
                        <p className="font-paper-mono text-[10.5px] text-[#786858]">
                          Part of
                        </p>
                        <p className="font-display text-[17px] font-semibold tracking-[-0.015em] leading-tight truncate text-[#0F172A]">
                          {currentStory.title}
                        </p>
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-[#1E63D6] shrink-0" />
                  </button>
                </div>
              )}

              {/* Sidebar Bottom Row: Next story + Copy shareable deep link */}
              <div className="px-6 sm:px-8 py-5 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => goStory(activeStoryIndex + 1)}
                  className="inline-flex items-center gap-2 font-paper-mono text-[12px] text-[#0F172A] hover:text-[#1E63D6] active:scale-[0.96] transition-all cursor-pointer"
                >
                  <span>Next story</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleShareLink}
                  className="inline-flex items-center gap-1.5 font-paper-mono text-[11.5px] text-[#786858] hover:text-[#1E63D6] active:scale-[0.94] transition-all cursor-pointer"
                  aria-label="Copy shareable link to this view"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3 h-3 text-[#1E63D6]" />
                      <span className="text-[#1E63D6]">link copied</span>
                    </>
                  ) : (
                    <>
                      <Link2 className="w-3 h-3" />
                      <span>share</span>
                    </>
                  )}
                </button>
              </div>
            </aside>
          </div>

          {/* 3×2 STORIES SWITCHER OVERLAY (invoked by clicking the highlighted "6" in Story 1 of 6) */}
          <AnimatePresence>
            {switcherOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={(e) => {
                  if (e.target === e.currentTarget) setSwitcherOpen(false);
                }}
                className="fixed inset-0 z-50 flex flex-col overflow-y-auto px-6 sm:px-10 py-8 sm:py-10 backdrop-blur-md bg-[#FEFCF8]/95"
              >
                <div className="w-full flex items-center justify-between gap-8 mb-8">
                  <span className="font-paper-mono text-[12.5px] text-[#786858]">
                    All stories
                  </span>
                  <button
                    type="button"
                    onClick={() => setSwitcherOpen(false)}
                    aria-label="Close stories switcher"
                    className="flex h-8 w-8 items-center justify-center rounded-md transition-colors cursor-pointer text-[#374151] hover:bg-[#0F172A]/6"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="mx-auto max-w-6xl w-full flex-1 flex items-center">
                  <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-12 place-items-center pb-8">
                    {CREATIVE_STORIES.map((story, idx) => (
                      <div key={story.id} className="w-full flex justify-center">
                        <StoryClusterCard
                          story={story}
                          active={idx === activeStoryIndex}
                          onSelect={() => goStory(idx)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
