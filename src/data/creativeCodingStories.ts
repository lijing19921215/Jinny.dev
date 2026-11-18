import pendulumImg from '../assets/images/cc_monochrome_pendulum_1794913259623.jpg';
import cobaltWaveImg from '../assets/images/cc_cobalt_wavefield_1794913259681.jpg';
import vermilionScopeImg from '../assets/images/cc_vermilion_oscilloscope_1794913259821.jpg';
import contourFieldImg from '../assets/images/cc_contour_field_1794913260814.jpg';

export type ArtifactKind =
  | 'image'
  | 'canvas-radar'
  | 'canvas-ascii'
  | 'canvas-cloth'
  | 'canvas-boids'
  | 'canvas-flow'
  | 'canvas-glyph';

export interface CollageLayout {
  xPct: number;
  yPct: number;
  wPct: number;
  aspect: string;
  z: number;
}

export interface CreativeArtifact {
  id: string;
  indexNum: number;
  title: string;
  tooltipCaption: string;
  kind: ArtifactKind;
  imageSrc?: string;
  imageAlt?: string;
  layout: CollageLayout;
  aboutText: string;
  connectionText: string;
  mediumLabel: string;
  parameters: { label: string; value: string }[];
}

export interface CreativeStory {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  introLabel: string;
  codeInput: string;
  codeOutput: string;
  narrative: string[];
  labNotes: string[];
  annotation: {
    viewBox: string;
    pathD: string;
    arrowD: string;
    labelText: string;
    labelX: number;
    labelY: number;
  };
  artifacts: CreativeArtifact[];
}

