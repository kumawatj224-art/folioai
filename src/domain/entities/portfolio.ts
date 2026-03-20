/**
 * DOMAIN LAYER - Portfolio Entity
 * 
 * This represents the core Portfolio domain model.
 * Following DDD principles, entities have identity and encapsulate business logic.
 */

export type PortfolioStatus = "draft" | "published" | "archived";

export type SocialLink = {
  platform: "github" | "linkedin" | "twitter" | "website" | "email";
  url: string;
};

export type Portfolio = {
  id: string;
  userId: string;
  slug: string; // unique URL identifier (e.g., "arjun-sharma")
  
  // Profile
  displayName: string;
  headline: string; // e.g., "CSE Final Year · VIT Vellore"
  bio: string;
  avatarUrl: string | null;
  
  // Contact & Social
  email: string | null;
  socialLinks: SocialLink[];
  
  // Metadata
  status: PortfolioStatus;
  templateId: string;
  customDomain: string | null;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
};

export type CreatePortfolioInput = {
  userId: string;
  displayName: string;
  headline?: string;
  bio?: string;
  slug?: string; // auto-generated if not provided
  templateId?: string;
};

export type UpdatePortfolioInput = Partial<Omit<Portfolio, "id" | "userId" | "createdAt">>;

/**
 * Domain validation rules
 */
export const PORTFOLIO_CONSTRAINTS = {
  SLUG_MIN_LENGTH: 3,
  SLUG_MAX_LENGTH: 50,
  SLUG_PATTERN: /^[a-z0-9-]+$/,
  DISPLAY_NAME_MAX_LENGTH: 100,
  HEADLINE_MAX_LENGTH: 150,
  BIO_MAX_LENGTH: 500,
} as const;

/**
 * Value object: Validates and creates a slug
 */
export function createSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, PORTFOLIO_CONSTRAINTS.SLUG_MAX_LENGTH);
}

/**
 * Domain validation
 */
export function validateSlug(slug: string): { valid: boolean; error?: string } {
  if (slug.length < PORTFOLIO_CONSTRAINTS.SLUG_MIN_LENGTH) {
    return { valid: false, error: `Slug must be at least ${PORTFOLIO_CONSTRAINTS.SLUG_MIN_LENGTH} characters` };
  }
  if (slug.length > PORTFOLIO_CONSTRAINTS.SLUG_MAX_LENGTH) {
    return { valid: false, error: `Slug must be at most ${PORTFOLIO_CONSTRAINTS.SLUG_MAX_LENGTH} characters` };
  }
  if (!PORTFOLIO_CONSTRAINTS.SLUG_PATTERN.test(slug)) {
    return { valid: false, error: "Slug can only contain lowercase letters, numbers, and hyphens" };
  }
  return { valid: true };
}
