/**
 * DOMAIN LAYER - Skill Entity
 */

export type SkillLevel = "beginner" | "intermediate" | "advanced" | "expert";

export type SkillCategory = 
  | "language" 
  | "framework" 
  | "database" 
  | "devops" 
  | "design" 
  | "soft-skill"
  | "other";

export type Skill = {
  id: string;
  portfolioId: string;
  name: string;
  category: SkillCategory;
  level: SkillLevel;
  yearsOfExperience: number | null;
  order: number;
};

export type CreateSkillInput = {
  portfolioId: string;
  name: string;
  category: SkillCategory;
  level?: SkillLevel;
};

/**
 * DOMAIN LAYER - Experience Entity
 */

export type ExperienceType = "internship" | "fulltime" | "parttime" | "freelance" | "volunteer";

export type Experience = {
  id: string;
  portfolioId: string;
  
  // Company/Organization
  company: string;
  companyLogo: string | null;
  location: string | null;
  
  // Role
  title: string;
  type: ExperienceType;
  description: string;
  achievements: string[]; // bullet points
  
  // Duration
  startDate: Date;
  endDate: Date | null; // null = current
  
  // Display
  order: number;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
};

export type CreateExperienceInput = {
  portfolioId: string;
  company: string;
  title: string;
  type: ExperienceType;
  description: string;
  startDate: Date;
  endDate?: Date | null;
};

/**
 * DOMAIN LAYER - Education Entity
 */

export type Education = {
  id: string;
  portfolioId: string;
  
  institution: string;
  institutionLogo: string | null;
  location: string | null;
  
  degree: string; // e.g., "B.Tech"
  field: string; // e.g., "Computer Science"
  grade: string | null; // e.g., "9.2 CGPA"
  
  startDate: Date;
  endDate: Date | null;
  
  highlights: string[]; // achievements, courses, etc.
  order: number;
  
  createdAt: Date;
  updatedAt: Date;
};

export type CreateEducationInput = {
  portfolioId: string;
  institution: string;
  degree: string;
  field: string;
  startDate: Date;
  endDate?: Date | null;
};
