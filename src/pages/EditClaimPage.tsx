import { useState, useEffect, type FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  getClaimByToken,
  updateClaim,
  deleteClaim,
} from '../services/claimService';
import type { Claim, SignupItem } from '../types';
import {
  validateClaimForm,
  type ClaimFormValidationErrors,
} from '../utils/validators';

export default function EditClaimPage() {
  const { claimToken } = useParams<{ claimToken: string }>();
  const navigate = useNavigate();

  // Claim data state
  const [claim, setClaim] = useState<Claim | null>(null);
  const [item, setItem] = useState<SignupItem | null>(null);

  // Form state
  const [guestName, setGuestName] = useState('');
  const [guestContact, setGuestContact] = useState('');
  const [itemDetails, setItemDetails] = useState('');

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] =
    useState<ClaimFormValidationErrors>({});

  // Fetch claim data and validate token
  useEffect(() => {
    async function fetchData() {
      if (!claimToken) {
        setError('Missing claim token');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch the claim by token
        const claimData = await getClaimByToken(claimToken);

        if (!claimData) {
          setUnauthorized(true);
          setError(
            'Invalid claim token. This claim does not exist or the link is incorrect.'
          );
          setLoading(false);
          return;
        }

        setClaim(claimData);
        setGuestName(claimData.guestName);
        setGuestContact(claimData.guestContact || '');
        setItemDetails(claimData.itemDetails || '');

        // Fetch the signup item to get field requirements
        // We need to get the item to know which fields are required
        const { data: itemData, error: itemError } = await (
          await import('../utils/supabaseClient')
        ).supabase
          .from('signup_items')
          .select('*')
          .eq('id', claimData.itemId)
          .single();

        if (itemError || !itemData) {
          throw new Error('Failed to load item details');
        }

        // Convert database row to SignupItem
        const signupItem: SignupItem = {
          id: itemData.id,
          sheetId: itemData.sheet_id,
          itemName: itemData.item_name,
          quantityNeeded: itemData.quantity_needed,
          requireName: itemData.require_name,
          requireContact: itemData.require_contact,
          requireItemDetails: itemData.require_item_details,
          displayOrder: itemData.display_order,
          createdAt: new Date(itemData.created_at),
        };

        setItem(signupItem);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching claim:', err);
        setError(err instanceof Error ? err.message : 'Failed to load claim');
        setLoading(false);
      }
    }

    fetchData();
  }, [claimToken]);

  // Handle claim update
  const handleUpdateClaim = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setValidationErrors({});

    if (!claim || !item) return;

    // Validate form data
    const formData = {
      guestName: guestName.trim(),
      guestContact: guestContact.trim(),
      itemDetails: itemDetails.trim(),
    };

    const errors = validateClaimForm(formData, {
      requireName: item.requireName,
      requireContact: item.requireContact,
      requireItemDetails: item.requireItemDetails,
    });

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setSaving(true);

    try {
      await updateClaim(claim.id, {
        guestName: formData.guestName,
        guestContact: formData.guestContact || undefined,
        itemDetails: formData.itemDetails || undefined,
      });

      setSuccessMessage('Your claim has been updated successfully!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update claim');
    } finally {
      setSaving(false);
    }
  };

  // Handle claim cancellation
  const handleCancelClaim = async () => {
    if (
      !confirm(
        'Are you sure you want to cancel your claim? This action cannot be undone.'
      )
    ) {
      return;
    }

    if (!claim) return;

    setSaving(true);
    setError(null);

    try {
      await deleteClaim(claim.id);

      // Redirect to the signup sheet view page
      // We need to get the sheet ID from the item
      if (item) {
        navigate(`/sheet/${item.sheetId}`, {
          state: { message: 'Your claim has been cancelled successfully.' },
        });
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel claim');
      setSaving(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading claim...</p>
          </div>
        </div>
      </div>
    );
  }

  // Unauthorized state
  if (unauthorized) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold text-red-800 mb-2">
            Unauthorized Access
          </h2>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  // Error state
  if (!claim || !item) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
          <p className="text-red-700">{error || 'Claim not found'}</p>
        </div>
      </div>
    );
  }

  // Main content
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Edit Your Claim</h1>

      {/* Success message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-800">{successMessage}</p>
          <button
            onClick={() => setSuccessMessage(null)}
            className="mt-2 text-green-700 hover:text-green-900 underline text-sm"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-red-700 hover:text-red-900 underline text-sm"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Item Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-1">
          Item: {item.itemName}
        </h2>
        <p className="text-sm text-blue-700">
          You are editing your claim for this item
        </p>
      </div>

      {/* Edit Claim Form */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Your Information</h2>
        <form onSubmit={handleUpdateClaim} className="space-y-4">
          {/* Guest Name field - conditionally rendered */}
          {item.requireName && (
            <div>
              <label
                htmlFor="guestName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Your Name{' '}
                {item.requireName && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                id="guestName"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.guestName
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
                disabled={saving}
              />
              {validationErrors.guestName && (
                <p className="text-red-500 text-sm mt-1">
                  {validationErrors.guestName}
                </p>
              )}
            </div>
          )}

          {/* Guest Contact field - conditionally rendered */}
          {item.requireContact && (
            <div>
              <label
                htmlFor="guestContact"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Contact Info{' '}
                {item.requireContact && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                id="guestContact"
                placeholder="Email or phone number"
                value={guestContact}
                onChange={(e) => setGuestContact(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.guestContact
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
                disabled={saving}
              />
              {validationErrors.guestContact && (
                <p className="text-red-500 text-sm mt-1">
                  {validationErrors.guestContact}
                </p>
              )}
            </div>
          )}

          {/* Item Details field - conditionally rendered */}
          {item.requireItemDetails && (
            <div>
              <label
                htmlFor="itemDetails"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Item Details{' '}
                {item.requireItemDetails && (
                  <span className="text-red-500">*</span>
                )}
              </label>
              <textarea
                id="itemDetails"
                placeholder="What specifically are you bringing?"
                value={itemDetails}
                onChange={(e) => setItemDetails(e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.itemDetails
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
                disabled={saving}
              />
              {validationErrors.itemDetails && (
                <p className="text-red-500 text-sm mt-1">
                  {validationErrors.itemDetails}
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Cancel Claim Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-2 text-red-800">
          Cancel Your Claim
        </h2>
        <p className="text-gray-600 mb-4">
          If you can no longer bring this item, you can cancel your claim. This
          will make the item available for others to claim.
        </p>
        <button
          onClick={handleCancelClaim}
          disabled={saving}
          className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {saving ? 'Cancelling...' : 'Cancel Claim'}
        </button>
      </div>

      {/* Back to Signup Sheet Link */}
      <div className="mt-6 text-center">
        <a
          href={`/sheet/${item.sheetId}`}
          className="text-blue-600 hover:text-blue-800 underline"
        >
          ← Back to Signup Sheet
        </a>
      </div>
    </div>
  );
}
