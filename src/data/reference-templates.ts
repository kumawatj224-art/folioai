/**
 * Reference Templates for Portfolio Generation
 * 
 * These are production-quality HTML templates that the AI should use as
 * references when generating portfolios. Each template has been carefully
 * designed with proper structure, animations, and styling.
 * 
 * The AI should:
 * 1. Match the CSS structure and class naming conventions
 * 2. Follow the section ordering and layout patterns
 * 3. Use the same animation and interaction patterns
 * 4. Adapt colors/fonts based on chosen template style
 */

/**
 * Template 1: Enterprise Dark (Amber Accents)
 * Best for: Experienced professionals, ML engineers, senior devs
 * Style: Premium corporate, serif headlines, amber/gold accents
 * 
 * Key elements:
 * - Serif font (Fraunces) for headlines, sans (Epilogue) for body
 * - Near-black background (#07080c) with amber accents (#f59e0b)
 * - Company cards with colored dots in hero sidebar
 * - Skills ticker with ✦ separators
 * - "Open to opportunities" badge with pulsing dot
 * - Experience cards with 2-column grid layout
 */
export const ENTERPRISE_DARK_REFERENCE = `
<!-- ENTERPRISE DARK TEMPLATE STRUCTURE -->

<!-- CSS Variables -->
:root{
  --bg:#07080c;--s1:#0d0f15;--s2:#13151d;--s3:#1a1d28;
  --border:rgba(255,255,255,0.06);--border2:rgba(255,255,255,0.1);
  --text:#f0ede8;--text2:#8a8890;--text3:#3d3d50;
  --amber:#f59e0b;--amber2:#fbbf24;--amber3:#fde68a;
  --green:#10b981;--blue:#3b82f6;--red:#f43f5e;
  --serif:'Fraunces',serif;--sans:'Epilogue',sans-serif;
}

<!-- Hero structure (2-column: content left, sidebar right) -->
<section class="hero">
  <div class="hero-left">
    <div class="hero-chip">💼 Open to opportunities</div>
    <h1 class="hero-name">
      FirstName<br/>
      <span class="ital">LastName</span><span class="accent">.</span>
    </h1>
    <p class="hero-tagline">Bio with <strong>key highlights</strong> emphasized</p>
    <div class="hero-actions">
      <a href="#projects" class="btn-primary">View work →</a>
      <a href="#contact" class="btn-ghost">Contact</a>
    </div>
  </div>
  <div class="hero-right">
    <!-- Company cards for experienced users -->
    <div class="company-item">
      <div class="co-dot"></div>
      <div><div class="co-name">Company <span class="badge-current">CURRENT</span></div>
      <div class="co-role">Role Title</div>
      <div class="co-period">Date Range</div></div>
    </div>
    <!-- Metrics grid -->
    <div class="hero-metrics">
      <div class="metric"><div class="metric-val">X+</div><div class="metric-key">Label</div></div>
    </div>
  </div>
</section>

<!-- Skills ticker -->
<div class="ticker-outer">
  <div class="ticker-inner">
    <span class="ti">Skill1</span><span class="ti-dot">✦</span>
    <span class="ti">Skill2</span><span class="ti-dot">✦</span>
  </div>
</div>

<!-- Experience section (2-column cards) -->
<section id="experience">
  <div class="exp-card">
    <div class="ec-left">
      <div class="ecl-co">Company</div>
      <div class="ecl-role">Role</div>
      <div class="ecl-date">Period</div>
      <div class="ecl-chips"><span class="ecl-chip">Tech</span></div>
    </div>
    <div class="ec-right">
      <div class="ec-hl"><div class="ec-dot"></div><div class="ec-text">Achievement with <strong>emphasis</strong></div></div>
    </div>
  </div>
</section>
`;

/**
 * Template 2: Brutalist (Bold & Editorial)
 * Best for: Full-stack devs, product engineers, design-aware devs
 * Style: Bold borders, cream/black contrast, red accents
 * 
 * Key elements:
 * - Display font (Anton) for giant headlines, sans (Barlow) for body
 * - Cream background (#f0ece3) with black ink and red accents (#d62828)
 * - 3px solid black borders everywhere
 * - Outlined + filled name treatment in hero
 * - Project rows with numbering (01, 02, 03)
 * - Geometric shapes (circles) as decorative elements
 */
