/**
 * Portfolio Templates
 * 
 * Modern, single-page HTML portfolio templates for engineering students.
 * All navigation (Work, About, Experience, Contact) links to sections on the same page.
 * These get seeded into the database via /api/templates/seed
 */

import type { CreateTemplateInput } from "@/infrastructure/repositories/template-repository";

// ============================================
// Template 1: Terminal - Developer-focused dark theme
// ============================================
const terminalTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>{{NAME}} — Portfolio</title>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&family=Syne:wght@700;800&display=swap" rel="stylesheet"/>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--bg:#0d0d0d;--surface:#141414;--border:#1e1e1e;--green:#00ff88;--green2:#00cc6a;--text:#e0e0e0;--text2:#666;--accent:#00ff88}
html{scroll-behavior:smooth}
body{font-family:'JetBrains Mono',monospace;background:var(--bg);color:var(--text);font-size:14px;line-height:1.7;cursor:none}
.cursor{width:10px;height:20px;background:var(--green);position:fixed;pointer-events:none;z-index:9999;animation:blink 1s infinite;mix-blend-mode:screen}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:16px 32px;display:flex;align-items:center;justify-content:space-between;background:rgba(13,13,13,0.95);border-bottom:1px solid var(--border)}
.nav-logo{color:var(--green);font-weight:700;font-size:16px}
.nav-links{display:flex;gap:24px}
.nav-links a{color:var(--text2);text-decoration:none;font-size:12px;transition:color 0.2s}
.nav-links a:hover{color:var(--green)}
.hero{min-height:100vh;display:flex;align-items:center;padding:80px 32px 60px;max-width:900px;margin:0 auto}
.hero-inner{width:100%}
.terminal-prompt{color:var(--text2);font-size:12px;margin-bottom:8px}
.terminal-prompt span{color:var(--green)}
.hero-name{font-family:'Syne',sans-serif;font-size:clamp(3rem,8vw,7rem);font-weight:800;line-height:1.0;letter-spacing:-0.03em;color:#fff;margin-bottom:16px}
.hero-name .typed{color:var(--green);position:relative}
.hero-name .typed::after{content:'|';animation:blink 1s infinite;color:var(--green)}
.hero-role{font-size:1rem;color:var(--text2);margin-bottom:32px}
.hero-role span{color:var(--green)}
.hero-bio{max-width:560px;color:var(--text2);font-size:13px;line-height:1.8;margin-bottom:40px;border-left:2px solid var(--green);padding-left:16px}
.hero-tags{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:40px}
.tag{padding:4px 12px;border:1px solid var(--border);border-radius:4px;font-size:11px;color:var(--text2);transition:all 0.2s}
.tag:hover{border-color:var(--green);color:var(--green)}
.hero-cta{display:flex;gap:12px;flex-wrap:wrap}
.btn-primary{padding:12px 24px;background:var(--green);color:#000;font-weight:700;font-size:13px;border:none;border-radius:6px;cursor:pointer;font-family:'JetBrains Mono',monospace;text-decoration:none;display:inline-block;transition:opacity 0.2s}
.btn-primary:hover{opacity:0.85}
.btn-outline{padding:12px 24px;background:transparent;color:var(--green);font-weight:700;font-size:13px;border:1px solid var(--green);border-radius:6px;cursor:pointer;font-family:'JetBrains Mono',monospace;text-decoration:none;display:inline-block;transition:all 0.2s}
.btn-outline:hover{background:rgba(0,255,136,0.05)}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:1px;background:var(--border);border:1px solid var(--border);border-radius:8px;overflow:hidden;margin:60px 32px}
.stat{background:var(--surface);padding:24px;text-align:center}
.stat-num{font-family:'Syne',sans-serif;font-size:2rem;font-weight:800;color:var(--green)}
.stat-label{font-size:11px;color:var(--text2);margin-top:4px}
.section{padding:80px 32px;max-width:900px;margin:0 auto}
.section-header{display:flex;align-items:center;gap:12px;margin-bottom:40px}
.section-num{color:var(--green);font-size:12px}
.section-title{font-family:'Syne',sans-serif;font-size:1.6rem;font-weight:800;color:#fff}
.section-line{flex:1;height:1px;background:var(--border)}
.projects-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px}
.project-card{background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:24px;transition:border-color 0.2s,transform 0.2s;position:relative;overflow:hidden}
.project-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--green);transform:scaleX(0);transition:transform 0.3s;transform-origin:left}
.project-card:hover::before{transform:scaleX(1)}
.project-card:hover{border-color:rgba(0,255,136,0.2);transform:translateY(-4px)}
.project-type{font-size:10px;color:var(--green);margin-bottom:8px;letter-spacing:0.1em;text-transform:uppercase}
.project-title{font-family:'Syne',sans-serif;font-size:1.1rem;font-weight:700;color:#fff;margin-bottom:8px}
.project-desc{font-size:12px;color:var(--text2);line-height:1.7;margin-bottom:16px}
.project-stack{display:flex;gap:6px;flex-wrap:wrap}
.stack-tag{font-size:10px;padding:2px 8px;background:rgba(0,255,136,0.08);color:var(--green);border-radius:3px;border:1px solid rgba(0,255,136,0.15)}
.skills-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px}
.skill-group{background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:20px}
.skill-group-title{font-size:11px;color:var(--green);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:12px}
.skill-list{display:flex;flex-direction:column;gap:8px}
.skill-item{display:flex;align-items:center;justify-content:space-between;font-size:12px;color:var(--text2)}
.skill-bar{width:80px;height:3px;background:var(--border);border-radius:2px;overflow:hidden}
.skill-fill{height:100%;background:var(--green);border-radius:2px}
.exp-list{display:flex;flex-direction:column;gap:0}
.exp-item{padding:24px 0;border-bottom:1px solid var(--border);display:grid;grid-template-columns:120px 1fr;gap:24px}
.exp-date{font-size:11px;color:var(--text2);padding-top:4px}
.exp-title{font-family:'Syne',sans-serif;font-size:1rem;font-weight:700;color:#fff;margin-bottom:4px}
.exp-company{font-size:12px;color:var(--green);margin-bottom:8px}
.exp-desc{font-size:12px;color:var(--text2);line-height:1.7}
.contact-section{padding:80px 32px;max-width:900px;margin:0 auto;text-align:center}
.contact-title{font-family:'Syne',sans-serif;font-size:clamp(2rem,5vw,4rem);font-weight:800;color:#fff;margin-bottom:16px}
.contact-sub{color:var(--text2);font-size:13px;margin-bottom:40px}
.contact-links{display:flex;gap:16px;justify-content:center;flex-wrap:wrap}
.contact-link{padding:12px 24px;border:1px solid var(--border);border-radius:6px;color:var(--text2);text-decoration:none;font-size:13px;transition:all 0.2s;display:flex;align-items:center;gap:8px}
.contact-link:hover{border-color:var(--green);color:var(--green)}
footer{padding:24px 32px;border-top:1px solid var(--border);text-align:center;font-size:11px;color:var(--text2)}
footer span{color:var(--green)}
@media(max-width:600px){
  .hero{padding:100px 20px 60px}
  .section{padding:60px 20px}
  .stats{margin:40px 20px}
  .exp-item{grid-template-columns:1fr;gap:4px}
  nav{padding:12px 20px}
}
</style>
</head>
<body>
<div class="cursor" id="cursor"></div>
<nav>
  <div class="nav-logo">~/{{GITHUB_USERNAME}}</div>
  <div class="nav-links">
    <a href="#projects">projects</a>
    <a href="#skills">skills</a>
    <a href="#experience">experience</a>
    <a href="#contact">contact</a>
  </div>
</nav>
<section class="hero">
  <div class="hero-inner">
    <div class="terminal-prompt">$ whoami → <span>{{NAME}}</span></div>
    <h1 class="hero-name"><span class="typed">{{FIRST_NAME}}</span><br/>{{LAST_NAME}}</h1>
    <div class="hero-role">{{ROLE}} @ <span>{{COLLEGE}}</span> · {{YEAR}} Year</div>
    <p class="hero-bio">{{BIO}}</p>
    <div class="hero-tags">
      {{#SKILLS}}<span class="tag">{{SKILL}}</span>{{/SKILLS}}
    </div>
    <div class="hero-cta">
      <a href="#projects" class="btn-primary">view my work →</a>
      <a href="#contact" class="btn-outline">get in touch</a>
    </div>
  </div>
</section>
<div class="stats">
  <div class="stat"><div class="stat-num">{{PROJECTS_COUNT}}+</div><div class="stat-label">projects built</div></div>
  <div class="stat"><div class="stat-num">{{INTERNSHIPS_COUNT}}</div><div class="stat-label">internships</div></div>
  <div class="stat"><div class="stat-num">{{GITHUB_COMMITS}}+</div><div class="stat-label">github commits</div></div>
  <div class="stat"><div class="stat-num">{{CGPA}}</div><div class="stat-label">cgpa</div></div>
</div>
<section class="section" id="projects">
  <div class="section-header">
    <span class="section-num">01.</span>
    <h2 class="section-title">selected projects</h2>
    <div class="section-line"></div>
  </div>
  <div class="projects-grid">
    {{#PROJECTS}}
    <div class="project-card">
      <div class="project-type">{{PROJECT_TYPE}}</div>
      <div class="project-title">{{PROJECT_TITLE}}</div>
      <div class="project-desc">{{PROJECT_DESC}}</div>
      <div class="project-stack">{{#STACK}}<span class="stack-tag">{{TECH}}</span>{{/STACK}}</div>
    </div>
    {{/PROJECTS}}
  </div>
</section>
<section class="section" id="skills">
  <div class="section-header">
    <span class="section-num">02.</span>
    <h2 class="section-title">technical skills</h2>
    <div class="section-line"></div>
  </div>
  <div class="skills-grid">
    <div class="skill-group">
      <div class="skill-group-title">languages</div>
      <div class="skill-list">
        {{#LANGUAGES}}<div class="skill-item"><span>{{LANG}}</span><div class="skill-bar"><div class="skill-fill" style="width:{{LEVEL}}%"></div></div></div>{{/LANGUAGES}}
      </div>
    </div>
    <div class="skill-group">
      <div class="skill-group-title">frameworks</div>
      <div class="skill-list">
        {{#FRAMEWORKS}}<div class="skill-item"><span>{{FRAMEWORK}}</span><div class="skill-bar"><div class="skill-fill" style="width:{{LEVEL}}%"></div></div></div>{{/FRAMEWORKS}}
      </div>
    </div>
    <div class="skill-group">
      <div class="skill-group-title">tools</div>
      <div class="skill-list">
        {{#TOOLS}}<div class="skill-item"><span>{{TOOL}}</span><div class="skill-bar"><div class="skill-fill" style="width:{{LEVEL}}%"></div></div></div>{{/TOOLS}}
      </div>
    </div>
  </div>
</section>
<section class="section" id="experience">
  <div class="section-header">
    <span class="section-num">03.</span>
    <h2 class="section-title">experience</h2>
    <div class="section-line"></div>
  </div>
  <div class="exp-list">
    {{#EXPERIENCES}}
    <div class="exp-item">
      <div class="exp-date">{{DATE}}</div>
      <div>
        <div class="exp-title">{{TITLE}}</div>
        <div class="exp-company">{{COMPANY}}</div>
        <div class="exp-desc">{{DESC}}</div>
      </div>
    </div>
    {{/EXPERIENCES}}
  </div>
</section>
<section class="contact-section" id="contact">
  <h2 class="contact-title">let's build<br/>something.</h2>
  <p class="contact-sub">open to opportunities, collaborations, and interesting conversations.</p>
  <div class="contact-links">
    <a href="mailto:{{EMAIL}}" class="contact-link">✉ {{EMAIL}}</a>
    <a href="{{GITHUB_URL}}" class="contact-link">⌥ GitHub</a>
    <a href="{{LINKEDIN_URL}}" class="contact-link">⊞ LinkedIn</a>
  </div>
</section>
<footer>built with <span>FolioAI</span> · {{NAME}} · {{YEAR_BUILT}}</footer>
<script>
const cursor=document.getElementById('cursor');
document.addEventListener('mousemove',e=>{cursor.style.left=e.clientX+'px';cursor.style.top=e.clientY+'px'});
</script>
</body>
</html>`;

// ============================================
// Template 2: Editorial - Elegant serif typography
// ============================================
const editorialTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>{{NAME}}</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet"/>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--bg:#faf8f4;--surface:#ffffff;--ink:#1a1614;--ink2:#6b6460;--ink3:#b0ada8;--accent:#c8490a;--border:#e8e4de;--serif:'Playfair Display',serif;--sans:'DM Sans',sans-serif}
html{scroll-behavior:smooth}
body{font-family:var(--sans);background:var(--bg);color:var(--ink);font-size:15px;line-height:1.7}
nav{padding:20px 48px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border);position:sticky;top:0;background:rgba(250,248,244,0.95);backdrop-filter:blur(8px);z-index:100}
.nav-name{font-family:var(--serif);font-size:18px;font-weight:700;color:var(--ink)}
.nav-links{display:flex;gap:28px}
.nav-links a{font-size:13px;color:var(--ink2);text-decoration:none;font-weight:400;letter-spacing:0.02em;transition:color 0.2s}
.nav-links a:hover{color:var(--ink)}
.nav-hire{padding:8px 20px;border:1px solid var(--ink);border-radius:100px;font-size:13px;color:var(--ink);text-decoration:none;transition:all 0.2s;font-weight:500}
.nav-hire:hover{background:var(--ink);color:var(--bg)}
.hero{display:grid;grid-template-columns:1fr 1fr;min-height:90vh;border-bottom:1px solid var(--border)}
.hero-left{padding:80px 48px;display:flex;flex-direction:column;justify-content:center;border-right:1px solid var(--border)}
.hero-label{font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:var(--accent);margin-bottom:24px;font-weight:500}
.hero-name{font-family:var(--serif);font-size:clamp(3rem,5vw,5.5rem);font-weight:900;line-height:1.0;letter-spacing:-0.02em;color:var(--ink);margin-bottom:24px}
.hero-name em{font-style:italic;color:var(--accent)}
.hero-bio{font-size:1rem;color:var(--ink2);max-width:400px;line-height:1.8;margin-bottom:40px;font-weight:300}
.hero-cta{display:flex;gap:12px;align-items:center}
.btn-dark{padding:14px 32px;background:var(--ink);color:var(--bg);font-size:14px;font-weight:500;border:none;border-radius:100px;cursor:pointer;font-family:var(--sans);text-decoration:none;display:inline-block;letter-spacing:0.02em;transition:opacity 0.2s}
.btn-dark:hover{opacity:0.85}
.btn-light{padding:14px 32px;background:transparent;color:var(--ink);font-size:14px;font-weight:500;border:1px solid var(--border);border-radius:100px;cursor:pointer;font-family:var(--sans);text-decoration:none;display:inline-block;letter-spacing:0.02em;transition:all 0.2s}
.btn-light:hover{border-color:var(--ink)}
.hero-right{padding:80px 48px;display:flex;flex-direction:column;justify-content:space-between}
.hero-stats{display:flex;flex-direction:column;gap:32px}
.hero-stat{border-bottom:1px solid var(--border);padding-bottom:24px}
.hero-stat:last-child{border-bottom:none}
.stat-num{font-family:var(--serif);font-size:3rem;font-weight:700;color:var(--ink);line-height:1}
.stat-label{font-size:12px;color:var(--ink3);margin-top:4px;letter-spacing:0.05em;text-transform:uppercase}
.hero-college{font-size:13px;color:var(--ink2);padding-top:32px;border-top:1px solid var(--border)}
.hero-college strong{color:var(--ink);display:block;font-size:15px;margin-bottom:4px}
.marquee-wrap{overflow:hidden;border-top:1px solid var(--border);border-bottom:1px solid var(--border);padding:16px 0;background:var(--ink)}
.marquee{display:flex;gap:48px;animation:marquee 20s linear infinite;white-space:nowrap}
.marquee span{font-size:13px;color:rgba(250,248,244,0.5);font-weight:300;letter-spacing:0.05em;text-transform:uppercase}
.marquee span.accent{color:var(--accent)}
@keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
.projects-section{padding:80px 48px;max-width:1200px;margin:0 auto}
.section-header{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:48px;border-bottom:1px solid var(--border);padding-bottom:16px}
.section-title{font-family:var(--serif);font-size:2.5rem;font-weight:700;color:var(--ink)}
.section-count{font-size:13px;color:var(--ink3)}
.projects-list{display:flex;flex-direction:column;gap:0}
.project-row{display:grid;grid-template-columns:60px 2fr 1fr 120px;gap:32px;padding:32px 0;border-bottom:1px solid var(--border);align-items:start;transition:background 0.2s;cursor:pointer}
.project-row:hover{background:var(--surface);margin:0 -48px;padding:32px 48px}
.project-num{font-family:var(--serif);font-size:1rem;color:var(--ink3);font-style:italic}
.project-title{font-family:var(--serif);font-size:1.4rem;font-weight:700;color:var(--ink);margin-bottom:8px}
.project-desc{font-size:13px;color:var(--ink2);line-height:1.7}
.project-tags-col{display:flex;flex-direction:column;gap:4px}
.project-tag{font-size:11px;color:var(--ink3);letter-spacing:0.05em}
.project-arrow{font-size:1.5rem;color:var(--ink3);text-align:right;padding-top:4px;transition:transform 0.2s}
.project-row:hover .project-arrow{transform:translate(4px,-4px);color:var(--accent)}
.skills-section{padding:80px 48px;border-top:1px solid var(--border);background:var(--ink)}
.skills-inner{max-width:1200px;margin:0 auto}
.skills-title{font-family:var(--serif);font-size:2.5rem;font-weight:700;color:var(--bg);margin-bottom:48px}
.skills-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:32px}
.skill-col-title{font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:rgba(250,248,244,0.4);margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid rgba(250,248,244,0.1)}
.skill-col-items{display:flex;flex-direction:column;gap:10px}
.skill-col-item{font-size:14px;color:rgba(250,248,244,0.8);font-weight:300}
.exp-section{padding:80px 48px;max-width:1200px;margin:0 auto}
.exp-grid{display:flex;flex-direction:column;gap:0}
.exp-row{display:grid;grid-template-columns:160px 1fr;gap:48px;padding:40px 0;border-bottom:1px solid var(--border)}
.exp-period{font-size:12px;color:var(--ink3);padding-top:6px;letter-spacing:0.05em}
.exp-content-title{font-family:var(--serif);font-size:1.3rem;font-weight:700;color:var(--ink);margin-bottom:4px}
.exp-content-company{font-size:14px;color:var(--accent);margin-bottom:12px;font-weight:500}
.exp-content-desc{font-size:13px;color:var(--ink2);line-height:1.8}
.contact-section{padding:100px 48px;text-align:center;border-top:1px solid var(--border)}
.contact-label{font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:var(--ink3);margin-bottom:24px}
.contact-title{font-family:var(--serif);font-size:clamp(2.5rem,6vw,5rem);font-weight:900;color:var(--ink);margin-bottom:40px;line-height:1.1}
.contact-title em{font-style:italic;color:var(--accent)}
.contact-row{display:flex;gap:16px;justify-content:center;flex-wrap:wrap}
.contact-item{padding:12px 28px;border:1px solid var(--border);border-radius:100px;font-size:13px;color:var(--ink2);text-decoration:none;transition:all 0.2s;font-weight:400}
.contact-item:hover{border-color:var(--ink);color:var(--ink)}
footer{padding:24px 48px;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;font-size:12px;color:var(--ink3)}
footer span{color:var(--accent)}
@media(max-width:768px){
  nav{padding:16px 20px}.nav-links,.nav-hire{display:none}
  .hero{grid-template-columns:1fr}.hero-right{display:none}
  .hero-left{padding:60px 20px}
  .projects-section,.exp-section,.contact-section{padding:60px 20px}
  .project-row{grid-template-columns:40px 1fr;gap:16px}.project-tags-col,.project-arrow{display:none}
  .exp-row{grid-template-columns:1fr;gap:4px}
  .skills-section{padding:60px 20px}
  footer{padding:16px 20px;flex-direction:column;gap:8px}
}
</style>
</head>
<body>
<nav>
  <div class="nav-name">{{NAME}}</div>
  <div class="nav-links">
    <a href="#projects">Work</a>
    <a href="#skills">Skills</a>
    <a href="#experience">Experience</a>
    <a href="#contact">Contact</a>
  </div>
  <a href="mailto:{{EMAIL}}" class="nav-hire">Hire me</a>
</nav>
<section class="hero">
  <div class="hero-left">
    <div class="hero-label">{{ROLE}} · {{COLLEGE}}</div>
    <h1 class="hero-name">{{FIRST_NAME}}<br/><em>{{LAST_NAME}}</em></h1>
    <p class="hero-bio">{{BIO}}</p>
    <div class="hero-cta">
      <a href="#projects" class="btn-dark">View my work</a>
      <a href="{{RESUME_URL}}" class="btn-light">Download CV</a>
    </div>
  </div>
  <div class="hero-right">
    <div class="hero-stats">
      <div class="hero-stat"><div class="stat-num">{{PROJECTS_COUNT}}</div><div class="stat-label">Projects completed</div></div>
      <div class="hero-stat"><div class="stat-num">{{INTERNSHIPS_COUNT}}×</div><div class="stat-label">Internship experience</div></div>
      <div class="hero-stat"><div class="stat-num">{{CGPA}}</div><div class="stat-label">CGPA</div></div>
    </div>
    <div class="hero-college"><strong>{{COLLEGE}}</strong>{{BRANCH}} · {{YEAR}} Year · {{GRAD_YEAR}}</div>
  </div>
</section>
<div class="marquee-wrap">
  <div class="marquee">
    {{#SKILLS}}<span>{{SKILL}}</span><span class="accent">·</span>{{/SKILLS}}
    {{#SKILLS}}<span>{{SKILL}}</span><span class="accent">·</span>{{/SKILLS}}
  </div>
</div>
<section class="projects-section" id="projects">
  <div class="section-header">
    <h2 class="section-title">Selected Work</h2>
    <span class="section-count">{{PROJECTS_COUNT}} projects</span>
  </div>
  <div class="projects-list">
    {{#PROJECTS}}
    <div class="project-row">
      <div class="project-num">0{{INDEX}}</div>
      <div>
        <div class="project-title">{{PROJECT_TITLE}}</div>
        <div class="project-desc">{{PROJECT_DESC}}</div>
      </div>
      <div class="project-tags-col">{{#STACK}}<span class="project-tag">{{TECH}}</span>{{/STACK}}</div>
      <div class="project-arrow">↗</div>
    </div>
    {{/PROJECTS}}
  </div>
</section>
<section class="skills-section" id="skills">
  <div class="skills-inner">
    <h2 class="skills-title">Technical Skills</h2>
    <div class="skills-grid">
      <div><div class="skill-col-title">Languages</div><div class="skill-col-items">{{#LANGUAGES}}<div class="skill-col-item">{{LANG}}</div>{{/LANGUAGES}}</div></div>
      <div><div class="skill-col-title">Frameworks</div><div class="skill-col-items">{{#FRAMEWORKS}}<div class="skill-col-item">{{FRAMEWORK}}</div>{{/FRAMEWORKS}}</div></div>
      <div><div class="skill-col-title">Tools & Platforms</div><div class="skill-col-items">{{#TOOLS}}<div class="skill-col-item">{{TOOL}}</div>{{/TOOLS}}</div></div>
      <div><div class="skill-col-title">Domains</div><div class="skill-col-items">{{#DOMAINS}}<div class="skill-col-item">{{DOMAIN}}</div>{{/DOMAINS}}</div></div>
    </div>
  </div>
</section>
<section class="exp-section" id="experience">
  <div class="section-header">
    <h2 class="section-title">Experience</h2>
  </div>
  <div class="exp-grid">
    {{#EXPERIENCES}}
    <div class="exp-row">
      <div class="exp-period">{{DATE}}</div>
      <div>
        <div class="exp-content-title">{{TITLE}}</div>
        <div class="exp-content-company">{{COMPANY}}</div>
        <div class="exp-content-desc">{{DESC}}</div>
      </div>
    </div>
    {{/EXPERIENCES}}
  </div>
</section>
<section class="contact-section" id="contact">
  <div class="contact-label">Get in touch</div>
  <h2 class="contact-title">Let's work<br/><em>together.</em></h2>
  <div class="contact-row">
    <a href="mailto:{{EMAIL}}" class="contact-item">{{EMAIL}}</a>
    <a href="{{GITHUB_URL}}" class="contact-item">GitHub</a>
    <a href="{{LINKEDIN_URL}}" class="contact-item">LinkedIn</a>
  </div>
</section>
<footer><span>{{NAME}}</span><div>Built with FolioAI · {{YEAR_BUILT}}</div></footer>
</body>
</html>`;

// ============================================
// Template 3: Gradient - Modern glassmorphism
// ============================================
const gradientTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>{{NAME}} — Portfolio</title>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet"/>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--bg:#080810;--surface:rgba(255,255,255,0.04);--border:rgba(255,255,255,0.08);--text:#f0f0ff;--text2:rgba(240,240,255,0.55);--text3:rgba(240,240,255,0.3);--p1:#7c3aed;--p2:#2563eb;--p3:#06b6d4;--g1:linear-gradient(135deg,#7c3aed,#2563eb);--g2:linear-gradient(135deg,#2563eb,#06b6d4)}
html{scroll-behavior:smooth}
body{font-family:'Outfit',sans-serif;background:var(--bg);color:var(--text);font-size:15px;line-height:1.6;overflow-x:hidden}
body::before{content:'';position:fixed;inset:0;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");pointer-events:none;z-index:0}
.orb{position:fixed;border-radius:50%;filter:blur(100px);pointer-events:none;z-index:0}
.orb1{width:600px;height:600px;background:rgba(124,58,237,0.15);top:-200px;left:-200px}
.orb2{width:500px;height:500px;background:rgba(37,99,235,0.1);bottom:-100px;right:-100px}
.orb3{width:300px;height:300px;background:rgba(6,182,212,0.08);top:40%;left:50%}
nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:16px 40px;display:flex;align-items:center;justify-content:space-between;background:rgba(8,8,16,0.8);backdrop-filter:blur(20px);border-bottom:1px solid var(--border)}
.nav-logo{font-size:16px;font-weight:700;background:var(--g1);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.nav-links{display:flex;gap:4px}
.nav-link{padding:7px 16px;border-radius:8px;font-size:13px;color:var(--text2);text-decoration:none;transition:all 0.2s;font-weight:500}
.nav-link:hover{color:var(--text);background:var(--surface)}
.nav-cta{padding:8px 20px;border-radius:100px;font-size:13px;font-weight:600;color:#fff;background:var(--g1);border:none;cursor:pointer;font-family:'Outfit',sans-serif;text-decoration:none}
.hero{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:100px 40px 60px;text-align:center;position:relative;z-index:1}
.hero-inner{max-width:800px}
.hero-badge{display:inline-flex;align-items:center;gap:8px;padding:8px 20px;border-radius:100px;border:1px solid rgba(124,58,237,0.3);background:rgba(124,58,237,0.08);font-size:12px;color:rgba(167,139,250,1);margin-bottom:32px;font-weight:500}
.badge-dot{width:6px;height:6px;border-radius:50%;background:#7c3aed;animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(124,58,237,0.4)}50%{opacity:0.8;box-shadow:0 0 0 8px transparent}}
.hero-name{font-size:clamp(3.5rem,9vw,8rem);font-weight:900;line-height:0.95;letter-spacing:-0.04em;margin-bottom:24px}
.hero-name .grad{background:var(--g1);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.hero-name .grad2{background:var(--g2);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.hero-role{font-size:1.1rem;color:var(--text2);margin-bottom:24px;font-weight:300}
.hero-bio{font-size:1rem;color:var(--text2);max-width:520px;margin:0 auto 40px;font-weight:300;line-height:1.8}
.hero-pills{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-bottom:40px}
.hero-pill{padding:6px 16px;border-radius:100px;font-size:12px;font-weight:500;border:1px solid var(--border);color:var(--text2);background:var(--surface)}
.hero-btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
.btn-grad{padding:14px 32px;border-radius:100px;font-size:15px;font-weight:600;color:#fff;background:var(--g1);border:none;cursor:pointer;font-family:'Outfit',sans-serif;text-decoration:none;display:inline-block;transition:opacity 0.2s,transform 0.2s}
.btn-grad:hover{opacity:0.9;transform:translateY(-2px)}
.btn-glass{padding:14px 32px;border-radius:100px;font-size:15px;font-weight:600;color:var(--text);background:var(--surface);border:1px solid var(--border);cursor:pointer;font-family:'Outfit',sans-serif;text-decoration:none;display:inline-block;transition:all 0.2s;backdrop-filter:blur(10px)}
.btn-glass:hover{border-color:rgba(255,255,255,0.2);background:rgba(255,255,255,0.06)}
.stats-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:16px;padding:0 40px 80px;max-width:900px;margin:0 auto;position:relative;z-index:1}
.stat-card{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:24px;text-align:center;backdrop-filter:blur(10px)}
.stat-num{font-size:2.2rem;font-weight:800;background:var(--g1);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.stat-label{font-size:12px;color:var(--text3);margin-top:4px}
.section{padding:80px 40px;max-width:1000px;margin:0 auto;position:relative;z-index:1}
.section-eyebrow{font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;background:var(--g1);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:12px}
.section-title{font-size:2.5rem;font-weight:800;color:var(--text);margin-bottom:48px;letter-spacing:-0.02em}
.projects-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px}
.project-card{background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:28px;transition:all 0.3s;backdrop-filter:blur(10px);position:relative;overflow:hidden}
.project-card::before{content:'';position:absolute;inset:0;background:var(--g1);opacity:0;transition:opacity 0.3s;border-radius:20px}
.project-card:hover::before{opacity:0.05}
.project-card:hover{border-color:rgba(124,58,237,0.3);transform:translateY(-6px)}
.project-icon{font-size:28px;margin-bottom:16px}
.project-type{font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:rgba(167,139,250,0.8);margin-bottom:8px}
.project-title{font-size:1.15rem;font-weight:700;color:var(--text);margin-bottom:10px}
.project-desc{font-size:13px;color:var(--text2);line-height:1.7;margin-bottom:20px}
.project-stack{display:flex;gap:6px;flex-wrap:wrap}
.stack-pill{font-size:11px;padding:4px 12px;border-radius:100px;background:rgba(124,58,237,0.1);color:rgba(167,139,250,0.9);border:1px solid rgba(124,58,237,0.2);font-weight:500}
.skills-section{padding:80px 40px;position:relative;z-index:1}
.skills-inner{max-width:1000px;margin:0 auto}
.skills-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px;margin-top:48px}
.skill-card{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:24px;backdrop-filter:blur(10px)}
.skill-card-title{font-size:12px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:var(--text3);margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid var(--border)}
.skill-items{display:flex;flex-wrap:wrap;gap:6px}
.skill-chip{padding:5px 12px;border-radius:8px;font-size:12px;font-weight:500;background:rgba(255,255,255,0.05);color:var(--text2);border:1px solid var(--border)}
.exp-section{padding:80px 40px;max-width:1000px;margin:0 auto;position:relative;z-index:1}
.timeline{display:flex;flex-direction:column;gap:0;position:relative}
.timeline::before{content:'';position:absolute;left:20px;top:0;bottom:0;width:1px;background:linear-gradient(to bottom,#7c3aed,#06b6d4);opacity:0.3}
.timeline-item{display:grid;grid-template-columns:60px 1fr;gap:24px;padding:32px 0}
.timeline-dot{width:10px;height:10px;border-radius:50%;background:var(--g1);margin-top:8px;position:relative;z-index:1;margin-left:16px;box-shadow:0 0 20px rgba(124,58,237,0.5)}
.tl-date{font-size:11px;color:var(--text3);font-weight:500;padding-top:4px}
.tl-title{font-size:1.1rem;font-weight:700;color:var(--text);margin-bottom:4px}
.tl-company{font-size:13px;font-weight:600;background:var(--g2);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:10px}
.tl-desc{font-size:13px;color:var(--text2);line-height:1.7}
.contact-section{padding:100px 40px;text-align:center;position:relative;z-index:1}
.contact-glow{position:absolute;width:400px;height:400px;border-radius:50%;background:radial-gradient(circle,rgba(124,58,237,0.15),transparent);left:50%;top:50%;transform:translate(-50%,-50%);pointer-events:none}
.contact-title{font-size:clamp(2.5rem,6vw,5rem);font-weight:900;letter-spacing:-0.03em;margin-bottom:16px}
.contact-title .grad{background:var(--g1);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.contact-sub{font-size:1rem;color:var(--text2);margin-bottom:40px}
.contact-links{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
.contact-link{padding:14px 28px;border-radius:100px;font-size:14px;font-weight:600;color:var(--text);background:var(--surface);border:1px solid var(--border);text-decoration:none;backdrop-filter:blur(10px);transition:all 0.2s}
.contact-link:hover{border-color:rgba(124,58,237,0.4);background:rgba(124,58,237,0.08)}
.contact-link.primary{background:var(--g1);border:none;color:#fff}
footer{padding:24px 40px;text-align:center;font-size:12px;color:var(--text3);border-top:1px solid var(--border);position:relative;z-index:1}
footer span{background:var(--g1);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-weight:600}
@media(max-width:600px){
  nav{padding:12px 20px}.nav-links{display:none}
  .hero{padding:80px 20px 40px}.stats-row{padding:0 20px 60px}
  .section,.skills-section,.exp-section,.contact-section{padding:60px 20px}
}
</style>
</head>
<body>
<div class="orb orb1"></div>
<div class="orb orb2"></div>
<div class="orb orb3"></div>
<nav>
  <div class="nav-logo">{{NAME}}</div>
  <div class="nav-links">
    <a href="#projects" class="nav-link">Projects</a>
    <a href="#skills" class="nav-link">Skills</a>
    <a href="#experience" class="nav-link">Experience</a>
    <a href="#contact" class="nav-link">Contact</a>
  </div>
  <a href="mailto:{{EMAIL}}" class="nav-cta">Let's talk →</a>
</nav>
<section class="hero">
  <div class="hero-inner">
    <div class="hero-badge"><span class="badge-dot"></span>{{ROLE}} · {{COLLEGE}}</div>
    <h1 class="hero-name">
      <span class="grad">{{FIRST_NAME}}</span><br/>
      <span class="grad2">{{LAST_NAME}}</span>
    </h1>
    <div class="hero-role">{{BRANCH}} · {{YEAR}} Year · Graduating {{GRAD_YEAR}}</div>
    <p class="hero-bio">{{BIO}}</p>
    <div class="hero-pills">{{#SKILLS}}<span class="hero-pill">{{SKILL}}</span>{{/SKILLS}}</div>
    <div class="hero-btns">
      <a href="#projects" class="btn-grad">View Projects</a>
      <a href="#contact" class="btn-glass">Get in touch</a>
    </div>
  </div>
</section>
<div class="stats-row">
  <div class="stat-card"><div class="stat-num">{{PROJECTS_COUNT}}+</div><div class="stat-label">Projects Built</div></div>
  <div class="stat-card"><div class="stat-num">{{INTERNSHIPS_COUNT}}×</div><div class="stat-label">Internships</div></div>
  <div class="stat-card"><div class="stat-num">{{GITHUB_COMMITS}}+</div><div class="stat-label">GitHub Commits</div></div>
  <div class="stat-card"><div class="stat-num">{{CGPA}}</div><div class="stat-label">CGPA</div></div>
</div>
<section class="section" id="projects">
  <div class="section-eyebrow">Featured Work</div>
  <div class="section-title">Projects I've Built</div>
  <div class="projects-grid">
    {{#PROJECTS}}
    <div class="project-card">
      <div class="project-icon">{{ICON}}</div>
      <div class="project-type">{{PROJECT_TYPE}}</div>
      <div class="project-title">{{PROJECT_TITLE}}</div>
      <div class="project-desc">{{PROJECT_DESC}}</div>
      <div class="project-stack">{{#STACK}}<span class="stack-pill">{{TECH}}</span>{{/STACK}}</div>
    </div>
    {{/PROJECTS}}
  </div>
</section>
<section class="skills-section" id="skills">
  <div class="skills-inner">
    <div class="section-eyebrow">Technical Arsenal</div>
    <div class="section-title">Skills & Technologies</div>
    <div class="skills-grid">
      <div class="skill-card"><div class="skill-card-title">Languages</div><div class="skill-items">{{#LANGUAGES}}<span class="skill-chip">{{LANG}}</span>{{/LANGUAGES}}</div></div>
      <div class="skill-card"><div class="skill-card-title">Frameworks</div><div class="skill-items">{{#FRAMEWORKS}}<span class="skill-chip">{{FRAMEWORK}}</span>{{/FRAMEWORKS}}</div></div>
      <div class="skill-card"><div class="skill-card-title">Tools</div><div class="skill-items">{{#TOOLS}}<span class="skill-chip">{{TOOL}}</span>{{/TOOLS}}</div></div>
      <div class="skill-card"><div class="skill-card-title">Domains</div><div class="skill-items">{{#DOMAINS}}<span class="skill-chip">{{DOMAIN}}</span>{{/DOMAINS}}</div></div>
    </div>
  </div>
</section>
<section class="exp-section" id="experience">
  <div class="section-eyebrow">Experience</div>
  <div class="section-title">Where I've Worked</div>
  <div class="timeline">
    {{#EXPERIENCES}}
    <div class="timeline-item">
      <div><div class="timeline-dot"></div></div>
      <div>
        <div class="tl-date">{{DATE}}</div>
        <div class="tl-title">{{TITLE}}</div>
        <div class="tl-company">{{COMPANY}}</div>
        <div class="tl-desc">{{DESC}}</div>
      </div>
    </div>
    {{/EXPERIENCES}}
  </div>
</section>
<section class="contact-section" id="contact">
  <div class="contact-glow"></div>
  <h2 class="contact-title">Ready to<br/><span class="grad">collaborate?</span></h2>
  <p class="contact-sub">Open to internships, full-time roles, and interesting projects.</p>
  <div class="contact-links">
    <a href="mailto:{{EMAIL}}" class="contact-link primary">✉ Email me</a>
    <a href="{{LINKEDIN_URL}}" class="contact-link">LinkedIn</a>
    <a href="{{GITHUB_URL}}" class="contact-link">GitHub</a>
  </div>
</section>
<footer>Built with <span>FolioAI</span> · {{NAME}} · {{YEAR_BUILT}}</footer>
</body>
</html>`;

// ============================================
// Template 4: Brutalist - Bold newspaper style
// ============================================
const brutalistTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>{{NAME}}</title>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Bebas+Neue&display=swap" rel="stylesheet"/>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--bg:#f5f0e8;--ink:#111;--accent:#ff4500;--accent2:#ff6b35;--border:#111;--surface:#fff;--muted:#888}
html{scroll-behavior:smooth}
body{font-family:'Space Grotesk',sans-serif;background:var(--bg);color:var(--ink);font-size:15px;line-height:1.6}
nav{padding:0 48px;height:64px;display:flex;align-items:center;justify-content:space-between;border-bottom:2px solid var(--ink);position:sticky;top:0;background:var(--bg);z-index:100}
.nav-logo{font-family:'Bebas Neue',sans-serif;font-size:28px;letter-spacing:0.05em;color:var(--ink)}
.nav-links{display:flex;gap:0}
.nav-link{padding:0 20px;height:64px;display:flex;align-items:center;font-size:13px;font-weight:600;color:var(--ink);text-decoration:none;text-transform:uppercase;letter-spacing:0.08em;border-left:2px solid var(--ink);transition:all 0.15s}
.nav-link:hover{background:var(--ink);color:var(--bg)}
.nav-link:last-child{border-right:2px solid var(--ink)}
.hero{border-bottom:2px solid var(--ink);display:grid;grid-template-columns:1fr auto}
.hero-left{padding:64px 48px;border-right:2px solid var(--ink)}
.hero-label{font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:var(--muted);margin-bottom:24px;display:flex;align-items:center;gap:12px}
.hero-label::before{content:'';width:32px;height:2px;background:var(--accent)}
.hero-name{font-family:'Bebas Neue',sans-serif;font-size:clamp(5rem,12vw,12rem);line-height:0.9;letter-spacing:0.02em;color:var(--ink);margin-bottom:32px}
.hero-name .outline{-webkit-text-stroke:2px var(--ink);color:transparent}
.hero-name .accent{color:var(--accent)}
.hero-bio{font-size:1rem;color:var(--muted);max-width:480px;line-height:1.8;font-weight:300;margin-bottom:40px;border-left:4px solid var(--accent);padding-left:16px}
.hero-btns{display:flex;gap:0}
.btn-fill{padding:16px 32px;background:var(--ink);color:var(--bg);font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;border:2px solid var(--ink);cursor:pointer;font-family:'Space Grotesk',sans-serif;text-decoration:none;display:inline-block;transition:all 0.15s}
.btn-fill:hover{background:var(--accent);border-color:var(--accent)}
.btn-stroke{padding:16px 32px;background:transparent;color:var(--ink);font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;border:2px solid var(--ink);cursor:pointer;font-family:'Space Grotesk',sans-serif;text-decoration:none;display:inline-block;transition:all 0.15s;border-left:none}
.btn-stroke:hover{background:var(--ink);color:var(--bg)}
.hero-right{padding:64px 48px;display:flex;flex-direction:column;justify-content:space-between;min-width:280px}
.hero-stat-big{margin-bottom:32px;padding-bottom:32px;border-bottom:2px solid var(--ink)}
.stat-big-num{font-family:'Bebas Neue',sans-serif;font-size:5rem;color:var(--accent);line-height:1}
.stat-big-label{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--muted)}
.hero-info{display:flex;flex-direction:column;gap:16px}
.info-item{display:flex;flex-direction:column;gap:2px}
.info-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--muted)}
.info-val{font-size:14px;font-weight:600;color:var(--ink)}
.ticker{background:var(--ink);padding:12px 0;overflow:hidden;border-bottom:2px solid var(--ink)}
.ticker-inner{display:flex;gap:48px;animation:ticker 15s linear infinite;white-space:nowrap}
.ticker-item{font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:0.1em;color:var(--bg)}
.ticker-item.acc{color:var(--accent)}
@keyframes ticker{from{transform:translateX(0)}to{transform:translateX(-50%)}}
.projects-section{border-bottom:2px solid var(--ink)}
.section-header{padding:32px 48px;border-bottom:2px solid var(--ink);display:flex;align-items:center;justify-content:space-between}
.section-title{font-family:'Bebas Neue',sans-serif;font-size:3rem;color:var(--ink);letter-spacing:0.05em}
.section-num{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--muted)}
.projects-list{display:flex;flex-direction:column}
.project-row{display:grid;grid-template-columns:64px 1fr 200px 64px;border-bottom:2px solid var(--ink);transition:background 0.15s;cursor:pointer}
.project-row:hover{background:var(--ink)}
.project-row:hover .pr-num,.project-row:hover .pr-title,.project-row:hover .pr-desc,.project-row:hover .pr-tags span{color:var(--bg)}
.project-row:hover .pr-arrow{color:var(--accent)}
.pr-num{padding:28px 24px;font-family:'Bebas Neue',sans-serif;font-size:1.5rem;color:var(--muted);border-right:2px solid var(--ink)}
.project-row:hover .pr-num{border-right-color:rgba(255,255,255,0.15)}
.pr-content{padding:28px 32px;border-right:2px solid var(--ink)}
.project-row:hover .pr-content{border-right-color:rgba(255,255,255,0.15)}
.pr-title{font-size:1.1rem;font-weight:700;color:var(--ink);margin-bottom:6px}
.pr-desc{font-size:13px;color:var(--muted);line-height:1.6}
.pr-tags{padding:28px 24px;border-right:2px solid var(--ink);display:flex;flex-direction:column;gap:4px;justify-content:center}
.project-row:hover .pr-tags{border-right-color:rgba(255,255,255,0.15)}
.pr-tags span{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:var(--muted)}
.pr-arrow{padding:28px 24px;display:flex;align-items:center;justify-content:center;font-size:1.5rem;color:var(--muted)}
.skills-section{border-bottom:2px solid var(--ink)}
.skills-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr))}
.skill-col{border-right:2px solid var(--ink);padding:40px 32px}
.skill-col:last-child{border-right:none}
.skill-col-title{font-family:'Bebas Neue',sans-serif;font-size:1.5rem;color:var(--ink);margin-bottom:20px;letter-spacing:0.05em}
.skill-items{display:flex;flex-direction:column;gap:10px}
.skill-item{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:500;color:var(--ink)}
.skill-item::before{content:'→';color:var(--accent);font-weight:700}
.exp-section{border-bottom:2px solid var(--ink)}
.exp-list{display:flex;flex-direction:column}
.exp-item{display:grid;grid-template-columns:200px 1fr;border-bottom:2px solid var(--ink)}
.exp-item:last-child{border-bottom:none}
.exp-left{padding:36px 32px;border-right:2px solid var(--ink);display:flex;flex-direction:column;justify-content:space-between}
.exp-date{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--muted)}
.exp-company{font-family:'Bebas Neue',sans-serif;font-size:1.8rem;color:var(--accent);letter-spacing:0.05em;margin-top:8px}
.exp-right{padding:36px 48px}
.exp-title{font-size:1.1rem;font-weight:700;color:var(--ink);margin-bottom:10px}
.exp-desc{font-size:13px;color:var(--muted);line-height:1.8}
.contact-section{padding:80px 48px;display:grid;grid-template-columns:1fr 1fr;gap:80px;border-bottom:2px solid var(--ink)}
.contact-left h2{font-family:'Bebas Neue',sans-serif;font-size:clamp(3rem,6vw,6rem);line-height:0.9;letter-spacing:0.02em;margin-bottom:24px}
.contact-left h2 .outline{-webkit-text-stroke:2px var(--ink);color:transparent}
.contact-sub{font-size:14px;color:var(--muted);line-height:1.8}
.contact-right{display:flex;flex-direction:column;justify-content:center;gap:16px}
.contact-item{display:flex;align-items:center;justify-content:space-between;padding:20px 24px;border:2px solid var(--ink);text-decoration:none;color:var(--ink);transition:all 0.15s}
.contact-item:hover{background:var(--ink);color:var(--bg)}
.contact-item:hover .ci-arrow{color:var(--accent)}
.ci-label{font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em}
.ci-arrow{font-size:1.2rem}
footer{padding:24px 48px;display:flex;justify-content:space-between;align-items:center;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:var(--muted)}
footer span{color:var(--accent)}
@media(max-width:768px){
  nav{padding:0 20px}.nav-links{display:none}
  .hero{grid-template-columns:1fr}.hero-right{display:none}
  .hero-left{padding:40px 20px}
  .hero-name{font-size:5rem}
  .section-header{padding:24px 20px}
  .project-row{grid-template-columns:48px 1fr;}.pr-tags,.pr-arrow{display:none}
  .pr-content{padding:20px}
  .pr-num{padding:20px 16px}
  .skills-grid{grid-template-columns:1fr 1fr}
  .skill-col{padding:24px 20px}
  .exp-item{grid-template-columns:1fr}.exp-left{border-right:none;border-bottom:2px solid var(--ink);padding:24px 20px}
  .exp-right{padding:24px 20px}
  .contact-section{grid-template-columns:1fr;gap:40px;padding:48px 20px}
  .contact-left h2{font-size:3.5rem}
  footer{padding:16px 20px;flex-direction:column;gap:8px}
}
</style>
</head>
<body>
<nav>
  <div class="nav-logo">{{FIRST_NAME}} {{LAST_NAME}}</div>
  <div class="nav-links">
    <a href="#projects" class="nav-link">Work</a>
    <a href="#skills" class="nav-link">Skills</a>
    <a href="#experience" class="nav-link">Experience</a>
    <a href="#contact" class="nav-link">Contact</a>
  </div>
</nav>
<section class="hero">
  <div class="hero-left">
    <div class="hero-label">{{ROLE}} · Available for opportunities</div>
    <h1 class="hero-name">
      <span class="outline">{{FIRST_NAME}}</span><br/>
      <span class="accent">{{LAST_NAME}}</span>
    </h1>
    <p class="hero-bio">{{BIO}}</p>
    <div class="hero-btns">
      <a href="#projects" class="btn-fill">See my work</a>
      <a href="mailto:{{EMAIL}}" class="btn-stroke">Hire me</a>
    </div>
  </div>
  <div class="hero-right">
    <div class="hero-stat-big">
      <div class="stat-big-num">{{PROJECTS_COUNT}}+</div>
      <div class="stat-big-label">Projects completed</div>
    </div>
    <div class="hero-info">
      <div class="info-item"><div class="info-label">College</div><div class="info-val">{{COLLEGE}}</div></div>
      <div class="info-item"><div class="info-label">Branch</div><div class="info-val">{{BRANCH}}</div></div>
      <div class="info-item"><div class="info-label">Year</div><div class="info-val">{{YEAR}} Year · Graduating {{GRAD_YEAR}}</div></div>
      <div class="info-item"><div class="info-label">CGPA</div><div class="info-val">{{CGPA}}</div></div>
    </div>
  </div>
</section>
<div class="ticker">
  <div class="ticker-inner">
    {{#SKILLS}}<span class="ticker-item">{{SKILL}}</span><span class="ticker-item acc">✦</span>{{/SKILLS}}
    {{#SKILLS}}<span class="ticker-item">{{SKILL}}</span><span class="ticker-item acc">✦</span>{{/SKILLS}}
  </div>
</div>
<section class="projects-section" id="projects">
  <div class="section-header"><h2 class="section-title">Selected Work</h2><span class="section-num">{{PROJECTS_COUNT}} Projects</span></div>
  <div class="projects-list">
    {{#PROJECTS}}
    <div class="project-row">
      <div class="pr-num">0{{INDEX}}</div>
      <div class="pr-content"><div class="pr-title">{{PROJECT_TITLE}}</div><div class="pr-desc">{{PROJECT_DESC}}</div></div>
      <div class="pr-tags">{{#STACK}}<span>{{TECH}}</span>{{/STACK}}</div>
      <div class="pr-arrow">↗</div>
    </div>
    {{/PROJECTS}}
  </div>
</section>
<section class="skills-section" id="skills">
  <div class="section-header"><h2 class="section-title">Technical Skills</h2></div>
  <div class="skills-grid">
    <div class="skill-col"><div class="skill-col-title">Languages</div><div class="skill-items">{{#LANGUAGES}}<div class="skill-item">{{LANG}}</div>{{/LANGUAGES}}</div></div>
    <div class="skill-col"><div class="skill-col-title">Frameworks</div><div class="skill-items">{{#FRAMEWORKS}}<div class="skill-item">{{FRAMEWORK}}</div>{{/FRAMEWORKS}}</div></div>
    <div class="skill-col"><div class="skill-col-title">Tools</div><div class="skill-items">{{#TOOLS}}<div class="skill-item">{{TOOL}}</div>{{/TOOLS}}</div></div>
  </div>
</section>
<section class="exp-section" id="experience">
  <div class="section-header"><h2 class="section-title">Experience</h2></div>
  <div class="exp-list">
    {{#EXPERIENCES}}
    <div class="exp-item">
      <div class="exp-left"><div class="exp-date">{{DATE}}</div><div class="exp-company">{{COMPANY}}</div></div>
      <div class="exp-right"><div class="exp-title">{{TITLE}}</div><div class="exp-desc">{{DESC}}</div></div>
    </div>
    {{/EXPERIENCES}}
  </div>
</section>
<section class="contact-section" id="contact">
  <div class="contact-left">
    <h2><span class="outline">Let's</span><br/><span>work.</span></h2>
    <p class="contact-sub">Open to internships, full-time roles, and freelance projects.</p>
  </div>
  <div class="contact-right">
    <a href="mailto:{{EMAIL}}" class="contact-item"><span class="ci-label">Email</span><span class="ci-arrow">↗</span></a>
    <a href="{{LINKEDIN_URL}}" class="contact-item"><span class="ci-label">LinkedIn</span><span class="ci-arrow">↗</span></a>
    <a href="{{GITHUB_URL}}" class="contact-item"><span class="ci-label">GitHub</span><span class="ci-arrow">↗</span></a>
  </div>
</section>
<footer><div>© {{YEAR_BUILT}} {{NAME}}</div><div>Built with <span>FolioAI</span></div></footer>
</body>
</html>`;

// ============================================
// Template 5: Minimal Elegant - Clean serif design
// ============================================
const minimalElegantTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>{{NAME}}</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,600&family=Karla:wght@300;400;500;700&display=swap" rel="stylesheet"/>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--bg:#f9f5ef;--surface:#fff;--ink:#2c2420;--ink2:#7a6e68;--ink3:#b5ada8;--accent:#b5441a;--border:#e8e2da;--serif:'Cormorant Garamond',serif;--sans:'Karla',sans-serif}
html{scroll-behavior:smooth}
body{font-family:var(--sans);background:var(--bg);color:var(--ink);font-size:15px;line-height:1.7;font-weight:300}
nav{padding:24px 60px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;background:rgba(249,245,239,0.9);backdrop-filter:blur(12px);z-index:100;border-bottom:1px solid var(--border)}
.nav-name{font-family:var(--serif);font-size:20px;font-weight:400;letter-spacing:0.03em;color:var(--ink);font-style:italic}
.nav-links{display:flex;gap:32px}
.nav-links a{font-size:12px;font-weight:500;letter-spacing:0.1em;text-transform:uppercase;color:var(--ink2);text-decoration:none;transition:color 0.2s}
.nav-links a:hover{color:var(--ink)}
.hero{padding:100px 60px 80px;display:grid;grid-template-columns:1fr 280px;gap:80px;border-bottom:1px solid var(--border);max-width:1200px;margin:0 auto}
.hero-eyebrow{font-size:11px;font-weight:500;letter-spacing:0.15em;text-transform:uppercase;color:var(--ink3);margin-bottom:24px}
.hero-name{font-family:var(--serif);font-size:clamp(4rem,8vw,9rem);font-weight:300;line-height:0.9;letter-spacing:-0.02em;color:var(--ink);margin-bottom:32px}
.hero-name .italic{font-style:italic}
.hero-name .accent{color:var(--accent)}
.hero-desc{font-size:1rem;color:var(--ink2);max-width:440px;line-height:1.9;margin-bottom:48px;font-weight:300}
.hero-links{display:flex;gap:24px;align-items:center}
.link-primary{font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:var(--ink);text-decoration:none;display:flex;align-items:center;gap:8px;transition:gap 0.2s}
.link-primary:hover{gap:14px;color:var(--accent)}
.link-primary::after{content:'→'}
.link-secondary{font-size:13px;font-weight:500;color:var(--ink2);text-decoration:none;letter-spacing:0.05em;border-bottom:1px solid var(--border);padding-bottom:2px;transition:border-color 0.2s}
.link-secondary:hover{border-color:var(--ink2)}
.hero-right{display:flex;flex-direction:column;justify-content:flex-end;gap:32px;padding-bottom:8px}
.hero-detail{border-top:1px solid var(--border);padding-top:20px}
.detail-label{font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:var(--ink3);margin-bottom:6px}
.detail-value{font-family:var(--serif);font-size:1.1rem;color:var(--ink);font-weight:400}
.works-section{padding:80px 60px;border-bottom:1px solid var(--border);max-width:1200px;margin:0 auto}
.section-header{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:60px}
.section-title{font-family:var(--serif);font-size:3rem;font-weight:300;color:var(--ink);font-style:italic}
.section-sub{font-size:12px;font-weight:500;letter-spacing:0.1em;text-transform:uppercase;color:var(--ink3)}
.works-list{display:flex;flex-direction:column;gap:0}
.work-item{display:grid;grid-template-columns:80px 1fr auto;gap:40px;padding:40px 0;border-top:1px solid var(--border);align-items:start}
.work-num{font-family:var(--serif);font-size:1rem;color:var(--ink3);font-style:italic}
.work-title{font-family:var(--serif);font-size:1.6rem;font-weight:300;color:var(--ink);margin-bottom:8px}
.work-desc{font-size:13px;color:var(--ink2);line-height:1.8;max-width:500px}
.work-meta{display:flex;flex-direction:column;align-items:flex-end;gap:8px}
.work-year{font-family:var(--serif);font-size:1rem;color:var(--ink3);font-style:italic}
.work-tags{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}
.work-tag{font-size:10px;font-weight:500;letter-spacing:0.08em;text-transform:uppercase;color:var(--ink3)}
.about-section{padding:80px 60px;border-bottom:1px solid var(--border);display:grid;grid-template-columns:1fr 1fr;gap:80px;max-width:1200px;margin:0 auto}
.about-label{font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:var(--ink3);margin-bottom:24px}
.about-text{font-family:var(--serif);font-size:1.3rem;font-weight:300;color:var(--ink);line-height:1.8;font-style:italic}
.skills-col{display:flex;flex-direction:column;gap:32px}
.skill-group-name{font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:var(--ink3);margin-bottom:12px;padding-bottom:8px;border-bottom:1px solid var(--border)}
.skill-list{display:flex;flex-direction:column;gap:8px}
.skill-name{font-size:14px;color:var(--ink2);font-weight:300}
.exp-section{padding:80px 60px;border-bottom:1px solid var(--border);max-width:1200px;margin:0 auto}
.exp-list{display:flex;flex-direction:column;gap:0}
.exp-item{display:grid;grid-template-columns:200px 1fr;gap:60px;padding:40px 0;border-top:1px solid var(--border)}
.exp-left-date{font-family:var(--serif);font-size:1rem;font-style:italic;color:var(--ink3)}
.exp-left-co{font-family:var(--serif);font-size:1.2rem;color:var(--accent);margin-top:4px}
.exp-right-title{font-family:var(--serif);font-size:1.3rem;font-weight:300;color:var(--ink);margin-bottom:12px}
.exp-right-desc{font-size:13px;color:var(--ink2);line-height:1.9}
.contact-section{padding:100px 60px;text-align:center;max-width:800px;margin:0 auto}
.contact-pre{font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:var(--ink3);margin-bottom:24px}
.contact-title{font-family:var(--serif);font-size:clamp(3rem,7vw,7rem);font-weight:300;color:var(--ink);line-height:1.0;margin-bottom:48px}
.contact-title em{font-style:italic;color:var(--accent)}
.contact-row{display:flex;gap:20px;justify-content:center;flex-wrap:wrap}
.contact-btn{padding:14px 32px;border:1px solid var(--border);font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:var(--ink);text-decoration:none;transition:all 0.2s}
.contact-btn:hover{background:var(--ink);color:var(--bg)}
.contact-btn.filled{background:var(--ink);color:var(--bg)}
.contact-btn.filled:hover{background:var(--accent);border-color:var(--accent)}
footer{padding:24px 60px;border-top:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;font-size:11px;font-weight:500;letter-spacing:0.08em;text-transform:uppercase;color:var(--ink3)}
footer span{color:var(--accent)}
@media(max-width:768px){
  nav{padding:16px 20px}.nav-links{display:none}
  .hero{grid-template-columns:1fr;padding:60px 20px 40px;gap:40px}.hero-right{flex-direction:row;flex-wrap:wrap}
  .works-section,.about-section,.exp-section,.contact-section{padding:60px 20px}
  .about-section{grid-template-columns:1fr}
  .work-item{grid-template-columns:48px 1fr;gap:16px}.work-meta{display:none}
  .exp-item{grid-template-columns:1fr;gap:8px}
  footer{padding:16px 20px;flex-direction:column;gap:8px}
}
</style>
</head>
<body>
<nav>
  <div class="nav-name">{{NAME}}</div>
  <div class="nav-links">
    <a href="#work">Work</a>
    <a href="#about">About</a>
    <a href="#experience">Experience</a>
    <a href="#contact">Contact</a>
  </div>
</nav>
<section class="hero">
  <div>
    <div class="hero-eyebrow">{{ROLE}} · {{COLLEGE}}</div>
    <h1 class="hero-name">
      <span class="italic">{{FIRST_NAME}}</span><br/>
      <span class="accent">{{LAST_NAME}}</span>
    </h1>
    <p class="hero-desc">{{BIO}}</p>
    <div class="hero-links">
      <a href="#work" class="link-primary">View my work</a>
      <a href="mailto:{{EMAIL}}" class="link-secondary">Say hello</a>
    </div>
  </div>
  <div class="hero-right">
    <div class="hero-detail"><div class="detail-label">Institution</div><div class="detail-value">{{COLLEGE}}</div></div>
    <div class="hero-detail"><div class="detail-label">Programme</div><div class="detail-value">{{BRANCH}}</div></div>
    <div class="hero-detail"><div class="detail-label">Graduating</div><div class="detail-value">{{GRAD_YEAR}}</div></div>
    <div class="hero-detail"><div class="detail-label">CGPA</div><div class="detail-value">{{CGPA}} / 10</div></div>
  </div>
</section>
<section class="works-section" id="work">
  <div class="section-header">
    <h2 class="section-title">Selected work</h2>
    <span class="section-sub">{{PROJECTS_COUNT}} projects</span>
  </div>
  <div class="works-list">
    {{#PROJECTS}}
    <div class="work-item">
      <div class="work-num">{{INDEX}}</div>
      <div class="work-content">
        <div class="work-title">{{PROJECT_TITLE}}</div>
        <div class="work-desc">{{PROJECT_DESC}}</div>
      </div>
      <div class="work-meta">
        <div class="work-year">{{YEAR}}</div>
        <div class="work-tags">{{#STACK}}<span class="work-tag">{{TECH}}</span>{{/STACK}}</div>
      </div>
    </div>
    {{/PROJECTS}}
  </div>
</section>
<section class="about-section" id="about">
  <div>
    <div class="about-label">About</div>
    <div class="about-text">"{{ABOUT_QUOTE}}"</div>
  </div>
  <div class="skills-col">
    <div>
      <div class="skill-group-name">Languages</div>
      <div class="skill-list">{{#LANGUAGES}}<div class="skill-name">{{LANG}}</div>{{/LANGUAGES}}</div>
    </div>
    <div>
      <div class="skill-group-name">Frameworks & Tools</div>
      <div class="skill-list">{{#FRAMEWORKS}}<div class="skill-name">{{FRAMEWORK}}</div>{{/FRAMEWORKS}}</div>
    </div>
  </div>
</section>
<section class="exp-section" id="experience">
  <div class="section-header"><h2 class="section-title">Experience</h2></div>
  <div class="exp-list">
    {{#EXPERIENCES}}
    <div class="exp-item">
      <div><div class="exp-left-date">{{DATE}}</div><div class="exp-left-co">{{COMPANY}}</div></div>
      <div><div class="exp-right-title">{{TITLE}}</div><div class="exp-right-desc">{{DESC}}</div></div>
    </div>
    {{/EXPERIENCES}}
  </div>
</section>
<section class="contact-section" id="contact">
  <div class="contact-pre">Get in touch</div>
  <h2 class="contact-title">Let's create<br/><em>something</em><br/>remarkable.</h2>
  <div class="contact-row">
    <a href="mailto:{{EMAIL}}" class="contact-btn filled">Send an email</a>
    <a href="{{LINKEDIN_URL}}" class="contact-btn">LinkedIn</a>
    <a href="{{GITHUB_URL}}" class="contact-btn">GitHub</a>
  </div>
</section>
<footer><div>{{NAME}} · {{YEAR_BUILT}}</div><div>Built with <span>FolioAI</span></div></footer>
</body>
</html>`;

// ============================================
// Export all templates
// ============================================
export const SAMPLE_TEMPLATES: CreateTemplateInput[] = [
  {
    name: "Terminal",
    slug: "terminal",
    description: "Developer-focused dark theme with terminal aesthetics, custom cursor, and monospace typography. Perfect for programmers.",
    category: "developer",
    htmlTemplate: terminalTemplate,
    isFree: true,
    priceInr: 0,
    sortOrder: 1,
  },
  {
    name: "Editorial",
    slug: "editorial",
    description: "Elegant serif typography with magazine-style layout. Light theme with warm tones perfect for creative professionals.",
    category: "professional",
    htmlTemplate: editorialTemplate,
    isFree: true,
    priceInr: 0,
    sortOrder: 2,
  },
  {
    name: "Gradient",
    slug: "gradient",
    description: "Modern glassmorphism with purple-blue gradients and floating orbs. Eye-catching design for standing out.",
    category: "creative",
    htmlTemplate: gradientTemplate,
    isFree: true,
    priceInr: 0,
    sortOrder: 3,
  },
  {
    name: "Brutalist",
    slug: "brutalist",
    description: "Bold newspaper-inspired design with thick borders and strong typography. Makes a powerful statement.",
    category: "creative",
    htmlTemplate: brutalistTemplate,
    isFree: false,
    priceInr: 99,
    sortOrder: 4,
  },
  {
    name: "Minimal Elegant",
    slug: "minimal-elegant",
    description: "Clean serif design with refined typography and subtle accents. Timeless sophistication for senior roles.",
    category: "minimal",
    htmlTemplate: minimalElegantTemplate,
    isFree: false,
    priceInr: 149,
    sortOrder: 5,
  },
];
