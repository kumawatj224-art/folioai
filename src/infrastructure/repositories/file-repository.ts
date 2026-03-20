/**
 * INFRASTRUCTURE LAYER - In-Memory Repository Implementation
 * 
 * Development implementation using file-based JSON storage.
 * Follows Liskov Substitution - can be swapped with Prisma implementation.
 * 
 * @note This is for development only. Replace with Prisma in production.
 */

import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import { randomUUID } from "crypto";

import type { 
  IPortfolioRepository, 
  IProjectRepository,
  ISkillRepository,
  Result 
} from "@/domain/repositories/interfaces";
import type { 
  Portfolio, 
  CreatePortfolioInput, 
  UpdatePortfolioInput,
  createSlug 
} from "@/domain/entities/portfolio";
import type { 
  Project, 
  CreateProjectInput, 
  UpdateProjectInput 
} from "@/domain/entities/project";
import type { Skill, CreateSkillInput } from "@/domain/entities/skill";

const DATA_DIR = join(process.cwd(), ".data");
const PORTFOLIO_FILE = join(DATA_DIR, "portfolios.json");
const PROJECTS_FILE = join(DATA_DIR, "projects.json");
const SKILLS_FILE = join(DATA_DIR, "skills.json");

async function ensureDataDir(): Promise<void> {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }
}

async function readJsonFile<T>(path: string, defaultValue: T): Promise<T> {
  try {
    await ensureDataDir();
    if (!existsSync(path)) {
      return defaultValue;
    }
    const data = await readFile(path, "utf-8");
    return JSON.parse(data) as T;
  } catch {
    return defaultValue;
  }
}

async function writeJsonFile<T>(path: string, data: T): Promise<void> {
  await ensureDataDir();
  await writeFile(path, JSON.stringify(data, null, 2), "utf-8");
}

/**
 * In-Memory Portfolio Repository
 */
export class FilePortfolioRepository implements IPortfolioRepository {
  private async getPortfolios(): Promise<Portfolio[]> {
    return readJsonFile<Portfolio[]>(PORTFOLIO_FILE, []);
  }

  private async savePortfolios(portfolios: Portfolio[]): Promise<void> {
    await writeJsonFile(PORTFOLIO_FILE, portfolios);
  }

  async findById(id: string): Promise<Portfolio | null> {
    const portfolios = await this.getPortfolios();
    return portfolios.find((p) => p.id === id) ?? null;
  }

  async findByUserId(userId: string): Promise<Portfolio | null> {
    const portfolios = await this.getPortfolios();
    return portfolios.find((p) => p.userId === userId) ?? null;
  }

  async findBySlug(slug: string): Promise<Portfolio | null> {
    const portfolios = await this.getPortfolios();
    return portfolios.find((p) => p.slug === slug && p.status === "published") ?? null;
  }

  async isSlugAvailable(slug: string, excludeId?: string): Promise<boolean> {
    const portfolios = await this.getPortfolios();
    return !portfolios.some((p) => p.slug === slug && p.id !== excludeId);
  }

  async create(input: CreatePortfolioInput): Promise<Result<Portfolio>> {
    try {
      const portfolios = await this.getPortfolios();
      
      // Generate slug from display name if not provided
      const baseSlug = input.slug ?? input.displayName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      let slug = baseSlug;
      let counter = 1;
      
      while (!await this.isSlugAvailable(slug)) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      const portfolio: Portfolio = {
        id: randomUUID(),
        userId: input.userId,
        slug,
        displayName: input.displayName,
        headline: input.headline ?? "",
        bio: input.bio ?? "",
        avatarUrl: null,
        email: null,
        socialLinks: [],
        status: "draft",
        templateId: input.templateId ?? "default",
        customDomain: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        publishedAt: null,
      };

      portfolios.push(portfolio);
      await this.savePortfolios(portfolios);

      return { success: true, data: portfolio };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error : new Error("Unknown error") };
    }
  }

  async update(id: string, input: UpdatePortfolioInput): Promise<Result<Portfolio>> {
    try {
      const portfolios = await this.getPortfolios();
      const index = portfolios.findIndex((p) => p.id === id);
      
      if (index === -1) {
        return { success: false, error: new Error("Portfolio not found") };
      }

      const updated: Portfolio = {
        ...portfolios[index],
        ...input,
        updatedAt: new Date(),
      };

      portfolios[index] = updated;
      await this.savePortfolios(portfolios);

      return { success: true, data: updated };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error : new Error("Unknown error") };
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      const portfolios = await this.getPortfolios();
      const filtered = portfolios.filter((p) => p.id !== id);
      await this.savePortfolios(filtered);
      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error : new Error("Unknown error") };
    }
  }

  async publish(id: string): Promise<Result<Portfolio>> {
    return this.update(id, { status: "published", publishedAt: new Date() });
  }

  async unpublish(id: string): Promise<Result<Portfolio>> {
    return this.update(id, { status: "draft", publishedAt: null });
  }
}

/**
 * In-Memory Project Repository
 */
export class FileProjectRepository implements IProjectRepository {
  private async getProjects(): Promise<Project[]> {
    return readJsonFile<Project[]>(PROJECTS_FILE, []);
  }

