interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  showHomeButton?: boolean;
}

/**
 * ErrorMessage component displays user-friendly error messages with optional retry and dismiss actions.
 */
export function ErrorMessage({
  title = 'Error',
  message,
  onRetry,
  onDismiss,
  showHomeButton = false,
}: ErrorMessageProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-red-800 mb-2">{title}</h2>
      <p className="text-red-700 mb-4">{message}</p>
      <div className="flex gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        )}
        {showHomeButton && (
          <button
            onClick={() => (window.location.href = '/')}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Go to Home
          </button>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 transition-colors"
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
}
