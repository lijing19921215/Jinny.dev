import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

export interface AnimatedIconProps {
  active?: boolean;
  size?: number;
  className?: string;
}

const BOUNCE_EASE: [number, number, number, number] = [0.34, 1.56, 0.64, 1];
const SPRING_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/**
 * Monochrome animated icon library calibrated to the Warm Editorial Triad
 * spring & bounce motion curves (`--bounce` & `--spring`).
 */

export const AnimatedFileFoldIcon: React.FC<AnimatedIconProps> = ({
  active = false,
  size = 16,
  className = ''
}) => {
  const prefersReduced = useReducedMotion();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`overflow-visible ${className}`}
      aria-hidden="true"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <motion.polyline
        points="14 2 14 8 20 8"
        animate={
          active && !prefersReduced
            ? { scale: 1.28, x: -1, y: 1 }
            : { scale: 1, x: 0, y: 0 }
        }
        style={{ originX: '14px', originY: '4px' }}
        transition={{ duration: 0.35, ease: BOUNCE_EASE }}
      />
      <motion.line
        x1="8"
        y1="13"
        x2="16"
        y2="13"
        animate={active && !prefersReduced ? { x: 1.5 } : { x: 0 }}
        transition={{ duration: 0.3, ease: SPRING_EASE }}
      />
      <motion.line
        x1="8"
        y1="17"
        x2="13"
        y2="17"
        animate={active && !prefersReduced ? { x: -1 } : { x: 0 }}
        transition={{ duration: 0.3, ease: SPRING_EASE }}
      />
    </svg>
  );
};

export const AnimatedArrowUpRightIcon: React.FC<AnimatedIconProps> = ({
  active = false,
  size = 15,
  className = ''
}) => {
  const prefersReduced = useReducedMotion();

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`overflow-visible ${className}`}
      aria-hidden="true"
      animate={
        active && !prefersReduced ? { x: 2, y: -2 } : { x: 0, y: 0 }
      }
      transition={{ duration: 0.35, ease: BOUNCE_EASE }}
    >
      <path d="M7 17 17 7" />
      <path d="M7 7h10v10" />
    </motion.svg>
  );
};

export const AnimatedFishIcon: React.FC<
  AnimatedIconProps & { looping?: boolean }
> = ({ active = false, looping = false, size = 16, className = '' }) => {
  const prefersReduced = useReducedMotion();

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`overflow-visible ${className}`}
      aria-hidden="true"
      animate={
        prefersReduced
          ? undefined
          : looping
            ? { x: [0, 3, -1, 0], rotate: [0, -10, 5, 0], scale: 1.08 }
            : active
              ? { x: 3, rotate: -10, scale: 1.12 }
              : { x: 0, rotate: 0, scale: 1 }
      }
      transition={
        looping
          ? { duration: 0.7, repeat: Infinity, ease: 'easeInOut' }
          : { duration: 0.35, ease: BOUNCE_EASE }
      }
    >
      <path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.46-3.44 6-7 6s-7.56-2.54-8.5-6Z" />
      <path d="M18 12v.5" />
      <motion.path
        d="M6.5 12 2 8v8l4.5-4Z"
        animate={
          (active || looping) && !prefersReduced
            ? { rotate: [-10, 10, -10] }
            : { rotate: 0 }
        }
        style={{ originX: '6.5px', originY: '12px' }}
        transition={{
          duration: 0.45,
          repeat: active || looping ? Infinity : 0,
          ease: 'easeInOut'
        }}
      />
    </motion.svg>
  );
};

export const AnimatedSplineIcon: React.FC<AnimatedIconProps> = ({
  active = false,
  size = 18,
  className = ''
}) => {
  const prefersReduced = useReducedMotion();

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`overflow-visible ${className}`}
      aria-hidden="true"
      animate={
        active && !prefersReduced
          ? { rotate: 15, scale: 1.12 }
          : { rotate: 0, scale: 1 }
      }
      transition={{ duration: 0.45, ease: BOUNCE_EASE }}
    >
      <motion.path
        d="M4 17C7.5 6 16.5 18 20 7"
        animate={active && !prefersReduced ? { pathLength: [0.3, 1] } : { pathLength: 1 }}
        transition={{ duration: 0.42, ease: SPRING_EASE }}
      />
      <circle cx="4" cy="17" r="2" />
      <circle cx="20" cy="7" r="2" />
    </motion.svg>
  );
};