export const BRUTALIST_REFERENCE = `
<!-- BRUTALIST TEMPLATE STRUCTURE -->

<!-- CSS Variables -->
:root{
  --bg:#f0ece3;--ink:#0f0d0a;--cream:#faf7f2;--white:#ffffff;
  --red:#d62828;--red2:#f77f00;--teal:#023e8a;
  --border:#0f0d0a;--muted:rgba(15,13,10,0.35);
  --display:'Anton',sans-serif;--body:'Barlow',sans-serif;
}

<!-- Navigation with thick borders -->
<nav style="height:70px;border-bottom:3px solid var(--border)">
  <div class="nav-brand">Name</div>
  <div class="nav-right">
    <a href="#projects" class="nav-link">Work</a>
    <a href="mailto:email" class="nav-cta">Hire me</a>
  </div>
</nav>

<!-- Hero (2-column: name left, education right) -->
<section class="hero" style="grid-template-columns:1fr 1fr;border-bottom:3px solid var(--border)">
  <div class="hero-left" style="border-right:3px solid var(--border)">
    <div class="hero-eyebrow"><div class="he-line"></div>Role · College</div>
    <h1 class="hero-name">
      <span class="hn-outline">FIRST</span><!-- outlined text -->
      <span class="hn-filled">LAST</span><!-- solid text -->
    </h1>
    <p class="hero-bio" style="border-left:3px solid var(--red)">Bio text</p>
    <div class="hero-btns">
      <a class="hbtn-solid">See my work</a>
      <a class="hbtn-hollow">Hire me →</a>
    </div>
  </div>
  <div class="hero-right">
    <div class="hr-top" style="background:var(--ink)"><!-- college info --></div>
    <div class="hr-stats" style="grid-template-columns:1fr 1fr 1fr">
      <div class="hr-stat"><div class="hs-num red">5</div><div class="hs-label">Projects</div></div>
    </div>
  </div>
</section>

<!-- Red skills ticker -->
<div class="ticker-section" style="background:var(--red);border:3px solid var(--border)">
  <div class="ticker"><span class="ti">Skill</span><span class="ti-sep">✦</span></div>
</div>

<!-- Projects as numbered rows -->
<section id="projects">
  <div class="sec-bar" style="background:var(--ink)">
    <span class="sec-bar-title">Selected Work</span>
    <span class="sec-bar-count">X Projects</span>
  </div>
  <div class="proj-row" style="grid-template-columns:80px 1fr auto;border-bottom:3px solid var(--border)">
    <div class="pr-num">01</div>
    <div class="pr-body">
      <div class="pr-type">Type · Category</div>
      <div class="pr-title">Project Name</div>
      <div class="pr-desc">Description</div>
      <div class="pr-impact">Impact metrics</div>
      <div class="pr-stack"><span class="prs">Tech</span></div>
    </div>
    <div class="pr-arrow">↗</div>
  </div>
</section>

<!-- Experience rows -->
<section id="experience">
  <div class="exp-row" style="grid-template-columns:220px 1fr;border-bottom:3px solid var(--border)">
    <div class="er-left" style="border-right:3px solid var(--border);background:var(--cream)">
      <div class="er-company">COMPANY</div>
      <div class="er-period">Period</div>
      <div class="er-tag">PRESENT</div><!-- if current -->
    </div>
    <div class="er-right">
      <div class="er-role">ROLE TITLE</div>
      <div class="er-point">→ Achievement with <strong>emphasis</strong></div>
    </div>
  </div>
</section>
`;

/**
 * Template 3: Gradient Dark (Modern & Animated)
 * Best for: Mobile devs, creative devs, startups
 * Style: Dark with animated blob shapes, teal/purple gradients
 * 
 * Key elements:
 * - Serif (Gloock) + sans (Karla) fonts
 * - Near-black (#06080e) with teal (#00c9b1) and purple (#8b5cf6) accents
 * - Animated morphing blob shapes in background
 * - Glassmorphism cards with blur
 * - Hero centered with stats cards below
 * - Featured project card (large) + smaller project grid
 * - Gradient buttons
 */
