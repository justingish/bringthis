# Supabase Database Setup

This directory contains the database schema and migrations for the Signup Coordinator application.

## Setup Instructions

### Option 1: Using Supabase Dashboard (Recommended for initial setup)

1. Log in to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to the **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the contents of `migrations/001_initial_schema.sql`
6. Click **Run** to execute the migration

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# Initialize Supabase in your project (if not already done)
supabase init

# Link to your remote project
supabase link --project-ref your-project-ref

# Push the migration to your database
supabase db push
```

### Option 3: Local Development with Supabase CLI

For local development:

```bash
# Start local Supabase instance
supabase start

# The migration will be automatically applied
# Access local Studio at http://localhost:54323
```

## Database Schema

### Tables

#### `signup_sheets`

Stores event information and configuration for signup sheets.

- `id` (UUID): Primary key
- `title` (TEXT): Event title
- `event_date` (DATE): Date of the event
- `description` (TEXT): Event description
- `allow_guest_additions` (BOOLEAN): Whether guests can add new items
- `management_token` (TEXT): Unique token for editing the sheet
- `created_at` (TIMESTAMPTZ): Creation timestamp
- `updated_at` (TIMESTAMPTZ): Last update timestamp

#### `signup_items`

Stores items that need to be brought to the event.

- `id` (UUID): Primary key
- `sheet_id` (UUID): Foreign key to signup_sheets
- `item_name` (TEXT): Name of the item
- `quantity_needed` (INTEGER): How many of this item are needed
- `require_name` (BOOLEAN): Whether guest name is required
- `require_contact` (BOOLEAN): Whether guest contact is required
- `require_item_details` (BOOLEAN): Whether item details are required
- `display_order` (INTEGER): Order for displaying items
- `created_at` (TIMESTAMPTZ): Creation timestamp

#### `claims`

Stores guest claims for signup items.

- `id` (UUID): Primary key
- `item_id` (UUID): Foreign key to signup_items
- `guest_name` (TEXT): Name of the guest
- `guest_contact` (TEXT): Contact information (optional)
- `item_details` (TEXT): Details about what they're bringing (optional)
- `claim_token` (TEXT): Unique token for editing the claim
- `created_at` (TIMESTAMPTZ): Creation timestamp
- `updated_at` (TIMESTAMPTZ): Last update timestamp

### Indexes

The following indexes are created for optimal query performance:

- `idx_signup_items_sheet_id`: On `signup_items(sheet_id)`
- `idx_claims_item_id`: On `claims(item_id)`
- `idx_signup_sheets_management_token`: On `signup_sheets(management_token)`
- `idx_claims_claim_token`: On `claims(claim_token)`

### Row Level Security (RLS)

All tables have RLS enabled with policies that allow:

- **Public read access**: Anyone can view all data
- **Public write access**: Anyone can insert/update/delete (token validation is enforced at the application level)

This design supports the "security through obscurity" model where access control is managed via cryptographically secure tokens rather than traditional authentication.

## Verification

After running the migration, verify the setup:

```sql
-- Check that tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('signup_sheets', 'signup_items', 'claims');

-- Check that indexes exist
SELECT indexname
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('signup_sheets', 'signup_items', 'claims');

-- Check that RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('signup_sheets', 'signup_items', 'claims');
```

## Notes

- The schema uses UUID primary keys for better security and distribution
- Foreign keys have `ON DELETE CASCADE` to automatically clean up related records
- Timestamps are automatically managed via triggers
- All text fields use TEXT type for flexibility (constraints are enforced at the application level)
