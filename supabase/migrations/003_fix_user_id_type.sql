-- Fix user_id type to support OAuth provider IDs (not just UUIDs)
-- Google OAuth returns numeric IDs like "112079406953458442591"

-- Step 1: Drop RLS policies that depend on user_id/id columns
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can view own portfolios" ON portfolios;
DROP POLICY IF EXISTS "Users can insert own portfolios" ON portfolios;
DROP POLICY IF EXISTS "Users can update own portfolios" ON portfolios;
DROP POLICY IF EXISTS "Users can delete own portfolios" ON portfolios;

-- Step 2: Drop foreign key constraint
ALTER TABLE portfolios DROP CONSTRAINT IF EXISTS portfolios_user_id_fkey;

-- Step 3: Change users.id from UUID to TEXT
ALTER TABLE users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE users ALTER COLUMN id TYPE TEXT USING id::TEXT;

-- Step 4: Change portfolios.user_id from UUID to TEXT
ALTER TABLE portfolios ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- Step 5: Re-add foreign key constraint
ALTER TABLE portfolios 
  ADD CONSTRAINT portfolios_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Step 6: Recreate RLS policies (using text comparison now)
-- Note: For NextAuth with service role, these policies are bypassed anyway
-- But we recreate them for completeness

CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid()::TEXT = id);

CREATE POLICY "Users can view own portfolios"
  ON portfolios FOR SELECT
  USING (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can insert own portfolios"
  ON portfolios FOR INSERT
  WITH CHECK (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can update own portfolios"
  ON portfolios FOR UPDATE
  USING (auth.uid()::TEXT = user_id);

CREATE POLICY "Users can delete own portfolios"
  ON portfolios FOR DELETE
  USING (auth.uid()::TEXT = user_id);
