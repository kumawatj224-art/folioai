-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Migration 006: Split Free-Tier Generation Limits
--
-- Business Rule:
--   Free tier gets:
--     • 1 NEW portfolio generation   (new_generations_count, max 1)
--     • 2 REGENERATIONS of that portfolio (regenerations_count, max 2)
--
-- These replace the old "lifetime_generations_used" single counter
-- which tracked a combined "3 free generations" limit.
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Add new_generations_count: tracks how many NEW portfolios the user has created
-- Free tier max = 1. Paid plans use the existing generations_used_this_month.
ALTER TABLE user_subscriptions
  ADD COLUMN IF NOT EXISTS new_generations_count INT NOT NULL DEFAULT 0;

-- Add regenerations_count: tracks lifetime regenerations for free users
-- (not a daily reset — free plan gets 2 total regenerations ever)
-- Paid plans use regenerations_used_today (daily, resets automatically).
ALTER TABLE user_subscriptions
  ADD COLUMN IF NOT EXISTS regenerations_count INT NOT NULL DEFAULT 0;

-- For existing free-tier users: migrate their old lifetime_generations_used
-- If they had used 1+ generation, mark them as having used 1 new generation.
UPDATE user_subscriptions
SET
  new_generations_count = CASE
    WHEN plan = 'free' AND lifetime_generations_used >= 1 THEN 1
    ELSE 0
  END,
  -- Any usage beyond the first counts as a "regeneration" (capped at 2)
  regenerations_count = CASE
    WHEN plan = 'free' AND lifetime_generations_used > 1 
      THEN LEAST(lifetime_generations_used - 1, 2)
    ELSE 0
  END
WHERE plan = 'free';

-- Add check constraints to prevent values exceeding business logic limits
-- (These are soft guardrails at the DB level; hard enforcement is in application code.)
ALTER TABLE user_subscriptions
  ADD CONSTRAINT chk_new_generations_count CHECK (new_generations_count >= 0),
  ADD CONSTRAINT chk_regenerations_count   CHECK (regenerations_count >= 0);

-- Index for quick free-tier limit lookups
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_free_limits
  ON user_subscriptions(user_id, plan, new_generations_count, regenerations_count)
  WHERE plan = 'free';
