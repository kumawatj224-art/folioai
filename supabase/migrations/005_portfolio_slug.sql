-- Add slug column to portfolios for public access
-- Run this in Supabase SQL Editor

-- Add slug column (unique, case-insensitive)
ALTER TABLE portfolios
ADD COLUMN IF NOT EXISTS slug VARCHAR(100) UNIQUE;

-- Create index for slug lookups
CREATE INDEX IF NOT EXISTS idx_portfolios_slug ON portfolios(slug);

-- Policy: Allow anyone to view deployed portfolios by slug (public access)
CREATE POLICY "Anyone can view deployed portfolios by slug"
  ON portfolios FOR SELECT
  USING (status = 'deployed' AND slug IS NOT NULL);

-- Function to generate a unique slug from title
CREATE OR REPLACE FUNCTION generate_portfolio_slug(title TEXT, user_id UUID)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INT := 0;
BEGIN
  -- Convert to lowercase, replace spaces with hyphens, remove special chars
  base_slug := lower(regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  base_slug := trim(both '-' from base_slug);
  
  -- If empty, use 'portfolio'
  IF base_slug = '' THEN
    base_slug := 'portfolio';
  END IF;
  
  final_slug := base_slug;
  
  -- Check for conflicts and add counter if needed
  WHILE EXISTS (SELECT 1 FROM portfolios WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;
