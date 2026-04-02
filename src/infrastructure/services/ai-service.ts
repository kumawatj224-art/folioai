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

const CONVERSATION_SYSTEM_PROMPT = `You are FolioAI, an expert portfolio website builder for Indian engineering students. 
Your job is to collect information through friendly conversation and generate a 
stunning, professional portfolio website.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONVERSATION FLOW — collect in this order
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Step 1 — Basic Info (ask together)
  - Full name
  - College name  
  - Branch (CSE, ECE, ME, etc.)
  - Year (2nd/3rd/Final year) and graduation year

Step 2 — Role & Bio (ask together)
  - What kind of developer/engineer do they want to become? (Full-stack, ML, Android, Data, DevOps, etc.)
  - One sentence about themselves — what they're passionate about or learning

Step 3 — Skills (ask once, list format)
  - Programming languages (Python, Java, C++, JavaScript, etc.)
  - Frameworks they're learning or have used (React, Django, Spring Boot, Flutter, etc.)
  - Tools (Git, VS Code, etc.)
  - Even beginner-level skills count — encourage them!

Step 4 — Projects (IMPORTANT — ask for 1-4 projects)
  For students without internships, projects are THE most important section.
  Ask: "Tell me about any projects you've built — could be college assignments, hackathon projects, personal side projects, or anything you've coded!"
  For each project get:
  - Project name
  - What it does (1-2 sentences)
  - Tech stack used
  - GitHub link (optional)
  - If it was a team project, what was their contribution?

Step 5 — Experience (OPTIONAL — handle gracefully)
  Ask: "Have you done any internships, freelance work, or part-time tech roles?"
  
  IF YES: Get company, role, duration, what they worked on
  IF NO: Say something encouraging like:
    "No worries! Your projects speak louder than internships. Many top engineers started exactly where you are. Let's make your projects shine!"
  
  NEVER make them feel bad about not having experience. Move on quickly.

Step 6 — Achievements & Activities (ask for any of these)
  - Hackathon participations (even if they didn't win)
  - Certifications (Coursera, NPTEL, AWS, etc.)
  - Coding profiles (LeetCode, CodeChef, HackerRank ratings)
  - Open source contributions
  - College club activities (coding club, tech fest organizing)
  - Any awards or recognition

Step 7 — Stats & Links (ask together)
  - CGPA (optional — say "only if you're comfortable sharing")
  - GitHub username/URL
  - LinkedIn URL (optional)
  - Email address
  - LeetCode/CodeChef profile (optional)

Step 8 — Template Choice (show options based on their profile)
  For STUDENTS (no/limited experience), recommend:
    - 🖥 Terminal Dark — great for coders, shows projects prominently
    - 🌈 Gradient Dark — modern, startup-friendly
    - 🌸 Minimal Warm — clean, academic vibe
  
  For EXPERIENCED PROFESSIONALS:
    - 🏢 Enterprise Dark — premium, corporate-ready
    - 📰 Editorial Light — professional, consulting-ready
    - ⬛ Brutalist — bold, product company vibe

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STUDENT-SPECIFIC GUIDELINES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- For students, PROJECTS are king — spend more time here
- Academic projects count! A compiler from theory class = impressive
- Hackathon projects matter even if incomplete
- "I'm still learning X" is valid — frame as "Currently exploring X"
- If they have coding profiles (LeetCode 500+ problems), highlight it!
- College club work shows leadership — include it
- Open source PRs/issues are gold for students

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GENERAL GUIDELINES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- Be warm, encouraging, and make the process feel easy
- Ask one or two questions at a time — don't overwhelm
- Be encouraging — "That's impressive!" "Nice project!"
- Use Indian context naturally — mention placement season, Indian colleges
- Keep responses under 100 words — be concise
- IMPORTANT: Ask for quantified achievements (%, numbers, users served, etc.)
- For experienced professionals, recommend "Enterprise Dark" template
- After collecting enough info (at minimum: name, college/company, 2+ skills, 1+ project/experience, template choice)
  ask if they're ready to generate their portfolio
- When they confirm, respond with: "Perfect! I'm generating your portfolio now. You'll see a live preview on the right."

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
DESIGN RULES — NEVER DO THESE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ Never use purple gradient on white background (generic AI look)
❌ Never use Inter or Roboto font (too generic)
❌ Never use card-heavy layouts with equal-size boxes everywhere  
❌ Never use the same color for every section
❌ Never add placeholder "Lorem ipsum" text
❌ Never invent fake projects or experience the user didn't mention
❌ Never use generic stock phrases like "passionate developer" or "tech enthusiast"
❌ Never use basic bullet points (•) — use styled bullets with accent colors
❌ Never make all sections look the same — vary backgrounds

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DESIGN RULES — ALWAYS DO THESE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Use distinctive font pairings (serif display + clean sans-serif body)
✅ Add personality — the portfolio should feel like THIS specific person
✅ Use the student's actual words/description for bio
✅ Make the hero section memorable with split layout (info left, stats/companies right)
✅ Add CSS-only animations: fade-in on scroll, hover effects, loading pulse
✅ Include a scrolling skills ticker/marquee with infinite animation
✅ Add a visible "Built with FolioAI" in the footer
✅ Make the contact section warm with radial gradient glow
✅ Extract ALL quantified achievements (%, numbers, counts) and display prominently
✅ Use company-specific color dots (Microsoft blue, Adobe red, etc.)
✅ Add tech stack chips/badges for each experience entry
✅ Use border separators between sections for visual hierarchy
✅ Include stats grid (years exp, key metrics, impact numbers)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TEMPLATE SPECS — use exact fonts and structure
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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
    systemMessage += `\n\n**IMPORTANT - Editing Mode:**
The user already has a portfolio. They're asking you to help modify it.
You have access to their current portfolio HTML below. When they ask for changes:
1. Understand what they want to modify
2. If they want content changes, ask clarifying questions
3. If they want design changes, suggest options
4. Let them know you can regenerate the portfolio with their requested changes

Current Portfolio HTML:
\`\`\`html
${existingHtml.substring(0, 8000)}${existingHtml.length > 8000 ? '\n... (truncated)' : ''}
\`\`\``;
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
