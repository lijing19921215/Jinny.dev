import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  AnimatedCodeBracketsIcon,
  AnimatedMailIcon
} from './AnimatedIcons';

export const SignOffFooter: React.FC = () => {
  const sigRef = useRef<HTMLButtonElement>(null);
  const prefersReduced = useReducedMotion();

  const [hasDrawn, setHasDrawn] = useState(Boolean(prefersReduced));
  const [replayKey, setReplayKey] = useState(0);
  const [copied, setCopied] = useState(false);
  const [envHovered, setEnvHovered] = useState(false);
  const [ghHovered, setGhHovered] = useState(false);

  useEffect(() => {
    if (prefersReduced) {
      setHasDrawn(true);
      return;
    }

    const el = sigRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setHasDrawn(true);
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [prefersReduced]);

  const handleReplaySignature = () => {
    if (prefersReduced) return;
    setReplayKey((prev) => prev + 1);
    setHasDrawn(true);
  };

  const handleCopyEmail = async () => {
    const email = 'alex@alex.dev';
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(email);
      } else {
        const ta = document.createElement('textarea');
        ta.value = email;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    }
  };

  // Total approximate path lengths for smooth stroke-dashoffset drawing
  const primarySigLength = 340;
  const flourishLength = 120;

  return (
    <div className="pt-8 pb-14 sm:pt-10 sm:pb-20 no-print">
      {/* Clean white bordered sign-off strip */}
      <div className="rounded-2xl bg-[#FFFFFF] border border-[#E5E7EB] px-6 py-6 sm:px-8 sm:py-7 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="max-w-[46ch]">
          <p className="font-display text-[15.5px] sm:text-[16px] text-[#0F172A] font-medium leading-relaxed">
            I&apos;m open to Frontend or Design Engineer roles where typographic
            craft, tactile motion, and resilient UI architecture matter.
          </p>
          <p className="font-paper-mono text-[12px] text-[#786858] mt-1.5">
            Based in San Francisco · Available for select teams &amp; collaborations
          </p>
        </div>

        {/* Animated SVG handwritten signature (draws on scroll, replays on click) */}
        <button
          ref={sigRef}
          type="button"
          onClick={handleReplaySignature}
          title="Replay handwritten signature"
          aria-label="Alex handwritten signature — click to replay drawing animation"
          className="group self-start sm:self-center shrink-0 rounded-xl px-3 py-2 hover:bg-[#FEFCF8] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E63D6]"
        >
          <svg
            key={replayKey}
            width="156"
            height="58"
            viewBox="0 0 180 68"
            fill="none"
            aria-hidden="true"
          >
            {/* Flowing handwritten "Alex" cursive stroke */}
            <motion.path
              d="M16 48 C22 30, 30 12, 36 12 C41 12, 43 32, 46 47 M22 35 C30 33, 41 31, 50 30 C57 29, 64 14, 65 10 C66 8, 60 22, 60 36 C60 45, 65 48, 72 44 C78 40, 82 31, 88 31 C94 31, 93 38, 86 39 C80 40, 77 36, 79 33 C82 29, 92 31, 97 38 C100 43, 106 43, 112 36 C116 31, 121 27, 126 32 C131 37, 134 43, 141 43 C147 43, 152 38, 156 34 M128 28 C123 36, 117 44, 111 48"
              stroke="#1E63D6"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={primarySigLength}
              initial={
                prefersReduced
                  ? { strokeDashoffset: 0 }
                  : { strokeDashoffset: primarySigLength }
              }
              animate={{
                strokeDashoffset: hasDrawn ? 0 : primarySigLength
              }}
              transition={{
                duration: 1.5,
                ease: [0.22, 1, 0.36, 1]
              }}
            />

            {/* Warm spark red underline flourish */}
            <motion.path
              d="M32 56 C68 52, 116 51, 160 54"
              stroke="#EF4E5E"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeDasharray={flourishLength}
              initial={
                prefersReduced
                  ? { strokeDashoffset: 0 }
                  : { strokeDashoffset: flourishLength }
              }
              animate={{
                strokeDashoffset: hasDrawn ? 0 : flourishLength
              }}
              transition={{
                duration: 0.7,
                delay: 1.05,
                ease: [0.16, 1, 0.3, 1]
              }}
            />
          </svg>
        </button>
      </div>

      {/* Minimal Footer */}
      <footer className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
        <div className="flex flex-wrap items-center gap-4">
          {/* Animated email envelope button (opens flap + click-to-copy "copied ✓") */}
          <button
            type="button"
            onClick={handleCopyEmail}
            onMouseEnter={() => setEnvHovered(true)}
            onMouseLeave={() => setEnvHovered(false)}
            className="inline-flex items-center gap-2 rounded-[8px] border border-transparent bg-transparent px-3 py-1.5 -ml-3 font-paper-mono text-[13px] font-medium text-[#0F172A] hover:bg-[#FFFFFF] hover:border-[#E5E7EB] hover:text-[#1E63D6] hover:-translate-y-[1px] active:scale-[0.92] transition-all duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E63D6] whitespace-nowrap shrink-0"
          >
            <AnimatedMailIcon active={envHovered} copied={copied} size={16} />
            <span className={copied ? 'text-[#1E63D6] font-bold' : ''}>
              {copied ? 'copied ✓' : 'alex@alex.dev'}
            </span>
          </button>

          <span aria-hidden="true" className="text-[#E5E7EB]">
            ·
          </span>

          {/* Animated GitHub code-bracket link */}
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            onMouseEnter={() => setGhHovered(true)}
            onMouseLeave={() => setGhHovered(false)}
            className="inline-flex items-center gap-2 rounded-[8px] border border-transparent bg-transparent px-3 py-1.5 font-paper-mono text-[13px] font-medium text-[#0F172A] hover:bg-[#FFFFFF] hover:border-[#E5E7EB] hover:text-[#1E63D6] hover:-translate-y-[1px] active:scale-[0.92] transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E63D6] whitespace-nowrap shrink-0"
          >
            <AnimatedCodeBracketsIcon active={ghHovered} size={16} />
            <span>github.com/alex-dev</span>
          </a>
        </div>

        <p className="font-paper-mono text-[12px] text-[#786858]">
          Set in Space Grotesk &amp; Paper Mono · Crafted on warm ivory
        </p>
      </footer>
    </div>
  );
};
