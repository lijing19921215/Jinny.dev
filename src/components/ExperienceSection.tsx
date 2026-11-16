import React, { useState } from 'react';
import { EXPERIENCES } from '../data/portfolio';
import { AnimatedClockIcon, AnimatedStaggerWord } from './AnimatedIcons';

export const ExperienceSection: React.FC = () => {
  const [clockHovered, setClockHovered] = useState(false);
  const [clockTriggerCount, setClockTriggerCount] = useState(0);

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

      <div className="flex flex-col gap-1">
        {EXPERIENCES.map((exp) => (
          <div
            key={exp.id}
            className="group py-5 px-3.5 -mx-3.5 rounded-xl flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 sm:gap-8 hover:bg-[#EDF4FF]/35 transition-colors duration-200"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <h3 className="font-display text-[16.5px] font-semibold text-[#0F172A] tracking-tight">
                  {exp.role}
                </h3>
                <span aria-hidden="true" className="text-[#786858]">
                  ·
                </span>
                <span className="font-paper-mono text-[13px] text-[#786858]">
                  {exp.company}
                </span>
              </div>
              <p className="font-display text-[14.5px] text-[#374151] leading-relaxed mt-1">
                {exp.summaryBefore}
                <mark className="bg-[#FCE055]/85 text-[#0F172A] px-1 py-0.5 rounded-[3px] font-medium">
                  {exp.highlight}
                </mark>
                {exp.summaryAfter}
              </p>
            </div>

            <div className="font-paper-mono tabular-nums text-[13px] font-medium text-[#1E63D6] whitespace-nowrap shrink-0 sm:text-right transition-transform duration-300 group-hover:-translate-x-[3px]">
              {exp.period}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
