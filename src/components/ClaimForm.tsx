import { useState } from 'react';
import type { FormEvent } from 'react';
import type { SignupItem, ClaimFormData } from '../types';
import {
  validateClaimForm,
  type ClaimFormValidationErrors,
} from '../utils/validators';

interface ClaimFormProps {
  item: SignupItem;
  onSubmit: (formData: ClaimFormData) => void;
  onCancel: () => void;
}

/**
 * ClaimForm component dynamically renders form fields based on item requirements.
 * Validates required fields and handles form submission.
 */
export function ClaimForm({ item, onSubmit, onCancel }: ClaimFormProps) {
  const [formData, setFormData] = useState<ClaimFormData>({
    guestName: '',
    guestContact: '',
    itemDetails: '',
  });

  const [errors, setErrors] = useState<ClaimFormValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Validate form data
    const validationErrors = validateClaimForm(formData, {
      requireName: item.requireName,
      requireContact: item.requireContact,
      requireItemDetails: item.requireItemDetails,
    });

    // If there are validation errors, display them and don't submit
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Clear errors and submit
    setErrors({});
    setIsSubmitting(true);

    // Prepare data to submit (only include fields that are required or filled)
    const dataToSubmit: ClaimFormData = {
      guestName: formData.guestName.trim(),
    };

    if (item.requireContact || formData.guestContact?.trim()) {
      dataToSubmit.guestContact = formData.guestContact?.trim();
    }

    if (item.requireItemDetails || formData.itemDetails?.trim()) {
      dataToSubmit.itemDetails = formData.itemDetails?.trim();
    }

    onSubmit(dataToSubmit);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="claim-form-title"
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2
          id="claim-form-title"
          className="text-2xl font-bold text-gray-900 mb-4"
        >
          Claim: {item.itemName}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
          aria-label="Claim item form"
        >
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
                value={formData.guestName}
                onChange={(e) =>
                  setFormData({ ...formData, guestName: e.target.value })
                }
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.guestName ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              />
              {errors.guestName && (
                <p
                  className="text-red-500 text-sm mt-1"
                  role="alert"
                  aria-live="polite"
                >
                  {errors.guestName}
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
                value={formData.guestContact}
                onChange={(e) =>
                  setFormData({ ...formData, guestContact: e.target.value })
                }
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.guestContact ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              />
              {errors.guestContact && (
                <p
                  className="text-red-500 text-sm mt-1"
                  role="alert"
                  aria-live="polite"
                >
                  {errors.guestContact}
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
                value={formData.itemDetails}
                onChange={(e) =>
                  setFormData({ ...formData, itemDetails: e.target.value })
                }
                rows={3}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.itemDetails ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              />
              {errors.itemDetails && (
                <p
                  className="text-red-500 text-sm mt-1"
                  role="alert"
                  aria-live="polite"
                >
                  {errors.itemDetails}
                </p>
              )}
            </div>
          )}

          {/* Form actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              disabled={isSubmitting}
              aria-label="Cancel claim"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              disabled={isSubmitting}
              aria-label={isSubmitting ? 'Submitting claim' : 'Submit claim'}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Claim'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
