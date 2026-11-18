import React, { useEffect, useRef, useState } from 'react';
import {
  AnimatePresence,
  MotionValue,
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity
} from 'motion/react';
import { ARC_NODES, ArcNode } from '../data/portfolio';
import ipImg from '../assets/images/ip.png';
import arcWorkImg from '../assets/images/arc-work.jpg';
import arcMotionImg from '../assets/images/arc-motion.jpg';
import arcToolsImg from '../assets/images/arc-tools.jpg';

interface HeroStageProps {
  onSelectNode: (node: ArcNode) => void;
  onStickerTap?: () => void;
}

const NODE_IMAGES = [arcWorkImg, arcMotionImg, arcToolsImg];
const NODE_FLOAT_META = [
  { dur: '3.4s', delay: '0s' },
  { dur: '3.9s', delay: '.55s' },
  { dur: '4.4s', delay: '1.1s' }
];

// Tilted elliptical planetary orbit around the IP character
const ORBIT_RX = 192;
const ORBIT_RY = 165;
const BASE_TILT_DEG = -7;
const ORBIT_SPEED = 0.22; // rad/s (~28.5s per revolution)

// 120° symmetric planetary spacing during motion; upper-arc static layout for reduced motion
const ACTIVE_START_ANGLES = [
  (-145 * Math.PI) / 180,
  (-25 * Math.PI) / 180,
  (95 * Math.PI) / 180
];
const REDUCED_ANGLES = [
  (-165 * Math.PI) / 180,
  (-90 * Math.PI) / 180,
  (-15 * Math.PI) / 180
];

const STICKER_QUIPS = ['hi!', 'drag me ~', 'words stirred ♪', '60fps physics'];

// Brand triad rotating themes (#EF4E5E red, #1E63D6 cobalt blue, #FCE055 yellow)
const QUIP_THEMES = [
  'border-[#EF4E5E]/35 bg-[#FEFCF8] text-[#EF4E5E]',
  'border-[#1E63D6]/30 bg-[#EDF4FF] text-[#1E63D6]',
  'border-[#D9B826]/45 bg-[#FCE055] text-[#0F172A]'
];

// Varied positions around the strawberry hood so floating quips never stack in one spot
const QUIP_SPOTS = [
  { top: -10, left: 214, baseRot: -4 },
  { top: -14, left: -12, baseRot: 5 },
  { top: 34, left: 242, baseRot: 6 },
  { top: 30, left: -34, baseRot: -6 },
  { top: -28, left: 108, baseRot: -2 }
];

interface FloatingQuip {
  id: number;
  text: string;
  themeClass: string;
  top: number;
  left: number;
  rot: number;
}

interface OrbitNodeProps {
  node: ArcNode;
  index: number;
  baseAngle: number;
  isHovered: boolean;
  orbitAngle: MotionValue<number>;
  chimeOffsetX: MotionValue<number>;
  chimeOffsetY: MotionValue<number>;
  chimeSway: MotionValue<number>;
  prefersReduced: boolean;
  onSelect: (node: ArcNode) => void;
  onHoverChange: (id: string | null) => void;
}

