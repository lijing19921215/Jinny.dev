import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';

function getFormattedTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return { hours, minutes };
}

export interface TopbarProps {
  onBrandClick?: () => void;
  breadcrumb?: string;
  className?: string;
}

export const Topbar: React.FC<TopbarProps> = ({
  onBrandClick,
  breadcrumb,
  className = 'w-full pt-8 pb-6 sm:pt-10 sm:pb-8 no-print'
}) => {
  const [time, setTime] = useState(getFormattedTime);
  const [colonVisible, setColonVisible] = useState(true);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    const syncClock = () => setTime(getFormattedTime());
    syncClock();

    const clockInterval = window.setInterval(syncClock, 5000);
    const colonInterval = prefersReduced
      ? undefined
      : window.setInterval(() => {
          setColonVisible((prev) => !prev);
        }, 1000);

    return () => {
      window.clearInterval(clockInterval);
      if (colonInterval) window.clearInterval(colonInterval);
    };
  }, [prefersReduced]);

  const handleBrandClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (onBrandClick) {
      onBrandClick();
      return;
    }
    window.scrollTo({
      top: 0,
      behavior: prefersReduced ? 'auto' : 'smooth'
    });
  };

  return (
    <header className={className}>
      <div className="w-full px-6 sm:px-10 flex items-center justify-between gap-8">
        <div className="pointer-events-auto inline-flex items-center gap-2.5 whitespace-nowrap shrink-0">
          <a
            href="#top"
            onClick={handleBrandClick}
            className="inline-flex items-center gap-2.5 text-[#0F172A] hover:opacity-80 active:scale-[0.94] transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1E63D6] rounded-sm cursor-pointer"
            aria-label="alex.dev home"
          >
            <span className="relative flex h-2.5 w-2.5 items-center justify-center">
              {!prefersReduced && (
                <motion.span
                  aria-hidden="true"
                  className="absolute inline-flex h-full w-full rounded-full bg-[#EF4E5E]"
                  animate={{ scale: [1, 1.9, 1], opacity: [0.65, 0, 0.65] }}
                  transition={{
                    duration: 2.4,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                />
              )}
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#EF4E5E]" />
            </span>
            <span className="font-paper-mono text-[13.5px] font-semibold text-[#0F172A]">
              alex.dev
            </span>
          </a>
          {breadcrumb && (
            <>
              <span
                aria-hidden="true"
                className="font-paper-mono text-[12.5px] text-[#786858]/55 select-none"
              >
                /
              </span>
              <span className="font-paper-mono text-[12.5px] font-medium text-[#1E63D6] select-none">
                {breadcrumb}
              </span>
            </>
          )}
        </div>

        <div
          className="pointer-events-auto font-paper-mono tabular-nums text-[13px] tracking-wide text-[#786858] select-none whitespace-nowrap shrink-0"
          aria-label={`Local time ${time.hours}:${time.minutes}`}
        >
          <span>{time.hours}</span>
          <span
            aria-hidden="true"
            className="inline-block w-[0.5ch] text-center transition-opacity duration-300"
            style={{ opacity: colonVisible ? 1 : 0.25 }}
          >
            :
          </span>
          <span>{time.minutes}</span>
        </div>
      </div>
    </header>
  );
};
