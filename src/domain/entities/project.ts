/**
 * DOMAIN LAYER - Project Entity
 * 
 * Represents a portfolio project/work item.
 * Follows Single Responsibility Principle - only handles project data.
 */

export type ProjectType = "personal" | "internship" | "freelance" | "academic" | "opensource";

export type TechStack = {
  name: string;
  category: "language" | "framework" | "database" | "tool" | "other";
};

export type ProjectLink = {
  type: "live" | "github" | "demo" | "docs" | "other";
  url: string;
  label?: string;
};

export type Project = {
  id: string;
  portfolioId: string;
  
  // Content
  title: string;
  description: string;
  longDescription: string | null;
  thumbnailUrl: string | null;
  
  // Classification
  type: ProjectType;
  techStack: TechStack[];
  links: ProjectLink[];
  
  // Display
  featured: boolean;
  order: number;
  
  // Dates
  startDate: Date | null;
  endDate: Date | null; // null = ongoing
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
};

export type CreateProjectInput = {
  portfolioId: string;
  title: string;
  description: string;
  type?: ProjectType;
  techStack?: TechStack[];
  links?: ProjectLink[];
  featured?: boolean;
};

export type UpdateProjectInput = Partial<Omit<Project, "id" | "portfolioId" | "createdAt">>;

/**
 * Domain constraints
 */
export const PROJECT_CONSTRAINTS = {
  TITLE_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 300,
  LONG_DESCRIPTION_MAX_LENGTH: 2000,
  MAX_TECH_STACK: 15,
  MAX_LINKS: 5,
} as const;

/**
 * Helper to validate project input
 */
export function validateProject(input: CreateProjectInput): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!input.title.trim()) {
    errors.push("Title is required");
  }
  if (input.title.length > PROJECT_CONSTRAINTS.TITLE_MAX_LENGTH) {
    errors.push(`Title must be at most ${PROJECT_CONSTRAINTS.TITLE_MAX_LENGTH} characters`);
  }
  if (!input.description.trim()) {
    errors.push("Description is required");
  }
  if (input.description.length > PROJECT_CONSTRAINTS.DESCRIPTION_MAX_LENGTH) {
    errors.push(`Description must be at most ${PROJECT_CONSTRAINTS.DESCRIPTION_MAX_LENGTH} characters`);
  }
  
  return { valid: errors.length === 0, errors };
}
