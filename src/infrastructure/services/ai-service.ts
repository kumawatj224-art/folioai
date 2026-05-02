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
import { getReferenceTemplate, TEMPLATE_STYLES } from "@/data/reference-templates";

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

const CONVERSATION_SYSTEM_PROMPT = `You are FolioAI, an expert portfolio website builder for Indian 
engineering students. You have two modes:

MODE 1 — CONVERSATION (collecting information)
MODE 2 — GENERATION (producing the final HTML portfolio)

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
   - Ask 2-3 questions together, never one at a time
   - Be warm, brief, encouraging

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONVERSATION FLOW (only if starting fresh)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Collect information in this exact order:

STEP 1 — Identity
"What's your full name, college, branch, and year?"

STEP 2 — Role + Bio  
"What kind of engineer are you? (full-stack, ML, Android, 
DevOps, etc.) And write one sentence about what you're 
building or learning right now — in your own words."

STEP 3 — Skills
"List your: programming languages / frameworks / tools 
(just list them, no need to explain)"

STEP 4 — Projects (repeat for each)
For each project get: name, what it does in 1-2 sentences, 
tech stack, any impact/numbers (users, accuracy, speed, etc.)
Ask: "Any numbers you can share? Users, accuracy %, speed 
improvement, etc. — even rough ones make it look much better."

STEP 5 — Experience
"Any internships or jobs? For each: company, role, duration, 
and one sentence about what you built or improved."
If none: "No worries — we'll focus on your projects."

STEP 6 — Stats + Links
"Optional but makes your portfolio stronger:
- CGPA
- GitHub username (I'll pull your stats)  
- LinkedIn URL
- Your email for the contact section"

STEP 7 — Done!
**DO NOT ask user to pick a template.** We auto-select a stunning design for them.

After collecting all info, say:
"Perfect! I've got everything. Click **Generate** and I'll create a stunning portfolio for you!"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONFIRMATION STEP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Before generating, summarise everything:
"Here's what I have. Does anything need changing?
Name: ...
College/Branch/Year: ...  
Role: ...
Projects: ...
Experience: ...
[Click Generate when ready / What needs changing?]"

**Do NOT mention template.** We pick automatically.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EDIT MODE / REGENERATION (VERY IMPORTANT)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

When user is EDITING/REGENERATING an existing portfolio:
- ALL existing data is preserved automatically
- DON'T ask to re-enter name, skills, experience, projects
- Just ask: "What would you like to change?"

**TEMPLATES ARE AUTO-SELECTED — DO NOT SHOW OPTIONS**

We automatically pick a beautiful design. Do NOT ask users to choose templates.

Common edit requests (handle directly):
- "Change design" → Say "Got it! Click **Regenerate** and I'll create a fresh new design for you!"
- "Make it creative" → Say "Sure! Click **Regenerate** for a creative new look!"
- "Add X" → Ask for details about X only
- "Remove projects" → Say "Got it, I'll skip the projects section"
- "Update bio" → Ask only for new bio

Example responses for edit mode:
- User: "Make it more creative" 
  → "Got it! Click **Regenerate** and I'll give you a fresh creative design!"

- User: "Different template"
  → "Sure! Click **Regenerate** for a completely new design!"

- User: "Add a project"
  → "What's the project name and description?"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESPONSE GUIDELINES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- Keep responses under 50 words
- When user declines something, just say "Got it!" and move on
- Don't repeat what user already said
- If data exists, say: "Using your existing info. Click **Regenerate** when ready!"
- For fresh start: "Ready! Click **Generate** when you're set."

Current information collected:
{{STUDENT_INFO}}`;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DYNAMIC HTML GENERATION PROMPT BUILDER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Analyzes student data to determine which sections to include
 */
function analyzeStudentData(studentInfo: Partial<StudentInfo>) {
  const hasExperience = (studentInfo.internships?.length ?? 0) > 0;
  const hasProjects = (studentInfo.projects?.length ?? 0) > 0;
  const hasAchievements = (studentInfo.achievements?.length ?? 0) > 0;
  const hasSkills = (studentInfo.skills?.length ?? 0) > 0;
  const hasCodingProfiles = Boolean(studentInfo.leetcodeProfile || studentInfo.githubUsername);
  const hasEducation = Boolean(studentInfo.college || studentInfo.branch || studentInfo.graduationYear);
  
  const projectCount = studentInfo.projects?.length ?? 0;
  const experienceCount = studentInfo.internships?.length ?? 0;
  
  // Determine user type
  const isExperienced = hasExperience && experienceCount >= 1;
  const isStudent = !isExperienced && hasEducation;
  
  return {
    hasExperience,
    hasProjects,
    hasAchievements,
    hasSkills,
    hasCodingProfiles,
    hasEducation,
    projectCount,
    experienceCount,
    isExperienced,
    isStudent,
  };
}