const OrbitNode: React.FC<OrbitNodeProps> = ({
  node,
  index,
  baseAngle,
  isHovered,
  orbitAngle,
  chimeOffsetX,
  chimeOffsetY,
  chimeSway,
  prefersReduced,
  onSelect,
  onHoverChange
}) => {
  const floatMeta = NODE_FLOAT_META[index] ?? NODE_FLOAT_META[0];
  const theta = useTransform(orbitAngle, (a) => a + baseAngle);

  const nodeX = useTransform(
    [theta, chimeOffsetX, chimeSway],
    ([t, cx, sway]: number[]) => {
      const tiltRad = ((BASE_TILT_DEG + sway) * Math.PI) / 180;
      const ex = ORBIT_RX * Math.cos(t);
      const ey = ORBIT_RY * Math.sin(t);
      return ex * Math.cos(tiltRad) - ey * Math.sin(tiltRad) + cx;
    }
  );

  const nodeY = useTransform(
    [theta, chimeOffsetY, chimeSway],
    ([t, cy, sway]: number[]) => {
      const tiltRad = ((BASE_TILT_DEG + sway) * Math.PI) / 180;
      const ex = ORBIT_RX * Math.cos(t);
      const ey = ORBIT_RY * Math.sin(t);
      return ex * Math.sin(tiltRad) + ey * Math.cos(tiltRad) + cy;
    }
  );

  const nodeScale = useTransform(theta, (t) => {
    if (prefersReduced) return 1;
    const backDepth = Math.max(0, Math.sin(t));
    return 1 - backDepth * 0.16;
  });

  const nodeOpacity = useTransform(theta, (t) => {
    if (prefersReduced) return 1;
    const backDepth = Math.max(0, Math.sin(t));
    return 1 - backDepth * 0.34;
  });

  const nodeZ = useTransform(theta, (t) => {
    if (prefersReduced) return 3;
    return Math.sin(t) > 0.06 ? 1 : 3;
  });

  return (
    <motion.div
      className="ip-node-slot"
      style={{
        x: nodeX,
        y: nodeY,
        scale: nodeScale,
        opacity: nodeOpacity,
        zIndex: nodeZ
      }}
    >
      <button
        type="button"
        className="ip-node focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#1E63D6]"
        style={
          {
            '--fdur': floatMeta.dur,
            '--fdelay': floatMeta.delay
          } as React.CSSProperties
        }
        onClick={(e) => {
          e.stopPropagation();
          onSelect(node);
        }}
        onMouseEnter={() => onHoverChange(node.id)}
        onMouseLeave={() => onHoverChange(null)}
        onFocus={() => onHoverChange(node.id)}
        onBlur={() => onHoverChange(null)}
        aria-label={`${node.label}: ${node.shortDesc}`}
      >
        <img
          className="ip-node-img"
          src={NODE_IMAGES[index]}
          alt=""
          draggable={false}
        />
        <AnimatePresence>
          {isHovered && (
            <motion.span
              role="tooltip"
              initial={
                prefersReduced
                  ? { opacity: 0 }
                  : { opacity: 0, y: -4, scale: 0.92 }
              }
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={
                prefersReduced
                  ? { opacity: 0 }
                  : { opacity: 0, y: -3, scale: 0.94 }
              }
              transition={
                prefersReduced
                  ? { duration: 0.1 }
                  : { type: 'spring', stiffness: 340, damping: 22 }
              }
              className="pointer-events-none absolute top-[62px] left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded-[5px] bg-[#FCE055] px-2.5 py-[2px] font-paper-mono text-[11px] font-semibold text-[#0F172A] shadow-[0_6px_14px_rgba(0,0,0,0.18)]"
            >
              {node.label}
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </motion.div>
  );
};

export const HeroStage: React.FC<HeroStageProps> = ({
  onSelectNode,
  onStickerTap
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isDraggingSticker, setIsDraggingSticker] = useState(false);
  const [floatingQuips, setFloatingQuips] = useState<FloatingQuip[]>([]);

  const stageRef = useRef<HTMLDivElement>(null);
  const dragDistRef = useRef(0);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const quipSeqRef = useRef(0);
  const lastSpotRef = useRef(-1);
  const timeoutsRef = useRef<number[]>([]);
  const speedRef = useRef(1);
  const prefersReduced = Boolean(useReducedMotion());

  // Planetary orbital angle (radians)
  const orbitAngle = useMotionValue(0);

  // Smoothly brake orbit on node hover/focus so clicking is effortless
  useAnimationFrame((_, delta) => {
    if (prefersReduced) return;
    const clampedDelta = Math.min(delta, 50) / 1000;
    const targetSpeed = hoveredId ? 0.08 : isDraggingSticker ? 0.45 : 1;
    speedRef.current +=
      (targetSpeed - speedRef.current) * Math.min(1, clampedDelta * 7);
    orbitAngle.set(
      orbitAngle.get() + ORBIT_SPEED * speedRef.current * clampedDelta
    );
  });

  // Sticker spring drag + velocity tilt
  const stickerX = useMotionValue(0);
  const stickerY = useMotionValue(0);
  const stickerVx = useVelocity(stickerX);
  const rawTilt = useTransform(stickerVx, [-1400, 0, 1400], [-4.5, 0, 4.5]);
  const stickerTilt = useSpring(rawTilt, { stiffness: 260, damping: 22 });

  // Wind-chime damped orbit follower: lags behind stickerX/Y then springs back
  const orbitLagX = useSpring(stickerX, { stiffness: 115, damping: 14 });
  const orbitLagY = useSpring(stickerY, { stiffness: 115, damping: 14 });
  const chimeOffsetX = useTransform(
    [orbitLagX, stickerX],
    ([lag, cur]: number[]) => (prefersReduced ? 0 : (lag - cur) * 0.48)
  );
  const chimeOffsetY = useTransform(
    [orbitLagY, stickerY],
    ([lag, cur]: number[]) => (prefersReduced ? 0 : (lag - cur) * 0.48)
  );
  const chimeSway = useTransform(
    [orbitLagX, stickerX],
    ([lag, cur]: number[]) =>
      prefersReduced ? 0 : Math.max(-6, Math.min(6, (cur - lag) * 0.08))
  );
  const arcRotate = useTransform(chimeSway, (s) => BASE_TILT_DEG + s);

  // Subtle breathing pointer parallax across stage
  const rawHoverX = useMotionValue(0);
  const rawHoverY = useMotionValue(0);
  const hoverX = useSpring(rawHoverX, { stiffness: 140, damping: 24 });
  const hoverY = useSpring(rawHoverY, { stiffness: 140, damping: 24 });

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((id) => window.clearTimeout(id));
      timeoutsRef.current = [];
    };
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) {
      return;
    }
    const fit = () => {
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      if (!w || !h) {
        return;
      }
      stage.style.setProperty(
        '--ip-scale',
        Math.min(1, h / 456, w / 470).toFixed(3)
      );
    };
    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(fit);
      observer.observe(stage);
      fit();
      return () => observer.disconnect();
    }
    window.addEventListener('resize', fit);
    fit();
    return () => window.removeEventListener('resize', fit);
  }, []);

  const triggerStickerEasterEgg = () => {
    onStickerTap?.();

    const seq = quipSeqRef.current;
    quipSeqRef.current += 1;

    // Pick a spot different from the previous click, with mild organic jitter
    let spotIdx = Math.floor(Math.random() * QUIP_SPOTS.length);
    if (spotIdx === lastSpotRef.current) {
      spotIdx = (spotIdx + 1 + Math.floor(Math.random() * 2)) % QUIP_SPOTS.length;
    }
    lastSpotRef.current = spotIdx;
    const spot = QUIP_SPOTS[spotIdx];

    const newQuip: FloatingQuip = {
      id: Date.now() + seq,
      text: STICKER_QUIPS[seq % STICKER_QUIPS.length],
      themeClass: QUIP_THEMES[seq % QUIP_THEMES.length],
      top: spot.top + (Math.random() * 10 - 5),
      left: spot.left + (Math.random() * 14 - 7),
      rot: spot.baseRot + (Math.random() * 4 - 2)
    };

    setFloatingQuips((prev) => [...prev.slice(-4), newQuip]);

    const timerId = window.setTimeout(() => {
      setFloatingQuips((prev) => prev.filter((item) => item.id !== newQuip.id));
    }, 1350);
    timeoutsRef.current.push(timerId);
  };

  return (
    <div className="relative flex items-center justify-center lg:justify-end">
      <figure className="ip-study w-full">
        <div
          ref={stageRef}
          className="ip-stage"
          onMouseMove={(e) => {
            if (prefersReduced) return;
            const rect = e.currentTarget.getBoundingClientRect();
            if (!rect.width || !rect.height) return;
            const nx = (e.clientX - rect.left) / rect.width - 0.5;
            const ny = (e.clientY - rect.top) / rect.height - 0.5;
            rawHoverX.set(nx * 6);
            rawHoverY.set(ny * 4);
          }}
          onMouseLeave={() => {
            rawHoverX.set(0);
            rawHoverY.set(0);
          }}
        >
          {/* DesktopSticker — 280px paper-cutout IP, grounded at the bottom */}
          <div className="desktop-sticker">
            <motion.div
              style={{ x: hoverX, y: hoverY }}
              className="relative"
            >
              <motion.div
                className="sticker-drag"
                style={{
                  x: stickerX,
                  y: stickerY,
                  rotate: prefersReduced ? 0 : stickerTilt
                }}
                drag
                dragConstraints={stageRef}
                dragSnapToOrigin={true}
                dragTransition={{ bounceStiffness: 300, bounceDamping: 20 }}
                dragElastic={0.45}
                whileDrag={prefersReduced ? undefined : { scale: 1.03 }}
                onDragStart={() => setIsDraggingSticker(true)}
                onDragEnd={() => setIsDraggingSticker(false)}
                onPointerDown={(e) => {
                  pointerStartRef.current = { x: e.clientX, y: e.clientY };
                  dragDistRef.current = 0;
                }}
                onDrag={(_, info) => {
                  dragDistRef.current = Math.hypot(
                    info.offset.x,
                    info.offset.y
                  );
                }}
                onClick={(e) => {
                  const target = e.target as HTMLElement | null;
                  if (target?.closest('.ip-node')) return;
                  const start = pointerStartRef.current;
                  const clickTravel = start
                    ? Math.hypot(e.clientX - start.x, e.clientY - start.y)
                    : 0;
                  if (dragDistRef.current < 6 && clickTravel < 6) {
                    triggerStickerEasterEgg();
                  }
                }}
              >
                <img
                  src={ipImg}
                  alt="Hand-drawn strawberry-hood IP illustration (draggable or click to wave)"
                  draggable={false}
                />

                {/* Rising Brand-Triad Speech Bubbles */}
                <AnimatePresence>
                  {floatingQuips.map((quip) => (
                    <motion.div
                      key={quip.id}
                      style={{ top: quip.top, left: quip.left }}
                      initial={
                        prefersReduced
                          ? { opacity: 0 }
                          : { opacity: 0, y: 8, scale: 0.84, rotate: quip.rot }
                      }
                      animate={
                        prefersReduced
                          ? { opacity: 1 }
                          : {
                              opacity: [0, 1, 1, 0],
                              y: [8, -8, -28, -46],
                              scale: [0.84, 1.03, 1, 0.96],
                              rotate: quip.rot
                            }
                      }
                      exit={{ opacity: 0 }}
                      transition={
                        prefersReduced
                          ? { duration: 0.15 }
                          : {
                              duration: 1.35,
                              times: [0, 0.16, 0.65, 1],
                              ease: [0.22, 1, 0.36, 1]
                            }
                      }
                      className={`pointer-events-none absolute z-30 rounded-full border px-3 py-0.5 font-script text-[22px] leading-none shadow-[0_6px_16px_rgba(0,0,0,0.14)] whitespace-nowrap ${quip.themeClass}`}
                    >
                      {quip.text}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Planetary Orbit Anchor — no transform/z-index so nodes interleave in front & behind IP */}
                <div className="ip-orbit-anchor">
                  <motion.svg
                    className={`ip-arc ${hoveredId ? 'is-active' : ''}`}
                    viewBox="-210 -185 420 370"
                    width={420}
                    height={370}
                    style={{
                      left: -210,
                      top: -185,
                      x: chimeOffsetX,
                      y: chimeOffsetY,
                      rotate: arcRotate
                    }}
                    aria-hidden="true"
                  >
                    <ellipse cx={0} cy={0} rx={ORBIT_RX} ry={ORBIT_RY} />
                  </motion.svg>

                  {ARC_NODES.map((node, index) => (
                    <OrbitNode
                      key={node.id}
                      node={node}
                      index={index}
                      baseAngle={
                        prefersReduced
                          ? REDUCED_ANGLES[index] ?? REDUCED_ANGLES[0]
                          : ACTIVE_START_ANGLES[index] ?? ACTIVE_START_ANGLES[0]
                      }
                      isHovered={hoveredId === node.id}
                      orbitAngle={orbitAngle}
                      chimeOffsetX={chimeOffsetX}
                      chimeOffsetY={chimeOffsetY}
                      chimeSway={chimeSway}
                      prefersReduced={prefersReduced}
                      onSelect={onSelectNode}
                      onHoverChange={setHoveredId}
                    />
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </figure>
    </div>
  );
};
