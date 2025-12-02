import { supabase } from '../utils/supabaseClient';
import { type SignupItem } from '../types';

// Database row type (snake_case from Postgres)
interface SignupItemRow {
  id: string;
  sheet_id: string;
  item_name: string;
  quantity_needed: number;
  require_name: boolean;
  require_contact: boolean;
  require_item_details: boolean;
  display_order: number;
  created_at: string;
}

// Convert database row to TypeScript interface
function rowToSignupItem(row: SignupItemRow): SignupItem {
  return {
    id: row.id,
    sheetId: row.sheet_id,
    itemName: row.item_name,
    quantityNeeded: row.quantity_needed,
    requireName: row.require_name,
    requireContact: row.require_contact,
    requireItemDetails: row.require_item_details,
    displayOrder: row.display_order,
    createdAt: new Date(row.created_at),
  };
}

// Convert TypeScript interface to database row format
function signupItemToRow(item: Partial<SignupItem>): Partial<SignupItemRow> {
  const row: Partial<SignupItemRow> = {};

  if (item.sheetId !== undefined) row.sheet_id = item.sheetId;
  if (item.itemName !== undefined) row.item_name = item.itemName;
  if (item.quantityNeeded !== undefined)
    row.quantity_needed = item.quantityNeeded;
  if (item.requireName !== undefined) row.require_name = item.requireName;
  if (item.requireContact !== undefined)
    row.require_contact = item.requireContact;
  if (item.requireItemDetails !== undefined)
    row.require_item_details = item.requireItemDetails;
  if (item.displayOrder !== undefined) row.display_order = item.displayOrder;

  return row;
}

/**
 * Creates a new signup item in the database
 */
export async function createSignupItem(
  data: Omit<SignupItem, 'id' | 'createdAt'>
): Promise<SignupItem> {
  const row = signupItemToRow(data);

  const { data: insertedRow, error } = await supabase
    .from('signup_items')
    .insert(row)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create signup item: ${error.message}`);
  }

  return rowToSignupItem(insertedRow);
}

/**
 * Retrieves all signup items for a given sheet ID
 */
export async function getSignupItemsBySheetId(
  sheetId: string
): Promise<SignupItem[]> {
  const { data, error } = await supabase
    .from('signup_items')
    .select('*')
    .eq('sheet_id', sheetId)
    .order('display_order', { ascending: true });

  if (error) {
    throw new Error(`Failed to get signup items: ${error.message}`);
  }

  return data.map(rowToSignupItem);
}

/**
 * Updates an existing signup item
 */
export async function updateSignupItem(
  id: string,
  data: Partial<Omit<SignupItem, 'id' | 'sheetId' | 'createdAt'>>
): Promise<SignupItem> {
  const row = signupItemToRow(data);

  const { data: updatedRow, error } = await supabase
    .from('signup_items')
    .update(row)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update signup item: ${error.message}`);
  }

  return rowToSignupItem(updatedRow);
}

/**
 * Deletes a signup item
 */
export async function deleteSignupItem(id: string): Promise<void> {
  const { error } = await supabase.from('signup_items').delete().eq('id', id);

  if (error) {
    throw new Error(`Failed to delete signup item: ${error.message}`);
  }
}
