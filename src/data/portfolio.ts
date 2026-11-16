export type ArcNodeId = 'creative-coding' | 'ai-style-skill' | 'experience';

export interface ArcNode {
  id: ArcNodeId;
  label: string;
  shortDesc: string;
  angleDeg: number; // position along the right semi-circular arc
  accentColor: string;
  details: {
    title: string;
    subtitle: string;
    points: string[];
    codeSnippet: string;
  };
}

export interface ProjectMiniCard {
  label: 'Preview' | 'Architecture' | 'Stack' | 'Status';
  headline: string;
  detail: string;
  accent?: string;
}

export interface PortfolioProject {
  id: string;
  title: string;
  oneLiner: string;
  metric: string;
  year: string;
  bannerBg: '#EDF4FF' | '#FEF8DC' | '#FFF2F4';
  iconBg: string;
  iconAccent: string;
  iconKind: 'glyph' | 'canvas' | 'grid' | 'tokens';
  miniCards: [
    ProjectMiniCard,
    ProjectMiniCard,
    ProjectMiniCard,
    ProjectMiniCard
  ];
  caseStudy: {
    role: string;
    timeline: string;
    summary: string;
    engineeringNotes: string[];
    liveUrl: string;
    repoUrl: string;
  };
  uiWindow: {
    headerLabel: string;
    primaryMetric: string;
    rows: { label: string; value: string; tone?: 'blue' | 'red' | 'yellow' }[];
  };
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  summaryBefore: string;
  highlight: string;
  summaryAfter: string;
  period: string;
}

export const HERO_BIO_TEXT =
  'Frontend engineer crafting calm, tactile interfaces at 60fps — bridging typographic precision, generative physics, and resilient design systems.';

export const ARC_NODES: ArcNode[] = [
  {
    id: 'creative-coding',
    label: 'Creative Coding',
    shortDesc: 'Hybrid DOM + Canvas physics & spring kinematics',
    angleDeg: -52,
    accentColor: '#EF4E5E',
    details: {
      title: 'Creative Coding & Tactile Physics',
      subtitle: '60fps DOM + Canvas choreography without layout thrashing',
      points: [
        'Hybrid glyph-to-particle simulation measuring span rects once per resize and toggling opacity on the compositor thread.',
        'Critically damped spring solvers for pointer trails, magnetic nodes, and fluid editorial reveals.',
        'Respects prefers-reduced-motion with calm static fallbacks across every interactive surface.'
      ],
      codeSnippet: `// Zero-layout-shift glyph handoff
span.style.opacity = '0';
birds.push(spawnOrigamiBird(rect.left, rect.top, glyph));`
    }
  },
  {
    id: 'ai-style-skill',
    label: 'AI Style Skill',
    shortDesc: 'Design-to-code tokens & deterministic taste rules',
    angleDeg: 0,
    accentColor: '#1E63D6',
    details: {
      title: 'AI Style Skill Architecture',
      subtitle: 'Encoding visual restraint into reusable agent specifications',
      points: [
        'Codifies warm paper palettes, tabular numerals, and zero-pill metadata rules into machine-readable constraints.',
        'Turns natural-language art direction into concrete spring curves, contrast ratios, and component contracts.',
        'Eliminates generic gradients and decorative clutter through strict negative design invariants.'
      ],
      codeSnippet: `tokens: {
  canvas: '#FEFCF8',
  ink:    '#0F172A',
  accent: '#1E63D6',
  spark:  '#EF4E5E'
}`
    }
  },
  {
    id: 'experience',
    label: 'Experience',
    shortDesc: '5+ years building design systems & web tools',
    angleDeg: 52,
    accentColor: '#FCE055',
    details: {
      title: 'Engineering Track Record',
      subtitle: 'Shipping crisp interfaces from early-stage prototypes to scale',
      points: [
        'Led frontend architecture for browser-based vector tools, design system token pipelines, and editorial web apps.',
        'Focused on sub-16ms frame budgets, keyboard-first accessibility, and serene typographic craft.',
        'Scroll down to inspect recent roles and production case studies.'
      ],
      codeSnippet: `// Scroll smoothly to #experience`
    }
  }
];