export const CREATIVE_STORIES: CreativeStory[] = [
  {
    id: 'harmonic-pendulums',
    slug: 'pendulums',
    title: 'Harmonic Pendulums',
    subtitle: 'Coupled oscillators, standing waves & Verlet cloth kinematics',
    introLabel: 'Generated from live Canvas 2D solvers & analog studio plates.',
    codeInput: `// Coupled Lissajous + Verlet solver
const fx = (target.x - pos.x) * stiffness;
const fy = (target.y - pos.y) * stiffness;
vel.x = (vel.x + fx) * damping; // ζ = 0.78
vel.y = (vel.y + fy) * damping;
phase += (omega1 / omega2) * dt;`,
    codeOutput: `Lissajous Ratio: 3 : 2 (perfect fifth)
Settle Time:     420 ms (critically damped)
Frame Budget:    2.1 ms @ 60 Hz
Energy Decay:    e^(-0.018 * t)
Active Nodes:    7 coupled artifacts`,
    narrative: [
      'Before screens drew smooth curves, brass harmonographs translated invisible phase ratios into sand and ink. Two pendulums swinging at slightly detuned frequencies trace ellipses that slowly precess until friction brings them to rest.',
      'In browser simulation, the same differential equations drive spring physics, cloth tension, and pointer inertia. Move across the collage to perturb the live canvases, or drag any plate to rearrange the study desk.'
    ],
    labNotes: [
      'Verlet integration preserves momentum without explicit velocity drift across variable refresh displays.',
      'SVG annotation overlays use normalized pathLength interpolation and smoothly recede whenever plates are rearranged.',
      'Every live canvas honors the top-right pause toggle and system reduced-motion preferences.'
    ],
    annotation: {
      viewBox: '0 0 1000 720',
      pathD:
        'M 215 470 C 260 400, 340 315, 420 265 C 495 218, 535 190, 562 128 M 552 340 C 618 375, 690 420, 745 452',
      arrowD: 'M 738 441 L 748 454 L 732 456',
      labelText: '3:2',
      labelX: 726,
      labelY: 492
    },
    artifacts: [
      {
        id: 'hp-radar',
        indexNum: 1,
        title: 'Phase-Space Attractor',
        tooltipCaption: 'Interactive phase-space field · move cursor to excite',
        kind: 'canvas-radar',
        layout: { xPct: 7, yPct: 68, wPct: 22, aspect: '4 / 3', z: 2 },
        aboutText:
          'A real-time polar phase-space canvas inspired by analog radar scopes. Harmonic nodes orbit concentric frequency rings while emitting thermal interference ripples.',
        connectionText:
          'Demonstrates how polar coordinates map frequency ratios (ω₁ : ω₂) into recognizable geometric resonance loops.',
        mediumLabel: 'Canvas 2D · Polar Field',
        parameters: [
          { label: 'Harmonic Ratio', value: '3 : 2' },
          { label: 'Sweep Rate', value: '0.84 rad/s' },
          { label: 'Pointer Coupling', value: 'Active' }
        ]
      },
      {
        id: 'hp-pendulum',
        indexNum: 2,
        title: 'Brass Harmonograph',
        tooltipCaption: 'Double pendulum sand trace · long exposure study',
        kind: 'image',
        imageSrc: pendulumImg,
        imageAlt:
          'Black-and-white photograph of a brass harmonograph pendulum tracing Lissajous curves in sand',
        layout: { xPct: 26, yPct: 19, wPct: 33, aspect: '3 / 4', z: 1 },
        aboutText:
          'Monochrome studio documentation of a two-axis brass harmonograph drawing nested Lissajous paths into dark silica sand.',
        connectionText:
          'Serves as the physical reference anchor for the digital spring and damping constants used throughout the portfolio.',
        mediumLabel: '35mm Monochrome Plate',
        parameters: [
          { label: 'Damping Factor', value: '0.018' },
          { label: 'Axis Ratio', value: '1.498' },
          { label: 'Plate Aspect', value: '3 : 4' }
        ]
      },
      {
        id: 'hp-ascii',
        indexNum: 3,
        title: 'ODE Solver Window',
        tooltipCaption: 'Live ASCII wave interference · pointer reactive',
        kind: 'canvas-ascii',
        layout: { xPct: 14, yPct: 41, wPct: 23, aspect: '1 / 1', z: 4 },
        aboutText:
          'A retro windowed character matrix evaluating superposed sine waves in real time and quantizing amplitude into typographic density glyphs.',
        connectionText:
          'Bridges raw numerical integration with readable monospaced typography, echoing early terminal plotters.',
        mediumLabel: 'Live ASCII Canvas · 60fps',
        parameters: [
          { label: 'Grid Resolution', value: '26 × 16' },
          { label: 'Glyph Ramp', value: '.:-=+*#%@' },
          { label: 'Wave Sources', value: '2 + Cursor' }
        ]
      },
      {
        id: 'hp-oscilloscope',
        indexNum: 4,
        title: 'Standing Wave Scope',
        tooltipCaption: 'Vermilion phosphor exposure · beat frequency nodes',
        kind: 'image',
        imageSrc: vermilionScopeImg,
        imageAlt:
          'Vermilion red duotone exposure of standing wave patterns on an analog oscilloscope',
        layout: { xPct: 48, yPct: 67, wPct: 25, aspect: '4 / 3', z: 3 },
        aboutText:
          'High-contrast vermilion darkroom print capturing constructive and destructive acoustic interference on a CRT phosphor screen.',
        connectionText:
          'Shows how slight frequency detuning creates pulsing amplitude envelopes known as beat frequencies.',
        mediumLabel: 'Vermilion Duotone Exposure',
        parameters: [
          { label: 'Carrier Freq', value: '440 Hz' },
          { label: 'Detune Δf', value: '2.5 Hz' },
          { label: 'Phosphor Tone', value: '#EF4E5E' }
        ]
      },
      {
        id: 'hp-cyanotype',
        indexNum: 5,
        title: 'Ripple Caustics',
        tooltipCaption: 'Cobalt cyanotype · concentric wave interference',
        kind: 'image',
        imageSrc: cobaltWaveImg,
        imageAlt:
          'Cobalt blue cyanotype print of concentric water wave interference ripples',
        layout: { xPct: 54, yPct: 25, wPct: 22, aspect: '3 / 4', z: 2 },
        aboutText:
          'Cyanotype contact print recording two point-source ripples intersecting across shallow water under collimated light.',
        connectionText:
          'Illustrates the same superposition law computed in the ASCII and polar field canvases beside it.',
        mediumLabel: 'Cobalt Cyanotype Print',
        parameters: [
          { label: 'Sources', value: 'Dual Point' },
          { label: 'Wavelength λ', value: '24 px' },
          { label: 'Paper Stock', value: 'Cotton Rag' }
        ]
      },
      {
        id: 'hp-contour',
        indexNum: 6,
        title: 'Potential Field Map',
        tooltipCaption: 'Vector triangulation sheet · 10m contour interval',
        kind: 'image',
        imageSrc: contourFieldImg,
        imageAlt:
          'Archival drafting paper showing topographic contour lines and triangulation vectors',
        layout: { xPct: 71, yPct: 44, wPct: 23, aspect: '1 / 1', z: 3 },
        aboutText:
          'Hand-inked topographic potential map pairing closed equipotential contours with directional gradient vectors.',
        connectionText:
          'Equipotential lines behave identically to energy level sets in conservative spring-mass dynamical systems.',
        mediumLabel: 'Archival Ink Survey',
        parameters: [
          { label: 'Contour Step', value: '10 units' },
          { label: 'Triangulation', value: 'Delaunay' },
          { label: 'Grid Scale', value: '1 : 10,000' }
        ]
      },
      {
        id: 'hp-cloth',
        indexNum: 7,
        title: 'Verlet Wind Banner',
        tooltipCaption: 'Interactive Verlet cloth · drag pointer across fabric',
        kind: 'canvas-cloth',
        layout: { xPct: 45, yPct: 5, wPct: 16, aspect: '1 / 1', z: 5 },
        aboutText:
          'A pinned triangular pennant simulated with 2D Verlet point masses, structural distance constraints, and stochastic wind gusts.',
        connectionText:
          'Completes the oscillation study by coupling constraint relaxation with continuous aerodynamic turbulence.',
        mediumLabel: 'Verlet Physics Canvas',
        parameters: [
          { label: 'Constraint Passes', value: '5 / frame' },
          { label: 'Gravity', value: '0.18 px/f²' },
          { label: 'Air Drag', value: '0.985' }
        ]
      }
    ]
  },
  {
    id: 'emergent-flocking',
    slug: 'flocking',
    title: 'Emergent Flocking',
    subtitle: 'Curl noise streamlines & spatial Boids choreography',
    introLabel: 'Local steering rules producing coherent macro-scale motion.',
    codeInput: `// Reynolds Boids + Curl Field
const sep = steerAway(neighbors, 26);
const ali = alignVelocity(neighbors, 52);
const coh = steerCenter(neighbors, 64);
const wind = sampleCurlNoise(pos.x, pos.y, t);
acc.add(sep * 1.4, ali * 0.9, coh * 0.7, wind);`,
    codeOutput: `Agent Count:     64 particles
Neighbor Query:  Spatial Hash (O(1) avg)
Curl Divergence: 0.000 (incompressible)
Frame Time:      1.7 ms @ 60 Hz
Pointer Mode:    Gentle repulsion / vortex`,
    narrative: [
      'A flock of starlings has no choreographer. Each bird tracks only its nearest neighbors—avoiding collisions, matching heading, and drifting toward local density—yet the whole cloud ripples like liquid silk.',
      'By blending Reynolds steering forces with divergence-free curl noise, particles glide around obstacles and cursors without ever clumping into artificial singularities.'
    ],
    labNotes: [
      'Spatial grid bucketing keeps neighbor lookups near constant time even on integrated GPUs.',
      'Curl noise guarantees zero sinks or sources, preserving smooth ribbon spacing.'
    ],
    annotation: {
      viewBox: '0 0 1000 720',
      pathD:
        'M 190 250 C 290 190, 440 215, 535 290 C 625 360, 695 455, 765 510',
      arrowD: 'M 754 508 L 767 512 L 762 498',
      labelText: '∇×Ψ',
      labelX: 774,
      labelY: 522
    },
    artifacts: [
      {
        id: 'ef-boids',
        indexNum: 1,
        title: 'Murmuration Study',
        tooltipCaption: 'Interactive Boids flock · cursor steers the swarm',
        kind: 'canvas-boids',
        layout: { xPct: 12, yPct: 16, wPct: 36, aspect: '4 / 3', z: 3 },
        aboutText:
          'Sixty-four lightweight agents computing separation, alignment, and cohesion at 60fps. Move your pointer across the frame to part the flock.',
        connectionText:
          'Core emergent simulation demonstrating how three local vectors generate lifelike collective flight.',
        mediumLabel: 'Canvas 2D · Reynolds Boids',
        parameters: [
          { label: 'Agents', value: '64' },
          { label: 'Perception R', value: '56 px' },
          { label: 'Max Speed', value: '2.6 px/f' }
        ]
      },
      {
        id: 'ef-flow',
        indexNum: 2,
        title: 'Curl Streamlines',
        tooltipCaption: 'Incompressible flow ribbons · mouse adds swirl',
        kind: 'canvas-flow',
        layout: { xPct: 44, yPct: 24, wPct: 34, aspect: '3 / 4', z: 2 },
        aboutText:
          'Long-exposure ink trails advected through a smooth 2D potential curl field with subtle pointer-induced vorticity.',
        connectionText:
          'Provides the ambient wind vector field overlaid onto the flocking simulation.',
        mediumLabel: 'Flow Field Canvas',
        parameters: [
          { label: 'Streamlines', value: '58 ribbons' },
          { label: 'Noise Scale', value: '0.0045' },
          { label: 'Trail Fade', value: '0.045' }
        ]
      },
      {
        id: 'ef-contour',
        indexNum: 3,
        title: 'Potential Contours',
        tooltipCaption: 'Scalar potential sheet · streamfunction gradient',
        kind: 'image',
        imageSrc: contourFieldImg,
        imageAlt: 'Topographic contour survey representing scalar potential lines',
        layout: { xPct: 64, yPct: 50, wPct: 25, aspect: '1 / 1', z: 4 },
        aboutText:
          'Scalar heightfield contours whose perpendicular gradients define divergence-free curl trajectories.',
        connectionText:
          'Visualizes the mathematical scalar field Ψ whose finite differences steer every ribbon.',
        mediumLabel: 'Archival Survey Plate',
        parameters: [
          { label: 'Finite Diff ε', value: '0.001' },
          { label: 'Symmetry', value: 'Continuous' },
          { label: 'Divergence', value: '0.0' }
        ]
      },
      {
        id: 'ef-cyan',
        indexNum: 4,
        title: 'Fluid Interference',
        tooltipCaption: 'Cyanotype turbulence · boundary wake ripples',
        kind: 'image',
        imageSrc: cobaltWaveImg,
        imageAlt: 'Cyanotype print of overlapping fluid ripples',
        layout: { xPct: 16, yPct: 56, wPct: 24, aspect: '3 / 4', z: 4 },
        aboutText:
          'Cyanotype print studying how boundary wakes interact with ambient drift currents.',
        connectionText:
          'Documents the visual rhythm targeted by the interactive streamline fade decay.',
        mediumLabel: 'Cobalt Cyanotype',
        parameters: [
          { label: 'Medium', value: 'Prussian Blue' },
          { label: 'Contrast', value: 'High' },
          { label: 'Grain', value: 'Cold Press' }
        ]
      },
      {
        id: 'ef-ascii',
        indexNum: 5,
        title: 'Density Telemetry',
        tooltipCaption: 'ASCII density field · live flux sampling',
        kind: 'canvas-ascii',
        layout: { xPct: 56, yPct: 6, wPct: 21, aspect: '1 / 1', z: 5 },
        aboutText:
          'Real-time glyph discretization displaying scalar field flux density across a 26×16 grid.',
        connectionText:
          'Exposes the underlying field intensity numerically without obscuring the visual canvas.',
        mediumLabel: 'ASCII Field Inspector',
        parameters: [
          { label: 'Sample Rate', value: '60 Hz' },
          { label: 'Quantization', value: '9 levels' },
          { label: 'Pointer', value: 'Interactive' }
        ]
      }
    ]
  },
  {
    id: 'typography-physics',
    slug: 'typography',
    title: 'Typography as Physics',
    subtitle: 'Spring-mass letterforms, ink traps & glyph kinematics',
    introLabel: 'Treating letterforms as elastic bodies instead of static strings.',
    codeInput: `// Hybrid DOM -> Canvas handoff
const rect = span.getBoundingClientRect();
span.style.opacity = '0'; // zero layout shift
glyphBodies.push(new SpringGlyph({
  anchor: { x: rect.left, y: rect.top },
  stiffness: 0.14, damping: 0.80
}));`,
    codeOutput: `Glyph Handoff:   0 ms layout reflow
Spring Model:    Hooke + viscous damping
Font Axis:       Paper Mono VF (100..900)
Pointer Radius:  110 px magnetic field
Reduced Motion:  Instant static settle`,
    narrative: [
      'Digital type is usually frozen inside rigid bounding boxes. By measuring DOM glyph coordinates once on layout and handing them off to a compositor-friendly canvas layer, words can scatter like origami birds and settle cleanly back into editorial prose.',
      'This study pairs tactile spring letterforms with mechanical pendulum traces and oscilloscope timing curves to tune how text feels under the cursor.'
    ],
    labNotes: [
      'Measuring getBoundingClientRect() outside animation loops prevents layout thrashing.',
      'Critically damped springs eliminate jarring bounce on crisp monospaced characters.'
    ],
    annotation: {
      viewBox: '0 0 1000 720',
      pathD:
        'M 250 185 C 330 240, 410 310, 495 360 C 575 408, 650 385, 725 320',
      arrowD: 'M 712 318 L 727 318 L 722 332',
      labelText: 'k=0.14',
      labelX: 730,
      labelY: 306
    },
    artifacts: [
      {
        id: 'tp-glyph',
        indexNum: 1,
        title: 'Elastic Letterforms',
        tooltipCaption: 'Interactive spring glyphs · scatter with cursor',
        kind: 'canvas-glyph',
        layout: { xPct: 16, yPct: 18, wPct: 36, aspect: '4 / 3', z: 4 },
        aboutText:
          'Interactive grid of monospaced glyphs tethered to home anchors by Hookean springs. Sweep your cursor across the canvas to repel and rebound characters.',
        connectionText:
          'Direct prototype of the hero Fish-to-Birds typographic handoff system.',
        mediumLabel: 'Spring Glyph Canvas',
        parameters: [
          { label: 'Stiffness k', value: '0.14' },
          { label: 'Damping ζ', value: '0.80' },
          { label: 'Repel Radius', value: '95 px' }
        ]
      },
      {
        id: 'tp-pendulum',
        indexNum: 2,
        title: 'Stroke Cadence',
        tooltipCaption: 'Harmonograph curve · natural easing reference',
        kind: 'image',
        imageSrc: pendulumImg,
        imageAlt: 'Brass harmonograph tracing rhythmic curves in sand',
        layout: { xPct: 48, yPct: 14, wPct: 28, aspect: '3 / 4', z: 2 },
        aboutText:
          'Mechanical trace demonstrating how physical inertia produces natural acceleration and deceleration curves.',
        connectionText:
          'Informs the custom cubic-bezier(0.16, 1, 0.3, 1) settling curves used across modals and tooltips.',
        mediumLabel: 'Analog Motion Study',
        parameters: [
          { label: 'Easing', value: '0.16,1,0.3,1' },
          { label: 'Duration', value: '220 ms' },
          { label: 'Decay', value: 'Exponential' }
        ]
      },
      {
        id: 'tp-scope',
        indexNum: 3,
        title: 'Overshoot Envelope',
        tooltipCaption: 'Oscilloscope trace · underdamped vs critical',
        kind: 'image',
        imageSrc: vermilionScopeImg,
        imageAlt: 'Red oscilloscope trace showing harmonic damping envelope',
        layout: { xPct: 54, yPct: 58, wPct: 26, aspect: '4 / 3', z: 3 },
        aboutText:
          'Oscilloscope waveform visualizing step-response ringing versus critically damped settling.',
        connectionText:
          'Helps calibrate spring damping so interactive typography feels lively without shimmering.',
        mediumLabel: 'Signal Envelope Print',
        parameters: [
          { label: 'Overshoot', value: '< 3%' },
          { label: 'Bandwidth', value: '60–120 Hz' },
          { label: 'Phase', value: 'Locked' }
        ]
      },
      {
        id: 'tp-radar',
        indexNum: 4,
        title: 'Magnetic Radius',
        tooltipCaption: 'Polar influence kernel · interactive falloff',
        kind: 'canvas-radar',
        layout: { xPct: 12, yPct: 58, wPct: 24, aspect: '4 / 3', z: 3 },
        aboutText:
          'Visualizes radial force falloff around the pointer using smooth inverse-square attenuation.',
        connectionText:
          'Powers magnetic hover attraction and repulsion on both arc nodes and glyph particles.',
        mediumLabel: 'Interactive Kernel Canvas',
        parameters: [
          { label: 'Falloff', value: 'Smoothstep' },
          { label: 'Core R', value: '110 px' },
          { label: 'Latency', value: '< 1 ms' }
        ]
      },
      {
        id: 'tp-cloth',
        indexNum: 5,
        title: 'Pennant Tension',
        tooltipCaption: 'Verlet constraint mesh · tactile drag test',
        kind: 'canvas-cloth',
        layout: { xPct: 72, yPct: 30, wPct: 18, aspect: '1 / 1', z: 5 },
        aboutText:
          'Interactive cloth mesh testing constraint stiffness alongside typographic springs.',
        connectionText:
          'Shares the same lightweight animation loop architecture used across the studio.',
        mediumLabel: 'Verlet Cloth Canvas',
        parameters: [
          { label: 'Iterations', value: '5' },
          { label: 'Wind', value: 'Stochastic' },
          { label: 'DPR', value: 'Up to 2×' }
        ]
      }
    ]
  },
  {
    id: 'acoustic-standing-waves',
    slug: 'acoustics',
    title: 'Standing Waves',
    subtitle: 'Beat envelopes, Chladni interference & CRT phosphor traces',
    introLabel: 'Visualizing resonant modes across membrane and phosphor surfaces.',
    codeInput: `// 2D Chladni nodal mode equation
const mode = (m, n, x, y) =>
  Math.cos(n * Math.PI * x) * Math.cos(m * Math.PI * y) -
  Math.cos(m * Math.PI * x) * Math.cos(n * Math.PI * y);
const nodal = Math.abs(mode(3, 5, u, v)) < threshold;`,
    codeOutput: `Eigenmodes:      (m=3, n=5)
Nodal Line Width: 1.4 px antialiased
Carrier Freq:    440 Hz + 2.5 Hz detune
Envelope Period: 400 ms beat cycle`,
    narrative: [
      'When two pure tones differ by just a couple of hertz, their phase drifts continuously between reinforcement and cancellation. On an oscilloscope, the trace breathes slowly like an acoustic tide.',
      'By sampling nodal equations onto both pixel fields and ASCII grids, invisible resonant geometry turns into crisp visual topography.'
    ],
    labNotes: [
      'Superposition requires O(k) trigonometric evaluations per cell for k wave emitters.',
      'Duotone vermilion LUT mapping preserves stark editorial contrast across dark and light paper.'
    ],
    annotation: {
      viewBox: '0 0 1000 720',
      pathD: 'M 200 320 C 310 210, 480 205, 600 305 C 675 370, 740 410, 800 385',
      arrowD: 'M 789 378 L 803 384 L 793 396',
      labelText: '440Hz',
      labelX: 745,
      labelY: 350
    },
    artifacts: [
      {
        id: 'as-scope',
        indexNum: 1,
        title: 'Phosphor Beat Envelope',
        tooltipCaption: 'Analog CRT trace · harmonic interference envelope',
        kind: 'image',
        imageSrc: vermilionScopeImg,
        imageAlt: 'Vermilion oscilloscope screen displaying standing wave modulation',
        layout: { xPct: 18, yPct: 16, wPct: 35, aspect: '4 / 3', z: 3 },
        aboutText:
          'Long-exposure capture of two sine oscillators beating against each other on a Tektronix CRT grid.',
        connectionText:
          'Serves as the primary acoustic timing study for harmonic easing curves.',
        mediumLabel: 'Vermilion Darkroom Print',
        parameters: [
          { label: 'Carrier', value: '440.0 Hz' },
          { label: 'Modulator', value: '442.5 Hz' },
          { label: 'Exposure', value: '1/4 sec' }
        ]
      },
      {
        id: 'as-cyan',
        indexNum: 2,
        title: 'Dual-Source Interference',
        tooltipCaption: 'Concentric phase cancellation · cyanotype plate',
        kind: 'image',
        imageSrc: cobaltWaveImg,
        imageAlt: 'Cyanotype print showing dual source concentric ripples',
        layout: { xPct: 48, yPct: 18, wPct: 26, aspect: '3 / 4', z: 2 },
        aboutText:
          'Two coherent wave emitters creating alternating constructive crests and quiescent nodal hyperbolas.',
        connectionText:
          'Demonstrates spatial interference identical to the live ASCII matrix below.',
        mediumLabel: 'Cobalt Cyanotype',
        parameters: [
          { label: 'Phase Δφ', value: '0 rad' },
          { label: 'Coherence', value: 'Locked' },
          { label: 'Stock', value: '300gsm Rag' }
        ]
      },
      {
        id: 'as-ascii',
        indexNum: 3,
        title: 'Nodal Character Grid',
        tooltipCaption: 'Interactive wave matrix · move cursor as 2nd source',
        kind: 'canvas-ascii',
        layout: { xPct: 38, yPct: 54, wPct: 24, aspect: '1 / 1', z: 5 },
        aboutText:
          'Live two-source interference calculator rendered in Paper Mono density glyphs; your pointer acts as the movable second emitter.',
        connectionText:
          'Lets you physically sweep the cursor to watch nodal lines bend in real time.',
        mediumLabel: 'Live ASCII Canvas',
        parameters: [
          { label: 'Emitter 1', value: 'Fixed (0.35, 0.5)' },
          { label: 'Emitter 2', value: 'Pointer' },
          { label: 'Frame Rate', value: '60 fps' }
        ]
      },
      {
        id: 'as-radar',
        indexNum: 4,
        title: 'Polar Phase Scope',
        tooltipCaption: 'Harmonic phase radar · interactive resonance',
        kind: 'canvas-radar',
        layout: { xPct: 12, yPct: 56, wPct: 23, aspect: '4 / 3', z: 4 },
        aboutText:
          'Rotational phase detector sweeping across harmonic radial bands.',
        connectionText:
          'Complements Cartesian oscilloscope sweeps with circular Lissajous phase space.',
        mediumLabel: 'Polar Scope Canvas',
        parameters: [
          { label: 'Bands', value: '4 rings' },
          { label: 'Nodes', value: '16 harmonic' },
          { label: 'Pointer', value: 'Repel' }
        ]
      },
      {
        id: 'as-pendulum',
        indexNum: 5,
        title: 'Sand Nodal Trace',
        tooltipCaption: 'Mechanical resonance · 3:2 sand pattern',
        kind: 'image',
        imageSrc: pendulumImg,
        imageAlt: 'Brass pendulum drawing concentric nodal pattern in sand',
        layout: { xPct: 68, yPct: 44, wPct: 22, aspect: '3 / 4', z: 3 },
        aboutText:
          'Silica sand grains settling along low-amplitude paths of a mechanical oscillator.',
        connectionText:
          'Physical analog to Chladni plate nodal stabilization.',
        mediumLabel: '35mm Studio Plate',
        parameters: [
          { label: 'Ratio', value: '3 : 2' },
          { label: 'Grain', value: 'Fine Silica' },
          { label: 'Decay', value: 'Viscous' }
        ]
      }
    ]
  },
  {
    id: 'curl-morphogenesis',
    slug: 'morphogenesis',
    title: 'Fluid Morphogenesis',
    subtitle: 'Advected ink ribbons, boundary wakes & continuous flow',
    introLabel: 'Sculpting organic gradients from divergence-free vector fields.',
    codeInput: `// Smooth 2D curl advection
const eps = 0.001;
const n1 = potential(x, y + eps, t);
const n2 = potential(x, y - eps, t);
const vx = (n1 - n2) / (2 * eps);
const vy = -(potential(x + eps, y, t) - potential(x - eps, y, t)) / (2 * eps);`,
    codeOutput: `Vector Field:    Smooth 2D Curl
Particle Lifespan: 120 frames
Trail Blending:  0.045 alpha decay
Vorticity Gain:  Pointer-coupled`,
    narrative: [
      'Natural growth patterns—wood grain, river deltas, marble veining—emerge when continuous velocity fields transport pigment slowly over time.',
      'Computing the curl of a scalar potential guarantees particles swirl smoothly around eddies without collapsing into single pixels.'
    ],
    labNotes: [
      'Persistent trail buffer avoids storing thousands of historical polyline vertices.',
      'Pointer proximity injects localized angular momentum into nearby streamlines.'
    ],
    annotation: {
      viewBox: '0 0 1000 720',
      pathD: 'M 220 480 C 280 350, 390 240, 520 220 C 650 200, 720 290, 765 400',
      arrowD: 'M 753 392 L 767 403 L 771 386',
      labelText: '∂Ψ/∂n',
      labelX: 774,
      labelY: 416
    },
    artifacts: [
      {
        id: 'cm-flow',
        indexNum: 1,
        title: 'Ink Advection Field',
        tooltipCaption: 'Interactive curl ribbons · move cursor to swirl',
        kind: 'canvas-flow',
        layout: { xPct: 20, yPct: 14, wPct: 35, aspect: '3 / 4', z: 3 },
        aboutText:
          'Fifty-eight ink ribbons continuously advected across a curl field with pointer-induced swirl.',
        connectionText:
          'Primary kinetic surface studying continuous non-intersecting fluid paths.',
        mediumLabel: 'Advection Canvas',
        parameters: [
          { label: 'Ribbons', value: '58' },
          { label: 'Step Size', value: '0.007' },
          { label: 'Decay', value: '0.045' }
        ]
      },
      {
        id: 'cm-cyan',
        indexNum: 2,
        title: 'Caustic Basin',
        tooltipCaption: 'Optical ripple refraction · cobalt print',
        kind: 'image',
        imageSrc: cobaltWaveImg,
        imageAlt: 'Cobalt blue cyanotype of fluid caustics',
        layout: { xPct: 48, yPct: 26, wPct: 27, aspect: '3 / 4', z: 2 },
        aboutText:
          'Cyanotype print showing refracted light concentrating along curved fluid wavefronts.',
        connectionText:
          'Natural physical counterpart to algorithmic streamline clustering.',
        mediumLabel: 'Cyanotype Contact Print',
        parameters: [
          { label: 'Refraction', value: 'Optical' },
          { label: 'Pigment', value: 'Cobalt' },
          { label: 'Format', value: '3 : 4' }
        ]
      },
      {
        id: 'cm-cloth',
        indexNum: 3,
        title: 'Aerodynamic Shear',
        tooltipCaption: 'Verlet fabric flutter · gust response',
        kind: 'canvas-cloth',
        layout: { xPct: 12, yPct: 50, wPct: 22, aspect: '1 / 1', z: 5 },
        aboutText:
          'Pinned cloth grid responding to harmonic wind gusts and direct pointer deflection.',
        connectionText:
          'Couples fluid turbulence forces directly onto a discrete constraint mesh.',
        mediumLabel: 'Verlet Cloth Canvas',
        parameters: [
          { label: 'Grid', value: '10 × 8' },
          { label: 'Passes', value: '5' },
          { label: 'Drag', value: '0.96' }
        ]
      },
      {
        id: 'cm-contour',
        indexNum: 4,
        title: 'Streamfunction Map',
        tooltipCaption: 'Scalar potential isolines · vector survey',
        kind: 'image',
        imageSrc: contourFieldImg,
        imageAlt: 'Topographic ink isolines and direction vectors',
        layout: { xPct: 62, yPct: 54, wPct: 24, aspect: '1 / 1', z: 4 },
        aboutText:
          'Closed contour isolines charting constant scalar potential across a continuous domain.',
        connectionText:
          'Particles advected by curl(Ψ) follow these exact contour lines.',
        mediumLabel: 'Archival Survey Sheet',
        parameters: [
          { label: 'Isolines', value: '10m step' },
          { label: 'Vectors', value: 'Tangent' },
          { label: 'Paper', value: 'Warm Rag' }
        ]
      },
      {
        id: 'cm-boids',
        indexNum: 5,
        title: 'Vortex Swarm',
        tooltipCaption: 'Interactive swarm steering · pointer avoidance',
        kind: 'canvas-boids',
        layout: { xPct: 58, yPct: 8, wPct: 22, aspect: '4 / 3', z: 4 },
        aboutText:
          'Autonomous agents navigating through the ambient flow field while maintaining local spacing.',
        connectionText:
          'Blends discrete agent steering with continuous fluid advection.',
        mediumLabel: 'Boids Canvas',
        parameters: [
          { label: 'Agents', value: '64' },
          { label: 'Cohesion', value: '0.7' },
          { label: 'Avoidance', value: 'Pointer' }
        ]
      }
    ]
  },
  {
    id: 'spatial-cartography',
    slug: 'cartography',
    title: 'Spatial Cartography',
    subtitle: 'Delaunay triangulation, quadtree culling & drafting geometry',
    introLabel: 'Mapping dense interactive scenes onto calm paper grids.',
    codeInput: `// Spatial Quadtree viewport query
function queryRange(node, viewport, out = []) {
  if (!intersects(node.bounds, viewport)) return out;
  for (const pt of node.points) {
    if (contains(viewport, pt)) out.push(pt);
  }
  if (node.divided) node.children.forEach(c => queryRange(c, viewport, out));
  return out;
}`,
    codeOutput: `Total Nodes:     5,000+ indexed
Visible Culling: ~18–24 per frame
Query Latency:   0.35 ms average
Grid Snap:       24 px hairline module`,
    narrative: [
      'Infinite canvases stay responsive only when invisible geometry is culled before draw calls ever touch the GPU. Quadtrees partition 2D space recursively so panning through thousands of nodes feels as immediate as sliding paper across a drafting table.',
      'Combining survey triangulation with interactive glyph grids turns raw spatial indexing into an expressive editorial medium.'
    ],
    labNotes: [
      'Hierarchical bounding checks skip 98% of off-screen elements during rapid trackpad pans.',
      'Hairline drafting guides anchor spatial memory without competing with foreground content.'
    ],
    annotation: {
      viewBox: '0 0 1000 720',
      pathD: 'M 230 220 L 470 185 L 680 340 L 380 510 Z',
      arrowD: 'M 372 496 L 380 510 L 395 504',
      labelText: 'ΔT',
      labelX: 694,
      labelY: 344
    },
    artifacts: [
      {
        id: 'sc-contour',
        indexNum: 1,
        title: 'Triangulation Survey',
        tooltipCaption: 'Archival triangulation · baseline A–B geometry',
        kind: 'image',
        imageSrc: contourFieldImg,
        imageAlt: 'Topographic triangulation survey sheet on warm rag paper',
        layout: { xPct: 24, yPct: 16, wPct: 36, aspect: '1 / 1', z: 3 },
        aboutText:
          'Surveyor drafting sheet combining Delaunay-like triangulation networks with dense topographic contour lines.',
        connectionText:
          'Historical blueprint for geometric spatial partitioning in interactive canvases.',
        mediumLabel: 'Archival Survey Print',
        parameters: [
          { label: 'Stations', value: 'T.P. 14–17' },
          { label: 'Scale', value: '1 : 10,000' },
          { label: 'Grid', value: 'Triangulated' }
        ]
      },
      {
        id: 'sc-glyph',
        indexNum: 2,
        title: 'Elastic Coordinate Grid',
        tooltipCaption: 'Interactive spring coordinates · sweep cursor',
        kind: 'canvas-glyph',
        layout: { xPct: 50, yPct: 22, wPct: 30, aspect: '4 / 3', z: 4 },
        aboutText:
          'A deformable lattice of monospaced coordinate markers snapping smoothly back to grid intersections.',
        connectionText:
          'Demonstrates tactile spatial feedback when dragging nodes across a coordinate plane.',
        mediumLabel: 'Spring Lattice Canvas',
        parameters: [
          { label: 'Lattice', value: '7 × 5' },
          { label: 'Stiffness', value: '0.14' },
          { label: 'Snap', value: 'Critical' }
        ]
      },
      {
        id: 'sc-radar',
        indexNum: 3,
        title: 'Range Query Sweep',
        tooltipCaption: 'Polar spatial scan · interactive node hits',
        kind: 'canvas-radar',
        layout: { xPct: 12, yPct: 48, wPct: 25, aspect: '4 / 3', z: 5 },
        aboutText:
          'Polar range scanner illuminating active spatial nodes within a rotating query cone.',
        connectionText:
          'Visualizes real-time spatial culling and pointer proximity detection.',
        mediumLabel: 'Polar Scanner Canvas',
        parameters: [
          { label: 'Query Cone', value: '0.55 rad' },
          { label: 'Nodes', value: '16 active' },
          { label: 'Latency', value: '0.35 ms' }
        ]
      },
      {
        id: 'sc-scope',
        indexNum: 4,
        title: 'Signal Horizon',
        tooltipCaption: 'Vermilion telemetry print · waveform calibration',
        kind: 'image',
        imageSrc: vermilionScopeImg,
        imageAlt: 'Vermilion oscilloscope calibration trace',
        layout: { xPct: 56, yPct: 58, wPct: 25, aspect: '4 / 3', z: 3 },
        aboutText:
          'Calibration trace verifying sub-millisecond timing across spatial index updates.',
        connectionText:
          'Documents frame-budget discipline during dense viewport pans.',
        mediumLabel: 'Duotone Calibration Plate',
        parameters: [
          { label: 'Frame Target', value: '16.6 ms' },
          { label: 'Measured', value: '2.1 ms' },
          { label: 'Sync', value: '120 Hz' }
        ]
      },
      {
        id: 'sc-boids',
        indexNum: 5,
        title: 'Spatial Hash Agents',
        tooltipCaption: 'O(1) neighbor lookup · 64 moving agents',
        kind: 'canvas-boids',
        layout: { xPct: 14, yPct: 14, wPct: 23, aspect: '4 / 3', z: 2 },
        aboutText:
          'Moving agents querying spatial grid cells to avoid collisions in real time.',
        connectionText:
          'Applies spatial indexing directly to continuous 60fps flocking physics.',
        mediumLabel: 'Spatial Hash Canvas',
        parameters: [
          { label: 'Agents', value: '64' },
          { label: 'Lookup', value: 'O(1) cell' },
          { label: 'Radius', value: '56 px' }
        ]
      }
    ]
  }
];