export const GRADIENT_DARK_REFERENCE = `
<!-- GRADIENT DARK TEMPLATE STRUCTURE -->

<!-- CSS Variables -->
:root{
  --bg:#06080e;--s1:#0a0d16;--s2:#0f1220;--s3:#141828;
  --border:rgba(255,255,255,0.06);--border2:rgba(255,255,255,0.1);
  --text:#eceef8;--text2:#7880a0;--text3:#3a4060;
  --teal:#00c9b1;--violet:#8b5cf6;--rose:#fb7185;--sky:#38bdf8;
  --serif:'Gloock',serif;--alt:'Instrument Serif',serif;--sans:'Karla',sans-serif;
}

<!-- Animated blob background -->
<div class="blob-wrap" style="position:fixed;inset:0;z-index:0">
  <div class="blob b1" style="filter:blur(90px);opacity:0.14;animation:morph 14s infinite"></div>
  <div class="blob b2"></div>
  <div class="blob b3"></div>
</div>

<!-- Centered hero with tag, name, bio, stats -->
<section class="hero" style="text-align:center;min-height:100vh">
  <div class="hero-tag" style="border-radius:100px;border:1px solid var(--border2)">
    <div class="ht-ring"></div>Role · College
  </div>
  <h1 class="hero-name" style="font-family:var(--serif)">
    <span class="hn-main">First</span>
    <span class="hn-italic" style="color:var(--teal);font-style:italic">Last</span>
  </h1>
  <div class="hero-role">Year · Department · Status</div>
  <p class="hero-bio">Bio with <strong>emphasis</strong></p>
  <div class="hero-actions">
    <a class="btn-grad" style="background:linear-gradient(135deg,var(--teal),var(--sky))">View work →</a>
    <a class="btn-glass" style="background:rgba(255,255,255,0.05);border:1px solid var(--border2)">Contact</a>
  </div>
  <div class="hero-stats" style="display:flex;gap:16px;justify-content:center">
    <div class="hstat" style="background:rgba(255,255,255,0.04);border-radius:18px">
      <div class="hs-val">Metric</div><div class="hs-key">Label</div>
    </div>
  </div>
</section>

<!-- Featured project (large) + smaller grid -->
<section id="projects">
  <div class="eyebrow" style="color:var(--teal)">Work</div>
  <h2 class="sec-title" style="font-family:var(--serif)">Apps I've <em>shipped</em></h2>
  
  <!-- Featured project (spans 2 columns) -->
  <div class="proj-featured" style="display:grid;grid-template-columns:1fr 1fr;border-radius:24px">
    <div>
      <div class="proj-platform"><span class="platform-dot"></span>Platform · Type</div>
      <div class="proj-title">Project Name</div>
      <div class="proj-desc">Description</div>
      <div class="proj-impact" style="color:var(--teal)">↑ Impact metrics</div>
      <div class="proj-stack"><span class="ps">Tech</span></div>
    </div>
    <div class="proj-metrics">
      <div class="pm-row"><div class="pm-val" style="color:var(--teal)">1.2M</div><div class="pm-label">Description</div></div>
    </div>
  </div>
  
  <!-- Smaller project cards -->
  <div class="proj-small-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
    <div class="proj-card" style="border-radius:22px;background:rgba(255,255,255,0.03)">
      <!-- gradient accent line at top on hover -->
    </div>
  </div>
</section>

<!-- Skills with emoji icons -->
<div class="skills-bg" style="background:rgba(255,255,255,0.02)">
  <div class="skills-grid">
    <div class="skill-card" style="border-radius:20px">
      <div class="sc-emoji">📱</div>
      <div class="sc-head">Category</div>
      <div class="sc-tags"><span class="sct">Skill</span></div>
    </div>
  </div>
</div>
`;

/**
 * All three reference templates with their names
 */
export const ALL_REFERENCE_TEMPLATES = [
  { name: 'enterprise-dark', reference: ENTERPRISE_DARK_REFERENCE },
  { name: 'brutalist', reference: BRUTALIST_REFERENCE },
  { name: 'gradient-dark', reference: GRADIENT_DARK_REFERENCE },
] as const;

/**
 * Randomly select one of the three reference templates
 * This ensures variety in generated portfolios
 */
export function getRandomReferenceTemplate(): { name: string; reference: string } {
  const randomIndex = Math.floor(Math.random() * ALL_REFERENCE_TEMPLATES.length);
  const selected = ALL_REFERENCE_TEMPLATES[randomIndex];
  console.log(`[Reference Template] Randomly selected: ${selected.name}`);
  return { name: selected.name, reference: selected.reference };
}

/**
 * Get the appropriate reference template based on template name
 * @deprecated Use getRandomReferenceTemplate() for random selection
 */