  private async saveProjects(projects: Project[]): Promise<void> {
    await writeJsonFile(PROJECTS_FILE, projects);
  }

  async findById(id: string): Promise<Project | null> {
    const projects = await this.getProjects();
    return projects.find((p) => p.id === id) ?? null;
  }

  async findByPortfolioId(portfolioId: string): Promise<Project[]> {
    const projects = await this.getProjects();
    return projects
      .filter((p) => p.portfolioId === portfolioId)
      .sort((a, b) => a.order - b.order);
  }

  async findFeatured(portfolioId: string): Promise<Project[]> {
    const projects = await this.findByPortfolioId(portfolioId);
    return projects.filter((p) => p.featured);
  }

  async create(input: CreateProjectInput): Promise<Result<Project>> {
    try {
      const projects = await this.getProjects();
      const existingProjects = projects.filter((p) => p.portfolioId === input.portfolioId);

      const project: Project = {
        id: randomUUID(),
        portfolioId: input.portfolioId,
        title: input.title,
        description: input.description,
        longDescription: null,
        thumbnailUrl: null,
        type: input.type ?? "personal",
        techStack: input.techStack ?? [],
        links: input.links ?? [],
        featured: input.featured ?? false,
        order: existingProjects.length,
        startDate: null,
        endDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      projects.push(project);
      await this.saveProjects(projects);

      return { success: true, data: project };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error : new Error("Unknown error") };
    }
  }

  async update(id: string, input: UpdateProjectInput): Promise<Result<Project>> {
    try {
      const projects = await this.getProjects();
      const index = projects.findIndex((p) => p.id === id);
      
      if (index === -1) {
        return { success: false, error: new Error("Project not found") };
      }

      const updated: Project = {
        ...projects[index],
        ...input,
        updatedAt: new Date(),
      };

      projects[index] = updated;
      await this.saveProjects(projects);

      return { success: true, data: updated };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error : new Error("Unknown error") };
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      const projects = await this.getProjects();
      const filtered = projects.filter((p) => p.id !== id);
      await this.saveProjects(filtered);
      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error : new Error("Unknown error") };
    }
  }

  async reorder(portfolioId: string, projectIds: string[]): Promise<Result<void>> {
    try {
      const projects = await this.getProjects();
      
      projectIds.forEach((id, index) => {
        const project = projects.find((p) => p.id === id && p.portfolioId === portfolioId);
        if (project) {
          project.order = index;
        }
      });

      await this.saveProjects(projects);
      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error : new Error("Unknown error") };
    }
  }
}

/**
 * In-Memory Skill Repository
 */
export class FileSkillRepository implements ISkillRepository {
  private async getSkills(): Promise<Skill[]> {
    return readJsonFile<Skill[]>(SKILLS_FILE, []);
  }

  private async saveSkills(skills: Skill[]): Promise<void> {
    await writeJsonFile(SKILLS_FILE, skills);
  }

  async findByPortfolioId(portfolioId: string): Promise<Skill[]> {
    const skills = await this.getSkills();
    return skills
      .filter((s) => s.portfolioId === portfolioId)
      .sort((a, b) => a.order - b.order);
  }

  async create(input: CreateSkillInput): Promise<Result<Skill>> {
    try {
      const skills = await this.getSkills();
      const existingSkills = skills.filter((s) => s.portfolioId === input.portfolioId);

      const skill: Skill = {
        id: randomUUID(),
        portfolioId: input.portfolioId,
        name: input.name,
        category: input.category,
        level: input.level ?? "intermediate",
        yearsOfExperience: null,
        order: existingSkills.length,
      };

      skills.push(skill);
      await this.saveSkills(skills);

      return { success: true, data: skill };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error : new Error("Unknown error") };
    }
  }

  async update(id: string, input: Partial<Skill>): Promise<Result<Skill>> {
    try {
      const skills = await this.getSkills();
      const index = skills.findIndex((s) => s.id === id);
      
      if (index === -1) {
        return { success: false, error: new Error("Skill not found") };
      }

      const updated: Skill = { ...skills[index], ...input };
      skills[index] = updated;
      await this.saveSkills(skills);

      return { success: true, data: updated };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error : new Error("Unknown error") };
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      const skills = await this.getSkills();
      const filtered = skills.filter((s) => s.id !== id);
      await this.saveSkills(filtered);
      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error : new Error("Unknown error") };
    }
  }

  async bulkCreate(inputs: CreateSkillInput[]): Promise<Result<Skill[]>> {
    try {
      const created: Skill[] = [];
      for (const input of inputs) {
        const result = await this.create(input);
        if (result.success) {
          created.push(result.data);
        }
      }
      return { success: true, data: created };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error : new Error("Unknown error") };
    }
  }
}

/**
 * Factory function - Dependency Injection container
 * Returns concrete implementations of repository interfaces
 */
export function createRepositories() {
  return {
    portfolios: new FilePortfolioRepository(),
    projects: new FileProjectRepository(),
    skills: new FileSkillRepository(),
  };
}
