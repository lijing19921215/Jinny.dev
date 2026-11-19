import arcMotionImg from '../assets/images/arc-motion.jpg';
import arcWorkImg from '../assets/images/arc-work.jpg';

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
  kind: SkillKind;
  kindLabel: string;
  title: string;
  subtitle: string;
  deskObjectLabel: string;
  previewImage?: string;
  previewAlt?: string;
  mediumNote: string;
  aspectNote: string;
  constraints: SkillConstraint[];
  recipeMarkdown: string;
  promptTemplate: string;
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
    kind: 'visual',
    kindLabel: 'Visual Style Skill',
    title: 'Wool Felt Craft',
    subtitle:
      '将人像与角色转化为具有真实羊毛纤维触感的手作针毡玩偶，保留神态轮廓的同时柔化硬边缘与塑料高光。',
    deskObjectLabel: '羊毛毡相框',
    previewImage: arcMotionImg,
    previewAlt: 'Needle-felted wool miniature portrait against cobalt backdrop',
    mediumNote: 'Needle-felted wool · Cobalt studio backdrop',
    aspectNote: 'Hover artwork to inspect wool fiber details at 2.2x',
    constraints: [
      {
        label: '保留神态特征',
        detail:
          '简化写实皮肤纹理为柔和的羊毛团块体积，但保留发丝分线、唇形与眼神焦点。'
      },
      {
        label: '边缘微绒光晕',
        detail:
          '在肩颈与发丝逆光处保留 1–2px 细腻杂乱羊毛绒毛，强化真实物理材质感。'
      },
      {
        label: '零塑料反光',
        detail:
          '压低高光锐度并将最深阴影抬升至暖深棕，保证画面呈哑光织物温度。'
      }
    ],
    recipeMarkdown: `---
name: wool-felt-craft
version: 1.2.0
medium: needle-felted wool miniature
---

## Core Invariants
- Soften hard edges into matte carded wool fibers (0% glossy plastic)
- Warm tabletop overhead key light + solid cobalt or ivory studio backdrop
- Preserve original pose, focal expression & primary color balance
- Rim fuzz: subtle stray wool wisps around silhouettes`,
    promptTemplate: `Restyle the input portrait as a handmade needle-felted wool miniature sculpture.
Render tactile fuzzy wool fibers, delicate stray wisps along silhouette edges, rounded plush volumes, soft blush on cheeks and nose, and warm diffused studio lighting against a clean deep cobalt blue backdrop.`
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
    kind: 'visual',
    kindLabel: 'Visual Style Skill',
    title: 'Pastel Doll Portrait',
    subtitle:
      '为写实肖像注入素烧瓷偶与粉彩画的柔焦呼吸感——清透蓝灰瞳孔、鼻尖微晕桃红、低对比奶油质感。',
    deskObjectLabel: '粉彩娃娃立牌',
    previewImage: arcWorkImg,
    previewAlt: 'Bisque pastel doll portrait with luminous blue eyes and peach blush',
    mediumNote: 'Matte bisque porcelain · Soft chalk pastel',
    aspectNote: 'Hover artwork to inspect powdery blush shading at 2.2x',
    constraints: [
      {
        label: '粉雾哑光肌理',
        detail:
          '用细腻素描纸粒与素烧瓷质感替代油腻平滑磨皮，脸颊与鼻尖点缀蜜桃粉晕染。'
      },
      {
        label: '情绪克制配色',
        detail:
          '收敛刺眼高饱和色，让发丝墨黑、深衣领与清澈钴蓝眼眸形成沉静反差。'
      },
      {
        label: '微光眼神点睛',
        detail:
          '眼白与虹膜保留透亮弧光与细长睫毛轮廓，让静止构图依然具备生命力。'
      }
    ],
    recipeMarkdown: `---
name: pastel-doll-portrait
version: 1.0.4
medium: matte bisque & soft pastel chalk
---

## Color Guardrails
- Keep porcelain ivory skin smooth yet finely textured like pastel paper
- Infuse soft peach-coral blush across cheekbones and bridge of nose
- Luminous cobalt-blue iris catchlights with delicate upper lash strokes
- Zero harsh HDR contrast or neon rim saturation`,
    promptTemplate: `Transform the input portrait into a delicate bisque pastel doll illustration.
Use matte pastel-paper textures, luminous blue eyes with soft catchlights, subtle peach-coral blush on cheeks and nose tip, fine stray hair strands, and quiet editorial contrast.`
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
    kind: 'workflow',
    kindLabel: 'Workflow Engineering Skill',
    title: 'Design Restraint Audit',
    subtitle:
      '工作流工程 Skill：在 AI 编写前端界面前自动拦截暗黑渐变、胶囊徽章堆砌与线性生硬动效，映射为暖纸编辑部规范。',
    deskObjectLabel: '桌面笔记本工作台',
    mediumNote: 'Engineering Workflow · Deterministic Design Tokens',
    aspectNote: 'Before / After deterministic specification diff',
    constraints: [
      {
        label: '拒绝同质模板',
        detail:
          '自动识别并拒绝深色霓虹渐变、三栏 Bento 仪表盘与装饰性圆角状态标签。'
      },
      {
        label: '统一色彩与字体',
        detail:
          '强制收敛至 #FEFCF8 暖纸白基底，搭配 Space Grotesk 与 Paper Mono 等宽系统。'
      },
      {
        label: '真实物理动效',
        detail:
          '将生硬的线性 CSS transition 替换为带阻尼回弹的物理弹簧曲线。'
      }
    ],
    recipeMarkdown: `---
name: design-restraint-audit
version: 2.1.0
category: engineering-workflow
---

## Hard Rejections
- NO unsolicited dark mode toggles or slate background flips
- NO generic 3-column Bento box dashboards
- NO linear CSS transitions on tactile controls
- Enforce #FEFCF8 canvas + Space Grotesk / Paper Mono pairing`,
    promptTemplate: `Audit the proposed UI specification against design.md invariants.
Replace arbitrary colors with Warm Editorial Triad tokens (#FEFCF8, #1E63D6, #FCE055, #EF4E5E) and convert linear timing into damped spring physics.`,
    workflowDiff: {
      inputLabel: 'Raw Prompt — Unstructured UI Request',
      inputText:
        'Build a dark-mode SaaS analytics dashboard card with purple AI gradients, 3 floating pill status badges, and linear spin loaders.',
      outputLabel: 'Deterministic Output — Applied Design Restraint Skill',
      outputLines: [
        {
          text: 'Surface: ',
          highlight: '#FEFCF8',
          after: ' warm ivory + 1px #E5E7EB hairline (dark drift rejected)'
        },
        {
          text: 'Typography: ',
          highlight: 'Space Grotesk',
          after: ' display hierarchy + Paper Mono tabular numbers'
        },
        {
          text: 'Motion: ',
          highlight: 'spring(320, 22)',
          after: ' tactile lift; zero decorative pill clutter'
        }
      ]
    }
  }
];
