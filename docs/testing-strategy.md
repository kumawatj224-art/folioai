# FolioAI - Testing Strategy

**Last Updated:** April 6, 2026

This document outlines the testing strategy, test structure, and implementation guidelines for FolioAI.

---

## Table of Contents

1. [Testing Philosophy](#testing-philosophy)
2. [Test Pyramid](#test-pyramid)
3. [Test Structure](#test-structure)
4. [Unit Testing](#unit-testing)
5. [Integration Testing](#integration-testing)
6. [E2E Testing](#e2e-testing)
7. [Manual Testing Checklist](#manual-testing-checklist)
8. [Testing Tools Setup](#testing-tools-setup)
9. [CI/CD Integration](#cicd-integration)

---

## Testing Philosophy

### Principles
1. **Test behavior, not implementation** - Focus on what the code does, not how
2. **Fast feedback loop** - Unit tests should run in < 5 seconds
3. **Reliable tests** - No flaky tests; fix or delete them
4. **Test in isolation** - Mock external dependencies
5. **Coverage with purpose** - Aim for meaningful coverage, not arbitrary numbers

### Coverage Targets
| Type | Target | Priority |
|------|--------|----------|
| Domain/Entities | 90%+ | High |
| Repositories | 80%+ | High |
| API Routes | 70%+ | Medium |
| UI Components | 60%+ | Low |

---

## Test Pyramid

```
        /\
       /  \    E2E Tests (5%)
      /    \   - Critical user flows
     /------\  - Login, Generate, Deploy
    /        \
   /  Integ.  \ Integration Tests (25%)
  /    Tests   \ - API routes
 /--------------\ - Database operations
/                \
/   Unit Tests    \ Unit Tests (70%)
/------------------\ - Domain logic
                    - Utilities
                    - Validators
```

---

## Test Structure

```
tests/
├── unit/
│   ├── domain/
│   │   ├── subscription.test.ts
│   │   ├── portfolio.test.ts
│   │   └── template.test.ts
│   ├── utils/
│   │   ├── slug-generator.test.ts
│   │   └── url-parser.test.ts
│   └── validators/
│       └── portfolio-validator.test.ts
├── integration/
│   ├── api/
│   │   ├── portfolios.test.ts
│   │   ├── deploy.test.ts
│   │   ├── chat.test.ts
│   │   └── templates.test.ts
│   ├── repositories/
│   │   ├── portfolio-repository.test.ts
│   │   └── subscription-repository.test.ts
│   └── auth/
│       └── session.test.ts
├── e2e/
│   ├── auth.spec.ts
│   ├── portfolio-generation.spec.ts
│   ├── deployment.spec.ts
│   └── subscription.spec.ts
├── fixtures/
│   ├── portfolios.json
│   ├── users.json
│   └── templates.json
├── mocks/
│   ├── supabase.ts
│   ├── openai.ts
│   └── next-auth.ts
└── setup/
    ├── jest.setup.ts
    └── playwright.config.ts
```

---

## Unit Testing

### What to Test
- Domain entities (`src/domain/entities/`)
- Pure utility functions (`src/lib/utils/`)
- Validators and schema checks
- State transformations

### Example: Subscription Entity Tests

```typescript
// tests/unit/domain/subscription.test.ts
import { 
  canGenerate, 
  canRegenerate, 
  canCreatePortfolio,
  getPlanLabel,
  getUsageDisplay,
  PLAN_LIMITS 
} from '@/domain/entities/subscription';

describe('Subscription Entity', () => {
  describe('canGenerate', () => {
    const baseSubscription = {
      userId: 'user-123',
      plan: 'free' as const,
      status: 'active' as const,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should allow generation when under limit', () => {
      const subscription = {
        ...baseSubscription,
        usage: {
          generationsThisPeriod: 1,
          regenerationsToday: 0,
          deploymentsThisPeriod: 0,
          portfolioCount: 0,
          lastGeneratedAt: new Date(),
          lastRegeneratedAt: null,
          periodResetAt: new Date(),
        },
      };

      const result = canGenerate(subscription);
      
      expect(result.allowed).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should block generation when lifetime limit reached (free plan)', () => {
      const subscription = {
        ...baseSubscription,
        usage: {
          generationsThisPeriod: 3, // Free limit is 3 lifetime
          regenerationsToday: 0,
          deploymentsThisPeriod: 0,
          portfolioCount: 0,
          lastGeneratedAt: new Date(),
          lastRegeneratedAt: null,
          periodResetAt: new Date(),
        },
      };

      const result = canGenerate(subscription);
      
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('lifetime limit');
    });

    it('should allow unlimited generations for pro plan', () => {
      const subscription = {
        ...baseSubscription,
        plan: 'pro' as const,
        usage: {
          generationsThisPeriod: 100,
          regenerationsToday: 0,
          deploymentsThisPeriod: 0,
          portfolioCount: 0,
          lastGeneratedAt: new Date(),
          lastRegeneratedAt: null,
          periodResetAt: new Date(),
        },
      };

      const result = canGenerate(subscription);
      
      expect(result.allowed).toBe(true);
    });
  });

  describe('canRegenerate', () => {
    it('should block when daily limit reached', () => {
      const subscription = {
        userId: 'user-123',
        plan: 'free' as const,
        status: 'active' as const,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        usage: {
          generationsThisPeriod: 1,
          regenerationsToday: 2, // Free limit is 2/day
          deploymentsThisPeriod: 0,
          portfolioCount: 0,
          lastGeneratedAt: new Date(),
          lastRegeneratedAt: new Date(),
          periodResetAt: new Date(),
        },
      };

      const result = canRegenerate(subscription);
      
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('daily limit');
    });
  });

  describe('getPlanLabel', () => {
    it('should return correct labels', () => {
      expect(getPlanLabel('free')).toBe('Free');
      expect(getPlanLabel('starter')).toBe('Starter');
      expect(getPlanLabel('pro')).toBe('Pro');
      expect(getPlanLabel('lifetime')).toBe('Lifetime');
    });
  });

  describe('PLAN_LIMITS', () => {
    it('should have correct limits for free plan', () => {
      expect(PLAN_LIMITS.free.maxGenerations).toBe(3);
      expect(PLAN_LIMITS.free.maxRegenerationsPerDay).toBe(2);
      expect(PLAN_LIMITS.free.maxDeployments).toBe(1);
    });

    it('should have correct limits for pro plan', () => {
      expect(PLAN_LIMITS.pro.maxGenerations).toBe(15);
      expect(PLAN_LIMITS.pro.maxRegenerationsPerDay).toBe(Infinity);
    });
  });
});
```

### Example: Slug Generator Tests

```typescript
// tests/unit/utils/slug-generator.test.ts
describe('Slug Generator', () => {
  // Assuming a slugify function exists
  const slugify = (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  it('should convert text to lowercase', () => {
    expect(slugify('My Portfolio')).toBe('my-portfolio');
  });

  it('should replace spaces with hyphens', () => {
    expect(slugify('software engineer portfolio')).toBe('software-engineer-portfolio');
  });

  it('should remove special characters', () => {
    expect(slugify('Arjun\'s Portfolio!')).toBe('arjuns-portfolio');
  });

  it('should handle multiple spaces', () => {
    expect(slugify('my   portfolio')).toBe('my-portfolio');
  });

  it('should trim whitespace', () => {
    expect(slugify('  portfolio  ')).toBe('portfolio');
  });

  it('should handle numbers', () => {
    expect(slugify('Portfolio 2024')).toBe('portfolio-2024');
  });
});
```

---

## Integration Testing

### What to Test
- API route handlers
- Database operations
- Authentication flows
- External service integrations (mocked)

### Test Database Strategy
Use a separate test database or in-memory mock:

```typescript
// tests/mocks/supabase.ts
export const createMockSupabaseClient = () => ({
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
        data: [],
        error: null,
      })),
    })),
    insert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn().mockResolvedValue({ data: { id: 'new-id' }, error: null }),
      })),
    })),
    update: jest.fn(() => ({
      eq: jest.fn(() => ({
        select: jest.fn().mockResolvedValue({ data: {}, error: null }),
      })),
    })),
    delete: jest.fn(() => ({
      eq: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
  })),
});
```

### Example: Portfolio API Tests

```typescript
// tests/integration/api/portfolios.test.ts
import { createMocks } from 'node-mocks-http';
import { GET, POST } from '@/app/api/portfolios/route';

// Mock dependencies
jest.mock('@/lib/supabase/server', () => ({
  createServerClient: () => createMockSupabaseClient(),
}));

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

describe('GET /api/portfolios', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if not authenticated', async () => {
    const { req } = createMocks({ method: 'GET' });
    
    // Mock no session
    require('next-auth').getServerSession.mockResolvedValue(null);
    
    const response = await GET(req);
    const data = await response.json();
    
    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return user portfolios when authenticated', async () => {
    const { req } = createMocks({ method: 'GET' });
    
    // Mock session
    require('next-auth').getServerSession.mockResolvedValue({
      user: { id: 'user-123', email: 'test@example.com' },
    });
    
    const response = await GET(req);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
  });
});

describe('POST /api/portfolios', () => {
  it('should create a new portfolio', async () => {
    const { req } = createMocks({
      method: 'POST',
      body: { title: 'My Portfolio' },
    });
    
    require('next-auth').getServerSession.mockResolvedValue({
      user: { id: 'user-123' },
    });
    
    const response = await POST(req);
    const data = await response.json();
    
    expect(response.status).toBe(201);
    expect(data.id).toBeDefined();
  });

  it('should validate title is provided', async () => {
    const { req } = createMocks({
      method: 'POST',
      body: {},
    });
    
    require('next-auth').getServerSession.mockResolvedValue({
      user: { id: 'user-123' },
    });
    
    const response = await POST(req);
    const data = await response.json();
    
    expect(response.status).toBe(400);
    expect(data.error).toContain('title');
  });
});
```

### Example: Repository Tests

```typescript
// tests/integration/repositories/portfolio-repository.test.ts
import { 
  createPortfolio, 
  getPortfoliosByUserId, 
  findBySlug,
  updatePortfolioStatus 
} from '@/infrastructure/repositories/portfolio-repository';

describe('Portfolio Repository', () => {
  describe('createPortfolio', () => {
    it('should create portfolio with required fields', async () => {
      const portfolio = await createPortfolio({
        userId: 'user-123',
        title: 'Test Portfolio',
      });
      
      expect(portfolio.id).toBeDefined();
      expect(portfolio.title).toBe('Test Portfolio');
      expect(portfolio.status).toBe('draft');
    });
  });

  describe('findBySlug', () => {
    it('should extract slug from live_url and find portfolio', async () => {
      // First create a portfolio with live_url
      const created = await createPortfolio({
        userId: 'user-123',
        title: 'Arjun Portfolio',
      });
      
      // Update with live_url
      await updatePortfolioStatus(created.id, 'deployed', 'https://arjun.getfolioai.in');
      
      // Find by slug
      const found = await findBySlug('arjun');
      
      expect(found).not.toBeNull();
      expect(found?.id).toBe(created.id);
    });

    it('should return null for non-existent slug', async () => {
      const found = await findBySlug('non-existent-slug');
      expect(found).toBeNull();
    });
  });
});
```

---

## E2E Testing

### Tool: Playwright

### Critical User Flows

1. **Authentication Flow**
   - Google OAuth login
   - Email OTP login
   - Session persistence
   - Logout

2. **Portfolio Generation Flow**
   - Start new chat
   - Enter information
   - Generate portfolio
   - Preview renders correctly

3. **Deployment Flow**
   - Click deploy
   - Enter subdomain
   - Portfolio goes live
   - Visit URL works

4. **Subscription Flow**
   - View pricing
   - Upgrade to paid
   - Payment completes
   - Limits updated

### Example: E2E Auth Test

```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should show login button on landing page', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('should redirect to dashboard after login', async ({ page }) => {
    // This would use a test account or mock auth
    await page.goto('/');
    
    // Click sign in (would need auth mocking for real tests)
    // await page.click('text=Sign in with Google');
    
    // Verify redirect
    // await expect(page).toHaveURL('/dashboard');
  });

  test('should protect dashboard route', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should redirect to home or login
    await expect(page).toHaveURL('/');
  });
});
```

### Example: E2E Portfolio Generation

```typescript
// tests/e2e/portfolio-generation.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Portfolio Generation', () => {
  test.beforeEach(async ({ page }) => {
    // Set up authenticated state (using storage state)
    await page.goto('/dashboard');
  });

  test('should create and generate portfolio', async ({ page }) => {
    // Click new portfolio
    await page.click('text=New Portfolio');
    
    // Wait for chat interface
    await expect(page.locator('[data-testid="chat-interface"]')).toBeVisible();
    
    // Enter message
    await page.fill('[data-testid="chat-input"]', 'I am a software engineer');
    await page.click('[data-testid="send-button"]');
    
    // Wait for AI response
    await expect(page.locator('[data-testid="ai-message"]')).toBeVisible({
      timeout: 30000,
    });
    
    // Click generate
    await page.click('text=Generate');
    
    // Wait for preview
    await expect(page.locator('[data-testid="portfolio-preview"]')).toBeVisible({
      timeout: 60000,
    });
  });

  test('should deploy portfolio with custom subdomain', async ({ page }) => {
    // Navigate to existing portfolio
    await page.click('[data-testid="portfolio-card"]');
    
    // Click deploy
    await page.click('text=Deploy');
    
    // Handle subdomain prompt
    await page.fill('[data-testid="subdomain-input"]', 'test-portfolio');
    await page.click('text=Deploy');
    
    // Verify live URL shown
    await expect(page.locator('text=.getfolioai.in')).toBeVisible();
  });
});
```

---

## Manual Testing Checklist

### Before Each Release

#### Authentication
- [ ] Google OAuth login works
- [ ] Email OTP login works
- [ ] Session persists after refresh
- [ ] Logout clears session
- [ ] Protected routes redirect properly

#### Dashboard
- [ ] Portfolio list loads
- [ ] Empty state shows correctly
- [ ] Portfolio cards display status correctly
- [ ] "New Portfolio" button works
- [ ] Edit/View/Visit buttons work
- [ ] Usage banner shows correct limits

#### Chat & Generation
- [ ] Chat messages send
- [ ] AI responses stream
- [ ] Template selector works
- [ ] Resume upload parses correctly
- [ ] Generate button creates portfolio
- [ ] Preview renders correctly
- [ ] Code view works
- [ ] Download/Copy HTML works

#### Deployment
- [ ] Deploy button prompts for subdomain
- [ ] Portfolio deploys successfully
- [ ] Live URL is accessible
- [ ] Visit button opens correct URL
- [ ] Redeploy updates the site

#### Templates
- [ ] Template list loads
- [ ] Free/Premium badges show
- [ ] Preview works
- [ ] "Use This Template" works

#### Mobile Testing
- [ ] Dashboard responsive
- [ ] Chat interface usable
- [ ] Preview scales correctly
- [ ] Buttons tappable

#### Cross-Browser
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

---

## Testing Tools Setup

### Install Dependencies

```bash
npm install -D jest @types/jest ts-jest
npm install -D @testing-library/react @testing-library/jest-dom
npm install -D node-mocks-http
npm install -D playwright @playwright/test
```

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup/jest.setup.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
};
```

### Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Package.json Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest --testPathPattern=tests/unit",
    "test:integration": "jest --testPathPattern=tests/integration",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:unit -- --coverage
      - uses: codecov/codecov-action@v3

  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test:integration
    env:
      TEST_DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run typecheck
```

---

## Testing Priority by Feature

| Feature | Unit | Integration | E2E | Priority |
|---------|------|-------------|-----|----------|
| Subscription limits | ✅ | ✅ | ⚪ | High |
| Portfolio CRUD | ⚪ | ✅ | ✅ | High |
| Authentication | ⚪ | ✅ | ✅ | High |
| AI Chat | ⚪ | ✅ | ⚪ | Medium |
| Deployment | ⚪ | ✅ | ✅ | High |
| Templates | ⚪ | ✅ | ⚪ | Low |
| Resume parsing | ✅ | ⚪ | ⚪ | Medium |
| Subdomain routing | ⚪ | ✅ | ✅ | High |

---

## Next Steps

1. **This Week:** Set up Jest + testing infrastructure
2. **Week 2:** Write unit tests for domain entities
3. **Week 3:** Add integration tests for critical API routes
4. **Week 4:** Set up Playwright and add E2E tests for happy paths

---

**Maintainer:** FolioAI Team  
**Last Review:** April 6, 2026
