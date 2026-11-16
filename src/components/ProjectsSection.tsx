import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { PortfolioProject, PROJECTS } from '../data/portfolio';
import {
  AnimatedArrowUpRightIcon,
  AnimatedGlyphIcon,
  AnimatedGridNodesIcon,
  AnimatedLayersIcon,
  AnimatedLayoutGridIcon,
  AnimatedListIcon,
  AnimatedSketchDocIcon,
  AnimatedSplineIcon,
  AnimatedStaggerWord
} from './AnimatedIcons';

interface ProjectsSectionProps {
  onSelectProject: (project: PortfolioProject) => void;
}

const ProjectSquircleIcon: React.FC<{
  kind: PortfolioProject['iconKind'];
  bg: string;
  color?: string;
  active?: boolean;
  size?: 'sm' | 'lg';
}> = ({ kind, bg, color, active = false, size = 'sm' }) => {
  const prefersReduced = useReducedMotion();
  const dim =
    size === 'sm'
      ? 'h-[46px] w-[46px] rounded-[13px]'
      : 'h-[44px] w-[44px] rounded-[12px]';
  const svgDim = size === 'sm' ? 22 : 22;

  const listToneMap: Record<
    PortfolioProject['iconKind'],
    { bg: string; fg: string }
  > = {
    canvas: { bg: '#EDF4FF', fg: '#1E63D6' },
    tokens: { bg: '#FFF8D6', fg: '#0F172A' },
    glyph: { bg: '#FFF0F2', fg: '#EF4E5E' },
    grid: { bg: '#EDF4FF', fg: '#1E63D6' }
  };

  const resolvedBg = size === 'sm' ? listToneMap[kind].bg : bg;
  const resolvedColor = color ?? listToneMap[kind].fg;

  return (
    <motion.div
      className={`${dim} shrink-0 flex items-center justify-center shadow-[0_2px_8px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.7)]`}
      style={{ backgroundColor: resolvedBg, color: resolvedColor }}
      animate={
        active && !prefersReduced
          ? size === 'sm'
            ? { scale: 1.07, rotate: -4 }
            : { scale: 1.12, rotate: -6 }
          : { scale: 1, rotate: 0 }
      }
      transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
      aria-hidden="true"
    >
      {kind === 'canvas' && <AnimatedSplineIcon active={active} size={svgDim} />}
      {kind === 'tokens' && (
        <AnimatedLayersIcon
          active={active}
          size={svgDim}
          backFill={resolvedBg}
        />
      )}
      {kind === 'glyph' && <AnimatedGlyphIcon active={active} size={svgDim} />}
      {kind === 'grid' && <AnimatedGridNodesIcon active={active} size={svgDim} />}
    </motion.div>
  );
};

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  onSelectProject
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'showcase'>('list');
  const [hoveredProjectId, setHoveredProjectId] = useState<string | null>(null);
  const [docHovered, setDocHovered] = useState(false);
  const [docTriggerCount, setDocTriggerCount] = useState(0);
  const [listHovered, setListHovered] = useState(false);
  const [gridHovered, setGridHovered] = useState(false);
  const [stageHeight, setStageHeight] = useState<number | 'auto'>('auto');
  const [isSwitching, setIsSwitching] = useState(false);
  const stageOuterRef = useRef<HTMLDivElement>(null);
  const switchTimerRef = useRef<number | null>(null);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    return () => {
      if (switchTimerRef.current) {
        window.clearTimeout(switchTimerRef.current);
      }
    };
  }, []);

  const handleViewChange = (nextMode: 'list' | 'showcase') => {
    if (nextMode === viewMode) return;
    setHoveredProjectId(null);

    if (prefersReduced || !stageOuterRef.current) {
      setViewMode(nextMode);
      return;
    }

    if (switchTimerRef.current) {
      window.clearTimeout(switchTimerRef.current);
    }

    const currentHeight = stageOuterRef.current.getBoundingClientRect().height;
    setIsSwitching(true);
    setStageHeight(currentHeight);
    setViewMode(nextMode);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!stageOuterRef.current) return;
        const incoming = stageOuterRef.current.querySelector<HTMLElement>(
          `[data-view="${nextMode}"]`
        );
        if (incoming) {
          setStageHeight(incoming.offsetHeight);
        }
      });
    });

    switchTimerRef.current = window.setTimeout(() => {
      setStageHeight('auto');
      setIsSwitching(false);
      switchTimerRef.current = null;
    }, 450);
  };

  const fanCardStyles = [
    {
      y: 6,
      rotate: -5.5,
      bg: '#EDF4FF',
      border: '#D2E3FC'
    },
    {
      y: 0,
      rotate: -1.5,
      bg: '#FFFFFF',
      border: '#E5E7EB'
    },
    {
      y: 2,
      rotate: 2.5,
      bg: '#FFFCF0',
      border: '#F7E89C'
    },
    {
      y: 8,
      rotate: 5.5,
      bg: '#FFF5F6',
      border: '#FAD3D8'
    }
  ];

  return (
    <div id="projects" className="py-12 sm:py-16">
      {/* Header row */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div
          className="inline-flex items-center gap-2.5 cursor-default"
          onMouseEnter={() => {
            setDocHovered(true);
            setDocTriggerCount((c) => c + 1);
          }}
          onMouseLeave={() => setDocHovered(false)}
        >
          <AnimatedSketchDocIcon
            active={docHovered}
            size={19}
            className="text-[#1E63D6]"
          />
          <h2 className="font-paper-mono text-[17px] font-normal text-[#786858]">
            <AnimatedStaggerWord text="projects" triggerCount={docTriggerCount} />
          </h2>
        </div>

        {/* 2 animated view-toggle buttons: List (☰) & Showcase (⊞) */}
        <div
          className="inline-flex items-center gap-1"
          role="group"
          aria-label="Projects view mode"
        >
          <button
            type="button"
            onClick={() => handleViewChange('list')}
            onMouseEnter={() => setListHovered(true)}
            onMouseLeave={() => setListHovered(false)}
            aria-pressed={viewMode === 'list'}
            aria-label="List view"
            className={`relative flex h-[32px] w-[32px] items-center justify-center rounded-[8px] bg-transparent transition-all duration-200 hover:-translate-y-[1px] active:scale-[0.88] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E63D6] ${
              viewMode === 'list'
                ? 'text-[#0F172A]'
                : 'text-[#9CA3AF] hover:text-[#0F172A]'
            }`}
          >
            <AnimatedListIcon
              active={viewMode === 'list'}
              hovered={listHovered}
              size={17}
            />
          </button>

          <button
            type="button"
            onClick={() => handleViewChange('showcase')}
            onMouseEnter={() => setGridHovered(true)}
            onMouseLeave={() => setGridHovered(false)}
            aria-pressed={viewMode === 'showcase'}
            aria-label="Showcase view"
            className={`relative flex h-[32px] w-[32px] items-center justify-center rounded-[8px] bg-transparent transition-all duration-200 hover:-translate-y-[1px] active:scale-[0.88] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E63D6] ${
              viewMode === 'showcase'
                ? 'text-[#0F172A]'
                : 'text-[#9CA3AF] hover:text-[#0F172A]'
            }`}
          >
            <AnimatedLayoutGridIcon
              active={viewMode === 'showcase'}
              hovered={gridHovered}
              size={17}
            />
          </button>
        </div>
      </div>

      {/* View Switcher Content: zero-blank parallel crossfade + smooth height interpolation */}
      <div
        ref={stageOuterRef}
        className="relative"
        style={{
          height: stageHeight === 'auto' ? 'auto' : `${stageHeight}px`,
          overflow: isSwitching ? 'hidden' : 'visible',
          transition:
            prefersReduced || stageHeight === 'auto'
              ? 'none'
              : 'height 0.42s cubic-bezier(0.22, 1, 0.36, 1)'
        }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {viewMode === 'list' ? (
            <motion.div
              key="list-view"
              data-view="list"
              initial={prefersReduced ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={
                prefersReduced
                  ? undefined
                  : { opacity: 0, y: -6, pointerEvents: 'none' }
              }
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col gap-1 w-full"
            >
            {PROJECTS.map((project) => {
              const isHovered = hoveredProjectId === project.id;

              return (
                <div
                  key={project.id}
                  onMouseEnter={() => setHoveredProjectId(project.id)}
                  onMouseLeave={() => setHoveredProjectId(null)}
                  className="relative"
                >
                  <button
                    type="button"
                    onClick={() => onSelectProject(project)}
                    onFocus={() => setHoveredProjectId(project.id)}
                    onBlur={() => setHoveredProjectId(null)}
                    className={`w-full text-left rounded-2xl px-4 py-4 sm:px-5 sm:py-4.5 transition-colors duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E63D6] ${
                      isHovered ? 'bg-[#EDF4FF]/70' : 'bg-transparent hover:bg-[#F6F5F0]/75'
                    }`}
                  >
                    <div className="flex items-start sm:items-center justify-between gap-4">
                      <div className="flex items-start sm:items-center gap-4 min-w-0">
                        <ProjectSquircleIcon
                          kind={project.iconKind}
                          bg={project.iconBg}
                          active={isHovered}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-display text-[17px] font-semibold text-[#0F172A] tracking-tight truncate">
                              {project.title}
                            </h3>
                            <motion.span
                              aria-hidden="true"
                              initial={false}
                              animate={{
                                opacity: isHovered ? 1 : 0,
                                x: isHovered ? 0 : -5,
                                y: isHovered ? 0 : 4
                              }}
                              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                              className="inline-flex text-[#1E63D6]"
                            >
                              <AnimatedArrowUpRightIcon active={isHovered} size={15} />
                            </motion.span>
                          </div>
                          <p className="font-display text-[14.5px] text-[#374151] leading-snug mt-0.5 line-clamp-1">
                            {project.oneLiner}
                          </p>
                        </div>
                      </div>

                      <div className="font-paper-mono tabular-nums text-[12.5px] text-[#786858] whitespace-nowrap shrink-0 pt-1 sm:pt-0">
                        {project.metric}
                      </div>
                    </div>

                    {/* Signature Hover Effect: silky smooth max-height glide + 4 fanned cards + CSS mask-image */}
                    <div
                      aria-hidden={!isHovered}
                      className="hidden sm:block overflow-hidden pointer-events-none"
                      style={{
                        maxHeight: isHovered ? '128px' : '0px',
                        opacity: isHovered ? 1 : 0,
                        marginTop: isHovered ? '18px' : '0px',
                        transition: prefersReduced
                          ? 'none'
                          : 'max-height 0.46s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.32s ease, margin-top 0.38s cubic-bezier(0.22, 1, 0.36, 1)',
                        maskImage:
                          'linear-gradient(to bottom, #000 58%, transparent 100%)',
                        WebkitMaskImage:
                          'linear-gradient(to bottom, #000 58%, transparent 100%)'
                      }}
                    >
                      <div className="flex justify-center items-end h-[122px] pt-3.5 px-2">
                        {project.miniCards.map((card, cIdx) => {
                          const styleCfg = fanCardStyles[cIdx] ?? fanCardStyles[1];
                          return (
                            <div
                              key={card.label}
                              className={`relative w-[178px] h-[106px] shrink-0 rounded-[10px] border p-3 shadow-[0_8px_20px_rgba(15,23,42,0.08)] flex flex-col justify-start gap-1 ${
                                cIdx > 0 ? '-ml-4' : ''
                              }`}
                              style={{
                                zIndex: 10 + cIdx,
                                backgroundColor: styleCfg.bg,
                                borderColor: styleCfg.border,
                                transform: prefersReduced
                                  ? 'translateY(0px) rotate(0deg)'
                                  : isHovered
                                    ? `translateY(${styleCfg.y}px) rotate(${styleCfg.rotate}deg)`
                                    : 'translateY(22px) rotate(0deg)',
                                transition: prefersReduced
                                  ? 'none'
                                  : 'transform 0.48s cubic-bezier(0.34, 1.56, 0.64, 1)'
                              }}
                            >
                              <p
                                className="font-paper-mono text-[10.5px] font-bold tracking-wide text-[#0F172A]"
                                style={
                                  card.accent ? { color: card.accent } : undefined
                                }
                              >
                                {card.label}
                              </p>
                              <p className="font-display text-[12.5px] font-semibold text-[#0F172A] leading-tight line-clamp-1">
                                {card.headline}
                              </p>
                              <p className="font-paper-mono text-[10.5px] text-[#786858] leading-[1.4] line-clamp-2">
                                {card.detail}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </button>
                </div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            key="showcase-view"
            data-view="showcase"
            initial={prefersReduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={
              prefersReduced
                ? undefined
                : { opacity: 0, y: -6, pointerEvents: 'none' }
            }
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-12 w-full"
          >
            {PROJECTS.map((project, idx) => {
              const isCardHovered = hoveredProjectId === project.id;
              const bannerGradient =
                project.bannerBg === '#EDF4FF'
                  ? 'linear-gradient(180deg, #DCEAFF 0%, #EDF4FF 100%)'
                  : project.bannerBg === '#FEF8DC'
                    ? 'linear-gradient(180deg, #FBF0C9 0%, #FEF8DC 100%)'
                    : 'linear-gradient(180deg, #FDE2E6 0%, #FFF2F4 100%)';

              return (
                <motion.article
                  key={project.id}
                  initial={
                    prefersReduced
                      ? false
                      : idx === 0
                        ? { opacity: 0, y: 10 }
                        : { opacity: 0, y: 16, filter: 'blur(3px)' }
                  }
                  animate={
                    idx === 0
                      ? { opacity: 1, y: 0 }
                      : undefined
                  }
                  whileInView={
                    idx > 0
                      ? { opacity: 1, y: 0, filter: 'blur(0px)' }
                      : undefined
                  }
                  viewport={idx > 0 ? { once: true, amount: 0.08 } : undefined}
                  transition={{
                    duration: idx === 0 ? 0.32 : 0.48,
                    delay: prefersReduced ? 0 : idx === 1 ? 0.05 : 0,
                    ease: [0.22, 1, 0.36, 1]
                  }}
                >
                  <button
                    type="button"
                    onClick={() => onSelectProject(project)}
                    onMouseEnter={() => setHoveredProjectId(project.id)}
                    onMouseLeave={() => setHoveredProjectId(null)}
                    onFocus={() => setHoveredProjectId(project.id)}
                    onBlur={() => setHoveredProjectId(null)}
                    className="group w-full text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1E63D6] rounded-2xl"
                  >
                    {/* Title row above banner (matches nexvyn.dev / screenshot) */}
                    <div className="flex items-baseline justify-between gap-4 mb-3">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-display text-[19px] font-semibold text-[#0F172A] tracking-tight">
                          {project.title}
                        </h3>
                        <motion.span
                          aria-hidden="true"
                          initial={false}
                          animate={{
                            opacity: isCardHovered ? 1 : 0,
                            x: isCardHovered ? 0 : -5,
                            y: isCardHovered ? 0 : 4
                          }}
                          transition={{
                            duration: 0.22,
                            ease: [0.22, 1, 0.36, 1]
                          }}
                          className="inline-flex text-[#1E63D6]"
                        >
                          <AnimatedArrowUpRightIcon
                            active={isCardHovered}
                            size={16}
                          />
                        </motion.span>
                      </div>
                      <span className="font-paper-mono tabular-nums text-[12.5px] text-[#786858]">
                        {project.metric}
                      </span>
                    </div>

                    {/* Wide soft-tinted showcase banner with centered logo + peeking UI window */}
                    <motion.div
                      animate={
                        isCardHovered && !prefersReduced
                          ? { y: -2 }
                          : { y: 0 }
                      }
                      transition={{
                        duration: 0.38,
                        ease: [0.22, 1, 0.36, 1]
                      }}
                      className={`relative flex flex-col items-center justify-between overflow-hidden rounded-2xl border border-[#0F172A]/[0.06] h-[296px] sm:h-[336px] px-6 sm:px-10 transition-shadow duration-300 ${
                        isCardHovered
                          ? 'shadow-[0_14px_34px_rgba(15,23,42,0.06)]'
                          : 'shadow-none'
                      }`}
                      style={{ background: bannerGradient }}
                    >
                      {/* Centered floating logo emblem in open tinted air */}
                      <div className="flex-1 flex items-center justify-center w-full">
                        <ProjectSquircleIcon
                          kind={project.iconKind}
                          bg={
                            project.bannerBg === '#EDF4FF'
                              ? '#1E63D6'
                              : project.bannerBg === '#FEF8DC'
                                ? '#0F172A'
                                : '#EF4E5E'
                          }
                          color={
                            project.bannerBg === '#FEF8DC'
                              ? '#FCE055'
                              : '#FFFFFF'
                          }
                          active={isCardHovered}
                          size="lg"
                        />
                      </div>

                      {/* Clean white UI preview window peeking up from the bottom */}
                      <motion.div
                        animate={
                          isCardHovered && !prefersReduced
                            ? { y: -10 }
                            : { y: 0 }
                        }
                        transition={{
                          duration: 0.45,
                          ease: [0.22, 1, 0.36, 1]
                        }}
                        className="w-full max-w-[760px] h-[176px] sm:h-[196px] -mb-5 rounded-t-[14px] bg-[#FFFFFF] border border-b-0 border-[#0F172A]/[0.08] px-5 sm:px-6 pt-4 pb-8 shadow-[0_10px_30px_rgba(15,23,42,0.07)]"
                      >
                        <div className="flex items-center justify-between border-b border-[#E5E7EB]/80 pb-3 mb-4">
                          <span className="font-display text-[13.5px] font-semibold text-[#0F172A] truncate">
                            {project.uiWindow.headerLabel}
                          </span>
                          <span className="font-paper-mono tabular-nums text-[11.5px] font-medium text-[#1E63D6] shrink-0">
                            {project.uiWindow.primaryMetric}
                          </span>
                        </div>

                        <div className="space-y-2.5">
                          {project.uiWindow.rows.map((row) => (
                            <div
                              key={row.label}
                              className="flex items-center justify-between text-[13px]"
                            >
                              <span className="font-display text-[#374151]">
                                {row.label}
                              </span>
                              <span
                                className={`font-paper-mono tabular-nums text-[12px] font-medium ${
                                  row.tone === 'blue'
                                    ? 'text-[#1E63D6]'
                                    : row.tone === 'red'
                                      ? 'text-[#EF4E5E]'
                                      : row.tone === 'yellow'
                                        ? 'text-[#0F172A] bg-[#FCE055]/65 px-1.5 py-0.5 rounded'
                                        : 'text-[#0F172A]'
                                }`}
                              >
                                {row.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    </motion.div>

                    {/* Clean 1-line description below banner */}
                    <p className="font-display text-[15px] text-[#786858] leading-relaxed mt-3.5">
                      {project.oneLiner}
                    </p>
                  </button>
                </motion.article>
              );
            })}
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </div>
  );
};
