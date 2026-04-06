/**
 * Creative Portfolio Templates
 * 
 * Unique, eye-catching designs that stand out from generic portfolios.
 * These create memorable experiences for visitors.
 */

// ============================================
// Template: macOS Desktop - Interactive OS Experience
// ============================================
export const macOSDesktopTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>{{NAME}}'s Portfolio</title>
<link href="https://fonts.googleapis.com/css2?family=SF+Pro+Display:wght@300;400;500;600;700&family=SF+Pro+Text:wght@400;500&display=swap" rel="stylesheet"/>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --bg:#1e1e1e;
  --surface:#2d2d2d;
  --surface-light:#3d3d3d;
  --text:#f5f5f7;
  --text-muted:#a1a1a6;
  --accent:#0a84ff;
  --red:#ff453a;
  --yellow:#ffd60a;
  --green:#32d74b;
}
body{
  font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','SF Pro Text',system-ui,sans-serif;
  background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%);
  min-height:100vh;
  overflow-x:hidden;
  color:var(--text);
}

/* Loading Screen */
.loader{position:fixed;inset:0;background:var(--bg);z-index:9999;display:flex;align-items:center;justify-content:center;transition:opacity 0.5s,visibility 0.5s}
.loader.hidden{opacity:0;visibility:hidden}
.loader-icon{width:60px;height:60px;border:3px solid var(--surface-light);border-top-color:var(--accent);border-radius:50%;animation:spin 1s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}

/* Menu Bar */
.menubar{
  position:fixed;top:0;left:0;right:0;
  height:28px;
  background:rgba(30,30,30,0.85);
  backdrop-filter:blur(20px);
  -webkit-backdrop-filter:blur(20px);
  display:flex;
  align-items:center;
  padding:0 12px;
  z-index:100;
  border-bottom:1px solid rgba(255,255,255,0.1);
}
.menubar-left{display:flex;align-items:center;gap:16px}
.apple-logo{font-size:16px;cursor:pointer}
.menu-item{font-size:13px;font-weight:500;cursor:pointer;padding:2px 8px;border-radius:4px;transition:background 0.2s}
.menu-item:hover{background:rgba(255,255,255,0.1)}
.menu-item.active{font-weight:600}
.menubar-right{margin-left:auto;display:flex;align-items:center;gap:12px;font-size:12px;color:var(--text-muted)}

/* Desktop */
.desktop{
  padding-top:40px;
  padding-bottom:90px;
  min-height:100vh;
  position:relative;
}

