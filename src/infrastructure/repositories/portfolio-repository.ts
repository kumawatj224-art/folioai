/**
 * INFRASTRUCTURE LAYER - Portfolio Repository
 * 
 * File-based repository matching the Product Document schema.
 * See: docs/FolioAI_Product_Document.md
 */

import { readFile, writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import { randomUUID } from "crypto";

import type { 
  Portfolio, 
  DashboardPortfolioSummary, 
  ChatMessage,
  PortfolioStatus 
} from "@/domain/entities/chat";

const DATA_DIR = join(process.cwd(), ".data");
const PORTFOLIOS_FILE = join(DATA_DIR, "chat-portfolios.json");

async function ensureDataDir(): Promise<void> {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }
}

async function readPortfolios(): Promise<Portfolio[]> {
  try {
    await ensureDataDir();
    if (!existsSync(PORTFOLIOS_FILE)) {
      return [];
    }
    const data = await readFile(PORTFOLIOS_FILE, "utf-8");
    return JSON.parse(data) as Portfolio[];
  } catch {
    return [];
  }
}

async function writePortfolios(portfolios: Portfolio[]): Promise<void> {
  await ensureDataDir();
  await writeFile(PORTFOLIOS_FILE, JSON.stringify(portfolios, null, 2), "utf-8");
}

export type CreatePortfolioInput = {
  userId: string;
  title: string;
  htmlContent: string;
  chatHistory: ChatMessage[];
};

export type UpdatePortfolioInput = {
  title?: string;
  htmlContent?: string;
  liveUrl?: string;
  status?: PortfolioStatus;
  chatHistory?: ChatMessage[];
};

export const chatPortfolioRepository = {
  async findById(id: string): Promise<Portfolio | null> {
    const portfolios = await readPortfolios();
    return portfolios.find((p) => p.id === id) ?? null;
  },

  async findByUserId(userId: string): Promise<Portfolio[]> {
    const portfolios = await readPortfolios();
    return portfolios.filter((p) => p.userId === userId && p.status !== "archived");
  },

  async listSummaries(userId: string): Promise<DashboardPortfolioSummary[]> {
    const portfolios = await this.findByUserId(userId);
    return portfolios.map((p) => ({
      id: p.id,
      title: p.title,
      status: p.status,
      liveUrl: p.liveUrl,
      updatedAt: p.updatedAt,
    }));
  },

  async create(input: CreatePortfolioInput): Promise<Portfolio> {
    const portfolios = await readPortfolios();
    
    const portfolio: Portfolio = {
      id: randomUUID(),
      userId: input.userId,
      title: input.title,
      htmlContent: input.htmlContent,
      liveUrl: null,
      status: "draft",
      chatHistory: input.chatHistory,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    portfolios.push(portfolio);
    await writePortfolios(portfolios);

    return portfolio;
  },

  async update(id: string, input: UpdatePortfolioInput): Promise<Portfolio | null> {
    const portfolios = await readPortfolios();
    const index = portfolios.findIndex((p) => p.id === id);
    
    if (index === -1) return null;

    const updated: Portfolio = {
      ...portfolios[index],
      ...input,
      updatedAt: new Date(),
    };

    portfolios[index] = updated;
    await writePortfolios(portfolios);

    return updated;
  },

  async delete(id: string): Promise<boolean> {
    const portfolios = await readPortfolios();
    const index = portfolios.findIndex((p) => p.id === id);
    
    if (index === -1) return false;

    // Soft delete - change status to archived
    portfolios[index] = {
      ...portfolios[index],
      status: "archived",
      updatedAt: new Date(),
    };
    
    await writePortfolios(portfolios);
    return true;
  },

  async setLiveUrl(id: string, liveUrl: string): Promise<Portfolio | null> {
    return this.update(id, { liveUrl, status: "deployed" });
  },
};
