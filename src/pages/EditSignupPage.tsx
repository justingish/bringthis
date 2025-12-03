import { useState, useEffect, type FormEvent } from 'react';
import { useParams } from 'react-router';
import {
  getSignupSheet,
  updateSignupSheet,
} from '../services/signupSheetService';
import {
  getSignupItemsBySheetId,
  createSignupItem,
  updateSignupItem,
  deleteSignupItem,
} from '../services/signupItemService';
import { getClaimsByItemId } from '../services/claimService';
import { LoadingSpinner, ErrorMessage } from '../components';
import type { SignupSheet, Claim, SignupItemForm } from '../types';

// Extended type for items in EditSignupPage that includes id and displayOrder
type EditableSignupItem = SignupItemForm & {
  id: string;
  displayOrder: number;
};

export default function EditSignupPage() {
  const { sheetId, managementToken } = useParams<{
    sheetId: string;
    managementToken: string;
  }>();
  // const navigate = useNavigate();

  // Sheet data state
  const [sheet, setSheet] = useState<SignupSheet | null>(null);
  const [items, setItems] = useState<EditableSignupItem[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);

  // Form state
  const [title, setTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [description, setDescription] = useState('');
  const [allowGuestAdditions, setAllowGuestAdditions] = useState(false);

  // New item form state
  const [showAddItemForm, setShowAddItemForm] = useState(false);
  const [newItem, setNewItem] = useState<SignupItemForm>({
    itemName: '',
    quantityNeeded: undefined,
    requireName: true,
    requireContact: false,
    requireItemDetails: false,
  });

  // Edit item state
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editItemData, setEditItemData] = useState<SignupItemForm | null>(null);

  // UI state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch signup sheet data and validate management token
  useEffect(() => {
    async function fetchData() {
      if (!sheetId || !managementToken) {
        setError('Missing sheet ID or management token');
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

        // Validate management token
        if (sheetData.managementToken !== managementToken) {
          setUnauthorized(true);
          setError(
            'Invalid management token. You do not have permission to edit this sheet.'
          );
          setLoading(false);
          return;
        }

        setSheet(sheetData);
        setTitle(sheetData.title);
        setEventDate(sheetData.eventDate.toISOString().split('T')[0]);
        setDescription(sheetData.description);
        setAllowGuestAdditions(sheetData.allowGuestAdditions);

        // Fetch all signup items for this sheet
        const itemsData = await getSignupItemsBySheetId(sheetId);
        setItems(
          itemsData.map((item) => ({
            id: item.id,
            itemName: item.itemName,
            quantityNeeded: item.quantityNeeded,
            requireName: item.requireName,
            requireContact: item.requireContact,
            requireItemDetails: item.requireItemDetails,
            displayOrder: item.displayOrder,
          }))
        );

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
  }, [sheetId, managementToken]);

  // Retry function for error handling
  const retryFetch = () => {
    setLoading(true);
    setError(null);
    window.location.reload();
  };

  // Handle event details update
  const handleUpdateEventDetails = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!sheetId || !sheet) return;

    // Validate required fields
    if (!title.trim()) {
      setError('Event title is required');
      return;
    }
    if (!eventDate) {
      setError('Event date is required');
      return;
    }

    setSaving(true);

    try {
      await updateSignupSheet(sheetId, {
        title: title.trim(),
        eventDate: new Date(eventDate),
        description: description.trim(),
        allowGuestAdditions,
      });

      setSuccessMessage('Event details updated successfully!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to update event details'
      );
    } finally {
      setSaving(false);
    }
  };

  // Handle add new item
  const handleAddItem = async () => {
    if (!sheetId) return;

    if (!newItem.itemName.trim()) {
      setError('Item name is required');
      return;
    }
    if (!newItem.quantityNeeded) {
      setError('Please enter an item quantity');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const maxOrder =
        items.length > 0
          ? Math.max(...items.map((item) => item.displayOrder))
          : -1;

      // Type assertion is safe here because we validate quantityNeeded before calling this function
      if (!newItem.quantityNeeded) {
        throw new Error('Quantity is required');
      }

      const createdItem = await createSignupItem({
        sheetId,
        itemName: newItem.itemName.trim(),
        quantityNeeded: newItem.quantityNeeded,
        requireName: newItem.requireName,
        requireContact: newItem.requireContact,
        requireItemDetails: newItem.requireItemDetails,
        displayOrder: maxOrder + 1,
      });

      setItems([
        ...items,
        {
          id: createdItem.id,
          itemName: createdItem.itemName,
          quantityNeeded: createdItem.quantityNeeded,
          requireName: createdItem.requireName,
          requireContact: createdItem.requireContact,
          requireItemDetails: createdItem.requireItemDetails,
          displayOrder: createdItem.displayOrder,
        },
      ]);

      setNewItem({
        itemName: '',
        quantityNeeded: undefined,
        requireName: true,
        requireContact: false,
        requireItemDetails: false,
      });
      setShowAddItemForm(false);
      setSuccessMessage('Item added successfully!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item');
    } finally {
      setSaving(false);
    }
  };

  // Handle edit item
  const handleStartEditItem = (item: EditableSignupItem) => {
    setEditingItemId(item.id);
    setEditItemData({ ...item });
  };

  const handleSaveEditItem = async () => {
    if (!editItemData || !editingItemId) return;

    if (!editItemData.itemName.trim()) {
      setError('Item name is required');
      return;
    }
    if (!editItemData.quantityNeeded) {
      setError('Please enter an item quantity');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Type assertion is safe here because we validate quantityNeeded before calling this function
      if (!editItemData.quantityNeeded) {
        throw new Error('Quantity is required');
      }

      await updateSignupItem(editingItemId, {
        itemName: editItemData.itemName.trim(),
        quantityNeeded: editItemData.quantityNeeded,
        requireName: editItemData.requireName,
        requireContact: editItemData.requireContact,
        requireItemDetails: editItemData.requireItemDetails,
      });

      setItems(
        items.map((item) =>
          item.id === editingItemId
            ? {
                ...editItemData,
                id: item.id,
                displayOrder: item.displayOrder,
              }
            : item
        )
      );

      setEditingItemId(null);
      setEditItemData(null);
      setSuccessMessage('Item updated successfully!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update item');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEditItem = () => {
    setEditingItemId(null);
    setEditItemData(null);
  };

  // Handle delete item
  const handleDeleteItem = async (itemId: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this item? This action cannot be undone.'
      )
    ) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await deleteSignupItem(itemId);
      setItems(items.filter((item) => item.id !== itemId));
      setSuccessMessage('Item deleted successfully!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item');
    } finally {
      setSaving(false);
    }
  };

  // Get claims for a specific item
  const getClaimsForItem = (itemId: string): Claim[] => {
    return claims.filter((claim) => claim.itemId === itemId);
  };

  // Helper to get quantity needed with fallback
  const getQuantityNeeded = (item: EditableSignupItem): number => {
    return item.quantityNeeded ?? 0;
  };

  // Loading state
  if (loading) {
    return <LoadingSpinner message="Loading signup sheet..." fullScreen />;
  }

  // Unauthorized state
  if (unauthorized) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <ErrorMessage
            title="Unauthorized Access"
            message={
              error ||
              'Invalid management token. You do not have permission to edit this sheet.'
            }
            showHomeButton
          />
        </div>
      </div>
    );
  }

  // Error state
  if (!sheet) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <ErrorMessage
            title="Error Loading Sheet"
            message={error || 'Signup sheet not found'}
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
      <h1 className="text-3xl font-bold mb-6">Edit Signup Sheet</h1>

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

      {/* Event Details Form */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Event Details</h2>
        <form onSubmit={handleUpdateEventDetails} className="space-y-4">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Event Title *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="eventDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Event Date *
            </label>
            <input
              type="date"
              id="eventDate"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="allowGuestAdditions"
              checked={allowGuestAdditions}
              onChange={(e) => setAllowGuestAdditions(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="allowGuestAdditions"
              className="ml-2 block text-sm text-gray-700"
            >
              Allow guests to add new items
            </label>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Event Details'}
          </button>
        </form>
      </div>

      {/* Signup Items Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Signup Items</h2>

        {/* Items List */}
        <div className="space-y-4 mb-4">
          {items.map((item) => {
            const itemClaims = getClaimsForItem(item.id || '');
            const isEditing = editingItemId === item.id;

            return (
              <div
                key={item.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                {isEditing && editItemData ? (
                  // Edit mode
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Item Name
                      </label>
                      <input
                        type="text"
                        value={editItemData.itemName}
                        onChange={(e) =>
                          setEditItemData({
                            ...editItemData,
                            itemName: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity Needed
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={editItemData.quantityNeeded ?? ''}
                        onChange={(e) =>
                          setEditItemData({
                            ...editItemData,
                            quantityNeeded:
                              e.target.value === ''
                                ? undefined
                                : parseInt(e.target.value) || undefined,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Required Information
                      </label>
                      <div className="space-y-1">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={editItemData.requireName}
                            onChange={(e) =>
                              setEditItemData({
                                ...editItemData,
                                requireName: e.target.checked,
                              })
                            }
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">
                            Guest Name
                          </span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={editItemData.requireContact}
                            onChange={(e) =>
                              setEditItemData({
                                ...editItemData,
                                requireContact: e.target.checked,
                              })
                            }
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">
                            Contact Info
                          </span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={editItemData.requireItemDetails}
                            onChange={(e) =>
                              setEditItemData({
                                ...editItemData,
                                requireItemDetails: e.target.checked,
                              })
                            }
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">
                            Item Details
                          </span>
                        </label>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={handleSaveEditItem}
                        disabled={saving}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEditItem}
                        disabled={saving}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          {item.itemName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Quantity: {getQuantityNeeded(item)} | Claimed:{' '}
                          {itemClaims.length} | Available:{' '}
                          {getQuantityNeeded(item) - itemClaims.length}
                        </p>
                        <p className="text-sm text-gray-600">
                          Requires:{' '}
                          {[
                            item.requireName && 'Name',
                            item.requireContact && 'Contact',
                            item.requireItemDetails && 'Details',
                          ]
                            .filter(Boolean)
                            .join(', ')}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleStartEditItem(item)}
                          className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-md text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id || '')}
                          className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-md text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Display claims for this item */}
                    {itemClaims.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Claims ({itemClaims.length}):
                        </h4>
                        <div className="space-y-2">
                          {itemClaims.map((claim) => (
                            <div
                              key={claim.id}
                              className="text-sm bg-gray-50 p-2 rounded"
                            >
                              <div className="font-medium">
                                {claim.guestName}
                              </div>
                              {claim.guestContact && (
                                <div className="text-gray-600">
                                  {claim.guestContact}
                                </div>
                              )}
                              {claim.itemDetails && (
                                <div className="text-gray-600">
                                  {claim.itemDetails}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Add Item Button */}
        {!showAddItemForm && (
          <button
            onClick={() => setShowAddItemForm(true)}
            className="w-full px-4 py-3 bg-gray-100 text-gray-700 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-200 hover:border-gray-400 transition-colors font-medium"
          >
            + Add Item
          </button>
        )}

        {/* Add Item Form */}
        {showAddItemForm && (
          <div className="border border-gray-300 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold">Add New Item</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item Name
              </label>
              <input
                type="text"
                value={newItem.itemName}
                onChange={(e) =>
                  setNewItem({ ...newItem, itemName: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity Needed
              </label>
              <input
                type="number"
                min="1"
                value={newItem.quantityNeeded ?? ''}
                onChange={(e) =>
                  setNewItem({
                    ...newItem,
                    quantityNeeded:
                      e.target.value === ''
                        ? undefined
                        : parseInt(e.target.value) || undefined,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Required Information
              </label>
              <div className="space-y-1">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newItem.requireName}
                    onChange={(e) =>
                      setNewItem({ ...newItem, requireName: e.target.checked })
                    }
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Guest Name</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newItem.requireContact}
                    onChange={(e) =>
                      setNewItem({
                        ...newItem,
                        requireContact: e.target.checked,
                      })
                    }
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Contact Info</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newItem.requireItemDetails}
                    onChange={(e) =>
                      setNewItem({
                        ...newItem,
                        requireItemDetails: e.target.checked,
                      })
                    }
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Item Details</span>
                </label>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleAddItem}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              >
                Add Item
              </button>
              <button
                onClick={() => {
                  setShowAddItemForm(false);
                  setNewItem({
                    itemName: '',
                    quantityNeeded: undefined,
                    requireName: true,
                    requireContact: false,
                    requireItemDetails: false,
                  });
                }}
                disabled={saving}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Public Page Link */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800 mb-2">
          Share this link with guests to view the signup sheet:
        </p>
        <a
          href={`/sheet/${sheetId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline break-all"
        >
          {window.location.origin}/sheet/{sheetId}
        </a>
      </div>
    </div>
  );
}
