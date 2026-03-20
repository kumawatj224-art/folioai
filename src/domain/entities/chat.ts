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
  htmlContent: string | null; // AI-generated complete HTML
  liveUrl: string | null; // Vercel deployed URL
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
export type PortfolioTemplate = "minimal-dark" | "professional-light" | "colorful";

/**
 * Information the AI collects through conversation
 */
export type StudentInfo = {
  name: string;
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
  socialLinks: {
    github?: string;
    linkedin?: string;
    email?: string;
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
