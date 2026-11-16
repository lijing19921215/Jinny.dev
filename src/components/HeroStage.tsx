import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ARC_NODES, ArcNode } from '../data/portfolio';
import ipImg from '../assets/images/ip.png';
import arcWorkImg from '../assets/images/arc-work.jpg';
import arcMotionImg from '../assets/images/arc-motion.jpg';
import arcToolsImg from '../assets/images/arc-tools.jpg';

interface HeroStageProps {
  onSelectNode: (node: ArcNode) => void;
}

// Geometry, colors and motion values are ported verbatim from the reference
// ricoui-home-lite.html: ORBIT_RADIUS 190 / node 56 / star gold #f4d758.
const NODE_IMAGES = [arcWorkImg, arcMotionImg, arcToolsImg];
const NODE_PLACEMENTS = [
  { left: -190, top: 0, dur: '3.4s', delay: '0s' },
  { left: 0, top: -190, dur: '3.9s', delay: '.55s' },
  { left: 190, top: 0, dur: '4.4s', delay: '1.1s' }
];

export const HeroStage: React.FC<HeroStageProps> = ({ onSelectNode }) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  // Reference fit(): scale the sticker + orbit as one unit against the stage.
  // Desktop baseline: stage 717x478 -> k=1, bounded by 456px content height
  // and 470px width so narrow two-column layouts never overflow.
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

  return (
    <div className="relative flex items-center justify-center lg:justify-end">
      <figure className="ip-study w-full">
        <div ref={stageRef} className="ip-stage">
          {/* DesktopSticker — 280px paper-cutout IP, grounded at the bottom */}
          <div className="desktop-sticker">
            <motion.div
              className="sticker-drag"
              drag
              dragConstraints={stageRef}
              dragMomentum={false}
              dragElastic={0.08}
              whileDrag={{ scale: 1.03 }}
            >
              <img
                src={ipImg}
                alt="Hand-drawn strawberry-hood IP illustration (draggable)"
                draggable={false}
              />

              <div className="ip-orbit">
              <svg
                className="ip-arc"
                viewBox="0 0 380 190"
                width={380}
                height={190}
                style={{ left: -190, top: -190 }}
                aria-hidden="true"
              >
                <path d="M 0 190 A 190 190 0 0 1 380 190" />
              </svg>

              {ARC_NODES.map((node, index) => {
                const placement =
                  NODE_PLACEMENTS[index] ?? NODE_PLACEMENTS[0];
                const isHovered = hoveredId === node.id;

                return (
                  <button
                    key={node.id}
                    type="button"
                    className="ip-node focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#1E63D6]"
                    style={
                      {
                        left: `${placement.left}px`,
                        top: `${placement.top}px`,
                        '--fdur': placement.dur,
                        '--fdelay': placement.delay
                      } as React.CSSProperties
                    }
                    onClick={() => onSelectNode(node)}
                    onMouseEnter={() => setHoveredId(node.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onFocus={() => setHoveredId(node.id)}
                    onBlur={() => setHoveredId(null)}
                    aria-label={`${node.label}: ${node.shortDesc}`}
                    title={`${node.label}: ${node.shortDesc}`}
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
                              : { opacity: 0, y: -3 }
                          }
                          animate={{ opacity: 1, y: 0 }}
                          exit={
                            prefersReduced
                              ? { opacity: 0 }
                              : { opacity: 0, y: -3 }
                          }
                          transition={{
                            duration: 0.25,
                            ease: [0.22, 1, 0.36, 1]
                          }}
                          className="pointer-events-none absolute top-[62px] left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded-[4px] bg-[#FCE055] px-2 py-[2px] font-paper-mono text-[11px] font-semibold text-[#0F172A] shadow-[0_3px_8px_rgba(15,23,42,0.08)]"
                        >
                          {node.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                );
              })}
              </div>
            </motion.div>
          </div>
        </div>
      </figure>
    </div>
  );
};
