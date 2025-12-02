import { supabase } from '../utils/supabaseClient';
import { SignupSheet } from '../types';
import { generateToken } from '../utils/tokenGenerator';

// Database row type (snake_case from Postgres)
interface SignupSheetRow {
  id: string;
  title: string;
  event_date: string;
  description: string;
  allow_guest_additions: boolean;
  management_token: string;
  created_at: string;
  updated_at: string;
}

// Convert database row to TypeScript interface
function rowToSignupSheet(row: SignupSheetRow): SignupSheet {
  return {
    id: row.id,
    title: row.title,
    eventDate: new Date(row.event_date),
    description: row.description,
    allowGuestAdditions: row.allow_guest_additions,
    managementToken: row.management_token,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

// Convert TypeScript interface to database row format
function signupSheetToRow(
  sheet: Partial<SignupSheet>
): Partial<SignupSheetRow> {
  const row: Partial<SignupSheetRow> = {};

  if (sheet.title !== undefined) row.title = sheet.title;
  if (sheet.eventDate !== undefined)
    row.event_date = sheet.eventDate.toISOString().split('T')[0];
  if (sheet.description !== undefined) row.description = sheet.description;
  if (sheet.allowGuestAdditions !== undefined)
    row.allow_guest_additions = sheet.allowGuestAdditions;
  if (sheet.managementToken !== undefined)
    row.management_token = sheet.managementToken;

  return row;
}

/**
 * Creates a new signup sheet in the database
 */
export async function createSignupSheet(
  data: Omit<SignupSheet, 'id' | 'managementToken' | 'createdAt' | 'updatedAt'>
): Promise<SignupSheet> {
  const managementToken = generateToken();

  const row = {
    ...signupSheetToRow({ ...data, managementToken }),
    management_token: managementToken,
  };

  const { data: insertedRow, error } = await supabase
    .from('signup_sheets')
    .insert(row)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create signup sheet: ${error.message}`);
  }

  return rowToSignupSheet(insertedRow);
}

/**
 * Retrieves a signup sheet by ID
 */
export async function getSignupSheet(id: string): Promise<SignupSheet | null> {
  const { data, error } = await supabase
    .from('signup_sheets')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Not found
      return null;
    }
    throw new Error(`Failed to get signup sheet: ${error.message}`);
  }

  return rowToSignupSheet(data);
}

/**
 * Updates an existing signup sheet
 */
export async function updateSignupSheet(
  id: string,
  data: Partial<
    Omit<SignupSheet, 'id' | 'managementToken' | 'createdAt' | 'updatedAt'>
  >
): Promise<SignupSheet> {
  const row = signupSheetToRow(data);

  const { data: updatedRow, error } = await supabase
    .from('signup_sheets')
    .update(row)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update signup sheet: ${error.message}`);
  }

  return rowToSignupSheet(updatedRow);
}
