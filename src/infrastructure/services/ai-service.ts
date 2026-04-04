/**
 * INFRASTRUCTURE LAYER - AI Service
 * 
 * Multi-provider AI integration for portfolio generation.
 * Supports: Gemini, Azure OpenAI, OpenAI
 * 
 * Aligned with FolioAI Product Document Phase 1.
 * The AI collects info through conversation, then generates
 * a complete self-contained HTML file with embedded CSS.
 */

import type { ChatMessage, StudentInfo, PortfolioTemplate } from "@/domain/entities/chat";

// Provider detection
const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? "";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? "";
const AZURE_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT ?? "";
const AZURE_API_KEY = process.env.AZURE_OPENAI_API_KEY ?? "";
const DEPLOYMENT_NAME = process.env.AZURE_OPENAI_DEPLOYMENT_NAME ?? "gpt-4o";
const API_VERSION = process.env.AZURE_OPENAI_API_VERSION ?? "2024-10-21";

type AIProvider = "gemini" | "azure" | "openai" | null;

function detectProvider(): AIProvider {
  // Priority: Gemini > OpenAI > Azure
  if (GEMINI_API_KEY && !GEMINI_API_KEY.includes("replace")) return "gemini";
  if (OPENAI_API_KEY && !OPENAI_API_KEY.includes("replace")) return "openai";
  if (AZURE_API_KEY && !AZURE_API_KEY.includes("replace")) return "azure";
  return null;
}

/**
 * List available Gemini models (for debugging)
 */
async function listGeminiModels(): Promise<string[]> {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    
    const models = data.models?.map((m: any) => m.name) || [];
    console.log("✅ Available Gemini models:", models);
    return models;
  } catch (error) {
    console.error("❌ Failed to list models:", error);
    return [];
  }
}

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
  const provider = detectProvider();
  if (!provider) {
    console.warn("⚠️ No AI provider configured. Add GEMINI_API_KEY, OPENAI_API_KEY, or AZURE_OPENAI_API_KEY to .env.local");
    return false;
  }
  console.log(`✅ AI Provider detected: ${provider.toUpperCase()}`);
  return true;
}

/**
 * Call any configured AI provider
 */
async function callAIProvider(
  messages: Array<{ role: string; content: string }>,
  stream: boolean = false
): Promise<string> {
  const provider = detectProvider();
  
  if (!provider) {
    throw new Error("No AI provider configured. Add GEMINI_API_KEY, OPENAI_API_KEY, or AZURE_OPENAI_API_KEY");
  }

  if (provider === "gemini") {
    return callGemini(messages, stream);
  } else if (provider === "openai") {
    return callOpenAI(messages, stream);
  } else if (provider === "azure") {
    return callAzureOpenAI(messages, stream);
  }

  throw new Error(`Unknown provider: ${provider}`);
}

/**
 * Gemini API (Google)
 */
async function callGemini(
  messages: Array<{ role: string; content: string }>,
  stream: boolean = false
): Promise<string> {
  // Use the best available models for your API key
  // These are verified to work from your API response
  const modelsToTry = [
    "gemini-2.5-pro",        // Premium model - best for complex tasks
    "gemini-2.5-flash",      // Fast and capable - best balance
    "gemini-2.0-flash-001",  // Stable version
    "gemini-2.0-flash",      // Latest 2.0
  ];

  console.log(`📋 Trying Gemini models: ${modelsToTry.join(", ")}`);

  let lastError: Error | null = null;

  for (const model of modelsToTry) {
    try {
      return await attemptGeminiCall(model, messages);
    } catch (error) {
      lastError = error as Error;
      console.warn(`⚠️ Model ${model} failed: ${(error as Error).message}`);
      continue;
    }
  }

  throw lastError || new Error("All Gemini models failed");
}

async function attemptGeminiCall(
  model: string,
  messages: Array<{ role: string; content: string }>
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

  // Convert OpenAI format to Gemini format
  const geminiContents = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

  const body = {
    contents: geminiContents,
    generationConfig: {
      maxOutputTokens: 4000,
      temperature: 0.7,
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`${model}: ${response.status} - ${error}`);
  }

  const data = await response.json();
  
  // Check for API errors in response
  if (data.error) {
    throw new Error(`${model}: ${data.error.message}`);
  }

  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!content) {
    throw new Error(`No response from ${model}`);
  }

  console.log(`✅ Successfully used Gemini model: ${model}`);
  return content;
}

/**
 * OpenAI API (OpenAI direct)
 */
async function callOpenAI(
  messages: Array<{ role: string; content: string }>,
  stream: boolean = false
): Promise<string> {
  const url = "https://api.openai.com/v1/chat/completions";

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages,
      max_tokens: 4000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? "";
}

/**
 * Azure OpenAI API (Microsoft Azure)
 */
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

/**
 * Stream responses from any configured AI provider
 */
export async function* streamAIProvider(
  messages: Array<{ role: string; content: string }>
): AsyncGenerator<string, void, unknown> {
  const provider = detectProvider();

  if (!provider) {
    throw new Error("No AI provider configured");
  }

  if (provider === "gemini") {
    yield* streamGemini(messages);
  } else if (provider === "openai") {
    yield* streamOpenAI(messages);
  } else if (provider === "azure") {
    yield* streamAzureOpenAI(messages);
  }
}

/**
 * Stream from Gemini (basic implementation - Gemini has limited streaming in free tier)
 */
async function* streamGemini(
  messages: Array<{ role: string; content: string }>
): AsyncGenerator<string, void, unknown> {
  // Gemini streaming is limited in free tier, so we fetch once and stream in chunks
  const content = await callGemini(messages, false);
  // Yield in chunks to simulate streaming
  const chunkSize = 50;
  for (let i = 0; i < content.length; i += chunkSize) {
    yield content.slice(i, i + chunkSize);
  }
}

/**
 * Stream from OpenAI
 */
async function* streamOpenAI(
  messages: Array<{ role: string; content: string }>
): AsyncGenerator<string, void, unknown> {
  const url = "https://api.openai.com/v1/chat/completions";

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages,
      max_tokens: 4000,
      temperature: 0.7,
      stream: true,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI streaming error: ${response.status} - ${error}`);
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

/**
 * Stream from Azure OpenAI
 */
async function* streamAzureOpenAI(
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
  studentInfo: Partial<StudentInfo>
): Promise<string> {
  const systemMessage = CONVERSATION_SYSTEM_PROMPT.replace(
    "{{STUDENT_INFO}}",
    JSON.stringify(studentInfo, null, 2)
  );

  const apiMessages = [
    { role: "system", content: systemMessage },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  return callAIProvider(apiMessages);
}

export async function generatePortfolioHtml(
  studentInfo: StudentInfo,
  template: PortfolioTemplate
): Promise<string> {
  const prompt = HTML_GENERATION_PROMPT
    .replace("{{STUDENT_INFO}}", JSON.stringify(studentInfo, null, 2))
    .replace("{{TEMPLATE}}", template);

  const response = await callAIProvider([
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

  const response = await callAIProvider([
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
