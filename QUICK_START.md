# Quick Start - Local Testing

## 🚀 Get Testing in 3 Steps

### Step 1: Start Docker Desktop

Open Docker Desktop app and wait for it to start.

### Step 2: Start Local Supabase

```bash
cd supabase
supabase start
```

### Step 3: Update .env.test

Copy the `anon key` from the output and paste it into `.env.test`:

```
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=<paste-anon-key-here>
```

### Step 4: Run Tests

```bash
npm test
```

## ✅ You're Done!

Your tests now run against a local database. Your development data is safe!

## Daily Commands

```bash
# Start local Supabase (once per day)
cd supabase && supabase start

# Run tests (as many times as you want)
npm test

# Stop local Supabase (end of day)
cd supabase && supabase stop
```

## Need Help?

See `LOCAL_TESTING_SETUP.md` for detailed instructions and troubleshooting.
