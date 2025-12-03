# Local Testing Setup Guide

## Current Status

✅ Supabase CLI installed  
⏳ Docker Desktop needs to be started  
⏳ Local Supabase needs to be started  
⏳ Test environment needs to be configured

## Quick Start

### 1. Start Docker Desktop

Open Docker Desktop on your Mac and wait for it to fully start. You'll see the Docker whale icon in your menu bar when it's ready.

### 2. Start Local Supabase

```bash
cd supabase
supabase start
```

This command will:

- Download Docker images (first time only, ~2-3 minutes)
- Start PostgreSQL, Auth, Storage, and other Supabase services
- Automatically run your database migrations
- Display local credentials

**Expected output:**

```
Started supabase local development setup.

         API URL: http://127.0.0.1:54321
     GraphQL URL: http://127.0.0.1:54321/graphql/v1
  S3 Storage URL: http://127.0.0.1:54321/storage/v1/s3
          DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
      Studio URL: http://127.0.0.1:54323
    Inbucket URL: http://127.0.0.1:54324
      JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
        anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   S3 Access Key: 625729a08b95bf1b7ff351a663f3a23c
   S3 Secret Key: 850181e4652dd023b7a98c58ae0d2d34bd487ee0cc3254aed6eda37307425907
       S3 Region: local
```

### 3. Configure Test Environment

Copy the credentials from the output above and update `.env.test`:

```bash
# Edit .env.test with the actual values
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=<paste-the-anon-key-from-output>
```

**Important:** Copy the full `anon key` value from the `supabase start` output.

### 4. Run Tests

Now you can safely run tests against your local database:

```bash
# Run all tests once
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests against your development database (NOT RECOMMENDED)
npm run test:dev
```

## Verifying Setup

### Check if Supabase is Running

```bash
supabase status
```

You should see all services running.

### Access Supabase Studio

Open http://127.0.0.1:54323 in your browser to access the local Supabase Studio where you can:

- View your database tables
- Run SQL queries
- Inspect test data
- Monitor API requests

### View Test Data

After running tests, you can check the Studio to see what data was created during tests. The test cleanup will delete this data before each test run.

## Managing Local Supabase

### Stop Supabase

```bash
cd supabase
supabase stop
```

### Restart Supabase

```bash
cd supabase
supabase start
```

### Reset Database (Clear All Data)

```bash
cd supabase
supabase db reset
```

This will:

- Drop all tables
- Re-run all migrations
- Give you a fresh database

## Troubleshooting

### Docker Not Running

**Error:** `Cannot connect to the Docker daemon`

**Solution:** Start Docker Desktop and wait for it to fully initialize.

### Port Already in Use

**Error:** `port 54321 is already allocated`

**Solution:**

```bash
supabase stop
supabase start
```

If that doesn't work, check what's using the port:

```bash
lsof -i :54321
```

### Tests Still Deleting Production Data

**Problem:** Tests are still affecting your development database.

**Solution:** Make sure you're running tests with the correct command:

```bash
npm test  # Uses .env.test (local Supabase)
```

NOT:

```bash
npm run test:dev  # Uses .env (your development database)
```

### Migrations Not Applied

**Problem:** Tables don't exist in local database.

**Solution:**

```bash
cd supabase
supabase db reset
```

This will re-run all migrations.

## Development Workflow

### Recommended Workflow

1. **Start your day:**

   ```bash
   # Start Docker Desktop
   cd supabase
   supabase start
   ```

2. **Develop and test:**

   ```bash
   # Run dev server (uses .env)
   npm run dev

   # Run tests in another terminal (uses .env.test)
   npm run test:watch
   ```

3. **End your day:**
   ```bash
   cd supabase
   supabase stop
   ```

### Database Migrations

When you add new migrations:

```bash
# Create a new migration
cd supabase
supabase migration new your_migration_name

# Edit the migration file in supabase/migrations/

# Apply to local database
supabase db reset
```

## What's Different Now?

### Before (Unsafe)

- Tests ran against your development database
- Running `npm test` would delete all your real data
- Items would disappear from signup sheets

### After (Safe)

- Tests run against a local Supabase instance
- Your development data is completely separate
- You can run tests as many times as you want
- Local test database can be reset anytime with `supabase db reset`

## Next Steps

1. ✅ Start Docker Desktop
2. ✅ Run `cd supabase && supabase start`
3. ✅ Copy credentials to `.env.test`
4. ✅ Run `npm test` to verify everything works
5. ✅ Continue developing with confidence!

## Additional Resources

- [Supabase Local Development Docs](https://supabase.com/docs/guides/cli/local-development)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli/introduction)
- [Docker Desktop for Mac](https://docs.docker.com/desktop/install/mac-install/)
