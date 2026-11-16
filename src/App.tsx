/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Topbar } from './components/Topbar';
import { FishToBirdsBio, FishToBirdsHandle } from './components/FishToBirdsBio';
import { HeroStage } from './components/HeroStage';
import { ProjectsSection } from './components/ProjectsSection';
import { ExperienceSection } from './components/ExperienceSection';
import { SignOffFooter } from './components/SignOffFooter';
import { NodeModal, ProjectModal, ResumeModal } from './components/Modals';
import { RevealSection } from './components/RevealSection';
import {
  AnimatedArrowUpRightIcon,
  AnimatedFileFoldIcon,
  AnimatedFishIcon
} from './components/AnimatedIcons';
import { ArcNode, HERO_BIO_TEXT, PortfolioProject } from './data/portfolio';

export default function App() {
  const bioRef = useRef<FishToBirdsHandle>(null);
  const prefersReduced = useReducedMotion();

  const [isSwimming, setIsSwimming] = useState(false);
  const [resumeHovered, setResumeHovered] = useState(false);
  const [stirHovered, setStirHovered] = useState(false);

  const [resumeOpen, setResumeOpen] = useState(false);
  const [selectedProject, setSelectedProject] =
    useState<PortfolioProject | null>(null);
  const [selectedNode, setSelectedNode] = useState<ArcNode | null>(null);

  const handleSelectArcNode = (node: ArcNode) => {
    if (node.id === 'experience') {
      const el = document.getElementById('experience');
      if (el) {
        el.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth' });
        return;
      }
    }
    setSelectedNode(node);
  };

  return (
    <div
      id="top"
      className="min-h-screen bg-[#FEFCF8] paper-grain text-[#374151] selection:bg-[#FCE055] selection:text-[#0F172A]"
    >
      <Topbar />

      <main className="mx-auto max-w-5xl px-6 sm:px-10">
        {/* Hero: 2-column split inside 1024px */}
        <section className="pt-8 pb-16 sm:pt-14 sm:pb-24 grid grid-cols-1 lg:grid-cols-12 items-center gap-10 lg:gap-8">
          {/* Hero Left */}
          <div className="lg:col-span-7 space-y-7">
            {/* Diagonal reveal headline */}
            <h1 className="font-display text-[38px] sm:text-[48px] lg:text-[52px] font-bold leading-[1.08] tracking-[-0.03em] text-balance">
              <span className="block overflow-hidden">
                <motion.span
                  className="block text-[#0F172A]"
                  initial={
                    prefersReduced
                      ? false
                      : { opacity: 0, x: -16, y: 26, rotate: 1.5 }
                  }
                  animate={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
                  transition={{
                    duration: 0.7,
                    ease: [0.16, 1, 0.3, 1]
                  }}
                >
                  I work between
                </motion.span>
              </span>
              <span className="block overflow-hidden mt-1">
                <motion.span
                  className="block text-[#1E63D6]"
                  initial={
                    prefersReduced
                      ? false
                      : { opacity: 0, x: -20, y: 28, rotate: 1.5 }
                  }
                  animate={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
                  transition={{
                    duration: 0.72,
                    delay: 0.1,
                    ease: [0.16, 1, 0.3, 1]
                  }}
                >
                  design and code
                </motion.span>
              </span>
            </h1>

            {/* 60fps DOM + single <canvas> hybrid Fish-to-Birds bio */}
            <motion.div
              initial={prefersReduced ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.55,
                delay: 0.22,
                ease: [0.16, 1, 0.3, 1]
              }}
              className="pt-1"
            >
              <FishToBirdsBio
                ref={bioRef}
                text={HERO_BIO_TEXT}
                onSwimStateChange={setIsSwimming}
              />
            </motion.div>

            {/* Two animated-icon buttons */}
            <motion.div
              initial={prefersReduced ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.55,
                delay: 0.32,
                ease: [0.16, 1, 0.3, 1]
              }}
              className="flex flex-wrap items-center gap-2.5 pt-1"
            >
              {/* resume ↗ (document corner fold animation on hover) */}
              <button
                type="button"
                onClick={() => setResumeOpen(true)}
                onMouseEnter={() => setResumeHovered(true)}
                onMouseLeave={() => setResumeHovered(false)}
                className="inline-flex items-center gap-2 rounded-[8px] bg-transparent border border-transparent px-3.5 py-2 font-paper-mono text-[13px] font-medium text-[#0F172A] hover:bg-[#FFFFFF] hover:border-[#E5E7EB] hover:text-[#1E63D6] hover:-translate-y-[1px] active:scale-[0.92] transition-all duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1E63D6] whitespace-nowrap shrink-0"
              >
                <AnimatedFileFoldIcon
                  active={resumeHovered}
                  size={16}
                />
                <span>resume</span>
                <AnimatedArrowUpRightIcon
                  active={resumeHovered}
                  size={14}
                  className="-ml-1"
                />
              </button>

              {/* stir the words (#EF4E5E fish icon that triggers the swim) */}
              <button
                type="button"
                onClick={() => bioRef.current?.triggerSwim()}
                onMouseEnter={() => setStirHovered(true)}
                onMouseLeave={() => setStirHovered(false)}
                className="inline-flex items-center gap-2 rounded-[8px] bg-transparent border border-transparent px-3.5 py-2 font-paper-mono text-[13px] font-medium text-[#EF4E5E] hover:bg-[#FFF2F3] hover:border-[#FAD2D6] hover:-translate-y-[1px] active:scale-[0.92] transition-all duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EF4E5E] whitespace-nowrap shrink-0"
              >
                <AnimatedFishIcon
                  active={stirHovered}
                  looping={isSwimming}
                  size={16}
                />
                <span>stir the words</span>
              </button>
            </motion.div>
          </div>

          {/* Hero Right: Golden arc, IP illustration, and 3 clickable nodes */}
          <div className="lg:col-span-5">
            <HeroStage onSelectNode={handleSelectArcNode} />
          </div>
        </section>

        {/* Below-the-fold sections with subtle blur-fade-up scroll reveal */}
        <RevealSection>
          <ProjectsSection onSelectProject={setSelectedProject} />
        </RevealSection>

        <RevealSection delay={0.05}>
          <ExperienceSection />
        </RevealSection>

        <RevealSection delay={0.05}>
          <SignOffFooter />
        </RevealSection>
      </main>

      {/* Modals */}
      <ResumeModal open={resumeOpen} onClose={() => setResumeOpen(false)} />
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
      <NodeModal
        node={selectedNode}
        onClose={() => setSelectedNode(null)}
      />
    </div>
  );
}
