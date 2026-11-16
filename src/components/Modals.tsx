import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArcNode, EXPERIENCES, PortfolioProject } from '../data/portfolio';
import {
  AnimatedArrowUpRightIcon,
  AnimatedCloseIcon,
  AnimatedPrinterIcon
} from './AnimatedIcons';

interface ModalShellProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

const ModalShell: React.FC<ModalShellProps> = ({
  open,
  onClose,
  title,
  subtitle,
  children
}) => {
  const prefersReduced = useReducedMotion();
  const [closeHovered, setCloseHovered] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0F172A]/25 backdrop-blur-[2px]"
          />

          <motion.div
            initial={
              prefersReduced
                ? { opacity: 0 }
                : { opacity: 0, y: 14, scale: 0.98 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              prefersReduced
                ? { opacity: 0 }
                : { opacity: 0, y: 10, scale: 0.98 }
            }
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-2xl max-h-[86vh] overflow-y-auto rounded-2xl bg-[#FEFCF8] border border-[#E5E7EB] shadow-[0_20px_50px_rgba(15,23,42,0.14)] p-6 sm:p-8"
          >
            <div className="flex items-start justify-between gap-4 border-b border-[#E5E7EB] pb-4 mb-5">
              <div>
                <h2 className="font-display text-[21px] font-semibold text-[#0F172A] tracking-tight">
                  {title}
                </h2>
                {subtitle && (
                  <p className="font-paper-mono text-[12.5px] text-[#786858] mt-1">
                    {subtitle}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                onMouseEnter={() => setCloseHovered(true)}
                onMouseLeave={() => setCloseHovered(false)}
                aria-label="Close dialog"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E7EB] bg-[#FFFFFF] text-[#374151] hover:text-[#0F172A] hover:border-[#0F172A]/30 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E63D6]"
              >
                <AnimatedCloseIcon active={closeHovered} size={16} />
              </button>
            </div>

            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export const ProjectModal: React.FC<{
  project: PortfolioProject | null;
  onClose: () => void;
}> = ({ project, onClose }) => {
  const [linkHovered, setLinkHovered] = useState(false);

  return (
    <ModalShell
      open={Boolean(project)}
      onClose={onClose}
      title={project?.title ?? ''}
      subtitle={
        project
          ? `${project.caseStudy.role} · ${project.caseStudy.timeline}`
          : undefined
      }
    >
      {project && (
        <div className="space-y-6">
          <p className="font-display text-[15.5px] text-[#374151] leading-relaxed">
            {project.caseStudy.summary}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {project.miniCards.map((card) => (
              <div
                key={card.label}
                className="rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] p-3"
              >
                <p className="font-paper-mono text-[10.5px] text-[#786858]">
                  {card.label}
                </p>
                <p className="font-display text-[13px] font-semibold text-[#0F172A] mt-1 leading-snug">
                  {card.headline}
                </p>
              </div>
            ))}
          </div>

          <div>
            <h3 className="font-paper-mono text-[12px] text-[#786858] mb-3">
              Engineering notes
            </h3>
            <ul className="space-y-2.5">
              {project.caseStudy.engineeringNotes.map((note, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 font-display text-[14.5px] text-[#374151] leading-relaxed"
                >
                  <span
                    aria-hidden="true"
                    className="mt-2 h-1.5 w-1.5 rounded-full bg-[#1E63D6] shrink-0"
                  />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#E5E7EB]">
            <a
              href={project.caseStudy.liveUrl}
              target="_blank"
              rel="noreferrer"
              onMouseEnter={() => setLinkHovered(true)}
              onMouseLeave={() => setLinkHovered(false)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#1E63D6] px-4 py-2 font-paper-mono text-[12.5px] font-medium text-white hover:bg-[#1954B8] transition-colors"
            >
              <span>Inspect repository</span>
              <AnimatedArrowUpRightIcon active={linkHovered} size={14} />
            </a>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center rounded-lg border border-[#E5E7EB] bg-[#FFFFFF] px-4 py-2 font-paper-mono text-[12.5px] text-[#374151] hover:text-[#0F172A] transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </ModalShell>
  );
};

/* Interactive spring dot sketch inside Creative Coding modal */
const SpringPlayground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const targetRef = useRef({ x: 160, y: 54 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = 320;
    const h = 108;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    let pos = { x: 160, y: 54 };
    let vel = { x: 0, y: 0 };
    const trail: { x: number; y: number }[] = [];
    let raf = 0;

    const tick = () => {
      const stiffness = 0.12;
      const damping = 0.78;
      const fx = (targetRef.current.x - pos.x) * stiffness;
      const fy = (targetRef.current.y - pos.y) * stiffness;
      vel.x = (vel.x + fx) * damping;
      vel.y = (vel.y + fy) * damping;
      pos.x += vel.x;
      pos.y += vel.y;

      trail.push({ x: pos.x, y: pos.y });
      if (trail.length > 22) trail.shift();

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // Subtle guide grid
      ctx.strokeStyle = '#E5E7EB';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();

      // Elastic trail
      if (trail.length > 1) {
        ctx.beginPath();
        ctx.moveTo(trail[0].x, trail[0].y);
        for (let i = 1; i < trail.length; i++) {
          ctx.lineTo(trail[i].x, trail[i].y);
        }
        ctx.strokeStyle = '#1E63D6';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      // Target anchor
      ctx.fillStyle = '#FCE055';
      ctx.beginPath();
      ctx.arc(targetRef.current.x, targetRef.current.y, 4, 0, Math.PI * 2);
      ctx.fill();

      // Spring mass
      ctx.fillStyle = '#EF4E5E';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 6.5, 0, Math.PI * 2);
      ctx.fill();

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <p className="font-paper-mono text-[11.5px] text-[#0F172A] font-medium">
          Interactive spring solver
        </p>
        <p className="font-paper-mono text-[11px] text-[#786858] mt-0.5">
          Move pointer over the box to test damping.
        </p>
      </div>
      <canvas
        ref={canvasRef}
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          targetRef.current = {
            x: Math.max(12, Math.min(308, e.clientX - r.left)),
            y: Math.max(12, Math.min(96, e.clientY - r.top))
          };
        }}
        className="rounded-lg bg-[#FEFCF8] border border-[#E5E7EB] cursor-crosshair shrink-0"
      />
    </div>
  );
};

export const NodeModal: React.FC<{
  node: ArcNode | null;
  onClose: () => void;
}> = ({ node, onClose }) => {
  return (
    <ModalShell
      open={Boolean(node)}
      onClose={onClose}
      title={node?.details.title ?? ''}
      subtitle={node?.details.subtitle}
    >
      {node && (
        <div className="space-y-5">
          <ul className="space-y-2.5">
            {node.details.points.map((pt, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 font-display text-[14.5px] text-[#374151] leading-relaxed"
              >
                <span
                  aria-hidden="true"
                  className="mt-2 h-1.5 w-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: node.accentColor }}
                />
                <span>{pt}</span>
              </li>
            ))}
          </ul>

          {node.id === 'creative-coding' && <SpringPlayground />}

          <pre className="rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] p-4 font-paper-mono text-[12px] text-[#0F172A] overflow-x-auto leading-relaxed">
            <code>{node.details.codeSnippet}</code>
          </pre>
        </div>
      )}
    </ModalShell>
  );
};

export const ResumeModal: React.FC<{
  open: boolean;
  onClose: () => void;
}> = ({ open, onClose }) => {
  const [printHovered, setPrintHovered] = useState(false);

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Alex — Frontend & Design Engineer"
      subtitle="San Francisco · alex@alex.dev · github.com/alex-dev"
    >
      <div className="space-y-6">
        <p className="font-display text-[15px] text-[#374151] leading-relaxed">
          Frontend engineer specializing in tactile web interfaces, 60fps canvas
          simulations, and accessible editorial design systems. Focused on
          bridging visual clarity with resilient TypeScript engineering.
        </p>

        <div>
          <h3 className="font-paper-mono text-[12px] text-[#786858] mb-3">
            Experience
          </h3>
          <div className="space-y-3.5">
            {EXPERIENCES.map((exp) => (
              <div
                key={exp.id}
                className="rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] p-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1.5"
              >
                <div>
                  <p className="font-display text-[15px] font-semibold text-[#0F172A]">
                    {exp.role} ·{' '}
                    <span className="font-normal text-[#786858]">
                      {exp.company}
                    </span>
                  </p>
                  <p className="font-display text-[13.5px] text-[#374151] mt-1">
                    {exp.summaryBefore}
                    {exp.highlight}
                    {exp.summaryAfter}
                  </p>
                </div>
                <span className="font-paper-mono tabular-nums text-[12px] text-[#1E63D6] whitespace-nowrap shrink-0">
                  {exp.period}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] p-4">
            <h4 className="font-paper-mono text-[12px] text-[#786858] mb-2">
              Core Craft
            </h4>
            <p className="font-display text-[13.5px] text-[#374151] leading-relaxed">
              React 19, TypeScript, Motion, Canvas 2D / WebGL2, SVG Kinematics,
              Tailwind CSS, Design Tokens, Accessibility (WCAG AA)
            </p>
          </div>
          <div className="rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] p-4">
            <h4 className="font-paper-mono text-[12px] text-[#786858] mb-2">
              Education
            </h4>
            <p className="font-display text-[13.5px] text-[#0F172A] font-medium">
              B.S. Computer Science &amp; Human-Computer Interaction
            </p>
            <p className="font-paper-mono text-[12px] text-[#786858] mt-1">
              Focus in Graphics &amp; Typography
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#E5E7EB]">
          <button
            type="button"
            onClick={() => window.print()}
            onMouseEnter={() => setPrintHovered(true)}
            onMouseLeave={() => setPrintHovered(false)}
            className="inline-flex items-center gap-2 rounded-lg bg-[#0F172A] px-4 py-2 font-paper-mono text-[12.5px] text-white hover:bg-[#1E63D6] transition-colors cursor-pointer"
          >
            <AnimatedPrinterIcon active={printHovered} size={14} />
            <span>Print / Save PDF</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#E5E7EB] bg-[#FFFFFF] px-4 py-2 font-paper-mono text-[12.5px] text-[#374151] hover:text-[#0F172A] transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </ModalShell>
  );
};