function selectProfileAwareTemplate(
  analysis: ReturnType<typeof analyzeStudentData>,
  studentInfo: Partial<StudentInfo>
): string {
  const skills = (studentInfo.skills || []).join(" ").toLowerCase();
  const internships = studentInfo.internships || [];
  const internshipText = internships
    .map((internship) => `${internship.company} ${internship.role} ${internship.description}`.toLowerCase())
    .join(" ");
  const projectsText = (studentInfo.projects || [])
    .map((project) => `${project.title} ${project.description} ${(project.techStack || []).join(" ")}`.toLowerCase())
    .join(" ");

  if (analysis.isExperienced) {
    if (/(azure|aws|ml|machine learning|ai|data|cloud|platform)/.test(`${skills} ${internshipText}`)) {
      return "enterprise-dark";
    }

    if (analysis.projectCount >= 3 || /(product|frontend|react|full.?stack)/.test(`${skills} ${projectsText}`)) {
      return "brutalist";
    }

    return "enterprise-dark";
  }

  if (/(android|ios|flutter|react native|mobile)/.test(`${skills} ${projectsText}`)) {
    return "gradient-dark";
  }

  if (/(full.?stack|react|next|node|frontend|backend)/.test(`${skills} ${projectsText}`)) {
    return "brutalist";
  }

  if (/(data|analytics|sql|python|power bi|tableau|machine learning|ai)/.test(`${skills} ${projectsText}`)) {
    return "enterprise-dark";
  }

  return analysis.projectCount <= 1 ? "enterprise-dark" : "gradient-dark";
}

/**
 * Builds dynamic sections instructions based on user data
 */
function buildDynamicSectionsPrompt(studentInfo: Partial<StudentInfo>, analysis: ReturnType<typeof analyzeStudentData>): string {
  const sections: string[] = [];
  
  // Always include these
  sections.push(`
**REQUIRED SECTIONS FOR THIS PORTFOLIO:**

1. ✅ LOADING SCREEN — Animated name reveal
2. ✅ NAVIGATION — Fixed nav with links to: ${[
    analysis.hasProjects ? '#projects' : null,
    '#skills',
    analysis.hasExperience ? '#experience' : null,
    analysis.isStudent ? '#education' : null,
    analysis.hasAchievements ? '#achievements' : null,
    '#contact'
  ].filter(Boolean).join(', ')}
3. ✅ HERO SECTION — ${analysis.isExperienced 
    ? 'Company cards sidebar with metrics' 
    : 'Education focus with stats (projects built, CGPA, etc.)'}
4. ✅ SKILLS TICKER — Infinite horizontal scroll marquee`);

  // Projects section
  if (analysis.hasProjects) {
    sections.push(`5. ✅ PROJECTS SECTION (id="projects") — ${analysis.projectCount} project(s) to display
   - Each project MUST include: title, description, tech stack
   - Show impact metrics prominently
   - ${analysis.isStudent ? 'Make this the MAIN section since student has limited experience' : 'Standard project cards'}`);
  } else {
    sections.push(`5. ⚠️ NO PROJECTS — Skip projects section (user didn't provide any)`);
  }

  // Experience section
  if (analysis.hasExperience) {
    sections.push(`6. ✅ EXPERIENCE SECTION (id="experience") — ${analysis.experienceCount} position(s) to display
   - 2-column layout: company/role/tech on left, bullet achievements on right
   - Use <strong> tags for metrics and key technologies
   - Colored accent dots for bullets`);
  } else {
    sections.push(`6. ⚠️ NO EXPERIENCE — Skip experience section, DO NOT include "Experience" in nav
   Instead, add EDUCATION section (id="education") with:
   - College name prominently displayed
   - Branch/degree
   - Graduation year
   - CGPA if provided`);
  }

  // Skills grid
  sections.push(`7. ✅ SKILLS GRID (id="skills") — Group by: Languages / Frameworks / Tools / Domains`);

  // Achievements
  if (analysis.hasAchievements || analysis.hasCodingProfiles) {
    sections.push(`8. ✅ ACHIEVEMENTS SECTION (id="achievements")
   ${analysis.hasAchievements ? `- Awards/certifications: ${studentInfo.achievements?.slice(0, 3).join(', ')}` : ''}
   ${analysis.hasCodingProfiles ? `- Coding profiles: ${studentInfo.leetcodeProfile ? 'LeetCode' : ''} ${studentInfo.githubUsername ? 'GitHub' : ''}` : ''}`);
  } else {
    sections.push(`8. ⚠️ NO ACHIEVEMENTS — Skip achievements section`);
  }

  // Contact (always)
  sections.push(`9. ✅ CONTACT SECTION (id="contact") — Warm, specific copy with email/social links
10. ✅ FOOTER — Include "Built with FolioAI" credit`);

  return sections.join('\n');
}

