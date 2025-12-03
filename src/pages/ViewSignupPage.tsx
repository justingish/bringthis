import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { getSignupSheet } from '../services/signupSheetService';
import {
  getSignupItemsBySheetId,
  createSignupItem,
} from '../services/signupItemService';
import { getClaimsByItemId, createClaim } from '../services/claimService';
import {
  EventHeader,
  SignupItemList,
  ClaimForm,
  LoadingSpinner,
  ErrorMessage,
} from '../components';
import type { SignupSheet, SignupItem, Claim, ClaimFormData } from '../types';

export default function ViewSignupPage() {
  const { sheetId } = useParams<{ sheetId: string }>();

  const [sheet, setSheet] = useState<SignupSheet | null>(null);
  const [items, setItems] = useState<SignupItem[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<SignupItem | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [claimToken, setClaimToken] = useState<string | null>(null);
  const [showAddItemForm, setShowAddItemForm] = useState(false);
  const [newItemData, setNewItemData] = useState({
    itemName: '',
    quantityNeeded: 1,
    requireName: true,
    requireContact: false,
    requireItemDetails: false,
  });

  // Fetch signup sheet data
  useEffect(() => {
    async function fetchData() {
      if (!sheetId) {
        setError('No sheet ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch the signup sheet
        const sheetData = await getSignupSheet(sheetId);

        if (!sheetData) {
          setError('Signup sheet not found');
          setLoading(false);
          return;
        }

        setSheet(sheetData);

        // Fetch all signup items for this sheet
        const itemsData = await getSignupItemsBySheetId(sheetId);
        setItems(itemsData);

        // Fetch all claims for all items
        const allClaims: Claim[] = [];
        for (const item of itemsData) {
          const itemClaims = await getClaimsByItemId(item.id);
          allClaims.push(...itemClaims);
        }
        setClaims(allClaims);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching signup sheet:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load signup sheet. Please check your internet connection and try again.'
        );
        setLoading(false);
      }
    }

    fetchData();
  }, [sheetId]);

  // Retry function for error handling
  const retryFetch = () => {
    setLoading(true);
    setError(null);
    // Trigger re-fetch by updating a dependency or calling the fetch directly
    window.location.reload();
  };

  // Refresh data after claim submission
  const refreshData = async () => {
    if (!sheetId) return;

    try {
      // Fetch all signup items for this sheet
      const itemsData = await getSignupItemsBySheetId(sheetId);
      setItems(itemsData);

      // Fetch all claims for all items
      const allClaims: Claim[] = [];
      for (const item of itemsData) {
        const itemClaims = await getClaimsByItemId(item.id);
        allClaims.push(...itemClaims);
      }
      setClaims(allClaims);
    } catch (err) {
      console.error('Error refreshing data:', err);
    }
  };

  // Handle claiming an item - show the claim form modal
  const handleClaimItem = (item: SignupItem) => {
    setSelectedItem(item);
    setSuccessMessage(null);
    setClaimToken(null);
  };

  // Handle claim form submission
  const handleClaimSubmit = async (formData: ClaimFormData) => {
    if (!selectedItem) return;

    try {
      // Create the claim in the database
      const newClaim = await createClaim({
        itemId: selectedItem.id,
        guestName: formData.guestName,
        guestContact: formData.guestContact,
        itemDetails: formData.itemDetails,
      });

      // Close the form modal
      setSelectedItem(null);

      // Refresh the page data to show the new claim
      await refreshData();

      // Show success message with claim edit link
      setClaimToken(newClaim.claimToken);
      setSuccessMessage(
        `Successfully claimed "${selectedItem.itemName}"! You can edit your claim using the link below.`
      );

      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Error creating claim:', err);
      // Close the modal
      setSelectedItem(null);
      // Show error message at the top
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to create claim. Please check your internet connection and try again.'
      );
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle claim form cancellation
  const handleClaimCancel = () => {
    setSelectedItem(null);
  };

  // Handle adding a new item (guest addition)
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!sheetId || !newItemData.itemName.trim()) {
      setError('Please enter an item name');
      return;
    }

    try {
      // Get the current max display order
      const maxOrder =
        items.length > 0
          ? Math.max(...items.map((item) => item.displayOrder))
          : -1;

      // Create the new item
      await createSignupItem({
        sheetId,
        itemName: newItemData.itemName.trim(),
        quantityNeeded: newItemData.quantityNeeded,
        requireName: newItemData.requireName,
        requireContact: newItemData.requireContact,
        requireItemDetails: newItemData.requireItemDetails,
        displayOrder: maxOrder + 1,
      });

      // Reset form and close modal
      setNewItemData({
        itemName: '',
        quantityNeeded: 1,
        requireName: true,
        requireContact: false,
        requireItemDetails: false,
      });
      setShowAddItemForm(false);

      // Refresh the page data
      await refreshData();

      // Show success message
      setSuccessMessage('Item added successfully!');
      setClaimToken(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Error adding item:', err);
      setShowAddItemForm(false);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to add item. Please check your internet connection and try again.'
      );
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Loading state
  if (loading) {
    return <LoadingSpinner message="Loading signup sheet..." fullScreen />;
  }

  // Error state
  if (error || !sheet) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <ErrorMessage
            title={!sheet ? 'Signup Sheet Not Found' : 'Error Loading Sheet'}
            message={
              error ||
              'The signup sheet you are looking for does not exist or the link may be invalid.'
            }
            onRetry={retryFetch}
            showHomeButton
          />
        </div>
      </div>
    );
  }

  // Main content
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Error message */}
      {error && (
        <div className="mb-6">
          <ErrorMessage
            message={error}
            onDismiss={() => setError(null)}
            onRetry={retryFetch}
          />
        </div>
      )}

      {/* Success message */}
      {successMessage && (
        <div
          className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6"
          role="status"
          aria-live="polite"
          aria-labelledby="success-title"
        >
          <h3
            id="success-title"
            className="text-lg font-semibold text-green-800 mb-2"
          >
            Success!
          </h3>
          <p className="text-green-700 mb-3">{successMessage}</p>
          {claimToken && (
            <a
              href={`/claim/${claimToken}`}
              className="inline-block px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              aria-label="Edit your claim"
            >
              Edit Your Claim
            </a>
          )}
          <button
            onClick={() => {
              setSuccessMessage(null);
              setClaimToken(null);
            }}
            className="ml-3 text-green-700 hover:text-green-900 underline focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded"
            aria-label="Dismiss success message"
          >
            Dismiss
          </button>
        </div>
      )}

      <EventHeader
        title={sheet.title}
        date={sheet.eventDate}
        description={sheet.description}
      />

      <SignupItemList
        items={items}
        claims={claims}
        onClaimItem={handleClaimItem}
      />

      {/* Add Item button - only shown if guest additions are allowed */}
      {sheet.allowGuestAdditions && (
        <div className="mt-6">
          <button
            onClick={() => setShowAddItemForm(true)}
            className="w-full px-4 py-3 bg-gray-100 text-gray-700 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-200 hover:border-gray-400 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Add a new item to the signup sheet"
          >
            + Add Item
          </button>
        </div>
      )}

      {/* Claim form modal */}
      {selectedItem && (
        <ClaimForm
          item={selectedItem}
          onSubmit={handleClaimSubmit}
          onCancel={handleClaimCancel}
        />
      )}

      {/* Add Item form modal */}
      {showAddItemForm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-item-title"
        >
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2
              id="add-item-title"
              className="text-2xl font-bold text-gray-900 mb-4"
            >
              Add New Item
            </h2>

            <form
              onSubmit={handleAddItem}
              className="space-y-4"
              aria-label="Add new item form"
            >
              {/* Item Name */}
              <div>
                <label
                  htmlFor="itemName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Item Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="itemName"
                  value={newItemData.itemName}
                  onChange={(e) =>
                    setNewItemData({ ...newItemData, itemName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Quantity Needed */}
              <div>
                <label
                  htmlFor="quantityNeeded"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Quantity Needed <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="quantityNeeded"
                  min="1"
                  value={newItemData.quantityNeeded}
                  onChange={(e) =>
                    setNewItemData({
                      ...newItemData,
                      quantityNeeded: parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Field Requirements */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Required Information from Guests
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newItemData.requireName}
                    onChange={(e) =>
                      setNewItemData({
                        ...newItemData,
                        requireName: e.target.checked,
                      })
                    }
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Require Name</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newItemData.requireContact}
                    onChange={(e) =>
                      setNewItemData({
                        ...newItemData,
                        requireContact: e.target.checked,
                      })
                    }
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">
                    Require Contact Info
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newItemData.requireItemDetails}
                    onChange={(e) =>
                      setNewItemData({
                        ...newItemData,
                        requireItemDetails: e.target.checked,
                      })
                    }
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">
                    Require Item Details
                  </span>
                </label>
              </div>

              {/* Form actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddItemForm(false);
                    setNewItemData({
                      itemName: '',
                      quantityNeeded: 1,
                      requireName: true,
                      requireContact: false,
                      requireItemDetails: false,
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
