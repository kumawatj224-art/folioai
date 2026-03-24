/**
 * INFRASTRUCTURE LAYER - AI Service
 * 
 * Azure OpenAI integration for portfolio generation.
 * Aligned with FolioAI Product Document Phase 1.
 * 
 * The AI collects info through conversation, then generates
 * a complete self-contained HTML file with embedded CSS.
 */

import type { ChatMessage, StudentInfo, PortfolioTemplate } from "@/domain/entities/chat";

const AZURE_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT ?? "";
const AZURE_API_KEY = process.env.AZURE_OPENAI_API_KEY ?? "";
const DEPLOYMENT_NAME = process.env.AZURE_OPENAI_DEPLOYMENT_NAME ?? "gpt-4o";
const API_VERSION = process.env.AZURE_OPENAI_API_VERSION ?? "2024-10-21";

const CONVERSATION_SYSTEM_PROMPT = `You are FolioAI, a friendly AI assistant that helps Indian engineering students create professional portfolio websites for placement season.

Your goal is to collect information through natural conversation to build their portfolio. Be warm, encouraging, and make the process feel easy.

**Information to collect:**
1. Name and what they're studying (college, branch, graduation year)
2. Technical skills (programming languages, frameworks, tools)
3. Projects they've built (title, description, tech used, links if any)
4. Internships or work experience (company, role, what they did)
5. Achievements (hackathons, certifications, awards)
6. Social links (GitHub, LinkedIn, email for contact)

**Guidelines:**
- Start by greeting them and asking their name and what they're studying
- Ask one or two questions at a time — don't overwhelm
- When they mention a project, ask follow-up questions about it
- Be encouraging — "That's a great project!" "Nice skills!"
- After collecting enough info (at minimum: name, college, 2+ skills, 1+ project), ask if they're ready to generate their portfolio
- When they confirm, respond with: "Great! I'm generating your portfolio now. You'll see a live preview on the right."
- Keep responses under 100 words — be concise

Current information collected:
{{STUDENT_INFO}}`;

const HTML_GENERATION_PROMPT = `Generate a complete, production-ready portfolio website as a single HTML file with embedded CSS. The portfolio should be for an Indian engineering student applying for placements.

**Student Information:**
{{STUDENT_INFO}}

**Template Style:** {{TEMPLATE}}

**Requirements:**
1. Single self-contained HTML file with embedded CSS — NO external dependencies
2. Fully responsive design that works on mobile and desktop
3. Professional, clean aesthetic appropriate for tech recruiters
4. Sections: Hero with name/tagline, About, Skills, Projects, Experience (if any), Contact
5. Include smooth scroll navigation
6. Add subtle animations for polish
7. Use modern CSS (flexbox, grid, custom properties)

**Template Styles:**
- minimal-dark: Dark background, clean typography, minimal colors, developer-focused
- professional-light: Light background, corporate feel, structured layout
- colorful: Vibrant gradients, creative feel, eye-catching

Return ONLY the HTML code, no explanations. Start with <!DOCTYPE html> and end with </html>.`;

export async function isAIConfigured(): Promise<boolean> {
  return Boolean(
    AZURE_ENDPOINT && 
    AZURE_API_KEY && 
    !AZURE_ENDPOINT.includes("your-resource") &&
    !AZURE_API_KEY.includes("replace")
  );
}

async function callAzureOpenAI(
  messages: Array<{ role: string; content: string }>,
  stream: boolean = false
): Promise<string> {
  const url = `${AZURE_ENDPOINT}/openai/deployments/${DEPLOYMENT_NAME}/chat/completions?api-version=${API_VERSION}`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": AZURE_API_KEY,
    },
    body: JSON.stringify({
      messages,
      max_tokens: 4000,
      temperature: 0.7,
      stream,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Azure OpenAI error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? "";
}

export async function* streamAzureOpenAI(
  messages: Array<{ role: string; content: string }>
): AsyncGenerator<string, void, unknown> {
  const url = `${AZURE_ENDPOINT}/openai/deployments/${DEPLOYMENT_NAME}/chat/completions?api-version=${API_VERSION}`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": AZURE_API_KEY,
    },
    body: JSON.stringify({
      messages,
      max_tokens: 4000,
      temperature: 0.7,
      stream: true,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Azure OpenAI error: ${response.status} - ${error}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = line.slice(6);
        if (data === "[DONE]") return;
        
        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) yield content;
        } catch {
          // Skip malformed JSON
        }
      }
    }
  }
}

export async function generateChatResponse(
  messages: ChatMessage[],
  studentInfo: Partial<StudentInfo>,
  existingHtml?: string | null
): Promise<string> {
  let systemMessage = CONVERSATION_SYSTEM_PROMPT.replace(
    "{{STUDENT_INFO}}",
    JSON.stringify(studentInfo, null, 2)
  );

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

  return callAzureOpenAI(apiMessages);
}

export async function generatePortfolioHtml(
  studentInfo: StudentInfo,
  template: PortfolioTemplate,
  existingHtml?: string | null
): Promise<string> {
  let prompt = HTML_GENERATION_PROMPT
    .replace("{{STUDENT_INFO}}", JSON.stringify(studentInfo, null, 2))
    .replace("{{TEMPLATE}}", template);

  // Include existing HTML as reference if editing
  if (existingHtml) {
    prompt += `\n\n**Reference - Previous Portfolio:**
The user had an existing portfolio. Try to preserve their custom styling preferences and structure unless they asked for changes. Use this as a reference:\n\`\`\`html\n${existingHtml.substring(0, 6000)}${existingHtml.length > 6000 ? '\n... (truncated)' : ''}\n\`\`\``;
  }

  const response = await callAzureOpenAI([
    { role: "system", content: "You are a web developer that generates clean, production-ready HTML." },
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

  const response = await callAzureOpenAI([
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
  return Boolean(
    info.name &&
    info.college &&
    (info.skills?.length ?? 0) >= 2 &&
    (info.projects?.length ?? 0) >= 1
  );
}