/**
 * Builds the complete generation prompt dynamically based on student data
 * Selects a profile-aware reference template for consistency
 */
function buildGenerationPrompt(studentInfo: Partial<StudentInfo>, template: PortfolioTemplate): string {
  const analysis = analyzeStudentData(studentInfo);

  const requestedTemplate = template !== "minimal-warm" ? template : null;
  const selectedTemplate = requestedTemplate ?? selectProfileAwareTemplate(analysis, studentInfo);
  const referenceTemplate = getReferenceTemplate(selectedTemplate);
  const templateStyle = TEMPLATE_STYLES[selectedTemplate] || TEMPLATE_STYLES['enterprise-dark'];

  console.log(`[Reference Template] Selected: ${selectedTemplate} (requested: ${template ?? "none"})`);
  
  return `Generate a complete, production-ready portfolio website as a single HTML file.

**USER DATA:**
\`\`\`json
${JSON.stringify(studentInfo, null, 2)}
\`\`\`

**PROFILE TYPE:** ${analysis.isExperienced ? '👔 EXPERIENCED PROFESSIONAL' : '🎓 STUDENT/FRESHER'}
**SELECTED TEMPLATE:** ${selectedTemplate} (profile-aware selection)
**STYLE:** ${templateStyle.description}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TEMPLATE SPECIFICATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Fonts:** ${templateStyle.fonts}
**Colors:** ${templateStyle.colors}
**Hero Style:** ${templateStyle.heroStyle}
**Project Style:** ${templateStyle.projectStyle}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REFERENCE TEMPLATE STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Use this proven HTML/CSS structure as reference:
${referenceTemplate}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTIONS TO GENERATE (DATA-DRIVEN)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${buildDynamicSectionsPrompt(studentInfo, analysis)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${analysis.isExperienced ? 'EXPERIENCED PROFESSIONAL GUIDELINES' : 'STUDENT/FRESHER GUIDELINES'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${analysis.isExperienced ? `
**HERO LAYOUT:**
- Left: Name (large serif), current role, company, brief intro
- Right: Company cards with colored dots (current company highlighted)
- Stats: Years of experience, impact metrics from resume

**SECTION ORDER:**
1. Hero with company cards
2. Skills ticker
3. Experience (PROMINENT)
4. Projects
5. Skills grid
6. Achievements
7. Contact

**EXPERIENCE SECTION FORMAT:**
For each position create a 2-column card:
- LEFT: Company name, role, period, tech chips
- RIGHT: 3-5 bullet achievements with <strong> emphasis
` : `
**HERO LAYOUT:**
- Left: Name, "Aspiring [Role]" or "[Year] Year [Branch] Student"
- Right: Education card OR featured project preview OR stats
- Stats: Projects built, CGPA, problems solved, etc.

**SECTION ORDER:**
1. Hero with education focus
2. Skills ticker  
3. Projects (MAKE THIS PROMINENT - it's the main content)
4. Skills grid
5. Education section
6. Achievements (if any)
7. Contact

**EDUCATION SECTION FORMAT:**
- College name (large, prominent)
- Branch/degree and graduation year
- CGPA if provided
- Any relevant coursework or specializations
`}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TECHNICAL REQUIREMENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- Single HTML file with ALL CSS in <style> tag
- ALL JavaScript in <script> tag before </body>
- Google Fonts links allowed and REQUIRED for specified fonts
- NO external CSS frameworks (Tailwind, Bootstrap)
- Fully responsive with @media breakpoints
- Include loading animation (fade out after 0.8s)
- Add intersection observer for scroll animations
- html { scroll-behavior: smooth }

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FACTUAL ANCHORING - MANDATORY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- Every visible number, date, metric, employer, and achievement claim in the final portfolio must be grounded in USER DATA.
- If the user did not mention a fact, do not invent it.
- You may rewrite tone and phrasing professionally, but you may not upgrade scope or seniority.
- Do not turn rough or partial input into inflated claims like production ownership, scale, revenue impact, recruiter interest, or team leadership unless explicitly present.
- If a profile has limited data, stay specific and minimal rather than filling gaps with generic achievements.
- Keep project descriptions and experience descriptions literal to the provided evidence.
- Avoid filler claims such as "passionate developer", "tech enthusiast", "results-driven", or other resume cliches.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRITICAL RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ DO:
- Use the EXACT data provided (name, projects, skills, experience)
- Follow the template's font and color specifications exactly
- Include section markers: <!-- SECTION: NAME --> and <!-- END: NAME -->
- Make the bio personal using user's own words
- Display ALL quantified achievements prominently
- Add "Built with FolioAI" in footer

❌ DON'T:
- Invent fake data (projects, experience, skills not mentioned)
- Use generic phrases ("passionate developer", "tech enthusiast")
- Include sections that have no data (e.g., Experience if internships is empty)
- Use fonts/colors outside the template specification
- Include dashboard/editor/product UI inside the portfolio HTML
- Include controls or text such as "Upload Resume", "Generate Portfolio", "Regenerate", "Save Draft", "Save Changes", "Deploy", "Message FolioAI", or any admin/editor CTA
- Add placeholder upload boxes, file-upload widgets, dashboard cards, or app shell UI to any section
- Generate fewer than 8000 tokens of HTML

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT FORMAT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Output ONLY the complete HTML file starting with:
<!DOCTYPE html>

Do NOT add any explanation before or after the HTML.
The HTML must be complete and immediately renderable in a browser.

End with:
<!-- FOLIO_GENERATION_COMPLETE -->
`;
}

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
- "Change design/template" → Say "Got it! Click **Regenerate** for a new design!"
- "Make it creative" → Say "Sure! Click **Regenerate** for a creative look!"
- "Add something" → Ask only for that specific item
- "Update X" → Help them update just X

**DO NOT show template options. Designs are auto-selected.**

After they specify changes, say: "Got it! Click **Regenerate** to apply the changes."

Their current data (DO NOT RE-ASK FOR THIS):
${JSON.stringify(studentInfo, null, 2)}`;
  }

  const apiMessages = [
    { role: "system", content: systemMessage },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  return callChatModel(apiMessages);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SMART SECTION-BASED EDITING SYSTEM
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Portfolio sections that can be independently edited
 */
type PortfolioSection = 
  | "hero"
  | "skills"
  | "projects"
  | "experience"
  | "education"
  | "achievements"
  | "contact"
  | "navigation"
  | "footer"
  | "styles";

/**
 * Edit intent classification
 */
type EditIntent = {
  type: "add_section" | "modify_section" | "remove_section" | "style_change" | "content_update" | "full_regenerate";
  sections: PortfolioSection[];
  description: string;
  requiresFullRegenerate: boolean;
};

/**
 * Section markers for HTML parsing
 */
const SECTION_MARKERS: Record<PortfolioSection, { start: RegExp; end: RegExp }> = {
  hero: { 
    start: /<!--\s*SECTION:\s*HERO\s*-->|<section[^>]*id=["']?hero["']?[^>]*>|<header[^>]*class=["'][^"']*hero[^"']*["'][^>]*>/i,
    end: /<!--\s*END:\s*HERO\s*-->|<\/section>|<\/header>/i
  },
  skills: {
    start: /<!--\s*SECTION:\s*SKILLS\s*-->|<section[^>]*id=["']?skills["']?[^>]*>/i,
    end: /<!--\s*END:\s*SKILLS\s*-->|(?=<section[^>]*id=["']?(?!skills))/i
  },
  projects: {
    start: /<!--\s*SECTION:\s*PROJECTS\s*-->|<section[^>]*id=["']?projects["']?[^>]*>/i,
    end: /<!--\s*END:\s*PROJECTS\s*-->|(?=<section[^>]*id=["']?(?!projects))/i
  },
  experience: {
    start: /<!--\s*SECTION:\s*EXPERIENCE\s*-->|<section[^>]*id=["']?experience["']?[^>]*>/i,
    end: /<!--\s*END:\s*EXPERIENCE\s*-->|(?=<section[^>]*id=["']?(?!experience))/i
  },
  education: {
    start: /<!--\s*SECTION:\s*EDUCATION\s*-->|<section[^>]*id=["']?education["']?[^>]*>/i,
    end: /<!--\s*END:\s*EDUCATION\s*-->|(?=<section[^>]*id=["']?(?!education))/i
  },
  achievements: {
    start: /<!--\s*SECTION:\s*ACHIEVEMENTS\s*-->|<section[^>]*id=["']?achievements["']?[^>]*>/i,
    end: /<!--\s*END:\s*ACHIEVEMENTS\s*-->|(?=<section[^>]*id=["']?(?!achievements))/i
  },
  contact: {
    start: /<!--\s*SECTION:\s*CONTACT\s*-->|<section[^>]*id=["']?contact["']?[^>]*>/i,
    end: /<!--\s*END:\s*CONTACT\s*-->|(?=<section[^>]*id=["']?(?!contact))|<\/section>\s*(?=<footer)/i
  },
  navigation: {
    start: /<!--\s*SECTION:\s*NAV\s*-->|<nav[^>]*>/i,
    end: /<!--\s*END:\s*NAV\s*-->|<\/nav>/i
  },
  footer: {
    start: /<!--\s*SECTION:\s*FOOTER\s*-->|<footer[^>]*>/i,
    end: /<!--\s*END:\s*FOOTER\s*-->|<\/footer>/i
  },
  styles: {
    start: /<style[^>]*>/i,
    end: /<\/style>/i
  }
};

/**
 * Analyze user's edit request to determine what needs to change
 */
async function analyzeEditIntent(
  userMessage: string,
  existingHtml: string
): Promise<EditIntent> {
  const analysisPrompt = `Analyze this edit request and classify what changes are needed.

**User's request:** "${userMessage}"

**Available sections in the portfolio:**
- hero (name, title, intro, profile picture area)
- skills (skill tags, categories, skill bars)
- projects (project cards with descriptions)
- experience (work experience, internships)
- education (college info, degrees)
- achievements (awards, certifications)
- contact (contact form, email, social links)
- navigation (top nav bar, menu items)
- footer (copyright, bottom links)
- styles (colors, fonts, spacing, overall theme)

**Classify the edit into ONE of these types:**
- "add_section": User wants to add a new section or element
- "modify_section": User wants to change existing content in a section
- "remove_section": User wants to delete a section
- "style_change": User only wants visual changes (colors, fonts, spacing)
- "content_update": User wants to update specific text/data (not structure)
- "full_regenerate": Major changes requiring complete regeneration (template change, layout overhaul)

**Return ONLY this JSON:**
{
  "type": "add_section|modify_section|remove_section|style_change|content_update|full_regenerate",
  "sections": ["affected_section1", "affected_section2"],
  "description": "Brief description of what user wants",
  "requiresFullRegenerate": false
}

**Examples:**
- "Add a contact form" → {"type": "add_section", "sections": ["contact"], "description": "Add contact form to contact section", "requiresFullRegenerate": false}
- "Make it more colorful" → {"type": "style_change", "sections": ["styles"], "description": "Update color scheme to be more vibrant", "requiresFullRegenerate": false}
- "Change my name to John" → {"type": "content_update", "sections": ["hero"], "description": "Update name in hero section", "requiresFullRegenerate": false}
- "Add a testimonials section" → {"type": "add_section", "sections": ["testimonials"], "description": "Add new testimonials section", "requiresFullRegenerate": true}
- "Use a completely different template" → {"type": "full_regenerate", "sections": [], "description": "Complete template change", "requiresFullRegenerate": true}
- "Add more projects" → {"type": "modify_section", "sections": ["projects"], "description": "Add more project cards", "requiresFullRegenerate": false}`;

  const response = await callChatModel([
    { role: "system", content: "You are an expert at analyzing edit requests for portfolio websites. Return only valid JSON." },
    { role: "user", content: analysisPrompt }
  ]);

  try {
    const cleanJson = response.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const intent = JSON.parse(cleanJson) as EditIntent;
    
    // Force full regenerate for certain cases
    if (intent.sections.some(s => !Object.keys(SECTION_MARKERS).includes(s))) {
      intent.requiresFullRegenerate = true;
    }
    
    return intent;
  } catch {
    console.warn("[AI] Failed to parse edit intent, defaulting to full regenerate");
    return {
      type: "full_regenerate",
      sections: [],
      description: userMessage,
      requiresFullRegenerate: true
    };
  }
}

/**
 * Extract a specific section from HTML
 */
function extractSection(html: string, section: PortfolioSection): string | null {
  // First try comment-based markers (most reliable)
  const commentStart = new RegExp(`<!--\\s*SECTION:\\s*${section.toUpperCase()}\\s*-->`);
  const commentEnd = new RegExp(`<!--\\s*END:\\s*${section.toUpperCase()}\\s*-->`);
  
  const startMatch = html.match(commentStart);
  const endMatch = html.match(commentEnd);
  
  if (startMatch && endMatch && startMatch.index !== undefined && endMatch.index !== undefined) {
    return html.substring(startMatch.index, endMatch.index + endMatch[0].length);
  }
  
  // Fallback: Try to find section by id attribute
  const idPattern = new RegExp(`<section[^>]*id=["']${section}["'][^>]*>`, 'i');
  const idMatch = html.match(idPattern);
  
  if (idMatch && idMatch.index !== undefined) {
    // Find the closing </section> tag
    let depth = 1;
    let pos = idMatch.index + idMatch[0].length;
    while (depth > 0 && pos < html.length) {
      const nextOpen = html.indexOf('<section', pos);
      const nextClose = html.indexOf('</section>', pos);
      
      if (nextClose === -1) break;
      
      if (nextOpen !== -1 && nextOpen < nextClose) {
        depth++;
        pos = nextOpen + 8;
      } else {
        depth--;
        if (depth === 0) {
          return html.substring(idMatch.index, nextClose + 10);
        }
        pos = nextClose + 10;
      }
    }
  }
  
  return null;
}

/**
 * Generate only a specific section
 */
async function generateSection(
  section: PortfolioSection,
  studentInfo: StudentInfo,
  existingHtml: string,
  editDescription: string,
  existingSection: string | null
): Promise<string> {
  const sectionPrompt = `Generate ONLY the ${section.toUpperCase()} section for a portfolio.

**User's request:** ${editDescription}

**Student Info:**
${JSON.stringify(studentInfo, null, 2)}

**Current HTML structure (for style reference):**
\`\`\`html
${existingHtml.substring(0, 3000)}
\`\`\`

${existingSection ? `**Current ${section} section to modify:**
\`\`\`html
${existingSection}
\`\`\`` : `**Note:** This is a NEW section. Match the existing design style.`}

**RULES:**
1. Return ONLY the section HTML, nothing else
2. Match the existing design's colors, fonts, and spacing
3. Use the same CSS class naming conventions
4. Include section markers: <!-- SECTION: ${section.toUpperCase()} --> and <!-- END: ${section.toUpperCase()} -->
5. Do NOT include <style> or <script> tags
6. Ensure the section has the proper id attribute (id="${section}")

**Return the HTML for the ${section} section:**`;

  const response = await callGenerationModel([
    { role: "system", content: `You are an expert web developer. Generate ONLY the requested HTML section, nothing more. Match the existing design style exactly.` },
    { role: "user", content: sectionPrompt }
  ]);

  return response
    .replace(/```html\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();
}

