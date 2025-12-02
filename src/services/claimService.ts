import { supabase } from '../utils/supabaseClient';
import { Claim } from '../types';
import { generateToken } from '../utils/tokenGenerator';

// Database row type (snake_case from Postgres)
interface ClaimRow {
  id: string;
  item_id: string;
  guest_name: string;
  guest_contact: string | null;
  item_details: string | null;
  claim_token: string;
  created_at: string;
  updated_at: string;
}

// Convert database row to TypeScript interface
function rowToClaim(row: ClaimRow): Claim {
  return {
    id: row.id,
    itemId: row.item_id,
    guestName: row.guest_name,
    guestContact: row.guest_contact || undefined,
    itemDetails: row.item_details || undefined,
    claimToken: row.claim_token,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

// Convert TypeScript interface to database row format
function claimToRow(claim: Partial<Claim>): Partial<ClaimRow> {
  const row: Partial<ClaimRow> = {};

  if (claim.itemId !== undefined) row.item_id = claim.itemId;
  if (claim.guestName !== undefined) row.guest_name = claim.guestName;
  if (claim.guestContact !== undefined) row.guest_contact = claim.guestContact;
  if (claim.itemDetails !== undefined) row.item_details = claim.itemDetails;
  if (claim.claimToken !== undefined) row.claim_token = claim.claimToken;

  return row;
}

/**
 * Creates a new claim with quantity validation
 */
export async function createClaim(
  data: Omit<Claim, 'id' | 'claimToken' | 'createdAt' | 'updatedAt'>
): Promise<Claim> {
  const claimToken = generateToken();

  // Get the item to check quantity
  const { data: itemData, error: itemError } = await supabase
    .from('signup_items')
    .select('quantity_needed')
    .eq('id', data.itemId)
    .single();

  if (itemError) {
    throw new Error(`Failed to get signup item: ${itemError.message}`);
  }

  // Get existing claims count
  const { count, error: countError } = await supabase
    .from('claims')
    .select('*', { count: 'exact', head: true })
    .eq('item_id', data.itemId);

  if (countError) {
    throw new Error(`Failed to count claims: ${countError.message}`);
  }

  // Check if item is full
  if (count !== null && count >= itemData.quantity_needed) {
    throw new Error('Item is full - no more claims can be added');
  }

  const row = {
    ...claimToRow({ ...data, claimToken }),
    claim_token: claimToken,
  };

  const { data: insertedRow, error } = await supabase
    .from('claims')
    .insert(row)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create claim: ${error.message}`);
  }

  return rowToClaim(insertedRow);
}

/**
 * Retrieves all claims for a given item ID
 */
export async function getClaimsByItemId(itemId: string): Promise<Claim[]> {
  const { data, error } = await supabase
    .from('claims')
    .select('*')
    .eq('item_id', itemId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to get claims: ${error.message}`);
  }

  return data.map(rowToClaim);
}

/**
 * Retrieves a claim by its token
 */
export async function getClaimByToken(token: string): Promise<Claim | null> {
  const { data, error } = await supabase
    .from('claims')
    .select('*')
    .eq('claim_token', token)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Not found
      return null;
    }
    throw new Error(`Failed to get claim: ${error.message}`);
  }

  return rowToClaim(data);
}

/**
 * Updates an existing claim
 */
export async function updateClaim(
  id: string,
  data: Partial<
    Omit<Claim, 'id' | 'itemId' | 'claimToken' | 'createdAt' | 'updatedAt'>
  >
): Promise<Claim> {
  const row = claimToRow(data);

  const { data: updatedRow, error } = await supabase
    .from('claims')
    .update(row)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update claim: ${error.message}`);
  }

  return rowToClaim(updatedRow);
}

/**
 * Deletes a claim (cancellation)
 */
export async function deleteClaim(id: string): Promise<void> {
  const { error } = await supabase.from('claims').delete().eq('id', id);

  if (error) {
    throw new Error(`Failed to delete claim: ${error.message}`);
  }
}
