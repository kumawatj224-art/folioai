/**
 * INFRASTRUCTURE LAYER - AI Service
 * 
 * Azure OpenAI integration for portfolio generation.
 * Aligned with FolioAI Product Document Phase 1.
 * 
 * Uses TWO models with SEPARATE endpoints:
 * - GPT-4o Mini: for chat conversation (collecting info) - cheaper, faster
 * - GPT-4o: for final HTML generation (needs larger context) - higher quality
 * 
 * Environment Variables:
 * - AZURE_OPENAI_ENDPOINT: Primary endpoint (used for chat)
 * - AZURE_OPENAI_API_KEY: Primary API key
 * - AZURE_OPENAI_CHAT_MODEL: Chat model deployment name (default: gpt-4o-mini)
 * 
 * - AZURE_OPENAI_GENERATION_ENDPOINT: Optional separate endpoint for generation
 * - AZURE_OPENAI_GENERATION_API_KEY: Optional separate API key for generation
 * - AZURE_OPENAI_GENERATION_MODEL: Generation model deployment name (default: gpt-4o)
 */

import { AzureOpenAI } from "openai";
import type { ChatMessage, StudentInfo, PortfolioTemplate } from "@/domain/entities/chat";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONFIGURATION - Separate endpoints for chat & generation
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Primary endpoint (for chat)
const CHAT_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT ?? "";
const CHAT_API_KEY = process.env.AZURE_OPENAI_API_KEY ?? "";
const CHAT_MODEL = process.env.AZURE_OPENAI_CHAT_MODEL ?? "gpt-4o-mini";

// Generation endpoint (can be separate or same as primary)
const GENERATION_ENDPOINT = process.env.AZURE_OPENAI_GENERATION_ENDPOINT || CHAT_ENDPOINT;
const GENERATION_API_KEY = process.env.AZURE_OPENAI_GENERATION_API_KEY || CHAT_API_KEY;
const GENERATION_MODEL = process.env.AZURE_OPENAI_GENERATION_MODEL ?? "gpt-4o";

const API_VERSION = process.env.AZURE_OPENAI_API_VERSION ?? "2025-01-01-preview";

// Log config on startup (server-side only)
if (typeof window === "undefined") {
  console.log(`[AI Service] Config:`);
  console.log(`  Chat: ${CHAT_MODEL} @ ${CHAT_ENDPOINT ? CHAT_ENDPOINT.substring(0, 40) + '...' : 'NOT SET'}`);
  console.log(`  Generation: ${GENERATION_MODEL} @ ${GENERATION_ENDPOINT ? GENERATION_ENDPOINT.substring(0, 40) + '...' : 'NOT SET'}`);
  if (GENERATION_ENDPOINT !== CHAT_ENDPOINT) {
    console.log(`  (Using separate endpoints for chat and generation)`);
  }
}

// Create separate clients for chat and generation
// Note: Azure OpenAI SDK requires 'deployment' in constructor options
const chatClient = new AzureOpenAI({
  endpoint: CHAT_ENDPOINT,
  apiKey: CHAT_API_KEY,
  apiVersion: API_VERSION,
  deployment: CHAT_MODEL,  // Required for Azure OpenAI
});

