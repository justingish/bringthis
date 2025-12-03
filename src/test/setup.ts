import '@testing-library/jest-dom';

// Safety check: Ensure we're not running tests against production database
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

if (
  supabaseUrl &&
  !supabaseUrl.includes('localhost') &&
  !supabaseUrl.includes('127.0.0.1')
) {
  console.warn(
    '⚠️  WARNING: Tests are configured to run against a non-local database!'
  );
  console.warn(
    '⚠️  This will DELETE ALL DATA in the database during test cleanup.'
  );
  console.warn('⚠️  Please configure a local Supabase instance for testing.');
  console.warn(`⚠️  Current URL: ${supabaseUrl}`);

  // Uncomment the line below to prevent tests from running against non-local databases
  // throw new Error('Tests cannot run against non-local database. Please set up a local Supabase instance.');
}
