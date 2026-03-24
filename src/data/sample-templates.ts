/**
 * Sample Portfolio Templates
 * 
 * Modern, visual portfolio templates designed for engineering students.
 * Focus on project showcases, visual galleries, and interactive elements.
 * These get seeded into the database via /api/templates/seed
 */

import type { CreateTemplateInput } from "@/infrastructure/repositories/template-repository";

// ============================================
// Template 1: Developer Showcase (FREE)
// Modern portfolio with large project cards and visual hierarchy
// ============================================
const developerShowcaseTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{NAME}} - Portfolio</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    :root {
      --bg: #0a0a0a;
      --surface: #141414;
      --surface-hover: #1a1a1a;
      --border: #262626;
      --text: #fafafa;
      --muted: #a1a1aa;
      --accent: #3b82f6;
      --accent-hover: #2563eb;
      --gradient: linear-gradient(135deg, #3b82f6, #8b5cf6);
    }
    html { scroll-behavior: smooth; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
    }
    
    /* Navigation */
    nav {
      position: fixed;
      top: 0;
      width: 100%;
      padding: 1rem 2rem;
      background: rgba(10, 10, 10, 0.8);
      backdrop-filter: blur(20px);
      z-index: 100;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .logo {
      font-weight: 700;
      font-size: 1.25rem;
      background: var(--gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    nav a { color: var(--muted); text-decoration: none; margin-left: 2rem; font-size: 0.9rem; transition: color 0.2s; }
    nav a:hover { color: var(--text); }
    
    /* Hero */
    .hero {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 6rem 2rem;
      position: relative;
      overflow: hidden;
    }
    .hero::before {
      content: '';
      position: absolute;
      width: 600px;
      height: 600px;
      background: var(--gradient);
      border-radius: 50%;
      filter: blur(120px);
      opacity: 0.15;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
    .hero-content { text-align: center; position: relative; z-index: 1; max-width: 800px; }
    .hero-badge {
      display: inline-block;
      padding: 0.5rem 1rem;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 9999px;
      font-size: 0.875rem;
      color: var(--muted);
      margin-bottom: 2rem;
    }
    .hero h1 { font-size: 4rem; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 1rem; line-height: 1.1; }
    .hero h1 span { background: var(--gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .hero-tagline { font-size: 1.5rem; color: var(--muted); margin-bottom: 2rem; }
    .hero-cta { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
    .btn {
      padding: 0.875rem 2rem;
      border-radius: 12px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s;
      font-size: 0.95rem;
    }
    .btn-primary { background: var(--gradient); color: white; }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 40px rgba(59, 130, 246, 0.3); }
    .btn-secondary { background: var(--surface); color: var(--text); border: 1px solid var(--border); }
    .btn-secondary:hover { background: var(--surface-hover); border-color: var(--muted); }
    
    /* Section */
    .section { padding: 6rem 2rem; max-width: 1200px; margin: 0 auto; }
    .section-header { text-align: center; margin-bottom: 4rem; }
    .section-label { color: var(--accent); font-size: 0.875rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 0.5rem; }
    .section-title { font-size: 2.5rem; font-weight: 700; }
    
    /* About */
    .about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center; }
    .about-visual {
      aspect-ratio: 1;
      background: var(--gradient);
      border-radius: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 8rem;
      font-weight: 800;
      color: white;
      position: relative;
      overflow: hidden;
    }
    .about-visual::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%);
    }
    .about-content h3 { font-size: 1.75rem; margin-bottom: 1rem; }
    .about-content p { color: var(--muted); margin-bottom: 1.5rem; line-height: 1.8; }
    .about-stats { display: flex; gap: 2rem; margin-top: 2rem; }
    .stat { text-align: center; }
    .stat-value { font-size: 2.5rem; font-weight: 700; background: var(--gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .stat-label { font-size: 0.875rem; color: var(--muted); }
    
    /* Skills */
    .skills-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 1rem; }
    .skill-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 1.5rem;
      text-align: center;
      transition: all 0.3s;
    }
    .skill-card:hover { transform: translateY(-4px); border-color: var(--accent); background: var(--surface-hover); }
    .skill-icon { font-size: 2rem; margin-bottom: 0.75rem; }
    .skill-name { font-size: 0.9rem; font-weight: 500; }
    
    /* Projects */
    .projects-grid { display: grid; gap: 2rem; }
    .project-card {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 3rem;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 24px;
      overflow: hidden;
      transition: all 0.3s;
    }
    .project-card:hover { border-color: var(--accent); transform: translateY(-4px); }
    .project-card:nth-child(even) { direction: rtl; }
    .project-card:nth-child(even) > * { direction: ltr; }
    .project-preview {
      background: linear-gradient(135deg, #1a1a2e, #16213e);
      min-height: 320px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
    }
    .project-preview::before {
      content: '🖥️';
      font-size: 4rem;
      opacity: 0.5;
    }
    .project-preview-overlay {
      position: absolute;
      inset: 0;
      background: var(--gradient);
      opacity: 0;
      transition: opacity 0.3s;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .project-card:hover .project-preview-overlay { opacity: 0.9; }
    .project-preview-overlay span { color: white; font-weight: 600; font-size: 1.1rem; }
    .project-content { padding: 2.5rem; display: flex; flex-direction: column; justify-content: center; }
    .project-type { color: var(--accent); font-size: 0.8rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 0.5rem; }
    .project-content h3 { font-size: 1.5rem; margin-bottom: 0.75rem; }
    .project-content p { color: var(--muted); font-size: 0.95rem; margin-bottom: 1.5rem; line-height: 1.7; }
    .project-tech { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.5rem; }
    .project-tech span { background: rgba(59, 130, 246, 0.1); color: var(--accent); padding: 0.375rem 0.75rem; border-radius: 6px; font-size: 0.8rem; font-weight: 500; }
    .project-links { display: flex; gap: 1rem; }
    .project-links a { color: var(--text); text-decoration: none; font-size: 0.9rem; font-weight: 500; display: flex; align-items: center; gap: 0.5rem; }
    .project-links a:hover { color: var(--accent); }
    
    /* Experience */
    .timeline { position: relative; padding-left: 2rem; }
    .timeline::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 2px; background: var(--border); }
    .timeline-item { position: relative; padding-bottom: 3rem; }
    .timeline-item::before { content: ''; position: absolute; left: -2rem; top: 0; width: 12px; height: 12px; background: var(--accent); border-radius: 50%; transform: translateX(-5px); }
    .timeline-date { color: var(--accent); font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem; }
    .timeline-item h3 { font-size: 1.25rem; margin-bottom: 0.25rem; }
    .timeline-company { color: var(--muted); font-size: 0.95rem; margin-bottom: 0.75rem; }
    .timeline-item p { color: var(--muted); font-size: 0.9rem; line-height: 1.7; }
    
    /* Contact */
    .contact-section { background: var(--surface); border-radius: 24px; padding: 4rem; text-align: center; }
    .contact-title { font-size: 2.5rem; margin-bottom: 1rem; }
    .contact-subtitle { color: var(--muted); margin-bottom: 2rem; max-width: 500px; margin-left: auto; margin-right: auto; }
    .contact-links { display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap; }
    .contact-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: var(--bg);
      padding: 1rem 1.5rem;
      border-radius: 12px;
      color: var(--text);
      text-decoration: none;
      font-weight: 500;
      transition: all 0.2s;
    }
    .contact-link:hover { background: var(--gradient); }
    
    /* Footer */
    footer { text-align: center; padding: 3rem 2rem; color: var(--muted); font-size: 0.875rem; }
    
    @media (max-width: 768px) {
      .hero h1 { font-size: 2.5rem; }
      .about-grid, .project-card { grid-template-columns: 1fr; }
      .project-card:nth-child(even) { direction: ltr; }
      .about-visual { aspect-ratio: 16/9; font-size: 4rem; }
      nav { padding: 1rem; }
      nav a { margin-left: 1rem; font-size: 0.8rem; }
    }
  </style>
</head>
<body>
  <nav>
    <div class="logo">{{NAME}}</div>
    <div>
      <a href="#about">About</a>
      <a href="#projects">Projects</a>
      <a href="#experience">Experience</a>
      <a href="#contact">Contact</a>
    </div>
  </nav>

  <section class="hero">
    <div class="hero-content">
      <div class="hero-badge">{{COLLEGE}} • {{GRADUATION_YEAR}}</div>
      <h1>Hi, I'm <span>{{NAME}}</span></h1>
      <p class="hero-tagline">{{TAGLINE}}</p>
      <div class="hero-cta">
        <a href="#projects" class="btn btn-primary">View My Work</a>
        <a href="#contact" class="btn btn-secondary">Get in Touch</a>
      </div>
    </div>
  </section>

  <section class="section" id="about">
    <div class="about-grid">
      <div class="about-visual">{{NAME_INITIAL}}</div>
      <div class="about-content">
        <h3>About Me</h3>
        <p>{{ABOUT}}</p>
        <p style="color: var(--muted);">Currently pursuing {{BRANCH}} at {{COLLEGE}}.</p>
        <div class="about-stats">
          <div class="stat">
            <div class="stat-value">{{PROJECT_COUNT}}+</div>
            <div class="stat-label">Projects</div>
          </div>
          <div class="stat">
            <div class="stat-value">{{SKILL_COUNT}}+</div>
            <div class="stat-label">Technologies</div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="section-header">
      <div class="section-label">Skills</div>
      <h2 class="section-title">My Tech Stack</h2>
    </div>
    <div class="skills-grid">
      {{SKILLS_HTML}}
    </div>
  </section>

  <section class="section" id="projects">
    <div class="section-header">
      <div class="section-label">Portfolio</div>
      <h2 class="section-title">Featured Projects</h2>
    </div>
    <div class="projects-grid">
      {{PROJECTS_HTML}}
    </div>
  </section>

  <section class="section" id="experience">
    <div class="section-header">
      <div class="section-label">Journey</div>
      <h2 class="section-title">Experience</h2>
    </div>
    <div class="timeline">
      {{EXPERIENCE_HTML}}
    </div>
  </section>

  <section class="section" id="contact">
    <div class="contact-section">
      <h2 class="contact-title">Let's Work Together</h2>
      <p class="contact-subtitle">I'm always open to discussing new projects, creative ideas, or opportunities.</p>
      <div class="contact-links">
        {{SOCIAL_LINKS_HTML}}
      </div>
    </div>
  </section>

  <footer>
    <p>© {{YEAR}} {{NAME}}. Built with FolioAI.</p>
  </footer>
</body>
</html>`;

// ============================================
// Template 2: Creative Portfolio (FREE)
// Bold, visual design with bento grid layout
// ============================================
const creativePortfolioTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{NAME}} - Portfolio</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    :root {
      --bg: #f5f5f7;
      --surface: #ffffff;
      --text: #1d1d1f;
      --muted: #86868b;
      --accent: #0066cc;
      --accent-light: #e8f4fd;
    }
    html { scroll-behavior: smooth; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.5;
    }
    
    /* Header */
    header {
      position: fixed;
      top: 0;
      width: 100%;
      padding: 1rem 2rem;
      background: rgba(245, 245, 247, 0.8);
      backdrop-filter: blur(20px);
      z-index: 100;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .logo { font-weight: 600; font-size: 1.1rem; }
    header nav a { color: var(--muted); text-decoration: none; margin-left: 2rem; font-size: 0.9rem; }
    header nav a:hover { color: var(--text); }
    
    /* Hero Bento */
    .hero-bento {
      padding: 7rem 2rem 2rem;
      max-width: 1400px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      grid-template-rows: auto auto;
      gap: 1rem;
    }
    .bento-card {
      background: var(--surface);
      border-radius: 24px;
      padding: 2rem;
      transition: transform 0.3s;
    }
    .bento-card:hover { transform: scale(1.02); }
    .bento-main {
      grid-row: span 2;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 500px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    .bento-main h1 { font-size: 3.5rem; font-weight: 700; line-height: 1.1; margin-bottom: 1rem; }
    .bento-main p { font-size: 1.25rem; opacity: 0.9; }
    .bento-main .cta-row { display: flex; gap: 1rem; margin-top: 2rem; }
    .bento-main .btn { padding: 0.875rem 1.5rem; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 0.9rem; }
    .bento-main .btn-white { background: white; color: #667eea; }
    .bento-main .btn-ghost { background: rgba(255,255,255,0.2); color: white; }
    .bento-stats {
      background: var(--text);
      color: white;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
    .bento-stats .big-number { font-size: 4rem; font-weight: 700; line-height: 1; }
    .bento-stats .label { font-size: 0.9rem; opacity: 0.7; margin-top: 0.5rem; }
    .bento-college { background: var(--accent-light); }
    .bento-college .emoji { font-size: 3rem; margin-bottom: 1rem; }
    .bento-college h3 { font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5rem; }
    .bento-college p { color: var(--muted); font-size: 0.9rem; }
    .bento-avatar {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 5rem;
      font-weight: 700;
      color: white;
    }
    
    /* Section */
    .section { padding: 4rem 2rem; max-width: 1400px; margin: 0 auto; }
    .section-header { margin-bottom: 3rem; }
    .section-header h2 { font-size: 2rem; font-weight: 700; margin-bottom: 0.5rem; }
    .section-header p { color: var(--muted); }
    
    /* About */
    .about-card {
      background: var(--surface);
      border-radius: 24px;
      padding: 3rem;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3rem;
    }
    .about-text h3 { font-size: 1.5rem; margin-bottom: 1rem; }
    .about-text p { color: var(--muted); line-height: 1.8; }
    .about-skills { display: flex; flex-wrap: wrap; gap: 0.75rem; align-content: flex-start; }
    .skill-pill {
      background: var(--bg);
      padding: 0.75rem 1.25rem;
      border-radius: 12px;
      font-size: 0.9rem;
      font-weight: 500;
      transition: all 0.2s;
    }
    .skill-pill:hover { background: var(--accent); color: white; }
    
    /* Projects Bento */
    .projects-bento { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
    .project-card {
      background: var(--surface);
      border-radius: 24px;
      overflow: hidden;
      transition: transform 0.3s;
    }
    .project-card:hover { transform: translateY(-8px); }
    .project-card.featured { grid-column: span 2; }
    .project-image {
      height: 240px;
      background: linear-gradient(135deg, #1a1a2e, #16213e);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
    }
    .project-card.featured .project-image { height: 320px; }
    .project-image::before { content: '📱'; font-size: 4rem; }
    .project-card:nth-child(2) .project-image::before { content: '🖥️'; }
    .project-card:nth-child(3) .project-image::before { content: '⚙️'; }
    .project-card:nth-child(4) .project-image::before { content: '🎨'; }
    .project-card:nth-child(5) .project-image::before { content: '🚀'; }
    .project-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
      display: flex;
      align-items: flex-end;
      padding: 1.5rem;
      opacity: 0;
      transition: opacity 0.3s;
    }
    .project-card:hover .project-overlay { opacity: 1; }
    .project-overlay a { color: white; text-decoration: none; font-weight: 600; margin-right: 1.5rem; }
    .project-info { padding: 1.5rem; }
    .project-type { color: var(--accent); font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem; }
    .project-info h3 { font-size: 1.25rem; margin-bottom: 0.5rem; }
    .project-info p { color: var(--muted); font-size: 0.9rem; margin-bottom: 1rem; }
    .project-tags { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .project-tags span { background: var(--bg); padding: 0.375rem 0.75rem; border-radius: 6px; font-size: 0.75rem; color: var(--muted); }
    
    /* Experience */
    .exp-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1rem; }
    .exp-card {
      background: var(--surface);
      border-radius: 20px;
      padding: 2rem;
      transition: transform 0.2s;
    }
    .exp-card:hover { transform: translateY(-4px); }
    .exp-card .date { color: var(--accent); font-size: 0.8rem; font-weight: 600; margin-bottom: 0.75rem; }
    .exp-card h3 { font-size: 1.1rem; margin-bottom: 0.25rem; }
    .exp-card .company { color: var(--muted); font-size: 0.95rem; margin-bottom: 0.75rem; }
    .exp-card p { color: var(--muted); font-size: 0.9rem; line-height: 1.6; }
    
    /* Contact */
    .contact-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 24px;
      padding: 4rem;
      color: white;
      text-align: center;
    }
    .contact-card h2 { font-size: 2.5rem; margin-bottom: 1rem; }
    .contact-card p { opacity: 0.9; margin-bottom: 2rem; max-width: 500px; margin-left: auto; margin-right: auto; }
    .contact-links { display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap; }
    .contact-links a {
      background: rgba(255,255,255,0.2);
      padding: 1rem 1.5rem;
      border-radius: 12px;
      color: white;
      text-decoration: none;
      font-weight: 500;
      transition: background 0.2s;
    }
    .contact-links a:hover { background: white; color: #667eea; }
    
    footer { text-align: center; padding: 3rem 2rem; color: var(--muted); font-size: 0.875rem; }
    
    @media (max-width: 900px) {
      .hero-bento { grid-template-columns: 1fr; }
      .bento-main { min-height: 400px; }
      .bento-main h1 { font-size: 2.5rem; }
      .projects-bento { grid-template-columns: 1fr; }
      .project-card.featured { grid-column: span 1; }
      .about-card { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <header>
    <div class="logo">{{NAME}}</div>
    <nav>
      <a href="#about">About</a>
      <a href="#projects">Projects</a>
      <a href="#contact">Contact</a>
    </nav>
  </header>

  <section class="hero-bento">
    <div class="bento-card bento-main">
      <div>
        <h1>{{NAME}}</h1>
        <p>{{TAGLINE}}</p>
        <div class="cta-row">
          <a href="#projects" class="btn btn-white">View Projects</a>
          <a href="#contact" class="btn btn-ghost">Contact Me</a>
        </div>
      </div>
    </div>
    <div class="bento-card bento-stats">
      <div class="big-number">{{PROJECT_COUNT}}+</div>
      <div class="label">Projects Built</div>
    </div>
    <div class="bento-card bento-avatar">{{NAME_INITIAL}}</div>
    <div class="bento-card bento-college">
      <div class="emoji">🎓</div>
      <h3>{{COLLEGE}}</h3>
      <p>{{BRANCH}} • Class of {{GRADUATION_YEAR}}</p>
    </div>
  </section>

  <section class="section" id="about">
    <div class="about-card">
      <div class="about-text">
        <h3>About Me</h3>
        <p>{{ABOUT}}</p>
      </div>
      <div class="about-skills">
        {{SKILLS_HTML}}
      </div>
    </div>
  </section>

  <section class="section" id="projects">
    <div class="section-header">
      <h2>Featured Projects</h2>
      <p>A selection of my recent work</p>
    </div>
    <div class="projects-bento">
      {{PROJECTS_HTML}}
    </div>
  </section>

  <section class="section" id="experience">
    <div class="section-header">
      <h2>Experience</h2>
      <p>My professional journey</p>
    </div>
    <div class="exp-grid">
      {{EXPERIENCE_HTML}}
    </div>
  </section>

  <section class="section" id="contact">
    <div class="contact-card">
      <h2>Let's Create Something Amazing</h2>
      <p>I'm currently available for freelance work and full-time opportunities.</p>
      <div class="contact-links">
        {{SOCIAL_LINKS_HTML}}
      </div>
    </div>
  </section>

  <footer>
    <p>Designed & Built by {{NAME}} • {{YEAR}}</p>
  </footer>
</body>
</html>`;

// ============================================
// Template 3: Minimal Elegant (FREE)
// Clean, typography-focused with subtle animations
// ============================================
const minimalElegantTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{NAME}} - Portfolio</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    :root {
      --bg: #fafafa;
      --surface: #ffffff;
      --text: #171717;
      --muted: #737373;
      --border: #e5e5e5;
      --accent: #171717;
    }
    html { scroll-behavior: smooth; }
    body {
      font-family: 'Inter', sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
    }
    
    /* Layout */
    .container { max-width: 1000px; margin: 0 auto; padding: 0 2rem; }
    
    /* Nav */
    nav {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      padding: 1.5rem 2rem;
      background: rgba(250, 250, 250, 0.8);
      backdrop-filter: blur(20px);
      z-index: 100;
    }
    nav .container { display: flex; justify-content: space-between; align-items: center; max-width: 1000px; }
    .logo { font-weight: 600; letter-spacing: -0.02em; }
    nav a { color: var(--muted); text-decoration: none; margin-left: 2rem; font-size: 0.9rem; transition: color 0.2s; }
    nav a:hover { color: var(--text); }
    
    /* Hero */
    .hero {
      min-height: 100vh;
      display: flex;
      align-items: center;
      padding: 8rem 0 4rem;
    }
    .hero-inner { max-width: 700px; }
    .hero-intro { color: var(--muted); font-size: 1rem; margin-bottom: 1rem; }
    .hero h1 { font-size: 4rem; font-weight: 700; letter-spacing: -0.03em; line-height: 1.1; margin-bottom: 1.5rem; }
    .hero-tagline { font-size: 1.5rem; font-weight: 300; color: var(--muted); margin-bottom: 2rem; line-height: 1.5; }
    .hero-links { display: flex; gap: 1rem; }
    .hero-links a {
      padding: 1rem 2rem;
      text-decoration: none;
      font-weight: 500;
      border-radius: 8px;
      transition: all 0.2s;
    }
    .hero-links .primary { background: var(--text); color: white; }
    .hero-links .primary:hover { background: #333; }
    .hero-links .secondary { border: 1px solid var(--border); color: var(--text); }
    .hero-links .secondary:hover { border-color: var(--text); }
    
    /* Section */
    .section { padding: 6rem 0; border-top: 1px solid var(--border); }
    .section-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 3rem; }
    .section-header h2 { font-size: 0.8rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.15em; color: var(--muted); }
    .section-number { font-size: 0.8rem; color: var(--muted); }
    
    /* About */
    .about-content { display: grid; grid-template-columns: 2fr 1fr; gap: 4rem; }
    .about-text { font-size: 1.1rem; line-height: 1.9; color: var(--muted); }
    .about-text strong { color: var(--text); font-weight: 500; }
    .about-details dt { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted); margin-top: 1.5rem; margin-bottom: 0.25rem; }
    .about-details dd { font-weight: 500; }
    
    /* Skills */
    .skills-list { display: flex; flex-wrap: wrap; gap: 0.75rem; }
    .skills-list span {
      padding: 0.75rem 1.25rem;
      border: 1px solid var(--border);
      border-radius: 9999px;
      font-size: 0.9rem;
      transition: all 0.2s;
    }
    .skills-list span:hover { border-color: var(--text); background: var(--text); color: white; }
    
    /* Projects */
    .project {
      padding: 3rem 0;
      border-bottom: 1px solid var(--border);
      display: grid;
      grid-template-columns: 1fr 1.5fr;
      gap: 3rem;
      align-items: start;
    }
    .project:last-child { border-bottom: none; }
    .project-meta .number { font-size: 0.8rem; color: var(--muted); margin-bottom: 0.5rem; }
    .project-meta h3 { font-size: 1.5rem; font-weight: 600; letter-spacing: -0.02em; margin-bottom: 0.5rem; }
    .project-meta .type { font-size: 0.9rem; color: var(--muted); }
    .project-content p { color: var(--muted); line-height: 1.8; margin-bottom: 1.5rem; }
    .project-tech { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.5rem; }
    .project-tech span { font-size: 0.8rem; color: var(--muted); background: var(--bg); padding: 0.375rem 0.75rem; border-radius: 4px; }
    .project-links a { color: var(--text); text-decoration: none; font-size: 0.9rem; font-weight: 500; margin-right: 1.5rem; }
    .project-links a:hover { text-decoration: underline; }
    
    /* Experience */
    .exp-item { padding: 2rem 0; border-bottom: 1px solid var(--border); display: grid; grid-template-columns: 180px 1fr; gap: 2rem; }
    .exp-item:last-child { border-bottom: none; }
    .exp-date { font-size: 0.9rem; color: var(--muted); }
    .exp-content h3 { font-size: 1.1rem; font-weight: 600; margin-bottom: 0.25rem; }
    .exp-content .company { color: var(--muted); font-size: 0.95rem; margin-bottom: 0.75rem; }
    .exp-content p { color: var(--muted); font-size: 0.9rem; line-height: 1.7; }
    
    /* Contact */
    .contact-inner { text-align: center; max-width: 500px; margin: 0 auto; }
    .contact-inner h3 { font-size: 2rem; font-weight: 600; margin-bottom: 1rem; }
    .contact-inner p { color: var(--muted); margin-bottom: 2rem; }
    .contact-links { display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap; }
    .contact-links a {
      padding: 1rem 1.5rem;
      border: 1px solid var(--border);
      border-radius: 8px;
      color: var(--text);
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 500;
      transition: all 0.2s;
    }
    .contact-links a:hover { background: var(--text); color: white; border-color: var(--text); }
    
    footer { text-align: center; padding: 4rem 0; color: var(--muted); font-size: 0.875rem; border-top: 1px solid var(--border); }
    
    @media (max-width: 768px) {
      .hero h1 { font-size: 2.5rem; }
      .about-content { grid-template-columns: 1fr; gap: 2rem; }
      .project { grid-template-columns: 1fr; gap: 1.5rem; }
      .exp-item { grid-template-columns: 1fr; gap: 0.5rem; }
    }
  </style>
</head>
<body>
  <nav>
    <div class="container">
      <div class="logo">{{NAME}}</div>
      <div>
        <a href="#about">About</a>
        <a href="#projects">Work</a>
        <a href="#contact">Contact</a>
      </div>
    </div>
  </nav>

  <div class="container">
    <section class="hero">
      <div class="hero-inner">
        <p class="hero-intro">Hello, I'm</p>
        <h1>{{NAME}}</h1>
        <p class="hero-tagline">{{TAGLINE}}</p>
        <div class="hero-links">
          <a href="#projects" class="primary">View Projects</a>
          <a href="#contact" class="secondary">Get in Touch</a>
        </div>
      </div>
    </section>

    <section class="section" id="about">
      <div class="section-header">
        <h2>About</h2>
        <span class="section-number">01</span>
      </div>
      <div class="about-content">
        <div class="about-text">
          <p>{{ABOUT}}</p>
        </div>
        <dl class="about-details">
          <dt>Education</dt>
          <dd>{{COLLEGE}}</dd>
          <dt>Program</dt>
          <dd>{{BRANCH}}</dd>
          <dt>Graduation</dt>
          <dd>{{GRADUATION_YEAR}}</dd>
        </dl>
      </div>
    </section>

    <section class="section">
      <div class="section-header">
        <h2>Skills</h2>
        <span class="section-number">02</span>
      </div>
      <div class="skills-list">
        {{SKILLS_HTML}}
      </div>
    </section>

    <section class="section" id="projects">
      <div class="section-header">
        <h2>Selected Work</h2>
        <span class="section-number">03</span>
      </div>
      {{PROJECTS_HTML}}
    </section>

    <section class="section" id="experience">
      <div class="section-header">
        <h2>Experience</h2>
        <span class="section-number">04</span>
      </div>
      {{EXPERIENCE_HTML}}
    </section>

    <section class="section" id="contact">
      <div class="section-header">
        <h2>Contact</h2>
        <span class="section-number">05</span>
      </div>
      <div class="contact-inner">
        <h3>Let's Connect</h3>
        <p>Currently open to new opportunities and collaborations.</p>
        <div class="contact-links">
          {{SOCIAL_LINKS_HTML}}
        </div>
      </div>
    </section>

    <footer>
      <p>© {{YEAR}} {{NAME}}. All rights reserved.</p>
    </footer>
  </div>
</body>
</html>`;

// ============================================
// Template 4: Tech Futuristic (PAID - ₹99)
// Cyberpunk-inspired with animations
// ============================================
const techFuturisticTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{NAME}} - Portfolio</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    :root {
      --bg: #030712;
      --surface: #0f172a;
      --border: #1e293b;
      --text: #f8fafc;
      --muted: #94a3b8;
      --cyan: #06b6d4;
      --purple: #a855f7;
      --gradient: linear-gradient(135deg, var(--cyan), var(--purple));
    }
    html { scroll-behavior: smooth; }
    body {
      font-family: 'Consolas', 'Monaco', monospace;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
    }
    
    /* Animated background */
    .bg-grid {
      position: fixed;
      inset: 0;
      background-image: 
        linear-gradient(rgba(6, 182, 212, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(6, 182, 212, 0.03) 1px, transparent 1px);
      background-size: 50px 50px;
      z-index: -1;
    }
    
    /* Nav */
    nav {
      position: fixed;
      top: 0;
      width: 100%;
      padding: 1rem 2rem;
      background: rgba(3, 7, 18, 0.9);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid var(--border);
      z-index: 100;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .logo {
      font-weight: 700;
      font-size: 1.25rem;
      background: var(--gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .logo::before { content: '< '; color: var(--cyan); -webkit-text-fill-color: var(--cyan); }
    .logo::after { content: ' />'; color: var(--purple); -webkit-text-fill-color: var(--purple); }
    nav a { color: var(--muted); text-decoration: none; margin-left: 2rem; font-size: 0.9rem; transition: color 0.2s; }
    nav a:hover { color: var(--cyan); }
    
    /* Hero */
    .hero {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 6rem 2rem;
      position: relative;
    }
    .hero-content { text-align: center; max-width: 900px; }
    .terminal-line {
      font-size: 0.9rem;
      color: var(--cyan);
      margin-bottom: 1rem;
    }
    .terminal-line::before { content: '> '; color: var(--purple); }
    .hero h1 {
      font-size: 4rem;
      font-weight: 700;
      margin-bottom: 1rem;
      line-height: 1.1;
    }
    .hero h1 .gradient-text {
      background: var(--gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .hero-tagline { font-size: 1.25rem; color: var(--muted); margin-bottom: 0.5rem; }
    .hero-info { font-size: 0.9rem; color: var(--muted); margin-bottom: 2rem; }
    .hero-info span { color: var(--cyan); }
    .hero-cta { display: flex; gap: 1rem; justify-content: center; }
    .btn {
      padding: 1rem 2rem;
      border-radius: 8px;
      font-weight: 600;
      text-decoration: none;
      font-family: inherit;
      transition: all 0.3s;
      position: relative;
      overflow: hidden;
    }
    .btn-glow {
      background: var(--gradient);
      color: white;
      box-shadow: 0 0 30px rgba(6, 182, 212, 0.3);
    }
    .btn-glow:hover { transform: translateY(-2px); box-shadow: 0 0 50px rgba(6, 182, 212, 0.5); }
    .btn-outline {
      border: 1px solid var(--border);
      color: var(--text);
      background: transparent;
    }
    .btn-outline:hover { border-color: var(--cyan); color: var(--cyan); }
    
    /* Section */
    .section { padding: 6rem 2rem; max-width: 1200px; margin: 0 auto; }
    .section-header { margin-bottom: 3rem; }
    .section-label { color: var(--cyan); font-size: 0.8rem; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 0.5rem; }
    .section-label::before { content: '// '; color: var(--purple); }
    .section-title { font-size: 2rem; font-weight: 700; }
    
    /* Skills */
    .skills-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 1rem; }
    .skill-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1.5rem;
      text-align: center;
      transition: all 0.3s;
      position: relative;
      overflow: hidden;
    }
    .skill-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: var(--gradient);
      transform: scaleX(0);
      transition: transform 0.3s;
    }
    .skill-card:hover { border-color: var(--cyan); transform: translateY(-4px); }
    .skill-card:hover::before { transform: scaleX(1); }
    .skill-name { font-size: 0.9rem; }
    
    /* Projects */
    .projects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1.5rem; }
    .project-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 16px;
      overflow: hidden;
      transition: all 0.3s;
    }
    .project-card:hover { border-color: var(--cyan); transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0,0,0,0.3); }
    .project-preview {
      height: 200px;
      background: linear-gradient(135deg, var(--surface), #1e293b);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      border-bottom: 1px solid var(--border);
    }
    .project-preview::before { content: '🖥️'; font-size: 4rem; opacity: 0.5; }
    .project-preview-overlay {
      position: absolute;
      inset: 0;
      background: var(--gradient);
      opacity: 0;
      transition: opacity 0.3s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
    }
    .project-card:hover .project-preview-overlay { opacity: 0.95; }
    .project-preview-overlay a {
      padding: 0.5rem 1rem;
      background: rgba(255,255,255,0.2);
      color: white;
      text-decoration: none;
      border-radius: 4px;
      font-size: 0.85rem;
    }
    .project-content { padding: 1.5rem; }
    .project-type { color: var(--cyan); font-size: 0.75rem; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 0.5rem; }
    .project-content h3 { font-size: 1.25rem; margin-bottom: 0.5rem; }
    .project-content p { color: var(--muted); font-size: 0.9rem; margin-bottom: 1rem; font-family: -apple-system, sans-serif; }
    .project-tech { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .project-tech span {
      background: rgba(6, 182, 212, 0.1);
      color: var(--cyan);
      padding: 0.25rem 0.75rem;
      border-radius: 4px;
      font-size: 0.75rem;
    }
    
    /* Experience */
    .exp-list { border-left: 2px solid var(--border); padding-left: 2rem; }
    .exp-item { position: relative; padding-bottom: 2.5rem; }
    .exp-item::before {
      content: '';
      position: absolute;
      left: -2rem;
      top: 0.25rem;
      width: 12px;
      height: 12px;
      background: var(--gradient);
      border-radius: 50%;
      transform: translateX(-5px);
      box-shadow: 0 0 20px var(--cyan);
    }
    .exp-date { color: var(--cyan); font-size: 0.85rem; margin-bottom: 0.5rem; }
    .exp-item h3 { font-size: 1.1rem; margin-bottom: 0.25rem; }
    .exp-company { color: var(--purple); font-size: 0.95rem; margin-bottom: 0.5rem; }
    .exp-item p { color: var(--muted); font-size: 0.9rem; font-family: -apple-system, sans-serif; }
    
    /* Contact */
    .contact-section {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 24px;
      padding: 4rem;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .contact-section::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: var(--gradient);
    }
    .contact-section h2 { font-size: 2rem; margin-bottom: 1rem; }
    .contact-section p { color: var(--muted); margin-bottom: 2rem; font-family: -apple-system, sans-serif; }
    .contact-links { display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap; }
    .contact-links a {
      padding: 1rem 1.5rem;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      color: var(--text);
      text-decoration: none;
      transition: all 0.2s;
    }
    .contact-links a:hover { border-color: var(--cyan); color: var(--cyan); }
    
    footer { text-align: center; padding: 3rem 2rem; color: var(--muted); font-size: 0.85rem; }
    footer::before { content: '<!-- '; color: var(--cyan); }
    footer::after { content: ' -->'; color: var(--cyan); }
    
    @media (max-width: 768px) {
      .hero h1 { font-size: 2.5rem; }
      .projects-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="bg-grid"></div>
  
  <nav>
    <div class="logo">{{NAME}}</div>
    <div>
      <a href="#about">About</a>
      <a href="#projects">Projects</a>
      <a href="#contact">Contact</a>
    </div>
  </nav>

  <section class="hero">
    <div class="hero-content">
      <div class="terminal-line">initializing portfolio...</div>
      <h1>Hello, I'm <span class="gradient-text">{{NAME}}</span></h1>
      <p class="hero-tagline">{{TAGLINE}}</p>
      <p class="hero-info"><span>{{COLLEGE}}</span> • {{BRANCH}} • Class of {{GRADUATION_YEAR}}</p>
      <div class="hero-cta">
        <a href="#projects" class="btn btn-glow">View Projects</a>
        <a href="#contact" class="btn btn-outline">Contact Me</a>
      </div>
    </div>
  </section>

  <section class="section" id="about">
    <div class="section-header">
      <div class="section-label">about_me</div>
      <h2 class="section-title">Who I Am</h2>
    </div>
    <p style="color: var(--muted); max-width: 700px; font-family: -apple-system, sans-serif; line-height: 1.8;">{{ABOUT}}</p>
  </section>

  <section class="section">
    <div class="section-header">
      <div class="section-label">tech_stack</div>
      <h2 class="section-title">Skills & Technologies</h2>
    </div>
    <div class="skills-grid">
      {{SKILLS_HTML}}
    </div>
  </section>

  <section class="section" id="projects">
    <div class="section-header">
      <div class="section-label">my_work</div>
      <h2 class="section-title">Featured Projects</h2>
    </div>
    <div class="projects-grid">
      {{PROJECTS_HTML}}
    </div>
  </section>

  <section class="section" id="experience">
    <div class="section-header">
      <div class="section-label">experience</div>
      <h2 class="section-title">Work History</h2>
    </div>
    <div class="exp-list">
      {{EXPERIENCE_HTML}}
    </div>
  </section>

  <section class="section" id="contact">
    <div class="contact-section">
      <h2>Let's Build Something</h2>
      <p>Open to opportunities and collaborations</p>
      <div class="contact-links">
        {{SOCIAL_LINKS_HTML}}
      </div>
    </div>
  </section>

  <footer>
    Built by {{NAME}} • {{YEAR}}
  </footer>
</body>
</html>`;

// ============================================
// Template 5: Studio Professional (PAID - ₹149)
// Agency/studio style with premium feel
// ============================================
const studioProfessionalTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{NAME}} - Portfolio</title>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    :root {
      --bg: #0c0c0c;
      --surface: #161616;
      --border: #2a2a2a;
      --text: #ffffff;
      --muted: #888888;
      --cream: #f5f0e8;
    }
    html { scroll-behavior: smooth; }
    body {
      font-family: 'DM Sans', sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
    }
    
    /* Nav */
    nav {
      position: fixed;
      top: 0;
      width: 100%;
      padding: 1.5rem 3rem;
      background: rgba(12, 12, 12, 0.9);
      backdrop-filter: blur(20px);
      z-index: 100;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .logo { font-family: 'DM Serif Display', serif; font-size: 1.5rem; }
    nav a { color: var(--muted); text-decoration: none; margin-left: 3rem; font-size: 0.9rem; transition: color 0.2s; }
    nav a:hover { color: var(--text); }
    
    /* Hero */
    .hero {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 8rem 3rem 4rem;
      max-width: 1400px;
      margin: 0 auto;
    }
    .hero-top { margin-bottom: 4rem; }
    .hero-label { color: var(--muted); font-size: 0.9rem; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 1.5rem; }
    .hero h1 {
      font-family: 'DM Serif Display', serif;
      font-size: 6rem;
      font-weight: 400;
      line-height: 1;
      margin-bottom: 2rem;
    }
    .hero-tagline { font-size: 1.5rem; color: var(--muted); max-width: 600px; line-height: 1.5; }
    .hero-bottom { display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid var(--border); padding-top: 3rem; }
    .hero-info { display: flex; gap: 4rem; }
    .info-item label { display: block; font-size: 0.75rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 0.5rem; }
    .info-item span { font-size: 1.1rem; }
    .hero-cta a {
      display: inline-flex;
      align-items: center;
      gap: 1rem;
      background: var(--cream);
      color: var(--bg);
      padding: 1.25rem 2.5rem;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.3s;
    }
    .hero-cta a:hover { transform: translateX(8px); }
    
    /* Section */
    .section { padding: 6rem 3rem; max-width: 1400px; margin: 0 auto; }
    .section-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4rem; border-bottom: 1px solid var(--border); padding-bottom: 1rem; }
    .section-header h2 { font-family: 'DM Serif Display', serif; font-size: 2.5rem; font-weight: 400; }
    .section-count { font-size: 0.9rem; color: var(--muted); }
    
    /* About */
    .about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6rem; }
    .about-text p { font-size: 1.25rem; line-height: 1.9; color: var(--muted); }
    .about-text p strong { color: var(--text); }
    .about-image {
      aspect-ratio: 3/4;
      background: linear-gradient(135deg, var(--surface), #222);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'DM Serif Display', serif;
      font-size: 8rem;
      color: var(--cream);
    }
    
    /* Skills */
    .skills-wrap { display: flex; flex-wrap: wrap; gap: 1rem; }
    .skills-wrap span {
      padding: 1rem 2rem;
      border: 1px solid var(--border);
      font-size: 1rem;
      transition: all 0.2s;
    }
    .skills-wrap span:hover { background: var(--cream); color: var(--bg); border-color: var(--cream); }
    
    /* Projects */
    .project {
      display: grid;
      grid-template-columns: 0.8fr 1fr;
      gap: 4rem;
      padding: 4rem 0;
      border-bottom: 1px solid var(--border);
      align-items: center;
    }
    .project:first-child { padding-top: 0; }
    .project:last-child { border-bottom: none; }
    .project:nth-child(even) { direction: rtl; }
    .project:nth-child(even) > * { direction: ltr; }
    .project-image {
      aspect-ratio: 4/3;
      background: linear-gradient(135deg, var(--surface), #222);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
    }
    .project-image::before { content: '📱'; font-size: 5rem; opacity: 0.5; }
    .project-image-overlay {
      position: absolute;
      inset: 0;
      background: var(--cream);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s;
    }
    .project:hover .project-image-overlay { opacity: 0.95; }
    .project-image-overlay a {
      color: var(--bg);
      text-decoration: none;
      font-weight: 600;
      margin: 0 1rem;
    }
    .project-content .number { font-size: 0.9rem; color: var(--muted); margin-bottom: 1rem; }
    .project-content h3 { font-family: 'DM Serif Display', serif; font-size: 2rem; font-weight: 400; margin-bottom: 1rem; }
    .project-content p { color: var(--muted); margin-bottom: 1.5rem; line-height: 1.8; }
    .project-tech { display: flex; flex-wrap: wrap; gap: 0.75rem; }
    .project-tech span { font-size: 0.85rem; color: var(--muted); }
    .project-tech span::after { content: ' •'; margin-left: 0.75rem; }
    .project-tech span:last-child::after { display: none; }
    
    /* Experience */
    .exp-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 2rem; }
    .exp-card {
      background: var(--surface);
      padding: 2.5rem;
      transition: transform 0.2s;
    }
    .exp-card:hover { transform: translateY(-4px); }
    .exp-card .date { font-size: 0.85rem; color: var(--cream); margin-bottom: 1rem; }
    .exp-card h3 { font-size: 1.25rem; margin-bottom: 0.25rem; }
    .exp-card .company { color: var(--muted); margin-bottom: 1rem; }
    .exp-card p { color: var(--muted); font-size: 0.95rem; line-height: 1.7; }
    
    /* Contact */
    .contact-section { text-align: center; padding: 6rem 0; }
    .contact-section h2 { font-family: 'DM Serif Display', serif; font-size: 4rem; font-weight: 400; margin-bottom: 1rem; }
    .contact-section p { color: var(--muted); font-size: 1.1rem; margin-bottom: 3rem; }
    .contact-links { display: flex; justify-content: center; gap: 1.5rem; flex-wrap: wrap; }
    .contact-links a {
      padding: 1rem 2rem;
      border: 1px solid var(--border);
      color: var(--text);
      text-decoration: none;
      transition: all 0.2s;
    }
    .contact-links a:hover { background: var(--cream); color: var(--bg); border-color: var(--cream); }
    
    footer {
      text-align: center;
      padding: 3rem;
      border-top: 1px solid var(--border);
      color: var(--muted);
      font-size: 0.9rem;
    }
    
    @media (max-width: 900px) {
      .hero h1 { font-size: 3.5rem; }
      .hero-info { gap: 2rem; flex-wrap: wrap; }
      .hero-bottom { flex-direction: column; align-items: flex-start; gap: 2rem; }
      .about-grid { grid-template-columns: 1fr; }
      .project { grid-template-columns: 1fr; }
      .project:nth-child(even) { direction: ltr; }
      .exp-grid { grid-template-columns: 1fr; }
      nav { padding: 1rem 1.5rem; }
      nav a { margin-left: 1.5rem; }
      .section { padding: 4rem 1.5rem; }
    }
  </style>
</head>
<body>
  <nav>
    <div class="logo">{{NAME}}</div>
    <div>
      <a href="#about">About</a>
      <a href="#work">Work</a>
      <a href="#contact">Contact</a>
    </div>
  </nav>

  <section class="hero">
    <div class="hero-top">
      <div class="hero-label">Portfolio {{GRADUATION_YEAR}}</div>
      <h1>{{NAME}}</h1>
      <p class="hero-tagline">{{TAGLINE}}</p>
    </div>
    <div class="hero-bottom">
      <div class="hero-info">
        <div class="info-item">
          <label>Education</label>
          <span>{{COLLEGE}}</span>
        </div>
        <div class="info-item">
          <label>Program</label>
          <span>{{BRANCH}}</span>
        </div>
        <div class="info-item">
          <label>Projects</label>
          <span>{{PROJECT_COUNT}}+ Built</span>
        </div>
      </div>
      <div class="hero-cta">
        <a href="#work">View Work →</a>
      </div>
    </div>
  </section>

  <section class="section" id="about">
    <div class="section-header">
      <h2>About</h2>
    </div>
    <div class="about-grid">
      <div class="about-text">
        <p>{{ABOUT}}</p>
      </div>
      <div class="about-image">{{NAME_INITIAL}}</div>
    </div>
  </section>

  <section class="section">
    <div class="section-header">
      <h2>Expertise</h2>
      <span class="section-count">{{SKILL_COUNT}} skills</span>
    </div>
    <div class="skills-wrap">
      {{SKILLS_HTML}}
    </div>
  </section>

  <section class="section" id="work">
    <div class="section-header">
      <h2>Selected Work</h2>
      <span class="section-count">{{PROJECT_COUNT}} projects</span>
    </div>
    {{PROJECTS_HTML}}
  </section>

  <section class="section" id="experience">
    <div class="section-header">
      <h2>Experience</h2>
    </div>
    <div class="exp-grid">
      {{EXPERIENCE_HTML}}
    </div>
  </section>

  <section class="section" id="contact">
    <div class="contact-section">
      <h2>Let's Connect</h2>
      <p>Open to opportunities and exciting projects</p>
      <div class="contact-links">
        {{SOCIAL_LINKS_HTML}}
      </div>
    </div>
  </section>

  <footer>
    <p>© {{YEAR}} {{NAME}}. All rights reserved.</p>
  </footer>
</body>
</html>`;

// ============================================
// Export all templates
// ============================================
export const SAMPLE_TEMPLATES: CreateTemplateInput[] = [
  {
    name: "Developer Showcase",
    slug: "developer-showcase",
    description: "Modern dark theme with stunning gradient accents and large project cards. Perfect for developers who want their work to stand out.",
    category: "developer",
    htmlTemplate: developerShowcaseTemplate,
    isFree: true,
    priceInr: 0,
    sortOrder: 1,
  },
  {
    name: "Creative Portfolio",
    slug: "creative-portfolio",
    description: "Bold bento-grid layout with vibrant colors. Ideal for designers and creative technologists who want a unique visual identity.",
    category: "creative",
    htmlTemplate: creativePortfolioTemplate,
    isFree: true,
    priceInr: 0,
    sortOrder: 2,
  },
  {
    name: "Minimal Elegant",
    slug: "minimal-elegant",
    description: "Clean, typography-focused design with subtle animations. Perfect for those who believe less is more.",
    category: "minimal",
    htmlTemplate: minimalElegantTemplate,
    isFree: true,
    priceInr: 0,
    sortOrder: 3,
  },
  {
    name: "Tech Futuristic",
    slug: "tech-futuristic",
    description: "Cyberpunk-inspired with animated grid background and neon accents. Stand out with this unique tech-forward design.",
    category: "developer",
    htmlTemplate: techFuturisticTemplate,
    isFree: false,
    priceInr: 99,
    sortOrder: 4,
  },
  {
    name: "Studio Professional",
    slug: "studio-professional",
    description: "Premium agency-style design with elegant typography and sophisticated layouts. Perfect for senior roles.",
    category: "professional",
    htmlTemplate: studioProfessionalTemplate,
    isFree: false,
    priceInr: 149,
    sortOrder: 5,
  },
];