export const AnimatedLayersIcon: React.FC<
  AnimatedIconProps & { backFill?: string }
> = ({ active = false, size = 18, backFill = 'none', className = '' }) => {
  const prefersReduced = useReducedMotion();

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`overflow-visible ${className}`}
      aria-hidden="true"
      animate={
        active && !prefersReduced
          ? { rotate: 15, scale: 1.12 }
          : { rotate: 0, scale: 1 }
      }
      transition={{ duration: 0.45, ease: BOUNCE_EASE }}
    >
      <motion.rect
        x="4"
        y="4"
        width="10"
        height="10"
        rx="2"
        animate={active && !prefersReduced ? { x: -1.2, y: -1.2 } : { x: 0, y: 0 }}
        transition={{ duration: 0.35, ease: BOUNCE_EASE }}
      />
      <motion.rect
        x="10"
        y="10"
        width="10"
        height="10"
        rx="2"
        fill={backFill}
        animate={active && !prefersReduced ? { x: 1.2, y: 1.2 } : { x: 0, y: 0 }}
        transition={{ duration: 0.35, ease: BOUNCE_EASE }}
      />
    </motion.svg>
  );
};

export const AnimatedCompassIcon: React.FC<AnimatedIconProps> = ({
  active = false,
  size = 18,
  className = ''
}) => {
  const prefersReduced = useReducedMotion();

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`overflow-visible ${className}`}
      aria-hidden="true"
      animate={
        active && !prefersReduced
          ? { rotate: 15, scale: 1.12 }
          : { rotate: 0, scale: 1 }
      }
      transition={{ duration: 0.45, ease: BOUNCE_EASE }}
    >
      <circle cx="12" cy="12" r="9" />
      <motion.polygon
        points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"
        animate={active && !prefersReduced ? { rotate: 30 } : { rotate: 0 }}
        style={{ originX: '12px', originY: '12px' }}
        transition={{ duration: 0.4, ease: BOUNCE_EASE }}
      />
    </motion.svg>
  );
};

export const AnimatedGlyphIcon: React.FC<AnimatedIconProps> = ({
  active = false,
  size = 20,
  className = ''
}) => {
  const prefersReduced = useReducedMotion();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`overflow-visible ${className}`}
      aria-hidden="true"
    >
      <motion.path
        d="M6.5 19L12 5L17.5 19"
        animate={active && !prefersReduced ? { y: -1 } : { y: 0 }}
        transition={{ duration: 0.35, ease: BOUNCE_EASE }}
      />
      <motion.path
        d="M8.5 14.5H15.5"
        animate={active && !prefersReduced ? { pathLength: [0.3, 1] } : { pathLength: 1 }}
        transition={{ duration: 0.34, ease: SPRING_EASE }}
      />
    </svg>
  );
};

export const AnimatedGridNodesIcon: React.FC<AnimatedIconProps> = ({
  active = false,
  size = 20,
  className = ''
}) => {
  const prefersReduced = useReducedMotion();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`overflow-visible ${className}`}
      aria-hidden="true"
    >
      {[
        { x: 4, y: 4, d: 0 },
        { x: 13.5, y: 4, d: 0.04 },
        { x: 4, y: 13.5, d: 0.08 },
        { x: 13.5, y: 13.5, d: 0.12 }
      ].map((cell, i) => (
        <motion.rect
          key={i}
          x={cell.x}
          y={cell.y}
          width="6.5"
          height="6.5"
          rx="1.5"
          animate={
            active && !prefersReduced
              ? { scale: [1, 0.86, 1.08, 1] }
              : { scale: 1 }
          }
          style={{
            originX: `${cell.x + 3.25}px`,
            originY: `${cell.y + 3.25}px`
          }}
          transition={{ duration: 0.38, delay: cell.d, ease: BOUNCE_EASE }}
        />
      ))}
    </svg>
  );
};

