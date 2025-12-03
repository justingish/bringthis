import type { SignupItem, Claim } from '../types';

interface ItemCardProps {
  item: SignupItem;
  claims: Claim[];
  onClaim: (item: SignupItem) => void;
}

/**
 * ItemCard component displays a single signup item with its details,
 * current claims, and availability status.
 */
export function ItemCard({ item, claims, onClaim }: ItemCardProps) {
  const claimedCount = claims.length;
  const availableCount = item.quantityNeeded - claimedCount;
  const isFull = availableCount <= 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      {/* Item header with name and quantity */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-1">
            {item.itemName}
          </h3>
          <p className="text-sm text-gray-600">
            Needed: {item.quantityNeeded} | Remaining: {availableCount}
          </p>
        </div>

        {/* Claim button or Full indicator */}
        <div className="ml-4">
          {isFull ? (
            <span className="inline-block px-4 py-2 bg-gray-300 text-gray-700 rounded-md font-medium">
              Full
            </span>
          ) : (
            <button
              onClick={() => onClaim(item)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
            >
              Claim
            </button>
          )}
        </div>
      </div>

      {/* List of existing claims */}
      {claims.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Claimed by:
          </h4>
          <ul className="space-y-2">
            {claims.map((claim) => (
              <li key={claim.id} className="text-sm text-gray-600">
                <span className="font-medium">{claim.guestName}</span>
                {claim.guestContact && (
                  <span className="text-gray-500"> • {claim.guestContact}</span>
                )}
                {claim.itemDetails && (
                  <span className="text-gray-500 block ml-4">
                    {claim.itemDetails}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
