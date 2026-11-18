export type SkillKind = 'visual' | 'workflow';
export type SkillCategory = 'portrait' | 'workflow';

export interface SkillConstraint {
  label: string;
  detail: string;
}

export interface PortfolioSkill {
  id: string;
  slug: string;
  indexLabel: string;
  tabLabel: string;
  shortCn: string;
  taglineCn: string;
  category: SkillCategory;
  categoryTitleCn: string;
  categoryEn: string;
  kind: SkillKind;
  kindLabel: string;
  outputTag: string;
  title: string;
  subtitle: string;
  constraints: SkillConstraint[];
  recipeMarkdown: string;
  promptTemplate: string;
  usageSnippet: string;
  workflowDiff?: {
    inputLabel: string;
    inputText: string;
    outputLabel: string;
    outputLines: { text: string; highlight?: string; after?: string }[];
  };
}

export const PORTFOLIO_SKILLS: PortfolioSkill[] = [
  {
    id: 'wool-felt',
    slug: 'wool-felt',
    indexLabel: '01',
    tabLabel: 'Wool Felt',
    shortCn: '毛毡玩偶风',
    taglineCn: '人像照片转立体手作羊毛针绒玩偶',
    category: 'portrait',
    categoryTitleCn: '人像与艺术转绘',
    categoryEn: 'Portrait & Avatar Art',
    kind: 'visual',
    kindLabel: 'Visual Style Skill',
    outputTag: 'WOOL FELT · SKILL',
    title: 'Wool Felt Craft',
    subtitle:
      'Transforms crisp photos and characters into tactile needle-felted wool miniatures with warm subsurface fuzz and gentle studio bounce light.',
    constraints: [
      {
        label: 'Preserve silhouette',
        detail:
          'Simplify fine micro-textures into soft felted volume without losing key identity traits.'
      },
      {
        label: 'Fiber halo',
        detail:
          'Add delicate stray wool hairs along warm rim highlights for physical materiality.'
      },
      {
        label: 'Zero harsh blacks',
        detail:
          'Lift deep shadows into warm charcoal-espresso tones so surfaces stay plush and matte.'
      }
    ],
    recipeMarkdown: `---
name: wool-felt-craft
version: 1.2.0
medium: needle-felted wool miniature
---

## Core Invariants
- Soften hard edges into matte carded wool fibers (0% glossy plastic)
- Warm tabletop overhead key light + ivory paper studio backdrop
- Preserve original pose, focal expression & primary color balance
- Rim fuzz: subtle 1–2px stray wool wisps around silhouettes`,
    promptTemplate: `Restyle the input image as a handmade needle-felted wool miniature sculpture.
Render tactile fuzzy wool fibers, delicate stray wisps along silhouette edges, rounded plush volumes, soft shadow falloff, and warm overhead tabletop lighting against a calm cream paper backdrop.`,
    usageSnippet: `# Invoke in AI agent / image pipeline
/skill wool-felt-craft --input ./photo.png

# Showroom Live Bench
Drop any PNG / JPG onto the left frame
to preview the tactile wool & tonal pass.`
  },
  {
    id: 'pastel-doll',
    slug: 'pastel-doll',
    indexLabel: '02',
    tabLabel: 'Pastel Doll',
    shortCn: '粉彩娃娃风',
    taglineCn: '人像照片转柔焦陶瓷 bisque 粉彩手办',
    category: 'portrait',
    categoryTitleCn: '人像与艺术转绘',
    categoryEn: 'Portrait & Avatar Art',
    kind: 'visual',
    kindLabel: 'Visual Style Skill',
    outputTag: 'PASTEL DOLL · SKILL',
    title: 'Pastel Doll Portrait',
    subtitle:
      'Reimagines portraits and objects in a dreamy bisque-pastel figurine aesthetic—powdery peach blush, airy highlights, and creamy low-contrast harmony.',
    constraints: [
      {
        label: 'Powdery matte finish',
        detail:
          'Porcelain-chalk softness with warm coral-pink cheek and nose blush.'
      },
      {
        label: 'Pastel color lock',
        detail:
          'Compress harsh primaries into airy cream, sky-blue, and butter-yellow tones.'
      },
      {
        label: 'Gentle catchlights',
        detail:
          'Keep eyes luminous while maintaining calm, quiet studio restraint.'
      }
    ],
    recipeMarkdown: `---
name: pastel-doll-portrait
version: 1.0.4
medium: matte bisque & soft pastel chalk
---

## Color Guardrails
- Lift shadow floor above #3B3330 (no muddy blacks)
- Infuse +18% rosy warmth across midtone highlights
- Compress high-frequency noise into powdery matte grain
- Zero HDR halos or neon rim saturation`,
    promptTemplate: `Transform the input into a delicate pastel doll figurine portrait.
Use powdery matte bisque textures, soft peach-coral blush, dreamy lifted shadows, airy pastel color harmony, and gentle diffused studio rim light.`,
    usageSnippet: `# Invoke in AI agent / image pipeline
/skill pastel-doll-portrait --input ./portrait.jpg

# Showroom Live Bench
Upload a portrait or switch samples on the left
to inspect the pastel tone curve in Split view.`
  },
  {
    id: 'design-restraint',
    slug: 'design-restraint',
    indexLabel: '03',
    tabLabel: 'UI Restraint',
    shortCn: 'UI 审美审查',
    taglineCn: '自然语言需求转确定性设计规范与 Token',
    category: 'workflow',
    categoryTitleCn: '工程与工作流助手',
    categoryEn: 'Workflow & Engineering',
    kind: 'workflow',
    kindLabel: 'Workflow Engineering Skill',
    outputTag: 'WORKFLOW · DIFF',
    title: 'Design Restraint Audit',
    subtitle:
      'Engineering workflow skill: enforces warm editorial color tokens, spring curves, and anti-slop discipline across frontend components.',
    constraints: [
      {
        label: 'Same bench, zero drift',
        detail:
          'Non-visual skills swap the image scrubber into a structured Input → Output diff.'
      },
      {
        label: 'Deterministic tokens',
        detail:
          'Rejects dark-mode drift, neon gradients, and decorative pill clutter.'
      },
      {
        label: 'Portable SKILL.md',
        detail:
          'Copy or download directly into coding agents and design-review pipelines.'
      }
    ],
    recipeMarkdown: `---
name: design-restraint-audit
version: 2.1.0
category: engineering-workflow
---

## Hard Rejections
- NO dark mode toggles or slate background flips
- NO generic 3-column Bento box dashboards
- NO linear CSS transitions on tactile controls
- Enforce #FEFCF8 canvas + Space Grotesk / Paper Mono pairing`,
    promptTemplate: `Audit the proposed UI specification against design.md invariants.
Replace arbitrary colors with Warm Editorial Triad tokens (#FEFCF8, #1E63D6, #FCE055, #EF4E5E) and convert linear timing into damped spring physics.`,
    usageSnippet: `# Attach to code review or frontend agent
/skill design-restraint-audit ./src/components

# Output Contract
Produces deterministic token mappings and
spring curve replacements without layout bloat.`,
    workflowDiff: {
      inputLabel: 'RAW INPUT — Unstructured UI Prompt',
      inputText:
        'Build a dark-mode SaaS analytics dashboard card with purple AI gradients, 3 floating pill status badges, and linear spin loaders.',
      outputLabel: 'DETERMINISTIC OUTPUT — Applied `design-restraint` Skill',
      outputLines: [
        {
          text: '- Surface: ',
          highlight: '#FEFCF8',
          after: ' warm ivory + 1px #E5E7EB hairline (dark mode rejected)'
        },
        {
          text: '- Typography: ',
          highlight: 'Space Grotesk',
          after: ' heading + Paper Mono tabular numerals'
        },
        {
          text: '- Motion: ',
          highlight: 'spring(320, 22)',
          after: ' hover lift; zero decorative pill clutter'
        }
      ]
    }
  }
];
