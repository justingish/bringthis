export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

export interface SignupSheet {
  id: string;
  title: string;
  eventDate: Date;
  description: string;
  allowGuestAdditions: boolean;
  managementToken: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SignupItem {
  id: string;
  sheetId: string;
  itemName: string;
  quantityNeeded: number;
  requireName: boolean;
  requireContact: boolean;
  requireItemDetails: boolean;
  displayOrder: number;
  createdAt: Date;
}

export type SignupItemForm = Omit<
  Optional<SignupItem, 'quantityNeeded'>,
  'id' | 'sheetId' | 'displayOrder' | 'createdAt'
>;

export interface Claim {
  id: string;
  itemId: string;
  guestName: string;
  guestContact?: string;
  itemDetails?: string;
  claimToken: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClaimFormData {
  guestName: string;
  guestContact?: string;
  itemDetails?: string;
}

// Type guards for runtime validation

export function isSignupSheet(value: unknown): value is SignupSheet {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const obj = value as Record<string, unknown>;

  return (
    typeof obj.id === 'string' &&
    typeof obj.title === 'string' &&
    obj.eventDate instanceof Date &&
    typeof obj.description === 'string' &&
    typeof obj.allowGuestAdditions === 'boolean' &&
    typeof obj.managementToken === 'string' &&
    obj.createdAt instanceof Date &&
    obj.updatedAt instanceof Date
  );
}

export function isSignupItem(value: unknown): value is SignupItem {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const obj = value as Record<string, unknown>;

  return (
    typeof obj.id === 'string' &&
    typeof obj.sheetId === 'string' &&
    typeof obj.itemName === 'string' &&
    typeof obj.quantityNeeded === 'number' &&
    obj.quantityNeeded > 0 &&
    typeof obj.requireName === 'boolean' &&
    typeof obj.requireContact === 'boolean' &&
    typeof obj.requireItemDetails === 'boolean' &&
    typeof obj.displayOrder === 'number' &&
    obj.createdAt instanceof Date
  );
}

export function isClaim(value: unknown): value is Claim {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const obj = value as Record<string, unknown>;

  return (
    typeof obj.id === 'string' &&
    typeof obj.itemId === 'string' &&
    typeof obj.guestName === 'string' &&
    (obj.guestContact === undefined || typeof obj.guestContact === 'string') &&
    (obj.itemDetails === undefined || typeof obj.itemDetails === 'string') &&
    typeof obj.claimToken === 'string' &&
    obj.createdAt instanceof Date &&
    obj.updatedAt instanceof Date
  );
}

export function isClaimFormData(value: unknown): value is ClaimFormData {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const obj = value as Record<string, unknown>;

  return (
    typeof obj.guestName === 'string' &&
    (obj.guestContact === undefined || typeof obj.guestContact === 'string') &&
    (obj.itemDetails === undefined || typeof obj.itemDetails === 'string')
  );
}
