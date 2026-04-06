/**
 * Template Domain Entity
 * 
 * Pre-designed portfolio templates that users can select.
 */

export type TemplateCategory = "minimal" | "professional" | "creative" | "developer" | "general";

export type Template = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: TemplateCategory;
  thumbnailUrl: string | null;
  htmlTemplate: string;
  cssVariables: Record<string, string>;
  isFree: boolean;
  priceInr: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

export type TemplateSummary = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: TemplateCategory;
  thumbnailUrl: string | null;
  isFree: boolean;
  priceInr: number;
};

/**
 * Placeholder tokens used in templates
 * These get replaced with actual user data
 */
export const TEMPLATE_PLACEHOLDERS = {
  NAME: "{{NAME}}",
  TAGLINE: "{{TAGLINE}}",
  EMAIL: "{{EMAIL}}",
  PHONE: "{{PHONE}}",
  LOCATION: "{{LOCATION}}",
  ABOUT: "{{ABOUT}}",
  COLLEGE: "{{COLLEGE}}",
  BRANCH: "{{BRANCH}}",
  GRADUATION_YEAR: "{{GRADUATION_YEAR}}",
  SKILLS_HTML: "{{SKILLS_HTML}}",
  PROJECTS_HTML: "{{PROJECTS_HTML}}",
  EXPERIENCE_HTML: "{{EXPERIENCE_HTML}}",
  ACHIEVEMENTS_HTML: "{{ACHIEVEMENTS_HTML}}",
  SOCIAL_LINKS_HTML: "{{SOCIAL_LINKS_HTML}}",
  GITHUB_URL: "{{GITHUB_URL}}",
  LINKEDIN_URL: "{{LINKEDIN_URL}}",
  TWITTER_URL: "{{TWITTER_URL}}",
  WEBSITE_URL: "{{WEBSITE_URL}}",
} as const;

export type StudentData = {
  name: string;
  tagline?: string;
  email?: string;
  phone?: string;
  location?: string;
  about?: string;
  college?: string;
  branch?: string;
  graduationYear?: string;
  skills?: string[];
  projects?: Array<{
    title: string;
    description: string;
    techStack?: string[];
    liveUrl?: string;
    githubUrl?: string;
  }>;
  experience?: Array<{
    company: string;
    role: string;
    duration: string;
    description?: string;
  }>;
  achievements?: string[];
  socialLinks?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
};
