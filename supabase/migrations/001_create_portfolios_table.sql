-- Create portfolios table for storing AI-generated portfolios
-- Aligns with FolioAI Product Document MVP scope

CREATE TABLE portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Portfolio content
  title VARCHAR(255) NOT NULL,
  html_content TEXT, -- Complete AI-generated HTML (self-contained)
  
  -- Deployment
  live_url VARCHAR(512), -- Vercel deployed URL (e.g., username-portfolio.vercel.app)
  status VARCHAR(20) DEFAULT 'draft', -- draft | deployed | archived
  
  -- Chat history for re-editing
  chat_history JSONB, -- Array of ChatMessage objects
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX idx_portfolios_status ON portfolios(status);
CREATE INDEX idx_portfolios_user_status ON portfolios(user_id, status) WHERE status != 'archived';
CREATE INDEX idx_portfolios_updated_at ON portfolios(updated_at DESC);

-- RLS Policies (Row Level Security)
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;

-- Users can only see their own portfolios
CREATE POLICY "Users can view own portfolios" ON portfolios
  FOR SELECT
  USING (auth.uid()::TEXT = user_id::TEXT);

-- Users can create portfolios
CREATE POLICY "Users can create portfolios" ON portfolios
  FOR INSERT
  WITH CHECK (auth.uid()::TEXT = user_id::TEXT);

-- Users can update their own portfolios
CREATE POLICY "Users can update own portfolios" ON portfolios
  FOR UPDATE
  USING (auth.uid()::TEXT = user_id::TEXT)
  WITH CHECK (auth.uid()::TEXT = user_id::TEXT);

-- Users can delete (archive) their own portfolios
CREATE POLICY "Users can delete own portfolios" ON portfolios
  FOR DELETE
  USING (auth.uid()::TEXT = user_id::TEXT);
