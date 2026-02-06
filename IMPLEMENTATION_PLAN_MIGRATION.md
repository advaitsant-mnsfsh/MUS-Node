# 🦅 The Great Migration: Supabase to Railway (Self-Hosted)

## � Overview
This document outlines the step-by-step master plan to fully decouple from Supabase and migrate the entire stack to a self-hosted environment on Railway.

**End Goal:**
- **Database:** Railway Postgres
- **Auth:** Better-Auth (Node.js) with Google & Email OTP
- **Storage:** MinIO (Self-hosted on Railway) or S3 Compatible
- **Backend:** Existing Node.js API (Updated logic)
- **Frontend:** Updated to use new Auth & API

---

## 🏗️ Phase 1: Railway Infrastructure Setup
*Goal: Create the "Landing Zone" for our data and services.*

### 1.1 Provision Database
*   **Action:** Create a new **PostgreSQL** service in your Railway project.
*   **Variables to Capture:** `DATABASE_URL` (Internal & Public).

### 1.2 Provision Storage (Object Store)
*   **Action:** Create a **MinIO** service on Railway (from template) OR create a Cloudflare R2 bucket (recommended for cost).
*   **Note:** MinIO allows you to keep everything inside Railway.
*   **Variables to Capture:** `S3_ENDPOINT`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_BUCKET_NAME`.

### 1.3 Provision Redis (Optional but Recommended)
*   **Action:** Create a **Redis** service on Railway.
*   **Why:** Better-Auth uses it for rate limiting and session caching (makes auth fast).

---

## 🗄️ Phase 2: Database Migration (The Data Layer)
*Goal: Move all tables and data from Supabase to Railway.*

### 2.1 Schema & Data Move
1.  **Local Machine:** Install `pg_dump` (Postgres tools).
2.  **Export:** Run `pg_dump "your_supabase_connection_string" > supabase_backup.sql`.
3.  **Import:** Run `psql "your_railway_connection_string" < supabase_backup.sql`.
4.  **Verify:** Connect to Railway DB using a tool like DBeaver or TablePlus and verify all tables (`audits`, `users`, `app_secrets` etc) exist.

### 2.2 Install ORM (The New "Client")
*Since we are deleting `supabase-js`, we need a way to talk to the DB. `supabase.from('table').select()` will no longer work.*

1.  **Install Drizzle ORM:** `npm install drizzle-orm pg` and `npm install -D drizzle-kit @types/pg`.
2.  **Introspect:** Run `drizzle-kit introspect` to automatically generate TypeScript schema files from your new Railway DB.
3.  **Setup Client:** Create `server/src/lib/db.ts` to initialize the Drizzle client using `DATABASE_URL`.

---

## 🔑 Phase 3: Secrets Migration
*Goal: Move API keys out of the Supabase DB/UI and into a secure environment.*

### 3.1 Migrate `app_secrets` Table
*   **Action:** Verify the `app_secrets` table exists in the Railway DB (from step 2.1).
*   **Update Code:**
    *   Modify `server/src/controllers/auditController.ts`.
    *   **Replace:** `supabase.from('app_secrets').select(...)`
    *   **With:** `db.select().from(appSecrets).where(...)` (using Drizzle).

### 3.2 Environment Cleanup
*   **Action:** Go to Railway Project Settings > Variables.
*   **Add:**
    *   `BETTER_AUTH_SECRET`: (Generate a random string)
    *   `BETTER_AUTH_URL`: `https://your-app.up.railway.app`
    *   `GOOGLE_CLIENT_ID`: (From Google Cloud Console)
    *   `GOOGLE_CLIENT_SECRET`: (From Google Cloud Console)
    *   `RESEND_API_KEY`: (For email OTP)

---

## �️ Phase 4: Authentication Implementation (Better-Auth)
*Goal: Replace Supabase Auth with your own system.*

### 4.1 Backend Implementation (`auth.ts`)
1.  **Install:** `npm install better-auth`.
2.  **Config:** Create `server/src/lib/auth.ts`.
    *   Initialize Better-Auth with `database` plugin (pointing to your Drizzle/Postgres).
    *   Configure `emailOTP` plugin (using Resend).
    *   Configure `socialProviders` (Google).
3.  **Routes:** Create `server/src/api/auth.ts`.
    *   Mount the Better-Auth handler logic to `/api/auth/*`.

### 4.2 Database Updates for Auth
*   Better-Auth needs its own tables (`user`, `session`, `account`, `verification`).
*   **Action:** Better-Auth can auto-migrate, or we can generate the SQL and run it manually on Railway.
*   **Mapping:** We must map your *existing* Supabase `users` table to the new Better-Auth structure (or migrate the user rows).
    *   *Tricky Part:* Supabase users are in `auth.users` (a hidden schema). We need to copy them to the `public.user` table for Better-Auth.

### 4.3 Frontend Integration
1.  **Install Client:** `npm install better-auth/client`.
2.  **Create Client:** `client/lib/auth-client.ts`.
3.  **Replace Context:** Update `client/contexts/AuthContext.tsx`.
    *   **Old:** `supabase.auth.onAuthStateChange(...)`
    *   **New:** `authClient.useSession()`
4.  **Update Login Page:**
    *   **Old:** `supabase.auth.signInWithOtp(...)`
    *   **New:** `authClient.signIn.emailOtp(...)`

---

## 📦 Phase 5: Storage Migration
*Goal: Move screenshots and report assets.*

### 5.1 Asset Transfer
1.  **Script:** Write a temporary Node.js script.
    *   List all files in Supabase Storage.
    *   Download each file.
    *   Upload to MinIO/S3.

### 5.2 Code Update
1.  **Install SDK:** `npm install @aws-sdk/client-s3`.
2.  **Create Client:** `server/src/lib/storage.ts`.
3.  **Update Audit Controller:**
    *   **Replace:** `supabase.storage.from('...').upload(...)`
    *   **With:** `s3Client.send(new PutObjectCommand(...))`

---

## 🧹 Phase 6: The "Supabase Purge"
*Goal: Remove the dependency.*

1.  **Search & Destroy:** Grep codebase for `import ... from '@supabase/supabase-js'`.
2.  **Verify:** Ensure 0 occurrences remain.
3.  **Uninstall:** `npm uninstall @supabase/supabase-js`.

---

## �️ Execution Order (Immediate Next Steps)
To avoid breaking everything at once, we will do this **Server-First**:

1.  **Task 1:** Create Railway Postgres & Migrate Data. (Non-destructive).
2.  **Task 2:** Setup Drizzle ORM in Backend & Connect to Railway DB.
3.  **Task 3:** Setup Better-Auth Backend Routes.
4.  **Task 4:** Switch Frontend to use new Auth.
5.  **Task 5:** Migrate Storage.
