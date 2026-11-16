import React, { useState } from 'react';
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Transition,
} from 'motion/react';
import { EXPERIENCES } from '../data/portfolio';
import { AnimatedClockIcon, AnimatedStaggerWord } from './AnimatedIcons';

export const ExperienceSection: React.FC = () => {
  const [clockHovered, setClockHovered] = useState(false);
  const [clockTriggerCount, setClockTriggerCount] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const reduceMotion = useReducedMotion();

  // One phase-locked spring drives BOTH the slide (translateY) and the
  // squish & stretch (bounding-box height) of the shared pill, so the two
  // channels share the exact same natural frequency and damping ratio.
  const pillTransition: Transition = reduceMotion
    ? { duration: 0 }
    : { type: 'spring', stiffness: 205, damping: 28 };

  const toggleExpanded = (index: number) =>
    setExpanded((current) => (current === index ? null : index));

  return (
    <div id="experience" className="py-12 sm:py-16">
      <div
        className="inline-flex items-center gap-2.5 cursor-default mb-7"
        onMouseEnter={() => {
          setClockHovered(true);
          setClockTriggerCount((c) => c + 1);
        }}
        onMouseLeave={() => setClockHovered(false)}
      >
        <AnimatedClockIcon
          active={clockHovered}
          size={19}
          className="text-[#1E63D6]"
        />
        <h2 className="font-paper-mono text-[17px] font-normal text-[#786858]">
          <AnimatedStaggerWord text="experience" triggerCount={clockTriggerCount} />
        </h2>
      </div>

      <div
        className="flex flex-col gap-1"
        onMouseLeave={() => setHovered(null)}
      >
        {EXPERIENCES.map((exp, index) => {
          const isExpanded = expanded === index;
          return (
            <motion.div
              key={exp.id}
              layout={!reduceMotion}
              transition={pillTransition}
              role="button"
              tabIndex={0}
              aria-expanded={isExpanded}
              onClick={() => toggleExpanded(index)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  toggleExpanded(index);
                }
              }}
              onMouseEnter={() => setHovered(index)}
              onFocus={() => setHovered(index)}
              className="group relative flex -mx-3.5 cursor-pointer flex-col justify-between gap-2 rounded-2xl px-3.5 py-5 outline-none focus-visible:ring-2 focus-visible:ring-[#1E63D6]/40 sm:flex-row sm:items-baseline sm:gap-8"
            >
              {/* Magnetic pill — a single shared node across the whole list.
                  `layout` + `layoutId` let Framer Motion FLIP both translateY
                  and the bounding-box height; rounded-2xl is scale-corrected
                  so the 16px corners stay circular while the box squishes.
                  No inline height is ever written on this node. */}
              <AnimatePresence>
                {hovered === index && (
                  <motion.div
                    key="pill-layer"
                    className="pointer-events-none absolute inset-0 z-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: reduceMotion ? 0 : 0.2 }}
                  >
                    <motion.div
                      layout={!reduceMotion}
                      layoutId="hover-pill"
                      className="absolute inset-0 rounded-2xl bg-[#EDF4FF]/60"
                      transition={pillTransition}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative z-10 min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <h3 className="font-display text-[16.5px] font-semibold tracking-tight text-[#0F172A]">
                    {exp.role}
                  </h3>
                  <span aria-hidden="true" className="text-[#786858]">
                    ·
                  </span>
                  <span className="font-paper-mono text-[13px] text-[#786858]">
                    {exp.company}
                  </span>
                </div>
                <p className="mt-1 font-display text-[14.5px] leading-relaxed text-[#374151]">
                  {exp.summaryBefore}
                  <mark className="rounded-[3px] bg-[#FCE055]/85 px-1 py-0.5 font-medium text-[#0F172A]">
                    {exp.highlight}
                  </mark>
                  {exp.summaryAfter}
                </p>

                {/* Click-to-expand: a real, varying height change built only
                    from the existing fields, so the pill has to re-solve its
                    bounding box. */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      key="detail"
                      className="overflow-hidden"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={
                        reduceMotion
                          ? { duration: 0 }
                          : { duration: 0.28, ease: [0.22, 1, 0.36, 1] }
                      }
                    >
                      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 border-t border-[#1E63D6]/10 pt-3 text-[13px]">
                        <dt className="font-paper-mono text-[#786858]">focus</dt>
                        <dd className="font-display text-[#374151]">{exp.highlight}</dd>
                        <dt className="font-paper-mono text-[#786858]">impact</dt>
                        <dd className="font-display text-[#374151]">
                          {`${exp.summaryBefore}${exp.summaryAfter}`.trim()}
                        </dd>
                        <dt className="font-paper-mono text-[#786858]">tenure</dt>
                        <dd className="font-display text-[#374151]">
                          {exp.period} · {exp.company}
                        </dd>
                      </dl>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="exp-period relative z-10 shrink-0 whitespace-nowrap font-paper-mono text-[13px] font-medium tabular-nums text-[#1E63D6] transition-transform duration-300 group-hover:-translate-x-[3px] sm:text-right">
                {exp.period}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