export const AnimatedSketchDocIcon: React.FC<AnimatedIconProps> = ({
  active = false,
  size = 19,
  className = ''
}) => {
  const prefersReduced = useReducedMotion();

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`overflow-visible ${className}`}
      aria-hidden="true"
      animate={
        active && !prefersReduced
          ? { rotate: -10, scale: 1.12 }
          : { rotate: 0, scale: 1 }
      }
      transition={{ duration: 0.4, ease: BOUNCE_EASE }}
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <motion.path
        d="M8 13h8"
        animate={active && !prefersReduced ? { pathLength: [0.35, 1] } : { pathLength: 1 }}
        transition={{ duration: 0.28 }}
      />
      <motion.path
        d="M8 17h5"
        animate={active && !prefersReduced ? { pathLength: [0.35, 1] } : { pathLength: 1 }}
        transition={{ duration: 0.34, delay: 0.04 }}
      />
    </motion.svg>
  );
};

export const AnimatedClockIcon: React.FC<AnimatedIconProps> = ({
  active = false,
  size = 19,
  className = ''
}) => {
  const prefersReduced = useReducedMotion();

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`overflow-visible ${className}`}
      aria-hidden="true"
      animate={
        active && !prefersReduced
          ? { rotate: -10, scale: 1.12 }
          : { rotate: 0, scale: 1 }
      }
      transition={{ duration: 0.4, ease: BOUNCE_EASE }}
    >
      <circle cx="12" cy="12" r="9.5" />
      <motion.line
        x1="12"
        y1="12"
        x2="12"
        y2="6.8"
        animate={active && !prefersReduced ? { rotate: 45 } : { rotate: 0 }}
        style={{ originX: '12px', originY: '12px' }}
        transition={{ duration: 0.45, ease: BOUNCE_EASE }}
      />
      <motion.line
        x1="12"
        y1="12"
        x2="15.8"
        y2="14"
        animate={active && !prefersReduced ? { rotate: 18 } : { rotate: 0 }}
        style={{ originX: '12px', originY: '12px' }}
        transition={{ duration: 0.38, ease: SPRING_EASE }}
      />
    </motion.svg>
  );
};

export const AnimatedListIcon: React.FC<
  AnimatedIconProps & { hovered?: boolean }
> = ({ hovered = false, size = 17, className = '' }) => {
  const prefersReduced = useReducedMotion();

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`overflow-visible ${className}`}
      aria-hidden="true"
      animate={hovered && !prefersReduced ? { scale: 1.1 } : { scale: 1 }}
      transition={{ duration: 0.3, ease: BOUNCE_EASE }}
    >
      <motion.line
        x1="4"
        y1="6"
        x2="20"
        y2="6"
        animate={hovered && !prefersReduced ? { x: 1 } : { x: 0 }}
        transition={{ duration: 0.25, ease: SPRING_EASE }}
      />
      <motion.line
        x1="4"
        y1="12"
        x2="16"
        y2="12"
        animate={hovered && !prefersReduced ? { x: -1 } : { x: 0 }}
        transition={{ duration: 0.25, ease: SPRING_EASE }}
      />
      <motion.line
        x1="4"
        y1="18"
        x2="19"
        y2="18"
        animate={hovered && !prefersReduced ? { x: 1 } : { x: 0 }}
        transition={{ duration: 0.25, ease: SPRING_EASE }}
      />
    </motion.svg>
  );
};

export const AnimatedLayoutGridIcon: React.FC<
  AnimatedIconProps & { hovered?: boolean }
