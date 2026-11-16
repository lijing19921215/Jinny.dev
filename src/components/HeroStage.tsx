import React, { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ARC_NODES, ArcNode } from '../data/portfolio';
import ipImg from '../assets/images/ip.png';
import cartonImg from '../assets/images/carton.png';
import {
  AnimatedCompassIcon,
  AnimatedLayersIcon,
  AnimatedSplineIcon
} from './AnimatedIcons';

interface HeroStageProps {
  onSelectNode: (node: ArcNode) => void;
}

const NodeMicroIcon: React.FC<{ id: ArcNode['id']; isHovered: boolean }> = ({
  id,
  isHovered
}) => {
  const cls = `transition-colors duration-200 ${
    isHovered ? 'text-[#1E63D6]' : 'text-[#0F172A]'
  }`;

  if (id === 'creative-coding') {
    return <AnimatedSplineIcon active={isHovered} size={18} className={cls} />;
  }

  if (id === 'ai-style-skill') {
    return <AnimatedLayersIcon active={isHovered} size={18} className={cls} />;
  }

  return <AnimatedCompassIcon active={isHovered} size={18} className={cls} />;
};

export const HeroStage: React.FC<HeroStageProps> = ({ onSelectNode }) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [characterActive, setCharacterActive] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const prefersReduced = useReducedMotion();

  // Exact upper halo arch coordinates matching the HTML reference (340 x 280 stage)
  const stageW = 340;
  const stageH = 280;
  const centerX = 170;
  const centerY = 160;
  const arcRadius = 130;

  // Angles along the upper semi-circular arch: Left (-164deg), Top (-90deg), Right (-16deg)
  const archAnglesDeg = [-164, -90, -16];

  const isAnyActive = characterActive || hoveredId !== null;
  const leanRotate =
    hoveredId === 'creative-coding'
      ? -2.5
      : hoveredId === 'experience'
        ? 2.5
        : characterActive
          ? 1.5
          : 0;

  return (
    <div className="relative flex items-center justify-center lg:justify-end">
      <div
        className="relative flex items-end justify-center select-none"
        style={{ width: `${stageW}px`, height: `${stageH}px` }}
      >
        {/* Upper golden dashed semi-circular halo arcs (true SVG dashes, never solid) */}
        <svg
          viewBox={`0 0 ${stageW} ${stageH}`}
          className="absolute inset-0 h-full w-full pointer-events-none overflow-visible"
          aria-hidden="true"
        >
          {/* Outer delicate cobalt micro-tick arc rotating gently in reverse */}
          <motion.path
            d={`M ${centerX - (arcRadius + 10)} ${centerY} A ${arcRadius + 10} ${arcRadius + 10} 0 0 1 ${centerX + (arcRadius + 10)} ${centerY}`}
            fill="none"
            stroke="#1E63D6"
            strokeOpacity={isAnyActive ? 0.32 : 0.16}
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeDasharray="2 11"
            animate={
              prefersReduced
                ? undefined
                : { strokeDashoffset: [0, 26] }
            }
            transition={{
              duration: isAnyActive ? 3.2 : 6.5,
              repeat: Infinity,
              ease: 'linear'
            }}
          />

          {/* Primary warm sunlight golden dashed halo arc with flowing march */}
          <motion.path
            d={`M ${centerX - arcRadius} ${centerY} A ${arcRadius} ${arcRadius} 0 0 1 ${centerX + arcRadius} ${centerY}`}
            fill="none"
            stroke="#FCE055"
            strokeWidth={isAnyActive ? '2.5' : '2.1'}
            strokeLinecap="round"
            strokeDasharray="5 8"
            initial={prefersReduced ? false : { opacity: 0, scale: 0.94 }}
            animate={
              prefersReduced
                ? { opacity: 1, scale: 1 }
                : {
                    opacity: 1,
                    scale: isAnyActive ? 1.018 : 1,
                    strokeDashoffset: [0, -26]
                  }
            }
            style={{ originX: `${centerX}px`, originY: `${centerY}px` }}
            transition={{
              opacity: { duration: 0.6, delay: 0.15 },
              scale: { duration: 0.35, ease: [0.34, 1.56, 0.64, 1] },
              strokeDashoffset: {
                duration: isAnyActive ? 1.9 : 4.2,
                repeat: Infinity,
                ease: 'linear'
              }
            }}
          />
        </svg>

        {/* Grounded tactile contact shadow beneath the IP */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[6px] left-1/2 -translate-x-1/2 rounded-full bg-[#0F172A] blur-[4px]"
          animate={
            prefersReduced
              ? {
                  width: isAnyActive ? 112 : 96,
                  height: 10,
                  opacity: isAnyActive ? 0.16 : 0.06
                }
              : {
                  width: isAnyActive ? 114 : [94, 88, 94],
                  height: isAnyActive ? 11 : 9,
                  opacity: isAnyActive ? 0.18 : [0.07, 0.05, 0.07]
                }
          }
          transition={
            isAnyActive || prefersReduced
              ? { duration: 0.32, ease: [0.22, 1, 0.36, 1] }
              : { duration: 4.2, repeat: Infinity, ease: 'easeInOut' }
          }
        />

        {/* Centered IP illustration resting cleanly beneath the halo arch */}
        <motion.button
          type="button"
          onClick={() => setCharacterActive((prev) => !prev)}
          onMouseEnter={() => setCharacterActive(true)}
          onMouseLeave={() => setCharacterActive(false)}
          onFocus={() => setCharacterActive(true)}
          onBlur={() => setCharacterActive(false)}
          aria-label="Toggle character pose"
          initial={prefersReduced ? false : { opacity: 0, y: 10, scale: 0.96 }}
          animate={
            prefersReduced
              ? { opacity: 1, y: 0, scale: 1 }
              : isAnyActive
                ? {
                    opacity: 1,
                    y: -6,
                    scale: characterActive ? 1.035 : 1.015,
                    rotate: leanRotate
                  }
                : {
                    opacity: 1,
                    y: [0, -2.8, 0],
                    scale: 1,
                    rotate: 0
                  }
          }
          whileTap={prefersReduced ? undefined : { scale: 0.95, y: 0 }}
          transition={
            isAnyActive || prefersReduced
              ? { duration: 0.38, ease: [0.34, 1.56, 0.64, 1] }
              : {
                  opacity: { duration: 0.45 },
                  y: { duration: 4.2, repeat: Infinity, ease: 'easeInOut' },
                  rotate: { duration: 0.35, ease: [0.22, 1, 0.36, 1] }
                }
          }
          className="relative z-10 flex items-end justify-center w-[184px] h-[184px] mb-2 bg-transparent cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1E63D6] rounded-2xl"
        >
          {/* Playful coral spark doodle when IP or a node is hovered */}
          <AnimatePresence>
            {isAnyActive && !prefersReduced && (
              <motion.svg
                key="ip-spark"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
                initial={{ opacity: 0, scale: 0.4, rotate: -20, y: 4 }}
                animate={{ opacity: 1, scale: 1, rotate: 0, y: 0 }}
                exit={{ opacity: 0, scale: 0.5, y: 2 }}
                transition={{ duration: 0.32, ease: [0.34, 1.56, 0.64, 1] }}
                className="pointer-events-none absolute -top-1 right-5 text-[#EF4E5E]"
              >
                <path
                  d="M8 1.5L9.3 6.2L14 7.5L9.3 8.8L8 13.5L6.7 8.8L2 7.5L6.7 6.2L8 1.5Z"
                  fill="currentColor"
                />
              </motion.svg>
            )}
          </AnimatePresence>

          {!imgFailed ? (
            <img
              src={characterActive ? cartonImg : ipImg}
              alt="Hand-drawn editorial IP character illustration"
              referrerPolicy="no-referrer"
              onError={() => setImgFailed(true)}
              style={{
                filter: isAnyActive
                  ? 'drop-shadow(0 12px 18px rgba(15, 23, 42, 0.14))'
                  : 'drop-shadow(0 2px 4px rgba(15, 23, 42, 0.04))',
                transition: 'filter 0.32s cubic-bezier(0.22, 1, 0.36, 1)'
              }}
              className="h-full w-full object-contain object-bottom mix-blend-multiply"
            />
          ) : (
            /* Clean editorial SVG outline fallback */
            <svg
              viewBox="0 0 160 160"
              className="h-36 w-36 text-[#0F172A]"
              fill="none"
              style={{
                filter: isAnyActive
                  ? 'drop-shadow(0 10px 16px rgba(15, 23, 42, 0.14))'
                  : 'none',
                transition: 'filter 0.3s ease'
              }}
              aria-label="Minimalist editorial engineer outline"
            >
              <circle
                cx="80"
                cy="58"
                r="22"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <circle cx="71" cy="56" r="5" stroke="currentColor" strokeWidth="1.4" />
              <circle cx="89" cy="56" r="5" stroke="currentColor" strokeWidth="1.4" />
              <line x1="76" y1="56" x2="84" y2="56" stroke="currentColor" strokeWidth="1.4" />
              <path
                d="M44 134C44 106 58 92 80 92C102 92 116 106 116 134"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              <path
                d="M98 104L112 94L106 110Z"
                fill="#EF4E5E"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </motion.button>

        {/* 3 clickable circular nodes along the golden upper arch */}
        {ARC_NODES.map((node, index) => {
          const angleDeg = archAnglesDeg[index] ?? -90;
          const rad = (angleDeg * Math.PI) / 180;
          const nx = centerX + arcRadius * Math.cos(rad);
          const ny = centerY + arcRadius * Math.sin(rad);
          const isHovered = hoveredId === node.id;

          return (
            <motion.div
              key={node.id}
              initial={prefersReduced ? false : { opacity: 0, scale: 0.7 }}
              animate={
                prefersReduced
                  ? { opacity: 1, scale: 1 }
                  : {
                      opacity: 1,
                      scale: 1,
                      y: isHovered ? 0 : [0, -2.5, 0]
                    }
              }
              transition={
                prefersReduced
                  ? { duration: 0.2 }
                  : {
                      opacity: { duration: 0.35, delay: 0.25 + index * 0.08 },
                      scale: {
                        type: 'spring',
                        stiffness: 340,
                        damping: 22,
                        delay: 0.25 + index * 0.08
                      },
                      y: isHovered
                        ? { duration: 0.2 }
                        : {
                            duration: 3.4,
                            delay: index * 0.7,
                            repeat: Infinity,
                            ease: 'easeInOut'
                          }
                    }
              }
              className="absolute z-20"
              style={{
                left: `${nx - 24}px`,
                top: `${ny - 24}px`
              }}
            >
              <motion.button
                type="button"
                onClick={() => onSelectNode(node)}
                onMouseEnter={() => setHoveredId(node.id)}
                onMouseLeave={() => setHoveredId(null)}
                onFocus={() => setHoveredId(node.id)}
                onBlur={() => setHoveredId(null)}
                whileHover={prefersReduced ? undefined : { scale: 1.14, y: -6 }}
                whileTap={prefersReduced ? undefined : { scale: 0.92 }}
                transition={{ duration: 0.38, ease: [0.34, 1.56, 0.64, 1] }}
                aria-label={`${node.label}: ${node.shortDesc}`}
                className={`relative flex h-12 w-12 items-center justify-center rounded-full border-2 transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#1E63D6] cursor-pointer ${
                  isHovered
                    ? 'bg-[#EDF4FF] border-[#1E63D6] text-[#1E63D6] shadow-[0_8px_18px_rgba(30,99,214,0.16)]'
                    : 'bg-[#FFFFFF] border-[#FCE055] text-[#0F172A] shadow-[0_4px_12px_rgba(15,23,42,0.06)]'
                }`}
              >
                <NodeMicroIcon id={node.id} isHovered={isHovered} />
              </motion.button>

              {/* Compact yellow pill tooltip centered below node (matching HTML .tip) */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    role="tooltip"
                    initial={
                      prefersReduced
                        ? { opacity: 0 }
                        : { opacity: 0, y: -3 }
                    }
                    animate={{ opacity: 1, y: 0 }}
                    exit={
                      prefersReduced
                        ? { opacity: 0 }
                        : { opacity: 0, y: -3 }
                    }
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className="pointer-events-none absolute top-[54px] left-1/2 -translate-x-1/2 z-30 whitespace-nowrap rounded-[4px] bg-[#FCE055] px-2 py-[2px] font-paper-mono text-[11px] font-semibold text-[#0F172A] shadow-[0_3px_8px_rgba(15,23,42,0.08)]"
                  >
                    {node.label}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
