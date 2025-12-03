# Testing Guide

## ⚠️ IMPORTANT: Test Database Configuration

**The tests in this project DELETE ALL DATA from the database during cleanup.** This is necessary to ensure test isolation, but it means you **MUST NOT run tests against your production or development database**.

### Current Issue

If you're experiencing items disappearing from signup sheets, it's likely because:

1. Tests are running against your development database
2. The `beforeEach` hooks in tests delete all data to ensure clean test state
3. Your real data is being wiped out

### Solution: Use a Local Test Database

You have two options:

#### Option 1: Set up Local Supabase (Recommended)

1. Install Supabase CLI:

   ```bash
   brew install supabase/tap/supabase  # macOS
   # or follow instructions at https://supabase.com/docs/guides/cli
   ```

2. Start local Supabase:

   ```bash
   supabase start
   ```

3. Create a `.env.test` file with local credentials:

   ```
   VITE_SUPABASE_URL=http://localhost:54321
   VITE_SUPABASE_ANON_KEY=<your-local-anon-key>
   ```

4. Update your test command in `package.json` to use test environment:
   ```json
   "test": "vitest --run --env-file=.env.test"
   ```

#### Option 2: Create a Separate Test Database

1. Create a new Supabase project specifically for testing
2. Run the migrations in `supabase/migrations/` against the test database
3. Create a `.env.test` file with test database credentials
4. Update your test command to use `.env.test`

### Temporary Workaround

If you need to run tests immediately without setting up a test database:

1. **Comment out the cleanup code** in test files temporarily:

   - `src/services/claimService.test.ts`
   - `src/services/signupItemService.test.ts`
   - `src/services/signupSheetService.test.ts`
   - `src/pages/EditClaimPage.test.ts`
   - `src/pages/ViewSignupPage.test.ts`
   - `src/pages/EditSignupPage.test.ts`

2. Look for `beforeEach` blocks that delete data and comment them out

**Note:** This will cause tests to fail due to data conflicts, but it will prevent your real data from being deleted.

### Safety Check

The test setup file (`src/test/setup.ts`) now includes a warning when tests are run against non-local databases. To make this a hard error (preventing tests from running), uncomment the `throw new Error()` line in that file.

## Running Tests Safely

Once you have a test database configured:

```bash
# Run all tests
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Test Structure

- **Unit Tests**: Test individual functions and components in isolation
- **Property-Based Tests**: Use `fast-check` to test properties across many random inputs
- **Integration Tests**: Test database operations and service layer

## Known Issues

- Property-based tests can be slow due to database operations
- Some tests have been reduced to 10-20 iterations instead of 100 for performance
- Tests require explicit cleanup between runs to avoid data conflicts