> = ({ hovered = false, size = 17, className = '' }) => {
  const prefersReduced = useReducedMotion();

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`overflow-visible ${className}`}
      aria-hidden="true"
      animate={hovered && !prefersReduced ? { scale: 1.1 } : { scale: 1 }}
      transition={{ duration: 0.3, ease: BOUNCE_EASE }}
    >
      {[
        { x: 3, y: 3, d: 0 },
        { x: 13, y: 3, d: 0.03 },
        { x: 3, y: 13, d: 0.06 },
        { x: 13, y: 13, d: 0.09 }
      ].map((cell, idx) => (
        <motion.rect
          key={idx}
          x={cell.x}
          y={cell.y}
          width="8"
          height="8"
          rx="2"
          animate={
            hovered && !prefersReduced
              ? { scale: [1, 0.86, 1.08, 1] }
              : { scale: 1 }
          }
          style={{
            originX: `${cell.x + 4}px`,
            originY: `${cell.y + 4}px`
          }}
          transition={{ duration: 0.32, delay: cell.d, ease: BOUNCE_EASE }}
        />
      ))}
    </motion.svg>
  );
};

export const AnimatedMailIcon: React.FC<
  AnimatedIconProps & { copied?: boolean }
> = ({ active = false, copied = false, size = 16, className = '' }) => {
  const prefersReduced = useReducedMotion();

  if (copied) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`overflow-visible ${className}`}
        aria-hidden="true"
      >
        <motion.path
          d="M5 12.5 9.5 17 19 7.5"
          initial={prefersReduced ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.28, ease: SPRING_EASE }}
        />
      </svg>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`overflow-visible ${className}`}
      aria-hidden="true"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <motion.path
        d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"
        animate={active && !prefersReduced ? { scaleY: -0.6 } : { scaleY: 1 }}
        style={{ originX: '12px', originY: '7px' }}
        transition={{ duration: 0.35, ease: BOUNCE_EASE }}
      />
    </svg>
  );
};

export const AnimatedCodeBracketsIcon: React.FC<AnimatedIconProps> = ({
  active = false,
  size = 16,
  className = ''
}) => {
  const prefersReduced = useReducedMotion();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`overflow-visible ${className}`}
      aria-hidden="true"
    >
      <motion.polyline
        points="8 6 2 12 8 18"
        animate={active && !prefersReduced ? { x: -2 } : { x: 0 }}
        transition={{ duration: 0.3, ease: BOUNCE_EASE }}
      />
      <motion.polyline
        points="16 18 22 12 16 6"
        animate={active && !prefersReduced ? { x: 2 } : { x: 0 }}
        transition={{ duration: 0.3, ease: BOUNCE_EASE }}
      />
    </svg>
  );
};

export const AnimatedCloseIcon: React.FC<AnimatedIconProps> = ({
  active = false,
  size = 16,
  className = ''
}) => {
  const prefersReduced = useReducedMotion();

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      animate={active && !prefersReduced ? { rotate: 90 } : { rotate: 0 }}
      transition={{ duration: 0.35, ease: BOUNCE_EASE }}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </motion.svg>
  );
};

export const AnimatedPrinterIcon: React.FC<AnimatedIconProps> = ({
  active = false,
  size = 15,
  className = ''
}) => {
  const prefersReduced = useReducedMotion();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <motion.rect
        x="6"
        y="14"
        width="12"
        height="8"
        animate={active && !prefersReduced ? { y: 1.8 } : { y: 0 }}
        transition={{ duration: 0.35, ease: BOUNCE_EASE }}
      />
    </svg>
  );
};

export const AnimatedStaggerWord: React.FC<{
  text: string;
  triggerCount: number;
  className?: string;
}> = ({ text, triggerCount, className = '' }) => {
  const prefersReduced = useReducedMotion();
  const chars = Array.from(text);

  if (prefersReduced) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={`inline-flex items-baseline ${className}`}>
      <span className="sr-only">{text}</span>
      <span key={triggerCount} aria-hidden="true" className="inline-flex">
        {chars.map((char, idx) => (
          <motion.span
            key={idx}
            className="inline-block"
            initial={
              triggerCount === 0
                ? false
                : { opacity: 0, y: 5, filter: 'blur(2px)' }
            }
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{
              duration: 0.28,
              delay: triggerCount === 0 ? 0 : idx * 0.032,
              ease: SPRING_EASE
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        ))}
      </span>
    </span>
  );
};
