import { SignupItem, Claim } from '../types';
import { ItemCard } from './ItemCard';

interface SignupItemListProps {
  items: SignupItem[];
  claims: Claim[];
  onClaimItem: (item: SignupItem) => void;
}

/**
 * SignupItemList component renders a list of signup items.
 * Groups claims by item and passes them to ItemCard components.
 */
export function SignupItemList({
  items,
  claims,
  onClaimItem,
}: SignupItemListProps) {
  // Handle empty state
  if (items.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <p className="text-gray-600 text-lg">
          No signup items yet. Add items to get started!
        </p>
      </div>
    );
  }

  // Group claims by item ID for efficient lookup
  const claimsByItemId = claims.reduce((acc, claim) => {
    if (!acc[claim.itemId]) {
      acc[claim.itemId] = [];
    }
    acc[claim.itemId].push(claim);
    return acc;
  }, {} as Record<string, Claim[]>);

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          claims={claimsByItemId[item.id] || []}
          onClaim={onClaimItem}
        />
      ))}
    </div>
  );
}