export function getReferenceTemplate(templateName: string): string {
  const templateMap: Record<string, string> = {
    'enterprise-dark': ENTERPRISE_DARK_REFERENCE,
    'brutalist': BRUTALIST_REFERENCE,
    'gradient-dark': GRADIENT_DARK_REFERENCE,
    // Map other templates to closest reference
    'terminal-dark': ENTERPRISE_DARK_REFERENCE, // Dark theme
    'editorial-light': BRUTALIST_REFERENCE, // Light with structure
    'minimal-warm': BRUTALIST_REFERENCE, // Light theme
    'minimal-dark': ENTERPRISE_DARK_REFERENCE, // Dark theme
    'macos-desktop': GRADIENT_DARK_REFERENCE, // Creative
    'bento-grid': GRADIENT_DARK_REFERENCE, // Modern cards
  };
  
  return templateMap[templateName] || ENTERPRISE_DARK_REFERENCE;
}

/**
 * Template style descriptions for AI to understand design intent
 */
export const TEMPLATE_STYLES: Record<string, {
  description: string;
  fonts: string;
  colors: string;
  heroStyle: string;
  projectStyle: string;
}> = {
  'enterprise-dark': {
    description: 'Premium corporate feel. Best for experienced professionals.',
    fonts: 'Fraunces (serif headlines) + Epilogue (sans body)',
    colors: 'bg #07080c, amber accents #f59e0b, text #f0ede8',
    heroStyle: '2-column: large name left, company cards + metrics right',
    projectStyle: 'Cards with colored accent bars, hover lift animation',
  },
  'brutalist': {
    description: 'Bold editorial style with strong borders. High contrast.',
    fonts: 'Anton (display headlines) + Barlow (body)',
    colors: 'bg #f0ece3 (cream), ink #0f0d0a, red accent #d62828',
    heroStyle: '2-column: outlined+filled name left, education box right',
    projectStyle: 'Numbered rows (01, 02) with thick borders, arrow indicator',
  },
  'gradient-dark': {
    description: 'Modern with animated shapes. Creative and dynamic.',
    fonts: 'Gloock (serif) + Karla (sans)',
    colors: 'bg #06080e, teal #00c9b1, violet #8b5cf6',
    heroStyle: 'Centered with animated blobs, stats cards below',
    projectStyle: 'Featured card (large) + smaller grid, gradient accents',
  },
  'terminal-dark': {
    description: 'Hacker aesthetic with terminal prompts.',
    fonts: 'Orbitron + Share Tech Mono',
    colors: 'bg #0d0d0d, accent #00ff88, text #c8e8f0',
    heroStyle: '$ whoami → [name] format, blinking cursor',
    projectStyle: 'Terminal-style cards with code prompts',
  },
  'editorial-light': {
    description: 'Magazine layout with serif elegance.',
    fonts: 'Playfair Display + DM Sans',
    colors: 'bg #faf8f4 (cream), accent #c8490a, ink #1a1614',
    heroStyle: 'Large italic serif name, scrolling ticker',
    projectStyle: 'Horizontal list with hover expansion',
  },
  'minimal-warm': {
    description: 'Japanese-inspired calm. Understated premium.',
    fonts: 'Gloock + Karla',
    colors: 'bg #f9f5ef (warm white), accent #b5441a, ink #2c2420',
    heroStyle: 'Generous whitespace, poetry-like bio',
    projectStyle: 'Simple cards with subtle borders',
  },
  'minimal-dark': {
    description: 'Clean developer-focused dark theme.',
    fonts: 'Inter + JetBrains Mono',
    colors: 'bg #0a0a0a, accent #3b82f6, text #fafafa',
    heroStyle: 'Clean centered layout, simple stats',
    projectStyle: 'Monochrome cards with blue accents',
  },
  'macos-desktop': {
    description: 'Interactive OS-style with dock and windows.',
    fonts: 'SF Pro Display (or Inter)',
    colors: 'bg #1e1e1e, accent #0a84ff, traffic lights',
    heroStyle: 'Desktop with menu bar, folder icons, dock',
    projectStyle: 'Window modals with close/minimize buttons',
  },
  'bento-grid': {
    description: 'Modern card grid like Apple website.',
    fonts: 'Plus Jakarta Sans',
    colors: 'bg #0a0a0a, card #141414, accent #f97316',
    heroStyle: 'Large hero card in grid, stats alongside',
    projectStyle: 'Varying card sizes (2x2, 1x1), orange accent lines',
  },
};
