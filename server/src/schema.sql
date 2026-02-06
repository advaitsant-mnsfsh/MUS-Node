-- Create API Keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id text PRIMARY KEY,
  key text UNIQUE NOT NULL,
  owner_name text NOT NULL,
  user_id text REFERENCES "user"(id) ON DELETE CASCADE,
  usage_count integer DEFAULT 0 NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  last_used_at timestamp with time zone
);

-- Create Audit Jobs table
CREATE TABLE IF NOT EXISTS audit_jobs (
  id text PRIMARY KEY,
  api_key_id text REFERENCES api_keys(id),
  user_id text REFERENCES "user"(id) ON DELETE SET NULL,
  status text NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  input_data jsonb NOT NULL,
  result_url text,
  report_data jsonb,
  error_message text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Leads Table
CREATE TABLE IF NOT EXISTS leads (
   id text PRIMARY KEY,
   email text UNIQUE NOT NULL,
   name text,
   organization_type text,
   audit_url text,
   is_verified boolean DEFAULT false,
   created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Performance Indices
CREATE INDEX IF NOT EXISTS idx_audit_jobs_user_id ON audit_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_jobs_user_id_created_at ON audit_jobs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_jobs_api_key_id ON audit_jobs(api_key_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);

-- App Secrets table for dynamic configuration
CREATE TABLE IF NOT EXISTS app_secrets (
  id text PRIMARY KEY,
  key_name text UNIQUE NOT NULL,
  key_value text NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

