/**
 * INFRASTRUCTURE LAYER - Repository Interfaces
 * 
 * Following Dependency Inversion Principle:
 * - High-level modules (services) depend on abstractions (interfaces)
 * - Low-level modules (Prisma, file storage) implement these interfaces
 * 
 * This allows swapping implementations without changing business logic.
 */

import type { 
  Portfolio, 
  CreatePortfolioInput, 
  UpdatePortfolioInput 
} from "@/domain/entities/portfolio";
import type { 
  Project, 
  CreateProjectInput, 
  UpdateProjectInput 
} from "@/domain/entities/project";
import type {
  Skill,
  CreateSkillInput,
  Experience,
  CreateExperienceInput,
  Education,
  CreateEducationInput,
} from "@/domain/entities/skill";

/**
 * Generic result type for operations that can fail
 * Following Railway-Oriented Programming pattern
 */
export type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Portfolio Repository Interface
 * Single Responsibility: Only handles portfolio persistence
 */
export interface IPortfolioRepository {
  // Queries
  findById(id: string): Promise<Portfolio | null>;
  findByUserId(userId: string): Promise<Portfolio | null>;
  findBySlug(slug: string): Promise<Portfolio | null>;
  isSlugAvailable(slug: string, excludeId?: string): Promise<boolean>;
  
  // Commands
  create(input: CreatePortfolioInput): Promise<Result<Portfolio>>;
  update(id: string, input: UpdatePortfolioInput): Promise<Result<Portfolio>>;
  delete(id: string): Promise<Result<void>>;
  
  // Publishing
  publish(id: string): Promise<Result<Portfolio>>;
  unpublish(id: string): Promise<Result<Portfolio>>;
}

/**
 * Project Repository Interface
 */
export interface IProjectRepository {
  findById(id: string): Promise<Project | null>;
  findByPortfolioId(portfolioId: string): Promise<Project[]>;
  findFeatured(portfolioId: string): Promise<Project[]>;
  
  create(input: CreateProjectInput): Promise<Result<Project>>;
  update(id: string, input: UpdateProjectInput): Promise<Result<Project>>;
  delete(id: string): Promise<Result<void>>;
  
  reorder(portfolioId: string, projectIds: string[]): Promise<Result<void>>;
}

/**
 * Skill Repository Interface
 */
export interface ISkillRepository {
  findByPortfolioId(portfolioId: string): Promise<Skill[]>;
  create(input: CreateSkillInput): Promise<Result<Skill>>;
  update(id: string, input: Partial<Skill>): Promise<Result<Skill>>;
  delete(id: string): Promise<Result<void>>;
  bulkCreate(inputs: CreateSkillInput[]): Promise<Result<Skill[]>>;
}

/**
 * Experience Repository Interface
 */
export interface IExperienceRepository {
  findByPortfolioId(portfolioId: string): Promise<Experience[]>;
  create(input: CreateExperienceInput): Promise<Result<Experience>>;
  update(id: string, input: Partial<Experience>): Promise<Result<Experience>>;
  delete(id: string): Promise<Result<void>>;
}

/**
 * Education Repository Interface
 */
export interface IEducationRepository {
  findByPortfolioId(portfolioId: string): Promise<Education[]>;
  create(input: CreateEducationInput): Promise<Result<Education>>;
  update(id: string, input: Partial<Education>): Promise<Result<Education>>;
  delete(id: string): Promise<Result<void>>;
}

/**
 * Unit of Work pattern for transactions
 * Ensures atomic operations across multiple repositories
 */
export interface IUnitOfWork {
  portfolios: IPortfolioRepository;
  projects: IProjectRepository;
  skills: ISkillRepository;
  experiences: IExperienceRepository;
  education: IEducationRepository;
  
  // Transaction support
  transaction<T>(fn: () => Promise<T>): Promise<T>;
}
