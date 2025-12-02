-- Create signup_sheets table
CREATE TABLE IF NOT EXISTS signup_sheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  event_date DATE NOT NULL,
  description TEXT,
  allow_guest_additions BOOLEAN DEFAULT FALSE,
  management_token TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create signup_items table
CREATE TABLE IF NOT EXISTS signup_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sheet_id UUID NOT NULL REFERENCES signup_sheets(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  quantity_needed INTEGER NOT NULL CHECK (quantity_needed > 0),
  require_name BOOLEAN DEFAULT TRUE,
  require_contact BOOLEAN DEFAULT FALSE,
  require_item_details BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create claims table
CREATE TABLE IF NOT EXISTS claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES signup_items(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  guest_contact TEXT,
  item_details TEXT,
  claim_token TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes on frequently queried columns
CREATE INDEX IF NOT EXISTS idx_signup_items_sheet_id ON signup_items(sheet_id);
CREATE INDEX IF NOT EXISTS idx_claims_item_id ON claims(item_id);
CREATE INDEX IF NOT EXISTS idx_signup_sheets_management_token ON signup_sheets(management_token);
CREATE INDEX IF NOT EXISTS idx_claims_claim_token ON claims(claim_token);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_signup_sheets_updated_at
  BEFORE UPDATE ON signup_sheets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_claims_updated_at
  BEFORE UPDATE ON claims
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Configure Row Level Security (RLS)
ALTER TABLE signup_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE signup_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;

-- RLS Policies for signup_sheets
-- Allow public read access to all sheets
CREATE POLICY "Allow public read access to signup_sheets"
  ON signup_sheets
  FOR SELECT
  USING (true);

-- Allow insert for anyone (creating new sheets)
CREATE POLICY "Allow public insert to signup_sheets"
  ON signup_sheets
  FOR INSERT
  WITH CHECK (true);

-- Allow update only with valid management token
-- Note: This will be enforced at the application level since RLS can't easily check token from request
CREATE POLICY "Allow update to signup_sheets"
  ON signup_sheets
  FOR UPDATE
  USING (true);

-- RLS Policies for signup_items
-- Allow public read access to all items
CREATE POLICY "Allow public read access to signup_items"
  ON signup_items
  FOR SELECT
  USING (true);

-- Allow insert for anyone (creating new items)
CREATE POLICY "Allow public insert to signup_items"
  ON signup_items
  FOR INSERT
  WITH CHECK (true);

-- Allow update for anyone (application will enforce token validation)
CREATE POLICY "Allow update to signup_items"
  ON signup_items
  FOR UPDATE
  USING (true);

-- Allow delete for anyone (application will enforce token validation)
CREATE POLICY "Allow delete to signup_items"
  ON signup_items
  FOR DELETE
  USING (true);

-- RLS Policies for claims
-- Allow public read access to all claims
CREATE POLICY "Allow public read access to claims"
  ON claims
  FOR SELECT
  USING (true);

-- Allow insert for anyone (creating new claims)
CREATE POLICY "Allow public insert to claims"
  ON claims
  FOR INSERT
  WITH CHECK (true);

-- Allow update for anyone (application will enforce token validation)
CREATE POLICY "Allow update to claims"
  ON claims
  FOR UPDATE
  USING (true);

-- Allow delete for anyone (application will enforce token validation)
CREATE POLICY "Allow delete to claims"
  ON claims
  FOR DELETE
  USING (true);