/* Desktop Icons (Folders) */
.desktop-icons{
  position:fixed;
  left:20px;
  top:50px;
  display:flex;
  flex-direction:column;
  gap:20px;
  z-index:10;
}
.desktop-icon{
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:6px;
  cursor:pointer;
  padding:8px;
  border-radius:8px;
  transition:background 0.2s;
  width:90px;
  text-align:center;
}
.desktop-icon:hover{background:rgba(255,255,255,0.1)}
.desktop-icon.selected{background:rgba(10,132,255,0.3)}
.folder-icon{
  width:64px;
  height:54px;
  background:linear-gradient(180deg,#6bb8ff 0%,#3d9dff 100%);
  border-radius:4px 4px 8px 8px;
  position:relative;
}
.folder-icon::before{
  content:'';
  position:absolute;
  top:-8px;left:4px;
  width:24px;height:12px;
  background:linear-gradient(180deg,#5aabff 0%,#3d9dff 100%);
  border-radius:4px 4px 0 0;
}
.folder-icon::after{
  content:'';
  position:absolute;
  top:-4px;left:0;right:0;
  height:4px;
  background:linear-gradient(180deg,#7ec8ff 0%,#6bb8ff 100%);
  border-radius:4px 4px 0 0;
}
.icon-label{font-size:11px;color:var(--text);text-shadow:0 1px 3px rgba(0,0,0,0.5)}

/* Hero Section */
.hero{
  display:flex;
  align-items:center;
  justify-content:center;
  min-height:calc(100vh - 130px);
  padding:40px 120px 40px 140px;
  position:relative;
}
.hero-content{
  text-align:center;
  max-width:700px;
}
.hero-greeting{
  font-size:clamp(1.2rem,3vw,1.8rem);
  color:var(--text-muted);
  margin-bottom:8px;
  font-weight:300;
}
.hero-greeting span{color:var(--accent)}
.hero-title{
  font-size:clamp(4rem,12vw,10rem);
  font-weight:200;
  letter-spacing:-0.03em;
  line-height:0.9;
  background:linear-gradient(135deg,#f5f5f7 0%,#a1a1a6 100%);
  -webkit-background-clip:text;
  -webkit-text-fill-color:transparent;
  background-clip:text;
}
.hero-subtitle{
  font-size:clamp(1rem,2vw,1.4rem);
  color:var(--text-muted);
  margin-top:20px;
  font-weight:400;
}

/* Curved Background Shape */
.bg-curve{
  position:absolute;
  top:0;right:0;bottom:0;
  width:60%;
  overflow:hidden;
  z-index:-1;
}
.bg-curve svg{
  position:absolute;
  top:0;right:0;
  height:100%;
  width:auto;
}

/* Window (for content sections) */
.window{
  background:rgba(40,40,40,0.95);
  border-radius:12px;
  overflow:hidden;
  box-shadow:0 20px 60px rgba(0,0,0,0.4);
  backdrop-filter:blur(20px);
  display:none;
  position:fixed;
  top:50%;left:50%;
  transform:translate(-50%,-50%);
  width:80%;
  max-width:900px;
  max-height:80vh;
  z-index:50;
}
.window.active{display:block;animation:windowOpen 0.3s ease-out}
@keyframes windowOpen{from{opacity:0;transform:translate(-50%,-50%) scale(0.95)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}
.window-header{
  height:36px;
  background:linear-gradient(180deg,#3d3d3d 0%,#2d2d2d 100%);
  display:flex;
  align-items:center;
  padding:0 12px;
  border-bottom:1px solid rgba(0,0,0,0.3);
}
.window-controls{display:flex;gap:8px}
.window-btn{width:12px;height:12px;border-radius:50%;cursor:pointer}
.window-btn.close{background:#ff5f57}
.window-btn.minimize{background:#febc2e}
.window-btn.maximize{background:#28c840}
.window-title{
  flex:1;text-align:center;
  font-size:13px;
  font-weight:500;
  color:var(--text-muted);
}
.window-content{
  padding:24px;
  max-height:calc(80vh - 36px);
  overflow-y:auto;
}

/* Project Cards Inside Window */
.projects-grid{
  display:grid;
  grid-template-columns:repeat(auto-fit,minmax(250px,1fr));
  gap:16px;
}
.project-card{
  background:var(--surface);
  border-radius:8px;
  padding:20px;
  border:1px solid rgba(255,255,255,0.05);
  transition:transform 0.2s,box-shadow 0.2s;
}
.project-card:hover{
  transform:translateY(-4px);
  box-shadow:0 8px 24px rgba(0,0,0,0.3);
}
.project-title{font-size:16px;font-weight:600;margin-bottom:8px}
.project-desc{font-size:13px;color:var(--text-muted);line-height:1.6;margin-bottom:12px}
.project-stack{display:flex;gap:6px;flex-wrap:wrap}
.stack-tag{
  font-size:10px;
  padding:3px 8px;
  background:rgba(10,132,255,0.15);
  color:var(--accent);
  border-radius:4px;
}

/* Skills Grid */
.skills-grid{
  display:grid;
  grid-template-columns:repeat(auto-fit,minmax(120px,1fr));
  gap:12px;
}
.skill-item{
  background:var(--surface);
  border-radius:8px;
  padding:16px;
  text-align:center;
  border:1px solid rgba(255,255,255,0.05);
}
.skill-icon{font-size:24px;margin-bottom:8px}
.skill-name{font-size:12px;color:var(--text-muted)}

/* Contact Info */
.contact-grid{
  display:grid;
  grid-template-columns:repeat(auto-fit,minmax(200px,1fr));
  gap:16px;
}
.contact-item{
  background:var(--surface);
  border-radius:8px;
  padding:20px;
  display:flex;
  align-items:center;
  gap:12px;
  text-decoration:none;
  color:var(--text);
  transition:background 0.2s;
}
.contact-item:hover{background:var(--surface-light)}
.contact-icon{font-size:20px}
.contact-label{font-size:12px;color:var(--text-muted)}
.contact-value{font-size:14px;font-weight:500}

/* Dock */
.dock{
  position:fixed;
  bottom:8px;
  left:50%;
  transform:translateX(-50%);
  background:rgba(40,40,40,0.7);
  backdrop-filter:blur(20px);
  -webkit-backdrop-filter:blur(20px);
  border-radius:20px;
  padding:6px 12px;
  display:flex;
  gap:8px;
  border:1px solid rgba(255,255,255,0.1);
  z-index:100;
}
.dock-item{
  width:48px;
  height:48px;
  border-radius:12px;
  background:linear-gradient(135deg,var(--surface-light) 0%,var(--surface) 100%);
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:24px;
  cursor:pointer;
  transition:transform 0.2s;
  position:relative;
}
.dock-item:hover{transform:translateY(-10px) scale(1.15)}
.dock-item.active::after{
  content:'';
  position:absolute;
  bottom:-6px;
  width:4px;height:4px;
  background:var(--text);
  border-radius:50%;
}
.dock-item img{width:36px;height:36px;border-radius:8px}
.dock-separator{width:1px;background:rgba(255,255,255,0.1);margin:8px 4px}

/* Responsive */
@media(max-width:768px){
  .desktop-icons{display:none}
  .hero{padding:40px 20px}
  .dock-item{width:40px;height:40px}
  .menubar-right{display:none}
}

/* Overlay for windows */
.overlay{
  position:fixed;inset:0;
  background:rgba(0,0,0,0.5);
  z-index:40;
  display:none;
}
.overlay.active{display:block}
</style>
</head>
<body>
<div class="loader"><div class="loader-icon"></div></div>

<!-- Menu Bar -->
<div class="menubar">
  <div class="menubar-left">
    <span class="apple-logo">🍎</span>
    <span class="menu-item active">{{NAME}}'s Portfolio</span>
    <span class="menu-item" onclick="openWindow('projects')">Projects</span>
    <span class="menu-item" onclick="openWindow('contact')">Contact</span>
    <span class="menu-item" onclick="openWindow('resume')">Resume</span>
  </div>
  <div class="menubar-right">
    <span>📶</span>
    <span>🔋 100%</span>
    <span id="clock"></span>
  </div>
</div>

<!-- Desktop Icons -->
<div class="desktop-icons">
  {{#PROJECTS}}
  <div class="desktop-icon" onclick="openWindow('project-{{INDEX}}')">
    <div class="folder-icon"></div>
    <span class="icon-label">{{PROJECT_NAME}}</span>
  </div>
  {{/PROJECTS}}
</div>

<!-- Hero Section -->
<div class="desktop">
  <div class="hero">
    <div class="hero-content">
      <p class="hero-greeting">Hey, I'm <span>{{NAME}}</span>! Welcome to my</p>
      <h1 class="hero-title">portfolio</h1>
      <p class="hero-subtitle">{{ROLE}} · {{COLLEGE}}</p>
    </div>
    
    <!-- Background Curve -->
    <div class="bg-curve">
      <svg viewBox="0 0 500 800" xmlns="http://www.w3.org/2000/svg">
        <path d="M0,0 Q200,200 100,400 T200,800 L500,800 L500,0 Z" fill="rgba(255,255,255,0.03)"/>
        <path d="M100,0 Q300,250 200,500 T300,800 L500,800 L500,0 Z" fill="rgba(255,255,255,0.02)"/>
      </svg>
    </div>
  </div>
</div>

<!-- Overlay -->
<div class="overlay" onclick="closeAllWindows()"></div>

<!-- Projects Window -->
<div class="window" id="projects-window">
  <div class="window-header">
    <div class="window-controls">
      <div class="window-btn close" onclick="closeWindow('projects')"></div>
      <div class="window-btn minimize"></div>
      <div class="window-btn maximize"></div>
    </div>
    <span class="window-title">Projects</span>
  </div>
  <div class="window-content">
    <div class="projects-grid">
      {{#PROJECTS}}
      <div class="project-card">
        <h3 class="project-title">{{PROJECT_NAME}}</h3>
        <p class="project-desc">{{PROJECT_DESC}}</p>
        <div class="project-stack">
          {{#TECH_STACK}}
          <span class="stack-tag">{{TECH}}</span>
          {{/TECH_STACK}}
        </div>
      </div>
      {{/PROJECTS}}
    </div>
  </div>
</div>

<!-- Contact Window -->
<div class="window" id="contact-window">
  <div class="window-header">
    <div class="window-controls">
      <div class="window-btn close" onclick="closeWindow('contact')"></div>
      <div class="window-btn minimize"></div>
      <div class="window-btn maximize"></div>
    </div>
    <span class="window-title">Contact</span>
  </div>
  <div class="window-content">
    <div class="contact-grid">
      <a href="mailto:{{EMAIL}}" class="contact-item">
        <span class="contact-icon">✉️</span>
        <div>
          <div class="contact-label">Email</div>
          <div class="contact-value">{{EMAIL}}</div>
        </div>
      </a>
      <a href="{{GITHUB_URL}}" target="_blank" class="contact-item">
        <span class="contact-icon">🐙</span>
        <div>
          <div class="contact-label">GitHub</div>
          <div class="contact-value">{{GITHUB}}</div>
        </div>
      </a>
      <a href="{{LINKEDIN_URL}}" target="_blank" class="contact-item">
        <span class="contact-icon">💼</span>
        <div>
          <div class="contact-label">LinkedIn</div>
          <div class="contact-value">{{NAME}}</div>
        </div>
      </a>
    </div>
  </div>
</div>

<!-- Skills Window -->
<div class="window" id="resume-window">
  <div class="window-header">
    <div class="window-controls">
      <div class="window-btn close" onclick="closeWindow('resume')"></div>
      <div class="window-btn minimize"></div>
      <div class="window-btn maximize"></div>
    </div>
    <span class="window-title">Skills & Resume</span>
  </div>
  <div class="window-content">
    <h3 style="margin-bottom:16px;font-size:18px">Technical Skills</h3>
    <div class="skills-grid">
      {{#SKILLS}}
      <div class="skill-item">
        <div class="skill-icon">{{SKILL_ICON}}</div>
        <div class="skill-name">{{SKILL_NAME}}</div>
      </div>
      {{/SKILLS}}
    </div>
  </div>
</div>

<!-- Dock -->
<div class="dock">
  <div class="dock-item" onclick="openWindow('projects')" title="Projects">📁</div>
  <div class="dock-item" onclick="openWindow('resume')" title="Resume">📄</div>
  <div class="dock-item" onclick="openWindow('contact')" title="Contact">✉️</div>
  <div class="dock-separator"></div>
  <a href="{{GITHUB_URL}}" target="_blank" class="dock-item" title="GitHub">🐙</a>
  <a href="{{LINKEDIN_URL}}" target="_blank" class="dock-item" title="LinkedIn">💼</a>
</div>

<script>
// Hide loader
window.addEventListener('load',()=>{
  setTimeout(()=>document.querySelector('.loader').classList.add('hidden'),800);
});

// Clock
function updateClock(){
  const now=new Date();
  document.getElementById('clock').textContent=now.toLocaleString('en-US',{weekday:'short',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
}
updateClock();setInterval(updateClock,60000);

// Window management
function openWindow(id){
  document.querySelectorAll('.window').forEach(w=>w.classList.remove('active'));
  document.querySelector('.overlay').classList.add('active');
  const win=document.getElementById(id+'-window');
  if(win)win.classList.add('active');
}
function closeWindow(id){
  const win=document.getElementById(id+'-window');
  if(win)win.classList.remove('active');
  document.querySelector('.overlay').classList.remove('active');
}
function closeAllWindows(){
  document.querySelectorAll('.window').forEach(w=>w.classList.remove('active'));
  document.querySelector('.overlay').classList.remove('active');
}

// Keyboard shortcuts
document.addEventListener('keydown',e=>{
  if(e.key==='Escape')closeAllWindows();
});
</script>
</body>
</html>`;


// ============================================
// Template: Bento Grid - Modern Card Layout
// ============================================
export const bentoGridTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>{{NAME}} — Portfolio</title>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet"/>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --bg:#0a0a0a;
  --card:#141414;
  --card-hover:#1a1a1a;
  --border:rgba(255,255,255,0.06);
  --text:#fafafa;
  --text-muted:#737373;
  --accent:#f97316;
  --accent-glow:rgba(249,115,22,0.15);
}
body{
  font-family:'Plus Jakarta Sans',sans-serif;
  background:var(--bg);
  color:var(--text);
  min-height:100vh;
  padding:20px;
}
.container{
  max-width:1400px;
  margin:0 auto;
}

/* Bento Grid */
.bento-grid{
  display:grid;
  grid-template-columns:repeat(4,1fr);
  grid-auto-rows:minmax(120px,auto);
  gap:16px;
}

/* Card Base */
.card{
  background:var(--card);
  border-radius:24px;
  padding:24px;
  border:1px solid var(--border);
  transition:all 0.3s ease;
  position:relative;
  overflow:hidden;
}
.card:hover{
  background:var(--card-hover);
  border-color:rgba(255,255,255,0.1);
  transform:translateY(-2px);
}

/* Card Sizes */
.card.hero{grid-column:span 2;grid-row:span 2}
.card.wide{grid-column:span 2}
.card.tall{grid-row:span 2}
.card.large{grid-column:span 2;grid-row:span 2}

/* Hero Card */
.hero-card{
  display:flex;
  flex-direction:column;
  justify-content:center;
  background:linear-gradient(135deg,#1a1a1a 0%,#0a0a0a 100%);
}
.hero-eyebrow{
  font-size:12px;
  font-weight:600;
  color:var(--accent);
  text-transform:uppercase;
  letter-spacing:0.1em;
  margin-bottom:16px;
}
.hero-name{
  font-size:clamp(2.5rem,5vw,4rem);
  font-weight:700;
  line-height:1.1;
  margin-bottom:16px;
}
.hero-role{
  font-size:18px;
  color:var(--text-muted);
}

/* Profile Card */
.profile-card{
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  text-align:center;
}
.profile-avatar{
  width:100px;
  height:100px;
  border-radius:50%;
  background:linear-gradient(135deg,var(--accent) 0%,#fb923c 100%);
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:40px;
  margin-bottom:16px;
}
.profile-status{
  font-size:12px;
  color:var(--accent);
  background:var(--accent-glow);
  padding:6px 12px;
  border-radius:20px;
  margin-top:8px;
}

/* Skills Card */
.skills-card{
  display:flex;
  flex-direction:column;
  gap:12px;
}
.skill-row{
  display:flex;
  align-items:center;
  gap:12px;
}
.skill-icon{
  width:36px;
  height:36px;
  background:var(--card-hover);
  border-radius:10px;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:18px;
}
.skill-info{flex:1}
.skill-name{font-size:14px;font-weight:500}
.skill-level{font-size:12px;color:var(--text-muted)}

/* Project Card */
.project-card{
  cursor:pointer;
}
.project-card::before{
  content:'';
  position:absolute;
  top:0;left:0;
  width:100%;height:4px;
  background:linear-gradient(90deg,var(--accent),#fb923c);
  transform:scaleX(0);
  transform-origin:left;
  transition:transform 0.3s ease;
}
.project-card:hover::before{transform:scaleX(1)}
.project-num{
  font-size:48px;
  font-weight:700;
  color:rgba(255,255,255,0.05);
  position:absolute;
  top:16px;right:20px;
}
.project-title{
  font-size:18px;
  font-weight:600;
  margin-bottom:8px;
}
.project-desc{
  font-size:13px;
  color:var(--text-muted);
  line-height:1.6;
  margin-bottom:16px;
}
.project-tags{display:flex;gap:6px;flex-wrap:wrap}
.tag{
  font-size:11px;
  padding:4px 10px;
  background:rgba(249,115,22,0.1);
  color:var(--accent);
  border-radius:6px;
}

/* Stats Card */
.stats-card{
  display:grid;
  grid-template-columns:repeat(2,1fr);
  gap:16px;
}
.stat{text-align:center}
.stat-num{
  font-size:32px;
  font-weight:700;
  background:linear-gradient(135deg,var(--accent),#fb923c);
  -webkit-background-clip:text;
  -webkit-text-fill-color:transparent;
}
.stat-label{font-size:11px;color:var(--text-muted);margin-top:4px}

/* Contact Card */
.contact-card{
  display:flex;
  flex-direction:column;
  justify-content:center;
}
.contact-title{font-size:24px;font-weight:600;margin-bottom:16px}
.contact-links{display:flex;gap:12px}
.contact-btn{
  padding:12px 20px;
  background:var(--card-hover);
  border-radius:12px;
  font-size:13px;
  text-decoration:none;
  color:var(--text);
  transition:background 0.2s;
}
.contact-btn:hover{background:var(--accent);color:#fff}
.contact-btn.primary{background:var(--accent);color:#fff}
.contact-btn.primary:hover{opacity:0.9}

/* Responsive */
@media(max-width:1024px){
  .bento-grid{grid-template-columns:repeat(2,1fr)}
  .card.hero{grid-column:span 2}
}
@media(max-width:640px){
  .bento-grid{grid-template-columns:1fr}
  .card.hero,.card.wide,.card.large{grid-column:span 1}
}
</style>
</head>
<body>
<div class="container">
  <div class="bento-grid">
    <!-- Hero -->
    <div class="card hero hero-card">
      <span class="hero-eyebrow">{{ROLE}}</span>
      <h1 class="hero-name">{{NAME}}</h1>
      <p class="hero-role">{{BIO}}</p>
    </div>
    
    <!-- Profile -->
    <div class="card profile-card">
      <div class="profile-avatar">👨‍💻</div>
      <h3>{{NAME}}</h3>
      <span class="profile-status">✨ Open to work</span>
    </div>
    
    <!-- Stats -->
    <div class="card stats-card">
      <div class="stat">
        <div class="stat-num">{{PROJECT_COUNT}}</div>
        <div class="stat-label">Projects</div>
      </div>
      <div class="stat">
        <div class="stat-num">{{SKILL_COUNT}}+</div>
        <div class="stat-label">Skills</div>
      </div>
      <div class="stat">
        <div class="stat-num">{{YEAR}}</div>
        <div class="stat-label">Year</div>
      </div>
      <div class="stat">
        <div class="stat-num">{{CGPA}}</div>
        <div class="stat-label">CGPA</div>
      </div>
    </div>
    
    <!-- Skills -->
    <div class="card wide skills-card">
      {{#SKILLS}}
      <div class="skill-row">
        <div class="skill-icon">{{ICON}}</div>
        <div class="skill-info">
          <div class="skill-name">{{NAME}}</div>
          <div class="skill-level">{{LEVEL}}</div>
        </div>
      </div>
      {{/SKILLS}}
    </div>
    
    <!-- Projects -->
    {{#PROJECTS}}
    <div class="card project-card">
      <span class="project-num">0{{INDEX}}</span>
      <h3 class="project-title">{{NAME}}</h3>
      <p class="project-desc">{{DESC}}</p>
      <div class="project-tags">
        {{#TECH}}
        <span class="tag">{{.}}</span>
        {{/TECH}}
      </div>
    </div>
    {{/PROJECTS}}
    
    <!-- Contact -->
    <div class="card wide contact-card">
      <h3 class="contact-title">Let's work together</h3>
      <div class="contact-links">
        <a href="mailto:{{EMAIL}}" class="contact-btn primary">Email me</a>
        <a href="{{GITHUB}}" target="_blank" class="contact-btn">GitHub</a>
        <a href="{{LINKEDIN}}" target="_blank" class="contact-btn">LinkedIn</a>
      </div>
    </div>
  </div>
</div>
</body>
</html>`;


// ============================================
// Template: Newspaper/Editorial - Content-focused
// ============================================
export const editorialTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>{{NAME}} — Portfolio</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Source+Sans+3:wght@300;400;500;600&display=swap" rel="stylesheet"/>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --bg:#faf9f7;
  --text:#1a1a1a;
  --text-muted:#666;
  --accent:#c41230;
  --border:#e5e5e5;
}
body{
  font-family:'Source Sans 3',sans-serif;
  background:var(--bg);
  color:var(--text);
  line-height:1.7;
}

/* Header like newspaper masthead */
.masthead{
  text-align:center;
  padding:40px 20px;
  border-bottom:3px double var(--border);
}
.masthead-date{
  font-size:11px;
  letter-spacing:0.15em;
  text-transform:uppercase;
  color:var(--text-muted);
  margin-bottom:8px;
}
.masthead-title{
  font-family:'Playfair Display',serif;
  font-size:clamp(2.5rem,6vw,4.5rem);
  font-weight:700;
  letter-spacing:-0.02em;
}
.masthead-subtitle{
  font-size:16px;
  color:var(--text-muted);
  margin-top:8px;
  font-style:italic;
}

/* Navigation */
nav{
  display:flex;
  justify-content:center;
  gap:32px;
  padding:16px;
  border-bottom:1px solid var(--border);
  font-size:13px;
  text-transform:uppercase;
  letter-spacing:0.1em;
}
nav a{
  color:var(--text);
  text-decoration:none;
  transition:color 0.2s;
}
nav a:hover{color:var(--accent)}

/* Main Content - Multi-column */
.main{
  max-width:1200px;
  margin:0 auto;
  padding:40px 20px;
  display:grid;
  grid-template-columns:1fr 300px;
  gap:40px;
}

/* Article/Section */
article{
  margin-bottom:40px;
  padding-bottom:40px;
  border-bottom:1px solid var(--border);
}
.section-label{
  font-size:11px;
  text-transform:uppercase;
  letter-spacing:0.15em;
  color:var(--accent);
  font-weight:600;
  margin-bottom:12px;
}
.article-title{
  font-family:'Playfair Display',serif;
  font-size:2rem;
  font-weight:700;
  line-height:1.2;
  margin-bottom:16px;
}
.article-lead{
  font-size:18px;
  color:var(--text-muted);
  margin-bottom:24px;
  font-style:italic;
}
.article-body{
  font-size:16px;
  line-height:1.8;
}
.article-body p{margin-bottom:16px}

/* Drop Cap */
.drop-cap::first-letter{
  font-family:'Playfair Display',serif;
  float:left;
  font-size:4rem;
  line-height:0.8;
  padding-right:12px;
  color:var(--accent);
}

/* Project Grid in newspaper style */
.projects-grid{
  display:grid;
  grid-template-columns:repeat(2,1fr);
  gap:24px;
}
.project-item{
  padding:20px;
  border:1px solid var(--border);
  background:#fff;
}
.project-headline{
  font-family:'Playfair Display',serif;
  font-size:18px;
  font-weight:600;
  margin-bottom:8px;
}
.project-excerpt{
  font-size:14px;
  color:var(--text-muted);
  margin-bottom:12px;
}
.project-meta{
  font-size:11px;
  text-transform:uppercase;
  color:var(--accent);
  letter-spacing:0.1em;
}

/* Sidebar */
.sidebar{
  border-left:1px solid var(--border);
  padding-left:40px;
}
.sidebar-section{margin-bottom:40px}
.sidebar-title{
  font-family:'Playfair Display',serif;
  font-size:18px;
  font-weight:600;
  margin-bottom:16px;
  padding-bottom:8px;
  border-bottom:2px solid var(--text);
}
.skill-list{list-style:none}
.skill-list li{
  padding:8px 0;
  border-bottom:1px dotted var(--border);
  font-size:14px;
}
.skill-list li span{
  float:right;
  color:var(--text-muted);
  font-size:12px;
}

/* Contact Box */
.contact-box{
  background:var(--text);
  color:var(--bg);
  padding:24px;
}
.contact-box h3{
  font-family:'Playfair Display',serif;
  font-size:20px;
  margin-bottom:12px;
}
.contact-box a{
  color:var(--bg);
  opacity:0.8;
  display:block;
  margin:8px 0;
  font-size:14px;
}
.contact-box a:hover{opacity:1}

/* Footer */
footer{
  text-align:center;
  padding:40px;
  border-top:3px double var(--border);
  font-size:12px;
  color:var(--text-muted);
}

@media(max-width:768px){
  .main{grid-template-columns:1fr}
  .sidebar{border-left:none;padding-left:0;border-top:1px solid var(--border);padding-top:40px}
  .projects-grid{grid-template-columns:1fr}
}
</style>
</head>
<body>
<header class="masthead">
  <p class="masthead-date">Portfolio · {{YEAR}}</p>
  <h1 class="masthead-title">{{NAME}}</h1>
  <p class="masthead-subtitle">{{ROLE}} · {{COLLEGE}}</p>
</header>

<nav>
  <a href="#about">About</a>
  <a href="#projects">Projects</a>
  <a href="#skills">Skills</a>
  <a href="#contact">Contact</a>
</nav>

<main class="main">
  <div class="content">
    <article id="about">
      <span class="section-label">About</span>
      <h2 class="article-title">{{HEADLINE}}</h2>
      <p class="article-lead">{{TAGLINE}}</p>
      <div class="article-body drop-cap">
        <p>{{BIO}}</p>
      </div>
    </article>
    
    <article id="projects">
      <span class="section-label">Featured Work</span>
      <h2 class="article-title">Projects & Experiments</h2>
      <div class="projects-grid">
        {{#PROJECTS}}
        <div class="project-item">
          <h3 class="project-headline">{{NAME}}</h3>
          <p class="project-excerpt">{{DESC}}</p>
          <p class="project-meta">{{TECH}}</p>
        </div>
        {{/PROJECTS}}
      </div>
    </article>
  </div>
  
  <aside class="sidebar">
    <div class="sidebar-section" id="skills">
      <h3 class="sidebar-title">Technical Skills</h3>
      <ul class="skill-list">
        {{#SKILLS}}
        <li>{{NAME}} <span>{{LEVEL}}</span></li>
        {{/SKILLS}}
      </ul>
    </div>
    
    <div class="sidebar-section" id="contact">
      <div class="contact-box">
        <h3>Get In Touch</h3>
        <a href="mailto:{{EMAIL}}">✉ {{EMAIL}}</a>
        <a href="{{GITHUB}}">⌘ GitHub</a>
        <a href="{{LINKEDIN}}">⚡ LinkedIn</a>
      </div>
    </div>
  </aside>
</main>

<footer>
  <p>© {{YEAR}} {{NAME}} · Built with FolioAI</p>
</footer>
</body>
</html>`;

// Export all creative templates
export const creativeTemplates = {
  'macos-desktop': {
    name: 'macOS Desktop',
    description: 'Interactive OS-style portfolio with windows, dock, and folder icons',
    template: macOSDesktopTemplate,
    tags: ['creative', 'interactive', 'dark', 'unique'],
    recommended: 'students',
  },
  'bento-grid': {
    name: 'Bento Grid',
    description: 'Modern card-based layout inspired by Apple and Linear',
    template: bentoGridTemplate,
    tags: ['modern', 'minimal', 'cards', 'dark'],
    recommended: 'all',
  },
  'editorial': {
    name: 'Editorial',
    description: 'Newspaper/magazine style with multi-column layout',
    template: editorialTemplate,
    tags: ['creative', 'light', 'content-focused', 'unique'],
    recommended: 'content-creators',
  },
};
