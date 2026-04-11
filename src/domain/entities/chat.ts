/**
 * DOMAIN LAYER - Chat & Portfolio Types
 * 
 * Types aligned with FolioAI Product Document.
 * See: docs/FolioAI_Product_Document.md
 */

export type MessageRole = "user" | "assistant" | "system";

export type ChatMessage = {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
};

export type PortfolioStatus = "draft" | "deployed" | "archived";

/**
 * Portfolio entity matching Supabase schema from product doc
 */
export type Portfolio = {
  id: string;
  userId: string;
  title: string;
  slug: string | null; // URL-safe identifier for public access (e.g., username.folioai.in/slug)
  htmlContent: string | null; // AI-generated complete HTML
  liveUrl: string | null; // Full deployed URL (e.g., https://johndoe.folioai.in)
  status: PortfolioStatus;
  chatHistory: ChatMessage[]; // Full conversation for re-editing
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Dashboard summary DTO (lean version for listing)
 */
export type DashboardPortfolioSummary = {
  id: string;
  title: string;
  status: PortfolioStatus;
  liveUrl: string | null;
  updatedAt: Date;
};

/**
 * Template options for portfolio generation
 */
export type PortfolioTemplate = 
  // CREATIVE TEMPLATES (recommended)
  | "macos-desktop"     // Interactive OS-style with dock and windows
  | "bento-grid"        // Modern card grid like Apple/Linear
  // CLASSIC TEMPLATES
  | "terminal-dark"     // Developer-focused, green on black, hacker aesthetic
  | "editorial-light"   // Magazine layout, serif fonts, professional
  | "gradient-dark"     // Purple/blue gradients, glassmorphism, modern
  | "brutalist"         // Bold black/white/orange, magazine-grid
  | "minimal-warm"      // Japanese-inspired, warm tones, serif elegance
  | "minimal-dark"      // Clean, monochrome dark theme
  | "enterprise-dark";  // Corporate, amber accents (for experienced pros)

/**
 * Information the AI collects through conversation
 */
export type StudentInfo = {
  name: string;
  bio?: string; // Tagline or short about text
  college: string;
  branch: string;
  graduationYear: string;
  skills: string[];
  projects: Array<{
    title: string;
    description: string;
    techStack: string[];
    link?: string;
  }>;
  internships: Array<{
    company: string;
    role: string;
    duration: string;
    description: string;
  }>;
  achievements: string[];
  // Coding profiles (for students)
  githubUsername?: string;
  leetcodeProfile?: string;
  codechefProfile?: string;
  socialLinks: {
    github?: string;
    linkedin?: string;
    email?: string;
    twitter?: string;
  };
};

export type ConversationState = {
  messages: ChatMessage[];
  studentInfo: Partial<StudentInfo>;
  selectedTemplate: PortfolioTemplate;
  generatedHtml: string | null;
  isComplete: boolean;
};

export const EMPTY_STUDENT_INFO: StudentInfo = {
  name: "",
  college: "",
  branch: "",
  graduationYear: "",
  skills: [],
  projects: [],
  internships: [],
  achievements: [],
  socialLinks: {},
};
