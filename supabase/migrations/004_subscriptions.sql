-- FolioAI Subscription System
-- Migration 004: Add subscription tracking for pricing plans

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- USER SUBSCRIPTIONS TABLE
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  
  -- Plan info
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'pro', 'lifetime')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'past_due')),
  
  -- Generation limits (reset monthly)
  generations_used_this_month INT DEFAULT 0,
  generations_reset_date TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days',
  
  -- Regeneration limits (reset daily)
  regenerations_used_today INT DEFAULT 0,
  regenerations_reset_date DATE DEFAULT CURRENT_DATE + 1,
  
  -- Lifetime generations (only for free plan - 3 total forever)
  lifetime_generations_used INT DEFAULT 0,
  
  -- Razorpay billing info
  razorpay_customer_id TEXT,
  razorpay_subscription_id TEXT,
  razorpay_plan_id TEXT,
  
  -- Billing period
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan ON user_subscriptions(plan);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);

-- Auto-update updated_at
DROP TRIGGER IF EXISTS update_user_subscriptions_updated_at ON user_subscriptions;
CREATE TRIGGER update_user_subscriptions_updated_at
    BEFORE UPDATE ON user_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- CUSTOM DOMAINS TABLE
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS custom_domains (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
  
  -- Domain info
  domain TEXT UNIQUE NOT NULL,
  subdomain TEXT UNIQUE, -- username.folioai.in
  
  -- Verification
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verifying', 'verified', 'failed')),
  verification_token TEXT,
  verified_at TIMESTAMPTZ,
  
  -- SSL
  ssl_status TEXT DEFAULT 'pending' CHECK (ssl_status IN ('pending', 'provisioning', 'active', 'expired', 'failed')),
  ssl_expires_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_custom_domains_user_id ON custom_domains(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_domains_domain ON custom_domains(domain);
CREATE INDEX IF NOT EXISTS idx_custom_domains_subdomain ON custom_domains(subdomain);

DROP TRIGGER IF EXISTS update_custom_domains_updated_at ON custom_domains;
CREATE TRIGGER update_custom_domains_updated_at
    BEFORE UPDATE ON custom_domains
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- PORTFOLIO ANALYTICS TABLE
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS portfolio_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
  
  -- Event info
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'click', 'download', 'share')),
  
  -- Visitor info (anonymous)
  visitor_id TEXT, -- fingerprint hash
  session_id TEXT,
  
  -- Referrer & source
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  
  -- Geo data
  country TEXT,
  city TEXT,
  region TEXT,
  
  -- Device info
  device_type TEXT, -- mobile, desktop, tablet
  browser TEXT,
  os TEXT,
  
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portfolio_analytics_portfolio_id ON portfolio_analytics(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_analytics_event_type ON portfolio_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_portfolio_analytics_created_at ON portfolio_analytics(created_at);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- PAYMENT HISTORY TABLE
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS payment_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES user_subscriptions(id) ON DELETE SET NULL,
  
  -- Payment info
  amount_inr INT NOT NULL, -- Amount in paise (9900 = ₹99)
  currency TEXT DEFAULT 'INR',
  
  -- Razorpay info
  razorpay_payment_id TEXT UNIQUE,
  razorpay_order_id TEXT,
  razorpay_signature TEXT,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'captured', 'failed', 'refunded')),
  
  -- Plan purchased
  plan TEXT NOT NULL,
  billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'yearly', 'lifetime')),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_status ON payment_history(status);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- ROW LEVEL SECURITY
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

-- Users can only view their own subscription
CREATE POLICY "Users can view own subscription"
  ON user_subscriptions FOR SELECT
  USING (auth.uid()::TEXT = user_id);

-- Users can view their own domains
CREATE POLICY "Users can view own domains"
  ON custom_domains FOR SELECT
  USING (auth.uid()::TEXT = user_id);

-- Users can view analytics for their portfolios
CREATE POLICY "Users can view own analytics"
  ON portfolio_analytics FOR SELECT
  USING (
    portfolio_id IN (
      SELECT id FROM portfolios WHERE user_id = auth.uid()::TEXT
    )
  );

-- Users can view their payment history
CREATE POLICY "Users can view own payments"
  ON payment_history FOR SELECT
  USING (auth.uid()::TEXT = user_id);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- HELPER FUNCTIONS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Function to reset monthly generations (run via cron job)
CREATE OR REPLACE FUNCTION reset_monthly_generations()
RETURNS void AS $$
BEGIN
  UPDATE user_subscriptions
  SET 
    generations_used_this_month = 0,
    generations_reset_date = NOW() + INTERVAL '30 days'
  WHERE 
    generations_reset_date <= NOW()
    AND plan != 'free'; -- Free plan uses lifetime_generations_used
END;
$$ LANGUAGE plpgsql;

-- Function to reset daily regenerations (run via cron job)
CREATE OR REPLACE FUNCTION reset_daily_regenerations()
RETURNS void AS $$
BEGIN
  UPDATE user_subscriptions
  SET 
    regenerations_used_today = 0,
    regenerations_reset_date = CURRENT_DATE + 1
  WHERE 
    regenerations_reset_date <= CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- AUTO-CREATE SUBSCRIPTION FOR NEW USERS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Trigger to create free subscription when user is created
CREATE OR REPLACE FUNCTION create_default_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_subscriptions (user_id, plan, status)
  VALUES (NEW.id, 'free', 'active')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS create_subscription_on_user_create ON users;
CREATE TRIGGER create_subscription_on_user_create
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_subscription();
