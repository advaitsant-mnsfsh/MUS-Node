-- Create API Keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  key text UNIQUE NOT NULL,
  owner_name text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE, -- Link to authenticated user
  usage_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_used_at timestamp with time zone
);

-- Create Audit Jobs table
CREATE TABLE IF NOT EXISTS audit_jobs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  api_key_id uuid REFERENCES api_keys(id),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL, -- Track which user owns this audit
  status text NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  input_data jsonb NOT NULL,
  result_url text,
  report_data jsonb,
  error_message text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS audits (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  url text,
  report_data jsonb,
  screenshot_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS (Optional, but good practice)
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for api_keys: Users can only see their own keys
CREATE POLICY "Users can view their own API keys"
  ON api_keys FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own API keys"
  ON api_keys FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for audit_jobs: Users can only see their own audits
CREATE POLICY "Users can view their own audits"
  ON audit_jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own audits"
  ON audit_jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Create policy to allow efficient service role access (if needed explicitly, though service role bypasses RLS)
-- For now, we assume the Service Role Key is used for all backend operations, which bypasses RLS.
