import { useState, type FormEvent } from 'react';
import { createSignupSheet } from '../services/signupSheetService';
import { createSignupItem } from '../services/signupItemService';

interface SignupItemForm {
  itemName: string;
  quantityNeeded: number;
  requireName: boolean;
  requireContact: boolean;
  requireItemDetails: boolean;
}

export default function CreateSignupPage() {
  // Event details state
  const [title, setTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [description, setDescription] = useState('');
  const [allowGuestAdditions, setAllowGuestAdditions] = useState(false);

  // Signup items state
  const [items, setItems] = useState<SignupItemForm[]>([]);
  const [currentItem, setCurrentItem] = useState<SignupItemForm>({
    itemName: '',
    quantityNeeded: 1,
    requireName: true,
    requireContact: false,
    requireItemDetails: false,
  });

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{
    viewLink: string;
    managementLink: string;
  } | null>(null);

  // Add item to list
  const handleAddItem = () => {
    if (!currentItem.itemName.trim()) {
      setError('Item name is required');
      return;
    }
    if (currentItem.quantityNeeded < 1) {
      setError('Quantity must be at least 1');
      return;
    }

    setItems([...items, currentItem]);
    setCurrentItem({
      itemName: '',
      quantityNeeded: 1,
      requireName: true,
      requireContact: false,
      requireItemDetails: false,
    });
    setError(null);
  };

  // Remove item from list
  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate required fields
    if (!title.trim()) {
      setError('Event title is required');
      return;
    }
    if (!eventDate) {
      setError('Event date is required');
      return;
    }
    if (items.length === 0) {
      setError('At least one signup item is required');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create signup sheet
      const sheet = await createSignupSheet({
        title: title.trim(),
        eventDate: new Date(eventDate),
        description: description.trim(),
        allowGuestAdditions,
      });

      // Create signup items
      for (let i = 0; i < items.length; i++) {
        await createSignupItem({
          sheetId: sheet.id,
          itemName: items[i].itemName.trim(),
          quantityNeeded: items[i].quantityNeeded,
          requireName: items[i].requireName,
          requireContact: items[i].requireContact,
          requireItemDetails: items[i].requireItemDetails,
          displayOrder: i,
        });
      }

      // Generate shareable links
      const viewLink = `${window.location.origin}/sheet/${sheet.id}`;
      const managementLink = `${window.location.origin}/sheet/${sheet.id}/edit/${sheet.managementToken}`;

      setSuccess({ viewLink, managementLink });
    } catch (err) {
      console.error('Error creating signup sheet:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to create signup sheet. Please check your internet connection and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show success message with links
  if (success) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div
          className="bg-green-50 border border-green-200 rounded-lg p-6"
          role="status"
          aria-live="polite"
          aria-labelledby="success-heading"
        >
          <h2
            id="success-heading"
            className="text-2xl font-bold text-green-800 mb-4"
          >
            Signup Sheet Created!
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Share this link with guests:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={success.viewLink}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white"
                />
                <button
                  onClick={() =>
                    navigator.clipboard.writeText(success.viewLink)
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-label="Copy guest link to clipboard"
                >
                  Copy
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Management link (keep this private):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={success.managementLink}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white"
                />
                <button
                  onClick={() =>
                    navigator.clipboard.writeText(success.managementLink)
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-label="Copy management link to clipboard"
                >
                  Copy
                </button>
              </div>
            </div>
            <button
              onClick={() => (window.location.href = '/')}
              className="w-full mt-4 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              aria-label="Create another signup sheet"
            >
              Create Another Sheet
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Create Signup Sheet</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
        aria-label="Create signup sheet form"
      >
        {/* Event Details Section */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-4">Event Details</h2>

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
              placeholder="e.g., Summer Potluck"
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
              placeholder="Tell guests about your event..."
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
        </div>

        {/* Signup Items Section */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold mb-4">Signup Items</h2>

          {/* Add Item Form */}
          <div className="border border-gray-200 rounded-lg p-4 space-y-3">
            <div>
              <label
                htmlFor="itemName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Item Name
              </label>
              <input
                type="text"
                id="itemName"
                value={currentItem.itemName}
                onChange={(e) =>
                  setCurrentItem({ ...currentItem, itemName: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Salad, Drinks, Plates"
              />
            </div>

            <div>
              <label
                htmlFor="quantityNeeded"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Quantity Needed
              </label>
              <input
                type="number"
                id="quantityNeeded"
                value={currentItem.quantityNeeded}
                onChange={(e) =>
                  setCurrentItem({
                    ...currentItem,
                    quantityNeeded: parseInt(e.target.value) || 1,
                  })
                }
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Required Information
              </label>
              <div className="space-y-1">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="requireName"
                    checked={currentItem.requireName}
                    onChange={(e) =>
                      setCurrentItem({
                        ...currentItem,
                        requireName: e.target.checked,
                      })
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="requireName"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Guest Name
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="requireContact"
                    checked={currentItem.requireContact}
                    onChange={(e) =>
                      setCurrentItem({
                        ...currentItem,
                        requireContact: e.target.checked,
                      })
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="requireContact"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Contact Info
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="requireItemDetails"
                    checked={currentItem.requireItemDetails}
                    onChange={(e) =>
                      setCurrentItem({
                        ...currentItem,
                        requireItemDetails: e.target.checked,
                      })
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="requireItemDetails"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Item Details
                  </label>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddItem}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add Item
            </button>
          </div>

          {/* Items List */}
          {items.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700">
                Added Items ({items.length})
              </h3>
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{item.itemName}</div>
                      <div className="text-sm text-gray-600">
                        Quantity: {item.quantityNeeded} | Requires:{' '}
                        {[
                          item.requireName && 'Name',
                          item.requireContact && 'Contact',
                          item.requireItemDetails && 'Details',
                        ]
                          .filter(Boolean)
                          .join(', ')}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="ml-4 px-3 py-1 text-red-600 hover:bg-red-50 rounded-md"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div
            className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800"
            role="alert"
            aria-live="assertive"
          >
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
          aria-label={
            isSubmitting ? 'Creating signup sheet' : 'Create signup sheet'
          }
        >
          {isSubmitting ? 'Creating...' : 'Create Signup Sheet'}
        </button>
      </form>
    </div>
  );
}