/**
 * Generate only style/CSS changes
 */
async function generateStyleUpdate(
  existingHtml: string,
  styleDescription: string
): Promise<string> {
  // Extract existing styles
  const styleMatch = existingHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  const existingStyles = styleMatch ? styleMatch[1] : "";

  const stylePrompt = `Update the CSS styles for a portfolio based on this request.

**User's request:** ${styleDescription}

**Current CSS:**
\`\`\`css
${existingStyles.substring(0, 4000)}
\`\`\`

**RULES:**
1. Return ONLY the updated CSS content (what goes inside <style> tags)
2. Preserve all existing functionality (animations, responsive rules, etc.)
3. Only change what the user requested (colors, fonts, spacing, etc.)
4. Keep all class names the same
5. Do NOT include <style> tags in your response

**Return the updated CSS:**`;

  const response = await callChatModel([
    { role: "system", content: "You are a CSS expert. Return ONLY CSS code, no explanations." },
    { role: "user", content: stylePrompt }
  ]);

  return response
    .replace(/```css\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();
}

/**
 * Merge a new/updated section into existing HTML
 */
function mergeSection(
  existingHtml: string,
  section: PortfolioSection,
  newSectionHtml: string,
  operation: "add" | "modify" | "remove"
): string {
  const existingSection = extractSection(existingHtml, section);
  
  if (operation === "remove") {
    if (existingSection) {
      return existingHtml.replace(existingSection, "");
    }
    return existingHtml;
  }
  
  if (operation === "modify" && existingSection) {
    // Replace existing section
    return existingHtml.replace(existingSection, newSectionHtml);
  }
  
  if (operation === "add") {
    // Find the right place to insert
    // Order: hero -> skills -> projects -> experience -> education -> achievements -> contact -> footer
    const sectionOrder: PortfolioSection[] = ["hero", "skills", "projects", "experience", "education", "achievements", "contact", "footer"];
    const targetIndex = sectionOrder.indexOf(section);
    
    // Find the section that should come after
    for (let i = targetIndex + 1; i < sectionOrder.length; i++) {
      const nextSection = extractSection(existingHtml, sectionOrder[i]);
      if (nextSection) {
        const insertPos = existingHtml.indexOf(nextSection);
        return existingHtml.substring(0, insertPos) + newSectionHtml + "\n\n" + existingHtml.substring(insertPos);
      }
    }
    
    // No section after, insert before </main> or </body>
    const mainClose = existingHtml.indexOf("</main>");
    if (mainClose !== -1) {
      return existingHtml.substring(0, mainClose) + newSectionHtml + "\n" + existingHtml.substring(mainClose);
    }
    
    const bodyClose = existingHtml.indexOf("</body>");
    if (bodyClose !== -1) {
      return existingHtml.substring(0, bodyClose) + newSectionHtml + "\n" + existingHtml.substring(bodyClose);
    }
  }
  
  // Fallback: If we can't figure out where to put it, just add it
  if (existingSection) {
    return existingHtml.replace(existingSection, newSectionHtml);
  }
  
  return existingHtml;
}

/**
 * Merge style updates into existing HTML
 */
function mergeStyles(existingHtml: string, newStyles: string): string {
  const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/i;
  const match = existingHtml.match(styleRegex);
  
  if (match) {
    return existingHtml.replace(styleRegex, `<style>\n${newStyles}\n</style>`);
  }
  
  // No existing style tag, add one in <head>
  const headClose = existingHtml.indexOf("</head>");
  if (headClose !== -1) {
    return existingHtml.substring(0, headClose) + `<style>\n${newStyles}\n</style>\n` + existingHtml.substring(headClose);
  }
  
  return existingHtml;
}

/**
 * Smart portfolio editing - only regenerates what's needed
 */
export async function smartEditPortfolio(
  existingHtml: string,
  studentInfo: StudentInfo,
  chatMessages: ChatMessage[]
): Promise<{ html: string; editType: string; sectionsModified: string[] }> {
  // Get the last user message to understand what they want
  const lastUserMessage = [...chatMessages].reverse().find(m => m.role === "user")?.content ?? "";
  
  if (!lastUserMessage) {
    return { html: existingHtml, editType: "none", sectionsModified: [] };
  }
  
  console.log(`[Smart Edit] Analyzing request: "${lastUserMessage.substring(0, 100)}..."`);
  
  // Analyze what the user wants
  const intent = await analyzeEditIntent(lastUserMessage, existingHtml);
  console.log(`[Smart Edit] Intent: ${intent.type}, sections: [${intent.sections.join(", ")}], fullRegen: ${intent.requiresFullRegenerate}`);
  
  // If full regeneration is needed, return null to signal caller to use full generation
  if (intent.requiresFullRegenerate) {
    console.log(`[Smart Edit] Requiring full regeneration`);
    return { html: "", editType: "full_regenerate", sectionsModified: [] };
  }
  
  let updatedHtml = existingHtml;
  const sectionsModified: string[] = [];
  
  // Handle style changes
  if (intent.type === "style_change") {
    console.log(`[Smart Edit] Generating style update`);
    const newStyles = await generateStyleUpdate(existingHtml, intent.description);
    updatedHtml = mergeStyles(updatedHtml, newStyles);
    sectionsModified.push("styles");
    return { html: updatedHtml, editType: intent.type, sectionsModified };
  }
  
  // Handle section changes
  for (const section of intent.sections as PortfolioSection[]) {
    if (!Object.keys(SECTION_MARKERS).includes(section)) {
      console.log(`[Smart Edit] Unknown section "${section}", skipping`);
      continue;
    }
    
    const existingSection = extractSection(existingHtml, section);
    
    if (intent.type === "remove_section") {
      console.log(`[Smart Edit] Removing section: ${section}`);
      updatedHtml = mergeSection(updatedHtml, section, "", "remove");
      sectionsModified.push(section);
    } else {
      console.log(`[Smart Edit] Generating section: ${section}`);
      const newSection = await generateSection(
        section,
        studentInfo,
        existingHtml,
        intent.description,
        existingSection
      );
      
      const operation = existingSection ? "modify" : "add";
      updatedHtml = mergeSection(updatedHtml, section, newSection, operation);
      sectionsModified.push(section);
    }
  }
  
  return { html: updatedHtml, editType: intent.type, sectionsModified };
}

export async function generatePortfolioHtml(
  studentInfo: StudentInfo,
  template: PortfolioTemplate,
  existingHtml?: string | null,
  chatMessages?: ChatMessage[]
): Promise<string> {
  // If editing existing portfolio, try smart edit first
  if (existingHtml && chatMessages && chatMessages.length > 0) {
    const smartResult = await smartEditPortfolio(existingHtml, studentInfo as StudentInfo, chatMessages);
    
    // If smart edit succeeded (didn't require full regeneration)
    if (smartResult.html && smartResult.editType !== "full_regenerate") {
      console.log(`[AI] Smart edit successful: ${smartResult.editType}, modified: [${smartResult.sectionsModified.join(", ")}]`);
      return smartResult.html;
    }
    
    console.log(`[AI] Smart edit requires full regeneration, proceeding with full generation`);
  }
  
  // Full generation (new portfolio or smart edit requested full regen)
  // Use dynamic prompt that conditionally includes sections based on user data
  let prompt = buildGenerationPrompt(studentInfo, template);

  // Include existing HTML as reference if editing
  if (existingHtml) {
    prompt += `\n\n**EDITING MODE - Reference Portfolio:**
The user is editing their existing portfolio. Apply the changes they requested in the conversation while preserving the overall structure and styling. Here's their current portfolio:\n\`\`\`html\n${existingHtml.substring(0, 6000)}${existingHtml.length > 6000 ? '\n... (truncated)' : ''}\n\`\`\``;

    prompt += `\n\n**STRICT EDITING CONSTRAINTS:**
- Remove any accidental dashboard/editor/app UI if it appears in the reference HTML
- The final portfolio must NOT contain upload prompts, resume buttons, chat controls, generation buttons, deploy buttons, or app navigation
- If you see text like "Upload Resume" in the reference HTML, treat it as contamination and remove it from the final output`;
    
    // Add conversation context to understand what changes were requested
    if (chatMessages && chatMessages.length > 0) {
      const recentMessages = chatMessages.slice(-10); // Last 10 messages for context
      const conversation = recentMessages
        .map(m => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
        .join("\n");
      prompt += `\n\n**Conversation about changes:**\n${conversation}`;
    }
    
    // Add section markers instruction for future edits
    prompt += `\n\n**IMPORTANT: Add section markers for future editing:**
Wrap each section with HTML comments for easy identification:
<!-- SECTION: HERO -->
... hero content ...
<!-- END: HERO -->

<!-- SECTION: SKILLS -->
... skills content ...
<!-- END: SKILLS -->

Use these markers: HERO, SKILLS, PROJECTS, EXPERIENCE, EDUCATION, ACHIEVEMENTS, CONTACT, FOOTER`;
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