const generationClient = new AzureOpenAI({
  endpoint: GENERATION_ENDPOINT,
  apiKey: GENERATION_API_KEY,
  apiVersion: API_VERSION,
  deployment: GENERATION_MODEL,  // Required for Azure OpenAI
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONVERSATION SYSTEM PROMPT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const CONVERSATION_SYSTEM_PROMPT = `You are FolioAI, an expert portfolio website builder. 
Your job is to collect information and generate stunning portfolio websites.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRITICAL RULES — NEVER BREAK THESE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. NEVER ASK THE SAME QUESTION TWICE
   - If info is already in studentInfo below, DON'T ask for it again
   - If user says "no", "none", "skip", or "keep old data" — MOVE ON immediately
   - Never re-ask for projects, achievements, or experience if user declined

2. WHEN USER SAYS "KEEP OLD DATA" OR "KEEP EXISTING" OR "USE PREVIOUS"
   - Immediately offer to generate with current data
   - Just ask which creative template they want (if not already chosen)
   - Don't ask for more details

3. AFTER RESUME UPLOAD
   - Review what was extracted
   - Ask ONLY for template choice
   - Skip all other questions unless user wants to add something

4. BE CONCISE
   - Max 2-3 sentences per response
   - Ask only ONE question at a time
   - Skip encouragement speeches — be direct

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EDIT MODE / REGENERATION (VERY IMPORTANT)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

When user is EDITING/REGENERATING an existing portfolio:
- ALL existing data is preserved automatically
- DON'T ask to re-enter name, skills, experience, projects
- Just ask: "What would you like to change?"

Common edit requests (handle directly):
- "Change design" → Show template options
- "Make it creative" → Suggest creative templates
- "Light colors" → Suggest light/bright templates
- "Add X" → Ask for details about X only
- "Remove projects" → Say "Got it, I'll skip the projects section"
- "Update bio" → Ask only for new bio

Example responses for edit mode:
- User: "Make it more creative" 
  → "I'll use your existing info. Pick a template: 🎮 Game HUD, 🧱 Bento Grid, 📱 iOS App, or 🎵 Spotify?"

- User: "Change to bento grid"
  → "Got it! Click **Re-Generate** to see your Bento Grid portfolio."

- User: "Add a project"
  → "What's the project name and description?"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHAT TO DO BASED ON CURRENT DATA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

IF studentInfo already has name + skills/experience/education:
  → Data is ALREADY collected!
  → Just ask: "Want to change anything or pick a different template?"
  → Don't re-ask for basic info

IF user says "change design" or "update template":
  → Show template options immediately
  → Don't ask for more info

TEMPLATE OPTIONS (show these for creative requests):
  🎮 Game HUD — XP bars, achievements, gaming UI
  📱 iOS App — iPhone home screen style
  🌌 Space Galaxy — planets, constellations  
  📼 Retro VHS — 80s neon, scanlines
  🎵 Spotify — music player interface
  📊 Dashboard — analytics, charts
  📰 Newspaper — editorial, headlines
  🧱 Bento Grid — modern Apple card layout
  💻 Terminal — hacker aesthetic

LIGHT/BRIGHT TEMPLATES:
  📰 Newspaper — cream paper, editorial red
  🧱 Bento Grid — can be light themed
  📱 iOS App — light mode style

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONVERSATION FLOW (only if starting fresh)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Basic Info: name, college, branch, year
2. Skills: languages, frameworks, tools
3. Projects: ask ONCE — if "no", move on
4. Experience: ask ONCE — if "no", move on  
5. Template: show options, let them pick
6. Generate: when ready, say "Click Generate!"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESPONSE GUIDELINES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- Keep responses under 50 words
- When user declines something, just say "Got it!" and move on
- Don't repeat what user already said
- If data exists, say: "Using your existing info. Click **Re-Generate** when ready!"
- For fresh start: "Ready! Click **Generate** when you're set."

Current information collected:
{{STUDENT_INFO}}`;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HTML GENERATION SYSTEM PROMPT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const HTML_GENERATION_PROMPT = `Generate a complete, production-ready portfolio website as a single HTML file.

**Student Information:**
{{STUDENT_INFO}}

**Template Style:** {{TEMPLATE}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DYNAMIC CONTENT HANDLING (CRITICAL FOR STUDENTS)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Analyze the student information and DYNAMICALLY include/exclude sections:

IF user has work experience (internships array is NOT empty):
  → Include "Experience" section with company details
  → Show experience in nav menu
  
IF user has NO work experience (internships array is empty or missing):
  → SKIP the Experience section entirely
  → DO NOT include "Experience" link in nav
  → Instead, make PROJECTS and EDUCATION more prominent
  → Add an "Education" section with college, branch, CGPA
  → The hero can show "Aspiring [Role]" or "[Year] Year [Branch] Student"

IF user has projects (projects array has items):
  → Include "Projects" section — make it prominent for students without experience
  → For students, projects should come BEFORE experience in layout
  
IF user has achievements (achievements array has items):
  → Include "Achievements" section
  → Include hackathons, certifications, coding profiles, awards
  
IF user has coding profiles (LeetCode, CodeChef, etc.):
  → Add a "Coding Profiles" or "Competitive Programming" card
  → Show ratings/problem counts as stats

SECTION ORDER FOR STUDENTS (no experience):
  1. Hero (with education info prominent)
  2. Skills ticker
  3. Projects (THE main section)
  4. Skills grid
  5. Education section
  6. Achievements (if any)
  7. Contact

SECTION ORDER FOR EXPERIENCED:
  1. Hero (with company cards)
  2. Skills ticker
  3. Experience
  4. Skills grid
  5. Projects (if any)
  6. Achievements (if any)
  7. Contact

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MANDATORY HTML REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- Single HTML file with ALL CSS embedded in <style> tag
- ALL JavaScript embedded in <script> tag  
- NO external dependencies (no CDN links for CSS frameworks)
- Google Fonts links ARE allowed (they load fast)
- Must be fully responsive — works on mobile AND desktop
- Must scroll smoothly with working anchor navigation
- Include a loading animation (fade out after 0.8s)
- Add intersection observer for fade-in animations on scroll

NAVIGATION & ANCHORS (DYNAMIC):
- Fixed navigation bar at top with backdrop blur
- Navigation should ONLY include links to sections that EXIST:
  * href="#projects" → ALWAYS include if user has projects
  * href="#skills" → ALWAYS include
  * href="#experience" → ONLY if user has internships/jobs
  * href="#education" → Include for students without experience
  * href="#achievements" → ONLY if user has achievements
  * href="#contact" → ALWAYS include
- Each included section MUST have a matching id attribute
- Add smooth scroll CSS: html { scroll-behavior: smooth }
- Include "Hire me" or "Contact" CTA button in nav that links to #contact

DYNAMIC SECTIONS (include based on data):
1. Loading screen with name animation — ALWAYS
2. Fixed navigation with links to EXISTING sections — ALWAYS
3. Hero section — ALWAYS (adapt content based on student vs professional)
4. Skills ticker/marquee — ALWAYS (infinite horizontal scroll)
5. Projects section (id="projects") — if user has projects (PROMINENT for students)
6. Experience section (id="experience") — ONLY if user has internships/jobs
7. Education section (id="education") — for students, include college/branch/CGPA
8. Skills grid (id="skills") — ALWAYS
9. Achievements section (id="achievements") — if user has awards/certifications/coding profiles
10. Personal/About section with quote — ALWAYS
11. Contact section (id="contact") — ALWAYS
12. Footer with "Built with FolioAI" — ALWAYS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STUDENT-SPECIFIC HERO ADAPTATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FOR STUDENTS WITHOUT EXPERIENCE:
  Hero Left Side:
    - Eyebrow: "[Branch] · [Year] Year · [College]"
    - Name: Large, styled name
    - Tagline: "Aspiring [Role] | [Passion/Focus Area]"
    - Description: What they're learning, their goals
    - CTA: "View Projects" + "Contact Me"
  
  Hero Right Side (instead of company cards):
    - Education card with college, branch, CGPA
    - Skills summary card
    - Stats: Projects built, problems solved (LeetCode), etc.
    - OR: Featured project preview

FOR EXPERIENCED PROFESSIONALS:
  Hero Right Side:
    - Company cards with colored dots
    - Stats grid (years exp, metrics, impact)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DESIGN RULES — NEVER DO THESE (CRITICAL)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ NEVER create a "standard corporate" portfolio with sections stacked vertically
❌ NEVER use the same layout everyone uses (hero → experience → skills → contact)
❌ NEVER use blue (#3b82f6) as primary accent — it's overused
❌ NEVER use JetBrains Mono + Inter combo — too common
❌ NEVER create "company cards" with colored dots — everyone does this
❌ NEVER use a simple fixed navbar with text links
❌ NEVER use basic card grids with equal spacing
❌ NEVER add placeholder "Lorem ipsum" text
❌ NEVER invent fake projects or experience the user didn't mention
❌ NEVER use generic stock phrases like "passionate developer" or "tech enthusiast"
❌ NEVER use basic bullet points (•) — be creative
❌ NEVER make all sections look the same
❌ NEVER create boring, flat designs
❌ NEVER ignore the chosen creative concept

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DESIGN RULES — ALWAYS DO THESE (CREATIVE FOCUS)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ ALWAYS pick ONE creative concept and commit fully (see CREATIVE CONCEPTS below)
✅ ALWAYS use an unusual layout — NOT the standard vertical sections
✅ ALWAYS add at least 3 CSS animations (hover, scroll, entrance, continuous)
✅ ALWAYS include ONE unique interactive element (not just hover effects)
✅ ALWAYS use a distinctive color palette — NOT blue, NOT purple gradients
✅ ALWAYS vary section designs — no two sections should look similar
✅ ALWAYS add depth: layered elements, overlapping cards, z-index play
✅ ALWAYS include personality — inside jokes, fun copy, unexpected elements
✅ ALWAYS use creative typography: variable fonts, animated text, gradient text
✅ ALWAYS add "easter eggs" or delightful surprises for visitors
✅ ALWAYS make the loading screen unique (not just fading name)
✅ ALWAYS include one "wow" element that makes people screenshot
✅ Use the student's actual words/description for bio
✅ Add "Built with FolioAI" in footer
✅ Extract ALL quantified achievements and display creatively

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATIVE CONCEPTS — PICK ONE AND GO ALL-IN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DO NOT create a generic portfolio. Pick ONE concept from below:

🎮 GAME HUD CONCEPT:
  - Health bar = skill proficiency
  - XP meter = years of experience
  - Achievement unlocks with popups
  - Player stats card with level
  - Pixel art elements, 8-bit sounds on hover
  - "Press START" on load screen

📱 iOS APP CONCEPT:
  - Looks like an iPhone home screen
  - Projects = app icons
  - Tap to open (modal like app opening)
  - Dynamic Island for status
  - Control Center for contact info
  - Rounded corners, blur effects throughout

🌌 SPACE/GALAXY CONCEPT:
  - Dark space background with stars (CSS animated)
  - Planets = skill categories (orbit animation)
  - Constellations connect projects
  - Shooting stars on scroll
  - "Mission Control" navigation
  - Floating astronaut avatar

📺 RETRO TV / VHS CONCEPT:
  - CRT screen effect with scanlines
  - VHS tracking distortion on hover
  - Channel switching for sections
  - Static noise transitions
  - Neon 80s color palette (#ff00ff, #00ffff)
  - "PLAY/PAUSE" buttons

🎵 SPOTIFY / MUSIC PLAYER CONCEPT:
  - Dark UI like Spotify
  - Experience = albums/tracklist
  - Skills = genre tags
  - Projects = playlist cards
  - Progress bar navigation
  - "Now Playing" hero section

📊 DASHBOARD / ANALYTICS CONCEPT:
  - Glassmorphism cards everywhere
  - Real-time looking metrics (animate numbers)
  - Charts for skills (bar/radar/donut)
  - Sidebar navigation like admin panel
  - Status indicators (online • active)
  - Grid of varying card sizes

🎪 CIRCUS / CARNIVAL CONCEPT:
  - Playful, colorful, bold
  - Ticket-style project cards
  - Carousel animations
  - Oversized typography
  - Confetti on interactions
  - "Roll up, roll up!" energy

📰 NEWSPAPER FRONT PAGE CONCEPT:
  - Actual newspaper layout with columns
  - Headline typography for name
  - Bylines for roles/dates
  - Pull quotes with giant quotation marks
  - "Breaking News" ticker for skills
  - Sepia/paper texture background

Pick the concept that fits the user's personality and industry. Execute it FULLY — don't half-commit.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TEMPLATE SPECS — use exact fonts and structure
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TEMPLATE: macos-desktop (CREATIVE — HIGHLY RECOMMENDED FOR STUDENTS)
  Fonts: -apple-system, SF Pro Display
  Colors: 
    --bg: #1e1e1e (dark surface)
    --surface: #2d2d2d (cards)
    --accent: #0a84ff (macOS blue)
    --red: #ff453a, --yellow: #ffd60a, --green: #32d74b (traffic lights)
  
  KEY EXPERIENCE: Interactive OS-style desktop environment
  - Menu bar at top (Apple logo, nav items, clock, battery)
  - Desktop icons on left side = project folders (clickable)
  - Hero section centered with curved background shapes
  - Dock at bottom with app icons (Projects, Resume, Contact, GitHub, LinkedIn)
  - Windows that open on click (modal-style with close/minimize/maximize buttons)
  - Each project = a folder icon that opens a detail window
  
  Structure:
  1. Menu bar (fixed top, blur backdrop)
  2. Desktop with folder icons (left side)
  3. Hero center: "Hey, I'm [Name]! Welcome to my portfolio"
  4. Dock (fixed bottom, icons with hover zoom)
  5. Window modals for Projects, Skills, Contact
  
  Interactions (CSS + minimal JS):
  - Folder hover: background highlight
  - Dock items: translateY(-10px) + scale(1.15) on hover
  - Windows: fade-in animation, close button works
  - Clock: updates with actual time

TEMPLATE: bento-grid (CREATIVE — MODERN LAYOUT)
  Fonts: Plus Jakarta Sans
  Colors: 
    --bg: #0a0a0a
    --card: #141414
    --accent: #f97316 (orange)
  
  KEY EXPERIENCE: Card-based grid like Apple's website
  - CSS Grid with varying card sizes (span 2 cols, span 2 rows)
  - Hero card (large, spans 2x2)
  - Profile card with avatar and status
  - Stats card (4 numbers: projects, skills, year, CGPA)
  - Skills card (icon rows)
  - Project cards (numbered, with tech tags)
  - Contact card (CTA buttons)
  
  Structure:
  1. Full-bleed bento grid
  2. Cards animate on hover (lift + shadow)
  3. Orange accent line appears on project cards on hover
  4. No traditional sections — all in grid

TEMPLATE: editorial (CREATIVE — NEWSPAPER STYLE)
  Fonts: Playfair Display (serif headlines) + Source Sans 3 (body)
  Colors: 
    --bg: #faf9f7 (cream paper)
    --text: #1a1a1a (ink)
    --accent: #c41230 (editorial red)
  
  KEY EXPERIENCE: Newspaper/magazine layout
  - Masthead with name (like newspaper title)
  - 2-column layout (main content + sidebar)
  - Drop caps on first paragraph
  - Section labels in uppercase red
  - Sidebar with skills list and contact box
  - Projects as headline cards
  
  Structure:
  1. Masthead (date, name, subtitle)
  2. Navigation (centered links)
  3. Main (2 columns: articles | sidebar)
  4. Article-style sections with headlines
  5. Dark contact box in sidebar

TEMPLATE: enterprise-dark (RECOMMENDED FOR EXPERIENCED PROFESSIONALS)
  Fonts: Fraunces (serif display, italic for emphasis) + Epilogue (sans body)
  Colors: 
    --bg: #09090b (near black)
    --s1: #111113 (surface 1)
    --s2: #18181b (surface 2)
    --border: rgba(255,255,255,0.07)
    --text: #fafaf9 (white)
    --text2: #a1a1aa (muted)
    --accent: #f59e0b (amber/gold)
    --green: #22c55e (for "current" badges)
    --blue: #3b82f6
    --red: #ef4444
  
  Navigation Structure:
    <nav> with position:fixed, backdrop-filter:blur(20px)
    - Left: Logo/Name (serif font)
    - Center: <a href="#experience">Experience</a> | <a href="#skills">Skills</a> | <a href="#achievements">Achievements</a> | <a href="#contact">Contact</a>
    - Right: "Open to opportunities" badge + "Hire me" CTA linking to #contact
  
  Hero Structure:
    - Left (60%): Eyebrow label, large name (split across 3 lines, mix of weights), description, CTA buttons
    - Right (40%): Company cards with colored dots, stats grid (4 boxes with key metrics)
  
  Key Elements:
    - Loading screen with pulsing name in italic serif
    - Fixed nav with backdrop blur, "Open to opportunities" badge with blinking dot
    - Skills ticker with ✦ separators, infinite scroll animation
    - Experience (id="experience"): 2-column grid (left: company/role/tech chips, right: bullet highlights)
    - Each experience bullet has colored dot + strong tags for emphasis
    - Skills (id="skills"): Cards with emoji icon, uppercase label, chip-style skills
    - Achievements (id="achievements"): Card grid with icons
    - Personal section: Left quote (border-left accent), right details grid
    - Contact (id="contact"): Radial gradient glow behind title
  
  CSS Patterns:
    - html { scroll-behavior: smooth }
    - box-sizing: border-box on all elements
    - backdrop-filter: blur(20px) on nav
    - border-radius: 8-16px consistently
    - transition: all 0.2s for smooth hovers
    - button hovers: translateY(-2px) + opacity change
    - section alternation: bg vs s1 background

TEMPLATE: terminal-dark
  Fonts: JetBrains Mono (monospace) + Syne (display)
  Colors: #0d0d0d bg, #00ff88 accent, #e0e0e0 text
  Feel: Custom cursor, terminal-style prompts, code aesthetic
  Key element: Hero shows "$ whoami → [name]", blinking cursor animation

TEMPLATE: game-hud (CREATIVE — RECOMMENDED)
  Fonts: Press Start 2P (pixel) + Space Mono
  Colors: 
    --bg: #0f0f23 (dark blue-black)
    --accent1: #00ff41 (matrix green)
    --accent2: #ff6b35 (orange XP)
    --accent3: #9d4edd (purple rare)
  
  KEY EXPERIENCE: Video game UI
  - Top HUD bar: Name (player name), Level badge, XP progress bar
  - Health-style bars for skill proficiency (CSS animated fill)
  - "ACHIEVEMENT UNLOCKED" popups on scroll
  - Player stats card: LVL, XP, Class (Developer/Designer)
  - Projects as "QUEST LOG" entries with difficulty ratings
  - Experience as "BATTLE HISTORY" timeline
  - 8-bit style icons and pixel borders
  - Scanline overlay effect
  - "PRESS START" flashing on load screen
  - Sound wave animation on hover (visual, no audio)

TEMPLATE: ios-app (CREATIVE — MODERN)
  Fonts: SF Pro Display (or Inter as fallback) + SF Mono
  Colors: 
    --bg: linear-gradient(180deg, #1c1c1e 0%, #000000 100%)
    --card: rgba(255,255,255,0.08)
    --accent: #0a84ff (iOS blue)
  
  KEY EXPERIENCE: iPhone home screen
  - Grid of app icons (rounded squares with gradients)
  - Projects = app icons that "open" on click (scale + modal)
  - Dynamic Island at top showing current status
  - Dock at bottom with main links
  - Control Center style contact panel (swipe down effect)
  - Lockscreen with time + "Slide to explore"
  - App opening animation (scale + fade)
  - Haptic-like micro-interactions

TEMPLATE: space-galaxy (CREATIVE — AI/ML FOCUSED)
  Fonts: Orbitron (display) + Space Grotesk
  Colors: 
    --bg: #0a0a1a (deep space)
    --stars: #ffffff
    --nebula1: #7c3aed (purple)
    --nebula2: #06b6d4 (cyan)
    --accent: #fbbf24 (gold/sun)
  
  KEY EXPERIENCE: Space exploration theme
  - Starfield background (CSS animated twinkle)
  - Floating astronaut or satellite avatar
  - Planets represent skill categories (orbit animation)
  - Constellations connect related projects (SVG lines)
  - "MISSION CONTROL" navigation
  - Rocket launch on page load
  - Shooting stars on scroll (CSS animation)
  - Nebula gradient overlays
  - "Transmission received" for contact section

TEMPLATE: retro-vhs (CREATIVE — 80s NOSTALGIA)
  Fonts: VT323 (digital) + Press Start 2P
  Colors: 
    --bg: #1a1a2e
    --neon-pink: #ff0080
    --neon-cyan: #00ffff
    --neon-yellow: #ffff00
    --grid: rgba(255,0,128,0.3)
  
  KEY EXPERIENCE: VHS tape / 80s aesthetic
  - CRT scanline overlay (CSS)
  - VHS tracking distortion on hover (transform + opacity flicker)
  - "PLAY ▶" button to start exploring
  - Channel numbers for sections (CH 01, CH 02)
  - Static noise transition between sections
  - Neon glow text effects
  - Grid background (synthwave style)
  - Glitch text effect on hover
  - "TRACKING" slider animation on load

TEMPLATE: spotify-player (CREATIVE — MUSIC THEMED)
  Fonts: Circular Std (or Montserrat as fallback)
  Colors: 
    --bg: #121212 (Spotify dark)
    --card: #181818
    --accent: #1db954 (Spotify green)
    --text: #ffffff
    --text2: #b3b3b3
  
  KEY EXPERIENCE: Music player interface
  - Sidebar navigation like Spotify
  - "Now Playing" hero with album art style profile photo
  - Project cards as album/playlist covers
  - Progress bar with current position (animated)
  - Skills as genre tags with play counts
  - Experience timeline as tracklist
  - Volume slider for "interest level"
  - Shuffle/repeat icons as navigation
  - "Made For You" section style recommendations

TEMPLATE: dashboard-analytics (CREATIVE — DATA VIZ)
  Fonts: Inter + IBM Plex Mono
  Colors: 
    --bg: #0f172a (slate)
    --card: rgba(255,255,255,0.05)
    --accent1: #22c55e (green)
    --accent2: #3b82f6 (blue)
    --accent3: #f59e0b (amber)
  
  KEY EXPERIENCE: Analytics dashboard
  - Sidebar navigation with icons
  - Cards with varying sizes (CSS Grid)
  - Animated number counters (count up on view)
  - Skill charts (bar chart, radar chart with CSS)
  - Activity heatmap for projects
  - Status indicators (• Online, Active)
  - Real-time looking metrics
  - Glassmorphism cards throughout
  - Mini charts in stat cards

TEMPLATE: newspaper-frontpage (CREATIVE — EDITORIAL)
  Fonts: Playfair Display (headlines) + Libre Baskerville (body)
  Colors: 
    --bg: #f5f1e8 (paper)
    --ink: #1a1a1a
    --accent: #c41230 (red)
    --sepia: #e8e0d0
  
  KEY EXPERIENCE: Newspaper front page
  - Masthead with name as newspaper title
  - Date and "Issue #" in header
  - Multi-column layout (CSS columns)
  - Headlines with varying sizes
  - Bylines under each section
  - Pull quotes with giant quotation marks
  - "BREAKING NEWS" ticker for skills
  - Sidebar with classified-style contact
  - Drop caps on first paragraphs
  - Paper texture overlay

TEMPLATE: editorial-light
  Fonts: Playfair Display (serif) + DM Sans (body)
  Colors: #faf8f4 bg, #c8490a accent, #1a1614 ink
  Feel: Magazine layout, 2-column hero, scrolling marquee on dark bg
  Key element: Italic serif name treatment, horizontal project list

TEMPLATE: gradient-dark
  Fonts: Outfit (all weights)
  Colors: #080810 bg, #7c3aed + #2563eb + #06b6d4 gradients
  Feel: Glassmorphism cards, glowing orbs, gradient text
  Key element: Animated gradient name, timeline experience

TEMPLATE: brutalist
  Fonts: Bebas Neue (display) + Space Grotesk (body)
  Colors: #f5f0e8 bg, #111 ink, #ff4500 accent
  Feel: Grid-based, heavy borders, ticker tape, high contrast
  Key element: Outlined + solid name treatment, hover row inversion

TEMPLATE: minimal-warm
  Fonts: Cormorant Garamond (serif) + Karla (body)
  Colors: #f9f5ef bg, #b5441a accent, #2c2420 ink
  Feel: Japanese minimalism, generous whitespace, italic serif
  Key element: Quote-style about section, understated elegance

TEMPLATE: minimal-dark
  Fonts: Inter (clean sans) + JetBrains Mono (code)
  Colors: #0a0a0a bg, #fafafa text, #3b82f6 accent
  Feel: Clean monochrome, developer-focused, high readability
  Key element: Simple cards, subtle borders, code-like stats display

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EXPERIENCE SECTION GUIDELINES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

For each job/internship, create a 2-column layout:
- LEFT: Company name (with colored badge if current/notable), role, period, tech chips
- RIGHT: 3-5 bullet points with:
  * Colored accent bullets (not plain •)
  * <strong> tags around key metrics and technologies
  * Quantified achievements (X%, Y users, Z services)

Example bullet format:
"Key contributor to <strong>Adobe Firefly AI Platform</strong> — delivered dynamic EC2-based 
machine provisioning system for scalable, cost-optimized AI model training."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT FORMAT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Output ONLY the complete HTML file starting with:
<!DOCTYPE html>

Do NOT add any explanation before or after the HTML.
Do NOT wrap in markdown code blocks.
The HTML must be complete and immediately renderable in a browser.

End the HTML with exactly:
<!-- FOLIO_GENERATION_COMPLETE -->
`;

export async function isAIConfigured(): Promise<boolean> {
  return Boolean(
    CHAT_ENDPOINT && 
    CHAT_API_KEY && 
    !CHAT_ENDPOINT.includes("your-resource") &&
    !CHAT_API_KEY.includes("replace")
  );
}

export function isGenerationConfigured(): boolean {
  return Boolean(
    GENERATION_ENDPOINT && 
    GENERATION_API_KEY && 
    !GENERATION_ENDPOINT.includes("your-resource")
  );
}

/**
 * Call Azure OpenAI for chat conversation (uses GPT-4o-mini for cost efficiency)
 * Uses: chatClient -> CHAT_ENDPOINT
 */
async function callChatModel(
  messages: Array<{ role: string; content: string }>,
): Promise<string> {
  const completion = await chatClient.chat.completions.create({
    model: CHAT_MODEL,
    messages: messages as Array<{ role: "system" | "user" | "assistant"; content: string }>,
    max_tokens: 2000,
    temperature: 0.7,
  });

  return completion.choices?.[0]?.message?.content ?? "";
}

/**
 * Call Azure OpenAI for HTML generation (uses GPT-4o for larger context & quality)
 * Uses: generationClient -> GENERATION_ENDPOINT (can be separate from chat)
 * Falls back to chatClient if generation endpoint fails
 */
async function callGenerationModel(
  messages: Array<{ role: string; content: string }>,
): Promise<string> {
  // Try generation client first
  try {
    console.log(`[AI] Calling generation model: ${GENERATION_MODEL}`);
    const completion = await generationClient.chat.completions.create({
      model: GENERATION_MODEL,
      messages: messages as Array<{ role: "system" | "user" | "assistant"; content: string }>,
      max_tokens: 16000, // HTML portfolios can be 8000-12000 tokens
      temperature: 0.7,
    });
    console.log(`[AI] Generation successful with ${GENERATION_MODEL}`);
    return completion.choices?.[0]?.message?.content ?? "";
  } catch (error: unknown) {
    const isDeploymentNotFound = error instanceof Error && 
      ('code' in error && (error as { code?: string }).code === 'DeploymentNotFound');
    
    // If generation model not found and we have a different chat model, try that
    if (isDeploymentNotFound && GENERATION_MODEL !== CHAT_MODEL) {
      console.warn(`[AI] Generation model ${GENERATION_MODEL} not found, falling back to chat model ${CHAT_MODEL}`);
      const completion = await chatClient.chat.completions.create({
        model: CHAT_MODEL,
        messages: messages as Array<{ role: "system" | "user" | "assistant"; content: string }>,
        max_tokens: 16000,
        temperature: 0.7,
      });
      return completion.choices?.[0]?.message?.content ?? "";
    }
    throw error;
  }
}

export async function* streamAzureOpenAI(
  messages: Array<{ role: string; content: string }>
): AsyncGenerator<string, void, unknown> {
  // Use generation client for streaming HTML
  const stream = await generationClient.chat.completions.create({
    model: GENERATION_MODEL,
    messages: messages as Array<{ role: "system" | "user" | "assistant"; content: string }>,
    max_tokens: 16000,
    temperature: 0.7,
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices?.[0]?.delta?.content;
    if (content) yield content;
  }
}

export async function generateChatResponse(
  messages: ChatMessage[],
  studentInfo: Partial<StudentInfo>,
  existingHtml?: string | null,
  templateName?: string
): Promise<string> {
  let systemMessage = CONVERSATION_SYSTEM_PROMPT.replace(
    "{{STUDENT_INFO}}",
    JSON.stringify(studentInfo, null, 2)
  );

  // Add context about template if using one
  if (templateName) {
    systemMessage += `\n\n**Template Mode:**
The user has selected the "${templateName}" template for their portfolio. 
Help them provide the information needed to fill in the template:
- Name, college, branch, graduation year
- Skills (both technical and soft skills)
- Projects (with descriptions and tech stack)
- Experience/internships
- Social links (GitHub, LinkedIn)

Be encouraging and help them showcase their best work!`;
  }

  // Add context about existing portfolio if editing
  if (existingHtml) {
    systemMessage += `\n\n**EDITING MODE - ALL DATA IS PRESERVED:**
The user already has a portfolio with all their info saved. 
DO NOT ask them to re-enter their basic info, skills, projects, or experience.

Just ask: "What would you like to change?"

Common requests:
- "Change template" → Show template options
- "Make it creative" → Suggest creative templates
- "Add something" → Ask only for that specific item
- "Update X" → Help them update just X

After they specify changes, say: "Got it! Click **Re-Generate** to apply the changes."

Their current data (DO NOT RE-ASK FOR THIS):
${JSON.stringify(studentInfo, null, 2)}`;
  }

  const apiMessages = [
    { role: "system", content: systemMessage },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  return callChatModel(apiMessages);
}

export async function generatePortfolioHtml(
  studentInfo: StudentInfo,
  template: PortfolioTemplate,
  existingHtml?: string | null,
  chatMessages?: ChatMessage[]
): Promise<string> {
  let prompt = HTML_GENERATION_PROMPT
    .replace("{{STUDENT_INFO}}", JSON.stringify(studentInfo, null, 2))
    .replace("{{TEMPLATE}}", template);

  // Include existing HTML as reference if editing
  if (existingHtml) {
    prompt += `\n\n**EDITING MODE - Reference Portfolio:**
The user is editing their existing portfolio. Apply the changes they requested in the conversation while preserving the overall structure and styling. Here's their current portfolio:\n\`\`\`html\n${existingHtml.substring(0, 6000)}${existingHtml.length > 6000 ? '\n... (truncated)' : ''}\n\`\`\``;
    
    // Add conversation context to understand what changes were requested
    if (chatMessages && chatMessages.length > 0) {
      const recentMessages = chatMessages.slice(-10); // Last 10 messages for context
      const conversation = recentMessages
        .map(m => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
        .join("\n");
      prompt += `\n\n**Conversation about changes:**\n${conversation}`;
    }
  }

  const response = await callGenerationModel([
    { role: "system", content: "You are an expert web developer who creates stunning, production-ready portfolio HTML. Follow the template specifications exactly." },
    { role: "user", content: prompt },
  ]);

  // Clean up response - remove markdown code blocks if present
  return response
    .replace(/```html\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();
}

export async function extractStudentInfo(
  messages: ChatMessage[]
): Promise<Partial<StudentInfo>> {
  const conversation = messages
    .filter((m) => m.role !== "system")
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n");

  const extractionPrompt = `Extract student information from this conversation. Return ONLY valid JSON:

{
  "name": "string",
  "college": "string",
  "branch": "string",
  "graduationYear": "string",
  "skills": ["string"],
  "projects": [{ "title": "string", "description": "string", "techStack": ["string"], "link": "string?" }],
  "internships": [{ "company": "string", "role": "string", "duration": "string", "description": "string" }],
  "achievements": ["string"],
  "socialLinks": { "github": "string?", "linkedin": "string?", "email": "string?" }
}

Only include fields explicitly mentioned. Use empty arrays/objects for missing data.

Conversation:
${conversation}

Return ONLY JSON:`;

  const response = await callChatModel([
    { role: "system", content: "Extract structured data from conversations. Return only valid JSON." },
    { role: "user", content: extractionPrompt },
  ]);

  try {
    const cleanJson = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleanJson) as Partial<StudentInfo>;
  } catch {
    console.error("Failed to parse student info:", response);
    return {};
  }
}

export function isReadyToGenerate(info: Partial<StudentInfo>): boolean {
  // MINIMUM REQUIREMENTS - very lenient for students
  // 1. Must have a name
  // 2. Must have some identity (college OR bio/tagline)
  // 3. Must have SOME content to show (skills OR projects OR achievements OR experience)
  
  const hasName = Boolean(info.name);
  const hasIdentity = Boolean(info.college || info.bio);
  const hasSkills = (info.skills?.length ?? 0) >= 1;
  const hasProjects = (info.projects?.length ?? 0) >= 1;
  const hasExperience = (info.internships?.length ?? 0) >= 1;
  const hasAchievements = (info.achievements?.length ?? 0) >= 1;
  const hasCodingProfiles = Boolean(info.leetcodeProfile || info.githubUsername);
  
  const hasContent = hasSkills || hasProjects || hasExperience || hasAchievements || hasCodingProfiles;
  
  return hasName && hasIdentity && hasContent;
}

/**
 * Extract structured student information from resume text using AI
 */
export async function extractInfoFromResume(
  resumeText: string
): Promise<Partial<StudentInfo>> {
  const extractionPrompt = `You are an expert resume parser. Your task is to extract ALL information from this resume.

**RESUME TEXT:**
${resumeText}

**IMPORTANT EXTRACTION RULES:**

1. **WORK EXPERIENCE (internships array):** This is the MOST important section. Look for:
   - "Work Experience", "Experience", "Professional Experience", "Employment History"
   - EVERY job entry MUST go into the "internships" array - this includes:
     * Full-time jobs (SDE, Senior SDE, etc.)
     * Internships
     * Contract/Freelance work
   - For each job, extract: company name, job title, dates, and key achievements
   
2. **PROJECTS:** Extract from dedicated "Projects" sections:
   - Personal/Side projects
   - Academic/College projects
   - Open source contributions
   - Do NOT duplicate work experience as projects
   
3. **SKILLS:** Extract ALL technical terms:
   - Programming languages (Python, Java, C++, Go, etc.)
   - Frameworks (React, Spring Boot, Django, etc.)
   - Databases (MySQL, MongoDB, Redis, etc.)
   - Cloud platforms (AWS, Azure, GCP)
   - Tools (Docker, Kubernetes, Git, etc.)

**Return ONLY this JSON structure:**
{
  "name": "Full name",
  "college": "University/College name",
  "branch": "Degree or field of study",
  "graduationYear": "Year",
  "skills": ["skill1", "skill2", "...all technical skills found"],
  "projects": [
    {
      "title": "Project name (from Projects section only)",
      "description": "Brief description",
      "techStack": ["technologies"],
      "link": "URL or null"
    }
  ],
  "internships": [
    {
      "company": "Company name",
      "role": "Job title (e.g. Senior SDE, SDE2, Intern)",
      "duration": "Month Year - Month Year",
      "description": "2-3 key achievements or responsibilities"
    }
  ],
  "achievements": ["certifications", "awards", "hackathon wins"],
  "socialLinks": {
    "github": "URL or null",
    "linkedin": "URL or null",
    "email": "email or null"
  }
}

**CRITICAL RULES:**
- The "internships" array MUST contain ALL work experience entries (full-time jobs, internships, etc.)
- If the resume has work experience at companies like Amazon, Adobe, Google, etc., those MUST appear in "internships"
- Do NOT leave "internships" empty if there is ANY work experience mentioned
- Parse EVERY job entry you find

Return ONLY valid JSON:`;

  const response = await callChatModel([
    { role: "system", content: "You are a precise resume parser. CRITICAL: ALL work experience (full-time jobs, internships, freelance) MUST go in the 'internships' array - never leave it empty if there's any employment history. Return only valid JSON, no markdown." },
    { role: "user", content: extractionPrompt },
  ]);

  try {
    const cleanJson = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleanJson) as Partial<StudentInfo>;
  } catch {
    console.error("Failed to parse resume info:", response);
    throw new Error("Failed to extract information from resume. Please try again.");
  }
}