export const PROJECTS: PortfolioProject[] = [
  {
    id: 'kamifield',
    title: 'Kamifield Studio',
    oneLiner: 'Browser-native vector & spring motion editor built on WebGL2 + React.',
    metric: '1.8k ★ · 2025',
    year: '2025',
    bannerBg: '#EDF4FF',
    iconBg: '#EDF4FF',
    iconAccent: '#1E63D6',
    iconKind: 'canvas',
    miniCards: [
      {
        label: 'Preview',
        headline: 'Bezier + Spring Timeline',
        detail: 'Direct-manipulation curve scrubber at 120Hz display refresh.',
        accent: '#1E63D6'
      },
      {
        label: 'Architecture',
        headline: 'Zero-Allocation Render Loop',
        detail: 'TypedArray scene graph shared between worker & main canvas.'
      },
      {
        label: 'Stack',
        headline: 'React 19 · WebGL2 · TS',
        detail: 'Custom SDF stroke tessellation + Motion spring bindings.'
      },
      {
        label: 'Status',
        headline: 'Open Source · v2.4',
        detail: 'Used by 14 design teams for interactive prototype export.',
        accent: '#EF4E5E'
      }
    ],
    caseStudy: {
      role: 'Creator & Lead Engineer',
      timeline: '2024 – 2025',
      summary:
        'Kamifield Studio bridges vector illustration with real spring physics in the browser. Designers scrub stiffness and damping directly over live paths and export zero-dependency Motion configs.',
      engineeringNotes: [
        'Implemented analytical cubic Bezier arc-length parameterization so stroke dash animations stay uniform regardless of control point spacing.',
        'Separated React inspector state from the 120Hz canvas loop via a lightweight observable store, keeping drag latency under 4ms.',
        'Added deterministic SVG pathLength export with reduced-motion fallback snapshots.'
      ],
      liveUrl: 'https://github.com',
      repoUrl: 'https://github.com'
    },
    uiWindow: {
      headerLabel: 'kamifield.app — curve inspector',
      primaryMetric: '0.42s settle',
      rows: [
        { label: 'Stiffness / Damping', value: '280 / 26', tone: 'blue' },
        { label: 'Frame Budget', value: '3.8 ms', tone: 'yellow' },
        { label: 'Path Nodes', value: '128 active' }
      ]
    }
  },
  {
    id: 'monograph-tokens',
    title: 'PaperPress Tokens',
    oneLiner: 'Accessible color-pair & editorial typography compiler for multi-brand teams.',
    metric: '420k dl · 2024',
    year: '2024',
    bannerBg: '#FEF8DC',
    iconBg: '#FEF8DC',
    iconAccent: '#786858',
    iconKind: 'tokens',
    miniCards: [
      {
        label: 'Preview',
        headline: 'OKLCH Contrast Matrix',
        detail: 'Automated APCA & WCAG AA validation across paper & ink pairs.',
        accent: '#786858'
      },
      {
        label: 'Architecture',
        headline: 'AST-Driven CSS Emitter',
        detail: 'Generates zero-runtime Tailwind v4 @theme blocks & TS types.'
      },
      {
        label: 'Stack',
        headline: 'TypeScript · Vite · Tailwind',
        detail: 'Deterministic build plugin with diffable token snapshots.'
      },
      {
        label: 'Status',
        headline: 'Production · npm',
        detail: '420k+ weekly installs across editorial & fintech apps.',
        accent: '#1E63D6'
      }
    ],
    caseStudy: {
      role: 'Author & Maintainer',
      timeline: '2024',
      summary:
        'A calm, zero-bloat design token compiler focused on optical typographic scale, tabular numerals, and perceptual luminance guarantees.',
      engineeringNotes: [
        'Built an OKLCH perceptual gamut mapper that locks ink contrast >= 4.5:1 even when designers nudge hue sliders.',
        'Emits clean CSS custom properties and strict TypeScript union keys without runtime JS overhead.',
        'Includes CLI lint rules that flag pill-badge clutter and missing focus-visible rings.'
      ],
      liveUrl: 'https://github.com',
      repoUrl: 'https://github.com'
    },
    uiWindow: {
      headerLabel: 'paperpress — token audit',
      primaryMetric: '100% AA pass',
      rows: [
        { label: '#0F172A on #FEFCF8', value: '17.4 : 1', tone: 'blue' },
        { label: '#1E63D6 on #EDF4FF', value: '5.1 : 1', tone: 'yellow' },
        { label: 'Bundle Footprint', value: '0.0 kB JS' }
      ]
    }
  },
  {
    id: 'koto-type',
    title: 'Koto Type Specimen',
    oneLiner: 'Interactive variable-font playground with live optical-size & ink-trap inspection.',
    metric: 'Featured · 2024',
    year: '2024',
    bannerBg: '#FFF2F4',
    iconBg: '#FFF2F4',
    iconAccent: '#EF4E5E',
    iconKind: 'glyph',
    miniCards: [
      {
        label: 'Preview',
        headline: 'OpenType Feature Tester',
        detail: 'Live toggles for ss02, ss03, cv01, and tabular numerals.',
        accent: '#EF4E5E'
      },
      {
        label: 'Architecture',
        headline: 'HarfBuzz WASM + Canvas',
        detail: 'Extracts raw Bezier outlines for interactive node magnification.'
      },
      {
        label: 'Stack',
        headline: 'WASM · React · Motion',
        detail: 'Sub-millisecond glyph shaping & variable axis interpolation.'
      },
      {
        label: 'Status',
        headline: 'Awarded · Type01',
        detail: 'Showcased as a reference variable-font web specimen.',
        accent: '#1E63D6'
      }
    ],
    caseStudy: {
      role: 'Design & Frontend Engineer',
      timeline: '2023 – 2024',
      summary:
        'An editorial specimen site celebrating monospaced and neo-grotesque typefaces, letting visitors dissect ink traps, kerning pairs, and OpenType stylistic sets.',
      engineeringNotes: [
        'Wrapped HarfBuzz in a lightweight Web Worker to extract glyph contours at 60fps as users scrub variable weight axes.',
        'Crafted keyboard-navigable specimen cards with zero layout shift during axis transitions.',
        'Paired Paper Mono stylistic alternates (ss02, ss03, cv01) with live copy-to-CSS snippets.'
      ],
      liveUrl: 'https://github.com',
      repoUrl: 'https://github.com'
    },
    uiWindow: {
      headerLabel: 'koto — glyph inspector',
      primaryMetric: 'ss02 · cv01',
      rows: [
        { label: 'Optical Size', value: '16 px -> 72 px', tone: 'red' },
        { label: 'Weight Axis', value: '460 wght', tone: 'blue' },
        { label: 'Shaping Latency', value: '0.6 ms' }
      ]
    }
  },
  {
    id: 'lattice-notes',
    title: 'Lattice Spatial Notes',
    oneLiner: 'Keyboard-first infinite canvas for technical architecture sketches and prose.',
    metric: '12k users · 2023',
    year: '2023',
    bannerBg: '#EDF4FF',
    iconBg: '#EDF4FF',
    iconAccent: '#1E63D6',
    iconKind: 'grid',
    miniCards: [
      {
        label: 'Preview',
        headline: 'Quadtree Spatial Viewport',
        detail: 'Smooth inertial pan & zoom across 5,000+ rich markdown cards.',
        accent: '#1E63D6'
      },
      {
        label: 'Architecture',
        headline: 'CRDT Local-First Sync',
        detail: 'Offline IndexedDB persistence with optimistic delta merging.'
      },
      {
        label: 'Stack',
        headline: 'TypeScript · Yjs · Canvas',
        detail: 'Virtual DOM culling + crisp SVG elbow connectors.'
      },
      {
        label: 'Status',
        headline: 'Active · 12k MAU',
        detail: 'Maintained with 99.98% crash-free session reliability.',
        accent: '#786858'
      }
    ],
    caseStudy: {
      role: 'Senior Frontend Engineer',
      timeline: '2023',
      summary:
        'A serene, paper-toned spatial notebook combining structured prose blocks with snap-to-grid architectural connectors.',
      engineeringNotes: [
        'Built a viewport-culled quadtree renderer so panning across 5,000 cards stays locked at 60fps on integrated GPUs.',
        'Designed inertial trackpad momentum and crisp hairline snapping guides inspired by Japanese drafting stationery.',
        'Implemented full keyboard-only spatial navigation and ARIA landmark summaries.'
      ],
      liveUrl: 'https://github.com',
      repoUrl: 'https://github.com'
    },
    uiWindow: {
      headerLabel: 'lattice — spatial board',
      primaryMetric: '5,000+ nodes',
      rows: [
        { label: 'Viewport Culling', value: '18 visible', tone: 'blue' },
        { label: 'Sync Latency', value: '14 ms local', tone: 'yellow' },
        { label: 'Memory Footprint', value: '42 MB' }
      ]
    }
  }
];

export const EXPERIENCES: ExperienceItem[] = [
  {
    id: 'exp-1',
    role: 'Senior Design Engineer',
    company: 'Atelier Linearis',
    summaryBefore: 'Architected the ',
    highlight: '60fps canvas & token design system',
    summaryAfter: ' powering collaborative creative workflows across web.',
    period: '2025 – Now'
  },
  {
    id: 'exp-2',
    role: 'Frontend Engineer',
    company: 'Papergrid Labs',
    summaryBefore: 'Led interaction craft and ',
    highlight: 'sub-16ms motion primitives',
    summaryAfter: ' for developer documentation and visual editors.',
    period: '2022 – 2024'
  },
  {
    id: 'exp-3',
    role: 'UI Engineer',
    company: 'Kanso Digital',
    summaryBefore: 'Built accessible ',
    highlight: 'editorial publishing interfaces',
    summaryAfter: ' with custom variable typography and tactile micro-interactions.',
    period: '2020 – 2022'
  }
];
